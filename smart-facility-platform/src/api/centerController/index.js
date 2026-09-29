import { get, post, put } from "@/utils/axios.js";
export const mapElementConfig = data => {
  return post("/map/element/config", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};

export const mapFloorOverview = data => {
  return get("/map/floor/overview", data, {
    timeout: 60000
  });
};
export const mapElementGetRoonInstrumentInfoList = data => {
  return post(`/map/element/getRoonInstrumentInfoList?roomId=${data}`, {
    headers: {
      "content-type": "application/json"
    }
  });
};
