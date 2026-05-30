import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Direction, Point } from '../types';
import { Trophy, RotateCcw, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_INCREMENT = 2;

const getRandomPoint = (width: number, height: number): Point => {
  return {
    x: Math.floor(Math.random() * (width / GRID_SIZE)),
    y: Math.floor(Math.random() * (height / GRID_SIZE)),
  };
};

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(Direction.UP);
  const [nextDirection, setNextDirection] = useState<Direction>(Direction.UP);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
    setFood(getRandomPoint(400, 400));
    setDirection(Direction.UP);
    setNextDirection(Direction.UP);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameState('PLAYING');
  };

  const gameOver = () => {
    setGameState('GAMEOVER');
    if (score > highScore) setHighScore(score);
  };

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };
      const currentDir = nextDirection;
      setDirection(currentDir);

      switch (currentDir) {
        case Direction.UP: head.y -= 1; break;
        case Direction.DOWN: head.y += 1; break;
        case Direction.LEFT: head.x -= 1; break;
        case Direction.RIGHT: head.x += 1; break;
      }

      // Check boundaries
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        gameOver();
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        setFood(getRandomPoint(400, 400));
        setSpeed(s => Math.max(MIN_SPEED, s - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, nextDirection, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== Direction.DOWN) setNextDirection(Direction.UP);
          break;
        case 'ArrowDown':
          if (direction !== Direction.UP) setNextDirection(Direction.DOWN);
          break;
        case 'ArrowLeft':
          if (direction !== Direction.RIGHT) setNextDirection(Direction.LEFT);
          break;
        case 'ArrowRight':
          if (direction !== Direction.LEFT) setNextDirection(Direction.RIGHT);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid (Subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Draw Food with Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f0f';
    ctx.fillStyle = '#f0f';
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Snake with Glow
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.shadowBlur = isHead ? 20 : 10;
      ctx.shadowColor = isHead ? '#0ff' : '#0ee';
      ctx.fillStyle = isHead ? '#0ff' : `rgba(0, 255, 255, ${1 - index / snake.length * 0.5})`;
      
      const padding = 2;
      ctx.fillRect(
        segment.x * GRID_SIZE + padding,
        segment.y * GRID_SIZE + padding,
        GRID_SIZE - padding * 2,
        GRID_SIZE - padding * 2
      );
    });

    ctx.shadowBlur = 0;
  }, [snake, food]);

  const animate = useCallback((time: number) => {
    if (gameState === 'PLAYING') {
      if (time - lastUpdateRef.current > speed) {
        moveSnake();
        lastUpdateRef.current = time;
      }
      draw();
      gameLoopRef.current = requestAnimationFrame(animate);
    }
  }, [gameState, moveSnake, draw, speed]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      gameLoopRef.current = requestAnimationFrame(animate);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, animate]);

  // Initial draw when starting or game over
  useEffect(() => {
     draw();
  }, [gameState, draw]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050508] p-4 font-sans text-white overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center space-y-2">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Neon Snake
            </h1>
            <p className="text-gray-500 text-xs font-mono uppercase tracking-[0.4em]">Integrated Audio Visual System</p>
        </div>

        {/* Stats */}
        <div className="flex justify-between w-full max-w-[400px] border-y border-white/5 py-4">
            <div className="flex flex-col items-start">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Score</span>
                <span className="text-2xl font-mono leading-none">{score.toString().padStart(4, '0')}</span>
            </div>
            <div className="flex items-center gap-2">
                 <Trophy className="text-purple-400 w-5 h-5 shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Best</span>
                    <span className="text-2xl font-mono leading-none">{highScore.toString().padStart(4, '0')}</span>
                </div>
            </div>
        </div>

        {/* Game Container */}
        <div id="game-canvas-container" className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="relative bg-[#0a0a0f] rounded-lg border border-white/10 shadow-2xl"
          />

          <AnimatePresence>
            {gameState !== 'PLAYING' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg z-20"
              >
                {gameState === 'START' && (
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold uppercase italic tracking-tight">Ready to Run?</h2>
                        <p className="text-gray-400 text-sm max-w-[200px] mx-auto uppercase tracking-wide">Use Arrow Keys to Navigate the Void</p>
                    </div>
                    <button 
                      id="start-game"
                      onClick={resetGame}
                      className="group relative px-8 py-3 bg-cyan-500 text-black font-black uppercase italic tracking-tighter hover:bg-cyan-400 transition-all flex items-center gap-3 active:scale-95"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Initialize
                      <div className="absolute top-0 right-0 w-2 h-2 bg-black translate-x-1/2 -translate-y-1/2 rotate-45" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 bg-black -translate-x-1/2 translate-y-1/2 rotate-45" />
                    </button>
                  </div>
                )}

                {gameState === 'GAMEOVER' && (
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-red-500 uppercase italic tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">System Defeat</h2>
                        <p className="text-gray-400 text-sm uppercase tracking-wide">Final Score: {score}</p>
                    </div>
                    <button 
                      id="restart-game"
                      onClick={resetGame}
                      className="group relative px-8 py-3 bg-purple-500 text-white font-black uppercase italic tracking-tighter hover:bg-purple-400 transition-all flex items-center gap-3 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reboot
                      <div className="absolute top-0 right-0 w-2 h-2 bg-black translate-x-1/2 -translate-y-1/2 rotate-45" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 bg-black -translate-x-1/2 translate-y-1/2 rotate-45" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls Hint */}
        <div className="flex gap-4 opacity-40 hover:opacity-100 transition-opacity">
            {['↑', '←', '↓', '→'].map(key => (
                 <div key={key} className="w-8 h-8 rounded border border-white/20 flex items-center justify-center font-mono text-sm leading-none">
                    {key}
                 </div>
            ))}
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
};
