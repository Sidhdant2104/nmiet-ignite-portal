from app.mongodb import (
    announcement_collection,
    registration_collection,
    evaluation_track_collection,
    judge_collection,
    track_coordinator_collection,
    presentation_queue_collection,
    evaluation_collection,
)


async def ensure_index(collection, keys, unique=False, name=None):
    if isinstance(keys, str):
        keys = [(keys, 1)]

    keys = list(keys)
    existing_indexes = await collection.index_information()

    for existing_name, info in existing_indexes.items():
        if (
            list(info.get("key", [])) == keys
            and bool(info.get("unique", False)) == bool(unique)
        ):
            return existing_name

    return await collection.create_index(
        keys,
        unique=unique,
        name=name,
    )


async def create_indexes():

    await ensure_index(
        evaluation_track_collection,
        "code",
        unique=True,
        name="evaluation_track_code_unique",
    )

    await ensure_index(
        evaluation_track_collection,
        "track_id",
        unique=True,
        name="evaluation_track_id_unique",
    )

    await ensure_index(
        judge_collection,
        [("name", 1), ("track_id", 1)],
        unique=True,
        name="judge_name_track_unique",
    )

    await ensure_index(
        track_coordinator_collection,
        "track_id",
        unique=True,
        name="track_coordinator_track_unique",
    )

    await ensure_index(
        presentation_queue_collection,
        "track_id",
        unique=True,
        name="presentation_queue_track_unique",
    )

    await ensure_index(
        evaluation_collection,
        [("judge_id", 1), ("registration_id", 1)],
        unique=True,
        name="judge_team_unique_evaluation",
    )

    await ensure_index(
        registration_collection,
        "leader.email",
        unique=True,
        name="leader_email_unique",
    )

    await ensure_index(
        registration_collection,
        "leader.mobile",
        unique=True,
        name="leader_mobile_unique",
    )

    await ensure_index(
        registration_collection,
        "team.teamName",
        name="team.teamName_index",
    )

    await ensure_index(
        registration_collection,
        "status",
        name="status_index",
    )

    await ensure_index(
        registration_collection,
        "registration_id",
        unique=True,
        name="registration_id_unique",
    )

    await ensure_index(
        registration_collection,
        "ppt.current.status",
        name="ppt_review_status_index",
    )

    await ensure_index(
        announcement_collection,
        [
            ("is_published", 1),
            ("is_archived", 1),
            ("scheduled_for", 1),
            ("expires_at", 1),
        ],
        name="announcement_public_feed_index",
    )
