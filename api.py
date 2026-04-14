from fastapi import FastAPI
from athena.scenario import ScenarioRunner
from athena.monte_carlo import MonteCarlo
from athena.doe import DesignOfExperiments
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScenarioRequest(BaseModel):
    width: int = Field(gt=0, le=1000)
    height: int = Field(gt=0, le=1000)
    n_agents_per_team: int = Field(gt=0, le=20)
    steps: int = Field(gt=0, le=1000)

@app.post("/scenario/run")
def run_scenario(request: ScenarioRequest):
    runner = ScenarioRunner(
        width=request.width,
        height=request.height,
        n_agents_per_team=request.n_agents_per_team
    )
    runner.run(steps=request.steps)
    return runner.get_results()

class MonteCarloRequest(BaseModel):
    width: int =Field(gt=0, le=1000)
    height: int =Field(gt=0, le=1000)
    n_agents_per_team: int=Field(gt=0, le=20)
    steps: int=Field(gt=0, le=1000)
    n_runs: int=Field(gt=0, le=1000)

@app.post("/monte-carlo/run")
def run_monteCarlo(request: MonteCarloRequest):
    mc = MonteCarlo(
        width=request.width,
        height=request.height,
        n_agents_per_team=request.n_agents_per_team,
        n_runs=request.n_runs,
    )
    results = mc.run(steps=request.steps)
    return results
