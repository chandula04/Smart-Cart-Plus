import { Product } from '@/types';

/**
 * Binary Search Algorithm for Product Search
 * Time Complexity: O(log n)
 * Space Complexity: O(1)
 */
export class BinarySearch {
  /**
   * Search for products by name using binary search
   * @param products - Sorted array of products
   * @param searchTerm - Term to search for
   * @returns Array of matching products
   */
  static searchByName(products: Product[], searchTerm: string): Product[] {
    const results: Product[] = [];
    const normalizedSearch = searchTerm.toLowerCase();
    
    // Sort products by name if not already sorted
    const sortedProducts = [...products].sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    
    let left = 0;
    let right = sortedProducts.length - 1;
    let foundIndex = -1;
    
    // Find any matching product
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midProductName = sortedProducts[mid].name.toLowerCase();
      
      if (midProductName.includes(normalizedSearch)) {
        foundIndex = mid;
        break;
      } else if (midProductName < normalizedSearch) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    // If found, expand to find all matches
    if (foundIndex !== -1) {
      // Add the found product
      results.push(sortedProducts[foundIndex]);
      
      // Search left for more matches
      let leftIndex = foundIndex - 1;
      while (leftIndex >= 0 && 
             sortedProducts[leftIndex].name.toLowerCase().includes(normalizedSearch)) {
        results.unshift(sortedProducts[leftIndex]);
        leftIndex--;
      }
      
      // Search right for more matches
      let rightIndex = foundIndex + 1;
      while (rightIndex < sortedProducts.length && 
             sortedProducts[rightIndex].name.toLowerCase().includes(normalizedSearch)) {
        results.push(sortedProducts[rightIndex]);
        rightIndex++;
      }
    }
    
    return results;
  }
  
  /**
   * Search for products by price range
   * @param products - Sorted array of products by price
   * @param minPrice - Minimum price
   * @param maxPrice - Maximum price
   * @returns Array of products in price range
   */
  static searchByPriceRange(products: Product[], minPrice: number, maxPrice: number): Product[] {
    const sortedProducts = [...products].sort((a, b) => a.price - b.price);
    
    const findLowerBound = (target: number): number => {
      let left = 0;
      let right = sortedProducts.length - 1;
      let result = sortedProducts.length;
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (sortedProducts[mid].price >= target) {
          result = mid;
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }
      return result;
    };
    
    const findUpperBound = (target: number): number => {
      let left = 0;
      let right = sortedProducts.length - 1;
      let result = -1;
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (sortedProducts[mid].price <= target) {
          result = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      return result;
    };
    
    const lowerBound = findLowerBound(minPrice);
    const upperBound = findUpperBound(maxPrice);
    
    if (lowerBound <= upperBound) {
      return sortedProducts.slice(lowerBound, upperBound + 1);
    }
    
    return [];
  }
}