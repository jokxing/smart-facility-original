<template>
  <div>
    <v-stage
        ref="stage"
        :config="config"
        :key="keyNum"
        @mousedown="handleMouseDown"
        @touchstart="handleMouseDown"
    >
      <v-layer ref="backgroundLayer">
        <v-image :config="bgConfig"></v-image>
      </v-layer>
      <v-layer ref="layer">
        <template v-for="(item, index) in list">
          <v-group
            :key="item.id"
            :config="{
              name: `deviceGroup${index}`,
              draggable: !isDemo && item.isEdit,
            }"
            @dragend="handleDragEnd(item, $event)">
            <v-text
              :ref="'textResize' + index"
              :config="item"
              @mousedown="handleTextMousedown(item)"
              @click="handleTextClick(item)"
              @dblclick="handleTypeClick(item)"
              @transform="handleTransformEnd(item, $event)"
            />
            <v-image
              v-if="item.equipments && item.equipments.length > 0"
              :config="{
                image:
                  item.senorStatus === 1
                    ? successImage
                    : item.senorStatus === 2
                    ? errorImage
                    : offlineImage,
                x: item.x - (38 * ratio),
                y: item.y,
                width: 35 * ratio,
                height: 40 * ratio,
                scaleX: 1,
                scaleY: 1,
              }"
            ></v-image>
          </v-group>
        </template>

        <v-transformer
          v-if="!isDemo"
          ref="transformer"
          :config="{
            enabledAnchors: ['middle-left', 'middle-right'],
            boundBoxFunc: (oldBox, newBox) => {
              if (newBox.width < this.MIN_WIDTH) {
                return oldBox;
              }
              return newBox;
            },
          }"
        />
      </v-layer>
    </v-stage>
    <div v-if="!isDemo && isDialog" class="dialog">
      <div class="bg"></div>
      <div class="container">
        <div class="title">
          <span>{{ system.title }}</span>
          <span class="icon-close icon" :title="$t('dataV.closeSystem')" @click="handleCloseDialog"></span>
        </div>
        <transition mode="out-in" name="fade">
          <div v-if="!isDelete" key="on" class="handle-type">
            <p>{{ $t('dataV.changeHandle') }}</p>
            <div class="handle">
              <el-button @click="isDelete = !isDelete">{{ $t('dataV.textSystem') }}</el-button>
              <el-button @click="handleDeleteClick(item)">{{ $t('dataV.removeRoom') }}</el-button>
            </div>
          </div>
          <div v-else key="off" class="handle-type">
            <el-form v-model="system">
              <el-form-item :label="$t('dataV.fontSize')" label-width="80px">
                <el-input v-model="system.fontSize" type="number"/>
              </el-form-item>
              <el-form-item class="color-checked" :label="$t('dataV.fontColor')" label-width="80px">
                <span class="demonstration">{{ system.color }}</span>
                <el-color-picker
                    v-model="system.color"
                    :predefine="predefineColors"
                ></el-color-picker>
              </el-form-item>
            </el-form>
          </div>
        </transition>
        <div class="bottom-handle">
          <el-button @click="handleCloseDialog">{{ $t('common.cancel') }}</el-button>
          <el-button v-if="isDelete" type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {mapMutations, mapState} from "vuex";
import ImageNode from "./ImageNode.vue";
import {BASE_URL} from "@/utils/constant.js";
import {resolveFloorMapUrl} from "@/utils/demoFloorMapUrl";
import "@/plugins/konva";

