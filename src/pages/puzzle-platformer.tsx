import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Star,
  Key,
  Heart,
  Clock,
  Target,
  Zap,
  Gem
} from "lucide-react";
import { Link } from "wouter";

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  onGround: boolean;
  keys: number;
  health: number;
  maxHealth: number;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'moving' | 'breakable' | 'spring';
  color: string;
  moving?: {
    direction: number;
    speed: number;
    range: number;
    startX: number;
  };
}

interface Collectible {
  x: number;
  y: number;
  type: 'key' | 'gem' | 'coin' | 'heart' | 'powerup';
  collected: boolean;
  value: number;
  color: string;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  type: 'walker' | 'jumper' | 'shooter';
  health: number;
  direction: number;
  color: string;
}

export default function PuzzlePlatformer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'completed' | 'gameOver'>('menu');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [levelTime, setLevelTime] = useState(0);

  const [player, setPlayer] = useState<Player>({
    x: 50,
    y: 400,
    vx: 0,
    vy: 0,
    width: 20,
    height: 30,
    onGround: false,
    keys: 0,
    health: 100,
    maxHealth: 100
  });

  const [platforms] = useState<Platform[]>([
    // Ground platforms
    { x: 0, y: 550, width: 200, height: 50, type: 'solid', color: '#4a5568' },
    { x: 250, y: 500, width: 150, height: 20, type: 'solid', color: '#4a5568' },
    { x: 450, y: 450, width: 100, height: 20, type: 'solid', color: '#4a5568' },
    
    // Moving platforms
    { 
      x: 600, y: 400, width: 100, height: 20, type: 'moving', color: '#3182ce',
      moving: { direction: 1, speed: 2, range: 150, startX: 600 }
    },
    { 
      x: 200, y: 350, width: 80, height: 20, type: 'moving', color: '#3182ce',
      moving: { direction: -1, speed: 1.5, range: 100, startX: 200 }
    },
    
    // Special platforms
    { x: 400, y: 300, width: 60, height: 20, type: 'spring', color: '#38a169' },
    { x: 650, y: 250, width: 80, height: 20, type: 'breakable', color: '#d69e2e' },
    { x: 100, y: 200, width: 100, height: 20, type: 'solid', color: '#4a5568' },
    
    // Upper level platforms
    { x: 300, y: 150, width: 120, height: 20, type: 'solid', color: '#4a5568' },
    { x: 500, y: 100, width: 150, height: 20, type: 'solid', color: '#4a5568' },
    { x: 700, y: 50, width: 100, height: 20, type: 'solid', color: '#4a5568' }
  ]);

  const [collectibles, setCollectibles] = useState<Collectible[]>([
    { x: 300, y: 460, type: 'key', collected: false, value: 1, color: '#ffd700' },
    { x: 480, y: 410, type: 'gem', collected: false, value: 50, color: '#9f7aea' },
    { x: 650, y: 360, type: 'coin', collected: false, value: 10, color: '#f6e05e' },
    { x: 230, y: 310, type: 'coin', collected: false, value: 10, color: '#f6e05e' },
    { x: 430, y: 260, type: 'heart', collected: false, value: 25, color: '#f56565' },
    { x: 350, y: 110, type: 'gem', collected: false, value: 50, color: '#9f7aea' },
    { x: 550, y: 60, type: 'powerup', collected: false, value: 100, color: '#4fd1c7' },
    { x: 750, y: 10, type: 'key', collected: false, value: 1, color: '#ffd700' }
  ]);

  const [enemies, setEnemies] = useState<Enemy[]>([
    { x: 300, y: 480, vx: 1, width: 15, height: 20, type: 'walker', health: 1, direction: 1, color: '#e53e3e' },
    { x: 500, y: 430, vx: 0, width: 18, height: 22, type: 'jumper', health: 2, direction: 1, color: '#d69e2e' },
    { x: 150, y: 180, vx: 1.5, width: 16, height: 20, type: 'walker', health: 1, direction: -1, color: '#e53e3e' }
  ]);

  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [particles, setParticles] = useState<Array<{
    x: number; y: number; vx: number; vy: number; life: number; color: string;
  }>>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
      e.preventDefault();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setGameTime(prev => prev + 0.1);
        setLevelTime(prev => prev + 0.1);
        
        // Update game physics
        setPlayer(prevPlayer => {
          let newPlayer = { ...prevPlayer };
          
          // Horizontal movement
          if (keys['ArrowLeft'] || keys['a']) {
            newPlayer.vx = Math.max(-6, newPlayer.vx - 0.5);
          } else if (keys['ArrowRight'] || keys['d']) {
            newPlayer.vx = Math.min(6, newPlayer.vx + 0.5);
          } else {
            newPlayer.vx *= 0.8; // Friction
          }
          
          // Jumping
          if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && newPlayer.onGround) {
            newPlayer.vy = -12;
            newPlayer.onGround = false;
          }
          
          // Apply gravity
          newPlayer.vy += 0.6;
          if (newPlayer.vy > 15) newPlayer.vy = 15;
          
          // Update position
          newPlayer.x += newPlayer.vx;
          newPlayer.y += newPlayer.vy;
          
          // Platform collision
          newPlayer.onGround = false;
          platforms.forEach(platform => {
            // Check collision
            if (newPlayer.x < platform.x + platform.width &&
                newPlayer.x + newPlayer.width > platform.x &&
                newPlayer.y < platform.y + platform.height &&
                newPlayer.y + newPlayer.height > platform.y) {
              
              // Top collision (landing)
              if (prevPlayer.y + prevPlayer.height <= platform.y && newPlayer.vy > 0) {
                newPlayer.y = platform.y - newPlayer.height;
                newPlayer.vy = 0;
                newPlayer.onGround = true;
                
                if (platform.type === 'spring') {
                  newPlayer.vy = -18;
                  newPlayer.onGround = false;
                  createParticles(newPlayer.x + newPlayer.width/2, platform.y, '#38a169');
                }
              }
              // Bottom collision
              else if (prevPlayer.y >= platform.y + platform.height && newPlayer.vy < 0) {
                newPlayer.y = platform.y + platform.height;
                newPlayer.vy = 0;
              }
              // Side collisions
              else if (newPlayer.vy >= 0) {
                if (prevPlayer.x + prevPlayer.width <= platform.x) {
                  newPlayer.x = platform.x - newPlayer.width;
                } else if (prevPlayer.x >= platform.x + platform.width) {
                  newPlayer.x = platform.x + platform.width;
                }
                newPlayer.vx = 0;
              }
            }
          });
          
          // Screen boundaries
          if (newPlayer.x < 0) newPlayer.x = 0;
          if (newPlayer.x + newPlayer.width > 800) newPlayer.x = 800 - newPlayer.width;
          if (newPlayer.y > 600) {
            // Player fell off screen
            newPlayer.health -= 25;
            newPlayer.x = 50;
            newPlayer.y = 400;
            newPlayer.vx = 0;
            newPlayer.vy = 0;
          }
          
          return newPlayer;
        });
        
        // Update moving platforms
        platforms.forEach(platform => {
          if (platform.type === 'moving' && platform.moving) {
            platform.x += platform.moving.direction * platform.moving.speed;
            
            if (platform.x <= platform.moving.startX - platform.moving.range ||
                platform.x >= platform.moving.startX + platform.moving.range) {
              platform.moving.direction *= -1;
            }
          }
        });
        
        // Update enemies
        setEnemies(prevEnemies => {
          return prevEnemies.map(enemy => {
            let newEnemy = { ...enemy };
            
            switch (enemy.type) {
              case 'walker':
                newEnemy.x += newEnemy.vx * newEnemy.direction;
                // Simple AI: turn around at edges or walls
                if (newEnemy.x <= 0 || newEnemy.x >= 800) {
                  newEnemy.direction *= -1;
                }
                break;
                
              case 'jumper':
                // Jump periodically
                if (Math.random() < 0.01) {
                  newEnemy.vx = (Math.random() - 0.5) * 4;
                }
                newEnemy.x += newEnemy.vx;
                newEnemy.vx *= 0.95;
                break;
            }
            
            return newEnemy;
          });
        });
        
        // Update particles
        setParticles(prevParticles => {
          return prevParticles.map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.2,
            life: particle.life - 1
          })).filter(particle => particle.life > 0);
        });
        
      }, 16); // 60 FPS
      
      return () => clearInterval(interval);
    }
  }, [gameState, keys, platforms]);

  // Collectible collision detection
  useEffect(() => {
    setCollectibles(prevCollectibles => {
      return prevCollectibles.map(collectible => {
        if (!collectible.collected &&
            player.x < collectible.x + 20 &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + 20 &&
            player.y + player.height > collectible.y) {
          
          // Collect item
          setScore(prev => prev + collectible.value);
          
          if (collectible.type === 'key') {
            setPlayer(prev => ({ ...prev, keys: prev.keys + 1 }));
          } else if (collectible.type === 'heart') {
            setPlayer(prev => ({ 
              ...prev, 
              health: Math.min(prev.maxHealth, prev.health + collectible.value) 
            }));
          }
          
          createParticles(collectible.x + 10, collectible.y + 10, collectible.color);
          
          return { ...collectible, collected: true };
        }
        return collectible;
      });
    });
  }, [player.x, player.y]);

  const createParticles = (x: number, y: number, color: string) => {
    const newParticles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 30,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#2d3748');
      gradient.addColorStop(1, '#1a202c');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw platforms
      platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add platform details
        if (platform.type === 'moving') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(platform.x + 2, platform.y + 2, platform.width - 4, 4);
        } else if (platform.type === 'spring') {
          ctx.fillStyle = '#68d391';
          ctx.fillRect(platform.x + 10, platform.y - 5, platform.width - 20, 5);
        } else if (platform.type === 'breakable') {
          ctx.strokeStyle = '#a0aec0';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
          ctx.setLineDash([]);
        }
      });

      // Draw collectibles
      collectibles.forEach(collectible => {
        if (!collectible.collected) {
          ctx.fillStyle = collectible.color;
          
          switch (collectible.type) {
            case 'key':
              ctx.fillRect(collectible.x + 5, collectible.y + 5, 10, 10);
              ctx.fillRect(collectible.x + 15, collectible.y + 8, 4, 4);
              break;
            case 'gem':
              ctx.beginPath();
              ctx.moveTo(collectible.x + 10, collectible.y);
              ctx.lineTo(collectible.x + 20, collectible.y + 10);
              ctx.lineTo(collectible.x + 10, collectible.y + 20);
              ctx.lineTo(collectible.x, collectible.y + 10);
              ctx.closePath();
              ctx.fill();
              break;
            case 'coin':
              ctx.beginPath();
              ctx.arc(collectible.x + 10, collectible.y + 10, 8, 0, Math.PI * 2);
              ctx.fill();
              break;
            case 'heart':
              ctx.beginPath();
              ctx.arc(collectible.x + 6, collectible.y + 8, 6, 0, Math.PI * 2);
              ctx.arc(collectible.x + 14, collectible.y + 8, 6, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.moveTo(collectible.x + 10, collectible.y + 20);
              ctx.lineTo(collectible.x, collectible.y + 12);
              ctx.lineTo(collectible.x + 20, collectible.y + 12);
              ctx.closePath();
              ctx.fill();
              break;
            case 'powerup':
              ctx.fillRect(collectible.x + 2, collectible.y + 2, 16, 16);
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(collectible.x + 8, collectible.y + 4, 4, 12);
              ctx.fillRect(collectible.x + 4, collectible.y + 8, 12, 4);
              break;
          }
        }
      });

      // Draw enemies
      enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(enemy.x + 3, enemy.y + 3, 3, 3);
        ctx.fillRect(enemy.x + enemy.width - 6, enemy.y + 3, 3, 3);
      });

      // Draw particles
      particles.forEach(particle => {
        ctx.globalAlpha = particle.life / 30;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
      });
      ctx.globalAlpha = 1;

      // Draw player
      ctx.fillStyle = player.health > 25 ? '#4299e1' : '#f56565';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      
      // Player details
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.x + 3, player.y + 3, 4, 4);
      ctx.fillRect(player.x + 13, player.y + 3, 4, 4);
      ctx.fillRect(player.x + 6, player.y + 20, 8, 3);

      // Draw UI
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Score: ${score}`, 20, 30);
      ctx.fillText(`Keys: ${player.keys}`, 20, 55);
      ctx.fillText(`Time: ${levelTime.toFixed(1)}s`, 650, 30);
      ctx.fillText(`Level: ${level}`, 650, 55);
      
      // Health bar
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(20, 70, 200, 20);
      ctx.fillStyle = player.health > 50 ? '#38a169' : player.health > 25 ? '#d69e2e' : '#e53e3e';
      ctx.fillRect(20, 70, (player.health / player.maxHealth) * 200, 20);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(20, 70, 200, 20);
    };

    render();
  }, [player, platforms, collectibles, enemies, particles, score, level, gameTime, levelTime]);

  const startGame = () => {
    setGameState('playing');
    setGameTime(0);
    setLevelTime(0);
    setScore(0);
    setPlayer(prev => ({ 
      ...prev, 
      x: 50, 
      y: 400, 
      vx: 0, 
      vy: 0, 
      health: 100, 
      keys: 0 
    }));
    setCollectibles(prev => prev.map(c => ({ ...c, collected: false })));
  };

  const resetGame = () => {
    setGameState('menu');
    setLevel(1);
    setScore(0);
    setGameTime(0);
    setLevelTime(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/engine-launcher">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Launcher
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Crystal Quest Platformer
              </h1>
              <p className="text-gray-400">Physics-based puzzle platformer with collectibles and enemies</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-purple-500/20 text-purple-400">Puzzle Platform</Badge>
            <Badge className="bg-blue-500/20 text-blue-400">Single Player</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-400" />
                    Level {level} - Crystal Caverns
                  </div>
                  <div className="flex items-center space-x-2">
                    {gameState === 'menu' && (
                      <Button
                        onClick={startGame}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Game
                      </Button>
                    )}
                    {gameState === 'playing' && (
                      <Button
                        onClick={() => setGameState('paused')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    {gameState === 'paused' && (
                      <Button
                        onClick={() => setGameState('playing')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full bg-gray-900 rounded-lg border border-gray-600"
                />
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Key className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400">Keys</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Gem className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">Gems</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-gray-400">Health</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Spring</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    WASD / Arrow Keys: Move • Space: Jump
                  </div>
                </div>

                {gameState === 'menu' && (
                  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="text-center space-y-6">
                      <div className="text-6xl mb-4">🏰</div>
                      <h2 className="text-3xl font-bold text-white">Crystal Quest</h2>
                      <p className="text-gray-300 max-w-md">
                        Navigate through challenging platforms, collect crystals and keys, 
                        avoid enemies, and reach the exit to complete each level.
                      </p>
                      <div className="flex space-x-4 justify-center">
                        <div className="text-center">
                          <Key className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">Collect Keys</p>
                        </div>
                        <div className="text-center">
                          <Gem className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">Find Gems</p>
                        </div>
                        <div className="text-center">
                          <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">Reach Goal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {gameState === 'paused' && (
                  <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Pause className="w-16 h-16 text-white mx-auto" />
                      <h2 className="text-2xl font-bold text-white">Game Paused</h2>
                      <Button 
                        onClick={() => setGameState('playing')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Continue Playing
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Game Stats */}
          <div className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Game Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Score</span>
                    <span className="text-white font-bold">{score.toLocaleString()}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Health</span>
                    <span className="text-white font-bold">{player.health}/{player.maxHealth}</span>
                  </div>
                  <Progress 
                    value={(player.health / player.maxHealth) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Level</div>
                    <div className="text-white font-bold">{level}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Keys</div>
                    <div className="text-yellow-400 font-bold">{player.keys}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Time</div>
                    <div className="text-blue-400 font-bold">{levelTime.toFixed(1)}s</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Collected</div>
                    <div className="text-purple-400 font-bold">{collectibles.filter(c => c.collected).length}/{collectibles.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-400" />
                  Objectives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`flex items-center space-x-2 ${player.keys >= 2 ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded border-2 ${player.keys >= 2 ? 'bg-green-400 border-green-400' : 'border-gray-400'}`}>
                    {player.keys >= 2 && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span>Collect 2 Keys ({player.keys}/2)</span>
                </div>
                
                <div className={`flex items-center space-x-2 ${collectibles.filter(c => c.collected && c.type === 'gem').length >= 2 ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded border-2 ${collectibles.filter(c => c.collected && c.type === 'gem').length >= 2 ? 'bg-green-400 border-green-400' : 'border-gray-400'}`}>
                    {collectibles.filter(c => c.collected && c.type === 'gem').length >= 2 && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span>Find 2 Gems ({collectibles.filter(c => c.collected && c.type === 'gem').length}/2)</span>
                </div>
                
                <div className={`flex items-center space-x-2 ${score >= 200 ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded border-2 ${score >= 200 ? 'bg-green-400 border-green-400' : 'border-gray-400'}`}>
                    {score >= 200 && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span>Score 200 Points ({score}/200)</span>
                </div>
                
                <div className="text-gray-400 flex items-center space-x-2">
                  <div className="w-4 h-4 rounded border-2 border-gray-400"></div>
                  <span>Reach the Exit Portal</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/collaboration-hub">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" size="sm">
                    <Star className="w-4 h-4 mr-2" />
                    Share Score
                  </Button>
                </Link>
                <Link href="/asset-store">
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white" size="sm">
                    <Gem className="w-4 h-4 mr-2" />
                    Get Assets
                  </Button>
                </Link>
                <Link href="/analytics-dashboard">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white" size="sm">
                    <Trophy className="w-4 h-4 mr-2" />
                    View Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}