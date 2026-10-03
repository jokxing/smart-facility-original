<template>
  <div class="designer">
    <v-stage
      ref="stage"
      :config="config"
      @mousedown="handleMouseDown"
      @touchstart="handleMouseDown"
      @dragmove="handleDragmove"
    >
      <v-layer ref="backgroundLayer">
        <v-image :config="bgConfig"></v-image>
      </v-layer>
      <v-layer ref="deviceLayer" :config="deviceLayer">
        <template v-for="(item, index) in deviceDrawerList">
          <v-group
            :key="item.id"
            :config="{
              x: item.x * ratio,
              y: item.y * ratio,
              rotation: item.rotation,
              draggable: item.isEdit == 0 ? false : true,
              name: `deviceGroup${index}`,
              width: isDemo ? 128 : 100,
              offsetX: isDemo ? 64 : 0,
              offsetY: isDemo ? 72 : 0,
              height: isDemo ? 144 : 100,
              scaleX: item.scaleX * ratio || 1 * ratio,
              scaleY: item.scaleY * ratio || 1 * ratio,
            }"
            @dragend="handleDragEnd(item, $event)"
            @transformend="handleTransformEnd(item, $event)"
            @dblclick="handleDeleteClick(item)"
          >
            <ImageNode :id="item.id" :image="resolveDeviceImage(item)" :y="10 + 100 * index" scaleX: item.scaleX||1, scaleY: item.scaleY||1, />
            <div v-if="item.isMonitor == 1">
              <v-circle v-if="item.types == 1" :config="handleSerialize(item)"></v-circle>
            </div>
            <!-- <v-text
              :config="{
                text: item.name,
                x: 0,
                y: 100,
                fontSize: 12
              }"
            /> -->
          </v-group>
        </template>
        <v-transformer ref="transformer"></v-transformer>
      </v-layer>
    </v-stage>

    <!-- <div class="item-text" v-for="item in deviceDrawerList" :key="item.id" :style="{ top: (item.y - 20)  + 'px', left: item.x + 'px'}">
      {{ item.name }}
    </div> -->
  </div>
</template>
<script>
import { roomBackgroundFrame, validPlacement } from "@/utils/demoLayoutGeometry";
import { demoDeviceStatusColor } from "@/utils/demoDeviceStatus";
import ImageNode from "./ImageNode.vue";
import { BASE_URL } from "@/utils/constant.js";
import { resolveDeviceAssetUrl } from "@/utils/demoDeviceUrl";
import { resolveRoomMapUrlByRoomId } from "@/utils/demoRoomMapUrl";
import { mapState,mapMutations } from "vuex";
import "@/plugins/konva";

const isDemo = process.env.VUE_APP_DEMO === "true";

