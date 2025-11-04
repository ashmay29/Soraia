from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi import HTTPException

app = FastAPI(title="Recipe API", version="0.1.0")

# Allow requests from the Next.js app during local development
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Recipe(BaseModel):
    id: int
    title: str
    description: str | None = None


# In-memory store for demonstration only
RECIPES: List[Recipe] = [
    Recipe(id=1, title="Pasta Primavera", description="Fresh veggies and pasta"),
]


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/")
def root() -> dict:
    return {"message": "Welcome to the Recipe API"}


@app.get("/recipes", response_model=List[Recipe])
def list_recipes() -> List[Recipe]:
    return RECIPES


@app.post("/recipes", response_model=Recipe)
def create_recipe(recipe: Recipe) -> Recipe:
    RECIPES.append(recipe)
    return recipe


@app.get("/recipes/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: int) -> Recipe:
    for r in RECIPES:
        if r.id == recipe_id:
            return r
    raise HTTPException(status_code=404, detail="Recipe not found")


@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int) -> dict:
    global RECIPES
    RECIPES = [r for r in RECIPES if r.id != recipe_id]
    return {"deleted": recipe_id}


# Run with: uvicorn main:app --reload --port 8000
