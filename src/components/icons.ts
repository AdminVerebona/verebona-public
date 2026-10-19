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
  home: [p('M3 10.7 12 3l9 7.7'), p('M5 9.6V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.6'), p('M9.5 21v-6.2h5V21')],
  box: [p('M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z'), p('m3.3 7 8.7 5 8.7-5'), p('M12 22V12')],
  upload: [p('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'), p('M7 8l5-5 5 5'), p('M12 3v12')],
  download: [p('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'), p('M7 10l5 5 5-5'), p('M12 15V3')],
  check: [p('M20 6 9 17l-5-5')],
  x: [p('M18 6 6 18M6 6l12 12')],
  chevronRight: [p('M9 6l6 6-6 6')],
  chevronLeft: [p('M15 6l-6 6 6 6')],
  // Lot 71P — bouton « Mettre en pause / Reprendre le défilement » du bandeau des types de biens.
  pause: [p('M9 5v14M15 5v14')],
  play: [p('M7 4.5v15l12-7.5z')],
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
