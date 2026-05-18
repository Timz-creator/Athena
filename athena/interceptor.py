from athena.uav import UAV
import numpy as np

class InterceptorUAV(UAV):
    def __init__(self, x, y, team, friendly_asset, friendly_base=None):
        super().__init__(x=x, y=y, team=team)
        self.turn_radius = 15
        self.max_turn_rate = self.speed / self.turn_radius
        self.friendly_asset = friendly_asset
        self.friendly_base = friendly_base
        self.role = "interceptor"
        self.fov = 120

    def act(self, agents, dt, width, height):
        if not self.alive or self.fuel <= 0:
            return

        enemies = [a for a in agents if a.team != self.team and a.alive]

        if not enemies:
            if self.friendly_base:
                class BaseTarget:
                    def __init__(self, x, y):
                        self.x = x
                        self.y = y

                target = BaseTarget(
                    x=self.friendly_base["x"],
                    y=self.friendly_base["y"]
                )

                distance = np.sqrt(
                    (self.x - self.friendly_base["x"]) ** 2 +
                    (self.y - self.friendly_base["y"]) ** 2
                )

                if distance > 5:
                    self.move_towards(target, dt, width, height)
            return

        def distance_to_asset(agent):
            return np.sqrt(
                (agent.x - self.friendly_asset["x"]) ** 2 +
                (agent.y - self.friendly_asset["y"]) ** 2
            )

        target = min(enemies, key=distance_to_asset)
        self.move_towards(target, dt, width, height)
        self.engage(agents)
