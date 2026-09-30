<template>
    <el-drawer
        :before-close="handleClose"
        :modal="false"
        :visible.sync="isDrawer"
        :with-header="false"
        size="70%">
        <div class="detail-padding" v-if="isDrawer" v-loading="loading">
            <drawer-nav :type="16" :deviceName="detail.no" :name="detail.name" @handle="handleClose" />
            <el-descriptions :title="$t('common.basicInformation')">
                <template v-if="$store.state.level && (!isDemo || detail.wifiFlag)" slot="extra">
                    <el-button
                        v-if="detail.wifiFlag"
                        :disabled="detail.status === 0"
                        @click="$refs.NetworkConfiguration.open(0,detail)">
                        {{ $t('hardware.networkConfiguration') }}
                    </el-button>
                </template>
            </el-descriptions>
            <div class="layout-row">
                <div style="margin-right: 24px">
                    <DetailStatusGarden :status.sync="detail.status" :arr="GUNRACKSTATUS" />
                </div>
                <div>
                    <el-descriptions :column="2">
                        <el-descriptions-item :label="$t('common.name')">{{ detail.name }}</el-descriptions-item>
                        <el-descriptions-item :label="$t('common.no')">{{ detail.no }}</el-descriptions-item>
                        <el-descriptions-item :label="$t('common.owningDepartment')">{{ detail.departmentName }}</el-descriptions-item>
                        <el-descriptions-item :label="$t('common.owningRoom')">{{ detail.roomName }}</el-descriptions-item>
                        <el-descriptions-item :label="$t('hardware.assetGatewayStatus')">{{ statusText(detail.status,GUNRACKSTATUS) }}</el-descriptions-item>
                        <el-descriptions-item :label="$t('common.reportDate')">{{ detail.reportDate | localToUtc }}</el-descriptions-item>
                        <el-descriptions-item :label="$t('common.creatDate')">{{ detail.createDate | localToUtc }}</el-descriptions-item>
                        <el-descriptions-item :label="$t('common.companyName')">{{ detail.companyName }}</el-descriptions-item>
                        <el-descriptions-item :label="$t('hardware.assetPropertyNum')">{{ detail.propertyNum }}</el-descriptions-item>
                        <el-descriptions-item :label="$t('common.remark')">{{ detail.remark }}</el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>

            <el-descriptions :title="$t('hardware.bindAssetTag')"></el-descriptions>
            <Table :tableData="tableData" :data="labelList" v-loading="tableLoading">
                <template slot-scope="data">
                    <div v-if="data.prop === 'status'">{{ statusText(data.data.status, ASSETTAGSTATUS) }}</div>
                    <div v-if="data.prop === 'reportDate'">
                        {{ data.data.reportDate | localToUtc }}
                    </div>
                </template>
            </Table>
            <div class="paging">
                <pagination
                    v-show="total > 10"
                    :limit.sync="items.pageSize"
                    :page.sync="items.pageNum"
                    :total="total"
                    @pagination="labelBindingList"/>
            </div>

            <el-descriptions :title="$t('hardware.historyAlarmLog')"></el-descriptions>
            <HistoryAlarmRecord v-if="detail" :id.sync="detail.id" />

            <network-configuration ref="NetworkConfiguration" @handle="handleDetail"/>
        </div>
    </el-drawer>
</template>

<script>
    import DrawerNav from "@c/DrawerNav/index";
    import DetailStatusGarden from "@c/DetailStatusGarden";
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import HistoryAlarmRecord from "./HistoryAlarmRecord";
    import NetworkConfiguration from "@/views/device/components/NetworkConfiguration";
    import { GUNRACKSTATUS, ASSETTAGSTATUS } from "@/utils/constant";
    import { statusText } from "@/utils/methods";
    import { getDeviceDetail } from "@/api/device";
    import { postLabelBindingList } from "@/api/assetTag";

    const isDemo = process.env.VUE_APP_DEMO === "true";

    export default {
        name: "AssetGatewayDrawer",
        components: {
            DrawerNav,
            DetailStatusGarden,
            Table,
            Pagination,
            HistoryAlarmRecord,
            NetworkConfiguration
        },
        props: {
            id: {
                type:  String,
                default: ""
            },
            isDrawer: {
                type: Boolean,
                default: false
            }
        },
        data() {
            const _this = this;
            return {
                isDemo,
                GUNRACKSTATUS,
                ASSETTAGSTATUS,
                statusText,
                loading: false,
                detail: {},
                tableLoading: false,
                tableData: [
                    {
                        label: "#",
                        type: "index"
                    },
                    {
                        label:  _this.$t('hardware.labelNo'),
                        prop: "labelNo"
                    },
                    {
                        label: _this.$t('hardware.propertyGateName'),
                        prop: "propertyGateName"
                    },
                    {
                        label: _this.$t('hardware.newStatus1'),
                        prop: "status",
                        isSlot: true
                    },
                    {
                        label: _this.$t('hardware.signalStrength1'),
                        prop: "labelSignal"
                    },
                    {
                        label: _this.$t('common.reportDate'),
                        prop: "reportDate"
                    },
                    {
                        label: _this.$t('hardware.labellectric'),
                        prop: "labellectric"
                    },
                    {
                        label: _this.$t('hardware.binInstrument'),
                        prop: "instrumentName"
                    },
                ],
                labelList: [],
                items: {
                    pageSize: 10,
                    pageNum: 1,
                    gatewayId: null
                },
                total: 0,
            }
        },
        watch: {
            isDrawer(val){
                if(val){
                    this.handleDetail()
                }else{
                    this.detail = {}
                }
            },
        },
        methods: {
            handleDetail(){
                this.loading = true;
                getDeviceDetail({deviceId: this.id}).then(res => {
                    this.loading = false;
                    if (res.code) {
                        this.detail = res.items;
                        this.items.gatewayId = res.items.id;
                        this.labelBindingList()
                    }
                })
            },
            labelBindingList(){
                this.tableLoading = true;
                postLabelBindingList(this.items).then(res => {
                    this.tableLoading = false;
                    if(res.code === 1){
                        this.labelList = res.items.list;
                        this.total = res.items.total
                    }
                })
            },
            // 关闭详情页
            handleClose() {
                this.$emit("update:isDrawer", false);
            },
        },
    }
</script>