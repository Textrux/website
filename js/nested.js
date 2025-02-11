/******************************************************
 * treetNested.js
 *
 * Replicates the Excel "nested CSV in a cell" approach.
 ******************************************************/

(function () {
  // We'll define some top-level variables or references:

  // Markers / patterns used for nested levels:
  //  - A cell that starts with "," indicates it has an embedded grid.
  //  - The first cell (R1C1) can contain '^' plus CSV for parent “wrapper.”
  //  - When we enter a nested cell, that cell’s contents are replaced with a marker like `<<)1(>>`.
  //  - The top cell has CSV with placeholders to embed deeper levels, etc.

  // Listen for F3 and Escape in the global document:
  document.addEventListener("keydown", (e) => {
    if (e.key === "F3") {
      e.preventDefault();
      if (window.selectedCells && window.selectedCells.length === 1) {
        let cell = window.selectedCells[0];
        enterNestedCell(cell);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      leaveNestedCell();
    }
  });

  /******************************************************
   * enterNestedCell(selectedCell)
   ******************************************************/
  function enterNestedCell(selectedCell) {
    // 1) If the cell is empty, put a comma.
    let key = getCellKey(selectedCell);
    if (!window.cellsData[key] || window.cellsData[key].trim() === "") {
      window.cellsData[key] = ",";
      selectedCell.textContent = ",";
    }

    // 2) Check if the first character is a comma => signals a nested grid.
    if (!window.cellsData[key].startsWith(",")) {
      return; // Not a nestable cell; do nothing.
    }

    // 3) Grab the “wrapper” in the first cell (R1C1), if present
    let firstCellKey = "R1C1";
    let csvWrapper = window.cellsData[firstCellKey] || "";

    // 4) Determine current nested depth. If first cell starts with '^', it’s the top-level wrapper.
    let currentDepth = 0;
    if (csvWrapper.startsWith("^")) {
      // Attempt to see if there's a marker like `^<<)2(>>...`
      // Or parse from the formula in your original Excel code
      // For simplicity, we can store the depth in the string if we want
      currentDepth = getDepthFromWrapper(csvWrapper);
    }

    // 5) Convert *this* cell’s contents from CSV => array
    let rawNestedCsv = window.cellsData[key];
    let nestedArray = fromCSV(rawNestedCsv); // from csv.js

    // 6) Replace that cell’s content with a simple marker for the new nest:
    let newDepth = currentDepth + 1;
    window.cellsData[key] = `<<)${newDepth}(>>`;
    selectedCell.textContent = `<<)${newDepth}(>>`;

    // 7) Clear out the wrapper from R1C1 if we are deeper than the initial level
    if (currentDepth > 0) {
      window.cellsData[firstCellKey] = "";
    }

    // 8) Convert the *entire* existing sheet to CSV
    //    (so we can embed it as the new parent CSV in R1C1).
    let sheetCsv = sheetToCsv(false);

    // 9) Now wipe the entire sheet
    window.cellsData = {};

    // 10) Put the nestedArray content as the “new sheet”
    arrayToSheet(nestedArray);

    // 11) Put the wrapper CSV in the new R1C1
    if (currentDepth === 0) {
      // This is the first time we nested; store the old sheet in R1C1 as '^' + CSV
      window.cellsData[firstCellKey] = "^" + sheetCsv;
    } else {
      // We are going deeper inside an already nested structure.
      // In the original code, we look for the marker in the wrapper
      // and replace it with the new sub-CSV plus a nested marker.
      let newCsvWrapper = replaceMarkerInWrapper(
        csvWrapper,
        currentDepth,
        sheetCsv
      );
      window.cellsData[firstCellKey] = newCsvWrapper;
    }

    // 12) Re-parse and re-render
    window.parseAndFormatGrid();

    // Optionally, set focus to something like R1C2
    let newFocusCell = document.querySelector(
      "#spreadsheet td[data-row='1'][data-col='2']"
    );
    if (newFocusCell) {
      clearSelection();
      newFocusCell.classList.add("selected");
      window.selectedCells = [newFocusCell];
      window.selectedCell = newFocusCell;
    }
  }

  /******************************************************
   * leaveNestedCell()
   ******************************************************/
  function leaveNestedCell() {
    // 1) Check if we’re actually in a nested sheet by seeing if R1C1 starts with '^'.
    let firstCellKey = "R1C1";
    let currentParentCsv = window.cellsData[firstCellKey] || "";

    if (!currentParentCsv.startsWith("^")) {
      // Not in a nested grid, so do nothing.
      return;
    }

    // 2) Determine nested depth
    let currentDepth = getDepthFromWrapper(currentParentCsv);
    if (currentDepth === 0) {
      // Means we can’t go up any further
      return;
    }

    // 3) Convert the entire *current* sheet to CSV so we can embed it back into the parent's marker.
    let currentSheetCsvWithoutParentCell = sheetToCsv(true);
    if (!currentSheetCsvWithoutParentCell.trim()) {
      currentSheetCsvWithoutParentCell = ","; // Ensure there's at least one empty cell
    }

    // 4) Clear out the entire grid before restoring the parent
    window.cellsData = {};

    // 5) Restore parent grid with updated nested content
    if (currentDepth > 1) {
      // Look in the parent CSV (in cell R1C1)
      // and grab out the part of that CSV that represents the next highest level
      // So in the example below, if the currentDepth is 2 then grab out all
      // the CSV between <<(1) and (1)>> since that is the CSV for the next level
      // ^,,,
      // ,,,
      // ,,a,
      // ,,,<<(1),,,
      // ,,,
      // ,,b,
      // ,,,<<)2(>>(1)>>
      let nextHighestGridDepth = currentDepth - 1;
      let nextHighestGridFirstSplit = currentParentCsv.split(
        `(${nextHighestGridDepth})>>`
      )[0]; // Get everything before "(depth)>>"
      let nextHighestGridAsCsvWithMarker = nextHighestGridFirstSplit.split(
        `<<(${nextHighestGridDepth})`
      )[1]; // Get everything after "<<(depth)"

      // In our example we now have this CSV for the next grid to replace the current grid
      // ,,,
      // ,,,
      // ,,b,
      // ,,,<<)2(>>

      // but before we can use this CSV to replace the contents of the current grid (level 2)
      // with the contents of the CSV from level 1 (from our example above)
      // we have to replace the <<)2(>> in that CSV with the current grid (level 2) as CSV

      // so first define <<)2(>>
      let currentGridLevelMarker = `<<)${currentDepth}(>>`;
      // then we need to take the current sheets CSV without the parent cell
      // and replace any quotes with double quotes (per the CSV standard)
      let currentSheetCsvWithoutParentCellEscaped =
        currentSheetCsvWithoutParentCell.replace(/"/g, `""`); // Escape double quotes
      // now we need to wrap that
      let currentSheetCsvWithoutParentCellEscapedWrappedInQuotes = `"${currentSheetCsvWithoutParentCellEscaped}"`; // Wrap the whole thing in quotes

      // now we need to replace the marker in the nextHighestGridAsCsvWithMarker
      let nextHighestGridAsCsvWithMarkerReplaced =
        nextHighestGridAsCsvWithMarker.replace(
          currentGridLevelMarker,
          currentSheetCsvWithoutParentCellEscapedWrappedInQuotes
        );

      // In our example we now have this CSV for the next grid to replace the current grid
      // notice the <<)2(>> has now ben replaced with the current grid converted to CSV
      // ,,,
      // ,,,
      // ,,b,
      // ,,,",c"

      // Now we are almost ready to replace the contents of the current level grid
      // with the next level grid. However, we need to add in the new parent CSV to our new
      // next level grid

      // So first create that next level parent by replacing (from the parent CSV from our example)

      // <<(1),,,
      // ,,,
      // ,,b,
      // ,,,<<)2(>>(1)>>

      //with just

      // <<)1(>>
      let beginningOfNextInParent = `<<(${nextHighestGridDepth})`;
      let endOfNextInParent = `(${nextHighestGridDepth})>>`;
      let nextInParent = `${beginningOfNextInParent}${nextHighestGridAsCsvWithMarker}${endOfNextInParent}`;
      let newNextInParent = `<<)${nextHighestGridDepth}(>>`;
      let currentParentCsvWithNewNext = currentParentCsv.replace(
        nextInParent,
        newNextInParent
      );
      // Make sure we wrap the new parent cell in quotes
      let nextHighestNestedGridParent = `"${currentParentCsvWithNewNext}"`;

      // Now just add the new parent cell on to the beginning of the newly constructed
      // next level CSV
      let nextLevelCsv = `${nextHighestNestedGridParent}${nextHighestGridAsCsvWithMarkerReplaced}`;

      // Convert back to an array and display
      let parentArray = fromCSV(nextLevelCsv);
      arrayToSheet(parentArray);
    } else {
      // Leaving the top-level nested sheet, reintegrate the CSV back into R1C1's placeholder
      parentCsv = embedCurrentCsvInWrapper(
        currentParentCsv,
        currentDepth,
        currentSheetCsvWithoutParentCell
      );

      // Remove the leading '^' to return to the base grid
      let strippedParentCsv = removeCaret(parentCsv);

      // Convert back to an array and display
      let parentArray = fromCSV(strippedParentCsv);
      arrayToSheet(parentArray);
    }

    // 6) Re-parse and re-render the grid
    window.parseAndFormatGrid();

    // 7) Optionally focus a certain cell (defaults to R1C2)
    let focusCell = document.querySelector(
      "#spreadsheet td[data-row='1'][data-col='2']"
    );
    if (focusCell) {
      clearSelection();
      focusCell.classList.add("selected");
      window.selectedCells = [focusCell];
      window.selectedCell = focusCell;
    }
  }

  /***********************************************
   * Helpers used by the above two functions
   ***********************************************/

  /**
   * Convert the entire grid to CSV
   */
  function sheetToCsv(ignoreParentCell) {
    // Build a 2D array from cellsData:
    // 1) Find max row & column in cellsData
    let maxRow = 0,
      maxCol = 0;

    for (let key in window.cellsData) {
      let m = key.match(/R(\d+)C(\d+)/);
      if (!m) continue;

      let r = parseInt(m[1]);
      let c = parseInt(m[2]);

      // Ignore R1C1 if it starts with "^"
      if (r === 1 && c === 1 && window.cellsData[key].startsWith("^")) {
        continue;
      }

      if (r > maxRow) maxRow = r;
      if (c > maxCol) maxCol = c;
    }

    // 2) Construct a 2D array
    let arr = [];
    for (let r = 0; r < maxRow; r++) {
      arr[r] = new Array(maxCol).fill("");
    }

    // 3) Fill it from cellsData
    for (let key in window.cellsData) {
      let m = key.match(/R(\d+)C(\d+)/);
      if (!m) continue;

      let rr = parseInt(m[1]) - 1;
      let cc = parseInt(m[2]) - 1;

      if (ignoreParentCell) {
        // Ignore R1C1 if it starts with "^"
        if (rr === 0 && cc === 0 && window.cellsData[key].startsWith("^")) {
          continue;
        }
      }

      arr[rr][cc] = window.cellsData[key];
    }

    // 4) Convert to CSV
    return window.toCSV(arr);
  }

  /**
   * Replace the entire sheet with the data from a 2D array
   */
  function arrayToSheet(arr2D) {
    // Clear out cellsData:
    window.cellsData = {};
    for (let r = 0; r < arr2D.length; r++) {
      for (let c = 0; c < arr2D[r].length; c++) {
        let val = arr2D[r][c];
        if (val && val.trim() !== "") {
          let key = `R${r + 1}C${c + 1}`;
          window.cellsData[key] = val;
        }
      }
    }
  }

  /**
   * Example: parse something like '^<<)2(>>someCSV...'
   * and return numeric depth = 2
   */
  function getDepthFromWrapper(str) {
    // You can store the depth explicitly, or parse from parentheses.
    // This is up to you. For simplicity, let’s find <<)N(>> if it exists.
    // If none, depth = 0
    let match = str.match(/<<\)(\d+)\(>>/);
    if (match) {
      return parseInt(match[1], 10);
    }
    // Otherwise return 0 or 1 depending on how you design it
    return 0;
  }

  function removeCaret(str) {
    // If it starts with '^', remove it.
    if (str.startsWith("^")) {
      return str.substring(1);
    }
    return str;
  }

  /**
   * Insert the child CSV into the parent's marker.
   * (Mirrors the original "Replace(csvWrapper, '<<)depth(>>', '<<(depth)childCsv(depth)>>'" logic)
   */
  function replaceMarkerInWrapper(csvWrapper, oldDepth, newSheetCsv) {
    // Example approach:
    let marker = `<<)${oldDepth}(>>`;
    let replacement = `<<(${oldDepth})${newSheetCsv}(${oldDepth})>>`;
    return csvWrapper.replace(marker, replacement);
  }

  /**
   * If we are multiple levels deep, replace the marker `<<)depth(>>`
   * with the nested CSV while preserving correct formatting.
   */
  function replaceDeepMarkerInWrapper(wrapper, depth, childCsv) {
    // Ensure childCsv is properly escaped (quotes, newlines, etc.)
    let escapedCsv = childCsv.replace(/"/g, '""'); // Escape double quotes

    // Define the marker that we are looking for
    let marker = `<<)${depth}(>>`;

    // Define the correct replacement, ensuring it keeps the structure intact
    let replacement = `<<)${depth}(>>${escapedCsv}(>>${depth})>>`;

    // Perform the replacement
    let updatedWrapper = wrapper.replace(marker, replacement);

    // If the replacement didn't happen, log an error for debugging
    if (updatedWrapper === wrapper) {
      console.warn(`Marker <<)${depth}(>> not found in wrapper:`, wrapper);
    }

    return updatedWrapper;
  }

  /**
   * Rewrite the '^...' string so that the depth is decreased by 1
   */
  function rewriteWrapperDepth(str, newDepth) {
    // If we had '^<<)3(>>someCSV', we want '^<<)2(>>someCSV', etc.
    return str.replace(/<<\)\d+\(>>/, `<<)${newDepth}(>>`);
  }

  /**
   * Helper for final embedding once we get back to the top-level parent
   */
  function embedCurrentCsvInWrapper(parentCsv, depth, childCsv) {
    // Escape double quotes inside the child CSV
    let escapedChildCsv = childCsv.replace(/"/g, '""');

    // Construct the replacement string (this is how the VBA works)
    let replacement = `"${escapedChildCsv}"`;

    // Replace the marker <<)depth(>> in the parent CSV with the new escaped child CSV
    let updatedParentCsv = parentCsv.replace(`<<)${depth}(>>`, replacement);

    // Log a warning if the marker was not found (useful for debugging)
    if (updatedParentCsv === parentCsv) {
      console.warn(`Marker <<)${depth}(>> not found in parent CSV:`, parentCsv);
    }

    return updatedParentCsv;
  }

  /**
   * Clear current selection
   */
  function clearSelection() {
    if (!window.selectedCells) return;
    for (let cell of window.selectedCells) {
      cell.classList.remove("selected");
    }
    window.selectedCells = [];
    window.selectedCell = null;
  }

  function getCellKey(cell) {
    let r = cell.getAttribute("data-row");
    let c = cell.getAttribute("data-col");
    return `R${r}C${c}`;
  }

  document.addEventListener("dblclick", function (e) {
    // Ensure the target is a table cell
    if (e.target && e.target.tagName === "TD") {
      const row = e.target.getAttribute("data-row");
      const col = e.target.getAttribute("data-col");
      const cellKey = `R${row}C${col}`;
      const cellValue = window.cellsData[cellKey] || "";

      // If the double-clicked cell is the top-left cell (R1C1)
      if (row === "1" && col === "1") {
        if (cellValue.startsWith("^")) {
          leaveNestedCell();
          return; // Stop further execution
        }
      }

      // Check if the clicked cell contains a nested grid (starts with a comma)

      //TODO: Works but conflicts with dblClick in script.js
      // if (cellValue.startsWith(",")) {
      //   enterNestedCell(e.target);
      // }
    }
  });
})();
