
import { useLeague } from '@/context/useLeague';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, LogOut, RotateCcw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function Admin() {
  const { resetSeason, logout, players, deletePlayer } = useLeague();
  const { toast } = useToast();

  const handleResetSeason = () => {
    if (confirm('¿Estás seguro de resetear la temporada? Esto borrará todos los partidos pero mantendrá la lista de jugadores.')) {
      resetSeason();
      toast({ title: 'Temporada reseteada', description: 'Todos los partidos han sido eliminados' });
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Sesión cerrada', description: 'Has salido del modo administrador' });
  };

  // Nueva función para borrar todos los jugadores
  const handleDeleteAllPlayers = async () => {
    if (players.length === 0) {
      toast({ title: 'No hay jugadores', description: 'No hay jugadores para borrar.' });
      return;
    }
    if (confirm('¿Estás seguro de borrar TODOS los jugadores? Esta acción eliminará todos los jugadores y los removerá de todos los partidos. ¡No se puede deshacer!')) {
      for (const player of players) {
        await deletePlayer(player.id);
      }
      toast({ title: 'Jugadores eliminados', description: 'Todos los jugadores han sido eliminados.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Panel de Administrador
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Resetear Temporada
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Elimina todos los partidos registrados pero mantiene la lista de jugadores.
              Esta acción no se puede deshacer.
            </p>
            <Button
              variant="destructive"
              onClick={handleResetSeason}
              className="w-full"
            >
              Resetear Temporada
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Trash2 className="h-5 w-5" />
              Borrar Todos los Jugadores
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Elimina todos los jugadores y los remueve de todos los partidos. Esta acción no se puede deshacer.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAllPlayers}
              className="w-full"
            >
              Borrar Todos los Jugadores
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <LogOut className="h-5 w-5" />
              Salir del Modo Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Cierra la sesión de administrador y regresa al modo usuario normal.
            </p>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full"
            >
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}