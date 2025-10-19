import { Product, ExpiryAlert } from '@/types';

interface HeapNode {
  product: Product;
  priority: number; // Days until expiry (lower = higher priority)
}

/**
 * Smart Expiry Alert System using Min-Heap
 * Efficiently manages products by expiry date priority
 * Time Complexity: Insert O(log n), Extract Min O(log n), Peek O(1)
 * Space Complexity: O(n)
 */
export class SmartExpiryAlert {
  private heap: HeapNode[] = [];
  private size: number = 0;
  
  constructor() {
    this.heap = [];
  }
  
  /**
   * Add a product to the expiry monitoring system
   * @param product - Product to monitor
   */
  addProduct(product: Product): void {
    // If no expiryDate, treat as very low priority (far in future)
    const daysUntilExpiry = product.expiryDate 
      ? this.calculateDaysUntilExpiry(product.expiryDate)
      : Number.MAX_SAFE_INTEGER;
    const node: HeapNode = {
      product,
      priority: daysUntilExpiry
    };
    
    this.heap.push(node);
    this.size++;
    this.heapifyUp(this.size - 1);
  }
  
  /**
   * Get the product with the nearest expiry date
   * @returns ExpiryAlert for the most urgent product
   */
  getNextExpiringProduct(): ExpiryAlert | null {
    if (this.size === 0) return null;
    
    const node = this.heap[0];
    return {
      product: node.product,
      daysUntilExpiry: node.priority,
      priority: this.calculatePriorityLevel(node.priority)
    };
  }
  
  /**
   * Remove and return the product with the nearest expiry date
   * @returns ExpiryAlert for the most urgent product
   */
  extractNextExpiringProduct(): ExpiryAlert | null {
    if (this.size === 0) return null;
    
    const node = this.heap[0];
    const result: ExpiryAlert = {
      product: node.product,
      daysUntilExpiry: node.priority,
      priority: this.calculatePriorityLevel(node.priority)
    };
    
    // Replace root with last element and heapify down
    this.heap[0] = this.heap[this.size - 1];
    this.size--;
    this.heap.pop();
    
    if (this.size > 0) {
      this.heapifyDown(0);
    }
    
    return result;
  }
  
  /**
   * Get top N products closest to expiry
   * @param n - Number of products to return
   * @returns Array of ExpiryAlerts
   */
  getTopExpiringProducts(n: number = 10): ExpiryAlert[] {
    const results: ExpiryAlert[] = [];
    const tempHeap = [...this.heap];
    const tempSize = this.size;
    
    // Extract top N products
    for (let i = 0; i < Math.min(n, this.size); i++) {
      const alert = this.extractNextExpiringProduct();
      if (alert) {
        results.push(alert);
      }
    }
    
    // Restore heap
    this.heap = tempHeap;
    this.size = tempSize;
    
    return results;
  }
  
  /**
   * Update product expiry date
   * @param productId - ID of product to update
   * @param newExpiryDate - New expiry date
   */
  updateProductExpiry(productId: string, newExpiryDate: Date): void {
    // Find and update the product
    for (let i = 0; i < this.size; i++) {
      if (this.heap[i].product.id === productId) {
        this.heap[i].product.expiryDate = newExpiryDate;
        this.heap[i].priority = this.calculateDaysUntilExpiry(newExpiryDate);
        
        // Re-heapify
        this.heapifyUp(i);
        this.heapifyDown(i);
        break;
      }
    }
  }
  
  /**
   * Remove a product from monitoring
   * @param productId - ID of product to remove
   */
  removeProduct(productId: string): void {
    const index = this.heap.findIndex(node => node.product.id === productId);
    if (index === -1) return;
    
    // Replace with last element
    this.heap[index] = this.heap[this.size - 1];
    this.size--;
    this.heap.pop();
    
    // Re-heapify if not the last element
    if (index < this.size) {
      this.heapifyUp(index);
      this.heapifyDown(index);
    }
  }
  
  /**
   * Get all products expiring within specified days
   * @param days - Number of days threshold
   * @returns Array of ExpiryAlerts
   */
  getProductsExpiringWithin(days: number): ExpiryAlert[] {
    const results: ExpiryAlert[] = [];
    
    for (let i = 0; i < this.size; i++) {
      const node = this.heap[i];
      if (node.priority <= days) {
        results.push({
          product: node.product,
          daysUntilExpiry: node.priority,
          priority: this.calculatePriorityLevel(node.priority)
        });
      }
    }
    
    // Sort by priority (most urgent first)
    return results.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }
  
  /**
   * Get total count of products being monitored
   * @returns Number of products in the system
   */
  getProductCount(): number {
    return this.size;
  }
  
  /**
   * Clear all products from monitoring
   */
  clear(): void {
    this.heap = [];
    this.size = 0;
  }
  
  /**
   * Heapify up (bubble up)
   * @param index - Index to start heapifying from
   */
  private heapifyUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      if (this.heap[parentIndex].priority <= this.heap[index].priority) {
        break;
      }
      
      this.swap(parentIndex, index);
      index = parentIndex;
    }
  }
  
  /**
   * Heapify down (bubble down)
   * @param index - Index to start heapifying from
   */
  private heapifyDown(index: number): void {
    while (true) {
      let minIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      
      if (leftChild < this.size && 
          this.heap[leftChild].priority < this.heap[minIndex].priority) {
        minIndex = leftChild;
      }
      
      if (rightChild < this.size && 
          this.heap[rightChild].priority < this.heap[minIndex].priority) {
        minIndex = rightChild;
      }
      
      if (minIndex === index) {
        break;
      }
      
      this.swap(index, minIndex);
      index = minIndex;
    }
  }
  
  /**
   * Swap two elements in the heap
   * @param i - First index
   * @param j - Second index
   */
  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
  
  /**
   * Calculate days until expiry
   * @param expiryDate - Expiry date of product
   * @returns Number of days until expiry
   */
  private calculateDaysUntilExpiry(expiryDate: Date): number {
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const dayMs = 1000 * 3600 * 24;
    const diffDays = timeDiff / dayMs;
    // Use floor for positive durations so 5.x days shows as 5 (included)
    // Use ceil for negatives to keep -0.x as 0 or negative appropriately handled by priority
    return diffDays >= 0 ? Math.floor(diffDays) : Math.ceil(diffDays);
  }
  
  /**
   * Calculate priority level based on days until expiry
   * @param days - Days until expiry
   * @returns Priority level (1-5, where 1 is most urgent)
   */
  private calculatePriorityLevel(days: number): number {
    if (days <= 2) return 1; // Critical (includes expired and up to 2 days)
    if (days <= 5) return 2; // High (3-5 days)
    return 3; // Others: not shown in UI per requirement, keep as lower priority
  }
}