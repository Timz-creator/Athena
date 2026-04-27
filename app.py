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
    
    runner = ScenarioRunner(
        width=data["width"],
        height=data["height"],
        n_agents_per_team=data["n_agents_per_team"]
    )
    
    for _ in range(data["steps"]):
        for agent in runner.world.agents:
            if agent.alive:
                detected = agent.detect(runner.world.agents)
                if detected:
                    agent.move_towards(detected[0], runner.world.dt, runner.world.width, runner.world.height)
                agent.engage(runner.world.agents)
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
            ]
        })
        
        await asyncio.sleep(0.05)
    
    await websocket.send_json({"done": True, **runner.get_results()})
    await websocket.close()


