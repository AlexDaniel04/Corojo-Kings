import { supabase } from '@/lib/supabase';

// Jugadores de ejemplo
const players = [
  { id: 'p1', name: 'Juan Pérez' },
  { id: 'p2', name: 'Carlos Gómez' },
  { id: 'p3', name: 'Luis Martínez' },
  { id: 'p4', name: 'Miguel Torres' },
  { id: 'p5', name: 'Andrés Ramírez' },
  { id: 'p6', name: 'Sergio Díaz' },
  { id: 'p7', name: 'David Herrera' },
  { id: 'p8', name: 'Jorge Castro' },
  { id: 'p9', name: 'Pedro Morales' },
  { id: 'p10', name: 'Manuel Ruiz' },
  { id: 'p11', name: 'Alejandro Vargas' },
  { id: 'p12', name: 'Ricardo Flores' },
  { id: 'p13', name: 'Fernando Soto' },
  { id: 'p14', name: 'Héctor Silva' },
  { id: 'p15', name: 'Oscar Ramos' },
  { id: 'p16', name: 'Pablo Romero' },
  { id: 'p17', name: 'Iván Mendoza' },
  { id: 'p18', name: 'Adrián Ortega' },
  { id: 'p19', name: 'Mario Delgado' },
  { id: 'p20', name: 'Julián Navarro' },
];

// Partidos de ejemplo (gol gana, 18 de febrero de 2026)
const matches = [];
const date = '2026-02-18';
for (let i = 0; i < 20; i++) {
  const teamA = [];
  const teamB = [];
  for (let j = 0; j < 5; j++) {
    teamA.push(players[(i + j) % 20].id);
    teamB.push(players[(i + j + 5) % 20].id);
  }
  const scorer = teamA[0];
  const assistant = teamA[1];
  matches.push({
    id: `m${i + 1}`,
    date,
    teamA,
    teamB,
    scoreA: 1,
    scoreB: 0,
    winner: 'A',
    isPenalties: false,
    stats: {
      [scorer]: { goals: 1, assists: 0, individualPlay: false },
      [assistant]: { goals: 0, assists: 1, individualPlay: false },
      ...Object.fromEntries(
        [...teamA, ...teamB].filter(pid => pid !== scorer && pid !== assistant).map(pid => [pid, { goals: 0, assists: 0, individualPlay: false }])
      )
    }
  });
}

async function insertPlayers() {
  for (const player of players) {
    await supabase.from('players').upsert({
      id: player.id,
      name: player.name
    });
  }
  console.log('Jugadores insertados');
}

async function insertMatches() {
  for (const match of matches) {
    await supabase.from('matches').upsert({
      id: match.id,
      date: match.date,
      teamA: match.teamA,
      teamB: match.teamB,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      winner: match.winner,
      isPenalties: match.isPenalties,
      stats: match.stats
    });
  }
  console.log('Partidos insertados');
}

async function main() {
  await insertPlayers();
  await insertMatches();
  console.log('Carga de datos de ejemplo completada');
}

main();
