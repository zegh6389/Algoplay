# Algoplay Lesson System — Design & Architecture Spec

## Navigation Architecture: Hub-and-Spoke (Duolingo pattern)

### Bottom Nav (3 tabs)
| Tab | Icon | Purpose |
|-----|------|---------|
| **Lessons** | `menu_book` | Structured learning path — 12 lessons with sub-modules |
| **Explore** | `explore` | Interactive algorithm browser (existing visualizer) |
| **Games** | `sports_esports` | Battle Arena, Race Mode, Grid Escape, The Sorter |

Home screen is REMOVED as a separate tab. Instead, the Lessons tab IS the home screen — shows progress hero + lesson list.

### Hub-and-Spoke Rule
- **Hub**: Tab screens show content overview
- **Spoke**: Entering a lesson → full-screen immersive mode. Bottom nav hides. Only back arrow + progress bar visible.
- Exiting a lesson returns to the lesson list (hub)

---

## Lesson Curriculum

### 12 Lessons (chronological, sequential unlock)

| # | Lesson | Sub-modules (TBD) | Category Color |
|---|--------|-------------------|----------------|
| 1 | Introduction | 2+ modules provided | `primary.500` blue |
| 2 | Algorithm Analysis | TBD | `cat.sorting` rose |
| 3 | Recurrence Relations | TBD | `cat.dp` violet |
| 4 | Brute Force Algorithms | TBD | `cat.searching` sky |
| 5 | DFS and BFS | TBD | `cat.graphs` emerald |
| 6 | Decrease and Conquer | TBD | `cat.searching` sky |
| 7 | Divide and Conquer | TBD | `cat.sorting` rose |
| 8 | Transform and Conquer Pt.1 | TBD | `cat.trees` orange |
| 9 | Transform and Conquer Pt.2 | TBD | `cat.trees` orange |
| 10 | Dynamic Programming | TBD | `cat.dp` violet |
| 11 | Greedy Algorithms | TBD | `cat.greedy` amber |
| 12 | Advanced Topics | TBD | `cat.graphs` emerald |

### Unlock Logic
- Lesson 1: always unlocked
- Lesson N: unlocks when ALL sub-modules of Lesson N-1 are completed
- Exception: user can RE-READ any completed lesson anytime

---

## Progress System (Dual-Layer)

### Layer 1: Macro — Lesson Card Progress Bar
- Each lesson card shows: `completedModules / totalModules` as a progress bar
- Visual states:
  - **Locked**: gray bar, lock icon, lesson number dimmed
  - **Not started**: empty bar (0%), white background
  - **In progress**: `primary.500` blue fill, percentage shown (e.g. "3/10")
  - **Completed**: `success.600` green fill, checkmark badge

### Layer 2: Micro — In-Lesson Step Indicator
- Segmented progress bar at top of lesson screen
- Each segment = one sub-module
- Completed: filled `primary.500`, Current: pulsing dot, Future: gray
- Shows "Module 3 of 10" text

### Persistence
- `algoplay_lesson_N_progress`: JSON list of completed module IDs
- `algoplay_lesson_N_scroll`: saved scroll position (int)
- `algoplay_lesson_N_current_module`: last viewed module ID
- All in SharedPreferences

---

## Visualizer Integration (App Bar Button)

### When the button appears
- On EVERY sub-module content screen, a `✨ Visualize` button appears in the app bar
- The button is contextual — it knows which algorithm(s) are relevant to the current module
- Example: Reading about Bubble Sort → button launches Bubble Sort visualizer

