from athena.scenario import ScenarioRunner
import numpy as np

class MonteCarlo:
    def __init__(self, width, height, n_agents_per_team, n_runs):
        self.width = width
        self.height = height
        self.n_agents_per_team = n_agents_per_team
        self.n_runs = n_runs

    def run(self, steps):
        results = []
        for _ in range(self.n_runs):
            scenario = ScenarioRunner(width = self.width , height = self.height, n_agents_per_team= self.n_agents_per_team)
            scenario.run(steps)
            results.append(scenario.get_results())
        return results
            





