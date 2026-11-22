import type { Agent, Role, ValorantApiResponse } from '../types/agent';

export const VALORANT_API_URL =
  'https://valorant-api.com/v1/agents?isPlayableCharacter=true';

function getRoleFromApi(roleName: string | null | undefined): Role {
  if (
    roleName === 'Duelist' ||
    roleName === 'Sentinel' ||
    roleName === 'Controller' ||
    roleName === 'Initiator'
  ) {
    return roleName;
  }

  return 'Unknown';
}

// This is a simple demo score, not an official Valorant statistic.
function getRoleFit(agentRole: Role, recommendedRole: Role): number {
  if (agentRole === recommendedRole) {
    return 95;
  }

  if (agentRole === 'Initiator') {
    return 85;
  }

  return 75;
}

// Custom Promise function: fetches the endpoint and converts the response into Agent objects.
export function getAgentObjects(recommendedRole: Role): Promise<Agent[]> {
  return fetch(VALORANT_API_URL)
    .then((response) => {
      if (!response.ok) {
        return Promise.reject(
          new Error(`API request failed with status ${response.status}`)
        );
      }

      return response.json() as Promise<ValorantApiResponse>;
    })
    .then((result) => {
      if (!result || !Array.isArray(result.data)) {
        return Promise.reject(new Error('The API returned an invalid response.'));
      }

      const agentObjects: Agent[] = result.data
        .filter(
          (apiAgent) =>
            apiAgent.isPlayableCharacter && apiAgent.role !== null
        )
        .map((apiAgent) => {
          const role = getRoleFromApi(apiAgent.role?.displayName);

          return {
            id: apiAgent.uuid,
            name: apiAgent.displayName,
            role,
            description: apiAgent.description,
            icon: apiAgent.displayIcon,
            fit: getRoleFit(role, recommendedRole),
          };
        })
        .sort((a, b) => b.fit - a.fit);

      return Promise.resolve(agentObjects.slice(0, 8));
    })
    .catch((error: unknown) => Promise.reject(error));
}
