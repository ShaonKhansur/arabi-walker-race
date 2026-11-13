import Phaser from 'phaser';
import { SoundManager } from './SoundManager';

export type GameMode = 'araf' | 'adiba' | 'anam';

export interface GameStateUpdate {
  score: number;
  distance: number; // Distance player has run (meters)
  distanceToArabi: number; // Gap between Player and Arabi (meters, 0 = caught!)
  arabiBoost: number; // 0 to 100% (100% = Arabi wins!)
  mode: GameMode;
  speech: { character: 'anam' | 'araf' | 'adiba' | 'arabi'; text: string; id: number } | null;
}

export class GameScene extends Phaser.Scene {
  private bg!: Phaser.GameObjects.TileSprite;
  private player!: Phaser.Physics.Arcade.Sprite; // The Player (Araf, Adiba, or Anam)
  private arabi!: Phaser.GameObjects.Sprite; // Arabi ahead in walker

  private playerShadow!: Phaser.GameObjects.Image;
  private arabiShadow!: Phaser.GameObjects.Image;

  // Floating Boost Bar over Arabi's Head
  private arabiBoostContainer!: Phaser.GameObjects.Container;
  private arabiBoostBg!: Phaser.GameObjects.Graphics;
  private arabiBoostGfx!: Phaser.GameObjects.Graphics;
  private arabiBoostLabel!: Phaser.GameObjects.Text;

  private thrownToys!: Phaser.Physics.Arcade.Group; // Toys Arabi flings backward
  private milkBottles!: Phaser.Physics.Arcade.Group; // Floating milk bottles Arabi drinks

  private gameMode: GameMode = 'araf';
  private score: number = 0;
  private totalRunDistance: number = 0;
  private arabiBoost: number = 0; // 0 to 100%
  private isGameOver: boolean = false;
  private isGameStarted: boolean = false;
  private isStumbling: boolean = false;
  private catchUpTimer: number = 0; // Comeback speed surge after hit
  private invulnerableTimer: number = 0; // Hit recovery invulnerability
  private toyTimerEvent?: Phaser.Time.TimerEvent;
  private milkTimerEvent?: Phaser.Time.TimerEvent;

  private jumpCount: number = 0;
  private maxJumps: number = 2; // double hop!

  private speechTimer: number = 0;
  private speechCounter: number = 0;
  private dustTimer: number = 0;
  private onStateUpdate?: (state: GameStateUpdate) => void;
  private onGameOver?: (score: number, distance: number, winner: 'player' | 'arabi') => void;

  private floorY: number = 645;
  private emitterDust?: Phaser.GameObjects.Particles.ParticleEmitter;
  private emitterStars?: Phaser.GameObjects.Particles.ParticleEmitter;

  public get characterConfig() {
    switch (this.gameMode) {
      case 'araf': // 5yo boy - Easy & Fun
        return {
          baseSpeed: 290,
          baseAdvance: 62,
          catchUpBoost: 105,
          toyInterval: 3400,
          milkInterval: 6500,
          jumpPower: -610,
          stumbleDuration: 700,
          stumbleBack: 18,
          scale: 0.52,
          originY: 396 / 420,
        };
      case 'adiba': // 9yo sister - Medium
        return {
          baseSpeed: 330,
          baseAdvance: 72,
          catchUpBoost: 115,
          toyInterval: 2800,
          milkInterval: 5800,
          jumpPower: -595,
          stumbleDuration: 750,
          stumbleBack: 22,
          scale: 0.55,
          originY: 430 / 450,
        };
      case 'anam': // 13yo brother - Challenge
        return {
          baseSpeed: 370,
          baseAdvance: 82,
          catchUpBoost: 125,
          toyInterval: 2400,
          milkInterval: 5200,
          jumpPower: -585,
          stumbleDuration: 750,
          stumbleBack: 25,
          scale: 0.60,
          originY: 460 / 480,
        };
    }
  }

  private get playerBaseScale(): number {
    return this.characterConfig.scale;
  }
  private readonly arabiScale = 0.32;

  private baseSpeed: number = 320;
  private currentSpeed: number = 320;

  // Bengali Dialogues
  private arafQuotes = [
    "আরাবি দাঁড়াও, পড়ে যাবা!",
    "আরাবি ওয়াকার থামাও!",
    "আরাবি দাঁড়াও, মিষ্টি চকলেট দিব!",
    "আরাবি আপু থামো! আমি আসছি!"
  ];

  private adibaQuotes = [
    "আরাবি ওয়াকার থামাও, পড়ে যাবা!",
    "আরাবি দাঁড়াও, মিষ্টি চকলেট দিব!",
    "আরাবি আপু থামো! আমি ধরছি!",
    "উফ্! আরাবি সব খেলনা ছুড়ে মারছে!"
  ];

