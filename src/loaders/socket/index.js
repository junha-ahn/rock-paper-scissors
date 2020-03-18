const _ = require('lodash')

module.exports = server => {
  const io = require('socket.io')(server);

  io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
      const room  = data.room || uuidv4();
      const {
        status,
        partner, 
      } = RoomService.join(socket.id)(room);

      if (status) {
        socket.join(room);
        if (socket.joinRooms) socket.joinRooms.push(room)
        else socket.joinRooms = [room];
        
        io.to(partner).emit('partner-join-room', {})
      };

      io.to(socket.id).emit('joined-room', {
        status,
        room,
        partner,
      });
    });
    socket.on('disconnect', () => {
      const {
        id,
        joinRooms,
      } = socket;

      const outRooms = (id, joinRooms) => {
        const out = RoomService.out(id)
        _.forEach(joinRooms, room => {
          const {
            partner 
          } = out(room)
          if (partner) io.to(partner).emit('partner-out-room', {})
        })
      }

      outRooms(id, joinRooms);
    });
  });
};
