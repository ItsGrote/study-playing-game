import * as Phaser from "phaser";

import { MovementController, type MovementInput } from "../controllers/MovementController";
import { DEFAULT_PET } from "../entities/avatar";
import { PetEntity } from "../entities/PetEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { AmbientSystem } from "../systems/AmbientSystem";
import { AudioSystem } from "../systems/AudioSystem";
import { AssetLoadingSystem } from "../systems/AssetLoadingSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { CollisionSystem } from "../systems/CollisionSystem";
import { InteractionSystem } from "../systems/InteractionSystem";
import { NavigationSystem } from "../systems/NavigationSystem";
import { RoomRenderingSystem } from "../systems/RoomRenderingSystem";
import type { HudStats, StudyHallHooks, TimeMode } from "../types";
import type { GridPoint } from "../world/pathfind";
import {
  buildGroundLayer,
  buildInteractiveEntities,
  buildRoomLayers,
  type InteractionDef,
  MAP_H,
  MAP_W,
  TILE_SIZE,
} from "../world/sampleLevel";
import { parseTiledRoomMap } from "../world/tiled";

export class PlayScene extends Phaser.Scene {
  private static hooksRef: StudyHallHooks | null = null;

  static configure(hooks: StudyHallHooks) {
    PlayScene.hooksRef = hooks;
  }

  private hooks: StudyHallHooks = { onHudMessage: () => {} };

  private grid: number[][] = [];
  private interactiveEntities = buildInteractiveEntities();

  private playerGrid: GridPoint = { x: 38, y: 34 };
  private player!: PlayerEntity;
  private pet!: PetEntity;
  private movement!: MovementController;
  private interactionSystem!: InteractionSystem;
  private collision!: CollisionSystem;
  private navigation!: NavigationSystem;
  private cameraSystem!: CameraSystem;
  private ambient!: AmbientSystem;
  private audio = new AudioSystem();

  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private highlighted: InteractionDef | null = null;
  private pendingInteraction: InteractionDef | null = null;
  private highlightGraphics!: Phaser.GameObjects.Graphics;
  private destinationMarker!: Phaser.GameObjects.Graphics;
  private contextInteraction: InteractionDef | null = null;
  private timeMode: TimeMode = "day";
  private studying = false;
  private pomodoroStartedAt = 0;
  private lastStatsAt = 0;
  private readonly defaultZoom = 1.8;
  private zoom = this.defaultZoom;

  constructor() {
    super("PlayScene");
  }

  preload() {
    AssetLoadingSystem.preloadBootstrap(this);
  }

