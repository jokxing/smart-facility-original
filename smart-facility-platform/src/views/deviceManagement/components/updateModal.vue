<template>
    <el-dialog
        :before-close="handleModalClose"
        :close-on-click-modal="false"
        :title="setData.title"
        :visible="true"
        append-to-body
        :width="45"
        class="update-modal"
        destroy-on-close
    >
        <el-form>
            <el-form-item v-if="setData.value === 1" label="所属房间">
                <el-select v-model="roomId"
                           class="select-change"
                           placeholder="请选择房间">
                    <el-option
                        v-for="item in roomList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item v-if="setData.value === 2" label="所属部门">
                <SelectTree
                    :accordion="false"
                    :clearable="true"
                    :model="departmentId"
                    :options="departmentData"
                    :prop="props"
                    :value="selectTreeValue"
                    class="select-change"
                    placeholder="请选择部门"
                    @getValue="getValue($event)"/>
            </el-form-item>

            <el-form-item v-if="setData.value === 3" label="设备类型">
                <select-asset-classify
                    :is-class="true"
                    :id.sync="types"
                    :select-tree-value.sync="types"/>

            </el-form-item>

            <el-form-item v-if="setData.value === 4" class="box" label="系统图片">
                <div class="upload-box flexBox">
                    <img :src="BASE_URL + iconActive" alt="" class="picBox">
                </div>
                <div class="upload-box flexBox">
                    <span class="input-row-label"></span>
                    <div class="systemIcon-group">
                        <div
                            v-for="(item, index) in pictureList"
                            :key="index"
                            :class="iconActive === item ? 'active' : ''"
                            :style="{
                            background: `url(${BASE_URL + item}) no-repeat`,
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center center',
                        }"
                            class="systemIcon-list"
                            @click="iconActive = item">
                        </div>
                    </div>
                </div>
            </el-form-item>
        </el-form>
        <el-row v-if="setData.value === 4" justify="center" type="flex">
            <pagination
                v-show="items.total > 10"
                :layout="'total, pager, jumper'"
                :limit.sync="items.pageSize"
                :page-count="5"
                :page.sync="items.pageNum"
                :total="items.total"
                @pagination="handleQuery"/>
        </el-row>
        <span slot="footer" class="dialog-footer">
      <el-button @click="handleModalClose">取 消</el-button>
      <el-button
          :loading="submitLoading"
          type="primary"
          @click="setValue">
        确 定</el-button>
    </span>
    </el-dialog>
</template>

<script>
import {getRoomList} from "@/api/room";
import {getDepartment} from "@/api/department";
import {getFileInstrumentPic} from "@/api/upload";
import {getUserList} from "@/api/user";
import SelectTree from "@/components/SelectTree";
import {INSTRUMENTTYPE, BASE_URL, items} from "@/utils/constant";
import {postInstrumentBatchUpdate} from "@/api/labDevice";
import {mapMutations} from "vuex";
import Pagination from "@c/Pagination/index";
import SelectAssetClassify from "@c/SelectAssetClassify";

