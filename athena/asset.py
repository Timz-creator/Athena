class Asset:
    def __init__(self, x, y, team, value=10_000_000):
        self.x = x
        self.y = y
        self.team = team
        self.value = value
        self.dam_taken = 0.0
        self.alive = True
    
    def take_damage(self, damage_per_tick=0.01):
        damage_in_pounds = self.value * damage_per_tick
        self.damage_taken += damage_in_pounds
        if self.damage_taken >= self.value:
            self.alive = False
    
    @property
    def damage_percentage(self):
        return min(100, (self.damage_take / self.value) * 100)
        
