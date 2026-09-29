<!-- 设备使用率月度统计 -->
<template>
    <div class="session">
        <div class="search-bar-container">
            <div>
                <el-cascader
                    ref="device"
                    v-model="types"
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
                    class="margin-small-right"
                ></el-cascader>
                <el-date-picker
                    type="monthrange"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')"
                    value-format="yyyy-MM-dd"
                    class="margin-small-right"
                    v-model="time"
                    :picker-options="pickerOptions"
                    @change="handleSelectTime"/>
                <el-button
                    icon="icon-search1"
                    class="ml-10"
                    type="primary"
                    @click="handleButtonClick('search')">
                </el-button>
                <el-button class="icon-reset" @click="handleButtonClick('reset')"></el-button>
            </div>
            <div>
                <el-button v-if="$store.state.level" class="icon-download1" @click="handleExport">
                    {{ $t('common.export') }}
                </el-button>
            </div>
        </div>

        <div class="margin-center">
            <el-table
                :data="tableData"
                border
                style="width: 100%"
                v-loading="isLoading">
                <el-table-column
                    prop="typeName"
                    :label="$t('labDevice.labDeviceType')"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="departmentName"
                    :label="$t('common.owningDepartment')"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="deviceModel"
                    align="center"
                    :label="$t('other.naturalDay')">
                    <template v-for="item in nColumns">
                        <el-table-column :key="item.prop" :prop="item.prop" :label="item.label"/>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="deviceModel"
                    align="center"
                    :label="$t('other.workDay')">
                    <template v-for="item in wColumns">
                        <el-table-column :key="item.prop" :prop="item.prop" :label="item.label"/>
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
                @pagination="handleQuery()"/>
        </div>
    </div>
</template>

<script>
import {
    exportInstrumentMonthlyStatistics,
    getInstrumentCategoryInfoList,
    postInstrumentMonthlyStatistics
} from "../../api/labDevice";
import Pagination from "@/components/Pagination/index";
import {MONTHS} from "../../utils/constant";
import moment from "moment";
import mixin from "@/utils/mixin";

