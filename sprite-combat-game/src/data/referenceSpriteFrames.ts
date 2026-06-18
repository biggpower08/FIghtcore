export interface ReferenceSpriteFrameMetadata {
  entityId: string;
  animationKey: string;
  frameIndex: number;
  framePath: string;
  sourceSheet: string;
  sourceSheetLabel: string;
  crop: { x: number; y: number; width: number; height: number };
  frameSize: { width: number; height: number };
  baselineY: number;
  anchorX: number;
  anchorY: number;
  durationMs?: number;
  backgroundRemoved: boolean;
  label?: string;
}

export const referenceSpriteFrameMetadata: ReferenceSpriteFrameMetadata[] = [
  {"entityId":"shadow-striker","animationKey":"teep_kick","frameIndex":0,"framePath":"/sprites/frames-reference/shadow-striker/teep_kick/0001.png","sourceSheet":"tools/raw-fightcore-assets/shadow-striker.png.png","sourceSheetLabel":"Shadow Striker master reference sheet","crop":{"x":112,"y":682,"width":120,"height":172},"frameSize":{"width":96,"height":96},"baselineY":88,"anchorX":0.5,"anchorY":0.9167,"durationMs":77,"backgroundRemoved":true,"label":"stance chamber"},
  {"entityId":"shadow-striker","animationKey":"teep_kick","frameIndex":1,"framePath":"/sprites/frames-reference/shadow-striker/teep_kick/0002.png","sourceSheet":"tools/raw-fightcore-assets/shadow-striker.png.png","sourceSheetLabel":"Shadow Striker master reference sheet","crop":{"x":238,"y":682,"width":116,"height":172},"frameSize":{"width":96,"height":96},"baselineY":88,"anchorX":0.5,"anchorY":0.9167,"durationMs":77,"backgroundRemoved":true,"label":"knee chamber"},
  {"entityId":"shadow-striker","animationKey":"teep_kick","frameIndex":2,"framePath":"/sprites/frames-reference/shadow-striker/teep_kick/0003.png","sourceSheet":"tools/raw-fightcore-assets/shadow-striker.png.png","sourceSheetLabel":"Shadow Striker master reference sheet","crop":{"x":360,"y":682,"width":172,"height":172},"frameSize":{"width":96,"height":96},"baselineY":88,"anchorX":0.5,"anchorY":0.9167,"durationMs":77,"backgroundRemoved":true,"label":"kick drive"},
  {"entityId":"shadow-striker","animationKey":"teep_kick","frameIndex":3,"framePath":"/sprites/frames-reference/shadow-striker/teep_kick/0004.png","sourceSheet":"tools/raw-fightcore-assets/shadow-striker.png.png","sourceSheetLabel":"Shadow Striker master reference sheet","crop":{"x":492,"y":682,"width":178,"height":172},"frameSize":{"width":96,"height":96},"baselineY":88,"anchorX":0.5,"anchorY":0.9167,"durationMs":77,"backgroundRemoved":true,"label":"full extension"},
  {"entityId":"shadow-striker","animationKey":"teep_kick","frameIndex":4,"framePath":"/sprites/frames-reference/shadow-striker/teep_kick/0005.png","sourceSheet":"tools/raw-fightcore-assets/shadow-striker.png.png","sourceSheetLabel":"Shadow Striker master reference sheet","crop":{"x":652,"y":682,"width":126,"height":172},"frameSize":{"width":96,"height":96},"baselineY":88,"anchorX":0.5,"anchorY":0.9167,"durationMs":77,"backgroundRemoved":true,"label":"recovery"},
];

export function getReferenceSpriteFrame(entityId: string, animationKey: string, frameIndex: number): ReferenceSpriteFrameMetadata | undefined {
  return referenceSpriteFrameMetadata.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey && entry.frameIndex === frameIndex);
}

export function getReferenceSpriteAnimation(entityId: string, animationKey: string): ReferenceSpriteFrameMetadata[] {
  return referenceSpriteFrameMetadata
    .filter((entry) => entry.entityId === entityId && entry.animationKey === animationKey)
    .sort((a, b) => a.frameIndex - b.frameIndex);
}
