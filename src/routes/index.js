// We only need to import the modules necessary for initial render
import CoreLayout from '../layouts/CoreLayout/CoreLayout'
import Home from './Home'
import {Graph, Dump} from './GithubStats/containers/StatsContainer'
import {actions as githubActions} from './GithubStats/modules/githubStats'

export const createRoutes = (store) => (
  {
    path        : '/',
    component   : CoreLayout,
    indexRoute  : Home,
    childRoutes : [
      {
        path: '/stats',
        indexRoute:{component:Graph},
        onEnter: () => {
          githubActions.selectStartDate()(store.dispatch, store.getState);
        }
      },
      {
        path: '/stats-list',
        indexRoute:{component:Dump},
        onEnter: () => {
          githubActions.selectStartDate()(store.dispatch, store.getState);
        }
      }
    ]
  });

/*  Note: childRoutes can be chunked or otherwise loaded programmatically
    using getChildRoutes with the following signature:

    getChildRoutes (location, cb) {
      require.ensure([], (require) => {
        cb(null, [
          // Remove imports!
          require('./Counter').default(store)
        ])
      })
    }

    However, this is not necessary for code-splitting! It simply provides
    an API for async route definitions. Your code splitting should occur
    inside the route `getComponent` function, since it is only invoked
    when the route exists and matches.
*/

export default createRoutes
