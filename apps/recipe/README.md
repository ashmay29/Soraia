# Recipe API (FastAPI)

Minimal FastAPI backend to pair with the Kepler Next.js app.

## Quick start

```bash
# From apps/recipe
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Health check: http://localhost:8000/health
- List recipes: GET http://localhost:8000/recipes
- Create recipe: POST http://localhost:8000/recipes with JSON body

CORS is enabled for http://localhost:3000 so the Kepler app can call this API during local development.
