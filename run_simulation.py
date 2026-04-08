from athena.monte_carlo import MonteCarlo

mc = MonteCarlo(width=200, height=200, n_agents_per_team=3, n_runs=100)
results = mc.run(steps=200)

blue_wins = sum(1 for r in results if r["winner"] == "blue")
red_wins = sum(1 for r in results if r["winner"] == "red")
draws = sum(1 for r in results if r["winner"] == "draw")

print(f"Runs: 100")
print(f"Blue wins: {blue_wins}%")
print(f"Red wins: {red_wins}%")
print(f"Draws: {draws}%")
