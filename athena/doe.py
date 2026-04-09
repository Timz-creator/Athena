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
            mc = MonteCarlo(width=params["width"], height=params["height"], n_agents_per_team=params["n_agents_per_team"], n_runs=params["n_runs"])
            mc_results = mc.run(steps=params["steps"])
            blue_wins = sum(1 for r in mc_results if r["winner"] == "blue")
            results.append({
                "detection_range": params["detection_range"],
                "engagement_range": params["engagement_range"],
                "speed": params["speed"],
                "n_agents_per_team": params["n_agents_per_team"],
                "blue_win_rate": blue_wins / params["n_runs"]
            })
        return pd.DataFrame(results)

            




        