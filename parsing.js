/****************************************************
 * parsing.js
 *
 * Enhanced Treet logic:
 * - Blocks & merges (distance=2)
 * - "Cell clusters" on each block's canvas, distance=1
 * - If bounding boxes (expanded by 1 in all directions) overlap => unify
 * - Distinguish cluster-empty cells from other empty canvas
 * - Block Joins => "linked"/"locked"
 * - Block Clusters => group blocks
 * - Final styling
 ****************************************************/

window.parseAndFormatGrid = function parseAndFormatGrid() {
  cellToBlockMap = {};
  blockList = [];
  blockJoins = [];
  blockClusters = [];

  // Gather filled cells
  const filledCells = [];
  for (let key in cellsData) {
    const val = cellsData[key];
    if (val && val.trim() !== "") {
      const m = key.match(/R(\d+)C(\d+)/);
      if (m) {
        filledCells.push({ 
          row: +m[1], 
          col: +m[2], 
          key 
        });
      }
    }
  }
  const filledSet = new Set(filledCells.map(fc => `${fc.row},${fc.col}`));

  // Clear old classes
  clearFormatting();

  // Identify blocks via BFS among filled, then merge if bounding boxes < 2
  const visited = new Set();
  for (let fc of filledCells) {
    let k = `${fc.row},${fc.col}`;
    if (!visited.has(k)) {
      let block = createBlock(fc, filledSet, visited, cellToBlockMap);
      blockList.push(block);
    }
  }

  let merged;
  do {
    merged = false;
    outer: for (let i = 0; i < blockList.length; i++) {
      for (let j = i + 1; j < blockList.length; j++) {
        if (areCanvasesWithinProximity(blockList[i], blockList[j], 2)) {
          mergeBlocks(blockList[i], blockList[j], cellToBlockMap, blockList);
          merged = true;
          break outer;
        }
      }
    }
  } while (merged);

  // finalize each block
  for (let b of blockList) {
    finalizeBlock(b);
  }

  // block joins => locked/linked
  populateBlockJoins();

  // group blocks => blockClusters
  populateBlockClusters();

  // final pass => apply styles
  applyBlockStyles(filledCells);
};

let blockJoins = [];
let blockClusters = [];

/****************************************************
 * createBlock => BFS among filled => block.canvasCells
 ****************************************************/
function createBlock(startCell, filledSet, visited, cellMap) {
  let block = {
    canvasCells: [],
    emptyCanvasCells: [],
    emptyClusterCells: [],
    cellClusters: [],
    borderCells: [],
    frameCells: [],
    topRow: startCell.row,
    bottomRow: startCell.row,
    leftCol: startCell.col,
    rightCol: startCell.col
  };

  let queue = [startCell];
  while (queue.length) {
    let cur = queue.shift();
    let k = `${cur.row},${cur.col}`;
    if (visited.has(k)) continue;
    visited.add(k);

    block.canvasCells.push(cur);
    cellMap[k] = block;

    if (cur.row < block.topRow) block.topRow = cur.row;
    if (cur.row > block.bottomRow) block.bottomRow = cur.row;
    if (cur.col < block.leftCol) block.leftCol = cur.col;
    if (cur.col > block.rightCol) block.rightCol = cur.col;

    let nbs = getNeighbors(cur.row, cur.col, 1);
    for (let nb of nbs) {
      let nk = `${nb.row},${nb.col}`;
      if (filledSet.has(nk) && !visited.has(nk)) {
        queue.push(nb);
      }
    }
  }
  return block;
}

/****************************************************
 * mergeBlocks => unify b into a
 ****************************************************/
function mergeBlocks(a, b, cellMap, blockList) {
  a.canvasCells.push(...b.canvasCells);
  for (let pt of b.canvasCells) {
    let k = `${pt.row},${pt.col}`;
    cellMap[k] = a;
  }
  a.topRow = Math.min(a.topRow, b.topRow);
  a.bottomRow = Math.max(a.bottomRow, b.bottomRow);
  a.leftCol = Math.min(a.leftCol, b.leftCol);
  a.rightCol = Math.max(a.rightCol, b.rightCol);

  const idx = blockList.indexOf(b);
  if (idx !== -1) blockList.splice(idx, 1);
}

