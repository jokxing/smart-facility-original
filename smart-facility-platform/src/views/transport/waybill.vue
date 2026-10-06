<template>
    <div class="session">
        <div class="search-bar-container">
            <div>
                <el-select
                    class="state-select margin-small-right"
                    v-model="query.state"
                    @change="handleFilter">
                    <el-option
                        :value="null"
                        :label="$t('common.all')"/>
                    <el-option
                        v-for="state in wayBillStates"
                        :key="state.code"
                        :value="state.code"
                        :label="state.text"/>
                </el-select>
                <el-select
                    v-model="query.sampleId"
                    class="state-select margin-small-right"
                    filterable
                    remote
                    clearable
                    reserve-keyword
                    :placeholder="$t('transport.changeBrand')"
                    @change="handleFilter"
                    :remote-method="getAllSampleInfo">
                    <el-option
                        v-for="item in products"
                        style="height: auto"
                        :key="item.id"
                        :label="item.sampleName"
                        :value="item.id">
                        <div style="line-height: 14px;padding: 5px;">
                            {{ item.sampleName }}
                            <div style="color: darkgrey;">
                                {{ $t('transport.yieldCompany') }}：{{ item.productionCompany }}
                            </div>
                        </div>
                    </el-option>
                </el-select>
                <el-select
                    v-model="query.deliverId"
                    class="state-select margin-small-right"
                    filterable
                    remote
                    clearable
                    reserve-keyword
                    :placeholder="$t('transport.changeConsigner')"
                    @change="handleFilter"
                    :remote-method="getAllDelivers">
                    <el-option
                        v-for="item in delivers"
                        :key="item.id"
                        :label="item.receiptDeliverUserName"
                        :value="item.id">
                        {{ item.receiptDeliverUserName }}
                        <span style="color: darkgray">（{{ item.tel }}）</span>
                    </el-option>
                </el-select>
                <el-select
                    v-model="query.receiptId"
                    class="state-select margin-small-right"
                    filterable
                    remote
                    clearable
                    reserve-keyword
                    :placeholder="$t('transport.changeConsignee')"
                    @change="handleFilter"
                    :remote-method="getAllReceipts">
                    <el-option
                        v-for="item in receipts"
                        :key="item.id"
                        :label="item.receiptDeliverUserName"
                        :value="item.id">
                        {{ item.receiptDeliverUserName }}
                        <span style="color: darkgray">（{{ item.tel }}）</span>
                    </el-option>
                </el-select>
                <el-date-picker
                    type="datetimerange"
                    clearable
                    class="input-with-select margin-small-right"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')"
                    format="yyyy-MM-dd HH:mm"
                    @change="handelSelectTime"
                    v-model="queryTimeRange"/>

            </div>

            </div>
        <div class="clearfix">
            <el-input
                v-model.trim="query.keyword"
                class="input-with-select"
                clearable
                :placeholder="$t('transport.searchOrderNo2')"
                @keyup.enter.native="handleFilter">
                <el-button
                    slot="append"
                    class="el-button-host"
                    icon="icon-search1"
                    @click="handleFilter">
                </el-button>
            </el-input>
            <!--                <el-button-->
            <!--                    class="icon-setup">-->
            <!--                    打印订单监测数据-->
            <!--                </el-button>-->
            <div>
                <el-button
                    @click="handleShowSetup"
                    class="icon-setup">
                    {{ listSelection.length || showSetUp ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
                </el-button>
                <el-button
                    @click="handleAdd"
                    class="icon-addto"
                    type="primary">
                    {{ $t('transport.addTransport') }}
                </el-button>
                <el-button @click="handleResetDemo">重置演示运单</el-button>
            </div>

        </div>
        <div v-if="showSetUp" class="choose-bar">
            <template>
                <div class="checked">
                    {{ $t('common.multipleSelection') }}<span>{{ listSelection.length }}</span>{{ $t('common.item') }}
                </div>
            </template>
            <template>
                <el-button
                    v-for="(item,index) in setUpList"
                    :key="index" @click="handleBatchUpdate(item.funcName)">{{ item.title }}
                </el-button>
            </template>
        </div>
        <div class="sticky-head">
            <el-table
                class="margin-center"
                ref="multipleTable"
                v-loading="loading"
                :data="list"
                row-key="id"
                stripe
                border
                :header-cell-class-name="headerCellClassName"
                @sort-change="handleSortChange"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="50px" v-if="showSetUp" align="center" fixed="left"/>
                <el-table-column type="expand" width="30" fixed="left">
                    <template v-slot="scope">
                        <el-table
                            style="width: 85%;margin-left: 20px;"
                            :data="scope.row.sampleInfos"
                            border
                            stripe>
                            <el-table-column type="index" label="#" width="70"/>
                            <el-table-column prop="sampleNo" :label="$t('transport.productNo')"/>
                            <el-table-column prop="sampleName" :label="$t('transport.productName')"/>
                            <el-table-column prop="amount" :label="$t('common.num')"/>
                            <el-table-column prop="unitName" :label="$t('transport.unit')"/>
                            <el-table-column prop="specification" :label="$t('labDevice.specification')"/>
                            <el-table-column prop="productionBatch" :label="$t('transport.productionBatch')"/>
                        </el-table>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#" width="60" fixed="left"/>
                <el-table-column prop="transportNo" min-width="100" sortable="custom" :label="$t('transport.transportNo')">
                    <template v-slot="{row}">
                        <el-link
                            @click="$refs.waybillInfo.open({
                            id: row.id,
                            name: row.transportNo,
                            no: row.transportNo
                        })"
                            :underline="false"
                            type="primary">
                            {{ row.transportNo }}
                        </el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="professionNo" sortable="custom" min-width="100" :label="$t('transport.professionNo')"/>
                <el-table-column prop="state" sortable="custom" min-width="60" :label="$t('hardware.status')">
                    <template v-slot="{row}">
                    <span :class="row.state === 3 ? 'normal' : 'abnormal'">
                        {{ wayBillStates[row.state].text }}
                    </span>
                    </template>
                </el-table-column>
                <el-table-column prop="carBoard" :label="$t('transport.carBoard1')" min-width="100">
                    <template v-slot="{row}">
                        <span v-if="row.carId">{{ row.carBoard }}</span>
                        <span v-else style="color: red">{{ $t('transport.notChillCar') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="deliverName" min-width="80" :label="$t('transport.consigner')"/>
                <el-table-column prop="receiveName" min-width="80" :label="$t('transport.consignee')"/>
                <el-table-column prop="statusValue" :label="$t('hardware.value')" min-width="120">
                    <template v-slot="{row}">
                        <div v-if="row['sensors'] && row.sensors.length">
                            <div v-for="sensor in row.sensors">
                                {{ sensor.monitorSensorName }}:
                                <span
                                    v-if="sensor.monitorSensorId != 12 && ![17,1001].includes(sensor.monitorSensorId)"
                                    :class="
                            (!('normalMin' in sensor) || sensor.normalMin < sensor.monitorSensorVal)
                            &&
                            (!('normalMax' in sensor) || sensor.monitorSensorVal < sensor.normalMax)
                            ?
                            'normal'
                            :
                            'abnormal'">
                            {{ sensor.monitorSensorVal }}
                            {{ sensor.unit }}
                        </span>
                                <span
                                    v-else-if="![17,1001].includes(sensor.monitorSensorId)"
                                    :class="sensor.activateFlag === 1 ? 'abnormal':'normal' ">
                                    {{ sensor.gps }}
                            </span>
                                <span v-else>
                                {{ sensor.monitorFlag === 1 ? $t('common.open1') : $t('common.close1') }}
                            </span>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="alarms" :label="$t('hardware.alarmScoped')" min-width="120">
                    <template v-slot="{row}">
                        <div v-for="sensor in row.sensors">
                            {{ sensor.monitorSensorName }}:
                            <template
                                v-if="sensor.normalCat===3">
                            <span
                                v-if="'normalMin' in sensor && 'normalMax' in sensor">
                                {{ sensor.normalMin }}
                                ~
                                {{ sensor.normalMax }}
                            </span>
                                <span v-else>
                                -
                            </span>
                            </template>
                            <template v-if="sensor.normalCat===1">
                                {{ sensor.monitorFlag === 1 ? $t('common.open1') : $t('common.close1') }}
                            </template>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="beginTime" sortable="custom" :label="$t('transport.goOff')" align="center" min-width="100">
                    <template v-slot="{row}">
                        {{ row.beginTime | localToUtc }}
                    </template>
                </el-table-column>
                <el-table-column prop="completeTime" sortable="custom" :label="$t('transport.arrivalTime')" align="center" min-width="100">
                    <template v-slot="{row}">
                        {{ row.completeTime | localToUtc }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('common.handle')" width="180" fixed="right">
                    <template v-slot="{row}">
                        <el-button
                            type="text"
                            :disabled="row.state!==undefined && row.state > 0"
                            @click="handleEdit(row)">
                            {{ $t('common.edit') }}
                        </el-button>
                        <!--     TODO: 分配车后才可设置报警规则               -->
                        <el-button
                            type="text"
                            class="margin-small-right"
                            :disabled="!row.carId || [2,3].includes(row.state)"
                            @click="handleAlarmSet(row)">
                            {{ $t('hardware.alarmSystem') }}
                        </el-button>
                        <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                          <i class="el-icon-more"/>
                        </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item @click.native="handleSetCar(row)" :disabled="row.state!==0">
                                    <el-button type="text" :disabled="row.state!==0">
                                        {{ $t('transport.allocationChillCar') }}
                                    </el-button>
                                </el-dropdown-item>
                                <el-dropdown-item @click.native="handleLoadCar(row)" :disabled="row.state!==0 || !row.carId">
                                    <el-button type="text" :disabled="row.state!==0 || !row.carId">
                                        {{ $t('transport.carLoader') }}
                                    </el-button>
                                </el-dropdown-item>
                                <el-dropdown-item @click.native="handleDepart(row)" :disabled="row.state!==1">
                                    <el-button type="text" :disabled="row.state!==1">
                                        {{ $t('transport.go') }}
                                    </el-button>
                                </el-dropdown-item>
                                <el-dropdown-item @click.native="handleArrive(row)" :disabled="row.state!==2">
                                    <el-button type="text" :disabled="row.state!==2">
                                        {{ $t('transport.delivery') }}
                                    </el-button>
                                </el-dropdown-item>
                                <el-dropdown-item @click.native="handlePrint(row)">
                                    <el-button type="text">
                                        {{ $t('transport.inputData') }}
                                    </el-button>
                                </el-dropdown-item>
                                <el-dropdown-item @click.native="handleDelete(row)">
                                    <el-button class="abnormal" type="text">
                                        {{ $t('common.delete') }}
                                    </el-button>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <div class="paging">
            <pagination
                v-show="total > $store.state.pageSizes[0]"
                :limit.sync="query.pageSize"
                :page.sync="query.pageNum"
                :total="total"
                :page-sizes="$store.state.pageSizes"
                @pagination="getList"/>
        </div>
        <waybill-info ref="waybillInfo" @updatedInfo="getList"/>
        <print-waybill-monitor ref="printWaybillMonitor"/>
        <select-car-dialog ref="selectCarDialog"/>
        <create-way-bill ref="createWayBill" @created="added" @updated="edited"/>
        <AdvancedAlarmSet ref="AdvancedAlarmSet"/>
        <depart-hint ref="departHint" @confirm="setState"></depart-hint>

    </div>
</template>

<script>
import {
    DATAZOOM
} from "@/utils/constant"
import CreateWayBill from "@/views/transport/components/CreateWayBill";
import AdvancedAlarmSet from "@/views/AdvancedAlarmSet";
import Pagination from "@c/Pagination";
import SelectCarDialog from "@/views/transport/components/SelectCarDialog";
import WaybillInfo from "@/views/transport/components/WaybillInfo";

import {
    queryTransportOrder,
    miniQueryAllSampleInfo,
    miniQueryReceiptDeliverAddress,
    allocateTransportOrderCar,
    changeTransportOrderState,
    deleteTransportOrder,
    resetDemoTransport,
} from "@/api/transport";
import PrintWaybillMonitor from "@/views/transport/components/PrintWaybillMonitor";
import DepartHint from "@/views/transport/components/DepartHint";
import mixin from "@/utils/mixin";

export default {
    name: "transportWaybill",
    components: {
        DepartHint,
        PrintWaybillMonitor,
        CreateWayBill,
        AdvancedAlarmSet,
        SelectCarDialog,
        Pagination,
        WaybillInfo,
    },
    data() {
        const _this = this;
        return {
            DATAZOOM,

            // 运单状态选项列表
            wayBillStates: [
                {code: 0, text: _this.$t('transport.notCarLoader')},
                {code: 1, text: _this.$t('transport.carLoadereed')},
                {code: 2, text: _this.$t('transport.inTransit')},
                {code: 3, text: _this.$t('transport.deliveried')},
            ],
            // 产品名称选项列表
            products: [],
            // 发货人选项列表
            delivers: [],
            // 收货人选项列表
            receipts: [],

            // 查询条件
            query: {

                // 筛选条件
                state: null,
                beginTime: null,
                endTime: null,
                sampleId: null,
                deliverId: null,
                receiptId: null,

                // 分页
                pageNum: 1,
                pageSize: 10,

                // 排序状态
                sortName: {
                    transportNo: '',
                    professionNo: '',
                    state: '',
                    beginTime: '',
                    completeTime: '',
                    createDate: '',
                }
            },
            queryTimeRange: null,


            total: 0,
            loading: false,
            list: [],


            listSelection: [],

            // 显示按钮
            showSetUp: false,
            // 批量设置按钮
            setUpList: [
                {
                    title: _this.$t('transport.allocationChillCar'),
                    funcName: 'handleBatchSetCar'
                },
                {
                    title: _this.$t('transport.carLoader'),
                    funcName: 'handleBatchLoadCar'
                },
                {
                    title: _this.$t('transport.go'),
                    funcName: 'handleBatchDepart'
                },
                {
                    title: _this.$t('transport.delivery'),
                    funcName: 'handleBatchArrive'
                },
                {
                    title: _this.$t('common.batchDelete'),
                    funcName: 'handleBatchDelete'
                },
                {
                    title: _this.$t('transport.batchInputData'),
                    funcName: 'handleBatchPrint'
                },
            ],

        }
    },
    created() {
        this.getAllSampleInfo();
        this.getAllDelivers();
        this.getAllReceipts();
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
        getAllSampleInfo(keyWord) {
            miniQueryAllSampleInfo({keyWord}).then(res => {
                if (res.code) {
                    this.products = res.items;
                }
            })
        },
        getAllDelivers(keyWord) {
            miniQueryReceiptDeliverAddress({keyWord, types: 0}).then(res => {
                if (res.code) {
                    this.delivers = res.items;
                }
            })
        },
        getAllReceipts(keyWord) {
            miniQueryReceiptDeliverAddress({keyWord, types: 1}).then(res => {
                if (res.code) {
                    this.receipts = res.items;
                }
            })
        },

        handelSelectTime() {
            if (this.queryTimeRange) {
                this.query.beginTime = this.queryTimeRange[0];
                this.query.endTime = this.queryTimeRange[1];
            } else {
                this.query.beginTime = '';
                this.query.endTime = '';
            }
            this.handleFilter();
        },

        // 排序状态改变时
        handleSortChange(col) {
            let order = '';
            if (col.order === 'ascending') {
                order = 'asc';
            } else if (col.order === 'descending') {
                order = 'desc';
            }

            this.query.sortName[col.prop] = order;

            this.handleFilter();
        },
        headerCellClassName(item) {
            let sortNames = this.query.sortName;
            for (let sortName in sortNames) {
                if (sortName === item.column.property) {
                    if (sortNames[sortName] === '') {
                        item.column.order = '';
                    } else {
                        item.column.order = sortNames[sortName] + 'ending';
                    }

                }
            }
        },

        // 点击搜索
        handleFilter() {
            this.query.pageNum = 1;
            this.getList();
        },

        // 刷新列表
        handelRefresh() {
            this.getList();
        },

        // 获取列表
        getList() {
            this.loading = true;
            queryTransportOrder(this.query).then(res => {
                if (res.code) {
                    this.list = res.items.list;
                    this.total = res.items.total;
                }
            }).finally(() => {
                this.loading = false;
            })
        },

        handleAlarmSet(row) {
            this.$refs.AdvancedAlarmSet.open({
                id: row.id,
                type: 6,
                name: row.transportNo,
            });
        },

        // 点击批量设置按钮激活批量设置面板
        handleShowSetup() {
            if (this.showSetUp) {
                // this.listSelection = [];
                this.$refs.multipleTable.clearSelection();
            }
            this.showSetUp = !this.showSetUp;
        },
        // 多选框勾选时
        handleSelectionChange(selection) {
            this.listSelection = selection;
        },

        // 点击任一批量操作
        handleBatchUpdate(funcName) {
            this[funcName]();
        },

        /** 各批量操作: */

        //
        getSelectIds() {
            let orderIds = [];
            this.listSelection.forEach(row => {
                orderIds.push(row.id);
            })
            return orderIds;
        },
        //批量分配冷藏车
        handleBatchSetCar() {
            if (this.listSelection.length === 0) {
                this.$message.info(this.$t('transport.changeLog'));
                return;
            }
            this.setCar(this.getSelectIds());
        },
        //
        setCar(orderIds) {
            this.$refs.selectCarDialog.openSelect(selectedCar => {

                allocateTransportOrderCar({
                    carId: selectedCar.id,
                    driverId: selectedCar.driverId,
                    orderIds
                }).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('transport.allocationSuccess'));
                        this.handelRefresh();
                    } else {
                        this.$message.error(res.message);
                    }
                }).catch(res => {
                    this.$message.error(res.message);
                })
            });
        },

        //批量设为装车
        handleBatchLoadCar() {
            if (this.listSelection.length === 0) {
                this.$message.info(this.$t('transport.changeLog'));
                return;
            }
            this.setState(this.getSelectIds(), 1);
        },

        //批量设为出发
        handleBatchDepart() {
            if (this.listSelection.length === 0) {
                this.$message.info(this.$t('transport.changeLog'));
                return;
            }
            this.setState(this.getSelectIds(), 2);
        },

        //批量设为送达
        handleBatchArrive() {
            if (this.listSelection.length === 0) {
                this.$message.info(this.$t('transport.changeLog'));
                return;
            }
            this.setState(this.getSelectIds(), 3);
        },

        //
        //批量设置状态
        setState(ids, state) {
            this.loading = true;
            changeTransportOrderState({ids, state}).then(res => {
                this.loading = false;
                if (res.code) {
                    this.$message.success(this.$t('common.editSuccess'));
                    this.handelRefresh();
                } else {
                    this.$message.error(res.message);
                }
            }).catch(res => {
                this.loading = false;
                this.$message.error(res.message);
            });
        },

        //批量删除
        handleBatchDelete() {
            if (this.listSelection.length === 0) {
                this.$message.info(this.$t('transport.changeLog'));
                return;
            }

            this.deleteOrNot(this.getSelectIds());
        },

        // 确定框
        deleteOrNot(ids, ) {
            this.$confirm(
                this.$t('transport.deleteLogMessage'),
                this.$t('transport.deleteTransport'),
                {
                    type: 'warning',
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel')
                }
            ).then(() => {
                this.deleteDate(ids);
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'));
            })
        },

        // 执行删除
        deleteDate(ids) {
            this.setUpsDisable = true;
            deleteTransportOrder(ids).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('common.deleteSuccess'));
                    let pageNum2 = Math.ceil((this.total - ids.length) / this.query.pageSize);
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

        handleBatchPrint() {
            if (this.listSelection.length === 0) {
                this.$message.info(this.$t('transport.changeLog'));
                return;
            }
            this.$refs.printWaybillMonitor.open(this.getSelectIds());
        },

        /** 各单项操作 */

        //分配冷藏车
        handleSetCar(row) {
            this.setCar([row.id]);
        },

        //设为装车
        handleLoadCar(row) {
            this.setState([row.id], 1);
        },

        //设为出发
        handleDepart(row) {
            this.$refs.departHint.open(row.carId, row.id);
            // this.setState([row.id], 2);
        },

        //设为送达
        handleArrive(row) {
            this.setState([row.id], 3);
        },

        //删除
        handleDelete(row) {
            this.deleteOrNot([row.id], ' ' + row.transportNo);
        },

        // 点击打印
        handlePrint(row) {
            this.$refs.printWaybillMonitor.open([row.id]);
        },

        handleAdd() {
            this.$refs.createWayBill.open(0);
        },
        handleResetDemo() {
            this.$confirm(
                '将恢复预置样例并清除本机运单改动，不会同步到小程序。确定继续？',
                '重置演示运单',
                {type: 'warning', confirmButtonText: this.$t('common.confirm'), cancelButtonText: this.$t('common.cancel')}
            ).then(() => {
                resetDemoTransport().then(res => {
                    if (res.code) {
                        this.$message.success('已重置演示运单');
                        this.handleFilter();
                    } else {
                        this.$message.error(res.message);
                    }
                });
            }).catch(() => {});
        },
        handleEdit(row) {
            this.$refs.createWayBill.open(1, row);
        },
        added() {
            this.handelRefresh();
        },
        edited() {
            this.handelRefresh();
        },
    },

}
</script>
<style lang="less" src="../../style/table_sticky.less" scoped></style>
<style scoped>
.state-select {
    width: 160px;
}

.input-with-select {
    width: 350px !important;
}

/deep/ .el-table__expanded-cell {
    padding: 0 80PX !important;
}

.el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
}
</style>