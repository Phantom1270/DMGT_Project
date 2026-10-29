# DiscreteLab Landing Page Art Direction — Implementation Plan

**Status: Proof Atlas approved for implementation on 29 October 2026.**

Prepared 29 October 2026 against commit `c8fb781`, using the production preview at `http://127.0.0.1:5181/`. This document proposes three directions and develops the recommended one. The user selected Proof Atlas with “Codex — Proof Atlas Implementation.” The original planning specification below is retained as the approved design reference; the optional prototype picker is skipped for direct implementation.

> **For agentic workers, after approval:** use `superpowers:executing-plans` to implement the approved scope task by task. The checkboxes below are future work, not authorization to execute. Revisit this document if a different direction is chosen.

**Goal:** Give an interactive academic mathematics product a memorable, product-specific landing page that gets a student into an experiment quickly and demonstrates why changing an input changes an outcome.

**Architecture:** Preserve the React application, five routes, mathematical engines, session store, themes and keyboard behavior. Compose a new overview from a live lattice, authentic product imagery and an editorial experiment index. Isolate landing styles and any optional scroll choreography from the working labs.

**Tech stack:** Existing React, TypeScript, Vite, plain CSS, React Router, Framer Motion and inline SVG. Proposed GSAP core + ScrollTrigger only for the recommended direction's single explanatory scroll scene; not installed today. No framework migration, WebGL or additional UI kit.

**Spec:** Sections 1–10 of this document are the proposed visual specification. Sections 11–14 are its conditional implementation and acceptance plan.

## 1. What was inspected

### Source and assets

| File or area | What it does today | Design implication |
| --- | --- | --- |
| `src/components/Landing.tsx` | Owns local `a`/`b` state, the four-state B₂ subset lattice, AND/OR results, CTA, five lab entries and closing note | Preserve the working demonstration and every destination; separate presentation from its state |
| `src/App.tsx` | Shared header, six navigation links, themes, system-theme control, shortcut dialog, route focus, route transitions, error boundary and footer | Overview chrome can change; lab chrome and keyboard contracts must survive |
| `src/styles/components.css` | Landing styles intermixed with graph/circuit/timeline styles; landing breakpoint rules near the end | Extract landing selectors instead of appending a second competing theme |
| `src/styles/globals.css` | Warm theme tokens, local fonts, shared UI, frame and mobile navigation | Keep existing base colors; scope new landing scale and chrome explicitly |
| `src/styles/animations.css` | Shared transitions, critical/traversal emphasis and reduced-motion rules | Avoid global animation overrides and two engines writing the same transform |
| `src/lib/useReducedMotionPreference.ts` | Subscribes to changes in the OS motion preference | Reuse; do not take a one-time preference snapshot |
| `src/lib/useTheme.ts` | Explicit light/dark/system preference, persisted theme and theme-color metadata | Preserve default dark, stored preferences and system response |
| `src/main.tsx`, `src/lib/motionFeatures.ts` | React StrictMode and lazy Framer Motion features | New effects must tolerate mount/cleanup/remount |
| `src/lib/samples.ts`, `src/lib/analysis.ts` | Actual task/course examples and Boolean calculations | Source all depicted results from these examples |
| `tests/redesign.py`, `tests/browser.py`, `tests/warm-polish.py` | Navigation, themes, responsive layouts, calculations, exports, sharing and K-map application | Extend the browser coverage; retain existing lab regressions |
| `DESIGN.md`, `PRODUCT.md`, `README.md` | Current warm academic identity and functional scope | This is a landing-page evolution, not a product repositioning |

`public/` contains the favicon, manifest and three locally licensed font families: Inter (~141 KB), Newsreader (~195 KB), JetBrains Mono (~55 KB). There are **no product photographs, videos, commissioned illustrations or landing-page raster images**. Existing artwork is inline SVG and the working application itself. The removed Vite starter graphics should not return.

### Browser evidence

The current production page was inspected at 1440 × 900, 768 × 1024 and 390 × 900 in dark mode, and captured in settled light mode at widths 1440, 768 and 390. All six dark inspection images and all three final light captures were opened. Theme captures were allowed to settle before judging color.

Evidence is local and intentionally outside the proposed deliverable: `.tmp/design-plan/before/`. `report.json` records measurements. The skill's source lint and real-browser inspector were run; their style-policy findings are baseline observations, not broken application tests.

| Observation | Evidence | Consequence |
| --- | --- | --- |
| Identity is already coherent | Espresso/amber, parchment/copper and Newsreader; working dark/light themes | Retain the brand rather than reset it |
| The product explanation is too quiet | Inspector found predominantly 12px body text, with supporting text down to 9px; 28 blocks below 13px | Use readable body copy and a clearer first-screen product description |
| The lattice is visually subordinate | Inspector measured about 16% of the first screen as SVG hero media | Let the actual mathematics lead the composition |
| Catalog is repetitive | Five rounded icon-topped cards; task/course previews share the same generic three-node drawing | Replace placeholders with actual diagrams and distinguish the experiments |
| Phone controls are discovered late | At 390px the live controls started around y=896; at 768px around y=955, in the additional 900px-high interaction check | Move the controls before the plate on small screens; reduce the long preamble |
| Small hit areas in the live experiment | Both input toggles measured 32px high | Increase to at least 44 × 44px |
| Navigation loses visible names | Labels disappear at 768px and 390px, leaving six icons | Keep destination names visible on the redesigned overview |
| No horizontal page overflow in the checked light widths | Browser measurement at all three widths | Preserve that behavior |
| Working content is a strong foundation | All four `a`/`b` combinations and `aria-pressed` states were exercised successfully | Reuse the real state model; do not replace it with a film |

The taste inspector reported **13 style-policy FAIL categories and 5 WARN categories**, including small text, repeated cards, gradients, shadows, decorative numbering and limited load/scroll motion. Its motion counter saw one moving element during its automated pass; this does not mean hover and input transitions are absent. Its bare-title warning also understates the existing description: the description exists, but is too small to do its job confidently.

Some rules require judgment here. Mathematical edges are information, not decorative hairlines. A real lattice/circuit can keep its edges. The prior user-specified warm palette is established brand material, even though the taste skill ordinarily rejects cream/rust combinations. Keep that palette as an explicit brand exception, restrict terracotta to meaningful critical/error emphasis, and avoid using it as general decoration. JetBrains Mono remains in the labs; the landing's editorial labels and controls can use Inter.

### Baseline visual critique

**Seen in one second:** the serif DiscreteLab name and a rounded diagram panel.  
**Idea today:** a warm laboratory containing a small live lattice.  
**Live thing:** toggle membership bits and see the active subset and Boolean results.  
**Layout words:** hero = conventional split; catalog = repeated cards; close = small caption/footer.

The three largest opportunities are: make the live mathematical plate the dominant artwork; replace the five nearly interchangeable cards with evidence from each experiment; enlarge explanatory copy and surface named navigation on phones. The present warmth and functionality should survive those changes. No speculative score is presented as a usability study or an award prediction.

## 2. Product argument and preservation contract

**Audience assumption:** students and instructors demonstrating Module 4: lattices and Boolean algebra. The existing product supports this reading; there is no evidence for an enterprise sales audience.

**Primary outcome:** enter a real lab, with `/tasks` remaining the default CTA destination. Secondary outcome: manipulate the live lattice and understand that the interface calculates rather than merely illustrates.

### The page's argument

