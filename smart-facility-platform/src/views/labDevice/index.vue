<template>
    <div class="instrument-box">
        <div class="instrument" v-loading="refreshLoading">
            <template>
                <div class="">
                    <div class="">
                        <div class="lab-device-total" v-if="gather.length > 0">
                            <div class="total-card totality cursor" @click="handleStateScreen(null, null)">
                                <div class="float-left">
                                    <div class="total-title">{{ gather[0].name }}</div>
                                    <div class="total-sum">
                                        <span class="num">{{ gather[0].count }}</span>
                                        <!--                    <span>台</span>-->
                                    </div>
                                </div>
                                <div class="total-img">
                                    <div class="image"></div>
                                </div>
                            </div>
                            <div class="total-type session">
                                <div class="total-type-bottom">
                                    <template v-for="(item, index) in gather">
                                        <div
                                            v-if="index > 0 && !item.delete"
                                            :key="item.title"
                                            class="bottom-type-list1"
                                        >
                                            <div class="title">{{ item.name }}</div>
                                            <div class="flex">
                                                <div
                                                    class="type-list-num cursor"
                                                    :class="[{'is-active': typeof(items[item.params]) == 'number' && items[item.params] == item.totalState}, item.totalBgClass]"
                                                    @click="handleStateScreen(item.totalState, item.linaType)">
                                                    <div class="ring-icon">
                                                        <i :class="item.totalIcon"></i>
                                                    </div>
                                                    <div class="type-list-num-total">
                                                        <div class="total-title">{{ item.totalName }}</div>
                                                        <span class="num" :class="item.totalClass">{{
                                                                item.totalCount
                                                            }}</span>
                                                        <!--                            <span>台</span>-->
                                                    </div>
                                                </div>
                                                <div
                                                    class="type-list-num cursor"
                                                    :class="[{'is-active': typeof(items[item.params]) == 'number' && items[item.params] == item.normalState}, item.normalBgClass]"
                                                    @click="handleStateScreen(item.normalState, item.linaType)"
                                                >
                                                    <div class="ring-icon">
                                                        <i :class="item.normalIcon"></i>
                                                    </div>
                                                    <div class="type-list-num-total">
                                                        <div class="total-title">{{ item.normalName }}</div>
                                                        <span class="num" :class="item.normalClass">{{
                                                                item.normalCount
                                                            }}</span>
                                                        <!--                            <span :class="item.normalClass">台</span>-->
                                                    </div>
                                                </div>
                                                <div
                                                    class="type-list-num cursor"
                                                    :class="[{'is-active': typeof(items[item.params]) == 'number' && items[item.params] == item.abnormalState}, item.abnormalBgClass]"
                                                    @click="handleStateScreen(item.abnormalState, item.linaType)"
                                                >
                                                    <div class="ring-icon">
                                                        <i :class="item.abnormalIcon"></i>
                                                    </div>
                                                    <div class="type-list-num-total">
                                                        <div class="total-title">{{ item.abnormalName }}</div>
                                                        <span class="num" :class="item.abnormalClass">{{
                                                                item.abnormalCount
                                                            }}</span>
                                                        <!--                            <span :class="item.abnormalClass">台</span>-->
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--                    <template>-->
                    <!--&lt;!&ndash;                        <UseRateChart ref="useRateChartRef" :queryParams="items"/>&ndash;&gt;-->
                    <!--                        <home-statistics/>-->
                    <!--                    </template>-->

                    <template>
                        <div class="instrument" v-loading="refreshLoading">
                            <template v-if="!isDrawVisible">
                                <div class="">
                                    <div class="table-group session test">
                                        <div class="table-handle">
                                            <div class="table-filter left">
                                                <!--                                                <div class="flex">-->
                                                <!--                                                    <div>-->
                                                <!--                                                        <template v-for="tag in tags">-->
                                                <!--                                                            <el-tag-->
                                                <!--                                                                :key="tag.name"-->
                                                <!--                                                                closable-->
                                                <!--                                                                @close="handleTagClose(tag.type)"-->
                                                <!--                                                                class="margin-small-right"-->
                                                <!--                                                            >-->
                                                <!--                                                                {{ tag.name }}-->
                                                <!--                                                            </el-tag>-->
                                                <!--                                                        </template>-->
                                                <!--                                                    </div>-->
                                                <!--                                                </div>-->
                                                <div class="clearfix">
                                                    <div>
                                                        <SearchForm
                                                            :formData="items"
                                                            @change="handleSearchFormChange"
                                                            @buttonClick="handleSearchFormButtonClick"/>
                                                    </div>
                                                </div>
                                                <el-row type="flex" justify="space-between">
                                                    <div>
                                                        <el-input
                                                            v-model.trim="items.keyword"
                                                            class="input-with-select margin-small-right"
                                                            clearable
                                                            :placeholder="$t('labDevice.labDeviceNameAndNo')"
                                                            @keyup.enter.native="handleSearchFormButtonClick('search')">
                                                            <el-button
                                                                slot="append"
                                                                class="el-button-host"
                                                                icon="icon-search1"
                                                                @click="handleSearchFormButtonClick('search')">
                                                            </el-button>
                                                        </el-input>
                                                        <el-button class="icon-reset"
                                                                   @click="handleSearchFormButtonClick('refresh')"></el-button>
                                                    </div>
                                                    <div>
                                                        <el-button
                                                            v-if="roleId != 5 && !isDemo"
                                                            class="defaultBtn"
                                                            icon="el-icon-plus"
                                                            type="primary"
                                                            @click="handleAdd"
                                                        >
                                                            {{ $t('common.add1') }}
                                                        </el-button>
                                                        <el-button
                                                            v-if="!isDemo"
                                                            class="defaultBtn icon-setup"
                                                            @click="showSetUp = !showSetUp"
                                                        >
                                                            {{
                                                                showSetUp ? $t('common.cancelMultiSelect') : $t('common.multiSelect')
                                                            }}
                                                        </el-button>
                                                        <el-button
                                                            class="defaultBtn icon-upload"
                                                            @click="importFileVisible = true"
                                                        >
                                                            {{ $t('common.importHandle') }}

                                                        </el-button>
                                                        <el-button
                                                            class="defaultBtn icon-download1"
                                                            @click="handleExport"
                                                        >
                                                            {{ $t('common.export') }}
                                                        </el-button>
                                                    </div>
                                                </el-row>
                                            </div>
                                        </div>
                                        <div
                                            v-if="showSetUp || multipleSelection.length > 0"
                                            class="choose-bar"
                                        >
                                            <template>
                                                <div class="checked">
                                                    {{
                                                        $t('common.multipleSelection')
                                                    }}<span>{{ multipleSelection.length }}</span
                                                >{{ $t('common.item') }}
                                                </div>
                                            </template>
                                            <template>
                                                <el-button
                                                    v-for="item in setUpList"
                                                    :key="item.value"
                                                    @click="handleBatchUpdate(item)"
                                                >{{ item.title }}
                                                </el-button>
                                            </template>
                                        </div>
                                        <div class="table-default">
                                            <SelfTable
                                                ref="multipleTable"
                                                :columns="TABLECOLUMN"
                                                v-loading="loading"
                                                :defaultSort="defaultSort"
                                                :loading="refreshLoading"
                                                :pageNum="items.pageNum"
                                                :pageSize="items.pageSize"
                                                :pageSizes="pageSizes"
                                                :tabledata="dataSource"
                                                :total="total"
                                                isSelected
                                                :fixed-table="true"
                                                @handleRowsSelect="handleRowsSelect"
                                                @pageNumChange="handlePageNumChange"
                                                @pageSizeChange="handlePageSizeChange"
                                            >
                                                <el-table-column slot="name" :label="$t('labDevice.labDeviceName')"
                                                                 sortable>
                                                    <template slot-scope="scope">
                                                        <a @click="handleSeedDetail(scope.row)"
                                                        >{{ scope.row.name }}
                                                        </a>
                                                    </template>
                                                </el-table-column>

                                                <el-table-column slot="status" :label="$t('labDevice.runStatus')"
                                                                 width="100">
                                                    <template slot-scope="scope">
                                                        {{
                                                            getStatusProto(
                                                                scope.row.status,
                                                                'label',
                                                                statusArray1
                                                            )
                                                        }}
                                                    </template>
                                                </el-table-column>

                                                <el-table-column
                                                    slot="monitorStatus"
                                                    :label="$t('labDevice.monitorStatus')"
                                                    width="150"
                                                >
                                                    <template slot-scope="scope">
                                                        <span
                                                            :class="
                                                            statusColor(scope.row.monitorStatus, ASSETTAGSTATUS)
                                                          "
                                                        >
                                                          {{
                                                                statusText(scope.row.monitorStatus, ASSETTAGSTATUS) ||
                                                                '-'
                                                            }}
                                                        </span>
                                                    </template>
                                                </el-table-column>

                                                <el-table-column
                                                    slot="bingStatus"
                                                    align="center"
                                                    :label="$t('labDevice.paramStatus')"
                                                    width="80"
                                                >
                                                    <template slot-scope="scope">
                                                    <span
                                                        :class="{ danger: (scope.row['bingStatus'] && ![1, 11,4].includes(scope.row.bingStatus)) }">
                                                      {{
                                                            getStatusProto(
                                                                scope.row.bingStatus,
                                                                'label',
                                                                sensorsStatus
                                                            ) || $t('system.unBind')
                                                        }}
                                                    </span>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    slot="createDate"
                                                    :label="$t('common.creatDate')"
                                                    min-width="130"
                                                >
                                                    <template v-slot="scope">
                                                        {{ scope.row.createDate | localToUtc }}
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    v-if="roleId != 5"
                                                    slot="operate"
                                                    fixed="right"
                                                    :label="$t('common.handle')"
                                                    width="150"
                                                >
                                                    <template slot-scope="scope">
                                                        <el-button type="text" @click="handleEdit(scope.row)"
                                                        >{{ $t('common.edit') }}
                                                        </el-button
                                                        >
                                                        <el-button
                                                            class="abnormal"
                                                            type="text"
                                                            @click="handleDelete(scope.row)"
                                                        >{{ $t('common.delete') }}
                                                        </el-button>
                                                    </template>
                                                </el-table-column>
                                            </SelfTable>
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <!-- 修改新增设备 -->
                            <Modal v-if="modalVisible" :type="4" @handle="handleUpdate"/>
                            <!-- 批量更新弹窗 -->
                            <UpdateModal
                                v-if="updateModalVisible"
                                ref="updateModal"
                                :multipleSelection="multipleSelection"
                                :setData="setUpData"
                                @handle="$refs.multipleTable.$refs.table.clearSelection()"
                                @hiddenModalVisible="hiddenModalVisible"
                            />

                            <!-- 详情弹窗 -->
                            <!-- 开通2.0打开新详情 -->
                            <LabDeviceDrawer :id="detailId" :is-drawer.sync="isDrawer" @instrument-updated="handleInstrumentList"/>
                            <!-- 没开通2.0打开旧详情 -->
                            <Drawer>
                                <DrawerPage :detailId="detailId"></DrawerPage>
                            </Drawer>
                            <!-- 导入弹窗 -->
                            <ImportFile
                                v-if="importFileVisible"
                                :title="importTitle"
                                @handleUpdateInit="handleUpdateInit"
                                @hiddenModalVisible="hiddenModalVisible"
                            />
                            <!-- 地理位置筛选侧边弹出框 -->
                            <floor-drawer ref="floorDrawer" @handle="handleFloorSearchRoom"/>
                            <!-- 选择房间 -->
                            <room-screen ref="roomScreen" @handle="handleSearchRoom"/>
                            <!-- 添加负责人 -->
                            <SetPrincipal ref="SetPrincipal"/>
                            <!-- 移动轨迹记录 -->
                            <!-- <MoveTrackRecord ref="moveTrackRecord"/> -->
                            <!-- 设备分类筛选侧边弹出框 -->
                            <SelectAssetClassTree
                                ref="SelectAssetClassTree"
                                @handle="handleClassify"
                            />
                        </div>
                    </template>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import {
    getInstrumentDashboardNew, getInstrumentRemove, getInstrumentUnbind, postInstrumentBatchDelete, postInstrumentList
} from '@/api/labDevice'
import {mapMutations, mapState} from 'vuex'
import moment from 'moment'
import {ASSETTAGSTATUS, items, STATUS_VALUE} from '@/utils/constant'
import SearchForm from '@/views/deviceManagement/components/SearchForm.vue'

