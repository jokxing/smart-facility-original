<template>
    <div>
        <div class="session">
            <el-radio-group v-model="item.queryType" @input="handleTags">
                <el-radio-button label="0">{{ $t('other.department') }}</el-radio-button>
                <el-radio-button label="1">{{ $t('other.deviceType') }}</el-radio-button>
            </el-radio-group>
            <div class="flex margin-center">
                <span>{{ $t('other.statistics') }}：</span>
                <el-cascader
                    v-if="item.queryType == 0"
                    ref="department"
                    :options="departmentData"
                    :props="{
                            multiple: true,
                            checkStrictly: true,
                            children: 'subDivisions',
                            label: 'name',
                            value: 'id'
                          }"
                    :placeholder="$t('common.owningDepartment')"
                    collapse-tags
                    clearable
                    @visible-change="handleBlur($event, 'department')"
                    @change="handleChange($event, 'department')"
                    @remove-tag="removeTag($event, 'department')"
                    class="margin-small-right"
                ></el-cascader>
                <el-cascader
                    v-else
                    ref="device"
                    :options="deviceOptions"
                    :props="{
                            multiple: true,
                            checkStrictly: true,
                            children: 'childrenList',
                            label: 'name',
                            value: 'types'
                          }"
                    :placeholder="$t('labDevice.labDeviceType')"
                    collapse-tags
                    clearable
                    @visible-change="handleBlur($event, 'device')"
                    @remove-tag="removeTag($event, 'device')"
                    class="margin-small-right"
                ></el-cascader>
                <el-date-picker
                    type="datetimerange"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    class="margin-small-right"
                    :picker-options="pickerOptions"
                    v-model="time"
                    @change="handleSelectTime"/>
                <el-button
                    :type="item.timeFlag == 0 ? 'primary' : ''"
                    @click="item.timeFlag = 0"
                    class="margin-small-right">{{ $t('common.naturalDay') }}
                </el-button>
                <el-button
                    type="primary"
                    @click="item.timeFlag = 1"
                    :type="item.timeFlag == 1 ? 'primary' : ''"
                    class="margin-small-right ml-10">{{ $t('common.workday') }}
                </el-button>
                <el-button
                    icon="icon-search1"
                    class="ml-10"
                    type="primary"
                    @click="handleButtonClick('search')">
                </el-button>
                <el-button class="icon-reset" @click="handleButtonClick('refresh')"></el-button>
            </div>
            <ve-histogram
                v-loading="chartsLoading"
                :data="dataCharts"
                :extend="options"
                v-if="dataCharts.rows.length > 0"
                :settings="settings"/>
            <data-empty height="400px" v-else></data-empty>
            <div v-if="tableData.length > 0">
                <el-row type="flex" justify="end">
                    <el-button
                        @click="handleExport('department')">{{ $t('common.export') }}
                    </el-button>
                </el-row>
                <el-table
                    class="margin-center"
                    :data="tableData"
                    border
                    v-loading="tableLoading"
                    style="width: 100%">
                    <el-table-column
                        v-for="item in columns"
                        :prop="item.key"
                        :width="item.width"
                        :align="item.align"
                        :label="item.title">
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script>
import VeHistogram from 'v-charts/lib/histogram'
import {getInstrumentCategoryInfoList} from "@/api/labDevice";
import DataEmpty from "@/components/DataEmpty";
import {
    getStatisticInstrumentGradedStatistics,
    getStatisticInstrumentGradedStatisticsTable,
    getStatisticInstrumentGradedStatisticsTableExport
} from "@/api/statistic";
import {postUserExport} from "@/api/user";
import mixin from "@/utils/mixin";
import moment from "moment";
import {theOtherDay} from "@/utils/methods";

