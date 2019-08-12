import React, { useState } from 'react';
import './App.css';

import { interpolateYlOrBr } from 'd3-scale-chromatic';

import ScatterPlot from './components/scatter';

import { Point, Box } from './common/types';

const pointInside = (x0: number, x1: number, y0: number, y1: number, { x, y, ...s }: Point) => {
  // Check that the point (x, y) is inside the drawn box
  if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
    return { x, y, ...s, selected: true };
  } else {
    return { x, y, ...s, selected: false };
  }
};

interface AppState {
  data: Point[];
  selectionMade: boolean;
}

// TODO: Does this need support for central axes with -ve data points?
const App = () => {
  const [data, setData] = useState(
    Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 10,
      r: Math.random() * 5,
      selected: false,
    })),
  );

  const [selectionMade, setSelectionMade] = useState(false);

  const updateSelection = ({ x0, x1, y1, y0 }: Box) => {
    const pointInBrushBox = pointInside.bind(null, x0, x1, y0, y1);
    const updatedData = data.map(pointInBrushBox);

    setData(updatedData);
    setSelectionMade(updatedData.some(p => p.selected));
  };

  const clearSelection = () => {
    setData(data.map(p => ({ ...p, selected: false })));
    setSelectionMade(false);
  };

  const radii = {
    minRadius: 0,
    maxRadius: 10,
    radius: 5,
  };

  const margin = {
    top: 40,
    left: 50,
    bottom: 40,
    right: 40,
  };
  return (
    <div className="App">
      <ScatterPlot
        {...radii}
        data={data}
        width={500}
        height={500}
        colorFunc={interpolateYlOrBr}
        margin={margin}
        selectionMade={selectionMade}
        onBrushDragged={updateSelection}
        clearSelection={clearSelection}
      />
      <ScatterPlot
        {...radii}
        data={data.filter(p => p.selected)}
        width={300}
        height={300}
        colorFunc={interpolateYlOrBr}
        margin={margin}
        selectionMade={selectionMade}
        onBrushDragged={updateSelection}
        clearSelection={clearSelection}
      />
    </div>
  );
};

export default App;
