<template>
  <div class="desinerLayout" :class="{demo_room_designer: isDemo}">
    <!-- <div class="btn-group">
      <el-button type="primary" class="btn-default" @click="handleSave"
        >保存配置</el-button
      >
    </div> -->
    <div ref="container" class="layout">
      <div
          v-if="Object.keys(dragNode).length > 0"
          ref="dragNode"
          class="designerItem dragVirtualdom"
      >
        <div
            ref="dragNodeIcon"
            :style="{
            background: `url(${BASE_URL + dragNode.logoUrl}) no-repeat`,
            backgroundSize: 'auto 100%',
            backgroundPosition: 'center center',
          }"
            class="icon"
        ></div>
        <div class="name">{{ dragNode.name }}</div>
      </div>
      <div class="layout-left">
        <div class="title">{{ $t('dataV.labDeviceList') }}</div>
        <p v-if="isDemo" class="demo-hint">待放置设备：{{ designer.length }}<br>拖入底图，或点击放置</p>
        <div class="container">
          <el-scrollbar style="height: calc(100% - 60px)">
            <div class="designerGroup">
              <div
                  v-for="(item, index) in designer"
                  :key="item.id"
                  class="designerItemWrap"
              >
                <div
                    v-drag="{ ...item, index }"
                    :draggable="isDemo"
                    @dragstart="isDemo && $event.dataTransfer.setData('text/plain', String(item.id))"
                    @click="isDemo && placeDevice(item)"
                    :data-id="item.id"
                    class="designerItem"
                >
                  <div
                      :style="{
                      background: `url(${deviceImage(item)}) no-repeat`,
                      backgroundSize: 'auto 100%',
                      backgroundPosition: 'center center',
                    }"
                      class="icon"
                  ></div>
                  <div class="name">{{ item.name }}</div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <div class="keep-save">
          <el-button class="btn-default" :class="{'demo-exit':isDemo}" :type="isDemo ? undefined : 'primary'" @click="handleExit">{{ isDemo ? '取消并退出' : $t('dataV.outDeploy') }}</el-button>
          <el-button v-if="isDemo" class="btn-default demo-undo" @click="handleUndo">撤销修改</el-button>
          <el-button v-if="isDemo" class="btn-default demo-reset" type="warning" plain @click="handleResetLayout">重置布局</el-button>
          <el-button class="btn-default" type="primary" :loading="saveLoading" @click="handleSave">{{ $t('dataV.saveDeploy') }}</el-button>
        </div>
      </div>
      <div ref="designerLayout" class="layout-right" @dragover.prevent @drop.prevent="handleDrop">
        <Designer
            ref="designer"
            :config="layoutConfig"
            :data="drawNode"
            :ratio="ratio"
            @handleDeviceList="handleDeviceList"
            @handleSave="handleSave"
        ></Designer>
      </div>
    </div>
  </div>
</template>
<script>
import Designer from "./components/Designer.vue";
import {postInstrumentList} from "@/api/labDevice";
import {BASE_URL} from "@/utils/constant.js";
import {
  mapElementConfig,
  mapElementGetRoonInstrumentInfoList,
} from "@/api/centerController";
import {resetDemoRoomLayout} from "@/api/demoLayout";
import {mapState, mapMutations} from "vuex";
import {ERROR} from "@/utils/constant";
import {resolveDeviceAssetUrl} from '@/utils/demoDeviceUrl';
import {roomFrame, validPlacement} from '@/utils/demoLayoutGeometry';

const isDemo = process.env.VUE_APP_DEMO === "true";

