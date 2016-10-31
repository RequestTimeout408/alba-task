import React from 'react'
import './RawView.scss'

export const RawView = ({items, status, apiGet}) => (
  <div className="canvas">
    <button onClick={apiGet}>API GET ({status})</button>
    {items.map(i=>(
      <div key={i.id}>
        <a href={i.html_url}>{i.name} - {i.stargazers_count}</a>
      </div>))}
  </div>
)

RawView.propTypes = {
  items: React.PropTypes.array.isRequired,
  status: React.PropTypes.string.isRequired,
  apiGet: React.PropTypes.func.isRequired,
}

export default RawView
