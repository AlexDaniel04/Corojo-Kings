import { useState } from 'react';
import { useLeague } from '@/context/useLeague';
import { getIdealPartner } from '@/lib/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Handshake, Trophy, Check, ChevronsUpDown, Users } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function IdealPartner() {
  const { players, matches } = useLeague();
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id || '');
  const [open, setOpen] = useState(false);
  const partners = getIdealPartner(selectedPlayer, players, matches);
  const selectedP = players.find(p => p.id === selectedPlayer);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Handshake className="h-6 w-6 text-primary" />
        El Socio Ideal
      </h2>
      <p className="text-sm text-muted-foreground">
        ¿Con quién ganas más? Basado en victorias compartidas.
      </p>

      {/* Player selector */}
      <Card className="glass-card max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seleccionar Jugador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedPlayer
                  ? players.find((p) => p.id === selectedPlayer)?.name
                  : "Seleccionar jugador..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar jugador..." />
                <CommandList>
                  <CommandEmpty>No se encontró jugador.</CommandEmpty>
                  <CommandGroup>
                    {players.map((player) => (
                      <CommandItem
                        key={player.id}
                        value={player.name}
                        onSelect={() => {
                          setSelectedPlayer(player.id === selectedPlayer ? "" : player.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedPlayer === player.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {player.emoji} {player.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Initial content when no player selected */}
      {!selectedPlayer && (
        <Card className="glass-card">
          <CardContent className="text-center py-8">
            <Handshake className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Descubre tu Socio Ideal</h3>
            <p className="text-muted-foreground">
              Selecciona un jugador arriba para ver con quién tiene mejor porcentaje de victorias jugando juntos.
              El análisis se basa en partidos compartidos y victorias conjuntas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {selectedP && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Socios de {selectedP.emoji} {selectedP.name}
          </h3>
          {partners.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">
                  {selectedP.name} necesita al menos 2 partidos con otros jugadores para calcular el socio ideal.
                </p>
              </CardContent>
            </Card>
          ) : (
            partners.map((p, i) => (
              <Card
                key={p.partnerId}
                className={`glass-card transition-all hover:scale-[1.01] ${
                  i === 0 ? 'gold-highlight' : ''
                }`}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold flex items-center gap-1.5">
                        {p.partnerName}
                        {i === 0 && <Trophy className="h-4 w-4 text-gold" />}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.wins}V / {p.gamesPlayed}PJ juntos
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    p.winRate >= 70 ? 'text-mint-foreground' : p.winRate >= 50 ? 'text-sky-foreground' : 'text-muted-foreground'
                  }`}>
                    {p.winRate}%
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
