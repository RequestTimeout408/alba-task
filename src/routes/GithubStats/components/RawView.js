import React from 'react'
import './RawView.scss'
import TimerangeSelector from './TimerangeSelector'
import Loader from '../../../components/Loader'

export const RawView = ({items, status, selectStartDate, startDate}) => {

  return <div>
    <TimerangeSelector
      status={status}
      startDate={startDate}
      selectStartDate={selectStartDate}
    />
    <div className="text-left">
      <h2>Raw data listing</h2>
      <p>
        Current stars per repo, grouped by language. Showing only repos created after during the selected
        month or later.
      </p>
    </div>
    { status === 'pending' ? <Loader /> : '' }
    { status === 'error' ? <div>
      <h3>There was an error fetching data from github.</h3>
      <p>This is likely because you've reached the usage limit of the search API.</p>
      <p>Reload the page and try again in a few moments.</p>
    </div> : ''}
    { status === 'done' ?
      <div className="text-left">
        { buildList(items) }
      </div>: ''
    }
  </div>
}

function buildList(item) {
  if (item.children) {
    return <div className="item-list" key={item.name}>
      <h3>{item.name}</h3>
      {item.children.map(buildList)}
    </div>
  }
  else {
    return <p key={item.name}>
      <strong>{item.size}</strong> - <a target="_blank" href={item.url}>{item.name}</a>
    </p>
  }

}

RawView.propTypes = {
  items: React.PropTypes.object.isRequired,
  status: React.PropTypes.string.isRequired,
  selectStartDate: React.PropTypes.func.isRequired,
}

export default RawView