export default {
    name: "index",
    components: {
        Pagination
    },
    data() {
        const _this = this;
        return {
            deviceOptions: [],
            time: [],
            items: {
                pageNum: 1,
                pageSize: 10
            },
            total: 0,
            types: [],
            tableData: [],
            nColumns: [],
            wColumns: [],
            isLoading: false,
            minDate: null,
            maxDate: null,
            pickerOptions: {
                disabledDate: (time) => {
                    if (this.minDate !== null && this.maxDate === null) {
                        let minMonth = this.minDate.getMonth(),
                            lastYear = new Date(this.minDate).setMonth(minMonth - 5),
                            nextYear = new Date(this.minDate).setMonth(minMonth + 5);
                        let minTime = this.minDate.getTime()
                        let nextTime = new Date().setMonth(new Date().getMonth() + 5)
                        let lastTime = new Date().setMonth(new Date().getMonth() - 5)
                        if (minTime <= nextTime || minTime >= lastTime){
                            //开始日期少于当前月+6个月 并且大于当前月-6个月，则表示只限制前面的范围
                            return time.valueOf() > new Date().getTime() || time.valueOf() > nextYear.valueOf() || time.valueOf() < lastYear.valueOf();
                        } else {
                            // 只能选 minDate 前后一年的范围
                            return time.valueOf() < lastYear.valueOf() || time.valueOf() > nextYear.valueOf();
                        }
                    }else {
                        let startMonth = _this.minDate;
                        let month = new Date(startMonth).getMonth()
                        let lastMonth = new Date(startMonth).setMonth(month - 5)
                        //如果有默认值，只禁用开始日期，因为已经限定了禁用未来范围，且默认值已经为12个月范围
                        return _this.monthPick(time) || time < lastMonth.valueOf();
                    }
                },
                onPick: ({minDate, maxDate}) => {
                    this.minDate = minDate;
                    this.maxDate = maxDate;
                },
            }
        }
    },
    created() {
        this.queryAllDeviceType();
    },
    methods: {
        handleQuery() {
            this.getList();
        },
        getList() {
            console.log(this.types)
            if (this.types.length === 0) {
                this.$message.error(this.$t('labDevice.selectLabDeviceType'));
                return;
            }
            if (this.time.length === 0) {
                this.$message.error(this.$t('common.selectDateScope'));
                return;
            }
            const params = this.handleParams();
            this.isLoading = true;
            postInstrumentMonthlyStatistics(params).then(res => {
                if (res.code === 1) {
                    this.tableData = res.items?.result;
                    this.nColumns = this.handleColumn(res.items?.columns1);
                    this.wColumns = this.handleColumn(res.items?.columns2);
                    this.total = res.items?.total;
                }
            }).finally(() => {
                this.isLoading = false;
            })
        },
        handleParams() {
            const types = [];
            this.$refs.device.getCheckedNodes().forEach(item => {
                types.push(item.value);
            })
            return {
                types,
                startDate: this.time[0] + " 00:00:00",
                endDate: this.time[1] + " 23:59:59",
                pageNum: this.items.pageNum,
                pageSize: this.items.pageSize
            };
        },
        handleExport() {
            if (this.types.length === 0) {
                this.$message.error(this.$t('labDevice.selectLabDeviceType'));
                return;
            }
            if (this.time.length === 0) {
                this.$message.error(this.$t('common.selectDateScope'));
                return;
            }
            const params = this.handleParams();
            new Promise(resolve => {
                this.$message.warning(this.$t("common.exportMessage"));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                exportInstrumentMonthlyStatistics(params).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t("labDevice.deviceUseRateMonth") + data, "UTF-8")
                    )
                })
            })
        },
        handleColumn(columns) {
            const column = [];
            columns.map(item => {
                const index = item.split("-")[1] - 1;
                column.push({
                    label: MONTHS[index].name,
                    prop: item,
                })
            })
            return column;
        },
        monthPick(time){
            // 获取当前的月份信息
            const date = new Date() // 获取当前的时间基本信息，值是这样的： Tue Jul 20 2021 14:59:43 GMT+0800 (中国标准时间)
            const year = date.getFullYear() // 获取当前年份，值是这样的： 2021
            let month = date.getMonth() + 1 // 获取当前月份，值是这样的： 6   getMonth()方法返回值是0-11，也就是1月份到12月份，所以要加上1，才是当前月份
            if (month >= 1 && month <= 9) {
                // 如果是1月到9月就要在前面补上一个0   比如：02、07    月份这样表示
                month = '0' + month
            }
            const nowDate = year.toString() + month.toString() // 转换成字符串拼接，最终得到年和月，比如此时的时间是2021年7月20号，所以nowDate的值是：202107

            // 获取时间选择器的月份信息
            const timeyear = time.getFullYear() // 获取时间选择器的年份（有很多）
            let timemonth = time.getMonth() + 1 // 与上面同理
            if (timemonth >= 1 && timemonth <= 9) {
                timemonth = '0' + timemonth
            }
            const elTimeData = timeyear.toString() + timemonth.toString()

            // 返回，时间选择器的日期月份大于当前日期的月份，又因为disabledDate函数是控制月份禁用不可选
            // 所以，最终就是：时间选择器的月份大于当前的月份，就都禁用掉，所以就实现了最终效果：
            // 大于等于当前月份都不可选
            return elTimeData > nowDate // 这里虽然是字符串，但是弱类型语言js会做一个转换，是可以比较大小的如： '202107' > '202008'
        },
        handleSelectTime(e) {
            this.time = e;
        },
        handleButtonClick(type) {
            if (type === 'search') {
                this.getList();
            } else if (type === 'reset') {
                this.time = [];
                this.types = [];
                this.items.pageNum = 1;
                this.items.pageSize = 10;
                this.tableData = [];
                this.$nextTick(() => {
                    // 清空级联选择器选中状态
                    this.$refs.device.$refs.panel.clearCheckedNodes()
                    // 清除⾼亮
                    this.$refs.device.$refs.panel.activePath = []
                })
            }
        },
        async queryAllDeviceType() {
            await getInstrumentCategoryInfoList().then(res => {
                if (res.items && res.items.length) {
                    this.deviceOptions = this.handleAssetClassifyOptions(res.items)
                }
            })
        },
        handleAssetClassifyOptions(list) {
            list.forEach((item) => {
                if (item?.childrenList && Array.isArray(item.childrenList)) {
                    if (!item.childrenList.length) {
                        delete item.childrenList
                    } else {
                        this.handleAssetClassifyOptions(item.childrenList)
                    }
                }
            })
            return list
        },
    },
}
</script>

<style scoped>

</style>
