const SETISOVERVIEWDRAWER = "SETISOVERVIEWDRAWER"; //设置概览窗口显示或隐藏
const SETISOVERVIEWROOMDRAWER ="SETISOVERVIEWROOMDRAWER" //设置概览房间窗口显示或隐藏
const SETROOMLIST = "SETROOMLIST";
const SETDEVICELIST = "SETDEVICELIST"; //智能设备的接口
export default {
  SETISOVERVIEWDRAWER(state, preload) {
    state.overviewVisible = !state.overviewVisible;
  },
  SETISOVERVIEWROOMDRAWER(state, preload) {
    state.overViewRoomVisible = !state.overViewRoomVisible;
  },
  SETROOMLIST(state, preload) {
    state.roomDrawerList = preload.roomList;
  },
  SETDEVICELIST(state, preload) {
    state.deviceDrawerList = preload.deviceList;
  }
};
