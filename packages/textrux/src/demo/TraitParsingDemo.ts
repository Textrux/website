import GridModel from "../layers/1-substrate/GridModel";
import { parseAndFormatGrid } from "../layers/1-substrate/GridParser";

/**
 * Demonstration of the trait parsing system for foundation elements
 */
export function demonstrateTraitParsing() {
  // Create a sample grid with some data
  const grid = new GridModel(20, 10);

  // Add sample data that will create different foundation elements

  // Create a table-like structure
  grid.setCellRaw(2, 2, "Name");
  grid.setCellRaw(2, 3, "Age");
  grid.setCellRaw(2, 4, "City");

  grid.setCellRaw(3, 2, "John");
  grid.setCellRaw(3, 3, "25");
  grid.setCellRaw(3, 4, "NYC");

  grid.setCellRaw(4, 2, "Jane");
  grid.setCellRaw(4, 3, "30");
  grid.setCellRaw(4, 4, "LA");

  // Create a calculation block
  grid.setCellRaw(6, 6, "100");
  grid.setCellRaw(6, 7, "200");
  grid.setCellRaw(6, 8, "=R6C6+R6C7");

  // Create a list-like structure
  grid.setCellRaw(10, 2, "• Item 1");
  grid.setCellRaw(11, 2, "• Item 2");
  grid.setCellRaw(12, 2, "• Item 3");

  // Parse the grid and extract foundation elements with traits
  const { blockList } = parseAndFormatGrid(grid);

  console.log("=== Trait Parsing Demonstration ===\\n");

  blockList.forEach((block, index) => {
    console.log(`\\n📦 Block ${index + 1}:`);
    console.log(
      `   Position: R${block.topRow}-${block.bottomRow}, C${block.leftCol}-${block.rightCol}`
    );
    console.log(
      `   Size: ${block.traits.base.width}x${block.traits.base.height} (${block.traits.base.area} cells)`
    );
    console.log(
      `   Fill Density: ${(block.traits.base.fillDensity * 100).toFixed(1)}%`
    );
    console.log(
      `   Shape: ${
        block.traits.base.isRectangular ? "Rectangular" : "Irregular"
      }`
    );

    // Content analysis
    console.log(`\\n   📄 Content Analysis:`);
    console.log(`      Has Headers: ${block.traits.composite.hasHeaders}`);
    console.log(`      Has Formulas: ${block.traits.composite.hasFormulas}`);
    console.log(
      `      Dominant Type: ${block.traits.composite.dominantDataType}`
    );
    console.log(
      `      Content Alignment: ${block.traits.composite.contentAlignment}`
    );

    // Construct identification
    console.log(`\\n   🏗️  Construct Analysis:`);
    console.log(
      `      Likely Constructs: [${block.traits.derived.likelyConstructs.join(
        ", "
      )}]`
    );
    console.log(
      `      Confidence: ${(block.traits.derived.confidence * 100).toFixed(1)}%`
    );
    console.log(`      Semantic Role: ${block.traits.derived.semanticRole}`);
    console.log(
      `      Primary Direction: ${block.traits.derived.primaryDirection}`
    );

    // Behavioral hints
    console.log(`\\n   🎯 Behavioral Traits:`);
    console.log(`      Is Container: ${block.traits.derived.isContainer}`);
    console.log(`      Is Header: ${block.traits.derived.isHeader}`);
    console.log(`      Is Data: ${block.traits.derived.isData}`);
    console.log(
      `      Importance: ${(block.traits.derived.importance * 100).toFixed(1)}%`
    );

    // Cell clusters within the block
    if (block.cellClusters && block.cellClusters.length > 0) {
      console.log(`\\n   🔗 Cell Clusters (${block.cellClusters.length}):`);
      block.cellClusters.forEach((cluster, clusterIndex) => {
        console.log(`      Cluster ${clusterIndex + 1}:`);
        console.log(
          `         Size: ${cluster.traits.base.width}x${cluster.traits.base.height}`
        );
        console.log(
          `         Purpose: ${cluster.traits.derived.primaryPurpose}`
        );
        console.log(
          `         Data Type: ${cluster.traits.derived.likelyDataType}`
        );
        console.log(
          `         Semantic Role: ${cluster.traits.derived.semanticRole}`
        );
        console.log(
          `         Constructs: [${cluster.traits.derived.indicatesConstruct.join(
            ", "
          )}]`
        );
      });
    }

    console.log("\\n" + "─".repeat(50));
  });

  // Show block cluster analysis if any
  if (grid.blockClusters && grid.blockClusters.length > 0) {
    console.log("\\n\\n🌐 Block Cluster Analysis:\\n");
    grid.blockClusters.forEach((cluster, index) => {
      console.log(`Block Cluster ${index + 1}:`);
      console.log(`   Blocks: ${cluster.traits.base.blockCount}`);
      console.log(
        `   Organization: ${cluster.traits.composite.organizationBy}`
      );
      console.log(
        `   Pattern: ${
          cluster.traits.composite.isGrid
            ? "Grid"
            : cluster.traits.composite.isList
            ? "List"
            : cluster.traits.composite.isTree
            ? "Tree"
            : "Mixed"
        }`
      );
      console.log(
        `   Constructs: [${cluster.traits.derived.likelyConstructs.join(", ")}]`
      );
      console.log(
        `   Primary Purpose: ${cluster.traits.derived.primaryPurpose}`
      );
      console.log(`   Complexity: ${cluster.traits.derived.complexity}`);

      // Block joins analysis
      if (cluster.blockJoins && cluster.blockJoins.length > 0) {
        console.log(`\\n   🔗 Block Joins (${cluster.blockJoins.length}):`);
        cluster.blockJoins.forEach((join, joinIndex) => {
          console.log(`      Join ${joinIndex + 1}:`);
          console.log(`         Type: ${join.traits.base.connectionType}`);
          console.log(
            `         Strength: ${(
              join.traits.base.connectionStrength * 100
            ).toFixed(1)}%`
          );
          console.log(
            `         Purpose: ${join.traits.derived.primaryPurpose}`
          );
          console.log(
            `         Pattern: ${join.traits.derived.followsPattern}`
          );
          console.log(
            `         Quality: ${join.traits.derived.connectionQuality}`
          );
        });
      }
    });
  }

  console.log("\\n=== End Trait Parsing Demo ===");
}

// Export for use in other parts of the application
export default demonstrateTraitParsing;
