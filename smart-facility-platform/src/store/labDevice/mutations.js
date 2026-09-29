/** 实验室设备 **/
const ADDMODAL = "ADDMODAL"; //新增弹窗
const HIDEMODAL = "HIDEMODAL"; //关闭弹窗
const EDITMODAL = "EDITMODAL"; //关闭弹窗
const REFLESH = "REFLESH"; //刷新标识
const TOFULLSCREEN = "TOFULLSCREEN"; //打开全屏
const EXITFULLSCREEN = "EXITFULLSCREEN"; //退出全屏
const SETDETAILID = "SETDETAILID"; //获取详情id

/** 预约管理 **/
export default {
  ADDMODAL(state, item) {
    state.modalVisible = true;
    state.isEdit = false;
  },
  EDITMODAL(state, item) {
    state.modalVisible = true;
    state.isEdit = true;
    state.editData = item;
  },
  HIDEMODAL(state) {
    state.modalVisible = false;
    state.isEdit = false;
    state.editData = {};
  },
  REFLESH(state) {
    state.isReflesh = !state.isReflesh;
  },
  TOFULLSCREEN(state) {
    state.isDrawVisible = true;
  },
  EXITFULLSCREEN(state) {
    state.isDrawVisible = false;
  },
  SETDETAILID(state, id) {
    state.detailId = id;
  }
};
