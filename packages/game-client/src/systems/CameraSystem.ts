import * as Phaser from "phaser";

export class CameraSystem {
  private requestedZoom: number;
  private minZoom = 1;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
    private readonly worldW: number,
    private readonly worldH: number,
    defaultZoom: number,
  ) {
    this.requestedZoom = defaultZoom;
    this.camera.setBounds(0, 0, worldW, worldH);
    this.camera.setRoundPixels(true);
    this.camera.setBackgroundColor("#151722");
    this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.handleResize();
  }

  destroy() {
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
  }

  setZoom(zoom: number) {
    const maxZoom = Math.max(3, this.minZoom);
    this.requestedZoom = Phaser.Math.Clamp(zoom, this.minZoom, maxZoom);
    this.camera.setZoom(this.requestedZoom);
    this.centerIfWorldFits();
  }

  get zoom() {
    return this.requestedZoom;
  }

  get minimumZoom() {
    return this.minZoom;
  }

  private handleResize() {
    const width = Math.max(1, this.scene.scale.width);
    const height = Math.max(1, this.scene.scale.height);
    this.camera.setViewport(0, 0, width, height);
    this.minZoom = Math.max(width / this.worldW, height / this.worldH, 0.75);
    this.setZoom(Math.max(this.requestedZoom, this.minZoom));
  }

  private centerIfWorldFits() {
    const viewW = this.camera.width / this.camera.zoom;
    const viewH = this.camera.height / this.camera.zoom;
    if (viewW >= this.worldW) {
      this.camera.scrollX = (this.worldW - viewW) / 2;
    }
    if (viewH >= this.worldH) {
      this.camera.scrollY = (this.worldH - viewH) / 2;
    }
  }
}
