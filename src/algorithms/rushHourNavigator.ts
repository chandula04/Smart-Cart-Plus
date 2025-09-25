import { Position, NavigationPath, Aisle } from '@/types';

interface GraphNode {
  position: Position;
  aisle?: Aisle;
  connections: Map<string, number>; // nodeId -> distance
}

interface DijkstraResult {
  distances: Map<string, number>;
  previous: Map<string, string | null>;
  path: Position[];
}

/**
 * Enhanced Dijkstra's Algorithm with Rush Hour Navigation
 * Considers real-time congestion levels for optimal pathfinding
 * Time Complexity: O((V + E) log V) where V is vertices and E is edges
 * Space Complexity: O(V)
 */
export class RushHourNavigator {
  private graph: Map<string, GraphNode> = new Map();
  private congestionMultiplier: Map<string, number> = new Map();
  
  constructor() {
    this.initializeStoreLayout();
  }
  
  /**
   * Initialize the store layout graph
   */
  private initializeStoreLayout(): void {
    // Create a sample store layout (you can modify this based on actual store layout)
    const positions: Position[] = [
      { x: 0, y: 0 },   // Entrance
      { x: 1, y: 0 },   // Aisle 1
      { x: 2, y: 0 },   // Aisle 2
      { x: 3, y: 0 },   // Aisle 3
      { x: 0, y: 1 },   // Aisle 4
      { x: 1, y: 1 },   // Central area
      { x: 2, y: 1 },   // Central area
      { x: 3, y: 1 },   // Aisle 5
      { x: 0, y: 2 },   // Aisle 6
      { x: 1, y: 2 },   // Aisle 7
      { x: 2, y: 2 },   // Aisle 8
      { x: 3, y: 2 },   // Checkout
    ];
    
    // Add nodes to graph
    positions.forEach((pos, index) => {
      const nodeId = this.getNodeId(pos);
      this.graph.set(nodeId, {
        position: pos,
        connections: new Map()
      });
      this.congestionMultiplier.set(nodeId, 1.0); // Default multiplier
    });
    
    // Add connections (edges)
    this.addConnection({ x: 0, y: 0 }, { x: 1, y: 0 }, 10);
    this.addConnection({ x: 1, y: 0 }, { x: 2, y: 0 }, 10);
    this.addConnection({ x: 2, y: 0 }, { x: 3, y: 0 }, 10);
    this.addConnection({ x: 0, y: 0 }, { x: 0, y: 1 }, 15);
    this.addConnection({ x: 1, y: 0 }, { x: 1, y: 1 }, 15);
    this.addConnection({ x: 2, y: 0 }, { x: 2, y: 1 }, 15);
    this.addConnection({ x: 3, y: 0 }, { x: 3, y: 1 }, 15);
    this.addConnection({ x: 0, y: 1 }, { x: 1, y: 1 }, 10);
    this.addConnection({ x: 1, y: 1 }, { x: 2, y: 1 }, 10);
    this.addConnection({ x: 2, y: 1 }, { x: 3, y: 1 }, 10);
    this.addConnection({ x: 0, y: 1 }, { x: 0, y: 2 }, 15);
    this.addConnection({ x: 1, y: 1 }, { x: 1, y: 2 }, 15);
    this.addConnection({ x: 2, y: 1 }, { x: 2, y: 2 }, 15);
    this.addConnection({ x: 3, y: 1 }, { x: 3, y: 2 }, 15);
    this.addConnection({ x: 0, y: 2 }, { x: 1, y: 2 }, 10);
    this.addConnection({ x: 1, y: 2 }, { x: 2, y: 2 }, 10);
    this.addConnection({ x: 2, y: 2 }, { x: 3, y: 2 }, 10);
  }
  
  /**
   * Add bidirectional connection between two positions
   */
  private addConnection(pos1: Position, pos2: Position, distance: number): void {
    const id1 = this.getNodeId(pos1);
    const id2 = this.getNodeId(pos2);
    
    const node1 = this.graph.get(id1);
    const node2 = this.graph.get(id2);
    
    if (node1 && node2) {
      node1.connections.set(id2, distance);
      node2.connections.set(id1, distance);
    }
  }
  
  /**
   * Generate unique node ID from position
   */
  private getNodeId(position: Position): string {
    return `${position.x},${position.y}`;
  }
  
