import { connect } from 'react-redux'
import { actions } from '../modules/githubStats'
import RawView from '../components/RawView'
import GraphView from '../components/GraphView'

/*  Object of action creators (can also be function that returns object).
 Keys will be passed as props to presentational components. */

const mapDispatchToProps = {
  ...actions
};

const mapStateToProps = ({stats}) => ({
  ...stats
});

export const Dump = connect(mapStateToProps, mapDispatchToProps)(RawView);
export const Graph = connect(mapStateToProps, mapDispatchToProps)(GraphView);
