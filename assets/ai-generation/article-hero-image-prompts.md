# Article hero images — generation prompts

For `jimmycoco.pro/articles`. Written to the guardrails in `assets/ai-generation/_shared/creative-rules.md`.

These are **B2B** images. The audience is a salon owner reading about her own margins — not a
consumer buying tan. That is the single biggest steer: these should look like the inside of a
working professional business, photographed well. Not glossy product marketing, and not stock
photography of women laughing at laptops.

**All three are people-free.** That is deliberate, not lazy. No people means no tan lines, no
hands with the wrong number of fingers, no faces that age badly, no wardrobe compliance to
police — and a still life reads as more considered and more premium than another stock model.
It also lets the three sit together as a set.

---

## House style block

Prepend or append this to every article image so the journal builds one visual identity.
Reuse it verbatim for future articles.

```
Editorial still-life photography, warm and quietly premium. Natural directional daylight
from a window at low angle, soft falloff, gentle shadows with warm bounce — no hard flash,
no studio strobe look. Palette restricted to brand neutrals: ivory, linen, warm off-white,
mineral stone, pale sand, champagne, muted bronze, with charcoal for the darkest values —
never pure black, never cool grey, never blue-toned. Shot on a full-frame camera with a
50mm or 85mm prime at f/2.8, shallow but controlled depth of field. Realistic surface
texture — grain of towelling, matte plastic, brushed metal, real dust. Colour-graded warm
and slightly desaturated, film-like, no HDR, no digital over-sharpening, no heavy vignette.
Composed with generous negative space. Nothing staged-looking or symmetrical.
```

**Universal negative** — attach to all three:

```
no text, no lettering, no numerals, no logos, no labels, no branding, no watermarks,
no signage, no on-screen or camera UI, no timestamps, no captions, no charts, no graphs,
no infographic elements, no coins, no banknotes, no calculator, no money imagery,
no people, no hands, no faces, no mannequins, no tan lines, no plastic sheen,
no HDR, no lens flare, no bokeh balls, no cool blue tones, no pure black, no neon,
no clutter, no stock-photo styling, no fake product labels
```

The two most likely failure modes are the model inventing label text on the bottle and
reaching for money/chart clichés because the articles are about cost. Both are covered above;
check every render for them before use.

---

## 1 · What a spray tan actually costs you to deliver

**What the image has to say.** The article's real argument is that the cost isn't in the
bottle — it's the room and the chair time. So the image is the *room*, empty, between
clients. An empty professional room is money going out whether anyone is in it or not, which
is exactly the point of the piece. It also avoids the obvious and much worse choice of
photographing a calculator.

```
A small professional spray tanning room in a UK salon, empty between clients, late
afternoon. A pop-up spray tanning tent stands open and unoccupied on the left, its fabric
soft ivory, one panel catching low window light. Beside it a compact stainless treatment
trolley holds a spray tan gun resting in its cradle with the hose coiled loosely, an
unbranded amber-tinted one-litre solution bottle standing behind it with its label turned
fully away from camera, and a neat stack of folded cream towels. A pair of disposable
slippers sits on the pale wood floor. Warm low sun rakes across the floor through a
window just out of frame, throwing a long soft shadow. Walls in warm off-white, one
mineral-stone accent. The room is clean and cared for but genuinely used — a slight
scuff on the skirting, a towel not perfectly square.

Editorial still-life photography, warm and quietly premium. [HOUSE STYLE BLOCK]

Wide-ish interior view, 35mm, eye level, camera slightly back so the room reads as small.
Deep warm shadow in the right third, negative space for a headline.
```

**Notes.** The bottle label *must* be turned away — if any of it faces camera the model will
invent branding. If a render still shows a partial label, reroll rather than retouching. The
emptiness is load-bearing: if a generation puts a person in it, discard it, it argues the
opposite of the article.

---

## 2 · How many spray tans do you get from a litre?

**What the image has to say.** The article's one instruction is *mark the bottle, count the
tans, divide*. So show that — a working litre with a hand-drawn tally running down a strip
of tape, roughly two-thirds used, lit so the fill level reads instantly. It's the article's
method as a photograph, and it's a genuinely arresting image because nobody photographs a
bottle that way.

