from athena.world import World
from athena.agent import Agent 
from athena.uav import UAV
from athena.attacker import AttackerUAV
from athena.interceptor import InterceptorUAV
from athena.asset import Asset
import numpy as np

class ScenarioRunner:
    def __init__(self, width, height, n_agents_per_team, 
                 blue_base=None, red_base=None,
                 blue_asset=None, red_asset=None,
                 attacker_ratio=0.5):
        self.world = World(width=width, height=height)
        self.attacker_ratio = attacker_ratio

        self.blue_asset_obj = Asset(
            x=blue_asset["x"] if blue_asset else width/2,
            y=blue_asset["y"] if blue_asset else height/2,
            team="blue"
        ) if blue_asset else None

        self.red_asset_obj = Asset(
            x=red_asset["x"] if red_asset else width/2,
            y=red_asset["y"] if red_asset else height/2,
            team="red"
        ) if red_asset else None

        self._setup_agents(n_agents_per_team, blue_base, red_base, blue_asset, red_asset)
    
    def _setup_agents(self, n_agents_per_team, blue_base=None, red_base=None, blue_asset=None, red_asset=None):
        n_attackers = max(1, int(n_agents_per_team * self.attacker_ratio))
        offset = 5

        for i in range(n_agents_per_team):
            blue_x = (blue_base["x"] if blue_base else np.random.uniform(0, self.world.width)) + np.random.uniform(-offset, offset)
            blue_y = (blue_base["y"] if blue_base else np.random.uniform(0, self.world.height)) + np.random.uniform(-offset, offset)
            red_x = (red_base["x"] if red_base else np.random.uniform(0, self.world.width)) + np.random.uniform(-offset, offset)
            red_y = (red_base["y"] if red_base else np.random.uniform(0, self.world.height)) + np.random.uniform(-offset, offset)

            blue_x = np.clip(blue_x, 0, self.world.width)
            blue_y = np.clip(blue_y, 0, self.world.height)
            red_x = np.clip(red_x, 0, self.world.width)
            red_y = np.clip(red_y, 0, self.world.height)

            if i < n_attackers:
                blue = AttackerUAV(
                    x=blue_x, y=blue_y, team="blue",
                    target_asset=red_asset or {"x": self.world.width/2, "y": self.world.height/2},
                    asset_obj=self.red_asset_obj
                )
                red = AttackerUAV(
                    x=red_x, y=red_y, team="red",
                    target_asset=blue_asset or {"x": self.world.width/2, "y": self.world.height/2},
                    asset_obj=self.blue_asset_obj
                )
            else:
                blue = InterceptorUAV(
                    x=blue_x, y=blue_y, team="blue",
                    friendly_asset=blue_asset or {"x": self.world.width/2, "y": self.world.height/2}
                )
                red = InterceptorUAV(
                    x=red_x, y=red_y, team="red",
                    friendly_asset=red_asset or {"x": self.world.width/2, "y": self.world.height/2}
                )

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

        blue_uav_cost = sum(a.deployment_cost for a in self.world.agents if a.team == "blue")
        red_uav_cost = sum(a.deployment_cost for a in self.world.agents if a.team == "red")

        blue_damage_dealt = self.red_asset_obj.damage_taken if self.red_asset_obj else 0
        red_damage_dealt = self.blue_asset_obj.damage_taken if self.blue_asset_obj else 0

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
            "blue_damage_dealt": blue_damage_dealt,
            "red_damage_dealt": red_damage_dealt,
            "blue_uav_cost": blue_uav_cost,
            "red_uav_cost": red_uav_cost,
            "blue_net_outcome": blue_damage_dealt - blue_uav_cost,
            "red_net_outcome": red_damage_dealt - red_uav_cost,
            "assets": {
                "blue": {
                    "damage_taken": self.blue_asset_obj.damage_taken if self.blue_asset_obj else 0,
                    "damage_percentage": self.blue_asset_obj.damage_percentage if self.blue_asset_obj else 0,
                    "alive": self.blue_asset_obj.alive if self.blue_asset_obj else True
                },
                "red": {
                    "damage_taken": self.red_asset_obj.damage_taken if self.red_asset_obj else 0,
                    "damage_percentage": self.red_asset_obj.damage_percentage if self.red_asset_obj else 0,
                    "alive": self.red_asset_obj.alive if self.red_asset_obj else True
                }
            },
            "agents": [
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

