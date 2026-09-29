<template>
    <div class="commodity">
        <div class="session">
            <!--     筛选条件的       -->
            <div class="search-bar-container">
                <div>
                    <el-date-picker
                        type="datetimerange"
                        clearable
                        class="input-with-select margin-small-right"
                        :start-placeholder="$t('common.startDate')"
                        :end-placeholder="$t('common.endDate')"
                        @change="handleQueryTimeChange"
                        v-model="queryTimeRange"/>
                    <el-input
                        v-model.trim="query.key"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('transport.noCommodity1')"
                        @keyup.enter.native="handleQuery">
                        <el-button
                            slot="append"
                            icon="icon-search1"
                            class="el-button-host"
                            @click="handleQuery">
                        </el-button>
                    </el-input>
                </div>
                <div>
                    <el-button
                        @click="handleShowSetup"
                        class="icon-setup">
                        {{ listSelection.length || showSetUp ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
                    </el-button>
                    <el-button
                        @click="handleCreate"
                        class="icon-addto"
                        type="primary">
                        {{ $t('transport.addCommodity') }}
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
                    prop="sampleNo"
                    :label="$t('common.no')"
                    width="100"
                    fixed="left"/>
                <el-table-column
                    prop="sampleName"
                    :label="$t('transport.commodity')"
                    min-width="120">
                </el-table-column>
                <el-table-column
                    prop="unitName"
                    :label="$t('transport.unit')"
                    width="80">
                </el-table-column>
                <el-table-column
                    prop="specification"
                    :label="$t('labDevice.specification')"
                    min-width="80">
                </el-table-column>
                <el-table-column
                    prop="productionCompany"
                    :label="$t('transport.yieldCompany')"
                    min-width="100">
                </el-table-column>
                <el-table-column
                    prop="productionBatch"
                    :label="$t('transport.productionBatch')"
                    min-width="100">
                </el-table-column>
                <el-table-column
                    prop="comment"
                    :label="$t('common.remark')"
                    min-width="100">
                </el-table-column>
                <el-table-column
                    prop="createUserName"
                    :label="$t('common.createName')"
                    min-width="80">
                </el-table-column>
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
                    prop=""
                    fixed="right"
                    :label="$t('common.handle')"
                    width="100">
                    <template v-slot="{row}">
                        <el-button
                            type="text"
                            @click="handleUpdate(row)">
                            {{ $t('common.edit') }}
                        </el-button>
                        <el-button
                            type="text"
                            @click="handleDelete(row)"
                            :disabled="setUpsDisable"
                            class="abnormal">
                            {{ $t('common.delete') }}
                        </el-button>
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
        <create-commodity
            ref="CreateCommodity"
            @created="init"
            @updated="init"/>
    </div>
</template>

<script>
import Pagination from "@c/Pagination";
import CreateCommodity from "@/views/transport/components/CreateCommodity";
import {deleteSampleInfo, querySampleInfo} from "@/api/transport";
import mixin from "@/utils/mixin";

export default {
    name: "CommodityMaintain",
    components: {
        CreateCommodity,
        Pagination
    },
    data() {
        const _this = this;
        return {
            // 搜索条件
            query: {
                beginTime: null,
                endTime: null,
                key: '',
                pageNum: 1,
                pageSize: 10,
                // 排序
                sortName: {
                    createDate: '', // 'desc', 'asc'
                    sampleNo: '',
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
        handleQueryTimeChange() {
            if (this.queryTimeRange === null) {
                this.query.beginTime = null;
                this.query.endTime = null;
            } else {
                this.query.beginTime = this.queryTimeRange[0];
                this.query.endTime = this.queryTimeRange[1];
            }
            this.handleQuery();
        },
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
        handleQuery() {
            this.query.pageNum = 1;
            this.getList();
        },
        getList() {
            this.listLoading = true;
            querySampleInfo(this.query).then(res => {
                this.listTotal = res.items.total;
                this.list = res.items.list;
            }).finally(() => {
                this.listLoading = false;
            })
        },
        handleShowSetup() {
            if (this.showSetUp) {
                this.listSelection = [];
                this.$refs.multipleTable.clearSelection();
            }
            this.showSetUp = !this.showSetUp;
        },
        selectionChange(rows) {
            this.listSelection = rows;
        },
        handleSetUp(funcName) {
            this[funcName]();
        },
        // 批量删除
        handleBatchDelete() {
            if (this.listSelection.length === 0) {
                this.$message.info(this.$t('transport.changeLog'));
                return;
            }
            this.deleteOrNot(this.listSelection);
        },
        // 单个删除
        handleDelete(row) {
            this.deleteOrNot([row], ' ' + row.sampleName);
        },
        // 确定框
        deleteOrNot(rows, text) {
            this.$confirm(
                this.$t('transport.deleteLogMessage'),
                this.$t('transport.deleteBrand'),
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
        deleteDate(rows) {
            let ids = [];
            rows.forEach(row => {
                ids.push(row.id);
            });
            this.setUpsDisable = true;
            deleteSampleInfo(ids).then(res => {
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
        handleUpdate(row) {
            this.$refs.CreateCommodity.open(1, row);
        },
        handleCreate() {
            this.$refs.CreateCommodity.open(0);
        },
        init() {
            this.getList();
        }
    }
}
</script>

<style lang="less" src="../../style/table_sticky.less" scoped>

</style>