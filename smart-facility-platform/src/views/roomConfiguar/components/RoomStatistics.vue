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
      <div class="roomOverview-title">{{ $t('dataV.roomStat') }}</div>
      <div class="roomOverview-container">
        <div class="box statistics" v-if="roomStatistics">
          <div class="item">
            <div class="num successTxt">{{ roomStatistics.normalNum }}</div>
            <div class="status">{{ $t('common.normal') }}</div>
          </div>
          <div class="item">
            <div class="num errorTxt">{{ roomStatistics.policeNum }}</div>
            <div class="status">{{ $t('common.abnormal') }}</div>
          </div>
          <div class="item">
            <div class="num">{{ roomStatistics.leaveNum }}</div>
            <div class="status">{{ $t('common.offLine') }}</div>
          </div>
        </div>
        <div class="box statusSet" v-if="list.length > 0">
          <div
            class="status-item"
            v-for="item in list"
            :key="item.id"
          >
            <div class="name">{{ item.sensorType.name }}</div>
            <div
              class="valStr"
              :class="`${
                item.status == -100
                  ? 'offlineTxt'
                  : item.status == -1
                  ? 'errorTxt'
                  : item.status == 1
                  ? 'successTxt'
                  : ''
              }`"
            >
              {{ handleSensor(item) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import "@/plugins/konva";
export default {
  props: {
    roomData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      visible: true,
      direction: "ltr",
      size: 300,
      list: [],
      roomStatistics: {},
    };
  },
  watch: {
    roomData: {
      handler(newVal) {
        if (
          newVal &&
          Object.keys(newVal).length &&
          Object.keys(newVal).length > 0
        ) {
          this.roomStatistics = newVal.board;
          let temp = newVal.simpleEquipmentList;
          let stemp = [];
          for (let i = 0; i < temp.length; i++) {
            for (let j = 0; j < temp[i].sensors.length; j++) {
              stemp.push(temp[i].sensors[j]);
            }
          }
          this.list = stemp;
        }
      },
      immediate: true,
      deep: true,
    },
  },

  computed: {
    ...mapState("cmap", {
      overviewVisible: "overViewRoomVisible",
    }),
  },
  methods: {
    ...mapMutations("cmap", {
      handleSetIsDrawer: "SETISOVERVIEWROOMDRAWER",
    }),
    handleDrawerClose() {
      this.handleSetIsDrawer();
    },
  },
};
</script>
<style  lang="less" scoped>
  @import "../index.less";
</style>>
