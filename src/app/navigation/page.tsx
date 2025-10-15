'use client';

import { useState } from 'react';
import { RushHourNavigator } from '@/algorithms/rushHourNavigator';
import { Position, NavigationPath } from '@/types';

// Store sections with real supermarket categories and shelf numbers
interface StoreSection {
  name: string;
  position: Position;
  icon: string;
  products: string[];
  color: string;
  description: string;
  shelfNumber: number; // Shelf number in the store (1-10)
}

export default function NavigationPage() {
  const [navigator] = useState(() => new RushHourNavigator());
  
  // Define actual store sections with shelf numbers
  const storeSections: StoreSection[] = [
    { 
      name: 'Cashier Counter', 
      position: { x: 0, y: 0 }, 
      icon: '�‍💼', 
      products: [], 
      color: 'bg-purple-50',
      description: 'Staff assistance desk',
      shelfNumber: 0
    },
    { 
      name: 'Dairy & Eggs', 
      position: { x: 1, y: 0 }, 
      icon: '🥛', 
      products: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Eggs', 'Cream'], 
      color: 'bg-blue-50',
      description: 'Fresh dairy products',
      shelfNumber: 1
    },
    { 
      name: 'Bakery', 
      position: { x: 2, y: 0 }, 
      icon: '🍞', 
      products: ['Bread', 'Croissants', 'Cakes', 'Pastries', 'Buns', 'Muffins'], 
      color: 'bg-yellow-50',
      description: 'Fresh baked goods',
      shelfNumber: 2
    },
    { 
      name: 'Fresh Fruits', 
      position: { x: 3, y: 0 }, 
      icon: '🍎', 
      products: ['Apples', 'Bananas', 'Oranges', 'Grapes', 'Strawberries', 'Mangoes', 'Pineapple'], 
      color: 'bg-green-50',
      description: 'Fresh seasonal fruits',
      shelfNumber: 3
    },
    
    { 
      name: 'Vegetables', 
      position: { x: 0, y: 1 }, 
      icon: '🥗', 
      products: ['Lettuce', 'Tomatoes', 'Carrots', 'Onions', 'Potatoes', 'Cabbage', 'Beans'], 
      color: 'bg-green-100',
      description: 'Fresh vegetables',
      shelfNumber: 4
    },
    { 
      name: 'Meat & Seafood', 
      position: { x: 1, y: 1 }, 
      icon: '🍗', 
      products: ['Chicken', 'Beef', 'Fish', 'Pork', 'Prawns', 'Mutton', 'Salmon'], 
      color: 'bg-red-50',
      description: 'Fresh meat & seafood',
      shelfNumber: 5
    },
    { 
      name: 'Beverages', 
      position: { x: 2, y: 1 }, 
      icon: '🥤', 
      products: ['Water', 'Juice', 'Soda', 'Tea', 'Coffee', 'Energy Drinks', 'Milk Drinks'], 
      color: 'bg-cyan-50',
      description: 'Drinks & beverages',
      shelfNumber: 6
    },
    { 
      name: 'Snacks & Sweets', 
      position: { x: 3, y: 1 }, 
      icon: '�', 
      products: ['Chips', 'Cookies', 'Candy', 'Nuts', 'Chocolate', 'Biscuits', 'Crackers'], 
      color: 'bg-orange-50',
      description: 'Snacks & confectionery',
      shelfNumber: 7
    },
    
    { 
      name: 'Frozen Foods', 
      position: { x: 0, y: 2 }, 
      icon: '🧊', 
      products: ['Ice Cream', 'Frozen Vegetables', 'Frozen Pizza', 'Frozen Fish', 'Frozen Meals'], 
      color: 'bg-blue-100',
      description: 'Frozen items',
      shelfNumber: 8
    },
    { 
      name: 'Canned & Packaged', 
      position: { x: 1, y: 2 }, 
      icon: '🥫', 
      products: ['Canned Beans', 'Pasta', 'Rice', 'Canned Tuna', 'Sauce', 'Noodles'], 
      color: 'bg-amber-50',
      description: 'Canned goods & dry foods',
      shelfNumber: 9
    },
    { 
      name: 'Household Items', 
      position: { x: 2, y: 2 }, 
      icon: '🧹', 
      products: ['Cleaning Supplies', 'Paper Towels', 'Detergent', 'Soap', 'Tissues', 'Bleach'], 
      color: 'bg-pink-50',
      description: 'Household essentials',
      shelfNumber: 10
    },
    { 
      name: 'Checkout Counter', 
      position: { x: 3, y: 2 }, 
      icon: '💳', 
      products: [], 
      color: 'bg-green-50',
      description: 'Payment counter',
      shelfNumber: 0
    },
  ];

  const [selectedStart, setSelectedStart] = useState<StoreSection>(storeSections[0]); // Entrance
  const [selectedDestination, setSelectedDestination] = useState<StoreSection>(storeSections[11]); // Checkout
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [navigationPath, setNavigationPath] = useState<NavigationPath | null>(null);
  
  const handleFindPath = () => {
    const path = navigator.findOptimalPath(selectedStart.position, selectedDestination.position);
    setNavigationPath(path);
  };

  const handleProductSearch = (productName: string) => {
    setSearchQuery(productName);
    
    // Find which section has this product
    const section = storeSections.find(s => 
      s.products.some(p => p.toLowerCase().includes(productName.toLowerCase()))
    );
    
    if (section) {
      setSelectedDestination(section);
      const path = navigator.findOptimalPath(selectedStart.position, section.position);
      setNavigationPath(path);
    }
  };

  const handleSectionSelect = (section: StoreSection) => {
    setSelectedDestination(section);
    const path = navigator.findOptimalPath(selectedStart.position, section.position);
    setNavigationPath(path);
  };

  const handleClearPath = () => {
    setNavigationPath(null);
    setSearchQuery('');
    setSelectedDestination(storeSections[11]); // Reset to checkout
  };

  const getSectionAt = (x: number, y: number): StoreSection | undefined => {
    return storeSections.find(s => s.position.x === x && s.position.y === y);
  };

  const isOnPath = (section: StoreSection): boolean => {
    if (!navigationPath) return false;
    return navigationPath.path.some(pos => 
      pos.x === section.position.x && pos.y === section.position.y
    );
  };

  const isStartSection = (section: StoreSection): boolean => {
    return section.position.x === selectedStart.position.x && 
           section.position.y === selectedStart.position.y;
  };

  const isDestinationSection = (section: StoreSection): boolean => {
    return section.position.x === selectedDestination.position.x && 
           section.position.y === selectedDestination.position.y;
  };

  const getCellStyle = (section: StoreSection): string => {
    if (isStartSection(section)) return 'bg-green-300 border-green-600 ring-4 ring-green-200 shadow-lg';
    if (isDestinationSection(section)) return 'bg-red-300 border-red-600 ring-4 ring-red-200 shadow-lg';
    if (isOnPath(section)) return 'bg-blue-300 border-blue-600 ring-2 ring-blue-200 shadow-md';
    return `${section.color} border-gray-300 hover:border-blue-400 hover:shadow-md`;
  };

  const getPathSteps = (): StoreSection[] => {
    if (!navigationPath) return [];
    return navigationPath.path
      .map(pos => getSectionAt(pos.x, pos.y))
      .filter(s => s !== undefined) as StoreSection[];
  };

  // Get all products for search suggestions
  const allProducts = storeSections.flatMap(s => s.products);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">�‍💼 Staff Product Locator</h1>
        <p className="text-purple-100">
          Help customers find products quickly - Search and get shelf numbers instantly
        </p>
      </div>

      {/* Quick Product Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🔍</span>
          Search Product for Customer
        </h2>
        
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a product (e.g., Milk, Bread, Chicken)..."
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Product Suggestions */}
        {searchQuery && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {allProducts
              .filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
              .slice(0, 12)
              .map((product, index) => (
                <button
                  key={index}
                  onClick={() => handleProductSearch(product)}
                  className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors text-sm font-medium"
                >
                  {product}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Current Location & Destination */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Journey</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              📍 You are at:
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {storeSections.map((section) => (
                <button
                  key={section.name}
                  onClick={() => setSelectedStart(section)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isStartSection(section)
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-300 hover:border-green-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{section.icon}</div>
                  <div className="text-xs font-medium text-gray-800">{section.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🎯 I want to go to:
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {storeSections.filter(s => s.name !== 'Entrance').map((section) => (
                <button
                  key={section.name}
                  onClick={() => handleSectionSelect(section)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isDestinationSection(section)
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-300 hover:border-red-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{section.icon}</div>
                  <div className="text-xs font-medium text-gray-800">{section.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleFindPath}
            className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
          >
            🧭 Show Me The Way
          </button>
          <button
            onClick={handleClearPath}
            className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Store Map */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Store Layout</h2>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-300 border-2 border-green-600 rounded"></div>
            <span className="font-medium">Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-300 border-2 border-red-600 rounded"></div>
            <span className="font-medium">Destination</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-300 border-2 border-blue-600 rounded"></div>
            <span className="font-medium">Follow This Path</span>
          </div>
        </div>

        {/* Grid Map */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {[0, 1, 2].map((y) => (
              <div key={y} className="flex">
                {[0, 1, 2, 3].map((x) => {
                  const section = getSectionAt(x, y);
                  if (!section) return null;
                  
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`w-32 h-32 border-2 ${getCellStyle(section)} transition-all cursor-pointer flex flex-col items-center justify-center text-center p-3 m-1 rounded-lg`}
                      onClick={() => handleSectionSelect(section)}
                    >
                      <div className="text-3xl mb-1">{section.icon}</div>
                      <div className="text-xs font-bold text-gray-800 leading-tight">
                        {section.name}
                      </div>
                      {section.shelfNumber > 0 && (
                        <div className="mt-1 text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                          Shelf #{section.shelfNumber}
                        </div>
                      )}
                      {isStartSection(section) && (
                        <div className="mt-1 text-xs font-bold text-green-700">STAFF HERE</div>
                      )}
                      {isDestinationSection(section) && (
                        <div className="mt-1 text-xs font-bold text-red-700">TARGET</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route Information */}
      {navigationPath && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Product Location Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium mb-1">Target Section</div>
              <div className="text-2xl font-bold text-purple-900 flex items-center">
                <span className="mr-2">{selectedDestination.icon}</span>
                {selectedDestination.name}
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-1">Shelf Number</div>
              <div className="text-5xl font-bold text-green-900 text-center">
                {selectedDestination.shelfNumber > 0 ? selectedDestination.shelfNumber : 'N/A'}
              </div>
            </div>
          </div>

          {selectedDestination.shelfNumber > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <span className="mr-2">💬</span>
                Tell the Customer:
              </h3>
              <p className="text-blue-800 text-lg">
                &quot;You can find <strong>{searchQuery || selectedDestination.name}</strong> at <strong className="text-2xl">Shelf #{selectedDestination.shelfNumber}</strong> - that&apos;s the <strong>{selectedDestination.name}</strong> section.&quot;
              </p>
            </div>
          )}

          {/* Available Products in This Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Products Available in {selectedDestination.name}:</h3>
            {selectedDestination.products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedDestination.products.map((product, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-xl">{selectedDestination.icon}</span>
                    <span className="text-sm font-medium text-gray-800">{product}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">This is a service counter - no products available.</p>
            )}
          </div>
        </div>
      )}

      {/* Staff Instructions */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Staff Instructions - How to Help Customers
        </h3>
        <ul className="text-purple-800 text-sm space-y-2">
          <li>• <strong>Step 1:</strong> Customer asks &quot;Where can I find [product]?&quot;</li>
          <li>• <strong>Step 2:</strong> Start from &quot;Cashier Counter&quot; (where you are)</li>
          <li>• <strong>Step 3:</strong> Type the product name in the search box</li>
          <li>• <strong>Step 4:</strong> Click on the product from suggestions</li>
          <li>• <strong>Step 5:</strong> Tell customer the <strong className="text-lg">SHELF NUMBER</strong> shown</li>
          <li>• <strong>Example:</strong> &quot;You&apos;ll find Milk at Shelf #1 in the Dairy section&quot;</li>
        </ul>
      </div>
    </div>
  );
}