| Existing content role | Claim | Proof to show |
| --- | --- | --- |
| Hero and live experiment | Discrete mathematics becomes understandable when its structure responds to inputs | The existing B₂ experiment with immediately correct results |
| Choose your experiment | Five different real-world questions share useful mathematical tools | Actual task graph/schedule, course plan, sensor circuit, policy and equivalence views |
| Closing note | Learning proceeds from changing an input to tracing the result | Preserve the existing three-part learning sentence and a direct route into the labs |

Keep this structure: **hero + experiment → five-lab catalog → learning note + footer**. The recommended storyboard subdivides the catalog into two editorial spreads for clarity; it does not add a new marketing funnel, testimonials, pricing or invented adoption statistics.

### Non-negotiable behavior

- Preserve `/`, `/tasks`, `/courses`, `/home`, `/scholarship`, `/fault`, direct links, browser back/forward and route-heading focus.
- Preserve all five titles, concept descriptions, explanatory copy and mathematical examples. Edit wording only where this plan identifies a clarity improvement.
- Preserve the CTA label **Enter the laboratory**, destination `/tasks`, all five catalog destinations and their default scenarios. Do not silently turn a screenshot into a state-changing deep link.
- Preserve local hero defaults `a=true`, `b=false`; state must not leak into the lab session store.
- Preserve `aria-pressed`, polite result announcements, SVG accessible description, visible focus and keyboard operation.
- Preserve explicit light/dark/system preference, default dark, theme persistence, shortcut help, and shortcuts `1–5`, `D`, `R`, Space and undo/redo where applicable. Proposed keyboard correction: on Overview, Space retains native page scrolling; in the five labs it retains playback behavior. The current shell suppresses Space even on Overview, where no playback exists. This small route guard improves reading without removing any working lab action.
- Preserve graphs, Gantt, timelines, K-map application, exports, PDF reports and sharing in the labs. These engines are outside redesign scope.
- Keep every destination reachable without watching an animation, finishing a scroll scene, hovering, dragging, or opening a decorative object.

### Distinctive material inventory

The design comes from these ten concrete ingredients: the four-element subset lattice; its four membership states; meet/intersection and join/union; a project with parallel frontend/backend work; the same project's four-unit schedule; prerequisite reachability through Deep Learning; presence/darkness sensor rules; the CGPA 8.4 versus 8.5 policy boundary; the identity `TV + TC = T(V + C)`; and the exported mathematical report as a printed artifact. These are more useful than generic pictures of equations, scientists or computers.

## 3. Three visual directions

The installed taste skill dealt `editorial-report`, `sentence-as-layout` and `page-is-the-object` with seed **291026**, sector `education`, tone `editorial`, preserving existing palette and type. These are composition prompts, not approved designs. Their atmosphere photographs are rejected because unrelated architecture would weaken product proof; real application crops supply the imagery. No final assets have been produced.

The directions diverge on **how a visitor reads the product**: an illustrated atlas to browse, a sentence to manipulate, or a working folio to open. They do not differ merely by accent color.

### Direction A — The Proof Atlas

**Concept:** DiscreteLab is an illustrated atlas of relationships. Its live subset lattice becomes the opening plate; the five applications become evidence-rich entries. This is the most convincing extension of the product's academic purpose.

**Visual identity:** oversized editorial type, square-edged product plates, a precise shared column axis, flat warm fields and deliberately varied image scales. The page feels edited and substantial. No faux aged paper, ornamental coordinate grid, card chrome, numbered badges or ornamental brass machinery.

**Typography:** Newsreader 600 for the product title and catalog headings; Inter 400/600 for all explanatory text, mathematical control labels and navigation. Keep JetBrains Mono inside the actual lab screenshots where it already exists, not as a third landing-label system. Display 104px at a 1440px desktop, 72px at tablet, 48px at 390px; section title 48/40/32px; lead 24/22/20px; body 18/18/16px; secondary 14px. A five-role scale, with role-based responsive changes. Keep full headings within two lines.

**Palette:** default ground `#151311`, plate `#1f1b18`, ink `#f8f4ee`, action `#f59e0b`; light ground `#fbf8f3`, plate `#ffffff`, ink `#211c18`, action `#c26910` or the existing contrast-adjusted action token. Rough proportion: 70% ground, 25% product plates, 5% action/state color. Sage is actual completion; terracotta is actual critical structure. Do not recolor data for decoration.

**Artwork and assets:** a live SVG B₂ plate plus six carefully cropped, locally captured product views: task graph, task Gantt, course timeline, home circuit, scholarship policy and machine equivalence. The first two are a demonstrable pair. No new photo shoot or AI image is necessary. These images must show legible real results and be identified as sample views.

**Layout and hero:** a wide mathematical masthead above the title/standfirst. Within the masthead, the live lattice occupies 5 of 12 columns and a real task schedule occupies 7. Below, supporting copy and CTA occupy the left 42%; the large name and existing two-line proposition begin on the 42% axis. The catalog alternates an order/schedule spread and a Boolean-decision spread rather than repeating five boxes.

**Signature interaction:** a short desktop-only task plate moves from dependency graph to Gantt view on scroll, explaining two representations of the same sample. Inputs, links and captions stay still and usable. The hero remains the single live experiment; catalog imagery does not become five miniature applications.

**Desktop journey:** mathematical masthead → editorial title/CTA → task/course spread → home/policy/fault spread → learning sentence and large wordmark close.

**Mobile treatment:** title, clear description and CTA first; then the two large input controls, compact lattice and results; then five directly readable illustrated entries in the original order. No pin, horizontal gallery or hover-only preview. The paired task views appear as static figures.

**Reduced motion:** all plates, captions and both task representations appear in normal flow; input results update instantly. No scroll-bound crossfade or travel.

**Cost and failure risk:** requires the strongest image-editing discipline. Poor crops would turn it into a long document with decorative screenshots. Limit the page to the evidence it actually needs and keep images large enough to read.

### Direction B — Logic in the Sentence

**Concept:** the existing promise, “See the structure. Follow the logic.” becomes the composition itself. A small, real lattice appears between the words as visual punctuation, while the full-size controls remain outside the sentence. The proposition becomes something a visitor can test.

**Visual identity:** bold typographic poster, unusually large Inter, sharply cropped product fragments and strong empty/filled contrast. Spatial tension comes from the inline mathematical object, not from floating cards or perspective effects. This is the most contemporary and immediately recognizable direction.

**Typography:** Inter 700 for the 112–144px desktop proposition, 64–80px tablet and 40–48px phone; Newsreader is retained in the wordmark only. Body Inter 18px, mobile 16px; secondary 14px. The readable sentence remains real text; the diagram is an adjacent figure rather than an image substituted for an essential word in the accessibility tree.

**Palette:** dark poster `#151311` with linen `#f8f4ee`; flat amber `#f59e0b` reserved for the action and active membership. Light poster uses paper `#ffffff`, warm ink `#211c18` and copper `#c26910`. Relative proportion: 85% ground, 12% ink and product imagery, 3% accent. Large type supplies the energy, not more colors.

**Artwork and assets:** the inline SVG lattice plus four or more authentic product crops used as evidence under short statements. Use the existing lab data and faces. No atmospheric photography; no decorative floating formulas unrelated to a pictured experiment.

**Layout and hero:** two full-width text lines; an approximately 2.2em-wide plate sits beside “structure” on desktop. The product name remains the single `h1` at a smaller editorial size above the proposition. A plain supporting sentence immediately explains the product. The CTA is on the first screen. Below, the catalog is an unboxed large-type list with one adjacent evidence well; all five descriptions stay visible.

