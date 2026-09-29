import { get, post } from "@/utils/axios.js";
import request from "@/utils/request";
/*----------------获取签名----------------*/
export const getFilePolicy = params => {
  return get(`/file/policy`, params);
};

export function getFilePresignedUrl(params) {
  return request({
    url: "/file/picUrl",
    params,
    responseType: "blob"
  });
}

export const getFileInstrumentPic = params => {
  return get(`/file/instrument/pic`, params);
};

// export const postCompanyUpdate = params => {
//   return post("/company/update", params, {
//     headers: { "content-type": "application/json" }
//   });
// };
 
// 根据title查找系统图片
export const getFileUrlByTitle = params => {
  return get(`/file/instrument/pic/search`, params);
};