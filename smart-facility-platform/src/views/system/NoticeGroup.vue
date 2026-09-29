<template>
    <div class="session">
        <el-row type="flex" justify="end">
            <el-button @click="handleBatchDeleteDevice" v-if="$store.state.level">{{ $t('common.batchDelete') }}</el-button>
            <el-button v-if="$store.state.level" type="primary" class="icon-addto" @click="handleAdd">
                {{ $t('system.addNotice') }}
            </el-button>
        </el-row>
        <el-table
            class="margin-center"
            ref="multipleTable"
            v-loading="loading"
            :data="dataSource"
            row-key="id"
            stripe
            border
            @selection-change="handleSelectionChange"
        >
            <el-table-column v-if="$store.state.level" :selectable="selectEnable" :reserve-selection="true" fixed
                             type="selection"
                             width="50"/>
            <el-table-column fixed type="index" label="#"></el-table-column>
            <el-table-column fixed type="expand">
                <template v-slot="scope">
                    <el-table
                        :data="scope.row.groupCollocateList"
                        border
                    >
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column :label="$t('system.informDeploy')" prop="">
                            <template v-slot="sun">
                                {{ $t('system.informDeploy') + (sun.$index + 1) }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('system.names')" prop="names">
                            <template v-slot="sun">
                                {{ sun.row.names.slice(0, 5).toString() }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('common.timeFrame')" prop="">
                            <template v-slot="sun">
                                {{ sun.row.startTime + "~" + sun.row.endTime }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('system.informType')" width="550">
                            <template v-slot="sun">
                                <el-row>
                                    <el-col :span="8">
                                        <span>{{ $t('system.weChat') }}：{{ handleAlarmTime(sun.row.wx) }}</span>
                                    </el-col>
                                    <el-col :span="8">
                                        <span>{{ $t('system.sms') }}：{{ handleAlarmTime(sun.row.sms) }}</span>
                                    </el-col>
                                    <el-col :span="8">
                                        <span>{{ $t('system.phone') }}：{{ handleAlarmTime(sun.row.phone) }}</span>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                    </el-table>
                </template>
            </el-table-column>
            <el-table-column fixed :label="$t('system.noticeName')" min-width="120" prop="groupName">
                <template v-slot="scope">
                    <a @click="handleShowDrawer(scope.row)">{{ scope.row.groupName }}</a>
                </template>
            </el-table-column>
            <el-table-column :label="$t('room.groupMsg')" min-width="140" prop="groupMsg"/>
            <el-table-column :label="$t('common.department')" min-width="140" prop="departmentName"/>
            <el-table-column :label="$t('system.names')" show-overflow-tooltip width="230" prop="UserNames"/>
            <el-table-column :label="$t('common.createName')" min-width="80" prop="createUserName"/>
            <el-table-column :label="$t('common.creatDate')" min-width="140" prop="createDate">
                <template v-slot="{row}">
                    {{ row.createDate | localToUtc }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('system.updateTime')" min-width="140" prop="updateTime">
                <template v-slot="{row}">
                    {{ row.updateTime | localToUtc }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('common.handle')" min-width="130" fixed="right">
                <template v-slot="scope">
                    <el-button type="text" @click="handleDropdownMenu(scope.row)">{{ $t('common.edit') }}</el-button>
                    <el-button v-if="scope.row.inlay" class="abnormal" type="text"
                               @click="handleDelete(scope.row)">
                        {{ $t('common.delete') }}
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
        <edit-notice-group ref="EditNoticeGroup" @handle="getList"/>
    </div>
</template>

<script>
import {ALARMARRAY, items} from "@/utils/constant";
import Pagination from "@c/Pagination/index";
import {getGroupList, removeBatchGroup} from "@/api/system";
import EditNoticeGroup from "@c/EditNoticeGroup";

let timeObj = "";
export default {
    name: "NoticeGroup",
    components: {
        Pagination,
        EditNoticeGroup
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
        timeObj = ALARMARRAY.reduce((prev, current) => {
            prev[current.id] = current.name;
            return prev;
        }, {})
    },
    methods: {
        selectEnable(row, rowIndex) {
            if (row.inlay === 1) {
                return true
            }
        },
        getList() {
            this.loading = true;
            getGroupList(this.items).then(res => {
                this.loading = false;
                if (res.code == 1) {
                    this.total = res.items.total;
                    res.items.list.forEach(i => {
                        i.UserNames = []
                        i.noticeGroupStaffs.forEach(x => {
                            i.UserNames.push(x.staffName)
                        })
                        i.UserNames = i.UserNames.join(",")
                    })
                    this.dataSource = res.items.list;
                } else {
                    this.$message.error(res.message);
                }
            }).catch(e => {
                console.log(e);
                this.loading = false;
            })
        },
        handleAdd() {
            this.$refs.EditNoticeGroup.open(0,null,2);
        },
        getRowKey(row) {
            return row.id;
        },
        handleShowDrawer(row) {
            this.$refs.EditNoticeGroup.open(2, [{
                id: row.id,
                groupName:row.groupName,
            }]);
        },
        handleDropdownMenu(row) {
            this.$refs.EditNoticeGroup.open(1, [{
                id: row.id,
                groupName:row.groupName,
            }],2);
        },
        handleDelete(row) {
            this.$confirm(this.$t('system.deleteNoticeMessage'), this.$t('system.deleteNotice'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                removeBatchGroup([row.id]).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('common.deleteSuccess'));
                        this.getList();
                    } else {
                        this.$message.error(res.message);
                    }
                })
            })
        },

        handleSelectionChange(val) {
            this.multipleSelection = [];
            val.map(item => {
                this.multipleSelection.push(item.id);
            })
        },
        handleBatchDeleteDevice() {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t('system.deleteNoticeMessage1'));
            }
            this.$confirm(this.$t('system.deleteNoticeMessage2'), this.$t('system.deleteNotice'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                this.loadingText = this.$t('common.hintDelete');
                console.log(this.multipleSelection);
                removeBatchGroup(this.multipleSelection).then(res => {
                    this.loadingText = this.$t('common.hintDefault');
                    if (res.code) {
                        this.$message.success(this.$t('common.deleteBatchSuccess'));
                        this.multipleSelection = [];
                        this.$refs.multipleTable.clearSelection();
                        this.getList();
                    } else {
                        this.$message.error(this.$t('common.deleteError') + res.message);
                    }
                })
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'))
            })
        },
        handleAlarmTime(value) {
            if (value === -1 || value === null) {
                return this.$t('system.noNotice');
            }
            return timeObj[value];
        }
    }

}
</script>

<style lang="less" scoped>
/deep/ .el-table__expanded-cell {
    padding: 0 40PX !important;
}
</style>