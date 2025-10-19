import { Product, Recommendation } from '@/types';

interface ProductNode {
  product: Product;
  connections: Set<string>; // Connected product IDs
  visited: boolean;
}

/**
 * Product Recommendation System using Breadth-First Search (BFS)
 * Finds "frequently bought together" recommendations
 * Time Complexity: O(V + E) where V is products and E is connections
 * Space Complexity: O(V)
 */
export class ProductRecommendationSystem {
  private productGraph: Map<string, ProductNode> = new Map();
  private purchaseHistory: Map<string, Set<string>> = new Map(); // userId -> productIds
  
  constructor() {
    this.initializeSampleData();
  }
  
  /**
   * Add a product to the recommendation system
   * @param product - Product to add
   */
  addProduct(product: Product): void {
    if (!this.productGraph.has(product.id)) {
      this.productGraph.set(product.id, {
        product,
        connections: new Set(),
        visited: false
      });
    }
  }
  
  /**
   * Record a purchase to build product relationships
   * @param userId - User ID
   * @param productIds - Array of product IDs purchased together
   */
  recordPurchase(userId: string, productIds: string[]): void {
    // Update purchase history
    if (!this.purchaseHistory.has(userId)) {
      this.purchaseHistory.set(userId, new Set());
    }
    
    const userHistory = this.purchaseHistory.get(userId)!;
    productIds.forEach(id => userHistory.add(id));
    
    // Create connections between products bought together
    for (let i = 0; i < productIds.length; i++) {
      for (let j = i + 1; j < productIds.length; j++) {
        this.addConnection(productIds[i], productIds[j]);
      }
    }
  }
  
  /**
   * Add bidirectional connection between two products
   * @param productId1 - First product ID
   * @param productId2 - Second product ID
   */
  private addConnection(productId1: string, productId2: string): void {
    const node1 = this.productGraph.get(productId1);
    const node2 = this.productGraph.get(productId2);
    
    if (node1 && node2) {
      node1.connections.add(productId2);
      node2.connections.add(productId1);
    }
  }
  
  /**
   * Get recommendations for a product using BFS
   * @param productId - Product ID to get recommendations for
   * @param maxRecommendations - Maximum number of recommendations
   * @returns Array of recommended products
   */
  getRecommendations(productId: string, maxRecommendations: number = 5): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const startNode = this.productGraph.get(productId);
    
    if (!startNode) return recommendations;
    
    // Reset visited flags
    this.productGraph.forEach(node => node.visited = false);
    
    // BFS to find related products
    const queue: Array<{productId: string, distance: number}> = [];
    const visited = new Set<string>();
    
    queue.push({ productId, distance: 0 });
    visited.add(productId);
    startNode.visited = true;
    
    while (queue.length > 0 && recommendations.length < maxRecommendations) {
      const current = queue.shift()!;
      const currentNode = this.productGraph.get(current.productId);
      
      if (!currentNode) continue;
      
      // Add connected products to recommendations (except the starting product)
      if (current.distance > 0) {
        const confidence = this.calculateConfidence(productId, current.productId, current.distance);
        recommendations.push({
          product: currentNode.product,
          reason: this.generateReason(current.distance, confidence),
          confidence
        });
      }
      
      // Add unvisited neighbors to queue
      currentNode.connections.forEach(connectedId => {
        if (!visited.has(connectedId) && recommendations.length < maxRecommendations) {
          const connectedNode = this.productGraph.get(connectedId);
          if (connectedNode) {
            visited.add(connectedId);
            connectedNode.visited = true;
            queue.push({ 
              productId: connectedId, 
              distance: current.distance + 1 
            });
          }
        }
      });
    }
    
