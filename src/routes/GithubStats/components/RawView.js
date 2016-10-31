import React from 'react'
import './RawView.scss'
import TimerangeSelector from './TimerangeSelector'
import Loader from '../../../components/Loader'

export const RawView = ({items, status, selectStartDate, startDate }) => {

  return <div>
    <TimerangeSelector
      status={status}
      startDate={startDate}
      selectStartDate={selectStartDate}
    />
    { status === 'pending' ?
      <Loader /> :
      <div className="text-left">
        { buildList(items) }
      </div>
    }
  </div>
}

function buildList(item) {
  if (item.children) {
    return <div className="item-list" key={item.name}>
      <h2>{item.name}</h2>
      {item.children.map(buildList)}
    </div>
  }
  else {
    return <p key={item.name}>
      <a target="_blank" href={item.url}>{item.name}</a>
      <strong>{item.size}</strong>
    </p>
  }

}

RawView.propTypes = {
  items: React.PropTypes.object.isRequired,
  status: React.PropTypes.string.isRequired,
  selectStartDate: React.PropTypes.func.isRequired,
}

export default RawView
