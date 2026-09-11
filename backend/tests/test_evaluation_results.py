"""Unit tests for 70/30 raw-percentage + track-percentile ranking."""

import unittest

from app.services.evaluation_results import (
    PERCENTILE_WEIGHT,
    RAW_WEIGHT,
    STATUS_OK,
    assign_ranks,
    build_results_workbook,
    compute_final_score,
    compute_results,
    filter_leaderboard,
    serialize_team_result,
    track_percentile,
)


CRITERIA = [
    {"id": "CRIT-A", "name": "Innovation", "max_marks": 10, "order": 0, "is_active": True, "description": ""},
    {"id": "CRIT-B", "name": "Feasibility", "max_marks": 10, "order": 1, "is_active": True, "description": ""},
]


def _eval(track, registration, total_a, total_b, judge="JUDGE-1"):
    return {
        "evaluation_id": f"EVAL-{registration}-{judge}",
        "judge_id": judge,
        "judge_name": "Judge",
        "track_id": track,
        "registration_id": registration,
        "scores": {"CRIT-A": total_a, "CRIT-B": total_b},
        "total_score": total_a + total_b,
        "status": "submitted",
    }


def _reg(registration, name="Team"):
    return {
        "registration_id": registration,
        "team": {"teamName": name, "psId": "SIH26001", "psTitle": "Problem", "theme": "Theme", "category": "Software"},
    }


class RankingMathTests(unittest.TestCase):
    def test_example_68_of_70_with_percentile_100(self):
        raw_percentage = 68 / 70 * 100
        self.assertAlmostEqual(raw_percentage, 97.142857, places=5)
        final = compute_final_score(raw_percentage, 100)
        self.assertAlmostEqual(final, 97.14 * 0.70 + 100 * 0.30, places=1)
        self.assertAlmostEqual(final, 98.0, places=1)

    def test_high_raw_cannot_be_overtaken_by_low_raw_at_same_percentile(self):
        high = compute_final_score(68 / 70 * 100, 100)
        low = compute_final_score(50 / 70 * 100, 100)
        self.assertGreater(high, low)

    def test_percentile_unique_best_and_worst(self):
        scores = [68.0, 60.0, 50.0]
        self.assertEqual(track_percentile(68, scores), 100.0)
        self.assertEqual(track_percentile(50, scores), 0.0)
        self.assertEqual(track_percentile(60, scores), 50.0)

    def test_single_team_track_is_100th_percentile(self):
        self.assertEqual(track_percentile(40, [40.0]), 100.0)

    def test_weights(self):
        self.assertEqual(RAW_WEIGHT, 0.70)
        self.assertEqual(PERCENTILE_WEIGHT, 0.30)


