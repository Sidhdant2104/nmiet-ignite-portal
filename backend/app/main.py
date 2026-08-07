from contextlib import asynccontextmanager

from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI

from app.mongodb import client
from app.routes.registration import router as registration_router
from app.indexes import create_indexes
from app.routes.problem import router as problem_router

from app.routes.theme import router as theme_router
from app.routes.admin import router as admin_router
from app.routes.ppt import router as ppt_router
from app.routes.announcements import router as announcements_router

@asynccontextmanager

async def lifespan(app: FastAPI):
    try:
        await client.admin.command("ping")

        await create_indexes()

        print("✅ MongoDB Connected")
        print("✅ Database Indexes Created")

    except Exception as e:
        print(f"❌ MongoDB Error: {e}")

    yield

    client.close()

    print("👋 MongoDB Connection Closed")


app = FastAPI(
    title="NMIET SIH Backend",
    version="1.0.0",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://nmietsihportal.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(problem_router)
app.include_router(registration_router)
app.include_router(theme_router)
app.include_router(admin_router)
app.include_router(ppt_router)
app.include_router(announcements_router)
@app.get("/")
async def root():

    return {
        "message": "NMIET SIH Backend Running"
    }
