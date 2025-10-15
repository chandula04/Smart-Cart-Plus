'use client';

import { useState } from 'react';
import { RushHourNavigator } from '@/algorithms/rushHourNavigator';
import { Position, NavigationPath } from '@/types';

export default function NavigationPage() {
  const [navigator] = useState(() => new RushHourNavigator());
  const [startPosition, setStartPosition] = useState<Position>({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState<Position>({ x: 3, y: 2 });
  const [navigationPath, setNavigationPath] = useState<NavigationPath | null>(null);
  const [alternativePaths, setAlternativePaths] = useState<NavigationPath[]>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Store layout - 4x3 grid
  const gridWidth = 4;
  const gridHeight = 3;

  const handleFindPath = () => {
    const path = navigator.findOptimalPath(startPosition, endPosition);
    setNavigationPath(path);
    setShowAlternatives(false);
  };

  const handleFindAlternatives = () => {
    const paths = navigator.getAlternativePaths(startPosition, endPosition, 3);
    setAlternativePaths(paths);
    setShowAlternatives(true);
    if (paths.length > 0) {
      setNavigationPath(paths[0]);
    }
  };

  const handleClearPath = () => {
    setNavigationPath(null);
    setAlternativePaths([]);
    setShowAlternatives(false);
  };

  const isOnPath = (x: number, y: number): boolean => {
    if (!navigationPath) return false;
    return navigationPath.path.some(pos => pos.x === x && pos.y === y);
  };

  const isStartPosition = (x: number, y: number): boolean => {
    return startPosition.x === x && startPosition.y === y;
  };

  const isEndPosition = (x: number, y: number): boolean => {
    return endPosition.x === x && endPosition.y === y;
  };

  const getCellColor = (x: number, y: number): string => {
    if (isStartPosition(x, y)) return 'bg-green-500 border-green-600';
    if (isEndPosition(x, y)) return 'bg-red-500 border-red-600';
    if (isOnPath(x, y)) return 'bg-blue-300 border-blue-500';
    return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
  };

  const getAisleName = (x: number, y: number): string => {
    const aisleMap: { [key: string]: string } = {
      '0,0': 'Entrance',
      '3,2': 'Checkout',
      '1,1': 'Center',
      '2,1': 'Center',
    };
    const key = `${x},${y}`;
    return aisleMap[key] || `Aisle ${String.fromCharCode(65 + y)}${x + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Navigation</h1>
        <p className="text-gray-600">
          Find the optimal path through the store avoiding congestion
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Route Planning</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Start Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Position
            </label>
            <div className="flex space-x-2">
              <select
                value={startPosition.x}
                onChange={(e) => setStartPosition({...startPosition, x: Number(e.target.value)})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: gridWidth }, (_, i) => (
                  <option key={i} value={i}>X: {i}</option>
                ))}
              </select>
              <select
                value={startPosition.y}
                onChange={(e) => setStartPosition({...startPosition, y: Number(e.target.value)})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: gridHeight }, (_, i) => (
                  <option key={i} value={i}>Y: {i}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Current: {getAisleName(startPosition.x, startPosition.y)}
            </p>
          </div>

          {/* End Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <div className="flex space-x-2">
              <select
                value={endPosition.x}
                onChange={(e) => setEndPosition({...endPosition, x: Number(e.target.value)})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: gridWidth }, (_, i) => (
                  <option key={i} value={i}>X: {i}</option>
                ))}
              </select>
              <select
                value={endPosition.y}
                onChange={(e) => setEndPosition({...endPosition, y: Number(e.target.value)})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: gridHeight }, (_, i) => (
                  <option key={i} value={i}>Y: {i}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Current: {getAisleName(endPosition.x, endPosition.y)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleFindPath}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Find Optimal Route
          </button>
          <button
            onClick={handleFindAlternatives}
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-medium transition-colors"
          >
            Show Alternatives
          </button>
          <button
            onClick={handleClearPath}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Store Map */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Store Map</h2>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 border-2 border-green-600 rounded"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 border-2 border-red-600 rounded"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-300 border-2 border-blue-500 rounded"></div>
            <span>Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded"></div>
            <span>Available</span>
          </div>
        </div>

        {/* Grid */}
        <div className="inline-block">
          {Array.from({ length: gridHeight }, (_, y) => (
            <div key={y} className="flex">
              {Array.from({ length: gridWidth }, (_, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-24 h-24 border-2 ${getCellColor(x, y)} transition-colors cursor-pointer flex flex-col items-center justify-center text-center p-2`}
                  onClick={() => {
                    if (!isStartPosition(x, y) && !isEndPosition(x, y)) {
                      setStartPosition({ x, y });
                    }
                  }}
                >
                  <div className="text-xs font-medium text-gray-700">
                    {getAisleName(x, y)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ({x}, {y})
                  </div>
                  {isStartPosition(x, y) && (
                    <div className="text-xs font-bold text-white mt-1">START</div>
                  )}
                  {isEndPosition(x, y) && (
                    <div className="text-xs font-bold text-white mt-1">END</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Results */}
      {navigationPath && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Route Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Distance</div>
              <div className="text-2xl font-bold text-blue-900">
                {navigationPath.totalDistance.toFixed(1)} units
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Estimated Time</div>
              <div className="text-2xl font-bold text-green-900">
                {navigationPath.estimatedTime.toFixed(1)} min
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-600 font-medium">Congestion Level</div>
              <div className="text-2xl font-bold text-orange-900">
                {navigationPath.congestionLevel.toFixed(1)}/5
              </div>
            </div>
          </div>

          {/* Step by Step Directions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Step-by-Step Directions</h3>
            <div className="space-y-2">
              {navigationPath.path.map((pos, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {getAisleName(pos.x, pos.y)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Position: ({pos.x}, {pos.y})
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      Start
                    </span>
                  )}
                  {index === navigationPath.path.length - 1 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      Destination
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alternative Routes */}
      {showAlternatives && alternativePaths.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Alternative Routes</h2>
          
          <div className="space-y-4">
            {alternativePaths.map((path, index) => (
              <div 
                key={index}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  navigationPath === path 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setNavigationPath(path)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Route {index + 1} {index === 0 && '(Recommended)'}
                  </h3>
                  {navigationPath === path && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                      Selected
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium ml-2">{path.totalDistance.toFixed(1)} units</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium ml-2">{path.estimatedTime.toFixed(1)} min</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Congestion:</span>
                    <span className="font-medium ml-2">{path.congestionLevel.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
