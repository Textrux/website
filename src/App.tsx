import React from "react";
import { GridGallery } from "textrux";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <GridGallery autoLoadLocalStorage={true} />
    </div>
  );
}

export default App;
