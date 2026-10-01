<template>
    <div v-loading="loading">
        <el-tabs v-model="monitorStatus" @tab-click="handleCutMonitor">
            <el-tab-pane :label="$t('labDevice.monitorDevice')" name="1"></el-tab-pane>
            <el-tab-pane :label="$t('labDevice.noMonitorDevice')" name="2"></el-tab-pane>
        </el-tabs>
        <div>
            <div>
                <el-radio-group v-model="tabPosition" style="margin-bottom: 16px;" @change="handleTabPosition">
                    <el-radio-button label="0">{{ $t('common.all') }}</el-radio-button>
                    <el-radio-button label="1">{{ $t('route.watchlabdevice') }}</el-radio-button>
                    <el-radio-button label="2">{{ $t('route.administration') }}</el-radio-button>
                    <el-radio-button label="3">{{ $t('route.unwatchlabdevice') }}</el-radio-button>
                </el-radio-group>
            </div>
            <div v-if="monitorStatus === '1'">
                <div v-if="monitor.length" class="new-state">
                    <el-row :gutter="20">
                        <el-col 
                            v-for="item in monitor" 
                            :key="item.id" 
                            :class="{ 'adaptationScreen': isAdaptationScreen }"
                            :xl="8"
                            :sm="12"
                            class="new-state-col" style="padding: 0">
                            <EquipmentCard
                                :data="item"
                                @change="handleGoEquipment(item.id)"/>
                        </el-col>
                    </el-row>
                </div>
                <el-empty v-else :image-size="30" :description="$t('room.notBindLabDevice')"></el-empty>
            </div>
            <div v-if="monitorStatus === '2'">
                <el-row justify="space-between" type="flex">
                    <el-input
                        v-model.trim="monitorItems.keyword"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('room.inputNameOrNo')"
                        @keyup.enter.native="handleInstrumentSearch">
                        <el-button
                            slot="append"
                            class="el-button-host"
                            icon="icon-search1"
                            @click="handleInstrumentSearch"/>
                    </el-input>
                    <el-button v-if="$store.state.level && !isDemo" type="primary" class="icon-add-to" @click="handleAddInstrument(1)">
                        {{ $t('room.addLabDevice') }}</el-button>
                </el-row>
                <things-table
                    :items="monitorItems"
                    :loading.sync="loading"
                    :table-data="noMonitor"
                    :total="monitorTotal"
                    @handleDelete="handleRemoveThing"
                    @handleEdit="handleEditThing"
                    @handlePath="handleGoEquipment" />
                <div class="paging">
                    <pagination
                        v-show="monitorTotal > monitorItems.pageSize"
                        :limit.sync="monitorItems.pageSize"
                        :page.sync="monitorItems.pageNum"
                        :total="monitorTotal"
                        @pagination="handleInstrumentListQuery"/>
                </div>
            </div>
        </div>

        <LabDeviceDrawer :id="instrumentId" :is-drawer.sync="isDrawer" />

        <administration-modal
            v-if="modalVisible"
            :room-id="id"
            :type="Number(tabPosition)"/>
    </div>
</template>

