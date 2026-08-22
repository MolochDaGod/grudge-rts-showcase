import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Server, GitBranch, Gamepad2, Code2, Activity, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Link } from "wouter";

// ── Real Grudge Studio Ecosystem Data ──

interface Deployment {
  name: string;
  url: string;
  platform: 'Vercel' | 'Railway' | 'GitHub Pages' | 'Puter';
  description: string;
  status: 'live' | 'checking' | 'down';
  responseMs?: number;
}

interface RepoProject {
  name: string;
  language: string;
  description: string;
  stars: number;
  forks: number;
  url: string;
}

interface GameProject {
  name: string;
  route: string;
  genre: string;
  status: 'playable' | 'prototype' | 'in-dev';
  engine: string;
}

const DEPLOYMENTS: Deployment[] = [
  { name: 'Grudge Platform', url: 'https://grudge-platform.vercel.app', platform: 'Vercel', description: 'App launcher, auth API, toolkit SPA', status: 'checking' },
  { name: 'GDevelop Assistant', url: 'https://gdevelop-assistant.vercel.app', platform: 'Vercel', description: 'AI game dev tools, 30+ pages, 3D editors', status: 'checking' },
  { name: 'Warlord Crafting Suite', url: 'https://warlord-crafting-suite.vercel.app', platform: 'Vercel', description: 'Crafting, character builder, professions, PvP', status: 'checking' },
  { name: 'Identity API', url: 'https://id.grudge-studio.com', platform: 'Railway', description: 'JWT auth, Discord/GitHub/Google OAuth', status: 'checking' },
  { name: 'GrudaChain Nexus', url: 'https://grudachain.grudgestudio.com', platform: 'Vercel', description: 'Deployment directory & link catalog', status: 'checking' },
  { name: 'App Gallery', url: 'https://grudachain-app-gallery.vercel.app', platform: 'Vercel', description: 'Grudge Studio project showcase', status: 'checking' },
  { name: 'Objectstore Worker', url: 'https://objectstore.grudge-studio.com', platform: 'Cloudflare', description: 'Game asset catalog API v3.4.0 — GET /api/v1/catalog', status: 'checking' },
  { name: 'Puter Cloud Dashboard', url: 'https://grudge-studio.puter.site', platform: 'Puter', description: 'AI chat, cloud storage, profile management', status: 'checking' },
  { name: 'GRUDA Legion Node', url: 'https://gruda-legion-production.up.railway.app/health', platform: 'Railway', description: 'AI agent node — Socket.IO powered', status: 'checking' },
];

const REPO_PROJECTS: RepoProject[] = [
  { name: 'grudge-platform', language: 'JavaScript', description: 'Unified app launcher, auth gateway & toolkit', stars: 1, forks: 0, url: 'https://github.com/MolochDaGod/grudge-platform' },
  { name: 'GDevelopAssistant', language: 'TypeScript', description: 'AI game dev assistant — 30+ tools, Three.js, React', stars: 0, forks: 0, url: 'https://github.com/MolochDaGod/GDevelopAssistant' },
  { name: 'Warlord-Crafting-Suite', language: 'TypeScript', description: 'Game systems — crafting, character, professions, battles', stars: 0, forks: 0, url: 'https://github.com/MolochDaGod/Warlord-Crafting-Suite' },
  { name: 'ObjectStore', language: 'HTML', description: 'Public game data API — 24 endpoints, 500+ items', stars: 1, forks: 0, url: 'https://github.com/MolochDaGod/ObjectStore' },
  { name: 'grudge-studio', language: 'TypeScript', description: 'Monorepo — crafting suite, builder, game services', stars: 0, forks: 0, url: 'https://github.com/MolochDaGod/grudge-studio' },
  { name: 'grudachain', language: 'TypeScript', description: 'GRUDA Legion standalone AI system', stars: 0, forks: 0, url: 'https://github.com/MolochDaGod/grudachain' },
  { name: 'Grudge-Builder', language: 'JavaScript', description: 'Visual game builder and level editor', stars: 0, forks: 0, url: 'https://github.com/MolochDaGod/Grudge-Builder' },
  { name: 'grudge-warlords-rts', language: 'Java', description: '3 Factions, 6 Races, 4 Classes — web RTS', stars: 0, forks: 0, url: 'https://github.com/MolochDaGod/grudge-warlords-rts' },
  { name: 'GrudgeWars', language: 'HTML', description: 'PvP browser game prototype', stars: 0, forks: 0, url: 'https://github.com/MolochDaGod/GrudgeWars' },
  { name: 'GRUDGE-NFT-Island', language: 'JavaScript', description: 'NFT island exploration game', stars: 0, forks: 0, url: 'https://github.com/MolochDaGod/GRUDGE-NFT-Island' },
];

