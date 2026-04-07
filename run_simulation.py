from athena.scenario import ScenarioRunner

runner = ScenarioRunner(width=1000, height=1000, n_agents_per_team=3)
runner.run(steps=100)

print(f"Simulation complete. Time elapsed: {runner.world.time:.1f}s")
for agent in runner.world.agents:
    print(f"Team: {agent.team} | Position: ({agent.x:.1f}, {agent.y:.1f}) | Alive: {agent.alive}")