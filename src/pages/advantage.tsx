import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download, ExternalLink, Code, Palette, Music, Map,
  Gamepad2, Star, Zap, Users, Shield, Swords, Wifi, WifiOff,
  Crown, User, Trophy, Loader2, LogIn
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/lib/auth";
import { warlordsApi, type PlayerSummary, type PlatformStats } from "@/lib/grudge-warlords-api";

// ─── Tool / Engine catalog ──────────────────────────────────

const gameEngines = [
  {
    name: "Construct 3",
    category: "Game Engine",
    description: "Web-based no-code game engine with drag-and-drop interface for 2D games. Features physics engines, pathfinding, and multiplayer support.",
    image: "https://framerusercontent.com/images/RQWGh7f8Cnb8blhaJXengKND4Bw.png",
    externalUrl: "https://www.construct.net/",
    pricing: "Free Tier Available",
  },
  {
    name: "Buildbox",
    category: "Game Engine",
    description: "Visual no-code game engine for creating 2D and 3D games. Includes animations, effects, and comprehensive sound systems.",
    image: "https://framerusercontent.com/images/c9Gh7XP4x4E6sMd2DeLSYdnLA.png",
    externalUrl: "https://www.buildbox.com/",
    pricing: "Subscription Model",
  },
  {
    name: "GDevelop",
    category: "Game Engine",
    description: "Open-source no-code game engine using visual scripting. Features physics engines, particle systems, and multiplayer capabilities.",
    image: "https://framerusercontent.com/images/3EjDBnc06ZqM2DalAwEiwBISOzc.png",
    externalUrl: "https://gdevelop.io/",
    pricing: "Free & Open Source",
  },
  {
    name: "Stencyl",
    category: "Game Engine",
    description: "Drag-and-drop game creation platform with physics engines, animation tools, and integrated sound support for 2D games.",
    image: "https://framerusercontent.com/images/osFEtXrggbbUFT2PcLhEKwtKw.png",
    externalUrl: "https://www.stencyl.com/",
    pricing: "Free for Web",
  },
  {
    name: "Yahaha Studios",
    category: "Game Engine",
    description: "Anyone can make a game with no coding skills required. User-friendly platform for creating interactive 3D experiences.",
    image: "https://framerusercontent.com/images/eKkVfcsfk3DfPJ0dLoklf2yAQw.png",
    externalUrl: "https://yahaha.com/",
    pricing: "Free to Start",
  },
  {
    name: "RPG Maker",
    category: "Game Engine",
    description: "Create Final Fantasy style RPG games with a simple editor. Perfect for storytelling and classic RPG experiences.",
    image: "https://framerusercontent.com/images/YX9i3N9waLZ4JydRrYz5jum2W5o.png",
    externalUrl: "https://www.rpgmakerweb.com/",
    pricing: "One-time Purchase",
  },
];

const assetTools = [
  {
    name: "Adobe Photoshop",
    category: "Graphics & Animation",
    description: "Industry-standard tool for creating custom graphics and animations. Perfect for game assets, UI elements, and promotional materials.",
    image: "https://framerusercontent.com/images/MDv2na8OgL3K1uWIO03HB27xCmU.jpeg",
    externalUrl: "https://www.adobe.com/products/photoshop.html",
    pricing: "Creative Cloud",
  },
  {
    name: "Blender",
    category: "3D Modeling",
    description: "Professional 3D modeling tool for creating models and animations. Essential for 3D game development and asset creation.",
    image: "https://framerusercontent.com/images/kqJNnjGgAUImwuaX1RZZWjFMc.png",
    externalUrl: "https://www.blender.org/",
    pricing: "Free & Open Source",
  },
  {
    name: "Aseprite",
    category: "Pixel Art",
    description: "Specialized pixel art tool for creating retro-style 2D game graphics. Perfect for indie game development.",
    image: "https://framerusercontent.com/images/RQWGh7f8Cnb8blhaJXengKND4Bw.png",
    externalUrl: "https://www.aseprite.org/",
    pricing: "One-time Purchase",
  },
  {
    name: "Inkscape",
    category: "Vector Graphics",
    description: "Vector graphics tool for creating scalable graphics perfect for UI elements and logos that work at any resolution.",
    image: "https://framerusercontent.com/images/c9Gh7XP4x4E6sMd2DeLSYdnLA.png",
    externalUrl: "https://inkscape.org/",
    pricing: "Free & Open Source",
  },
];