const GAME_PROJECTS: GameProject[] = [
  { name: 'Crown Clash', route: '/crown-clash', genre: 'Strategy', status: 'playable', engine: 'React + Canvas' },
  { name: 'Grudge Arena', route: '/arena', genre: 'PvP Fighter', status: 'playable', engine: 'React + Canvas' },
  { name: 'Grudge Gangs', route: '/moba', genre: 'MOBA', status: 'prototype', engine: 'React + Canvas' },
  { name: 'Realm Protector', route: '/realm', genre: 'Tower Defense', status: 'prototype', engine: 'React + Canvas' },
  { name: 'Swarm RTS', route: '/swarm-rts', genre: 'Real-Time Strategy', status: 'prototype', engine: 'React + Canvas' },
  { name: 'Gruda Wars', route: '/gruda-wars', genre: 'Strategy RPG', status: 'in-dev', engine: 'React + Canvas' },
  { name: 'MMO World', route: '/mmo', genre: 'MMO RPG', status: 'in-dev', engine: 'Three.js + React' },
  { name: 'Grudge Swarm', route: '/grudge-swarm', genre: 'Swarm Survival', status: 'prototype', engine: 'React + Canvas' },
  { name: 'Space Assault', route: '/shooter', genre: 'Space Shooter', status: 'playable', engine: 'React + Canvas' },
  { name: 'Sky Command', route: '/flight', genre: 'Flight Sim', status: 'prototype', engine: 'Three.js + React' },
  { name: 'Sprint Master', route: '/runner', genre: 'Endless Runner', status: 'playable', engine: 'React + Canvas' },
  { name: 'Pixel Warrior', route: '/platformer', genre: 'Platformer', status: 'playable', engine: 'React + Canvas' },
];

// Real language distribution from GitHub (MolochDaGod — 53 repos)
const LANGUAGE_STATS = [
  { language: 'TypeScript', repos: 12, percentage: 31.6 },
  { language: 'HTML', repos: 10, percentage: 26.3 },
  { language: 'JavaScript', repos: 9, percentage: 23.7 },
  { language: 'Java', repos: 1, percentage: 2.6 },
  { language: 'C#', repos: 1, percentage: 2.6 },
  { language: 'Rust', repos: 1, percentage: 2.6 },
  { language: 'Go', repos: 1, percentage: 2.6 },
  { language: 'C++', repos: 1, percentage: 2.6 },
];

