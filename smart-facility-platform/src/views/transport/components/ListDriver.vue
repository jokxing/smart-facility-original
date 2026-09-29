<template>
    <div>
        <!--     搜索和新增按钮-->
        <div class="search-bar-container">

            <el-input
                v-model="param.key"
                class="input-with-select"
                :placeholder="$t('common.inputKeyword')"
                @keyup.enter.native="handleFilter">
                <el-button
                    @click="handleFilter"
                    class="el-button-host"
                    slot="append"
                    icon="icon-search1"/>
            </el-input>

            <el-button
                @click="handleAddUserDriver"
                class="defaultBtn"
                icon="el-icon-plus"
                type="primary">
                {{ $t('transport.addDriver') }}
            </el-button>

        </div>
        <!--                表格数据-->
        <div class="sticky-head">
            <el-table
                stripev
                :data="driverTable"
                border
                ref="multipleTable"
                v-loading="tableLoading">
                <el-table-column label="#" type="index" width="100px">
                    <template v-slot="scope">
                        <!-- 有分页时，序号显示 -->
                        <span v-if="`${total != 0}`">
                                {{ (param.pageNum - 1) * param.pageSize + scope.$index + 1 }}
                            </span>
                        <!-- 无分页时，序号显示 -->
                        <span v-else>{{ scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="driverName" :label="$t('system.name')"></el-table-column>
                <el-table-column prop="sex" :label="$t('transport.sex')">
                    <template v-slot="scope">
                        {{ scope.row.sex == 1 ? $t('transport.man') : $t('transport.woman') }}
                    </template>
                </el-table-column>
                <el-table-column prop="age" :label="$t('transport.age')"/>
                <el-table-column prop="driverState" :label="$t('transport.driverStatus')">
                    <template v-slot="{row}">
                        {{ driverStates[row.driverState] }}
                    </template>
                </el-table-column>
                <el-table-column prop="tel" :label="$t('labDevice.telNo')"/>
                <el-table-column prop="idCard" :label="$t('transport.idCard')"/>
                <el-table-column :label="$t('common.handle')" width="150px">
                    <template v-slot="scope">
                        <el-button type="text" @click="handleEditUserDriver(scope.row)">{{ $t('common.edit') }}</el-button>
                        <el-button type="text" class="abnormal" @click="handleDeleteDriver(scope.row)">{{ $t('common.delete') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!--                分页-->
        <div class="paging">
            <pagination
                v-show="total > 10"
                :limit.sync="param.pageSize"
                :page.sync="param.pageNum"
                @pagination="getList"
                :total="total"/>
        </div>

        <!--        新增或编辑司机-->
        <CreateDriver ref="CreateDriver" @handle="handleFilter"/>
    </div>
</template>

<script>
import {getUserDriverList, removeUserDriver} from "@/api/transport";
import CreateDriver from "@/views/transport/components/CreateDriver";
import Pagination from "@c/Pagination";
import mixin from "@/utils/mixin";

export default {
    name: "ListDriver",
    components: {
        Pagination,
        CreateDriver,
    },
    data() {
        const _this = this;
        return {
            // 司机运输状态表
            driverStates: [_this.$t('transport.leaveUnused'),_this.$t('transport.inTransit')],
            // 司机
            driverTable: [],
            tableLoading: false,
            // 分页查询信息
            param: {
                pageNum: 1,
                pageSize: 10,
                key: ""
            },
            total: 0,
        }
    },
    created() {
        this.getList();
    },
    watch: {
        driverTable() {

        }
    },
    methods: {
        handleFilter() {
            this.param.pageNum = 1
            this.getList();
        },
        // 获取冷链车司机列表
        getList() {
            this.tableLoading = true;
            getUserDriverList(this.param).then(res => {
                if (res.code) {
                    let {list, total} = res.items
                    this.driverTable = list
                    this.total = total
                } else {
                    this.$message.error(res.message)
                }
            }).finally(() => {
                this.tableLoading = false;
            })
        },
        // 点击新增冷链车司机
        handleAddUserDriver() {
            this.$refs.CreateDriver.open(0);
        },
        // 点击编辑冷链车司机
        handleEditUserDriver(row) {
            this.$refs.CreateDriver.open(1, row);
        },
        // 点击移除冷链车司机
        handleDeleteDriver(row) {
            this.$confirm(this.$t('transport.deleteDriver') + "：" + row.driverName, this.$t('transport.deleteDriver1'), {
                type: "warning",
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel')
            }).then(() => {
                removeUserDriver([row.id]).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('common.deleteSuccess'));
                        if (Math.ceil(--this.total / this.param.pageSize) <this.param.pageNum) {
                            this.param.pageNum--;
                        }
                        this.getList();
                    } else {
                        this.$message.error(res.message);
                    }
                })
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'))
            })
        },
    }
}
</script>

<style lang="less" src="../../../style/table_sticky.less" scoped>

</style>
