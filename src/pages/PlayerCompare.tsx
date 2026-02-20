import { useState } from 'react';
import { useLeague } from '@/context/useLeague';
import { getPlayerStats } from '@/lib/stats';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Swords, Zap, Check, ChevronsUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function PlayerCompare() {
    const [showVsDialog, setShowVsDialog] = useState(false);
    const [loadingVs, setLoadingVs] = useState(false);
  const { players, matches, filterMode } = useLeague();
  // Paginación para el selector de jugadores
  const [playerPage1, setPlayerPage1] = useState(1);
  const [playerPage2, setPlayerPage2] = useState(1);
  const playersPerPage = 5;
  const totalPlayerPages = Math.ceil(players.length / playersPerPage);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const filteredPlayers1 = players.filter(p => p.name.toLowerCase().includes(search1.toLowerCase()));
  const filteredPlayers2 = players.filter(p => p.name.toLowerCase().includes(search2.toLowerCase()));

  const paginatedPlayers1 = filteredPlayers1.slice((playerPage1 - 1) * playersPerPage, playerPage1 * playersPerPage);
  const paginatedPlayers2 = filteredPlayers2.slice((playerPage2 - 1) * playersPerPage, playerPage2 * playersPerPage);
  const stats = getPlayerStats(players, matches, filterMode);
  const [player1, setPlayer1] = useState<string>('');
  const [player2, setPlayer2] = useState<string>('');
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  const p1 = stats.find(s => s.playerId === player1);
  const p2 = stats.find(s => s.playerId === player2);

  const categories = p1 && p2
    ? [
        { name: 'Goles', a: p1.goals, b: p2.goals },
        { name: 'Goles Solo', a: p1.soloGoals, b: p2.soloGoals },
        { name: 'Asistencias', a: p1.assists, b: p2.assists },
        { name: 'Puntos', a: p1.points, b: p2.points },
        { name: 'Victorias', a: p1.wins, b: p2.wins },
        { name: 'Partidos', a: p1.matchesPlayed, b: p2.matchesPlayed },
      ]
    : [];

  // Cálculo de probabilidad 1vs1
  let prob1 = 0, prob2 = 0;
  if (p1 && p2) {
    // Pesos: goles 40%, goles solo 30%, victorias 30%
    const totalGoles = p1.goals + p2.goals;
    const totalSolo = p1.soloGoals + p2.soloGoals;
    const totalWins = p1.wins + p2.wins;
    prob1 =
      (totalGoles > 0 ? (p1.goals / totalGoles) * 0.4 : 0.2) +
      (totalSolo > 0 ? (p1.soloGoals / totalSolo) * 0.3 : 0.15) +
      (totalWins > 0 ? (p1.wins / totalWins) * 0.3 : 0.15);
    prob2 = 1 - prob1;
    prob1 = Math.round(prob1 * 100);
    prob2 = 100 - prob1;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Swords className="h-8 w-8 text-primary" />
          Comparar Jugadores
        </h2>
        <p className="text-muted-foreground">Elige dos jugadores para ver quién domina</p>
      </div>

      {/* VS Layout */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
        {/* Player 1 Selector */}
        <Card className="glass-card w-full max-w-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg">Jugador 1</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={open1} onOpenChange={setOpen1}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open1}
                  className="w-full justify-between"
                >
                  {player1
                    ? players.find((p) => p.id === player1)?.name
                    : "Seleccionar jugador..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar jugador..." value={search1} onValueChange={setSearch1} />
                  <CommandList>
                    <CommandEmpty>No se encontró jugador.</CommandEmpty>
                    <CommandGroup>
                      {paginatedPlayers1.map((player) => (
                        <CommandItem
                          key={player.id}
                          value={player.name}
                          onSelect={() => {
                            setPlayer1(player.id === player1 ? "" : player.id);
                            setOpen1(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              player1 === player.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {player.name}
                        </CommandItem>
                      ))}
                      {/* Controles de paginación */}
                      {Math.ceil(filteredPlayers1.length / playersPerPage) > 1 && (
                        <div className="flex items-center justify-between px-2 py-1 mt-2">
                          <button
                            className="text-xs px-2 py-1 rounded bg-muted hover:bg-accent disabled:opacity-50"
                            onClick={() => setPlayerPage1(p => Math.max(1, p - 1))}
                            disabled={playerPage1 === 1}
                          >Anterior</button>
                          <span className="text-xs text-muted-foreground">Página {playerPage1} de {Math.max(1, Math.ceil(filteredPlayers1.length / playersPerPage))}</span>
                          <button
                            className="text-xs px-2 py-1 rounded bg-muted hover:bg-accent disabled:opacity-50"
                            onClick={() => setPlayerPage1(p => Math.min(Math.ceil(filteredPlayers1.length / playersPerPage), p + 1))}
                            disabled={playerPage1 === Math.ceil(filteredPlayers1.length / playersPerPage)}
                          >Siguiente</button>
                        </div>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {p1 && (
              <div className="mt-4 text-center">
                <div className="font-semibold">{p1.name}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* VS */}
        <div className="flex flex-col items-center md:my-8">
          <div className="text-4xl md:text-6xl font-black text-primary animate-pulse">VS</div>
          <Zap className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 mt-2 animate-bounce" />
        </div>

        {/* Player 2 Selector */}
        <Card className="glass-card w-full max-w-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg">Jugador 2</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={open2} onOpenChange={setOpen2}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open2}
                  className="w-full justify-between"
                >
                  {player2
                    ? players.find((p) => p.id === player2)?.name
                    : "Seleccionar jugador..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar jugador..." value={search2} onValueChange={setSearch2} />
                  <CommandList>
                    <CommandEmpty>No se encontró jugador.</CommandEmpty>
                    <CommandGroup>
                      {paginatedPlayers2.map((player) => (
                        <CommandItem
                          key={player.id}
                          value={player.name}
                          onSelect={() => {
                            setPlayer2(player.id === player2 ? "" : player.id);
                            setOpen2(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              player2 === player.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {player.name}
                        </CommandItem>
                      ))}
                      {/* Controles de paginación */}
                      {Math.ceil(filteredPlayers2.length / playersPerPage) > 1 && (
                        <div className="flex items-center justify-between px-2 py-1 mt-2">
                          <button
                            className="text-xs px-2 py-1 rounded bg-muted hover:bg-accent disabled:opacity-50"
                            onClick={() => setPlayerPage2(p => Math.max(1, p - 1))}
                            disabled={playerPage2 === 1}
                          >Anterior</button>
                          <span className="text-xs text-muted-foreground">Página {playerPage2} de {Math.max(1, Math.ceil(filteredPlayers2.length / playersPerPage))}</span>
                          <button
                            className="text-xs px-2 py-1 rounded bg-muted hover:bg-accent disabled:opacity-50"
                            onClick={() => setPlayerPage2(p => Math.min(Math.ceil(filteredPlayers2.length / playersPerPage), p + 1))}
                            disabled={playerPage2 === Math.ceil(filteredPlayers2.length / playersPerPage)}
                          >Siguiente</button>
                        </div>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {p2 && (
              <div className="mt-4 text-center">
                <div className="font-semibold">{p2.name}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Botón y diálogo VS 1vs1 */}
      {p1 && p2 && (
        <div className="flex flex-col items-center gap-6 my-8">
          <Button
            className="px-6 py-3 font-bold shadow-lg bg-gradient-to-r from-mint to-lavender hover:from-lavender hover:to-mint transition-all duration-300"
            onClick={() => {
              setLoadingVs(true);
              setTimeout(() => {
                setLoadingVs(false);
                setShowVsDialog(true);
              }, 1000);
            }}
            disabled={loadingVs}
          >
            Calcular ganador 1 vs 1
          </Button>
          {loadingVs && (
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden relative">
              <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-mint to-lavender animate-pulse" style={{ width: '100%' }} />
            </div>
          )}
          <Dialog open={showVsDialog} onOpenChange={setShowVsDialog}>
            <DialogContent className="max-w-lg glass-card-strong animate-fade-in-up">
              <DialogHeader>
                <DialogTitle className="flex flex-col items-center gap-4">
                  <span className="flex flex-row items-center gap-2 whitespace-nowrap text-xl md:text-2xl font-black">
                    <span className="max-w-[10rem] md:max-w-[16rem] truncate">{p1.name}</span>
                    <span className="text-primary mx-2 md:mx-4 font-black text-2xl md:text-3xl">VS</span>
                    <span className="max-w-[10rem] md:max-w-[16rem] truncate">{p2.name}</span>
                  </span>
                  <div className="flex justify-center gap-8 mt-2">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl md:text-3xl font-bold text-mint animate-bounce">{prob1}%</span>
                      <span className="text-xs text-muted-foreground">Prob. de ganar</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl md:text-3xl font-bold text-lavender animate-bounce">{prob2}%</span>
                      <span className="text-xs text-muted-foreground">Prob. de ganar</span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Comparison Results (sin probabilidad VS) */}
      {p1 && p2 && (
        <Card className="glass-card-strong max-w-4xl mx-auto shadow-2xl animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-center text-lg md:text-xl flex flex-col gap-2">
              <span>
                <span className={categories.every(cat => cat.a > cat.b) ? 'winner-glow' : ''}>{p1.name}</span>
                <span className="text-primary mx-2 md:mx-4">⚔️</span>
                <span className={categories.every(cat => cat.b > cat.a) ? 'winner-glow' : ''}>{p2.name}</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 md:space-y-6">
              {categories.map(cat => {
                const aWins = cat.a > cat.b;
                const bWins = cat.b > cat.a;
                const tie = cat.a === cat.b;
                // Lógica de dirección de ola y partícula
                const mintBarClass = aWins ? 'bar-wave-effect bar-winner wave-bar-left' : 'bar-static-loser';
                const lavenderBarClass = bWins ? 'bar-wave-effect bar-winner wave-bar-right' : 'bar-static-loser';
                const mintBarWidth = cat.a + cat.b > 0 ? Math.max((cat.a / (cat.a + cat.b)) * 100, 4) : 4;
                const lavenderBarWidth = cat.a + cat.b > 0 ? Math.max((cat.b / (cat.a + cat.b)) * 100, 4) : 4;
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold text-base md:text-lg ${aWins ? 'text-mint-foreground' : tie ? 'text-muted-foreground' : 'text-muted-foreground'}`}> 
                        {cat.a}
                      </span>
                      <span className="text-xs md:text-sm font-medium text-center px-2 md:px-4">{cat.name}</span>
                      <span className={`font-bold text-base md:text-lg ${bWins ? 'text-lavender-foreground' : tie ? 'text-muted-foreground' : 'text-muted-foreground'}`}> 
                        {cat.b}
                      </span>
                    </div>
                    <div className="flex h-3 md:h-4 rounded-full overflow-hidden bg-muted relative">
                      {/* Barra izquierda (mint) */}
                      <div
                        id={`mint-bar-${cat.name}`}
                        className={`bg-mint ${mintBarClass}`}
                        style={{
                          width: `calc(${mintBarWidth}% - 2px)`,
                          minWidth: '24px',
                          height: '20px',
                          borderRadius: '8px',
                          margin: '2px 0',
                          boxShadow: aWins ? '0 0 24px 8px #5eead4cc, 0 0 32px 12px #fff8' : 'none',
                          zIndex: 2,
                          opacity: aWins ? 1 : 0.5,
                          position: 'relative',
                          transition: 'width 0.5s',
                        }}
                      >
                        {/* Partícula en la punta si mint gana */}
                        {aWins && (
                          <span
                            className="bar-tip"
                            style={{
                              right: '-9px',
                              left: 'auto',
                              position: 'absolute',
                            }}
                          />
                        )}
                      </div>
                      {/* Barra derecha (lavender) */}
                      <div
                        id={`lavender-bar-${cat.name}`}
                        className={`bg-lavender ${lavenderBarClass}`}
                        style={{
                          width: `calc(${lavenderBarWidth}% - 2px)`,
                          minWidth: '24px',
                          height: '20px',
                          borderRadius: '8px',
                          margin: '2px 0',
                          boxShadow: bWins ? '0 0 24px 8px #a78bfa99, 0 0 32px 12px #fff8' : 'none',
                          zIndex: 2,
                          opacity: bWins ? 1 : 0.5,
                          position: 'relative',
                          transition: 'width 0.5s',
                        }}
                      >
                        {/* Partícula en la punta si lavender gana */}
                        {bWins && (
                          <span
                            className="bar-tip"
                            style={{
                              left: '-9px',
                              right: 'auto',
                              position: 'absolute',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 pt-4 md:pt-6 text-xs md:text-sm">
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 md:w-4 md:h-4 rounded bg-mint animate-fade-in-up" />
                {p1.name}
              </span>
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 md:w-4 md:h-4 rounded bg-lavender animate-fade-in-up" />
                {p2.name}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
