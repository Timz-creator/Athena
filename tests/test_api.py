from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_scenario_run_returns_200():
    response = client.post("/scenario/run", json={
        "width": 200,
        "height": 200,
        "blue_n_agents": 3,
        "red_n_agents": 3,
        "steps": 100
    })
    assert response.status_code == 200

def test_scenario_run_returns_correct_fields():
    response = client.post("/scenario/run", json={
        "width": 200,
        "height": 200,
        "blue_n_agents": 3,
        "red_n_agents": 3,
        "steps": 100
    })
    data = response.json()
    assert "winner" in data
    assert "blue_survived" in data
    assert "red_survived" in data
    assert "agents" in data

def test_scenario_run_returns_correct_agent_count():
    response = client.post("/scenario/run", json={
        "width": 200,
        "height": 200,
        "blue_n_agents": 3,
        "red_n_agents": 3,
        "steps": 100
    })
    data = response.json()
    assert len(data["agents"]) == 6

def test_scenario_run_rejects_invalid_input():
    response = client.post("/scenario/run", json={
        "width": 99999,
        "height": 200,
        "blue_n_agents": 3,
        "red_n_agents": 3,
        "steps": 100
    })
    assert response.status_code == 422

def test_monte_carlo_run_returns_correct_structure():
    response = client.post("/monte-carlo/run", json={
        "width": 200,
        "height": 200,
        "blue_n_agents": 3,
        "red_n_agents": 3,
        "steps": 100,
        "n_runs": 10
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 10
    assert "winner" in data["results"][0]