const audioTools = [
  {
    name: "FL Studio",
    category: "Music Production",
    description: "Professional digital audio workstation for creating game music, soundtracks, and ambient audio.",
    image: "https://framerusercontent.com/images/3EjDBnc06ZqM2DalAwEiwBISOzc.png",
    externalUrl: "https://www.image-line.com/",
    pricing: "Lifetime License",
  },
  {
    name: "Audacity",
    category: "Audio Editing",
    description: "Free audio editing tool for creating and editing sound effects, voice-overs, and music for games.",
    image: "https://framerusercontent.com/images/osFEtXrggbbUFT2PcLhEKwtKw.png",
    externalUrl: "https://www.audacityteam.org/",
    pricing: "Free & Open Source",
  },
  {
    name: "LMMS",
    category: "Music Production",
    description: "Free digital audio workstation for creating game music and sound design without expensive software.",
    image: "https://framerusercontent.com/images/eKkVfcsfk3DfPJ0dLoklf2yAQw.png",
    externalUrl: "https://lmms.io/",
    pricing: "Free & Open Source",
  },
  {
    name: "Bfxr / SFXR",
    category: "Sound Effects",
    description: "Retro-style sound effect generators perfect for creating classic arcade and indie game sound effects.",
    image: "https://framerusercontent.com/images/YX9i3N9waLZ4JydRrYz5jum2W5o.png",
    externalUrl: "https://www.bfxr.net/",
    pricing: "Free",
  },
];

const mapTools = [
  {
    name: "Tiled",
    category: "Map Editor",
    description: "Professional map editor for creating game levels and environments. Supports multiple formats and exports to various engines.",
    image: "https://framerusercontent.com/images/MDv2na8OgL3K1uWIO03HB27xCmU.jpeg",
    externalUrl: "https://www.mapeditor.org/",
    pricing: "Free & Open Source",
  },
];

// ─── Player Progress Card ───────────────────────────────────

