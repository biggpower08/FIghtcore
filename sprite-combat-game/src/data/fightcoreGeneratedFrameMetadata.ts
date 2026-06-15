export interface FightcoreGeneratedFrame {
  x: number;
  w: number;
  h: number;
  anchorX: number;
  anchorY: number;
}

export interface FightcoreGeneratedAnimationMetadata {
  entityId: string;
  sheetId: string;
  animationKey: string;
  stripPath: string;
  frameHeight: number;
  frameCount: number;
  expectedFrameCount: number | null;
  fps: number;
  loop: boolean;
  embeddedTarget?: boolean;
  hideTargetSprite?: boolean;
  targetSuppressionStartFrame?: number;
  targetSuppressionEndFrame?: number;
  frames: FightcoreGeneratedFrame[];
}

export const fightcoreGeneratedFrameMetadata: FightcoreGeneratedAnimationMetadata[] = [
  {
    "entityId": "cyber-ninja",
    "sheetId": "fightcore-cyber-ninja-atlas",
    "animationKey": "idle",
    "stripPath": "idle-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": 4,
    "fps": 8,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 48,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88
      },
      {
        "x": 48,
        "w": 47,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88
      },
      {
        "x": 95,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88
      },
      {
        "x": 141,
        "w": 49,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-ninja",
    "sheetId": "fightcore-cyber-ninja-atlas",
    "animationKey": "walk",
    "stripPath": "walk-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": 6,
    "fps": 10,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 53,
        "w": 57,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      },
      {
        "x": 110,
        "w": 57,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      },
      {
        "x": 167,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88
      },
      {
        "x": 213,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88
      },
      {
        "x": 258,
        "w": 48,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-ninja",
    "sheetId": "fightcore-cyber-ninja-atlas",
    "animationKey": "dash",
    "stripPath": "dash-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": 5,
    "fps": 14,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 87,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88
      },
      {
        "x": 87,
        "w": 84,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88
      },
      {
        "x": 171,
        "w": 88,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88
      },
      {
        "x": 259,
        "w": 100,
        "h": 96,
        "anchorX": 50,
        "anchorY": 88
      },
      {
        "x": 359,
        "w": 74,
        "h": 96,
        "anchorX": 37,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-ninja",
    "sheetId": "fightcore-cyber-ninja-atlas",
    "animationKey": "jab",
    "stripPath": "jab-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": 5,
    "fps": 16,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 53,
        "w": 73,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88
      },
      {
        "x": 126,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 207,
        "w": 75,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88
      },
      {
        "x": 282,
        "w": 54,
        "h": 96,
        "anchorX": 27,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-ninja",
    "sheetId": "fightcore-cyber-ninja-atlas",
    "animationKey": "slice",
    "stripPath": "slice-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": 6,
    "fps": 14,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      },
      {
        "x": 55,
        "w": 104,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88
      },
      {
        "x": 159,
        "w": 96,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88
      },
      {
        "x": 255,
        "w": 86,
        "h": 96,
        "anchorX": 43,
        "anchorY": 88
      },
      {
        "x": 341,
        "w": 163,
        "h": 96,
        "anchorX": 82,
        "anchorY": 88
      },
      {
        "x": 504,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-ninja",
    "sheetId": "fightcore-cyber-ninja-atlas",
    "animationKey": "high_kick",
    "stripPath": "high-kick-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": 7,
    "fps": 13,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 71,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88
      },
      {
        "x": 71,
        "w": 74,
        "h": 96,
        "anchorX": 37,
        "anchorY": 88
      },
      {
        "x": 145,
        "w": 77,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88
      },
      {
        "x": 222,
        "w": 82,
        "h": 96,
        "anchorX": 41,
        "anchorY": 88
      },
      {
        "x": 304,
        "w": 77,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88
      },
      {
        "x": 381,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 433,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-ninja",
    "sheetId": "fightcore-cyber-ninja-atlas",
    "animationKey": "hit_react",
    "stripPath": "hit-react-strip.png",
    "frameHeight": 96,
    "frameCount": 3,
    "expectedFrameCount": 3,
    "fps": 12,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 74,
        "h": 96,
        "anchorX": 37,
        "anchorY": 88
      },
      {
        "x": 74,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88
      },
      {
        "x": 144,
        "w": 58,
        "h": 96,
        "anchorX": 29,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-ninja",
    "sheetId": "fightcore-cyber-ninja-atlas",
    "animationKey": "recovery",
    "stripPath": "recovery-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": 5,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 60,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88
      },
      {
        "x": 60,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 111,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      },
      {
        "x": 166,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 218,
        "w": 54,
        "h": 96,
        "anchorX": 27,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-ninja",
    "sheetId": "fightcore-cyber-ninja-atlas",
    "animationKey": "standup",
    "stripPath": "standup-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": 6,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 143,
        "h": 96,
        "anchorX": 72,
        "anchorY": 88
      },
      {
        "x": 143,
        "w": 84,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88
      },
      {
        "x": 227,
        "w": 86,
        "h": 96,
        "anchorX": 43,
        "anchorY": 88
      },
      {
        "x": 313,
        "w": 64,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      },
      {
        "x": 377,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 429,
        "w": 49,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-ninja",
    "sheetId": "fightcore-cyber-ninja-atlas",
    "animationKey": "side_kick",
    "stripPath": "side-kick-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": 6,
    "fps": 13,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 58,
        "h": 96,
        "anchorX": 29,
        "anchorY": 88
      },
      {
        "x": 58,
        "w": 64,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      },
      {
        "x": 122,
        "w": 110,
        "h": 96,
        "anchorX": 55,
        "anchorY": 88
      },
      {
        "x": 232,
        "w": 124,
        "h": 96,
        "anchorX": 62,
        "anchorY": 88
      },
      {
        "x": 356,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      },
      {
        "x": 411,
        "w": 57,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "monkey-grunt",
    "sheetId": "fightcore-monkey-grunt-atlas",
    "animationKey": "idle",
    "stripPath": "idle-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": 4,
    "fps": 8,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 81,
        "w": 75,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88
      },
      {
        "x": 156,
        "w": 79,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 235,
        "w": 77,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "monkey-grunt",
    "sheetId": "fightcore-monkey-grunt-atlas",
    "animationKey": "run",
    "stripPath": "run-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": 6,
    "fps": 12,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 94,
        "h": 96,
        "anchorX": 47,
        "anchorY": 88
      },
      {
        "x": 94,
        "w": 95,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88
      },
      {
        "x": 189,
        "w": 103,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88
      },
      {
        "x": 292,
        "w": 98,
        "h": 96,
        "anchorX": 49,
        "anchorY": 88
      },
      {
        "x": 390,
        "w": 89,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88
      },
      {
        "x": 479,
        "w": 85,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "monkey-grunt",
    "sheetId": "fightcore-monkey-grunt-atlas",
    "animationKey": "jab",
    "stripPath": "jab-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": 5,
    "fps": 14,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 82,
        "h": 96,
        "anchorX": 41,
        "anchorY": 88
      },
      {
        "x": 82,
        "w": 113,
        "h": 96,
        "anchorX": 56,
        "anchorY": 88
      },
      {
        "x": 195,
        "w": 197,
        "h": 96,
        "anchorX": 98,
        "anchorY": 88
      },
      {
        "x": 392,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 473,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "monkey-grunt",
    "sheetId": "fightcore-monkey-grunt-atlas",
    "animationKey": "cross",
    "stripPath": "cross-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": 5,
    "fps": 14,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 79,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 79,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 160,
        "w": 114,
        "h": 96,
        "anchorX": 57,
        "anchorY": 88
      },
      {
        "x": 274,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88
      },
      {
        "x": 344,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "monkey-grunt",
    "sheetId": "fightcore-monkey-grunt-atlas",
    "animationKey": "grab",
    "stripPath": "grab-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": 6,
    "fps": 12,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 92,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88
      },
      {
        "x": 92,
        "w": 111,
        "h": 96,
        "anchorX": 56,
        "anchorY": 88
      },
      {
        "x": 203,
        "w": 115,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88
      },
      {
        "x": 318,
        "w": 103,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88
      },
      {
        "x": 421,
        "w": 101,
        "h": 96,
        "anchorX": 50,
        "anchorY": 88
      },
      {
        "x": 522,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "monkey-grunt",
    "sheetId": "fightcore-monkey-grunt-atlas",
    "animationKey": "hit_react",
    "stripPath": "hit-react-strip.png",
    "frameHeight": 96,
    "frameCount": 3,
    "expectedFrameCount": 3,
    "fps": 12,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 81,
        "w": 92,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88
      },
      {
        "x": 173,
        "w": 72,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "monkey-grunt",
    "sheetId": "fightcore-monkey-grunt-atlas",
    "animationKey": "knockdown",
    "stripPath": "knockdown-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": 5,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 103,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88
      },
      {
        "x": 103,
        "w": 164,
        "h": 96,
        "anchorX": 82,
        "anchorY": 88
      },
      {
        "x": 267,
        "w": 138,
        "h": 96,
        "anchorX": 69,
        "anchorY": 88
      },
      {
        "x": 405,
        "w": 155,
        "h": 96,
        "anchorX": 78,
        "anchorY": 88
      },
      {
        "x": 560,
        "w": 155,
        "h": 96,
        "anchorX": 78,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "monkey-grunt",
    "sheetId": "fightcore-monkey-grunt-atlas",
    "animationKey": "death",
    "stripPath": "death-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": 7,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 150,
        "h": 96,
        "anchorX": 75,
        "anchorY": 88
      },
      {
        "x": 150,
        "w": 146,
        "h": 96,
        "anchorX": 73,
        "anchorY": 88
      },
      {
        "x": 296,
        "w": 156,
        "h": 96,
        "anchorX": 78,
        "anchorY": 88
      },
      {
        "x": 452,
        "w": 153,
        "h": 96,
        "anchorX": 76,
        "anchorY": 88
      },
      {
        "x": 605,
        "w": 161,
        "h": 96,
        "anchorX": 80,
        "anchorY": 88
      },
      {
        "x": 766,
        "w": 182,
        "h": 96,
        "anchorX": 91,
        "anchorY": 88
      },
      {
        "x": 948,
        "w": 182,
        "h": 96,
        "anchorX": 91,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "idle",
    "stripPath": "idle-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88
      },
      {
        "x": 45,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88
      },
      {
        "x": 90,
        "w": 47,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88
      },
      {
        "x": 137,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88
      },
      {
        "x": 182,
        "w": 43,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "walk",
    "stripPath": "walk-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 10,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 58,
        "h": 96,
        "anchorX": 29,
        "anchorY": 88
      },
      {
        "x": 58,
        "w": 58,
        "h": 96,
        "anchorX": 29,
        "anchorY": 88
      },
      {
        "x": 116,
        "w": 54,
        "h": 96,
        "anchorX": 27,
        "anchorY": 88
      },
      {
        "x": 170,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88
      },
      {
        "x": 232,
        "w": 59,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88
      },
      {
        "x": 291,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "dash",
    "stripPath": "dash-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 136,
        "h": 96,
        "anchorX": 68,
        "anchorY": 88
      },
      {
        "x": 136,
        "w": 136,
        "h": 96,
        "anchorX": 68,
        "anchorY": 88
      },
      {
        "x": 272,
        "w": 115,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88
      },
      {
        "x": 387,
        "w": 104,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88
      },
      {
        "x": 491,
        "w": 130,
        "h": 96,
        "anchorX": 65,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "roundhouse_kick",
    "stripPath": "roundhouse-kick-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 13,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 53,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 104,
        "w": 160,
        "h": 96,
        "anchorX": 80,
        "anchorY": 88
      },
      {
        "x": 264,
        "w": 109,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88
      },
      {
        "x": 373,
        "w": 59,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "teep_kick",
    "stripPath": "teep-kick-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 13,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 51,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88
      },
      {
        "x": 97,
        "w": 164,
        "h": 96,
        "anchorX": 82,
        "anchorY": 88
      },
      {
        "x": 261,
        "w": 57,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      },
      {
        "x": 318,
        "w": 54,
        "h": 96,
        "anchorX": 27,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "cross",
    "stripPath": "cross-strip.png",
    "frameHeight": 96,
    "frameCount": 3,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 58,
        "h": 96,
        "anchorX": 29,
        "anchorY": 88
      },
      {
        "x": 58,
        "w": 330,
        "h": 96,
        "anchorX": 165,
        "anchorY": 88
      },
      {
        "x": 388,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "jab",
    "stripPath": "jab-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 16,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      },
      {
        "x": 63,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      },
      {
        "x": 128,
        "w": 90,
        "h": 96,
        "anchorX": 45,
        "anchorY": 88
      },
      {
        "x": 218,
        "w": 99,
        "h": 96,
        "anchorX": 50,
        "anchorY": 88
      },
      {
        "x": 317,
        "w": 92,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "hit_react",
    "stripPath": "hit-react-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": null,
    "fps": 12,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 91,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88
      },
      {
        "x": 91,
        "w": 241,
        "h": 96,
        "anchorX": 120,
        "anchorY": 88
      },
      {
        "x": 332,
        "w": 141,
        "h": 96,
        "anchorX": 70,
        "anchorY": 88
      },
      {
        "x": 473,
        "w": 154,
        "h": 96,
        "anchorX": 77,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "recovery",
    "stripPath": "recovery-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 116,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88
      },
      {
        "x": 116,
        "w": 88,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88
      },
      {
        "x": 204,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      },
      {
        "x": 269,
        "w": 68,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88
      },
      {
        "x": 337,
        "w": 66,
        "h": 96,
        "anchorX": 33,
        "anchorY": 88
      },
      {
        "x": 403,
        "w": 60,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88
      },
      {
        "x": 463,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "idle",
    "stripPath": "idle-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 226,
        "h": 96,
        "anchorX": 113,
        "anchorY": 88
      },
      {
        "x": 226,
        "w": 50,
        "h": 96,
        "anchorX": 25,
        "anchorY": 88
      },
      {
        "x": 276,
        "w": 80,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 356,
        "w": 82,
        "h": 96,
        "anchorX": 41,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "run",
    "stripPath": "run-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 12,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 112,
        "h": 96,
        "anchorX": 56,
        "anchorY": 88
      },
      {
        "x": 112,
        "w": 108,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88
      },
      {
        "x": 220,
        "w": 107,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88
      },
      {
        "x": 327,
        "w": 101,
        "h": 96,
        "anchorX": 50,
        "anchorY": 88
      },
      {
        "x": 428,
        "w": 103,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "jab",
    "stripPath": "jab-strip.png",
    "frameHeight": 96,
    "frameCount": 3,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 80,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 80,
        "w": 107,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88
      },
      {
        "x": 187,
        "w": 164,
        "h": 96,
        "anchorX": 82,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "cross",
    "stripPath": "cross-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 80,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 80,
        "w": 106,
        "h": 96,
        "anchorX": 53,
        "anchorY": 88
      },
      {
        "x": 186,
        "w": 92,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88
      },
      {
        "x": 278,
        "w": 64,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "hook",
    "stripPath": "hook-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": null,
    "fps": 13,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 75,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88
      },
      {
        "x": 75,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      },
      {
        "x": 140,
        "w": 67,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88
      },
      {
        "x": 207,
        "w": 61,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "round_kick",
    "stripPath": "round-kick-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": null,
    "fps": 12,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 77,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88
      },
      {
        "x": 77,
        "w": 92,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88
      },
      {
        "x": 169,
        "w": 114,
        "h": 96,
        "anchorX": 57,
        "anchorY": 88
      },
      {
        "x": 283,
        "w": 80,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "hit_react",
    "stripPath": "hit-react-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": null,
    "fps": 12,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 88,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88
      },
      {
        "x": 88,
        "w": 90,
        "h": 96,
        "anchorX": 45,
        "anchorY": 88
      },
      {
        "x": 178,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 259,
        "w": 72,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "knockdown",
    "stripPath": "knockdown-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 123,
        "h": 96,
        "anchorX": 62,
        "anchorY": 88
      },
      {
        "x": 123,
        "w": 159,
        "h": 96,
        "anchorX": 80,
        "anchorY": 88
      },
      {
        "x": 282,
        "w": 190,
        "h": 96,
        "anchorX": 95,
        "anchorY": 88
      },
      {
        "x": 472,
        "w": 170,
        "h": 96,
        "anchorX": 85,
        "anchorY": 88
      },
      {
        "x": 642,
        "w": 196,
        "h": 96,
        "anchorX": 98,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "death",
    "stripPath": "death-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 193,
        "h": 96,
        "anchorX": 96,
        "anchorY": 88
      },
      {
        "x": 193,
        "w": 179,
        "h": 96,
        "anchorX": 90,
        "anchorY": 88
      },
      {
        "x": 372,
        "w": 181,
        "h": 96,
        "anchorX": 90,
        "anchorY": 88
      },
      {
        "x": 553,
        "w": 183,
        "h": 96,
        "anchorX": 92,
        "anchorY": 88
      },
      {
        "x": 736,
        "w": 205,
        "h": 96,
        "anchorX": 102,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "idle",
    "stripPath": "idle-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 82,
        "h": 96,
        "anchorX": 41,
        "anchorY": 88
      },
      {
        "x": 82,
        "w": 78,
        "h": 96,
        "anchorX": 39,
        "anchorY": 88
      },
      {
        "x": 160,
        "w": 79,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 239,
        "w": 75,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88
      },
      {
        "x": 314,
        "w": 72,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88
      },
      {
        "x": 386,
        "w": 74,
        "h": 96,
        "anchorX": 37,
        "anchorY": 88
      },
      {
        "x": 460,
        "w": 76,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "run",
    "stripPath": "run-strip.png",
    "frameHeight": 96,
    "frameCount": 2,
    "expectedFrameCount": null,
    "fps": 11,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 119,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88
      },
      {
        "x": 119,
        "w": 627,
        "h": 96,
        "anchorX": 314,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "charge",
    "stripPath": "charge-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 10,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 122,
        "h": 96,
        "anchorX": 61,
        "anchorY": 88
      },
      {
        "x": 122,
        "w": 123,
        "h": 96,
        "anchorX": 62,
        "anchorY": 88
      },
      {
        "x": 245,
        "w": 136,
        "h": 96,
        "anchorX": 68,
        "anchorY": 88
      },
      {
        "x": 381,
        "w": 155,
        "h": 96,
        "anchorX": 78,
        "anchorY": 88
      },
      {
        "x": 536,
        "w": 146,
        "h": 96,
        "anchorX": 73,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "dash",
    "stripPath": "dash-strip.png",
    "frameHeight": 96,
    "frameCount": 1,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 355,
        "h": 96,
        "anchorX": 178,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "ground_slam",
    "stripPath": "ground-slam-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": null,
    "fps": 10,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 95,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88
      },
      {
        "x": 95,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88
      },
      {
        "x": 165,
        "w": 83,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88
      },
      {
        "x": 248,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88
      },
      {
        "x": 317,
        "w": 73,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88
      },
      {
        "x": 390,
        "w": 84,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88
      },
      {
        "x": 474,
        "w": 143,
        "h": 96,
        "anchorX": 72,
        "anchorY": 88
      }
    ],
    "embeddedTarget": true,
    "hideTargetSprite": true,
    "targetSuppressionStartFrame": 0,
    "targetSuppressionEndFrame": 6
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "seoi_nage",
    "stripPath": "seoi-nage-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 10,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 143,
        "h": 96,
        "anchorX": 72,
        "anchorY": 88
      },
      {
        "x": 143,
        "w": 146,
        "h": 96,
        "anchorX": 73,
        "anchorY": 88
      },
      {
        "x": 289,
        "w": 128,
        "h": 96,
        "anchorX": 64,
        "anchorY": 88
      },
      {
        "x": 417,
        "w": 120,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88
      },
      {
        "x": 537,
        "w": 108,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88
      },
      {
        "x": 645,
        "w": 153,
        "h": 96,
        "anchorX": 76,
        "anchorY": 88
      }
    ],
    "embeddedTarget": true,
    "hideTargetSprite": true,
    "targetSuppressionStartFrame": 0,
    "targetSuppressionEndFrame": 5
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "armbar",
    "stripPath": "armbar-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88
      },
      {
        "x": 69,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      },
      {
        "x": 132,
        "w": 58,
        "h": 96,
        "anchorX": 29,
        "anchorY": 88
      },
      {
        "x": 190,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88
      },
      {
        "x": 260,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88
      },
      {
        "x": 341,
        "w": 177,
        "h": 96,
        "anchorX": 88,
        "anchorY": 88
      },
      {
        "x": 518,
        "w": 97,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88
      }
    ],
    "embeddedTarget": true,
    "hideTargetSprite": true,
    "targetSuppressionStartFrame": 0,
    "targetSuppressionEndFrame": 6
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "o_goshi",
    "stripPath": "o-goshi-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": null,
    "fps": 9,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88
      },
      {
        "x": 70,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88
      },
      {
        "x": 140,
        "w": 164,
        "h": 96,
        "anchorX": 82,
        "anchorY": 88
      },
      {
        "x": 304,
        "w": 78,
        "h": 96,
        "anchorX": 39,
        "anchorY": 88
      },
      {
        "x": 382,
        "w": 104,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88
      },
      {
        "x": 486,
        "w": 92,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88
      },
      {
        "x": 578,
        "w": 93,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88
      }
    ],
    "embeddedTarget": true,
    "hideTargetSprite": true,
    "targetSuppressionStartFrame": 0,
    "targetSuppressionEndFrame": 6
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "guillotine",
    "stripPath": "guillotine-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 248,
        "h": 96,
        "anchorX": 124,
        "anchorY": 88
      },
      {
        "x": 248,
        "w": 141,
        "h": 96,
        "anchorX": 70,
        "anchorY": 88
      },
      {
        "x": 389,
        "w": 139,
        "h": 96,
        "anchorX": 70,
        "anchorY": 88
      },
      {
        "x": 528,
        "w": 159,
        "h": 96,
        "anchorX": 80,
        "anchorY": 88
      },
      {
        "x": 687,
        "w": 146,
        "h": 96,
        "anchorX": 73,
        "anchorY": 88
      },
      {
        "x": 833,
        "w": 154,
        "h": 96,
        "anchorX": 77,
        "anchorY": 88
      }
    ],
    "embeddedTarget": true,
    "hideTargetSprite": true,
    "targetSuppressionStartFrame": 0,
    "targetSuppressionEndFrame": 5
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "death",
    "stripPath": "death-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 248,
        "h": 96,
        "anchorX": 124,
        "anchorY": 88
      },
      {
        "x": 248,
        "w": 141,
        "h": 96,
        "anchorX": 70,
        "anchorY": 88
      },
      {
        "x": 389,
        "w": 139,
        "h": 96,
        "anchorX": 70,
        "anchorY": 88
      },
      {
        "x": 528,
        "w": 159,
        "h": 96,
        "anchorX": 80,
        "anchorY": 88
      },
      {
        "x": 687,
        "w": 146,
        "h": 96,
        "anchorX": 73,
        "anchorY": 88
      },
      {
        "x": 833,
        "w": 154,
        "h": 96,
        "anchorX": 77,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "idle",
    "stripPath": "idle-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      },
      {
        "x": 56,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88
      },
      {
        "x": 102,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88
      },
      {
        "x": 147,
        "w": 47,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88
      },
      {
        "x": 194,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "walk",
    "stripPath": "walk-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": null,
    "fps": 10,
    "loop": true,
    "frames": [
      {
        "x": 0,
        "w": 54,
        "h": 96,
        "anchorX": 27,
        "anchorY": 88
      },
      {
        "x": 54,
        "w": 57,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      },
      {
        "x": 111,
        "w": 60,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88
      },
      {
        "x": 171,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88
      },
      {
        "x": 216,
        "w": 60,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88
      },
      {
        "x": 276,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 329,
        "w": 54,
        "h": 96,
        "anchorX": 27,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "dash",
    "stripPath": "dash-strip.png",
    "frameHeight": 96,
    "frameCount": 3,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 98,
        "h": 96,
        "anchorX": 49,
        "anchorY": 88
      },
      {
        "x": 98,
        "w": 90,
        "h": 96,
        "anchorX": 45,
        "anchorY": 88
      },
      {
        "x": 188,
        "w": 337,
        "h": 96,
        "anchorX": 168,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "hit_react",
    "stripPath": "hit-react-strip.png",
    "frameHeight": 96,
    "frameCount": 8,
    "expectedFrameCount": null,
    "fps": 12,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 72,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88
      },
      {
        "x": 72,
        "w": 61,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88
      },
      {
        "x": 133,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      },
      {
        "x": 196,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88
      },
      {
        "x": 249,
        "w": 66,
        "h": 96,
        "anchorX": 33,
        "anchorY": 88
      },
      {
        "x": 315,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      },
      {
        "x": 371,
        "w": 57,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      },
      {
        "x": 428,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "recovery",
    "stripPath": "recovery-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 126,
        "h": 96,
        "anchorX": 63,
        "anchorY": 88
      },
      {
        "x": 126,
        "w": 115,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88
      },
      {
        "x": 241,
        "w": 91,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88
      },
      {
        "x": 332,
        "w": 71,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88
      },
      {
        "x": 403,
        "w": 66,
        "h": 96,
        "anchorX": 33,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "standup",
    "stripPath": "standup-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 122,
        "h": 96,
        "anchorX": 61,
        "anchorY": 88
      },
      {
        "x": 122,
        "w": 119,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88
      },
      {
        "x": 241,
        "w": 115,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88
      },
      {
        "x": 356,
        "w": 103,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88
      },
      {
        "x": 459,
        "w": 64,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      },
      {
        "x": 523,
        "w": 64,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      }
    ]
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "double_leg_shot",
    "stripPath": "double-leg-shot-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": null,
    "fps": 10,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88
      },
      {
        "x": 65,
        "w": 76,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88
      },
      {
        "x": 141,
        "w": 115,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88
      },
      {
        "x": 256,
        "w": 154,
        "h": 96,
        "anchorX": 77,
        "anchorY": 88
      },
      {
        "x": 410,
        "w": 127,
        "h": 96,
        "anchorX": 64,
        "anchorY": 88
      },
      {
        "x": 537,
        "w": 117,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88
      },
      {
        "x": 654,
        "w": 156,
        "h": 96,
        "anchorX": 78,
        "anchorY": 88
      }
    ],
    "embeddedTarget": true,
    "hideTargetSprite": true,
    "targetSuppressionStartFrame": 0,
    "targetSuppressionEndFrame": 6
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "o_goshi",
    "stripPath": "o-goshi-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": null,
    "fps": 9,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 90,
        "h": 96,
        "anchorX": 45,
        "anchorY": 88
      },
      {
        "x": 90,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88
      },
      {
        "x": 159,
        "w": 61,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88
      },
      {
        "x": 220,
        "w": 299,
        "h": 96,
        "anchorX": 150,
        "anchorY": 88
      }
    ],
    "embeddedTarget": true,
    "hideTargetSprite": true,
    "targetSuppressionStartFrame": 0,
    "targetSuppressionEndFrame": 3
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "armbar",
    "stripPath": "armbar-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 186,
        "h": 96,
        "anchorX": 93,
        "anchorY": 88
      },
      {
        "x": 186,
        "w": 119,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88
      },
      {
        "x": 305,
        "w": 108,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88
      },
      {
        "x": 413,
        "w": 108,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88
      },
      {
        "x": 521,
        "w": 133,
        "h": 96,
        "anchorX": 66,
        "anchorY": 88
      }
    ],
    "embeddedTarget": true,
    "hideTargetSprite": true,
    "targetSuppressionStartFrame": 0,
    "targetSuppressionEndFrame": 4
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "duck_under_mat_return_slam",
    "stripPath": "duck-under-mat-return-slam-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "frames": [
      {
        "x": 0,
        "w": 115,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88
      },
      {
        "x": 115,
        "w": 109,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88
      },
      {
        "x": 224,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88
      },
      {
        "x": 286,
        "w": 173,
        "h": 96,
        "anchorX": 86,
        "anchorY": 88
      },
      {
        "x": 459,
        "w": 128,
        "h": 96,
        "anchorX": 64,
        "anchorY": 88
      }
    ],
    "embeddedTarget": true,
    "hideTargetSprite": true,
    "targetSuppressionStartFrame": 0,
    "targetSuppressionEndFrame": 4
  }
];
