import React from 'react'
import { AxisBottom, AxisLeft } from '@vx/axis'
import { scaleLinear } from '@vx/scale'
import { Text } from '@vx/text'

import { extent } from 'd3-array'

export default class Scatter extends React.Component {
  constructor(props) {
    super(props)
    const { width, height, margin, data } = props
    this.initialDomain = {
      x: extent(data, point => point.x),
      y: extent(data, point => point.y),
      z: extent(data, point => point.z),
    }
    this.xScale = scaleLinear({
      domain: this.initialDomain.x,
      range: [margin.left, width - margin.right],
    })

    this.yScale = scaleLinear({
      domain: this.initialDomain.y,
      range: [height - margin.bottom, margin.top],
    })

    this.colorScale = scaleLinear({
      domain: this.initialDomain.z,
      range: [0, 1],
    })
  }

  render() {
    const { width, height, margin, data, colorFunc } = this.props
    const { xScale, yScale, colorScale } = this
    return (
      <svg width={width} height={height} ref="svg">
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
      </svg>
    )
  }
}
