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
  }
];
