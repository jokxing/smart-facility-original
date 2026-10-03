<template>
  <div class="desinerLayout" v-loading="loading">
    <div ref="container" class="layout">
      <div
          v-if="Object.keys(dragNode).length > 0"
          ref="dragNode"
          class="designerItem dragVirtualdom"
      >
        {{ dragNode.name }}
      </div>
      <div class="layout-left">
        <div class="title">{{ $t('dataV.roomList') }}</div>
        <div class="container">
          <el-scrollbar style="height: calc(100% - 160px)">
            <div class="designerGroup">
              <div
                  v-for="(item, index) in roomList"
                  :key="item.id"
                  v-drag="{ ...item, index }"
                  :data-id="item.id"
                  :title="item.name"
                  class="designerItem"
              >
                {{ item.name }}
              </div>
            </div>
          </el-scrollbar>
        </div>
        <div class="keep-save">
          <el-button
              :loading="saveLoading"
              class="btn-default"
              @click="$router.back()"
          >{{ $t('dataV.outDeploy') }}
          </el-button>
          <el-button class="btn-default" :disabled="isDemo" @click="handleSystems">{{ $t('common.multiSelect') }}</el-button>
          <el-button
              :loading="saveLoading"
              class="btn-default"
              type="primary"
              :disabled="isDemo"
              :title="isDemo ? '演示模式仅支持只读预览，不可保存' : ''"
              @click="handleSave"
          >{{ $t('dataV.saveDeploy') }}
          </el-button>
        </div>
      </div>
      <div ref="designerLayout" class="layout-right">
        <Designer
            ref="designer"
            :ratio="ratio"
            :config="layoutConfig"
            @handleSave="handleSave"
        ></Designer>
      </div>
      <div class="handles margin-center">

      </div>
    </div>
  </div>
</template>
<script>
import Designer from "./components/Designer.vue";
import {getRoomList} from "@/api/room";
import {mapElementConfig, mapFloorOverview} from "@/api/centerController";
import {mapState, mapMutations} from "vuex";
import {ERROR} from "@/utils/constant";

let width = 1678, height = 795;
const isDemo = process.env.VUE_APP_DEMO === "true";

