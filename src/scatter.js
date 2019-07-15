import React from 'react'
import { AxisBottom, AxisLeft } from '@vx/axis'
import { scaleLinear } from '@vx/scale'
import { Text } from '@vx/text'

import { extent } from 'd3-array'

export default ({ data, width, height, colorFunc }) => {

  const margin = {
    top: 40,
    left: 50,
    bottom: 40,
    right: 40,
  }

  const xScale = scaleLinear({
    domain: extent(data, point => point.x),
    range: [margin.left, width - margin.right],
  })

  const yScale = scaleLinear({
    domain: extent(data, point => point.y),
    range: [height - margin.bottom, margin.top],
  })

  const colorScale = scaleLinear({
    domain: extent(data, point => point.z),
    range: [0, 1],
  })

  return (
    <svg width={width} height={height}>
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
