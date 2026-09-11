"""Unit tests for track-level evaluation normalization."""

import unittest

from app.services.evaluation_results import (
    MIN_ZSCORE_SAMPLE,
    STATUS_OK,
    STATUS_SMALL_SAMPLE,
    STATUS_ZERO_VARIANCE,
    assign_ranks,
    build_results_workbook,
    compute_results,
    filter_leaderboard,
    mean,
    normalize_score,
    population_stddev,
    serialize_team_result,
)


CRITERIA = [
    {"id": "CRIT-A", "name": "Innovation", "max_marks": 10, "order": 0, "is_active": True, "description": ""},
    {"id": "CRIT-B", "name": "Feasibility", "max_marks": 10, "order": 1, "is_active": True, "description": ""},
]


def _eval(track, registration, total_a, total_b, judge="JUDGE-1"):
    return {
        "evaluation_id": f"EVAL-{registration}",
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


class NormalizationMathTests(unittest.TestCase):
    def test_example_85_80_75(self):
        scores = [85.0, 80.0, 75.0]
        track_mean = mean(scores)
        stddev = population_stddev(scores)
        self.assertAlmostEqual(track_mean, 80.0)
        self.assertAlmostEqual(stddev, (50 / 3) ** 0.5)
        first = normalize_score(85, track_mean, stddev, 3, 85)
        self.assertEqual(first["normalization_status"], STATUS_OK)
        z = (85 - 80) / stddev
        self.assertAlmostEqual(first["z_score"], z)
        self.assertAlmostEqual(first["normalized_score"], 50 + 10 * z)

    def test_zero_stddev(self):
        result = normalize_score(70, 70, 0, 4, 100)
        self.assertEqual(result["normalization_status"], STATUS_ZERO_VARIANCE)
        self.assertEqual(result["normalized_score"], 50)

    def test_small_sample_uses_center_score(self):
        result = normalize_score(80, 80, 5, MIN_ZSCORE_SAMPLE - 1, 91.5)
        self.assertEqual(result["normalization_status"], STATUS_SMALL_SAMPLE)
        self.assertEqual(result["normalized_score"], 50)
        self.assertIsNone(result["z_score"])

    def test_clamp_to_0_100(self):
        result = normalize_score(200, 50, 1, 10, 100)
        self.assertEqual(result["normalized_score"], 100)


class LeaderboardComputeTests(unittest.TestCase):
    def test_ranks_and_malformed_are_skipped(self):
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
        assigned = {"TRACK-A": ["SIH-1", "SIH-2", "SIH-3"], "TRACK-B": ["SIH-4"]}
        results = compute_results(
            tracks=tracks,
            judges=[{"id": "JUDGE-1", "name": "Judge", "track_id": "TRACK-A", "is_active": True}],
            criteria=CRITERIA,
            evaluations=evaluations,
            registrations=registrations,
            assigned_by_track=assigned,
        )
        self.assertEqual(len(results["malformed"]), 1)
        self.assertEqual(len(results["rows"]), 4)
        self.assertEqual(results["rows"][0]["overall_rank"], 1)
        names_in_order = [row["team_name"] for row in results["rows"]]
        self.assertEqual(names_in_order[0], "Alpha")
        track_a = next(stat for stat in results["track_stats"] if stat["track_id"] == "TRACK-A")
        self.assertEqual(track_a["normalization_status"], STATUS_OK)
        track_b = next(stat for stat in results["track_stats"] if stat["track_id"] == "TRACK-B")
        self.assertEqual(track_b["normalization_status"], STATUS_SMALL_SAMPLE)

    def test_tie_break_uses_raw_percentage_then_name(self):
        rows = [
            {"normalized_score": 60, "raw_percentage": 80, "team_name": "Zulu", "registration_id": "2"},
            {"normalized_score": 60, "raw_percentage": 90, "team_name": "Alpha", "registration_id": "1"},
            {"normalized_score": 60, "raw_percentage": 80, "team_name": "Beta", "registration_id": "3"},
        ]
        rows.sort(key=lambda row: (-row["normalized_score"], -row["raw_percentage"], row["team_name"].casefold(), row["registration_id"]))
        assign_ranks(rows, "overall_rank")
        self.assertEqual([row["team_name"] for row in rows], ["Alpha", "Beta", "Zulu"])
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

    def test_incomplete_teams_excluded_by_default(self):
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
        pending = filter_leaderboard(results, status="pending")
        self.assertEqual(len(pending), 1)
        self.assertEqual(pending[0]["evaluation_status"], "pending")

    def test_team_result_includes_criteria_and_workbook_builds(self):
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
        self.assertIn("normalized", payload["normalization_explanation"].lower())
        workbook = build_results_workbook(results, finalists=2)
        self.assertGreater(len(workbook), 100)
        self.assertTrue(workbook.startswith(b"PK"))


if __name__ == "__main__":
    unittest.main()
