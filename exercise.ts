type Role = 'Duelist' | 'Sentinel' | 'Controller' | 'Initiator';

interface PlayerScore {
  name: string;
  kd: number;
  role: Role;
}

const players: PlayerScore[] = [
  { name: 'Koyok', kd: 1.42, role: 'Duelist' },
  { name: 'Reno', kd: 1.10, role: 'Sentinel' },
  { name: 'Aeng', kd: 0.91, role: 'Controller' },
];

function getPerformance(kd: number): string {
  if (kd >= 1.3) {
    return 'Strong';
  } else if (kd >= 1.0) {
    return 'Good';
  }
  return 'Needs Improvement';
}

players
  .map((player) => ({
    name: player.name,
    performance: getPerformance(player.kd),
  }))
  .forEach((player) => {
    console.log(`${player.name} - ${player.performance}`);
  });

let index: number = 0;
while (index < players.length) {
  console.log(`Player ${index + 1}: ${players[index].name}`);
  index++;
}
