# Jimmy Coco Pro video studio

An isolated Remotion package for producing the Jimmy Coco Pro salon and mobile
outreach campaign. Website and video assets are shared from `../public`; the
React Router/Vercel website build does not depend on this package.

## Install

From `pro-site`:

```sh
pnpm video:install
```

## Browse campaigns

```sh
pnpm video:list
```

## Open Remotion Studio

```sh
pnpm video:studio
```

Select `Jimmy-Coco-Pro-Offer` and change `campaignSlug`, `platform` or
`audioMode` in the props panel. `audioMode` defaults to `off`.

## Render

```sh
pnpm video:render -- --campaign salon-bottle-maths --platform instagram-reels
```

Omit `--platform` to render all three vertical platform variants. Preview the
whole catalogue without rendering with:

```sh
pnpm video:render -- --all --dry-run
```

Final outputs are written to `video/out/<platform>/<campaign>.mp4`.

Mastered audio is deliberately opt-in:

```sh
pnpm video:render -- \
  --campaign salon-bottle-maths \
  --platform instagram-reels \
  --audio mastered
```

The command refuses to start unless the selected storyboard has both approved
voiceover and music files configured.

## Storyboards, narration and captions

`src/content/storyboards.json` contains the timed production brief for every
campaign: individual visual treatment, scene copy, metric, narration script and
Remotion `Caption` cues. The active composition is a five-part 25-second story:

1. Pattern-breaking hook
2. Salon or mobile problem
3. Three proof points
4. Commercial bridge
5. Destination-specific call to action

Export all narration plans without generating or sending audio:

```sh
pnpm video:voiceover-plan
```

See `VOICE_PRODUCTION.md` for the approved-audio workflow.

## Instagram and LinkedIn carousels

The same 12 campaign themes also have platform-native carousel packages. These
are not frame grabs from the videos:

- Instagram uses seven 1080×1350 PNG slides with a fast hook, reframe, proof,
  commercial number, decision, low-friction route and CTA.
- LinkedIn uses eight 1080×1350 pages with an additional commercial-problem
  page and is combined into a PDF document post.
- Each campaign has its own caption or post text, hashtags, engagement prompt,
  story-reshare line, document title, first comment and tracked destination.

Open Remotion Studio and select `Jimmy-Coco-Carousel-Slide` to inspect any
campaign, platform and slide without rendering the whole deck.

Preview the export plan without rendering:

```sh
pnpm carousels:render -- --all --dry-run
```

Render one Instagram deck:

```sh
pnpm carousels:render -- \
  --campaign salon-bottle-maths \
  --platform instagram
```

Render the matching LinkedIn document:

```sh
pnpm carousels:render -- \
  --campaign salon-bottle-maths \
  --platform linkedin
```

The LinkedIn export requires ImageMagick (`brew install imagemagick`) to combine
the rendered PNG pages into a PDF. Outputs are written to
`video/out/carousels/<platform>/<campaign>/`.

Generate the paste-ready posting guide after editing carousel copy:

```sh
pnpm carousels:guide
```

The resulting guide is `social/CAROUSEL-POSTING-GUIDE.md`. Source copy lives in
`src/content/carousel-posts.json`; the reusable slide system lives in
`src/ProCarouselSlide.tsx`.

## Content ownership

`src/content/campaigns.json` is the campaign catalogue and
`src/content/storyboards.json` is the timed production source. Financial
examples are illustrative and must keep their stated assumptions and
disclosures. Only licensed celebrity imagery, endorsements, music, narration
and salon content may be added to `public/assets/video`.
