<template>
    <div class="device-bind-relationship">
        <template v-if="isDemo">
            <el-descriptions :title="$t('hardware.bindThings')">
                <template v-if="demoWritable" slot="extra">
                    <el-button type="primary" size="mini" @click="openBind('room')">绑定房间</el-button>
                    <el-button type="primary" size="mini" @click="openBind('instrument')">绑定仪器</el-button>
                </template>
            </el-descriptions>
            <div class="demo-bind-list">
                <div class="demo-bind-row demo-bind-row--room">
                    <span class="demo-bind-tag">房间</span>
                    <template v-if="boundRooms.length">
                        <span
                            v-for="item in boundRooms"
                            :key="'r-' + item.id"
                            class="demo-bind-chip">
                            <span class="demo-bind-name">{{ item.name }}</span>
                            <el-button v-if="demoWritable" type="text" class="abnormal demo-bind-unbind" @click="handleUnbind(item)">解绑</el-button>
                        </span>
                    </template>
                    <span v-else class="demo-bind-empty">未绑定</span>
                </div>
                <div class="demo-bind-row demo-bind-row--instrument">
                    <span class="demo-bind-tag">仪器</span>
                    <template v-if="boundInstruments.length">
                        <span
                            v-for="item in boundInstruments"
                            :key="'i-' + item.id"
                            class="demo-bind-chip">
                            <span class="demo-bind-name">{{ item.name }}</span>
                            <el-button v-if="demoWritable" type="text" class="abnormal demo-bind-unbind" @click="handleUnbind(item)">解绑</el-button>
                        </span>
                    </template>
                    <span v-else class="demo-bind-empty">未绑定</span>
                </div>
            </div>
        </template>
        <el-row v-else-if="bingThings.length && bingThings[0].name">
            <el-col :lg="3">
                <el-descriptions :title="$t('hardware.bindThings')"></el-descriptions>
            </el-col>
            <a v-for="item in bingThings" :key="item.id" class="margin-small-right" @click="handleDeviceDrawer(item)">
                <span>{{ item.name }}</span>
            </a>
        </el-row>

        <el-dialog
            v-if="isDemo && demoWritable"
            :title="bindKind === 'room' ? '绑定房间' : '绑定仪器'"
            :visible.sync="bindDialogVisible"
            append-to-body
            width="420px">
            <el-select v-model="bindTargetId" :loading="catalogLoading" :disabled="catalogLoading" class="select-change-p" placeholder="请选择" style="width:100%">
                <el-option
                    v-for="opt in bindOptions"
                    :key="opt.id"
                    :label="opt.name"
                    :value="opt.id"/>
            </el-select>
            <span slot="footer" class="dialog-footer">
                <el-button :disabled="bindSubmitting" @click="bindDialogVisible = false">{{ $t('common.cancel') }}</el-button>
                <el-button :loading="bindSubmitting" :disabled="catalogLoading || !bindTargetId" type="primary" @click="handleBindSubmit">{{ $t('common.confirm') }}</el-button>
            </span>
        </el-dialog>

        <!-- 开通2.0打开新详情（非 demo） -->
        <template v-if="!isDemo">
            <LabDeviceDrawer :id="deviceId" :is-drawer.sync="labDeviceDrawer" />
            <RoomDrawerNew :isDrawer.sync="isRoomDrawerNew" :roomId.sync="deviceId" />
            <Drawer>
                <DrawerPage :detailId="deviceId"></DrawerPage>
            </Drawer>
            <RoomDrawer :isDrawer.sync="isRoomDrawer" :roomId.sync="deviceId" />
            <RefrigerateTruckInfo ref="truckInfo"/>
            <alerter-drawer :id.sync="deviceId" :is-drawer.sync="alerterDrawer"/>
            <signal-source-drawer v-if="isSignal" :id.sync="deviceId" :is-drawer.sync="isSignal"/>
        </template>
    </div>
</template>