function PlayerProgressCard({ summary }: { summary: PlayerSummary }) {
  if (!summary.found) return null;

  return (
    <Card className="border-gold-dark/40 bg-gradient-to-br from-gray-900/80 to-gray-800/80 text-foreground">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gold-light">
          <Crown className="w-5 h-5" />
          Your Grudge Warlords Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBlock label="Heroes" value={summary.characterCount ?? 0} icon={<Users className="w-4 h-4" />} />
          <StatBlock label="Highest Level" value={summary.highestLevel ?? 0} icon={<Star className="w-4 h-4" />} />
          <StatBlock label="Arena Wins" value={summary.totalArenaWins ?? 0} icon={<Trophy className="w-4 h-4" />} />
          <StatBlock label="Gold" value={(summary.gold ?? 0).toLocaleString()} icon={<Zap className="w-4 h-4" />} />
        </div>

        {summary.characters && summary.characters.length > 0 && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400 mb-2">Active Heroes</p>
            <div className="flex flex-wrap gap-2">
              {summary.characters.slice(0, 5).map((c, i) => (
                <Badge key={i} className="bg-primary/30 text-foreground text-xs">
                  {c.name} — Lv.{c.level} {c.classId}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {summary.hasWallet && (
          <Badge className="mt-3 bg-green-700/30 text-green-400 text-xs">
            <Shield className="w-3 h-3 mr-1" /> Wallet Connected
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function StatBlock({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-gold-light mb-1">{icon}<span className="text-xl font-bold">{value}</span></div>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

// ─── Connected Services Banner ──────────────────────────────

function ConnectedServicesBanner({ online }: { online: boolean | null }) {
  if (online === null) return null;

  return (
    <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${online ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
      {online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      {online
        ? "Grudge Warlords servers are online — your progress syncs automatically."
        : "Grudge Warlords servers are currently offline. Progress will sync when they return."}
    </div>
  );
}

// ─── Platform Stats Row ─────────────────────────────────────

function PlatformStatsRow({ stats }: { stats: PlatformStats | null }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {[
        { label: "Players", value: stats.totalPlayers },
        { label: "Heroes Created", value: stats.totalHeroes },
        { label: "Arena Teams", value: stats.arenaTeams },
        { label: "Battles Fought", value: stats.arenaBattles },
      ].map((s) => (
        <div key={s.label} className="text-center">
          <p className="text-3xl font-bold text-gold-light">{s.value.toLocaleString()}</p>
          <p className="text-sm text-gray-400">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Tool Card (shared renderer) ────────────────────────────

interface ToolItem {
  name: string;
  category: string;
  description: string;
  image: string;
  externalUrl: string;
  pricing: string;
}

function ToolCard({ tool, isAuthenticated, onLoginPrompt, size = "normal" }: {
  tool: ToolItem;
  isAuthenticated: boolean;
  onLoginPrompt: () => void;
  size?: "normal" | "compact";
}) {
  const isCompact = size === "compact";

  const handleAction = () => {
    if (!isAuthenticated) {
      onLoginPrompt();
      return;
    }
    window.open(tool.externalUrl, "_blank", "noopener");
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className={isCompact ? "pb-3" : undefined}>
        <div className={`relative overflow-hidden rounded-lg ${isCompact ? "mb-3" : "mb-4"}`}>
          <img
            src={tool.image}
            alt={tool.name}
            className={`w-full ${isCompact ? "h-32" : "h-48"} object-cover`}
          />
          {!isCompact && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-blue-500 text-foreground">{tool.category}</Badge>
            </div>
          )}
        </div>
        <CardTitle className={isCompact ? "text-lg" : "flex items-center justify-between"}>
          {tool.name}
          {!isCompact && (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? "text-gold-light fill-current" : "text-gray-300"}`} />
              ))}
            </div>
          )}
        </CardTitle>
        {isCompact && <Badge variant="outline" className="w-fit text-xs">{tool.category}</Badge>}
      </CardHeader>
      <CardContent>
        <p className={`text-muted-foreground ${isCompact ? "text-sm mb-3" : "mb-4"}`}>{tool.description}</p>
        <div className={`flex items-center justify-between ${isCompact ? "mb-3" : "mb-4"}`}>
          <span className={`${isCompact ? "text-xs" : "text-sm"} text-muted-foreground`}>Pricing:</span>
          <Badge variant="outline" className={`text-green-600 border-green-600 ${isCompact ? "text-xs" : ""}`}>{tool.pricing}</Badge>
        </div>
        <Button
          size={isCompact ? "sm" : "default"}
          className="w-full bg-primary hover:bg-primary/90 text-foreground"
          onClick={handleAction}
        >
          {isAuthenticated ? (
            <><ExternalLink className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} mr-2`} />Launch Tool</>
          ) : (
            <><LogIn className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} mr-2`} />Sign In to Access</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Login Prompt Modal ─────────────────────────────────────

function LoginPrompt({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <Card className="max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" /> Sign In Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Connect your Grudge Studio account to access tools, sync your Grudge Warlords progress, and unlock premium features.
          </p>
          <div className="flex gap-3">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-foreground">
                Go to Login
              </Button>
            </Link>
            <Button variant="outline" onClick={onClose}>Maybe Later</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────

export default function GrudgeStudioAdvantage() {
  const { isAuthenticated, session } = useAuth();
  const [playerSummary, setPlayerSummary] = useState<PlayerSummary | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [statsRes, onlineRes] = await Promise.all([
        warlordsApi.getStats(),
        warlordsApi.isOnline(),
      ]);

      if (cancelled) return;
      setPlatformStats(statsRes);
      setOnline(onlineRes);

      // If logged in, fetch player summary using userId as grudgeId
      if (session?.userId) {
        const summary = await warlordsApi.getPlayerSummary(session.userId);
        if (!cancelled) setPlayerSummary(summary);
      }

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [session?.userId]);

  return (
    <div className="min-h-screen bg-card">
      <Header />
      <LoginPrompt show={showLogin} onClose={() => setShowLogin(false)} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="bg-primary text-foreground mb-4 text-lg px-6 py-2">Grudge Studio Advantage</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Complete Game Development Ecosystem
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Access our comprehensive suite of no-code game engines and professional asset creation tools.
              From concept to deployment, we provide everything you need to create amazing games — and your
              Grudge Warlords progress travels with you.
            </p>
          </div>

          {/* Connected services status */}
          <div className="max-w-2xl mx-auto mb-8">
            <ConnectedServicesBanner online={online} />
          </div>

          {/* Player progress (auth-gated) */}
          {loading && isAuthenticated && (
            <div className="flex items-center justify-center gap-2 text-gray-400 py-6">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading your progress…
            </div>
          )}
          {playerSummary && playerSummary.found && (
            <div className="max-w-3xl mx-auto mb-8">
              <PlayerProgressCard summary={playerSummary} />
            </div>
          )}

          {/* Hero stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="bg-primary/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="w-10 h-10 text-gold-light" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">7 Game Engines</h3>
              <p className="text-gray-300">No-code platforms for every type of game development need</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Palette className="w-10 h-10 text-gold-light" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">10+ Asset Tools</h3>
              <p className="text-gray-300">Professional graphics, audio, and level design software</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Swords className="w-10 h-10 text-gold-light" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">
                {platformStats ? `${platformStats.arenaBattles.toLocaleString()} Battles` : "Live Arena"}
              </h3>
              <p className="text-gray-300">Compete in Grudge Warlords — your stats follow you here</p>
            </div>
          </div>

          {/* Platform-wide stats */}
          <PlatformStatsRow stats={platformStats} />
        </div>
      </div>

      {/* Tool catalog */}
      <div className="container mx-auto px-4 py-16">

        {/* Game Engines */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">No-Code Game Engines</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create games without programming knowledge using these powerful visual development platforms.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gameEngines.map((engine, i) => (
              <ToolCard key={i} tool={engine} isAuthenticated={isAuthenticated} onLoginPrompt={() => setShowLogin(true)} />
            ))}
          </div>
        </section>

        {/* Asset Tools */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Asset Creation Tools</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional software for creating graphics, 3D models, and visual assets for your games.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assetTools.map((tool, i) => (
              <ToolCard key={i} tool={tool} isAuthenticated={isAuthenticated} onLoginPrompt={() => setShowLogin(true)} size="compact" />
            ))}
          </div>
        </section>

        {/* Audio Tools */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Audio Creation Tools</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create music, sound effects, and audio experiences that bring your games to life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {audioTools.map((tool, i) => (
              <ToolCard key={i} tool={tool} isAuthenticated={isAuthenticated} onLoginPrompt={() => setShowLogin(true)} size="compact" />
            ))}
          </div>
        </section>

        {/* Level Design */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Level Design Tools</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create engaging game levels and environments with professional mapping tools.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mapTools.map((tool, i) => (
              <ToolCard key={i} tool={tool} isAuthenticated={isAuthenticated} onLoginPrompt={() => setShowLogin(true)} />
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted rounded-2xl p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">The Grudge Studio Advantage</h2>
            <p className="text-lg text-muted-foreground">What makes our game development ecosystem unique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Code className="w-8 h-8 text-gold" />, title: "No Coding Required", desc: "Visual interfaces make game development accessible to everyone" },
              { icon: <Zap className="w-8 h-8 text-gold" />, title: "Cross-Platform Progress", desc: "Your Grudge Warlords heroes, arena record, and gold sync across all Grudge Studio apps" },
              { icon: <Users className="w-8 h-8 text-gold" />, title: "Community & Arena", desc: "Compete on live leaderboards and join a growing community of game creators" },
              { icon: <Shield className="w-8 h-8 text-gold" />, title: "Professional Quality", desc: "Industry-standard tools backed by Grudge Studio cloud services and wallet support" },
            ].map((b) => (
              <div key={b.title} className="text-center">
                <div className="bg-gold-dark/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {b.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center space-x-4">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-foreground px-8 py-3 text-lg">
              Explore Our Platform
            </Button>
          </Link>
          <a href="https://grudgewarlords.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="px-8 py-3 text-lg">
              <Swords className="w-5 h-5 mr-2" /> Play Grudge Warlords
            </Button>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
