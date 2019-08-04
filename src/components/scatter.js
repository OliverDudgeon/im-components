import React from 'react'
import { AxisBottom, AxisLeft } from '@vx/axis'
import { scaleLinear } from '@vx/scale'
import { getCoordsFromEvent, withBrush, BoxBrush } from '@vx/brush'

import { extent } from 'd3-array'

class Scatter extends React.Component {
  svg = React.createRef()

  constructor(props) {
    super(props)
    const { width, height, margin, data, minRadius, maxRadius } = props

    // The min-max of the data set
    this.initialDomain = {
      x: extent(data, point => point.x),
      y: extent(data, point => point.y),
      z: extent(data, point => point.z),
      r: extent(data, point => point.r),
    }

    // Four corners of the graph region
    this.extent = {
      x0: margin.left,
      x1: width - margin.right,
      y0: margin.top,
      y1: height - margin.bottom,
    }

    // Scalar functions to convert between the data coords and the svg coords
    this.state = {
      data,
      selectionMade: false,
      xScale: scaleLinear({
        domain: this.initialDomain.x,
        range: [this.extent.x0, this.extent.x1],
      }),
      yScale: scaleLinear({
        domain: this.initialDomain.y,
        range: [this.extent.y1, this.extent.y0],
      }),
      colorScale: scaleLinear({
        domain: this.initialDomain.z,
        range: [0, 1],
      }),
      rScale: scaleLinear({
        domain: this.initialDomain.r,
        range: [minRadius, maxRadius],
      }),
    }

    this.radiusProvided = data.every(p => p.r)
  }

  handleMouseDown = event => {
    const { onBrushStart } = this.props // Inserted with HOC withBrush
    const coords = getCoordsFromEvent(this.svg.current, event) // {x, y}
    onBrushStart(coords)
  }

  clearSelection = () => {
    this.setState({
      data: this.state.data.map(p => ({ ...p, selected: false })),
      selectionMade: false,
    })
  }

  handleMouseUp = event => {
    const { brush, onBrushEnd, onBrushReset } = this.props // Inserted with HOC withBrush

    if (brush.end) {
      const coords = getCoordsFromEvent(this.svg.current, event) // {x, y}
      onBrushEnd(coords)
    } else {
      onBrushReset(event)
      this.clearSelection()
    }
  }

  handleMouseMove = event => {
    const { brush, onBrushDrag } = this.props // Inserted with HOC withBrush
    if (brush.isBrushing) {
      const coords = getCoordsFromEvent(this.svg.current, event) // {x, y}
      onBrushDrag(coords)
    }
  }

  static pointInside = (x0, x1, y0, y1, { x, y, z, r }) => {
    // Check that the point (x, y) is inside the drawn box
    if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
      return { x, y, z, r, selected: true }
    } else {
      return { x, y, z, r, selected: false }
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { xScale, yScale } = state
    if (props.brush.domain) {
      return Scatter.dataSelection(state, xScale, yScale, props.brush)
    } else {
      return null
    }
  }

  static dataSelection = (state, xScale, yScale, brush) => {
    let { x0, x1, y0, y1 } = brush.domain
    // Sub-domain of the data points to be selected
    x0 = xScale.invert(x0)
    x1 = xScale.invert(x1)
    y0 = yScale.invert(y0)
    y1 = yScale.invert(y1)

    // Partially apply pointInside
    const pointInBrushBox = Scatter.pointInside.bind(null, x0, x1, y1, y0)

    const data = state.data.map(pointInBrushBox)

    return { data, selectionMade: data.some(p => p.selected) }
  }

  render() {
    console.table(this.state.data)
    const {
      props: { width, height, margin, colorFunc, brush },
      state: { data, selectionMade, xScale, yScale, colorScale, rScale },
    } = this

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
            const r = rScale(point.r)
            return (
              <circle
                cx={cx}
                cy={cy}
                r={this.radiusProvided ? r : this.props.radius}
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
}

export default withBrush(Scatter)