/****************************************************
 * finalizeBlock(b):
 *  - bounding box => emptyCanvasCells
 *  - border/frame => getOutlineCells
 *  - find sub-lumps (b.cellClusters) among b.canvasCells
 *  - unify sub-lumps by bounding box expansions
 ****************************************************/
function finalizeBlock(b) {
  // 1) bounding box => emptyCanvasCells
  const fillSet = new Set(b.canvasCells.map(pt => `${pt.row},${pt.col}`));
  for (let r = b.topRow; r <= b.bottomRow; r++) {
    for (let c = b.leftCol; c <= b.rightCol; c++) {
      let k = `${r},${c}`;
      if (!fillSet.has(k)) {
        b.emptyCanvasCells.push({ row: r, col: c });
        cellToBlockMap[k] = b;
      }
    }
  }

  // 2) border/frame
  b.borderCells = getOutlineCells(b.topRow, b.bottomRow, b.leftCol, b.rightCol, 1, cellToBlockMap, b);
  b.frameCells = getOutlineCells(b.topRow, b.bottomRow, b.leftCol, b.rightCol, 2, cellToBlockMap, b);

  // 3) sub-lumps among filled => BFS
  b.cellClusters = findClustersInPoints(b.canvasCells);

  // 4) for each cluster bounding box => gather cluster-empty
  for (let cluster of b.cellClusters) {
    let minR = Math.min(...cluster.map(pt => pt.row));
    let maxR = Math.max(...cluster.map(pt => pt.row));
    let minC = Math.min(...cluster.map(pt => pt.col));
    let maxC = Math.max(...cluster.map(pt => pt.col));

    let clusterEmpty = [];
    for (let rr = minR; rr <= maxR; rr++) {
      for (let cc = minC; cc <= maxC; cc++) {
        // if not in cluster as filled
        if (!cluster.some(pt => pt.row===rr && pt.col===cc)) {
          if (!cellsData[`R${rr}C${cc}`]) {
            clusterEmpty.push({ row: rr, col: cc });
          }
        }
      }
    }
    b.emptyClusterCells.push(...clusterEmpty);
  }

  // 5) unify cluster lumps by bounding box expansions
  // We'll unify the *entire sub-lump*, including its cluster-empty
  // Then set b.emptyClusterCells = final.

  let { allEmpty } = unifySubClusters(b);
  b.emptyClusterCells = allEmpty;

  // final bounding box
  b.topRow = Math.min(...b.canvasCells.map(pt => pt.row));
  b.bottomRow = Math.max(...b.canvasCells.map(pt => pt.row));
  b.leftCol = Math.min(...b.canvasCells.map(pt => pt.col));
  b.rightCol = Math.max(...b.canvasCells.map(pt => pt.col));
}

/****************************************************
 * unifySubClusters(b)
 * We unify b.cellClusters, each with bounding box => expand by 1 => check overlap
 ****************************************************/
