from athena.uav import UAV
import numpy as np

class AttackerUAV(UAV):
    def __init__(self, x, y, team, target_asset):
        super().__init__(x=x , y=y, team=team)
        self.target_asset = target_asset
        self.role = "attacker"

    def act(self, agents, dt, width, height):
        if not self.alive or self.fuel <= 0:
            return 
        
        class AssetTarget:
            def __init__(self, x, y):
                self.x = x
                self.y = y
        
        target = AssetTarget(
            x=self.target_asset["x"],
            y=self.target_asset["y"]
        )

        self.move_towards(target, dt, width, height)