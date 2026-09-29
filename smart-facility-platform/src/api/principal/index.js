import { get, post } from "@/utils/axios";
// 负责人列表
export const getThingsUserList = data => {
  return get("/thingsUser/list", data);
};

// 移除负责人
export const postThingsUserRemove = data => {
  return post("/thingsUser/remove", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};

//添加负责人
export const postThingsUserAdd = data => {
  return post("/thingsUser/add/conscientious", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};

//添加负责人
export const postThingsUserAlarmSet = data => {
  return post("/thingsUser/alarm/set", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};