### State Preservation Logic
When user taps "Visualize" mid-lesson:
1. Save current state to SharedPreferences:
   - `currentModuleId`
   - `scrollPosition` (pixels)
   - `readingProgress` (how far they've scrolled as %)
2. Launch visualizer as a full-screen push (GoRouter)
3. When user presses back from visualizer:
   - Read saved state
   - Restore scroll position with `ScrollController.jumpTo()`
   - Show brief "Welcome back!" toast
   - Resume exactly where they left off

### Visualizer Behaviors (Smart Features)
| Feature | How |
|---------|-----|
| **Step-through** | User taps "Next Step" to advance algorithm one step at a time |
| **Speed control** | Slider: 0.5x, 1x, 2x, 3x — controls auto-play speed |
| **Pause/Resume** | Toggle auto-play on/off |
| **Input customization** | User can input their own array to sort/search |
| **State history** | Back button goes to previous algorithm state |
| **Code sync** | Shows the code line being executed alongside visualization |
| **Comparison mode** | Side-by-side two algorithms (future) |

---

## Content Tone — "Chaotic Professor" Voice

### Voice Guide
- Like a brilliant but slightly unhinged professor who makes Big O memes
- Encouraging but with dry humor
- Uses metaphors from everyday life (cooking, sports, dating)
- Celebrates small wins with exaggerated enthusiasm
- Never condescending, never dry

### UI Copy Examples

| Context | Copy |
|---------|------|
| Progress 0% | "Haven't started yet? The algorithm judges silently." |
| Progress 50% | "Halfway there! Your brain is doing great things." |
| Lesson complete | "Nailed it. Even Dijkstra would nod approvingly." |
| Visualizer button | "See the Magic ✨" |
| Wrong quiz answer | "Not quite, but respect for trying. Here's what happened..." |
| Streak day 1 | "Day one! Every algorithm master started exactly here." |
| Streak day 7 | "A full week! Your neurons are literally rewiring. Science." |
| Streak day 30 | "30 days. You're not stopping. That's terrifying. Keep going." |
| Empty leaderboard | "No competition yet. Be the first to set the bar." |
| Unlock new lesson | "New territory unlocked. Prepare your brain cells." |
| Module complete | "+15 XP. You're basically a computer scientist now." |

### Content Writing Rules
1. Open with a hook — a question, a joke, or a surprising fact
2. Use "we" not "you" — "Let's figure this out" not "You should learn this"
3. Every module ends with a "Key Takeaway" box
4. Code examples use comments like `// <-- the magic happens here`
5. Definitions get highlighted cards with a lightbulb icon

---

## Home Screen (Lessons Tab)

### Layout (top to bottom)
1. **Hero Section** — Overall progress card
   - XP counter with level badge
   - Streak flame with day count
   - Circular progress ring: "Lesson 3 of 12 — 18% overall"
   - "Continue Learning" button → jumps to current incomplete module

2. **Daily Challenge Card** — One algorithm challenge per day
   - "Today's Challenge: Sort this array using Merge Sort"
   - Timer, XP reward shown

3. **Lesson List** — Vertical scroll of 12 lesson cards
   - Each card: lesson number, title, category color dot, progress bar, module count
   - Locked lessons: dimmed with lock icon
   - Completed lessons: green checkmark, can re-read

---

## Screen Flow

```
Lessons Tab (Home)
├── Hero: "Continue Learning" → Sub-module Content Screen
├── Lesson Card tap → Lesson Detail Screen
│   ├── Module list with checkmarks
│   ├── Module tap → Module Content Screen (immersive)
│   │   ├── AppBar: back arrow + "✨ Visualize" button
│   │   ├── Content: text, code blocks, diagrams
│   │   ├── Interactive quiz (some modules)
│   │   ├── Module complete → +XP animation
│   │   └── Auto-advance to next module or lesson summary
│   └── Progress bar: X/Y modules completed
└── Daily Challenge → Game screen

Explore Tab
├── Algorithm categories (grid)
├── Category tap → Algorithm list
└── Algorithm tap → Visualizer (existing)

Games Tab
├── Game cards (Battle Arena, Race Mode, Grid Escape, The Sorter)
└── Game tap → Game screen (existing)
```

---

## Lesson 1 Content (Rewritten with Humor)

### Module 1: "So... What's an Algorithm?"

Let's talk about chocolate cake. You want one. You need one. But you can't just yell "CAKE!" into the void and expect results. You need ingredients and a plan: crack eggs, melt chocolate, mix, pour, bake at 180°C for 25 minutes.

That plan? That's an algorithm.

**Definition:** An algorithm is a finite sequence of well-defined instructions to accomplish a specific task.

Think of it this way: every recipe is an algorithm. Every set of directions from Google Maps is an algorithm. Even your morning routine (wake up → groan → coffee → function) is technically an algorithm.

But here's where it gets interesting. Not all chocolate cakes are created equal. Some taste like heaven. Some taste like cardboard with frosting. Some take 20 minutes, some take 4 hours and three sinks full of dishes.

Same goes for algorithms. There's usually more than one way to solve a problem, and some solutions are just... better. Faster. More elegant. Cheaper to run.

**Key Takeaway:** An algorithm is just a recipe for a computer. But unlike cooking, we can precisely measure which recipe is better using math. That's what this whole course is about.

---

### Module 2: "Formally Speaking..."

We threw the word "algorithm" around casually, but computer scientists have a strict definition:

**Definition 1:** An algorithm is a series of instructions designed to accomplish a specific task.

Sounds simple, right? But buried in that definition are five crucial properties every algorithm must have:

1. **Input** — Zero or more inputs. (A recipe needs ingredients.)
2. **Output** — At least one output. (No point baking if there's no cake.)
3. **Definiteness** — Each step is crystal clear. No "add some salt" vagueness.
4. **Finiteness** — It actually stops. An infinite loop is a bug, not an algorithm.
5. **Effectiveness** — Every step is doable. "Teleport the cake into the oven" doesn't count.

Violate any of these, and you don't have an algorithm. You have a wish.

**Fun fact:** The word "algorithm" comes from Muhammad ibn Musa al-Khwarizmi, a 9th-century Persian mathematician. His name was Latinized to "Algoritmi." So every time you sort an array, you're honoring a mathematician from Baghdad. Respect.

**Key Takeaway:** An algorithm must be definite, finite, effective, and produce output from input. If your "algorithm" runs forever, it's not an algorithm — it's a screensaver.

---

## Implementation Files Needed

### Data Layer
- `lib/features/learn/data/lesson_data.dart` — 12 lessons with module references
- `lib/features/learn/data/module_content.dart` — Module content model (text, code, quiz)
- `lib/features/learn/data/lesson_progress_repository.dart` — SharedPreferences-backed progress

### Presentation Layer
- `lib/features/learn/presentation/lessons_home_page.dart` — Hero + lesson list
- `lib/features/learn/presentation/lesson_detail_page.dart` — Module list for one lesson
- `lib/features/learn/presentation/module_content_page.dart` — Immersive content reader
- `lib/features/learn/presentation/widgets/lesson_card.dart` — Progress card component
- `lib/features/learn/presentation/widgets/module_progress_bar.dart` — Segmented bar
- `lib/features/learn/presentation/widgets/content_block.dart` — Text/code/quiz block renderer

### Router Updates
- Tab 1 → LessonsHomePage (replaces HomePage)
- Add routes: `/lesson/{id}`, `/lesson/{id}/module/{moduleId}`
- Visualizer route stays: `/visualizer/{algorithmId}`

### State Preservation
- `lib/features/learn/data/lesson_state_service.dart` — Save/restore scroll + module state