```
A single unbranded one-litre professional spray tan solution bottle standing on a pale
travertine counter, photographed in profile so its printed label faces entirely away from
camera. The bottle is amber-bronze tinted and roughly one third full, the liquid line
sitting low and clearly readable, backlit by a window so the solution glows warm amber
where the light passes through it. Down the visible side of the bottle runs a narrow strip
of matte masking tape bearing a hand-drawn tally in blue ballpoint — simple vertical pen
strokes in groups of five, each fifth stroke crossed diagonally through the previous four,
about twenty-five strokes in total, slightly uneven and clearly drawn by hand at different
moments. No numbers, no words, no writing of any kind — only the tally strokes. In the soft
background, thrown well out of focus, the pale suggestion of a treatment room.

Editorial still-life photography, warm and quietly premium. [HOUSE STYLE BLOCK]

85mm at f/2.8, slightly below the liquid line so the bottle has presence. Bottle placed
left of centre, wide clean negative space to the right. Backlight is the key light.
```

**Notes.** The tally is the risky element — models drift into writing digits or letters. Say
"no numbers, no words" twice if your generator ignores it once, and reject any render with a
character in it. If the tally keeps failing, fall back to a clean bottle with the fill line
low and skip the tape entirely; the fill level alone carries the idea.

---

## 3 · The journal index page

**What the image has to say.** This one sits above "Advice for better tans and stronger
salons", so it has to cover the whole publication, not one article. The subject is the part
of the job nobody photographs: the half-hour after the last client, when the business
actually gets thought about. Warm, calm, earned — the aspirational note is *competence*, not
luxury.

```
The back counter of a small UK beauty salon at the end of the working day, just after
closing. A closed hardback appointment diary lies flat with a pen resting in the gutter,
its cover plain linen-textured card with no writing or printing on it. Beside it a used
mug of tea, a small brass desk lamp switched on and pooling warm light, and at the edge of
frame an unbranded amber one-litre solution bottle and a folded cream towel. Through a
window behind, a soft blue-hour street outside, out of focus, a few warm lights beginning
to show. The interior is lit warm against the cool dusk outside, and that contrast is the
whole mood. Surfaces are pale wood and warm off-white, lived-in and tidy.

Editorial still-life photography, warm and quietly premium. [HOUSE STYLE BLOCK]

50mm at f/2.0, low three-quarter angle across the counter, foreground objects slightly
soft. Composition weighted to the right, generous empty counter on the left for the
masthead. Warm interior against cool exterior — the only place in this set where a cool
tone is allowed, and only through the window.
```

**Notes.** The diary cover must stay blank — a closed book is the safest way to get the idea
without the model writing on it. The blue outside is the one sanctioned exception to the
no-cool-tones rule and it should stay confined to the window; if it bleeds into the room,
reroll.

---

## Technical

**Aspect and size.** Generate **16:9 at 2400 × 1350** or larger. Do not generate square and
crop.

**Crop safety.** The same file gets used in two places at two different shapes:

- article page — up to 1240 wide, capped at 600 tall, `object-fit: cover` → about **2.07:1**,
  which trims roughly the top and bottom **12%**
- article cards on the index and in *Keep reading* → **16:10**

So keep every element that matters inside the **central 16:10 region**, and put nothing you
need to see in the top or bottom eighth. Negative space intended for a headline should sit
left or right, never top or bottom — the page crop eats it.

**Midjourney parameter line**, if that's the generator:

```
--ar 16:9 --style raw --stylize 150 --quality 2
```

`--style raw` matters here. Midjourney's default aesthetic will push these toward glossy
commercial product photography, which is the opposite of what the journal should look like.

**For Flux / SDXL in ComfyUI:** put the house style block in the positive conditioning and
the universal negative in the negative conditioning. Keep guidance moderate — 3.5 for Flux,
around 6 for SDXL — since high guidance hardens the light and reintroduces the plastic sheen
the brand rules exclude.

**Consistency across the set.** Once you have a hero you like, hold that seed and reuse it as
the starting point for the other two so the light and grade carry across. The three should
look like the same photographer shot them in the same afternoon.

---

## QA before use

Reject and reroll on any of these:

1. Any readable text, numeral, logo or label anywhere in frame
2. A visible product label on the litre bottle, even partially
3. Money, coins, charts or calculators — the cost cliché
4. Any person, hand or face
5. Blue or cool grey in the room; pure black in the shadows
6. Glossy, plastic, over-retouched surfaces or an HDR look
7. Subject matter drifting into the top or bottom eighth, where the page crop removes it
