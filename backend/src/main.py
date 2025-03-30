from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import auth_router, projects_router, todos_router, tags_router

# Create the FastAPI app
app = FastAPI(title="Todo App API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    expose_headers=["Content-Type", "Content-Length"],
    max_age=600,  # 10 minutes
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(todos_router)
app.include_router(tags_router)


@app.get("/")
async def root():
    return {"message": "Welcome to the Todo App API"}
