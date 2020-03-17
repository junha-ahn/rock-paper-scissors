const _ = require('lodash')
const {
  v4: uuidv4
} = require('uuid')

const activeRooms = new Map(); 
/*
  key(roomName), 
  value: [socketId]
      
*/
const ROOM_MAXIMUM = 2;

const joinRoom = (room, id) => {
  if (activeRooms.has(room)) {
    const ids = activeRooms.get(room);
    
    if (_.some(ids, id)) return true;
    if (ids.length >= ROOM_MAXIMUM) return false;
    ids.push(id);
    activeRooms.set(room, ids)
    return true;
  } else {
    activeRooms.set(room, [id])
    return true;
  }
}
module.exports = server => {
  const io = require('socket.io')(server);
  io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
      const room  = data.room || uuidv4();
      const status = joinRoom(room, socket.id);

      if (status) {
        socket.join(room);

        if (socket.joinRooms)  {
          socket.joinRooms.push(room)
        } else {
          socket.joinRooms = [];
        }
      };

      io.to(socket.id).emit('joined-room', {
        status,
        room,
      });
    });

    socket.on('disconnect', () => {
      const {
        id,
        joinRooms,
      } = socket;
      
      console.log('disconnect')
    });
  });
};
