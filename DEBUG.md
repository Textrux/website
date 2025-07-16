# 🔍 Textrux Debug Interface

The Textrux web application includes a built-in debugging interface that you can access through the browser's developer console.

## How to Access

1. **Open the Textrux web application** in your browser
2. **Open Developer Tools** (F12 or right-click → Inspect)
3. **Go to the Console tab**
4. **Look for the debug interface ready message** when the grid loads

## Available Commands

Once the grid loads, you'll see a message in the console confirming the debug interface is ready, along with the available commands:

### 🔄 `textruxDebug.parseGrid()`
Re-parses the entire grid and shows detailed parsing results.

**Example:**
```javascript
textruxDebug.parseGrid()
```

**Output:** Shows grouped console logs with:
- Number of blocks found
- Each cell cluster detected
- Construct types and binary keys
- Cell bounds and counts

### 🔍 `textruxDebug.inspectCell(row, col)`
Inspects a specific cell and shows which construct (if any) contains it.

**Example:**
```javascript
textruxDebug.inspectCell(2, 3)  // Inspect cell R2C3
```

**Output:** Shows:
- Cell content
- Which block/cluster contains the cell
- Construct type and binary key

### 📋 `textruxDebug.showAllConstructs()`
Lists all detected constructs in the current grid.

**Example:**
```javascript
textruxDebug.showAllConstructs()
```

**Output:** Shows:
- Numbered list of all constructs
- Construct types (table, matrix, key-value, tree, list)
- Binary keys used for detection
- Cell bounds for each construct

### 📊 `textruxDebug.getGridData()`
Exports the current grid data as CSV format.

**Example:**
```javascript
const csvData = textruxDebug.getGridData()
```

**Output:** Returns the grid data as a CSV string and logs it to console.

## Automatic Parsing Logs

The system automatically logs parsing results whenever the grid changes:

- **🔍 Textrux Parse Results** - Main parsing group
- **📊 Blocks found** - Number of blocks detected
- **📦 Block X** - Individual block details
- **🎯 Cluster X** - Construct type and binary key for each cluster

## Binary Key System

The debug interface shows the revolutionary binary key system in action:

- **Key 15 (1111)**: Table - All corner cells filled
- **Key 7 (0111)**: Matrix - Empty top-left corner
- **Key 9 (1001)**: Key-Value - Specific corner pattern
- **Key 10-13**: Tree variants - Different orientations and headers
- **Key VL**: Vertical List - Single column pattern
- **Key HL**: Horizontal List - Single row pattern

## Example Debugging Session

1. **Add some data to the grid** (create a simple table or tree)
2. **Check what was detected:**
   ```javascript
   textruxDebug.showAllConstructs()
   ```
3. **Inspect a specific cell:**
   ```javascript
   textruxDebug.inspectCell(1, 1)  // Check what's in the top-left
   ```
4. **Re-parse if needed:**
   ```javascript
   textruxDebug.parseGrid()
   ```
5. **Export the data:**
   ```javascript
   textruxDebug.getGridData()
   ```

## Tips

- The interface updates automatically when the grid changes
- All functions are available globally on the `window.textruxDebug` object
- Console logs use grouped formatting for easy reading
- Binary keys provide instant construct identification
- Cell coordinates use 1-based indexing (R1C1, R2C3, etc.)

## Troubleshooting

If the debug interface isn't available:
1. Make sure the grid has fully loaded
2. Check that you're in a development environment
3. Refresh the page and wait for the "Debug Interface Ready!" message
4. Try typing `window.textruxDebug` to see if the object exists

This debugging interface provides deep insight into the revolutionary Cell Cluster Key system and helps you understand how Textrux automatically detects and constructs spatial programming structures!