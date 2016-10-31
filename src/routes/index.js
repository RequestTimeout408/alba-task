// We only need to import the modules necessary for initial render
import CoreLayout from '../layouts/CoreLayout/CoreLayout'
import Home from './Home'
import CounterRoute from './Counter'

import {Graph, Dump} from './GithubStats/containers/StatsContainer'
import {actions as githubActions} from './GithubStats/modules/githubStats'

/*  Note: Instead of using JSX, we recommend using react-router
    PlainRoute objects to build route definitions.   */

export const createRoutes = (store) => (
  {
    path        : '/',
    component   : CoreLayout,
    indexRoute  : Home,
    childRoutes : [
      CounterRoute(store),
      {
        path: '/stats',
        indexRoute:{component:Graph},
        onEnter: () => {
          githubActions.apiGet()(store.dispatch);
        }
      },
      {
        path: '/stats-list',
        indexRoute:{component:Dump},
        onEnter: () => {
          githubActions.apiGet()(store.dispatch);
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