**Signature interaction:** toggling `a` or `b` changes the active subset in both the inline glyph and the larger explanatory plate from one shared state. A catalog entry may change the adjacent still on pointer hover or keyboard focus with a 120ms opacity transition; its destination always remains a normal link. On touch, all evidence images are inline instead of relying on hover.

**Desktop journey:** sentence with live punctuation → expanded lattice explanation → five-entry typographic index with evidence → closing statement.

**Mobile treatment:** remove the inline insertion, which is too small to explain anything on a phone. Set the promise on two readable lines, then controls and full-width lattice. The catalog becomes five stacked text/image pairs, with no horizontally scrolling text.

**Reduced motion:** diagram states change immediately; the evidence well switches instantly; no headline entrance. The sentence is complete without movement or imagery.

**Cost and failure risk:** typographic line fitting and duplicate SVG accessibility need careful treatment. The tiny inline object may initially be read as an ornament. The strongest desktop idea is substantially different on mobile; less cross-device continuity than A.

### Direction C — The Laboratory Folio

**Concept:** the page is a working teaching folio, related to the report the app can actually export. Open the cover and discover five illustrated experiment leaves. This turns an artifact already belonging to DiscreteLab into its navigation metaphor.

**Visual identity:** one large flat cover/leaf, generous typographic margins, rectangular inset figures and solid tone changes at page boundaries. Materiality comes from proportions and typesetting. No photographic desk, leather texture, paper grain filter, fake bindings, dog-ears, shadows or skeuomorphic 3D book.

**Typography:** Newsreader 600 dominates the folio title at 88–104px desktop and 44–48px phone; experiment headings 40/30px; Inter 18/16px body, 14px notes. No novelty handwriting font. Two families already available locally.

**Palette:** dark cover `#151311`, inner dark leaf `#2a2420`, linen `#f8f4ee`, amber `#f59e0b`; light cover `#f3ece0`, leaf `#ffffff`, espresso `#211c18`, copper `#c26910`. Approximate cover/leaf/accent proportions 20/75/5. Dark mode keeps dark leaves rather than forcing a brilliant white book into the user's chosen theme.

**Artwork and assets:** an original flat folio cover composed in HTML, the live B₂ frontispiece, and the same six real interface crops as inserted plates. A static crop of the exported report can appear in the close only if it helps identify the artifact; no additional export feature is promised.

**Layout and hero:** a centered broad folio with believable print proportions, approximately 1160px wide on desktop. Title and description sit on its cover; the lattice is an inset frontispiece. Beneath it the five leaves occupy the same visual frame. A visible text index links to all five labs at all times.

**Signature interaction:** one noninteractive cover overlay slides vertically off the first leaf across at most 240px of native scroll, using a GSAP timeline and transforms. Subsequent leaves stay in normal document flow. No visitor has to turn a page to reach a lab.

**Desktop journey:** cover + live frontispiece → opening motion → five illustrated leaves → colophon/back cover with existing learning note.

**Mobile treatment:** abandon the framed book and cover slide. Treat each leaf as the page itself, with 16px outer margins and all destinations visible. Do not shrink a desktop book into a phone.

**Reduced motion:** cover and first leaf are ordinary adjacent sections. No overlap, pin, rotation or parallax.

**Cost and failure risk:** highest temptation to prioritize a metaphor over the lab. Cover/leaf duplication could lengthen the route to the catalog; faux-material styling could quickly become theatrical. This direction needs particularly strict mobile editing.

## 4. Critical comparison and recommendation

| Criterion | Proof Atlas | Logic in the Sentence | Laboratory Folio |
| --- | --- | --- | --- |
| Specific to what this product computes | Strong: representations are the artwork | Strong when the embedded object remains understandable | Strong connection to mathematical reports, weaker connection to immediate experimentation |
| First-screen product understanding | Clearest: live experiment + direct description | Fast visual impact, explanation must carry more weight | Familiar scholarly object, but cover can delay understanding |
| Distinctiveness beyond current page | High: masthead/axis/illustrated index replace split hero and cards | Highest typographic departure | High material/compositional departure |
| Phone continuity | Strong: same proof and order, different arrangement | Moderate: inline desktop premise must change | Moderate: book metaphor largely disappears |
| Access to five labs | Direct, always visible | Direct, if the evidence well never becomes a gate | Vulnerable to an over-designed page-turn system |
| Motion's educational purpose | Strong: graph to schedule demonstrates equivalence of representation | Moderate: state feedback is useful; kinetic type is mainly identity | Moderate: opening explains the metaphor rather than mathematics |
| Existing brand fit | Strongest | Deliberately shifts emphasis from serif to sans | Strong, with a risk of overplaying the archival theme |
| Asset burden | Six real crops, reused sensibly | Four to six crops + careful SVG/type integration | Six crops + cover/report art direction |
| Delivery risk | Medium | Medium/high typographic and accessibility risk | Highest choreography/metaphor risk |

**Recommendation: A, The Proof Atlas.** It makes the product's differentiator visible: the relationship between editable conditions, structures and outcomes. It also carries the visual idea through the catalog, where the current page becomes generic. Its ambition comes from scale, art direction and the explanatory transformation, with a quiet fallback for everyday use.

Do not combine A's hero, B's kinetic sentence and C's page-turn effect. Choose one organizing idea. B is the better choice if the user wants a deliberately poster-like, type-led identity; C is the better choice if the report/teaching-document metaphor is the emotional priority.

## 5. Recommended direction: composition system

### Grid and density

- Desktop ≥1100px: 12 columns, 24px gutters, equal outer margins 32px, maximum content width 1440px. Center at larger sizes. The reusable editorial axis begins at approximately 42% of the content width, not 42% of the browser including outer margins.
- Tablet 768–1099px: six columns, 20px gutters, 24px outer margins. Hero copy above the two-column proof band. No sticky scene.
- Phone <768px: four implicit columns, 12px internal gaps, 16px equal outer margins. Normal vertical reading. At 320px keep body 16px, shorten the title measure or reduce display to 42px; never shrink supporting copy to fit.
- Desktop major section spacing 120px; within spreads 48–64px. Phone major sections 64px, entries 40px, internal content gaps 16–24px. No empty viewport used as drama.
- Landing body 16–18px at full primary ink, line-height 1.55, measure 45–65ch desktop and fluid phone width. Notes 14px, never the primary explanation.
- Flat square image/figure edges. Main CTA square or 2px radius, chosen consistently; 48px minimum height. Real input controls retain recognizable focus outlines and boundaries.

### Content deck

| Role | Proposed text | Relationship to current content |
| --- | --- | --- |
| Product title, single `h1` | DiscreteLab. | Preserve |
| Clear product sentence | Five interactive labs for lattices and Boolean algebra. | Elevate information already present in the description/catalog |
| Proposition | See the structure. / Follow the logic. | Preserve wording |
| Supporting explanation | Change an input, trace the relationships, and discover why the result follows. | Preserve the existing explanatory sentence |
| CTA | Enter the laboratory | Preserve label and `/tasks` target |
| Catalog heading | Choose your experiment | Preserve |
| Catalog standfirst | Start anywhere. Every lab lets you change the rules of the scenario. | Preserve |
| Catalog entries | Existing five titles, concepts, descriptions and formulas | Preserve; no new commercial claims |
| Closing sentence | Change an input → trace the mathematics → understand the result | Preserve |
| Subject/context | Module 4 · Lattices & Boolean algebra | Preserve, in readable ordinary text |

Fold “An interactive mathematics atelier” and “Five connected ideas. Five real-world experiments.” into the supporting copy/context rather than retaining two tiny ornamental labels. “Live experiment” becomes a clear figure/control description, not a status badge. Keep the useful mathematics, remove duplicated presentation furniture.

