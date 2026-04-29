from athena import agent
from athena.world import World
from athena.agent import Agent 
from athena.uav import UAV
from athena.attacker import AttackerUAV
from athena.interceptor import InterceptorUAV
import numpy as np

class ScenarioRunner:
    def __init__(self, width, height, n_agents_per_team, 
                 blue_base=None, red_base=None,
                 blue_asset=None, red_asset=None,
                 attacker_ratio=0.5):
        self.world = World(width=width, height=height)
        self.blue_asset = blue_asset
        self.red_asset = red_asset
        self.attacker_ratio = attacker_ratio
        self._setup_agents(n_agents_per_team, blue_base, red_base)
    
    def _setup_agents(self, n_agents_per_team, blue_base=None, red_base=None):
        n_attackers = max(1, int(n_agents_per_team * self.attacker_ratio))
        n_interceptors = n_agents_per_team - n_attackers

        for i in range(n_agents_per_team):
            blue_x = blue_base["x"] if blue_base else np.random.uniform(0, self.world.width)
            blue_y = blue_base["y"] if blue_base else np.random.uniform(0, self.world.height)
            red_x = red_base["x"] if red_base else np.random.uniform(0, self.world.width)
            red_y = red_base["y"] if red_base else np.random.uniform(0, self.world.height)

            if i < n_attackers:
                blue = AttackerUAV(x=blue_x, y=blue_y, team="blue", 
                                target_asset=self.red_asset or {"x": self.world.width/2, "y": self.world.height/2})
                red = AttackerUAV(x=red_x, y=red_y, team="red",
                                target_asset=self.blue_asset or {"x": self.world.width/2, "y": self.world.height/2})
            else:
                blue = InterceptorUAV(x=blue_x, y=blue_y, team="blue",
                                    friendly_asset=self.blue_asset or {"x": self.world.width/2, "y": self.world.height/2})
                red = InterceptorUAV(x=red_x, y=red_y, team="red",
                                    friendly_asset=self.red_asset or {"x": self.world.width/2, "y": self.world.height/2})

            self.world.add_agent(blue)
            self.world.add_agent(red)
    
    def run(self, steps):
        for _ in range(steps):
            for agent in self.world.agents:
                if agent.alive:
                    agent.act(self.world.agents, self.world.dt, self.world.width, self.world.height)
            self.world.step()
    
    def get_results(self):
        blue_survived = sum(1 for agent in self.world.agents if agent.team == "blue" and agent.alive)
        red_survived = sum(1 for agent in self.world.agents if agent.team == "red" and agent.alive)
        if blue_survived > red_survived:
            winner = "blue"
        elif red_survived > blue_survived:
            winner = "red"
        else:
            winner = "draw"
        return {
            "winner": winner,
            "blue_survived": blue_survived,
            "red_survived": red_survived,
            "agents" : [
                {
                    "x": agent.x,
                    "y": agent.y,
                    "team": agent.team,
                    "alive": agent.alive,
                    "heading": agent.heading
                }
                for agent in self.world.agents

            ]
        }