<script>
    import EquipmentCard from "@/views/room/components/EquipmentCard";
    import ThingsTable from "@/views/room/components/ThingsTable";
    import LabDeviceDrawer from "@/views/labDevice/components/LabDeviceDrawer";
    import Pagination from "@/components/Pagination/index";
    import AdministrationModal from "@/views/labDevice/modal";
    import { getRoomMonitorInstrument, removeRoomGoods } from "@/api/room";
    import { postInstrumentList } from "@/api/labDevice";
    import {resolveDeviceAssetUrl} from '@/utils/demoDeviceUrl';
    import { BASE_URL } from "@/utils/constant";
    import { mapMutations, mapState } from "vuex";
    import i18n from "@/i18n";
    export default {
        components: {
            EquipmentCard,
            ThingsTable,
            LabDeviceDrawer,
            Pagination,
            AdministrationModal
        },
        props: {
            id: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                isDemo: process.env.VUE_APP_DEMO === 'true',
                isDrawer: false,
                instrumentId: null,
                loading: false,
                monitorStatus: "1",
                tabPosition: "0",
                monitor: [],
                isAdaptationScreen: false,
                monitorItems: {
                    pageSize: 10,
                    pageNum: 1,
                    keyword: "",
                    type: 0,
                    roomId: this.id,
                    monitor: "2",
                    search: "2"
                },
                noMonitor: [],
                monitorTotal: 0
            }
        },
        computed: {
            ...mapState("lab", {
                modalVisible: "modalVisible",
            }),
        },
        updated() {
            //用户分辨率150%为true，其他为false
            if (screen.width < 1300) {
                this.isAdaptationScreen = true
            }
        },
        mounted() {
            this.handleGetRoomMonitorInstrument()
        },
        watch: {
            modalVisible() {
                if (!this.modalVisible) {
                    this.handleInstrumentListQuery();
                }
            },
        },
        methods: {
            // 监测设备tab
            handleCutMonitor() {
                this.monitorItems.pageNum = 1;
                this.tabPosition = "0";
                if(this.monitorStatus === '1'){
                    this.handleGetRoomMonitorInstrument()
                }else{
                    this.handleInstrumentListQuery()
                }
            },
            // 设备tab
            handleTabPosition() {
                this.monitorItems.pageNum = 1;
                if(this.monitorStatus === '1'){
                    this.handleGetRoomMonitorInstrument()
                }else{
                    this.handleInstrumentListQuery()
                }
            },
            // 被监测设备
            handleGetRoomMonitorInstrument() {
                this.monitor = [];
                this.loading = true;
                getRoomMonitorInstrument({roomId: this.id, types: this.tabPosition }).then(res => {
                    this.loading = false;
                    if (res.code) {
                        if(res.code === 1){
                            res.items.map(item => {
                                let obj = {
                                    id: item.id,
                                    name: item.name,
                                    url: resolveDeviceAssetUrl(item.logoUrl, BASE_URL),
                                    sensors: []
                                };
                                item.simpleEquipments.map(i => {
                                    obj.type = i.type;
                                    obj.powerFailure = i.powerFailure;
                                    obj.sensors = obj.sensors.concat(...i.sensors);
                                })
                                this.monitor.push(obj);
                            });
                        }else{
                            this.$message.error(res.message);
                        }
                    } else {
                        this.$message.error(res.message);
                    }
                });
            },
            handleInstrumentSearch() {
                this.monitorItems.pageNum = 1;
                return this.handleInstrumentListQuery();
            },
            // 未监设备
            handleInstrumentListQuery() {
                this.loading = true;
                this.monitorItems.type = this.tabPosition === "0" ? "4" : this.tabPosition;
                this.noMonitor = [];
                postInstrumentList(this.monitorItems).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.noMonitor = res.items.list;
                        this.monitorTotal = res.items.total;
                    }
                })
            },
            // 拉起设备详情
            handleGoEquipment(id) {
                this.instrumentId = id;
                this.isDrawer = true;
            },
            // 添加设备
            handleAddInstrument (row) {
                this.handleAddModal({roomId: this.id, types: row});
            },
            // 编辑
            handleEditThing(row) {
                this.handleEditModal(row);
            },
            // 删除
            handleRemoveThing(row) {
                this.$confirm(this.$t('room.deleteMontiLabDevice') + row.name + this.$t('room.deleteMontiLabDevice1'), this.$t('room.deleteMontiLabDevice2'), {
                    type: "warning",
                    cancelButtonText: i18n.t("common.cancel"),
                    confirmButtonText: i18n.t("common.confirm"),
                }).then(() => {
                    removeRoomGoods({
                        labId: row.roomId,
                        thingsId: row.id
                    }).then(res => {
                        if (res.code) {
                            if(res.code === 1){
                                this.$message.success(this.$t('room.unBindSuccess'));
                                this.handleInstrumentListQuery();
                            }else{
                                this.$message.error(res.message);
                            }
                        } else {
                            this.$message.error(res.message);
                        }
                    })
                }).catch(() => {
                    this.$message.info(this.$t('common.cancelHandle'));
                })
            },
            ...mapMutations("lab", {
                handleAddModal: "ADDMODAL",
                handleEditModal: "EDITMODAL",
            }),
        },
    }
</script>