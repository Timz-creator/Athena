from athena.uav import UAV
import numpy as np

class InterceptorUAV(UAV):
    def __init__(self, x, y, team, friendly_asset):
        super().__init__(x=x, y=y, team=team)
        self.friendly_asset = friendly_asset
        self.role = "interceptor"

    def act(self, agents, dt, width, height):
        if not self.alive or self.fuel <= 0:
            return 

        enemies = [a for a in agents if a.team != self.team and a.alive]
        if not enemies:
            return 

        def distance_to_asset(agent):
            return np.sqrt(
                (agent.x - self.friendly_asset["x"]) ** 2 +
                (agent.y - self.friendly_asset["y"]) ** 2
            )

        target = min(enemies, key=distance_to_asset)
        self.move_towards(target, dt, width, height)
        self.engage(agents)
