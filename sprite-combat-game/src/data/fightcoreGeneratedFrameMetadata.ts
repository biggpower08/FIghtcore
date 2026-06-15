export interface FightcoreGeneratedFrame {
  x: number;
  w: number;
  h: number;
  anchorX: number;
  anchorY: number;
  componentCount?: number;
  allowMultiSubjectFrame?: boolean;
  suspiciousMultiPose?: boolean;
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
  allowMultiSubjectFrame?: boolean;
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 48,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 48,
        "w": 47,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 95,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 141,
        "w": 48,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 51,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 107,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 160,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 205,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 250,
        "w": 48,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 87,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 87,
        "w": 84,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 171,
        "w": 88,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 259,
        "w": 100,
        "h": 96,
        "anchorX": 50,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 359,
        "w": 74,
        "h": 96,
        "anchorX": 37,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 53,
        "w": 60,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 113,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 178,
        "w": 72,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 250,
        "w": 54,
        "h": 96,
        "anchorX": 27,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 55,
        "w": 102,
        "h": 96,
        "anchorX": 51,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 157,
        "w": 95,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 252,
        "w": 86,
        "h": 96,
        "anchorX": 43,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 338,
        "w": 163,
        "h": 96,
        "anchorX": 82,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 501,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 71,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 71,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 134,
        "w": 61,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 195,
        "w": 86,
        "h": 96,
        "anchorX": 43,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 281,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 343,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 395,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 69,
        "w": 66,
        "h": 96,
        "anchorX": 33,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 135,
        "w": 58,
        "h": 96,
        "anchorX": 29,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 60,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 60,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 111,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 166,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 218,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 143,
        "h": 96,
        "anchorX": 72,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 143,
        "w": 84,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 227,
        "w": 86,
        "h": 96,
        "anchorX": 43,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 313,
        "w": 64,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 377,
        "w": 50,
        "h": 96,
        "anchorX": 25,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 427,
        "w": 48,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 57,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 57,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 119,
        "w": 84,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 203,
        "w": 107,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 310,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 365,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 81,
        "w": 67,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 148,
        "w": 71,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 219,
        "w": 68,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 94,
        "h": 96,
        "anchorX": 47,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 94,
        "w": 95,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 189,
        "w": 89,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 278,
        "w": 98,
        "h": 96,
        "anchorX": 49,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 376,
        "w": 87,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 463,
        "w": 85,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 69,
        "w": 106,
        "h": 96,
        "anchorX": 53,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 175,
        "w": 119,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 294,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 364,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 68,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 68,
        "w": 75,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 143,
        "w": 110,
        "h": 96,
        "anchorX": 55,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 253,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 322,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 90,
        "h": 96,
        "anchorX": 45,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 90,
        "w": 107,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 197,
        "w": 112,
        "h": 96,
        "anchorX": 56,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 309,
        "w": 101,
        "h": 96,
        "anchorX": 50,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 410,
        "w": 97,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 507,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 76,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 76,
        "w": 86,
        "h": 96,
        "anchorX": 43,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 162,
        "w": 72,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 99,
        "h": 96,
        "anchorX": 50,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 99,
        "w": 164,
        "h": 96,
        "anchorX": 82,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 263,
        "w": 138,
        "h": 96,
        "anchorX": 69,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 401,
        "w": 153,
        "h": 96,
        "anchorX": 76,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 554,
        "w": 153,
        "h": 96,
        "anchorX": 76,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 150,
        "h": 96,
        "anchorX": 75,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 150,
        "w": 146,
        "h": 96,
        "anchorX": 73,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 296,
        "w": 159,
        "h": 96,
        "anchorX": 80,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 455,
        "w": 153,
        "h": 96,
        "anchorX": 76,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 608,
        "w": 161,
        "h": 96,
        "anchorX": 80,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 769,
        "w": 182,
        "h": 96,
        "anchorX": 91,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
      },
      {
        "x": 951,
        "w": 182,
        "h": 96,
        "anchorX": 91,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 44,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 44,
        "w": 44,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 88,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 133,
        "w": 41,
        "h": 96,
        "anchorX": 20,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 174,
        "w": 42,
        "h": 96,
        "anchorX": 21,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 52,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 103,
        "w": 50,
        "h": 96,
        "anchorX": 25,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 153,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 209,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 262,
        "w": 58,
        "h": 96,
        "anchorX": 29,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 113,
        "h": 96,
        "anchorX": 56,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 113,
        "w": 122,
        "h": 96,
        "anchorX": 61,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 235,
        "w": 103,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 338,
        "w": 101,
        "h": 96,
        "anchorX": 50,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 439,
        "w": 120,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88,
        "componentCount": 2,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "roundhouse_kick",
    "stripPath": "roundhouse-kick-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": null,
    "fps": 13,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 52,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 103,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 165,
        "w": 91,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 256,
        "w": 71,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 327,
        "w": 30,
        "h": 96,
        "anchorX": 15,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 357,
        "w": 54,
        "h": 96,
        "anchorX": 27,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "teep_kick",
    "stripPath": "teep-kick-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 13,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 51,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 97,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 159,
        "w": 68,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 227,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 280,
        "w": 50,
        "h": 96,
        "anchorX": 25,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "cross",
    "stripPath": "cross-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 55,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 118,
        "w": 67,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 185,
        "w": 68,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 253,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 318,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 61,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 61,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 124,
        "w": 72,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 196,
        "w": 73,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 269,
        "w": 79,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "shadow-striker",
    "sheetId": "fightcore-shadow-striker-atlas",
    "animationKey": "hit_react",
    "stripPath": "hit-react-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 12,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 87,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 87,
        "w": 102,
        "h": 96,
        "anchorX": 51,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 189,
        "w": 129,
        "h": 96,
        "anchorX": 64,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 318,
        "w": 129,
        "h": 96,
        "anchorX": 64,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 447,
        "w": 121,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 106,
        "h": 96,
        "anchorX": 53,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 106,
        "w": 79,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 185,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 250,
        "w": 68,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 318,
        "w": 66,
        "h": 96,
        "anchorX": 33,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 384,
        "w": 60,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 444,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "idle",
    "stripPath": "idle-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": true,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 77,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 77,
        "w": 71,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 148,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 204,
        "w": 50,
        "h": 96,
        "anchorX": 25,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 254,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 316,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 96,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 96,
        "w": 104,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 200,
        "w": 98,
        "h": 96,
        "anchorX": 49,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 298,
        "w": 98,
        "h": 96,
        "anchorX": 49,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 396,
        "w": 96,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "striker-monkey",
    "sheetId": "fightcore-striker-monkey-atlas",
    "animationKey": "jab",
    "stripPath": "jab-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 80,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 80,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 145,
        "w": 64,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 209,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 77,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 77,
        "w": 66,
        "h": 96,
        "anchorX": 33,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 143,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 208,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 75,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 75,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 138,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 203,
        "w": 59,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 77,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 77,
        "w": 85,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 162,
        "w": 76,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 238,
        "w": 80,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 82,
        "h": 96,
        "anchorX": 41,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 82,
        "w": 85,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 167,
        "w": 78,
        "h": 96,
        "anchorX": 39,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 245,
        "w": 72,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 123,
        "h": 96,
        "anchorX": 62,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 123,
        "w": 197,
        "h": 96,
        "anchorX": 98,
        "anchorY": 88,
        "componentCount": 2,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
      },
      {
        "x": 320,
        "w": 159,
        "h": 96,
        "anchorX": 80,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 479,
        "w": 204,
        "h": 96,
        "anchorX": 102,
        "anchorY": 88,
        "componentCount": 2,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
      },
      {
        "x": 683,
        "w": 154,
        "h": 96,
        "anchorX": 77,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 193,
        "h": 96,
        "anchorX": 96,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
      },
      {
        "x": 193,
        "w": 177,
        "h": 96,
        "anchorX": 88,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
      },
      {
        "x": 370,
        "w": 181,
        "h": 96,
        "anchorX": 90,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
      },
      {
        "x": 551,
        "w": 181,
        "h": 96,
        "anchorX": 90,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
      },
      {
        "x": 732,
        "w": 199,
        "h": 96,
        "anchorX": 100,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 82,
        "h": 96,
        "anchorX": 41,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 82,
        "w": 78,
        "h": 96,
        "anchorX": 39,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 160,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 230,
        "w": 75,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 305,
        "w": 72,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 377,
        "w": 74,
        "h": 96,
        "anchorX": 37,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 451,
        "w": 76,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "run",
    "stripPath": "run-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": null,
    "fps": 11,
    "loop": true,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 116,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 116,
        "w": 109,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 225,
        "w": 109,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 334,
        "w": 413,
        "h": 96,
        "anchorX": 206,
        "anchorY": 88,
        "componentCount": 4,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 122,
        "h": 96,
        "anchorX": 61,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 122,
        "w": 121,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 243,
        "w": 119,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 362,
        "w": 151,
        "h": 96,
        "anchorX": 76,
        "anchorY": 88,
        "componentCount": 2,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 513,
        "w": 129,
        "h": 96,
        "anchorX": 64,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "cyber-monkey-grappler",
    "sheetId": "fightcore-cyber-monkey-grappler-atlas",
    "animationKey": "dash",
    "stripPath": "dash-strip.png",
    "frameHeight": 96,
    "frameCount": 2,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 163,
        "h": 96,
        "anchorX": 82,
        "anchorY": 88,
        "componentCount": 5,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 163,
        "w": 191,
        "h": 96,
        "anchorX": 96,
        "anchorY": 88,
        "componentCount": 5,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
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
    "embeddedTarget": true,
    "allowMultiSubjectFrame": true,
    "frames": [
      {
        "x": 0,
        "w": 95,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 95,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 165,
        "w": 83,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 248,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 317,
        "w": 73,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 390,
        "w": 84,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88,
        "componentCount": 2,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 474,
        "w": 143,
        "h": 96,
        "anchorX": 72,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      }
    ],
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
    "embeddedTarget": true,
    "allowMultiSubjectFrame": true,
    "frames": [
      {
        "x": 0,
        "w": 143,
        "h": 96,
        "anchorX": 72,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 143,
        "w": 146,
        "h": 96,
        "anchorX": 73,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 289,
        "w": 128,
        "h": 96,
        "anchorX": 64,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 417,
        "w": 120,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 537,
        "w": 108,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 645,
        "w": 153,
        "h": 96,
        "anchorX": 76,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      }
    ],
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
    "embeddedTarget": true,
    "allowMultiSubjectFrame": true,
    "frames": [
      {
        "x": 0,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 69,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 132,
        "w": 58,
        "h": 96,
        "anchorX": 29,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 190,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 260,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 341,
        "w": 177,
        "h": 96,
        "anchorX": 88,
        "anchorY": 88,
        "componentCount": 4,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 518,
        "w": 97,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      }
    ],
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
    "embeddedTarget": true,
    "allowMultiSubjectFrame": true,
    "frames": [
      {
        "x": 0,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 70,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 140,
        "w": 164,
        "h": 96,
        "anchorX": 82,
        "anchorY": 88,
        "componentCount": 2,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 304,
        "w": 78,
        "h": 96,
        "anchorX": 39,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 382,
        "w": 104,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 486,
        "w": 92,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 578,
        "w": 93,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      }
    ],
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
    "embeddedTarget": true,
    "allowMultiSubjectFrame": true,
    "frames": [
      {
        "x": 0,
        "w": 248,
        "h": 96,
        "anchorX": 124,
        "anchorY": 88,
        "componentCount": 2,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 248,
        "w": 141,
        "h": 96,
        "anchorX": 70,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 389,
        "w": 139,
        "h": 96,
        "anchorX": 70,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 528,
        "w": 159,
        "h": 96,
        "anchorX": 80,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 687,
        "w": 146,
        "h": 96,
        "anchorX": 73,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 833,
        "w": 154,
        "h": 96,
        "anchorX": 77,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      }
    ],
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
    "frameCount": 7,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 123,
        "h": 96,
        "anchorX": 62,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 123,
        "w": 118,
        "h": 96,
        "anchorX": 59,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 241,
        "w": 137,
        "h": 96,
        "anchorX": 68,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 378,
        "w": 133,
        "h": 96,
        "anchorX": 66,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 511,
        "w": 149,
        "h": 96,
        "anchorX": 74,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 660,
        "w": 134,
        "h": 96,
        "anchorX": 67,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 794,
        "w": 145,
        "h": 96,
        "anchorX": 72,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 56,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 102,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 147,
        "w": 47,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 194,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 54,
        "h": 96,
        "anchorX": 27,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 54,
        "w": 57,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 111,
        "w": 60,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 171,
        "w": 45,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 216,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 271,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 324,
        "w": 54,
        "h": 96,
        "anchorX": 27,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "puppetmaster",
    "sheetId": "fightcore-puppetmaster-atlas",
    "animationKey": "dash",
    "stripPath": "dash-strip.png",
    "frameHeight": 96,
    "frameCount": 4,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 98,
        "h": 96,
        "anchorX": 49,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 98,
        "w": 90,
        "h": 96,
        "anchorX": 45,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 188,
        "w": 117,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 305,
        "w": 216,
        "h": 96,
        "anchorX": 108,
        "anchorY": 88,
        "componentCount": 2,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 70,
        "w": 57,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 127,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 189,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 242,
        "w": 66,
        "h": 96,
        "anchorX": 33,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 308,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 364,
        "w": 57,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 421,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 121,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 121,
        "w": 115,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 236,
        "w": 91,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 327,
        "w": 71,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 398,
        "w": 66,
        "h": 96,
        "anchorX": 33,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 122,
        "h": 96,
        "anchorX": 61,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 122,
        "w": 119,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 241,
        "w": 115,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 356,
        "w": 103,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 459,
        "w": 64,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 523,
        "w": 64,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
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
    "embeddedTarget": true,
    "allowMultiSubjectFrame": true,
    "frames": [
      {
        "x": 0,
        "w": 65,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 65,
        "w": 76,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 141,
        "w": 115,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 256,
        "w": 154,
        "h": 96,
        "anchorX": 77,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 410,
        "w": 127,
        "h": 96,
        "anchorX": 64,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 537,
        "w": 117,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 654,
        "w": 156,
        "h": 96,
        "anchorX": 78,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      }
    ],
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
    "embeddedTarget": true,
    "allowMultiSubjectFrame": true,
    "frames": [
      {
        "x": 0,
        "w": 90,
        "h": 96,
        "anchorX": 45,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 90,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 159,
        "w": 61,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 220,
        "w": 299,
        "h": 96,
        "anchorX": 150,
        "anchorY": 88,
        "componentCount": 3,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      }
    ],
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
    "embeddedTarget": true,
    "allowMultiSubjectFrame": true,
    "frames": [
      {
        "x": 0,
        "w": 186,
        "h": 96,
        "anchorX": 93,
        "anchorY": 88,
        "componentCount": 2,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 186,
        "w": 119,
        "h": 96,
        "anchorX": 60,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 305,
        "w": 108,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 413,
        "w": 108,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 521,
        "w": 133,
        "h": 96,
        "anchorX": 66,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      }
    ],
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
    "embeddedTarget": true,
    "allowMultiSubjectFrame": true,
    "frames": [
      {
        "x": 0,
        "w": 115,
        "h": 96,
        "anchorX": 58,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 115,
        "w": 109,
        "h": 96,
        "anchorX": 54,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 224,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 286,
        "w": 173,
        "h": 96,
        "anchorX": 86,
        "anchorY": 88,
        "componentCount": 2,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      },
      {
        "x": 459,
        "w": 128,
        "h": 96,
        "anchorX": 64,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": true,
        "suspiciousMultiPose": false
      }
    ],
    "hideTargetSprite": true,
    "targetSuppressionStartFrame": 0,
    "targetSuppressionEndFrame": 4
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "idle",
    "stripPath": "idle-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": true,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 47,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 47,
        "w": 48,
        "h": 96,
        "anchorX": 24,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 95,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 141,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 187,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "walk",
    "stripPath": "walk-strip.png",
    "frameHeight": 96,
    "frameCount": 8,
    "expectedFrameCount": null,
    "fps": 10,
    "loop": true,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 50,
        "h": 96,
        "anchorX": 25,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 50,
        "w": 51,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 101,
        "w": 53,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 154,
        "w": 38,
        "h": 96,
        "anchorX": 19,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 192,
        "w": 31,
        "h": 96,
        "anchorX": 16,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 223,
        "w": 46,
        "h": 96,
        "anchorX": 23,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 269,
        "w": 43,
        "h": 96,
        "anchorX": 22,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 312,
        "w": 52,
        "h": 96,
        "anchorX": 26,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "dash",
    "stripPath": "dash-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 144,
        "h": 96,
        "anchorX": 72,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 144,
        "w": 126,
        "h": 96,
        "anchorX": 63,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 270,
        "w": 113,
        "h": 96,
        "anchorX": 56,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 383,
        "w": 102,
        "h": 96,
        "anchorX": 51,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 485,
        "w": 95,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 580,
        "w": 125,
        "h": 96,
        "anchorX": 62,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "palm_strike",
    "stripPath": "palm-strike-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 14,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 55,
        "w": 62,
        "h": 96,
        "anchorX": 31,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 117,
        "w": 71,
        "h": 96,
        "anchorX": 36,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 188,
        "w": 91,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 279,
        "w": 69,
        "h": 96,
        "anchorX": 34,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 348,
        "w": 34,
        "h": 96,
        "anchorX": 17,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "high_kick",
    "stripPath": "high-kick-strip.png",
    "frameHeight": 96,
    "frameCount": 7,
    "expectedFrameCount": null,
    "fps": 13,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 59,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 59,
        "w": 60,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 119,
        "w": 70,
        "h": 96,
        "anchorX": 35,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 189,
        "w": 77,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 266,
        "w": 77,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 343,
        "w": 41,
        "h": 96,
        "anchorX": 20,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 384,
        "w": 64,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "spinning_sweep",
    "stripPath": "spinning-sweep-strip.png",
    "frameHeight": 96,
    "frameCount": 3,
    "expectedFrameCount": null,
    "fps": 12,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 158,
        "h": 96,
        "anchorX": 79,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 158,
        "w": 304,
        "h": 96,
        "anchorX": 152,
        "anchorY": 88,
        "componentCount": 3,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": true
      },
      {
        "x": 462,
        "w": 150,
        "h": 96,
        "anchorX": 75,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "standing_shoulder_lock",
    "stripPath": "standing-shoulder-lock-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 10,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 58,
        "h": 96,
        "anchorX": 29,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 58,
        "w": 56,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 114,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 195,
        "w": 87,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 282,
        "w": 63,
        "h": 96,
        "anchorX": 32,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 345,
        "w": 60,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "hit_react",
    "stripPath": "hit-react-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 12,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 145,
        "h": 96,
        "anchorX": 72,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 145,
        "w": 87,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 232,
        "w": 87,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 319,
        "w": 89,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 408,
        "w": 95,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 503,
        "w": 75,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "recovery",
    "stripPath": "recovery-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 145,
        "h": 96,
        "anchorX": 72,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 145,
        "w": 87,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 232,
        "w": 87,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 319,
        "w": 89,
        "h": 96,
        "anchorX": 44,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 408,
        "w": 95,
        "h": 96,
        "anchorX": 48,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 503,
        "w": 75,
        "h": 96,
        "anchorX": 38,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "meditation",
    "stripPath": "meditation-strip.png",
    "frameHeight": 96,
    "frameCount": 6,
    "expectedFrameCount": null,
    "fps": 6,
    "loop": true,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 98,
        "h": 96,
        "anchorX": 49,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 98,
        "w": 105,
        "h": 96,
        "anchorX": 52,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 203,
        "w": 93,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 296,
        "w": 93,
        "h": 96,
        "anchorX": 46,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 389,
        "w": 83,
        "h": 96,
        "anchorX": 42,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 472,
        "w": 81,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  },
  {
    "entityId": "combat-monk",
    "sheetId": "fightcore-combat-monk-atlas",
    "animationKey": "standup",
    "stripPath": "standup-strip.png",
    "frameHeight": 96,
    "frameCount": 5,
    "expectedFrameCount": null,
    "fps": 8,
    "loop": false,
    "embeddedTarget": false,
    "allowMultiSubjectFrame": false,
    "frames": [
      {
        "x": 0,
        "w": 141,
        "h": 96,
        "anchorX": 70,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 141,
        "w": 94,
        "h": 96,
        "anchorX": 47,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 235,
        "w": 79,
        "h": 96,
        "anchorX": 40,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 314,
        "w": 61,
        "h": 96,
        "anchorX": 30,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      },
      {
        "x": 375,
        "w": 55,
        "h": 96,
        "anchorX": 28,
        "anchorY": 88,
        "componentCount": 1,
        "allowMultiSubjectFrame": false,
        "suspiciousMultiPose": false
      }
    ]
  }
];
