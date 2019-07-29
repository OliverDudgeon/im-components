import React from 'react'
import withAxes from './withAxes'

import { AxisBottom, AxisLeft } from '@vx/axis'

import { getCoordsFromEvent, withBrush, BoxBrush } from '@vx/brush'

const pointInside = (x0, x1, y0, y1, { x, y, z, r }) => {
  // Check that the point (x, y) is inside the drawn box
  if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
    return { x, y, z, r, selected: true }
  } else {
    return { x, y, z, r, selected: false }
  }
}

const Scatter = ({
  width,
  height,
  margin,
  data,
  makeSelection = () => {},
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
}) => {
  const radiusProvided = data.every(p => p.r)

  const svg = React.createRef()

  const handleMouseDown = event => {
    const coords = getCoordsFromEvent(svg.current, event) // {x, y}
    onBrushStart(coords)
  }

  const handleMouseMove = event => {
    if (brush.isBrushing) {
      const coords = getCoordsFromEvent(svg.current, event) // {x, y}
      onBrushDrag(coords)
    }
  }

  const dataSelection = () => {
    console.table(brush)
    let { x0, x1, y0, y1 } = brush.domain
    // Sub-domain of the data points to be selected
    x0 = xScale.invert(x0)
    x1 = xScale.invert(x1)
    y0 = yScale.invert(y0)
    y1 = yScale.invert(y1)

    // Partially apply pointInside
    const pointInBrushBox = pointInside.bind(null, x0, x1, y1, y0)

    const selectedData = data.map(pointInBrushBox)
    return { data: selectedData, selectionMade: data.some(p => p.selected) }
  }

  const handleMouseUp = event => {
    if (brush.end) {
      const coords = getCoordsFromEvent(svg.current, event) // {x, y}
      onBrushEnd(coords)

    } else {
      onBrushReset(event)
      // clearSelection()
    }
  }

  if (brush.domain) {
    makeSelection(dataSelection())
    onBrushReset()
  }


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
          )
        })}
      </g>
      <BoxBrush brush={brush} />
    </svg>
  )
}

export default withAxes(withBrush(Scatter))
