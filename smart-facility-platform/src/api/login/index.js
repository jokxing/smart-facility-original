import request from "@/utils/request.js"
import { get, post } from "@/utils/axios.js";

//获取验证码
export function getCaptchaCode(params) {
  return get("/captchaCode", params);
}

//微信二维码
// export function getWeixin(params) {
//   return get("/wx/getQRCode", params, {responseType: "blob"});
// }

export function getWeixin(params) {
  return request({
    url: "/wx/getQRCode",
    params,
    responseType: "blob"
  })
}

//登录
export function login(data) {
  return post("/login", data);
}

//获取登录用户信息
export function getUserInfo(params) {
  return get("/user/info", params);
}

//退出登录
export function logout() {
  return post("/logout");
}
//多语言
export function getLang(params) {
  return get("/user/language", params);
}
