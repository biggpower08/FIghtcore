import { ARENA_HEIGHT, ARENA_WIDTH } from './constants';
import type { Entity } from '../entities/Entity';

type CameraDistance = 'close' | 'normal' | 'far';

const cameraProfiles: Record<
  CameraDistance,
  {
    zoom: number;
    verticalLift: number;
    deadZoneX: number;
    deadZoneY: number;
    smoothing: number;
    hitReactSmoothing: number;
  }
> = {
  close: { zoom: 1.28, verticalLift: 8, deadZoneX: 156, deadZoneY: 76, smoothing: 8.5, hitReactSmoothing: 8.5 },
  normal: { zoom: 1.1, verticalLift: 16, deadZoneX: 140, deadZoneY: 64, smoothing: 9, hitReactSmoothing: 4.2 },
  far: { zoom: 1, verticalLift: 28, deadZoneX: 170, deadZoneY: 72, smoothing: 8, hitReactSmoothing: 3.8 },
};

export class Camera {
  x = 0;
  y = 0;
  targetX = 0;
  targetY = 0;
  stableTargetX = 0;
  stableTargetY = 0;
  deadZone = { left: 0, right: 0, top: 0, bottom: 0 };
  distance: CameraDistance = 'close';

  get zoom(): number {
    return cameraProfiles[this.distance].zoom;
  }

  follow(target: Entity, viewWidth: number, viewHeight: number, deltaMs = 16.67): void {
    this.updateTarget(target, viewWidth, viewHeight);
    const profile = cameraProfiles[this.distance];
    const smoothing = target.stunMs > 0 ? profile.hitReactSmoothing : profile.smoothing;
    const blend = 1 - Math.exp(-smoothing * Math.max(0, deltaMs) / 1000);
    this.x = this.clampX(lerp(this.x, this.targetX, blend), viewWidth);
    this.y = this.clampY(lerp(this.y, this.targetY, blend), viewHeight);
  }

  snapTo(target: Entity, viewWidth: number, viewHeight: number): void {
    this.updateTarget(target, viewWidth, viewHeight, true);
    this.x = this.targetX;
    this.y = this.targetY;
  }

  private updateTarget(target: Entity, viewWidth: number, viewHeight: number, forceCenter = false): void {
    const profile = cameraProfiles[this.distance];
    const worldViewWidth = viewWidth / this.zoom;
    const worldViewHeight = viewHeight / this.zoom;
    const stableX = target.x;
    const stableY = target.y - profile.verticalLift;
    this.stableTargetX = stableX;
    this.stableTargetY = stableY;

    const centerX = this.x + worldViewWidth / 2;
    const centerY = this.y + worldViewHeight / 2;
    const halfDeadZoneX = profile.deadZoneX / 2;
    const halfDeadZoneY = profile.deadZoneY / 2;
    let nextCenterX = centerX;
    let nextCenterY = centerY;

    if (forceCenter || stableX < centerX - halfDeadZoneX) nextCenterX = stableX + halfDeadZoneX;
    else if (stableX > centerX + halfDeadZoneX) nextCenterX = stableX - halfDeadZoneX;

    if (forceCenter || stableY < centerY - halfDeadZoneY) nextCenterY = stableY + halfDeadZoneY;
    else if (stableY > centerY + halfDeadZoneY) nextCenterY = stableY - halfDeadZoneY;

    this.targetX = this.clampX(nextCenterX - worldViewWidth / 2, viewWidth);
    this.targetY = this.clampY(nextCenterY - worldViewHeight / 2, viewHeight);
    this.deadZone = {
      left: centerX - halfDeadZoneX,
      right: centerX + halfDeadZoneX,
      top: centerY - halfDeadZoneY,
      bottom: centerY + halfDeadZoneY,
    };
  }

  private clampX(value: number, viewWidth: number): number {
    return Math.max(0, Math.min(Math.max(0, ARENA_WIDTH - viewWidth / this.zoom), value));
  }

  private clampY(value: number, viewHeight: number): number {
    return Math.max(0, Math.min(Math.max(0, ARENA_HEIGHT - viewHeight / this.zoom), value));
  }
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}
