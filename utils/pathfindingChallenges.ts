// Pathfinding Challenges with Constraints

import { PathfindingAlgorithmKey } from './algorithms/pathfinding';

export type ChallengeConstraint =
  | { type: 'max_nodes'; value: number }
  | { type: 'max_path_length'; value: number }
  | { type: 'required_algorithm'; value: PathfindingAlgorithmKey }
  | { type: 'min_efficiency'; value: number }; // % of optimal

export interface PathfindingChallenge {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  algorithmFocus: PathfindingAlgorithmKey;
  obstacles: { row: number; col: number }[];
  constraints: ChallengeConstraint[];
  optimalNodes: number; // Optimal number of nodes visited
  optimalPath: number; // Optimal path length
  xpReward: number;
  hints: string[];
}

export const pathfindingChallenges: PathfindingChallenge[] = [
  // BFS Challenges
  {
    id: 'bfs-1',
    name: 'The Shortest Route',
    description: 'Use BFS to find the shortest path. BFS guarantees the shortest path in unweighted graphs.',
    difficulty: 'easy',
    algorithmFocus: 'bfs',
    obstacles: [
      { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
      { row: 3, col: 4 }, { row: 4, col: 4 },
      { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 },
    ],
    constraints: [
      { type: 'required_algorithm', value: 'bfs' },
      { type: 'max_nodes', value: 50 },
    ],
    optimalNodes: 35,
    optimalPath: 18,
    xpReward: 30,
    hints: [
      'BFS explores nodes level by level, guaranteeing the shortest path.',
      'All edges have equal weight, making BFS ideal.',
    ],
  },
  {
    id: 'bfs-2',
    name: 'Queue Master',
    description: 'Navigate a complex maze using only BFS. Pay attention to how the queue processes nodes.',
    difficulty: 'medium',
    algorithmFocus: 'bfs',
    obstacles: [
      { row: 1, col: 2 }, { row: 2, col: 2 }, { row: 3, col: 2 },
      { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
      { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 },
      { row: 6, col: 7 }, { row: 7, col: 7 }, { row: 8, col: 7 },
      { row: 7, col: 2 }, { row: 7, col: 3 },
    ],
    constraints: [
      { type: 'required_algorithm', value: 'bfs' },
      { type: 'max_nodes', value: 45 },
    ],
    optimalNodes: 38,
    optimalPath: 18,
    xpReward: 45,
    hints: [
      'Watch how BFS expands in "waves" from the start.',
      'The queue ensures FIFO ordering of node exploration.',
    ],
  },
  {
    id: 'bfs-3',
    name: 'Level Order Expert',
    description: 'A challenging maze that tests your understanding of BFS level-by-level exploration.',
    difficulty: 'hard',
    algorithmFocus: 'bfs',
    obstacles: [
      { row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 },
      { row: 2, col: 4 }, { row: 2, col: 5 }, { row: 2, col: 6 },
      { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 5 }, { row: 4, col: 6 },
      { row: 5, col: 6 }, { row: 6, col: 6 },
      { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 7, col: 3 },
      { row: 8, col: 5 }, { row: 8, col: 6 },
    ],
    constraints: [
      { type: 'required_algorithm', value: 'bfs' },
      { type: 'max_nodes', value: 40 },
    ],
    optimalNodes: 32,
    optimalPath: 18,
    xpReward: 60,
    hints: [
      'This maze has multiple paths - BFS will find the shortest.',
      'Efficiency comes from BFS naturally avoiding dead ends early.',
    ],
  },

  // A* Challenges
  {
    id: 'astar-1',
    name: 'Heuristic Guided',
    description: 'Use A* to reach the target efficiently. The heuristic guides the search toward the goal.',
    difficulty: 'easy',
    algorithmFocus: 'astar',
    obstacles: [
      { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
      { row: 4, col: 5 }, { row: 5, col: 5 },
      { row: 7, col: 3 }, { row: 7, col: 4 },
    ],
    constraints: [
      { type: 'required_algorithm', value: 'astar' },
      { type: 'max_nodes', value: 30 },
    ],
    optimalNodes: 22,
    optimalPath: 18,
    xpReward: 35,
    hints: [
      'A* uses f(n) = g(n) + h(n) to prioritize promising nodes.',
      'The Manhattan distance heuristic points toward the goal.',
    ],
  },
  {
    id: 'astar-2',
    name: 'F-Cost Optimizer',
    description: 'Navigate with minimal exploration using A*\'s intelligent prioritization.',
    difficulty: 'medium',
    algorithmFocus: 'astar',
    obstacles: [
      { row: 1, col: 4 }, { row: 2, col: 4 }, { row: 3, col: 4 }, { row: 4, col: 4 },
      { row: 4, col: 5 }, { row: 4, col: 6 },
      { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 },
      { row: 7, col: 6 }, { row: 8, col: 6 },
      { row: 2, col: 7 }, { row: 3, col: 7 },
    ],
    constraints: [
      { type: 'required_algorithm', value: 'astar' },
      { type: 'max_nodes', value: 25 },
    ],
    optimalNodes: 20,
    optimalPath: 18,
    xpReward: 50,
    hints: [
      'A* will naturally avoid exploring areas away from the goal.',
      'Compare this to BFS - A* visits fewer nodes for the same path.',
    ],
  },
  {
    id: 'astar-3',
    name: 'Pathfinder Elite',
    description: 'A complex challenge requiring excellent heuristic navigation. Visit fewer than X nodes!',
    difficulty: 'hard',
    algorithmFocus: 'astar',
    obstacles: [
      { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 2, col: 3 },
      { row: 3, col: 5 }, { row: 3, col: 6 }, { row: 4, col: 6 },
      { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 6, col: 3 },
      { row: 6, col: 7 }, { row: 7, col: 7 }, { row: 8, col: 7 },
      { row: 7, col: 4 }, { row: 7, col: 5 },
      { row: 2, col: 8 }, { row: 3, col: 8 },
    ],
    constraints: [
      { type: 'required_algorithm', value: 'astar' },
      { type: 'max_nodes', value: 22 },
    ],
    optimalNodes: 18,
    optimalPath: 18,
    xpReward: 70,
    hints: [
      'A* shines when the heuristic accurately estimates the remaining distance.',
      'In this open maze, the heuristic can eliminate many unnecessary explorations.',
    ],
  },

  // Dijkstra Challenges
  {
    id: 'dijkstra-1',
    name: 'Distance Calculator',
    description: 'Use Dijkstra to find the optimal path. Learn how it calculates shortest distances.',
    difficulty: 'easy',
    algorithmFocus: 'dijkstra',
    obstacles: [
      { row: 2, col: 3 }, { row: 3, col: 3 }, { row: 4, col: 3 },
      { row: 5, col: 5 }, { row: 5, col: 6 },
      { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 },
    ],
    constraints: [
      { type: 'required_algorithm', value: 'dijkstra' },
      { type: 'max_nodes', value: 55 },
    ],
    optimalNodes: 45,
    optimalPath: 18,
    xpReward: 35,
    hints: [
      'Dijkstra explores nodes in order of their distance from the start.',
      'It guarantees the shortest path even for weighted graphs.',
    ],
  },
  {
    id: 'dijkstra-2',
    name: 'Priority Queue Pro',
    description: 'Navigate using Dijkstra\'s priority queue. Understanding this is key to graph algorithms!',
    difficulty: 'medium',
    algorithmFocus: 'dijkstra',
    obstacles: [
      { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 },
      { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 3, col: 6 },
      { row: 5, col: 1 }, { row: 5, col: 2 },
      { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 },
      { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 8, col: 5 },
    ],
    constraints: [
      { type: 'required_algorithm', value: 'dijkstra' },
      { type: 'max_nodes', value: 50 },
    ],
    optimalNodes: 40,
    optimalPath: 18,
    xpReward: 50,
    hints: [
      'The priority queue always gives us the unvisited node with smallest distance.',
      'This greedy approach guarantees optimality for shortest paths.',
    ],
  },
  {
    id: 'dijkstra-3',
    name: 'Weighted Champion',
    description: 'Master Dijkstra in a complex environment. This is the foundation for many graph algorithms.',
    difficulty: 'hard',
    algorithmFocus: 'dijkstra',
    obstacles: [
      { row: 1, col: 2 }, { row: 2, col: 2 }, { row: 2, col: 5 }, { row: 2, col: 6 },
      { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 },
      { row: 4, col: 6 }, { row: 4, col: 7 }, { row: 4, col: 8 },
      { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
      { row: 8, col: 2 }, { row: 8, col: 3 }, { row: 8, col: 6 }, { row: 8, col: 7 },
    ],
    constraints: [
      { type: 'required_algorithm', value: 'dijkstra' },
      { type: 'max_nodes', value: 45 },
    ],
    optimalNodes: 35,
    optimalPath: 18,
    xpReward: 65,
    hints: [
      'Dijkstra is methodical but thorough - it won\'t miss the shortest path.',
      'Compare with A* - Dijkstra explores more but doesn\'t need a heuristic.',
    ],
  },

  // Mixed Algorithm Challenges
  {
    id: 'mixed-1',
    name: 'Algorithm Showdown',
    description: 'Any algorithm works here! Compare different approaches and see which is most efficient.',
    difficulty: 'medium',
    algorithmFocus: 'astar',
    obstacles: [
      { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
      { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 },
      { row: 6, col: 2 }, { row: 6, col: 3 },
      { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 6, col: 8 },
      { row: 8, col: 4 }, { row: 8, col: 5 },
    ],
    constraints: [
      { type: 'max_nodes', value: 35 },
      { type: 'max_path_length', value: 20 },
    ],
    optimalNodes: 25,
    optimalPath: 18,
    xpReward: 55,
    hints: [
      'Try different algorithms and see how they perform.',
      'A* is often most efficient, but BFS guarantees shortest path.',
    ],
  },
  {
    id: 'mixed-2',
    name: 'Ultimate Challenge',
    description: 'The final test! Find the path with maximum efficiency in this complex maze.',
    difficulty: 'hard',
    algorithmFocus: 'astar',
    obstacles: [
      { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 2, col: 4 },
      { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 6 }, { row: 3, col: 7 },
      { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 },
      { row: 6, col: 7 }, { row: 6, col: 8 },
      { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 5 },
      { row: 8, col: 5 }, { row: 9, col: 5 },
    ],
    constraints: [
      { type: 'max_nodes', value: 28 },
      { type: 'max_path_length', value: 19 },
    ],
    optimalNodes: 22,
    optimalPath: 18,
    xpReward: 80,
    hints: [
      'This challenge requires both finding the shortest path AND exploring efficiently.',
      'A* with a good heuristic is your best bet.',
    ],
  },
];

// Get challenges by algorithm
export function getChallengesByAlgorithm(algorithm: PathfindingAlgorithmKey): PathfindingChallenge[] {
  return pathfindingChallenges.filter(c => c.algorithmFocus === algorithm);
}

// Get all challenges
export function getAllChallenges(): PathfindingChallenge[] {
  return pathfindingChallenges;
}

// Check if challenge constraints are met
export function checkChallengeConstraints(
  challenge: PathfindingChallenge,
  algorithmUsed: PathfindingAlgorithmKey,
  nodesVisited: number,
  pathLength: number
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];

  for (const constraint of challenge.constraints) {
    switch (constraint.type) {
      case 'max_nodes':
        if (nodesVisited > constraint.value) {
          failures.push(`Visited ${nodesVisited} nodes (max: ${constraint.value})`);
        }
        break;
      case 'max_path_length':
        if (pathLength > constraint.value) {
          failures.push(`Path length ${pathLength} (max: ${constraint.value})`);
        }
        break;
      case 'required_algorithm':
        if (algorithmUsed !== constraint.value) {
          failures.push(`Must use ${constraint.value.toUpperCase()} algorithm`);
        }
        break;
      case 'min_efficiency':
        const efficiency = (challenge.optimalNodes / nodesVisited) * 100;
        if (efficiency < constraint.value) {
          failures.push(`Efficiency ${efficiency.toFixed(0)}% (min: ${constraint.value}%)`);
        }
        break;
    }
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

// Calculate stars earned (1-3 stars based on performance)
export function calculateChallengeStars(
  challenge: PathfindingChallenge,
  nodesVisited: number,
  pathLength: number
): number {
  let stars = 0;

  // 1 star for completing
  stars = 1;

  // 2 stars for optimal path length
  if (pathLength <= challenge.optimalPath) {
    stars = 2;
  }

  // 3 stars for near-optimal node visits AND optimal path
  if (pathLength <= challenge.optimalPath && nodesVisited <= challenge.optimalNodes * 1.2) {
    stars = 3;
  }

  return stars;
}
