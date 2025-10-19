'use client';

import { useState, useEffect } from 'react';

// Algorithm imports
import { BinarySearch } from '@/algorithms/binarySearch';
import { RushHourNavigator } from '@/algorithms/rushHourNavigator';
import { SmartExpiryAlert } from '@/algorithms/smartExpiryAlert';
import { ProductRecommendationSystem } from '@/algorithms/productRecommendation';

// Types
import { Product, Position, NavigationPath, ExpiryAlert, Recommendation } from '@/types';
import { observeProducts, updateProduct } from '@/lib/db';
import { useCart } from '@/contexts/CartContext';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [currentPosition] = useState<Position>({ x: 0, y: 0 });
  const [navigationPath, setNavigationPath] = useState<NavigationPath | null>(null);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { cart, addToCart } = useCart();
  
  // Initialize algorithms
  const [navigator] = useState(() => new RushHourNavigator());
  const [expirySystem] = useState(() => new SmartExpiryAlert());
  const [recommendationSystem] = useState(() => new ProductRecommendationSystem());
  
  // Live data from Firestore: products, expiry alerts, basic recommendations
  useEffect(() => {
    const unsub = observeProducts((items) => {
      // Normalize expiryDate if it's a Firestore Timestamp
      const normalized = items.map((p) => {
        const exp: any = (p as any).expiryDate;
        return {
          ...p,
          expiryDate: exp && typeof exp.toDate === 'function' ? exp.toDate() : exp,
        } as Product;
      });
      setProducts(normalized);

      // Rebuild expiry system from unhandled products
      expirySystem.clear();
      normalized
        .filter(p => !p.expiryHandled)
        .forEach(p => expirySystem.addProduct(p));
      setExpiryAlerts(expirySystem.getTopExpiringProducts(5));

      // Simple real-data recommendations: most stocked items
      const top = [...normalized]
        .filter(p => p.inStock)
        .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
        .slice(0, 5)
        .map((p) => ({
          product: p,
          reason: 'Popular and in stock',
          confidence: Math.min((p.quantity || 0) / Math.max(1, normalized[0]?.quantity || 1), 1),
        }));
      setRecommendations(top);
    });
    return () => unsub();
  }, [expirySystem]);
  
  // Search functionality using Binary Search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const t = term.trim().toLowerCase();
    if (t === '') {
      setSearchResults([]);
      setSuggestions([]);
      return;
    }

    // Live suggestions (substring match, top 8)
    const sug = products
      .filter(p => p.name.toLowerCase().includes(t))
      .slice(0, 8);
    setSuggestions(sug);

    // Full search results using Binary Search
    const results = BinarySearch.searchByName(products, term);
    setSearchResults(results);
  };

  const handleSuggestionClick = (product: Product) => {
    setSearchTerm(product.name);
    const results = BinarySearch.searchByName(products, product.name);
    setSearchResults(results);
    setSuggestions([]);
  };
  
  // Catalog sorting removed from Home
  
  // Add to cart handled by global CartContext (Firestore-synced)
  
  // Navigate to product using Rush Hour Navigator
  const navigateToProduct = (product: Product) => {
    const destination: Position = { x: 2, y: 1 }; // Sample destination
    const path = navigator.findOptimalPath(currentPosition, destination);
    setNavigationPath(path);
  };
  
  // Update expiry alerts
  const updateExpiryAlerts = () => {
    const alerts = expirySystem.getTopExpiringProducts(5);
    setExpiryAlerts(alerts);
  };

  // Mark an expiry alert as handled
  const handleMarkAsHandled = async (productId: string) => {
    await updateProduct(productId, { expiryHandled: true });
    expirySystem.removeProduct(productId);
    updateExpiryAlerts();
  };
  
  // Update recommendations
  const updateRecommendations = () => {
    // Keep simple: already set from Firestore products; could be enhanced with cart data later
  };
  
  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;
  const formatDate = (date: Date) => date.toLocaleDateString();
  
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to the Shopping System
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Experience intelligent shopping with advanced search, navigation, and inventory management.
        </p>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900">Fast Search</h3>
            <p className="text-blue-700 text-sm">Quick product lookup</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900">Smart Sorting</h3>
            <p className="text-green-700 text-sm">Efficient product organization</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900">Navigation</h3>
            <p className="text-purple-700 text-sm">Optimal pathfinding</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-900">Alerts & Suggestions</h3>
            <p className="text-orange-700 text-sm">Smart recommendations</p>
          </div>
        </div>
      </div>
      
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Product Search</h2>
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {suggestions.length > 0 && (
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {suggestions.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSuggestionClick(p)}
                className="text-left px-3 py-2 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 text-sm"
                title={p.name}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Search Results:</h3>
            <div className="grid gap-4">
              {searchResults.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.category} - {product.section}</p>
                    <p className="text-sm text-gray-600">Expires: {product.expiryDate ? formatDate(product.expiryDate) : 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatPrice(product.price)}</p>
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Product Catalog removed from Home page as requested */}
      
      {/* Navigation Path */}
      {navigationPath && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Store Navigation</h2>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="font-medium">Optimal Path Found!</p>
            <p className="text-sm text-gray-600">
              Distance: {navigationPath.totalDistance.toFixed(1)} units
            </p>
            <p className="text-sm text-gray-600">
              Estimated Time: {navigationPath.estimatedTime.toFixed(1)} minutes
            </p>
            <p className="text-sm text-gray-600">
              Congestion Level: {navigationPath.congestionLevel.toFixed(1)}/5
            </p>
            <div className="mt-2">
              <p className="text-sm font-medium">Path:</p>
              <div className="flex gap-2 mt-1">
                {navigationPath.path.map((pos, index) => (
                  <div key={index} className="bg-white px-2 py-1 rounded text-sm border">
                    ({pos.x},{pos.y})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Shopping Cart */}
      {cart.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{item.product.name}</span>
                  <span className="text-gray-600 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span>{formatPrice(cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Expiry Alerts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Expiry Alerts</h2>
        <div className="space-y-2">
          {expiryAlerts.map((alert, index) => (
            <div key={alert.product.id} className={`p-3 rounded-lg border ${
              alert.priority === 1 ? 'bg-red-50 border-red-200' :
              alert.priority === 2 ? 'bg-orange-50 border-orange-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{alert.product.name}</span>
                  <span className={`ml-2 text-sm ${
                    alert.priority === 1 ? 'text-red-600' :
                    alert.priority === 2 ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    {alert.daysUntilExpiry <= 0 ? 'EXPIRED' : `${alert.daysUntilExpiry} days left`}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`inline-block text-xs px-2 py-1 rounded ${
                    alert.priority === 1 ? 'bg-red-200 text-red-800' :
                    alert.priority === 2 ? 'bg-orange-200 text-orange-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {alert.priority === 1 ? 'CRITICAL' : 
                     alert.priority === 2 ? 'HIGH' : 'MEDIUM'}
                  </div>
                  <div>
                    <button
                      onClick={() => handleMarkAsHandled(alert.product.id)}
                      className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Mark Handled
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Product Recommendations</h2>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div key={rec.product.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{rec.product.name}</h4>
                  <p className="text-sm text-gray-600">{rec.reason}</p>
                  <p className="text-sm text-green-600">
                    Confidence: {(rec.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(rec.product.price)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}