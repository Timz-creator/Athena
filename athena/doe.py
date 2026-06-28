from athena.scenario import ScenarioRunner
from athena.monte_carlo import MonteCarlo
import numpy as np
import pandas as pd

class DesignOfExperiments:
    def __init__(self, parameter_grid):
        self.parameter_grid = parameter_grid

    def run(self, ):
        results = []
        for params in self.parameter_grid:
            mc = MonteCarlo(
                width=params["width"],
                height=params["height"],
                n_runs=params["n_runs"],
                blue_n_agents=params["blue_n_agents"],
                red_n_agents=params["red_n_agents"],
                blue_attacker_ratio=params.get("blue_attacker_ratio", 0.5),
                red_attacker_ratio=params.get("red_attacker_ratio", 0.5),
                blue_n_jammers=params.get("blue_n_jammers", 0),
                red_n_jammers=params.get("red_n_jammers", 0),
            )
            mc_results = mc.run(steps=params["steps"])
            blue_wins = sum(1 for r in mc_results if r["winner"] == "blue")
            results.append({
                "detection_range": params["detection_range"],
                "engagement_range": params["engagement_range"],
                "speed": params["speed"],
                "blue_n_agents": params["blue_n_agents"],
                "red_n_agents": params["red_n_agents"],
                "blue_win_rate": blue_wins / params["n_runs"]
            })
        return pd.DataFrame(results)

            




        