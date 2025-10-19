'use client';

import { useState, useEffect } from 'react';
import { BinarySearch } from '@/algorithms/binarySearch';
import { MergeSort } from '@/algorithms/mergeSort';
import { Product } from '@/types';
import { observeProducts } from '@/lib/db';
import { useCart } from '@/contexts/CartContext';

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'expiry'>('name');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });

  // Live Firestore products
  useEffect(() => {
    const unsub = observeProducts((items) => {
      const normalized = items.map((p) => {
        const exp: any = (p as any).expiryDate;
        return {
          ...p,
          expiryDate: exp && typeof exp.toDate === 'function' ? exp.toDate() : exp,
        } as Product;
      });
      setProducts(normalized);
      setFilteredProducts(normalized);
    });
    return () => unsub();
  }, []);

  // Search functionality
  useEffect(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = BinarySearch.searchByName(filtered, searchTerm);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Apply price range filter
    filtered = BinarySearch.searchByPriceRange(filtered, priceRange.min, priceRange.max);

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered = MergeSort.sortByName(filtered, true);
        break;
      case 'price':
        filtered = MergeSort.sortByPrice(filtered, true);
        break;
      case 'expiry':
        filtered = MergeSort.sortByExpiryDate(filtered, true);
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, filterCategory, priceRange]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;
  const formatDate = (date: Date) => date.toLocaleDateString();

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getExpiryStatus = (days: number) => {
    if (days < 0) return { text: 'Expired', color: 'text-red-600 bg-red-100' };
    if (days <= 1) return { text: 'Expires Today', color: 'text-red-600 bg-red-100' };
    if (days <= 3) return { text: `${days} days left`, color: 'text-orange-600 bg-orange-100' };
    if (days <= 7) return { text: `${days} days left`, color: 'text-yellow-600 bg-yellow-100' };
    return { text: `${days} days left`, color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
        <p className="text-gray-600">
          Browse our complete product inventory with advanced search and sorting capabilities
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Search & Filter</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'expiry')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price">Price (Low-High)</option>
              <option value="expiry">Expiry Date</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const daysUntilExpiry = product.expiryDate ? getDaysUntilExpiry(product.expiryDate) : null;
          const expiryStatus = daysUntilExpiry !== null ? getExpiryStatus(daysUntilExpiry) : null;
          
          return (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Product Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </span>
                </div>

                {/* Product Details */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-700">{product.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Section: {product.section}</span>
                    <span className="text-gray-600">Stock: {product.quantity}</span>
                  </div>
                </div>

                {/* Expiry Information */}
                {product.expiryDate && expiryStatus && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Expires: {formatDate(product.expiryDate)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${expiryStatus.color}`}>
                        {expiryStatus.text}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      addToCart(product);
                      alert(`${product.name} added to cart!`);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🛒 Add to Cart
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}
    </div>
  );
}