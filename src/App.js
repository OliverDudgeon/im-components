import React from 'react'
import './App.css'

import { interpolateYlOrBr } from 'd3-scale-chromatic'

import ScatterPlot from './scatter'
import ZoomTest from './zoom'

// TODO: Does this need support for central axes with -ve data points?
function App() {
  const data = Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 10,
  }))
  return (
    <div className="App">
      <ScatterPlot
        data={data}
        width={700}
        height={700}
        colorFunc={interpolateYlOrBr}
        margin={{
          top: 40,
          left: 50,
          bottom: 40,
          right: 40,
        }}
      />
      {/* <ZoomTest
        data={data}
        width={500}
        height={300}
        colorFunc={interpolateYlOrBr}
        margin={{
          top: 40,
          left: 50,
          bottom: 40,
          right: 40,
        }}
      /> */}
    </div>
  )
}

export default App
