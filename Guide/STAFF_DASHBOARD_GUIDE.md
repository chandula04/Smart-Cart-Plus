# Staff Dashboard User Guide

## Overview
The SmartCart Plus Staff Dashboard is a comprehensive management system for store staff to manage products, store sections, and track product expiry alerts.

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

<!-- Traffic monitoring removed -->

---

<!-- Traffic Monitor removed -->

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

<!-- Traffic-based routing removed -->

---

## Data Persistence Note
Data is persisted in Firebase Firestore.

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
- **Add products immediately** when new inventory arrives
- **Use consistent section names** across all entries
- **Mark items as handled** after taking action

---

## Troubleshooting

**Product not appearing in search?**
- Ensure section name matches exactly (case-sensitive)
- Check if product was added successfully (appears in Products table)

**Section not showing in navigation?**
- Verify X,Y coordinates are within grid (0-3, 0-2)
- Check that section name is unique

<!-- Traffic troubleshooting removed -->

---

## Future Enhancements
- Barcode scanning for product addition
- Push notifications for critical expiry alerts
- Integration with Point of Sale (POS) system
- Predictive expiry management with ML

---

**Last Updated:** January 2025
**System Version:** SmartCart Plus v1.0
