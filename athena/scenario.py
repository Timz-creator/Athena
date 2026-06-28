from athena.world import World
from athena.agent import Agent 
from athena.uav import UAV
from athena.attacker import AttackerUAV
from athena.interceptor import InterceptorUAV
from athena.jammer import JammerUAV
from athena.asset import Asset
from athena.comms import CommsModel
import numpy as np

class ScenarioRunner:
    def __init__(self, width, height,
                 blue_n_agents=3, red_n_agents=3,
                 blue_attacker_ratio=0.5, red_attacker_ratio=0.5,
                 blue_n_jammers=0, red_n_jammers=0,
                 blue_base=None, red_base=None,
                 blue_asset=None, red_asset=None,
                 seed=None):
        if seed is None:
            seed = int(np.random.randint(0, 2**31))
        self.seed = seed
        np.random.seed(seed)

        self.world = World(width=width, height=height)
        self.blue_n_agents = blue_n_agents
        self.red_n_agents = red_n_agents
        self.blue_attacker_ratio = blue_attacker_ratio
        self.red_attacker_ratio = red_attacker_ratio
        self.blue_n_jammers = blue_n_jammers
        self.red_n_jammers = red_n_jammers
        self.comms = CommsModel(comms_range=1000)

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

        self._setup_agents(blue_base, red_base, blue_asset, red_asset)
    
    def _setup_agents(self, blue_base, red_base, blue_asset, red_asset):
        blue_n_attackers = max(1, int(self.blue_n_agents * self.blue_attacker_ratio)) if self.blue_n_agents > 0 else 0
        red_n_attackers = max(1, int(self.red_n_agents * self.red_attacker_ratio)) if self.red_n_agents > 0 else 0
        offset = 5

        for i in range(self.blue_n_agents):
            x = (blue_base["x"] if blue_base else np.random.uniform(0, self.world.width)) + np.random.uniform(-offset, offset)
            y = (blue_base["y"] if blue_base else np.random.uniform(0, self.world.height)) + np.random.uniform(-offset, offset)
            x = np.clip(x, 0, self.world.width)
            y = np.clip(y, 0, self.world.height)

            if i < blue_n_attackers:
                agent = AttackerUAV(x=x, y=y, team="blue",
                                    target_asset=red_asset or {"x": self.world.width/2, "y": self.world.height/2},
                                    asset_obj=self.red_asset_obj)
            else:
                agent = InterceptorUAV(x=x, y=y, team="blue",
                                       friendly_asset=blue_asset or {"x": self.world.width/2, "y": self.world.height/2},
                                       friendly_base=blue_base or {"x": self.world.width/2, "y": self.world.height/2})
            self.world.add_agent(agent)

        for _ in range(self.blue_n_jammers):
            x = (blue_base["x"] if blue_base else np.random.uniform(0, self.world.width)) + np.random.uniform(-offset, offset)
            y = (blue_base["y"] if blue_base else np.random.uniform(0, self.world.height)) + np.random.uniform(-offset, offset)
            self.world.add_agent(JammerUAV(x=x, y=y, team="blue",
                                           target_asset=red_asset or {"x": self.world.width/2, "y": self.world.height/2}))

        for i in range(self.red_n_agents):
            x = (red_base["x"] if red_base else np.random.uniform(0, self.world.width)) + np.random.uniform(-offset, offset)
            y = (red_base["y"] if red_base else np.random.uniform(0, self.world.height)) + np.random.uniform(-offset, offset)
            x = np.clip(x, 0, self.world.width)
            y = np.clip(y, 0, self.world.height)

            if i < red_n_attackers:
                agent = AttackerUAV(x=x, y=y, team="red",
                                    target_asset=blue_asset or {"x": self.world.width/2, "y": self.world.height/2},
                                    asset_obj=self.blue_asset_obj)
            else:
                agent = InterceptorUAV(x=x, y=y, team="red",
                                       friendly_asset=red_asset or {"x": self.world.width/2, "y": self.world.height/2},
                                       friendly_base=red_base or {"x": self.world.width/2, "y": self.world.height/2})
            self.world.add_agent(agent)

        for _ in range(self.red_n_jammers):
            x = (red_base["x"] if red_base else np.random.uniform(0, self.world.width)) + np.random.uniform(-offset, offset)
            y = (red_base["y"] if red_base else np.random.uniform(0, self.world.height)) + np.random.uniform(-offset, offset)
            self.world.add_agent(JammerUAV(x=x, y=y, team="red",
                                           target_asset=blue_asset or {"x": self.world.width/2, "y": self.world.height/2}))
        
    
    def run(self, steps):
        for _ in range(steps):
            shared_enemies = self.comms.share_detections(self.world.agents)

            for agent in self.world.agents:
                if agent.alive:
                    agent.act(shared_enemies.get(id(agent), []), self.world.dt, self.world.width, self.world.height)
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
            "seed": self.seed,
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
