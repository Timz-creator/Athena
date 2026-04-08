from athena.agent import Agent
from athena.world import World
from athena.scenario import ScenarioRunner
from athena.monte_carlo import MonteCarlo
import numpy as np

def test_agent_update():
    agent = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=100, engagement_range=20)
    agent.update(dt=1, width=1, height=1)
    assert np.isclose(agent.x, 1.0)
    assert np.isclose(agent.y, 0.0)
    
def test_world_steps():
    world = World(width=100, height=1000, dt=0.1)
    agent = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=100, engagement_range=20)
    world.add_agent(agent)
    world.step()
    assert np.isclose(world.time, 0.1)
    assert np.isclose(agent.x, 0.1)

def test_agent_detect():
    blue = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=100, engagement_range=20)
    red = Agent(x=50, y=0, speed=1, heading=0, team="red", detection_range=100, engagement_range=20)
    detected = blue.detect([red])
    assert len(detected) == 1
    assert detected[0].team == "red"

def test_agent_detect_negative():
    blue = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=10, engagement_range=20)
    red = Agent(x=50, y=0, speed=1, heading=0, team="red", detection_range=100, engagement_range=20)
    detected = blue.detect([red])
    assert len(detected) == 0

def test_agent_move_towards():
    blue = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=10, engagement_range=20)
    red = Agent(x=50, y=0, speed=1, heading=0, team="red", detection_range=100, engagement_range=20)
    blue.move_towards(red, 1, 1, 1)
    assert np.isclose(blue.x, 1.0)

def test_scenario_runs():
    runner = ScenarioRunner(width=1000, height=1000, n_agents_per_team=3)
    runner.run(steps=10)
    assert runner.world.time > 0

def test_agent_engage():
    blue = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=10, engagement_range=50)
    red = Agent(x=50, y=0, speed=1, heading=0, team="red", detection_range=100, engagement_range=100)
    red.engage([blue])
    assert blue.alive == False

def test_monte_carlo_runs():
    mc = MonteCarlo(width=200, height=200, n_agents_per_team=3, n_runs=10)
    results = mc.run(steps=200)
    assert len(results) == 10
    assert all("winner" in r for r in results)
    





