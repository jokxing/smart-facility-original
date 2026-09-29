<template>
  <v-stage
    ref="stage"
    :config="config"
    @mousedown="handleMouseDown"
    @touchstart="handleMouseDown"
  >
    <v-layer ref="backgroundLayer">
      <v-image :config="bgConfig"></v-image>
    </v-layer>
    <v-layer ref="deviceLayer" :config="deviceLayer">
      <template v-for="(item, index) in deviceList">
        <v-group
          :key="item.id"
          :config="{
            x: 30,
            y: 10 + 100 * index,
            draggable: true,
            name: `deviceGroup${index}`,
            width: 100,
            height: 100,
          }"
        >
          <ImageNode :id="item.id" :image="item.icon" :y="10 + 100 * index" />
          <v-circle :config="handleSerialize(item)"></v-circle>
        </v-group>
      </template>
      <v-transformer ref="transformer"></v-transformer>
    </v-layer>
  </v-stage>
</template>
<script>
import ImageNode from "./ImageNode.vue";
export default {
  components: {
    ImageNode,
  },
  props: {
    config: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      // backgroundImage: null,
      bgConfig: {},
      textConfig: {},
      deviceList: [
        {
          id: 1,
          type: 5,
          name: "电冰箱",
          icon: "device_01",
          statusStr: "正常",
        },
        {
          id: 2,
          type: 5,
          name: "桌子",
          icon: "device_02",
          statusStr: "报警",
        },
      ],
      deviceLayer: {},
      selectedShapeName: "",
      statusConfig: {},
    };
  },
  watch: {
    config: {
      handler(newVal) {
        let { width, height } = newVal;
        if (width || height) {
          this.$nextTick(() => {
            const image = new window.Image();
            image.src = require("../../../assets/centerControl/room.svg");
            image.onload = () => {
              this.bgConfig = {
                x: 20,
                y: 20,
                image,
                width: width - 20,
                height: height - 20,
              };
            };
            this.deviceLayer = {
              x: 0,
              y: 0,
              width: 200,
              height,
            };
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    handleSerialize(data) {
      let obj = {
        x: 10,
        y: 20,
        radius: 10,
      };
      let { statusStr } = data;
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
      this.updateTransformer();
    },

    updateTransformer() {
      // here we need to manually attach or detach Transformer node
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
  },
};
</script>
