# Athena

**A UAV swarm wargame simulation engine for operations analysis and tactics development.**

Athena simulates UAV swarm attack and defence on real-world geography, tracking monetary damage to protected assets and the cost of deploying each force. Run a single engagement to watch the battle unfold, or run 500 Monte Carlo scenarios to surface win rate distributions across force compositions.

🔴 **[Live Demo →](https://athena-six-lyart.vercel.app)**

---

Image 18-05-2026 at 5.27 pm.jpg

---

## What it does

A user places four markers on a real-world Mapbox map — a blue base, a red base, a blue protected asset, and a red protected asset. They configure their force composition: how many UAVs per team, what fraction are attackers vs interceptors, how many electronic warfare jammers to deploy. Then they hit **EXECUTE**.

Blue attackers fly toward the red asset. Red interceptors hunt them down, prioritising threats closest to the friendly asset. Jammers disrupt the interceptor comms network. The simulation streams tick-by-tick to the browser — directional NATO-style chevrons carving curved flight paths across real terrain, asset damage bars depleting in real time.

At the end: total damage dealt in £, UAV deployment cost per team, and net outcome. **Did the attack pay off?**

Hit **MONTE CARLO** to run 50 scenarios with the same geography and surface the win rate distribution. Change the attacker ratio slider and run again. Find the optimal force composition for this specific battlefield.

---

## Modelling decisions

These aren't arbitrary parameters — each decision is grounded in documented real-world platform characteristics.

### Sensor model — FOV-based detection cone

Detection is modelled as a forward-facing cone, not an omnidirectional circle. This reflects the single forward-facing camera payload of low-cost kamikaze drones like the Shahed-136 and Ukrainian FPV platforms.

| Unit           | FOV  | Basis                                                    |
| -------------- | ---- | -------------------------------------------------------- |
| AttackerUAV    | 80°  | Single forward-facing optical payload (Shahed-136 class) |
| InterceptorUAV | 120° | Wider search sensor configuration                        |
| JammerUAV      | 80°  | Same airframe as attacker                                |

An enemy approaching from outside the FOV cone is undetectable regardless of range. This makes attacker heading and approach vector tactically significant — flanking is a real option.

### Comms model — shared operational picture with EW disruption

Interceptors share detection data with teammates within comms range, mirroring how Anduril's Lattice OS creates a shared operational picture across distributed assets.

A dedicated **JammerUAV** disrupts this shared picture within its jamming radius. This is based on documented Russian use of dedicated EW platforms flying alongside Shahed swarms — not all attackers are jammers, which is a common simplification. Only specialist EW platforms carry jamming payloads.

When an interceptor is jammed it retains its own sensor detections but cannot receive shared intelligence from teammates. Eliminating the jammer restores the network.

### Kinematic flight model — constrained turning

UAVs cannot change direction instantly. Each platform has a maximum turn rate derived from its speed and turn radius, producing physically realistic curved flight paths.

| Unit           | Turn radius    | Effect                                                |
| -------------- | -------------- | ----------------------------------------------------- |
| AttackerUAV    | 20 world units | Commits to approach vectors, can't instantly redirect |
| InterceptorUAV | 15 world units | More agile, tighter pursuit curves                    |
| JammerUAV      | 20 world units | Same as attacker                                      |

Attackers launch with ±30° random heading variation for distributed approach vectors — a documented swarm tactic used to overwhelm point defences by approaching from multiple angles simultaneously.

### Monetary damage model

Asset damage is expressed in £ rather than abstract health points. This enables cost-benefit analysis — the actual metric that drives real defence procurement decisions.

```
Damage per tick = asset_value × damage_rate
Net outcome = damage_dealt_to_enemy - own_uav_deployment_cost
```

A positive net outcome means the attack was cost-effective. A negative net outcome means the defence held. Default asset value: £10M. Default UAV deployment cost: £500K per platform.

### Deterministic seeding

Every simulation run records its random seed. Any run can be exactly reproduced by passing the seed back to the API — essential for debugging, validation, and sharing specific results with colleagues.

### Mission roles — no mid-mission switching

Attackers fly their assigned mission regardless of what else is happening. Interceptors intercept. Jammers jam. There is no mid-mission role switching.

This reflects documented operational doctrine for low-cost expendable platforms — mission simplicity is a feature, not a limitation. A Shahed-136 does not reassign itself based on battlefield conditions.

---

## Architecture

```
Browser (React + Mapbox GL JS)
        ↕ WebSocket — tick-by-tick state streaming
FastAPI backend (Railway)
        ↓
Simulation engine (Python — importable as a library)
```

The simulation engine is headless and independent of any web framework. It can be imported and used directly:

```python
from athena.scenario import ScenarioRunner

runner = ScenarioRunner(
    width=200, height=200,
    n_agents_per_team=5,
    attacker_ratio=0.6,
    n_jammers=1
)
runner.run(steps=500)
results = runner.get_results()
# { "winner": "blue", "blue_damage_dealt": 8100000, "blue_net_outcome": 6600000, ... }
```

### Simulation engine modules

| Module                | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `Agent`               | Base class — position, heading, FOV, detection, engagement    |
| `UAV`                 | Subclass — speed, fuel, deployment cost, kinematic turn model |
| `AttackerUAV`         | Flies to enemy asset, distributed approach vectors, 80° FOV   |
| `InterceptorUAV`      | Hunts enemy UAVs, returns to base when threat eliminated      |
| `JammerUAV`           | EW platform, disrupts interceptor comms within jamming radius |
| `Asset`               | Fixed geographic point, monetary value, damage accumulation   |
| `World`               | Holds all agents, advances simulation by dt each tick         |
| `ScenarioRunner`      | Orchestrates scenario, collects results                       |
| `CommsModel`          | Shared detection picture, jammer disruption logic             |
| `MonteCarloRunner`    | N scenario runs, outcome distribution                         |
| `DesignOfExperiments` | Systematic parameter sweep, pandas results table              |

### API endpoints

| Method    | Endpoint           | Description                                 |
| --------- | ------------------ | ------------------------------------------- |
| POST      | `/scenario/run`    | Single scenario, returns full results       |
| POST      | `/monte-carlo/run` | N scenarios, returns win rate distribution  |
| POST      | `/doe/run`         | Parameter grid sweep, returns results table |
| WebSocket | `/scenario/stream` | Real-time tick-by-tick state streaming      |

Interactive API docs: [athena-production-4518.up.railway.app/docs](https://athena-production-4518.up.railway.app/docs)

---

## Running locally

### Backend

```bash
git clone https://github.com/Timz-creator/Athena.git
cd Athena
python -m venv venv
source venv/bin/activate
pip install -e .
pip install fastapi uvicorn[standard] pandas
uvicorn app:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

Get a free token at [mapbox.com](https://mapbox.com).

```bash
npm run dev
```

Open [localhost:5173](http://localhost:5173).

### Tests

```bash
# Backend
pytest tests/ -v

# Frontend
cd frontend && npm test
```

---

## CI/CD

GitHub Actions runs on every push to `main`. Backend tests (pytest) and frontend tests (Vitest) must both pass before Railway deploys the backend. Frontend deploys to Vercel automatically.

---

## Tech stack

| Layer               | Technology                                   |
| ------------------- | -------------------------------------------- |
| Simulation engine   | Python 3.13, NumPy                           |
| Backend             | FastAPI, uvicorn, WebSocket                  |
| Frontend            | React, Vite, Tailwind CSS                    |
| Map                 | Mapbox GL JS — dark-v11 with 3D terrain      |
| Backend deployment  | Railway                                      |
| Frontend deployment | Vercel                                       |
| Testing             | pytest, httpx, Vitest, React Testing Library |
| CI/CD               | GitHub Actions                               |

---

## Roadmap

- [ ] LLM fine-tuning — generate tactical reasoning dataset from simulation runs, fine-tune Llama 3.1 8B for UAV swarm analysis
- [ ] After-action report — LLM-generated tactical analysis of Monte Carlo results
- [ ] 3D altitude rendering — UAVs rendered at realistic altitude above terrain surface
- [ ] Event log panel — live feed of detections, engagements, asset damage
- [ ] Terrain-aware movement — query elevation data for line-of-sight occlusion
- [ ] UGV subclass — ground vehicle dynamics, road following, terrain cost model
- [ ] Human-in-the-loop — intervene mid-simulation to redirect assets or deploy reinforcements

---

## References

- [Lanchester equations](https://en.wikipedia.org/wiki/Lanchester%27s_laws) — classical attrition model; Athena is a stochastic discrete-event approximation
- [APP-6 / MIL-STD-2525](https://en.wikipedia.org/wiki/NATO_Joint_Military_Symbology) — NATO symbology standard used for unit icons
- [Shahed-136](https://en.wikipedia.org/wiki/HESA_Shahed_136) — Iranian kamikaze drone, basis for attacker FOV and speed parameters
- [Lattice OS](https://www.anduril.com/technology/lattice/) — Anduril's shared operational picture platform, inspiration for CommsModel architecture

---

Built by [Timarley Foster](https://github.com/Timz-creator)
