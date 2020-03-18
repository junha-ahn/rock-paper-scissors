const _ = require('lodash')
const {
  v4: uuidv4
} = require('uuid')
const RoomService = require('./room')
const Logger = $require('loaders/logger');

function log(socket, msg) {
  Logger.info(`[${msg}] : ${socket.id.substring(0, 4)}`)
}
module.exports = server => {
  const io = require('socket.io')(server);

  io.on('connection', (socket) => {
    log(socket, `접속`)

    socket.on('join-room', (data) => {
      const room  = data.room || uuidv4();
      const {
        status,
        partner, 
      } = RoomService.join(socket.id)(room);
      log(socket, `JOIN ${room.substring(0, 4)}`)

      if (status) {
        socket.join(room);
        if (socket.joinRooms) socket.joinRooms.push(room)
        else socket.joinRooms = [room];
        
        io.to(partner).emit('partner-join-room', {
          partnerId: socket.id,
        })
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
      log(socket, `disconnect`)

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

    socket.on("call-user", ({
      to,
      offer,
    }) => {
      // Room 체크 처리 등
      log(socket, `call-user`)
      socket.to(to).emit("call-made", {
        id: socket.id,
        offer,
      });
    });
    socket.on("make-answer", ({
      to,
      answer,
    }) => {
      log(socket, `make-answer`)
      socket.to(to).emit("answer-made", {
        id: socket.id,
        answer,
      });
    });
  });
};
