module.exports = server => {
  const io = require('socket.io')(server);
  io.on('connection', onConnection);
};

function onConnection(socket) {

}