### Desktop storyboard, not a rendered mockup

```text
┌──────────────────────────────────────────────────────────┐
│ DiscreteLab.                   theme / system / shortcuts │
│ Overview · Task planner · Courses · Home · Policy · Fault │
├──────────────────────────────────────────────────────────┤
│ LIVE B₂ PLATE (5 cols)       │ REAL GANTT CROP (7 cols)    │
│ a / b controls + results    │ caption: sample project     │
├──────────────────────────────────────────────────────────┤
│ Clear product sentence      │ DiscreteLab.                │
│ Description + primary CTA   │ See the structure.          │
│                            │ Follow the logic.           │
│ Choose your experiment                                   │
│ TASK TITLE + DESCRIPTION    │ GRAPH → SCHEDULE PLATE      │
│ COURSE TIMELINE             │ COURSE TITLE + DESCRIPTION  │
│ HOME TITLE + CIRCUIT        │ SCHOLARSHIP TITLE + POLICY  │
│ FAULT TITLE + DESCRIPTION   │ EQUIVALENCE PLATE           │
│ Learning sentence                                         │
│ DiscreteLab.                         Explore. Change. ... │
└──────────────────────────────────────────────────────────┘
```

The diagram's dividing characters indicate composition, not proposed ornamental borders. The short navigation names above are schematic; actual link labels remain the existing full names.

## 6. Section-by-section storyboard for the Proof Atlas

### Frame: shared orientation

**Desktop:** quiet 64px masthead with the existing wordmark left and theme, system and shortcut controls right. Six named navigation links wrap beneath in a plain, unboxed row. Use an underline or text treatment for the active route; remove landing pill/chip presentation. Keep actual SVG icons if helpful, without tinted squares. Header and navigation remain in normal flow.

**Phone:** wordmark and theme/help controls on the first row; a compact visible system-theme action can occupy a second tools line. Six full destination names wrap in a three-row, two-column list with 44px hit areas. This intentionally spends some space on understandable navigation instead of unidentified icons. No hamburger is required. At 200% text zoom the row grows rather than clips.

**Motion/trigger:** none for keyboard navigation or route focus. Do not add a sliding underline on the overview. Existing lab route motion is outside this landing pass; avoid changing it incidentally. Focus appears immediately. On Overview, leave Space's default scrolling alone when focus is outside a control; keep the existing lab playback dispatch inside known lab routes. No sticky frosted bar.

### Hero: the opening proof plate

**Claim:** the visitor can change inputs and inspect a mathematical result now.

**Desktop layout:** 296–340px-high full-content-width plate band under the navigation. Live B₂ occupies five columns, a real task Gantt crop seven. The lattice is flat, high contrast and visually large, without aura, grid texture, shadow or rounded container. Its four vertices and actual cover relations remain complete. Controls and results have their own readable region, not tiny text embedded in the graphic. The crop is square edged; its caption says it is a sample project view.

Below the band, a 42/58 title spread: readable product sentence, supporting copy and CTA on the left; Newsreader product title and existing proposition on the right. At 1440 × 900 the CTA and all live controls must be reachable in the first viewport. At 1440 × 768 prioritize title, explanation, controls and CTA over the screenshot height; reduce the band to 240px before reducing text.

**Tablet/phone layout:** DOM reading order is product title → product sentence/proposition → description → CTA → input controls → lattice → results → sample image. Desktop placement may use grid areas; do not create duplicate headings or controls. At 390 × 844, target the CTA and input controls within the initial viewport. This is a normal-text-size target, not a promise to cram content at large text zoom. The task sample image moves to the task entry on phones; do not load an invisible desktop-only duplicate.

**Graphic rules:** selected subset is indicated with fill, a sufficiently contrasting outline and a readable label. Reflow the SVG's geometry and label sizing as necessary to keep rendered labels at least 14px; do not simply shrink the current diagram and its 12px source labels to fit the new band. Incomparable states `{a}` and `{b}` are not connected by a new edge. Never animate an indicator along a nonexistent mathematical path. Meet/AND and join/OR results remain text, not color alone.

**Motion/trigger:** semantic state and accessible text change synchronously with a press. On pointer activation, crossfade only the decorative emphasis overlay in 120ms using CSS opacity. On keyboard activation, use an immediate visual change. No autoplay toggles. Optional entrance affects the noninteractive sample crop only: `translateY(12px)` to `0`, opacity `.92` to `1`, 360ms, `cubic-bezier(0.23, 1, 0.32, 1)`, once on a fresh overview visit. Title, explanation, CTA and controls are visible from the first usable frame.

**Reduced motion:** no entrance or emphasis crossfade. State and result are immediate. A failed optional motion chunk leaves the complete plate and CTA visible.

### Catalog opening: choose the question

**Claim:** the visitor can begin with any of the five applications.

**Layout:** preserve the catalog's heading/standfirst, at 48px/18px desktop and 32px/16px phone. All five entries remain within this one catalog section, in the existing order. Each title is a real link, each description is always visible and each image has a clear relationship to its title. Do not use an accordion that hides the content.

**Transition:** normal native scroll from hero to catalog with a 120px desktop/64px mobile section gap. Flat surface change if needed; no color interpolation across text or sticky overlay.

**Motion/trigger:** one grouped entrance for below-fold imagery, `y:16→0`, opacity `.92→1`, 320ms, 50ms stagger, maximum total 420ms. Use IntersectionObserver at 15% visibility, once per mount; caption/text remain static. Skip if the image is already visible when the enhancement initializes. CSS handles the tween; no animation library is needed for this seam.

### Catalog spread: task planning and course reachability

**Task entry:** title, concept “Partial orders · Critical paths”, the existing description, formula and route `/tasks`. At the shared 42% axis, a large two-view mathematical plate compares the same project as a dependency graph and a Gantt chart. The real sample is Design database → Build backend → Integrate API → Deploy website, with Build frontend in parallel. All durations are one; total project duration is four units. The frontend has one unit of slack. Caption these as sample properties, not user metrics.

**Signature scene, desktop only:** use a stable, noninteractive evidence stage with the dependency crop and Gantt crop occupying identical image bounds. In the enhanced state, its wrapper is `calc(100svh + 240px)` high; the image stage is sticky at 96px and at most `min(60svh, 540px)` high. The text/link column stays outside the animated layers. Native scroll advances from graph to schedule across **240px**, with a short overlap. The graph is visible at progress 0; at .35 it begins fading; by .65 the Gantt is fully visible; it remains final through progress 1. There is no attempt to morph graph nodes into duration bars with misleading geometry.

GSAP ScrollTrigger on the owning timeline: start `top top+=96`, end `+=240`, `scrub:true`, no snap, no JS pin, no `toggleActions`. Use CSS sticky; animate image children only, with opacity and `translateY(12px→0)`. Enable only at width ≥1100px, height ≥800px, fine pointer and no reduced motion. Do not intercept wheel/touch or require a pause. At natural scroll speed this is a brief explanatory move, not several empty screens.

**Progressive fallback:** without the optional scene module, both images appear in normal flow with their caption. Introduce the sticky overlay class only after module initialization, images decoded and eligibility confirmed. The second figure must not be permanently hidden in baseline CSS. A dynamic reduced-motion preference change removes the overlay class, reverts the timeline and restores normal flow. No tab-stop lives in a crossfading image layer.

**Course entry:** reverse the spatial weighting: a wide actual semester timeline left, title/description right. Preserve “Transitivity · Learning paths”, formula and `/courses`. The screenshot shows the sample route Programming + Discrete Mathematics → Data Structures → Algorithms → Machine Learning → Deep Learning under capacity three. It is a deterministic feasible plan, not a promise of a globally optimal university timetable.

