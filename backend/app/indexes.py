from app.mongodb import registration_collection


async def create_indexes():
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
