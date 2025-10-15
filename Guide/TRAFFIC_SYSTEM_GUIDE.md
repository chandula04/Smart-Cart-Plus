# Traffic Tracking & Congestion System

## Overview
SmartCart Plus includes a real-time traffic monitoring system that tracks customer movement throughout the store and calculates optimal navigation paths based on current congestion levels.

## How It Works

### 1. Traffic Data Collection
Each store section tracks:
```typescript
{
  sectionId: string,        // Unique identifier
  sectionName: string,      // e.g., "Dairy & Eggs"
  currentPeople: number,    // Current customer count
  maxCapacity: number,      // Maximum recommended capacity (25)
  congestionLevel: number,  // Calculated ratio (0.0 - 1.0)
  lastUpdated: Date         // Timestamp of last update
}
```

### 2. Congestion Level Calculation
```javascript
congestionLevel = currentPeople / maxCapacity
```

**Example:**
- Section: Dairy & Eggs
- Current People: 15
- Max Capacity: 25
- Congestion Level: 15 ÷ 25 = 0.6 (60%)

### 3. Status Classification
| Congestion Level | Status | Color | Description |
|-----------------|--------|-------|-------------|
| < 0.4 (0-40%) | Clear | 🟢 Green | Low traffic, easy movement |
| 0.4-0.6 (40-60%) | Low | 🟡 Yellow | Moderate traffic |
| 0.6-0.8 (60-80%) | Moderate | 🟠 Orange | Getting busy |
| ≥ 0.8 (80%+) | High Traffic | 🔴 Red | Crowded, avoid if possible |

## Integration with Navigation

### Dijkstra's Algorithm Enhancement
The standard Dijkstra's algorithm is enhanced to consider real-time traffic:

**Standard Path Cost:**
```
cost = distance_between_nodes
```

**Enhanced Path Cost:**
```
cost = distance × (1 + congestionLevel)
```

**Example Calculation:**
```
Path A: Distance = 5, Congestion = 0.2 (20%)
Cost = 5 × (1 + 0.2) = 6

Path B: Distance = 6, Congestion = 0.0 (0%)
Cost = 6 × (1 + 0.0) = 6

Both paths have equal weighted cost!
```

### Path Selection Logic
1. Calculate all possible paths using Dijkstra's algorithm
2. Apply traffic multiplier to each edge cost
3. Select path with minimum total weighted cost
4. Prefer routes through less congested sections
5. Re-calculate if traffic conditions change

## Real-World Usage

### For Customers
**Navigation Page:**
1. Select destination section
2. System calculates multiple possible paths
3. Recommends path avoiding high-traffic areas
4. Shows estimated time based on congestion

**Example:**
```
From: Entrance (0,0)
To: Meat & Seafood (3,1)

Route Options:
1. Direct path through Beverages (Moderate traffic)
   - Distance: 4 units
   - Congestion penalty: +40%
   - Total cost: 5.6

2. Alternate path through Bakery (Clear)
   - Distance: 5 units
   - Congestion penalty: +10%
   - Total cost: 5.5
   
✅ Recommended: Route 2 (slightly longer but less crowded)
```

### For Staff
**Traffic Monitor Tab:**
1. View real-time congestion in all sections
2. Manually update people counts
3. Identify bottlenecks and crowded areas
4. Direct customers to less busy sections
5. Plan restocking during low-traffic periods

## Manual Traffic Updates

### Staff Dashboard Process
1. Navigate to "👥 Traffic Monitor" tab
2. Locate section card
3. Click **+** to increment people count
4. Click **-** to decrement people count
5. System automatically:
   - Recalculates congestion level
   - Updates color indicator
   - Refreshes progress bar
   - Records timestamp

### Visual Feedback
```
[Section Card]
┌─────────────────────────────┐
│ Dairy & Eggs        [Clear] │
│                             │
│ Current People: 8           │
│ Max Capacity: 25            │
│ ████░░░░░░ 32%             │
│                             │
│ [  -  ] [  +  ]            │
│ Updated: 10:45 AM           │
└─────────────────────────────┘
```

## Automatic Traffic Tracking (Future)

### Sensor Integration
For production deployment, consider:

**1. People Counters**
- Install IR sensors at section entrances
- Increment count on entry
- Decrement count on exit
- Real-time data stream to dashboard

**2. Camera-Based Tracking**
- Computer vision (YOLO, OpenCV)
- Detect and count people
- Track movement patterns
- Privacy-compliant anonymization

**3. WiFi/Bluetooth Beacons**
- Detect smartphone signals
- Estimate people density
- Track dwell time
- Aggregate anonymous data

