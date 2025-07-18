# Spatial Semantics & Unified Grids  
## (BSS ➜ Spase ➜ SGX ➜ Textrux ➜ SUI ➜ Wave Computing)

> **One grid to rule code, data, UI—and the transports in between**

---

### Executive‑Summary
Binary Spatial Semantics (**BSS**) treats a 2‑D grid of filled vs empty cells as the primary carrier of meaning.  
Everything else in this paper—Spase, SGX, Spoor files, Stregex, Textrux, SUI and future Wave‑computing—is an application or extension of that single idea:

| Layer | Problem Solved | Key Artefact |
|-------|----------------|--------------|
| **BSS** | How do cells’ *positions* encode semantics? | 2‑D binary grid |
| **Spase 10‑layer stack** | How do patterns mature from raw bits to final deliverables? | Layered framework |
| **SGX** | How do we **store/stream** rich grids without breaking CSV tooling? | Progressive side‑car format |
| **Spoor** | How do distributed systems **coordinate** by sending spatial deltas? | Spatial patch file |
| **Stregex** | How do we **query** & validate 2‑D patterns? | 5×5 grid regex extension |
| **Textrux** | How do we **build software** metacircularly inside a grid? | 9‑layer spatial protocol |
| **SUI** | How do code + data + UI become the *same thing*? | Triconic live grid |
| **Wave Computing** | What if grids mapped 1‑to‑1 onto hardware nodes? | Broadcast “wave” arrays |

---

## 1.  Binary Spatial Semantics (BSS)

### 1.1  Concept  
*Content* inside a cell is secondary—the **geometry of filled cells** is what matters.  
A CSV therefore doubles as a bitmap whose shapes represent:

* Tables & matrices (dense rectangles)  
* Key–value pairs (L‑shaped corners)  
* Trees (sparse indented paths)  
* Arbitrary custom templates (via pattern matching)

### 1.2  Four‑Rule Construct Detector (75 % code‐reduction)  
1. **`allFilled`** ⇒ Table  
2. **`oneEmptyCorner`** ⇒ Matrix  
3. **L‑corner  (filled,empty,empty,filled)** ⇒ Key‑value  
4. **Anything else** ⇒ Tree (regular or transposed)

These four signatures replaced ~2 000 LOC of heuristic trait analysis while maintaining 100 % recognition accuracy.

### 1.3  Recursion & Strange‑Loops  
Cells can contain **nested grids** (zoom‑in) while clusters of blocks can be treated as **super‑cells** (zoom‑out), allowing infinite self‑similar hierarchy.

---

## 2.  Spase: 10‑Layer Maturity Model

| # | Name | From … | …To | Metaphor |
|---|------|--------|-----|----------|
| 1 | Substrates | Raw coordinates | addressable cells | Terrain |
| 2 | Aggregates | Cells | loose groups | Gravel bed |
| 3 | Foundations | Groups | Blocks & clusters | Cinder blocks |
| 4 | Constructs | Foundations | Trees, tables, matrices, KV | Rooms & walls |
| 5 | Layouts | Multiple constructs | Floor plans | Building plan |
| 6 | Blueprints | Layout + rules | Reusable templates | Architectural drawings |
| 7 | Structures | Blueprint + data | Instantiated models | Finished building |
| 8 | Renovators | Internal transforms | Refactored/validated form | Renovation crew |
| 9 | Explorers | External transforms | Docs / code / UI | Inspectors |
|10 | Artifacts | Explorer output | JSON / SQL / apps | Schematics |

Textrux and SGX each “plug in” at different layers of Spase.

---

## 3.  SGX (“CSV++”) — Progressive Transport

*Keep the `.csv`; add powers only when you need them.*

*   **Gear 0** – Plain CSV (no SGX)  
*   **Gear 1** – Side‑car patches (binary cells, thumbnails)  
*   **Gear 2** – Column stripes & WASM codecs  
*   **Gear 3+** – ACL, encryption, zero‑copy RDMA, remote links

Sparse‑first TLV storage → empty cells cost *zero* bytes.

---

## 4.  Spoor Files — Spatial Coordination

A Spoor packet is a **diff‑style SGX** whose patch semantics describe *operations* (move row, insert slice, link block) instead of raw bytes.  
Distributed nodes merge by spatial topology rather than text diff, giving a Git‑for‑grids that is:

* Continuous (no poll‑and‑patch cycles)  
* Schema‑aware (layout + construct rules)  
* Naturally versioned (Lamport clocks / Merkle DAG)

---

## 5.  Stregex — Structural Regex for Grids

*Regular expressions, but the “text” is a 5×5 neighbourhood.*

* 25 letters (`a–y`) map to cell positions  
* Numbers (`1–9,0,5`) walk into or out of nested grids  
* Comment syntax keeps vanilla regex engines happy  

Example—tree grammar:

```regex
(?# $root=tree: m: ^[A-Z][a-z]+$ )
(?# $child=tree: n: ^[a-z]+$ )
(?# $tree =tree: $root($child)*: .* )
