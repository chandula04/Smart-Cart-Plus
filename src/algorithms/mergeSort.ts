import { Product } from '@/types';

/**
 * Merge Sort Algorithm for sorting products
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */
export class MergeSort {
  /**
   * Sort products by price
   * @param products - Array of products to sort
   * @param ascending - Sort order (true for ascending, false for descending)
   * @returns Sorted array of products
   */
  static sortByPrice(products: Product[], ascending: boolean = true): Product[] {
    if (products.length <= 1) return products;
    
    const merge = (left: Product[], right: Product[]): Product[] => {
      const result: Product[] = [];
      let leftIndex = 0;
      let rightIndex = 0;
      
      while (leftIndex < left.length && rightIndex < right.length) {
        const comparison = ascending 
          ? left[leftIndex].price <= right[rightIndex].price
          : left[leftIndex].price >= right[rightIndex].price;
          
        if (comparison) {
          result.push(left[leftIndex]);
          leftIndex++;
        } else {
          result.push(right[rightIndex]);
          rightIndex++;
        }
      }
      
      return result
        .concat(left.slice(leftIndex))
        .concat(right.slice(rightIndex));
    };
    
    const mergeSort = (arr: Product[]): Product[] => {
      if (arr.length <= 1) return arr;
      
      const mid = Math.floor(arr.length / 2);
      const left = mergeSort(arr.slice(0, mid));
      const right = mergeSort(arr.slice(mid));
      
      return merge(left, right);
    };
    
    return mergeSort([...products]);
  }
  
  /**
   * Sort products by name
   * @param products - Array of products to sort
   * @param ascending - Sort order
   * @returns Sorted array of products
   */
  static sortByName(products: Product[], ascending: boolean = true): Product[] {
    if (products.length <= 1) return products;
    
    const merge = (left: Product[], right: Product[]): Product[] => {
      const result: Product[] = [];
      let leftIndex = 0;
      let rightIndex = 0;
      
      while (leftIndex < left.length && rightIndex < right.length) {
        const comparison = ascending 
          ? left[leftIndex].name.localeCompare(right[rightIndex].name) <= 0
          : left[leftIndex].name.localeCompare(right[rightIndex].name) >= 0;
          
        if (comparison) {
          result.push(left[leftIndex]);
          leftIndex++;
        } else {
          result.push(right[rightIndex]);
          rightIndex++;
        }
      }
      
      return result
        .concat(left.slice(leftIndex))
        .concat(right.slice(rightIndex));
    };
    
    const mergeSort = (arr: Product[]): Product[] => {
      if (arr.length <= 1) return arr;
      
      const mid = Math.floor(arr.length / 2);
      const left = mergeSort(arr.slice(0, mid));
      const right = mergeSort(arr.slice(mid));
      
      return merge(left, right);
    };
    
    return mergeSort([...products]);
  }
  
  /**
   * Sort products by expiry date
   * @param products - Array of products to sort
   * @param ascending - Sort order (true for earliest first)
   * @returns Sorted array of products
   */
  static sortByExpiryDate(products: Product[], ascending: boolean = true): Product[] {
    if (products.length <= 1) return products;
    
    const merge = (left: Product[], right: Product[]): Product[] => {
      const result: Product[] = [];
      let leftIndex = 0;
      let rightIndex = 0;
      
      while (leftIndex < left.length && rightIndex < right.length) {
        const leftTime = left[leftIndex].expiryDate.getTime();
        const rightTime = right[rightIndex].expiryDate.getTime();
        
        const comparison = ascending 
          ? leftTime <= rightTime
          : leftTime >= rightTime;
          
        if (comparison) {
          result.push(left[leftIndex]);
          leftIndex++;
        } else {
          result.push(right[rightIndex]);
          rightIndex++;
        }
      }
      
      return result
        .concat(left.slice(leftIndex))
        .concat(right.slice(rightIndex));
    };
    
    const mergeSort = (arr: Product[]): Product[] => {
      if (arr.length <= 1) return arr;
      
      const mid = Math.floor(arr.length / 2);
      const left = mergeSort(arr.slice(0, mid));
      const right = mergeSort(arr.slice(mid));
      
      return merge(left, right);
    };
    
    return mergeSort([...products]);
  }
}