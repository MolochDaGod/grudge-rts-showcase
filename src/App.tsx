import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import GlobalNavigation from "@/components/global-navigation";
import Home from "@/pages/home";
import Scraping from "@/pages/scraping";
import Store from "@/pages/store";
import TowerDefense from "@/pages/tower-defense";
import Avernus3D from "@/pages/avernus-3d";
import RPGMakerStudio from "@/pages/rpg-maker-studio";
import Yahaha3DWorld from "@/pages/yahaha-3d-world";
import MultiplayerRacing from "@/pages/multiplayer-racing";
import PuzzlePlatformer from "@/pages/puzzle-platformer";
import RealAssetBrowser from "@/pages/real-asset-browser";
import RealEngineManager from "@/pages/real-engine-manager";
import Advantage from "@/pages/advantage";
import SuperEngine from "@/pages/super-engine";
import GrudgeEditor from "@/pages/grudge-editor";
import EngineLauncher from "@/pages/engine-launcher";
import AssetStore from "@/pages/asset-store";
import CollaborationHub from "@/pages/collaboration-hub";
import AdvancedEngines from "@/pages/advanced-engines";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import DecaySurvival from "@/pages/decay-survival";
import OverdriveRacing from "@/pages/overdrive-racing";
import Overdrive3D from "@/pages/overdrive-3d";
import AvernusArena from "@/pages/avernus-arena";
import Wargus from "@/pages/wargus";
import GGEScene from "@/pages/gge-scene";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/scraping" component={Scraping} />
      <Route path="/store" component={Store} />
      <Route path="/tower-defense" component={TowerDefense} />
      <Route path="/avernus-3d" component={Avernus3D} />
      <Route path="/rpg-maker-studio" component={RPGMakerStudio} />
      <Route path="/yahaha-3d-world" component={Yahaha3DWorld} />
      <Route path="/multiplayer-racing" component={MultiplayerRacing} />
      <Route path="/puzzle-platformer" component={PuzzlePlatformer} />
      <Route path="/real-asset-browser" component={RealAssetBrowser} />
      <Route path="/real-engine-manager" component={RealEngineManager} />
      <Route path="/advantage" component={Advantage} />
      <Route path="/super-engine" component={SuperEngine} />
      <Route path="/grudge-editor" component={GrudgeEditor} />
      <Route path="/engine-launcher" component={EngineLauncher} />
      <Route path="/asset-store" component={AssetStore} />
      <Route path="/collaboration-hub" component={CollaborationHub} />
      <Route path="/advanced-engines" component={AdvancedEngines} />
      <Route path="/analytics-dashboard" component={AnalyticsDashboard} />
      <Route path="/decay-survival" component={DecaySurvival} />
      <Route path="/overdrive-racing" component={OverdriveRacing} />
      <Route path="/overdrive-3d" component={Overdrive3D} />
      <Route path="/avernus-arena" component={AvernusArena} />
      <Route path="/wargus" component={Wargus} />
      <Route path="/gge-scene" component={GGEScene} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <GlobalNavigation />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
