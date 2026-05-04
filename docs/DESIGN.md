# DESIGN.md — Algoplay Flutter Design System

## Scene Sentence
"A student studying algorithms on their phone in a sunlit campus cafe, glancing at the screen between sips of coffee, needing instant clarity on which step the algorithm is on."

This forces: light theme, high contrast, clean surfaces, warm solar accents.

## Color Strategy: Committed + Solar Accents
One primary color (solar blue) carries the interface. Warm solar accents (amber, orange, gold) for achievements and energy. This is not restrained — the blue is confident and present — but it's not drenched either.

## Color Tokens (OKLCH-verified for perceptual uniformity)

### Surfaces
| Token | Hex | OKLCH | Role |
|---|---|---|---|
| `surface.canvas` | `#FAFBFC` | l:98 c:0.005 h:250 | Main background, slight cool tint |
| `surface.card` | `#FFFFFF` | l:100 c:0 h:0 | Cards, elevated surfaces |
| `surface.sunken` | `#F1F3F5` | l:96 c:0.005 h:250 | Inset areas, code blocks |
| `surface.overlay` | `#FFFFFFEE` | — | Modal backdrop |

### Primary — Solar Blue (trust, education, calm focus)
| Token | Hex | Role |
|---|---|---|
| `primary.900` | `#1A56DB` | Text on light bg |
| `primary.700` | `#2563EB` | Pressed states |
| `primary.500` | `#3B82F6` | Buttons, links, active tabs |
| `primary.300` | `#93C5FD` | Hovered states |
| `primary.100` | `#DBEAFE` | Tinted backgrounds |
| `primary.50` | `#EFF6FF` | Subtle highlights |

### Secondary — Solar Orange (energy, rewards, gamification)
| Token | Hex | Role |
|---|---|---|
| `secondary.900` | `#C2410C` | Text on light bg |
| `secondary.700` | `#EA580C` | Pressed states |
| `secondary.500` | `#F97316` | Badges, XP, streaks, game accents |
| `secondary.300` | `#FDBA74` | Soft highlights |
| `secondary.100` | `#FFF7ED` | Warm tinted backgrounds |

### Solar Accents
| Token | Hex | Role |
|---|---|---|
| `solar.gold` | `#F59E0B` | XP, coins, achievements |
| `solar.amber` | `#FBBF24` | Stars, rewards glow |
| `solar.lime` | `#84CC16` | Growth, progress, "you got it" |
| `solar.cyan` | `#06B6D4` | Information, cool accent |

### Semantic
| Token | Hex | Role |
|---|---|---|
| `success.600` | `#16A34A` | Completed, correct |
| `success.100` | `#DCFCE7` | Success background |
| `error.600` | `#DC2626` | Errors only |
| `error.100` | `#FEE2E2` | Error background |
| `warning.600` | `#D97706` | Caution |
| `warning.100` | `#FEF3C7` | Warning background |

### Text
| Token | Hex | Role |
|---|---|---|
| `text.primary` | `#111827` | Body text (near-black, slight cool) |
| `text.secondary` | `#4B5563` | Subtitles, descriptions |
| `text.muted` | `#9CA3AF` | Timestamps, disabled |
| `text.inverse` | `#FFFFFF` | On colored backgrounds |

### Category Colors (Algorithm skill groups)
| Category | Hex | Usage |
|---|---|---|
| `cat.sorting` | `#F472B6` (rose) | Sorting algorithms |
| `cat.searching` | `#38BDF8` (sky) | Search algorithms |
| `cat.graphs` | `#34D399` (emerald) | Graph algorithms |
| `cat.dp` | `#A78BFA` (violet) | Dynamic programming |
| `cat.greedy` | `#FBBF24` (amber) | Greedy algorithms |
| `cat.trees` | `#FB923C` (orange) | Tree algorithms |

## Typography

### Scale (ratio 1.25 between steps)
| Token | Size | Weight | Tracking | Line height |
|---|---|---|---|---|
| `display` | 36px | w800 | -0.02em | 1.1 |
| `h1` | 28px | w700 | -0.01em | 1.2 |
| `h2` | 22px | w700 | -0.005em | 1.3 |
| `h3` | 18px | w600 | 0 | 1.4 |
| `body` | 15px | w400 | 0 | 1.5 |
| `body.bold` | 15px | w600 | 0 | 1.5 |
| `caption` | 13px | w400 | 0.01em | 1.4 |
| `overline` | 11px | w600 | 0.08em | 1.3 |

### Font Stack
- **Primary**: `SpaceGrotesk` (geometric, friendly, clear)
- **Mono**: `SpaceMono` (code blocks, algorithm steps)
- Fallback: system sans-serif

## Spacing Scale
| Token | Value |
|---|---|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 24px |
| `2xl` | 32px |
| `3xl` | 48px |

## Border Radius
| Token | Value | Usage |
|---|---|---|
| `sm` | 6px | Chips, small badges |
| `md` | 10px | Buttons, inputs |
| `lg` | 14px | Cards |
| `xl` | 20px | Bottom sheets, modals |
| `full` | 9999px | Avatars, circular badges |

## Elevation
| Level | Shadow | Usage |
|---|---|---|
| `flat` | none | Inline elements |
| `sm` | 0 1px 3px rgba(0,0,0,0.06) | Cards at rest |
| `md` | 0 2px 8px rgba(0,0,0,0.08) | Hovered cards |
| `lg` | 0 4px 16px rgba(0,0,0,0.1) | Bottom nav, modals |
| `xl` | 0 8px 32px rgba(0,0,0,0.12) | Floating action elements |

## Components

### Bottom Navigation
White background, `lg` elevation shadow. Active tab: `primary.500` icon + label, with a small `primary.50` pill behind the icon. Inactive: `text.muted`. No blur, no transparency, solid and clear.

### Cards
White `surface.card` with `sm` elevation. `lg` border radius. Content-first: no decorative borders, no side stripes. Category color used ONLY as a small dot or badge in the corner, never as a full-card background or border.

### Buttons
- **Primary**: `primary.500` background, white text, `md` radius. Hover → `primary.700`. 
- **Secondary**: `secondary.500` background, white text.
- **Ghost**: transparent bg, `primary.500` text, `primary.100` on pressed.
- Heights: 48px standard, 40px compact, 56px prominent.

### XP / Progress
Warm solar colors only. XP bar: `solar.gold` fill on `surface.sunken` track. Level badge: `secondary.500` circle with white number. Streak: `solar.gold` flame icon.

### Algorithm Visualization Bars
White background. Bars use category color at 60% opacity. Active/comparing bars: full opacity with category color. Sorted bars: `success.600`. Clean, no gradients.

### Tab Bar on Screens
Horizontal scrollable pills. Active pill: `primary.500` bg, white text. Inactive: `surface.sunken` bg, `text.secondary` text.

## Motion
- **Page transitions**: Slide from right (push), slide from bottom (modal). Duration 300ms, ease-out-quart.
- **List items**: Stagger fade-in, 50ms delay between items. Duration 200ms.
- **Tab switch**: No animation on the content, only the active indicator slides.
- **Algorithm steps**: No decorative animations. Bars swap positions directly. Highlight changes instant.
- **XP gain**: Brief scale pulse (1.0 → 1.05 → 1.0, 200ms) on the XP counter. No confetti, no particles.
- **No bounce, no elastic.** Ease-out curves only.

## Accessibility
- All text meets WCAG AA contrast on used backgrounds
- Touch targets minimum 44px
- Color is never the only differentiator (icons + labels always present)
- Category colors chosen to be distinguishable by color-blind users (rose, sky, emerald, violet, amber, orange are all distinct in hue)
