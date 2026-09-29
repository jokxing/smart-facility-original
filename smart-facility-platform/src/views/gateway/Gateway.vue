<template>
    <div class="session">
        <div>
            <div class="search-bar-container">
                <template>
                    <el-input
                        v-model.trim="items.keyword"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('common.inputKeyword')"
                        @keyup.enter.native="handleQuery">
                        <el-button
                            slot="append"
                            class="el-button-host"
                            icon="icon-search1"
                            @click="handleQuery">
                        </el-button>
                    </el-input>
                </template>
                <template>
                    <el-button v-if="$store.state.level" class="icon-addto" type="primary" @click="handleAdd">
                        {{ $t("hardware.addGateway") }}
                    </el-button>
                </template>
            </div>
            <div class="sticky-head">
                <el-table v-loading="refreshLoading"
                          :data="gateway"
                          :default-sort="{order: 'descending'}"
                          :element-loading-text="refreshLoadingText"
                          stripe
                          border
                          ref="table"
                          @sort-change="sortChange">
                    <el-table-column fixed label="#" type="index" width="70px">
                        <template v-slot="scope">
                            <span v-if="`${total !== 0}`">{{
                                    (items.pageNum - 1) * items.pageSize + scope.$index + 1
                                }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column fixed :label="$t('common.name')" min-width="160" prop="name" sortable>
                        <template v-slot="scope">
                            <a @click="handleShowDrawer(scope.row.strId)">{{ scope.row.name }}</a>
                        </template>
                    </el-table-column>
                    <el-table-column fixed :label="$t('hardware.devciceNo')" min-width="140" prop="macId" sortable>
                        <template v-slot="scope">
                            <a @click="handleShowDrawer(scope.row.strId)">{{ scope.row.macId }}</a>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('hardware.thingsCardId')" min-width="170" prop="thingsCardId"/>
                    <el-table-column label="PanId" min-width="90" prop="panId">
                    </el-table-column>
                    <el-table-column
                        :label="$t('common.owningDepartment')"
                        min-width="140"
                        prop="departmentName"
                        sortable
                    ></el-table-column>
                    <el-table-column
                        :label="$t('hardware.status')"
                        min-width="70"
                        prop="departmentName">
                        <template v-slot="scope">
            <span :class="scope.row.status == 1 ? 'normal' : 'abnormal'">{{
                    scope.row.status === 1 ? $t('common.normal') : $t('common.offLine')
                }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.creatDate')" min-width="130" prop="createDate" sortable>
                        <template v-slot="scope">
                            {{ scope.row.creatDate | localToUtc }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('hardware.signalStrength')" min-width="150" prop="signalStrength">
                        <template v-slot="scope">
                            <signal :data="scope.row"/>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('hardware.connectLabel')" min-width="160" prop="connectNum ">
                        <template v-slot="scope">
                            <div>{{ $t('hardware.connectNum') }}<span class="normal">{{ scope.row.connectNum }} <span
                                v-if="scope.row.connectNum === 31">(Max)</span></span></div>
                            <div>{{ $t('hardware.surplusConnectNum') }}<span class="withdraw"
                                                                             :class="{abnormal: scope.row.surplusConnectNum === 0}">{{
                                    scope.row.surplusConnectNum
                                }}</span></div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('common.reportDate')"
                        min-width="160"
                        prop="reportDate"
                        sortable
                    >
                        <template v-slot="scope">
                            {{ scope.row.reportDate | localToUtc }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('common.remark')"
                        prop="remark"
                        width="200"/>
                    <el-table-column class="abnormal" fixed="right" :label="$t('common.handle')" min-width="100">
                        <template v-slot="scope">
                            <el-button v-if="$store.state.level" type="text"
                                       @click="handleEdit(scope.$index, scope.row)">{{ $t("common.edit") }}
                            </el-button>
                            <el-button v-if="$store.state.level" class="abnormal" type="text"
                                       @click="handleDelete(scope.$index, scope.row)">{{ $t("common.delete") }}
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="paging">
                <pagination
                    v-show="total > 10"
                    :limit.sync="items.pageSize"
                    :page.sync="items.pageNum"
                    :total="total"
                    :page-sizes="$store.state.pageSizes"
                    @pagination="getGatewayList"/>
            </div>
        </div>
        <Create
            ref="Create"
            @getGatewayList="getGatewayList"/>
        <div>
            <drawer
                :id="id"
                :isDrawer="isDrawer"
                @handleCloseDrawer="handleCloseDrawer"/>
        </div>
    </div>
</template>

<script>
import StateCard from "@/components/StatCard";
import {deleteGateway, getGateway} from "@/api/gateway";
import Create from "@/views/gateway/components/Create";
import Pagination from "@/components/Pagination/index";
import Drawer from "@/views/gateway/components/GatewayDrawer";
import Signal from "@/components/Signal";
import {HINT_DEFAULT, HINT_DELETE, items} from "@/utils/constant";
import moment from "moment";
import mixin from "@/utils/mixin";

let time = null;
export default {
    name: "Gateway",
    components: {
        Drawer,
        Create,
        StateCard,
        Pagination,
        Signal,
    },
    data() {
        return {
            num: 0,
            normalNum: 0,
            lineNum: 0,
            total: 0,
            items: {
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM
            },
            gateway: [],
            loading: false,
            isDrawer: false,
            id: "",
            columnSort: {
                concentratorName: "", //名称
                macId: "", //编号
                department: "", //部门
                createTime: "" //创建时间
            }
        };
    },
    created() {
        this.getGatewayList();
    },
    watch: {
      gateway() {
      }
    },
    methods: {
        statusType(date) {
            const newTime = moment().format("YYYY-MM-DD HH:mm:ss");
            let m1 = moment(newTime),
                m2 = moment(date);
            return Math.abs(m2.diff(m1, 'minute')) <= 120;
        },
        handleQuery() {
            this.items.pageNum = items.PAGE_NUM;
            this.items.pageSize = items.PAGE_SIZE;
            this.loading = !this.loading;
            let valid = true;
            const that = this;
            if (!valid) {
                valid = true;
                return clearTimeout(time);
            } else {
                valid = false;
                time = setTimeout(() => {
                    that.getGatewayList();
                    clearTimeout(time);
                    valid = true;
                }, 500);
            }
        },
        getGatewayList() {
            this.refreshLoading = true;
            this.items['sortName'] = JSON.stringify(this.columnSort);
            getGateway(this.items).then((res) => {
                this.refreshLoading = false;
                if (res.code) {
                    if (this.items.pageNum === items.PAGE_NUM) {
                        this.total = res.items.total;
                    }
                    this.gateway = res.items.list;
                }
            });
        },
        handleEdit(index, row) {
            this.$refs.Create.open(0, row);
        },
        handleDelete(index, row) {
            this.$confirm(this.$t("hardware.deleteGateway1") + " < " + row.name + " > " + this.$t("hardware.deleteGateway2"), this.$t("hardware.deleteGatewayTitle"), {
                confirmButtonText: this.$t("common.confirm"),
                cancelButtonText: this.$t("common.cancel"),
                type: "warning",
            }).then(() => {
                this.refreshLoading = true;
                this.refreshLoadingText = HINT_DELETE;
                deleteGateway({id: row.id}).then((res) => {
                    this.refreshLoading = false;
                    this.refreshLoadingText = HINT_DEFAULT;
                    if (res.code) {
                        this.$message.success(this.$t("common.deleteSuccess"));
                        this.getGatewayList();
                    } else {
                        this.$message.error(this.$t("common.deleteError") + res.message);
                    }
                });
            }).catch(() => {
                this.$message.info(this.$t("common.deleteCanceled"));
            });
        },
        //新增
        handleAdd() {
            this.$refs.Create.open(1);
        },
        handleCloseDrawer(val) {
            this.isDrawer = val;
        },
        handleShowDrawer(id) {
            this.id = id;
            this.isDrawer = !this.isDrawer;
        },
        sortChange(e) {
            var propName = e.prop;
            var sortOrder = e.order;
            if (sortOrder && sortOrder == 'ascending') {
                sortOrder = 'asc';
            }
            if (sortOrder && sortOrder == 'descending') {
                sortOrder = 'desc';
            }
            Object.keys(this.columnSort).forEach((key) => {
                this.columnSort[key] = '';
            })
            if (e.prop == 'name') {
                propName = 'concentratorName';
            } else if (e.prop == 'createDate') {
                propName = 'createTime';
            } else if (e.prop == 'departmentName') {
                propName = 'department';
            } else if (e.prop == 'macId') {
                propName = 'macId';
            } else {
                propName = '';
            }
            if (propName && sortOrder) {
                this.columnSort[propName] = sortOrder;
            }
            this.getGatewayList();
        }
    },
    beforeDestroy() {
        clearTimeout(time);
    }
};
</script>

<style lang="less" scoped>
@import "../../style/gateway";
@import "../../style/table_sticky";
</style>
