/********************get和post请求*************************/
/******当post请求config有值,请求方式为application/json******/
import $http from "./request";
import qs from "qs";
export const post = (url, data, config) => {
  if (config) {
    return $http.post(url, data, config);
  } else {
    return $http.post(url, qs.stringify(data, { indices: false }), config);
  }
};

export const put = (url, data) => {
  return $http.put(url, data);
};

export const get = (url, params, config = {}) => {
  return $http.get(url, {
    params: params,
    ...config,
    paramsSerializer: params => {
      return qs.stringify(params, { indices: false });
    }
  });
};

export const deleteFn = (url, params, config = {}) => {
  return $http.delete(url, {
    params: params,
    ...config,
    paramsSerializer: params => {
      return qs.stringify(params, { indices: false });
    }
  });
};
