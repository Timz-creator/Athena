from athena.scenario import ScenarioRunner
import numpy as np

class MonteCarlo:
    def __init__(
        self,
        width,
        height,
        n_runs,
        blue_n_agents=3,
        red_n_agents=3,
        blue_attacker_ratio=0.5,
        red_attacker_ratio=0.5,
        blue_n_jammers=0,
        red_n_jammers=0,
        blue_base=None,
        red_base=None,
        blue_asset=None,
        red_asset=None,
        seed=None,
    ):
        self.seed = seed
        self.width = width
        self.height = height
        self.n_runs = n_runs
        self.blue_n_agents = blue_n_agents
        self.red_n_agents = red_n_agents
        self.blue_attacker_ratio = blue_attacker_ratio
        self.red_attacker_ratio = red_attacker_ratio
        self.blue_n_jammers = blue_n_jammers
        self.red_n_jammers = red_n_jammers
        self.blue_base = blue_base
        self.red_base = red_base
        self.blue_asset = blue_asset
        self.red_asset = red_asset
        self.base_seed = None

    def run(self, steps):
        if self.seed is not None:
            base = self.seed
        else:
            base = int(np.random.randint(0, 2**31))
        self.base_seed = base

        results = []
        for i in range(self.n_runs):
            run_seed = base + i
            scenario = ScenarioRunner(
                width=self.width,
                height=self.height,
                blue_n_agents=self.blue_n_agents,
                red_n_agents=self.red_n_agents,
                blue_attacker_ratio=self.blue_attacker_ratio,
                red_attacker_ratio=self.red_attacker_ratio,
                blue_n_jammers=self.blue_n_jammers,
                red_n_jammers=self.red_n_jammers,
                blue_base=self.blue_base,
                red_base=self.red_base,
                blue_asset=self.blue_asset,
                red_asset=self.red_asset,
                seed=run_seed,
            )
            scenario.run(steps)
            results.append(scenario.get_results())
        return results
