# Voice and music production

The 12 approved narration scripts and JSON caption timings live in
`src/content/storyboards.json`. Video renders are silent by default so a missing
or unapproved audio file can never be added accidentally.

## Export the narration hand-off

```sh
pnpm voiceover:plan
pnpm voiceover:plan -- --campaign salon-real-client-trial
```

This writes `out/production/voiceover-plans.json`, containing the scripts,
caption timings and target filenames for a human narrator or a separately
approved voice-generation workflow.

## Add approved audio

1. Put narration at
   `../public/assets/video/audio/voiceover/<campaign-slug>.mp3`.
2. Put licensed music at `../public/assets/video/audio/music/<track>.mp3`.
3. Add those paths to the matching storyboard's `voiceoverAudio` and
   `musicAudio` fields.
4. Adjust `musicVolume` only after listening beneath the narration.
5. Render with `--audio mastered`. Without this flag, the output remains silent.

## Caption contract

Captions use Remotion's `Caption` JSON shape. They are always rendered, even
when audio is off, so social previews remain understandable without sound.

