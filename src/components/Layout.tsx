import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Trophy, ClipboardList, Medal, TrendingUp, Swords, Handshake, Users, LogIn, CheckCircle, XCircle, CalendarDays } from 'lucide-react';
import { useLeague } from '@/context/useLeague';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const viewerNavItems = [
  { to: '/', label: 'Ranking', icon: Trophy },
  { to: '/jugadores', label: 'Jugadores', icon: Users },
  { to: '/muro', label: 'Muro', icon: Medal },
  { to: '/graficos', label: 'Gráficos', icon: TrendingUp },
  { to: '/comparar', label: 'Comparar', icon: Swords },
  { to: '/socio', label: 'Socio', icon: Handshake },
];

const adminNavItems = [
  { to: '/registrar', label: 'Registrar', icon: ClipboardList },
  { to: '/admin/jugadores', label: 'Jugadores', icon: Users },
  { to: '/admin/partidos', label: 'Partidos', icon: CalendarDays },
  { to: '/admin', label: 'Admin', icon: LogIn },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAdmin, login } = useLeague();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);

  const handleLogin = () => {
    if (login(password)) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Acceso concedido
          </div>
        ),
        description: 'Ahora puedes registrar partidos'
      });
      setLoginOpen(false);
      setPassword('');
    } else {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            Contraseña incorrecta
          </div>
        ),
        variant: 'destructive'
      });
    }
  };

  const filteredViewerItems = viewerNavItems;
  const filteredAdminItems = isAdmin ? adminNavItems : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card-strong border-b border-border/40">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-gradient">LaLiga Futsal Corojo</span>
          </h1>
          {!isAdmin && (
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-sm">
                <DialogHeader>
                  <DialogTitle>Acceso Administrador</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <Button onClick={handleLogin} className="w-full">
                    Ingresar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-5xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom Nav - Modern Football Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        {/* Football Field Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/15 via-green-800/8 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/3 via-transparent to-green-600/3"></div>

        {/* Main Navigation Bar */}
        <div className="relative glass-card-strong border-t border-border/40 backdrop-blur-xl">
          <div className="container max-w-5xl mx-auto overflow-x-auto scrollbar-hide">
            <div className="flex items-center justify-center gap-0.5 py-1.5 px-4 min-w-max">
              {/* Viewer Tools - Left Side */}
              <div className="flex gap-0.5">
                {filteredViewerItems.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <RouterNavLink
                      key={to}
                      to={to}
                      className={`group relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 min-w-[60px] overflow-hidden ${
                        active
                          ? 'text-white scale-105'
                          : 'text-muted-foreground hover:text-foreground hover:scale-102'
                      }`}
                    >
                      {/* Active Background Effect */}
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-br from-mint/80 via-mint/60 to-mint/40 rounded-lg shadow-inner"></div>
                      )}

                      {/* Hover Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-mint/15 to-lavender/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                        active ? 'opacity-0' : ''
                      }`}></div>

                      {/* Icon */}
                      <div className={`relative z-10 transition-all duration-200 ${
                        active ? 'drop-shadow-sm' : 'group-hover:drop-shadow-sm'
                      }`}>
                        <Icon className={`h-5 w-5 transition-transform duration-200 ${
                          active ? 'scale-105' : 'group-hover:scale-105'
                        }`} />
                      </div>

                      {/* Label */}
                      <span className={`relative z-10 transition-all duration-200 text-[10px] leading-tight ${
                        active ? 'font-semibold' : 'group-hover:font-medium'
                      }`}>
                        {label}
                      </span>

                      {/* Active Indicator Dot */}
                      {active && (
                        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-sm"></div>
                      )}
                    </RouterNavLink>
                  );
                })}
              </div>

              {/* Separator */}
              {filteredAdminItems.length > 0 && (
                <div className="mx-2 h-8 w-px bg-border/30"></div>
              )}

              {/* Admin Tools - Right Side */}
              <div className="flex gap-0.5">
                {filteredAdminItems.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <RouterNavLink
                      key={to}
                      to={to}
                      className={`group relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 min-w-[60px] overflow-hidden ${
                        active
                          ? 'text-white scale-105'
                          : 'text-muted-foreground hover:text-foreground hover:scale-102'
                      }`}
                    >
                      {/* Active Background Effect */}
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 via-orange-400/60 to-orange-300/40 rounded-lg shadow-inner"></div>
                      )}

                      {/* Hover Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/15 to-red-500/15 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                        active ? 'opacity-0' : ''
                      }`}></div>

                      {/* Icon */}
                      <div className={`relative z-10 transition-all duration-200 ${
                        active ? 'drop-shadow-sm' : 'group-hover:drop-shadow-sm'
                      }`}>
                        <Icon className={`h-5 w-5 transition-transform duration-200 ${
                          active ? 'scale-105' : 'group-hover:scale-105'
                        }`} />
                      </div>

                      {/* Label */}
                      <span className={`relative z-10 transition-all duration-200 text-[10px] leading-tight ${
                        active ? 'font-semibold' : 'group-hover:font-medium'
                      }`}>
                        {label}
                      </span>

                      {/* Active Indicator Dot */}
                      {active && (
                        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-sm"></div>
                      )}
                    </RouterNavLink>
                  );
                })}
              </div>
            </div>

            {/* Subtle Field Lines */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/20 to-transparent"></div>
          </div>
        </div>

        {/* Safe Area for Mobile Devices */}
        <div className="h-safe-area-inset-bottom bg-background"></div>
      </nav>
    </div>
  );
}
