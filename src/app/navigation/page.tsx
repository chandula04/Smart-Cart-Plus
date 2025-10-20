'use client';

import { useEffect, useMemo, useState } from 'react';
import { RushHourNavigator } from '@/algorithms/rushHourNavigator';
import { Position, NavigationPath } from '@/types';
import { observeSections, observeProducts } from '@/lib/db';

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
  
  // Essential default sections (only Cashier and Checkout for basic functionality)
  const defaultSections: StoreSection[] = useMemo(() => [
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
      name: 'Checkout Counter', 
      position: { x: 3, y: 2 }, 
      icon: '💳', 
      products: [], 
      color: 'bg-green-50',
      description: 'Payment counter',
      shelfNumber: 0
    },
  ], []);

  // Live sections from Firestore, overlayed onto defaults by name
  const [fireSections, setFireSections] = useState<any[]>([]);
  const [fireProducts, setFireProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsubs: Array<() => void> = [];
    unsubs.push(observeSections((items) => setFireSections(items)));
    unsubs.push(observeProducts((items) => setFireProducts(items)));
    return () => unsubs.forEach(u => u());
  }, []);

  const storeSections: StoreSection[] = useMemo(() => {
    console.log('Navigation: Building store sections from Firestore:', fireSections.length, 'sections');
    
    // Start with only essential defaults (Cashier and Checkout)
    const essentialSections = defaultSections.slice(); // Copy essential sections
    
    // Override essentials if they exist in Firestore
    const persistedByName = new Map(fireSections.map((s: any) => [s.name, s]));
    
    const merged = [
      // Essential sections (potentially overridden by Firestore)
      ...essentialSections.map(sec => {
        const p: any = persistedByName.get(sec.name);
        if (!p) return sec;
        return {
          ...sec,
          position: p.x != null && p.y != null ? { x: p.x, y: p.y } : sec.position,
          icon: p.icon ?? sec.icon,
          shelfNumber: typeof p.shelfNumber === 'number' ? p.shelfNumber : sec.shelfNumber,
        } as StoreSection;
      }),
      // All Firestore sections (except essentials which are already handled above)
      ...fireSections
        .filter((p: any) => !defaultSections.some(d => d.name === p.name))
        .map((p: any) => ({
          name: p.name,
          position: p.x != null && p.y != null ? { x: p.x, y: p.y } : { x: 1, y: 1 },
          icon: p.icon ?? '📦',
          products: [],
          color: 'bg-blue-50',
          description: p.description || 'Store section',
          shelfNumber: p.shelfNumber ?? 1,
        }) as StoreSection)
    ];
    
    console.log('Navigation: Final store sections:', merged.length, 'sections');
    return merged;
  }, [fireSections, defaultSections]);

  // Always start from Cashier Counter (index 0)
  const cashierSection = storeSections[0];
  const [selectedStart] = useState<StoreSection>(cashierSection);
  const checkoutDefault = useMemo(() => storeSections.find(s => s.name === 'Checkout Counter') || storeSections[storeSections.length - 1], [storeSections]);
  const [selectedDestination, setSelectedDestination] = useState<StoreSection>(checkoutDefault); // Checkout as default
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [navigationPath, setNavigationPath] = useState<NavigationPath | null>(null);
  
  // Keep selectedDestination in sync when storeSections change (e.g., after Firestore overlay)
  useEffect(() => {
    const checkout = storeSections.find(s => s.name === 'Checkout Counter') || storeSections[storeSections.length - 1];
    setSelectedDestination((prev) => prev && storeSections.find(s => s.name === prev.name) ? prev : checkout);
  }, [storeSections]);
  
  const handleFindPath = () => {
    // Always compute from cashier
    const path = navigator.findOptimalPath(cashierSection.position, selectedDestination.position);
    setNavigationPath(path);
  };

  const handleProductSearch = (productName: string) => {
    setSearchQuery(productName);
    
    // Prefer Firestore mapping: find product and navigate to its section
    const product = fireProducts.find((p: any) => (p.name || '').toLowerCase() === productName.toLowerCase());
    let targetSection: StoreSection | undefined;
    if (product && product.section) {
      targetSection = storeSections.find(s => s.name.toLowerCase() === String(product.section).toLowerCase());
    }
    
    // Fallback: search within default section product lists
    if (!targetSection) {
      targetSection = storeSections.find(s => s.products.some(p => p.toLowerCase().includes(productName.toLowerCase())));
    }
    
    if (targetSection) {
      setSelectedDestination(targetSection);
      const path = navigator.findOptimalPath(cashierSection.position, targetSection.position);
      setNavigationPath(path);
    }
  };

  const handleSectionSelect = (section: StoreSection) => {
    setSelectedDestination(section);
    const path = navigator.findOptimalPath(cashierSection.position, section.position);
    setNavigationPath(path);
  };

  const handleClearPath = () => {
    setNavigationPath(null);
    setSearchQuery('');
    // Reset to checkout counter
    const checkout = storeSections.find(s => s.name === 'Checkout Counter') || storeSections[storeSections.length - 1];
    setSelectedDestination(checkout);
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

  // Group Firestore products by their section for real-time availability
  const productsBySection = useMemo(() => {
    const map = new Map<string, string[]>();
    fireProducts.forEach((p: any) => {
      const sectionName = (p.section || '').toString();
      if (!sectionName) return;
      const list = map.get(sectionName) || [];
      if (p.name && !list.includes(p.name)) list.push(p.name);
      map.set(sectionName, list);
    });
    return map;
  }, [fireProducts]);

  // Get all products for search suggestions (prefer Firestore names)
  const allProducts = useMemo(() => {
    if (fireProducts.length > 0) {
      const names = fireProducts.map((p: any) => p.name as string).filter(Boolean);
      // Deduplicate while preserving order
      return Array.from(new Set(names));
    }
    return storeSections.flatMap(s => s.products);
  }, [fireProducts, storeSections]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🧑‍💼 Staff Product Locator</h1>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
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

      {/* Destination Selection (Start is always Cashier) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2">Your Journey</h2>
        <p className="text-sm text-gray-600 mb-4">Start: Cashier Counter (fixed)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🎯 I want to go to:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {storeSections
                .filter(s => s.name !== 'Cashier Counter' && s.name !== 'Checkout Counter')
                .map((section) => (
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
                  <div className="text-xs font-medium text-gray-800">
                    {section.name}{section.shelfNumber > 0 ? ` (Shelf #${section.shelfNumber})` : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
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

      {/* Store Map removed as requested */}

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
            {(() => {
              // Service counters don't show products
              if (selectedDestination.name === 'Cashier Counter' || selectedDestination.name === 'Checkout Counter') {
                return <p className="text-gray-600 italic">This is a service counter - no products available.</p>;
              }
              const list = productsBySection.get(selectedDestination.name) || selectedDestination.products || [];
              return list.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {list.map((product: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-xl">{selectedDestination.icon}</span>
                      <span className="text-sm font-medium text-gray-800">{product}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 italic">No products found for this section.</p>
              );
            })()}
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