class LeaderboardComputeTests(unittest.TestCase):
    def test_ranks_skip_malformed_and_prefer_higher_raw(self):
        tracks = [
            {"track_id": "TRACK-A", "name": "Track A", "code": "TA", "judges_required": 1, "is_active": True},
            {"track_id": "TRACK-B", "name": "Track B", "code": "TB", "judges_required": 1, "is_active": True},
        ]
        registrations = [_reg("SIH-1", "Alpha"), _reg("SIH-2", "Beta"), _reg("SIH-3", "Gamma"), _reg("SIH-4", "Delta")]
        evaluations = [
            _eval("TRACK-A", "SIH-1", 9, 8),
            _eval("TRACK-A", "SIH-2", 8, 8),
            _eval("TRACK-A", "SIH-3", 7, 8),
            _eval("TRACK-B", "SIH-4", 10, 10),
            {
                "evaluation_id": "EVAL-BAD",
                "judge_id": "JUDGE-1",
                "track_id": "TRACK-A",
                "registration_id": "SIH-2",
                "scores": {"CRIT-A": "nope", "CRIT-B": 8},
                "status": "submitted",
            },
        ]
        results = compute_results(
            tracks=tracks,
            judges=[{"id": "JUDGE-1", "name": "Judge", "track_id": "TRACK-A", "is_active": True}],
            criteria=CRITERIA,
            evaluations=evaluations,
            registrations=registrations,
            assigned_by_track={"TRACK-A": ["SIH-1", "SIH-2", "SIH-3"], "TRACK-B": ["SIH-4"]},
        )
        self.assertEqual(len(results["malformed"]), 1)
        self.assertEqual(len(results["rows"]), 4)
        names_in_order = [row["team_name"] for row in results["rows"]]
        self.assertEqual(names_in_order[0], "Delta")
        self.assertEqual(results["rows"][0]["raw_score"], 20)
        self.assertEqual(results["rows"][0]["track_percentile"], 100)
        self.assertAlmostEqual(results["rows"][0]["final_score"], 100)
        self.assertIsNone(results["rows"][0].get("z_score"))
        alpha = next(row for row in results["rows"] if row["team_name"] == "Alpha")
        self.assertEqual(alpha["track_percentile"], 100)
        self.assertLess(alpha["final_score"], results["rows"][0]["final_score"])
        track_a = next(stat for stat in results["track_stats"] if stat["track_id"] == "TRACK-A")
        self.assertEqual(track_a["normalization_status"], STATUS_OK)

    def test_tie_break_uses_raw_score_then_percentile(self):
        rows = [
            {"final_score": 80, "raw_score": 50, "track_percentile": 100, "team_name": "Zulu", "registration_id": "2"},
            {"final_score": 80, "raw_score": 60, "track_percentile": 40, "team_name": "Alpha", "registration_id": "1"},
            {"final_score": 80, "raw_score": 50, "track_percentile": 80, "team_name": "Beta", "registration_id": "3"},
        ]
        rows.sort(
            key=lambda row: (
                -row["final_score"],
                -row["raw_score"],
                -row["track_percentile"],
                row["team_name"].casefold(),
                row["registration_id"],
            )
        )
        assign_ranks(rows, "overall_rank")
        self.assertEqual([row["team_name"] for row in rows], ["Alpha", "Zulu", "Beta"])
        self.assertEqual([row["overall_rank"] for row in rows], [1, 2, 3])

    def test_duplicate_judges_are_averaged(self):
        tracks = [{"track_id": "TRACK-A", "name": "Track A", "code": "TA", "judges_required": 1, "is_active": True}]
        registrations = [_reg("SIH-1", "Alpha"), _reg("SIH-2", "Beta"), _reg("SIH-3", "Gamma")]
        evaluations = [
            _eval("TRACK-A", "SIH-1", 10, 10, "JUDGE-1"),
            _eval("TRACK-A", "SIH-1", 0, 0, "JUDGE-2"),
            _eval("TRACK-A", "SIH-2", 8, 8, "JUDGE-1"),
            _eval("TRACK-A", "SIH-3", 6, 6, "JUDGE-1"),
        ]
        results = compute_results(
            tracks=tracks,
            judges=[],
            criteria=CRITERIA,
            evaluations=evaluations,
            registrations=registrations,
            assigned_by_track={"TRACK-A": ["SIH-1", "SIH-2", "SIH-3"]},
        )
        alpha = next(row for row in results["rows"] if row["registration_id"] == "SIH-1")
        self.assertEqual(alpha["raw_score"], 10)
        self.assertEqual(alpha["judges_count"], 2)

    def test_incomplete_teams_excluded_from_percentile(self):
        tracks = [{"track_id": "TRACK-A", "name": "Track A", "code": "TA", "judges_required": 1, "is_active": True}]
        registrations = [_reg("SIH-1", "Alpha"), _reg("SIH-2", "Pending")]
        evaluations = [_eval("TRACK-A", "SIH-1", 8, 8)]
        results = compute_results(
            tracks=tracks,
            judges=[],
            criteria=CRITERIA,
            evaluations=evaluations,
            registrations=registrations,
            assigned_by_track={"TRACK-A": ["SIH-1", "SIH-2"]},
        )
        completed = filter_leaderboard(results, status="completed")
        self.assertEqual(len(completed), 1)
        self.assertEqual(completed[0]["track_percentile"], 100)
        pending = filter_leaderboard(results, status="pending")
        self.assertEqual(len(pending), 1)
        self.assertEqual(pending[0]["evaluation_status"], "pending")
        self.assertIsNone(pending[0]["track_percentile"])

    def test_team_result_and_workbook_include_new_fields(self):
        tracks = [{"track_id": "TRACK-A", "name": "Track A", "code": "TA", "judges_required": 1, "is_active": True}]
        registrations = [_reg("SIH-1", "Alpha"), _reg("SIH-2", "Beta"), _reg("SIH-3", "Gamma")]
        evaluations = [
            _eval("TRACK-A", "SIH-1", 9, 8),
            _eval("TRACK-A", "SIH-2", 8, 8),
            _eval("TRACK-A", "SIH-3", 7, 8),
        ]
        results = compute_results(
            tracks=tracks,
            judges=[],
            criteria=CRITERIA,
            evaluations=evaluations,
            registrations=registrations,
            assigned_by_track={"TRACK-A": ["SIH-1", "SIH-2", "SIH-3"]},
        )
        payload = serialize_team_result(results["rows"][0], results["criteria"], finalists=1)
        self.assertEqual(len(payload["criteria"]), 2)
        self.assertTrue(payload["is_finalist"])
        self.assertIn("track_percentile", payload)
        self.assertIn("final_score", payload)
        self.assertNotIn("z_score", payload)
        self.assertIn("70%", payload["normalization_explanation"])
        workbook = build_results_workbook(results, finalists=2)
        self.assertGreater(len(workbook), 100)
        self.assertTrue(workbook.startswith(b"PK"))


if __name__ == "__main__":
    unittest.main()
