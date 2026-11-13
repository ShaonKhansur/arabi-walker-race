import React, { useState, useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import { GameMode, GameStateUpdate, GameScene } from './game/GameScene';
import { HUDOverlay } from './components/HUDOverlay';
import { ModeSelectModal } from './components/ModeSelectModal';
import { GameOverModal } from './components/GameOverModal';
import { OrientationPrompt } from './components/OrientationPrompt';

export const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>('araf');
  const [isModeModalOpen, setIsModeModalOpen] = useState<boolean>(true); // Open on first load
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [gameOverWinner, setGameOverWinner] = useState<'player' | 'arabi'>('player');
  const [lastScore, setLastScore] = useState<number>(0);
  const [lastDistance, setLastDistance] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  const [gameState, setGameState] = useState<GameStateUpdate>({
    score: 0,
    distance: 0,
    distanceToArabi: 15,
    arabiBoost: 0,
    mode: 'araf',
    speech: null,
  });

  const gameRef = useRef<Phaser.Game | null>(null);

  // Load high score from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arabi_walker_high_score');
      if (saved) {
        setHighScore(parseInt(saved, 10));
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const handleGameOver = (finalScore: number, finalDistance: number, winner: 'player' | 'arabi' = 'player') => {
    setLastScore(finalScore);
    setLastDistance(finalDistance);
    setGameOverWinner(winner);

    if (finalScore > highScore) {
      setHighScore(finalScore);
      setIsNewHigh(true);
      try {
        localStorage.setItem('arabi_walker_high_score', finalScore.toString());
      } catch {
        // ignore
      }
    } else {
      setIsNewHigh(false);
    }

    setIsModeModalOpen(false);
    setIsGameOverModalOpen(true);
  };

  // Global event listener fallback to guarantee game-over modal always triggers
  useEffect(() => {
    const onGameOverEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ score: number; distance: number; winner: 'player' | 'arabi' }>).detail;
      if (detail) {
        handleGameOver(detail.score, detail.distance, detail.winner);
      }
    };
    window.addEventListener('arabi-game-over', onGameOverEvent);
    return () => window.removeEventListener('arabi-game-over', onGameOverEvent);
  }, [highScore]);

  const handleStateUpdate = (newState: GameStateUpdate) => {
    setGameState((prev) => ({
      ...newState,
      speech: newState.speech || prev.speech,
    }));
  };

  const handleSelectModeAndRestart = (newMode: GameMode) => {
    setMode(newMode);
    setGameState((prev) => ({ ...prev, mode: newMode }));
    setIsGameOverModalOpen(false);
    setIsModeModalOpen(false);
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene) {
        scene.setMode(newMode);
        scene.restartGame();
      }
    }
  };

  const handleRestart = () => {
    setIsGameOverModalOpen(false);
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene) {
        scene.restartGame();
      }
    }
  };

  const handleSelectMode = (newMode: GameMode) => {
    setMode(newMode);
    setGameState((prev) => ({ ...prev, mode: newMode }));
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene) {
        scene.setMode(newMode);
      }
    }
  };

  const handleCloseModeModal = () => {
    setIsModeModalOpen(false);
    handleRestart();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-bengali">
      {/* Phaser Canvas */}
      <PhaserGame
        mode={mode}
        onStateUpdate={handleStateUpdate}
        onGameOver={handleGameOver}
        gameRef={gameRef}
      />

      {/* React HUD Overlay */}
      <HUDOverlay
        currentMode={mode}
        gameState={gameState}
        highScore={highScore}
        onOpenModeSelect={() => setIsModeModalOpen(true)}
        onRestart={handleRestart}
      />

      {/* Mode Select Modal */}
      {isModeModalOpen && (
        <ModeSelectModal
          currentMode={mode}
          onSelectMode={handleSelectMode}
          onClose={handleCloseModeModal}
        />
      )}

      {/* Game Over Modal */}
      {isGameOverModalOpen && (
        <GameOverModal
          winner={gameOverWinner}
          mode={mode}
          score={lastScore}
          distance={lastDistance}
          highScore={highScore}
          isNewHigh={isNewHigh}
          onRestart={handleRestart}
          onSelectModeAndRestart={handleSelectModeAndRestart}
          onOpenModeSelect={() => {
            setIsGameOverModalOpen(false);
            setIsModeModalOpen(true);
          }}
        />
      )}

      {/* Landscape Orientation Prompt on Mobile */}
      <OrientationPrompt />
    </div>
  );
};

