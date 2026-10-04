<template>
  <el-drawer
    :title="$t('dataV.roomStat')"
    :visible="overviewVisible"
    :direction="direction"
    :withHeader="false"
    :size="size"
    :modal="false"
    custom-class="drawer-overview"
    :before-close="handleDrawerClose"
    :modal-append-to-body="false"
  >
    <div class="roomOverview">
      <div class="roomOverview-title">{{ $t('dataV.floorStat') }}</div>
      <button class="overview-close" aria-label="关闭楼层统计" @click="handleDrawerClose">×</button>
      <div class="roomOverview-container">
        <div class="box statistics">
          <div class="item">
            <div class="num successTxt">{{ floorStatistics.normalNum }} <span></span></div>
            <div class="status">{{ $t('dataV.normalDevice') }}</div>
          </div>
          <div class="item">
            <div class="num errorTxt">{{ floorStatistics.policeNum }} <span></span></div>
            <div class="status">{{ $t('dataV.alarmDevice') }}</div>
          </div>
          <div class="item">
            <div class="num offlineTxt">{{ floorStatistics.leaveNum }} <span></span></div>
            <div class="status">{{ $t('dataV.offLineDevice') }}</div>
          </div>
        </div>
        <div class="roomList">
          <el-scrollbar style="height: 100%">
            <div
              class="box roomList-item"
              v-for="item in roomList"
              :key="item.id"
              @click="handleSeedRoomDetail(item.id)"
            >
              <div class="flexBox">
                <div class="title">{{ item.name }}</div>
                <div class="status">
                  <!-- <span>25.1℃</span>
                  <span>10Pa</span> -->
                </div>
              </div>
              <div class="flexBox content boxPadding">
                <div class="name">
                    {{ $t('labDevice.labDeviceSum') }} <em>{{ item.totalNum }}</em>
                </div>
                <div class="valStr">
                    {{ $t('dataV.alarmDevice') }} <em class="errorTxt">{{ item.policeNum }}</em>
                </div>
              </div>
              <div class="flexBox boxPadding">
                <div class="name">
                    {{ $t('dataV.normalDevice') }} <em class="successTxt">{{ item.normalNum }}</em>
                </div>
                <div class="valStr">
                    {{ $t('dataV.offLineDevice') }} <em class="offlineTxt">{{ item.leaveNum }}</em>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<script>
import "@/plugins/konva";
import { mapState, mapMutations } from "vuex";
const isDemo = process.env.VUE_APP_DEMO === 'true';
export default {
  props: {
    floorData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      visible: true,
      direction: "ltr",
      size: "14.7%",
      floorStatistics: {},
      roomList: [],
    };
  },
  watch: {
    floorData: {
      handler(newVal) {
        if (isDemo) {
          this.roomList = ((newVal && newVal.labList) || []).map(room => {
            const count = room.deviceSummary || {};
            return {...room, totalNum: count.total || 0, normalNum: count.normal || 0,
              policeNum: count.alarm || 0, leaveNum: count.offline || 0};
          });
          this.floorStatistics = this.roomList.reduce((sum, room) => ({
            normalNum: sum.normalNum + room.normalNum,
            policeNum: sum.policeNum + room.policeNum,
            leaveNum: sum.leaveNum + room.leaveNum
          }), {normalNum:0, policeNum:0, leaveNum:0});
          return;
        }
        if (
          newVal &&
          Object.keys(newVal).length &&
          Object.keys(newVal).length > 0
        ) {
          this.floorStatistics = newVal.roomStat;
          let temp = newVal.instrumentStat;
          let stemp = [];
          this.roomList = newVal.instrumentStat;

          for (let i = 0; i < temp.length; i++) {
            let ctemp = [];
            for (let j = 0; j < temp[i].simpleEquipments.length; j++) {
              for (
                let k = 0;
                k < temp[i].simpleEquipments[j].sensors.length;
                k++
              )
                ctemp.push(temp[i].simpleEquipments[j].sensors[k]);
            }
            let obj = {
              ...temp[i],
              deviceList: ctemp,
            };
            stemp.push(obj);
          }
        }
      },
      immediate: true,
      deep: true,
    },
  },

  computed: {
    ...mapState("cmap", {
      overviewVisible: "overviewVisible",
    }),
  },
  methods: {
    ...mapMutations("cmap", {
      handleSetIsDrawer: "SETISOVERVIEWDRAWER",
    }),
    handleDrawerClose() {
      if (this.overviewVisible) this.handleSetIsDrawer();
    },
    handleSeedRoomDetail(id) {
      this.handleDrawerClose();
      this.$router.push({
        name: "RoomView",
        query: {
          roomId: id,
        },
      });
    },
  },
};
</script>
<style  lang="less" scoped>
  .overview-close { position:absolute; right:12px; top:12px; width:28px; height:28px; padding:0; border:1px solid #89bed1; border-radius:50%; background:#173047; color:white; font-size:24px; line-height:24px; cursor:pointer; }
  @import "../index.less";
  .roomList{
    /deep/ .el-scrollbar__wrap{
      overflow: hidden;
    }
  }
</style>