function unifySubClusters(b) {
  // lumpsOfFilled => b.cellClusters
  // lumpsOfEmpty => BFS lumps among b.emptyClusterCells (8-direction)
  let lumpsOfEmpty = findClustersInPoints(b.emptyClusterCells);

  // Combine each lumpsOfFilled with lumpsOfEmpty that overlap bounding boxes
  let lumpsCombined = [];
  let usedEmptyIndexes = new Set();

  // transform lumpsOfEmpty => array of arrays
  lumpsOfEmpty = lumpsOfEmpty.map(l => [...l]);

  // Also transform b.cellClusters => array of arrays
  let lumpsOfFilled = b.cellClusters.map(l => [...l]);

  // 1) For each lumpsOfFilled => unify with lumpsOfEmpty if bounding boxes overlap or are within 0 distance
  lumpsOfFilled.forEach((fLump) => {
    let [fMinR, fMaxR, fMinC, fMaxC] = getBox(fLump);

    // add them to lumpset
    let lumpset = [...fLump];

    for (let i=0; i<lumpsOfEmpty.length; i++) {
      if (usedEmptyIndexes.has(i)) continue;
      let eLump = lumpsOfEmpty[i];
      let [eMinR, eMaxR, eMinC, eMaxC] = getBox(eLump);

      // *** Here's the difference: Expand bounding box of each cluster by 1 in every direction before checking overlap
      let [exMinR, exMaxR, exMinC, exMaxC] = expandBoundingBoxBy1(fMinR, fMaxR, fMinC, fMaxC);
      let [exEminR, exEmaxR, exEminC, exEmaxC] = expandBoundingBoxBy1(eMinR, eMaxR, eMinC, eMaxC);

      // If these expanded boxes overlap or touch => unify
      if (boxesAreCloseOrOverlap(exMinR,exMaxR,exMinC,exMaxC,
                                 exEminR,exEmaxR,exEminC,exEmaxC,
                                 0)) {
        lumpset.push(...eLump);
        usedEmptyIndexes.add(i);
      }
    }
    lumpsCombined.push(lumpset);
  });

  // 2) leftover empty lumps => lumps on their own
  for (let i=0; i<lumpsOfEmpty.length; i++) {
    if (!usedEmptyIndexes.has(i)) {
      lumpsCombined.push(lumpsOfEmpty[i]);
    }
  }

  // 3) Then unify lumpsCombined among themselves if bounding boxes overlap
  let mergedOnce = mergeClustersByBoundingBox(lumpsCombined, 1);
  let finalLumps = [];
  for (let grp of mergedOnce) {
    // BFS 8-dir => unify
    let sub = basicBFSclusters(grp);
    finalLumps.push(...sub);
  }

  // gather all empty from final lumps that are not in b.canvasCells
  let allEmpty = [];
  for (let lum of finalLumps) {
    for (let p of lum) {
      if (!cellsData[`R${p.row}C${p.col}`]) {
        allEmpty.push(p);
      }
    }
  }
  allEmpty = deduplicatePoints(allEmpty);

  return { allEmpty };
}

/****************************************************
 * expandBoundingBoxBy1(minR, maxR, minC, maxC)
 * expands bounding box by 1 cell in all 8 directions
 ****************************************************/
function expandBoundingBoxBy1(minR, maxR, minC, maxC) {
  return [minR-1, maxR+1, minC-1, maxC+1];
}

/****************************************************
 * mergeClustersByBoundingBox(lumps, distance=1)
 * merges lumps if bounding boxes are within `distance`
 ****************************************************/
function mergeClustersByBoundingBox(lumps, distance) {
  let arr = lumps.map(l => [...l]);
  let changed;
  do {
    changed = false;
    outer: for (let i=0; i<arr.length; i++) {
      for (let j=i+1; j<arr.length; j++) {
        if (boxesAreCloseOrOverlap(...getBox(arr[i]), ...getBox(arr[j]), distance)) {
          arr[i].push(...arr[j]);
          arr.splice(j,1);
          changed = true;
          break outer;
        }
      }
    }
  } while (changed);
  return arr;
}

function getBox(pts) {
  let minR = Infinity, maxR=-Infinity;
  let minC = Infinity, maxC=-Infinity;
  for (let p of pts) {
    if (p.row < minR) minR=p.row;
    if (p.row>maxR) maxR=p.row;
    if (p.col<minC) minC=p.col;
    if (p.col>maxC) maxC=p.col;
  }
  return [minR, maxR, minC, maxC];
}

/****************************************************
 * boxesAreCloseOrOverlap(aMinR,aMaxR,aMinC,aMaxC,
 *                        bMinR,bMaxR,bMinC,bMaxC,
 *                        distance)
 ****************************************************/
