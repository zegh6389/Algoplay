# Algoplay Flutter — Visualization Upgrade Plan

## Overview
Bring the Flutter app to parity with (and beyond) the React legacy app's visualization quality.  
Priority: animated bars → custom input → code hub → tree upgrade → search upgrade → effects.

---

## Phase 1: Core Visualization Engine
### Task 1.1: Animated Sorting Bars (`lib/features/visualizer/widgets/animated_sort_bar.dart`)
- [ ] CustomPainter-based bar chart with spring-like animation
- [ ] State colors: default(accent teal), comparing(yellow #e5c07b), swapping(cyan #56b6c2), sorted(green #98c379), pivot(purple)
- [ ] Bar scale bounce on compare/swap (1.0→1.08→1.0)
- [ ] Glow/shadow matching state color (shadowRadius: 8)
- [ ] Bar value labels when width permits
- [ ] Pass-complete celebration (scale 1.0→1.1→1.0 ripple)

### Task 1.2: Custom Array Input Sheet (`lib/features/visualizer/widgets/array_input_sheet.dart`)
- [ ] Bottom sheet with 2 tabs: Manual / Random
- [ ] Manual: comma-separated text field with live validation + live bar preview
- [ ] Random: slider for size (5-50) + generate button
- [ ] Shake animation on invalid input
- [ ] Target input field for search algorithms
- [ ] Confirm button returns array to visualizer

### Task 1.3: Speed Controller Upgrade (`lib/features/visualizer/widgets/speed_controller.dart`)
- [ ] 4 preset modes: Turtle (1.5s), Normal (0.5s), Fast (0.1s), Manual (step)
- [ ] Play/Pause with animated icon
- [ ] Step Forward / Step Backward / Reset buttons
- [ ] Speed indicator text

---

## Phase 2: Code Hub
### Task 2.1: Code Viewer Widget (`lib/features/visualizer/widgets/code_viewer.dart`)
- [ ] Add `flutter_highlight` package
- [ ] 3 language tabs: Python / Java / C++ with animated tab switch
- [ ] One Dark Pro theme syntax highlighting
- [ ] Line numbers (3-digit padded)
- [ ] Copy button with success state
- [ ] Complexity badges (Time: O(n²) / Space: O(1))
- [ ] Current algorithm step line highlighting

### Task 2.2: Code Implementations Data (`lib/algorithms/code_implementations.dart`)
- [ ] Python, Java, C++ implementations for all 6 sorting algorithms
- [ ] Python, Java, C++ implementations for both search algorithms
- [ ] Metadata: time complexity, space complexity, description
- [ ] Port from React app's `codeImplementations.ts`

---

## Phase 3: Visualizer Page Refactor
### Task 3.1: Sorting Visualizer Page (`lib/features/visualizer/presentation/sorting_visualizer_page.dart`)
- [ ] Split monolithic page into: AppBar + BarChart + Controls + CodePanel
- [ ] Integrate AnimatedSortBar widget
- [ ] Integrate ArrayInputSheet (button in appbar)
- [ ] Integrate CodeViewer (expandable bottom panel)
- [ ] Integrate SpeedController
- [ ] Stats bar: comparisons, swaps, array accesses, step X/N

### Task 3.2: Search Visualizer Page
- [ ] Card-based array display (not bars)
- [ ] Spotlight ring animation on current element
- [ ] Cascade elimination wave (staggered fade)
- [ ] Range bracket showing L/R bounds
- [ ] Target badge display
- [ ] Color legend

### Task 3.3: Pathfinding Visualizer Page
- [ ] Grid cell animations (pulse glow on frontier)
- [ ] Path trace animation (gold line drawing)
- [ ] F-cost display on visited cells
- [ ] Interactive obstacle placement (tap)
- [ ] Legend + stats panel

### Task 3.4: Tree Visualizer Page
- [ ] CustomPainter edge rendering with glow
- [ ] Animated node positions (spring-like)
- [ ] Node highlight states: inserting(lime), current(yellow), comparing(pink), path(cyan), visited(blue), rotating(purple)
- [ ] Shockwave pulse on visited nodes
- [ ] Pinch-to-zoom + pan gesture
- [ ] Auto-center / fit-to-view

---

## Phase 4: Effects & Polish
### Task 4.1: Sound & Haptics
- [ ] Add `audioplayers` package
- [ ] Sound effects: compare tick, swap swoosh, sorted ding, complete fanfare
- [ ] HapticFeedback on interactions

### Task 4.2: Particle Effects
- [ ] Add `confetti` package
- [ ] Victory confetti on algorithm completion
- [ ] Particle burst on special events

### Task 4.3: Stats Terminal Widget
- [ ] Terminal-style live counters
- [ ] Blinking cursor
- [ ] Log lines with > prefix

---

## Dependencies to Add
```yaml
flutter_highlight: ^0.7.0   # syntax highlighting
audioplayers: ^6.1.0        # sound effects
confetti: ^0.8.0            # celebration effects
graphview: ^1.2.0           # tree/graph layouts (optional, for future)
```

## Execution Order
1. Task 1.1 → 1.2 → 1.3 (core visualization widgets)
2. Task 2.1 → 2.2 (code hub)
3. Task 3.1 → 3.2 → 3.3 → 3.4 (page refactors)
4. Task 4.1 → 4.2 → 4.3 (polish)

Each task = one commit + CI build + test on device.
