import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';

const SnakeGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [level, setLevel] = useState(1);
  const [selectedStartLevel, setSelectedStartLevel] = useState(1);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [walls, setWalls] = useState([]);
  const [dimensions, setDimensions] = useState({ gridSize: 20, cellSize: 25 });
  const directionRef = useRef({ x: 1, y: 0 });
  const gameLoopRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const availableSpace = Math.min(width - 40, height - 250);
      
      let gridSize, cellSize;
      if (width < 640) {
        gridSize = 15;
        cellSize = Math.floor(availableSpace / gridSize);
      } else {
        gridSize = 20;
        cellSize = Math.min(25, Math.floor(availableSpace / gridSize));
      }
      
      setDimensions({ gridSize, cellSize });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const GRID_SIZE = dimensions.gridSize;
  const CELL_SIZE = dimensions.cellSize;

  const getRequiredScore = (lvl) => {
    return 3 + (lvl * 2);
  };

  const generateSafeStartPosition = (levelWalls, gridSize) => {
    const safePadding = 3;
    let attempts = 0;
    let safePos;
    
    while (attempts < 100) {
      safePos = {
        x: Math.floor(Math.random() * (gridSize - 2 * safePadding)) + safePadding,
        y: Math.floor(Math.random() * (gridSize - 2 * safePadding)) + safePadding
      };
      
      const isSafe = !levelWalls.some(wall => {
        const distance = Math.abs(wall.x - safePos.x) + Math.abs(wall.y - safePos.y);
        return distance < 4;
      });
      
      if (isSafe) {
        return safePos;
      }
      attempts++;
    }
    
    return { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) };
  };

  const generateLevelWalls = (lvl, gridSize) => {
    const wallsArray = [];
    const maxIndex = gridSize - 1;
    
    if (lvl === 1) {
      return [];
    } else if (lvl === 2) {
      
      const cornerSize = Math.max(2, Math.floor(gridSize * 0.15));
      for (let i = 0; i < cornerSize; i++) {
        wallsArray.push({ x: i, y: 0 });
        wallsArray.push({ x: maxIndex - i, y: 0 });
        wallsArray.push({ x: 0, y: i });
        wallsArray.push({ x: maxIndex, y: i });
        wallsArray.push({ x: i, y: maxIndex });
        wallsArray.push({ x: maxIndex - i, y: maxIndex });
        wallsArray.push({ x: 0, y: maxIndex - i });
        wallsArray.push({ x: maxIndex, y: maxIndex - i });
      }
    } else if (lvl === 3) {
     
      for (let i = 0; i < gridSize; i++) {
        wallsArray.push({ x: 0, y: i }, { x: maxIndex, y: i });
        wallsArray.push({ x: i, y: 0 }, { x: i, y: maxIndex });
      }
    } else if (lvl === 4) {
     
      for (let i = 0; i < gridSize; i++) {
        wallsArray.push({ x: 0, y: i }, { x: maxIndex, y: i });
        wallsArray.push({ x: i, y: 0 }, { x: i, y: maxIndex });
      }
      const center = Math.floor(gridSize / 2);
      const obstacleSize = Math.max(1, Math.floor(gridSize * 0.1));
      for (let i = 0; i < obstacleSize; i++) {
        for (let j = 0; j < obstacleSize; j++) {
          wallsArray.push({ x: center - i, y: center - j });
        }
      }
    } else if (lvl === 5) {
      for (let i = 0; i < gridSize; i++) {
        wallsArray.push({ x: 0, y: i }, { x: maxIndex, y: i });
        wallsArray.push({ x: i, y: 0 }, { x: i, y: maxIndex });
      }
      const quarter = Math.floor(gridSize / 4);
      const threeQuarter = Math.floor(3 * gridSize / 4);
      wallsArray.push(
        { x: quarter, y: quarter }, { x: threeQuarter, y: quarter },
        { x: quarter, y: threeQuarter }, { x: threeQuarter, y: threeQuarter }
      );
    } else if (lvl === 6) {
      
      for (let i = 0; i < gridSize; i++) {
        wallsArray.push({ x: 0, y: i }, { x: maxIndex, y: i });
        wallsArray.push({ x: i, y: 0 }, { x: i, y: maxIndex });
      }
      const barY1 = Math.floor(gridSize * 0.3);
      const barY2 = Math.floor(gridSize * 0.65);
      const barStart1 = Math.floor(gridSize * 0.15);
      const barEnd1 = Math.floor(gridSize * 0.35);
      const barStart2 = Math.floor(gridSize * 0.65);
      const barEnd2 = Math.floor(gridSize * 0.85);
      
      for (let i = barStart1; i < barEnd1; i++) {
        wallsArray.push({ x: i, y: barY1 });
        wallsArray.push({ x: i, y: barY2 });
      }
      for (let i = barStart2; i < barEnd2; i++) {
        wallsArray.push({ x: i, y: barY1 });
        wallsArray.push({ x: i, y: barY2 });
      }
    } else if (lvl === 7) {
      
      for (let i = 0; i < gridSize; i++) {
        wallsArray.push({ x: 0, y: i }, { x: maxIndex, y: i });
        wallsArray.push({ x: i, y: 0 }, { x: i, y: maxIndex });
      }
      const barX1 = Math.floor(gridSize * 0.3);
      const barX2 = Math.floor(gridSize * 0.65);
      const barStart1 = Math.floor(gridSize * 0.15);
      const barEnd1 = Math.floor(gridSize * 0.35);
      const barStart2 = Math.floor(gridSize * 0.65);
      const barEnd2 = Math.floor(gridSize * 0.85);
      
      for (let i = barStart1; i < barEnd1; i++) {
        wallsArray.push({ x: barX1, y: i });
        wallsArray.push({ x: barX2, y: i });
      }
      for (let i = barStart2; i < barEnd2; i++) {
        wallsArray.push({ x: barX1, y: i });
        wallsArray.push({ x: barX2, y: i });
      }
    } else if (lvl === 8) {
      
      for (let i = 0; i < gridSize; i++) {
        wallsArray.push({ x: 0, y: i }, { x: maxIndex, y: i });
        wallsArray.push({ x: i, y: 0 }, { x: i, y: maxIndex });
      }
      const center = Math.floor(gridSize / 2);
      const barLength = Math.floor(gridSize * 0.15);
      
      for (let i = center - barLength; i < center + barLength; i++) {
        if (i >= 0 && i < gridSize && Math.abs(i - center) > 2) {
          wallsArray.push({ x: i, y: center });
          wallsArray.push({ x: center, y: i });
        }
      }
      
      const quarter = Math.floor(gridSize / 4);
      const threeQuarter = Math.floor(3 * gridSize / 4);
      wallsArray.push(
        { x: quarter, y: quarter }, { x: threeQuarter, y: quarter },
        { x: quarter, y: threeQuarter }, { x: threeQuarter, y: threeQuarter }
      );
    } else if (lvl === 9) {
     
      for (let i = 0; i < gridSize; i++) {
        wallsArray.push({ x: 0, y: i }, { x: maxIndex, y: i });
        wallsArray.push({ x: i, y: 0 }, { x: i, y: maxIndex });
      }
      const barY1 = Math.floor(gridSize * 0.35);
      const barY2 = Math.floor(gridSize * 0.6);
      const barStart = Math.floor(gridSize * 0.2);
      const barEnd = Math.floor(gridSize * 0.4);
      const barStart2 = Math.floor(gridSize * 0.6);
      const barEnd2 = Math.floor(gridSize * 0.8);
      
      for (let i = barStart; i < barEnd; i++) {
        wallsArray.push({ x: i, y: barY1 });
        wallsArray.push({ x: i, y: barY2 });
      }
      for (let i = barStart2; i < barEnd2; i++) {
        wallsArray.push({ x: i, y: barY1 });
        wallsArray.push({ x: i, y: barY2 });
      }
      
      const center = Math.floor(gridSize / 2);
      const topY = Math.floor(gridSize * 0.2);
      const bottomY = Math.floor(gridSize * 0.75);
      wallsArray.push({ x: center, y: topY }, { x: center - 1, y: topY });
      wallsArray.push({ x: center, y: bottomY }, { x: center - 1, y: bottomY });
    } else if (lvl === 10) {
     
      for (let i = 0; i < gridSize; i++) {
        wallsArray.push({ x: 0, y: i }, { x: maxIndex, y: i });
        wallsArray.push({ x: i, y: 0 }, { x: i, y: maxIndex });
      }
      const barY1 = Math.floor(gridSize * 0.3);
      const barY2 = Math.floor(gridSize * 0.65);
      const barStart = Math.floor(gridSize * 0.2);
      const barEnd = Math.floor(gridSize * 0.4);
      const barStart2 = Math.floor(gridSize * 0.6);
      const barEnd2 = Math.floor(gridSize * 0.8);
      
      for (let i = barStart; i < barEnd; i++) {
        wallsArray.push({ x: i, y: barY1 });
        wallsArray.push({ x: i, y: barY2 });
      }
      for (let i = barStart2; i < barEnd2; i++) {
        wallsArray.push({ x: i, y: barY1 });
        wallsArray.push({ x: i, y: barY2 });
      }
      
      const center = Math.floor(gridSize / 2);
      const midY1 = Math.floor(gridSize * 0.4);
      const midY2 = Math.floor(gridSize * 0.55);
      wallsArray.push({ x: center, y: midY1 }, { x: center, y: midY2 });
    } else if (lvl === 11) {
     
      for (let i = 0; i < gridSize; i++) {
        wallsArray.push({ x: 0, y: i }, { x: maxIndex, y: i });
        wallsArray.push({ x: i, y: 0 }, { x: i, y: maxIndex });
      }
      
      const cornerDist = Math.floor(gridSize * 0.2);
      const cornerLen = Math.floor(gridSize * 0.15);     
    
      for (let i = cornerDist; i < cornerDist + cornerLen; i++) {
        wallsArray.push({ x: i, y: cornerDist });
        wallsArray.push({ x: cornerDist, y: i });
      }
      
      for (let i = maxIndex - cornerDist - cornerLen; i < maxIndex - cornerDist; i++) {
        wallsArray.push({ x: i, y: cornerDist });
        wallsArray.push({ x: maxIndex - cornerDist, y: i });
      }
      
      for (let i = cornerDist; i < cornerDist + cornerLen; i++) {
        wallsArray.push({ x: cornerDist, y: maxIndex - i });
        wallsArray.push({ x: i, y: maxIndex - cornerDist });
      }
      
      for (let i = maxIndex - cornerDist - cornerLen; i < maxIndex - cornerDist; i++) {
        wallsArray.push({ x: maxIndex - cornerDist, y: maxIndex - (i - (maxIndex - cornerDist - cornerLen)) - cornerDist });
        wallsArray.push({ x: i, y: maxIndex - cornerDist });
      }
      
      const center = Math.floor(gridSize / 2);
      const barStart = Math.floor(gridSize * 0.3);
      const barEnd = Math.floor(gridSize * 0.7);
      for (let i = barStart; i < barEnd; i++) {
        wallsArray.push({ x: i, y: center });
      }
    } else if (lvl >= 12) {

      for (let i = 0; i < gridSize; i++) {
        wallsArray.push({ x: 0, y: i }, { x: maxIndex, y: i });
        wallsArray.push({ x: i, y: 0 }, { x: i, y: maxIndex });
      }
      
      const topY = Math.floor(gridSize * 0.2);
      for (let i = Math.floor(gridSize * 0.2); i < Math.floor(gridSize * 0.8); i++) {
        wallsArray.push({ x: i, y: topY });
      }
      
      const midY1 = Math.floor(gridSize * 0.4);
      const midY2 = Math.floor(gridSize * 0.6);
      const barStart1 = Math.floor(gridSize * 0.2);
      const barEnd1 = Math.floor(gridSize * 0.45);
      const barStart2 = Math.floor(gridSize * 0.55);
      const barEnd2 = Math.floor(gridSize * 0.8);
      
      for (let i = barStart1; i < barEnd1; i++) {
        wallsArray.push({ x: i, y: midY1 });
        wallsArray.push({ x: i, y: midY2 });
      }
      for (let i = barStart2; i < barEnd2; i++) {
        wallsArray.push({ x: i, y: midY1 });
        wallsArray.push({ x: i, y: midY2 });
      }
      
      const bottomY = Math.floor(gridSize * 0.75);
      for (let i = Math.floor(gridSize * 0.2); i < Math.floor(gridSize * 0.8); i++) {
        wallsArray.push({ x: i, y: bottomY });
      }
    }
    
    return wallsArray;
  };

  useEffect(() => {
    setWalls(generateLevelWalls(level, GRID_SIZE));
  }, [level, GRID_SIZE]);

  useEffect(() => {
    if (!gameStarted || gameOver || showLevelComplete) return;

    const handleKeyPress = (e) => {
      const key = e.key;
      const currentDir = directionRef.current;

      if (key === 'ArrowUp' && currentDir.y === 0) {
        directionRef.current = { x: 0, y: -1 };
      } else if (key === 'ArrowDown' && currentDir.y === 0) {
        directionRef.current = { x: 0, y: 1 };
      } else if (key === 'ArrowLeft' && currentDir.x === 0) {
        directionRef.current = { x: -1, y: 0 };
      } else if (key === 'ArrowRight' && currentDir.x === 0) {
        directionRef.current = { x: 1, y: 0 };
      }
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const currentDir = directionRef.current;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30 && currentDir.x === 0) {
          directionRef.current = { x: 1, y: 0 };
        } else if (deltaX < -30 && currentDir.x === 0) {
          directionRef.current = { x: -1, y: 0 };
        }
      } else {
        if (deltaY > 30 && currentDir.y === 0) {
          directionRef.current = { x: 0, y: 1 };
        } else if (deltaY < -30 && currentDir.y === 0) {
          directionRef.current = { x: 0, y: -1 };
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameStarted, gameOver, showLevelComplete, touchStart]);

  useEffect(() => {
    if (!gameStarted || gameOver || showLevelComplete) return;

    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        let newHead = {
          x: prevSnake[0].x + directionRef.current.x,
          y: prevSnake[0].y + directionRef.current.y
        };

        if (walls.some(wall => wall.x === newHead.x && wall.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        if (level === 1 || level === 2) {
          if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
          if (newHead.x >= GRID_SIZE) newHead.x = 0;
          if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
          if (newHead.y >= GRID_SIZE) newHead.y = 0;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 1;
          setScore(newScore);
          
          if (newScore >= getRequiredScore(level)) {
            setShowLevelComplete(true);
            return newSnake;
          }
          
          generateFood(newSnake);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 400);

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted, gameOver, showLevelComplete, score, level, walls, food, GRID_SIZE]);

  const generateFood = (currentSnake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (
      currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      walls.some(wall => wall.x === newFood.x && wall.y === newFood.y)
    );
    setFood(newFood);
  };

  const startGame = () => {
    const levelWalls = generateLevelWalls(selectedStartLevel, GRID_SIZE);
    const startPos = generateSafeStartPosition(levelWalls, GRID_SIZE);
    
    setGameStarted(true);
    setSnake([startPos]);
    setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 };
    setScore(0);
    setLevel(selectedStartLevel);
    setGameOver(false);
    setShowLevelComplete(false);
    
    
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (
      (newFood.x === startPos.x && newFood.y === startPos.y) ||
      levelWalls.some(wall => wall.x === newFood.x && wall.y === newFood.y)
    );
    setFood(newFood);
  };

  const nextLevel = () => {
    const newLevel = level + 1;
    const levelWalls = generateLevelWalls(newLevel, GRID_SIZE);
    const startPos = generateSafeStartPosition(levelWalls, GRID_SIZE);
    
    setLevel(newLevel);
    setSnake([startPos]);
    setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 };
    setScore(0);
    setShowLevelComplete(false);
     
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (
      (newFood.x === startPos.x && newFood.y === startPos.y) ||
      levelWalls.some(wall => wall.x === newFood.x && wall.y === newFood.y)
    );
    setFood(newFood);
  };

  const resetGame = () => {
    setGameStarted(false);
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 };
    setScore(0);
    setLevel(1);
    setSelectedStartLevel(1);
    setGameOver(false);
    setShowLevelComplete(false);
  };

  if (!gameStarted) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-12 max-w-xl w-full my-8">
          <h1 className="text-4xl sm:text-6xl font-black text-center mb-6 sm:mb-8" style={{ color: '#00ff88' }}>
            SNAKE
          </h1>

          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="text-6xl sm:text-9xl">🐍</div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-base sm:text-lg font-bold mb-3">Select Starting Level:</label>
            <select
              value={selectedStartLevel}
              onChange={(e) => setSelectedStartLevel(Number(e.target.value))}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 text-lg sm:text-xl font-semibold rounded-xl border-2 border-gray-300 focus:border-green-500 focus:outline-none"
              style={{ color: '#00ff88' }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((lvl) => (
                <option key={lvl} value={lvl}>Level {lvl}</option>
              ))}
            </select>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 sm:py-5 px-6 sm:px-8 text-white text-2xl sm:text-3xl font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            style={{ backgroundColor: '#00ff88' }}
          >
            Start Game
          </button>

          <div className="mt-6 rounded-2xl p-4 sm:p-6" style={{ backgroundColor: '#f5f5f5' }}>
            <h3 className="font-bold text-gray-800 mb-3 text-lg sm:text-xl">How to Play:</h3>
            <ul className="text-gray-700 space-y-2 text-base sm:text-lg">
              <li>🔴 Eat glowing food to grow and score points</li>
              <li>💻 Desktop: Use Arrow Keys (⬆️⬇️⬅️➡️) to move</li>
              <li>📱 Mobile: Swipe in any direction to control the snake</li>
              <li>🧱 Avoid walls and yourself</li>
              <li>🎯 Complete levels by reaching the target score</li>
            </ul>
          </div>
        </div>

        <div className="text-white text-sm sm:text-lg flex items-center gap-2 mb-0">
          Made with <Heart size={20} fill="currentColor" /> by YUSRA
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-8 px-4" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="relative">
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl text-center max-w-sm">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">💀</div>
              <div className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4" style={{ color: '#ff4444' }}>
                Game Over!
              </div>
              <div className="text-lg sm:text-2xl mb-2 text-gray-700">
                Level: {level}
              </div>
              <div className="text-lg sm:text-2xl mb-4 sm:mb-6 text-gray-700">
                Score: {score}
              </div>
              <button
                onClick={resetGame}
                className="px-6 sm:px-8 py-3 sm:py-4 text-white text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                style={{ backgroundColor: '#00ff88' }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {showLevelComplete && (
          <div className="absolute inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl text-center max-w-sm">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
              <div className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4" style={{ color: '#00ff88' }}>
                Level {level} Complete!
              </div>
              <div className="text-lg sm:text-2xl mb-4 sm:mb-6 text-gray-700">
                Score: {score}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={resetGame}
                  className="px-6 sm:px-8 py-3 sm:py-4 text-white text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  style={{ backgroundColor: '#ff4444' }}
                >
                  Play Again
                </button>
                <button
                  onClick={nextLevel}
                  className="px-6 sm:px-8 py-3 sm:py-4 text-white text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  style={{ backgroundColor: '#00ff88' }}
                >
                  Next Level
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 sm:mb-6 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
          <div className="bg-white rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2 sm:py-4 shadow-xl">
            <div className="text-xs sm:text-sm font-semibold text-gray-600">Score</div>
            <div className="text-2xl sm:text-4xl font-black" style={{ color: '#00ff88' }}>
              {score}/{getRequiredScore(level)}
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2 sm:py-4 shadow-xl">
            <div className="text-xs sm:text-sm font-semibold text-gray-600">Level</div>
            <div className="text-2xl sm:text-4xl font-black" style={{ color: '#00ff88' }}>
              {level}
            </div>
          </div>

          <button
            onClick={resetGame}
            className="px-4 sm:px-6 py-2 sm:py-3 text-white text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            style={{ backgroundColor: '#ff4444' }}
          >
            End Game
          </button>
        </div>

        <div
          className="relative rounded-2xl"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            backgroundColor: '#000000',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
            boxShadow: 'inset 0 0 50px rgba(0,212,255,0.1), 0 0 50px rgba(0,0,0,0.8)'
          }}
        >
          {walls.map((wall, index) => (
            <div
              key={index}
              className="absolute text-2xl flex items-center justify-center"
              style={{
                left: wall.x * CELL_SIZE,
                top: wall.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE
              }}
            >
              🧱
            </div>
          ))}

          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                left: segment.x * CELL_SIZE + 2,
                top: segment.y * CELL_SIZE + 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
                backgroundColor: index === 0 ? '#00ff88' : '#00ff88',
                borderRadius: '6px',
                boxShadow: `
                  0 0 20px ${index === 0 ? '#00ff88' : '#00ff88'},
                  0 0 40px ${index === 0 ? '#00ff88' : '#00ff88'},
                  inset 0 0 10px rgba(255,255,255,0.3)
                `,
                transition: 'all 0.05s linear'
              }}
            >
              {index === 0 && (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '5px'
                }}>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    border: '1px solid #000'
                  }} />
                  <div style={{
                    width: '4px',
                    height: '4px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    border: '1px solid #000'
                  }} />
                </div>
              )}
            </div>
          ))}

          <div
            className="absolute"
            style={{
              left: food.x * CELL_SIZE + 2,
              top: food.y * CELL_SIZE + 2,
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              backgroundColor: '#ff0055',
              borderRadius: '50%',
              boxShadow: `
                0 0 20px #ff0055,
                0 0 40px #ff0055,
                0 0 60px #ff0055,
                inset 0 0 10px rgba(255,255,255,0.5)
              `,
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default SnakeGame;
