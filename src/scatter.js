import React from 'react'
import { AxisBottom, AxisLeft } from '@vx/axis'
import { scaleLinear } from '@vx/scale'
import { Text } from '@vx/text'
import { getCoordsFromEvent, constrainToRegion, withBrush, BoxBrush } from '@vx/brush'

import { extent } from 'd3-array'

class Scatter extends React.Component {
  constructor(props) {
    super(props)
    this.svg = React.createRef()
    const { width, height, margin, data } = props

    // The min-max of the data set
    this.initialDomain = {
      x: extent(data, point => point.x),
      y: extent(data, point => point.y),
      z: extent(data, point => point.z),
    }

    this.extent = {
      x0: margin.left,
      x1: width - margin.right,
      y0: margin.top,
      y1: height - margin.bottom,
    }

    // Scalar functions to convert between the data coords and the svg coords
    this.xScale = scaleLinear({
      domain: this.initialDomain.x,
      range: [this.extent.x0, this.extent.x1],
    })
    this.yScale = scaleLinear({
      domain: this.initialDomain.y,
      range: [this.extent.y1, this.extent.y0],
    })
    this.colorScale = scaleLinear({
      domain: this.initialDomain.z,
      range: [0, 1],
    })
  }

  handleMouseDown = event => {
    const { onBrushStart } = this.props // Inserted with HOC withBrush

    const coords = getCoordsFromEvent(this.svg.current, event) // {x, y}
    console.table(coords)
    const { extent: region } = this
    onBrushStart(constrainToRegion({ region, ...coords }))
  }

  scaleReset = () => {
    const { xScale, yScale, colorScale, initialDomain } = this
    xScale.domain(initialDomain.x)
    yScale.domain(initialDomain.y)
    colorScale.domain(initialDomain.z)
  }

  handleMouseUp = event => {
    const { brush, onBrushEnd, onBrushReset } = this.props // Inserted with HOC withBrush

    if (brush.end) {
      const coords = getCoordsFromEvent(this.svg.current, event) // {x, y}
      console.log(coords)
      const { extent: region } = this
      onBrushEnd(constrainToRegion({ region, ...coords }))
      console.log('Brush end')
    } else {
      onBrushReset(event)
      this.scaleReset()
      console.log('Not brush end')
    }
  }

  handleMouseMove = event => {
    const { brush, onBrushDrag } = this.props // Inserted with HOC withBrush
    if (brush.isBrushing) {
      const coords = getCoordsFromEvent(this.svg.current, event) // {x, y}
      const { extent: region } = this
      onBrushDrag(constrainToRegion({ region, ...coords }))
    }
  }

  render() {

    const {
      xScale,
      yScale,
      colorScale,
      props: { width, height, margin, data, colorFunc, brush },
    } = this

    if (brush.domain) {
      const { domain } = brush
      const { x0, x1, y0, y1 } = domain
      // Converts svg coord system values back to data coord system
      xScale.domain([x0, x1].map(xScale.invert))
      yScale.domain([y0, y1].map(yScale.invert))
    }

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
            const cx = xScale(point.x)
            const cy = yScale(point.y)
            return (
              //TODO: Maybe fill isn't the right way to give colour?
              <Text key={k} x={cx} y={cy} fill={colorFunc(colorScale(point.z))}>
                +
              </Text>
            )
          })}
        </g>
        <BoxBrush brush={brush} />
      </svg>
    )
  }
}

export default withBrush(Scatter)
