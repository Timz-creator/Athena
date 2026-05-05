from athena.uav import UAV
import numpy as np

class AttackerUAV(UAV):
    def __init__(self, x, y, team, target_asset, asset_obj=None):
        super().__init__(x=x, y=y, team=team)
        self.target_asset = target_asset
        self.asset_obj = asset_obj
        self.role = "attacker"
        self.reached_target = False
        self.fov = 80

    def update(self, dt, width, height):
        if self.reached_target:
            return
        super().update(dt, width, height)

    def act(self, _agents, dt, width, height):
        if not self.alive or self.fuel <= 0:
            return

        if self.reached_target:
            if self.asset_obj and self.asset_obj.alive:
                self.asset_obj.take_damage()
            return

        target_x = self.target_asset["x"]
        target_y = self.target_asset["y"]

        dx = target_x - self.x
        dy = target_y - self.y
        distance = np.sqrt(dx ** 2 + dy ** 2)

        if distance <= self.speed * dt:
            self.x = target_x
            self.y = target_y
            self.reached_target = True
        else:
            class AssetTarget:
                def __init__(self, x, y):
                    self.x = x
                    self.y = y
            self.move_towards(AssetTarget(target_x, target_y), dt, width, height)