export default {
  components: {
    Designer,
  },
  data() {
    return {
      loading: true,
      // senorStatus    1:正常  2报警  -100 离线
      roomList: [], //左侧列表
      that: this,
      layoutConfig: {},
      dragNode: {},
      drawNode: [],
      saveLoading: false,
      timer: null,
      modifyRoomList: [],
      ratio: 1,
      isHandleSave: false,
      isDemo,
    };
  },
  directives: {
    drag: function (el, binding, vnode) {
      const roleId = JSON.parse(localStorage.getItem("USERINFO")).roleId;
      let dragBox = el;
      let _ = vnode.context;
      dragBox.onmousedown = (e) => {
        if (process.env.VUE_APP_DEMO === "true") {
          return _.$message.info("演示模式仅支持只读预览，不可拖拽配置");
        }
        if (roleId >= 4) {
          return _.$message.error(_.$t('dataV.noRule'));
        }
        const {index, id} = binding.value;
        _.roomList = _.roomList.filter((d) => d.id !== id);
        const drawNode = _.roomDrawerList.slice(0);
        drawNode.push({
          ...binding.value,
          fontSize: 14,
          x: _.layoutConfig.width / 2,
          y: _.layoutConfig.height / 2,
          isEdit: 1,
          width: 180,
          height: 80
        });
        _.handleSetDrawerList({roomList: drawNode});
        _.roomList = _.roomList.filter((d) => d.id !== id);
      }
    },
  },
  computed: {
    ...mapState("cmap", {
      roomDrawerList: "roomDrawerList",
    }),
  },
  created() {
    if (screen.height < 1080) {
      if (screen.height >= 800) {
        height = 611;
      }
    }
    if (screen.width < 1920) {
      width = 1295;
    }
  },
  mounted() {
    const _ = this;
    _.handleResize();
    let {floorId} = this.$route.query;
    if (floorId) {
      this.getRoomListAsync(+floorId);
    }
    // this.getDrawerDataAsync();

    window.onresize = () => {
      return (() => {
        _.handleResize();
      })();
    };
  },
  methods: {
    ...mapMutations("cmap", {
      handleSetDrawerList: "SETROOMLIST",
    }),
    handleResize() {
      let {mapUrl} = this.$route.query;
      if (screen.height < 1080) {
        if (screen.height >= 800) {
          this.ratio = 0.8;
        }else{
          this.ratio = 0.7;
        }
      }
      let width = 1678 * this.ratio;
      let height = 795 * this.ratio;
      this.layoutConfig = {
        width,
        height,
        mapUrl,
      };
    },
    handleSave() {
      if (isDemo) {
        return this.$message.info("演示模式仅支持只读预览，不可保存");
      }
      const {mapId} = this.$route.query;
      let rm = this.roomDrawerList;
      if (rm.length && rm.length > 0) {
        this.isHandleSave = true;
        let mapElementList = [];
        rm.map((rm) => {
          let {id} = rm;
          let obj = {
            elementId: id,
            mediaId: mapId,
            ...rm,
            scaleX: 1,
            scaleY: 1,
            id: null,
            type: 11,
          };
          mapElementList.push(obj);
        });
        this.saveAsync(mapElementList);
      } else {
        this.$message.error(this.$t('dataV.beforeDeploy'));
      }
    },
    handleSystems() {
      this.$refs.designer.handleTypeClick(null, 1);
    },
    async saveAsync(mapElementList) {
      try {
        let {floorId, mapUrl, mapId} = this.$route.query;
        this.saveLoading = true;
        let result = await mapElementConfig(mapElementList);
        if (result.code == 1) {
          this.$message.success(this.$t('dataV.successDeploy'));
          let _ = this;
          this.timer = setTimeout(function () {
            _.$router.push({
              path: "/floor/view",
              query: {
                floorId,
                mapUrl,
                mapId,
                floorName: _.$route.query.floorName
              },
            });
          }, 3000);
        } else {
          this.$message.error(result.message);
        }
        this.saveLoading = false;
      } catch (err) {
        this.saveLoading = false;
        this.$message.error(ERROR);
        throw err;
      }
    },
    async getRoomListAsync(floorId) {
      try {
        let rml = [];
        await this.getDrawerDataAsync(floorId);
        let result = await getRoomList({
          floorId,
          pageNum: 1,
          pageSize: 10000,
        });
        if (result.code === 1) {
          let temp = [];
          temp = result.items.list;
          let rdl = this.roomDrawerList;
          let idArray = [];
          rdl.map((r) => {
            idArray.push(r.id);
          });
          rml = temp.filter((t) => !idArray.includes(t.id));
        }
        this.roomList = rml;
      } catch (err) {
        this.roomList = [];
        if (!isDemo) throw err;
      }
    },
    async getDrawerDataAsync(floorId) {
      try {
        let temp = [];
        let result = await mapFloorOverview({
          floorId,
        });
        this.loading = false;
        if (result.code === 1) {
          if (
              result.items &&
              result.items.labList &&
              result.items.labList.length >= 0
          ) {
            temp = result.items.labList.filter(room => {
              const x = Number(room && room.x);
              const y = Number(room && room.y);
              return Number.isFinite(x) && Number.isFinite(y) && x > -1000 && y > -1000;
            });
          }
        }
        // this.roomList = temp;
        this.handleSetDrawerList({roomList: temp});
        this.$refs.designer.isRoomList = true
      } catch (err) {
        this.loading = false;
        // this.roomList = [];
        this.handleSetDrawerList({roomList: []});
        throw err;
      }
    },
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

}

.layout {
  padding-left: 200px;
  border: 1px solid;
  height: calc(100% - 60px);
  position: relative;

  .dragVirtualdom {
    height: 40px;
    line-height: 40px;
    text-align: center;
    border: 1px solid #e5e5e5;
    border-radius: 3px;
    position: absolute;
    user-select: none;
    z-index: 999;
  }

  .layout-left {
    position: absolute;
    width: 200px;
    left: 0;
    top: 0;
    bottom: 0;
    border-right: 1px solid #e5e5e5;
    user-select: none;
    background: #ffffff;

    .title {
      height: 45px;
      line-height: 45px;
      text-align: center;
      border-bottom: 1px solid #e5e5e5;
    }

    .container {
      height: calc(100% - 45px);
      padding-right: 8px;

      /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
      }

      .designerGroup {
        padding: 0 2px 0 10px;

        .designerItem {
          height: 40px;
          line-height: 40px;
          margin-top: 20px;
          text-align: center;
          border: 1px solid #e5e5e5;
          border-radius: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: grab;
        }
      }
    }

    .keep-save {
      width: 200px;
      position: absolute;
      bottom: 0;
      text-align: center;

      .btn-default {
        //padding: 0 40px;
        height: 40px;
        margin: 0 10px 10px;
      }
    }
  }

  .layout-right {
    height: 100%;
    overflow: auto;
    background: url("../../assets/centerControl/floor-bg.png") no-repeat;
    background-size: 100% 100%;
  }
}
</style>
