import request from 'browser-request'
import {combineReducers} from 'redux'

// ------------------------------------
// Constants
// ------------------------------------
export const API_ALL_DONE = 'API_ALL_DONE';
export const API_GET_DONE = 'API_GET_DONE';
export const API_GET_START = 'API_GET_START';
export const API_GET_ERROR = 'API_GET_ERROR';

export const EXPAND_ITEM = 'EXPAND_ITEM';
export const CLOSE_ITEM = 'CLOSE_ITEM';

export const SET_START_DATE = 'SET_START_DATE';

// ------------------------------------
// Actions
// ------------------------------------
/*  This is a thunk, meaning it is a function that immediately
 returns a function for lazy evaluation. It is incredibly useful for
 creating async actions, especially when combined with redux-thunk!

 NOTE: This is solely for demonstration purposes. In a real application,
 you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
 reducer take care of this logic.  */

function selectStartDate(dateString) {
  return (dispatch, getState) => {

    let fromDate = dateString;
    if (!fromDate) {
      fromDate = getSelectedDate(getState())
    }

    /// Updates UI Selected date
    dispatch({type: SET_START_DATE, payload: fromDate});

    /// Updates UI to show loader
    dispatch({type: API_GET_START});


    const langs = ['javascript', 'java', 'Python'];//, 'CSS', 'PHP', 'Ruby', 'C++', 'Shell'];

    return Promise.all(langs.map(lang=> {

        const url = `https://api.github.com/search/repositories` +
          `?q=created:>${fromDate}+language:${lang}` +
          '&sort=stars' +
          '&order:desc';

        return new Promise((reqResolve, reqReject) => {

          /// Look in the cache reduced first
          const cachedString = getCachedURL(getState(), url);
          if (cachedString) {
            reqResolve({language: lang, body: cachedString});
            return;
          }

          /// If there is nothing is the cache, make the request
          request({url}, (error, response, body) => {
            if (!error && response.statusCode == 200) {

              /// Tell reducers we finished one API call
              dispatch({
                type: API_GET_DONE,
                payload: {url, body}
              });

              /// Resolve promise, passing the retrieved data
              reqResolve({language: lang, body});
            }
            else {
              /// Reject for errors.
              reqReject();
            }
          });

        });
      }
    ))
      .then(
        langBodyPairs => {
          /// Dispatch action with all bodies
          dispatch({type: API_ALL_DONE, payload: langBodyPairs});
        },
        error => {
          dispatch({type: API_GET_ERROR});
        }
      )
  }
}

function expandItem(name) {
  return {
    type: EXPAND_ITEM,
    payload: name
  }
}

function closeItem(name) {
  return {
    type: CLOSE_ITEM,
    payload: name
  }
}

export const actions = {
  expandItem,
  closeItem,
  selectStartDate,
}


// ------------------------------------
// Reducers
// ------------------------------------
const initialState = {
  items: {name: '', size: 1},
  startDate: '2016-10-01',
  expandedItems: {},
  status: 'done',
  cache: {},
};

export const getSelectedDate = (state) => state.stats.startDate;
export const getCachedURL = (state, url) => state.stats.cache[url];


const startDate = (state = initialState.startDate, action) => {
  switch (action.type) {
    case SET_START_DATE:
      return action.payload;
    default:
      return state
  }
}

const status = (state = initialState.status, action) => {
  switch (action.type) {
    case API_GET_ERROR:
      return 'error'
    case API_GET_START:
      return 'pending'
    case API_ALL_DONE:
      return 'done'
    default:
      return state
  }
}

const items = (state = initialState.items, action) => {
  switch (action.type) {
    case API_ALL_DONE:
      const langBodyPairs = action.payload;
      return {
        name: 'Github',
        children: langBodyPairs.map(({language, body}) => {
          const langItem = JSON.parse(body);
          return {
            name: language,
            children: langItem.items.map(i=> ({
              name: i.name,
              size: i.stargazers_count,
              url: i.html_url,
              description: i.description,
              expanded: false,
            })),
          };
        }),
      };
    default:
      return state
  }
}

const expandedItems = (state = initialState.expandedItems, action) => {
  switch (action.type) {
    case API_GET_START:
      return {};
    case API_ALL_DONE:
      ///Reset selections after receiving new data set
      const langBodyPairs = action.payload;
      const baseState = {'Github': true};
      langBodyPairs.forEach(
        ({language}) => baseState[language] = true
      );
      return baseState;
      return {};

    case EXPAND_ITEM:
      return {
        ...state,
        [action.payload.data.name]: true
      };
    case CLOSE_ITEM:
      return {
        ...state,
        [action.payload.data.name]: false
      };
    default:
      return state
  }
}

const cache = (state = initialState.cache, action) => {
  switch (action.type) {
    case API_GET_DONE:
      const {url, body} = action.payload;
      return {
        ...state,
        [url]: body
      }
    default:
      return state
  }
}

export default combineReducers({
  cache,
  status,
  startDate,
  items,
  expandedItems,
})