**Phone:** task and course entries are ordinary title → description → figure → destination arrangements, with both task views stacked. No sticky behavior. Headings and links never travel while someone is selecting them.

**Reduced motion:** same static phone-style sequence, including both task representations. No scroll spacer survives.

### Catalog spread: decisions, policies and fault equivalence

**Home entry:** in the left six columns, title/description above a large crop of the real sensor circuit; retain “Boolean gates · Sensor rules”, `L = PD + M` and `/home`. Show the actual sample: presence true, darkness true from brightness 20 < threshold 30, manual false; light is on. Keep sensor labels readable.

**Scholarship entry:** in the right six columns, a policy view with its title/description below the image to vary composition without changing DOM meaning. Retain “Policies · Sensitivity analysis”, `E = C(AB + D)` and `/scholarship`. The sample CGPA 8.4 misses the 8.5 threshold with income 300000, attendance 75 and no achievement. If a paired 8.5 illustration is used, label it as a separate sample comparison; do not imply the screenshot is the current applicant or a real award decision.

**Fault entry:** below those two, a full-width shallow equivalence plate with title/description aligned to the 42% axis. Retain “Distributive law · Equivalence”, `TV + TC = T(V + C)` and `/fault`. At the default 95°C, vibration 12 and cooling failed, both expressions produce true. The image can include the actual eight-row equivalence evidence; it must not suggest the simplified logic uses a different rule.

**Graphic elements:** real circuit gates, policy boundaries and truth outputs replace small catalog icons as the main media. Use meaningful state colors already present in the app. Avoid a separate accent for each lab. Product screenshots may retain their own table boundaries; the outer landing layout remains unboxed.

**Transitions/triggers:** use the same one-time image entrance specified above, not three new animation types. A fine-pointer image hover may move its nonessential arrow 3px in 140ms; the image and text stay still. Gate hover styles with `(hover:hover) and (pointer:fine)`. Keyboard focus uses a static outline and no movement.

**Phone:** all three entries stack in original order, with image after description. No tiny side-by-side tables. Crop to the useful finding and provide the result in normal text outside the screenshot.

**Reduced motion:** immediate static imagery and focus. No entrance or arrow travel.

### Close: the learning loop

**Layout:** the existing “Change an input → trace the mathematics → understand the result” sentence becomes a readable final paragraph, not a tiny border-separated strip. The wordmark returns large in the footer with the existing subject context and “Explore. Change. Understand.” Do not add another full-screen CTA wall. The primary action already appeared in the hero, and every catalog entry links to its lab.

**Phone:** learning sentence wraps naturally; it is not a four-line display headline. Footer wordmark at 48px, notes 14px. Keep a clear route back to Overview through the existing brand link.

**Motion/trigger:** no footer curtain, parallax or word scramble in this direction. The close should feel settled after the evidence. No motion dependency.

## 7. Motion opportunity audit and technology choices

The candidate sweep covered input state changes, conditional surfaces, group entrances, navigation, hover/press feedback, gesture seams and success states. Landing has no destructive action, toast, draggable list or genuine celebration state needing animation. Existing hover/press feedback already exists; refine only the landing's relevant controls.

### Accepted opportunities

Each survives frequency, purpose, speed and function checks. These are proposals, not implemented behavior.

| Location / seam | Today | Purpose | Frequency | Exact motion and technology |
| --- | --- | --- | --- | --- |
| `Landing.tsx`, hero state feedback | Active circle fill/stroke transitions over 250ms | State indication | Tens per visit | Semantic result immediately; pointer-only decorative overlay opacity crossfade 120ms, `cubic-bezier(0.23,1,0.32,1)`, CSS; keyboard/reduced motion immediate |
| `Landing.tsx`, noninteractive hero proof image | Image does not exist; current hero is a boxed SVG | Explanation / rare introductory emphasis | Once on a fresh overview visit | `y:12→0`, opacity `.92→1`, 360ms, same CSS curve; never on title/CTA; skip on reduced motion or return navigation |
| Proposed task evidence stage | Current preview is a generic three-node illustration | Explanation | One short pass while browsing the landing | GSAP + ScrollTrigger, graph→Gantt opacity overlap .35–.65, `y:12→0`, linear progress (`ease:none`), `scrub:true`, 240px native scroll; static paired figures outside the eligible desktop condition |
| Catalog image groups | Five cards appear as a single static set | Preventing a jarring change / orientation | Occasional first browse | CSS transform/opacity, 320ms, 50ms stagger, group total ≤420ms, IntersectionObserver threshold .15; once; image remains ≥.92 opacity; no motion in reduced mode |
| Landing CTA/destination arrow | Existing card lifts and glowing/shadow hover | Feedback | Tens per visit | Fine-pointer arrow `x:0→3px`, 140ms, same ease-out; press scale `.99` at 120ms on pointer only; keyboard focus immediate, reduced mode static |

The proposed ease is a new **landing-scoped** token; current CSS mostly uses raw `ease`/durations and has no shared named ease-out token. Do not quietly overwrite all lab transitions.

### Deliberately rejected

- **Keyboard shortcuts / route focus in `App.tsx`:** frequency and immediacy fail the gate. No cinematic route curtain, delayed focus or wait for a scene to end.
- **Auto-cycling `a`/`b` / animated counts:** function fails. Visitors need to know that results reflect their inputs; the application must not edit their state to create spectacle.
- **Pointer-following lattice, magnetic links or tilt:** function fails on an educational diagram; undermines stable reading and has no touch/keyboard equivalent.
- **Decorative line drawing in real graph/circuit screenshots:** function fails. It can suggest a traversal or causal order not asserted by the data. The proposed graph→Gantt scene compares representations instead.
- **Per-letter headline scramble, looping formula marquee, 3D page flips:** no explanatory purpose in A and a disproportionate cost. B/C have their own conceptual devices; importing those would weaken A.

**Verdict:** this page needs one explanatory signature and small feedback, not continuous motion. The graph-to-schedule plate has the highest educational value. The installed `animate`/GSAP skills become implementation references only after direction approval; no implementation handoff is being executed now.

### Tool responsibilities

| Technology | Use | Boundary |
| --- | --- | --- |
| React state | `a`/`b`, correct selected subset, result text, session-independent hero | No GSAP callback may calculate or delay semantic values |
| Inline SVG | Exact B₂ edges/vertices, labels and state overlay | No canvas renderer, particles or fake topology |
| CSS | Responsive frame, flat surfaces, control/focus states, pointer feedback, short transitions, reduced-motion fallback | Prefer transform/opacity; no per-frame height/width/filter animation |
| IntersectionObserver | One-time below-fold image entrances; scene lazy-loading proximity | No scroll event handler updating React state every frame |
| GSAP core + ScrollTrigger | Only the two-image explanatory task scene | Dynamic import; scoped context; explicit cleanup; no custom smooth scrolling |
| Existing Framer Motion | Preserve existing shared application behavior | Do not write the same element's transform from Motion and GSAP; exclude new landing assets from route-parent travel if necessary |

Use a dynamically imported scene module with `gsap.context()` inside an effect and `ctx.revert()` on cleanup. `gsap.matchMedia()` owns eligible viewport/reduced-motion conditions; revert it as well. This avoids adding `@gsap/react` solely for a single lazy scene while following GSAP's supported context pattern. Check an async import cancellation flag before setup; remove observers/listeners on unmount. Refresh after relevant image decode/font settling, never on every animation frame. These responsibilities follow the official [GSAP React guidance](https://gsap.com/resources/React/), [matchMedia documentation](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) and [ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

