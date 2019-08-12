import React from 'react';
import { AxisBottom, AxisLeft } from '@vx/axis';
import { getCoordsFromEvent, withBrush, BoxBrush } from '@vx/brush';

import { ScaleLinear } from 'd3-scale';

import { Point, Margin, Box } from '../common/types';
import withScales from '../HOC/withScales';

type Brush = {
  start: { x: number; y: number };
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
  updateSelection(bounds: Box): void;
  clearSelection(): void;
  selectionMade: boolean;
}

class Scatter extends React.PureComponent<ScatterProps> {
  svg: React.RefObject<SVGSVGElement> = React.createRef();

  handleMouseDown = (event: React.MouseEvent) => {
    const { onBrushStart } = this.props; // Inserted with HOC withBrush
    const coords = getCoordsFromEvent(this.svg.current, event); // {x, y}
    onBrushStart(coords);
  };

  handleMouseUp = (event: React.MouseEvent) => {
    const { brush, onBrushEnd, onBrushReset, updateSelection, xScale, yScale } = this.props; // Inserted with HOC withBrush

    if (brush.end) {
      const coords = getCoordsFromEvent(this.svg.current, event); // {x, y}
      onBrushEnd(coords);

      // Sub-domain of the data points to be selected in the data-space
      const x0 = xScale.invert(brush.start.x);
      const x1 = xScale.invert(brush.end.x);
      const y0 = yScale.invert(brush.start.y);
      const y1 = yScale.invert(brush.end.y);

      updateSelection({
        x0: Math.min(x0, x1),
        x1: Math.max(x0, x1),
        y0: Math.min(y0, y1),
        y1: Math.max(y0, y1),
      });


    } else {
      onBrushReset(event);
      this.props.clearSelection();
    }
  };

  handleMouseMove = (event: React.MouseEvent) => {
    const { brush, onBrushDrag } = this.props; // Inserted with HOC withBrush
    if (brush.isBrushing) {
      const coords = getCoordsFromEvent(this.svg.current, event); // {x, y}
      onBrushDrag(coords);
    }
  };

  render() {
    const {
      data,
      selectionMade,
      margin,
      colorFunc,
      brush,
      xScale,
      yScale,
      colorScale,
      rScale,
    } = this.props;

    return (
      <svg
        width={this.props.width}
        height={this.props.height}
        ref={this.svg}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        <AxisLeft scale={yScale} label="y" left={margin.left} />
        <AxisBottom scale={xScale} label="x" top={this.props.height - margin.bottom} />
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
