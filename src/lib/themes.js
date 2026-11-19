export const THEMES = [
  { id: 'dark', name: 'Noah theme', detail: 'Stone, red, gold', colors: ['#14090a', '#a01818', '#c9a84c'] },
  { id: 'light', name: 'Allie theme', detail: 'Cream, green, gold', colors: ['#faf6ed', '#5a7c3a', '#b8960c'] },
  { id: 'japan', name: 'Japan', detail: 'Cream, red, black', colors: ['#f3e7d3', '#a42822', '#1a1411'] },
  { id: 'wedding', name: 'Wedding', detail: 'White, blue, yellow', colors: ['#f4f8fb', '#2a6d8c', '#e3c97a'] },
  { id: 'blue-night', name: 'Blue Night', detail: 'Black and blue', colors: ['#05070d', '#2f6fbf', '#7eb0ee'] },
  { id: 'nathan', name: 'Nathan theme', detail: 'Charleston, olive, midnight', colors: ['#232B2B', '#7C9340', '#24356E'] },
]

export const THEME_IDS = new Set(THEMES.map((item) => item.id))