function boxesAreCloseOrOverlap(aMinR,aMaxR,aMinC,aMaxC,
                                bMinR,bMaxR,bMinC,bMaxC,
                                distance) {
  let vert = 0;
  if (aMaxR < bMinR) {
    vert = bMinR - aMaxR -1;
  } else if (bMaxR < aMinR) {
    vert = aMinR - bMaxR -1;
  } else {
    vert=0;
  }
  let horiz=0;
  if (aMaxC < bMinC) {
    horiz = bMinC - aMaxC -1;
  } else if (bMaxC<aMinC) {
    horiz = aMinC - bMaxC -1;
  } else {
    horiz=0;
  }
  return (vert<=distance && horiz<=distance);
}

/****************************************************
 * findClustersInPoints(points, clusterProximity=1)
 * BFS lumps => merges bounding boxes if within clusterProximity
 ****************************************************/
function findClustersInPoints(points, clusterProximity=1) {
  // BFS lumps
  const lumps = basicBFSclusters(points);

  // merges lumps
  let mergedList = lumps.slice();
  let changed;
  do {
    changed = false;
    outer: for (let i=0; i<mergedList.length; i++) {
      for (let j=i+1; j<mergedList.length; j++) {
        if (clustersAreClose(mergedList[i], mergedList[j], clusterProximity)) {
          mergedList[i].push(...mergedList[j]);
          mergedList.splice(j,1);
          changed = true;
          break outer;
        }
      }
    }
  } while (changed);

  // BFS again
  let finalClusters = [];
  for (let group of mergedList) {
    let re = basicBFSclusters(group);
    finalClusters.push(...re);
  }
  return finalClusters;
}

/****************************************************
 * basicBFSclusters(pts) => BFS lumps (8-direction)
 ****************************************************/
function basicBFSclusters(pts) {
  let visited = new Set();
  let out = [];
  let setP = new Set(pts.map(p=>`${p.row},${p.col}`));
  for (let p of pts) {
    let pk=`${p.row},${p.col}`;
    if (!visited.has(pk)) {
      let cluster=[];
      let queue=[p];
      while(queue.length) {
        let cur = queue.shift();
        let ck=`${cur.row},${cur.col}`;
        if(visited.has(ck)) continue;
        visited.add(ck);
        cluster.push(cur);

        let nbs = getNeighbors(cur.row, cur.col,1);
        for (let nb of nbs) {
          let nk=`${nb.row},${nb.col}`;
          if(setP.has(nk) && !visited.has(nk)) {
            queue.push(nb);
          }
        }
      }
      out.push(cluster);
    }
  }
  return out;
}

/****************************************************
 * clustersAreClose(A,B,dist)
 ****************************************************/
function clustersAreClose(A,B,dist) {
  let [amR,axR,amC,axC] = getBox(A);
  let [bmR,bxR,bmC,bxC] = getBox(B);

  let vert=0;
  if (axR<bmR) {
    vert = bmR-axR-1;
  } else if (bxR<amR) {
    vert = amR-bxR-1;
  } else {
    vert=0;
  }
  let horiz=0;
  if(axC<bmC) {
    horiz = bmC-axC-1;
  } else if(bxC<amC) {
    horiz=amC-bxC-1;
  } else {
    horiz=0;
  }
  return (vert<=dist && horiz<=dist);
}

/****************************************************
 * populateBlockJoins => locked or linked
 ****************************************************/
function populateBlockJoins() {
  blockJoins = [];
  for (let i=0; i<blockList.length;i++){
    for(let j=i+1;j<blockList.length;j++){
      let A=blockList[i];
      let B=blockList[j];
      if(!containersOverlap(A.frameCells,B.frameCells,A.borderCells,B.borderCells)){
        continue;
      }
      let join={
        blocks:[A,B],
        type:"linked",
        linkedCells:[],
        lockedCells:[],
        allJoinedCells:[]
      };

      let ff=overlapPoints(A.frameCells,B.frameCells);
      let bfAB=overlapPoints(A.borderCells,B.frameCells);
      let bfBA=overlapPoints(A.frameCells,B.borderCells);
      let locked = deduplicatePoints([...bfAB,...bfBA]);
      let linked=ff;
      if(locked.length>0) {
        join.type="locked";
        join.lockedCells=locked;
        join.linkedCells=linked;
      } else {
        join.type="linked";
        join.linkedCells=linked;
      }
      join.allJoinedCells=deduplicatePoints([...locked,...linked]);
      if(join.allJoinedCells.length>0){
        blockJoins.push(join);
      }
    }
  }
}

