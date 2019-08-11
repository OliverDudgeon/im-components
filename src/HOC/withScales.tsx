import React from 'react';
import { extent } from 'd3-array';
import { Point, Margin } from '../common/types';
import { scaleLinear } from '@vx/scale';

interface WithAxesProps {
  width: number;
  height: number;
  margin: Margin;
  data: Point[];
  minRadius: number;
  maxRadius: number;
}

const withScales = <P extends object>(WrappedComponent: React.ComponentType<P>) => (
  props: WithAxesProps,
) => {
  const { data, margin, width, height, minRadius, maxRadius } = props;
  // The min-max of the data set
  const initialDomain = {
    x: extent(data, (point: Point) => point.x),
    y: extent(data, (point: Point) => point.y),
    z: extent(data, (point: Point) => point.z),
    r: extent(data, (point: Point) => point.r),
  };
  // Four corners of the graph region
  const extentOfDataRegion = {
    x0: margin.left,
    x1: width - margin.right,
    y0: margin.top,
    y1: height - margin.bottom,
  };
  // Scalar functions to convert between the data coords and the svg coords
  const scales = {
    xScale: scaleLinear({
      domain: initialDomain.x,
      range: [extentOfDataRegion.x0, extentOfDataRegion.x1],
    }),
    yScale: scaleLinear({
      domain: initialDomain.y,
      range: [extentOfDataRegion.y1, extentOfDataRegion.y0],
    }),
    colorScale: scaleLinear({
      domain: initialDomain.z,
      range: [0, 1],
    }),
    rScale: scaleLinear({
      domain: initialDomain.r,
      range: [minRadius, maxRadius],
    }),
  };
  return <WrappedComponent initialDomain={initialDomain} {...scales} {...props as P} />;
};

export default withScales;
