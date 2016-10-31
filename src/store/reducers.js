import { combineReducers } from 'redux'
import locationReducer from './location'
import StatsReducer from '../routes/GithubStats/modules/githubStats'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    location: locationReducer,
    stats: StatsReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