/****************************************************
 * populateBlockClusters => BFS on blockJoins
 ****************************************************/
function populateBlockClusters() {
  let used=new Set();
  for(let block of blockList){
    if(used.has(block)) continue;
    let clusterBlocks=[];
    let clusterJoins=[];
    gatherCluster(block,clusterBlocks,clusterJoins);

    let allCanvas=[];
    clusterBlocks.forEach(b=>{
      allCanvas.push(...b.canvasCells);
    });
    let minR = Math.min(...allCanvas.map(pt=>pt.row));
    let maxR = Math.max(...allCanvas.map(pt=>pt.row));
    let minC = Math.min(...allCanvas.map(pt=>pt.col));
    let maxC = Math.max(...allCanvas.map(pt=>pt.col));

    let linkedAll=[];
    let lockedAll=[];
    clusterJoins.forEach(jn=>{
      linkedAll.push(...jn.linkedCells);
      lockedAll.push(...jn.lockedCells);
    });
    let mergedLinked=deduplicatePoints(linkedAll);
    let mergedLocked=deduplicatePoints(lockedAll);

    blockClusters.push({
      blocks:clusterBlocks,
      blockJoins:clusterJoins,
      clusterCanvas:{top:minR,left:minC,bottom:maxR,right:maxC},
      linkedCells:mergedLinked,
      lockedCells:mergedLocked
    });
    clusterBlocks.forEach(b=>used.add(b));
  }
}

function gatherCluster(start, clusterBlocks, clusterJoins){
  let queue=[start];
  let visited=new Set();
  while(queue.length){
    let blk=queue.shift();
    if(visited.has(blk)) continue;
    visited.add(blk);
    clusterBlocks.push(blk);

    let myJoins=blockJoins.filter(j=>j.blocks.includes(blk));
    for(let jn of myJoins){
      if(!clusterJoins.includes(jn)) clusterJoins.push(jn);
      let other=jn.blocks.find(b=>b!==blk);
      if(!visited.has(other)){
        queue.push(other);
      }
    }
  }
}

/****************************************************
 * applyBlockStyles(filledCells)
 ****************************************************/
function applyBlockStyles(filledCells) {
  for(let b of blockList){
    for(let pt of b.emptyClusterCells){
      let td=getCellElement(pt.row,pt.col);
      if(td) td.classList.add("cluster-empty-cell");
    }
    for(let pt of b.emptyCanvasCells){
      let td=getCellElement(pt.row,pt.col);
      if(td && !td.classList.contains("cluster-empty-cell")){
        td.classList.add("canvas-empty-cell");
      }
    }
  }

  // locked & linked
  for(let bc of blockClusters){
    for(let pt of bc.lockedCells){
      let td=getCellElement(pt.row,pt.col);
      if(td) td.classList.add("locked-cell");
    }
    for(let pt of bc.linkedCells){
      let td=getCellElement(pt.row,pt.col);
      if(td && !td.classList.contains("locked-cell")){
        td.classList.add("linked-cell");
      }
    }
  }

  // fill text for actual filled
  for(let fc of filledCells){
    let td=getCellElement(fc.row,fc.col);
    if(td){
      td.textContent=cellsData[fc.key];
      td.classList.add("canvas-cell");
    }
  }

  // re-apply border/frame
  for(let b of blockList){
    for(let pt of b.borderCells){
      let td=getCellElement(pt.row,pt.col);
      if(td) td.classList.add("border-cell");
    }
    for(let pt of b.frameCells){
      let td=getCellElement(pt.row,pt.col);
      if(td) td.classList.add("frame-cell");
    }
  }
}

