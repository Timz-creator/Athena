from fastapi import FastAPI
from athena.scenario import ScenarioRunner
from athena.monte_carlo import MonteCarlo
from athena.doe import DesignOfExperiments
from pydantic import BaseModel

app = FastAPI()
class ScenarioRequest(BaseModel):
    width: int
    height: int
    n_agents_per_team: int
    steps: int

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
    width: int
    height: int
    n_agents_per_team: int
    steps: int
    n_runs: int

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
