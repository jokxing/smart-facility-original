import {get,post} from "@/utils/axios";

export function getMapRunpengData(params) {
    return get("/map/runpengData", params);
}
