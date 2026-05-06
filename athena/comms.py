import numpy as np

class CommsModel:
    def __init__(self, comms_range=100):
        self.comms_range = comms_range
    
    def share_detections(self, agents):
        """
        Each agent broadcasts its detected enemies to teammates within comms range.
        Returns a dict mapping agent -> list of all enemies it knows about
        (own detections + shared detections from teammates)
        """
        alive_agents = [agent for agent in agents if agent.alive]
        personal_detections = {
            id(agent): agent.detect(agents)
            for agent in alive_agents
        }
        shared_detections = {id(agent): set() for agent in alive_agents}

        for agent in alive_agents:
            broadcaster_id = id(agent)

            # Agents always keep their own detections.
            for detected in personal_detections[broadcaster_id]:
                shared_detections[broadcaster_id].add(id(detected))

            for teammate in alive_agents:
                if teammate.team != agent.team or id(teammate) == broadcaster_id:
                    continue

                distance = np.sqrt(
                    (teammate.x - agent.x) ** 2 +
                    (teammate.y - agent.y) ** 2
                )
                if distance <= self.comms_range:
                    for detected in personal_detections[broadcaster_id]:
                        shared_detections[id(teammate)].add(id(detected))

        id_to_agent = {id(agent): agent for agent in alive_agents}
        return {
            id(agent): [
                id_to_agent[enemy_id]
                for enemy_id in shared_detections[id(agent)]
                if enemy_id in id_to_agent
            ]
            for agent in alive_agents
        }
    
    def _is_jammed(self, agent, enemies):
        """
        Checks if an agent is jammed by any enemy in the list.
        """
        for enemy in enemies:
            if enemy.team != agent.team and enemy.alive:
                if getattr(enemy, 'role', None) == 'jammer':
                    distance = np.sqrt(
                        (enemy.x - agent.x) ** 2 +
                        (enemy.y - agent.y) ** 2)
                    if distance <= enemy.jamming_radius:
                        return True
        return False
        

    

            
            
