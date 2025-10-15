# Staff Dashboard User Guide

## Overview
The SmartCart Plus Staff Dashboard is a comprehensive management system for store staff to manage products, store sections, monitor traffic, and track product expiry alerts.

## Features

### 1. 📋 Expiry Alerts Tab
Monitor products approaching their expiry dates using a Min-Heap priority queue algorithm.

**Features:**
- **Real-time Statistics:**
  - Critical Alerts count (expiring within 12 hours)
  - High Priority alerts (expiring within 1 day)
  - Total inventory items monitored
  - Total value at risk

- **Urgent Actions Section:**
  - Top 5 most urgent items requiring immediate attention
  - Shows section location, stock quantity, and monetary value
  - Priority levels: CRITICAL, HIGH, MEDIUM, LOW
  - Quick "Mark Handled" action to remove items from queue

- **Complete Expiry Monitor Table:**
  - Full list of all products sorted by expiry priority
  - Detailed information: product name, category, section, stock, expiry date
  - Visual priority badges with color coding
  - Individual handling actions

**Algorithm:** Min-Heap data structure ensures O(log n) insertion and O(1) access to most critical item.

---

### 2. 🛒 Manage Products Tab
Add new products to the system and view current inventory.

**Add New Product Form:**
Required fields:
- **Product Name** (e.g., "Organic Milk")
- **Price** (e.g., 4.99)
- **Section** (dropdown with all store sections)

Optional fields:
- Category (e.g., "Dairy")
- Expiry Date (for perishable items)
- Quantity (stock count)
- Description (product details)

**How to Add a Product:**
1. Fill in all required fields (marked with *)
2. Select the section from dropdown (shows icon + name)
3. Optionally set expiry date for perishable items
4. Click "Add Product" button
5. Product will appear in both Products page and Navigation system

**Current Products Table:**
- View all products in the system
- Shows: Name, Category, Price, Section, Quantity, Expiry Date
- Sortable and searchable list

---

### 3. 📍 Manage Sections Tab
Add new store sections and view the current store layout.

**Add New Section Form:**
Required fields:
- **Section Name** (e.g., "Electronics")
- **X Position** (0-3, grid column)
- **Y Position** (0-2, grid row)

Optional field:
- Icon (emoji, e.g., "📱")

**Store Layout Grid (4x3):**
```
[0,0] [1,0] [2,0] [3,0]
[0,1] [1,1] [2,1] [3,1]
[0,2] [1,2] [2,2] [3,2]
```

**Default Sections:**
- Row 0: Entrance (🚪), Dairy & Eggs (🥛), Bakery (🍞), Fresh Fruits (🍎)
- Row 1: Vegetables (🥬), Customer Service (ℹ️), Beverages (🥤), Meat & Seafood (🍖)
- Row 2: Frozen Foods (🧊), Snacks & Sweets (🍪), Household Items (🧹), Checkout Counter (💳)

**How to Add a Section:**
1. Enter section name
2. Choose an emoji icon (optional, defaults to 📦)
3. Set X position (0-3) and Y position (0-2)
4. Click "Add Section"
5. New section appears in both Navigation page dropdowns

**Note:** New sections automatically get added to the traffic monitoring system.

---

### 4. 👥 Traffic Monitor Tab
Real-time customer traffic monitoring for crowd management and smart navigation.

**Features:**
- Monitor people count in each section
- Visual congestion level indicators
- Color-coded traffic status:
  - 🟢 Green (Clear): < 40% capacity
  - 🟡 Yellow (Low): 40-60% capacity
  - 🟠 Orange (Moderate): 60-80% capacity
  - 🔴 Red (High Traffic): ≥ 80% capacity

**How to Update Traffic:**
1. Find the section card
2. Use **-** button to decrease people count
3. Use **+** button to increase people count
4. Progress bar shows current congestion level
5. Timestamp shows last update time

**Traffic Data:**
- Current People: Number of customers in section
- Max Capacity: Maximum recommended capacity (default: 25)
- Congestion Level: Calculated as currentPeople / maxCapacity
- Auto-updates last modified timestamp

**Integration with Navigation:**
The traffic data is used by Dijkstra's pathfinding algorithm to calculate optimal routes:
- High congestion = higher path cost
- Algorithm prefers less crowded routes
- Customers get recommendations to avoid busy areas

**Formula:**
```
Congestion Level = Current People ÷ Max Capacity
Path Weight = Base Distance × (1 + Congestion Level)
```

---

## System Integration

### Navigation System
- All products added here appear in the Products page search
- Sections added here appear in Navigation dropdown menus
- Product sections must match navigation sections for proper routing

### Expiry Alert System
- Products with expiry dates automatically added to Min-Heap
- Priority calculated based on:
  - Days until expiry
  - Product value (price × quantity)
  - Stock quantity
- Alerts update in real-time as dates approach

### Traffic-Based Routing
- Navigation page uses traffic data for pathfinding
- Dijkstra's algorithm considers congestion when calculating shortest path
- Routes dynamically adjust based on current store traffic

---

## Data Persistence Note
Currently, all data is stored in browser memory (client-side state). Data will reset on page refresh. 

**For Production:**
- Integrate with Firebase or similar database
- Implement API endpoints for CRUD operations
- Add authentication for staff access
- Enable real-time updates across multiple devices

---

## Algorithms Used

1. **Min-Heap (Expiry System):** O(log n) insertion, O(1) min retrieval
2. **Binary Search (Product Lookup):** O(log n) search time
3. **Merge Sort (Product Sorting):** O(n log n) sorting
4. **Dijkstra's Algorithm (Navigation):** O((V+E) log V) pathfinding
5. **BFS (Store Layout):** O(V+E) traversal for connectivity

---

## Tips for Staff

- **Check Expiry Tab daily** for critical alerts
- **Update traffic data regularly** during busy hours
- **Add products immediately** when new inventory arrives
- **Use consistent section names** across all entries
- **Mark items as handled** after taking action
- **Monitor high-traffic sections** to prevent overcrowding

---

## Troubleshooting

**Product not appearing in search?**
- Ensure section name matches exactly (case-sensitive)
- Check if product was added successfully (appears in Products table)

**Section not showing in navigation?**
- Verify X,Y coordinates are within grid (0-3, 0-2)
- Check that section name is unique

**Traffic data not affecting routes?**
- Ensure traffic levels are updated (click + or -)
- Higher congestion should show darker colors
- Navigation system will prefer lower congestion paths

---

## Future Enhancements
- Barcode scanning for product addition
- Automated traffic counting with sensors
- Push notifications for critical expiry alerts
- Integration with Point of Sale (POS) system
- Historical traffic pattern analysis
- Predictive expiry management with ML

---

**Last Updated:** January 2025
**System Version:** SmartCart Plus v1.0
