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

const Scatter = ({
  width,
  height,
  margin,
  data,
  updateSelection,
  selectionMade = false,
  colorFunc,
  xScale,
  yScale,
  colorScale,
  rScale,
  radius,
  brush,
  onBrushStart, // Inserted with HOC withBrush
  onBrushDrag,
  onBrushEnd,
  onBrushReset,
  ...props
}: ScatterProps) => {
  const radiusProvided = data.every(p => p.r);

  const svg: React.RefObject<SVGSVGElement> = React.createRef();

  const handleMouseDown = (event: React.MouseEvent) => {
    const coords = getCoordsFromEvent(svg.current, event); // {x, y}
    onBrushStart(coords);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (brush.isBrushing) {
      const coords = getCoordsFromEvent(svg.current, event); // {x, y}
      onBrushDrag(coords);
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    // Inserted with HOC withBrush
    if (brush.end) {
      const coords = getCoordsFromEvent(svg.current, event); // {x, y}
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
              r={radiusProvided ? rScale(point.r) : radius}
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
};

export default withBrush(withScales(Scatter));
