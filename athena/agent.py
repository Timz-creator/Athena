from ast import FormattedValue
import numpy as np

class Agent:
    def __init__(self, x, y, speed, heading, team, detection_range, engagement_range, kill_probability, fov=360, turn_radius=10):
        self.x = x
        self.y = y
        self.speed = speed
        self.heading = heading
        self.team = team
        self.alive = True
        self.detection_range = detection_range
        self.engagement_range = engagement_range
        self.kill_probability = kill_probability
        self.fov = fov
        self.turn_radius = turn_radius
        self.max_turn_rate = self.speed / self.turn_radius
    
    def update(self, dt, width, height):
        self.x += self.speed * np.cos(self.heading) * dt
        self.y += self.speed * np.sin(self.heading) * dt
        self.x = np.clip(self.x, 0, width)
        self.y = np.clip(self.y, 0, height)
     
    def detect(self, agents):
        detected = []
        for agent in agents:
            if agent.team != self.team and agent.alive:
                distance = np.sqrt((agent.x - self.x)**2 + (agent.y - self.y)**2)

                if distance <= self.detection_range:
                    if self.fov >= 360:
                        detected.append(agent)
                    else:
                        angle_to_target = np.arctan2(agent.y - self.y, agent.x - self.x)
                        angle_diff = abs(np.arctan2(np.sin(angle_to_target - self.heading),
                        np.cos(angle_to_target - self.heading)))

                        half_fov = np.radians(self.fov / 2)
                        if angle_diff <= half_fov:
                            detected.append(agent)
        return detected
    
    def move_towards(self, target, dt, width, height):
        target_angle = np.arctan2(target.y - self.y, target.x - self.x)

        angle_diff = np.arctan2(
            np.sin(target_angle - self.heading),
            np.cos(target_angle - self.heading)
        )

        max_turn = self.max_turn_rate * dt
        turn = np.clip(angle_diff, -max_turn, max_turn)

        self.heading += turn
        self.update(dt, width, height)

    def engage(self, agents):
        for agent in agents:
            if agent.team != self.team and agent.alive:
                distance = np.sqrt((agent.x - self.x)**2 + (agent.y - self.y)**2)
                if distance <= self.engagement_range:
                    if np.random.random() < self.kill_probability:
                        agent.alive = False

        