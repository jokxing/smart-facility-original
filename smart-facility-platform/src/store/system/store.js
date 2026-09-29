export default {
  modalVisible: false, //员工弹窗显示和隐藏
  modalTitle: "新增成员", //员工相关弹窗
  modalType: "USER", //员工弹窗类型   USER-成员   DEPT-部门  CDEPT-变更部门  CROLE-变更角色
  isEdit: false, //员工弹窗是否是编辑状态
  editData: {}, //员工列表数据

  modalDeptVisible: false,
  modalDeptType: 1, //部门弹窗是类型   1.新增  2.编辑部门  3.新增子部门
  modalDeptEditData: {}, //当前操作的部门
  deptRefresh: false, //部门刷新标识
  userRefresh: false, //人员刷新标识
  currentDept: {},
  deptId: 0,
  pid: 0,
  selectedRows: []
};
