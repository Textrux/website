import Block from "./Block";

// ✅ Use an object for raw lookup speed
const CellToBlockMap: Record<string, Block> = {}; // Equivalent to `{ [key: string]: Block }`

export default CellToBlockMap;
