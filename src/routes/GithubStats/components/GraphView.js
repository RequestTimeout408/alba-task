import React from 'react'
import './GraphView.scss'
import TimerangeSelector from './TimerangeSelector'
import Loader from '../../../components/Loader'

import Graph2D from './graphs/Graph2D';
import Graph3D from './graphs/Graph3D';
import _ from 'lodash'

const SIZE = 500;

export default class GraphView extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    /// Build circle diagram using D3
    const pack = d3.pack().size([SIZE, SIZE]);
    const root = d3.hierarchy(this.props.items)
      .sum(d => d.size)
      .sort((a, b)=> b.value - a.value);
    const descendants = pack(root).descendants();

    return (
      <div className="GraphView">
        <TimerangeSelector
          status={this.props.status}
          startDate={this.props.startDate}
          selectStartDate={this.props.selectStartDate}
        />
        <div className="displaysWrapper">
          { this.props.status === 'pending' ? <Loader /> : ''}

          <Graph3D
            items={descendants}
            expandedItems={this.props.expandedItems}
            size={SIZE}
            status={this.props.status} />

          <Graph2D
            items={descendants}
            expandedItems={this.props.expandedItems}
            size={SIZE}
            status={this.props.status}
            onItemOpened={this.props.expandItem}
            onItemClosed={this.props.closeItem}
          />
        </div>
      </div>
    )
  }
}
GraphView.propTypes = {
  items: React.PropTypes.object.isRequired,
  expandedItems: React.PropTypes.object.isRequired,
  status: React.PropTypes.string.isRequired,
  selectStartDate: React.PropTypes.func.isRequired,
  expandItem: React.PropTypes.func.isRequired,
  closeItem: React.PropTypes.func.isRequired,
}
