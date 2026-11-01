import type { Engine, DefaultRenderingPipeline } from "@babylonjs/core";

type QualityTier = "high" | "balanced" | "lite";

export class QualityGovernor {
  private elapsed = 0;
  private lowSamples = 0;
  private tier: QualityTier;
  private readonly baseDpr: number;

  constructor(
    private readonly engine: Engine,
    private readonly pipeline: DefaultRenderingPipeline | null,
    private readonly mobile: boolean,
  ) {
    this.baseDpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    this.tier = mobile ? "balanced" : "high";
    this.apply();
  }

  update(deltaSeconds: number): void {
    this.elapsed += deltaSeconds;
    if (this.elapsed < 3) return;
    this.elapsed = 0;

    const fps = this.engine.getFps();
    if (fps < 29) this.lowSamples += 1;
    else this.lowSamples = Math.max(0, this.lowSamples - 1);

    if (this.lowSamples >= 3 && this.tier !== "lite") {
      this.tier = "lite";
      this.apply();
    } else if (fps > 52 && this.lowSamples === 0 && this.tier === "lite" && !this.mobile) {
      this.tier = "balanced";
      this.apply();
    }
  }

  private apply(): void {
    const renderScale = this.tier === "high" ? 1 : this.tier === "balanced" ? 0.78 : 0.62;
    this.engine.setHardwareScalingLevel(1 / (this.baseDpr * renderScale));
    if (!this.pipeline) return;
    this.pipeline.fxaaEnabled = this.tier !== "lite";
    this.pipeline.bloomEnabled = this.tier === "high";
    this.pipeline.bloomWeight = this.tier === "high" ? 0.16 : 0.1;
  }

  getTier(): QualityTier {
    return this.tier;
  }
}
