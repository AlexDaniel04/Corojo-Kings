import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LeagueProvider } from "@/context/LeagueContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import RegisterMatch from "@/pages/RegisterMatch";
import WallOfFame from "@/pages/WallOfFame";
import ProgressCharts from "@/pages/ProgressCharts";
import PlayerCompare from "@/pages/PlayerCompare";
import IdealPartner from "@/pages/IdealPartner";
import PlayerCards from "@/pages/PlayerCards";
import Players from "@/pages/Players";
import Admin from "@/pages/Admin";
import MatchManagement from "@/pages/MatchManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LeagueProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/registrar" element={<RegisterMatch />} />
              <Route path="/muro" element={<WallOfFame />} />
              <Route path="/graficos" element={<ProgressCharts />} />
              <Route path="/comparar" element={<PlayerCompare />} />
              <Route path="/socio" element={<IdealPartner />} />
              <Route path="/jugadores" element={<PlayerCards />} />
              <Route path="/admin/jugadores" element={<Players />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/partidos" element={<MatchManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LeagueProvider>
    </TooltipProvider>
    <Analytics />
  </QueryClientProvider>
);

export default App;
