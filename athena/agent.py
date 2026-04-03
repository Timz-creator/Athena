import numpy as np

class Agent:
    def __init__(self, x, y, speed, heading, team):
        self.x = x
        self.y = y
        self.speed = speed
        self.heading = heading
        self.team = team
        self.alive = True
    
    def update(self, dt):
        self.x += self.speed * np.cos(self.heading) * dt
        self.y += self.speed * np.sin(self.heading) * dt
        