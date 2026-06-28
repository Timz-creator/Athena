from athena.agent import Agent
from athena.interceptor import InterceptorUAV
from athena.world import World
from athena.scenario import ScenarioRunner
from athena.monte_carlo import MonteCarlo
from athena.doe import DesignOfExperiments
import numpy as np

def test_agent_update():
    agent = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=100, engagement_range=20, kill_probability=0.1)
    agent.update(dt=1, width=1, height=1)
    assert np.isclose(agent.x, 1.0)
    assert np.isclose(agent.y, 0.0)
    
def test_world_steps():
    world = World(width=100, height=1000, dt=0.1)
    agent = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=100, engagement_range=20, kill_probability=0.1 )
    world.add_agent(agent)
    world.step()
    assert np.isclose(world.time, 0.1)
    assert np.isclose(agent.x, 0.1)

def test_agent_detect():
    blue = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=100, engagement_range=20, kill_probability=0.1)
    red = Agent(x=50, y=0, speed=1, heading=0, team="red", detection_range=100, engagement_range=20, kill_probability=0.1)
    detected = blue.detect([red])
    assert len(detected) == 1
    assert detected[0].team == "red"

def test_agent_detect_negative():
    blue = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=10, engagement_range=20, kill_probability=0.1)
    red = Agent(x=50, y=0, speed=1, heading=0, team="red", detection_range=100, engagement_range=20, kill_probability=0.1)
    detected = blue.detect([red])
    assert len(detected) == 0

def test_agent_move_towards():
    blue = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=10, engagement_range=20, kill_probability=0.1)
    red = Agent(x=50, y=0, speed=1, heading=0, team="red", detection_range=100, engagement_range=20, kill_probability=0.1)
    blue.move_towards(red, 1, 100, 100)
    assert np.isclose(blue.x, 1.0)

def test_interceptor_returns_to_base():
    interceptor = InterceptorUAV(
        x=50, y=50, team="blue",
        friendly_asset={"x": 100, "y": 100},
        friendly_base={"x": 0, "y": 0},
    )
    base = interceptor.friendly_base
    interceptor.heading = np.arctan2(base["y"] - interceptor.y, base["x"] - interceptor.x)
    start_x, start_y = interceptor.x, interceptor.y
    start_distance = np.sqrt((start_x - base["x"]) ** 2 + (start_y - base["y"]) ** 2)
    for _ in range(20):
        interceptor.act([], dt=0.1, width=200, height=200)
    assert interceptor.x < start_x
    assert interceptor.y < start_y
    end_distance = np.sqrt(
        (interceptor.x - base["x"]) ** 2 + (interceptor.y - base["y"]) ** 2
    )
    assert end_distance < start_distance

def test_kinematic_turning():
    agent = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=100, engagement_range=20, kill_probability=0.1)

    class NorthTarget:
        x = 0
        y = 1

    agent.move_towards(NorthTarget(), dt=0.1, width=100, height=100)
    assert agent.heading != np.pi / 2
    assert agent.heading > 0

def test_scenario_runs():
    runner = ScenarioRunner(width=1000, height=1000, blue_n_agents=3, red_n_agents=3)
    runner.run(steps=10)
    assert runner.world.time > 0

def test_agent_engage():
    blue = Agent(x=0, y=0, speed=1, heading=0, team="blue", detection_range=10, engagement_range=50, kill_probability=1)
    red = Agent(x=50, y=0, speed=1, heading=0, team="red", detection_range=100, engagement_range=100, kill_probability=1)
    red.engage([blue])
    assert blue.alive == False

def test_monte_carlo_runs():
    mc = MonteCarlo(width=200, height=200, blue_n_agents=3, red_n_agents=3, n_runs=10)
    results = mc.run(steps=200)
    assert len(results) == 10
    assert all("winner" in r for r in results)
    assert mc.base_seed is not None
    assert all(r.get("seed") == mc.base_seed + i for i, r in enumerate(results))


def test_monte_carlo_explicit_seed_base():
    mc = MonteCarlo(
        width=200, height=200, blue_n_agents=3, red_n_agents=3, n_runs=4, seed=1000
    )
    results = mc.run(steps=20)
    assert mc.base_seed == 1000
    assert [r["seed"] for r in results] == [1000, 1001, 1002, 1003]


def _scenario_outcome(results):
    positions = tuple(
        (a["x"], a["y"], a["heading"], a["alive"]) for a in results["agents"]
    )
    return (results["winner"], positions)


def test_deterministic_seeding():
    steps = 50
    r1 = ScenarioRunner(
        width=200, height=200, blue_n_agents=3, red_n_agents=3, seed=42
    )
    r1.run(steps=steps)
    out1 = _scenario_outcome(r1.get_results())

    r2 = ScenarioRunner(
        width=200, height=200, blue_n_agents=3, red_n_agents=3, seed=42
    )
    r2.run(steps=steps)
    out2 = _scenario_outcome(r2.get_results())

    assert out1 == out2


def test_different_seeds_differ():
    steps = 80
    r42 = ScenarioRunner(
        width=200, height=200, blue_n_agents=3, red_n_agents=3, seed=42
    )
    r42.run(steps=steps)
    out42 = _scenario_outcome(r42.get_results())

    r43 = ScenarioRunner(
        width=200, height=200, blue_n_agents=3, red_n_agents=3, seed=43
    )
    r43.run(steps=steps)
    out43 = _scenario_outcome(r43.get_results())

    assert out42 != out43


def test_asymmetric_force_composition():
    runner = ScenarioRunner(width=200, height=200, blue_n_agents=15, red_n_agents=3, seed=42)
    assert len(runner.world.agents) == 18
    blue_count = sum(1 for a in runner.world.agents if a.team == "blue")
    red_count = sum(1 for a in runner.world.agents if a.team == "red")
    assert blue_count == 15
    assert red_count == 3
    assert blue_count > red_count
    runner.run(steps=10)
    assert len(runner.world.agents) == 18
    
def test_doe():
    grid = [
    {"detection_range": 50, "engagement_range": 20, "speed": 1, "blue_n_agents": 3, "red_n_agents": 3, "width": 200, "height": 200, "n_runs": 10, "steps": 100},
    {"detection_range": 100, "engagement_range": 20, "speed": 1, "blue_n_agents": 3, "red_n_agents": 3, "width": 200, "height": 200, "n_runs": 10, "steps": 100},
]
    doe = DesignOfExperiments(parameter_grid=grid)
    results = doe.run()
    assert results.shape[0] == 2
    assert "blue_win_rate" in results.columns








