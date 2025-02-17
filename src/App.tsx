// src/App.tsx
import React from "react";
import { GridModel, GridView } from "textrux";

function App() {
  // Create the model once
  const model = React.useMemo(() => {
    const m = new GridModel(1000, 50);
    // Example formula cell
    m.setCell(4, 8, "=R9C4+R4C3");
    m.setCellFormat(4, 8, { backgroundColor: "lightgreen" });
    return m;
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <GridView grid={model} />
    </div>
  );
}

export default App;
