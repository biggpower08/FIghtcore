# Playable MVP Lock

## Current Goal

FIghtcore is being narrowed into one clean playable browser combat loop before adding more scope. The current goal is stable movement, three equipped combat buttons, clean Ronin/Supreme character select previews, reward replacement, and no broken sprites in normal gameplay.

## What Is Allowed In The MVP

- WASD movement, Space dash, Esc pause.
- Three combat buttons only: H, J, and K.
- Two selectable player characters: Ronin and Supreme Emperor.
- Two normal enemies: Cyber Monkey and Cyber Striker.
- Current desert arena.
- Sprite Lab, QA contact sheets, and sprite health checks.
- Reward choices that upgrade or replace one of H/J/K.

## What Is Not Allowed Yet

- New characters.
- New enemy families.
- New stages.
- Backend services.
- AI coach features.
- Extra move-slot keys.
- New generated art.
- Persistent progression.

## Character Move Rules

Each playable character has exactly three equipped moves. Those moves are mapped to H, J, and K by `src/data/characterLoadouts.ts`.

Moves are character-specific. H/J/K should be displayed as equipped move slots, not universal labels like light/heavy/style/grapple.

## Reward Replacement Rules

Rewards do not create extra move slots. A reward must either upgrade an existing slot or replace one of the three equipped slots.

When a new move is chosen, the UI must ask which current move to replace:

- H: current move
- J: current move
- K: current move

## Animation Eligibility Rules

A move can appear in a starting loadout, reward option, or gameplay-ready Sprite Lab move list only when:

- the move exists in move data,
- the move has an animation key,
- the selected character has that animation,
- the animation has live frame or atlas metadata,
- and the animation is not blocked by sprite health rules.

Broken or missing animations can stay in development data, but they should not be offered to players.

## Current Temporary Art Exceptions

Some fast or effect-heavy frames still need manual art cleanup. Known hollow frames are blocked from normal gameplay and preserved in the broken-frame backup folder.

## Next Customization Phase

After the MVP feels good to play, the next customization phase should focus on hand-polishing the best three moves per character, adding impact effects, and improving animation timing.
