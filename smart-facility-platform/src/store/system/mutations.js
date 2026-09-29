const OPENMODAL = "OPENMODAL"; //开启员工弹窗
const HIDEMODAL = "HIDEMODAL"; //关闭员工弹窗

const EDITMODAL = "EDITMODAL"; //修改员工弹窗
const REFLESH = "REFLESH"; //刷新标识

const SETLETEDEPT = "SETLETEDEPT"; //设置当前选中的部门

const OPENDEPTMODAL = "OPENDEPTMODAL"; //开启部门弹窗
const HIDEDEPTMODAL = "HIDEDEPTMODAL"; //关闭部门弹窗
const DEPTREFLESH = "DEPTREFLESH"; //刷新部门列表

const USERREFLESH = "USERREFLESH"; //刷新员工列表

const SETSELETEDROWS = "SETSELETEDROWS";

export default {
  OPENMODAL(state, payload) {
    state.modalVisible = true;
    state.modalTitle = payload.title;
    state.modalType = payload.type;
  },
  HIDEMODAL(state) {
    state.modalVisible = false;
    state.isEdit = false;
    state.modalType = "USER";
    state.editData = {};
  },
  EDITMODAL(state, payload) {
    state.modalVisible = true;
    state.modalTitle = payload.title;
    state.isEdit = true;
    state.modalType = payload.type;
    state.editData = payload.editData;
  },
  SETLETEDEPT(state, payload) {
    state.deptId = payload.deptId;
    state.pid = payload.pid;
    state.currentDept = payload.currentDept;
  },

  OPENDEPTMODAL(state, payload) {
    state.modalDeptVisible = true;
    state.modalDeptType = payload.type;
    state.modalDeptEditData = payload.editData;
  },

  HIDEDEPTMODAL(state) {
    state.modalDeptVisible = false;
    state.modalDeptEditData = {};
    state.modalDeptType = 1;
  },

  DEPTREFLESH(state) {
    state.deptRefresh = !state.deptRefresh;
  },
  USERREFLESH(state) {
    state.userRefresh = !state.userRefresh;
  },
  SETSELETEDROWS(state, preload) {
    state.selectedRows = preload.selectedRows;
  }
};
