<template>
    <div class="session">
        <el-form class="search-form" style="display: flex;justify-content: space-between;align-items: center" label-width="auto" label-position="right" @submit.native.prevent>
            <div class="flex" style="align-items: center">
                <el-form-item>
                    <el-input v-model="filter.condition.costPhone"
                              :placeholder="$t('system.inputCostPhone')"
                              class="w200 margin-small-right"
                              @keyup.enter.native="handelFilter"
                              oninput="value=value.replace(/[^10-9]/g, '')"/>
                </el-form-item>
                <el-form-item>
                    <el-select  class="w200 margin-small-right"
                               v-model="filter.condition.userId"
                               @change="handelFilter"
                               collapse-tags
                               multiple
                               filterable
                               remote
                               :reserve-keyword="true"
                               :placeholder="$t('system.inputUserId')"
                               :remote-method="toSearchUsers"
                               :loading="searchUsers.loading">
                        <el-option
                            v-for="user in searchUsers.all"
                            :key="user.id"
                            :label="user.loginId +'（'+user.name+'）'"
                            :value="user.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select class="w200 margin-small-right" v-model="filter.condition.costType">
                        <el-option :value="null" :label="$t('common.all')"/>
                        <el-option :value="1" :label="$t('system.sms')"/>
                        <el-option :value="2" :label="$t('system.phone')"/>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-date-picker
                        class="select-change"
                        type="datetimerange"
                        :end-placeholder="$t('common.endDate')"
                        :range-separator="$t('common.most')"
                        :start-placeholder="$t('common.startDate')"
                        clearable
                        v-model="dateRange"/>
                </el-form-item>
            </div>
            <div class="mb-20">
                <el-button @click="resetFilterCondition">{{ $t('labDevice.reset') }}</el-button>
                <el-button type="primary"
                           icon="icon-search1"
                           @click="handelFilter">{{ $t('system.search') }}
                </el-button>
            </div>
        </el-form>
        <el-table
            stripe
            show-summary
            :summary-method="getSummeries"
            @sort-change="handelSortChang"
            border
            :data="dataList"
            v-loading="loading"
            :header-cell-class-name="headerCellClassName">
            <el-table-column type="index" width="70px" label="#"/>
            <el-table-column prop="costPhone" :label="$t('system.costPhone')" sortable="custom">
                <template v-slot="{row}">
                    <div v-html="handlePhoneColor(row.costPhone)"></div>
                </template>
            </el-table-column>
            <el-table-column prop="costType" :label="$t('system.costType')">
                <template v-slot="{row}">{{ handleInformType(row.costType) }}</template>
            </el-table-column>
            <el-table-column prop="loginId" :label="$t('system.userId')" sortable="custom"/>
            <el-table-column prop="costDate" :label="$t('system.costDate')" sortable="custom">
                <template v-slot="{row}">
                    {{ row.costDate | localToUtc }}
                </template>
            </el-table-column>
            <el-table-column prop="costSize" :label="$t('system.costSize')" sortable="custom" width="120px">
                <template v-slot="{row}">
                    <span>
                        {{ row.costType===2 ? Math.ceil(row.costSize / 60) + $t('common.minute') : row.costSize + $t('system.cost') }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="costMoney" :label="$t('system.costMoney')" sortable="custom" width="120px">
                <template v-slot="{row}">{{ row.costMoney / 100 }}{{ $t('labDevice.yuan') }}</template>
            </el-table-column>
        </el-table>
        <div class="paging">
            <Pagination
                v-show="filter.total"
                :total="filter.total"
                :page.sync="filter.pageNum"
                :limit.sync="filter.pageSize"
                @pagination="getList"
            />
        </div>
    </div>
</template>

<script>
import {fuzzyQueryaliyunCostReportLog} from "@/api/aliyunCostReportLog/index"
import {miniListUser} from "@/api/user";
import Pagination from "@/components/Pagination"

export default {
    name: "aliyunCostReportLog",
    components: {
        Pagination
    },
    data() {
        return {
            loading: false,
            dataList: [],
            pageMoney: 0,
            searchUsers: {
                all: [],
                loading: false,
            },
            dateRange: "",
            filter: {
                // 分页信息
                pageNum: 1,
                pageSize: 10,
                total: 0,
                //条件的列表
                condition: {
                    costPhone: '',
                    startDate: null,
                    endDate: null,
                    costType: null,
                    userId: [],
                },
                orders: [
                    {
                        column: 'costPhone',
                        isDesc: null,
                    },
                    {
                        column: 'loginId',
                        isDesc: null,
                    },
                    {
                        column: 'costDate',
                        isDesc: null,
                    },
                    {
                        column: 'costSize',
                        isDesc: null,
                    },
                    {
                        column: 'costMoney',
                        isDesc: null,
                    },
                ]
            },
        }
    },
    created() {
        this.getList();
    },
    methods: {
        getList() {
            if (!(Object.prototype.toString.call(this.dateRange) === '[object Array]' && this.dateRange.length)) {
                this.filter.condition.startDate = this.filter.condition.endDate = null;
            } else {
                this.filter.condition.startDate = this.dateRange[0];
                this.filter.condition.endDate = this.dateRange[1];
            }
            this.loading = true;
            fuzzyQueryaliyunCostReportLog(this.filter).then(res => {
                this.loading = false;
                if (res.code) {
                    this.filter.total = res.items.total;
                    this.pageMoney = 0;
                    res.items.list.forEach(data => {
                        this.pageMoney += data.costMoney;
                    })
                    this.dataList = res.items.list;
                } else {
                    this.$message.error(res.message);
                }
            }).catch(e => {
                this.loading = false;
            })
        },
        resetFilterCondition() {
            this.filter.condition = {
                costPhone: '',
                startDate: null,
                endDate: null,
                costType: null,
            }
            this.dateRange = [];
        },
        getSummeries(param) {
            const {columns, data} = param;
            const sums = [];
            sums[columns.length - 1] = this.pageMoney / 100 + this.$t('labDevice.yuan');
            sums[columns.length - 2] = this.$t('system.moneyNum') + ":";
            return sums;
        },
        handelSortChang(col) {
            this.filter.orders.forEach(fOrder => {
                if (fOrder.column === col.prop) {
                    if (col.order === "descending") {
                        fOrder.isDesc = true;
                    } else if (col.order === "ascending") {
                        fOrder.isDesc = false;
                    } else {
                        fOrder.isDesc = null;
                    }
                }
            })
            this.handelFilter();
        },
        headerCellClassName(item) {
            this.filter.orders.forEach(order => {
                if (order.column === item.column.property) {
                    if (order.isDesc === null) {
                        item.column.order = '';
                    } else {
                        item.column.order = order.isDesc ? 'descending' : 'ascending';
                    }
                }
            })
        },
        handelFilter() {
            this.filter.pageNum = 1
            this.getList();
        },
        toSearchUsers(keyword) {
            this.searchUsers.loading = true;
            miniListUser({keyword}).then(res => {
                this.searchUsers.loading = false;
                if (res.code) {
                    this.searchUsers.all = res.items;
                } else {
                    this.$message.error(res.message);
                }
            }).catch(e => {
                this.searchUsers.loading = false;
            })
        },
        handleInformType(value) {
            let str = "";
            switch (value) {
                case 1:
                    str = this.$t('system.sms')
                    break
                case 2:
                    str = this.$t('system.phone')
                    break
            }
            return str;
        },
        handlePhoneColor(value) {
            let start = "";
            let center = this.filter.condition.costPhone;
            let end = "";
            if (center) {
                const arr = value.split(center);
                start = arr[0].toString();
                end = arr[1].toString();
                return "<div>"+ start + "<span style=\"color:#00C5FD\">"+center+"</span>"+ end +"</div>"
            }
            return "<div>"+ value +"</div>"
        }
    },
}
</script>

<style scoped>

.foot-count {
    text-align: right;
    margin-top: 10px;
    margin-bottom: 10px;
}

.foot-count span {
    display: inline-block;
    text-align: center;
}

.search-form span {
    display: inline-block;
    margin-bottom: 20px;
    margin-right: 40px;
}

.mb-20 {
    margin-bottom: 20px;
}

.w200 {
    width: 200px !important;
}
</style>
