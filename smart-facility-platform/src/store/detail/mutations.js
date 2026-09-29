/** 实验室设备 **/
const ADDMODAL = "ADDMODAL"; //新增弹窗
const HIDEMODAL = "HIDEMODAL"; //关闭弹窗
const EDITMODAL = "EDITMODAL"; //关闭弹窗
const TABMODULEREFLESH = "TABMODULEREFLESH"; //刷新tabModule
const REFLESH = "REFLESH"; //刷新标识
const TOFULLSCREEN = "TOFULLSCREEN"; //打开全屏
const EXITFULLSCREEN = "EXITFULLSCREEN"; //退出全屏
const SETDETAILID = "SETDETAILID"; //获取详情id

const SETBINDDATA = "SETBINDDATA"; //绑定的智能硬件
const ISREFLESHBIND = "ISREFLESHBIND"; //智能硬件刷新标识

const OPENBINDMODAL = "OPENBINDMODAL";
const HIDEBINDMODAL = "HIDEBINDMODAL";
const SETDETAILDATA = "SETDETAILDATA"; //保存当前详情

/** 预约管理 **/
export default {
  ADDMODAL(state, preload) {
    state.modalVisible = true;
    state.isEdit = false;
    state.modalType = preload.type;
    state.modalTitle = preload.title;
    state.makeAnAppointment = preload.time;
    state.userName = preload.userName;
  },
  HIDEMODAL(state) {
    state.isEdit = false;
    state.modalType = 1;
    state.modalVisible = false;
  },
  HIDDENMODAL(state) {
    state.modalVisible = false;
  },
  EDITMODAL(state, preload) {
    state.modalVisible = true;
    state.isEdit = true;
    state.modalType = preload.type;
    state.editData = preload.editData;
    state.modalTitle = preload.title;
  },
  SETDETAILDATA(state, preload) {
    state.detailData = preload.detailData;
  },
  TABMODULEREFLESH(state) {
    state.tabModuleReFlesh = !state.tabModuleReFlesh;
  },
  SETBINDDATA(state, preload) {
    state.bindData = preload.bindData;
  },
  ISREFLESHBIND(state) {
    state.bindDataReflesh = !state.bindDataReflesh;
  },

  REFLESH(state) {
    state.isReflesh = !state.isReflesh;
  },
  OPENBINDMODAL(state) {
    state.bindVisible = true;
  },

  HIDEBINDMODAL(state) {
    state.bindVisible = false;
  }
};
