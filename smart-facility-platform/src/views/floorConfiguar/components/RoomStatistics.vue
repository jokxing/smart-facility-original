<template>
  <el-drawer
    :title="$t('dataV.roomStat')"
    :visible.sync="overviewVisible"
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
                    {{ $t('dataV.offLineDevice') }} <em class="errorTxt">{{ item.policeNum }}</em>
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
      this.handleSetIsDrawer();
    },
    handleSeedRoomDetail(id) {
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
  @import "../index.less";
  .roomList{
    /deep/ .el-scrollbar__wrap{
      overflow: hidden;
    }
  }
</style>
