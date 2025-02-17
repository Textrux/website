import React from "react";
import { GridView } from "./components/GridView";
import { FormulaBar } from "./components/FormulaBar";
import { Controls } from "./components/Controls";

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      {/* ✅ Fixed formula bar at the top */}
      <div className="flex flex-col bg-white shadow-md z-10">
        {/* <h1 className="text-3xl font-bold text-blue-600 p-4">Textrux Grid</h1> */}
        <div className="flex justify-center space-x-2 p-2">
          <Controls />
        </div>
        <FormulaBar />
      </div>

      {/* ✅ Grid takes up remaining space with a single scrollbar */}
      <div className="flex-1 overflow-auto">
        <GridView />
      </div>
    </div>
  );
};

export default App;
