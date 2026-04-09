from athena.doe import DesignOfExperiments

grid = [
    {"detection_range": 50, "engagement_range": 20, "speed": 1, "n_agents_per_team": 3, "width": 200, "height": 200, "n_runs": 50, "steps": 200},
    {"detection_range": 100, "engagement_range": 20, "speed": 1, "n_agents_per_team": 3, "width": 200, "height": 200, "n_runs": 50, "steps": 200},
    {"detection_range": 150, "engagement_range": 20, "speed": 1, "n_agents_per_team": 3, "width": 200, "height": 200, "n_runs": 50, "steps": 200},
]

doe = DesignOfExperiments(parameter_grid=grid)
results = doe.run()
print(results.to_string())
