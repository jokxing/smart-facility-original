<template>
  <div
    class="desinerLayout designer_fullScreen"
    v-loading="loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    style="touch-action: none;">
    <div class="designerHeader">
      <div
        class="unfolder"
        :class="overviewVisible ? 'folderUp' : ''"
        @click="handleClickIsFolder"
      ></div>
      <div class="title">{{ title }}</div>
      <div class="tab">
        <div
          v-for="(item,index) in tabs"
          :key="item.types"
          :class="{ active: index == tabIndex}"
          @click="handleTab(item,index)">
            {{ item.text }}
        </div>
      </div>
      <div class="nav">
        <div class="navItem back" @click="handleBackToList"><i></i> {{ $t('common.back') }}</div>
        <div class="navItem" @click="handleConfiguar">{{ $t('dataV.inDeploy') }}</div>
        <div v-if="isDemo" class="navItem" @click="handleDemoScenarioCycle">场景·{{ demoScenarioLabel }}</div>
        <div class="navItem" @click="handleToScreen">{{ $t('dataV.inDataV') }}</div>
      </div>
    </div>
    <div class="layout" :style="{transform}" ref="layout" @mousewheel.prevent="detectZoom" @touchstart.capture="handleTouchstart" @touchmove="handleTouchmove" @touchend="handleTouchend">
      <v-stage ref="stage" :config="config">
        <v-layer ref="backgroundLayer">
          <v-image :config="bgConfig"></v-image>
        </v-layer>
        <v-layer ref="deviceLayer" :config="deviceLayer">
          <template v-for="(item, index) in deviceList">
            <v-group
              :key="item.id"
              :config="{
                x: item.x * ratio,
                y: item.y * ratio,
                name: `deviceGroup${index}`,
                width: isDemo ? 128 : 100,
              offsetX: isDemo ? 64 : 0,
              offsetY: isDemo ? 72 : 0,
                height: isDemo ? 144 : 100,
                rotation: item.rotation,
                scaleX: item.scaleX * ratio || ratio,
                scaleY: item.scaleY * ratio || ratio,
              }"
              @mouseover="handleMouseOver"
              @mouseout="handleMouseOut"
              @mousedown="handleMouseDown(item, $event)"
              @touchstart="handleMouseDown(item, $event)"
            >
              <ImageNode
                :id="item.id"
                :image="resolveDeviceImage(item.url)"
                :y="10 + 100 * index"
              />
              <!--              status == 4,表示无状态,不显示圆圈-->
              <div v-if="item.isMonitor == 1 && item.status != 4">
                <v-circle :config="handleSerialize(item)"></v-circle>
              </div>
            </v-group>
          </template>
        </v-layer>
      </v-stage>
    </div>
    <RoomStatisticsDrawer :roomData="roomData"></RoomStatisticsDrawer>
    <LabDeviceDrawer :id="detailId" :is-drawer.sync="isDrawer"/>
    <Drawer>
      <DrawerPage :detailId="detailId"></DrawerPage>
    </Drawer>
  </div>
</template>
<script>
import { roomFrame } from "@/utils/demoLayoutGeometry";
import ImageNode from "./components/ImageNode.vue";
import RoomStatisticsDrawer from "./components/RoomStatistics.vue";
import Drawer from "@/components/Drawer";
import DrawerPage from "@/views/detail";
import LabDeviceDrawer from "@/views/labDevice/components/LabDeviceDrawer";
import {mapElementGetRoonInstrumentInfoList} from "@/api/centerController";
import {fetchDemoScenario, updateDemoScenario} from "@/api/demoScenario";
import {mapMutations, mapState} from "vuex";
import {BASE_URL} from "@/utils/constant.js";
import {resolveDeviceAssetUrl} from "@/utils/demoDeviceUrl";
import {resolveRoomMapUrlByRoomId} from "@/utils/demoRoomMapUrl";
import "@/plugins/konva";

