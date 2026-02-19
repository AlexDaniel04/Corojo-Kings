import { useState } from 'react';
import { useLeague } from '@/context/useLeague';
import { getCumulativeData } from '@/lib/stats';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, Trophy, TrendingUp } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = [
  '#6ee7b7', '#c4b5fd', '#7dd3fc', '#fbbf24', '#f87171',
  '#34d399', '#a78bfa', '#38bdf8', '#fb923c', '#e879f9',
  '#2dd4bf', '#818cf8', '#22d3ee',
];

export default function ProgressCharts() {

  const { players, matches, filterMode, setFilterMode } = useLeague();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(players.length > 0 ? [players[0].name] : []);
  const [open, setOpen] = useState(false);
  // Paginación para el selector de jugadores
  const [playerPage, setPlayerPage] = useState(1);
  const playersPerPage = 5;
  const totalPlayerPages = Math.ceil(players.length / playersPerPage);
  const paginatedPlayers = players.slice((playerPage - 1) * playersPerPage, playerPage * playersPerPage);

  const goalsData = getCumulativeData(players, matches, filterMode, 'goals');
  const assistsData = getCumulativeData(players, matches, filterMode, 'assists');
  const soloGoalsData = getCumulativeData(players, matches, filterMode, 'soloGoals');

  const formatDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Progreso
        </h2>
        <div className="glass-card flex p-1 gap-1">
          <button
            onClick={() => setFilterMode('full')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filterMode === 'full' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'
            }`}
          >
            Temporada
          </button>
          <button
            onClick={() => setFilterMode('last5')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filterMode === 'last5' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'
            }`}
          >
            Últimos 5
          </button>
        </div>
      </div>

      {/* Player Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Seleccionar Jugadores:</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[300px] justify-between"
            >
              {selectedPlayers.length > 0
                ? `${selectedPlayers.length} jugador${selectedPlayers.length > 1 ? 'es' : ''} seleccionado${selectedPlayers.length > 1 ? 's' : ''}`
                : "Seleccionar jugadores..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Buscar jugador..." />
              <CommandList>
                <CommandEmpty>No se encontró jugador.</CommandEmpty>
                <CommandGroup>
                  {paginatedPlayers.map((player) => (
                    <CommandItem
                      key={player.id}
                      value={player.name}
                      onSelect={() => {
                        setSelectedPlayers(prev =>
                          prev.includes(player.name)
                            ? prev.filter(name => name !== player.name)
                            : [...prev, player.name]
                        );
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedPlayers.includes(player.name) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {player.name}
                    </CommandItem>
                  ))}
                  {/* Controles de paginación */}
                  {totalPlayerPages > 1 && (
                    <div className="flex items-center justify-between px-2 py-1 mt-2">
                      <button
                        className="text-xs px-2 py-1 rounded bg-muted hover:bg-accent disabled:opacity-50"
                        onClick={() => setPlayerPage(p => Math.max(1, p - 1))}
                        disabled={playerPage === 1}
                      >Anterior</button>
                      <span className="text-xs text-muted-foreground">Página {playerPage} de {totalPlayerPages}</span>
                      <button
                        className="text-xs px-2 py-1 rounded bg-muted hover:bg-accent disabled:opacity-50"
                        onClick={() => setPlayerPage(p => Math.min(totalPlayerPages, p + 1))}
                        disabled={playerPage === totalPlayerPages}
                      >Siguiente</button>
                    </div>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedPlayers.length === 0 && (
        <p className="text-sm text-muted-foreground">Selecciona al menos un jugador para ver los gráficos.</p>
      )}

      {/* Goals Chart */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Goles Acumulados
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={goalsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={formatDate}
            />
            {selectedPlayers.length > 0 && players.filter(p => selectedPlayers.includes(p.name)).map((p, i) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Assists Chart */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Asistencias Acumuladas
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={assistsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={formatDate}
            />
            {selectedPlayers.length > 0 && players.filter(p => selectedPlayers.includes(p.name)).map((p, i) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Solo Goals Chart */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Goles Solo Acumulados
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={soloGoalsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={formatDate}
            />
            {selectedPlayers.length > 0 && players.filter(p => selectedPlayers.includes(p.name)).map((p, i) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={p.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
