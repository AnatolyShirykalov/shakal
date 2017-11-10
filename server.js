var http = require('http');
var server = http.createServer();
var socket_io = require('socket.io');
server.listen(3001);
var io = socket_io();

io.attach(server);

function clients() {
  return Object.keys(io.eio.clients);
}
io.on('connection', function(socket){
  console.log("Socket connected: " + socket.id, clients());
  if (clients().length === 4) {
    clients().forEach( (client, id) => {
      io.sockets.connected[client].emit('action', {type: 'SET_PLAYER', data: id});
    })
  }
  socket.on('action', (action) => {
    io.sockets.emit('action', Object.assign({}, action, {type: action.type.replace('server/', '')} ));
  });
});