    // Sort by confidence (highest first)
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Get recommendations based on multiple products (cart-based recommendations)
   * @param productIds - Array of product IDs in cart
   * @param maxRecommendations - Maximum number of recommendations
   * @returns Array of recommended products
   */
  getCartBasedRecommendations(productIds: string[], maxRecommendations: number = 5): Recommendation[] {
    const allRecommendations = new Map<string, { 
      product: Product, 
      totalConfidence: number, 
      reasons: string[] 
    }>();
    
    // Get recommendations for each product in cart
    productIds.forEach(productId => {
      const recommendations = this.getRecommendations(productId, maxRecommendations * 2);
      
      recommendations.forEach(rec => {
        if (productIds.indexOf(rec.product.id) === -1) { // Don't recommend products already in cart
          const existing = allRecommendations.get(rec.product.id);
          if (existing) {
            existing.totalConfidence += rec.confidence;
            existing.reasons.push(rec.reason);
          } else {
            allRecommendations.set(rec.product.id, {
              product: rec.product,
              totalConfidence: rec.confidence,
              reasons: [rec.reason]
            });
          }
        }
      });
    });
    
    // Convert to final recommendations
    const finalRecommendations: Recommendation[] = [];
    allRecommendations.forEach(data => {
      finalRecommendations.push({
        product: data.product,
        reason: `Frequently bought with items in your cart (${data.reasons.length} connections)`,
        confidence: Math.min(data.totalConfidence / productIds.length, 1.0) // Normalize confidence
      });
    });
    
    return finalRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxRecommendations);
  }
  
  /**
   * Get trending products based on recent purchase patterns
   * @param maxResults - Maximum number of trending products
   * @returns Array of trending product recommendations
   */
  getTrendingProducts(maxResults: number = 10): Recommendation[] {
    const productFrequency = new Map<string, number>();
    
    // Count product frequency in recent purchases
    this.purchaseHistory.forEach(productSet => {
      productSet.forEach(productId => {
        const count = productFrequency.get(productId) || 0;
        productFrequency.set(productId, count + 1);
      });
    });
    
    // Convert to recommendations
    const trending: Recommendation[] = [];
    productFrequency.forEach((frequency, productId) => {
      const productNode = this.productGraph.get(productId);
      if (productNode) {
        const confidence = Math.min(frequency / this.purchaseHistory.size, 1.0);
        trending.push({
          product: productNode.product,
          reason: `Popular choice - ${frequency} recent purchases`,
          confidence
        });
      }
    });
    
    return trending
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxResults);
  }
  
  /**
   * Calculate confidence score for a recommendation
   * @param sourceProductId - Source product ID
   * @param targetProductId - Target product ID  
   * @param distance - Graph distance between products
   * @returns Confidence score (0-1)
   */
  private calculateConfidence(sourceProductId: string, targetProductId: string, distance: number): number {
    // Base confidence decreases with distance
    let confidence = Math.max(0.1, 1.0 - (distance - 1) * 0.3);
    
    // Boost confidence if products are in same category
    const sourceNode = this.productGraph.get(sourceProductId);
    const targetNode = this.productGraph.get(targetProductId);
    
    if (sourceNode && targetNode) {
      if (sourceNode.product.category === targetNode.product.category) {
        confidence *= 1.2;
      }
      
      // Boost if frequently bought together
      const coOccurrence = this.calculateCoOccurrence(sourceProductId, targetProductId);
      confidence *= (1.0 + coOccurrence);
    }
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Calculate co-occurrence frequency of two products
   * @param productId1 - First product ID
   * @param productId2 - Second product ID
   * @returns Co-occurrence ratio (0-1)
   */
  private calculateCoOccurrence(productId1: string, productId2: string): number {
    let coOccurrences = 0;
    let totalOccurrences = 0;
    
    this.purchaseHistory.forEach(productSet => {
      if (productSet.has(productId1)) {
        totalOccurrences++;
        if (productSet.has(productId2)) {
          coOccurrences++;
        }
      }
    });
    
    return totalOccurrences > 0 ? coOccurrences / totalOccurrences : 0;
  }
  
  /**
   * Generate reason text for recommendation
   * @param distance - Graph distance
   * @param confidence - Confidence score
   * @returns Reason string
   */
  private generateReason(distance: number, confidence: number): string {
    if (distance === 1) {
      return confidence > 0.7 ? 'Frequently bought together' : 'Often bought together';
    } else if (distance === 2) {
      return 'Customers who bought this also considered';
    } else {
      return 'Related product you might like';
    }
  }
  
  /**
   * Initialize sample data for demonstration
   */
  private initializeSampleData(): void {
    // Sample products
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Milk',
        price: 3.99,
        category: 'Dairy',
        section: 'Dairy & Eggs',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        inStock: true,
        quantity: 100
      },
      {
        id: '2', 
        name: 'Bread',
        price: 2.49,
        category: 'Bakery',
        section: 'Bakery',
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        inStock: true,
        quantity: 50
      },
      {
        id: '3',
        name: 'Butter',
        price: 4.99,
        category: 'Dairy', 
        section: 'Dairy & Eggs',
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        inStock: true,
        quantity: 30
      },
      {
        id: '4',
        name: 'Eggs',
        price: 3.49,
        category: 'Dairy',
        section: 'Dairy & Eggs',
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        inStock: true,
        quantity: 75
      }
    ];
    
    // Add sample products
    sampleProducts.forEach(product => this.addProduct(product));
    
    // Sample purchase history
    this.recordPurchase('user1', ['1', '2']); // Milk & Bread
    this.recordPurchase('user2', ['1', '3']); // Milk & Butter
    this.recordPurchase('user3', ['2', '3']); // Bread & Butter
    this.recordPurchase('user4', ['1', '2', '4']); // Milk, Bread & Eggs
    this.recordPurchase('user5', ['1', '4']); // Milk & Eggs
  }
}