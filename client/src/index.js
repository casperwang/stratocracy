import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Game from './App';
import webSocket from 'socket.io-client'
import reportWebVitals from './reportWebVitals';

const Main = () => {
  let state = {
    playerCount: 2,
    playerId: 0,
    mapSize: {'r': 20, 'c': 20},
    grids: Array(20 * 20).fill().map(_ => ({
      visable: false,
      value: null
    }))
  };
  
  const [ws, setWs] = useState(null);

  const connectWebSocket = async () => {
    await setWs(webSocket('http://localhost:8000'));
  }

  const start = async () => {
    await connectWebSocket();
  }

  const sendNextStep = (data) => {
    ws.emit('nextStep', data);
  }

  useEffect( () => {
    if (ws) {
      ws.on('initStatus_' + state.playerId, data => {
        state.mapSize = data.mapSize;
      });
      ws.on('currentStatus_' + state.playerId, data => {
        state.grids = data.grids;
      });
      console.log('readyToStart');
      ws.emit('readyToStart', state.playerId);
    }
  }, [ws]);

  return (
    <div>
      <Game 
        playerCount={state.playerCount}
        playerId={state.currentPlayer}
        mapSize={state.mapSize}
        grids={state.grids}
      />
      <input type='button' value='Start' onClick={start} />
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);


reportWebVitals();