import UseRateChart from './components/charts/UseRateChart.vue'
import ChargePersonChart from './components/charts/ChargePersonChart'
import DepartmentUsageChart from './components/charts/DepartmentUsageChart'
import RoomUsageChart from './components/charts/RoomUsageChart'
import SelfTable from "@c/Table";
import Modal from "@/views/labDevice/modal";
import Drawer from "@c/Drawer";
import DrawerPage from "@/views/detail";
import LabDeviceDrawer from "@/views/labDevice/components/LabDeviceDrawer";
import SelectTree from "@c/SelectTree";
import SelectAssetClassTree from "@c/SelectAssetClassTree";
import UpdateModal from "@/views/labDevice/components/updateModal";
import ImportFile from "@c/ImportFile";
import dictMixin from "@/views/deviceManagement/mixin/dict.mixin";
import {statusColor, statusText} from "@/utils/methods";
import UserCompanySelect from "@c/UserCompanySelect";
import RoomScreen from "@c/RoomScreen";
import SetPrincipal from "@c/SetPrincipal";
import CircleRing from "@c/CircleProgress";
import DeviceTotal from "@c/DeviceTotal";
import MoveTrackRecord from "@/views/labDevice/components/MoveTrackRecord";
import FloorDrawer from "@c/FloorDrawer";
import RectangleTreeChart from "@c/RectangleTreeChart";
import {getMapGardenList} from "@/api/mapSet";
import {postUserExport} from "@/api/labDevice";
import mixin from "@/utils/mixin";
import {getRoomList} from "@/api/room";
import HomeStatistics from "@/views/labDevice/components/HomeStatistics";