<script>
    import LabDeviceDrawer from "@/views/labDevice/components/LabDeviceDrawer";
    import RoomDrawer from "@/views/room/components/RoomDrawer";
    import RoomDrawerNew from "@/views/room/components/RoomDrawerNew";
    import Drawer from "@c/Drawer";
    import RefrigerateTruckInfo from "@/views/transport/components/RefrigerateTruckInfo"
    import DrawerPage from "@/views/detail";
    import { getDeviceBinding, getDemoBindableCatalog } from "@/api/device";
    import { addRoomThings, removeRoomThings } from "@/api/room";
    import { getInstrumentThingsAdd, postInstrumentThingsRemove } from "@/api/labDevice";
    import {mapMutations} from 'vuex'

    const isDemo = process.env.VUE_APP_DEMO === "true";


    export default {
        props: {
            id: {required: false},
            relateDeviceList: {required: false},
            /** demo 下是否允许绑定/解绑；断电等只读详情传 false */
            demoWritable: {type: Boolean, default: true}
        },
        components: {
            LabDeviceDrawer,
            Drawer,
            DrawerPage,
            RefrigerateTruckInfo,
            RoomDrawer,
            RoomDrawerNew,
            AlerterDrawer: () => import("@/views/alarmAcousto/components/AlerterDrawer"),
            SignalSourceDrawer: () => import("@/views/signalSource/components/SignalSourceDrawer"),
        },
        data() {
            return {
                isDemo,
                bingThings: [],
                deviceId: null,
                labDeviceDrawer: false,
                alerterDrawer: false,
                isRoomDrawer: false,
                isRoomDrawerNew: false,
                isSignal: false,
                bindDialogVisible: false,
                bindKind: 'room',
                bindTargetId: null,
                bindSubmitting: false,
                bindCatalog: {room: [], instrument: []},
                catalogLoading: false
            }
        },
        computed: {
            bindOptions() {
                return this.bindCatalog[this.bindKind] || [];
            },
            boundRooms() {
                return (this.bingThings || []).filter(item => Number(item.type) === 11);
            },
            boundInstruments() {
                return (this.bingThings || []).filter(item => Number(item.type) === 4);
            }
        },
        mounted() {
            this.handleDeviceBinding()
        },
        watch: {
            id() {
                this.handleDeviceBinding();
            }
        },
        methods: {
            ...mapMutations({
                handleDrawerOpen: 'DRAWEROPEN',
            }),
            typeLabel(type) {
                return Number(type) === 11 ? '房间' : '仪器';
            },
            emitBindFlag(list) {
                const isBind = (list || []).some(item => item.type == 4 || item.type == 11);
                this.$emit('handle', !!(list && list.length && isBind));
            },
            handleDeviceBinding () {
              if (this.relateDeviceList) {
                this.bingThings = this.relateDeviceList
                this.emitBindFlag(this.bingThings);
              } else {
                getDeviceBinding({equipmentIdStr: this.id}).then(res => {
                  if (res.code) {
                    this.bingThings = res.items || [];
                    this.emitBindFlag(this.bingThings);
                  }
                })
              }
            },
            async openBind(kind) {
                this.bindKind = kind;
                this.bindTargetId = null;
                this.bindDialogVisible = true;
                this.catalogLoading = true;
                this.$set(this.bindCatalog, kind, []);
                try {
                    const res = await getDemoBindableCatalog(kind);
                    if (res.code !== 1) throw new Error(res.message || '绑定目录加载失败');
                    this.$set(this.bindCatalog, kind, res.items || []);
                } catch (_) {
                    this.$message.error('绑定目录加载失败，请重试');
                } finally {
                    this.catalogLoading = false;
                }
            },
            async handleBindSubmit() {
                if (this.catalogLoading) return;
                if (!this.bindTargetId) {
                    return this.$message.error('请选择要绑定的事物');
                }
                this.bindSubmitting = true;
                try {
                    let res;
                    if (this.bindKind === 'room') {
                        res = await addRoomThings({
                            thingsId: this.bindTargetId,
                            equipmentId: this.id,
                            equipmentType: 0
                        });
                    } else {
                        res = await getInstrumentThingsAdd([{
                            thingsId: this.bindTargetId,
                            equipmentId: this.id,
                            equipmentType: 0
                        }]);
                    }
                    if (res.code === 1) {
                        this.$message.success(this.$t('hardware.bindSuccess') || '绑定成功');
                        this.bindDialogVisible = false;
                        this.handleDeviceBinding();
                    } else {
                        this.$message.error(res.message || '绑定失败');
                    }
                } catch (e) {
                    this.$message.error(this.$t('common.networkError') || '网络错误');
                } finally {
                    this.bindSubmitting = false;
                }
            },
            handleUnbind(item) {
                const label = this.typeLabel(item.type) + '「' + item.name + '」';
                this.$confirm('确认解绑' + label + '？', this.$t('common.hint'), {
                    type: 'warning',
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel')
                }).then(async () => {
                    let res;
                    if (Number(item.type) === 11) {
                        res = await removeRoomThings({
                            equipmentId: this.id,
                            equipmentType: 0,
                            thingsId: item.id,
                            thingsType: 11
                        });
                    } else {
                        res = await postInstrumentThingsRemove({
                            equipmentId: this.id,
                            equipmentType: 0,
                            thingsId: item.id
                        });
                    }
                    if (res.code === 1) {
                        this.$message.success(this.$t('common.unBindSuccess') || '解绑成功');
                        this.handleDeviceBinding();
                    } else {
                        this.$message.error(res.message || '解绑失败');
                    }
                }).catch(() => {});
            },
            // 绑定关系拉起对应详情页
            handleDeviceDrawer(item) {
                if (item.type == 13) {
                    this.$refs.truckInfo.open({
                        id: item.id,
                        name: item.name,
                        no: item.name
                    })
                    return
                }
                switch (item.type) {
                    case 4:
                        this.deviceId = item.id;
                        if(item.openTwoSystem){
                            this.labDeviceDrawer = true;
                        }else{
                            this.handleDrawerOpen();
                        }
                        break
                    case 7:
                        this.deviceId = item.strId;
                        this.alerterDrawer = true;
                        break
                    case 11:
                        this.deviceId = item.id;
                        if(item.openTwoSystem){
                            this.isRoomDrawerNew = true;
                        }else{
                            this.isRoomDrawer = true;
                        }
                        break
                    case 14:
                        this.deviceId = item.strId;
                        this.isSignal = true;
                        break
                }
            },
        },
    }
