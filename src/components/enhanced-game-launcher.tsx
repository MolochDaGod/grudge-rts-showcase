import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Maximize, Settings, Share2, Download, Trophy, Star, Users, Clock } from "lucide-react";
import { Link } from "wouter";

interface GameInstance {
  id: string;
  name: string;
  engine: string;
  status: 'playing' | 'paused' | 'stopped';
  score: number;
  level: string;
  playTime: string;
  multiplayer: boolean;
  thumbnail: string;
  controls: {
    canPause: boolean;
    canRestart: boolean;
    canSave: boolean;
    canShare: boolean;
  };
}

interface EnhancedGameLauncherProps {
  gameId: string;
  engineType: string;
}

export default function EnhancedGameLauncher({ gameId, engineType }: EnhancedGameLauncherProps) {
  const [gameInstance, setGameInstance] = useState<GameInstance | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameProgress, setGameProgress] = useState(0);

  useEffect(() => {
    // Simulate game initialization
    setGameInstance({
      id: gameId,
      name: "Pixel Adventure Quest",
      engine: engineType,
      status: 'stopped',
      score: 0,
      level: "1-1",
      playTime: "00:00",
      multiplayer: false,
      thumbnail: "/game-thumbnail.jpg",
      controls: {
        canPause: true,
        canRestart: true,
        canSave: true,
        canShare: true
      }
    });
  }, [gameId, engineType]);

  const startGame = () => {
    if (gameInstance) {
      setGameInstance({ ...gameInstance, status: 'playing' });
      // Simulate game progress
      const interval = setInterval(() => {
        setGameProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 200);
    }
  };

  const pauseGame = () => {
    if (gameInstance) {
      setGameInstance({ ...gameInstance, status: 'paused' });
    }
  };

  const restartGame = () => {
    if (gameInstance) {
      setGameInstance({ 
        ...gameInstance, 
        status: 'playing',
        score: 0,
        level: "1-1",
        playTime: "00:00"
      });
      setGameProgress(0);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!gameInstance) {
    return <div className="text-white">Loading game...</div>;
  }

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Game Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{gameInstance.name}</h3>
            <p className="text-gray-400 text-sm">Built with {gameInstance.engine}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-500/20 text-green-400">
            {gameInstance.status.charAt(0).toUpperCase() + gameInstance.status.slice(1)}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400">
            Level {gameInstance.level}
          </Badge>
        </div>
      </div>

      {/* Game Canvas Area */}
      <div className="relative bg-black aspect-video flex items-center justify-center">
        {gameInstance.status === 'stopped' ? (
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Play className="w-12 h-12 text-white" />
            </div>
            <div>
              <h4 className="text-white text-xl font-semibold mb-2">Ready to Play</h4>
              <p className="text-gray-400">Click the play button to start your adventure</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Simulated Game Content */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎮</div>
                <div className="text-white text-2xl font-bold">Game Running</div>
                <div className="text-gray-300">Score: {Math.floor(gameProgress * 10)}</div>
                <Progress value={gameProgress} className="w-64 mx-auto" />
              </div>
            </div>

            {/* Game Overlay Controls */}
            {gameInstance.status === 'paused' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <Pause className="w-12 h-12 text-white mx-auto mb-4" />
                  <h4 className="text-white text-xl font-semibold mb-2">Game Paused</h4>
                  <p className="text-gray-400 mb-4">Click play to continue</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white hover:bg-white/10"
          onClick={toggleFullscreen}
        >
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      {/* Game Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {gameInstance.status === 'playing' ? (
              <Button onClick={pauseGame} className="bg-orange-500 hover:bg-orange-600">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button onClick={startGame} className="bg-orange-500 hover:bg-orange-600">
                <Play className="w-4 h-4 mr-2" />
                {gameInstance.status === 'paused' ? 'Resume' : 'Start Game'}
              </Button>
            )}
            
            <Button variant="outline" onClick={restartGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-gray-400 text-sm">Score</span>
            </div>
            <div className="text-white font-semibold">{Math.floor(gameProgress * 10)}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-blue-400 mr-1" />
              <span className="text-gray-400 text-sm">Level</span>
            </div>
            <div className="text-white font-semibold">{gameInstance.level}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-gray-400 text-sm">Time</span>
            </div>
            <div className="text-white font-semibold">{gameInstance.playTime}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-purple-400 mr-1" />
              <span className="text-gray-400 text-sm">Players</span>
            </div>
            <div className="text-white font-semibold">{gameInstance.multiplayer ? '2' : '1'}</div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-gray-700/50 p-3 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/engine-launcher">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                ← Back to Launcher
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href="/asset-store">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Get Assets
              </Button>
            </Link>
            <Link href="/collaboration-hub">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Invite Friends
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}