No SplitText, MorphSVG, ScrollSmoother, Draggable, FLIP library or WebGL is justified for A. If the task scene fails its performance/accessibility gate, remove it and retain the static paired proof images rather than replacing it with a heavier effect.

## 8. Responsive, accessibility and failure contracts

| Condition | Required result |
| --- | --- |
| 1440 × 900, normal text | Clear product sentence, primary CTA, named navigation and live controls visible without waiting for motion |
| 1440 × 768 | Shorter band; all essential controls still usable; no signature scene because height is below 800px |
| 768px tablet | Named wrapping navigation; stacked title and proof; no desktop sticky scene |
| 390 × 844 / 375 × 812 | CTA and input controls targeted in the initial screen; readable 16px body; lattice and five entries remain complete |
| 320px or 200% text zoom | No horizontal page overflow, clipped headings or overlapping controls; first-screen height target yields to readability |
| Coarse pointer | No hover-dependent content; all six navigation names and five lab descriptions available |
| Keyboard | Skip link, brand, theme/system/help, six navigation links, CTA, two toggles and five entry links in meaningful DOM order; Space scrolls Overview and still controls lab playback where applicable; no pointer-only feature is required |
| Screen reader | One `h1`, section headings, one accessible lattice figure, named controls, `aria-pressed`, polite results; no announcements on every scroll tick |
| Reduced motion on load or enabled mid-visit | Revert scene; remove sticky/spacer enhancement; show both task figures normally; stop entrances and input crossfades |
| Animation chunk blocked or initialization rejected | Page remains fully visible and navigable; static figures; no uncaught error or hidden band |
| Image fails | Title, description, sample finding, link and useful alt text still communicate the entry; fixed image dimensions prevent collapse |
| Theme changes during a scene | Correct active-theme assets and text, no hardcoded white frame, no loss of input state or focus |
| Return from a lab / history navigation | No re-running long entrance; links are immediately usable; preserve current route focus behavior and document scroll expectations in tests |

Normal text contrast target ≥4.5:1; large text ≥3:1; focus/essential graphical boundaries ≥3:1 against adjacent colors. Retain contrast-adjusted action tokens where needed; do not assume the raw copper token is a safe background for small white lettering. Results use text/state labels as well as color. Mathematical symbols are never the only accessible explanation.

This existing application requires JavaScript. “Static fallback” in this plan means the **optional animation layer** may fail while the React application still works; it does not promise a new no-JavaScript site or server renderer.

## 9. Asset brief and requirements

### Required for A

| Asset stem | Source and exact finding | Formats / variants | Use |
| --- | --- | --- | --- |
| `tasks-graph` | Default `taskSample`; five nodes, parallel frontend branch, critical route | WebP, light/dark, 640w/1280w | Task explanatory plate |
| `tasks-gantt` | Same default sample, total duration four units, frontend slack one | Same | Hero crop + second task representation, cache reused |
| `courses-timeline` | Default curriculum, no completions, target Deep Learning, capacity three | Same | Course entry |
| `home-circuit` | Default home state; light and AC on, alarm off | Same | Home entry |
| `scholarship-policy` | Default balanced policy; CGPA 8.4 fails minimum 8.5 | Same | Scholarship entry |
| `fault-equivalence` | Default machine/limits; original and simplified both true; real equivalence table | Same | Fault entry |

Expected output set after approval: `public/images/landing/<stem>-<theme>-640.webp` and `...-1280.webp`, plus `public/images/landing/manifest.json` recording source route, exact inputs, crop bounds, theme and capture revision. Six stems × two themes × two sizes = 24 image files. A generated contact sheet belongs under ignored `.tmp/` for QA, not the shipped page.

Capture at a readable scale from the actual running application after the approved styling integration. Use a separate disposable browser context with known fixtures, not the user's current browser/session. Hide only incidental toolbar chrome and cursor; retain the real result. Select either the graph or Gantt view using its actual control. Do not fabricate data in image-editing software.

Use `<picture>`/`srcset` to request the appropriate width and selected theme, with fixed width/height or aspect ratio. A theme switch may replace the image source; it must not destroy hero state. No blanket preload of both themes. The hero's task crop can be eager; below-fold images are lazy, `decoding="async"`, and reuse the same URL when the same crop appears twice.

Every image has an adjacent plain-language sample finding, so screenshot text is not the only source of meaning. Static captures are not controls: no hover cursor suggesting their painted buttons work. Do not wrap a crop of many controls in an ambiguously named link; use a clearly named nearby destination link.

### Not required

No stock architecture, chalkboard, archive engraving, professor portrait, equation texture, generative abstract blob or background video. Four or more genuine interface crops meet the useful imagery requirement without pretending to be photography. There is no honest existing clip, so a loop is not planned. The live experiment and explanatory scene provide movement without video decoding/network cost. No newly licensed fonts or image-generation work is needed.

Existing font licenses remain. No external image license/source credit is needed for captures of this application; retain the project's existing third-party notices. If the user later requests photographic art, approve a separate source/license brief before acquiring it.

## 10. Performance constraints

These are acceptance targets, not measurements of a redesign that does not exist yet.

- Initial first-screen transfer target ≤750 KB compressed/transferred on a cold cache, including chosen-theme hero media and required fonts; total active-theme image set ≤500 KB. Target each 1280w crop ≤80 KB and 640w crop ≤35 KB without blurring labels. If clarity requires more, crop tighter before compressing harder.
- Reuse current local Newsreader/Inter. No new landing font family; JetBrains Mono should not be newly requested solely for editorial labels. Preserve its availability in labs. Verify font network behavior rather than claiming unused fonts are automatically unloaded.
- Optional GSAP/ScrollTrigger chunk target ≤60 KB gzip; load only for eligible desktop users when the task section approaches within 600px. Actual bundle size must be measured. If it misses the budget, use the static fallback or existing Motion/IntersectionObserver instead; do not load both new and redundant engines.
- Do not import React Flow, Dagre, PDF export or a complete lab component into the landing to make a thumbnail. The hero lattice remains simple SVG/React.
- LCP target ≤2.5s, CLS ≤0.1 and responsive input handling; inspect traces on a throttled midrange-phone profile, not only a fast desktop Lighthouse score. Record actual measured values during implementation; no score guarantees.
- No preloader, loader counter, forced scroll smoothing, wheel interception, auto-playing video, looping hero timeline or global pointer tracker.
- Limit the optional scene to two image layers, one timeline and one ScrollTrigger. No React state updates per scroll frame. Use transient `will-change` only while needed, not on every entry for the page lifetime.
- Read DOM geometry in batches after layout settles; never animate width/height/top/left or large blur/shadow filters. SVG state styling can repaint a tiny diagram; do not promise every SVG operation is GPU composited.
- Baseline content is visible. Late enhancement must not introduce a large layout shift: evaluate eligibility before adding the scene wrapper, reserve its approved space and verify CLS. If progressive conversion to the sticky layout shifts the page, keep static flow for that visit.

## 11. Exact likely file changes after approval

Paths below describe future implementation. Only this plan is a new deliverable today.

