from fastapi import FastAPI, WebSocket
from athena.scenario import ScenarioRunner
from athena.monte_carlo import MonteCarlo
from athena.doe import DesignOfExperiments
from pydantic import BaseModel, Field, StrictInt
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

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

@app.websocket("/scenario/stream")
async def stream_scenario(websocket: WebSocket):
    await websocket.accept()
    
    data = await websocket.receive_json()
    
    scenario = data.get("scenario", {})
    n_agents = data.get("n_agents_per_team", 3)
    steps = data.get("steps", 200)
    attacker_ratio = data.get("attacker_ratio", 0.5)
    
    runner = ScenarioRunner(
        width=200,
        height=200,
        n_agents_per_team=n_agents,
        blue_base=scenario.get("blueBase"),
        red_base=scenario.get("redBase"),
        blue_asset=scenario.get("blueAsset"),
        red_asset=scenario.get("redAsset"),
        attacker_ratio=attacker_ratio
    )
    
    for _ in range(steps):

        shared_enemies = runner.comms.share_detections(runner.world.agents)
        for agent in runner.world.agents:
            if agent.alive:
                agent.act(runner.world.agents, runner.world.dt, runner.world.width, runner.world.height)
        runner.world.step()
        
        await websocket.send_json({
            "time": runner.world.time,
            "agents": [
                {
                    "x": agent.x,
                    "y": agent.y,
                    "team": agent.team,
                    "alive": agent.alive,
                    "heading": agent.heading
                }
                for agent in runner.world.agents
            ],
            "assets": {
                "blue": {
                    "damage_taken": runner.blue_asset_obj.damage_taken if runner.blue_asset_obj else 0,
                    "damage_percentage": runner.blue_asset_obj.damage_percentage if runner.blue_asset_obj else 0,
                    "alive": runner.blue_asset_obj.alive if runner.blue_asset_obj else True
                },
                "red": {
                    "damage_taken": runner.red_asset_obj.damage_taken if runner.red_asset_obj else 0,
                    "damage_percentage": runner.red_asset_obj.damage_percentage if runner.red_asset_obj else 0,
                    "alive": runner.red_asset_obj.alive if runner.red_asset_obj else True
                }
            }
        })
        
        await asyncio.sleep(0.05)
    
    await websocket.send_json({"done": True, **runner.get_results()})
    await websocket.close()

