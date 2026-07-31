---
title: Home page entry card overlapped welcome image and overflowed viewport because .home lacked overflow/flex-1 hero wrapper
key: bug_2026_07_30_home_layout_overlap
tags:
- layout
- home
- css
- overflow
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/home
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: user
environment: dev (browser runtime, http://localhost:8848/#/home/index)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
The home page at `/home/index` rendered with a visibly broken layout: the absolutely-positioned YiKnowledge entry card overlapped the welcome image, the image's `width: 70%` had no `max-height` constraint so on shorter viewports the image pushed past the visible area and the entry card sat on top of it instead of in the corner, and the `margin-bottom: 20px` on the image shifted the flex-centered image off-true-center with no corresponding adjustment to the entry card's `bottom: 32px` offset — so the visual relationship between the two elements was inconsistent across viewport sizes. The user reported "布局/样式错乱" (layout/style messed up).

## Steps to Reproduce
1. Start the dev server (`pnpm dev`).
2. Open `http://localhost:8848/#/home/index` in a browser.
3. Observe: the YiKnowledge entry card (bottom-right) overlaps the welcome image; the image is not vertically centered (offset by the `margin-bottom`); on a narrow viewport (≤768px) the entry card extends past the visible area or the image's intrinsic aspect ratio pushes it taller than the available hero area.
4. Resize the window — the layout does not reflow cleanly; the absolute-positioned card and the flex-centered image don't coordinate.

## Expected Result
The welcome image is centered in a hero region that fills the available vertical space without overflowing; the entry card sits in the bottom-right corner, visually distinct from the image, and never extends past the viewport.

## Actual Result
The image and entry card were both trying to occupy the bottom-right area of the page with no shared layout contract — the image was flex-centered with an off-centering margin, the entry card was absolute-positioned against the same parent, and on smaller viewports the entry card's text wrapped or pushed off-screen because nothing clamped its width or hid non-essential copy.

## Cause
The home view had been modified to add the YiKnowledge entry card on top of the original welcome-only layout, but the SCSS wasn't restructured to accommodate two distinct visual elements sharing the same container. Specifically:
1. `.home` was `display: flex; align-items: center; justify-content: center` (intended for a single centered child, the image). The new entry card was added as a sibling but `position: absolute`, so it left flex flow — but the parent had no `overflow: hidden` so the absolute card could escape the rounded corners or overlap the image's bottom edge depending on viewport.
2. The image had `width: 70%; max-width: 1200px; margin-bottom: 20px` — no `max-height` and no `object-fit`. On a viewport where `70% width` corresponds to a height taller than the parent (because the 1626×902 aspect ratio is ~1.8:1 and the parent height could be smaller than 70%×width/1.8), the image overflowed the parent and the absolute card landed on top of it.
3. The entry card's `__sub` line had no `max-width` or `text-overflow` clamp, so on narrow viewports the longer Chinese subtitle either wrapped or pushed the card off-screen.

## Solution
Applied — restructured the home SCSS so the container is a vertical flex column with `overflow: hidden`, and the image lives in a `__hero` child that takes `flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center`. The image now has `max-height: 100%; object-fit: contain` so it never overflows the hero region regardless of viewport size, and the `margin-bottom` hack was removed (centering is now correct because the hero is flex-centered without offset). The entry card kept its `position: absolute; right: 24px; bottom: 24px` (now with `z-index: 2` so it sits above the hero), gained a responsive `@media (max-width: 768px)` block that drops the `__sub` line and tightens the padding so the card never escapes the viewport, and the `__sub` line itself now has `max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap` so it can't push the card off-screen at any size.

Process follow-up (not yet landed): when adding a second visual element to a previously single-element flex-centered page, restructure the container rather than bolting the new element on with `position: absolute` and hoping the offsets line up — absolute positioning against a flex container is a layout smell that almost always regresses on viewport changes.
