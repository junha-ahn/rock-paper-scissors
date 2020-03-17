const _ = require('lodash')
const {
  v4: uuidv4
} = require('uuid')

const ROOM_MAXIMUM = 2;
const activeRooms = new Map(); 
/*
  활성화 상태의 Room List 
  한 Room(가위바위보 게임방)당 2명을 제한한다.
  Redis 활용 고려. (특히 클러스터링등)

  key(roomName), 
  value: [socketId]
      
*/

const joinRoom = id => room => {
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
const outRoom = id => room => {
  const ids = activeRooms.get(room)
  if (Array.isArray(ids)) {
    const newIds = _.filter(ids, _id => _id !== id)
    if (newIds.length) activeRooms.set(room, newIds)
    else {
      activeRooms.delete(room)
    }
  }
}

module.exports = server => {
  const io = require('socket.io')(server);
  io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
      const room  = data.room || uuidv4();
      const status = joinRoom(socket.id)(room);

      if (status) { // join 성공
        socket.join(room);
        if (socket.joinRooms)  {
          socket.joinRooms.push(room)
        } else {
          socket.joinRooms = [room];
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
      const outRooms = (id, joinRooms) => {
        const out = outRoom(id)
        _.map(joinRooms, room => out(room))
      } 
      outRooms(id, joinRooms);
    });
  });
};
