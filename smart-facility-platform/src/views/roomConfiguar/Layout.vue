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
                    :data-id="item.id"
                    class="designerItem"
                >
                  <div
                      :style="{
                      background: `url(${BASE_URL + item.logoUrl}) no-repeat`,
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
          <el-button class="btn-default" type="primary" @click="$router.back()">{{ $t('dataV.outDeploy') }}</el-button>
          <el-button v-if="isDemo" class="btn-default" type="primary" @click="handleResetLayout">重置布局</el-button>
          <el-button class="btn-default" type="primary" :loading="saveLoading" @click="handleSave">{{ $t('dataV.saveDeploy') }}</el-button>
        </div>
      </div>
      <div ref="designerLayout" class="layout-right">
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
      isDemo
    };
  },
  computed: {
    ...mapState("cmap", {
      deviceDrawerList: "deviceDrawerList",
    }),
  },
  directives: {
    drag: function (el, binding, vnode) {
      let dragBox = el;
      let _ = vnode.context;
      dragBox.onmousedown = (e) => {
        if (process.env.VUE_APP_DEMO === "true") {
          return _.$message.info("演示模式仅调整已上图设备位置，不支持从侧栏新增");
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
  methods: {
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
        if (isDemo) {
          // Demo: already-placed devices only; skip unmocked /instrument/list sidebar.
          this.modifyDeviceList = [];
          this.designer = [];
          return;
        }
        let result = await postInstrumentList({
          roomId: this.roomId,
          pageSize: 100000,
          pageNum: 1,
        });
        let temp = [];
        if (result.code === 1) {
          this.modifyDeviceList = result.items.list;
          temp = result.items.list;
          let rdl = this.deviceDrawerList;
          let idArray = [];
          rdl.map((r) => {
            idArray.push(r.id);
          });
          rml = temp.filter((t) => !idArray.includes(t.id));
        }
        this.designer = rml;
      } catch (err) {
        throw err;
      }
    },
    // 保存配置提交
    async saveAsync(mapElementList) {
      try {
        this.saveLoading = true;
        let result = await mapElementConfig(mapElementList);
        let {roomName} = this.$route.query;
        if (result.code == 1) {
          this.$message.success(this.$t('dataV.successDeploy'));
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
      try {
        const res = await resetDemoRoomLayout(this.roomId);
        if (res && res.code === 1) {
          this.$message.success('已恢复种子布局');
          await this.getDrawerDataAsync(this.roomId);
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
        if (rm.length && rm.length > 0) {
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
    top: 20px;
    height: calc(100% - 40px);
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
