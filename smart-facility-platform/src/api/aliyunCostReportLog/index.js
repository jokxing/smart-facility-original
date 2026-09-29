import { get, post, put } from "@/utils/axios.js";
// 扣费记录列表
export function fuzzyQueryaliyunCostReportLog(data) {
    return post("/aliyunCostReportLog/fuzzyQueryPage", data,{
        headers: {
            "content-type": "application/json"
        }
    });
}