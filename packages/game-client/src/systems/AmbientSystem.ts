import * as Phaser from "phaser";

import type { TimeMode } from "../types";

export class AmbientSystem {
  private nightOverlay: Phaser.GameObjects.Rectangle;
  private warmGlow: Phaser.GameObjects.Ellipse;
  private monitorGlow: Phaser.GameObjects.Ellipse;
  private windowGlow: Phaser.GameObjects.Rectangle;
  private particles: Phaser.GameObjects.Arc[] = [];
  private mode: TimeMode = "day";

  constructor(
    private readonly scene: Phaser.Scene,
    worldW: number,
    worldH: number,
  ) {
    this.windowGlow = scene.add.rectangle(520, 92, 320, 130, 0x93d9ff, 0.18);
    this.windowGlow.setDepth(41_000);
    this.windowGlow.setBlendMode(Phaser.BlendModes.ADD);

    this.warmGlow = scene.add.ellipse(984, 180, 300, 180, 0xffbc67, 0.24);
    this.warmGlow.setDepth(41_100);
    this.warmGlow.setBlendMode(Phaser.BlendModes.ADD);

    this.monitorGlow = scene.add.ellipse(998, 152, 110, 58, 0x87e2ff, 0.2);
    this.monitorGlow.setDepth(41_200);
    this.monitorGlow.setBlendMode(Phaser.BlendModes.ADD);

    this.nightOverlay = scene.add.rectangle(worldW / 2, worldH / 2, worldW, worldH, 0x17233d, 0);
    this.nightOverlay.setDepth(40_000);
    this.nightOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);

    for (let i = 0; i < 26; i++) {
      const dot = scene.add.circle(
        Phaser.Math.Between(32, worldW - 32),
        Phaser.Math.Between(80, worldH - 42),
        Phaser.Math.FloatBetween(0.45, 1.1),
        0xfff3cf,
        Phaser.Math.FloatBetween(0.16, 0.34),
      );
      dot.setDepth(41_300);
      this.particles.push(dot);
    }
  }

  setMode(mode: TimeMode) {
    this.mode = mode;
    this.scene.tweens.add({
      targets: this.nightOverlay,
      alpha: mode === "night" ? 0.68 : 0,
      duration: 500,
      ease: "Sine.easeInOut",
    });
    this.scene.tweens.add({
      targets: this.windowGlow,
      alpha: mode === "night" ? 0.16 : 0.2,
      duration: 500,
    });
    this.scene.tweens.add({
      targets: [this.warmGlow, this.monitorGlow],
      alpha: mode === "night" ? 0.72 : 0.22,
      duration: 500,
    });
  }

  update(time: number, deltaMs: number) {
    const pulse = (Math.sin(time / 540) + 1) / 2;
    this.warmGlow.setScale(1 + pulse * 0.035);
    this.monitorGlow.setAlpha((this.mode === "night" ? 0.38 : 0.18) + pulse * 0.12);

    for (const particle of this.particles) {
      particle.y -= deltaMs * 0.002;
      particle.x += Math.sin((time + particle.x * 11) / 900) * 0.018;
      if (particle.y < 30) {
        particle.y = this.scene.scale.height + this.scene.cameras.main.scrollY;
      }
    }
  }
}
