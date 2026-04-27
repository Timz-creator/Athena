from athena.agent import Agent

class UAV(Agent):
    def __init__(self, x, y, team):
        super().__init__(
            x=x,
            y=y,
            speed=3,
            heading=0,
            team=team,
            detection_range=150,
            engagement_range=30,
            kill_probability=0.15
        )
        self.altitude = 100
        self.fuel = 100.0
        