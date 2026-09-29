<template>
    <div v-loading="loading" :element-loading-text="loadingText"
         class="hardware-home">
        <div class="session">
            <device-total
                :is-home="true"
                :is-type="true"
                ref="deviceTotal"
                :object="totalObject"
                @change="handleQueryDeviceType"
                @handle="handleQuery"
                @handleAll="handleQueryDeviceType"/>
        </div>
        <div class="session">
            <div class="search-bar-container">
                <div>
                    <SelectDepartment
                        :departmentId.sync="items.departmentId"
                        :select-tree-value.sync="items.departmentId"
                        @change="getValue"/>
                    <el-input
                        v-model.trim="items.keyword"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('common.inputKeyword')"
                        @keyup.enter.native="handleQuery(items.equipmentType, items.deviceType)">
                        <el-button
                            slot="append"
                            class="el-button-host"
                            icon="icon-search1"
                            @click="handleQuery(items.equipmentType, items.deviceType)">
                        </el-button>
                    </el-input>
                </div>
            </div>
            <device-table
                :device="device"
                :items="items"
                :total="total"
                :type="true"
                @columnsort="sortChange"/>
            <div class="paging">
                <pagination
                    v-show="total > 10"
                    :limit.sync="items.pageSize"
                    :page.sync="items.pageNum"
                    :total="total"
                    :page-sizes="$store.state.pageSizes"
                    @pagination="getList"/>
            </div>
        </div>
    </div>
</template>

<script>
import DeviceTable from "@c/DeviceTable";
import SelectDepartment from "@c/SelectdePartment";
import {items} from "@/utils/constant";
import DeviceTotal from "@c/DeviceTotal/index";
import {getEquipmentSortList} from "@/api/device";
import Pagination from "@c/Pagination/index";

export default {
    name: "HardwareHome",
    components: {
        DeviceTable,
        SelectDepartment,
        DeviceTotal,
        Pagination,
    },
    data() {
        const _this = this;
        return {
            items: {
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM,
                status: 0,
                departmentId: null,
                deviceType: 0,
                equipmentType: null
            },
            device: [],
            total: 0,
            loading: false,
            loadingText: _this.$t('common.hintDefault'),
            totalObject: {
                deviceType: [
                    {code: 0, name: "全部", count: 0},
                    {code: 1, name: "温湿度", count: 0},
                    {code: 2, name: "温度", count: 0},
                    {code: 3, name: "水浸", count: 0},
                    {code: 4, name: "二氧化碳", count: 0},
                    {code: 5, name: "压差", count: 0},
                    {code: 6, name: "氧气", count: 0},
                    {code: 7, name: "压力", count: 0},
                ],
                overview: [
                    {status: 10, title: "设备管理器", num: 0}
                ],
                total: {title: _this.$t('hardware.hardwareSum'), num: 0}
            },
            columnSort: {
                name: "", //名称
                num: "", //编号
                department: "", //部门
                createTime: "" //创建时间
            }
        }
    },
    created() {
        const pageSize = localStorage.getItem("pageSize");
        if (pageSize) {
            this.items.pageSize = pageSize * 1;
        }
        this.getList();
    },
    methods: {
        handleQuery(index, type = 0) {
            console.log(type)
            if (!index && !type) {
                this.items.deviceType = 0;
                this.items.equipmentType = null;
                this.$refs.deviceTotal.isTop = null;
                this.$refs.deviceTotal.isBottom = null;
            } else {
                this.items.deviceType = type ?? this.items.deviceType;
                this.items.equipmentType = index ?? this.items.equipmentType;
            }
            this.items.pageNum = items.PAGE_NUM;
            this.items.pageSize = items.PAGE_SIZE;
            this.getList();
        },
        handleExport() {
        },
        getValue() {
            this.handleQuery(this.items.equipmentType, this.items.deviceType);
        },
        handleQueryDeviceType(type) {
            this.items.equipmentType = null;
            this.handleQuery(this.items.equipmentType, type);
        },
        getList() {
            this.loading = true;
            this.items['sortName'] = this.columnSort;
            getEquipmentSortList(this.items).then(res => {
                this.loading = false;
                if (!res.code) {
                    return this.$message.error(res.message);
                }
                this.device = res.items.list;
                this.totalObject.deviceType = [];
                this.totalObject.deviceType = this.totalObject.deviceType.concat(res.items.deviceSortCount.typeSorts);
                this.totalObject.total.num = res.items.deviceSortCount.deviceCount;
                this.totalObject.overview = [];
                res.items.equipmentSortCount.map(item => {
                    if (item.type !== 0) {
                        this.totalObject.overview.push({title: item.name, status: item.type, num: item.count})
                    }
                })
                if (res.items.pageNum === items.PAGE_NUM) {
                    this.total = res.items.total;
                }
            })
        },
        sortChange(e) {
            var propName = e.prop;
            var sortOrder = e.order;
            if (sortOrder && sortOrder == 'ascending') {
                sortOrder = 'asc';
            }
            if (sortOrder && sortOrder == 'descending') {
                sortOrder = 'desc';
            }
            Object.keys(this.columnSort).forEach((key) => {
                this.columnSort[key] = '';
            })
            if (e.prop == 'no') {
                propName = 'num';
            } else if (e.prop == 'createDate') {
                propName = 'createTime';
            } else if (e.prop == 'departmentName') {
                propName = 'department';
            } else if (e.prop == 'name') {
                propName = 'name';
            } else {
                propName = '';
            }
            if (propName && sortOrder) {
                this.columnSort[propName] = sortOrder;
            }
            this.getList();
        }
    }
}
</script>

<style scoped>

</style>
