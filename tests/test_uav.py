from athena.uav import UAV
import numpy as np

def test_uav_has_correct_defaults():
    uav = UAV(x=0, y=0, team="blue")
    assert uav.speed == 10
    assert uav.detection_range == 50
    assert uav.engagement_range == 30
    assert uav.kill_probability == 0.15
    assert uav.altitude == 100
    assert uav.fuel == 100.0
    assert uav.fov == 360

def test_uav_detect():
    blue = UAV(x=0, y=0, team="blue")
    red = UAV(x=30, y=0, team="red")  # within range and directly ahead
    detected = blue.detect([red])
    assert len(detected) == 1
    assert detected[0].team == "red"

def test_uav_detect_outside_fov():
    blue = UAV(x=0, y=0, team="blue")
    blue.fov = 80  # narrow cone like AttackerUAV
    blue.heading = 0  # facing right
    red = UAV(x=-30, y=0, team="red")  # directly behind blue
    detected = blue.detect([red])
    assert len(detected) == 0  # should not detect enemy behind it

def test_agent_move_towards():
    blue = UAV(x=0, y=0, team="blue")
    red = UAV(x=50, y=0, team="red")
    blue.move_towards(red, 1, 200, 200)
    blue.update(1, 200, 200)
    assert blue.x > 0

def test_uav_fuel_depletes():
    uav = UAV(x=0, y=0, team="blue")
    uav.update(dt=1, width=200, height=200)
    assert uav.fuel < 100.0

def test_uav_dies_when_fuel_empty():
    uav = UAV(x=0, y=0, team="blue")
    uav.fuel = 0
    uav.update(dt=1, width=200, height=200)
    assert uav.alive == False