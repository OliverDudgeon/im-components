import React from 'react'
import './App.css'

import { interpolateYlOrBr } from 'd3-scale-chromatic'

// import ScatterPlot from './scatter'

import Scatter from './scatter'

class App extends React.Component {
  state = {
    data: Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 10,
      r: Math.random() * 5,
      selected: false,
    })),
  }

  makeSelection = payload => {
    this.setState({ ...payload })
  }

  render() {
    console.log(this.state)
    return (
      <div className="App">
        <Scatter
          data={this.state.data}
          width={500}
          height={500}
          margin={{
            top: 40,
            left: 50,
            bottom: 40,
            right: 40,
          }}
          minRadius={0}
          maxRadius={10}
          radius={5}
          makeSelection={this.makeSelection}
          colorFunc={interpolateYlOrBr}
        />
        <Scatter
          data={this.state.data.filter(p => p.selected)}
          width={500}
          height={500}
          margin={{
            top: 40,
            left: 50,
            bottom: 40,
            right: 40,
          }}
          colorFunc={interpolateYlOrBr}
        />
      </div>
    )
  }
}

export default App
