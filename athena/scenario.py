from athena import agent
from athena.world import World
from athena.agent import Agent 
import numpy as np

class ScenarioRunner:
    def __init__(self, width, height, n_agents_per_team):
        self.world = World(width=width, height=height)
        self._setup_agents(n_agents_per_team) 
    
    def _setup_agents(self, n_agents_per_team):
        for _ in range(n_agents_per_team):
            blue = Agent(x=np.random.uniform(0, self.world.width), y=np.random.uniform(0, self.world.height), speed=1, heading=0, team="blue", detection_range=100)
            red = Agent(x=np.random.uniform(0, self.world.width), y=np.random.uniform(0, self.world.height), speed=1, heading=0, team="red", detection_range=100)
            self.world.add_agent(blue)
            self.world.add_agent(red)
    
    def run(self, steps):
        for _ in range(steps):  
            for agent in self.world.agents:
                if agent.alive:
                    detected = agent.detect(self.world.agents)
                    if detected:
                        agent.move_towards(detected[0], self.world.dt)
                self.world.step()
                


