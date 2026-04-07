import numpy as np

class Agent:
    def __init__(self, x, y, speed, heading, team, detection_range, engagement_range):
        self.x = x
        self.y = y
        self.speed = speed
        self.heading = heading
        self.team = team
        self.alive = True
        self.detection_range = detection_range
        self.engagement_range = engagement_range
    
    def update(self, dt):
        self.x += self.speed * np.cos(self.heading) * dt
        self.y += self.speed * np.sin(self.heading) * dt
     
    def detect(self, agents):
        detected = []
        for agent in agents:
            if agent.team != self.team and agent.alive:
                distance = np.sqrt((agent.x - self.x)**2 + (agent.y - self.y)**2)
                if distance <= self.detection_range:
                    detected.append(agent)
        return detected
    
    def move_towards(self, target, dt):
        target_angle = np.arctan2((target.y - self.y), (target.x - self.x))
        self.heading = target_angle
        self.update(dt)

    def engage(self, agents):
        for agent in agents:
            if agent.team != self.team and agent.alive:
                distance = np.sqrt((agent.x - self.x)**2 + (agent.y - self.y)**2)
                if distance <= self.engagement_range:
                    agent.alive = False

        