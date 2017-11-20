import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { Provider } from 'react-redux'
import Game from './containers/Game'
import reducer from './reducer'
import { AppContainer } from 'react-hot-loader'
import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';
import queryString from 'query-string'

const socket =
  process.env.NODE_ENV === 'production' ?
  io() :
  io('http://0.0.0.0:12312');

const query = queryString.parse(window.location.search);
const playerId = query['player'];
const gameId = query['game'];

const socketIoMiddleware = createSocketIoMiddleware(socket, "server/");


const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(socketIoMiddleware))
  //window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

window.socket = socket;

const r = () => {
  render(
    <AppContainer>
      <Provider store={store}>
        <Game />
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  );
}

r();

if (module.hot) module.hot.accept('./containers/Game', r);

setTimeout(
  ()=>store.dispatch({type: 'server/JOIN', playerId, gameId}),
  2000);
