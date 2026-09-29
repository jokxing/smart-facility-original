import {post} from '@/utils/axios.js';

export const resetDemoRoomLayout = roomId =>
  post('/demo/room-layout/reset', {roomId}, {
    headers: {'content-type': 'application/json'}
  });
