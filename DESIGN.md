# Mathematical Atelier

The user-requested visual world is warm and editorial: an archival mathematics monograph beside espresso, amber brass instruments and parchment. This supersedes the earlier navy/cyan Observatory palette while preserving its working layout and calculations.

## Tokens and typography

Dark mode uses warm obsidian #151311, roast #1f1b18 and warm stone #2a2420, with linen #f8f4ee text. Amber #f59e0b marks actions, terracotta #e06c4b marks critical structure, sage #709775 marks completion, brass #eab308 marks warnings and crimson #d9534f marks faults. Light mode uses parchment #fbf8f3 and paper white, espresso #211c18 text, copper #c26910 actions, terracotta #b84a39, forest sage #386641, antique brass #9a6700 and crimson #b91c1c. Base tokens match the brief; derived ink tokens improve small-text contrast.

Newsreader at weight 600 carries headings and the wordmark. Inter remains the interface face; JetBrains Mono remains for data, code and math labels. All fonts and their licenses are bundled locally. KaTeX retains its mathematical fonts.

## Surfaces and diagrams

The five laboratory routes retain segmented navigation, large graph workspaces and compact inputs. Lab cards use warm hairline borders and offset, diffuse depth. Circuits use solid copper/brass traces and a restrained moving amber signal dot; idle and active gates derive their fills from theme tokens. Critical graph nodes use terracotta, completed nodes sage, and traversal a soft amber emphasis.

## Proof Atlas overview

The approved landing direction is an illustrated atlas of mathematical relationships. A wide live B₂ plate and real project schedule lead the desktop composition; an oversized Newsreader title follows on a shared 42% editorial axis. The five experiments form an unboxed illustrated index with authentic application captures instead of generic icon cards. The overview uses flat surfaces, square image edges, readable Inter copy, named navigation on phones and no ornamental shadows, gradients or hairlines. Mathematical edges are meaningful data and remain visible. The existing warm palette is retained deliberately as the brand.

On phones, content reads title, explanation, CTA, live controls and lattice, then all five experiments in their original order. The overview supports 320px and enlarged text without inheriting the labs' 360px minimum width. Its CSS is isolated in `landing.css`; mathematical engines, lab state and lab styling remain separate. The shell owns the resolved theme and passes it into product figures, avoiding a second preference writer.

One optional desktop-only GSAP/ScrollTrigger scene compares the same task graph and Gantt schedule over 240px of native scroll. It initializes only below the viewport to avoid shifting visible content. Phones, reduced motion, short screens, image failures and failed/late animation loading retain normal-flow figures. No preloaders, wheel interception, autoplay inputs, 3D effects or continuously moving diagrams are used. State changes and screen-reader announcements are immediate; pointer-only emphasis is brief. See `DESIGN_PLAN.md` for the approved storyboard and implementation contracts.

## Interaction and verification

Preserve keyboard focus, semantic controls, reduced motion, route focus, accessibility labels and readable status text. K-map cells inspect first; the explicit Apply combination to scenario action updates real inputs. Explain unrepresentable boundary combinations without altering thresholds. PDF reports use editorial headers, active parameters, computed summary/detail tables, metadata, assumptions and numbered pages. Verify both themes at desktop and mobile sizes and render exported PDF pages before delivery.
