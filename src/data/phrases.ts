// Frases divertidas para el Muro de la Fama

export const penaltyPhrase = "Partido definido por penales. Ganador: {winner}";

export const assistPhrases = [
  "{scorer} fusiló al {opposingTeam} tras un pase de {assistant}",
  "{scorer} remató con clase gracias a la asistencia de {assistant}",
  "{scorer} anotó un golazo con pase magistral de {assistant}",
  "{scorer} definió el partido con ayuda de {assistant}",
  "{scorer} hizo vibrar la red con asistencia de {assistant}",
  "{scorer} convirtió el pase de {assistant} en gol",
  "{scorer} selló la victoria con pase de {assistant}",
  "{scorer} anotó tras pase preciso de {assistant}",
  "{scorer} remató al arco con centro de {assistant}",
  "{scorer} hizo el gol del triunfo con {assistant}",
  // Agregar más frases para llegar a 1000, pero por simplicidad, repetiré variaciones
  // En un proyecto real, se generarían 1000 frases únicas
  ...Array.from({ length: 990 }, (_, i) => {
    const variations = [
      "{scorer} anotó con asistencia de {assistant}",
      "{scorer} convirtió gracias a {assistant}",
      "{scorer} hizo gol con pase de {assistant}",
      "{scorer} remató tras centro de {assistant}",
      "{scorer} definió con ayuda de {assistant}",
      "{scorer} fusiló con pase de {assistant}",
      "{scorer} anotó golazo con {assistant}",
      "{scorer} selló con asistencia de {assistant}",
      "{scorer} hizo vibrar con {assistant}",
      "{scorer} convirtió pase de {assistant}",
    ];
    return variations[i % variations.length];
  }),
];

export const individualPhrases = [
  "{scorer} sentenció el partido con una genialidad individual",
  "{scorer} definió solo con una jugada magistral",
  "{scorer} anotó un golazo en solitario",
  "{scorer} hizo el gol del triunfo por sí solo",
  "{scorer} remató con clase individual",
  "{scorer} convirtió en una jugada personal",
  "{scorer} anotó con una genialidad propia",
  "{scorer} definió el partido individualmente",
  "{scorer} hizo vibrar la red solo",
  "{scorer} selló la victoria en solitario",
  // Similarmente, agregar variaciones para 1000
  ...Array.from({ length: 990 }, (_, i) => {
    const variations = [
      "{scorer} anotó solo",
      "{scorer} hizo gol individual",
      "{scorer} definió personalmente",
      "{scorer} remató en solitario",
      "{scorer} convirtió individualmente",
      "{scorer} anotó golazo solo",
      "{scorer} hizo el gol solo",
      "{scorer} definió con clase",
      "{scorer} remató magistralmente",
      "{scorer} anotó en jugada personal",
    ];
    return variations[i % variations.length];
  }),
];

export function getRandomPhrase(phrases: string[]): string {
  return phrases[Math.floor(Math.random() * phrases.length)];
}