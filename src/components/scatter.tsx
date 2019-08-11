import React from 'react';
import { AxisBottom, AxisLeft } from '@vx/axis';
import { getCoordsFromEvent, withBrush, BoxBrush } from '@vx/brush';

import { ScaleLinear } from 'd3-scale';

import { Point, Margin, Box } from '../common/types';
import withScales from '../HOC/withScales';

type Brush = {
  end: { x: number; y: number };
  isBrushing: boolean;
  domain: Box;
};

interface ScatterProps {
  data: Point[];
  width: number;
  height: number;
  colorFunc(z: number): string;
  minRadius: number;
  maxRadius: number;
  radius: number;
  margin: Margin;
  onBrushStart(coords: Box): void;
  brush: Brush;
  onBrushEnd(coords: Box): void;
  onBrushReset(event: React.MouseEvent): void;
  onBrushDrag(coords: Box): void;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  colorScale: ScaleLinear<number, number>;
  rScale: ScaleLinear<number, number>;
  updateSelection(data: Point[]): void;
}

interface ScatterState {
  data: Point[];
  selectionMade: boolean;
}

class Scatter extends React.Component<ScatterProps, ScatterState> {
  svg: React.RefObject<SVGSVGElement> = React.createRef();

  constructor(props: ScatterProps) {
    super(props);
    const { data } = props;

    // Scalar functions to convert between the data coords and the svg coords
    this.state = {
      data,
      selectionMade: false,
    };
  }

  handleMouseDown = (event: React.MouseEvent) => {
    const { onBrushStart } = this.props; // Inserted with HOC withBrush
    const coords = getCoordsFromEvent(this.svg.current, event); // {x, y}
    onBrushStart(coords);
  };

  clearSelection = () => {
    this.setState({
      data: this.state.data.map(p => ({ ...p, selected: false })),
      selectionMade: false,
    });
  };



  handleMouseUp = (event: React.MouseEvent) => {
    const { brush, onBrushEnd, onBrushReset } = this.props; // Inserted with HOC withBrush

    if (brush.end) {
      const coords = getCoordsFromEvent(this.svg.current, event); // {x, y}
      onBrushEnd(coords);
      // Check if updateBrush in props allows the state to be changed properly up the tree.
    } else {
      onBrushReset(event);
      this.clearSelection();
    }
  };

  handleMouseMove = (event: React.MouseEvent) => {
    const { brush, onBrushDrag } = this.props; // Inserted with HOC withBrush
    if (brush.isBrushing) {
      const coords = getCoordsFromEvent(this.svg.current, event); // {x, y}
      onBrushDrag(coords);
    }
  };

  static pointInside = (x0: number, x1: number, y0: number, y1: number, { x, y, z, r }: Point) => {
    // Check that the point (x, y) is inside the drawn box
    if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
      return { x, y, z, r, selected: true };
    } else {
      return { x, y, z, r, selected: false };
    }
  };

  static getDerivedStateFromProps(props: ScatterProps, state: ScatterState) {
    const { xScale, yScale } = props;
    if (props.brush.domain) {
      return Scatter.dataSelection(state, xScale, yScale, props.brush);
    } else {
      return null;
    }
  }

  static dataSelection = (
    state: ScatterState,
    xScale: ScaleLinear<number, number>,
    yScale: ScaleLinear<number, number>,
    brush: Brush,
  ) => {
    let { x0, x1, y0, y1 } = brush.domain;
    // Sub-domain of the data points to be selected
    x0 = xScale.invert(x0);
    x1 = xScale.invert(x1);
    y0 = yScale.invert(y0);
    y1 = yScale.invert(y1);

    // Partially apply pointInside
    const pointInBrushBox = Scatter.pointInside.bind(null, x0, x1, y1, y0);

    const data = state.data.map(pointInBrushBox);

    return { data, selectionMade: data.some(p => p.selected) };
  };

  render() {
    const {
      props: { width, height, margin, colorFunc, brush, xScale, yScale, colorScale, rScale },
      state: { data, selectionMade },
    } = this;

    return (
      <svg
        width={width}
        height={height}
        ref={this.svg}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        <AxisLeft scale={yScale} label="y" left={margin.left} />
        <AxisBottom scale={xScale} label="x" top={height - margin.bottom} />
        <g>
          {data.map((point, k) => {
            const cx = xScale(point.x);
            const cy = yScale(point.y);
            const r = rScale(point.r);
            return (
              <circle
                cx={cx}
                cy={cy}
                r={data.every(p => p.r) ? r : this.props.radius}
                key={k}
                fill={colorFunc(colorScale(point.z))}
                // Make unselected points translucent but opaque if no selection is made
                opacity={selectionMade ? (point.selected ? 1 : 0.2) : 1}
              />
            );
          })}
        </g>
        <BoxBrush brush={brush} />
      </svg>
    );
  }
}

export default withBrush(withScales(Scatter));
