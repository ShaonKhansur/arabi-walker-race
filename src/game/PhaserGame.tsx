import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene, GameMode, GameStateUpdate } from './GameScene';

interface PhaserGameProps {
  mode: GameMode;
  onStateUpdate: (state: GameStateUpdate) => void;
  onGameOver: (score: number, distance: number, winner: 'player' | 'arabi') => void;
  gameRef: React.MutableRefObject<Phaser.Game | null>;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ mode, onStateUpdate, onGameOver, gameRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onStateUpdateRef = useRef(onStateUpdate);
  const onGameOverRef = useRef(onGameOver);

  onStateUpdateRef.current = onStateUpdate;
  onGameOverRef.current = onGameOver;

  const stableStateUpdate = (state: GameStateUpdate) => {
    onStateUpdateRef.current?.(state);
  };

  const stableGameOver = (score: number, distance: number, winner: 'player' | 'arabi') => {
    onGameOverRef.current?.(score, distance, winner);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 1280,
      height: 720,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      render: {
        pixelArt: false,
        antialias: true,
      },
      scene: [GameScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Start with initial mode data
    game.events.once('ready', () => {
      const scene = game.scene.getScene('GameScene') as GameScene;
      if (scene) {
        scene.setCallbacks(stableStateUpdate, stableGameOver);
      }
      game.scene.start('GameScene', {
        mode,
        autoStart: false,
        onStateUpdate: stableStateUpdate,
        onGameOver: stableGameOver,
      });
    });

    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.refresh();
      }
    };
    window.addEventListener('resize', handleResize);
    const onOrientation = () => {
      setTimeout(handleResize, 150);
      setTimeout(handleResize, 400);
    };
    window.addEventListener('orientationchange', onOrientation);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', onOrientation);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // When mode changes externally
  useEffect(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (scene) {
        scene.setCallbacks(stableStateUpdate, stableGameOver);
        scene.setMode(mode);
        // Only update character sprite and mode; DO NOT auto-restart or start running in background
      }
    }
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden"
    />
  );
};

