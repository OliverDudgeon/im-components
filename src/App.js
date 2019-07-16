import React from 'react'
import './App.css'

import { interpolateYlOrBr } from 'd3-scale-chromatic'

import ScatterPlot from './scatter'

// TODO: Does this need support for central axes with -ve data points?
function App() {
  const data = Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 10,
    r: Math.random() * 5,
    selected: false,
  }))

  return (
    <div className="App">
      <ScatterPlot
        data={data}
        width={700}
        height={700}
        colorFunc={interpolateYlOrBr}
        minRadius={0}
        maxRadius={10}
        radius={5}
        margin={{
          top: 40,
          left: 50,
          bottom: 40,
          right: 40,
        }}
      />
    </div>
  )
}

export default App
