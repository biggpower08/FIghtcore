export interface ActiveRuntimeSpriteQa {
  entityId: string;
  animationKey: string;
  verdict: 'ACTIVE_RUNTIME_READY' | 'NOT_GAMEPLAY_READY';
  readinessBadge: 'SAFE FOR GAMEPLAY' | 'QA ONLY' | 'NEEDS MANUAL REPAIR' | 'PASS WITH NOTES';
  activeRuntimeSources: string[];
  failedFrames: string[];
  acceptedIntentionalAlphaFrames?: string[];
  unusableFrames: string[];
  frameStatuses: Array<{
    frame: string;
    status: 'PASS' | 'NEEDS_MANUAL_REPAIR' | 'UNUSABLE_SOURCE_FRAME' | 'ACCEPTED_WITH_INTENTIONAL_ALPHA';
    reason: string;
  }>;
  qaFolder: string;
  activeRuntimeFramePaths: string[];
  manualOverridePaths: string[];
}

export const activeRuntimeSpriteQa: ActiveRuntimeSpriteQa[] = [
  {
    "entityId": "ronin",
    "animationKey": "roundhouse_kick",
    "verdict": "ACTIVE_RUNTIME_READY",
    "readinessBadge": "PASS WITH NOTES",
    "activeRuntimeSources": [
      "manual-overrides"
    ],
    "failedFrames": [],
    "acceptedIntentionalAlphaFrames": [
      "0003.png"
    ],
    "unusableFrames": [],
    "frameStatuses": [
      {
        "frame": "0001.png",
        "status": "PASS",
        "reason": "Active runtime frame passed automated alpha-hole, pale-cut, and edge-contact checks."
      },
      {
        "frame": "0002.png",
        "status": "PASS",
        "reason": "Active runtime frame passed automated alpha-hole, pale-cut, and edge-contact checks."
      },
      {
        "frame": "0003.png",
        "status": "ACCEPTED_WITH_INTENTIONAL_ALPHA",
        "reason": "Intentional transparent detail in the Ronin roundhouse manual override frame."
      },
      {
        "frame": "0004.png",
        "status": "PASS",
        "reason": "Active runtime frame passed automated alpha-hole, pale-cut, and edge-contact checks."
      },
      {
        "frame": "0005.png",
        "status": "PASS",
        "reason": "Active runtime frame passed automated alpha-hole, pale-cut, and edge-contact checks."
      },
      {
        "frame": "0006.png",
        "status": "PASS",
        "reason": "Active runtime frame passed automated alpha-hole, pale-cut, and edge-contact checks."
      }
    ],
    "qaFolder": "public/sprites/qa/ronin/roundhouse_kick",
    "activeRuntimeFramePaths": [
      "/sprites/manual-overrides/ronin/roundhouse_kick/0001.png",
      "/sprites/manual-overrides/ronin/roundhouse_kick/0002.png",
      "/sprites/manual-overrides/ronin/roundhouse_kick/0003.png",
      "/sprites/manual-overrides/ronin/roundhouse_kick/0004.png",
      "/sprites/manual-overrides/ronin/roundhouse_kick/0005.png",
      "/sprites/manual-overrides/ronin/roundhouse_kick/0006.png"
    ],
    "manualOverridePaths": [
      "public/sprites/manual-overrides/ronin/roundhouse_kick/0001.png",
      "public/sprites/manual-overrides/ronin/roundhouse_kick/0002.png",
      "public/sprites/manual-overrides/ronin/roundhouse_kick/0003.png",
      "public/sprites/manual-overrides/ronin/roundhouse_kick/0004.png",
      "public/sprites/manual-overrides/ronin/roundhouse_kick/0005.png",
      "public/sprites/manual-overrides/ronin/roundhouse_kick/0006.png"
    ]
  },
  {
    "entityId": "ronin",
    "animationKey": "side_kick",
    "verdict": "NOT_GAMEPLAY_READY",
    "readinessBadge": "QA ONLY",
    "activeRuntimeSources": [
      "manual-overrides"
    ],
    "failedFrames": [
      "0002.png",
      "0005.png",
      "0001.png",
      "0003.png",
      "0004.png"
    ],
    "acceptedIntentionalAlphaFrames": [],
    "unusableFrames": [
      "0001.png"
    ],
    "frameStatuses": [
      {
        "frame": "0001.png",
        "status": "UNUSABLE_SOURCE_FRAME",
        "reason": "Large pale/white torso cut is visible on the active runtime frame."
      },
      {
        "frame": "0002.png",
        "status": "NEEDS_MANUAL_REPAIR",
        "reason": "Wide stance has rough silhouette and torso-width drift; automated scan also finds pale cut pixels."
      },
      {
        "frame": "0003.png",
        "status": "NEEDS_MANUAL_REPAIR",
        "reason": "Chamber pose has awkward lower-leg/boot read and proportion drift."
      },
      {
        "frame": "0004.png",
        "status": "NEEDS_MANUAL_REPAIR",
        "reason": "Extension pose has rough leg silhouette and does not read as fully clean Ronin art."
      },
      {
        "frame": "0005.png",
        "status": "NEEDS_MANUAL_REPAIR",
        "reason": "Full extension has rough foot/leg silhouette and automated pale cut pixels."
      },
      {
        "frame": "0006.png",
        "status": "PASS",
        "reason": "Guard return reads consistently with Ronin idle."
      }
    ],
    "qaFolder": "public/sprites/qa/ronin/side_kick",
    "activeRuntimeFramePaths": [
      "/sprites/manual-overrides/ronin/side_kick/0001.png",
      "/sprites/manual-overrides/ronin/side_kick/0002.png",
      "/sprites/manual-overrides/ronin/side_kick/0003.png",
      "/sprites/manual-overrides/ronin/side_kick/0004.png",
      "/sprites/manual-overrides/ronin/side_kick/0005.png",
      "/sprites/manual-overrides/ronin/side_kick/0006.png"
    ],
    "manualOverridePaths": [
      "public/sprites/manual-overrides/ronin/side_kick/0001.png",
      "public/sprites/manual-overrides/ronin/side_kick/0002.png",
      "public/sprites/manual-overrides/ronin/side_kick/0003.png",
      "public/sprites/manual-overrides/ronin/side_kick/0004.png",
      "public/sprites/manual-overrides/ronin/side_kick/0005.png",
      "public/sprites/manual-overrides/ronin/side_kick/0006.png"
    ]
  }
];

export function getActiveRuntimeSpriteQa(entityId: string, animationKey: string): ActiveRuntimeSpriteQa | undefined {
  return activeRuntimeSpriteQa.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey);
}
