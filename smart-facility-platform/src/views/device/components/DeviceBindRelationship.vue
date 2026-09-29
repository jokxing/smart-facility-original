<template>
    <el-row v-if="bingThings.length && bingThings[0].name">
        <el-col :lg="3">
            <el-descriptions :title="$t('hardware.bindThings')"></el-descriptions>
        </el-col>
        <a v-for="item in bingThings" :key="item.id" class="margin-small-right" @click="handleDeviceDrawer(item)">
            <span>{{ item.name }}</span>
        </a>

        <!-- 开通2.0打开新详情 -->
        <LabDeviceDrawer :id="deviceId" :is-drawer.sync="labDeviceDrawer" />
        <RoomDrawerNew :isDrawer.sync="isRoomDrawerNew" :roomId.sync="deviceId" />

        <!-- 没开通2.0打开旧详情 -->
        <Drawer>
            <DrawerPage :detailId="deviceId"></DrawerPage>
        </Drawer>
        <RoomDrawer :isDrawer.sync="isRoomDrawer" :roomId.sync="deviceId" />
        <RefrigerateTruckInfo ref="truckInfo"/>
        <alerter-drawer :id.sync="deviceId" :is-drawer.sync="alerterDrawer"/>
        <signal-source-drawer v-if="isSignal" :id.sync="deviceId" :is-drawer.sync="isSignal"/>
    </el-row>
</template>

<script>
    import LabDeviceDrawer from "@/views/labDevice/components/LabDeviceDrawer";
    import RoomDrawer from "@/views/room/components/RoomDrawer";
    import RoomDrawerNew from "@/views/room/components/RoomDrawerNew";
    import Drawer from "@c/Drawer";
    import RefrigerateTruckInfo from "@/views/transport/components/RefrigerateTruckInfo"
    import DrawerPage from "@/views/detail";
    import { getDeviceBinding } from "@/api/device";
    import {mapMutations, mapState} from 'vuex'
    export default {
        props: ['id', 'relateDeviceList'],
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
                bingThings: [],
                deviceId: null,
                labDeviceDrawer: false,
                alerterDrawer: false,
                isRoomDrawer: false,
                isRoomDrawerNew: false,
                isSignal: false,
            }
        },
        mounted() {
            this.handleDeviceBinding()
        },
        methods: {
            ...mapMutations({
                handleDrawerOpen: 'DRAWEROPEN',
            }),
            handleDeviceBinding () {
              if (this.relateDeviceList) {
                this.bingThings = this.relateDeviceList
              } else {
                getDeviceBinding({equipmentIdStr: this.id}).then(res => {
                  if (res.code) {
                    this.bingThings = res.items;
                    const isBind = res.items.some(item => item.type == 4 || item.type == 11)
                    if (res.items.length > 0){
                      this.$emit("handle", isBind)
                    } else{
                      this.$emit("handle", false)
                    }
                  }
                })
              }
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
