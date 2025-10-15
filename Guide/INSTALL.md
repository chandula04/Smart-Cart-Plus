# SmartCart Plus - Installation Guide

## Quick Start

### Step 1: Install Node.js
Download and install Node.js (v18 or higher) from [https://nodejs.org/](https://nodejs.org/)

### Step 2: Install Dependencies
Open terminal/command prompt in the project directory and run:

```bash
npm install
```

If you encounter permission issues on Windows, try:
```bash
# Enable script execution (run PowerShell as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run npm install
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open Application
Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## Project Features

✅ **Binary Search Algorithm** - Fast product search (O(log n))
✅ **Merge Sort Algorithm** - Efficient product sorting (O(n log n))  
✅ **Rush Hour Navigator** - Enhanced Dijkstra's with congestion weights
✅ **Smart Expiry Alert** - Min-Heap for priority-based inventory management
✅ **Product Recommendations** - BFS for "frequently bought together"

## Pages

- **Home (/)** - Main dashboard with all algorithms demonstration
- **Products (/products)** - Advanced product catalog with search & filtering
- **Staff (/staff)** - Inventory management dashboard with expiry alerts

## Troubleshooting

### Common Issues:

1. **Node.js not found**: Ensure Node.js is installed and added to PATH
2. **Permission denied**: Run terminal as administrator on Windows
3. **Port 3000 in use**: Kill existing process or use different port with `npm run dev -- -p 3001`

### Build for Production:
```bash
npm run build
npm start
```

## PDSA Course Requirements

This project demonstrates:
- Data Structures: Arrays, Trees, Graphs, Heaps, Priority Queues
- Algorithms: Binary Search, Merge Sort, Dijkstra's, BFS, Min-Heap operations
- Time Complexity Analysis: O(log n), O(n log n), O(V + E)
- Real-world Applications: Shopping optimization, inventory management