from athena.agent import Agent
import numpy as np

def test_agent_update():
    agent = Agent(x=0, y=0, speed=1, heading=0, team="blue")
    agent.update(dt=1)
    assert np.isclose(agent.x, 1.0)
    assert np.isclose(agent.y, 0.0)
    