| File | Future action / responsibility |
| --- | --- |
| `src/components/Landing.tsx` | Modify: compose hero, catalog spreads and close; preserve existing copy, routes and local interaction state through extracted components |
| `src/components/landing/LatticeExperiment.tsx` | Create: controlled live SVG and its accessible controls/results; consumes `a`, `b`, `onAChange`, `onBChange` |
| `src/components/landing/labs.ts` | Create: typed five-entry catalog data extracted from `Landing.tsx`, with exact titles, descriptions, formulas and route IDs; one source for catalog rendering |
| `src/components/landing/ExperimentCatalog.tsx` | Create: atlas spreads, always-visible descriptions and destination links, no embedded working labs |
| `src/components/landing/LabFigure.tsx` | Create: theme-aware `<picture>`, responsive sources, fixed dimensions, caption and useful fallback |
| `src/components/landing/TaskProofScene.tsx` | Create: static paired-figure baseline and optional scene enhancement boundary |
| `src/components/landing/taskProofMotion.ts` | Create only if scene survives approval/performance gate: lazy GSAP setup/cleanup, no business state |
| `src/components/landing/useLandingReveals.ts` | Create: scoped, one-time IntersectionObserver/CSS enhancement with preference and cleanup handling |
| `src/styles/landing.css` | Create: all landing layout, five-role type scale, imagery, pointer feedback and reduced-motion rules |
| `src/styles/components.css` | Modify: remove migrated landing-specific selectors and responsive branches; retain graph/circuit/lab styles; do not remove shared `.primary-link` accidentally |
| `src/index.css` | Modify: import `landing.css` once after shared styles |
| `src/App.tsx` | Small modification: explicit overview scope attribute/class, readable overview navigation/system action, consistent footer terminology, pass resolved `theme` into `Landing`, and restrict Space playback interception to lab routes; other route definitions/handlers retained |
| `src/styles/globals.css` | Small modification only if required: scoped overview chrome overrides and focus targets; base theme tokens/font faces remain |
| `src/styles/animations.css` | Modify only conflicting overview selector rules; shared lab animations remain |
| `src/lib/useReducedMotionPreference.ts` | Reuse without planned API change |
| `public/images/landing/*` | Create approved local responsive captures and manifest described in section 9 |
| `tests/landing-assets.py` | Create reproducible fixture/crop capture utility using the installed Python browser/image tools |
| `tests/landing-design.py` | Create targeted browser acceptance checks, failure injection and new viewport screenshots |
| `tests/redesign.py` | Update only landing selectors changed by the approved composition; retain route, theme, export and lab assertions |
| `package.json`, `package-lock.json` | Change only after approval if adding `gsap`; do not add a second framework or speculative plugin packages |
| `DESIGN.md`, `README.md`, `DEMO_GUIDE.md`, `FEATURE_AUDIT.md` | Update actual shipped behavior and measured evidence after verification |

**Explicitly outside the planned change set:** `src/lib/analysis.ts`, `src/lib/graphAlgorithms.ts`, `src/lib/sessionStore.ts`, `src/lib/report.ts`, `src/lib/renderReport.ts`, all five module implementations and their engines. If a genuine dependency issue demands touching them, explain it and keep that fix separate from visual work.

### Proposed component interfaces

These signatures describe ownership, not source code written today.

- `Landing({ theme: Theme }): ReactElement` receives the resolved light/dark value from the existing `Shell` hook. Import the existing `Theme` type from `src/lib/useTheme.ts`; pass the value down to figures. Do not call `useTheme()` again in a child or add a second local-storage preference writer.
- `LatticeExperiment({ a: boolean, b: boolean, onAChange(next: boolean): void, onBChange(next: boolean): void }): ReactElement`. The parent retains `useState(true)` / `useState(false)`. No second mirrored state in the diagram.
- `LabId = 'tasks' | 'courses' | 'home' | 'scholarship' | 'fault'`; `LabEntry = { id: LabId; title: string; concept: string; description: string; formula: string }`. Destination is derived as `/${id}` rather than a second independent route field.
- `ExperimentCatalog({ labs: readonly LabEntry[], theme: Theme }): ReactElement`. It consumes all five entries in their existing order and passes theme to its figures/scene.
- `LabFigure({ theme: Theme, stem: LandingAssetStem, alt: string, caption: string, eager?: boolean }): ReactElement`; `LandingAssetStem` is the six stems in section 9. It consumes the passed resolved theme without owning/persisting a new preference.
- `TaskProofScene({ theme: Theme }): ReactElement` renders both task figures statically first. `initTaskProofMotion(root: HTMLElement): Promise<() => void>` sets up only after eligibility; its returned function fully reverts the enhancement. The caller handles a late resolution after unmount by immediately invoking cleanup.
- `useLandingReveals(root: RefObject<HTMLElement | null>): void` owns image entrance observation only; it never changes data, text or focus.

## 12. Conditional implementation tasks

### Global constraints

All tasks inherit sections 2, 8 and 10: existing routes/engines/copy, default dark, semantic immediate results, named navigation, reduced-motion response, no optional-animation visibility dependency and the stated performance budgets. Do not begin Task 1 until the user approves A or an amended specification.

### Review focus

The five failure classes most likely to be missed by attractive screenshots are: rapid mixed-input changes; keyboard focus hidden by decorative layout; dynamic reduced-motion/theme changes; async motion import completing after route unmount; and mobile/zoom text growth. Tasks below pin each to an actual browser check.

### Task 1 — Approve and validate the visual composition

**Files:** future isolated `prototypes/landing-atlas/index.html` and `prototypes/landing-atlas/` assets only if the user authorizes a prototype; this plan if decisions change.

**Produces:** approved still desktop/phone composition and one agreed signature recipe. No production import.

- [ ] Record the user's selected direction, palette/type constraints and any requested changes in this document.
- [ ] If visual prototyping is wanted, invoke `prototype` for the single highest-risk piece: the opening hero/plate, with three distinct compositions within the selected direction. Use its prescribed picker and realistic copy. Keep it isolated; do not create this now.
- [ ] Compare each full-size variant at 1440 and 390, keyboard and reduced motion. Never judge only thumbnails.
- [ ] Obtain approval of the composition before promotion; remove unused prototypes on integration unless asked to retain them. If the user approves this complete storyboard for direct implementation, skip the optional prototype rather than adding another approval round by default.

### Task 2 — Static atlas and preserved lattice behavior

**Files:** `Landing.tsx`, `landing/LatticeExperiment.tsx`, `landing/labs.ts`, `landing/ExperimentCatalog.tsx`, `styles/landing.css`, `styles/components.css`, `index.css`, the `App.tsx` landing theme prop only, targeted `tests/landing-design.py`.

**Consumes:** approved static composition and current five-entry copy.  
**Produces:** the controlled lattice/catalog interfaces in section 11, with fully visible static content.

- [ ] Add a behavior baseline to `tests/landing-design.py`: exercise `00`, `01`, `10`, `11`; assert selected subset, `aria-pressed`, AND/OR values and all five `href`s. Test ten rapid alternating clicks and final state; ensure no queued animation changes the settled result.
- [ ] Run against the current preview to record preservation behavior; new required 44px targets/named-phone-navigation checks should fail for a clearly identified current limitation.
- [ ] Extract the controlled lattice and catalog data, then build the static hero/spreads with no JS motion. Pass `Shell`'s resolved theme into `Landing` and through the declared props. Preserve the exact B₂ graph and copy deck. Migrate only landing selectors; keep shared links/lab styles intact.
- [ ] Check desktop/phone hierarchy in the browser, without waiting for a reveal. At 320px and 200% text zoom, assert no horizontal overflow or clipped CTA. Verify title, control and link reading order.
- [ ] Run the lattice/route checks, `npm test`, `npm run lint`, `npm run build`; commit the independently usable static composition.

### Task 3 — Authentic product plates

**Files:** `landing/LabFigure.tsx`, `landing/TaskProofScene.tsx` static portion, `tests/landing-assets.py`, `public/images/landing/*`, catalog integration and browser checks.

