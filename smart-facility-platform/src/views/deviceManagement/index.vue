<template>
    <div class="instrument-box">
        <div class="instrument" v-loading="refreshLoading">
            <div class="equipmentStatus session">
                <SearchForm
                    :formData="items"
                    @change="handleSearchFormChange"
                    @buttonClick="handleSearchFormButtonClick"
                    @handleChartDimension="handleChartDimension"
                    :showExportBtn="true"
                />
            </div>
            <UseRateChart ref="useRateChartRef" :queryParams="items"/>
            <div class="equipmentStatus session">
                <!-- 负责人维度统计使用率 -->
                <ChargePersonChart ref="chargePersonChartRef" :queryParams="items"/>
            </div>
            <div class="equipmentStatus session">
                <!-- 负责人维度统计使用率 -->
                <DepartmentUsageChart ref="departmentUsageChart" class="mt16" :queryParams="items"/>
                <!-- 房间维度统计使用率 -->
            </div>
            <div class="equipmentStatus session">
                <RoomUsageChart ref="roomUsageChart" class="mt16" :queryParams="items"/>
            </div>
        </div>
    </div>
</template>

<script>
import RectangleTreeChart from '@/components/RectangleTreeChart'
import {getInstrumentDashboardNew, exportUseRate} from '@/api/labDevice'
import {items, STATUS_VALUE, ASSETTAGSTATUS, TIME_FORMAT} from '@/utils/constant'
import mixin from '@/utils/mixin'
import moment from 'moment'
import SearchForm from '@/views/labDevice/components/SearchForm.vue'
import dictMixin from './mixin/dict.mixin'
import UseRateChart from "@/views/labDevice/components/charts/UseRateChart";
import ChargePersonChart from "@/views/labDevice/components/charts/ChargePersonChart";
import DepartmentUsageChart from "@/views/labDevice/components/charts/DepartmentUsageChart";
import RoomUsageChart from "@/views/labDevice/components/charts/RoomUsageChart";

const useItems = {
    dateType: 3, // 1---当日 2---本周 3---本月
    endDate: '',
    pageNum: 1,
    pageSize: 8,
    startDate: '',
    subType: 3,
    thingsIdList: [],
    type: 1, // 1---按设备类型 2---按设备
    useRateSet: 1, // 1---按工作日 2---自然日 3---时段
    start: '',
    end: ''
}

export default {
    name: 'DeviceManagement',
    components: {
        RectangleTreeChart,
        SearchForm,
        UseRateChart,
        ChargePersonChart,
        DepartmentUsageChart,
        RoomUsageChart
    },
    mixins: [dictMixin],
    data() {
        return {
            items: {
                ...useItems,
                typesList: [], // 设备类型
                typesListSelection: [],
                addressSelection: [], // 地理位置
                departmentSelection: [], // 部门
                instrumentIdList: [], // 设备ids
                buildingId: '',
                categoryId: '',
                floorId: '',
                gardenId: '',
                keyword: '',
                managerId: '',
                monitorStatus: '',
                pageNum: 1,
                pageSize: 8,
                roomIdList: [],
                statusList: [],
                departmentId: '',
                type: 4,
                dateRange: '' // 创建时间
            },
            refreshLoading: false,
        }
    },
    created() {
        this.$nextTick(() => {
            this.init()

        })
        // 地理位置数据
        // this.handleGetMapGardenList()
    },
    updated() {
    },
    methods: {
        // 导出
        async handleExport() {
            let instrumentUseRateV3Param = JSON.parse(JSON.stringify(this.items))
            delete instrumentUseRateV3Param.pageNum
            delete instrumentUseRateV3Param.pageSize
            this.$message.warning(this.$t('common.exportMessage'));
            try {
                await exportUseRate(instrumentUseRateV3Param).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('labDevice.useRateExport') + data, "UTF-8")
                    )
                })
            } catch (e) {
                this.$message.warning(this.$t('common.notMessage1'));
            }
        },
        handleSearchFormChange(form) {
            if (form.prop === 'typesListSelection') {
                this.handleClassifyChange(form.data)
            } else if (form.prop === 'addressSelection') {
                this.handleAddressChange(form.data)
            } else if (form.prop === 'departmentSelection') {
                this.handleDepartmentSelection(form.data)
            }
        },
        // 监听部门变化
        handleDepartmentSelection(data) {
            this.$set(this.items, 'departmentIdList', data.allMinDep)
        },
        // 筛选表单按钮点击事件
        handleSearchFormButtonClick(type) {
            if (type === 'search') {
                this.init()
                // this.handleQuery()
            } else if (type === 'refresh') {
                this.handleInit()
            } else if (type === 'export') {
                this.handleExport()
            }
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
        // 监听日期组件变化
        handleChartDimension(data) {
            this[data.callbackName] && this[data.callbackName](data.$event, data.type)
        },
        handleTimeFrame(item) {
            this.items.start = item.start
            this.items.useRateSet = item.periodType
            this.items.end = item.end
        },
        init() {
            this.$refs.useRateChartRef && this.$refs.useRateChartRef.handleChartData()
            this.$refs.chargePersonChartRef && this.$refs.chargePersonChartRef.queryChartData()
            this.$refs.departmentUsageChart && this.$refs.departmentUsageChart.queryChartData()
            this.$refs.roomUsageChart && this.$refs.roomUsageChart.queryChartData()
        },
        // 时间维度
        handleUseRanKingDateType(e, type) {
            this.items.dateType = e
            this.items.endDate = ''
            this.items.startDate = ''
            this.changeChartPageNum(1)

        },
        // 筛选表单变化之后，要修改每个图表的pageNum
        changeChartPageNum(pageNum) {
            this.$refs.useRateChartRef && this.$refs.useRateChartRef.changePageNum(pageNum)
        },
        // 自定义时间
        handleEquipmentData(e, type) {
            if (!e) {
                this.items.dateType = 3
                this.items.endDate = ''
                this.items.startDate = ''
            } else {
                this.changeChartPageNum(1)
                this.items.dateType = ''
                this.items.endDate = moment(e[1]).format(
                    TIME_FORMAT
                )
                this.items.startDate = moment(e[0]).format(
                    TIME_FORMAT
                )
            }
        },
        handleInit() {
            this.items = {
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
                pageSize: 8,
                roomIdList: [],
                sensorStatus: '',
                status: '',
                statusList: [],
                departmentId: '',
                type: 4,
                dateType: 3
            }
        }
    },
    watch: {
        $route(to, from) {
            document.getElementsByClassName('main-container')[0].scrollTop = 0
            window.scrollTo(0, 0)
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

        .w160 {
            width: 160px !important;
        }

        .w215 {
            width: 215px !important;
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
        height: 90px;
        margin-bottom: 85px;

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
        background-size: 100% 100%;
        background-repeat: no-repeat;

        .type-list-num-total {
            margin-left: 60px;

            .num {
                font-size: 30px;
                font-weight: 500;
                line-height: 30px;
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
    justify-content: end;

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
        height: 300px;
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

.device-select /deep/ .el-cascader__search-input {
    background: transparent;
}
</style>
