const _ = require('lodash')

const ROOM_MAXIMUM = 2;
const activeRooms = new Map(); 

/*
  활성화 상태의 Room List 
  한 Room(가위바위보 게임방)당 2명을 제한한다.
  Redis 활용 고려. (특히 클러스터링등)

  key(roomName), 
  value: [socketId]
*/
module.exports = {
  join: id => room => {
    const response = (status, partner = null) => ({status, partner}) // status: join 성공 여부, partner: 파트너 socket id
    if (activeRooms.has(room)) {
      const ids = activeRooms.get(room);
      // if (_.some(ids, id)) return response(true);
      if (ids.length >= ROOM_MAXIMUM) return response(false);
      ids.push(id);
      activeRooms.set(room, ids)
      return response(true, ids[0]);
    }
    activeRooms.set(room, [id])
    return response(true);
  },
  out: id => room => {
    const ids = activeRooms.get(room)
    if (Array.isArray(ids)) {
      const newIds = _.filter(ids, _id => _id !== id)
  
      if (newIds.length) {
        activeRooms.set(room, newIds)
        return { partner: newIds[0] }
      }
      activeRooms.delete(room)
      return { partner: null }
    }
  },
}