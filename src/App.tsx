import React from "react";
import { GridView } from "./components/GridView";
import { FormulaBar } from "./components/FormulaBar";
import { Controls } from "./components/Controls";

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-600">Textrux Grid</h1>
      <Controls />
      <FormulaBar />
      <GridView />
    </div>
  );
};

export default App;
