from athena.agent import Agent

class World:
    def __init__(self, width, height, dt=0.1):
        self.width = width 
        self.height = height 
        self.dt = dt
        self.agents = []
        self.time = 0.0
    
    def add_agent(self, agent):
        self.agents.append(agent)

    def step(self):
        for agent in self.agents:
            if agent.alive:
                agent.update(self.dt, self.width, self.height)
        self.time += self.dt