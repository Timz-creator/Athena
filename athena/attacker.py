from athena.uav import UAV
import numpy as np

class AttackerUAV(UAV):
    def __init__(self, x, y, team, target_asset):
        super().__init__(x=x , y=y, team=team)
        self.target_asset = target_asset
        self.role = "attacker"
        self.reached_target = False

    def update(self, dt, width, height):
        if self.reached_target:
            return
        super().update(dt, width, height)

    def act(self, agents, dt, width, height):
        if not self.alive or self.fuel <= 0:
            return

        if self.reached_target:
            self.engage(agents)
            return

        target_x = self.target_asset["x"]
        target_y = self.target_asset["y"]

        dx = target_x - self.x
        dy = target_y - self.y
        distance = np.sqrt(dx ** 2 + dy ** 2)

        if distance <= self.speed * dt:
            # Snap to exact world coordinate so worldToLngLat returns exact asset lat/lng
            self.x = target_x
            self.y = target_y
            self.reached_target = True
        else:
            class AssetTarget:
                def __init__(self, x, y):
                    self.x = x
                    self.y = y
            self.move_towards(AssetTarget(target_x, target_y), dt, width, height)

        self.engage(agents)
