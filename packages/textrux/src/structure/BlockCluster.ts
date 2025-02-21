import Block from "./Block";
import BlockJoin from "./BlockJoin";
import { Point } from "./Cell";

export default class BlockCluster {
  blocks: Block[];
  blockJoins: BlockJoin[];
  clusterCanvas: { top: number; left: number; bottom: number; right: number };
  linkedCells: Point[];
  lockedCells: Point[];

  constructor(blocks: Block[], joins: BlockJoin[]) {
    this.blocks = blocks;
    this.blockJoins = joins;

    const allCanvas = blocks.flatMap((b) => b.canvasCells);
    this.clusterCanvas = {
      top: Math.min(...allCanvas.map((pt) => pt.row)),
      left: Math.min(...allCanvas.map((pt) => pt.col)),
      bottom: Math.max(...allCanvas.map((pt) => pt.row)),
      right: Math.max(...allCanvas.map((pt) => pt.col)),
    };

    this.linkedCells = GridParser.deduplicatePoints(
      joins.flatMap((j) => j.linkedCells)
    );
    this.lockedCells = GridParser.deduplicatePoints(
      joins.flatMap((j) => j.lockedCells)
    );
  }

  static populateBlockClusters(blockList: Block[], blockJoins: BlockJoin[]) {
    const visited = new Set<number>();
    const blockClusters: BlockCluster[] = [];

    function bfs(start: number) {
      const queue = [start];
      const cluster = [start];
      visited.add(start);

      while (queue.length) {
        const cur = queue.shift()!;
        for (const jn of blockJoins) {
          if (jn.b1 === cur && !visited.has(jn.b2)) {
            visited.add(jn.b2);
            cluster.push(jn.b2);
            queue.push(jn.b2);
          } else if (jn.b2 === cur && !visited.has(jn.b1)) {
            visited.add(jn.b1);
            cluster.push(jn.b1);
            queue.push(jn.b1);
          }
        }
      }
      return cluster;
    }

    for (let i = 0; i < blockList.length; i++) {
      if (!visited.has(i)) {
        const c = bfs(i);
        blockClusters.push(c);
      }
    }
    return blockClusters;
  }
}