  private anamQuotes = [
    "আরাবি ওয়াকার থামাও, পড়ে যাবা!",
    "এই তো ধরে ফেলেছি! দাঁড়াও!",
    "উরে বাবারে! খেলনা ছুড়ে দিল!",
    "আরাবি থামো, সামনে দেখ!"
  ];

  private arabiQuotes = [
    "হিহিহি! আ-বা-বা! খেলনা ধরো! 🧸",
    "খিলখিলখিল! দুধ খেয়ে নিলাম! 🍼✨",
    "আম-মাম-মাম! আমাকে ধরতে পারবে না! 🏃‍♀️💨",
    "বু-বু-বু! রকেট ওয়াকার! 🎈✨"
  ];

  constructor() {
    super({ key: 'GameScene' });
  }

  public setCallbacks(
    onStateUpdate: (state: GameStateUpdate) => void,
    onGameOver: (score: number, distance: number, winner: 'player' | 'arabi') => void
  ) {
    this.onStateUpdate = onStateUpdate;
    this.onGameOver = onGameOver;
  }

  public init(data?: {
    mode?: GameMode;
    autoStart?: boolean;
    onStateUpdate?: (state: GameStateUpdate) => void;
    onGameOver?: (score: number, distance: number, winner: 'player' | 'arabi') => void;
  }) {
    if (data?.mode) this.gameMode = data.mode;
    if (data?.onStateUpdate) this.onStateUpdate = data.onStateUpdate;
    if (data?.onGameOver) this.onGameOver = data.onGameOver;
    this.isGameStarted = data?.autoStart ?? false;
    this.score = 0;
    this.totalRunDistance = 0;
    this.arabiBoost = 0;
    this.baseSpeed = this.characterConfig.baseSpeed;
    this.currentSpeed = this.baseSpeed;
    this.isGameOver = false;
    this.isStumbling = false;
    this.catchUpTimer = 0;
    this.invulnerableTimer = 0;
    this.jumpCount = 0;
    this.dustTimer = 0;
  }

  public preload() {
    this.load.image('home-bg', '/assets/bg/home-bg.jpg');

    // 6-frame spritesheets (All facing RIGHT)
    this.load.spritesheet('arabi-sheet', '/assets/sprites/arabi-sheet.png', {
      frameWidth: 370,
      frameHeight: 460
    });
    this.load.spritesheet('araf-sheet', '/assets/sprites/araf-sheet.png', {
      frameWidth: 320,
      frameHeight: 420
    });
    this.load.spritesheet('adiba-sheet', '/assets/sprites/adiba-sheet.png', {
      frameWidth: 350,
      frameHeight: 450
    });
    this.load.spritesheet('anam-sheet', '/assets/sprites/anam-sheet.png', {
      frameWidth: 390,
      frameHeight: 480
    });

    this.load.image('character-shadow', '/assets/sprites/character-shadow.png');
    this.load.image('dust-puff', '/assets/sprites/dust-puff.png');

    // Toys Arabi flings backward
    this.load.image('obstacle-blocks', '/assets/sprites/obstacle-blocks.png');
    this.load.image('obstacle-cushion', '/assets/sprites/obstacle-cushion.png');
    this.load.image('obstacle-ball', '/assets/sprites/obstacle-ball.png');
    this.load.image('obstacle-pan', '/assets/sprites/obstacle-pan.png');

    // Milk bottle ahead for Arabi
    this.load.image('item-milk', '/assets/sprites/item-milk.png');
  }

