<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.historyUseLog')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="1000px">
        <div class="gun-history-usage-record">
            <el-descriptions>
                <template v-if="$store.state.level" slot="extra">
                    <el-select class="select-input" v-model="historyItems.status" @change="handlePipetteHistory">
                        <el-option
                            v-for="item in statusOption"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <span>&nbsp;&nbsp;{{ $t('labDevice.useName') }} </span>
                    <SelectUser class="select-input" :clearable="true" :filterable="true" :userId.sync="historyItems.gunUserId" @handle="handlePipetteHistory" :pushData="pushData" />
                    <el-date-picker
                        v-model="historyDate"
                        type="datetimerange"
                        :range-separator="$t('common.most')"
                        :start-placeholder="$t('common.startDate')"
                        :end-placeholder="$t('common.endTime')"
                        @change="handleHistoryDate">
                    </el-date-picker>
                    &nbsp;
                    <el-button class="icon-download1" type="primary" @click="handleHistoryExport">
                        &nbsp;{{ $t('hardware.searchExportResult') }}
                    </el-button>
                </template>
            </el-descriptions>
            <Table :data="historyData" :tableData="historyTable" v-loading="historyLoading">
                <template v-slot="data">
                    <div>
                        {{ data.data.pipetteGunUser || $t('labDevice.unregistered') }}
                    </div>
                </template>
            </Table>
            <div class="paging" v-if="historyTotal > 10">
                <pagination
                    v-show="historyTotal > 10"
                    :limit.sync="historyItems.pageSize"
                    :page.sync="historyItems.pageNum"
                    :total="historyTotal"
                    @pagination="handlePipetteHistory"/>
            </div>
        </div>
    </el-dialog>
</template>

<script>
    import SelectUser from "@c/SelectUser";
    import Table from "@c/Tables";
    import Pagination from "@c/Pagination/index";
    import { postGunPipetteHistory, getGunPipetteUseRecordExport } from "@/api/gun";
    import { items } from "@/utils/constant";
    import mixin from "@/utils/mixin";
    import moment from "moment";
    export default {
        components: {
            SelectUser,
            Table,
            Pagination
        },
        props: {
            id: {
                type: Number,
                default: null
            },
            no: {
                type: String,
                default: ""
            }
        },
        data() {
            const _this = this;
            return {
                dialogVisible: false,
                historyLoading: false,
                pushData: [
                    {
                        name: _this.$t('labDevice.unregistered'),
                        id: 0
                    }
                ],
                statusOption: [
                    {
                        value: "",
                        label: _this.$t('common.all')
                    },
                    {
                        value: 1,
                        label: _this.$t('labDevice.noReturn1')
                    },
                    {
                        value: 2,
                        label: _this.$t('labDevice.return')
                    }
                ],
                historyDate: "",
                historyData: [],
                historyTable: [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('labDevice.useName'),
                        prop: "pipetteGunUser",
                        isSlot: true,
                        width: "70"
                    },
                    {
                        label: _this.$t('common.name'),
                        prop: "pipetteGunName",
                        minWidth: "60"
                    },
                    {
                        label: _this.$t('common.no'),
                        prop: "no",
                    },
                    {
                        label: _this.$t('labDevice.getGunRack'),
                        prop: "gunRackName",
                    },
                    {
                        label: _this.$t('labDevice.getGunLocation'),
                        prop: "position",
                    },
                    {
                        label: _this.$t('labDevice.returnGunRack'),
                        prop: "backGunRackName",
                    },
                    {
                        label: _this.$t('labDevice.returnLocation'),
                        prop: "backPosition",
                    },
                    {
                        label: _this.$t('labDevice.outTime'),
                        prop: "takeOutTime",
                        minWidth: "80"
                    },
                    {
                        label: _this.$t('labDevice.returnTime'),
                        prop: "homingTime",
                        minWidth: "80"
                    },
                    {
                        label: _this.$t('labDevice.runDurationHMS'),
                        prop: "durationUse",
                        minWidth: "70"
                    }
                ],
                historyTotal: 0,
                historyItems: {
                    gunUserId: null,
                    status: "",
                    startDate: "",
                    endDate: "",
                    gunNo: "",
                    gunId: null,
                    pageSize: items.PAGE_SIZE,
                    pageNum: items.PAGE_NUM,
                },
            }
        },
        methods: {
            open() {
                this.dialogVisible = true;
                this.handlePipetteHistory()
            },
            handlePipetteHistory() {
                this.historyItems.gunId = this.id;
                this.historyItems.gunNo = this.no;
                this.historyLoading = true;
                postGunPipetteHistory(this.historyItems).then(res => {
                    this.historyLoading = false;
                    if(res.code === 1){
                        this.historyData = res.items.list;
                        this.historyTotal = res.items.total
                    }
                })
            },
            handleHistoryDate(e) {
                if(e){
                    this.historyItems.startDate = moment(e[0]).format('YYYY-MM-DD HH:mm:ss');
                    this.historyItems.endDate = moment(e[1]).format('YYYY-MM-DD HH:mm:ss');
                }else{
                    this.historyItems.startDate = '';
                    this.historyItems.endDate = '';
                }
                this.handlePipetteHistory()
            },
            handleHistoryExport() {
                new Promise(resolve => {
                    this.$message.warning(this.$t('common.exportMessage'));
                    setTimeout(() => {
                        resolve();
                    }, 1500)
                }).then(() => {
                    getGunPipetteUseRecordExport({
                        startDate: this.historyItems.startDate,
                        endDate:this.historyItems.endDate,
                        gunId: this.historyItems.gunId,
                    }).then(res => {
                        const data = moment(new Date()).format("YYYYMMDDHHmmss");
                        mixin.methods.download(
                            res,
                            decodeURIComponent(this.$t('labDevice.historyUseLogExport') + data, "UTF-8")
                        )
                    })
                })
            },
            handleClose() {
                this.dialogVisible = false;
                this.historyDate = "";
                this.historyItems = {
                    gunUserId: null,
                    status: "",
                    startDate: "",
                    endDate: "",
                    gunNo: "",
                    gunId: null,
                    pageSize: items.PAGE_SIZE,
                    pageNum: items.PAGE_NUM,
                }
            }
        },
    }
</script>

<style lang="less" scoped>
    .gun-history-usage-record{
        .el-descriptions__extra{
            display: flex;

            .select-input{
                width: 150px;
                margin-right: 10px;
            }

            .el-range-editor--medium.el-input__inner{
                width: 366px;
                margin-right: 6px;
            }
        }
    }
</style>