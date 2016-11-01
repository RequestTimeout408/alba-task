import React from 'react'
import _ from 'lodash'

// / 'import' cdn scripts, workaround for lint to pass
const d3 = window.d3

function safeClassName (n) {
  // TODO:dont use this shit...
  return '__' + (n + '-')
      .split('.').join('__')
      .split('#').join('__')
      .split('+').join('__')
}

export default class Graph2D extends React.Component {

  render () {
    console.log('---- 2D ---- Re-rendering SVG root')
    return <svg ref='svg' width={this.props.size} height={this.props.size} />
  }

  shouldComponentUpdate (nextProps) {
    // / Make sure this view doesn't re-render
    return !_.isEqual(nextProps.items, this.props.items)
  }

  componentDidMount () {
    this.buildSVG(this.props.items, this.props.expandedItems)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.status !== 'done') {
      // svg.selectAll("*").remove();
      return
    }

    if (
      !_.isEqual(nextProps.items, this.props.items) || !_.isEqual(nextProps.expandedItems, this.props.expandedItems)
    ) {
      this.buildSVG(nextProps.items, nextProps.expandedItems)
    }
  }

  componentDidUpdate () {
    this.buildSVG(this.props.items, this.props.expandedItems)
  }

  buildSVG (items, expandedItems) {
    if (!items) {
      return
    }

    console.log('---- 2D ---- Re-building SVG')

    const self = this
    const svg = d3.select(this.refs.svg)
    svg.selectAll('*').remove()
    const g = svg.append('g')
    const descendants = items

    const node = g.selectAll('.node')
      .data(descendants)
      .enter().append('g')
      .attr('id', d => safeClassName(d.data.name))
      .attr('class', d => {
        const isItemExpanded = isExpanded(d)
        const hasExpandedParent = isExpanded(itemParent(d))
        const isActive = !isItemExpanded && hasExpandedParent

        return 'node' +
          (!d.children ? ' leaf' : '') +
          (isActive ? ' active' : '')
      })
      .attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')'
      })

    function highestClosedParent (d) {
      if (isExpanded(d)) return null
      const parent = itemParent(d)
      if (!parent || isExpanded(parent)) return d
      return highestClosedParent(parent)
    }

    function isExpanded (d) {
      return d && expandedItems[d.data.name]
    }

    function itemParent (d) {
      return descendants.find(c => {
        return c.children && c.children.indexOf(d) >= 0
      })
    }

    function hasOpenChildren (d) {
      if (!d.children) return false
      if (d.children.some(c => expandedItems[c.data.name])) {
        return true
      }
      return d.children.some(hasOpenChildren)
    }

    function onCircleClick (d) {
      // / "Bubble" clicks on leafs for now
      if (!d.children) {
        return onCircleClick(itemParent(d))
      }

      const toOpen = highestClosedParent(d)
      if (toOpen) {
        // /Only open items with children
        if (toOpen.children) {
          self.props.onItemOpened(toOpen)
        }
      } else {
        // / Close selected group if is has no open children
        if (!hasOpenChildren(d)) {
          self.props.onItemClosed(d)
        }
      }
    }

    node.append('circle')
      .attr('r', d => d.r)
      .on('click', onCircleClick)

    node.append('text')
      .attr('dy', '0.3em')
      .text(d => d.data.name.substring(0, d.r / 3))
      .on('click', onCircleClick)
  }
}

Graph2D.propTypes = {
  items: React.PropTypes.array.isRequired,
  expandedItems: React.PropTypes.object.isRequired,
  status: React.PropTypes.string.isRequired,
  size: React.PropTypes.number.isRequired,
  onItemOpened: React.PropTypes.func.isRequired,
  onItemClosed: React.PropTypes.func.isRequired
}
