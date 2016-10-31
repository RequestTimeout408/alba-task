import request from 'browser-request'

// ------------------------------------
// Constants
// ------------------------------------
export const API_GET_DONE = 'API_GET_DONE';
export const API_GET_START = 'API_GET_START';
export const API_GET_ERROR = 'API_GET_ERROR';

// ------------------------------------
// Actions
// ------------------------------------
/*  This is a thunk, meaning it is a fun ction that immediately
 returns a function for lazy evaluation. It is incredibly useful for
 creating async actions, especially when combined with redux-thunk!

 NOTE: This is solely for demonstration purposes. In a real application,
 you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
 reducer take care of this logic.  */

const apiGet = () => {
  return (dispatch, getState) => {

    dispatch({type: API_GET_START});


    let since = '>2016-10-01';
    let langs = ['javascript', 'go', 'c', 'ruby', 'java', 'clojure'];

    return Promise.all(langs.map(lang=> {

        const url = `https://api.github.com/search/repositories` +
          `?q=created:${since}+language:${lang}` +
          '&sort=stars' +
          '&order:desc';

        return new Promise((reqResolve, reqReject) => {
          request({url, json: true, useQuerystring: true}, (error, response, body) => {
            if (!error && response.statusCode == 200) {
              reqResolve({
                name:lang,
                children:body.items.map( i=> ({name:i.name, size:i.stargazers_count}) ),
              })
            }
            else {
              dispatch({type: API_GET_ERROR});
              reqReject();
            }
          });

        });
      }
    )).then(function (data) {
      let payload = {
        name: 'Github',
        children: data,
      }
      dispatch({type: API_GET_DONE, payload});
    });
  }
}

export const actions = {
  apiGet
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {

  [API_GET_DONE]: (state, {payload}) =>(
    Object.assign({}, state, {
      items: payload,
      status: 'done',
    })
  ),

  [API_GET_START]: (state) =>(
    Object.assign({}, state, {status: 'pending'})
  ),

  [API_GET_ERROR]: (state) =>(
    Object.assign({}, state, {status: 'error'})
  )

}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  items: {},
  status: 'done',
};

export default function githubStatsReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
