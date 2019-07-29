import React from 'react'

import { extent } from 'd3-array'

import { scaleLinear } from '@vx/scale'

// * Adds four axes to the components props
const withAxes = WrappedComponent => {
  return class withAxes extends React.Component {
    render() {
      const { width, height, margin, data, minRadius, maxRadius } = this.props
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

      const scales = {
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
      return <WrappedComponent {...this.props} {...scales} />
    }
  }
}

export default withAxes