**Consumes:** `LabEntry`, actual application fixtures and resolved theme.  
**Produces:** six named theme-aware responsive assets, capture manifest, static paired task scene.

- [ ] Add assertions for image dimensions, six stem names, alt/caption presence and useful entry text when an image request fails. Check that default sample captions match current algorithms/fixtures.
- [ ] Capture known scenarios from the real routes in an isolated context; create the prescribed crops and both widths/themes. Review labels at actual 390px display size and remove excess browser/UI chrome.
- [ ] Wire `<picture>`/`srcset` with explicit dimensions and theme switching. Keep the lattice state stable through theme changes. Confirm phones do not download hidden desktop duplicates or both themes initially.
- [ ] Show both task figures in normal flow, then verify that their data describe the same sample. Block all landing image URLs and confirm every lab remains understandable/reachable.
- [ ] Measure actual image transfer, verify the ≤500KB active-theme set target and inspect a six-asset contact sheet. Commit plates and the repeatable capture utility.

### Task 4 — Overview chrome and named navigation

**Files:** `App.tsx`, scoped `globals.css`/`landing.css` changes, selective `animations.css`, `tests/landing-design.py`, relevant `redesign.py` landing selectors.

**Consumes:** the existing shell's handlers, routes and theme state.  
**Produces:** overview-specific chrome without lab-wide visual regression.

- [ ] Add keyboard tests: skip link; named links at 390px; theme/system/help controls; number-key navigation; route `h1` focus; back/forward. Assert no route destination changes. With focus on a non-control in Overview, press Space and assert native scroll advances; in `/fault`, confirm Space still starts/pauses simulation and is not intercepted while editing a field.
- [ ] Add the explicit overview scope and readable wrapping navigation. Preserve all handlers; ensure `nav-selection` overrides affect only the overview and do not remove a laboratory's active state.
- [ ] Verify at 320px, 390px, 768px and 1440px in both themes, plus text zoom. Keep focus outside sticky/animated figure layers. Ensure system theme remains available on the overview phone layout.
- [ ] Run the existing full lab browser regressions to detect shared-CSS leakage, then commit the shell adaptation.

### Task 5 — Progressive motion with a working static fallback

**Files:** `landing/taskProofMotion.ts`, `landing/TaskProofScene.tsx`, `landing/useLandingReveals.ts`, `landing/LatticeExperiment.tsx` feedback only, `landing.css`, conditional package/lock change, browser motion tests.

**Consumes:** stable static figures, `useReducedMotionPreference`, `initTaskProofMotion` and cleanup contract.  
**Produces:** one optional GSAP timeline/trigger and small scoped CSS feedback.

- [ ] Add failure checks first: reduced motion at load and switched mid-scene; blocked scene chunk; unmount during a delayed import; short-height desktop; coarse-pointer mobile. In each case both task representations remain available and no stale spacer/style/listener survives.
- [ ] If still approved and needed, add GSAP and implement only the section 6 scene with scoped context, media conditions, explicit `revert`, native scrolling and 240px progression. Use an inactive static default; catch import/setup failure without hiding content.
- [ ] Add the one-time image entrances and immediate keyboard/static reduced-motion feedback. Test pointer hover separately from keyboard focus; do not animate control text or result computation.
- [ ] Probe the scene at progress 0, .25, .5, .75 and 1, then scroll backward; compare both figures/captions. Navigate away/back repeatedly and inspect for duplicate triggers and console errors. Toggle the theme during the scene and repeat all four hero states.
- [ ] Measure the new chunk and scroll trace against section 10. If late initialization changes layout/CLS, disable the scene for that visit or keep static flow. Commit only after fallback and cleanup tests pass.

### Task 6 — Final visual and functional gate

**Files:** tests, approved source refinements and documentation listed in section 11; remove optional prototype surface on promotion.

**Consumes:** final production build, complete asset set and all prior behavior contracts.  
**Produces:** verified build, before/after evidence and accurate docs.

- [ ] Run `npm test`, `npm run lint`, `npm run build`; expect all 14 existing unit tests and zero build/lint errors. Extend test count if behavior tests are added; do not delete mathematical coverage.
- [ ] Serve the production preview; run `tests/browser.py`, `tests/redesign.py`, `tests/warm-polish.py` and `tests/landing-design.py` using `DISCRETELAB_TEST_URL` for the chosen preview port.
- [ ] Capture 1440, 768, 390 and 320 widths in both themes, plus 1440 × 768, 390 × 844, 375 × 812, reduced motion and 200% text zoom. Open the captures and inspect all catalog entries, not just the first fold.
- [ ] Run the taste lint/inspector against the landing scope/production URL. Document the brand-palette and real-mathematical-diagram exceptions precisely; do not claim zero rule failures by broadly exempting the page as an app fragment.
- [ ] Inspect the task scene at intermediate progress, contrast/focus and asset-failure states; measure actual transfer and performance. Use design judgment over the taste tool's motion-count floor: do not add gratuitous moving nodes merely to hit its counter.
- [ ] Update `DESIGN.md`, README/demo/audit with actual shipped choices and measured limits. Review the diff for unintended module/session/engine changes. Commit in coherent pieces and follow the user's existing repository integration instructions when implementation is authorized.

## 13. Planning provenance and deliberate adaptations

- **Brainstorming:** inspected the existing product first, developed three defensible alternatives, recorded assumptions and kept selection with the user. The user explicitly requested a completed proposal/plan before choosing; this document therefore contains a recommendation rather than treating any direction as already picked.
- **Design taste:** used the three dealt compositions (seed 291026), captured the existing page and read the screenshots. Kept type/palette as established brand. Replaced irrelevant dealt architecture with product evidence; replaced the dealt long folding-card list with an always-visible illustrated index because all five destinations must remain directly accessible. The dealt contact footer is inapplicable to an academic tool with no contact funnel; the existing learning close serves the real content.
- **Animation opportunities:** used the frequency/purpose/speed/function gates, five accepted seams and explicit rejections. Daily-use keyboard behavior gets no new choreography. Choreography never controls semantic state.
- **Prototype:** applied its divergence principle and isolated-surface boundary. No picker or prototype code was created because the user expressly prohibited coding before approval. A future hero picker is optional, not a hidden prerequisite to receiving this document.
- **Writing plans:** mapped exact files, interfaces, dependencies, meaningful browser checks and conditional commits. The user's requested `DESIGN_PLAN.md` replaces the skill's default documentation path. A plan was requested now, so it is included while clearly retaining the approval gate.
- **Independent builder check:** a separate frontend reviewer read this document against the existing source. Its two material questions are resolved explicitly: `Shell` passes its resolved theme through component props, and Overview restores native Space scrolling while lab playback remains. Both are proposed author decisions for review, not claims that source code has already changed.

## 14. Approval and what happens next

**Planning baseline:** no application source, dependencies or shipped assets were changed during the planning task. Browser captures and dealt direction sheets are inspection artifacts under ignored `.tmp/`. No redesign has been implemented or published.

The decision is **Proof Atlas**, **Logic in the Sentence**, or **Laboratory Folio**. My recommendation is **Proof Atlas**, using the existing warm dark/light palette and local Newsreader/Inter, with authentic application plates and the one optional desktop explanatory scene.

Approval should identify the chosen direction and any amendments. Approving the visual direction authorizes work on that direction's agreed plan; it does not turn the other two into additional build requirements. If the user chooses B or C, revise the detailed storyboard/file plan before implementation. Approval has now arrived for A; implement only Proof Atlas and verify the preservation contracts.
