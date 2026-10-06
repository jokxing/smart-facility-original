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
                <drawer-nav :deviceName="detail.no" :name="detail.name" @handle="handleClose" />
                <div class="detail-handle clearfix">
                    <div>
                        <el-switch
                            v-if="$store.state.level"
                            v-model="cancelAlarmFlag"
                            :disabled="systemDisabled"
                            :inactive-text="$t('hardware.alarmPlatform')"
                            @change="handlePlatformAlarm"
                        ></el-switch>
                    </div>
                    <div style="margin-right: -10px">
                        <el-button v-if="detail.homingStatus !== 1" type="primary" @click="handleDemoReturn">模拟归还</el-button>
                        <el-button @click="$refs.UpdateAlarmTime.open(0,detail,'GUN')">{{ $t('hardware.exportTime') }}</el-button>
                        <el-button class="margin-small-right" @click="$refs.UpdateAlarmRules.open(true,detail)">{{ $t('hardware.alarmTime') }}</el-button>
                    </div>
                </div>
                <el-descriptions :title="$t('common.basicInformation')"></el-descriptions>
                <div class="layout-row">
                    <div>
                        <GunPic v-if="detail" :detail="detail" />
                        <!-- <DetailStatusGarden :status.sync="detail.homingStatus" :arr="GUNSTATUS" /> -->
                    </div>
                    <div>
                        <el-descriptions :column="2">
                            <el-descriptions-item :label="$t('common.name')">{{ detail.name }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.lastUse')" labelClassName="big-width">{{ detail.endUser ? detail.endUser : $t('labDevice.unregistered') }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.no')">{{ detail.no }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.companyName')">{{ detail.companyName }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.address')">{{ detail.position }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.owningDepartment')">{{ detail.departmentName }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.creatDate')">{{ detail.createDate | localToUtc }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.reportDate')">{{ detail.reportDate | localToUtc }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.remark')">{{ detail.remark }}</el-descriptions-item>
                        </el-descriptions>
                    </div>
                </div>
            </div>

            <div class="detail-padding-nocolor">
                <el-descriptions :title="$t('hardware.users')">
                    <template v-if="$store.state.level" slot="extra">
                        <el-button class="icon-staff-settings" type="primary" @click="$refs.SetPrincipal.open(0, detail.pipetteGunId, 'GUN')">
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
                <UsageStatistics :id="id" :no="no" />
                <DetailsTimeoutStatistics :no="no" />
            </div>

            <div class="detail-padding">
                <el-descriptions :title="$t('hardware.historyAlarmLog')"></el-descriptions>
                <HistoryAlarmRecord :id.sync="id" :no.sync="no" />
            </div>
        </div>

        <SetPrincipal ref="SetPrincipal" @handle="handleEquipmentUsers"/>
        <UpdateAlarmRules ref="UpdateAlarmRules" @handle="handleDetail" />
        <UpdateAlarmTime ref="UpdateAlarmTime" @handle="handleDetail"/>
    </el-drawer>
</template>

<script>
    import DrawerNav from "@c/DrawerNav/index";
    import GunPic from "./GunPic";
    import DetailStatusGarden from "@c/DetailStatusGarden";
    import SetPrincipal from "@c/SetPrincipal/index";
    import PrincipalTable from "@c/PrincipalTable/index";
    import Pagination from "@c/Pagination/index";
    import UsageStatistics from "./UsageStatistics";
    import DetailsTimeoutStatistics from "./DetailsTimeoutStatistics";
    import HistoryAlarmRecord from "./HistoryAlarmRecord";
    import UpdateAlarmRules from "./UpdateAlarmRules";
    import UpdateAlarmTime from "@/views/device/components/UpdateAlarmTime";
    import { getGunPipetteDetail, getGunPipetteOpenAlarm, postGunReturnPipette } from "@/api/gun";
    import {getEquipmentUserList} from "@/api/user";
    import { GUNSTATUS, items } from "@/utils/constant";
    export default {
        components: {
            DrawerNav,
            GunPic,
            DetailStatusGarden,
            SetPrincipal,
            PrincipalTable,
            Pagination,
            UsageStatistics,
            DetailsTimeoutStatistics,
            HistoryAlarmRecord,
            UpdateAlarmTime,
            UpdateAlarmRules
        },
        props: {
            id: {
                type: Number,
                default: null
            },
            no: {
                type: String,
                default: ""
            },
            isDrawer: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                GUNSTATUS,
                loading: false,
                detail: "",
                systemDisabled: false,
                cancelAlarmFlag: false,
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
                    this.init()
                }else{
                    this.detail = ""
                }
            },
        },
        methods: {
            init() {
                this.handleDetail();
                this.handleEquipmentUsers();
            },
            handleDetail() {
                this.loading = true;
                getGunPipetteDetail({gunId: this.id}).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.detail = res.items;
                        this.cancelAlarmFlag = this.detail.cancelAlarmFlag === 0 ? true : false;
                    }
                })
            },
            // 平台报警
            handlePlatformAlarm() {
                getGunPipetteOpenAlarm({
                    gunId: this.detail.pipetteGunId,
                    alarmFlag: this.detail.cancelAlarmFlag ? 0 : 1,
                }).then((res) => {
                    this.systemDisabled = false;
                    if (res.code) {
                        this.$message({
                            type: "success",
                            message: this.$t('common.operateSuccess'),
                            duration: 2000
                        });
                    } else {
                        this.$message.error(res.message);
                        this.detail.cancelAlarmFlag = !this.detail.cancelAlarmFlag;
                    }
                });
            },
            // 负责人
            handleEquipmentUsers(){
                this.principalLoading = true;
                getEquipmentUserList({
                    pageNum: this.principalItems.pageNum,
                    pageSize: this.principalItems.pageSize,
                    equipmentId: this.id,
                    equipmentType: "GUN",
                }).then((res) => {
                    this.principalLoading = false;
                    this.equipmentUsers = res.items.list;
                    this.principalTotal = res.items.total;
                });
            },
            // 关闭详情页
            handleClose() {
                this.$emit("update:isDrawer", false);
            },
            handleDemoReturn() {
                postGunReturnPipette({gunId: this.detail.pipetteGunId}).then(res => {
                    if (res.code === 1) {
                        this.$message.success('模拟归还成功（未连接硬件）');
                        this.handleDetail();
                        this.$emit('handle');
                    } else {
                        this.$message.error(res.message);
                    }
                });
            },
        },
    }
</script>
