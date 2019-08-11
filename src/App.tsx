import React from 'react';
import './App.css';

import { interpolateYlOrBr } from 'd3-scale-chromatic';

import ScatterPlot from './components/scatter';

import { Point } from './common/types';

interface AppState {
  data: Point[];
}

// TODO: Does this need support for central axes with -ve data points?
class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 10,
        r: Math.random() * 5,
        selected: false,
      })),
    };
  }

  render() {
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
          data={this.state.data}
          width={500}
          height={500}
          colorFunc={interpolateYlOrBr}
          margin={margin}
        />
      </div>
    );
  }
}

export default App;
