import { Agent, RawValorantAgent } from '../types/agent';

// 1. Memakai Promise murni dengan resolve() dan reject()
export function parseAgentData(rawAgent: RawValorantAgent): Promise<Agent> {
  return new Promise((resolve, reject) => {
    if (!rawAgent || !rawAgent.uuid || !rawAgent.displayName) {
      // Menggunakan reject() jika validasi gagal
      return reject(new Error('Data agen tidak valid atau kosong.'));
    }

    const processedAgent: Agent = {
      id: rawAgent.uuid,
      name: rawAgent.displayName,
      role: rawAgent.role?.displayName ?? 'Unknown',
      description: rawAgent.description ?? 'No description available.',
      icon: rawAgent.displayIcon ?? '',
      match: Math.floor(Math.random() * 25) + 75,
    };

    // Menggunakan resolve() jika data berhasil diproses
    resolve(processedAgent);
  });
}

// 2. Custom Async Function yang menggabungkan pre-built fetch() & .then()
export async function fetchValorantAgents(): Promise<Agent[]> {
  try {
    // Pre-built async function (fetch) ke endpoint publik
    const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');

    if (!response.ok) {
      return Promise.reject(new Error(`Gagal HTTP! Status: ${response.status}`));
    }

    const json = await response.json();
    const rawList: RawValorantAgent[] = json.data ?? [];

    // Menggunakan rantai .then() untuk mentransformasi data
    const agentPromises = rawList.slice(0, 8).map((raw) =>
      parseAgentData(raw).then((agent) => agent)
    );

    return await Promise.all(agentPromises);
  } catch (error) {
    console.error('[API Error]:', error);
    return Promise.reject(error);
  }
}