export default {
    name: "useStatCharts",
    components: {
        VeHistogram,
        DataEmpty
    },
    data() {
        const _this = this;
        return {
            pickerOptions: {
                shortcuts: [{
                    text: _this.$t('common.recentlyWeek'),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: _this.$t('common.recentlyMonth'),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: _this.$t('common.recentlyThreeMonth'),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
            options: {
                legend: {
                    show: true,
                    position: 'bottom',
                    bottom: 0,
                },
                series: {
                    type: 'bar',
                    // 设置柱状图的宽度
                    barWidth: 30,
                }
            },
            dataCharts: {
                columns: [],
                rows: []
            },
            settings: {
                stack: {
                    'xxx': []
                },
            },
            tabPosition: "department",
            item: {
                queryType: 0,
                startDate: null,
                endDate: null,
                deptIds: [],
                types: [],
                timeFlag: 0,
            },
            departmentIds: [],
            deviceOptions: [],
            types: [],
            time: [],
            tableData: [],
            columns: [
                {
                    title: "",
                    key: "name",
                    width: 100,
                    align: "center"
                },
                {
                    title: _this.$t('other.lessThan') + "10%",
                    key: "department1",
                    align: "center"
                },
                {
                    title: "10%~20%（"+ _this.$t('other.contain') +"）",
                    key: "department2",
                    align: "center"
                },
                {
                    title: "20%~30%（"+ _this.$t('other.contain') +"）",
                    key: "department3",
                    align: "center"
                },
                {
                    title: "30%~40%（"+ _this.$t('other.contain') +"）",
                    key: "department4",
                    align: "center"
                },
                {
                    title: "40%~50%（"+ _this.$t('other.contain') +"）",
                    key: "department5",
                    align: "center"
                },
                {
                    title: "50%~60%（"+ _this.$t('other.contain') +"）",
                    key: "department6",
                    align: "center"
                },
                {
                    title: "60%~70%（"+ _this.$t('other.contain') +"）",
                    key: "department7",
                    align: "center"
                },
                {
                    title: "70%~80%（"+ _this.$t('other.contain') +"）",
                    key: "department8",
                    align: "center"
                },
                {
                    title: "80%~90%（"+ _this.$t('other.contain') +"）",
                    key: "department9",
                    align: "center"
                },
                {
                    title: "90%~100%（"+ _this.$t('other.contain') +"）",
                    key: "department10",
                    align: "center"
                },
                {
                    title: _this.$t('other.moreThan') +"100%",
                    key: "department11",
                    align: "center"
                },
            ],
            chartsLoading: false,
            tableLoading: false,
        }
    },
    created() {
        // time最近一个月时间戳
        this.time = theOtherDay(30);
        this.item.startDate = this.time[0];
        this.item.endDate = this.time[1];
        this.queryAllDeviceType();
        this.handleSearch();
    },
    computed: {
        departmentData() {
            let departments = []
            const traverse = (array, _proto) => {
                let am = array.map((arr) => {
                    if (arr[_proto] && arr[_proto].length && arr[_proto].length > 0) {
                        traverse(arr[_proto], _proto);
                    } else if (Array.isArray(arr[_proto]) && !arr[_proto].length > 0) {
                        delete arr[_proto]
                    }
                    arr.id = arr["id"].toString();
                });
                return array;
            };
            departments = JSON.parse(JSON.stringify(this.$store.state.departments));
            return traverse(departments, "subDivisions");
        }
    },
    methods: {
        async queryAllDeviceType() {
            await getInstrumentCategoryInfoList().then(res => {
                if (res.items && res.items.length) {
                    this.deviceOptions = this.handleAssetClassifyOptions(res.items)
                }
            })
        },
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
        handleTags() {
            this.item.startDate = null;
            this.item.endDate = null;
            this.item.deptIds = [];
            this.item.types = [];
            this.item.timeFlag = 0;
            this.departmentIds = [];
            this.types = [];
            this.dataCharts.columns = [];
            this.dataCharts.rows = [];
            this.time = [];
            this.settings.stack = {
                'xxx': []
            };
        },
        handleSelectTime(val) {
            // 为空
            if (!val) {
                this.item.startDate = null;
                this.item.endDate = null;
            } else {
                this.item.startDate = val[0];
                this.item.endDate = val[1];
            }
        },
        handleButtonClick(type) {
            switch (type) {
                case 'search':
                    this.handleSearch()
                    break
                case 'refresh':
                    this.handleRefresh()
                    break
            }
        },
        handleSearch() {
            this.getChart();
            this.getTable();
        },
        handleBlur(e, type) {
            let node = this.$refs[type].getCheckedNodes();
            let array = [];
            node.map((item) => {
                if (item?.parent?.indeterminate) {
                    array.push(item.parent.value);
                }
                array.push(item.value);
            })
            if (type === 'department') {
                this.item.deptIds = array;
            } else if (type === 'device') {
                this.item.types = array;
            }
        },
        removeTag(item, type) {
            const val = item[item.length - 1];
            if (type === 'department') {
                this.item.deptIds.splice(this.item.deptIds.indexOf(val), 1);
            } else if (type === 'device') {
                this.item.types.splice(this.item.types.indexOf(val), 1);
            }
        },
        handleChange(e, type) {
            if (type === 'department' && e.length === 0) {
                this.item.deptIds = [];
            } else if (type === 'device' && e.length === 0) {
                this.item.types = [];
            }
        },
        handleRefresh() {
            this.item = {
                queryType: 0,
                startDate: null,
                endDate: null,
                deptIds: [],
                types: [],
                timeFlag: 0,
            }
            this.departmentIds = [];
            this.types = [];
            this.getChart();
            this.getTable();
        },
        handleExport() {
            getStatisticInstrumentGradedStatisticsTableExport(this.item).then(res => {
                new Promise(resolve => {
                    this.$message.warning(this.$t('common.exportMessage'));
                    setTimeout(() => {
                        resolve();
                    }, 2500)
                }).then(() => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    const text = this.item.queryType == 0 ? this.$t('route.equipmentUseGrade') + this.$t('common.department'): this.$t('route.equipmentUseGrade') + this.$t('labDevice.classify');
                    mixin.methods.download(
                        res,
                        decodeURIComponent(text + data, "UTF-8")
                    )
                })
            })
        },
        // 获取图表
        getChart() {
            this.chartsLoading = true;
            getStatisticInstrumentGradedStatistics(this.item).then(res => {
                if (res.code) {
                    if (res.items.columns.length <= 1) {
                        this.dataCharts.columns = [];
                        this.dataCharts.rows = [];
                    } else {
                        this.dataCharts.columns = res.items.columns;
                        this.settings.stack['xxx'] = res.items.columns.map((item) => {
                            if (item !== 'range') {
                                return item
                            }
                        })
                        this.dataCharts.rows = res.items.result
                    }
                } else {
                    this.dataCharts.rows = [];
                    this.$message.error(res.message)
                }
            }).finally(() => {
                this.chartsLoading = false;
            })
        },
        // 获取表格
        getTable() {
            this.tableLoading = true;
            getStatisticInstrumentGradedStatisticsTable(this.item).then(res => {
                if (res.code) {
                    this.tableData = res.items.result.map((item) => {
                        let obj = {};
                        for (let key in item) {
                            if (key !== 'name') {
                                obj['department' + key] = item[key]
                            } else {
                                obj[key] = item[key]
                            }
                        }
                        return obj
                    })
                } else {
                    this.tableData = [];
                    this.$message.error(res.message)
                }
            }).finally(() => {
                this.tableLoading = false;
            })
        },
    }
}
</script>

<style lang="less" scoped>
.ml-10 {
    margin-left: 0;
}
</style>
