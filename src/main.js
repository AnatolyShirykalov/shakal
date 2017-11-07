import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import Game from './containers/Game'
import reducer from './reducer'
import * as actions from './actions'
import { AppContainer } from 'react-hot-loader'

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);


const r = () => {
  render(
    <AppContainer>
      <Provider store={store}>
        <Game />
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  )
}

r();

if (module.hot) module.hot.accept('./containers/Game', r);