/****************************************************
 * getOutlineCells => border/frame expansions
 ****************************************************/
function getOutlineCells(top,bottom,left,right,expandBy,cellMap,currentBlock){
  let out=[];
  let minR = Math.max(1, top-expandBy);
  let maxR = Math.min(numberOfRows, bottom+expandBy);
  let minC = Math.max(1, left-expandBy);
  let maxC = Math.min(numberOfColumns, right+expandBy);
  for(let r=minR; r<=maxR;r++){
    for(let c=minC; c<=maxC;c++){
      let k=`${r},${c}`;
      if(!cellMap[k]||cellMap[k]===currentBlock){
        if(r===minR||r===maxR||c===minC||c===maxC){
          out.push({row:r,col:c});
        }
      }
    }
  }
  return out;
}


/****************************************************
 * areCanvasesWithinProximity => merges blocks, distance=2
 ****************************************************/
function areCanvasesWithinProximity(a,b,proximity){
  let vert=0;
  if(a.bottomRow<b.topRow){
    vert=b.topRow-a.bottomRow-1;
  }else if(b.bottomRow<a.topRow){
    vert=a.topRow-b.bottomRow-1;
  }else{vert=0;}
  let horiz=0;
  if(a.rightCol<b.leftCol){
    horiz=b.leftCol-a.rightCol-1;
  }else if(b.rightCol<a.leftCol){
    horiz=a.leftCol-b.rightCol-1;
  }else{horiz=0;}
  return vert<proximity && horiz<proximity;
}

/****************************************************
 * deduplicatePoints
 ****************************************************/
function deduplicatePoints(arr){
  let used=new Set();
  let out=[];
  for(let p of arr){
    let k=`${p.row},${p.col}`;
    if(!used.has(k)){
      used.add(k);
      out.push(p);
    }
  }
  return out;
}

/****************************************************
 * getNeighbors(r,c,dist=1)
 * => up to 8 directions
 ****************************************************/
function getNeighbors(r,c,dist){
  let out=[];
  for(let dr=-dist; dr<=dist; dr++){
    for(let dc=-dist; dc<=dist; dc++){
      if(dr===0 && dc===0) continue;
      let nr=r+dr;
      let nc=c+dc;
      if(nr>=1 && nr<=numberOfRows && nc>=1 && nc<=numberOfColumns){
        out.push({row:nr,col:nc});
      }
    }
  }
  return out;
}

/****************************************************
 * containersOverlap => block joins
 ****************************************************/
function containersOverlap(frameA, frameB, borderA, borderB){
  let ff=overlapPoints(frameA, frameB);
  let ab=overlapPoints(borderA, frameB);
  let ba=overlapPoints(frameA, borderB);
  return (ff.length>0 || ab.length>0 || ba.length>0);
}

/****************************************************
 * overlapPoints(listA, listB)
 ****************************************************/
function overlapPoints(listA, listB){
  const setB=new Set(listB.map(pt=>`${pt.row},${pt.col}`));
  let out=[];
  for(let p of listA){
    let k=`${p.row},${p.col}`;
    if(setB.has(k)){
      out.push(p);
    }
  }
  return out;
}

/****************************************************
 * clearFormatting
 ****************************************************/
function clearFormatting(){
  let all=document.querySelectorAll("#spreadsheet td");
  all.forEach(td=>{
    td.classList.remove(
      "selected","canvas-cell","empty-cell-cluster","cluster-empty-cell",
      "canvas-empty-cell","border-cell","frame-cell","underscore-cell",
      "normal-cell","locked-cell","linked-cell"
    );
    let r=td.getAttribute("data-row");
    let c=td.getAttribute("data-col");
    let key=`R${r}C${c}`;
    if(cellsData[key]){
      td.textContent=cellsData[key];
    }else{
      td.textContent="";
    }
  });
}