**4. Weight Sensors**
- Floor pressure mats
- Estimate occupancy by weight
- No privacy concerns
- Cost-effective solution

## API Integration Example

### Future Implementation
```typescript
// Real-time traffic update endpoint
POST /api/traffic/update
{
  "sectionId": "dairy",
  "peopleCount": 12,
  "timestamp": "2025-01-15T10:45:00Z"
}

// Response
{
  "success": true,
  "congestionLevel": 0.48,
  "status": "Low",
  "recommendation": "Normal traffic, all clear"
}

// Get all traffic data
GET /api/traffic/current

// Response
{
  "sections": [
    {
      "sectionId": "dairy",
      "currentPeople": 12,
      "congestionLevel": 0.48,
      "status": "Low"
    },
    ...
  ],
  "lastUpdate": "2025-01-15T10:45:00Z"
}
```

## Benefits

### For Customers
✅ Avoid crowded areas
✅ Faster shopping experience
✅ More comfortable navigation
✅ Reduced wait times
✅ Better social distancing

### For Store
✅ Improved customer satisfaction
✅ Better space utilization
✅ Identify peak hours
✅ Optimize staff placement
✅ Data-driven decisions

### For Staff
✅ Monitor store capacity
✅ Manage crowd flow
✅ Quick response to congestion
✅ Evidence-based scheduling
✅ Safety compliance

## Performance Metrics

### Computational Complexity
- **Traffic Update:** O(1) - Direct array update
- **Congestion Calculation:** O(1) - Simple division
- **Path Recalculation:** O((V+E) log V) - Dijkstra's with V sections, E connections
- **Real-time Display:** O(n) - Update n section cards

### Storage Requirements
- Per section: ~200 bytes
- 12 sections: ~2.4 KB
- Hourly snapshots: ~58 KB per day
- Monthly history: ~1.7 MB

## Testing & Validation

### Test Scenarios

**1. Rush Hour Simulation**
```
Time: 5:00 PM
Entrance: 5 people
Meat & Seafood: 20 people (80% - RED)
Dairy: 18 people (72% - ORANGE)
Checkout: 22 people (88% - RED)

Expected: Routes avoid Meat & Seafood and Checkout
Actual: ✅ System recommends alternate paths
```

**2. Low Traffic Period**
```
Time: 10:00 AM
All sections: < 5 people (< 20% - GREEN)

Expected: Direct shortest paths recommended
Actual: ✅ Standard Dijkstra's results
```

**3. Partial Congestion**
```
Dairy (HIGH) → Bakery (CLEAR) → Fruits (CLEAR)
Customer wants: Entrance → Dairy

Expected: Route through Bakery despite longer distance
Actual: ✅ Smart rerouting works
```

## Monitoring Dashboard

### Key Metrics to Track
1. **Average Congestion Level** - Overall store traffic
2. **Peak Hours** - Busiest times of day
3. **Bottleneck Sections** - Consistently crowded areas
4. **Path Recalculation Rate** - How often routes change
5. **Customer Wait Time** - Improved after implementation

### Alerts & Notifications
- 🔴 **Critical:** Section > 90% capacity
- 🟠 **Warning:** Multiple sections > 70% capacity
- 🟡 **Info:** Unusual traffic patterns detected
- 🟢 **Normal:** All sections operating normally

## Best Practices

### For Staff
1. **Update frequently** - Every 5-10 minutes during peak hours
2. **Be accurate** - Count carefully, don't estimate wildly
3. **Respond to alerts** - Direct customers away from red zones
4. **Record patterns** - Note recurring congestion points
5. **Adjust capacity** - Modify maxCapacity based on real observations

### For System Administrators
1. **Calibrate max capacity** - Based on physical space and safety regulations
2. **Set update intervals** - Balance accuracy vs. performance
3. **Monitor data quality** - Validate sensor readings
4. **Backup data** - Store historical patterns
5. **Privacy compliance** - Anonymize all tracking data

## Conclusion
The traffic tracking system transforms SmartCart Plus from a simple navigation tool into an intelligent crowd management platform. By combining real-time data with optimized pathfinding algorithms, it creates a better shopping experience while improving store operations.

---

**Key Formulas:**
```
Congestion Level = Current People ÷ Max Capacity
Enhanced Edge Cost = Distance × (1 + Congestion Level)
Total Path Cost = Σ(Enhanced Edge Costs)
```

**Next Steps:**
1. Implement in Staff Dashboard ✅
2. Integrate with Navigation System ✅
3. Add sensor hardware (Future)
4. Deploy machine learning predictions (Future)

---

**Document Version:** 1.0
**Last Updated:** January 2025