const isDemo = process.env.VUE_APP_DEMO === "true";

export default {
  components: {
    ImageNode,
    RoomStatisticsDrawer,
    LabDeviceDrawer,
    Drawer,
    DrawerPage,
  },
  data() {
    return {
      loading: true,
      title: "房间",
      isDemo,
      demoScenario: 'normal',
      tabs: [
        {
          text: "全部",
          types: 0
        },
        {
          text: "实验室设备",
          types: 1
        },
        {
          text: "行政设备",
          types: 2
        },
        {
          text: "IT设备",
          types: 3
        }
      ],
      tabIndex: 0,
      config: {},
      bgConfig: {},
      deviceLayer: {},
      isDrawer: false,
      detailId: "",
      deviceList: [],
      deviceLists: [],
      BASE_URL,
      roomData: {},
      ratio: 1,
      transform: "",
      scal: 1.12,
      displacement: {
        moveable: false,
        scale: 1.12
      },
      blockChildEle: false,
      touSet: null,
      touSet2: null
    };
  },
  created() {
  },
  watch: {
    config: {
      handler(newVal) {
        let { width, height } = newVal;
        if (width || height) {
          // Demo loads the room crop in handleInit; keep the legacy generic bg for non-demo only.
          if (isDemo) return;
          this.$nextTick(() => {
            const image = new window.Image();
            image.src = require("@/assets/centerControl/roomBg.png");
            image.onload = () => {
              this.bgConfig = {
                x: 0,
                y: 0,
                image,
                width: width,
                height: height,
              };
            };
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },
  beforeRouteEnter (to, from, next){undefined
    next(vm => {undefined
      if(from.name === "FloorView"){
        localStorage.setItem("floorViewFullPath", from.fullPath)
      }
      vm.fromPath = from.fullPath
    })
  },
  mounted() {
    const _ = this;
    _.handleResize();
    window.onresize = () => {
      return (() => {
        _.handleResize();
      })();
    };

    if (this.$route.query) {
      let { roomId, roomName } = this.$route.query;
      if (roomId) {
        this.getDrawerDataAsync(+roomId);
      }
      if(roomName){
        this.title = roomName
      }
    }
    if (isDemo) {
      this.loadDemoScenario();
    }
  },
  computed: {
    ...mapState("cmap", {
      overviewVisible: "overViewRoomVisible",
    }),
    demoScenarioLabel() {
      if (this.demoScenario === 'alarm') return '异常';
      if (this.demoScenario === 'offline') return '离线';
      return '正常';
    },
  },
  methods: {
    ...mapMutations("cmap", {
      handleSetIsDrawer: "SETISOVERVIEWROOMDRAWER",
    }),
    ...mapMutations({
      handleDrawerOpen: "DRAWEROPEN",
    }),

    resolveDeviceImage(url) {
      const resolved = resolveDeviceAssetUrl(url, BASE_URL);
      return resolved || '';
    },

    async loadDemoScenario() {
      try {
        const res = await fetchDemoScenario();
        if (res && res.code === 1 && res.items) {
          this.demoScenario = res.items.scenario || 'normal';
        }
      } catch (_) {
        this.demoScenario = 'normal';
      }
    },

    async handleDemoScenarioCycle() {
      const order = ['normal', 'alarm', 'offline'];
      const next = order[(order.indexOf(this.demoScenario) + 1) % order.length];
      try {
        const res = await updateDemoScenario(next);
        if (res && res.code === 1 && res.items) {
          this.demoScenario = res.items.scenario;
          const roomId = this.$route.query && this.$route.query.roomId;
          if (roomId) {
            await this.getDrawerDataAsync(+roomId);
          }
        }
      } catch (err) {
        this.$message.error((err && err.message) || '场景切换失败');
      }
    },

    async getDrawerDataAsync(id) {
      try {
        let temp = [];
        let result = await mapElementGetRoonInstrumentInfoList(id);
        this.loading = false;
        if (result.code === 1) {
          this.roomData = result.items;
          if (
            result.items &&
            result.items.list &&
            result.items.list.length >= 0
          ) {
            temp = result.items.list;
          }
        }
        temp.sort(function(a,b){
          return a.sortIndex - b.sortIndex
        })
        this.deviceList = temp;
        this.deviceLists = temp
      } catch (err) {
        this.deviceList = [];
        this.deviceLists = [];
        throw err;
      }
    },
    handleClickIsFolder() {
      this.handleSetIsDrawer();
    },
    handleResize() {
      if (screen.height < 1080) {
        if (screen.height >= 800) {
          this.ratio = 0.7;
        } else {
          this.ratio = 0.62;
        }
      }
      let width = 1600 * this.ratio;
      let height = 790 * this.ratio;
      this.config = {
        width,
        height,
      };
      this.handleInit(width, height);
    },
    handleInit(width, height) {
      this.$nextTick(() => {
        const image = new window.Image();
        const roomId = this.$route.query && this.$route.query.roomId;
        if (isDemo) {
          const demoBg = resolveRoomMapUrlByRoomId(roomId, BASE_URL);
          image.src = demoBg || require("@/assets/centerControl/roomBg.png");
        } else {
          image.src = BASE_URL + "saas/svg/systemImage/17bc26de-75d2-440b-8510-10c3364ca60g.png";
        }
        image.onload = () => {
          this.bgConfig = {
            x: 0,
            y: 0,
            image,
            width: width,
            height: height,
            ...(isDemo ? roomFrame(roomId, width / 1600) : {}),
          };
        };
      });
    },
    handleSerialize(data) {
      let obj = {
        x: 50,
        y: 80,
        radius: 10,
      };

      // 圆点颜色，status后端逻辑是运行状态有值则用远行状态，否则则用参数状态
      let { status } = data;
      let color = "#13ce66";
      if(status == 1){
        color = "#13ce66";
      } else if (status == -100 || status == 0 || status == 2) {
        color = "#343f4b"
      } else {
        color = "#ff4949";
      }
      return {
        ...obj,
        fill: color,
      };
    },
    // tab
    handleTab(item,index) {
      this.tabIndex = index;
      var deviceList = JSON.parse(JSON.stringify(this.deviceLists))
      var arr = [];
      for(var i = 0; i < deviceList.length; i++){
        if(item.types === 0){
          arr = this.deviceLists;
        }else{
          if(deviceList[i].types === item.types){
            arr.push(deviceList[i])
          }
        }
      }
      this.deviceList = arr;
    },
    // 返回按钮
    handleBackToList() {
      if(localStorage.getItem("floorViewFullPath")){
        const fromPath = localStorage.getItem("floorViewFullPath");
        this.$router.push(fromPath);
      }else{
        this.$router.push("/building")
      }
      localStorage.removeItem("floorViewFullPath")
    },

    handleConfiguar() {
      var roleId = JSON.parse(localStorage.getItem('USERINFO')).roleId
      if(roleId != 5){
        let { roomId, roomName } = this.$route.query;
        this.$router.push({
          name: "RoomDesigner",
          query: {
            roomId,
            roomName
          },
        });
      }else{
        this.$message.error(this.$t('dataV.noRule'))
      }
    },

    handleToScreen() {
      let { roomId } = this.$route.query;
      this.$router.push({
        name: "RoomDataV",
        query: {
          roomId,
        },
      });
    },
    handleMouseOver() {
      document.body.style.cursor = "pointer";
    },
    handleMouseOut() {
      document.body.style.cursor = "default";
    },
    // 触摸事件
    handleTouchstart(event) {
      this.blockChildEle = true;
      this.touSet = setTimeout(() => {
        this.blockChildEle = false
      },300)

      var touches = event.touches;
      var events = touches[0];
      var events2 = touches[1];

      // event.preventDefault();

      // 第一个触摸点的坐标
      this.displacement.pageX = events.pageX;
      this.displacement.pageY = events.pageY;

      this.displacement.moveable = true;

      if (events2) {
        this.blockChildEle = true;
        clearTimeout(this.touSet);
        clearTimeout(this.touSet2);
        this.displacement.pageX2 = events2.pageX;
        this.displacement.pageY2 = events2.pageY;
      }

      this.displacement.originScale = this.displacement.scale || 1;
    },
    // 滑动事件
    handleTouchmove(event){
      this.blockChildEle = true;
      clearTimeout(this.touSet);

      if (!this.displacement.moveable) {
        return;
      }

      var touches = event.touches;
      var events = touches[0];
      var events2 = touches[1];

      if(events2){
        // 第2个指头坐标在touchmove时候获取
        if (!this.displacement.pageX2) {
          this.displacement.pageX2 = events2.pageX;
        }
        if (!this.displacement.pageY2) {
          this.displacement.pageY2 = events2.pageY;
        }

        var zoom =
          this.getDistance(
            {
              x: events.pageX,
              y: events.pageY
            },
            {
              x: events2 ? events2.pageX : '',
              y: events2 ? events2.pageY : ''
            }
          ) /
          this.getDistance(
            {
              x: this.displacement.pageX,
              y: this.displacement.pageY
            },
            {
              x: this.displacement.pageX2,
              y: this.displacement.pageY2
            }
          );
        // 应用在元素上的缩放比例
        var newScale = this.displacement.originScale * zoom;
        // 最大缩放比例限制
        if (newScale >= 1.2) {
          newScale = 1.2;
        }
        if(newScale <= 0.8){
          newScale = 0.8
        }
        // 记住使用的缩放值
        this.displacement.scale = newScale;
        // 图像应用缩放效果
        let elementKonva = document.querySelector(".konvajs-content");
        elementKonva.style.transform = "translateX(-50%) translateY(-50%) scale(" + newScale + ")";
      }
    },
    // 手指离开事件
    handleTouchend(event){
      if(event.touches.length <= 1){
        this.displacement.pageX2 = null;
        this.displacement.pageY2 = null
      }
    },
    // 点击设备
    handleMouseDown(record, e) {
      this.touSet2 = setTimeout(() => {
        if(!this.blockChildEle){
          if (isDemo) {
            return this.$message.info('演示模式请点「进入配置」调整设备位置');
          }
          if(record.isEdit === 1){
            this.detailId = record.elementId;
            if(record.openTwoSystem){
              this.isDrawer = true
            }else{
              this.handleDrawerOpen();
            }
          }else{
            this.$message.error(this.$t('dataV.noLookRule'))
          }
        }
      },350)
    },
    // 鼠标滚轮滚动
    detectZoom(e) {
      const ev = e || window.event;
      const element = document.getElementsByClassName("konvajs-content")[0];
      let down = true;
      down = ev.wheelDelta ? ev.wheelDelta < 0 : ev.detail > 0;
      if (down) {
        if (this.scal <= 0.8) {
          return this.scal = 0.8;
        } else {
          this.scal = (parseFloat(this.scal) - 0.01).toFixed(2);
        }
        element.style.transform = "translate(-50%, -50%) scale(" + this.scal + ")";
      } else {
        if (this.scal >= 1.2) {
          return false;
        }
        this.scal = (parseFloat(this.scal) + 0.01).toFixed(2);
        element.style.transform = "translate(-50%, -50%) scale(" + this.scal + ")";
      }
      if (ev.preventDefault) {
        ev.preventDefault();
      }
      return false;
    },
    getDistance(start, stop) {
      // Math.hypot()计算参数的平方根
      return Math.hypot(stop.x - start.x, stop.y - start.y);
    },
  },
};
</script>
<style lang="less" scoped>
  @import "./index.less";
</style>