export default {
  components: {
    Designer,
  },
  data() {
    return {
      designer: [],
      dragNode: {},
      layoutConfig: {},
      drawNode: [],
      BASE_URL,
      saveLoading: false,
      roomId: "",
      mapUrl: "",
      modifyDeviceList: [],
      ratio: 1,
      isDemo, original: [], leavingSaved: false
    };
  },
  computed: {
    ...mapState("cmap", {
      deviceDrawerList: "deviceDrawerList",
    }),
    dirty() { return isDemo && JSON.stringify(this.original) !== JSON.stringify(this.deviceDrawerList); },
  },
  directives: {
    drag: function (el, binding, vnode) {
      let dragBox = el;
      let _ = vnode.context;
      dragBox.onmousedown = (e) => {
        if (process.env.VUE_APP_DEMO === "true") {
          return;
        }
        let {id} = binding.value;
        let drawNode = _.deviceDrawerList.slice(0);
        var mediaId = binding.value.mediaId ? binding.value.mediaId : binding.value.roomId;
        drawNode.push({
          elementId: binding.value.id,
          mediaId: mediaId,
          sortIndex: _.deviceDrawerList.length,
          senorStatus: binding.value.bingStatus,
          types: binding.value.types,
          logoUrl: binding.value.logoUrl,
          x: _.layoutConfig.width / 2,
          y: _.layoutConfig.height / 2,
        });
        _.handleSetDrawerList({deviceList: drawNode});
        _.designer = _.designer.filter((d) => d.id !== id);
        // _.drawNode.push({
        //   ...binding.value,
        //   x: _.layoutConfig.width / 2,
        //   y: _.layoutConfig.height / 2,
        // });
      };
    },
  },
  mounted() {
    const _ = this;
    let {roomId, mapUrl} = this.$route.query;
    if (roomId) {
      this.roomId = roomId;
      this.mapUrl = mapUrl;
    }
    _.handleResize();
    if (roomId) {
      this.getDeviceDataAsync(roomId);
    }
    // window.onresize = () => {
    //   return (() => {
    //     _.handleResize();
    //   })();
    // };
  },
  beforeRouteLeave(to, from, next) {
    if (!isDemo) return next();
    const leave = () => { this.$el.style.display = 'none'; next(); };
    if (!this.dirty || this.leavingSaved) return leave();
    this.$confirm('修改尚未保存，确定退出？', '提示').then(leave).catch(() => next(false));
  },
  methods: {
    handleExit() { if (isDemo) this.$router.push({path:'/room/view', query: {roomId:this.roomId, roomName:this.$route.query.roomName}}); else this.$router.back(); },
    handleUndo() { this.handleSetDrawerList({deviceList: JSON.parse(JSON.stringify(this.original))}); this.refreshCandidates(); },
    refreshCandidates() {
      const placed = new Set(this.deviceDrawerList.map(item => Number(item.elementId || item.id)));
      this.designer = this.modifyDeviceList.filter(item => !placed.has(Number(item.id)));
    },
    deviceImage(item) { return isDemo ? resolveDeviceAssetUrl(item.logoUrl, BASE_URL) : BASE_URL + item.logoUrl; },
    handleDrop(event) {
      if (!isDemo) return;
      const item = this.designer.find(row => Number(row.id) === Number(event.dataTransfer.getData('text/plain')));
      if (!item) return;
      const canvas = this.$refs.designer.$refs.stage.getNode().container().getBoundingClientRect();
      this.placeDevice(item, (event.clientX-canvas.left)/this.ratio, (event.clientY-canvas.top)/this.ratio);
    },
    placeDevice(item, x, y) {
      if (!this.designer.some(row => row.id === item.id)) return;
      const frame = roomFrame(this.roomId);
      const next = {...item, elementId:item.id, mediaId:Number(this.roomId), roomId:Number(this.roomId),
        x:x == null ? frame.x+frame.width/2 : x, y:y == null ? frame.y+frame.height/2 : y,
        rotation:0, scaleX:0.8, scaleY:0.8, sortIndex:this.deviceDrawerList.length,
        isEdit:1, isMonitor:1, type:4};
      if (!validPlacement(next, this.roomId)) return this.$message.warning('请将设备完整放入房间底图内。');
      this.handleSetDrawerList({deviceList:this.deviceDrawerList.concat(next)});
      this.refreshCandidates();
    },
    ...mapMutations("cmap", {
      handleSetDrawerList: "SETDEVICELIST",
    }),
    // 房间设备
    async getDrawerDataAsync(roomId) {
      try {
        let temp = [];
        let stemp = [];
        let result = await mapElementGetRoonInstrumentInfoList(roomId);
        if (result.code === 1) {
          if (
              result.items &&
              result.items.list &&
              result.items.list.length >= 0
          ) {
            temp = result.items.list;
            temp.map((tm) => {
              let obj = {
                ...tm,
                logoUrl: tm.url,
              };
              stemp.push(obj);
            });
            stemp.sort(function (a, b) {
              return a.sortIndex - b.sortIndex
            })
          }
        }
        //  this.roomList = temp;
        this.handleSetDrawerList({deviceList: stemp});
        if (isDemo) this.original = JSON.parse(JSON.stringify(stemp));
        // this.$refs.designer.modifyDeviceList = JSON.parse(JSON.stringify(stemp))
      } catch (err) {
        // this.roomList = [];
        this.handleSetDrawerList({deviceList: []});
        throw err;
      }
    },
    // 设备列表
    async getDeviceDataAsync() {
      try {
        let rml = [];
        await this.getDrawerDataAsync(this.roomId);
        let result = await postInstrumentList({
          roomId: this.roomId,
          pageSize: 100000,
          pageNum: 1,
        });
        let temp = [];
        if (result.code === 1) {
          this.modifyDeviceList = result.items.list.map(item => isDemo ? {...item, logoUrl:item.layoutAssetKey} : item);
          temp = this.modifyDeviceList;
          let rdl = this.deviceDrawerList;
          let idArray = [];
          rdl.map((r) => {
            idArray.push(r.id);
          });
          rml = temp.filter((t) => !idArray.includes(t.id));
        }
        this.designer = rml;
        if (isDemo) this.refreshCandidates();
      } catch (err) {
        throw err;
      }
    },
    // 保存配置提交
    async saveAsync(mapElementList) {
      try {
        this.saveLoading = true;
        let result = await mapElementConfig(isDemo ? {type:4, roomId:Number(this.roomId), list:mapElementList} : mapElementList);
        let {roomName} = this.$route.query;
        if (result.code == 1) {
          this.$message.success(this.$t('dataV.successDeploy'));
          if (isDemo) { this.saveLoading = false; this.leavingSaved = true; this.handleExit(); return; }
          let _ = this;
          const delay = isDemo ? 400 : 3000;
          this.timer = setTimeout(function () {
            _.$router.push({
              path: "/room/view",
              query: {
                roomId: _.roomId,
                roomName
              },
            });
            _.handleSetDrawerList({deviceList: mapElementList});
          }, delay);
        } else {
          this.$message.error(result.message);
        }
        this.saveLoading = false;
      } catch (err) {
        this.saveLoading = false;
        this.$message.error((err && err.message) || ERROR);
        throw err;
      }
    },
    async handleResetLayout() {
      if (!isDemo || !this.roomId) return;
      try { await this.$confirm('重置会立即保存种子布局，确定重置？', '提示'); } catch (_) { return; }
      try {
        const res = await resetDemoRoomLayout(this.roomId);
        if (res && res.code === 1) {
          this.$message.success('已恢复种子布局');
          await this.getDrawerDataAsync(this.roomId);
          this.refreshCandidates();
        } else {
          this.$message.error((res && res.message) || '重置失败');
        }
      } catch (err) {
        this.$message.error((err && err.message) || '重置失败');
      }
    },
    handleResize() {
      // let width = this.$refs.designerLayout.offsetWidth;
      // let height = this.$refs.designerLayout.offsetHeight;
      if (screen.height < 1080) {
        if (screen.height >= 800) {
          this.ratio = 0.7;
        } else {
          this.ratio = 0.55
        }
      }
      let width = 1600 * this.ratio;
      let height = 790 * this.ratio;
      this.layoutConfig = {
        width,
        height,
        mapUrl: this.mapUrl,
        roomId: this.roomId,
      };
    },
    // 保存配置按钮
    handleSave() {
      let rm = this.deviceDrawerList;
      if (this.$refs.designer.isOutOfRange === 1) {
        this.$message.error(this.$t('dataV.outScoped'));
      } else {
        if (isDemo || (rm.length && rm.length > 0)) {
          let mapElementList = [];
          rm.map((rm, i) => {
            // console.log(rm)
            let obj = {
              ...rm,
              sortIndex: i,
              type: 4,
            };
            mapElementList.push(obj);
          });
          this.saveAsync(mapElementList);
        } else {
          this.$message.error(this.$t('dataV.beforeDeploy'));
        }
      }
    },
    // 更新设备列表
    handleDeviceList(e) {
      if (isDemo) return this.refreshCandidates();
      for (var i = 0; i < this.modifyDeviceList.length; i++) {
        if (this.modifyDeviceList[i].id == e.elementId) {
          this.designer.push(this.modifyDeviceList[i])
        }
      }
    },
  },
  destroyed() {
    if (this.$route.name !== "RoomView") {
      localStorage.removeItem("floorViewFullPath")
    }
  },
};
</script>

