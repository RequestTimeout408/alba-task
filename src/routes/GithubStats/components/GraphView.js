import React from 'react'
import './GraphView.scss'
import TimerangeSelector from './TimerangeSelector'
import Loader from '../../../components/Loader'

import Graph2D from './graphs/Graph2D';
import Graph3D from './graphs/Graph3D';
import _ from 'lodash'

const SIZE = 700;

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

        <div className="text-left">
          <h2>Graph visualization</h2>
          <p>
            Current stars per repo, grouped by language. Showing only repos created after during the selected
            month or later.
          </p>
          <p>
            Clicking a circle toggles its expanded state. An expanded language circle displays the most active repos'
            sizes.
          </p>
        </div>

        <div className="displaysWrapper">
          { this.props.status === 'pending' ? <Loader /> : ''}
          { this.props.status === 'error' ? <div>
            <h3>There was an error fetching data from github.</h3>
            <p>This is likely because you've reached the usage limit of the search API.</p>
            <p>Reload the page and try again in a few moments.</p>
          </div> : ''}

          <Graph3D
            items={descendants}
            expandedItems={this.props.expandedItems}
            size={SIZE}
            status={this.props.status}/>

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
