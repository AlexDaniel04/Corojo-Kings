import { useState } from 'react';
import { useLeague } from '@/context/useLeague';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlayerCard } from '@/components/PlayerCard';
import { Trash2, Edit, Plus, Users, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Players() {
  const { players, addPlayer, updatePlayer, deletePlayer, loading } = useLeague();
  // Paginación de jugadores
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;
  const totalPages = Math.ceil(players.length / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const endIndex = startIndex + playersPerPage;
  const paginatedPlayers = players.slice(startIndex, endIndex);
  console.log('Admin players:', players);
  const { toast } = useToast();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhoto, setNewPlayerPhoto] = useState('');
  const [newPlayerPhotoFile, setNewPlayerPhotoFile] = useState<File | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleFileSelect = (file: File | null, isEdit: boolean = false) => {
    if (!file) {
      if (isEdit) {
        setEditPhotoFile(null);
        setEditPhoto('');
      } else {
        setNewPlayerPhotoFile(null);
        setNewPlayerPhoto('');
      }
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Solo se permiten archivos de imagen', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'La imagen no puede superar los 5MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (isEdit) {
        setEditPhotoFile(file);
        setEditPhoto(result);
      } else {
        setNewPlayerPhotoFile(file);
        setNewPlayerPhoto(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast({ title: 'Error', description: 'El nombre es obligatorio', variant: 'destructive' });
      return;
    }
    addPlayer({ name: newPlayerName.trim(), avatar: newPlayerPhoto || undefined, stats: { goals: 0, assists: 0, wins: 0, losses: 0, streak: 0 } });
    setNewPlayerName('');
    setNewPlayerPhoto('');
    setNewPlayerPhotoFile(null);
    setAddDialogOpen(false);
    toast({ title: 'Jugador añadido', description: `${newPlayerName} ha sido añadido a la liga` });
  };

  const handleEditPlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (player) {
      setEditingPlayer(id);
      setEditName(player.name);
      setEditPhoto(player.avatar || '');
      setEditPhotoFile(null);
      setEditDialogOpen(true);
    }
  };

  const handleUpdatePlayer = () => {
    if (!editingPlayer || !editName.trim()) {
      toast({ title: 'Error', description: 'El nombre es obligatorio', variant: 'destructive' });
      return;
    }
    updatePlayer(editingPlayer, { name: editName.trim(), avatar: editPhoto || undefined });
    setEditingPlayer(null);
    setEditName('');
    setEditPhoto('');
    setEditPhotoFile(null);
    setEditDialogOpen(false);
    toast({ title: 'Jugador actualizado', description: 'Los cambios han sido guardados' });
  };

  const handleDeletePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (player && confirm(`¿Estás seguro de eliminar a ${player.name}? Esto también lo removerá de todos los partidos.`)) {
      deletePlayer(id);
      toast({ title: 'Jugador eliminado', description: `${player.name} ha sido removido de la liga` });
    }
  };

  // Estado para controlar qué jugador está expandido
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando jugadores...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Gestión de Jugadores
              </h2>
              <span className="text-sm text-muted-foreground">Total de jugadores: <b>{players.length}</b></span>
            </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Añadir Jugador
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-sm">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Jugador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre del jugador"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
              </div>
              <div>
                <Label>Foto (opcional)</Label>
                <div className="space-y-2">
                  {/* File Input */}
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                      className="hidden"
                      id="photo-file"
                    />
                    <Label
                      htmlFor="photo-file"
                      className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {newPlayerPhotoFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                        </span>
                      </div>
                    </Label>
                  </div>

                  {/* Preview */}
                  {newPlayerPhoto && (
                    <div className="relative inline-block">
                      <img
                        src={newPlayerPhoto}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => handleFileSelect(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Alternative: URL input */}
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">o</span>
                  </div>
                  <Input
                    placeholder="URL de la foto (opcional)"
                    value={newPlayerPhoto}
                    onChange={(e) => {
                      setNewPlayerPhoto(e.target.value);
                      setNewPlayerPhotoFile(null);
                    }}
                  />
                </div>
              </div>
              <Button onClick={handleAddPlayer} className="w-full">
                Añadir Jugador
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedPlayers.map((player) => {
          const isExpanded = expandedPlayerId === player.id;
          return (
            <div key={player.id} className="relative">
              <div
                onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                style={{ cursor: 'pointer' }}
              >
                <PlayerCard
                  player={player}
                  showExpanded={isExpanded}
                  goals={player.stats?.goals ?? 0}
                  assists={player.stats?.assists ?? 0}
                  soloGoals={0}
                  wins={player.stats?.wins ?? 0}
                  losses={player.stats?.losses ?? 0}
                />
              </div>
              {/* Botones de acción solo visibles cuando está expandido */}
              {isExpanded && (
                <div className="flex gap-2 mt-4 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleEditPlayer(player.id); }}
                    className="flex-1 gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleDeletePlayer(player.id); }}
                    className="gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-muted text-foreground border border-border disabled:opacity-50"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >Anterior</button>
          <span className="px-2">Página {currentPage} de {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-muted text-foreground border border-border disabled:opacity-50"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >Siguiente</button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass-card max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Jugador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                placeholder="Nombre del jugador"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdatePlayer()}
              />
            </div>
            <div>
              <Label>Foto (opcional)</Label>
              <div className="space-y-2">
                {/* File Input */}
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null, true)}
                    className="hidden"
                    id="edit-photo-file"
                  />
                  <Label
                    htmlFor="edit-photo-file"
                    className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {editPhotoFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                      </span>
                    </div>
                  </Label>
                </div>

                {/* Preview */}
                {editPhoto && (
                  <div className="relative inline-block">
                    <img
                      src={editPhoto}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => handleFileSelect(null, true)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Alternative: URL input */}
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">o</span>
                </div>
                <Input
                  placeholder="URL de la foto (opcional)"
                  value={editPhoto}
                  onChange={(e) => {
                    setEditPhoto(e.target.value);
                    setEditPhotoFile(null);
                  }}
                />
              </div>
            </div>
            <Button onClick={handleUpdatePlayer} className="w-full">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}