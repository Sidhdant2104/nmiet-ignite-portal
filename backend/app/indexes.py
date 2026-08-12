from app.mongodb import announcement_collection, registration_collection, evaluation_track_collection, judge_collection, track_coordinator_collection, presentation_queue_collection, evaluation_collection


async def create_indexes():
    await evaluation_track_collection.create_index("code", unique=True)
    await evaluation_track_collection.create_index("track_id", unique=True)
    await judge_collection.create_index([("name", 1), ("track_id", 1)], unique=True)
    await track_coordinator_collection.create_index("track_id", unique=True)
    await presentation_queue_collection.create_index("track_id", unique=True)
    await evaluation_collection.create_index([("judge_id", 1), ("registration_id", 1)], unique=True)
    await registration_collection.create_index(
        "leader.email",
        unique=True,
        name="leader_email_unique"
    )

    await registration_collection.create_index(
        "leader.mobile",
        unique=True,
        name="leader_mobile_unique"
    )

    await registration_collection.create_index(
        "team.teamName",
        name="team.teamName_index"
    )

    await registration_collection.create_index(
        "status",
        name="status_index"
    )
    await registration_collection.create_index("registration_id", unique=True, name="registration_id_unique")
    await registration_collection.create_index("ppt.current.status", name="ppt_review_status_index")
    await announcement_collection.create_index(
        [("is_published", 1), ("is_archived", 1), ("scheduled_for", 1), ("expires_at", 1)],
        name="announcement_public_feed_index",
    )
