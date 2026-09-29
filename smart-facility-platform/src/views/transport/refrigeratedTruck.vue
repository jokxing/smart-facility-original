<template>
    <div class="session">
        <el-form inline :model="query">
            <!-- 选择车型 -->
            <el-form-item>
                <el-select
                    class="select-width"
                    :placeholder="$t('transport.changeCarModel')"
                    @change="handleFilter"
                    filterable
                    remote
                    clearable
                    reserve-keyword
                    :remote-method="getAllCarModel"
                    v-model="query.modelId">
                    <el-option :value="null" label="">{{ $t('common.all') }}</el-option>
                    <el-option
                        v-for="carModel in carModels"
                        :key="carModel.id"
                        :value="carModel.id"
                        :label="carModel.modelName"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select
                    class="select-width"
                    :placeholder="$t('transport.changeCarStatus')"
                    @change="handleFilter"
                    v-model="query.carState">
                    <el-option :value="null" label="">{{ $t('common.all') }}</el-option>
                    <el-option
                        v-for="(stateText,index) in carStates"
                        :key="index"
                        :value="index"
                        :label="stateText"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select
                    class="select-width"
                    :placeholder="$t('transport.changeCarBrand')"
                    @change="handleFilter"
                    filterable
                    remote
                    :remote-method="getAllCarBrand"
                    v-model="query.brandId">
                    <el-option :value="null" label="">{{ $t('common.all') }}</el-option>
                    <el-option
                        v-for="carBrand in carBrands"
                        :key="carBrand.id"
                        :value="carBrand.id"
                        :label="carBrand.brandName"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select
                    class="select-width"
                    :placeholder="$t('transport.changeDriver')"
                    @change="handleFilter"
                    filterable
                    remote
                    :remote-method="getAllDriver"
                    v-model="query.driverId">
                    <el-option :value="null" label="">{{ $t('common.all') }}</el-option>
                    <el-option
                        v-for="driver in drivers"
                        :key="driver.id"
                        :value="driver.id"
                        :label="driver.driverName">
                        {{ driver.driverName }}
                        <span style="color: darkgray">（{{ driver.tel }}）</span>
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-input
                    class="input-with-select"
                    v-model="query.carBoard"
                    @keyup.enter.native="handleFilter"
                    :placeholder="$t('transport.inputCarBoard')">
                    <el-button
                        icon="icon-search1"
                        class="el-button-host"
                        @click="handleFilter"
                        slot="append"/>
                </el-input>
            </el-form-item>
            <span style="float: right">
        <el-form-item>
          <el-button
              @click="handleChangeShowSetUp"
              class="icon-setup">
            {{ showSetUp ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
              @click="handleAdd"
              class="icon-addto"
              type="primary">
            {{ $t('transport.addChillCar') }}
          </el-button>
        </el-form-item>
      </span>
        </el-form>
        <el-form inline>
            <el-form-item>
                <el-date-picker
                    type="datetimerange"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    class="data-picker-width"
                    @change="handleSelectTime"
                    v-model="dateTimeRange"/>
            </el-form-item>
        </el-form>
        <div v-if="showSetUp" class="choose-bar">
            <template>
                <div class="checked">
                    {{ $t('common.multipleSelection') }}<span>{{ listSelection.length }}</span>{{ $t('common.item') }}
                </div>
            </template>
            <template>
                <el-button
                    v-for="item in setUpList"
                    :key="item.value" @click="handleBatchUpdate(item.funcName)">{{ item.title }}
                </el-button>
            </template>
        </div>
        <div class="sticky-head">
            <el-table
                stripe
                class="margin-center"
                ref="multipleTable"
                row-key="id"
                v-loading="loading"
                border
                :header-cell-class-name="headerCellClassName"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                :data="list">
                <el-table-column
                    fixed="left"
                    v-if="showSetUp"
                    type="selection"
                    width="40px"
                    align="center"/>
                <el-table-column
                    fixed="left"
                    label="#"
                    width="60px"
                    align="center">
                    <template v-slot="scope">
                        {{ (query.pageNum - 1) * query.pageSize + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="carBoard" :label="$t('transport.carBoard')" min-width="80px">
                    <template v-slot="{row}">
                        <el-button type="text" @click="showInfo(row)">{{ row.carBoard }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="brandName" :label="$t('transport.brandName')" min-width="100px"/>
                <el-table-column
                    prop="carState"
                    :label="$t('hardware.status')"
                    min-width="60px"
                    sortable="custom">
                    <template v-slot="{row}">
                        {{ carStates[row.carState] }}
                    </template>
                </el-table-column>
                <el-table-column prop="modelName" :label="$t('transport.modelName')" min-width="100px"/>
                <el-table-column prop="driverName" :label="$t('transport.driverName')" min-width="100px"/>
                <el-table-column prop="tel" :label="$t('transport.driverTel')" min-width="100px"/>
                <el-table-column prop="createUserName" :label="$t('common.createName')" min-width="100px"/>
                <el-table-column
                    prop="createDate"
                    :label="$t('common.creatDate')"
                    min-width="160px"
                    sortable="custom">
                    <template v-slot="{row}">
                        {{ row.createDate | localToUtc }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('common.handle')" fixed="right" width="140px">
                    <template v-slot="{row}">
                        <el-button type="text" @click="handleEdit(row)">{{ $t('common.edit') }}</el-button>
                        <el-button type="text" @click="handleDelete(row)" class="abnormal">{{
                                $t('common.delete')
                            }}
                        </el-button>
                        <el-button type="text" @click="handleSetDriver(row)">{{
                                $t('transport.allocationDrivers')
                            }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <div class="paging">
            <pagination
                v-show="total > 10"
                :limit.sync="query.pageSize"
                :page.sync="query.pageNum"
                :total="total"
                @pagination="getList"/>
        </div>
        <CreateRefrigerateTruck ref="creatTruck" @created="handleFilter" @updated="handleRefresh"/>
        <SelectDriverDialog ref="selectDriverDialog" :dialogTitle="$t('transport.allocationDrivers')"/>
        <RefrigerateTruckInfo ref="truckInfo" @updatedInfo="getList"/>
    </div>
</template>

<script>
import {
    miniListAllCarModel,
    miniListAllCarBrand,
    miniListAllDriver,
    queryRefrigerateCar,
    deleteRefrigerateCar, updateRefrigerateCarDriver,
} from "@/api/transport";
import Pagination from "@c/Pagination";
import CreateRefrigerateTruck from "@/views/transport/components/CreateRefrigerateTruck"
import SelectDriverDialog from "@/views/transport/components/SelectDriverDialog"
import RefrigerateTruckInfo from "@/views/transport/components/RefrigerateTruckInfo"
import mixin from "@/utils/mixin";

export default {
    name: "refrigeratedTruck",
    components: {
        Pagination,
        CreateRefrigerateTruck,
        SelectDriverDialog,
        RefrigerateTruckInfo
    },
    data() {
        const _this = this;
        return {
            //搜索条件的下拉框的选项->
            carStates: [_this.$t('transport.leaveUnused'), _this.$t('transport.inTransit')],
            carModels: [],
            carBrands: [],
            drivers: [],
            // 搜索条件
            dateTimeRange: null,
            query: {
                modelId: null,//
                carState: null,//
                brandId: null,//
                driverId: null,//
                beginTime: '',
                endTime: '',
                carBoard: '',//
                pageNum: 1,//
                pageSize: 10,//
                stateSort: 0,// 司机状态排序 0:不排序  1：降序  2：升序
                timeSort: 0,// 时间排序 0:不排序  1：降序  2：升序
            },
            total: 0,
            // 列表加载标记
            loading: false,
            // 列表
            list: [],
            // 列表选择项
            listSelection: [],
            // 显示批量设置的操作面板
            showSetUp: false,
            // 批量操作按钮定义
            setUpList: [
                {
                    title: _this.$t('common.batchDelete'),
                    funcName: 'handleBatchDelete'
                },
            ],
        }
    },
    created() {
        this.getAllCarModel();
        this.getAllCarBrand();
        this.getAllDriver();
        this.handleFilter();
    },
    watch: {
        list() {

        }
    },
    mounted() {
        ;
    },
    methods: {
        getAllCarModel(keyWord) {
            miniListAllCarModel({keyWord}).then(res => {
                if (res.code) {
                    this.carModels = res.items;
                }
            })
        },
        getAllCarBrand(keyWord) {
            miniListAllCarBrand({keyWord}).then(res => {
                if (res.code) {
                    this.carBrands = res.items;
                }
            })
        },
        getAllDriver(keyWord) {
            miniListAllDriver({keyWord}).then(res => {
                if (res.code) {
                    this.drivers = res.items;
                }
            })
        },
        handleSelectTime() {
            if (this.dateTimeRange) {
                this.query.beginTime = this.dateTimeRange[0];
                this.query.endTime = this.dateTimeRange[1];
            } else {
                this.query.beginTime = '';
                this.query.endTime = '';
            }
            this.handleFilter();
        },
        handleRefresh() {
            this.getList();
        },
        handleFilter() {
            this.query.pageNum = 1;
            this.getList();
        },
        getList() {
            this.loading = true;
            queryRefrigerateCar(this.query).then(res => {
                this.total = res.items.total;
                this.list = res.items.list;
            }).finally(() => {
                this.loading = false;
            })
        },
        // 排序状态改变时
        handleSortChange(col) {
            let order = 0;
            if (col.order === 'ascending') {
                order = 2;
            } else if (col.order === 'descending') {
                order = 1;
            }
            if (col.prop === 'carState') {
                this.query.stateSort = order;
            } else if (col.prop === 'createDate') {
                this.query.timeSort = order;
            }
            this.handleFilter();
        },
        headerCellClassName(item) {
            if ('createDate' === item.column.property) {
                if (this.query.timeSort === 1) {
                    item.column.order = 'descending';
                } else if (this.query.timeSort === 2) {
                    item.column.order = 'ascending';
                } else {
                    item.column.order = '';
                }
            } else if ('carState' === item.column.property) {
                if (this.query.stateSort === 1) {
                    item.column.order = 'descending';
                } else if (this.query.stateSort === 2) {
                    item.column.order = 'ascending';
                } else {
                    item.column.order = '';
                }
            }
        },
        showInfo(row) {
            this.$refs.truckInfo.open({
                id: row.id,
                name: row.carBoard,
                no: row.carBoard
            });
        },
        handleSetDriver(row) {
            this.$refs.selectDriverDialog.openSelect(driverId => {
                updateRefrigerateCarDriver({id: row.id, driverId}).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t("hardware.changeSuccess"))
                        this.handleRefresh();
                    } else {
                        this.$message.error(res.message)
                    }
                });
            });
        },
        // 多选框勾选时
        handleSelectionChange(selection) {
            this.listSelection = selection;
        },
        // 批量操作
        handleBatchUpdate(funcName) {
            this[funcName]();
        },
        handleChangeShowSetUp() {
            if (this.showSetUp) {
                this.listSelection = [];
                this.$refs.multipleTable.clearSelection();
            }
            this.showSetUp = !this.showSetUp;
        },
        handleDelete(row) {
            this.$confirm(
                this.$t('transport.deleteChillCarMessage') + row.carBoard + " ？",
                this.$t('transport.deleteChillCar'),
                {
                    type: "warning",
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel')
                }
            ).then(() => {
                this.deleteData(row);
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'));
            });
        },
        deleteData(row) {
            deleteRefrigerateCar([row.id]).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('common.deleteSuccess'));
                    if (Math.ceil(--this.total / this.query.pageSize) < this.query.pageNum) {
                        this.query.pageNum--;
                    }
                    this.getList();
                } else {
                    this.$message.error(res.message)
                }
            });
        },
        // 批量删除
        handleBatchDelete() {
            if (this.listSelection.length === 0) {
                this.$message.info(this.$t('transport.changeLog'));
                return;
            }
            this.$confirm(
                this.$t('transport.changeLog'),
                this.$t('transport.deleteLogMessage'),
                {
                    type: "warning",
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel')
                }
            ).then(() => {
                this.deleteBatchData(this.listSelection);
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'));
            });
        },
        deleteBatchData(rows) {
            let ids = [];
            rows.forEach(row => {
                ids.push(row.id);
            })
            deleteRefrigerateCar(ids).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('common.deleteSuccess'));
                    let pgNum = Math.ceil((this.total - ids.length) / this.query.pageSize);
                    if (pgNum < this.query.pageNum) {
                        this.query.pageNum = pgNum;
                    }
                    this.getList();
                } else {
                    this.$message.error(res.message)
                }
            });
        },
        handleAdd() {
            this.$refs.creatTruck.open(0);
        },
        handleEdit(row) {
            this.$refs.creatTruck.open(1, row.id);
        },
        init() {
            this.handleRefresh();
        },
    }
}
</script>
<style lang="less" src="../../style/table_sticky.less" scoped></style>
<style lang="less" scoped>
.select-width {
    width: 160px;
}

.data-picker-width {
    width: 500px;
}

.session {
    /deep/ .el-form-item {
        margin-bottom: 10px !important;
    }

    .margin-center {
        margin-top: 10px;
    }
}

</style>