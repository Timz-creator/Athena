from athena.agent import Agent
from athena.world import World
import numpy as np

def test_agent_update():
    agent = Agent(x=0, y=0, speed=1, heading=0, team="blue")
    agent.update(dt=1)
    assert np.isclose(agent.x, 1.0)
    assert np.isclose(agent.y, 0.0)
    
def test_world_steps():
    world = World(width=100, height=1000, dt=0.1)
    agent = Agent(x=0, y=0, speed=1, heading=0, team="blue")
    world.add_agent(agent)
    world.step()
    assert np.isclose(world.time, 0.1)
    assert np.isclose(agent.x, 0.1)
