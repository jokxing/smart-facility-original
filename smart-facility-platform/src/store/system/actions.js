import {getUserList} from "@/api/user";
import {Message} from "element-ui";

export default {
    /**
     * 请求列表员工
     * @param state
     * @param item 员工请求体
     */
    getUsers(state, item) {
        return new Promise((resolve, reject) => {
            getUserList(item).then(res => {
                if (res.code) {
                    resolve(res.items.list);
                } else {
                    Message.error(res.message);
                }
            })
        })
    }
};
