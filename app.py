from fastapi import FastAPI, WebSocket
from athena.scenario import ScenarioRunner
from athena.monte_carlo import MonteCarlo
from athena.doe import DesignOfExperiments
from pydantic import BaseModel, Field, StrictInt
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
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
    blue_n_agents: StrictInt = Field(gt=0, le=20)
    red_n_agents: StrictInt = Field(gt=0, le=20)
    blue_attacker_ratio: float = Field(ge=0, le=1, default=0.5)
    red_attacker_ratio: float = Field(ge=0, le=1, default=0.5)
    blue_n_jammers: StrictInt = Field(ge=0, le=5, default=0)
    red_n_jammers: StrictInt = Field(ge=0, le=5, default=0)
    steps: StrictInt = Field(gt=0, le=1000)
    seed: Optional[int] = None

@app.post("/scenario/run")
def run_scenario(request: ScenarioRequest):
    runner = ScenarioRunner(
        width=request.width,
        height=request.height,
        blue_n_agents=request.blue_n_agents,
        red_n_agents=request.red_n_agents,
        blue_attacker_ratio=request.blue_attacker_ratio,
        red_attacker_ratio=request.red_attacker_ratio,
        blue_n_jammers=request.blue_n_jammers,
        red_n_jammers=request.red_n_jammers,
        seed=request.seed,
    )
    runner.run(steps=request.steps)
    results = runner.get_results()
    results["agents"] = [
        {
            "x": agent.x,
            "y": agent.y,
            "team": agent.team,
            "alive": agent.alive,
            "heading": agent.heading,
            "role": agent.role
        }
        for agent in runner.world.agents
    ]
    return results

class MonteCarloRequest(BaseModel):
    width: StrictInt = Field(gt=0, le=1000)
    height: StrictInt = Field(gt=0, le=1000)
    blue_n_agents: StrictInt = Field(gt=0, le=20)
    red_n_agents: StrictInt = Field(gt=0, le=20)
    blue_attacker_ratio: float = Field(ge=0, le=1, default=0.5)
    red_attacker_ratio: float = Field(ge=0, le=1, default=0.5)
    blue_n_jammers: StrictInt = Field(ge=0, le=5, default=0)
    red_n_jammers: StrictInt = Field(ge=0, le=5, default=0)
    steps: StrictInt = Field(gt=0, le=1000)
    n_runs: StrictInt = Field(gt=0, le=1000)
    blue_base: Optional[dict] = None
    red_base: Optional[dict] = None
    blue_asset: Optional[dict] = None
    red_asset: Optional[dict] = None
    seed: Optional[int] = None

@app.post("/monte-carlo/run")
def run_monteCarlo(request: MonteCarloRequest):
    mc = MonteCarlo(
        width=request.width,
        height=request.height,
        n_runs=request.n_runs,
        blue_n_agents=request.blue_n_agents,
        red_n_agents=request.red_n_agents,
        blue_attacker_ratio=request.blue_attacker_ratio,
        red_attacker_ratio=request.red_attacker_ratio,
        blue_n_jammers=request.blue_n_jammers,
        red_n_jammers=request.red_n_jammers,
        blue_base=request.blue_base,
        red_base=request.red_base,
        blue_asset=request.blue_asset,
        red_asset=request.red_asset,
        seed=request.seed,
    )
    results = mc.run(steps=request.steps)
    return {"seed": mc.base_seed, "results": results}

@app.websocket("/scenario/stream")
async def stream_scenario(websocket: WebSocket):
    await websocket.accept()
    
    data = await websocket.receive_json()
    
    scenario = data.get("scenario", {})
    blue_n_agents = data.get("blue_n_agents", 3)
    red_n_agents = data.get("red_n_agents", 3)
    blue_attacker_ratio = data.get("blue_attacker_ratio", 0.5)
    red_attacker_ratio = data.get("red_attacker_ratio", 0.5)
    blue_n_jammers = data.get("blue_n_jammers", 0)
    red_n_jammers = data.get("red_n_jammers", 0)
    steps = data.get("steps", 200)
    seed = data.get("seed", None)

    runner = ScenarioRunner(
        width=200,
        height=200,
        blue_n_agents=blue_n_agents,
        red_n_agents=red_n_agents,
        blue_attacker_ratio=blue_attacker_ratio,
        red_attacker_ratio=red_attacker_ratio,
        blue_n_jammers=blue_n_jammers,
        red_n_jammers=red_n_jammers,
        blue_base=scenario.get("blueBase"),
        red_base=scenario.get("redBase"),
        blue_asset=scenario.get("blueAsset"),
        red_asset=scenario.get("redAsset"),
        seed=seed,
    )

    def serialize_agent(agent):
        return {
            "x": agent.x,
            "y": agent.y,
            "team": agent.team,
            "alive": agent.alive,
            "heading": agent.heading,
            "role": agent.role
        }
    
    for _ in range(steps):

        shared_enemies = runner.comms.share_detections(runner.world.agents)
        for agent in runner.world.agents:
            if agent.alive:
                agent.act(runner.world.agents, runner.world.dt, runner.world.width, runner.world.height)
        runner.world.step()
        
        await websocket.send_json({
            "time": runner.world.time,
            "agents": [
                serialize_agent(agent)
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

    final_results = runner.get_results()
    final_results["agents"] = [serialize_agent(agent) for agent in runner.world.agents]
    await websocket.send_json({"done": True, **final_results})
    await websocket.close()

