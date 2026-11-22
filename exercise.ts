type Role = 'Duelist' | 'Sentinel' | 'Controller';

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

players.map((player) => {
  console.log(`${player.name} - ${getPerformance(player.kd)}`);
});

let index: number = 0;

while (index < players.length) {
  console.log(`Player ${index + 1}: ${players[index].name}`);
  index++;
}
