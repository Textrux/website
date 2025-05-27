export const PatternsManager = (function () {
  const patternDefinitions = {
    cell: [] as CellPatternDefinition[],
    contiguousCellCluster: [] as ClusterPatternDefinition[],
  };

  function registerPattern(def: PatternDefinition) {
    patternDefinitions[def.level].push(def as any);
  }

  function parseAll(
    filledCells: { row: number; col: number; key: string }[],
    blockList: any[]
  ) {
    const cellPatternResults: Record<string, CellPatternResult[]> = {};

    // 1) Cell-level
    for (const fc of filledCells) {
      const { row, col, key } = fc;
      const val = (window as any).cellsData?.[`R${row}C${col}`] ?? "";

      const resultsForCell: CellPatternResult[] = [];
      for (const patternDef of patternDefinitions.cell) {
        const parseResult = patternDef.parse(val, row, col);
        if (parseResult) {
          resultsForCell.push({
            patternName: patternDef.name,
            data: parseResult,
          });
        }
      }
      if (resultsForCell.length > 0) {
        cellPatternResults[key] = resultsForCell;
      }
    }

    // apply cell-level format
    for (const key in cellPatternResults) {
      const row = parseInt(key.match(/R(\d+)C(\d+)/)![1]);
      const col = parseInt(key.match(/R(\d+)C(\d+)/)![2]);
      const td = document.querySelector(
        `#spreadsheet td[data-row='${row}'][data-col='${col}']`
      ) as HTMLTableCellElement | null;
      if (!td) continue;

      for (const res of cellPatternResults[key]) {
        const def = patternDefinitions.cell.find(
          (d) => d.name === res.patternName
        );
        def?.format?.(td, res.data);
      }
    }

    // 2) cluster-level
    for (const block of blockList) {
      if (!block.cellClusters) continue;
      block.clusterPatterns = [];
      for (const clusterCells of block.cellClusters) {
        for (const patternDef of patternDefinitions.contiguousCellCluster) {
          const parseResult = patternDef.parse(clusterCells, block);
          if (parseResult) {
            block.clusterPatterns.push({
              patternName: patternDef.name,
              clusterCells,
              data: parseResult,
            });
          }
        }
      }
    }
    // format cluster-level
    for (const block of blockList) {
      if (!block.clusterPatterns) continue;
      for (const recognized of block.clusterPatterns) {
        const def = patternDefinitions.contiguousCellCluster.find(
          (d) => d.name === recognized.patternName
        );
        def?.format?.(recognized.clusterCells, recognized.data, block);
      }
    }
  }

  return {
    registerPattern,
    parseAll,
  };
})();
