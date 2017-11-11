var http = require('http');
var server = http.createServer();
var socket_io = require('socket.io');
server.listen(1359);
var io = socket_io();

io.attach(server);

function clients(page) {
  if (!page) return Object.keys(io.eio.clients);
  return Object.keys(io.sockets.adapter.rooms[page].sockets);
}
io.on('connection', function(socket){
  console.log("Socket connected: " + socket.id, clients());
  socket.on('page', function(page) {
    socket.join(page);
    console.log('in room', page, 'there are', clients(page));
    socket.on('action', (action) => {
      //io.to(page).emit('action', Object.assign({}, action, {type: action.type.replace('server/', '')} ));
      clients(page).forEach((client, id) => {
        console.log('send to', client);
        io.sockets.connected[client].emit('action', Object.assign({}, action, {type: action.type.replace('server/', '')}));
      })
    });
    if (clients(page).length === 4) {
      clients(page).forEach( (client, id) => {
        io.sockets.connected[client].emit('action', {type: 'SET_PLAYER', data: id});
      })
    }
  });
});