</script>

<style lang="less" scoped>
.device-bind-relationship {
    width: 100%;

    .demo-bind-list {
        width: 100%;
        margin-top: 4px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-sizing: border-box;
    }

    .demo-bind-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 12px;
        min-height: 36px;
        padding: 8px 12px;
        border-radius: 4px;
        background: #f7f9fc;
        border: 1px solid #e8edf5;
        box-sizing: border-box;
        width: 100%;
    }

    .demo-bind-row--room {
        border-left: 3px solid #409eff;
    }

    .demo-bind-row--instrument {
        border-left: 3px solid #67c23a;
    }

    .demo-bind-tag {
        flex-shrink: 0;
        min-width: 40px;
        padding: 2px 8px;
        border-radius: 2px;
        font-size: 12px;
        line-height: 20px;
        text-align: center;
        color: #fff;
        background: #409eff;
    }

    .demo-bind-row--instrument .demo-bind-tag {
        background: #67c23a;
    }

    .demo-bind-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 10px 2px 12px;
        border-radius: 14px;
        background: #fff;
        border: 1px solid #dcdfe6;
        line-height: 24px;
        max-width: 100%;
    }

    .demo-bind-name {
        color: #303133;
        font-size: 13px;
        white-space: nowrap;
    }

    .demo-bind-unbind {
        padding: 0 4px;
        margin-left: 2px;
        flex-shrink: 0;
    }

    .demo-bind-empty {
        color: #909399;
        font-size: 13px;
    }
}
</style>
