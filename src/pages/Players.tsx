import { useState } from 'react';
import { useLeague } from '@/context/useLeague';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trash2, Edit, Plus, Users, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Players() {
  const { players, addPlayer, updatePlayer, deletePlayer, loading } = useLeague();
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
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Gestión de Jugadores
            </h2>
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
        {players.map((player) => (
          <Card key={player.id} className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.name} className="object-cover w-full h-full rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-purple-700">
                      {player.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-lg">{player.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPlayer(player.id)}
                  className="flex-1 gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePlayer(player.id)}
                  className="gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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