import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Castle, Coins, Home, Sword, TreePine } from 'lucide-react';
import ModelViewer, { ModelEntry } from '@/components/model-viewer';

type CategoryType = 'all' | 'military' | 'economic' | 'civic' | 'resources';

interface Category {
  id: CategoryType;
  name: string;
  description: string;
  icon: React.ReactNode;
  models: ModelEntry[];
}

const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'All Buildings',
    description: 'Complete medieval RTS building collection',
    icon: <Castle className="w-5 h-5" />,
    models: [
      { name: 'Town Center', file: 'Town Center.glb', scale: 1.2 },
      { name: 'Castle', file: 'Castle.glb', scale: 1.5 },
      { name: 'Wooden Fortress', file: 'Wooden Fortress.glb', scale: 1.3 },
      { name: 'Barracks', file: 'Barracks.glb', scale: 1.0 },
      { name: 'Archery Training Grounds', file: 'Archery Training Grounds.glb', scale: 1.0 },
      { name: 'Watch Tower', file: 'Watch Tower.glb', scale: 1.0 },
      { name: 'Temple', file: 'Temple.glb', scale: 1.1 },
      { name: 'Farm', file: 'Farm.glb', scale: 0.9 },
      { name: 'Windmill', file: 'Windmill.glb', scale: 1.0 },
      { name: 'Mine', file: 'Mine.glb', scale: 1.0 },
      { name: 'Storage House', file: 'Storage House.glb', scale: 0.8 },
      { name: 'House', file: 'House.glb', scale: 0.7 },
      { name: 'Gold Rocks', file: 'Gold Rocks.glb', scale: 0.5 },
      { name: 'Rock', file: 'Rock.glb', scale: 0.4 },
      { name: 'Trees', file: 'Trees.glb', scale: 0.8 },
      { name: 'Logs', file: 'Logs.glb', scale: 0.3 },
    ],
  },
  {
    id: 'military',
    name: 'Military',
    description: 'Training grounds, fortifications, and defensive structures',
    icon: <Sword className="w-5 h-5" />,
    models: [
      { name: 'Castle', file: 'Castle.glb', scale: 1.5 },
      { name: 'Wooden Fortress', file: 'Wooden Fortress.glb', scale: 1.3 },
      { name: 'Barracks', file: 'Barracks.glb', scale: 1.0 },
      { name: 'Archery Training Grounds', file: 'Archery Training Grounds.glb', scale: 1.0 },
      { name: 'Watch Tower', file: 'Watch Tower.glb', scale: 1.0 },
    ],
  },
  {
    id: 'economic',
    name: 'Economic',
    description: 'Resource production and storage facilities',
    icon: <Coins className="w-5 h-5" />,
    models: [
      { name: 'Farm', file: 'Farm.glb', scale: 0.9 },
      { name: 'Windmill', file: 'Windmill.glb', scale: 1.0 },
      { name: 'Mine', file: 'Mine.glb', scale: 1.0 },
      { name: 'Storage House', file: 'Storage House.glb', scale: 0.8 },
      { name: 'House', file: 'House.glb', scale: 0.7 },
    ],
  },
  {
    id: 'civic',
    name: 'Civic',
    description: 'Town centers and places of worship',
    icon: <Home className="w-5 h-5" />,
    models: [
      { name: 'Town Center', file: 'Town Center.glb', scale: 1.2 },
      { name: 'Temple', file: 'Temple.glb', scale: 1.1 },
    ],
  },
  {
    id: 'resources',
    name: 'Resources',
    description: 'Natural resources and materials',
    icon: <TreePine className="w-5 h-5" />,
    models: [
      { name: 'Trees', file: 'Trees.glb', scale: 0.8 },
      { name: 'Logs', file: 'Logs.glb', scale: 0.3 },
      { name: 'Gold Rocks', file: 'Gold Rocks.glb', scale: 0.5 },
      { name: 'Rock', file: 'Rock.glb', scale: 0.4 },
    ],
  },
];

export default function EraShowcase() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [stats, setStats] = useState<{ triangles: number; meshes: number } | null>(null);

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Grudge RTS Era Showcase</h1>
                <p className="text-sm text-slate-400">Medieval Era — Buildings at Accurate Scale</p>
              </div>
            </div>
            {stats && (
              <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Models:</span>
                  <span className="text-white font-mono">{currentCategory.models.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Triangles:</span>
                  <span className="text-white font-mono">{stats.triangles.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Meshes:</span>
                  <span className="text-white font-mono">{stats.meshes}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Medieval Era Building Collection</CardTitle>
            <CardDescription className="text-slate-400">
              3D models displayed at accurate relative scale. Navigate between categories to view military, economic, civic, and resource structures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as CategoryType)}>
              <TabsList className="grid grid-cols-5 w-full max-w-2xl mb-6">
                {CATEGORIES.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2"
                  >
                    {category.icon}
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {CATEGORIES.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                    <p className="text-sm text-slate-400">{category.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {category.models.map((model) => (
                        <span
                          key={model.name}
                          className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded"
                        >
                          {model.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-[600px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                    <ModelViewer
                      models={category.models}
                      showGrid={true}
                      autoRotate={true}
                      onModelLoad={setStats}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Card className="border-slate-700 bg-slate-800/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-slate-400">Scale System</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-300">
                          Models are displayed at accurate relative scale based on their in-game size. Larger structures like castles and fortresses dominate, while resource nodes are proportionally smaller.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-700 bg-slate-800/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-slate-400">Navigation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-300">
                          Use your mouse to orbit the camera (left-click drag), zoom (scroll), and pan (right-click drag). Models auto-rotate for easy inspection.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-700 bg-slate-800/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-slate-400">Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-300">
                          Switch between tabs to view buildings organized by purpose: Military (defense), Economic (production), Civic (core buildings), and Resources (raw materials).
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Grudge Studio © 2026</span>
            <a
              href="https://www.grudgeplatform.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              grudgeplatform.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
