'use client';

import { useState, useEffect } from 'react';
import { SmartExpiryAlert } from '@/algorithms/smartExpiryAlert';
import { Product, ExpiryAlert } from '@/types';

export default function StaffDashboard() {
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [urgentAlerts, setUrgentAlerts] = useState<ExpiryAlert[]>([]);
  const [expirySystem] = useState(() => new SmartExpiryAlert());
  const [refreshCount, setRefreshCount] = useState(0);

  // Sample inventory data
  useEffect(() => {
    const inventoryProducts: Product[] = [
      {
        id: 'inv1', name: 'Milk (Organic)', price: 4.99, category: 'Dairy', aisle: 'A1',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        inStock: true, quantity: 15
      },
      {
        id: 'inv2', name: 'Chicken Breast', price: 8.99, category: 'Meat', aisle: 'D3',
        expiryDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000), // 12 hours
        inStock: true, quantity: 8
      },
      {
        id: 'inv3', name: 'Bread (Whole Wheat)', price: 3.49, category: 'Bakery', aisle: 'B2',
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        inStock: true, quantity: 12
      },
      {
        id: 'inv4', name: 'Yogurt (Greek)', price: 5.49, category: 'Dairy', aisle: 'A1',
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        inStock: true, quantity: 25
      },
      {
        id: 'inv5', name: 'Salmon Fillet', price: 12.99, category: 'Seafood', aisle: 'D2',
        expiryDate: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000), // 1.5 days
        inStock: true, quantity: 6
      },
      {
        id: 'inv6', name: 'Bananas', price: 2.99, category: 'Produce', aisle: 'C1',
        expiryDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), // Expired 12 hours ago
        inStock: true, quantity: 20
      },
      {
        id: 'inv7', name: 'Ground Beef', price: 7.99, category: 'Meat', aisle: 'D3',
        expiryDate: new Date(Date.now() + 0.8 * 24 * 60 * 60 * 1000), // 20 hours
        inStock: true, quantity: 10
      },
      {
        id: 'inv8', name: 'Lettuce (Romaine)', price: 2.49, category: 'Produce', aisle: 'C1',
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
        inStock: true, quantity: 18
      },
      {
        id: 'inv9', name: 'Cheese (Cheddar)', price: 6.99, category: 'Dairy', aisle: 'A1',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        inStock: true, quantity: 14
      },
      {
        id: 'inv10', name: 'Strawberries', price: 4.99, category: 'Produce', aisle: 'C1',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        inStock: true, quantity: 22
      }
    ];

    // Clear and populate expiry system
    expirySystem.clear();
    inventoryProducts.forEach(product => {
      expirySystem.addProduct(product);
    });

    updateAlerts();
  }, [expirySystem, refreshCount]);

  const updateAlerts = () => {
    // Get top 10 expiring products
    const alerts = expirySystem.getTopExpiringProducts(10);
    setExpiryAlerts(alerts);

    // Get urgent alerts (expiring within 2 days)
    const urgent = expirySystem.getProductsExpiringWithin(2);
    setUrgentAlerts(urgent);
  };

  const handleMarkAsHandled = (productId: string) => {
    expirySystem.removeProduct(productId);
    setRefreshCount(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatDateTime = (date: Date) => {
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
              Smart Expiry Alert System - Monitor products nearing expiration using Min-Heap algorithm
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

      {/* Algorithm Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-purple-600 text-white rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Min-Heap Algorithm</h3>
            <p className="text-purple-700 text-sm">
              Efficiently maintains priority queue of products by expiry date • O(log n) insert/extract
            </p>
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
                    <span>Aisle: {alert.product.aisle}</span>
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

      {/* All Expiry Alerts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">📋 Complete Expiry Monitor</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Priority Queue: {expiryAlerts.length} items
          </span>
        </div>

        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock & Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
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
                    {alert.product.aisle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {alert.product.quantity} units
                    </div>
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
  );
}