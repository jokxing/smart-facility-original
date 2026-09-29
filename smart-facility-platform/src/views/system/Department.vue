<template>
    <div class="department">
        <div class="page-content page-content-left">
            <div class="system-page-left session">
                <h4>{{ $t('system.organizationChart') }}</h4>
                <p :title="companyName" class="icon-building1 cursor" @click="handleWholeDept"> {{ companyName }}</p>
                <div class="scrollbar">
                    <Tree :departmentId.sync="departmentId" :treeData="departmentList"/>
                </div>
                <el-row justify="end" type="flex">
                    <el-button
                        icon="el-icon-plus"
                        type="primary"
                        @click="handleAddDept"
                    >{{ $t('system.addDepartment') }}
                    </el-button>
                </el-row>
            </div>
            <div class="system-page-right session">
                <div class="search-bar-container">
                    <div class="screen-group">
                        <el-input
                            v-model="keywordInput"
                            :clearable="true"
                            class="input-with-select"
                            :placeholder="$t('system.searchUser')"
                            prefix-icon="icon-search1"
                            @keyup.enter.native="handleSearch">
                            <el-button
                                slot="append"
                                class="el-button-host"
                                icon="icon-search1"
                                @click="handleSearch"
                            ></el-button>
                        </el-input>
                    </div>
                    <div class="btn-group">
                        <el-button
                            class="icon-addto"
                            type="primary"
                            @click="handleShowModal($t('system.addUser'), 'USER')"
                        > {{ $t('system.addUser') }}
                        </el-button>
                        <el-button class="icon-upload" @click="importFileVisible = true"
                        > {{ $t('common.importHandle') }}
                        </el-button>
                        <el-button class="icon-download1" @click="handleExport"
                        > {{ $t('common.export') }}
                        </el-button>
                        <el-button
                            v-if="selectedRows.length > 0"
                            class="btn-default"
                            @click="handleShowModal($t('common.updateDepartment'), 'CDEPT')"
                        >{{ $t('common.updateDepartment') }}
                        </el-button>
                        <el-button
                            v-if="isLeaveJob"
                            class="btn-default"
                            @click="handleLeaveJob"
                        >{{ $t('common.batchDelete') }}
                        </el-button>
                    </div>
                </div>
                <SelfTable
                    :columns="columns"
                    :defaultSort="defaultSort"
                    :loading="tableLoading"
                    :pageNum="pageNum"
                    :pageSize="pageSize"
                    :tableRefresh="userRefresh"
                    :tabledata="dataSource"
                    :total="total"
                    isSelected
                    @handleRowsSelect="handleRowsSelect"
                    @pageNumChange="handlePageNumChange"
                    @pageSizeChange="handlePageSizeChange"
                >
                    <el-table-column slot="roles" :label="$t('system.role')">
                        <template v-slot="scope">
                            <el-button type="text" @click="handleSeedDetail(scope.row)"
                            >{{ arrayToString(scope.row.roles, "name") }}
                            </el-button>
                        </template>
                    </el-table-column>
                    <el-table-column
                        slot="isBoundWeixin"
                        :label="$t('system.weixinBind')"
                        width="120">
                        <template v-slot="{row}">
                          <span :class="row['isBoundWeixin'] ? 'normal' : 'abnormal'">
                              {{ row['isBoundWeixin'] ? $t('system.bind') : $t('system.unBind') }}
                          </span>
                        </template>
                    </el-table-column>
                    <el-table-column slot="createDate" :label="$t('common.creatDate')">
                        <template v-slot="{row}">
                            {{ row.createDate | localToUtc }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        slot="operate"
                        fixed="right"
                        :label="$t('common.handle')"
                        width="160">
                        <template v-slot="scope">
                            <el-button
                                :disabled="scope.row.editFlag === 0"
                                type="text"
                                @click="handleEdit(scope.row)"
                            >{{ $t('common.edit') }}
                            </el-button>
                            <el-button
                                v-if="roleId === 2"
                                type="text"
                                @click="$refs.permissionAssignment.open(scope.row)">
                                {{ $t('system.roleAllot') }}
                            </el-button>
                            <el-button
                                slot="reference"
                                :disabled="scope.row.editFlag === 0"
                                :style="{ marginLeft: '10px' }"
                                :class="scope.row.editFlag === 0 ? '': 'abnormal'"
                                type="text"
                                @click="handleIsLeaveJob(scope.row)"
                            >{{ $t('common.delete') }}
                            </el-button>
                        </template>
                    </el-table-column>
                </SelfTable>
                <Modal
                    v-if="modalVisible"
                    :department-id="departmentId"
                    :departmentList="departmentList"
                    :isDependByBody="true"
                    @handle="handleGetUserList(userListParams)"/>
                <ModalDept v-if="modalDeptVisible"></ModalDept>
                <ImportFile
                    v-if="importFileVisible"
                    :title="importTitle"
                    @handleUpdateInit="handleUpdateInit"
                    @hiddenModalVisible="hiddenModalVisible"></ImportFile>
            </div>

            <PermissionAssignment ref="permissionAssignment" :departmentList="departmentList"
                                  :companyName="companyName"/>
        </div>
    </div>
</template>
<script>
import SubMenu from "@/views/system/components/SubMenu.vue";
import Tree from "@/views/system/components/Tree";
import SelfTable from "@/components/Table";
import Modal from "./Modal.vue";
import ModalDept from "./ModalDept.vue";
import ImportFile from "@/components/ImportFile"
import PermissionAssignment from "./components/PermissionAssignment";
import {mapState, mapMutations} from "vuex";
import {getDepartment} from "@/api/department";
import {getUserList, postLeaveJob, postUserExport} from "@/api/user";
import {ERROR, items} from "@/utils/constant";
import mixin from "@/utils/mixin";
import moment from "moment";
import i18n from "@/i18n";

const TABLECOLUMN = [
    {
        title: i18n.t('system.loginId'),
        dataIndex: "loginId",
        width: "130"
    },
    {
        title: i18n.t('system.name'),
        dataIndex: "name",
        width: "130"
    },
    {
        title: i18n.t('system.tel'),
        dataIndex: "tel",
        width: "120"
    },
    {
        title: i18n.t('system.email'),
        dataIndex: "email",
        width: "120"
    },

    /**自定义的列*/
    {
        title: i18n.t('system.weixinBind'),
        dataIndex: "isBoundWeixin",
        width: "120",
        slot: "isBoundWeixin"
    },

    {
        title: i18n.t('common.department'),
        dataIndex: "departmentName",
        width: "100"
    },

    {
        title: i18n.t('system.role'),
        dataIndex: "roleName",
        width: "90"
    },
    {
        title: i18n.t('common.companyName'),
        dataIndex: "companyName",
        width: "200"
    },
    {
        title: i18n.t('common.creatDate'),
        dataIndex: "createDate",
        width: "160",
        sortable: true,
        slot: "createDate"
    },

    /**自定义的列*/
    {
        title: i18n.t('common.handle'),
        dataIndex: "operate",
        slot: "operate",
    },

];
const MOREHANDLE = [
    {
        name: i18n.t('system.fixRole'),
        fn: "handleRolesChange",
    },
    {
        name: i18n.t('system.fixDepartment'),
        fn: "handleDeptChange",
    },
    {
        name: i18n.t('system.leaveJob'),
        fn: "handleIsLeaveJob",
    },
];

export default {
    components: {
        SubMenu,
        SelfTable,
        Modal,
        Tree,
        ModalDept,
        ImportFile,
        PermissionAssignment
    },
    data() {
        return {
            // 导入弹窗
            importFileVisible: false,
            importTitle: "user",
            roleId: null,

            total: 0,
            dataSource: [],
            tableLoading: false,
            columns: TABLECOLUMN,
            moreHandle: MOREHANDLE,
            userName: "",
            departmentList: [],
            keywordInput: "",
            keyword: "",
            pageSize: items.PAGE_SIZE,
            pageNum: items.PAGE_NUM,
            sizes: items.PAGE_SIZES,
            companyName: "",
            isChangeDept: false,
            isLeaveJob: false,
            currentUserId: null,
            departmentId: null,
            // 表头排序
            defaultSort: {
                order: 'descending'
            },
        };
    },
    created() {
        let useInfo = JSON.parse(localStorage.getItem("USERINFO"));
        let {companyName, id, roleId} = useInfo;
        this.companyName = companyName;
        this.currentUserId = id;
        this.roleId = roleId;
    },
    computed: {
        ...mapState("sys", {
            modalVisible: "modalVisible",
            deptId: "deptId",
            currentDept: "currentDept",
            modalDeptVisible: "modalDeptVisible",
            deptRefresh: "deptRefresh",
            userRefresh: "userRefresh",
            selectedRows: "selectedRows",
        }),
        userListParams() {
            let {deptId, pageSize, pageNum, keyword} = this;
            return {
                departmentId: deptId,
                pageSize,
                pageNum,
                keyword,
            };
        },
    },
    watch: {
        deptId: {
            handler() {
                this.pageSize = items.PAGE_SIZE;
                this.pageNum = items.PAGE_NUM;
                this.keyword = "";
                this.keywordInput = "";
            },
            immediate: true,
        },
        userListParams: {
            handler(newVal) {
                let {keyword, departmentId, pageSize, pageNum} = newVal;
                let obj = {departmentId, pageSize, pageNum};
                if (keyword) {
                    obj = {...obj, keyword};
                }
                this.handleGetUserList(obj);
            },
            immediate: true,
        },

        deptRefresh: {
            handler() {
                this.getDepartmentData();
            },
            immediate: true,
        },
        selectedRows: {
            handler(newVal) {
                // let flag = false;
                let listAble = newVal.filter((l) => l.editFlag === 1);
                if (listAble.length > 0) {
                    this.isLeaveJob = true;
                    let id = listAble[0].departmentId;
                    let temp = listAble.filter((s) => s.departmentId === id);
                    // if (temp.length === listAble.length) {
                    //   flag = true;
                    // }
                } else {
                    this.isLeaveJob = false;
                }
                // this.isChangeDept = flag;
            },
            deep: true,
        },
    },

    methods: {
        ...mapMutations("sys", {
            handleUserAddMu: "OPENMODAL",
            handleDeptSelect: "SETLETEDEPT",
            handleOpenDeptModal: "OPENDEPTMODAL",
            handleEditDeptModal: "EDITMODAL",
            handleSetSelectedRows: "SETSELETEDROWS",
            handleUserReflesh: "USERREFLESH",
        }),

        handleRolesChange(_, data) {
            _.handleEditDeptModal({
                title: _.$t('system.fixRole'),
                type: "CROLE",
                editData: data,
            });
        },

        handleDeptChange(_, data) {
            _.handleEditDeptModal({
                title: _.$t('system.fixDepartment'),
                type: "CDEPT",
                editData: data,
            });
        },
        handleIsLeaveJob(rows) {
            const _this = this;
            this.$confirm(
                this.$t('system.deleteUser'),
                this.$t('system.deleteUserHint'),
                {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                }
            )
                .then(() => {
                    _this.leaveJobAsync([rows.id]);
                })
                .catch((err) => {
                    throw err;
                });
        },

        operateClick(fn, params) {
            this.$options.methods[fn](this, params);
        },

        handleEdit(data) {
            this.handleEditDeptModal({
                title: this.$t('system.editUser'),
                type: "USER",
                editData: data,
            });
        },

        handleAddDept() {
            this.handleOpenDeptModal({title: this.$t('system.addDepartment'), type: 1, editData: {}});
        },

        handleWholeDept() {
            this.handleDeptSelect({
                deptId: 0,
                currentDept: {
                    name: this.companyName,
                },
                pid: 0,
            });
        },
        handleRowsSelect(rows) {
            this.handleSetSelectedRows({selectedRows: rows});
        },

        handlePageNumChange(num) {
            this.pageNum = num;
        },

        handlePageSizeChange(size) {
            this.pageSize = size;
        },

        handleSearch() {
            this.pageNum = 1;
            this.keyword = this.keywordInput;
        },

        async getDepartmentData() {
            try {
                let temp = [];
                let result = await getDepartment();
                if (result.code == 1) {
                    let items = result.items;
                    if (items.list && items.list.length > 0) {
                        let lists = items.list;
                        temp = lists.sort(
                            (a, b) => b.defaultDepartment - a.defaultDepartment
                        );

                        let useInfo = JSON.parse(localStorage.getItem("USERINFO"));
                        let {companyName} = useInfo;
                        this.handleDeptSelect({
                            deptId: 0,
                            currentDept: {
                                name: companyName,
                            },
                            pid: 0,
                        });
                    }
                } else {
                    this.$message.error(result.message);
                }
                this.departmentList = temp;
            } catch (err) {
                this.departmentList = [];
                throw err;
            }
        },
        handleGetUserList(params) {
            this.dataSource = [];
            let temp = [];
            let total = 0;
            this.tableLoading = true;
            getUserList(params)
                .then((res) => {
                    // console.log(res)
                    if (res.code === 1) {
                        temp = res.items.list;
                        total = res.items.total;
                    } else {
                        this.$message.error(res.message);
                    }
                    temp.map((item, index) => {
                        this.$set(this.dataSource, index, item);
                    });
                    this.total = total;
                    this.tableLoading = false;
                })
                .catch((err) => {
                    this.tableLoading = false;
                    this.$message.error(ERROR);
                });
        },
        async leaveJobAsync(ids) {
            try {
                let result = await postLeaveJob({
                    ids,
                });
                if (result.code === 1) {
                    this.$message.success(this.$t('system.leaveJobSuccess'));
                    this.handleSetSelectedRows({selectedRows: []});
                    this.handleUserReflesh();
                    this.handleGetUserList(this.userListParams);
                } else {
                    this.$message.error(result.message);
                }
            } catch (err) {
                this.$message.error(ERROR);
            }
        },

        // 关闭导入弹窗
        hiddenModalVisible() {
            this.importFileVisible = false
        },
        // 上传成功后更新初始化
        handleUpdateInit() {
            this.importFileVisible = false;
            this.handleUserReflesh()
        },
        // 导出
        handleExport() {
            const data = {
                departmentId: this.deptId,
                keyword: this.keyword,
                pageNum: this.pageNum,
                pageSize: this.pageSize,
                userList: []
            };
            data.userList = this.selectedRows.map((s) => {
                return s.id
            })
            postUserExport(data).then(res => {
                new Promise(resolve => {
                    this.$message.warning(this.$t('common.exportMessage'));
                    setTimeout(() => {
                        resolve();
                    }, 2500)
                }).then(() => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('system.userExport') + data, "UTF-8")
                    )
                })
            }).catch(err => {
                this.$message.error(err.message)
            })
        },

        handleShowModal(title, type) {
            this.handleUserAddMu({
                type,
                title,
            });
        },
        handleLeaveJob() {
            this.$confirm(
                <div>
                    {this.$t('system.deleteUser')}
                    <br/>
                    {this.$t('system.deleteUser1')}
                </div>,
                this.$t('system.deleteUserHint'),
                {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                }
            )
                .then(() => {
                    let rows = this.selectedRows;
                    let ids = [];
                    for (let i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    this.leaveJobAsync(ids);
                })
                .catch((err) => {
                    throw err;
                });
        },

        arrayToString(arr, str) {
            let s = "";
            let temp = [];
            if (arr.length) {
                for (let i = 0; i < arr.length; i++) {
                    if (i == str) {
                        temp.push(arr[i]);
                    }
                }
                s = temp.join(",");
            } else {
                s = "-";
            }
            return s;
        },
    },
};
</script>
<style lang="less">
@import "./index.less";
</style>
<style lang="less" scoped>
@import "../../style/default.less";
@import "./popover.less";

/deep/ .el-scrollbar__bar.is-horizontal {
    height: 0;
}

.icon-building1 {
    font-size: 18px;
}

.systemPage {
    .page-content {
        .systemPage_left {
            padding-top: 60px;
        }

        .systemPage_right {
            .handleAndScreen {
                height: 40px;
                margin-top: 10px;
                margin-bottom: 20px;

                .btn-group {
                    float: right;
                }

                .screen-group {
                    float: left;

                    /deep/ .el-input__inner {
                        height: 40px;
                        line-height: 40px;
                    }
                }
            }
        }
    }
}
</style>