const useItems = {
    dateType: 3, // 1---当日 2---本周 3---本月
    endDate: '',
    pageNum: 1,
    pageSize: 10,
    startDate: '',
    subType: 3,
    thingsIdList: [],
    type: 1, // 1---按设备类型 2---按设备
    useRateSet: 1, // 1---按工作日 2---自然日 3---时段
    start: '',
    end: ''
}

export default {
    components: {
        HomeStatistics,
        SelfTable,
        Modal,
        Drawer,
        DrawerPage,
        LabDeviceDrawer,
        SelectTree,
        SelectAssetClassTree,
        UpdateModal,
        ImportFile,
        UserCompanySelect,
        RoomScreen,
        SetPrincipal,
        CircleRing,
        DeviceTotal,
        MoveTrackRecord,
        FloorDrawer,
        RectangleTreeChart,
        SearchForm,
        UseRateChart,
        ChargePersonChart,
        DepartmentUsageChart,
        RoomUsageChart
    },
    mixins: [dictMixin],
    data() {
        const _this = this;
        return {
            addressOptions: [], // 地理位置筛选级联选择器数据
            ASSETTAGSTATUS,
            statusText,
            statusColor,
            // 批量数据
            multipleSelection: [],
            // 批量修改弹窗
            updateModalVisible: false,
            // 导入弹窗
            importFileVisible: false,
            importTitle: 'instrument',
            // 批量设置
            showSetUp: false,
            // 批量设置按钮
            setUpList: [
                {
                    title: _this.$t('labDevice.updateRoom'),
                    value: 1
                },
                {
                    title: _this.$t('common.updateDepartment'),
                    value: 2
                },
                {
                    title: _this.$t('labDevice.updateDeviceType'),
                    value: 3
                },
                {
                    title: _this.$t('labDevice.updateDeviceImg'),
                    value: 4
                },
                {
                    title: _this.$t('labDevice.setCustodian'),
                    value: 5
                },
                {
                    title: _this.$t('common.batchDelete'),
                    value: 6
                }
            ],
            setUpData: {},
            // 表头排序
            defaultSort: {
                order: 'descending'
            },
            // 新详情页
            isDrawer: false,

            // 表格
            dataSource: [],
            pageSizes: items.PAGE_SIZES, // 批量删除提交数据
            form: {
                ids: []
            },
            obj: '',
            rateList: {},
            loading: false,
            // 用户层级
            roleId: JSON.parse(localStorage.getItem('USERINFO')).roleId,
            isDemo: process.env.VUE_APP_DEMO === 'true',
            // 根据房间模糊搜索
            detailId: '',
            isBottom: null,
            gather: [
                {name: _this.$t('labDevice.labDeviceSum'), count: 0, types: 0},
                {
                    linaType: 1,
                    delete: true,
                    name: _this.$t('labDevice.labDeviceStatus1'),
                    normalCount: 0,
                    normalName: _this.$t('labDevice.work'),
                    normalClass: "work",
                    abnormalClass: "not-work",
                    normalIcon: require("../../assets/labdevice/bg-work.png"),
                    abnormalCount: 0,
                    abnormalName: _this.$t('labDevice.notWork'),
                    abnormalIcon: require("../../assets/labdevice/bg-not-work.png"),
                    totalCount: 0,
                    restsCount: 0,
                    totalName: _this.$t('labDevice.labDeviceStatus2'),
                    totalIcon: require("../../assets/labdevice/bg-total.png")
                },
                {
                    delete: true,
                    linaType: 2,
                    name: _this.$t('labDevice.assetMove'),
                    normalCount: 0,
                    normalName: _this.$t('common.monitored'),
                    normalIcon: require("../../assets/labdevice/bg-moni.png"),
                    abnormalCount: 0,
                    abnormalName: _this.$t('common.unmonitor'),
                    normalClass: "work",
                    abnormalClass: "not-work",
                    abnormalIcon: require("../../assets/labdevice/bg-not-work.png"),
                    totalCount: 0,
                    restsCount: 0,
                    totalName: _this.$t('labDevice.labDeviceStatus2'),
                    totalIcon: require("../../assets/labdevice/bg-total.png")
                },
                {
                    delete: true,
                    linaType: 3,
                    name: _this.$t('labDevice.temperatureMonitoring'),
                    normalCount: 0,
                    normalName: _this.$t('common.normal'),
                    normalIcon: require("../../assets/labdevice/bg-normal.png"),
                    abnormalCount: 0,
                    restsCount: 0,
                    abnormalName: _this.$t('common.abnormal'),
                    normalClass: "normal",
                    abnormalClass: "abnormal",
                    abnormalIcon: require("../../assets/labdevice/bg-abnormal.png"),
                    totalCount: 0,
                    totalName: _this.$t('labDevice.temperatureMonitoringSum'),
                    totalIcon: require("../../assets/labdevice/bg-total.png")
                },
                {
                    delete: true,
                    linaType: 4,
                    restsCount: 0,
                    name: _this.$t('labDevice.pressureMonitoring'),
                    normalCount: 0,
                    normalName: _this.$t('common.normal'),
                    normalClass: "normal",
                    abnormalClass: "abnormal",
                    normalIcon: 'icon-weigongzuo',
                    abnormalCount: 0,
                    abnormalName: _this.$t('common.abnormal'),
                    abnormalIcon: 'icon-jiankongzongshu',
                    totalCount: 0,
                    totalName: _this.$t('labDevice.pressureMonitoringSum'),
                    totalIcon: 'icon-gongzuozhong'
                },
                {
                    name: _this.$t('labDevice.paramStatus'),
                    linaType: 6,
                    normalCount: 0,
                    restsCount: 0,
                    normalName: _this.$t('common.abnormal'),
                    normalClass: "abnormal",
                    normalBgClass: "abnormal-bg1",
                    abnormalClass: "not-work",
                    abnormalBgClass: "",
                    normalIcon: 'icon-alarmer',
                    abnormalCount: 0,
                    abnormalName: _this.$t('labDevice.otherStatus'),
                    abnormalIcon: 'icon-weigongzuo',
                    totalCount: 0,
                    normalState: 2,
                    abnormalState: 3,
                    totalState: 1,
                    params: "sensorStatus",
                    totalClass: "normal",
                    totalBgClass: "normal-bg1",
                    totalName: _this.$t('common.normal'),
                    totalIcon: 'icon-zhengchang'
                },
                {
                    totalState: 1,
                    normalState: 0,
                    abnormalState: 4,
                    name: _this.$t('labDevice.runStatus1'),
                    linaType: 5,
                    normalCount: 0,
                    restsCount: 0,
                    normalName: _this.$t('labDevice.unruning'),
                    normalClass: "not-work",
                    normalBgClass: "",
                    abnormalClass: "",
                    abnormalBgClass: "unbind-bg1",
                    params: "status",
                    normalIcon: 'icon-weigongzuo',
                    abnormalCount: 0,
                    abnormalName: _this.$t('system.unBind'),
                    abnormalIcon: 'icon-jiankongzongshu',
                    totalCount: 0,
                    totalClass: "normal",
                    totalBgClass: "normal-bg1",
                    totalName: _this.$t('labDevice.runing'),
                    totalIcon: 'icon-gongzuozhong'
                },
            ],
            total: 0,

            prop: {value: 'value', label: 'label', children: 'children'},
            thingsIdList: [],
            items: {
                ...useItems,
                typesList: [], // 设备类型
                typesListSelection: [],
                addressSelection: [], // 地理位置
                departmentSelection: [], // 部门
                departmentIdList: [],
                managerIdList: [], // 负责人id
                instrumentIdList: [], // 设备ids
                buildingId: '',
                categoryId: '',
                floorId: '',
                gardenId: '',
                keyword: '',
                managerId: '',
                pageNum: 1,
                pageSize: 10,
                roomIdList: [],
                sensorStatus: '',
                status: '',
                statusList: [],
                departmentId: '',
                type: 4,
                dateType: 3,
                objType: "",
            },
            refreshLoading: false,
            tags: [],
            roomId: ''
        }
    },
    mounted() {
    },
    created() {
        const pageSize = localStorage.getItem("pageSize");
        if (pageSize) {
            this.items.pageSize = pageSize * 1;
        }
        this.buildingId = ''
        this.floorId = ''
        this.gardenId = ''
        this.$nextTick(() => {
            this.init()
        })
        this.handleGetGatherData()
        // 地理位置数据
        this.handleGetMapGardenList()
    },
    updated() {
    },
    methods: {
        handleStateScreen(state, type) {
            if (type == 6) {
                this.items.sensorStatus = state;
                this.items.status = null;
            } else if (type == 5) {
                this.items.status = state;
                this.items.sensorStatus = null;
            } else if (type == null) {
                this.items.sensorStatus = null;
                this.items.status = null;
            }
            this.handleInstrumentList();
        },
        handleGetGatherData() {
            getInstrumentDashboardNew().then((res) => {
                if (res.code) {
                    const obj = res.items.data.reduce((prev, current) => {
                        prev[current.linaType] = current;
                        return prev;
                    }, {})
                    this.gather.map(item => {
                        if (obj[item.linaType]) {
                            const check = obj[item.linaType];
                            item.normalCount = check.abnormalCount
                            item.abnormalCount = check.restsCount
                            item.totalCount = check.normalCount
                        }
                    })
                    this.gather[0].count = res.items.totalCount
                }
            })
        },
        // 筛选表单变化
        handleSearchFormChange(form) {
            if (form.prop === 'typesListSelection') {
                this.handleClassifyChange(form.data)
            } else if (form.prop === 'addressSelection') {
                this.handleAddressChange(form.data)
            } else if (form.prop === 'dateRange') {
                let [creatStartDate, createEndDate] = [...(this.items.dateRange || [])]
                this.$set(this.items, 'createStartDate', creatStartDate)
                this.$set(this.items, 'createEndDate', createEndDate)
            } else if (form.prop === 'departmentSelection') {
                this.handleDepartmentSelection(form.data)
            } else if (form.prop === 'status') {
                this.$set(this.items, 'status', form.data);
                this.$set(this.items, 'sensorStatus', '');
            } else if (form.prop === 'sensorStatus') {
                this.$set(this.items, 'status', '');
                this.$set(this.items, 'sensorStatus', form.data);
            } else if (form.prop === 'objType') {
                this.$set(this.items, 'objType', form.data);
            }
        },
        // 监听设备分类的变化
        handleClassifyChange(data) {
            this.items.typesList = data.allMinCategoryIds
        },
        // 监听地理位置变化
        handleAddressChange(obj) {
            this.$set(this.items, 'gardenId', obj.gardenIds[0])
            // buildingId
            this.$set(this.items, 'buildingId', obj.floorIds[0])
            // floorIds
            this.$set(this.items, 'floorIds', obj.roomIdList)
        },
        // 监听部门变化
        handleDepartmentSelection(data) {
            this.$set(this.items, 'departmentIdList', data.allMinDep)
        },
        // 筛选表单按钮点击事件
        handleSearchFormButtonClick(type) {
            if (type === 'search') {
                // this.init()
                this.handleQuery()
            } else if (type === 'refresh') {
                this.handleInit()
            }
        },
        // 获取地理位置级联选择器数据
        handleGetMapGardenList() {
            this.addressOptions = []
            getMapGardenList().then((res) => {
                if (res.code && res.items.length) {
                    for (const item of res.items) {
                        let grandpaKey = 'a'
                        let grandpa = {
                            key: grandpaKey + item.gardenId,
                            id: item.gardenId,
                            name: item.gardenName,
                            subDivisions: []
                        }
                        for (const element of item.subDivisions) {
                            let fatherKey = 'b'
                            let father = {
                                key: fatherKey + element.id,
                                id: element.id,
                                name: element.name,
                                subDivisions: []
                            }
                            grandpa.subDivisions.push(father)
                            for (const sun of element.subDivisions) {
                                let sunKey = 'c'
                                let grandson = {
                                    key: sunKey + sun.id,
                                    id: sun.id,
                                    name: sun.name
                                }
                                father.subDivisions.push(grandson)
                            }
                        }
                        this.addressOptions.push(grandpa)
                    }
                }
            })
        },
        // 处理设备分类级联选择器数据，删除为空数组的childrenList
        handleAssetClassifyOptions(list) {
            list.forEach((item) => {
                if (item.childrenList && Array.isArray(item.childrenList)) {
                    if (!item.childrenList.length) {
                        delete item.childrenList
                    } else {
                        this.handleAssetClassifyOptions(item.childrenList)
                    }
                }
            })
            return list
        },
        // 监听日期组件变化
        handleChartDimension(data) {
            this[data.callbackName] && this[data.callbackName](data.$event, data.type)
        },
        handleSearchRoom(item) {
            this.items.gardenId = item.gardenId
            this.items.buildingId = item.buildingId
            this.items.floorId = item.floorId
            this.items.roomIdList = item.roomIds
            this.handleInstrumentList()
        },
        getValue(e, type) {
            if (type === 1) {
                this.items.sensorStatus = e.data.value
            }
            if (type === 2) {
                if (!e) {
                    this.items.status = null
                } else {
                    this.items.status = e.data.value
                }
            }
            if (type === 3) {
                this.items.monitorStatus = e.data.value
            }
            this.handleInstrumentList()
        },
        init() {
            this.$refs.useRateChartRef && this.$refs.useRateChartRef.handleChartData()

            this.handleInstrumentList()
        },
        handleUpdate() {
            this.handleInstrumentList();
        },
        // 获取列表
        handleInstrumentList() {
            this.refreshLoading = true
            this.dataSource = []
            this.total = 0;
            const obj = JSON.parse(JSON.stringify(this.items))
            if (obj.status == -1) {
                obj.status = 0
            }
            postInstrumentList(obj)
                .then((res) => {
                    this.refreshLoading = false
                    if (res.code) {
                        this.dataSource = res.items.list
                        this.total = res.items.total
                    } else {
                        console.log(res.message)
                        this.$message.error(res.message)
                    }
                })
                .catch((e) => {
                    console.log(e)
                })
        },
        handleQuery() {
            this.items.pageNum = 1
            this.handleInstrumentList()
        },
        remoteMethod(query) {
            if (query !== '') {
                this.roomLoading = true
                getRoomList({
                    keyword: query,
                    pageSize: 10,
                    pageNum: 1
                }).then((res) => {
                    this.roomLoading = false
                    this.rooms = res.items.list
                })
            } else {
                this.rooms = []
            }
        },
        ...mapMutations({
            handleDrawerOpen: 'DRAWEROPEN',
            drawerVisible: 'drawerVisible'
        }),
        ...mapMutations('lab', {
            handleAddModal: 'ADDMODAL',
            handleEditModal: 'EDITMODAL',
            handleReflesh: 'REFLESH'
        }),
        handleFloorSearchRoom(item) {
            this.level = item.level
            let name = ''
            let index1 = null
            if (item.level === 1) {
                this.items.gardenId = item.data.id
                this.items.buildingId = ''
                this.floorId = ''
                name = item.data.name
            }
            if (item.level === 2) {
                this.items.buildingId = item.data.id
                this.items.floorId = ''
                name = item.parent.data.name + ' / ' + item.data.name
            }
            if (item.level === 3) {
                this.items.floorId = item.data.id
                name =
                    item.parent.parent.data.name +
                    ' / ' +
                    item.parent.data.name +
                    ' / ' +
                    item.data.name
            }
            this.tags.map((item1, index) => {
                if (item1.type === 1) {
                    index1 = index + 1
                }
            })
            console.log(index1)
            if (index1) {
                this.tags[index1 - 1].name = name
            } else {
                this.tags.push({name, type: 1})
            }
            this.handleInstrumentList()
        },
        handleTagClose(type) {
            if (type === 1) {
                this.items.gardenId = ''
                this.items.buildingId = ''
                this.items.floorId = ''
                this.tags.map((item, index) => {
                    if (item.type === type) {
                        this.tags.splice(index, 1)
                    }
                })
                this.$refs.floorDrawer.handleClose()
            }
            if (type === 2) {
                this.items.categoryId = ''
                this.tags.map((item, index) => {
                    if (item.type === type) {
                        this.tags.splice(index, 1)
                    }
                })
                this.$refs.SelectAssetClassTree.handleClose()
            }
            this.handleInstrumentList()
        },
        handleClassify(item) {
            let name = ''
            let index1 = null
            if (item.level === 1) {
                name = item.data.name
            }
            if (item.level === 2) {
                name = item.parent.data.name + ' / ' + item.data.name
            }
            this.tags.map((item1, index) => {
                if (item1.type === 2) {
                    index1 = index + 1
                }
            })
            if (index1) {
                this.tags[index1 - 1].name = name
            } else {
                this.tags.push({name, type: 2})
            }
            this.items.categoryId = item.data.id
            this.handleInstrumentList()
        },

        // 表格Checkbox
        handleRowsSelect(selection) {
            this.multipleSelection = selection
        },
        // 显示批量更新弹窗
        handleBatchUpdate(item) {
            if (this.multipleSelection.length > 0) {
                if (item.value == 6) {
                    this.handleBatchDeleteDevice()
                } else if (item.value == 5) {
                    this.$refs.SetPrincipal.open(1, this.multipleSelection, 4)
                } else {
                    this.setUpData = item
                    this.updateModalVisible = true
                }
            } else {
                this.$message.error(this.$t('labDevice.selectFixDevice'))
            }
        },
        // 隐藏弹窗
        hiddenModalVisible() {
            this.updateModalVisible = false
            this.importFileVisible = false
        },
        // 批量删除
        handleBatchDeleteDevice() {
            this.form.ids = []
            for (var i = 0; i < this.multipleSelection.length; i++) {
                this.form.ids.push(this.multipleSelection[i].id)
            }
            this.$confirm(this.$t('labDevice.selectFixDevice'), this.$t('common.hint'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                postInstrumentBatchDelete(this.form).then((res) => {
                    if (res.code == 1) {
                        this.$refs.multipleTable.$refs.table.clearSelection()
                        this.$message.success(this.$t('common.deleteBatchSuccess'));
                        this.handleReflesh()
                    } else {
                        this.$message.error(this.$t('common.deleteError') + res.message);
                    }
                }).catch((err) => {
                })
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'))
            })
        },
        // 上传成功后更新初始化
        handleUpdateInit() {
            this.importFileVisible = false
            this.handleReflesh()
        },
        // 导出
        handleExport() {
            const data = this.isDemo ? {
                keyword: this.items.keyword,
                departmentIdList: this.items.departmentIdList,
                typesList: this.items.typesList,
                gardenId: this.items.gardenId,
                buildingId: this.items.buildingId,
                floorIds: this.items.floorIds,
                roomIdList: this.items.roomIdList,
                status: this.items.status == -1 ? 0 : this.items.status,
                sensorStatus: this.items.sensorStatus,
                objType: this.items.objType,
                type: this.items.type,
                pageNum: 1,
                pageSize: 10000
            } : {
                keyword: this.items.keyword,
                pageNum: this.items.pageNum,
                pageSize: this.items.pageSize,
                search: this.items.search,
                sensorStatus: this.items.sensorStatus,
                monitorStatus: this.items.monitorStatus,
                type: this.items.type
            }
            this.$message.warning(this.$t('common.exportMessage'));
            postUserExport(data)
                .then((res) => {
                    const finish = () => {
                        const stamp = moment(new Date()).format('YYYYMMDDHHmmss')
                        mixin.methods.download(
                            res,
                            decodeURIComponent(this.$t('labDevice.deviceExport') + stamp + (this.isDemo ? '.xlsx' : ''), "UTF-8")
                        )
                    }
                    if (this.isDemo) return finish()
                    new Promise((resolve) => {
                        setTimeout(() => {
                            resolve()
                        }, 2500)
                    }).then(finish)
                })
                .catch((err) => {
                    this.$message.error(err.message || err)
                })
        },

        getStatusProto(status, proto, arr) {
            let c = ''
            arr.map((a) => {
                if (a.value === status) {
                    c = a[proto]
                }
            })
            return c
        },

        handlePageSizeChange(size) {
            this.items.pageSize = size
            this.items.pageNum = 1
            this.handleInstrumentList()
        },

        handlePageNumChange(num) {
            this.items.pageNum = num
            this.handleInstrumentList()
        },

        handleAdd() {
            this.handleAddModal()
        },

        async deleteAsync(id) {
            try {
                let result = await getInstrumentRemove({}, id)
                if (result.code === STATUS_VALUE.NORMAL) {
                    this.$message({
                        type: 'success',
                        message: this.$t('common.deleteSuccess'),
                    })
                    this.loading = false
                    this.handleGetGatherData()
                    this.handleReflesh()
                } else {
                    this.loading = false
                    this.$message.error(result.message || this.$t('common.deleteError'))
                }
            } catch (err) {
                this.loading = false
                this.$message({
                    type: 'error',
                    message: err
                })
            }
        },

        handleSeedDetail(record) {
            this.detailId = record.id
            if (record.openTwoSystem) {
                this.isDrawer = true
            } else {
                this.handleDrawerOpen();
            }
        },
        handleDelete(record) {
            if (record.labelId) {
                this.$confirm(this.$t('labDevice.bindTag'), this.$t('common.hint'), {
                    confirmButtonText: this.$t('hardware.goOn'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                }).then(() => {
                    this.loading = true
                    getInstrumentUnbind({instrumentId: record.id}).then((res) => {
                        if (res.code) {
                            if (res.code === 1) {
                                this.deleteAsync(record.id)
                            } else {
                                this.loading = false
                                this.$message.error(res.message)
                            }
                        } else {
                            this.loading = false
                            this.$message.error(res.message)
                        }
                    })
                })
                    .catch(() => {
                    })
            } else {
                this.$confirm(this.$t('labDevice.deleteData'), this.$t('common.hint'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                }).then(() => {
                    this.loading = true
                    this.deleteAsync(record.id)
                })
                    .catch(() => {
                    })
            }
        },

        handleEdit(record) {
            this.handleEditModal(record)
        },
        handleInit() {
            this.items = {
                typesList: [], // 设备类型
                typesListSelection: [],
                addressSelection: [], // 地理位置
                departmentSelection: [], // 部门
                // managerIdList: [], // 负责人id
                instrumentIdList: [], // 设备ids
                buildingId: '',
                categoryId: '',
                floorId: '',
                gardenId: '',
                keyword: '',
                managerId: '',
                monitorStatus: '',
                pageNum: 1,
                pageSize: 10,
                roomIdList: [],
                sensorStatus: '',
                status: '',
                statusList: [],
                departmentId: '',
                type: 4,
                objType: "",
                dateRange: '' // 创建时间
            }
            const pageSize = localStorage.getItem("pageSize");
            if (pageSize) {
                this.items.pageSize = pageSize * 1;
            }
            this.tags = []
            this.roomId = ''
            this.handleInstrumentList()
        },
        handleRoomChange(e) {
            if (!e) {
                return
            }
            this.items.roomIdList = [e]
            this.handleInstrumentList()
        },
        handleClear() {
            this.roomId = ''
            this.items.roomIdList = []
            this.handleInstrumentList()
        }
    },
    computed: {
        ...mapState('lab', {
            modalVisible: 'modalVisible',
            isReflesh: 'isReflesh',
            isDrawVisible: 'isDrawVisible'
            // detailId: "detailId",
        }),
        deviceOptions() {
            let assetClassify = JSON.parse(
                JSON.stringify(this.$store.state.assetClassify)
            )
            if (!assetClassify.length || Object.prototype.toString.call(assetClassify) === '[object Object]') return []
            let list = this.handleAssetClassifyOptions(assetClassify)
            return list
        }
    },
    watch: {

        isReflesh: {
            handler() {
                this.handleGetGatherData();
                this.handleInstrumentList();
            }
        },
        isDrawVisible: {
            handler(newVal) {
                if (!newVal) {
                    this.handleInit()
                }
            }
        },
        $route(to, from) {
            this.multipleSelection = []
            this.showSetUp = false
            document.getElementsByClassName('main-container')[0].scrollTop = 0
            window.scrollTo(0, 0)
        },
        tags: {
            handler(newVal) {
            },
            deep: true
        }
    }
}
</script>

<style lang="less" scoped>
@import './index.less';
@import '../../style/variable';

.warn {
    color: #ffd591;
}

.danger {
    color: #ff4949;
}

.success {
    color: #13ce66;
}

.left {
    float: left;
}

.right {
    float: right;
}

.gatherBox {
    position: relative;
    background: #ffffff;
    border-radius: 8px;
    margin-top: 20px;

    .gatherBox-item {
        padding: 20px 10px;
        min-width: 170px;
        cursor: pointer;

        .box {
            // border: 1px solid #dfe6ec;
            border-radius: 3px;
            padding: 30px;
            font-size: 16px;
            text-align: center;
            box-shadow: 1px 0 5px 2px #dfe6ec;
            border: 1px solid #fff;

            &:hover {
                box-shadow: 1px 0 5px 1px #dfe6ec;
            }

            .name {
                font-weight: 600;
            }

            .num {
                margin-top: 10px;
                font-size: 48px;
            }
        }

        .is-active {
            border-color: @blue;
        }
    }

    &::after {
        display: block;
        content: '';
        height: 1px;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #dfe6ec;
    }
}

.equipmentStatus {

    .w70 {
        width: 70px !important;
    }

    .w250 {
        width: 250px !important;
    }

    .head-flex {
        display: flex;
        align-items: center;
    }

    .ml {
        margin-left: 20px;
    }

    .mt16 {
        margin-top: 16px !important;
    }

    .charts {
        /deep/ .el-button {
            padding: 10px;
        }

        .is-active {
            background: @subjectColor !important;
            color: @white !important;
        }

        .is-active:focus-within {
            background: @subjectColor;
        }

        .is-active:hover {
            background: @subjectColor;
            color: @white;
        }
    }

    .mr {
        margin-right: 30px;
    }

    .title {
        height: 40px;
        line-height: 40px;
        font-size: 16px;
        font-weight: bold;
        color: #333333;
        margin-right: 40px;

        .infoIcon {
            position: relative;
            top: 2px;
        }
    }

    .title-before {
        position: relative;
        color: #3f51b5;
        height: 40px;
        line-height: 40px;
        font-size: 18px;
        font-weight: bold;
        margin-right: 40px;
        margin-left: 16px;
    }

    .title-before::before {
        content: '';
        width: 4px;
        height: 18px;
        background: #3f51b5;
        position: absolute;
        top: 12px;
        left: -16px;
    }
}

.echartsBox {
    padding: 10px 36px 0;
}

.defaultBtn {
    /deep/ .el-icon-plus {
        color: #ffffff;
        font-size: 14px;
    }
}

.table-group {
    //padding: 20px 0;
    .table-filter {
        width: 100%;

        .w70 {
            width: 140px !important;
        }

        .w250 {
            width: 250px !important;
        }
    }

    .table-handle-right {
        text-align: right;
        float: right;
    }

    .table-handle {
        //height: 90px;
        margin-bottom: 20px;

        /deep/ .el-input__inner {
            width: 100%;
        }

        &::after {
            display: block;
            content: '';
            height: 0;
            clear: both;
            overflow: hidden;
        }
    }

    .choose-bar {
        width: 100%;
        display: flex;
        align-items: center;
        margin: 16px 0;

        .checked {
            min-width: 120px;

            span {
                color: #1890ff;
                padding: 0 8px;
            }
        }
    }
}

.bottom-type-list1 {
    border-radius: 8px;
    padding: 5px 10px 20px 10px;
    margin-left: 16px;
    margin-right: -16px;
    overflow: hidden;
    position: relative;

    .flex {
        margin-top: 20px;
    }

    .title {
        font-size: 16px;
        font-weight: bold;
        color: #333333;
        line-height: 15px;
    }

    .type-list-num {
        width: 203px;
        height: 80px;
        border-radius: 8px;
        margin-right: 16px;
        display: flex;
        padding: 16px;
        background-color: #EBEEF8;

        .ring-icon {
            width: 46px;
            height: 46px;
            border-radius: 50%;
            background-color: #D8DEED;
            text-align: center;
            line-height: 44px;

            i {
                font-size: 18px;
                color: #5872A6;
                font-weight: 600;
            }
        }

        &.normal-bg1 {
            background-color: #D9F4EB;

            .ring-icon {
                background-color: #C4EDE3;

                i {
                    color: #10B89B;
                }
            }
        }

        &.abnormal-bg1 {
            background-color: #F5E2E2;

            .ring-icon {
                background-color: #F7D9DA;

                i {
                    color: #EF4D4E;
                }
            }
        }

        &.unbind-bg1 {
            background-color: #F9EFDD;

            .ring-icon {
                background-color: #F2E5D0;

                i {
                    color: #C69D7B;
                }
            }
        }

        .type-list-num-total {
            margin-left: 20px;

            .total-title {
                white-space: nowrap;
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .num {
                font-size: 28px;
                font-weight: 500;
                line-height: 28px;
                margin-right: 10px;
            }

            span {
                color: #c69d7b;
            }

            .work {
                color: #2a7dfd;
            }

            .not-work {
                color: #5872a6;
            }
        }
    }
}

.type-list-num:hover, .is-active {
    background-image: none !important;
    background-color: #448AFF !important;
    color: @white !important;

    .type-list-num {
        color: @white !important;
    }

    .type-list-num-total {
        .num {
            color: @white !important;
        }
    }

    .ring-icon {
        background: #44a8ff !important;
        opacity: 0.8 !important;

        i {
            color: #448aff !important;
        }
    }
}

.device-right-icon {
    background: #d7e6ff !important;
    right: 10px !important;

    i {
        font-size: 24px !important;
        color: #448aff;
    }
}

.movement-track-button {
    position: absolute;
    top: 30px;
    right: 30px;
    z-index: 1;

    .address {
        background: #ffffff !important;
    }
}

.ai-proportion {
    margin-top: 0px;
    width: 100%;

    .ai-proportion-ring {
        width: 230px;
        height: 80px;
        padding: 20px;
        border-radius: 10px;
        position: relative;
        color: #555555 !important;

        .normal-num {
            font-size: 28px;
            font-weight: bold;
            color: #10b89b;
        }

        .abnormal-num {
            font-size: 28px;
            font-weight: bold;
            color: #ef4d4e;
        }

        .offline-num {
            font-size: 28px;
            font-weight: bold;
            color: #5872a6;
        }

        .img {
            position: absolute;
            right: 20px;
            top: 15px;

            img {
                width: 60px;
                height: 55px;
            }
        }

        &.normal {
            background: #def6ee;
        }

        &.abnormal {
            background: #f6e4e4;
        }

        &.offline {
            background: #eef1f9;
        }
    }
}

.charts-type,
.charts {
    font-size: 14px;
    font-weight: initial;

    .el-button {
        height: 30px;
        padding: 5px;
    }

    .is-active {
        background: @subjectColor !important;
        color: @white !important;
    }

    .is-active:focus-within {
        background: @subjectColor;
    }

    .is-active:hover {
        background: @subjectColor;
        color: @white;
    }
}

.clearfix {
    flex-wrap: wrap;
}

.h500 {
    .title {
        height: 40px;
        line-height: 40px;
        font-size: 16px;
        font-weight: bold;
        color: #333333;
        margin-right: 40px;

        .infoIcon {
            position: relative;
            top: 2px;
        }
    }
}

.sub-flex {
    width: 100%;

    .el-button {
        height: 30px;
        padding: 5px;
    }
}

.stat {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.f14 {
    font-size: 14px;
}

.tab-2 {
    display: flex;

    .mini {
        height: 30px !important;
        padding: 8px !important;
    }

    div {
        line-height: 30px;
        margin-right: 28px;
        cursor: pointer;

        &:last-child {
            margin-right: 0;
        }

        &.active {
            background: #3f51b5 !important;
            color: @subjectColor !important;
            position: relative !important;

            &::after {
                content: '';
                width: 100%;
                height: 2px;
                background-color: @subjectColor;
                position: absolute;
                bottom: 0;
                left: 0;
                border-radius: 5px;
            }
        }
    }
}

.total {
    display: flex;
    justify-content: center;

    /deep/ .el-button {
        padding: 8px !important;
    }

    .el-icon-arrow-left,
    .el-icon-arrow-right {
        color: #555555 !important;
    }

    .total-num {
        margin: 0 10px;
        line-height: 30px;
    }
}

.lab-device-total {
    display: flex;
    margin-bottom: -20px;

    .session {
        padding-left: 0;
    }

    .total-card {
        width: 220px;
        //height: 300px;
        background: linear-gradient(90deg, #3762fc 0%, #5b9dff 100%);
        border-radius: 8px;
        padding: 10px 20px 20px 40px;
        overflow: hidden;
        display: flex;
        justify-content: space-between;
        margin: 20px 20px 20px 0;

        .float-left {
            flex: 1;

            .total-sum {
                margin-top: -10px;

                .num {
                    font-size: 32px !important;
                }
            }
        }

        .total-img {
            width: 65px !important;
            height: 65px;
            margin-top: 25px;

            .image {
                width: 100% !important;
                height: 100% !important;
                background-size: 80% !important;
                background-position: 10px;
                float: right;
            }
        }
    }

    .totality {
        width: 220px;
        background: url('../../assets/device/device-total.png') no-repeat;
        background-size: 100% 100%;
        color: @white;
        border-radius: 8px;
        position: relative;
        overflow: hidden;

        .total-title {
            font-size: 14px;
            line-height: 30px;
            margin-bottom: 10px;
        }

        .total-sum {
            .num {
                font-size: 40px;
                font-weight: 500;
                line-height: 30px;
                margin-right: 10px;
            }
        }

        .total-img {
            position: absolute;
            right: 20px;
            bottom: -10px;
            width: 100%;

            .image {
                float: right;
                width: 100px;
                height: 128px;
                background: url('../../assets/device/icon-total.png') no-repeat;
                background-size: 100% 100%;
            }
        }
    }

    .total-type {
        width: 100%;
        margin-bottom: 20px;

        .total-type-bottom {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            margin-bottom: -20px;
        }
    }
}
</style>
