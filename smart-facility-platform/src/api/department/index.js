import { get, post, put } from "@/utils/axios.js";
// 获取部门列表
export function getDepartment(params) {
  return get("/department/list", params);
}

export function addDepartment(data) {
  return post("/department/add", data, {
    headers: {
      "content-type": "application/json"
    }
  });
}
export const departmentUpDate = data => {
  return post("/department/update", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};

export const departmentRemove = (data, id) => {
  return post(`/department/remove/${id}`, data, {
    headers: {
      "content-type": "application/json"
    }
  });
};
export function putDepartmentMove(params) {
  let { departmentIdOne, departmentIdTwo } = params;
  return put(
    `/department/move?departmentIdOne=${departmentIdOne}&departmentIdTwo=${departmentIdTwo}`
  );
}
