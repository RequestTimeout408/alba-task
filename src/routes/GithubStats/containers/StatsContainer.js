import { connect } from 'react-redux'
import { actions } from '../modules/githubStats'
import RawView from '../components/RawView'
import GraphView from '../components/GraphView'

/*  Object of action creators (can also be function that returns object).
 Keys will be passed as props to presentational components. Here we are
 implementing our wrapper around increment; the component doesn't care   */

const mapDispatchToProps = {
  apiGet: actions.apiGet
}

const mapStateToProps = ({stats}) => ({
  items: stats.items,
  status: stats.status,
})


export const Dump = connect(mapStateToProps, mapDispatchToProps)(RawView);

export const Graph = connect(mapStateToProps, mapDispatchToProps)(GraphView);
