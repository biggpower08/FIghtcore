export interface GeneratedSpritePackFrame {
  frameIndex: number;
  framePath: string;
  frameSize: { w: number; h: number };
  targetBodyHeight?: number;
  visualScale?: number;
  sourceSlice?: { x: number; y: number; w: number; h: number };
  sourceBounds?: { x: number; y: number; w: number; h: number; pixels: number };
  bodyBounds?: { x: number; y: number; w: number; h: number };
  anchorX: number;
  anchorY: number;
  durationMs: number;
  holdCount?: number;
  cutoff?: boolean;
}

export interface GeneratedSpritePackAnimation {
  id: string;
  frameCount: number;
  fps?: number;
  loop?: boolean;
  outputCanvas?: { w: number; h: number };
  frameDurations?: number[];
  holdFrames?: Record<string, number>;
  warnings?: string[];
  frames: GeneratedSpritePackFrame[];
}

export interface GeneratedSpritePackCharacter {
  id: string;
  displayName: string;
  style: 'pixel-art' | 'semi-realistic';
  enabled: boolean;
  targetBodyHeight: number;
  visualScale: number;
  baselineY: number;
  animations: GeneratedSpritePackAnimation[];
}

export const generatedSpriteRegistry: GeneratedSpritePackCharacter[] = [
  {
    "id": "example-character",
    "displayName": "Example Character",
    "style": "semi-realistic",
    "enabled": false,
    "targetBodyHeight": 118,
    "visualScale": 0.72,
    "baselineY": 148,
    "animations": []
  },
  {
    "id": "ronin",
    "displayName": "Ronin",
    "style": "semi-realistic",
    "enabled": true,
    "targetBodyHeight": 118,
    "visualScale": 0.72,
    "baselineY": 148,
    "animations": [
      {
        "id": "idle",
        "frameCount": 5,
        "fps": 6,
        "loop": true,
        "outputCanvas": {
          "w": 192,
          "h": 160
        },
        "frameDurations": [
          167,
          167,
          167,
          167,
          167
        ],
        "holdFrames": {},
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/idle/0001.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 29,
              "y": 0,
              "w": 374,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 59,
              "w": 326,
              "h": 601,
              "pixels": 83553
            },
            "bodyBounds": {
              "x": 64,
              "y": 30,
              "w": 64,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/idle/0002.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 457,
              "y": 0,
              "w": 375,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 58,
              "w": 327,
              "h": 602,
              "pixels": 83306
            },
            "bodyBounds": {
              "x": 64,
              "y": 30,
              "w": 64,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/idle/0003.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 885,
              "y": 0,
              "w": 384,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 64,
              "w": 336,
              "h": 596,
              "pixels": 84951
            },
            "bodyBounds": {
              "x": 63,
              "y": 31,
              "w": 66,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/idle/0004.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1333,
              "y": 0,
              "w": 377,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 58,
              "w": 329,
              "h": 602,
              "pixels": 84598
            },
            "bodyBounds": {
              "x": 64,
              "y": 30,
              "w": 65,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/idle/0005.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1756,
              "y": 0,
              "w": 376,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 59,
              "w": 328,
              "h": 601,
              "pixels": 84565
            },
            "bodyBounds": {
              "x": 64,
              "y": 30,
              "w": 64,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "walk",
        "frameCount": 6,
        "fps": 8,
        "loop": true,
        "outputCanvas": {
          "w": 192,
          "h": 160
        },
        "frameDurations": [
          125,
          125,
          125,
          125,
          125,
          125
        ],
        "holdFrames": {},
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/walk/0001.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 28,
              "y": 0,
              "w": 370,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 66,
              "w": 322,
              "h": 580,
              "pixels": 78865
            },
            "bodyBounds": {
              "x": 63,
              "y": 29,
              "w": 66,
              "h": 119
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/walk/0002.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 388,
              "y": 0,
              "w": 335,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 66,
              "w": 288,
              "h": 574,
              "pixels": 67873
            },
            "bodyBounds": {
              "x": 67,
              "y": 30,
              "w": 59,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/walk/0003.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 704,
              "y": 0,
              "w": 386,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 68,
              "w": 338,
              "h": 570,
              "pixels": 74258
            },
            "bodyBounds": {
              "x": 62,
              "y": 31,
              "w": 69,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/walk/0004.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1078,
              "y": 0,
              "w": 351,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 67,
              "w": 304,
              "h": 572,
              "pixels": 75071
            },
            "bodyBounds": {
              "x": 65,
              "y": 30,
              "w": 62,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/walk/0005.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1435,
              "y": 0,
              "w": 338,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 67,
              "w": 290,
              "h": 573,
              "pixels": 73896
            },
            "bodyBounds": {
              "x": 66,
              "y": 30,
              "w": 60,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 5,
            "framePath": "/sprites/frames-pack/ronin/walk/0006.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1767,
              "y": 0,
              "w": 371,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 66,
              "w": 324,
              "h": 579,
              "pixels": 79612
            },
            "bodyBounds": {
              "x": 63,
              "y": 29,
              "w": 67,
              "h": 119
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "dash",
        "frameCount": 5,
        "fps": 14,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 160
        },
        "frameDurations": [
          71,
          71,
          71,
          71,
          71
        ],
        "holdFrames": {},
        "warnings": [
          "frame 3: visible pixels reached source slice edge; possible frame bleed or tight crop",
          "frame 4: visible pixels reached source slice edge; possible frame bleed or tight crop",
          "body height variance 28.0% exceeds 18%"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/dash/0001.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 56,
              "y": 0,
              "w": 338,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 124,
              "w": 290,
              "h": 500,
              "pixels": 61362
            },
            "bodyBounds": {
              "x": 72,
              "y": 8,
              "w": 81,
              "h": 140
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 71,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/dash/0002.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 404,
              "y": 0,
              "w": 379,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 200,
              "w": 332,
              "h": 421,
              "pixels": 56111
            },
            "bodyBounds": {
              "x": 66,
              "y": 30,
              "w": 93,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 71,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/dash/0003.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 784,
              "y": 0,
              "w": 478,
              "h": 724
            },
            "sourceBounds": {
              "x": 22,
              "y": 210,
              "w": 456,
              "h": 407,
              "pixels": 64592
            },
            "bodyBounds": {
              "x": 48,
              "y": 34,
              "w": 128,
              "h": 114
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 71,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/dash/0004.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1242,
              "y": 0,
              "w": 508,
              "h": 724
            },
            "sourceBounds": {
              "x": 0,
              "y": 234,
              "w": 484,
              "h": 380,
              "pixels": 61125
            },
            "bodyBounds": {
              "x": 44,
              "y": 41,
              "w": 136,
              "h": 107
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 71,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/dash/0005.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1789,
              "y": 0,
              "w": 341,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 124,
              "w": 293,
              "h": 500,
              "pixels": 61943
            },
            "bodyBounds": {
              "x": 71,
              "y": 8,
              "w": 82,
              "h": 140
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 71,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "density",
        "frameCount": 5,
        "fps": 6,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 160
        },
        "frameDurations": [
          167,
          167,
          167,
          167,
          167
        ],
        "holdFrames": {},
        "warnings": [
          "frame 4: 1241 background-like opaque pixels remain after cleanup",
          "frame 5: 3479 background-like opaque pixels remain after cleanup"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/density/0001.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 47,
              "y": 0,
              "w": 342,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 81,
              "w": 294,
              "h": 559,
              "pixels": 71660
            },
            "bodyBounds": {
              "x": 81,
              "y": 30,
              "w": 62,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/density/0002.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 441,
              "y": 0,
              "w": 409,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 81,
              "w": 362,
              "h": 559,
              "pixels": 77165
            },
            "bodyBounds": {
              "x": 74,
              "y": 30,
              "w": 76,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/density/0003.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 905,
              "y": 0,
              "w": 384,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 84,
              "w": 336,
              "h": 556,
              "pixels": 76749
            },
            "bodyBounds": {
              "x": 77,
              "y": 31,
              "w": 71,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/density/0004.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1336,
              "y": 0,
              "w": 398,
              "h": 724
            },
            "sourceBounds": {
              "x": 22,
              "y": 69,
              "w": 354,
              "h": 572,
              "pixels": 92575
            },
            "bodyBounds": {
              "x": 75,
              "y": 27,
              "w": 75,
              "h": 121
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/density/0005.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1741,
              "y": 0,
              "w": 399,
              "h": 724
            },
            "sourceBounds": {
              "x": 22,
              "y": 61,
              "w": 357,
              "h": 583,
              "pixels": 108488
            },
            "bodyBounds": {
              "x": 75,
              "y": 25,
              "w": 75,
              "h": 123
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "jab",
        "frameCount": 5,
        "fps": 11,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 160
        },
        "frameDurations": [
          90,
          120,
          155,
          125,
          90
        ],
        "holdFrames": {
          "0003": 2
        },
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/jab/0001.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 40,
              "y": 0,
              "w": 342,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 94,
              "w": 294,
              "h": 533,
              "pixels": 67062
            },
            "bodyBounds": {
              "x": 79,
              "y": 27,
              "w": 67,
              "h": 121
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 90,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/jab/0002.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 456,
              "y": 0,
              "w": 379,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 108,
              "w": 332,
              "h": 519,
              "pixels": 66749
            },
            "bodyBounds": {
              "x": 75,
              "y": 30,
              "w": 75,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 120,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/jab/0003.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 882,
              "y": 0,
              "w": 431,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 117,
              "w": 383,
              "h": 510,
              "pixels": 65272
            },
            "bodyBounds": {
              "x": 69,
              "y": 32,
              "w": 87,
              "h": 116
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 155,
            "holdCount": 2,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/jab/0004.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1298,
              "y": 0,
              "w": 474,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 113,
              "w": 426,
              "h": 514,
              "pixels": 65442
            },
            "bodyBounds": {
              "x": 64,
              "y": 31,
              "w": 97,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/jab/0005.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1788,
              "y": 0,
              "w": 348,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 101,
              "w": 300,
              "h": 526,
              "pixels": 66141
            },
            "bodyBounds": {
              "x": 78,
              "y": 28,
              "w": 68,
              "h": 120
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 90,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "cross",
        "frameCount": 5,
        "fps": 10,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 160
        },
        "frameDurations": [
          90,
          115,
          230,
          135,
          95
        ],
        "holdFrames": {
          "0003": 3
        },
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/cross/0001.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 17,
              "y": 0,
              "w": 370,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 71,
              "w": 323,
              "h": 570,
              "pixels": 77172
            },
            "bodyBounds": {
              "x": 78,
              "y": 27,
              "w": 69,
              "h": 121
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 90,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/cross/0002.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 411,
              "y": 0,
              "w": 401,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 85,
              "w": 354,
              "h": 556,
              "pixels": 79576
            },
            "bodyBounds": {
              "x": 75,
              "y": 30,
              "w": 75,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 115,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/cross/0003.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 825,
              "y": 0,
              "w": 442,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 94,
              "w": 394,
              "h": 547,
              "pixels": 81440
            },
            "bodyBounds": {
              "x": 70,
              "y": 32,
              "w": 84,
              "h": 116
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 230,
            "holdCount": 3,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/cross/0004.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1258,
              "y": 0,
              "w": 528,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 90,
              "w": 480,
              "h": 551,
              "pixels": 77694
            },
            "bodyBounds": {
              "x": 61,
              "y": 31,
              "w": 102,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 135,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/cross/0005.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1801,
              "y": 0,
              "w": 365,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 77,
              "w": 317,
              "h": 563,
              "pixels": 75864
            },
            "bodyBounds": {
              "x": 79,
              "y": 29,
              "w": 67,
              "h": 119
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 95,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "calf_kick",
        "frameCount": 5,
        "fps": 9,
        "loop": false,
        "outputCanvas": {
          "w": 256,
          "h": 160
        },
        "frameDurations": [
          111,
          111,
          111,
          111,
          111
        ],
        "holdFrames": {},
        "warnings": [
          "frame 1: visible pixels reached source slice edge; possible frame bleed or tight crop",
          "frame 2: visible pixels reached source slice edge; possible frame bleed or tight crop",
          "frame 4: visible pixels reached source slice edge; possible frame bleed or tight crop",
          "frame 5: visible pixels reached source slice edge; possible frame bleed or tight crop"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/calf_kick/0001.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 0,
              "y": 0,
              "w": 434,
              "h": 724
            },
            "sourceBounds": {
              "x": 22,
              "y": 80,
              "w": 412,
              "h": 555,
              "pixels": 74724
            },
            "bodyBounds": {
              "x": 84,
              "y": 30,
              "w": 88,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 111,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/calf_kick/0002.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 434,
              "y": 0,
              "w": 434,
              "h": 724
            },
            "sourceBounds": {
              "x": 0,
              "y": 81,
              "w": 300,
              "h": 553,
              "pixels": 75691
            },
            "bodyBounds": {
              "x": 96,
              "y": 30,
              "w": 64,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 111,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/calf_kick/0003.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 868,
              "y": 0,
              "w": 434,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 115,
              "w": 379,
              "h": 512,
              "pixels": 65456
            },
            "bodyBounds": {
              "x": 88,
              "y": 39,
              "w": 81,
              "h": 109
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 111,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/calf_kick/0004.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1302,
              "y": 0,
              "w": 434,
              "h": 724
            },
            "sourceBounds": {
              "x": 3,
              "y": 121,
              "w": 431,
              "h": 506,
              "pixels": 68553
            },
            "bodyBounds": {
              "x": 82,
              "y": 40,
              "w": 92,
              "h": 108
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 111,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/calf_kick/0005.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1736,
              "y": 0,
              "w": 436,
              "h": 724
            },
            "sourceBounds": {
              "x": 0,
              "y": 81,
              "w": 395,
              "h": 554,
              "pixels": 77405
            },
            "bodyBounds": {
              "x": 86,
              "y": 30,
              "w": 84,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 111,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "knee",
        "frameCount": 5,
        "fps": 8,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 160
        },
        "frameDurations": [
          125,
          125,
          125,
          125,
          125
        ],
        "holdFrames": {},
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/knee/0001.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 71,
              "y": 0,
              "w": 367,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 71,
              "w": 319,
              "h": 583,
              "pixels": 80379
            },
            "bodyBounds": {
              "x": 80,
              "y": 31,
              "w": 64,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/knee/0002.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 510,
              "y": 0,
              "w": 401,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 60,
              "w": 354,
              "h": 593,
              "pixels": 81083
            },
            "bodyBounds": {
              "x": 77,
              "y": 29,
              "w": 71,
              "h": 119
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/knee/0003.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 992,
              "y": 0,
              "w": 309,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 49,
              "w": 261,
              "h": 592,
              "pixels": 73709
            },
            "bodyBounds": {
              "x": 86,
              "y": 29,
              "w": 52,
              "h": 119
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/knee/0004.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1383,
              "y": 0,
              "w": 287,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 55,
              "w": 239,
              "h": 586,
              "pixels": 68637
            },
            "bodyBounds": {
              "x": 88,
              "y": 30,
              "w": 48,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/knee/0005.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1740,
              "y": 0,
              "w": 362,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 65,
              "w": 314,
              "h": 588,
              "pixels": 78566
            },
            "bodyBounds": {
              "x": 81,
              "y": 30,
              "w": 63,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "hit_react",
        "frameCount": 5,
        "fps": 8,
        "loop": false,
        "outputCanvas": {
          "w": 192,
          "h": 160
        },
        "frameDurations": [
          125,
          125,
          125,
          125,
          125
        ],
        "holdFrames": {},
        "warnings": [
          "frame 3: visible pixels reached source slice edge; possible frame bleed or tight crop",
          "frame 4: visible pixels reached source slice edge; possible frame bleed or tight crop"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/hit_react/0001.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 21,
              "y": 0,
              "w": 369,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 58,
              "w": 321,
              "h": 592,
              "pixels": 81572
            },
            "bodyBounds": {
              "x": 64,
              "y": 30,
              "w": 64,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/hit_react/0002.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 497,
              "y": 0,
              "w": 362,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 59,
              "w": 314,
              "h": 591,
              "pixels": 80186
            },
            "bodyBounds": {
              "x": 65,
              "y": 30,
              "w": 63,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/hit_react/0003.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 939,
              "y": 0,
              "w": 346,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 86,
              "w": 322,
              "h": 565,
              "pixels": 78314
            },
            "bodyBounds": {
              "x": 64,
              "y": 35,
              "w": 64,
              "h": 113
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/hit_react/0004.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1255,
              "y": 0,
              "w": 442,
              "h": 724
            },
            "sourceBounds": {
              "x": 0,
              "y": 77,
              "w": 418,
              "h": 573,
              "pixels": 78974
            },
            "bodyBounds": {
              "x": 55,
              "y": 34,
              "w": 83,
              "h": 114
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/hit_react/0005.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1717,
              "y": 0,
              "w": 373,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 58,
              "w": 325,
              "h": 592,
              "pixels": 81747
            },
            "bodyBounds": {
              "x": 64,
              "y": 30,
              "w": 65,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "recovery",
        "frameCount": 5,
        "fps": 8,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 160
        },
        "frameDurations": [
          125,
          125,
          125,
          125,
          125
        ],
        "holdFrames": {},
        "warnings": [
          "body height variance 43.2% exceeds 18%"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/recovery/0001.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 41,
              "y": 0,
              "w": 374,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 299,
              "w": 327,
              "h": 341,
              "pixels": 60502
            },
            "bodyBounds": {
              "x": 75,
              "y": 70,
              "w": 74,
              "h": 78
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/recovery/0002.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 496,
              "y": 0,
              "w": 328,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 190,
              "w": 280,
              "h": 446,
              "pixels": 62817
            },
            "bodyBounds": {
              "x": 80,
              "y": 47,
              "w": 64,
              "h": 101
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/recovery/0003.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 899,
              "y": 0,
              "w": 356,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 118,
              "w": 309,
              "h": 519,
              "pixels": 74015
            },
            "bodyBounds": {
              "x": 77,
              "y": 30,
              "w": 70,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/recovery/0004.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1331,
              "y": 0,
              "w": 353,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 69,
              "w": 305,
              "h": 568,
              "pixels": 75100
            },
            "bodyBounds": {
              "x": 78,
              "y": 19,
              "w": 69,
              "h": 129
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/recovery/0005.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1756,
              "y": 0,
              "w": 358,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 69,
              "w": 310,
              "h": 569,
              "pixels": 75831
            },
            "bodyBounds": {
              "x": 77,
              "y": 19,
              "w": 70,
              "h": 129
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "stand_up",
        "frameCount": 6,
        "fps": 7,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 224
        },
        "frameDurations": [
          143,
          143,
          143,
          143,
          143,
          143
        ],
        "holdFrames": {},
        "warnings": [
          "body height variance 100.8% exceeds 18%"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/ronin/stand_up/0001.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 0,
              "y": 0,
              "w": 447,
              "h": 724
            },
            "sourceBounds": {
              "x": 13,
              "y": 456,
              "w": 410,
              "h": 138,
              "pixels": 34016
            },
            "bodyBounds": {
              "x": 42,
              "y": 165,
              "w": 141,
              "h": 47
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/ronin/stand_up/0002.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 437,
              "y": 0,
              "w": 399,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 374,
              "w": 353,
              "h": 228,
              "pixels": 35489
            },
            "bodyBounds": {
              "x": 52,
              "y": 134,
              "w": 121,
              "h": 78
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/ronin/stand_up/0003.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 863,
              "y": 0,
              "w": 309,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 314,
              "w": 261,
              "h": 287,
              "pixels": 40021
            },
            "bodyBounds": {
              "x": 67,
              "y": 113,
              "w": 90,
              "h": 99
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/ronin/stand_up/0004.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1192,
              "y": 0,
              "w": 296,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 253,
              "w": 249,
              "h": 343,
              "pixels": 42537
            },
            "bodyBounds": {
              "x": 69,
              "y": 94,
              "w": 86,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/ronin/stand_up/0005.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1512,
              "y": 0,
              "w": 292,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 149,
              "w": 244,
              "h": 453,
              "pixels": 52689
            },
            "bodyBounds": {
              "x": 70,
              "y": 56,
              "w": 84,
              "h": 156
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 5,
            "framePath": "/sprites/frames-pack/ronin/stand_up/0006.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1834,
              "y": 0,
              "w": 320,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 120,
              "w": 272,
              "h": 483,
              "pixels": 53922
            },
            "bodyBounds": {
              "x": 65,
              "y": 46,
              "w": 94,
              "h": 166
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      }
    ]
  },
  {
    "id": "supreme-emperor",
    "displayName": "Supreme Emperor",
    "style": "semi-realistic",
    "enabled": true,
    "targetBodyHeight": 118,
    "visualScale": 0.72,
    "baselineY": 148,
    "animations": [
      {
        "id": "idle",
        "frameCount": 5,
        "fps": 6,
        "loop": true,
        "outputCanvas": {
          "w": 192,
          "h": 160
        },
        "frameDurations": [
          167,
          167,
          167,
          167,
          167
        ],
        "holdFrames": {},
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/idle/0001.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 24,
              "y": 0,
              "w": 313,
              "h": 881
            },
            "sourceBounds": {
              "x": 20,
              "y": 96,
              "w": 275,
              "h": 666,
              "pixels": 90460
            },
            "bodyBounds": {
              "x": 72,
              "y": 30,
              "w": 49,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/idle/0002.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 353,
              "y": 0,
              "w": 316,
              "h": 881
            },
            "sourceBounds": {
              "x": 20,
              "y": 87,
              "w": 278,
              "h": 675,
              "pixels": 93495
            },
            "bodyBounds": {
              "x": 72,
              "y": 28,
              "w": 49,
              "h": 120
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/idle/0003.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 725,
              "y": 0,
              "w": 318,
              "h": 881
            },
            "sourceBounds": {
              "x": 19,
              "y": 105,
              "w": 275,
              "h": 659,
              "pixels": 91070
            },
            "bodyBounds": {
              "x": 72,
              "y": 31,
              "w": 49,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/idle/0004.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1059,
              "y": 0,
              "w": 367,
              "h": 881
            },
            "sourceBounds": {
              "x": 18,
              "y": 112,
              "w": 333,
              "h": 650,
              "pixels": 93052
            },
            "bodyBounds": {
              "x": 67,
              "y": 32,
              "w": 59,
              "h": 116
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/idle/0005.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1432,
              "y": 0,
              "w": 311,
              "h": 881
            },
            "sourceBounds": {
              "x": 19,
              "y": 98,
              "w": 275,
              "h": 664,
              "pixels": 89401
            },
            "bodyBounds": {
              "x": 72,
              "y": 30,
              "w": 49,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 167,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "walk",
        "frameCount": 6,
        "fps": 8,
        "loop": true,
        "outputCanvas": {
          "w": 192,
          "h": 160
        },
        "frameDurations": [
          125,
          125,
          125,
          125,
          125,
          125
        ],
        "holdFrames": {},
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/walk/0001.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 20,
              "y": 0,
              "w": 296,
              "h": 724
            },
            "sourceBounds": {
              "x": 20,
              "y": 55,
              "w": 253,
              "h": 601,
              "pixels": 75470
            },
            "bodyBounds": {
              "x": 71,
              "y": 30,
              "w": 50,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/walk/0002.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 323,
              "y": 0,
              "w": 421,
              "h": 724
            },
            "sourceBounds": {
              "x": 20,
              "y": 56,
              "w": 378,
              "h": 599,
              "pixels": 79133
            },
            "bodyBounds": {
              "x": 59,
              "y": 30,
              "w": 74,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/walk/0003.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 737,
              "y": 0,
              "w": 365,
              "h": 724
            },
            "sourceBounds": {
              "x": 17,
              "y": 56,
              "w": 324,
              "h": 600,
              "pixels": 77588
            },
            "bodyBounds": {
              "x": 64,
              "y": 30,
              "w": 64,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/walk/0004.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1105,
              "y": 0,
              "w": 327,
              "h": 724
            },
            "sourceBounds": {
              "x": 21,
              "y": 53,
              "w": 283,
              "h": 601,
              "pixels": 71759
            },
            "bodyBounds": {
              "x": 68,
              "y": 30,
              "w": 56,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/walk/0005.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1444,
              "y": 0,
              "w": 366,
              "h": 724
            },
            "sourceBounds": {
              "x": 17,
              "y": 55,
              "w": 325,
              "h": 599,
              "pixels": 76760
            },
            "bodyBounds": {
              "x": 64,
              "y": 30,
              "w": 64,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 5,
            "framePath": "/sprites/frames-pack/supreme-emperor/walk/0006.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1854,
              "y": 0,
              "w": 296,
              "h": 724
            },
            "sourceBounds": {
              "x": 19,
              "y": 54,
              "w": 254,
              "h": 602,
              "pixels": 75187
            },
            "bodyBounds": {
              "x": 71,
              "y": 30,
              "w": 50,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "dash",
        "frameCount": 5,
        "fps": 14,
        "loop": false,
        "outputCanvas": {
          "w": 288,
          "h": 176
        },
        "frameDurations": [
          71,
          71,
          71,
          71,
          71
        ],
        "holdFrames": {},
        "warnings": [
          "frame 3: visible pixels reached source slice edge; possible frame bleed or tight crop",
          "frame 4: visible pixels reached source slice edge; possible frame bleed or tight crop",
          "body height variance 33.9% exceeds 18%"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/dash/0001.png",
            "frameSize": {
              "w": 288,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 0,
              "y": 0,
              "w": 434,
              "h": 724
            },
            "sourceBounds": {
              "x": 29,
              "y": 122,
              "w": 324,
              "h": 503,
              "pixels": 75972
            },
            "bodyBounds": {
              "x": 99,
              "y": 23,
              "w": 91,
              "h": 141
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 71,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/dash/0002.png",
            "frameSize": {
              "w": 288,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 434,
              "y": 0,
              "w": 434,
              "h": 724
            },
            "sourceBounds": {
              "x": 19,
              "y": 261,
              "w": 308,
              "h": 359,
              "pixels": 57840
            },
            "bodyBounds": {
              "x": 101,
              "y": 63,
              "w": 86,
              "h": 101
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 71,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/dash/0003.png",
            "frameSize": {
              "w": 288,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 868,
              "y": 0,
              "w": 434,
              "h": 724
            },
            "sourceBounds": {
              "x": 0,
              "y": 196,
              "w": 423,
              "h": 421,
              "pixels": 63180
            },
            "bodyBounds": {
              "x": 85,
              "y": 46,
              "w": 119,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 71,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/dash/0004.png",
            "frameSize": {
              "w": 288,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1302,
              "y": 0,
              "w": 434,
              "h": 724
            },
            "sourceBounds": {
              "x": 0,
              "y": 204,
              "w": 434,
              "h": 414,
              "pixels": 65627
            },
            "bodyBounds": {
              "x": 83,
              "y": 48,
              "w": 122,
              "h": 116
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 71,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/dash/0005.png",
            "frameSize": {
              "w": 288,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1736,
              "y": 0,
              "w": 436,
              "h": 724
            },
            "sourceBounds": {
              "x": 17,
              "y": 145,
              "w": 377,
              "h": 480,
              "pixels": 64892
            },
            "bodyBounds": {
              "x": 91,
              "y": 29,
              "w": 106,
              "h": 135
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 71,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "jab_cross",
        "frameCount": 6,
        "fps": 11,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 160
        },
        "frameDurations": [
          80,
          170,
          90,
          95,
          260,
          120
        ],
        "holdFrames": {
          "0002": 2,
          "0005": 3
        },
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/jab_cross/0001.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 32,
              "y": 0,
              "w": 283,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 152,
              "w": 235,
              "h": 409,
              "pixels": 40764
            },
            "bodyBounds": {
              "x": 78,
              "y": 28,
              "w": 69,
              "h": 120
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 80,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/jab_cross/0002.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 386,
              "y": 0,
              "w": 302,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 161,
              "w": 254,
              "h": 402,
              "pixels": 41266
            },
            "bodyBounds": {
              "x": 75,
              "y": 30,
              "w": 75,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 170,
            "holdCount": 2,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/jab_cross/0003.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 699,
              "y": 0,
              "w": 383,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 168,
              "w": 336,
              "h": 398,
              "pixels": 41784
            },
            "bodyBounds": {
              "x": 63,
              "y": 31,
              "w": 99,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 90,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/jab_cross/0004.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1069,
              "y": 0,
              "w": 404,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 164,
              "w": 359,
              "h": 402,
              "pixels": 40828
            },
            "bodyBounds": {
              "x": 60,
              "y": 30,
              "w": 105,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 95,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/jab_cross/0005.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1466,
              "y": 0,
              "w": 259,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 163,
              "w": 211,
              "h": 404,
              "pixels": 38879
            },
            "bodyBounds": {
              "x": 81,
              "y": 29,
              "w": 62,
              "h": 119
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 260,
            "holdCount": 3,
            "cutoff": false
          },
          {
            "frameIndex": 5,
            "framePath": "/sprites/frames-pack/supreme-emperor/jab_cross/0006.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1835,
              "y": 0,
              "w": 282,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 169,
              "w": 234,
              "h": 400,
              "pixels": 39044
            },
            "bodyBounds": {
              "x": 78,
              "y": 31,
              "w": 69,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 120,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "feint_rear_hook",
        "frameCount": 8,
        "fps": 8,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 160
        },
        "frameDurations": [
          125,
          125,
          125,
          125,
          125,
          125,
          125,
          125
        ],
        "holdFrames": {},
        "warnings": [
          "body height variance 32.2% exceeds 18%"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/feint_rear_hook/0001.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1,
              "y": 0,
              "w": 229,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 190,
              "w": 181,
              "h": 345,
              "pixels": 28709
            },
            "bodyBounds": {
              "x": 78,
              "y": 18,
              "w": 68,
              "h": 130
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/feint_rear_hook/0002.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 278,
              "y": 0,
              "w": 225,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 239,
              "w": 177,
              "h": 296,
              "pixels": 25855
            },
            "bodyBounds": {
              "x": 79,
              "y": 37,
              "w": 67,
              "h": 111
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/feint_rear_hook/0003.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 551,
              "y": 0,
              "w": 238,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 272,
              "w": 191,
              "h": 263,
              "pixels": 24441
            },
            "bodyBounds": {
              "x": 76,
              "y": 49,
              "w": 72,
              "h": 99
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/feint_rear_hook/0004.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 812,
              "y": 0,
              "w": 257,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 289,
              "w": 209,
              "h": 246,
              "pixels": 22047
            },
            "bodyBounds": {
              "x": 73,
              "y": 56,
              "w": 79,
              "h": 92
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/feint_rear_hook/0005.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1095,
              "y": 0,
              "w": 252,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 223,
              "w": 204,
              "h": 312,
              "pixels": 27010
            },
            "bodyBounds": {
              "x": 74,
              "y": 31,
              "w": 77,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 5,
            "framePath": "/sprites/frames-pack/supreme-emperor/feint_rear_hook/0006.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1357,
              "y": 0,
              "w": 256,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 211,
              "w": 209,
              "h": 323,
              "pixels": 26909
            },
            "bodyBounds": {
              "x": 73,
              "y": 27,
              "w": 79,
              "h": 121
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 6,
            "framePath": "/sprites/frames-pack/supreme-emperor/feint_rear_hook/0007.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1614,
              "y": 0,
              "w": 332,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 220,
              "w": 289,
              "h": 314,
              "pixels": 27399
            },
            "bodyBounds": {
              "x": 58,
              "y": 30,
              "w": 109,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 7,
            "framePath": "/sprites/frames-pack/supreme-emperor/feint_rear_hook/0008.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1938,
              "y": 0,
              "w": 230,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 193,
              "w": 182,
              "h": 343,
              "pixels": 28356
            },
            "bodyBounds": {
              "x": 78,
              "y": 19,
              "w": 68,
              "h": 129
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "tornado_kick",
        "frameCount": 9,
        "fps": 7,
        "loop": false,
        "outputCanvas": {
          "w": 320,
          "h": 176
        },
        "frameDurations": [
          70,
          70,
          70,
          80,
          120,
          100,
          360,
          80,
          70
        ],
        "holdFrames": {
          "0007": 4
        },
        "warnings": [
          "body height variance 20.3% exceeds 18%"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/tornado_kick/0001.png",
            "frameSize": {
              "w": 320,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 20,
              "y": 0,
              "w": 197,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 201,
              "w": 149,
              "h": 286,
              "pixels": 20145
            },
            "bodyBounds": {
              "x": 129,
              "y": 46,
              "w": 62,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 70,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/tornado_kick/0002.png",
            "frameSize": {
              "w": 320,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 259,
              "y": 0,
              "w": 213,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 205,
              "w": 165,
              "h": 282,
              "pixels": 20048
            },
            "bodyBounds": {
              "x": 126,
              "y": 47,
              "w": 68,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 70,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/tornado_kick/0003.png",
            "frameSize": {
              "w": 320,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 542,
              "y": 0,
              "w": 220,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 208,
              "w": 173,
              "h": 277,
              "pixels": 20240
            },
            "bodyBounds": {
              "x": 124,
              "y": 49,
              "w": 72,
              "h": 115
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 70,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/tornado_kick/0004.png",
            "frameSize": {
              "w": 320,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 793,
              "y": 0,
              "w": 154,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 205,
              "w": 106,
              "h": 280,
              "pixels": 15589
            },
            "bodyBounds": {
              "x": 138,
              "y": 48,
              "w": 44,
              "h": 116
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 80,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/tornado_kick/0005.png",
            "frameSize": {
              "w": 320,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1017,
              "y": 0,
              "w": 180,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 176,
              "w": 133,
              "h": 302,
              "pixels": 18107
            },
            "bodyBounds": {
              "x": 133,
              "y": 39,
              "w": 55,
              "h": 125
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 120,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 5,
            "framePath": "/sprites/frames-pack/supreme-emperor/tornado_kick/0006.png",
            "frameSize": {
              "w": 320,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1224,
              "y": 0,
              "w": 174,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 185,
              "w": 126,
              "h": 290,
              "pixels": 16583
            },
            "bodyBounds": {
              "x": 134,
              "y": 44,
              "w": 52,
              "h": 120
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 100,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 6,
            "framePath": "/sprites/frames-pack/supreme-emperor/tornado_kick/0007.png",
            "frameSize": {
              "w": 320,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1424,
              "y": 0,
              "w": 312,
              "h": 724
            },
            "sourceBounds": {
              "x": 16,
              "y": 191,
              "w": 272,
              "h": 292,
              "pixels": 21281
            },
            "bodyBounds": {
              "x": 104,
              "y": 43,
              "w": 113,
              "h": 121
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 360,
            "holdCount": 4,
            "cutoff": false
          },
          {
            "frameIndex": 7,
            "framePath": "/sprites/frames-pack/supreme-emperor/tornado_kick/0008.png",
            "frameSize": {
              "w": 320,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1700,
              "y": 0,
              "w": 217,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 242,
              "w": 169,
              "h": 244,
              "pixels": 17218
            },
            "bodyBounds": {
              "x": 125,
              "y": 63,
              "w": 70,
              "h": 101
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 80,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 8,
            "framePath": "/sprites/frames-pack/supreme-emperor/tornado_kick/0009.png",
            "frameSize": {
              "w": 320,
              "h": 176
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1932,
              "y": 0,
              "w": 195,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 202,
              "w": 147,
              "h": 285,
              "pixels": 19653
            },
            "bodyBounds": {
              "x": 130,
              "y": 46,
              "w": 61,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.9318181818181818,
            "durationMs": 70,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "roundhouse_kick",
        "frameCount": 7,
        "fps": 7,
        "loop": false,
        "outputCanvas": {
          "w": 256,
          "h": 160
        },
        "frameDurations": [
          143,
          143,
          143,
          143,
          143,
          143,
          143
        ],
        "holdFrames": {},
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/roundhouse_kick/0001.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 0,
              "y": 0,
              "w": 234,
              "h": 821
            },
            "sourceBounds": {
              "x": 21,
              "y": 209,
              "w": 189,
              "h": 415,
              "pixels": 37318
            },
            "bodyBounds": {
              "x": 101,
              "y": 27,
              "w": 55,
              "h": 121
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/roundhouse_kick/0002.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 230,
              "y": 0,
              "w": 257,
              "h": 821
            },
            "sourceBounds": {
              "x": 21,
              "y": 219,
              "w": 212,
              "h": 405,
              "pixels": 35790
            },
            "bodyBounds": {
              "x": 97,
              "y": 30,
              "w": 62,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/roundhouse_kick/0003.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 526,
              "y": 0,
              "w": 230,
              "h": 821
            },
            "sourceBounds": {
              "x": 24,
              "y": 201,
              "w": 182,
              "h": 421,
              "pixels": 33372
            },
            "bodyBounds": {
              "x": 102,
              "y": 25,
              "w": 53,
              "h": 123
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/roundhouse_kick/0004.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 794,
              "y": 0,
              "w": 280,
              "h": 821
            },
            "sourceBounds": {
              "x": 24,
              "y": 209,
              "w": 232,
              "h": 405,
              "pixels": 33985
            },
            "bodyBounds": {
              "x": 94,
              "y": 30,
              "w": 68,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/roundhouse_kick/0005.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1064,
              "y": 0,
              "w": 416,
              "h": 821
            },
            "sourceBounds": {
              "x": 24,
              "y": 230,
              "w": 369,
              "h": 384,
              "pixels": 36995
            },
            "bodyBounds": {
              "x": 74,
              "y": 36,
              "w": 108,
              "h": 112
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 5,
            "framePath": "/sprites/frames-pack/supreme-emperor/roundhouse_kick/0006.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1475,
              "y": 0,
              "w": 197,
              "h": 821
            },
            "sourceBounds": {
              "x": 24,
              "y": 215,
              "w": 149,
              "h": 402,
              "pixels": 29940
            },
            "bodyBounds": {
              "x": 107,
              "y": 31,
              "w": 43,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 6,
            "framePath": "/sprites/frames-pack/supreme-emperor/roundhouse_kick/0007.png",
            "frameSize": {
              "w": 256,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1688,
              "y": 0,
              "w": 221,
              "h": 821
            },
            "sourceBounds": {
              "x": 21,
              "y": 224,
              "w": 176,
              "h": 402,
              "pixels": 34470
            },
            "bodyBounds": {
              "x": 103,
              "y": 31,
              "w": 51,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "hit_react",
        "frameCount": 5,
        "fps": 8,
        "loop": false,
        "outputCanvas": {
          "w": 192,
          "h": 160
        },
        "frameDurations": [
          125,
          125,
          125,
          125,
          125
        ],
        "holdFrames": {},
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/hit_react/0001.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 35,
              "y": 0,
              "w": 382,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 45,
              "w": 338,
              "h": 633,
              "pixels": 93198
            },
            "bodyBounds": {
              "x": 64,
              "y": 28,
              "w": 64,
              "h": 120
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/hit_react/0002.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 469,
              "y": 0,
              "w": 397,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 53,
              "w": 351,
              "h": 625,
              "pixels": 97244
            },
            "bodyBounds": {
              "x": 63,
              "y": 30,
              "w": 66,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/hit_react/0003.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 915,
              "y": 0,
              "w": 378,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 61,
              "w": 332,
              "h": 617,
              "pixels": 94146
            },
            "bodyBounds": {
              "x": 65,
              "y": 32,
              "w": 63,
              "h": 116
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/hit_react/0004.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1312,
              "y": 0,
              "w": 379,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 56,
              "w": 333,
              "h": 622,
              "pixels": 94506
            },
            "bodyBounds": {
              "x": 65,
              "y": 31,
              "w": 63,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/hit_react/0005.png",
            "frameSize": {
              "w": 192,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1745,
              "y": 0,
              "w": 371,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 44,
              "w": 327,
              "h": 634,
              "pixels": 93913
            },
            "bodyBounds": {
              "x": 65,
              "y": 28,
              "w": 62,
              "h": 120
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 125,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "recovery",
        "frameCount": 5,
        "fps": 7,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 160
        },
        "frameDurations": [
          143,
          143,
          143,
          143,
          143
        ],
        "holdFrames": {},
        "warnings": [
          "body height variance 47.5% exceeds 18%"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/recovery/0001.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 56,
              "y": 0,
              "w": 361,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 304,
              "w": 314,
              "h": 350,
              "pixels": 66989
            },
            "bodyBounds": {
              "x": 79,
              "y": 73,
              "w": 67,
              "h": 75
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/recovery/0002.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 449,
              "y": 0,
              "w": 417,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 244,
              "w": 369,
              "h": 406,
              "pixels": 77592
            },
            "bodyBounds": {
              "x": 73,
              "y": 61,
              "w": 79,
              "h": 87
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/recovery/0003.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 909,
              "y": 0,
              "w": 361,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 103,
              "w": 314,
              "h": 549,
              "pixels": 81776
            },
            "bodyBounds": {
              "x": 79,
              "y": 30,
              "w": 67,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/recovery/0004.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1340,
              "y": 0,
              "w": 341,
              "h": 724
            },
            "sourceBounds": {
              "x": 22,
              "y": 42,
              "w": 298,
              "h": 610,
              "pixels": 85312
            },
            "bodyBounds": {
              "x": 80,
              "y": 17,
              "w": 64,
              "h": 131
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/recovery/0005.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1753,
              "y": 0,
              "w": 315,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 43,
              "w": 272,
              "h": 609,
              "pixels": 82762
            },
            "bodyBounds": {
              "x": 83,
              "y": 17,
              "w": 58,
              "h": 131
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "stand_up",
        "frameCount": 6,
        "fps": 7,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 224
        },
        "frameDurations": [
          143,
          143,
          143,
          143,
          143,
          143
        ],
        "holdFrames": {},
        "warnings": [
          "body height variance 99.2% exceeds 18%"
        ],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/stand_up/0001.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 0,
              "y": 0,
              "w": 469,
              "h": 724
            },
            "sourceBounds": {
              "x": 12,
              "y": 407,
              "w": 433,
              "h": 210,
              "pixels": 49337
            },
            "bodyBounds": {
              "x": 32,
              "y": 135,
              "w": 160,
              "h": 77
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/stand_up/0002.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 493,
              "y": 0,
              "w": 287,
              "h": 724
            },
            "sourceBounds": {
              "x": 20,
              "y": 345,
              "w": 243,
              "h": 273,
              "pixels": 39227
            },
            "bodyBounds": {
              "x": 67,
              "y": 111,
              "w": 90,
              "h": 101
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/stand_up/0003.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 832,
              "y": 0,
              "w": 331,
              "h": 724
            },
            "sourceBounds": {
              "x": 17,
              "y": 305,
              "w": 291,
              "h": 309,
              "pixels": 47073
            },
            "bodyBounds": {
              "x": 59,
              "y": 98,
              "w": 107,
              "h": 114
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/stand_up/0004.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1194,
              "y": 0,
              "w": 299,
              "h": 724
            },
            "sourceBounds": {
              "x": 20,
              "y": 297,
              "w": 255,
              "h": 320,
              "pixels": 47347
            },
            "bodyBounds": {
              "x": 65,
              "y": 94,
              "w": 94,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/stand_up/0005.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1531,
              "y": 0,
              "w": 285,
              "h": 724
            },
            "sourceBounds": {
              "x": 18,
              "y": 128,
              "w": 249,
              "h": 489,
              "pixels": 61568
            },
            "bodyBounds": {
              "x": 66,
              "y": 32,
              "w": 92,
              "h": 180
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 5,
            "framePath": "/sprites/frames-pack/supreme-emperor/stand_up/0006.png",
            "frameSize": {
              "w": 224,
              "h": 224
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1861,
              "y": 0,
              "w": 273,
              "h": 724
            },
            "sourceBounds": {
              "x": 19,
              "y": 93,
              "w": 235,
              "h": 525,
              "pixels": 60351
            },
            "bodyBounds": {
              "x": 69,
              "y": 18,
              "w": 87,
              "h": 194
            },
            "anchorX": 0.5,
            "anchorY": 0.9464285714285714,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      },
      {
        "id": "instant_death",
        "frameCount": 5,
        "fps": 7,
        "loop": false,
        "outputCanvas": {
          "w": 224,
          "h": 160
        },
        "frameDurations": [
          143,
          143,
          143,
          143,
          143
        ],
        "holdFrames": {},
        "warnings": [],
        "frames": [
          {
            "frameIndex": 0,
            "framePath": "/sprites/frames-pack/supreme-emperor/instant_death/0001.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 56,
              "y": 0,
              "w": 323,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 46,
              "w": 276,
              "h": 618,
              "pixels": 84541
            },
            "bodyBounds": {
              "x": 86,
              "y": 28,
              "w": 53,
              "h": 120
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 1,
            "framePath": "/sprites/frames-pack/supreme-emperor/instant_death/0002.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 434,
              "y": 0,
              "w": 342,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 52,
              "w": 294,
              "h": 613,
              "pixels": 84085
            },
            "bodyBounds": {
              "x": 84,
              "y": 29,
              "w": 57,
              "h": 119
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 2,
            "framePath": "/sprites/frames-pack/supreme-emperor/instant_death/0003.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 860,
              "y": 0,
              "w": 357,
              "h": 724
            },
            "sourceBounds": {
              "x": 23,
              "y": 55,
              "w": 310,
              "h": 609,
              "pixels": 91227
            },
            "bodyBounds": {
              "x": 82,
              "y": 30,
              "w": 60,
              "h": 118
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 3,
            "framePath": "/sprites/frames-pack/supreme-emperor/instant_death/0004.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1262,
              "y": 0,
              "w": 415,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 62,
              "w": 368,
              "h": 602,
              "pixels": 103328
            },
            "bodyBounds": {
              "x": 77,
              "y": 31,
              "w": 71,
              "h": 117
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          },
          {
            "frameIndex": 4,
            "framePath": "/sprites/frames-pack/supreme-emperor/instant_death/0005.png",
            "frameSize": {
              "w": 224,
              "h": 160
            },
            "targetBodyHeight": 118,
            "visualScale": 0.72,
            "sourceSlice": {
              "x": 1674,
              "y": 0,
              "w": 473,
              "h": 724
            },
            "sourceBounds": {
              "x": 24,
              "y": 131,
              "w": 425,
              "h": 532,
              "pixels": 86838
            },
            "bodyBounds": {
              "x": 71,
              "y": 45,
              "w": 82,
              "h": 103
            },
            "anchorX": 0.5,
            "anchorY": 0.925,
            "durationMs": 143,
            "holdCount": 1,
            "cutoff": false
          }
        ]
      }
    ]
  }
];

export function getGeneratedSpritePackAnimation(entityId: string, animationKey: string): GeneratedSpritePackAnimation | undefined {
  return generatedSpriteRegistry.find((pack) => pack.enabled && pack.id === entityId)?.animations.find((animation) => animation.id === animationKey);
}

export function getGeneratedSpritePackFrame(entityId: string, animationKey: string, frameIndex: number): GeneratedSpritePackFrame | undefined {
  return getGeneratedSpritePackAnimation(entityId, animationKey)?.frames.find((frame) => frame.frameIndex === frameIndex);
}
