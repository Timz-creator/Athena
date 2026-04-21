from fastapi import FastAPI
from athena.scenario import ScenarioRunner
from athena.monte_carlo import MonteCarlo
from athena.doe import DesignOfExperiments
from pydantic import BaseModel, Field, StrictInt
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScenarioRequest(BaseModel):
    width: StrictInt = Field(gt=0, le=1000)
    height: StrictInt = Field(gt=0, le=1000)
    n_agents_per_team: StrictInt = Field(gt=0, le=20)
    steps: StrictInt = Field(gt=0, le=1000)

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
    width: StrictInt = Field(gt=0, le=1000)
    height: StrictInt = Field(gt=0, le=1000)
    n_agents_per_team: StrictInt = Field(gt=0, le=20)
    steps: StrictInt = Field(gt=0, le=1000)
    n_runs: StrictInt = Field(gt=0, le=1000)

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

@app.get("/debug")
def debug():
    runner = ScenarioRunner(width=200, height=200, n_agents_per_team=2)
    return {
        "world_width": runner.world.width,
        "world_height": runner.world.height,
        "agent_start_x": runner.world.agents[0].x,
        "agent_start_y": runner.world.agents[0].y
    }
