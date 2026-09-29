<template>
    <div class="session">
        <el-row type="flex" justify="end">
            <el-button type="primary" class="icon-addto" @click="handleAdd">
                {{ $t('system.addLabDevice') }}
            </el-button>
        </el-row>
        <el-table
            class="margin-center"
            ref="multipleTable"
            v-loading="loading"
            :data="dataSource"
            border
            :row-key="getRowKey"
            stripe>
            <el-table-column fixed label="#" type="index" width="70px">
                <template v-slot="scope">
                    <span v-if="`${total !== 0}`">
                        {{ (items.pageNum - 1) * items.pageSize + scope.$index + 1 }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column fixed :label="$t('system.gradeName')" prop="gradeName" min-width="100">
                <template v-slot="scope">
                    <a @click="handleShowDrawer(scope.row)">{{ scope.row.gradeName }}</a>
                </template>
            </el-table-column>
            <el-table-column fixed :label="$t('room.groupMsg')" min-width="180" prop="gradeMsg"/>
            <el-table-column :label="$t('labDevice.type')" prop="inlay">
                <template v-slot="scope">
                  <span>
                    {{ scope.row.inlay ? $t('system.userAdd') : $t('system.systemInlay')}}
                  </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('system.groupName')" min-width="100" prop="groupName">
            </el-table-column>
            <el-table-column :label="$t('common.createName')" min-width="80" prop="createUserName"/>
            <el-table-column :label="$t('common.creatDate')" min-width="130" prop="createDate">
                <template v-slot="{row}">
                    {{ row.createDate | localToUtc }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('system.updateTime')" min-width="160" prop="updateDate">
                <template v-slot="{row}">
                    {{ row.updateTime | localToUtc }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('common.handle')" min-width="130">
                <template v-slot="scope">
                    <el-button type="text" @click="handleDropdownMenu(scope.row)">{{ $t('common.edit') }}</el-button>
                    <el-button
                        v-if="scope.row.inlay" class="abnormal" type="text"
                        @click="handleDelete(scope.row)">{{ $t('common.delete') }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="paging">
            <pagination
                v-show="total > 10"
                :limit.sync="items.pageSize"
                :page.sync="items.pageNum"
                :total="total"
                @pagination="getList"/>
        </div>
        <create-device-level ref="CreateDeviceLevel" @getList="getList"/>
    </div>
</template>

<script>
import {items} from "@/utils/constant";
import CreateDeviceLevel from "@/views/system/components/CreateDevicelevel";
import Pagination from "@c/Pagination/index";
import {getGradeList, removeBatchGrade} from "@/api/system";


export default {
    name: "SysGrade",
    components: {
        CreateDeviceLevel,
        Pagination
    },
    data() {
        return {
            loading: false,
            dataSource: [],
            items: {
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM,
            },
            total: 0,
            multipleSelection: [],
        }
    },
    created() {
        this.getList();
    },
    methods: {
        getRowKey(row) {
            return row.id;
        },
        handleDropdownMenu(row) {
            this.$refs.CreateDeviceLevel.open(1, row);
        },
        handleAdd() {
            this.$refs.CreateDeviceLevel.open(0);
        },
        handleShowDrawer(row) {
            this.$refs.CreateDeviceLevel.open(2, row);
        },
        getList() {
            this.loading = true;
            getGradeList(this.items).then(res => {
                this.loading = false;
                if (res.code == 1) {
                    this.dataSource = res.items.list;
                    if (res.items.pageNum === items.PAGE_NUM) {
                        this.total = res.items.total;
                    }
                } else {
                    this.$message.error(res.message);
                }
            }).catch(e => {
                console.log(e);
                this.loading = false;
            })
        },
        handleDelete(row) {
            this.$confirm(this.$t('system.gradeDeleteMessage'), this.$t('system.gradeDelete'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                removeBatchGrade([row.id]).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('common.deleteBatchSuccess'));
                        this.getList();
                    } else {
                        this.$message.error(res.message);
                    }
                })
            })
        },
    }
}
</script>

<style lang="less" scoped>
</style>