  public create() {
    const { width, height } = this.scale;

    // 1. Scrolling background
    this.bg = this.add.tileSprite(0, 0, width, height, 'home-bg');
    this.bg.setOrigin(0, 0);
    this.bg.setDisplaySize(width, height);

    this.floorY = height - 75; // 645 on 720 canvas

    // 2. Physics groups
    this.thrownToys = this.physics.add.group();
    this.milkBottles = this.physics.add.group();

    // 3. Register 6-frame animations if not already created
    if (!this.anims.exists('arabi-roll')) {
      this.anims.create({
        key: 'arabi-roll',
        frames: this.anims.generateFrameNumbers('arabi-sheet', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
      });
    }

    if (!this.anims.exists('araf-run')) {
      this.anims.create({
        key: 'araf-run',
        frames: this.anims.generateFrameNumbers('araf-sheet', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
      });
    }

    if (!this.anims.exists('adiba-run')) {
      this.anims.create({
        key: 'adiba-run',
        frames: this.anims.generateFrameNumbers('adiba-sheet', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
      });
    }

    if (!this.anims.exists('anam-run')) {
      this.anims.create({
        key: 'anam-run',
        frames: this.anims.generateFrameNumbers('anam-sheet', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
      });
    }

    // 4. Contact Shadows
    this.playerShadow = this.add.image(width * 0.22, this.floorY + 4, 'character-shadow');
    const shadowScaleX = this.gameMode === 'anam' ? 0.90 : this.gameMode === 'adiba' ? 0.82 : 0.75;
    this.playerShadow.setScale(shadowScaleX, 0.38);
    this.playerShadow.setOrigin(0.5, 0.5);
    this.playerShadow.setAlpha(0.60);

    this.arabiShadow = this.add.image(width * 0.72, this.floorY + 4, 'character-shadow');
    this.arabiShadow.setScale(0.60, 0.32);
    this.arabiShadow.setOrigin(0.5, 0.5);
    this.arabiShadow.setAlpha(0.65);

    // 5. The Player (Araf, Adiba, or Anam)
    const playerSheet =
      this.gameMode === 'araf'
        ? 'araf-sheet'
        : this.gameMode === 'adiba'
        ? 'adiba-sheet'
        : 'anam-sheet';
    const playerAnim =
      this.gameMode === 'araf'
        ? 'araf-run'
        : this.gameMode === 'adiba'
        ? 'adiba-run'
        : 'anam-run';
    const playerScale = this.playerBaseScale;

    this.player = this.physics.add.sprite(width * 0.22, this.floorY, playerSheet);
    this.player.setScale(playerScale);

    // Exact floor alignment: origin matches bottom pixel of feet in spritesheet
    // araf-sheet: frame height 420, feet at y=396 -> origin = 396 / 420
    // adiba-sheet: frame height 450, feet at y=430 -> origin = 430 / 450
    // anam-sheet: frame height 480, feet at y=460 -> origin = 460 / 480
    const playerOriginY =
      this.gameMode === 'araf'
        ? 396 / 420
        : this.gameMode === 'adiba'
        ? 430 / 450
        : 460 / 480;
    this.player.setOrigin(0.5, playerOriginY);
    this.player.play(playerAnim);

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setGravityY(1300);
    playerBody.setCollideWorldBounds(true);
    if (this.gameMode === 'araf') {
      playerBody.setSize(180, 330);
      playerBody.setOffset(70, 396 - 330); // 66
    } else if (this.gameMode === 'adiba') {
      playerBody.setSize(190, 350);
      playerBody.setOffset(80, 430 - 350); // 80
    } else {
      playerBody.setSize(200, 380);
      playerBody.setOffset(95, 460 - 380); // 80
    }

    // 6. Arabi (Ahead in Walker)
    // arabi-sheet: frame height 460, wheels at y=438 -> origin = 438 / 460
    this.arabi = this.add.sprite(width * 0.72, this.floorY, 'arabi-sheet');
    this.arabi.setScale(this.arabiScale);
    this.arabi.setOrigin(0.5, 438 / 460);
    this.arabi.play('arabi-roll');

    // 7. Floating Boost Bar Directly Above Arabi's Head
    this.arabiBoostContainer = this.add.container(this.arabi.x, this.floorY - 165);

    this.arabiBoostBg = this.add.graphics();
    this.arabiBoostBg.fillStyle(0x0f172a, 0.88);
    this.arabiBoostBg.lineStyle(2, 0x38bdf8, 1);
    this.arabiBoostBg.fillRoundedRect(-55, -13, 110, 26, 13);
    this.arabiBoostBg.strokeRoundedRect(-55, -13, 110, 26, 13);

    this.arabiBoostGfx = this.add.graphics();

    this.arabiBoostLabel = this.add.text(0, 0, '🍼 বুস্ট ০%', {
      fontFamily: '"Hind Siliguri", sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);

    this.arabiBoostContainer.add([this.arabiBoostBg, this.arabiBoostGfx, this.arabiBoostLabel]);

    // 8. Floor collider for player (aligned exactly with floorY)
    const ground = this.add.rectangle(width / 2, this.floorY + 10, width, 20, 0x000000, 0);
    this.physics.add.existing(ground, true);
    this.physics.add.collider(this.player, ground, () => {
      if (this.player.body && (this.player.body as Phaser.Physics.Arcade.Body).blocked.down) {
        if (this.jumpCount > 0) {
          this.jumpCount = 0;
          this.onPlayerLand();
        }
      }
    });

    // 9. Collisions: Player hits thrown toys!
    this.physics.add.overlap(this.player, this.thrownToys, this.handlePlayerHitToy, undefined, this);

    // 9b. Catch Zone: Player touches Arabi's walker to catch her!
    const arabiCatchZone = this.add.zone(this.arabi.x - 25, this.floorY - 60, 90, 160);
    this.physics.add.existing(arabiCatchZone, true);
    this.physics.add.overlap(this.player, arabiCatchZone, () => {
      if (!this.isGameOver && this.arabiBoost < 100) {
        this.triggerPlayerCatch();
      }
    });

    // 10. Controls: Player Jumps!
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', this.playerJump, this);
      this.input.keyboard.on('keydown-UP', this.playerJump, this);
    }
    this.input.on('pointerdown', () => {
      this.playerJump();
    });

    // 12. Particles
    this.emitterDust = this.add.particles(0, 0, 'dust-puff', {
      lifespan: { min: 250, max: 400 },
      speedX: { min: -140, max: -40 },
      speedY: { min: -30, max: -5 },
      scale: { start: 0.38, end: 0.05 },
      alpha: { start: 0.75, end: 0 },
      emitting: false
    });

    const starGfx = this.make.graphics({ x: 0, y: 0 });
    starGfx.fillStyle(0xfde047, 1);
    starGfx.fillCircle(5, 5, 5);
    starGfx.generateTexture('sparkle-star', 10, 10);

    this.emitterStars = this.add.particles(0, 0, 'sparkle-star', {
      lifespan: 600,
      speed: { min: 80, max: 200 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      emitting: false
    });

    // Start active gameplay if requested, otherwise wait for player to tap start!
    if (this.isGameStarted) {
      this.startActiveGameplay();
    } else {
      if (this.onStateUpdate) {
        this.onStateUpdate({
          score: 0,
          distance: 0,
          distanceToArabi: 15,
          arabiBoost: 0,
          mode: this.gameMode,
          speech: null
        });
      }
    }
  }

  public startGame() {
    if (this.isGameOver) return;
    this.isGameStarted = true;
    this.startActiveGameplay();
  }

  public pauseGame() {
    this.isGameStarted = false;
    if (this.toyTimerEvent) this.toyTimerEvent.paused = true;
    if (this.milkTimerEvent) this.milkTimerEvent.paused = true;
    SoundManager.getInstance().stopBGM();
  }

  public resumeGame() {
    if (this.isGameOver) return;
    this.isGameStarted = true;
    if (this.toyTimerEvent) this.toyTimerEvent.paused = false;
    if (this.milkTimerEvent) this.milkTimerEvent.paused = false;
    SoundManager.getInstance().ensureContext();
    SoundManager.getInstance().startBGM();
  }

  private startActiveGameplay() {
    SoundManager.getInstance().ensureContext();
    SoundManager.getInstance().startBGM();

    const cfg = this.characterConfig;

    // Arabi flings a toy backward periodically
    if (this.toyTimerEvent) this.toyTimerEvent.destroy();
    this.toyTimerEvent = this.time.addEvent({
      delay: cfg.toyInterval,
      callback: this.flingToyFromArabi,
      callbackScope: this,
      loop: true
    });

    // Milk bottle spawns ahead for Arabi
    if (this.milkTimerEvent) this.milkTimerEvent.destroy();
    this.milkTimerEvent = this.time.addEvent({
      delay: cfg.milkInterval,
      callback: this.spawnMilkForArabi,
      callbackScope: this,
      loop: true
    });

    // Opening dialogue: Player calls out to Arabi to stop!
    const startQuote =
      this.gameMode === 'araf'
        ? 'আরাবি দাঁড়াও, পড়ে যাবা! থামো!'
        : this.gameMode === 'adiba'
        ? 'আরাবি আপু থামো! ওয়াকার আস্তে চালাও!'
        : 'আরাবি ওয়াকার থামাও, পড়ে যাবা!';
    this.triggerSpeech(this.gameMode, startQuote);
  }

  public playerJump() {
    if (!this.isGameStarted || this.isGameOver) return;
    SoundManager.getInstance().ensureContext();

    if (this.jumpCount < this.maxJumps) {
      this.jumpCount++;
      const pBody = this.player.body as Phaser.Physics.Arcade.Body;
      const cfg = this.characterConfig;
      pBody.setVelocityY(this.jumpCount === 1 ? cfg.jumpPower : cfg.jumpPower * 0.88);

      // Playful squash & spring
      this.tweens.killTweensOf(this.player);
      this.player.setScale(cfg.scale);
      this.tweens.add({
        targets: this.player,
        scaleY: cfg.scale * 1.15,
        scaleX: cfg.scale * 0.88,
        duration: 120,
        yoyo: true,
        ease: 'Back.easeOut'
      });

      SoundManager.getInstance().playJump();

      if (this.emitterDust) {
        this.emitterDust.explode(5, this.player.x - 20, this.floorY - 4);
      }
    }
  }

  private onPlayerLand() {
    this.tweens.killTweensOf(this.player);
    const baseScale = this.playerBaseScale;
    this.player.setScale(baseScale);
    this.tweens.add({
      targets: this.player,
      scaleY: baseScale * 0.88,
      scaleX: baseScale * 1.12,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });

    if (this.emitterDust) {
      this.emitterDust.explode(6, this.player.x - 15, this.floorY - 4);
      this.emitterDust.explode(6, this.player.x + 15, this.floorY - 4);
    }
  }

  // Arabi flings a toy backward towards the player!
  private flingToyFromArabi() {
    if (this.isGameOver) return;

    const toyKeys = ['obstacle-blocks', 'obstacle-ball', 'obstacle-cushion', 'obstacle-pan'];
    const key = toyKeys[Phaser.Math.Between(0, toyKeys.length - 1)];

    // Toy shadow
    const shadow = this.add.image(this.arabi.x - 20, this.floorY + 4, 'character-shadow');
    shadow.setScale(0.55, 0.28);
    shadow.setOrigin(0.5, 0.5);
    shadow.setAlpha(0.42);

    const toy = this.thrownToys.create(this.arabi.x - 20, this.floorY, key);
    toy.setScale(0.85);
    toy.setOrigin(0.5, 0.96);

    // Launches horizontally backward towards the player
    const flingSpeed = this.currentSpeed + (this.gameMode === 'araf' ? 120 : 180);
    toy.body.setVelocityX(-flingSpeed);
    toy.body.setAllowGravity(false);
    toy.body.setImmovable(true);
    toy.setData('shadow', shadow);
    toy.setData('dodged', false);

    if (key === 'obstacle-ball') {
      this.tweens.add({
        targets: toy,
        angle: -360,
        duration: 800,
        repeat: -1
      });
    }

    // Arabi joy giggle when flinging
    if (Math.random() > 0.45) {
      SoundManager.getInstance().playGiggle();
      const quote = this.arabiQuotes[Phaser.Math.Between(0, this.arabiQuotes.length - 1)];
      this.triggerSpeech('arabi', quote);
    }
  }

  // Milk bottle appears ahead for Arabi to drink
  private spawnMilkForArabi() {
    if (this.isGameOver) return;

    const { width } = this.scale;
    const milk = this.milkBottles.create(width + 40, this.floorY - 60, 'item-milk');
    milk.setScale(0.95);
    milk.setOrigin(0.5, 0.5);
    milk.body.setVelocityX(-this.currentSpeed);
    milk.body.setAllowGravity(false);
  }

  // Player hits a thrown toy! (BUMP & Stumble)
  private handlePlayerHitToy(_p: unknown, toyObject: unknown) {
    if (this.isStumbling || this.invulnerableTimer > 0 || this.isGameOver) return;
    this.isStumbling = true;
    this.invulnerableTimer = 1.3;

    const toy = toyObject as Phaser.GameObjects.Sprite;
    const shadow = toy.getData('shadow') as Phaser.GameObjects.Image | undefined;
    if (shadow) shadow.destroy();
    toy.destroy();

    SoundManager.getInstance().playHit();
    this.cameras.main.shake(140, 0.008);

    const cfg = this.characterConfig;

    // Delay next toy throw so player has ample breathing room to recover!
    if (this.toyTimerEvent) {
      this.toyTimerEvent.reset({
        delay: cfg.toyInterval + 600,
        callback: this.flingToyFromArabi,
        callbackScope: this,
        loop: true
      });
    }

    // Visibly decelerate speed to 45% during stumble
    this.currentSpeed = this.baseSpeed * 0.45;

    // Gentle stumble setback (only 18-25px, keeping player in comfortable view)
    const { width } = this.scale;
    const minX = width * 0.14;

    this.tweens.add({
      targets: this.player,
      x: Math.max(minX, this.player.x - cfg.stumbleBack),
      tint: 0xff5555,
      duration: 150,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.player.clearTint();
        this.isStumbling = false;

        // Player gets a generous 5-second comeback speed surge!
        this.catchUpTimer = 5.0;

        const speedBadge = this.add.text(this.player.x, this.player.y - 130, '⚡ স্পিড আপ! আরাবিকে ধরো! 💨', {
          fontFamily: '"Hind Siliguri", sans-serif',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#facc15',
          stroke: '#854d0e',
          strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
          targets: speedBadge,
          y: this.player.y - 180,
          alpha: 0,
          duration: 850,
          onComplete: () => speedBadge.destroy()
        });

        // Motivated Bengali comeback dialogue
        const recoveryQuote =
          this.gameMode === 'araf'
            ? 'হোঁচট খেলেও আমি থামবো না! স্পিড আপ!'
            : this.gameMode === 'adiba'
            ? 'এবার আমি আরও জোরে ছুটছি, দাঁড়াও!'
            : 'এবার আর পালাতে পারবে না, ফুল স্পিড!';
        this.triggerSpeech(this.gameMode, recoveryQuote);
      }
    });

    // Player yells in surprise/stumble
    const ouchQuote =
      this.gameMode === 'araf'
        ? 'উহ! পায়ে খেলনা লাগলো!'
        : this.gameMode === 'adiba'
        ? 'উফ্! খেলনায় হোঁচট খেলাম!'
        : 'উরে বাবারে! খেলনায় হোঁচট খেলাম!';
    this.triggerSpeech(this.gameMode, ouchQuote);
  }

  // Arabi drinks milk when bottle reaches her
  private arabiDrinksMilk(bottle: Phaser.GameObjects.Sprite) {
    bottle.destroy();
    // Balanced boost (+8% per milk bottle)
    this.arabiBoost = Math.min(100, this.arabiBoost + 8);
    SoundManager.getInstance().playCollect();

    // Sparkle explosion around Arabi
    if (this.emitterStars) {
      this.emitterStars.explode(18, this.arabi.x, this.arabi.y - 40);
    }

    // Arabi bobs happily and Boost Bar pulses!
    this.tweens.add({
      targets: this.arabi,
      scaleY: this.arabiScale * 1.25,
      scaleX: this.arabiScale * 1.25,
      duration: 130,
      yoyo: true
    });
    this.tweens.add({
      targets: this.arabiBoostContainer,
      scaleY: 1.2,
      scaleX: 1.2,
      duration: 130,
      yoyo: true
    });

    SoundManager.getInstance().playGiggle();
    this.triggerSpeech('arabi', 'খিলখিলখিল! দুধ খেয়ে নিলাম! 🍼✨');

    // If Arabi reaches 100% Boost, ARABI WINS!
    if (this.arabiBoost >= 100) {
      this.triggerArabiEscape();
    }
  }

  // PLAYER WINS: Player catches Arabi!
  private triggerPlayerCatch() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    SoundManager.getInstance().playFanfare();
    SoundManager.getInstance().stopBGM();

    // Catch animation: Player leaps forward and hugs Arabi's walker!
    this.tweens.add({
      targets: this.player,
      x: this.arabi.x - 45,
      duration: 300,
      ease: 'Power2'
    });

    if (this.emitterStars) {
      this.emitterStars.explode(35, this.arabi.x, this.arabi.y - 40);
    }

    const winQuote =
      this.gameMode === 'araf'
        ? 'হুররে! ধরে ফেলেছি! আমি জিতে গেছি! 🎉'
        : this.gameMode === 'adiba'
        ? 'হুররে! আরাবিকে ধরে ফেলেছি! আমি জিতেছি! 👧✨'
        : 'সাবাশ! এইবার আর পালাতে পারবে না!';
    this.triggerSpeech(this.gameMode, winQuote);

    const finishCatch = () => {
      const finalScore = Math.floor(this.score);
      const finalDist = Math.floor(this.totalRunDistance);
      if (this.onGameOver) {
        this.onGameOver(finalScore, finalDist, 'player');
      }
      window.dispatchEvent(
        new CustomEvent('arabi-game-over', {
          detail: { score: finalScore, distance: finalDist, winner: 'player' }
        })
      );
    };

    this.time.delayedCall(400, finishCatch);
    setTimeout(finishCatch, 450);
  }

  // ARABI WINS: Arabi hits 100% Boost and zooms off laughing!
  private triggerArabiEscape() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Arabi laughs victoriously!
    SoundManager.getInstance().playGiggle();
    SoundManager.getInstance().playTurbo();
    SoundManager.getInstance().stopBGM();

    // Arabi zooms offscreen like a rocket!
    const { width } = this.scale;
    this.tweens.add({
      targets: [this.arabi, this.arabiBoostContainer],
      x: width + 250,
      duration: 750,
      ease: 'Quad.easeIn'
    });

    // Player stops and throws hands up in defeat
    const lostQuote =
      this.gameMode === 'araf'
        ? 'উরে বাবা! আরাবি তো রকেট হয়ে পালিয়ে গেল!'
        : this.gameMode === 'adiba'
        ? 'ইস! আরাবি তো রকেটের স্পিডে পালিয়ে গেল!'
        : 'ইস! আরাবিকে আর ধরা গেল না!';
    this.triggerSpeech(this.gameMode, lostQuote);

    const finishEscape = () => {
      const finalScore = Math.floor(this.score);
      const finalDist = Math.floor(this.totalRunDistance);
      if (this.onGameOver) {
        this.onGameOver(finalScore, finalDist, 'arabi');
      }
      window.dispatchEvent(
        new CustomEvent('arabi-game-over', {
          detail: { score: finalScore, distance: finalDist, winner: 'arabi' }
        })
      );
    };

    this.time.delayedCall(600, finishEscape);
    setTimeout(finishEscape, 650);
  }

  private triggerSpeech(character: 'anam' | 'araf' | 'adiba' | 'arabi', text: string) {
    this.speechCounter++;
    SoundManager.getInstance().speakDialogue(character, text);

    if (this.onStateUpdate) {
      const gapMeters = Math.max(0, Math.round((this.arabi.x - this.player.x) / 30));
      this.onStateUpdate({
        score: this.score,
        distance: Math.floor(this.totalRunDistance),
        distanceToArabi: gapMeters,
        arabiBoost: Math.floor(this.arabiBoost),
        mode: this.gameMode,
        speech: { character, text, id: this.speechCounter }
      });
    }
  }

  public update(time: number, delta: number) {
    if (!this.isGameStarted || this.isGameOver) {
      if (this.player && this.playerShadow) {
        this.playerShadow.x = this.player.x;
        this.playerShadow.y = this.floorY + 4;
      }
      if (this.arabi && this.arabiShadow) {
        this.arabiShadow.x = this.arabi.x;
        this.arabiShadow.y = this.floorY + 4;
        this.arabi.angle = 0;
      }
      return;
    }

    const deltaSec = delta / 1000;

    // Invulnerability flashing after hit
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= deltaSec;
      if (this.invulnerableTimer <= 0) {
        this.invulnerableTimer = 0;
        this.player.setAlpha(1.0);
      } else {
        this.player.setAlpha(Math.sin(time * 0.035) > 0 ? 0.95 : 0.45);
      }
    }

    // Comeback speed management after obstacle hit
    if (this.catchUpTimer > 0) {
      this.catchUpTimer -= deltaSec;
      if (this.catchUpTimer <= 0) {
        this.catchUpTimer = 0;
        this.currentSpeed = this.baseSpeed;
      } else {
        this.currentSpeed = this.baseSpeed * 1.35;
      }
    }

    // 1. Scroll background
    this.bg.tilePositionX += this.currentSpeed * deltaSec * 0.7;

    // 2. Score & Run Distance
    this.totalRunDistance += (this.currentSpeed * deltaSec) / 10;
    this.score += deltaSec * 25;

    // Gentle boost burn so Arabi doesn't escape too fast without player having a chance
    if (this.arabiBoost > 0) {
      this.arabiBoost = Math.max(0, this.arabiBoost - deltaSec * 1.0);
    }

    // 3. Player advancement towards Arabi when not stumbling!
    if (!this.isStumbling) {
      const cfg = this.characterConfig;
      let advanceRate = cfg.baseAdvance;

      // Dynamic Rubber-Band Catch-up:
      // If distance to Arabi is large, increase advance rate dynamically so Arabi is NEVER unreachable!
      const currentGap = this.arabi.x - this.player.x;
      if (currentGap > 180) {
        const rubberBand = (currentGap - 180) * 0.35;
        advanceRate += Math.min(125, rubberBand);
      }

      // Fast comeback speed boost if recovering from hit or great jump
      if (this.catchUpTimer > 0) {
        advanceRate += cfg.catchUpBoost;
      }

      this.player.x = Math.min(this.arabi.x - 45, this.player.x + deltaSec * advanceRate);
    }

    // 4. Check if Player caught Arabi! (Responsive catch trigger)
    if (!this.isGameOver && this.player.x >= this.arabi.x - 70 && this.arabiBoost < 100) {
      this.triggerPlayerCatch();
      return;
    }

    // 5. Update Arabi milk drinking check
    this.milkBottles.getChildren().forEach((b) => {
      const bottle = b as Phaser.GameObjects.Sprite;
      if (bottle.x <= this.arabi.x + 20) {
        this.arabiDrinksMilk(bottle);
      }
      if (bottle.x < -100) bottle.destroy();
    });

    // 6. Update Floating Boost Bar over Arabi's Head
    this.arabiBoostContainer.setPosition(this.arabi.x, this.arabi.y - 165);
    this.arabiBoostGfx.clear();
    const fillW = Math.max(0, Math.min(104, (this.arabiBoost / 100) * 104));
    if (fillW > 0) {
      const fillColor =
        this.arabiBoost >= 80 ? 0xf43f5e : this.arabiBoost >= 50 ? 0xf59e0b : 0x06b6d4;
      this.arabiBoostGfx.fillStyle(fillColor, 0.95);
      this.arabiBoostGfx.fillRoundedRect(-52, -10, fillW, 20, 10);
    }
    this.arabiBoostLabel.setText(`🍼 বুস্ট ${Math.floor(this.arabiBoost)}%`);

    // 7. Check Clean Dodging of Thrown Toys
    // When a toy passes behind the player without hitting him, player surges forward!
    this.thrownToys.getChildren().forEach((child) => {
      const toy = child as Phaser.GameObjects.Sprite;
      const isDodged = toy.getData('dodged');
      if (!isDodged && toy.x < this.player.x - 30) {
        toy.setData('dodged', true);
        // Clean dodge surge forward!
        if (!this.isStumbling) {
          this.player.x = Math.min(this.arabi.x - 48, this.player.x + 65);
          this.score += 50;
          this.catchUpTimer = Math.max(this.catchUpTimer, 2.5);

          // Pop text
          const dodgeText = this.add.text(this.player.x, this.player.y - 140, '✨ দারুণ জাম্প! +স্পিড! 🚀', {
            fontFamily: '"Hind Siliguri", sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#34d399',
            stroke: '#064e3b',
            strokeThickness: 4
          }).setOrigin(0.5);

          this.tweens.add({
            targets: dodgeText,
            y: this.player.y - 190,
            alpha: 0,
            duration: 700,
            onComplete: () => dodgeText.destroy()
          });

          // Player calls out with excitement
          if (Math.random() > 0.45) {
            const callQuote =
              this.gameMode === 'araf'
                ? 'এই তো কাছে চলে এসেছি! দাঁড়াও!'
                : this.gameMode === 'adiba'
                ? 'আরাবি আমি কিন্তু কাছে চলে এসেছি!'
                : 'এই তো ধরে ফেলছি!';
            this.triggerSpeech(this.gameMode, callQuote);
          }
        }
      }
    });

    // 8. Shadows positioning (level with floorY)
    this.playerShadow.x = this.player.x;
    this.playerShadow.y = this.floorY + 4;
    const pBody = this.player.body as Phaser.Physics.Arcade.Body;
    const shadowScaleX =
      this.gameMode === 'anam' ? 0.90 : this.gameMode === 'adiba' ? 0.82 : 0.75;
    if (pBody.blocked.down) {
      this.playerShadow.setAlpha(0.60);
      this.playerShadow.setScale(shadowScaleX, 0.38);
    } else {
      const altitude = Math.max(0, this.floorY - this.player.y);
      const altFactor = Math.min(1, altitude / 250);
      this.playerShadow.setScale(
        shadowScaleX * (1 - altFactor * 0.4),
        0.38 * (1 - altFactor * 0.4)
      );
      this.playerShadow.setAlpha(0.60 * (1 - altFactor * 0.5));
    }

    // Arabi shadow & subtle rolling wobble
    this.arabiShadow.x = this.arabi.x;
    this.arabiShadow.y = this.floorY + 4;
    this.arabi.angle = Math.sin(time * 0.014) * 2.5;

    // 9. Running dust puffs behind player & Arabi wheels
    this.dustTimer += delta;
    if (this.dustTimer > 120) {
      this.dustTimer = 0;
      if (this.emitterDust) {
        if (pBody.blocked.down) {
          this.emitterDust.emitParticleAt(this.player.x - 25, this.floorY - 4, 1);
        }
        this.emitterDust.emitParticleAt(this.arabi.x - 45, this.floorY - 6, 1);
      }
    }

    // 10. Update & clean up thrown toys & their shadows
    this.thrownToys.getChildren().forEach((child) => {
      const toy = child as Phaser.GameObjects.Sprite;
      const shadow = toy.getData('shadow') as Phaser.GameObjects.Image | undefined;
      if (shadow) {
        shadow.x = toy.x;
      }
      if (toy.x < -100) {
        if (shadow) shadow.destroy();
        toy.destroy();
      }
    });

    // 11. Frequent speech dialogues
    this.speechTimer += delta;
    if (this.speechTimer > 4000) {
      this.speechTimer = 0;
      const speakerRoll = Math.random();
      if (speakerRoll < 0.7) {
        const quoteList =
          this.gameMode === 'araf'
            ? this.arafQuotes
            : this.gameMode === 'adiba'
            ? this.adibaQuotes
            : this.anamQuotes;
        const q = quoteList[Phaser.Math.Between(0, quoteList.length - 1)];
        this.triggerSpeech(this.gameMode, q);
      } else {
        const q = this.arabiQuotes[Phaser.Math.Between(0, this.arabiQuotes.length - 1)];
        this.triggerSpeech('arabi', q);
      }
    }

    // 12. Update React HUD
    if (this.onStateUpdate && this.game.loop.frame % 6 === 0) {
      const gapMeters = Math.max(0, Math.round((this.arabi.x - this.player.x) / 30));
      this.onStateUpdate({
        score: Math.floor(this.score),
        distance: Math.floor(this.totalRunDistance),
        distanceToArabi: gapMeters,
        arabiBoost: Math.floor(this.arabiBoost),
        mode: this.gameMode,
        speech: null
      });
    }
  }

  public setMode(mode: GameMode) {
    this.gameMode = mode;
    const cfg = this.characterConfig;
    this.baseSpeed = cfg.baseSpeed;
    this.currentSpeed = this.baseSpeed;

    if (this.player) {
      const sheet =
        mode === 'araf'
          ? 'araf-sheet'
          : mode === 'adiba'
          ? 'adiba-sheet'
          : 'anam-sheet';
      const anim =
        mode === 'araf'
          ? 'araf-run'
          : mode === 'adiba'
          ? 'adiba-run'
          : 'anam-run';

      this.player.setTexture(sheet);
      this.player.setScale(cfg.scale);
      this.player.setOrigin(0.5, cfg.originY);
      this.player.play(anim);

      const shadowScaleX =
        mode === 'anam' ? 0.90 : mode === 'adiba' ? 0.82 : 0.75;
      if (this.playerShadow) {
        this.playerShadow.setScale(shadowScaleX, 0.38);
      }
    }
  }

  public restartGame(autoStart: boolean = true) {
    if (this.toyTimerEvent) this.toyTimerEvent.destroy();
    if (this.milkTimerEvent) this.milkTimerEvent.destroy();
    this.scene.restart({
      mode: this.gameMode,
      autoStart: autoStart,
      onStateUpdate: this.onStateUpdate,
      onGameOver: this.onGameOver
    });
  }
}