export default function AnalyticsDashboard() {
  const [deployments, setDeployments] = useState<Deployment[]>(DEPLOYMENTS);

  // Run live health checks on mount
  useEffect(() => {
    const checkDeployments = async () => {
      const results = await Promise.all(
        DEPLOYMENTS.map(async (dep) => {
          try {
            const start = performance.now();
            await fetch(dep.url, { method: 'GET', mode: 'no-cors' });
            const ms = Math.round(performance.now() - start);
            return { ...dep, status: 'live' as const, responseMs: ms };
          } catch {
            return { ...dep, status: 'down' as const };
          }
        })
      );
      setDeployments(results);
    };
    checkDeployments();
  }, []);

  const liveCount = deployments.filter(d => d.status === 'live').length;
  const checkingCount = deployments.filter(d => d.status === 'checking').length;
  const playableGames = GAME_PROJECTS.filter(g => g.status === 'playable').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live': return <Badge className="bg-green-600 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Live</Badge>;
      case 'checking': return <Badge className="bg-yellow-600 text-white"><Clock className="w-3 h-3 mr-1" />Checking</Badge>;
      case 'down': return <Badge className="bg-red-600 text-white"><XCircle className="w-3 h-3 mr-1" />Down</Badge>;
      default: return null;
    }
  };

  const getGameStatusBadge = (status: string) => {
    switch (status) {
      case 'playable': return <Badge className="bg-green-600 text-white">Playable</Badge>;
      case 'prototype': return <Badge className="bg-yellow-600 text-white">Prototype</Badge>;
      case 'in-dev': return <Badge className="bg-blue-600 text-white">In Dev</Badge>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/engine-launcher">
            <Button variant="outline" className="border-orange-400 text-gold-light hover:bg-orange-400 hover:text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Engine Launcher
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              Grudge Studio Analytics
            </h1>
            <p className="text-muted-foreground">Real ecosystem data — deployments, repos, and games</p>
          </div>
          
          <div className="text-sm text-muted-foreground text-right">
            <p>Owner: MolochDaGod</p>
            <p>Updated: Live</p>
          </div>
        </div>

        {/* Global Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-900/30 to-teal-900/20 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Live Deployments</p>
                  <p className="text-3xl font-bold text-foreground">
                    {checkingCount > 0 ? '...' : liveCount} / {DEPLOYMENTS.length}
                  </p>
                </div>
                <Server className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Vercel, Railway, GitHub Pages, Puter</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">GitHub Repos</p>
                  <p className="text-3xl font-bold text-foreground">53</p>
                </div>
                <GitBranch className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">10 languages across all repos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gold-light text-sm font-medium">Game Prototypes</p>
                  <p className="text-3xl font-bold text-foreground">{GAME_PROJECTS.length}</p>
                </div>
                <Gamepad2 className="w-8 h-8 text-gold-light" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{playableGames} playable, {GAME_PROJECTS.length - playableGames} in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">Primary Stack</p>
                  <p className="text-3xl font-bold text-foreground">TS</p>
                </div>
                <Code2 className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">TypeScript + React + Vite + Vercel</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deployments" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 mb-8">
            <TabsTrigger value="deployments" className="data-[state=active]:bg-primary">
              <Server className="w-4 h-4 mr-2" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-primary">
              <GitBranch className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-primary">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger value="stack" className="data-[state=active]:bg-primary">
              <Activity className="w-4 h-4 mr-2" />
              Tech Stack
            </TabsTrigger>
          </TabsList>

          {/* Deployments Tab — Live Health Checks */}
          <TabsContent value="deployments">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Live Deployments</h2>
              <p className="text-muted-foreground text-sm">Real-time health checks against production endpoints.</p>
              <div className="space-y-3">
                {deployments.map((dep) => (
                  <Card key={dep.url} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <a href={dep.url} target="_blank" rel="noopener noreferrer"
                                className="font-semibold text-foreground hover:text-gold-light transition-colors">
                                {dep.name}
                              </a>
                              <Badge variant="outline" className="text-xs">{dep.platform}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{dep.description}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-1">{dep.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {dep.responseMs !== undefined && (
                            <span className="text-xs text-muted-foreground">{dep.responseMs}ms</span>
                          )}
                          {getStatusBadge(dep.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab — Real GitHub Repos */}
          <TabsContent value="projects">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">GitHub Repositories</h2>
              <p className="text-muted-foreground text-sm">
                Key repositories from <a href="https://github.com/MolochDaGod" target="_blank" rel="noopener noreferrer" className="text-gold-light hover:underline">github.com/MolochDaGod</a> (53 total repos).
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {REPO_PROJECTS.map((repo) => (
                  <Card key={repo.name} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <a href={repo.url} target="_blank" rel="noopener noreferrer"
                            className="font-semibold text-foreground hover:text-gold-light transition-colors">
                            {repo.name}
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0 ml-2">{repo.language}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>⭐ {repo.stars}</span>
                        <span>🍴 {repo.forks}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Games Tab — Real Game Prototypes */}
          <TabsContent value="games">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Game Prototypes</h2>
              <p className="text-muted-foreground text-sm">
                Browser-based games hosted on <a href="https://gdevelop-assistant.vercel.app" target="_blank" rel="noopener noreferrer" className="text-gold-light hover:underline">GDevelop Assistant</a>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {GAME_PROJECTS.map((game) => (
                  <Card key={game.route} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <a href={`https://gdevelop-assistant.vercel.app${game.route}`} target="_blank" rel="noopener noreferrer"
                            className="font-semibold text-foreground hover:text-gold-light transition-colors">
                            {game.name}
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">{game.genre}</p>
                          <p className="text-xs text-muted-foreground mt-1">Engine: {game.engine}</p>
                        </div>
                        {getGameStatusBadge(game.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tech Stack Tab — Real Language Distribution */}
          <TabsContent value="stack">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Technology Stack</h2>
              <p className="text-muted-foreground text-sm">Language distribution across 38 repos with detected languages (out of 53 total).</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-foreground">Language Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {LANGUAGE_STATS.map((lang) => (
                        <div key={lang.language} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{lang.language}</span>
                            <span className="text-gold-light">{lang.repos} repos ({lang.percentage}%)</span>
                          </div>
                          <Progress value={lang.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-foreground">Deployment Platforms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { platform: 'Vercel', count: 6, description: 'Primary hosting — serverless + static' },
                        { platform: 'GitHub Pages', count: 1, description: 'ObjectStore API — static hosting' },
                        { platform: 'Railway', count: 1, description: 'GRUDA Legion — Node.js + Socket.IO' },
                        { platform: 'Puter', count: 1, description: 'Cloud dashboard — AI + storage' },
                      ].map((p) => (
                        <div key={p.platform} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                          <div>
                            <p className="text-gray-300 font-medium">{p.platform}</p>
                            <p className="text-xs text-muted-foreground">{p.description}</p>
                          </div>
                          <Badge variant="outline">{p.count} {p.count === 1 ? 'service' : 'services'}</Badge>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Core Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Radix UI', 'Three.js', 'Express', 'PostgreSQL', 'Drizzle ORM', 'Socket.IO', 'Solana/Web3'].map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
