<template>
    <div>
        <div class="session">
            <div class="search-bar-container">
                <div>
                    <el-date-picker
                        type="datetimerange"
                        clearable
                        class="input-with-select margin-small-right"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        format="yyyy-MM-dd HH:mm:ss"
                        :start-placeholder="$t('common.startDate')"
                        :end-placeholder="$t('common.endDate')"
                        @change="handleQueryTimeChange"
                        v-model="queryTimeRange"/>
                    <el-input
                        v-model.trim="query.key"
                        class="input-with-select"
                        clearable
                        :placeholder=" $t('common.no') + '/'+$t('transport.unitName')+'/'+ (type ? $t('transport.consignee') : $t('transport.consigner'))"
                        @keyup.enter.native="handleQuery()">
                        <el-button
                            slot="append"
                            icon="icon-search1"
                            class="el-button-host"
                            @click="handleQuery()">
                        </el-button>
                    </el-input>
                </div>
                <div>
                    <el-button
                        @click="handleShowSetup"
                        class="icon-setup">
                        {{ listSelection.length || showSetUp ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
                    </el-button>
                    <el-button v-if="type == 0"
                        @click="handleCreate"
                        class="icon-addto"
                        type="primary">
                        {{ $t('transport.addShipmentsUnit') }}
                    </el-button>
                    <el-button v-else
                               @click="handleCreate"
                               class="icon-addto"
                               type="primary">
                        {{ $t('transport.addReceiversUnit') }}
                    </el-button>
                </div>
            </div>
            <div v-if="showSetUp" class="choose-bar">
                <template>
                    <div class="checked">
                        {{ $t('common.multipleSelection') }}<span>{{ listSelection.length }}</span>{{ $t('common.item') }}
                    </div>
                </template>
                <template v-for="item in setUps">
                    <el-button
                        :disabled="setUpsDisable"
                        v-loading="setUpsDisable"
                        @click="handleSetUp(item.funcName)">
                        {{ item.buttonName }}
                    </el-button>
                </template>
            </div>
            <div class="sticky-head">
                <el-table
                    stripe
                    ref="multipleTable"
                    :data="list"
                    row-key="id"
                    border
                    v-loading="listLoading"
                    :header-cell-class-name="headerCellClassName"
                    @selection-change="selectionChange"
                    @sort-change="sortChange"
                    style="width: 100%">
                    <el-table-column
                        type="selection"
                        v-if="showSetUp"
                        width="40"
                        fixed="left"
                        align="center"/>
                    <el-table-column
                        type="index"
                        label="#"
                        width="70"
                        fixed="left"
                        align="center"/>
                    <el-table-column
                        sortable="custom"
                        prop="receiptDeliverNo"
                        :label="$t('transport.unitNo')"
                        width="100"
                        fixed="left"/>
                    <el-table-column
                        prop="receiptDeliverName"
                        :label="type ? $t('route.receiptUnit') : $t('route.deliverUnit')"
                        min-width="120"/>
                    <el-table-column
                        prop="address"
                        :label="type ? $t('transport.consigneeAddress') : $t('transport.consignerAddress')"
                        min-width="140"/>
                    <el-table-column
                        prop="receiptDeliverUserName"
                        :label="type ? $t('transport.consignee') : $t('transport.consigner')"
                        min-width="100"/>
                    <el-table-column
                        prop="tel"
                        :label="$t('system.phone')"
                        min-width="100"/>
                    <el-table-column
                        prop="comment"
                        :label="$t('common.remark')"
                        min-width="120"/>
                    <el-table-column
                        prop="createUserName"
                        :label="$t('common.createName')"
                        min-width="100"/>
                    <el-table-column
                        sortable="custom"
                        prop="createDate"
                        :label="$t('common.creatDate')"
                        min-width="140">
                        <template v-slot="{row}">
                            {{ row.createDate | localToUtc }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="address"
                        :label="$t('common.handle')"
                        fixed="right">
                        <template v-slot="{row}">
                            <el-button type="text" @click="handleUpdate(row)">{{ $t('common.edit') }}</el-button>
                            <el-button type="text" class="abnormal" @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="paging">
                <Pagination
                    v-show="listTotal>10"
                    :limit.sync="query.pageSize"
                    :page.sync="query.pageNum"
                    :total="listTotal"
                    @pagination="getList"/>
            </div>
        </div>
        <create-deliver-or-receipt
            ref="CreateDeliverOrReceipt"
            @created="init"
            @updated="init"/>
    </div>
</template>

<script>
import Pagination from "@c/Pagination";
import CreateDeliverOrReceipt from "@/views/transport/components/CreateDeliverOrReceipt";
import {
    deleteReceiptDeliverAddress,
    queryReceiptDeliverAddress
} from "@/api/transport";
import mixin from "@/utils/mixin";

export default {
    name: "ListDeliverOrReceipt",
    components: {
        CreateDeliverOrReceipt,
        Pagination
    },
    props: {
        type: {
            type: Number,
            default: 0
        }
    },
    data() {
        const _this = this;
        return {
            // 搜索条件
            query: {
                types: null, // 0:发货,1:收货
                startTime: '',
                endTime: '',
                key: '',
                pageNum: 1,
                pageSize: 10,
                // 排序
                sortName: {
                    createDate: '', // 'desc', 'asc'
                    receiptDeliverNo: '',
                }
            },
            queryTimeRange: null,
            // 表格数据
            list: [],
            listTotal: 0,
            listLoading: false,
            // 批量操作显示
            showSetUp: false,
            // 勾选的表格行
            listSelection: [],
            // 批量操作定义
            setUps: [
                {
                    buttonName: _this.$t('common.batchDelete'),
                    funcName: 'handleBatchDelete'
                }
            ],
            // 操作按钮的状态
            setUpsDisable: false,
        }
    },
    created() {
        this.query.types = this.type;
        this.handleQuery();
    },
    watch: {
        list() {

        }
    },
    mounted() {
        ;
    },
    methods: {
        /** 各种查询条件的处理 */
        // 选择了时间
        handleQueryTimeChange() {
            if (this.queryTimeRange === null) {
                this.query.startTime = null;
                this.query.endTime = null;
            } else {
                this.query.startTime = this.queryTimeRange[0];
                this.query.endTime = this.queryTimeRange[1];
            }
            this.handleQuery();
        },
        // 改变了排序条件
        sortChange(col) {
            let order = '';
            if (col.order === 'ascending') {
                order = 'asc';
            } else if (col.order === 'descending') {
                order = 'desc';
            }
            this.query.sortName[col.prop] = order;
            this.handleQuery();
        },
        headerCellClassName(item) {
            let sortNames = this.query.sortName;
            for (let sortName in sortNames) {
                if (sortName === item.column.property) {
                    if(sortNames[sortName]===''){
                        item.column.order='';
                    }else {
                        item.column.order = sortNames[sortName] + 'ending';
                    }
                }
            }
        },
        /** 获取列表： */
        handleQuery() {
            this.query.pageNum = 1;
            this.getList();
        },
        getList() {
            this.listLoading = true;
            queryReceiptDeliverAddress(this.query).then(res => {
                this.listTotal = res.items.total;
                this.list = res.items.list;
            }).finally(() => {
                this.listLoading = false;
            })
        },
        /** 列表的多选操作 */
        // 显示多选操作
        handleShowSetup() {
            if (this.showSetUp) {
                this.listSelection = [];
                this.$refs.multipleTable.clearSelection();
            }
            this.showSetUp = !this.showSetUp;
        },
        // 选择
        selectionChange(rows) {
            this.listSelection = rows;
        },
        // 点击任一批量操作按钮
        handleSetUp(funcName) {
            this[funcName]();
        },
        /** 各种批量操作：*/
        // 批量删除
        handleBatchDelete() {
            if (this.listSelection.length === 0) {
                this.$message.info(this.$t('transport.changeLog'));
                return;
            }
            this.deleteOrNot(this.listSelection);
        },
        /** 各种单个操作：*/
        // 单个删除
        handleDelete(row) {
            this.deleteOrNot([row], ' ' + row.receiptDeliverName);
        },
        handleUpdate(row) {
            this.$refs.CreateDeliverOrReceipt.open(this.type, 1, row);
        },
        handleCreate() {
            this.$refs.CreateDeliverOrReceipt.open(this.type, 0);
        },
        /** 执行 */
        // 确定框
        deleteOrNot(rows) {
            this.$confirm(
                this.$t('transport.deleteLogMessage'),
                this.$t('common.delete'),
                {
                    type: 'warning',
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel')
                }
            ).then(() => {
                this.deleteDate(rows);
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'));
            })
        },
        // 执行删除
        deleteDate(rows) {
            let ids = [];
            rows.forEach(row => {
                ids.push(row.id);
            });
            this.setUpsDisable = true;
            deleteReceiptDeliverAddress(ids).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('common.deleteSuccess'));
                    let pageNum2 = Math.ceil((this.listTotal - rows.length) / this.query.pageSize);
                    if (pageNum2 < this.query.pageNum) {
                        this.query.pageNum = pageNum2;
                    }
                    this.getList();
                } else {
                    this.$message.error(res.message);
                }
            }).catch(() => {
                this.$message.error('请求失败');
            }).finally(() => {
                this.setUpsDisable = false;
            })
        },
        init() {
            this.getList();
        },
    }
}
</script>

<style lang="less" src="../../../style/table_sticky.less" scoped>

</style>