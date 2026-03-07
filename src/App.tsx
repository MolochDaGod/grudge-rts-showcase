import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ErrorBoundary } from "@/components/error-boundary";
import ProtectedRoute from "@/components/protected-route";
import GlobalNavigation from "@/components/global-navigation";

// Auth pages (public)
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";

// Public pages
import Home from "@/pages/home";
import Store from "@/pages/store";
import Advantage from "@/pages/advantage";
import SuperEngine from "@/pages/super-engine";
import TowerDefense from "@/pages/tower-defense";
import Avernus3D from "@/pages/avernus-3d";
import RPGMakerStudio from "@/pages/rpg-maker-studio";
import Yahaha3DWorld from "@/pages/yahaha-3d-world";
import MultiplayerRacing from "@/pages/multiplayer-racing";
import PuzzlePlatformer from "@/pages/puzzle-platformer";
import DecaySurvival from "@/pages/decay-survival";
import OverdriveRacing from "@/pages/overdrive-racing";
import Overdrive3D from "@/pages/overdrive-3d";
import AvernusArena from "@/pages/avernus-arena";
import Wargus from "@/pages/wargus";
import GGEScene from "@/pages/gge-scene";
import NotFound from "@/pages/not-found";

// Protected pages (require auth)
import Scraping from "@/pages/scraping";
import RealAssetBrowser from "@/pages/real-asset-browser";
import RealEngineManager from "@/pages/real-engine-manager";
import GrudgeEditor from "@/pages/grudge-editor";
import EngineLauncher from "@/pages/engine-launcher";
import AssetStore from "@/pages/asset-store";
import CollaborationHub from "@/pages/collaboration-hub";
import AdvancedEngines from "@/pages/advanced-engines";
import AnalyticsDashboard from "@/pages/analytics-dashboard";

function Router() {
  return (
    <Switch>
      {/* Auth pages */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      {/* Public pages */}
      <Route path="/" component={Home} />
      <Route path="/store" component={Store} />
      <Route path="/advantage" component={Advantage} />
      <Route path="/super-engine" component={SuperEngine} />
      <Route path="/tower-defense" component={TowerDefense} />
      <Route path="/avernus-3d" component={Avernus3D} />
      <Route path="/rpg-maker-studio" component={RPGMakerStudio} />
      <Route path="/yahaha-3d-world" component={Yahaha3DWorld} />
      <Route path="/multiplayer-racing" component={MultiplayerRacing} />
      <Route path="/puzzle-platformer" component={PuzzlePlatformer} />
      <Route path="/decay-survival" component={DecaySurvival} />
      <Route path="/overdrive-racing" component={OverdriveRacing} />
      <Route path="/overdrive-3d" component={Overdrive3D} />
      <Route path="/avernus-arena" component={AvernusArena} />
      <Route path="/wargus" component={Wargus} />
      <Route path="/gge-scene" component={GGEScene} />

      {/* Protected pages — require authentication */}
      <Route path="/scraping">
        {() => <ProtectedRoute><Scraping /></ProtectedRoute>}
      </Route>
      <Route path="/real-asset-browser">
        {() => <ProtectedRoute><RealAssetBrowser /></ProtectedRoute>}
      </Route>
      <Route path="/real-engine-manager">
        {() => <ProtectedRoute><RealEngineManager /></ProtectedRoute>}
      </Route>
      <Route path="/grudge-editor">
        {() => <ProtectedRoute><GrudgeEditor /></ProtectedRoute>}
      </Route>
      <Route path="/engine-launcher">
        {() => <ProtectedRoute><EngineLauncher /></ProtectedRoute>}
      </Route>
      <Route path="/asset-store">
        {() => <ProtectedRoute><AssetStore /></ProtectedRoute>}
      </Route>
      <Route path="/collaboration-hub">
        {() => <ProtectedRoute><CollaborationHub /></ProtectedRoute>}
      </Route>
      <Route path="/advanced-engines">
        {() => <ProtectedRoute><AdvancedEngines /></ProtectedRoute>}
      </Route>
      <Route path="/analytics-dashboard">
        {() => <ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <GlobalNavigation />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
