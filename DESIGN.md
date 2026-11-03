# Design

ANQ Notes follows the ANQ family system.

## This project's settings

- **Blueprint:** reading column. A `--width-measure` (38rem) text column beside a
  `--width-margin` (8rem) margin column; a quiet masthead on the paper.
- **Palette:** walnut ink (`--color-brand` #78532c) on warm paper
  (`--color-canvas` #faf7f1).
- **Density:** generous. Body `--text-md`, prose line height 1.8.
- **Signature:** dates in the margin column beside a ruled index of posts, and
  post counts in the same place on Topics. Below 760px they move above their entry.
  Posts and pages have no margin column: one `--width-reading` (44rem) block
  centred under the rules, with `--text-lg` body text and a post's date beside
  its tags.
- **JavaScript:** required to work without it. Pages are static HTML; the
  theme switch is the only script and is an enhancement.

`styles/tokens.css` owns the contract, the family block and these settings;
`styles/site.css` owns layout and components. Keep the class names the tests
use (`.post-card`, `.topic`).

## Departures

None.

<!-- One line per broken core rule: the rule, what this project does instead, and why. -->

## Family rules

The full rulebook, blueprints and live components:
https://claude.ai/artifact/AoQLCbGaXeEHqzBuadsihD. Rules are suggestions with
reasons. Overrule a **default** freely. Break a **core** rule only on purpose,
and add it to Departures above.

Core rules, identical in every ANQ project:

1. **Two faces.** Source Serif 4 (`--font-body`, `--font-heading`, optical
   sizing on) for language; IBM Plex Mono (`--font-mono`) for controls:
   navigation, buttons, standalone links, tags, labels, dates, pagination. No
   sans-serif. Self-hosted woff2; the CSP needs `font-src 'self'`.
2. **Sentences stay serif**, even among controls; a link inside a sentence keeps
   the sentence's face.
3. **Accents mark something.** Colour only (`--color-brand`), on a quote, the
   current item or a status; at most one per view, never decoration. No
   italics, bold or underline for emphasis.
4. **Labels** in mono, sentence case: `--text-ui`, `--color-muted`, no forced
   capitals or tracking. A heading that introduces a list of titled entries is a
   label. Number only a real sequence.
5. **Rules before boxes.** 1px `--color-line` hairlines. Three surfaces only:
   Panel, Card, Frame. A shadow only where an element floats over content it
   would otherwise blend into, such as the back-to-top button; never for
   decoration. No coloured side bars.
6. **One scale.** `--text-*`, `--space-*`, `--radius-frame`, `--radius-small`. No
   literal px except 1px borders, component geometry and breakpoints.
7. **Same contract.** Keep the shared token names and the family block in
   `tokens.css`; change the look through the palette and the settings above.
8. **Access** (never a departure): 4.5:1 text in both themes, a solid 3px
   `--color-focus` outline, 44px targets, no motion under
   `prefers-reduced-motion`.

Family defaults:

- Use JavaScript where it earns its place, and load nothing the page does not
  need. Each project's settings say whether it must, or should, work without
  JavaScript.
- An arrow (↗) marks a link to another website; internal links, in-page jumps
  and mail links go without.
- Identity lines are sentences ("Web developer in Norway"), not dot-joined
  fragments. Middle dots belong only inside dense data rows.
