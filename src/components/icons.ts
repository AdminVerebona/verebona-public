/**
 * Glyphes des icônes linéaires du site (charte 2026, style Lucide 24 px,
 * trait 1,8). Rendus par `VbIcon.vue`.
 */
export type Shape = { tag: 'path' | 'rect' | 'circle'; attrs: Record<string, string | number> }
const p = (d: string): Shape => ({ tag: 'path', attrs: { d } })

export const ICONS = {
  search: [{ tag: 'circle', attrs: { cx: 11, cy: 11, r: 7 } }, p('m20 20-3.5-3.5')],
  calendar: [{ tag: 'rect', attrs: { x: 3, y: 5, width: 18, height: 16, rx: 2.5 } }, p('M3 9.5h18M8 3v4M16 3v4')],
  file: [p('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'), p('M14 3v5h5M9 13h6M9 17h4')],
  chart: [p('M4 20h16M6 16v-5M11 16V7M16 16v-3')],
  home: [p('M3 10.7 12 3l9 7.7'), p('M5 9.6V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.6'), p('M9.5 21v-6.2h5V21')],
  box: [p('M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z'), p('m3.3 7 8.7 5 8.7-5'), p('M12 22V12')],
  upload: [p('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'), p('M7 8l5-5 5 5'), p('M12 3v12')],
  download: [p('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'), p('M7 10l5 5 5-5'), p('M12 15V3')],
  check: [p('M20 6 9 17l-5-5')],
  x: [p('M18 6 6 18M6 6l12 12')],
  chevronRight: [p('M9 6l6 6-6 6')],
  chevronLeft: [p('M15 6l-6 6 6 6')],
  // Lot 69P — types de biens (carrousel des cas d'usage) et démonstration.
  car: [p('M5 17H3a1 1 0 0 1-1-1v-3.5a2 2 0 0 1 .6-1.4L5 8.7 6.4 6A2 2 0 0 1 8.2 5h7.6a2 2 0 0 1 1.8 1l1.4 2.7 2.4 2.4a2 2 0 0 1 .6 1.4V16a1 1 0 0 1-1 1h-2'), p('M9 17h6M4.5 9.5h15'), { tag: 'circle', attrs: { cx: 7, cy: 17, r: 2 } }, { tag: 'circle', attrs: { cx: 17, cy: 17, r: 2 } }],
  building: [{ tag: 'rect', attrs: { x: 4, y: 2.5, width: 16, height: 19, rx: 2 } }, p('M9.5 21.5V17h5v4.5'), p('M8.5 7h1M14.5 7h1M8.5 11h1M14.5 11h1')],
  garage: [p('M2.5 20V8.6a1.5 1.5 0 0 1 .9-1.4l8-3.4a1.5 1.5 0 0 1 1.2 0l8 3.4a1.5 1.5 0 0 1 .9 1.4V20'), p('M6.5 20v-8.5h11V20'), p('M6.5 14.5h11M6.5 17.5h11')],
  moto: [{ tag: 'circle', attrs: { cx: 5, cy: 16.5, r: 3 } }, { tag: 'circle', attrs: { cx: 19, cy: 16.5, r: 3 } }, p('M8 16.5h4l3.5-6H19l1.5 3'), p('M13.5 6.5H16l2 4'), p('M7 10.5h5l1.5 2.5')],
  bike: [{ tag: 'circle', attrs: { cx: 5.5, cy: 16.5, r: 3.5 } }, { tag: 'circle', attrs: { cx: 18.5, cy: 16.5, r: 3.5 } }, p('M5.5 16.5 9 9h6.5l3 7.5'), p('M12 16.5 9 9M8 6h3M14.5 6.5h2.5l-1.5 2.5')],
  terrain: [p('m2 20 6.5-11 4 6.5 3-4.5L22 20z'), { tag: 'circle', attrs: { cx: 17, cy: 5.5, r: 1.8 } }],
  store: [p('M4 10.5V20h16v-9.5'), p('M2.5 10.5 4.5 4h15l2 6.5z'), p('M10 20v-5h4v5')],
  leisure: [p('M3.5 20 12 4l8.5 16'), p('M2 20h20'), p('m12 13-3 7M12 13l3 7')],
  laptop: [{ tag: 'rect', attrs: { x: 4, y: 4.5, width: 16, height: 11, rx: 1.8 } }, p('M2 19.5h20')],
  euro: [p('M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5'), p('M4 10.5h9M4 13.5h9')],
  sparkle: [p('M12 3v4M12 17v4M3 12h4M17 12h4'), p('m6 6 2.2 2.2M15.8 15.8 18 18M6 18l2.2-2.2M15.8 8.2 18 6')],
  bell: [p('M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9'), p('M10 20a2 2 0 0 0 4 0')],
  chevronDown: [p('m6 9 6 6 6-6')],
  arrowRight: [p('M5 12h14M13 6l6 6-6 6')],
  users: [p('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'), { tag: 'circle', attrs: { cx: 9, cy: 7, r: 4 } }, p('M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75')],
  mail: [{ tag: 'rect', attrs: { x: 3, y: 5, width: 18, height: 14, rx: 2 } }, p('m3 7 9 6 9-6')],
  menu: [p('M4 7h16M4 12h16M4 17h16')],
} satisfies Record<string, Shape[]>

export type IconName = keyof typeof ICONS
