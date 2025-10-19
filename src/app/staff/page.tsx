'use client';

import { useState, useEffect, useCallback } from 'react';
import { SmartExpiryAlert } from '@/algorithms/smartExpiryAlert';
import { Product, ExpiryAlert, StoreSection, TrafficData } from '@/types';
import { loadSections, saveSections } from '@/lib/sectionsStore';

export default function StaffDashboard() {
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [urgentAlerts, setUrgentAlerts] = useState<ExpiryAlert[]>([]);
  const [expirySystem] = useState(() => new SmartExpiryAlert());
  const [refreshCount, setRefreshCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'expiry' | 'products' | 'categories' | 'traffic'>('expiry');
  
  // Product Management State
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    section: '',
    expiryDate: '',
    description: '',
    quantity: ''
  });
  
  // Category/Section Management State
  const [sections, setSections] = useState<StoreSection[]>(() => loadSections());
  const [newSection, setNewSection] = useState({
    name: '',
    position: 'top-left', // Changed from x, y to position selector
    icon: '',
    shelfNumber: '' as string | number
  });
  
  // Traffic Tracking State
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);

  const initializeTrafficData = useCallback(() => {
    // Initialize with sample traffic data
    const sampleTraffic: TrafficData[] = sections.map(section => ({
      sectionId: section.id,
      sectionName: `${section.name}${section.shelfNumber && section.shelfNumber > 0 ? ` (Shelf #${section.shelfNumber})` : ''}`,
      currentPeople: Math.floor(Math.random() * 20),
      maxCapacity: 25,
      congestionLevel: 0,
      lastUpdated: new Date()
    }));
    
    // Calculate congestion levels
    sampleTraffic.forEach(data => {
      data.congestionLevel = data.currentPeople / data.maxCapacity;
    });
    
    setTrafficData(sampleTraffic);
  }, [sections]);

  const updateAlerts = useCallback(() => {
    // Get top 10 expiring products
    const alerts = expirySystem.getTopExpiringProducts(10);
    setExpiryAlerts(alerts);

    // Get urgent alerts (expiring within 2 days)
    const urgent = expirySystem.getProductsExpiringWithin(2);
    setUrgentAlerts(urgent);
  }, [expirySystem]);

  // Sample inventory data
  useEffect(() => {
    const inventoryProducts: Product[] = [
      {
        id: 'inv1', name: 'Milk (Organic)', price: 450, category: 'Dairy', section: 'Dairy & Eggs',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), inStock: true, quantity: 15
      },
      {
        id: 'inv2', name: 'Chicken Breast', price: 850, category: 'Meat', section: 'Meat & Seafood',
        expiryDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000), inStock: true, quantity: 8
      },
      {
        id: 'inv3', name: 'Bread (Whole Wheat)', price: 180, category: 'Bakery', section: 'Bakery',
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), inStock: true, quantity: 12
      },
      {
        id: 'inv4', name: 'Yogurt (Greek)', price: 320, category: 'Dairy', section: 'Dairy & Eggs',
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), inStock: true, quantity: 25
      },
      {
        id: 'inv5', name: 'Salmon Fillet', price: 1250, category: 'Seafood', section: 'Meat & Seafood',
        expiryDate: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000), inStock: true, quantity: 6
      },
      {
        id: 'inv6', name: 'Bananas', price: 280, category: 'Produce', section: 'Fresh Fruits',
        expiryDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), inStock: true, quantity: 20
      },
      {
        id: 'inv7', name: 'Ground Beef', price: 920, category: 'Meat', section: 'Meat & Seafood',
        expiryDate: new Date(Date.now() + 0.8 * 24 * 60 * 60 * 1000), inStock: true, quantity: 10
      },
      {
        id: 'inv8', name: 'Lettuce (Romaine)', price: 150, category: 'Produce', section: 'Vegetables',
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), inStock: true, quantity: 18
      },
      {
        id: 'inv9', name: 'Cheese (Cheddar)', price: 650, category: 'Dairy', section: 'Dairy & Eggs',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), inStock: true, quantity: 14
      },
      {
        id: 'inv10', name: 'Strawberries', price: 550, category: 'Produce', section: 'Fresh Fruits',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), inStock: true, quantity: 22
      }
    ];

    setProducts(inventoryProducts);

    // Clear and populate expiry system
    expirySystem.clear();
    inventoryProducts.forEach(product => {
      expirySystem.addProduct(product);
    });

    updateAlerts();
    initializeTrafficData();
  }, [expirySystem, refreshCount, updateAlerts, initializeTrafficData]);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.section) {
      alert('Please fill in all required fields (Name, Price, Section)');
      return;
    }

    const product: Product = {
      id: `prod-${Date.now()}`,
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category || 'General',
      section: newProduct.section,
      expiryDate: newProduct.expiryDate ? new Date(newProduct.expiryDate) : undefined,
      description: newProduct.description,
      inStock: true,
      quantity: parseInt(newProduct.quantity) || 0
    };

    setProducts([...products, product]);
    
    // Add to expiry system if it has an expiry date
    if (product.expiryDate) {
      expirySystem.addProduct(product);
      updateAlerts();
    }

    // Reset form
    setNewProduct({
      name: '',
      price: '',
      category: '',
      section: '',
      expiryDate: '',
      description: '',
      quantity: ''
    });

    alert('Product added successfully!');
  };

  const handleAddSection = () => {
    if (!newSection.name || !newSection.position) {
      alert('Please fill in all required fields (Name and Position)');
      return;
    }

    // Convert position preset to x,y coordinates
    const positionMap: { [key: string]: { x: number; y: number } } = {
      'top-left': { x: 0, y: 0 },
      'top-center-left': { x: 1, y: 0 },
      'top-center-right': { x: 2, y: 0 },
      'top-right': { x: 3, y: 0 },
      'middle-left': { x: 0, y: 1 },
      'middle-center-left': { x: 1, y: 1 },
      'middle-center-right': { x: 2, y: 1 },
      'middle-right': { x: 3, y: 1 },
      'bottom-left': { x: 0, y: 2 },
      'bottom-center-left': { x: 1, y: 2 },
      'bottom-center-right': { x: 2, y: 2 },
      'bottom-right': { x: 3, y: 2 }
    };

    const coordinates = positionMap[newSection.position];

    const section: StoreSection = {
      id: `section-${Date.now()}`,
      name: newSection.name,
      x: coordinates.x,
      y: coordinates.y,
      icon: newSection.icon || '📦',
      shelfNumber: newSection.shelfNumber ? Number(newSection.shelfNumber) : 0
    };

  const updated = [...sections, section];
  setSections(updated);
  saveSections(updated);
    
    // Add traffic data for new section
    const newTraffic: TrafficData = {
      sectionId: section.id,
      sectionName: section.name,
      currentPeople: 0,
      maxCapacity: 25,
      congestionLevel: 0,
      lastUpdated: new Date()
    };
    setTrafficData([...trafficData, newTraffic]);

    // Reset form
    setNewSection({
      name: '',
      position: 'top-left',
      icon: '',
      shelfNumber: ''
    });

    alert('Section added successfully!');
  };

  const updateTraffic = (sectionId: string, newCount: number) => {
    setTrafficData(prevData => 
      prevData.map(data => {
        if (data.sectionId === sectionId) {
          const congestionLevel = newCount / data.maxCapacity;
          return {
            ...data,
            currentPeople: newCount,
            congestionLevel,
            lastUpdated: new Date()
          };
        }
        return data;
      })
    );
  };

  const handleMarkAsHandled = (productId: string) => {
    expirySystem.removeProduct(productId);
    setRefreshCount(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    const loaded = loadSections();
    setSections(loaded);
  };

  // Persist sections on any change
  useEffect(() => {
    saveSections(sections);
  }, [sections]);

  const formatPrice = (price: number) => `Rs. ${price.toFixed(2)}`;
  
  const formatDateTime = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1: return 'CRITICAL';
      case 2: return 'HIGH';
      case 3: return 'MEDIUM';
      case 4: return 'LOW';
      default: return 'VERY LOW';
    }
  };

  const getCongestionColor = (level: number) => {
    if (level >= 0.8) return 'bg-red-100 text-red-800 border-red-300';
    if (level >= 0.6) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (level >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getCongestionText = (level: number) => {
    if (level >= 0.8) return 'High Traffic';
    if (level >= 0.6) return 'Moderate';
    if (level >= 0.4) return 'Low';
    return 'Clear';
  };

  const getTotalValue = (alerts: ExpiryAlert[]) => {
    return alerts.reduce((sum, alert) => sum + (alert.product.price * alert.product.quantity), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
            <p className="text-gray-600">
              Manage products, sections, track traffic, and monitor expiry alerts
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('expiry')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'expiry'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 Expiry Alerts
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🛒 Manage Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📍 Manage Sections
          </button>
          <button
            onClick={() => setActiveTab('traffic')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'traffic'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👥 Traffic Monitor
          </button>
        </div>
      </div>

      {/* Expiry Alerts Tab */}
      {activeTab === 'expiry' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Critical Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {urgentAlerts.filter(a => a.priority === 1).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {urgentAlerts.filter(a => a.priority === 2).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {expiryAlerts.reduce((sum, alert) => sum + alert.product.quantity, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">At Risk Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(getTotalValue(urgentAlerts))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Urgent Alerts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">🚨 Urgent Actions Required</h2>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {urgentAlerts.length} items
              </span>
            </div>

            <div className="space-y-3">
              {urgentAlerts.slice(0, 5).map((alert, index) => (
                <div key={alert.product.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.product.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Section: {alert.product.section}</span>
                        <span>Stock: {alert.product.quantity}</span>
                        <span>Value: {formatPrice(alert.product.price * alert.product.quantity)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                        {getPriorityText(alert.priority)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.daysUntilExpiry <= 0 ? 'EXPIRED' : `${alert.daysUntilExpiry} days left`}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleMarkAsHandled(alert.product.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Mark Handled
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Expiry Alerts Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">📋 Complete Expiry Monitor</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Priority Queue: {expiryAlerts.length} items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock & Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiryAlerts.map((alert, index) => (
                    <tr key={alert.product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">
                            {index + 1}
                          </span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                            {getPriorityText(alert.priority)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{alert.product.name}</div>
                          <div className="text-sm text-gray-500">{alert.product.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.product.section}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{alert.product.quantity} units</div>
                        <div className="text-sm text-gray-500">
                          {formatPrice(alert.product.price * alert.product.quantity)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateTime(alert.product.expiryDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {alert.daysUntilExpiry <= 0 ? 'EXPIRED' : `${alert.daysUntilExpiry} days left`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleMarkAsHandled(alert.product.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Mark Handled
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Management Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Organic Milk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (LKR) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1500.00 (in Rupees)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Dairy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                <select
                  value={newProduct.section}
                  onChange={(e) => setNewProduct({...newProduct, section: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.name}>
                      {section.icon} {section.name}{section.shelfNumber && section.shelfNumber > 0 ? ` (Shelf #${section.shelfNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={newProduct.expiryDate}
                  onChange={(e) => setNewProduct({...newProduct, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Product description..."
                />
              </div>
            </div>
            <button
              onClick={handleAddProduct}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Add Product
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Products ({products.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product, index) => (
                    <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.section}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section Management Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Explanation Card */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Store Layout Positions</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-2">Your store is divided into a grid with 4 columns and 3 rows (12 sections total):</p>
                  <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded">
                    <div className="border-2 border-blue-300 p-2 text-center text-xs">Top Left<br/>Row 1, Col 1</div>
                    <div className="border-2 border-blue-300 p-2 text-center text-xs">Top Center<br/>Row 1, Col 2</div>
                    <div className="border-2 border-blue-300 p-2 text-center text-xs">Top Center<br/>Row 1, Col 3</div>
                    <div className="border-2 border-blue-300 p-2 text-center text-xs">Top Right<br/>Row 1, Col 4</div>
                    <div className="border-2 border-green-300 p-2 text-center text-xs">Middle Left<br/>Row 2, Col 1</div>
                    <div className="border-2 border-green-300 p-2 text-center text-xs">Middle Center<br/>Row 2, Col 2</div>
                    <div className="border-2 border-green-300 p-2 text-center text-xs">Middle Center<br/>Row 2, Col 3</div>
                    <div className="border-2 border-green-300 p-2 text-center text-xs">Middle Right<br/>Row 2, Col 4</div>
                    <div className="border-2 border-orange-300 p-2 text-center text-xs">Bottom Left<br/>Row 3, Col 1</div>
                    <div className="border-2 border-orange-300 p-2 text-center text-xs">Bottom Center<br/>Row 3, Col 2</div>
                    <div className="border-2 border-orange-300 p-2 text-center text-xs">Bottom Center<br/>Row 3, Col 3</div>
                    <div className="border-2 border-orange-300 p-2 text-center text-xs">Bottom Right<br/>Row 3, Col 4</div>
                  </div>
                  <p className="mt-2">Choose the position where you want to place your new section in the store layout.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Section</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Name *</label>
                <input
                  type="text"
                  value={newSection.name}
                  onChange={(e) => setNewSection({...newSection, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Electronics, Pharmacy"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Position *</label>
                <select
                  value={newSection.position}
                  onChange={(e) => setNewSection({...newSection, position: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <optgroup label="Top Row (Near Entrance)">
                    <option value="top-left">Top Left Corner</option>
                    <option value="top-center-left">Top Center-Left</option>
                    <option value="top-center-right">Top Center-Right</option>
                    <option value="top-right">Top Right Corner</option>
                  </optgroup>
                  <optgroup label="Middle Row (Center Area)">
                    <option value="middle-left">Middle Left Side</option>
                    <option value="middle-center-left">Middle Center-Left</option>
                    <option value="middle-center-right">Middle Center-Right</option>
                    <option value="middle-right">Middle Right Side</option>
                  </optgroup>
                  <optgroup label="Bottom Row (Back of Store)">
                    <option value="bottom-left">Bottom Left Corner</option>
                    <option value="bottom-center-left">Bottom Center-Left</option>
                    <option value="bottom-center-right">Bottom Center-Right</option>
                    <option value="bottom-right">Bottom Right Corner</option>
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 mt-1">Select where this section will be located in your store</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji) - Optional</label>
                <input
                  type="text"
                  value={newSection.icon}
                  onChange={(e) => setNewSection({...newSection, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 📱 🏥 💊 🍎 🥛"
                  maxLength={2}
                />
                <p className="text-xs text-gray-500 mt-1">Type or paste an emoji from your keyboard (Windows: Win + . or Mac: Cmd + Ctrl + Space)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shelf Number</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={newSection.shelfNumber}
                  onChange={(e) => setNewSection({...newSection, shelfNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0 for counters, 1-10 for shelves"
                />
                <p className="text-xs text-gray-500 mt-1">Use 1-10 for product shelves, or 0 for counters like Entrance/Cashier.</p>
              </div>
            </div>
            <button
              onClick={handleAddSection}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Add Section to Store
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Store Layout ({sections.length} sections)</h2>
            <p className="text-gray-600 mb-4">This is how your store sections are arranged:</p>
            <div className="grid grid-cols-4 gap-4">
              {sections.sort((a, b) => (a.y || 0) * 10 + (a.x || 0) - (b.y || 0) * 10 - (b.x || 0)).map(section => (
                <div key={section.id} className="border-2 border-blue-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <div className="text-4xl mb-2">{section.icon || '📦'}</div>
                  <div className="text-sm font-medium text-gray-900">{section.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Row {(section.y || 0) + 1}, Col {(section.x || 0) + 1}
                  </div>
                  {typeof section.shelfNumber !== 'undefined' && section.shelfNumber > 0 && (
                    <div className="mt-2 inline-block text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      Shelf #{section.shelfNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Traffic Monitor Tab */}
      {activeTab === 'traffic' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Traffic Monitor</h2>
            <p className="text-gray-600 mb-4">
              Monitor customer traffic in each section. Update people count to track congestion levels for smart navigation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trafficData.map(data => (
                <div key={data.sectionId} className={`border-2 rounded-lg p-4 ${getCongestionColor(data.congestionLevel)}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-gray-900">{data.sectionName}</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCongestionColor(data.congestionLevel)}`}>
                      {getCongestionText(data.congestionLevel)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current People:</span>
                      <span className="font-bold">{data.currentPeople}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Max Capacity:</span>
                      <span>{data.maxCapacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${
                          data.congestionLevel >= 0.8 ? 'bg-red-600' :
                          data.congestionLevel >= 0.6 ? 'bg-orange-500' :
                          data.congestionLevel >= 0.4 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(data.congestionLevel * 100)}%` }}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateTraffic(data.sectionId, Math.max(0, data.currentPeople - 1))}
                        className="flex-1 bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-300"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateTraffic(data.sectionId, Math.min(data.maxCapacity, data.currentPeople + 1))}
                        className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>How it works:</strong> The traffic data is used by the navigation system to calculate optimal paths.
                  Higher congestion levels will cause the pathfinding algorithm to prefer less crowded routes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
