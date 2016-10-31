import React from 'react'
import './TimerangeSelector.scss';


const options = [
  {value: '2016-10-01', label: 'Since Oct 2016'},
  {value: '2016-01-01', label: 'Since Jan 2016'},
  {value: '2015-01-01', label: 'Since Jan 2015'},
  {value: '2014-01-01', label: 'Since Jan 2014'},
]

export const TimerangeSelector = ({status, selectStartDate, startDate}) => (
  <div className="component-timerangeSelector">
    {
      options.map(o => {
          const isActive = startDate === o.value;
          return <button
            key={o.value}
            className={isActive ? 'active' : ''}
            disabled={isActive || status !== 'done'}
            onClick={()=>selectStartDate(o.value)}>
            {o.label}
          </button>
        }
      )

    }
  </div>
)

TimerangeSelector.propTypes = {
  status: React.PropTypes.string.isRequired,
  startDate: React.PropTypes.string.isRequired,
  selectStartDate: React.PropTypes.func.isRequired,
}

export default TimerangeSelector