<style lang="less" scoped>
.desinerLayout {
  position: fixed;
  height: calc(100% - 80px);
  top: 60px;
  left: 20px;
  right: 20px;

  &.demo_room_designer {
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    background: #f5f7fb;
    z-index: 10;

    .layout {
      height: 100%;
      box-sizing: border-box;
      border-color: #dce3ec;
    }

    .layout-left { background: #f5f7fb; }
    .layout-right { background: #173047; }
    .keep-save .demo-exit {background:#fff; border-color:#c8d0dc; color:#566273;}
    .keep-save .demo-undo {background:#eef2ff; border-color:#b9c2ee; color:#4654ad;}
    .keep-save .demo-reset {background:#fff6e8; border-color:#e8b468; color:#a96412;}
    .keep-save .demo-exit:hover {background:#edf0f5;}
    .keep-save .demo-undo:hover {background:#dfe6ff;}
    .keep-save .demo-reset:hover {background:#ffebcc;}
  }

  .btn-group {
    padding: 10px 0;
    height: 60px;

    .btn-default {
      float: right;
      height: 40px;
      margin-left: 20px;
    }
  }
}

.keep-save {
  width: 200px;
  position: absolute;
  bottom: 0;
  text-align: center;

  .btn-default {
    //padding: 0 45px;
    height: 40px;
    margin: 0 10px 10px;
  }
}

.layout {
  padding-left: 200px;
  border: 1px solid;
  height: calc(100% - 60px);
  position: relative;

  .dragVirtualdom {
    height: 115px;
    position: absolute;
    user-select: none;
    position: absolute;
    z-index: 999;

    .icon {
      height: 85px;
    }

    .name {
      margin-top: 8px;
      text-align: center;
    }
  }

  .layout-left {
    position: absolute;
    width: 200px;
    left: 0;
    top: 0;
    bottom: 0;
    border-right: 1px solid #e5e5e5;

    .demo-hint{
      padding: 10px 0 0 10px;
    }

    .title {
      height: 45px;
      line-height: 45px;
      text-align: center;
      border-bottom: 1px solid #e5e5e5;
    }

    .container {
      height: calc(100% - 102px);
      padding-right: 8px;

      /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
      }

      .designerGroup {
        padding: 0 2px 0 10px;

        .designerItemWrap {
          margin-top: 20px;
          height: 115px;
          position: relative;
          user-select: none;
        }

        .designerItem {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          cursor: grab;

          .icon {
            height: 85px;
          }

          .name {
            margin-top: 8px;
            text-align: center;
          }
        }
      }
    }
  }

  .layout-right {
    height: 100%;
    overflow: auto;
  }
}
</style>