export default {
    props: {
        setData: {
            type: Object,
            default: {}
        },
        multipleSelection: {
            type: Array,
            default: ""
        }
    },
    components: {
        SelectAssetClassify,
        SelectTree,
        Pagination,
    },
    data() {
        return {
            submitLoading: false,
            // 房间列表
            roomList: [],
            roomId: "",
            // 部门列表
            departmentList: [],
            selectTreeValue: "0",
            departmentId: "",
            props: {
                // 配置项（必选）
                value: "id",
                label: "name",
                children: "subDivisions",
            },
            // 设备类型
            types: "",
            INSTRUMENTTYPE,
            // 系统图片
            BASE_URL,
            iconActive: "",
            pictureList: [],
            // 负责人
            userList: [],
            userIds: "",
            // 报警方式
            alarmTypeList: [
                {
                    label: "手机报警",
                    value: "phone",
                },
                {
                    label: "短信报警",
                    value: "sms",
                },
                {
                    label: "微信报警",
                    value: "weixin",
                },
            ],
            alarmType: [],
            alarmTypeData: {
                userIds: [],
                weixin: -1,
                sms: -1,
                phone: -1,
                type: 4,
            },
            // 提交数据
            form: {
                ids: []
            },
            items: {
                total: 0,
                pageSize: 25,
                pageNum: items.PAGE_NUM
            },
            systemList: [],
            classify: []
        }
    },
    computed: {
        departmentData() {
            const traverse = (array, _proto) => {
                array.map((arr) => {
                    if (arr[_proto].length && arr[_proto].length > 0) {
                        traverse(arr[_proto], _proto);
                    }
                    arr.id = arr["id"].toString();
                });
                return array;
            };
            return traverse(this.departmentList, "subDivisions");
        },
    },
    created() {
        this.classify = this.$store.state.assetClassify;
    },
    mounted() {
        if (this.setData.value === 1) {
            this.getRoomData()
        }
        if (this.setData.value === 2 || this.setData.value === 5) {
            this.getDepartmentData()
        }
        if (this.setData.value === 4) {
            this.getPictureData()
        }
        if (this.setData.value === 5) {
            this.handleGetUserList()
        }
    },
    methods: {
        handleQuery() {
            const sliceStart = this.items.pageSize * (this.items.pageNum - 1);
            const sliceEnd = this.items.pageSize * this.items.pageNum;
            this.pictureList = this.systemList.slice(sliceStart, sliceEnd);
        },
        ...mapMutations("lab", {
            handleReflesh: "REFLESH",
        }),
        // 关闭弹窗
        handleModalClose() {
            this.$emit('hiddenModalVisible');
            this.iconActive = ""
        },
        // 请求房间列表
        getRoomData() {
            var _this = this;
            getRoomList({pageSize: 10000, pageNum: 1}).then(res => {
                if (res.code) {
                    _this.roomList = res.items.list
                }
            }).catch(err => {

            })
        },
        // 请求部门列表
        getDepartmentData() {
            var _this = this;
            getDepartment().then(res => {
                if (res.code) {
                    _this.departmentList = res.items.list
                }
            }).catch(err => {

            })
        },
        // 选中部门列表
        getValue(value) {
            this.selectTreeValue = value;
            this.departmentId = value
        },
        // 请求系统图片
        getPictureData() {
            var _this = this;
            var data = {
                type: 0
            };
            getFileInstrumentPic(data).then(res => {
                if (res.code) {
                    _this.iconActive = res.items[0];
                    this.systemList = res.items;
                    this.items.total = this.systemList.length;
                    _this.pictureList = res.items.slice(0, 25);
                }
            }).catch(err => {

            })
        },
        // 负责人列表
        handleGetUserList() {
            this.userList = [];
            getUserList({
                pageNum: 1,
                pageSize: 1000
            }).then(res => {
                this.userList = res.items.list;
            })
        },
        // 报警方式赋值
        getAlarmType(value, event) {
            this.alarmTypeData[value] = event ? 0 : -1
        },
        // 传值
        setValue() {
            for (var i = 0; i < this.multipleSelection.length; i++) {
                this.form.ids.push(this.multipleSelection[i].id)
            }
            if (this.setData.value === 5) {
                if (this.alarmTypeData.userIds != "") {
                    this.form['conscientiousUser'] = this.alarmTypeData;
                    this.handleFormSubmit()
                } else {
                    this.$message.error("请选择负责人")
                }
            } else {
                if (this.roomId != "") {
                    this.form['roomId'] = this.roomId
                }
                if (this.departmentId != "") {
                    this.form['departmentId'] = this.departmentId
                }
                if (this.types != "") {
                    const _this = this;
                    function typesFn(arr) {
                        arr.map(item => {
                            if (item.id === _this.types * 1) {
                                _this.form.types = item.types;
                            } else {
                                return typesFn(item.childrenList)
                            }
                        })
                    }
                    typesFn(this.classify)
                }
                if (this.iconActive != "") {
                    this.form["logoUrl"] = this.iconActive
                }
                this.handleFormSubmit()
            }
        },
        // 提交
        handleFormSubmit() {
            this.submitLoading = true;
            postInstrumentBatchUpdate(this.form).then(res => {
                this.submitLoading = false;
                if (res.code === 1) {
                    this.$message.success("修改成功！");
                    this.handleModalClose();
                    this.handleReflesh();
                    this.$emit('handle')
                } else {
                    this.$message.error(res.message)
                }
            }).catch(err => {
                this.$message.error(err.message);
            })
        },
    },
}
</script>

<style lang="less" scoped>

.input-row-label {
    display: inline-block;
    width: 85px;
    text-align: right;
    color: #606266 !important;
    padding: 0 12px 0 0;
}

.uploadType {
    margin-bottom: 5px;
}

.upload-box {
    margin-bottom: 10px;
    margin-left: 15px;

    .picBox {
        width: 100px;
        height: 100px;
        border: 1px solid #e5e5e5;
        border-radius: 3px;
    }
}

@import "../index.less";
.update-modal {
    .modal-default-body {
        max-height: 440px;
        overflow: auto;

        &::-webkit-scrollbar {
            width: 0;
        }

        .box {
            display: flex;
            justify-content: flex-start;
            flex-wrap: wrap;
            margin-bottom: 10px;

            span {
                width: 70px;
                line-height: 40px;
            }

            .picBox {
                width: 100px;
                height: 100px;
                border: 1px solid #e5e5e5;
                border-radius: 3px;
            }

            .input-row-label {
                width: 70px;
            }

            .systemIcon-group {
                margin-top: 20px;
            }

            /deep/ .el-checkbox-group {
                line-height: 40px;
            }

            /deep/ .el-input--small .el-input__inner {
                height: 40px;
            }
        }
    }

    .dialog-footer {
        /deep/ .el-button {
            height: 40px;
            line-height: 40px;
            padding: 0 20px;
        }
    }
}

.systemIcon-group {
    flex: 1;
    display: flex;
    flex-wrap: wrap;

    .systemIcon-list {
        width: 60px;
        height: 60px;
        line-height: 60px;
        text-align: center;
        border: 1px solid #e5e5e5;
        margin: 0 10px 10px 0;
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        background-size: 100% 100% !important;
        background-position: center center !important;

        &:hover {
            border-color: #409eff;
        }

        &.active {
            border-color: #409eff;

            &::before {
                content: "";
                position: absolute;
                right: 0;
                bottom: 0;
                border: 12px solid #409eff;
                border-top-color: transparent;
                border-left-color: transparent;
            }

            &::after {
                content: "";
                width: 3px;
                height: 8px;
                position: absolute;
                right: 4px;
                bottom: 4px;
                border: 2px solid #fff;
                border-top-color: transparent;
                border-left-color: transparent;
                transform: rotate(45deg);
            }
        }

        .iconfont {
            font-size: 32px;
        }
    }
}
</style>
