<template>
    <el-dialog
        :before-close="handleModalClose"
        :close-on-click-modal="false"
        :title="$t('system.roomList')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="880px"
        top="6vh">
        <div class="select-list" v-if="dialogVisible">
            <div class="search-bar-container">
                <div>
                    <SelectDepartment
                        class="input-with-select margin-small-right"
                        :departmentId.sync="items.departmentId"
                        :is-company="true"
                        :select-tree-value.sync="items.departmentId"
                        @change="handleQuery"/>

                    <SelectFloorTree
                        class="input-with-select margin-small-right"
                        :floorId.sync="items.floorId"
                        @change="handleQuery" />

                    <el-input
                        v-model.trim="items.keyword"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('common.inputKeyword')"
                        @keyup.enter.native="handleQuery()">
                        <el-button
                            slot="append"
                            class="el-button-host"
                            icon="icon-search1"
                            @click="handleQuery()">
                        </el-button>
                    </el-input>
                </div>
            </div>
            <el-row class="select-tag">
                <div>
                    {{ $t('common.selected') }}{{ this.multipleSelection.length }} {{ $t('system.roomNum') }}：
                    <el-tag
                        v-for="(tag,index) in tags"
                        :key="tag.name"
                        closable
                        @close="handleTagClose(tag,index)">
                        {{tag.name}}
                    </el-tag>
                </div>
            </el-row>
            <Table
                ref="table"
                :tableData="tableData"
                :data="list"
                v-loading="tableLoading"
                @handleSelect="handleSelect"
                @handleSelectAll="handleSelectAll" />
            <div class="paging">
                <pagination
                    v-show="total > 10"
                    :limit.sync="items.pageSize"
                    :page.sync="items.pageNum"
                    :total="total"
                    @pagination="getList"/>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleModalClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="submitForm">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import SelectDepartment from "@c/SelectdePartment";
    import SelectFloorTree from "@c/SelectFloorTree";
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import { postRoomDataAuthRoomList } from "@/api/room";
    import { postDataAuthDistributeSimpleList } from "@/api/dataAuth";
    import columns from"../columns";
    export default {
        props: {
            dimension: {
                type: Number,
                default: null
            },
            type: {
                type: Number,
                default: null
            },
            userId: {
                type: Number,
                default: null
            },
        },
        components: {
            SelectDepartment,
            SelectFloorTree,
            Table,
            Pagination
        },
        data() {
            const _this = this;
            return {
                dialogVisible: false,
                loading: false,
                tableLoading: false,
                items: {
                    departmentId: null,
                    floorId: null,
                    keyword: "",
                    pageSize: 10,
                    pageNum: 1,
                },
                total: 0,
                tags: [],
                tableData: [
                    {
                        type: "selection",
                        width: "55",
                        reserveSelection: true,
                        rowKey: "id"
                    },
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('room.roomName'),
                        prop: "name",
                    },
                    {
                        label: _this.$t('room.roomNo'),
                        prop: "no",
                    },
                    {
                        label: _this.$t('common.owningDepartment'),
                        prop: "departmentName",
                    },
                    {
                        label: _this.$t('room.owningFloor'),
                        prop: "floorName",
                    },
                ],
                list: [],
                multipleSelection: [],
                currentPageIds: []
            }
        },
        created() {
            columns.assign(this)
        },
        methods: {
            open() {
                this.dialogVisible = true;
                this.multipleSelection = [];
                this.tags = [];
                this.getDistributeSimpleList()
            },
            getDistributeSimpleList() {
                var data = {
                    userId: this.userId,
                    dimension: this.dimension,
                    type: this.type
                }
                this.tableLoading = true;
                postDataAuthDistributeSimpleList(data).then(res => {
                    if(res.code === 1){
                        this.handleDistribute(res.items)

                        this.getList()
                    }
                })
            },
            getList() {
                if(this.items.departmentId === '0'){
                    this.items.departmentId = null
                };
                this.tableLoading = true;
                postRoomDataAuthRoomList(this.items).then(res => {
                    this.tableLoading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total;

                        this.handleListSelection()
                    }
                })
            },
            handleQuery() {
                this.items.pageNum = 1;
                this.items.pageSize = 10;
                this.getList()
            },
            handleModalClose() {
                this.dialogVisible = false;
                this.list = [];
                this.multipleSelection = [];
                this.tags = [];
                this.items = {
                    departmentId: null,
                    floorId: null,
                    keyword: "",
                    pageSize: 10,
                    pageNum: 1,
                };
                this.$refs.table.$refs.elTable.clearSelection();
                setTimeout(() => {
                    this.$emit('update:showRoomSelect', false)
                },100)
            }
        },
    }
</script>

<style lang="less" scoped>
    .select-list{
        .select-tag{
            margin-bottom: 20px;
        }
        .el-tag{
            margin-right: 10px;
            margin-bottom: 10px;
        }
    }
</style>