  /**
   * Update congestion levels in real-time
   * @param congestionData - Map of position to congestion level (1-10)
   */
  updateCongestion(congestionData: Map<Position, number>): void {
    congestionData.forEach((level, position) => {
      const nodeId = this.getNodeId(position);
      // Convert congestion level (1-10) to multiplier (1.0-3.0)
      const multiplier = 1.0 + (level - 1) * 0.25;
      this.congestionMultiplier.set(nodeId, multiplier);
    });
  }
  
  /**
   * Find the shortest path considering congestion
   * @param start - Starting position
   * @param end - Destination position
   * @returns Navigation path with details
   */
  findOptimalPath(start: Position, end: Position): NavigationPath {
    const startId = this.getNodeId(start);
    const endId = this.getNodeId(end);
    
    const result = this.dijkstra(startId, endId);
    
    if (!result.path.length) {
      return {
        path: [],
        totalDistance: Infinity,
        estimatedTime: Infinity,
        congestionLevel: 0
      };
    }
    
    const totalDistance = result.distances.get(endId) || 0;
    const avgCongestion = this.calculateAverageCongestion(result.path);
    const estimatedTime = totalDistance * avgCongestion / 60; // Assuming 60 units per minute base speed
    
    return {
      path: result.path,
      totalDistance,
      estimatedTime,
      congestionLevel: avgCongestion
    };
  }
  
  /**
   * Dijkstra's algorithm implementation with congestion consideration
   */
  private dijkstra(startId: string, endId: string): DijkstraResult {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();
    
    // Initialize distances
    for (const nodeId of this.graph.keys()) {
      distances.set(nodeId, Infinity);
      previous.set(nodeId, null);
      unvisited.add(nodeId);
    }
    distances.set(startId, 0);
    
    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentNode: string | null = null;
      let minDistance = Infinity;
      
      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId) || Infinity;
        if (distance < minDistance) {
          minDistance = distance;
          currentNode = nodeId;
        }
      }
      
      if (!currentNode || minDistance === Infinity) break;
      
      unvisited.delete(currentNode);
      
      if (currentNode === endId) break;
      
      const currentGraphNode = this.graph.get(currentNode);
      if (!currentGraphNode) continue;
      
      const currentDistance = distances.get(currentNode) || 0;
      const currentCongestion = this.congestionMultiplier.get(currentNode) || 1.0;
      
      // Check all neighbors
      for (const [neighborId, baseDistance] of currentGraphNode.connections) {
        if (!unvisited.has(neighborId)) continue;
        
        const neighborCongestion = this.congestionMultiplier.get(neighborId) || 1.0;
        const adjustedDistance = baseDistance * ((currentCongestion + neighborCongestion) / 2);
        const newDistance = currentDistance + adjustedDistance;
        
        if (newDistance < (distances.get(neighborId) || Infinity)) {
          distances.set(neighborId, newDistance);
          previous.set(neighborId, currentNode);
        }
      }
    }
    
    // Reconstruct path
    const path: Position[] = [];
    let current: string | null = endId;
    
    while (current !== null) {
      const node = this.graph.get(current);
      if (node) {
        path.unshift(node.position);
      }
      current = previous.get(current) || null;
    }
    
    return { distances, previous, path };
  }
  
  /**
   * Calculate average congestion level for a path
   */
  private calculateAverageCongestion(path: Position[]): number {
    if (path.length === 0) return 1.0;
    
    const totalCongestion = path.reduce((sum, pos) => {
      const nodeId = this.getNodeId(pos);
      return sum + (this.congestionMultiplier.get(nodeId) || 1.0);
    }, 0);
    
    return totalCongestion / path.length;
  }
  
  /**
   * Get alternative paths (top N paths)
   * @param start - Starting position
   * @param end - Destination position
   * @param numPaths - Number of alternative paths to return
   * @returns Array of navigation paths
   */
  getAlternativePaths(start: Position, end: Position, numPaths: number = 3): NavigationPath[] {
    const paths: NavigationPath[] = [];
    const originalCongestion = new Map(this.congestionMultiplier);
    
    // Generate multiple paths by temporarily increasing congestion on used paths
    for (let i = 0; i < numPaths; i++) {
      const path = this.findOptimalPath(start, end);
      if (path.path.length > 0) {
        paths.push(path);
        
        // Increase congestion on this path for next iteration
        path.path.forEach(pos => {
          const nodeId = this.getNodeId(pos);
          const current = this.congestionMultiplier.get(nodeId) || 1.0;
          this.congestionMultiplier.set(nodeId, current * 1.5);
        });
      }
    }
    
    // Restore original congestion levels
    this.congestionMultiplier = originalCongestion;
    
    return paths;
  }
}