  create() {
    this.hooks = PlayScene.hooksRef ?? { onHudMessage: () => {} };
    const manifest = AssetLoadingSystem.getManifest(this);
    AssetLoadingSystem.preloadFromManifest(this, manifest);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => this.createWorld());
    this.load.start();
  }

  private createWorld() {
    const roomLayers = buildRoomLayers();
    this.grid = buildGroundLayer();
    this.interactiveEntities = buildInteractiveEntities();
    this.interactionSystem = new InteractionSystem(this.interactiveEntities);

    const rawMap = this.cache.json.get("map:cozyRoom");
    const roomMap = parseTiledRoomMap(rawMap);
    this.collision = CollisionSystem.fromTiledObjects(this.grid, roomMap);
    this.navigation = new NavigationSystem(this.collision);
    this.createProxyTextures();
    new RoomRenderingSystem(this).render(roomLayers);

    const worldW = MAP_W * TILE_SIZE;
    const worldH = MAP_H * TILE_SIZE;

    this.cameraSystem = new CameraSystem(this, this.cameras.main, worldW, worldH, this.zoom);

    this.addRoomDepth(worldW, worldH);
    this.ambient = new AmbientSystem(this, worldW, worldH);

    this.highlightGraphics = this.add.graphics();
    this.highlightGraphics.setDepth(20_000);
    this.destinationMarker = this.add.graphics();
    this.destinationMarker.setDepth(19_000);

    const { x, y } = this.gridToWorld(this.playerGrid);
    const playerSprite = this.add.sprite(x, y, "proxy-player");
    playerSprite.setOrigin(0.5, 0.86);
    playerSprite.setDisplaySize(24, 24);
    playerSprite.setDepth(playerSprite.y + 10_000);
    this.player = new PlayerEntity("local-player", playerSprite);

    const petStart = this.gridToWorld({ x: 60, y: 40 });
    const petSprite = this.add.sprite(petStart.x, petStart.y, "proxy-pet");
    petSprite.setName(DEFAULT_PET.displayName);
    petSprite.setOrigin(0.5, 0.9);
    petSprite.setDisplaySize(24, 18);
    petSprite.setDepth(petSprite.y + 10_000);
    this.pet = new PetEntity(DEFAULT_PET.id, petSprite, { x: 60, y: 41 }, this.collision.pathGrid);

    this.movement = new MovementController(this.player.sprite, this.collision.pathGrid);
    this.cameras.main.startFollow(this.player.sprite, true, 0.18, 0.18);
    this.setCameraZoom(this.zoom);

    const kb = this.input.keyboard;
    if (!kb) {
      throw new Error("Teclado indisponível.");
    }

    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyE = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEsc = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.cursors = kb.createCursorKeys();

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.setHighlighted(this.findInteractionAtPointer(pointer));
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) return;
      this.audio.start();
      const tile = this.screenToTile(pointer.worldX, pointer.worldY);
      const interaction = this.findInteractionAt(tile);
      if (interaction) {
        this.queueInteraction(interaction);
        return;
      }
      this.pendingInteraction = null;
      this.startPath(tile);
    });

    this.input.on("pointerout", () => {
      this.setHighlighted(null);
    });

    this.setTimeMode(this.timeMode);
    this.publishStats(true);
  }

  update(time: number, delta: number) {
    if (!this.movement || !this.player || !this.pet || !this.ambient) return;
    const state = this.movement.update(delta, this.readMovementInput());
    this.playerGrid = state.grid;
    this.player.updateAnimation(state.direction, state.moving);
    this.pet.update(time, delta);
    this.ambient.update(time, delta);

    if (state.moving) {
      this.studying = false;
      this.player.stand(state.direction);
      this.audio.step(time);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.audio.start();
      const target = this.highlighted ?? this.findNearbyInteraction();
      if (target) this.queueInteraction(target);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.clearContextActions();
      this.hooks.onHudMessage("Menu pausado: use os controles do painel para ajustar o quarto.");
    }

    if (this.pendingInteraction && this.isAtInteractionRange(this.pendingInteraction)) {
      this.presentInteraction(this.pendingInteraction);
      this.pendingInteraction = null;
      this.destinationMarker.clear();
    }

    this.pet.settleAfterPet(time);
    this.publishStats();
  }

  chooseContextAction(actionId: string) {
    if (!this.contextInteraction) return;

    if (actionId === "study:start") {
      this.startStudying(this.contextInteraction);
    } else if (actionId === "pet:follow") {
      this.pet.followPlayer(this.player.sprite);
      this.hooks.onHudMessage("Mimi começou a seguir você pelo quarto.");
      this.audio.positive();
    } else if (actionId === "pet:stay") {
      this.pet.stopFollowing();
      this.hooks.onHudMessage("Mimi voltou para a almofada.");
      this.audio.interact();
    } else if (actionId === "pet:care") {
      this.petPet();
    } else if (actionId.startsWith("inspect:")) {
      this.hooks.onHudMessage(this.contextInteraction.message);
      this.audio.interact();
    }

    this.clearContextActions();
    this.publishStats(true);
  }

  setTimeMode(mode: TimeMode) {
    this.timeMode = mode;
    this.ambient?.setMode(mode);
    this.publishStats(true);
  }

  setCameraZoom(zoom: number) {
    this.zoom = zoom;
    this.cameraSystem?.setZoom(zoom);
  }

  setVolume(volume: number) {
    this.audio.setVolume(volume);
  }

  private readMovementInput(): MovementInput {
    return {
      x: Number(this.keyD.isDown || this.cursors.right.isDown) - Number(this.keyA.isDown || this.cursors.left.isDown),
      y: Number(this.keyS.isDown || this.cursors.down.isDown) - Number(this.keyW.isDown || this.cursors.up.isDown),
    };
  }

  private screenToTile(worldX: number, worldY: number): GridPoint {
    const tx = Phaser.Math.Clamp(Math.floor(worldX / TILE_SIZE), 0, MAP_W - 1);
    const ty = Phaser.Math.Clamp(Math.floor(worldY / TILE_SIZE), 0, MAP_H - 1);
    return { x: tx, y: ty };
  }

  private gridToWorld(tile: GridPoint): { x: number; y: number } {
    return {
      x: tile.x * TILE_SIZE + TILE_SIZE / 2,
      y: tile.y * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  private createProxyTextures() {
    if (!this.textures.exists("proxy-player")) {
      const player = this.add.graphics();
      player.fillStyle(0x1d2748, 1);
      player.fillRect(6, 1, 12, 5);
      player.fillStyle(0xf0b889, 1);
      player.fillRect(7, 6, 10, 8);
      player.fillStyle(0x2d67a3, 1);
      player.fillRect(5, 14, 14, 10);
      player.generateTexture("proxy-player", 24, 28);
      player.destroy();
    }

    if (!this.textures.exists("proxy-pet")) {
      const pet = this.add.graphics();
      pet.fillStyle(0x1d2748, 1);
      pet.fillTriangle(5, 5, 8, 1, 10, 6);
      pet.fillTriangle(16, 5, 18, 1, 20, 6);
      pet.fillStyle(0xe38b55, 1);
      pet.fillEllipse(12, 11, 18, 14);
      pet.fillStyle(0xf4c477, 1);
      pet.fillEllipse(12, 13, 10, 7);
      pet.generateTexture("proxy-pet", 24, 20);
      pet.destroy();
    }
  }

  private findInteractionAt(tile: GridPoint): InteractionDef | null {
    const petTile = this.pet?.grid;
    if (petTile && Math.abs(tile.x - petTile.x) <= 1 && Math.abs(tile.y - petTile.y) <= 1) {
      return this.buildPetInteraction();
    }
    return this.interactionSystem.findAt(tile);
  }

  private findInteractionAtPointer(pointer: Phaser.Input.Pointer): InteractionDef | null {
    return this.findInteractionAt(this.screenToTile(pointer.worldX, pointer.worldY));
  }

  private setHighlighted(next: InteractionDef | null) {
    if (this.highlighted?.id === next?.id) return;
    this.highlighted = next;
    this.input.setDefaultCursor(next ? "pointer" : "default");
    this.drawHighlight(next);
  }

  private drawHighlight(interaction: InteractionDef | null) {
    this.highlightGraphics.clear();
    if (!interaction) return;

    this.highlightGraphics.lineStyle(1, 0xfff2a8, 0.95);
    this.highlightGraphics.fillStyle(0xfff2a8, 0.18);
    for (const tile of interaction.tiles) {
      this.highlightGraphics.fillRect(tile.x * TILE_SIZE + 1, tile.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      this.highlightGraphics.strokeRect(tile.x * TILE_SIZE + 1.5, tile.y * TILE_SIZE + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
    }
  }

  private queueInteraction(interaction: InteractionDef) {
    const queued = this.interactionSystem.buildQueue(this.collision.pathGrid, this.playerGrid, interaction);
    if (!queued) {
      this.hooks.onHudMessage(`${interaction.label}: chegue um pouco mais perto para interagir.`);
      return;
    }

    this.pendingInteraction = interaction;
    this.setHighlighted(interaction);
    if (queued.path.length === 0) {
      this.presentInteraction(interaction);
      this.pendingInteraction = null;
      return;
    }

    this.movement.setPath(queued.path);
    this.drawDestination(queued.path[queued.path.length - 1]);
  }

  private startPath(goal: GridPoint) {
    const path = this.navigation.findPath(this.playerGrid, goal);
    if (path.length === 0) return;
    this.movement.setPath(path);
    this.drawDestination(goal);
  }

  private findNearbyInteraction(): InteractionDef | null {
    const petInteraction = this.buildPetInteraction();
    if (this.isAtInteractionRange(petInteraction)) return petInteraction;
    return this.interactionSystem.findNearby(this.playerGrid);
  }

  private isAtInteractionRange(interaction: InteractionDef): boolean {
    return this.interactionSystem.isInRange(this.playerGrid, interaction);
  }

  private presentInteraction(interaction: InteractionDef) {
    this.contextInteraction = interaction;
    const actions = this.interactionSystem.actionsFor(interaction, this.pet.isFollowing);
    this.hooks.onHudMessage(interaction.message);
    this.hooks.onContextActions?.(actions);
    this.audio.interact();
  }

  private drawDestination(tile: GridPoint) {
    this.destinationMarker.clear();
    this.destinationMarker.lineStyle(1, 0xffffff, 0.78);
    this.destinationMarker.strokeRect(tile.x * TILE_SIZE + 4, tile.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  }

  private buildPetInteraction(): InteractionDef {
    const tile = this.pet.grid;
    return {
      id: "pet",
      kind: "pet",
      label: "Mimi",
      message: this.pet.isFollowing
        ? "Mimi está acompanhando seus passos, atenta a qualquer pausa para carinho."
        : "Mimi parece tranquila. Ela pisca devagar e espera um convite.",
      cursor: "pet",
      tiles: [tile],
      interactionTiles: [
        { x: tile.x - 1, y: tile.y },
        { x: tile.x + 1, y: tile.y },
        { x: tile.x, y: tile.y - 1 },
        { x: tile.x, y: tile.y + 1 },
      ],
    };
  }

  private startStudying(interaction: InteractionDef) {
    const seat = interaction.seatTile ? this.gridToWorld(interaction.seatTile) : this.gridToWorld(this.playerGrid);
    this.movement.clearPath();
    this.studying = true;
    this.pomodoroStartedAt = this.time.now;
    this.player.sitAndStudy(new Phaser.Math.Vector2(seat.x, seat.y + 2));
    this.hooks.onHudMessage("Sessão de estudo iniciada. O monitor ilumina a mesa e o quarto fica quietinho.");
    this.audio.positive();
  }

  private petPet() {
    this.pet.pet();
    this.hooks.onHudMessage("Você fez carinho em Mimi. Ela responde com pequenos corações.");
    this.spawnHearts(this.pet.sprite.x, this.pet.sprite.y - 12);
    this.audio.positive();
  }

  private spawnHearts(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      const heart = this.add.text(x + Phaser.Math.Between(-10, 10), y + Phaser.Math.Between(-4, 4), "♥", {
        color: "#ff7aa8",
        fontFamily: "monospace",
        fontSize: "10px",
      });
      heart.setDepth(42_000);
      this.tweens.add({
        targets: heart,
        y: heart.y - Phaser.Math.Between(16, 26),
        alpha: 0,
        duration: 900,
        ease: "Sine.easeOut",
        onComplete: () => heart.destroy(),
      });
    }
  }

  private clearContextActions() {
    this.contextInteraction = null;
    this.hooks.onContextActions?.([]);
  }

  private publishStats(force = false) {
    if (!force && this.time.now - this.lastStatsAt < 500) return;
    this.lastStatsAt = this.time.now;
    const elapsed = this.studying ? Math.floor((this.time.now - this.pomodoroStartedAt) / 1000) : 0;
    const stats: HudStats = {
      pomodoroLabel: this.studying ? `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}` : "25:00",
      xp: this.studying ? 42 : 28,
      coins: 128,
      timeMode: this.timeMode,
      petFollowing: this.pet?.isFollowing ?? false,
      studying: this.studying,
    };
    this.hooks.onStatsChange?.(stats);
  }

  private addRoomDepth(worldW: number, worldH: number) {
    const warm = this.add.rectangle(worldW / 2, worldH / 2, worldW, worldH, 0xffe3b0, 0.13);
    warm.setDepth(8_000);
    warm.setBlendMode(Phaser.BlendModes.ADD);

    const shade = this.add.graphics();
    shade.setDepth(7_900);
    shade.fillStyle(0x2b1f25, 0.12);
    shade.fillRect(0, 0, worldW, 18);
    shade.fillRect(0, worldH - 18, worldW, 18);
    shade.fillRect(0, 0, 18, worldH);
    shade.fillRect(worldW - 18, 0, 18, worldH);

    const backWallShadow = this.add.rectangle(worldW / 2, 62, worldW - 36, 18, 0x2f1f1c, 0.16);
    backWallShadow.setDepth(7_600);
  }
}
