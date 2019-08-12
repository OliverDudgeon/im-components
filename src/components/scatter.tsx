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
  onBrushDragged(bounds: Box): void;
  clearSelection(): void;
  selectionMade: boolean;
}

const Scatter = ({
  width,
  height,
  margin,
  data,
  onBrushDragged,
  selectionMade = false,
  xScale,
  yScale,
  colorScale,
  colorFunc,
  rScale,
  radius,
  ...props
}: ScatterProps) => {

  const svg: React.RefObject<SVGSVGElement> = React.createRef();

  const handleMouseDown = (event: React.MouseEvent) => {
    const coords = getCoordsFromEvent(svg.current, event); // {x, y}
    props.onBrushStart(coords); // Inserted with HOC withBrush
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (props.brush.isBrushing) {
      const coords = getCoordsFromEvent(svg.current, event); // {x, y}
      props.onBrushDrag(coords); // Inserted with HOC withBrush
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    // Inserted with HOC withBrush
    if (props.brush.end) {
      const coords = getCoordsFromEvent(svg.current, event); // {x, y}
      props.onBrushEnd(coords); // Inserted with HOC withBrush

      // Sub-domain of the data points to be selected in the data-space
      const x0 = xScale.invert(props.brush.start.x);
      const x1 = xScale.invert(props.brush.end.x);
      const y0 = yScale.invert(props.brush.start.y);
      const y1 = yScale.invert(props.brush.end.y);

      onBrushDragged({
        x0: Math.min(x0, x1),
        x1: Math.max(x0, x1),
        y0: Math.min(y0, y1),
        y1: Math.max(y0, y1),
      });
    } else {
      props.onBrushReset(event); // Inserted with HOC withBrush
      props.clearSelection();
    }
  };

  return (
    <svg
      width={width}
      height={height}
      ref={svg}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <AxisLeft scale={yScale} label="y" left={margin.left} />
      <AxisBottom scale={xScale} label="x" top={height - margin.bottom} />
      <g>
        {data.map((point, k) => {
          return (
            <circle
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={data.every(p => p.r) ? rScale(point.r) : radius}
              key={k}
              fill={colorFunc(colorScale(point.z))}
              // Make unselected points translucent but opaque if no selection is made
              opacity={selectionMade ? (point.selected ? 1 : 0.2) : 1}
            />
          );
        })}
      </g>
      <BoxBrush brush={props.brush} />
    </svg>
  );
};

export default withBrush(withScales(Scatter));
