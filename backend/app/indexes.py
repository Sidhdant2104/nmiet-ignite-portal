from app.mongodb import (
    announcement_collection,
    admin_users_collection,
    audit_collection,
    problem_collection,
    registration_collection,
    evaluation_track_collection,
    judge_collection,
    track_coordinator_collection,
    presentation_queue_collection,
    evaluation_collection,
    evaluation_option_collection,
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
        admin_users_collection,
        "email",
        unique=True,
        name="admin_email_unique",
    )

    await ensure_index(
        audit_collection,
        "timestamp",
        name="audit_timestamp_desc",
    )

    await ensure_index(
        problem_collection,
        "ps_number",
        unique=True,
        name="problem_ps_number_unique",
    )

    await ensure_index(
        problem_collection,
        [("theme", 1), ("category", 1)],
        name="problem_theme_category",
    )

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
        evaluation_option_collection,
        [("kind", 1), ("value", 1)],
        unique=True,
        name="evaluation_option_kind_value_unique",
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
        [("isDeleted", 1), ("created_at", -1)],
        name="active_registration_created_at",
    )

    await ensure_index(
        registration_collection,
        [("isDeleted", 1), ("ppt.current.uploaded_at", -1)],
        name="active_ppt_uploaded_at",
    )

    await ensure_index(
        registration_collection,
        "ppt.current.status",
        name="ppt_review_status_index",
    )

    await ensure_index(
        registration_collection,
        "members.email",
        name="members_email_index",
    )

    await ensure_index(
        registration_collection,
        "members.mobile",
        name="members_mobile_index",
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
