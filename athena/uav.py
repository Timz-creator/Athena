from athena.agent import Agent

class UAV(Agent):
    def __init__(self, x, y, team):
        super().__init__(
            x=x,
            y=y,
            speed=3,
            heading=0,
            team=team,
            detection_range=50,
            engagement_range=30,
            kill_probability=0.15
        )
        self.altitude = 100
        self.fuel = 100.0
    
    def update(self, dt, width, height):
        if self.fuel <= 0:
            self.alive = False
            return 
        
        super().update(dt, width, height)
        self.fuel -= 0.5 * dt