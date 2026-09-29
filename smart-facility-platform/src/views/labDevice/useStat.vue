<template>
    <div class="use-stat">
        <div class="session">
            <SearchForm
                :formData.sync="items"
                @change="handleSearchFormChange"
                @buttonClick="handleSearchFormButtonClick"
                @handleChartDimension="handleChartDimension"
                :showExportBtn="true"
            />
            <self-table
                class="margin-center"
                ref="selfTable"
                :columns="tableColumns"
                :loading="loading"
                :page-sizes="$store.state.pageSizes"
                :page-size="items.pageSize"
                :page-num="items.pageNum"
                :tabledata="useStatList"
                :total="total"
                :height="'535px'"
                @pageNumChange="handlePageNumChange"
                @pageSizeChange="handlePageSizeChange"
            >
                <el-table-column
                    :label="$t('labDevice.labDeviceType')"
                    width="150"
                    slot="labDeviceType">
                    <template v-slot="{row}">
                        {{ row.typeNames.join("/") }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('common.owningDepartment')"
                    width="180"
                    slot="labDeviceType">
                    <template v-slot="{row}">
                        {{ row.deptNames.join("/") }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('labDevice.addressScreen')"
                    width="180"
                    slot="localName">
                    <template v-slot="{row}">
                        {{ row.localName.join("/") }}
                    </template>
                </el-table-column>
                <template #total>
                    <div class="flex collect">
                        {{ $t('labDevice.collect') }}：
                        <div class="mr30">
                            <span>{{ $t('labDevice.useTime1') }}：</span>
                            <span>{{ useTime }} {{ $t('labDevice.host') }}</span>
                        </div>
                        <div>
                            <span>{{ $t('statistics.labDeviceUserRate') }}：</span>
                            <span>{{ useRate }} %</span>
                        </div>
                    </div>
                </template>
            </self-table>
        </div>
    </div>
</template>

<script>
import SearchForm from "@/views/labDevice/components/SearchForm";
import {items, TIME_FORMAT} from "@/utils/constant";
import SelfTable from "@c/Table";
import dictMixin from "@/views/labDevice/mixin/dict.mixin";
import {getStatisticUseRate, getStatisticUseRateExport} from "@/api/statistic";
import moment from "moment";
import {exportUseRate} from "@/api/labDevice";
import mixin from "@/utils/mixin";
import {theOtherDay} from "@/utils/methods";
export default {
    name: "useStat",
    components: {
        SearchForm,
        SelfTable,
    },
    mixins:[dictMixin],
    data() {
        const _this = this;
        return {
            useStatList: [],
            total: 0,
            useTime: 0,
            useRate: 0,
            items: {
                typesListSelection: [],
                addressSelection: [], // 地理位置
                departmentSelection: [], // 部门
                floorIds: "",
                departmentIdList: [],
                managerIdList: [],
                dateType: 3,
                typesList: [],
                instrumentIdList: [],
                pageNum: items.PAGE_NUM,
                pageSize: items.PAGE_SIZE,
                endDate: "",
                startDate: "",
                gardenId: "",
                buildingId: "",
                dateRange: "",
                timeFlag: 0
            },
            loading: false,
        }
    },
    created() {
        const pageSize = localStorage.getItem("pageSize");
        if (pageSize) {
            this.items.pageSize = pageSize * 1;
        }
        this.handleUseStatList();
    },
    methods: {
        handleSearchFormChange(form) {
            if (form.prop === 'typesListSelection') {
                this.handleClassifyChange(form.data)
            } else if (form.prop === 'dateRange') {
                let [startDate, endDate] = [...(this.items.dateRange || [])]
                this.$set(this.items, 'startDate', startDate)
                this.$set(this.items, 'endDate', endDate)
            } else if (form.prop === 'addressSelection') {
                this.handleAddressChange(form.data)
            } else if (form.prop === 'departmentSelection') {
                this.handleDepartmentSelection(form.data)
            } else if (form.prop === 'timeFlag') {
                this.items.timeFlag = form.data;
            }
        },
        handleSearchFormButtonClick(type) {
            if (type === 'search') {
                this.items.pageNum = 1;
                this.handleUseStatList();
            } else if (type === 'refresh') {
                this.handleInit();
            } else if (type === 'export') {
                this.handleExport()
            }
        },
        handleUseRanKingDateType(e, type) {
            this.items.dateType = e;
            this.items.endDate = "";
            this.items.startDate = "";
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
        handleChartDimension(data) {
            this[data.callbackName] && this[data.callbackName](data.$event, data.type)
        },
        handleEquipmentData(e, type) {
            if (!e) {
                this.items.dateType = 3
                this.items.endDate = ''
                this.items.startDate = ''
            } else {
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
                typesListSelection: [],
                addressSelection: [], // 地理位置
                departmentSelection: [], // 部门
                floorIds: "",
                departmentIdList: [],
                managerIdList: [],
                dateType: 3,
                typesList: [],
                instrumentIdList: [],
                pageNum: items.PAGE_NUM,
                pageSize: items.PAGE_SIZE,
                endDate: "",
                startDate: "",
                gardenId: "",
                buildingId: "",
                dateRange: ""
            }
            const pageSize = localStorage.getItem("pageSize");
            if (pageSize) {
                this.items.pageSize = pageSize * 1;
            }
            this.handleUseStatList();
        },
        handlePageNumChange(val) {
            this.items.pageNum = val;
            this.handleUseStatList();
        },
        handlePageSizeChange(val) {
            this.items.pageSize = val;
            this.handleUseStatList();
        },
        handleUseStatList() {
            this.loading = true;
            const obj = JSON.parse(JSON.stringify(this.items));
            if (obj.dateType) {
                let date = 0;
                switch (obj.dateType) {
                    case 1:
                        date = 1;
                        break
                    case 2:
                        date = 7;
                        break
                    case 3:
                        date = 30;
                        break
                }
                const dateArr = theOtherDay(date);
                obj.endDate = dateArr[1];
                obj.startDate = dateArr[0];
                obj.dateType = "";
            }
            getStatisticUseRate(obj).then(res => {
                this.useStatList = [];
                if (res.code) {
                    this.useStatList = res.items.list;
                    this.total = res.items.total;
                    this.useTime = res.items?.useTime || 0;
                    this.useRate = res.items?.useRate || 0;
                } else {
                    this.$message.error(res.message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        async handleExport() {
            let instrumentUseRateV3Param = JSON.parse(JSON.stringify(this.items));
            delete instrumentUseRateV3Param.pageNum;
            delete instrumentUseRateV3Param.pageSize;
            if (instrumentUseRateV3Param.dateType) {
                let date = 0;
                switch (instrumentUseRateV3Param.dateType) {
                    case 1:
                        date = 1;
                        break
                    case 2:
                        date = 7;
                        break
                    case 3:
                        date = 30;
                        break
                }
                const dateArr = theOtherDay(date);
                instrumentUseRateV3Param.endDate = dateArr[1];
                instrumentUseRateV3Param.startDate = dateArr[0];
                instrumentUseRateV3Param.dateType = "";
            }
            this.$message.warning(this.$t('common.exportMessage'));
            try {
                await getStatisticUseRateExport(instrumentUseRateV3Param).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('statistics.labDeviceUserStatExport') + data, "UTF-8")
                    )
                })
            } catch (e) {
                this.$message.warning(this.$t('common.notMessage1'));
            }
        }
    }
}
</script>

<style lang="less" scoped>
.session {
    position: relative;
}
.collect {
    margin-top: 20px;
    margin-bottom: -20px;
    .mr30 {
        margin-right: 30px;
    }
}
</style>
