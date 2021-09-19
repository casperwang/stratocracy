const express = require('express')
const app = express()

const server = require('http').Server(app)
    .listen(8000, () => {console.log('open server!')})

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

var state = {
  timeCounter: 0,
  playerCount: 1,
  mapSize: {'r': 20, 'c': 20},
  grids: Array(20 * 20).fill().map(_ => ({
    type: "flat",
    occupied: -1,
    visable: false,
    value: 0,
  }))
};

var growInterval = 10;

var isReady = Array(state.playerCount).fill(false);

var dir = [
  {'x': -1, 'y':  1},
  {'x': -1, 'y':  0},
  {'x': -1, 'y': -1},
  {'x':  0, 'y': -1},
  {'x':  1, 'y': -1},
  {'x':  1, 'y':  0},
  {'x':  1, 'y':  1},
  {'x':  0, 'y':  1},
  {'x':  0, 'y':  0},
]

function isInMap(x, y) {
  return x >= 0 && x < state.mapSize.r && y >= 0 && y < state.mapSize.c;
}

function posId(x, y) {
  return x * state.mapSize.c + y;
}

io.on('connection', socket => {
  console.log('success connect!');
  socket.on('readyToStart', playerId => {
    isReady[playerId] = true;
    console.log("start");
    if (isReady.every((a) => { return a; })) {
      gameStart(socket);
      running(socket);
    }
  });
});

function gameStart(socket) {
  let data = {
    mapSize: state.mapSize,
  }
  for (let playerId = 0; playerId < state.playerCount; playerId++) {
    while (true) {
      let pos = Math.floor(Math.random() * (state.mapSize.r * state.mapSize.c));
      if (state.grids[pos].occupied === -1) {
        state.grids[pos].occupied = playerId;
        state.grids[pos].type = "home";
        break;
      }
    }
    socket.emit('initStatus_' + playerId, data);
  }
}

function running(socket) {
  socket.on('newStep', message => {
    console.log(message);
  });
  setInterval(() => {
    for (let playerId = 0; playerId < state.playerCount; playerId++) {
      data = {
        grids: state.grids,
      }
      for (let x = 0; x < state.mapSize.r; x++) {
        for (let y = 0; y < state.mapSize.c; y++) {
          for (let d = 0; d < 9; d++) {
            let _x = x + dir[d].x, _y = y + dir[d].y;
            if (isInMap(_x, _y)
              && data.grids[posId(_x, _y)].occupied === playerId) {
              data.grids[posId(x, y)].visable = true;
            }
          }
        }
      }
      socket.emit('currentStatus_' + playerId, data);
    };
    for (let x = 0; x < state.mapSize.r; x++) {
      for (let y = 0; y < state.mapSize.c; y++) {
        if (data.grids[x * state.mapSize.c + y].occupied != -1) {
          let type = data.grids[posId(x, y)].type;
          if (type === "flat" && timeCounter % growInterval === 0) {
            data.grids[posId(x, y)].value++;
          } else if (type === "home") {
            data.grids[posId(x, y)].value++;
          }
        }
      }
    }
    state.timeCounter++;
  }, 400);
}