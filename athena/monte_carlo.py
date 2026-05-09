from athena.scenario import ScenarioRunner
import numpy as np

class MonteCarlo:
    def __init__(
        self,
        width,
        height,
        n_agents_per_team,
        n_runs,
        blue_base=None,
        red_base=None,
        blue_asset=None,
        red_asset=None,
        attacker_ratio=0.5,
        n_jammers=0,
    ):
        self.width = width
        self.height = height
        self.n_agents_per_team = n_agents_per_team
        self.n_runs = n_runs
        self.blue_base = blue_base
        self.red_base = red_base
        self.blue_asset = blue_asset
        self.red_asset = red_asset
        self.attacker_ratio = attacker_ratio
        self.n_jammers = n_jammers

    def run(self, steps):
        results = []
        for _ in range(self.n_runs):
            scenario = ScenarioRunner(
                width=self.width,
                height=self.height,
                n_agents_per_team=self.n_agents_per_team,
                blue_base=self.blue_base,
                red_base=self.red_base,
                blue_asset=self.blue_asset,
                red_asset=self.red_asset,
                attacker_ratio=self.attacker_ratio,
                n_jammers=self.n_jammers,
            )
            scenario.run(steps)
            results.append(scenario.get_results())
        return results
            





