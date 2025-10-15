'use client';

import { useState } from 'react';
import { RushHourNavigator } from '@/algorithms/rushHourNavigator';
import { Position, NavigationPath } from '@/types';

// Store sections with real supermarket categories
interface StoreSection {
  name: string;
  position: Position;
  icon: string;
  products: string[];
  color: string;
  description: string;
}

export default function NavigationPage() {
  const [navigator] = useState(() => new RushHourNavigator());
  
  // Define actual store sections
  const storeSections: StoreSection[] = [
    { 
      name: 'Entrance', 
      position: { x: 0, y: 0 }, 
      icon: '🚪', 
      products: [], 
      color: 'bg-gray-50',
      description: 'Main entrance'
    },
    { 
      name: 'Dairy & Eggs', 
      position: { x: 1, y: 0 }, 
      icon: '🥛', 
      products: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Eggs'], 
      color: 'bg-blue-50',
      description: 'Fresh dairy products'
    },
    { 
      name: 'Bakery', 
      position: { x: 2, y: 0 }, 
      icon: '🍞', 
      products: ['Bread', 'Croissants', 'Cakes', 'Pastries', 'Buns'], 
      color: 'bg-yellow-50',
      description: 'Fresh baked goods'
    },
    { 
      name: 'Fresh Fruits', 
      position: { x: 3, y: 0 }, 
      icon: '🍎', 
      products: ['Apples', 'Bananas', 'Oranges', 'Grapes', 'Strawberries'], 
      color: 'bg-green-50',
      description: 'Fresh seasonal fruits'
    },
    
    { 
      name: 'Vegetables', 
      position: { x: 0, y: 1 }, 
      icon: '🥗', 
      products: ['Lettuce', 'Tomatoes', 'Carrots', 'Onions', 'Potatoes'], 
      color: 'bg-green-100',
      description: 'Fresh vegetables'
    },
    { 
      name: 'Customer Service', 
      position: { x: 1, y: 1 }, 
      icon: 'ℹ️', 
      products: [], 
      color: 'bg-purple-50',
      description: 'Help desk & returns'
    },
    { 
      name: 'Beverages', 
      position: { x: 2, y: 1 }, 
      icon: '🥤', 
      products: ['Water', 'Juice', 'Soda', 'Tea', 'Coffee'], 
      color: 'bg-cyan-50',
      description: 'Drinks & beverages'
    },
    { 
      name: 'Meat & Seafood', 
      position: { x: 3, y: 1 }, 
      icon: '🍗', 
      products: ['Chicken', 'Beef', 'Fish', 'Pork', 'Prawns'], 
      color: 'bg-red-50',
      description: 'Fresh meat & seafood'
    },
    
    { 
      name: 'Frozen Foods', 
      position: { x: 0, y: 2 }, 
      icon: '🧊', 
      products: ['Ice Cream', 'Frozen Vegetables', 'Frozen Pizza', 'Frozen Fish'], 
      color: 'bg-blue-100',
      description: 'Frozen items'
    },
    { 
      name: 'Snacks & Sweets', 
      position: { x: 1, y: 2 }, 
      icon: '🍿', 
      products: ['Chips', 'Cookies', 'Candy', 'Nuts', 'Chocolate'], 
      color: 'bg-orange-50',
      description: 'Snacks & confectionery'
    },
    { 
      name: 'Household Items', 
      position: { x: 2, y: 2 }, 
      icon: '🧹', 
      products: ['Cleaning Supplies', 'Paper Towels', 'Detergent', 'Soap'], 
      color: 'bg-pink-50',
      description: 'Household essentials'
    },
    { 
      name: 'Checkout Counter', 
      position: { x: 3, y: 2 }, 
      icon: '💳', 
      products: [], 
      color: 'bg-green-50',
      description: 'Payment counter'
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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🗺️ Store Navigator</h1>
        <p className="text-blue-100">
          Find the fastest route to any product or section in the store
        </p>
      </div>

      {/* Quick Product Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🔍</span>
          Quick Product Search
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
            <div className="grid grid-cols-2 gap-3">
              {storeSections.slice(0, 6).map((section) => (
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
            <div className="grid grid-cols-2 gap-3">
              {storeSections.filter(s => s.products.length > 0 || s.name === 'Checkout Counter' || s.name === 'Customer Service').map((section) => (
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
                      <div className="text-3xl mb-2">{section.icon}</div>
                      <div className="text-xs font-bold text-gray-800 leading-tight">
                        {section.name}
                      </div>
                      {isStartSection(section) && (
                        <div className="mt-1 text-xs font-bold text-green-700">YOU ARE HERE</div>
                      )}
                      {isDestinationSection(section) && (
                        <div className="mt-1 text-xs font-bold text-red-700">DESTINATION</div>
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
            Your Route Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">Walking Distance</div>
              <div className="text-3xl font-bold text-blue-900">
                {navigationPath.totalDistance.toFixed(0)}m
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-1">Estimated Time</div>
              <div className="text-3xl font-bold text-green-900">
                {navigationPath.estimatedTime.toFixed(1)} min
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-600 font-medium mb-1">Traffic Level</div>
              <div className="text-3xl font-bold text-orange-900">
                {navigationPath.congestionLevel < 1.5 ? '🟢 Clear' : 
                 navigationPath.congestionLevel < 2.5 ? '🟡 Moderate' : '🔴 Busy'}
              </div>
            </div>
          </div>

          {/* Step-by-Step Directions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Step-by-Step Directions:</h3>
            <div className="space-y-3">
              {getPathSteps().map((section, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{section.icon}</span>
                      <div className="font-semibold text-gray-900 text-lg">{section.name}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{section.description}</div>
                    {section.products.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Available: {section.products.slice(0, 3).join(', ')}
                        {section.products.length > 3 && '...'}
                      </div>
                    )}
                  </div>
                  {index === 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      Start
                    </span>
                  )}
                  {index === getPathSteps().length - 1 && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      Destination
                    </span>
                  )}
                  {index > 0 && index < getPathSteps().length - 1 && (
                    <span className="text-gray-400">
                      ↓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
          <span className="mr-2">💡</span>
          How to Use
        </h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• <strong>Search for a product</strong> in the search box above</li>
          <li>• <strong>Click You are at</strong> to set your current location</li>
          <li>• <strong>Click I want to go to</strong> to select your destination</li>
          <li>• <strong>Click Show Me The Way</strong> to see the fastest route</li>
          <li>• <strong>Follow the blue path</strong> on the store map</li>
        </ul>
      </div>
    </div>
  );
}