let roleId;
export default {
  components: {
    ImageNode,
  },
  props: {
    config: {
      type: Object,
      default: () => {
      },
    },
    ratio: {
      type: Number,
      default: () => {
      }
    }
  },
  data() {
      const _this = this;
    return {
      isDemo: process.env.VUE_APP_DEMO === "true",
      errorImage: null,
      offlineImage: null,
      successImage: null,
      bgConfig: {},
      textConfig: {},
      deviceLayer: {},
      MIN_WIDTH: 20,
      MAX_WIDTH: 200,
      selectedShapeName: "",
      isRoomList: false,
      isSetRoomList: false,
      list: [
        // {
        //   id: "11",
        //   x: 50,
        //   y: 60,
        //   fontSize: 20,
        //   text: "Hello from the Konva framework. Try to resize me.",
        //   draggable: true,
        //   width: 200,
        //   scaleX: 1,
        //   name: "textResize1",
        //   height: "auto",
        // },
      ],
      iconWidthDiffer: 38,
      isDisplacement: false,
      statusConfig: {},
      canvasX: 1,
      canvasY: 1,
      draggable: true,
      system: {
        color: "#FFFFFF",
        fontSize: 18,
        title: _this.$t('dataV.system')
      },
      isBatch: 0,
      isDialog: false,
      isDelete: false,
      item: {},
      predefineColors: ["#efc", "#FFFFFF", "#000000", "#1890FF", "#FF0000", "#1bd39e", "#ffdf25"],
      clickStagList: [],
      keyNum: 0
    };
  },
  created() {
    var _this = this;
    var set = setInterval(function(){
      if(_this.isRoomList){
        clearInterval(set);
        _this.setRoomList()
        // for(var i = 0; i < _this.roomDrawerList.length; i++){
        //   // 保持这个格式，不然配置不了
        //   // _this.list.push({
        //   //   ..._this.roomDrawerList[i],
        //   //   id: _this.roomDrawerList[i].id + '', //数字类型会警告，而配置不了，所以临时转字符串
        //   //   x: (_this.roomDrawerList[i].x + _this.iconWidthDiffer) * _this.ratio,
        //   //   y: _this.roomDrawerList[i].y * _this.ratio,
        //   //   fill: _this.roomDrawerList[i].color,
        //   //   text: _this.roomDrawerList[i].name,
        //   //   scaleX: _this.roomDrawerList[i].scaleX * _this.ratio || 1 * _this.ratio,
        //   //   scaleY: _this.roomDrawerList[i].scaleY * _this.ratio || 1 * _this.ratio,
        //   //   name: "textResize" + i,
        //   //   height: 60,
        //   //   fontFamily: 'RuiZiZhenYanTi',
        //   // })
        // }
      }
    },100)

    roleId = JSON.parse(localStorage.getItem("USERINFO")).roleId;
    this.draggable = process.env.VUE_APP_DEMO === "true" ? false : roleId < 4;
  },
  watch: {
    config: {
      handler(newVal, oldVal) {
        let {width, height, mapUrl} = newVal;
        if (width || height) {
          this.$nextTick(() => {
            const image = new window.Image();
            const resolved = resolveFloorMapUrl(mapUrl, BASE_URL);
            if (!resolved) {
              this.bgConfig = {};
            } else {
              image.src = resolved;
              image.onload = () => {
                this.bgConfig = {
                  x: 0,
                  y: 0,
                  image,
                  width: width,
                  height: height,
                };
              };
            }
            let owidth = oldVal && oldVal.width ? oldVal.width : 1;
            let oheight = oldVal && oldVal.height ? oldVal.height : 1;
            let ratioX = width / owidth;
            let ratioY = height / oheight;
            let roomList = this.roomDrawerList;
            let temp = [];
            roomList.map((rm) => {
              let obj = {
                ...rm,
                scaleX: ratioX,
                scaleY: ratioY,
                x: rm.x * ratioX / this.ratio,
                y: rm.y * ratioY / this.ratio,
              };
              temp.push(obj);
            });
            this.handleSetDrawerList({
              roomList: temp,
            });
            // this.deviceList = temp;
          });
        }
      },
      immediate: true,
      deep: true,
    },
    roomDrawerList: {
      handler(newVal) {
        if(this.isSetRoomList && this.list.length < newVal.length){
          var i = newVal.length - 1;
          this.list.push({
            ...newVal[i],
            id: newVal[i].id + '', //数字类型会警告，而配置不了，所以临时转字符串
            x: (newVal[i].x + this.iconWidthDiffer) * this.ratio,
            y: newVal[i].y * this.ratio,
            fill: newVal[i].color,
            text: newVal[i].name,
            scaleX: 1 * this.ratio,
            scaleY: 1 * this.ratio,
            // scaleX: newVal[i].scaleX * this.ratio || 1 * this.ratio,
            // scaleY: newVal[i].scaleY * this.ratio || 1 * this.ratio,
            name: "textResize" + i,
            width: newVal[i].width * this.ratio,
            height: "auto",
            fontFamily: 'RuiZiZhenYanTi',
          })
        }
      },
      immediate: true,
      deep: true,
    },
    isDelete: function (value) {
      if (value) {
        const {color, fontSize} = this.item;
        this.system.color = color ?? "#FFFFFF";
        this.system.fontSize = fontSize ?? 18;
      }
    }
  },
  mounted() {
    let pic1 = require("@/assets/centerControl/status_warn.png");
    let pic2 = require("@/assets/centerControl/status_offline.png");
    let pic3 = require("@/assets/centerControl/status_success.png");
    this.loadImage(pic1)
        .then((pic) => {
          this.errorImage = pic;
          return this.loadImage(pic2);
        })
        .then((pic) => {
          this.offlineImage = pic;
          return this.loadImage(pic3);
        })
        .then((pic) => {
          this.successImage = pic;
        });
  },
  computed: {
    ...mapState("cmap", {
      roomDrawerList: "roomDrawerList",
    }),
  },

  methods: {
    ...mapMutations("cmap", {
      handleSetDrawerList: "SETROOMLIST",
    }),

    setRoomList() {
      this.list = [];
      for(var i = 0; i < this.roomDrawerList.length; i++){
        // 保持这个格式，不然配置不了
        this.list.push({
          ...this.roomDrawerList[i],
          id: this.roomDrawerList[i].id + '', //数字类型会警告，而配置不了，所以临时转字符串
          // x: 10,
          // y: 10,
          x: (this.roomDrawerList[i].x + this.iconWidthDiffer) * this.ratio,
          y: this.roomDrawerList[i].y * this.ratio,
          fill: this.roomDrawerList[i].color,
          fontSize: this.roomDrawerList[i].fontSize ? this.roomDrawerList[i].fontSize * this.ratio : "",
          text: this.roomDrawerList[i].name,
          scaleX: 1 * this.ratio,
          scaleY: 1 * this.ratio,
          // scaleX: this.roomDrawerList[i].scaleX,
          // scaleY: this.roomDrawerList[i].scaleY,
          name: "textResize" + i,
          width: this.roomDrawerList[i].width * this.ratio,
          height: "auto",
          fontFamily: 'RuiZiZhenYanTi',
        })
      }
      this.isSetRoomList = true;
    },

    handleTextClick(item){
      if (!item.isEdit) {
        return this.$message.error(this.$t('dataV.noRule'))
      }
    },

    handleSubmit() {
      if (this.isDemo) return;
      if (!this.isBatch) {
        // 提交数据
        let temp = []; //暂存器
        this.roomDrawerList.map((dm) => {
          if (dm.id == parseInt(this.item.id)) {
            let targetData = {
              ...dm,
              color: this.system.color,
              fontSize: parseInt(this.system.fontSize)
            };
            temp.push(targetData);
          } else {
            temp.push(dm);
          }
        });
        this.handleSetDrawerList({
          roomList: temp,
        });
        // 渲染页面
        this.list.map(item => {
          if (item.id === this.item.id) {
            item.fill = this.system.color;
            item.color = this.system.color;
            item.fontSize = parseInt(this.system.fontSize) * this.ratio;
            this.handleCloseDialog();
          }
        })
      } else {
        // 提交数据
        let temp = []; //暂存器
        this.roomDrawerList.map((dm) => {
          let targetData = {
            ...dm,
            color: this.system.color,
            fontSize: parseInt(this.system.fontSize)
          };
          temp.push(targetData);
        });
        this.handleSetDrawerList({
          roomList: temp,
        });
        // 渲染页面
        this.list.map(item => {
          item.fill = this.system.color;
          item.color = this.system.color;
          item.fontSize = parseInt(this.system.fontSize) * this.ratio;
          this.handleCloseDialog();
        })
      }
    },
    loadImage(src) {
      return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = () => {
          resolve(image);
        };
        image.onerror = () => {
          const err = new Error( this.$t('dataV.imgLoadingErr') ` ${src}`);
        };
        image.src = src;
      });
    },
    // 缩放
    handleTransformEnd(data, ev) {
      if (this.isDemo) return;
      const stage = this.$refs.stage.getStage();
      const pointer = stage.getPointerPosition();



      const selectedNode = this.$refs.transformer
        .getStage()
        .getStage()
        .findOne("." + this.selectedShapeName);

      const item = this.list.find(
        (item) => item.name === this.selectedShapeName
      );
      item.width = item.width * selectedNode.getScaleX();

      selectedNode.setScaleX(1);
      selectedNode.setScaleY(1);

      const evtarget = ev.target;
      let {id} = data;
      let temp = [];
      this.roomDrawerList.map((dm) => {
        if (dm.id == parseInt(id)) {
          let targetData = {
            ...dm,
            x: dm.x / this.ratio,
            y: dm.y / this.ratio,
            width: item.width / this.ratio,
            rotation: evtarget.rotation(),
          };
          temp.push(targetData);
        } else {
          temp.push(dm);
        }
      });
      this.handleSetDrawerList({
        roomList: temp,
      });
    },

    // 点击即暂存
    handleTextMousedown(item) {
      if (this.isDemo) return;
      // 暂存点击当前的item
      if(this.clickStagList.length === 0) {
        this.clickStagList.push(JSON.parse(JSON.stringify(item)))
      }else{
        let flag = false;
        for(let i = 0; i < this.clickStagList.length; i++) {
          if(this.clickStagList[i].id === item.id){
            flag = true;
          }
        }
        if(!flag){
          this.clickStagList.push(JSON.parse(JSON.stringify(item)))
        }
      }
    },

    handleDragEnd(data, ev) {
      if (this.isDemo) return;
      this.isDisplacement = true;
      //获取拖拽偏移量
      // 获取画布大小
      const canvasX = document.getElementsByTagName("canvas")[0].clientWidth;
      const canvasY = document.getElementsByTagName("canvas")[0].clientHeight;
      const evX = ev.target.attrs.x;
      const evY = ev.target.attrs.y;
      if (evX <= -(data.x - 30) || evY <= -(data.y - 20) || ((evX + data.x) * this.ratio + 150) >= canvasX || ((evY + data.y) * this.ratio + 40) >= canvasY) {
        this.list.map(item => {
          this.clickStagList.map(clickItem => {
            if (item.id === clickItem.id) {
              item.x = clickItem.x;
              item.y = clickItem.y;
            }
          })
        })
        this.keyNum++
        return confirm(this.$t('dataV.outScoped'))
      }

      // 暂存更新数据，为了方便恢复原位
      for(let i = 0; i < this.clickStagList.length; i++) {
        if(this.clickStagList[i].id === data.id){
          this.clickStagList[i].x = (evX + data.x - this.iconWidthDiffer) / this.ratio;
          this.clickStagList[i].y = (evY + data.y) / this.ratio;
        }
      }

      let {id} = data;
      let temp = []; //暂存器
      this.roomDrawerList.map((dm) => {
        if (dm.id == parseInt(id)) {
          let targetData = {
            ...dm,
            x: (evX + data.x - this.iconWidthDiffer) / this.ratio,
            y: (evY + data.y) / this.ratio,
            fontSize: data.fontSize / this.ratio,
            width: data.width / this.ratio,
            name: data.text
          };
          delete targetData.fill;
          delete targetData.createDate;
          delete targetData.fontFamily;
          delete targetData.text;
          temp.push(targetData);
        } else {
          temp.push(dm);
        }
      });
      this.handleSetDrawerList({
        roomList: temp,
      });
      // do nothing if selected node is already attached
    },
    handleSerialize(data) {
      let obj = {
        x: 50,
        y: 80,
        radius: 10,
      };
      let {statusStr} = data;
      let color = "#13ce66";
      if (statusStr === "离线") {
        color = "#343f4b";
      } else if (statusStr === "报警") {
        color = "#ff4949";
      } else {
        color = "#13ce66";
      }
      return {
        ...obj,
        fill: color,
      };
    },
    handleMouseDown(e) {
      if (this.isDemo) return;
      if (e.target.parent.attrs.edit === 0) {
        this.$message.error(this.$t('dataV.noRule'));
      }
      if (e.target === e.target.getStage()) {
        this.selectedShapeName = "";
        this.updateTransformer();
        return;
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer =
        e.target.getParent().className === "Transformer";
      if (clickedOnTransformer) {
        return;
      }

      // find clicked rect by its name
      const name = e.target.name();
      const item = this.list.find((i) => i.name === name);
      if (item) {
        this.selectedShapeName = name;
      } else {
        this.selectedShapeName = "";
      }
      this.updateTransformer(e.target);
    },
    updateTransformer(e) {
      if (this.isDemo) return;
      const transformerNode = this.$refs.transformer.getNode();
      const stage = transformerNode.getStage();
      const { selectedShapeName } = this;

      const selectedNode = stage.findOne("." + selectedShapeName);
      // do nothing if selected node is already attached
      if (selectedNode === transformerNode.node()) {
        return;
      }

      if (selectedNode) {
        // attach to another node
        transformerNode.nodes([selectedNode]);
      } else {
        // remove transformer
        transformerNode.nodes([]);
      }
    },
    handleTypeClick(item, type) {
      if (this.isDemo) return;
      this.isBatch = type ?? 0;
      if (type) {
        this.isDialog = true;
        this.isDelete = true;
        this.system.title = this.$t('dataV.textSystem');
        return
      }
      this.system.title = this.$t('dataV.system');
      this.isDialog = true;
      this.item = item;
    },
    handleDeleteClick(item) {
      if (this.isDemo) return;
      if (!item.isEdit) {
        return this.$message.error(this.$t('dataV.noRule'));
      }
      let _this = this;
      this.$confirm(this.$t('dataV.removeLab'), this.$t('common.hint'), {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
      }).then(() => {
        let targetData = {
          ...item,
          name: item.text,
          id: parseInt(item.id) //转回数字类型
        };
        delete targetData.fill;
        delete targetData.createDate;
        delete targetData.fontFamily;
        delete targetData.text;
        _this.$parent.roomList.push(targetData);
        let roomList = _this.roomDrawerList;
        for (let i = 0; i < roomList.length; i++) {
          if (roomList[i].id === parseInt(item.id)) {
            roomList.splice(i, 1);
          }
        }
        this.handleSetDrawerList({
          roomList: roomList,
        });
        for (let i = 0; i < this.list.length; i++) {
          if (this.list[i].id === item.id) {
            this.list.splice(i, 1);
          }
        }
        // 取消锚点
        _this.$refs.transformer.getNode().nodes([])
        _this.handleCloseDialog();
      }).catch(() => {

      })
    },
    handleCloseDialog() {
      this.isDialog = false;
      this.item = false;
      this.isDelete = false;
    }
  },
};
</script>
<style lang="less" scoped>
.dialog {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;

  .bg {
    width: 100%;
    height: 100%;
    background: #666666;
    opacity: 0.5;
  }

  .container {
    width: 400px;
    height: 275px;
    background: #ffffff;
    border-radius: 4px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;

    .title {
      padding: 16px;
      border-bottom: 1px solid #e5e5e5;
      line-height: 1.5;
      display: flex;
      justify-content: space-between;

      .icon {
        color: #999999;
        font-size: 16px;
      }
    }

    .handle-type {
      padding: 16px 24px;
      margin: auto 0;

      .handle {
        margin: 16px 0;
      }

      /deep/ .el-form-item__content {
        display: flex;
        align-items: center;

        .demonstration {
          margin-right: 8px;
        }
      }
    }

    .bottom-handle {
      width: 100%;
      position: absolute;
      bottom: 0;
      padding: 16px;
      border-top: 1px solid #e5e5e5;
      text-align: end;
    }
  }
}

.fade-enter { //  进入时的初始状态
  transform: translateY(10px);
  opacity: 0;
}

.fade-enter-to { //进入过渡结束状态
  transform: translateY(0);
  opacity: 1;
}

.fade-leave { //离开过渡的开始状态
  transform: translateY(0);
  opacity: 1;
}

.fade-leave-to { //离开时的初始状态
  transform: translateY(-10px);
  opacity: 0;
}

.fade-enter-active { //进入过渡生效的状态
  transition: all 0.5s ease;
}

.fade-leave-active { //离开过渡生效时的状态
  transition: all 0.5s ease;
}

</style>
