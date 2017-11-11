import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { Provider } from 'react-redux'
import Game from './containers/Game'
import reducer from './reducer'
import * as actions from './actions'
import { AppContainer } from 'react-hot-loader'
import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';
const socket = io('http://localhost:1359');
//const socket = io();
const socketIoMiddleware = createSocketIoMiddleware(socket, "server/");

const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(socketIoMiddleware))
  //window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
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

