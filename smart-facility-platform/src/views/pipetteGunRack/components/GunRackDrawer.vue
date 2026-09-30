<template>
    <el-drawer
        :before-close="handleClose"
        :modal="false"
        :visible.sync="isDrawer"
        :with-header="false"
        size="70%"
        custom-class="pipetteGun-drawer">
        <div v-if="isDrawer" class="detail-container" v-loading="loading">
            <div class="detail-padding">
                <drawer-nav :type="13" :deviceName="powerOutage.no" :name="powerOutage.name" @handle="handleClose" />
                <div v-if="$store.state.level && !isDemo" class="detail-handle clearfix">
                    <div>
                        <el-switch
                            v-model="closeAlarmFlag"
                            class="margin-small-right"
                            :inactive-text="$t('hardware.acousticOptic')"
                            @change="handleAlarmPowerOutage"
                        ></el-switch>
                    </div>
                </div>
                
                <el-descriptions :title="$t('common.basicInformation')">
                    <template v-if="!isDemo" #extra>
                        <el-button @click="$refs.voiceReminderSet.open(powerOutage)">{{ $t('labDevice.notScanHint') }}</el-button>
                        <el-button class="icon-information" @click="handleDropdownMenu(0,'ReturnCommand')">&nbsp;{{ $t('hardware.returnCommand') }}
                        </el-button>
                        <el-button type="primary" class="icon-edit" @click="handleDropdownMenu(13,'UpdateDepartment')">&nbsp;{{ $t('common.edit') }}
                        </el-button>
                    </template>
                </el-descriptions>
                <div class="layout-row">
                    <div style="margin-right: 24px">
                        <DetailStatusGarden :status.sync="powerOutage.status" :arr="GUNRACKSTATUS" />
                    </div>
                    <div>
                        <el-descriptions :column="2">
                            <el-descriptions-item :label="$t('common.name')">{{ powerOutage.name }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.address')">{{ powerOutage.roomName }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.no')">{{ powerOutage.no }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.reportDate')">{{ powerOutage.reportDate |localToUtc }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.owningDepartment')">{{ powerOutage.departmentName }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.creatDate')">{{ powerOutage.createDate | localToUtc }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.remark')">{{ powerOutage.remark }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.companyName')">{{ powerOutage.companyName }}</el-descriptions-item>
                        </el-descriptions>
                    </div>
                </div>
            </div>

            <div class="detail-padding">
                <el-descriptions :title="$t('labDevice.gunList')"></el-descriptions>
                <Table :data="list" :tableData="tableData" v-loading="pipetteGunLoading">
                    <template slot-scope="data">
                        <div v-if="data.prop === 'no'">{{ data.data.no === 'null' ? '' : data.data.no }}</div>
                        <div v-if="data.prop === 'homingStatus'" :class="statusColor(data.data.homingStatus, GUNSTATUS)">
                            {{ data.data.no === 'null' ? '' : statusText(data.data.homingStatus, GUNSTATUS) }}
                        </div>
                    </template>
                </Table>
                <div class="paging">
                    <Pagination
                        v-show="total > pipetteGunItems.pageSize"
                        :limit.sync="pipetteGunItems.pageSize"
                        :page.sync="pipetteGunItems.pageNum"
                        :total="total"
                        @pagination="handleGunPipetteList"/>
                </div>
            </div>

            <div class="detail-padding-nocolor">
                <el-descriptions :title="$t('hardware.users')">
                    <template v-if="$store.state.level && !isDemo" slot="extra">
                        <el-button class="icon-staff-settings" type="primary" @click="$refs.SetPrincipal.open(0, powerOutage.id, 'PIPETTE_GUN')">
                            &nbsp;{{ $t('common.addPrincipal') }}
                        </el-button>
                    </template>
                </el-descriptions>
                <principal-table 
                    :total="principalTotal" 
                    :items="principalItems" 
                    :equipment-users="equipmentUsers" 
                    :loading.sync="principalLoading"/>
                <div class="paging" v-if="principalTotal > 10">
                    <pagination
                        v-show="principalTotal > 10"
                        :limit.sync="principalItems.pageSize"
                        :page.sync="principalItems.pageNum"
                        :total="principalTotal"
                        @pagination="handleEquipmentUsers"/>
                </div>
            </div>

            <div class="detail-padding">
                <el-descriptions :title="$t('hardware.historyAlarmLog')"></el-descriptions>
                <HistoryAlarmRecord :id.sync="id" />
            </div>
        </div>
    
        <return-command ref="ReturnCommand"/>
        <UpdateDepartment ref="UpdateDepartment" @handle="handleDetail"/>
        <SetPrincipal ref="SetPrincipal" @handle="handleEquipmentUsers"/>
        <VoiceReminderSet ref="voiceReminderSet" :type="1" :selectArr="[powerOutage]" @handle="handleDetail" />
    </el-drawer>
</template>

<script>
    import DrawerNav from "@c/DrawerNav/index";
    import DetailStatusGarden from "@c/DetailStatusGarden";
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import HistoryAlarmRecord from "./HistoryAlarmRecord"
    import ReturnCommand from "@/views/device/components/ReturnCommand";
    import UpdateDepartment from "@/views/device/components/UpdateDepartment";
    import PrincipalTable from "@c/PrincipalTable/index";
    import SetPrincipal from "@c/SetPrincipal/index";
    import VoiceReminderSet from "./VoiceReminderSet";
    import {
        getDeviceDetail,
        updateAlarmLight
    } from "@/api/device";
    import { postGunPipetteBindingList } from "@/api/gun";
    import {getEquipmentUserList} from "@/api/user";
    import { statusText, statusColor } from "@/utils/methods";
    import { GUNRACKSTATUS,GUNSTATUS,items } from "@/utils/constant"

    const isDemo = process.env.VUE_APP_DEMO === "true";

    export default {
        name: "GunRackDrawer",
        components: {
            DrawerNav,
            DetailStatusGarden,
            Table,
            Pagination,
            HistoryAlarmRecord,
            ReturnCommand,
            UpdateDepartment,
            PrincipalTable,
            SetPrincipal,
            VoiceReminderSet
        },
        props: {
            strId: {
                type: String,
                default: null
            },
            id: {
                type: Number,
                default: null
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
                statusText,
                statusColor,
                GUNRACKSTATUS,
                GUNSTATUS,
                loading: false,
                powerOutage: {},
                closeAlarmFlag: false,
                pipetteGunLoading: true,
                pipetteGunItems: {
                    gunRackId: null,
                    pageNum: 1,
                    pageSize: 10,
                },
                total: 0,
                // 移液枪列表
                list: [],
                tableData: [
                    {
                        label: _this.$t('labDevice.detent'),
                        prop: "detent",
                        width: "60"
                    },
                    {
                        label: _this.$t('labDevice.gunName'),
                        prop: "name",
                    },
                    {
                        label:_this.$t('common.no'),
                        prop: "no",
                        isSlot: true,
                    },
                    {
                        label: _this.$t('hardware.status'),
                        prop: "homingStatus",
                        isSlot: true,
                        // judgeField: 'no'
                        // field: "homingStatus",
                        // class:{
                        //     2: {
                        //         name: "abnormal",
                        //         text: "超时未归还"
                        //     },
                        //     1: {
                        //         name: "normal",
                        //         text: "使用中"
                        //     },
                        //     0: {
                        //         name: "blue",
                        //         text: "闲置"
                        //     },
                        // }
                    },
                    {
                        label: _this.$t('labDevice.gunRackName'),
                        prop: "gunRackName",
                    },
                ],
                // 负责人
                principalTotal: 0,
                principalItems: {
                    pageSize: items.PAGE_SIZE,
                    pageNum: items.PAGE_NUM,
                },
                principalLoading: false,
                equipmentUsers: [],
            }
        },
        watch: {
            isDrawer(val){
                if(val){
                    this.handleInit()
                }
            },
        },
        methods: {
            handleInit() {
                this.handleDetail();
            },
            handleDetail() {
                this.loading = true;
                getDeviceDetail({deviceId: this.strId}).then(res => {
                    this.loading = false;
                    if (res.code) {
                        this.powerOutage = res.items;
                        this.closeAlarmFlag = !this.powerOutage.closeSoundLightAlarm;
                        this.handleGunPipetteList();
                        this.handleEquipmentUsers()
                    }
                })
            },
            // 关闭详情页
            handleClose() {
                this.$emit("update:isDrawer", false);
            },
            // 声光报警
            handleAlarmPowerOutage() {
                if (isDemo) {
                    this.closeAlarmFlag = !this.closeAlarmFlag;
                    this.$message.info('本阶段演示未开放声光报警开关。');
                    return;
                }
                updateAlarmLight({
                    id: this.powerOutage.id,
                    closeSoundLightAlarm: this.closeAlarmFlag ? 0 : 1
                }).then(res => {
                    if (res.code) {
                        if(res.code == 1){
                            this.$message({
                                type: "success",
                                message: this.$t('common.operateSuccess'),
                                duration: 2000
                            });
                        }else{
                            this.$message.error(res.message);
                            this.closeAlarmFlag = !this.powerOutage.closeSoundLightAlarm;
                        }
                    } else {
                        this.$message.error(res.message);
                        this.closeAlarmFlag = !this.powerOutage.closeSoundLightAlarm;
                    }
                })
            },
            // 设备返回消息/编辑
            handleDropdownMenu(type, e) {
                this.$refs[e].open(type, this.powerOutage);
            },
            // 编辑
            handleUpdate() {
                this.handleDetail();
            },
            // 移液枪列表
            handleGunPipetteList(){
                this.pipetteGunLoading = true;
                this.pipetteGunItems.gunRackId = this.powerOutage.id
                postGunPipetteBindingList(this.pipetteGunItems).then(res => {
                    this.pipetteGunLoading = false;
                    if(res.code == 1){
                        this.list = res.items.list;
                        this.total = res.items.total
                    }
                })
            },
            // 负责人
            handleEquipmentUsers(){
                this.principalLoading = true;
                getEquipmentUserList({
                    pageNum: this.principalItems.pageNum,
                    pageSize: this.principalItems.pageSize,
                    equipmentId: this.powerOutage.id,
                    equipmentType: "PIPETTE_GUN",
                }).then((res) => {
                    this.principalLoading = false;
                    this.equipmentUsers = res.items.list;
                    this.principalTotal = res.items.total;
                });
            },
        },
    }
</script>