export default {
  components: {
    ImageNode,
  },
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    ratio: {
      type: Number,
      default: () => {}
    }
  },
  data() {
    return {
      isDemo,
      roleId: JSON.parse(localStorage.getItem("USERINFO")).roleId,
      // backgroundImage: null,
      bgConfig: {},
      textConfig: {},
      deviceList: [],
      deviceLayer: {},
      selectedShapeName: "",
      statusConfig: {},
      BASE_URL,
      modifyDeviceList: "",
      // 移动元素是否超出范围
      isOutOfRange: 0
    };
  },
  watch: {
    config: {
      handler(newVal,oldVal) {
        let { width, height,mapUrl, roomId } = newVal;
        if (width || height) {
          this.$nextTick(() => {
            const image = new window.Image();
            if (isDemo) {
              const demoBg = resolveRoomMapUrlByRoomId(roomId || (this.$route && this.$route.query.roomId), BASE_URL);
              image.src = demoBg || require('@/assets/centerControl/roomBg.png');
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
                ...(isDemo ? roomBackgroundFrame(roomId || this.$route.query.roomId, this.ratio, image.naturalWidth, image.naturalHeight) : {}),
              };
            };
            if (isDemo) return;
            let owidth = oldVal && oldVal.width ? oldVal.width : 1;
            let oheight = oldVal && oldVal.height ? oldVal.height : 1;
            let ratioX = width / owidth;
            let ratioY = height / oheight;
            let roomList = this.deviceDrawerList;
            let temp = [];
            roomList.map((rm) => {
              let obj = {
                ...rm,
                scaleX: ratioX,
                scaleY: ratioY,
                x: rm.x * ratioX,
                y: rm.y * ratioY,
              };
              temp.push(obj);
            });
            this.handleSetDrawerList({
              deviceList: temp,
            });
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },
  computed:{
    ...mapState("cmap", {
      deviceDrawerList: "deviceDrawerList",
    }),
  },
  methods: {
   ...mapMutations("cmap", {
      handleSetDrawerList: "SETDEVICELIST",
    }),
    resolveDeviceImage(item) {
      const key = item && (item.logoUrl || item.url);
      if (isDemo) {
        const resolved = resolveDeviceAssetUrl(key, BASE_URL);
        return resolved ? (resolved + '?_=&isEdit=' + (item.isEdit == null ? 1 : item.isEdit)) : '';
      }
      return `${BASE_URL + key + '&isEdit=' + item.isEdit}`;
    },
    commitDemoPlacement(data, node) {
      const next = {...data, x: node.x() / this.ratio, y: node.y() / this.ratio,
        rotation: node.rotation(), scaleX: node.scaleX() / this.ratio, scaleY: node.scaleY() / this.ratio};
      if (!validPlacement(next, this.config.roomId || this.$route.query.roomId)) {
        node.setAttrs({x: data.x * this.ratio, y: data.y * this.ratio, rotation: data.rotation,
          scaleX: data.scaleX * this.ratio, scaleY: data.scaleY * this.ratio});
        node.getLayer().batchDraw();
        this.$message.warning("设备必须完整位于房间内，且缩放范围为 0.2–3。");
        return;
      }
      this.isOutOfRange = 0;
      this.handleSetDrawerList({deviceList: this.deviceDrawerList.map(item => item.elementId === data.elementId ? next : item)});
    },
    // 缩放事件
    handleTransformEnd(data, ev) {
      if (isDemo) return this.commitDemoPlacement(data, ev.target);
      let evtarget = ev.target;
      // console.log("id:" + data.elementId,"w:" + evtarget.scaleX(), "h:" + evtarget.scaleY())
      // console.log("id:" + data.elementId,"x:" + evtarget.attrs.x, "y:" + evtarget.attrs.y)

      for(var i = 0; i < this.deviceDrawerList.length; i++){
        if(this.deviceDrawerList[i].elementId == data.elementId){
          this.deviceDrawerList[i].x = evtarget.attrs.x / this.ratio;
          this.deviceDrawerList[i].y = evtarget.attrs.y / this.ratio
          this.deviceDrawerList[i].rotation = evtarget.rotation();
          this.deviceDrawerList[i].scaleX = (evtarget.scaleX()) / this.ratio;
          this.deviceDrawerList[i].scaleY = (evtarget.scaleY()) / this.ratio
        }
      }

    },
    // 拖拽事件
    handleDragEnd(data, ev) {
      if (isDemo) return this.commitDemoPlacement(data, ev.target);
      let evtarget = ev.target;
      let evstage = ev.target.getStage();
      // console.log(evtarget)

      // console.log("id:" + data.elementId,"x:" + evtarget.attrs.x, "y:" + evtarget.attrs.y)

      var widthR = 50 * this.ratio;
      var heightR = 30 * this.ratio;
      if((this.config.width - widthR) < evstage.getPointerPosition().x || widthR > evstage.getPointerPosition().x){
        this.isOutOfRange = 1;
        return alert(this.$t('dataV.outScoped'))
      }else if ((this.config.height - heightR) < evstage.getPointerPosition().y || heightR > evstage.getPointerPosition().y){
        this.isOutOfRange = 1;
        return alert(this.$t('dataV.outScoped'))
      }else{
        this.isOutOfRange = 0;
        for(var i = 0; i < this.deviceDrawerList.length; i++){
          if(this.deviceDrawerList[i].elementId == data.elementId){
            this.deviceDrawerList[i].x = evtarget.attrs.x / this.ratio;
            this.deviceDrawerList[i].y = evtarget.attrs.y / this.ratio
          }
        }
      }
    },
    // 状态
    handleSerialize(data) {
      let obj = {
        x: 50,
        y: 80,
        radius: 10,
      };
      let { status } = data;
      let color = "#13ce66";
      if(status == 1){
        color = "#13ce66";
      }else if(status == 2){
        color = "#ffdf25";
      }else if(status == 3){
        color = "#343f4b";
      }else{
        color = "#000"
      }
      return {
        ...obj,
        fill: isDemo ? demoDeviceStatusColor(status) : color,
      };
    },
    handleDragmove(data,e){
      // console.log(data)
    },
    handleMouseDown(e) {
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
      const name = e.target.getParent().name();
      if (name.indexOf("deviceGroup") === -1) {
        this.selectedShapeName = "";
        this.updateTransformer();
        return;
      }
      this.selectedShapeName = name;
      var imgSrc = e.target.getParent().children[0].attrs.image.src;
      var isEdit = this.getQueryString("isEdit", imgSrc);
      if(this.roleId == 4){
        if(isEdit === "undefined"){
          this.updateTransformer();
        }else{
          if(isEdit === "1"){
            this.updateTransformer();
          }else{
            this.$message.error(this.$t('dataV.noRule'))
          }
        }
      }else{
        this.updateTransformer();
      }
    },
    updateTransformer() {
      // here we need to manually attach or detach Transformer node
      const transformerNode = this.$refs.transformer.getNode();
      const stage = transformerNode.getStage();
      const { selectedShapeName } = this;
      const selectedNode = stage.findOne("." + selectedShapeName);
      // console.log(".............", selectedNode);
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
    getQueryString(name,url) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = url.substr(1).match(reg);
      if (r != null) return unescape(r[2]); return null;
    },
    // 移除设备事件
    handleDeleteClick(item) {
      var _this = this;
      if (isDemo) {
        return this.$message.info('演示模式不支持移除设备，可拖动后保存或重置布局');
      }
      if(item.isEdit == 0){
        this.$message.error(this.$t('dataV.noRule'))
      }else{
        this.$confirm(this.$t('dataV.removeLabDevice'), this.$t('common.hint'), {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
        }).then(() => {
          var deviceList = _this.deviceDrawerList;
          for(var i = 0; i < deviceList.length; i++){
            if(deviceList[i].elementId === item.elementId){
              deviceList.splice(i,1)
            }
          }
          _this.$emit("handleDeviceList", item);
          // 取消锚点
          _this.$refs.transformer.getNode().nodes([])
        }).catch(() => {
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
  .designer{
    position: relative;
  }
  .item-text{
    position: absolute;
    transition: all 0.3s;
    font-size: 12px;
  }
</style>