/****************************************************
 * Basic BFS lumps => findClustersInPoints helper
 ****************************************************/
function basicBFSclusters(pts){
  let visited=new Set();
  let out=[];
  let setP=new Set(pts.map(p=>`${p.row},${p.col}`));
  for(let p of pts){
    let pk=`${p.row},${p.col}`;
    if(!visited.has(pk)){
      let cluster=[];
      let queue=[p];
      while(queue.length){
        let cur=queue.shift();
        let ck=`${cur.row},${cur.col}`;
        if(visited.has(ck)) continue;
        visited.add(ck);
        cluster.push(cur);

        let nbs=getNeighbors(cur.row,cur.col,1);
        for(let nb of nbs){
          let nk=`${nb.row},${nb.col}`;
          if(setP.has(nk) && !visited.has(nk)){
            queue.push(nb);
          }
        }
      }
      out.push(cluster);
    }
  }
  return out;
}

/****************************************************
 * findClustersInPoints => BFS lumps => merges bounding boxes
 ****************************************************/
function findClustersInPoints(points, clusterProximity=1){
  // BFS lumps
  const lumps=basicBFSclusters(points);

  // merges lumps
  let mergedList=lumps.slice();
  let changed;
  do{
    changed=false;
    outer: for(let i=0; i<mergedList.length;i++){
      for(let j=i+1;j<mergedList.length;j++){
        if(clustersAreClose(mergedList[i], mergedList[j], clusterProximity)){
          mergedList[i].push(...mergedList[j]);
          mergedList.splice(j,1);
          changed=true;
          break outer;
        }
      }
    }
  }while(changed);

  // BFS again to finalize
  let finalClusters=[];
  for(let group of mergedList){
    let re=basicBFSclusters(group);
    finalClusters.push(...re);
  }
  return finalClusters;
}

/****************************************************
 * clustersAreClose(A,B,dist)
 ****************************************************/
function clustersAreClose(A,B,dist){
  let [amR,axR,amC,axC]=getBox(A);
  let [bmR,bxR,bmC,bxC]=getBox(B);

  let vert=0;
  if(axR<bmR){
    vert=bmR-axR-1;
  }else if(bxR<amR){
    vert=amR-bxR-1;
  }else{vert=0;}

  let horiz=0;
  if(axC<bmC){
    horiz=bmC-axC-1;
  }else if(bxC<amC){
    horiz=amC-bxC-1;
  }else{horiz=0;}

  return (vert<=dist && horiz<=dist);
}

/****************************************************
 * getBox(pts) => bounding box [minR,maxR,minC,maxC]
 ****************************************************/
function getBox(pts){
  let minR=Infinity, maxR=-Infinity;
  let minC=Infinity, maxC=-Infinity;
  for(let p of pts){
    if(p.row<minR) minR=p.row;
    if(p.row>maxR) maxR=p.row;
    if(p.col<minC) minC=p.col;
    if(p.col>maxC) maxC=p.col;
  }
  return [minR,maxR,minC,maxC];
}

//
// The rest of the code is the same as your snippet
// (populateBlockJoins, containersOverlap, etc.)
//

/****************************************************
 * boxesAreCloseOrOverlap => used by unifySubClusters
 ****************************************************/
function boxesAreCloseOrOverlap(aMinR,aMaxR,aMinC,aMaxC,
                                bMinR,bMaxR,bMinC,bMaxC,
                                distance){
  let vert=0;
  if(aMaxR<bMinR){
    vert=bMinR-aMaxR-1;
  }else if(bMaxR<aMinR){
    vert=aMinR-bMaxR-1;
  }else{vert=0;}

  let horiz=0;
  if(aMaxC<bMinC){
    horiz=bMinC-aMaxC-1;
  }else if(bMaxC<aMinC){
    horiz=aMinC-bMaxC-1;
  }else{horiz=0;}
  return vert<=distance && horiz<=distance;
}
