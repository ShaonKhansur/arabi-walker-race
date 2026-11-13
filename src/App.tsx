import React, { useState, useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import { GameMode, GameStateUpdate, GameScene } from './game/GameScene';
import { HUDOverlay } from './components/HUDOverlay';
import { ModeSelectModal } from './components/ModeSelectModal';
import { GameOverModal } from './components/GameOverModal';
import { OrientationPrompt } from './components/OrientationPrompt';
import { IOSInstallModal } from './components/IOSInstallModal';
import { InAppBrowserGuideModal } from './components/InAppBrowserGuideModal';
import { SoundManager } from './game/SoundManager';
import { usePWAInstall } from './hooks/usePWAInstall';

export const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>('araf');
  const [isModeModalOpen, setIsModeModalOpen] = useState<boolean>(true); // Open on first load
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [gameOverWinner, setGameOverWinner] = useState<'player' | 'arabi'>('player');
  const [lastScore, setLastScore] = useState<number>(0);
  const [lastDistance, setLastDistance] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  const {
    isInstallable,
    isInstalled,
    isIOS,
    isInApp,
    inAppBrowserName,
    showIOSGuide,
    setShowIOSGuide,
    showInAppGuide,
    setShowInAppGuide,
    triggerInstall,
  } = usePWAInstall();

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

  const handleStartGame = () => {
    setIsGameOverModalOpen(false);
    setIsModeModalOpen(false);
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene) {
        scene.startGame();
      }
    }
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
        scene.restartGame(true);
      }
    }
  };

  const handleRestart = () => {
    setIsGameOverModalOpen(false);
    setIsModeModalOpen(false);
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene) {
        scene.restartGame(true);
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

  const handleScreenTap = (e: React.PointerEvent) => {
    // Only jump if game is started and modal is not open
    if (isModeModalOpen || isGameOverModalOpen) return;
    SoundManager.getInstance().ensureContext();

    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.closest('button') ||
        target.closest('[data-no-jump]') ||
        target.closest('.modal-content') ||
        target.closest('input'))
    ) {
      return;
    }

    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene && typeof scene.playerJump === 'function') {
        scene.playerJump();
      }
    }
  };

  return (
    <div
      onPointerDown={handleScreenTap}
      className="fixed inset-0 w-full h-full h-[100dvh] overflow-hidden bg-slate-950 font-bengali touch-none select-none"
    >
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
        isInstallable={isInstallable}
        onInstallClick={triggerInstall}
        onOpenModeSelect={() => setIsModeModalOpen(true)}
        onRestart={handleRestart}
      />

      {/* Mode Select Modal */}
      {isModeModalOpen && (
        <ModeSelectModal
          currentMode={mode}
          isInstallable={isInstallable}
          onInstallClick={triggerInstall}
          onSelectMode={handleSelectMode}
          onClose={handleStartGame}
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
      <OrientationPrompt
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isInApp={isInApp}
        inAppBrowserName={inAppBrowserName}
        isIOS={isIOS}
        onInstallClick={triggerInstall}
        onOpenInAppGuide={() => setShowInAppGuide(true)}
      />

      {/* iOS PWA Install Guide Modal (Safari) */}
      <IOSInstallModal
        isOpen={showIOSGuide}
        onClose={() => setShowIOSGuide(false)}
      />

      {/* In-App Browser (Messenger / Facebook / Instagram) Escape Guide */}
      <InAppBrowserGuideModal
        isOpen={showInAppGuide}
        onClose={() => setShowInAppGuide(false)}
        isIOS={isIOS}
        browserName={inAppBrowserName}
      />
    </div>
  );
};

