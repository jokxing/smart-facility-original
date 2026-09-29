<template>
  <div class="layout" ref="container">
    <div
      class="designerItem dragVirtualdom"
      ref="dragNode"
      v-if="Object.keys(dragNode).length > 0"
    >
      <div
        class="icon"
        ref="dragNodeIcon"
        :style="{
          background: `url(${require(`@/assets/centerControl/${dragNode.icon}.png`)}) no-repeat`,
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center center',
        }"
      ></div>
      <div class="name">{{ dragNode.name }}</div>
    </div>
    <div class="layout-left">
      <div class="title">设备列表</div>
      <div class="container">
        <el-scrollbar style="height: 100%">
          <div class="designerGroup">
            <div
              class="designerItemWrap"
              v-for="(item, index) in designer"
              :key="item.id"
            >
              <div
                class="designerItem"
                :data-id="item.id"
                v-drag="{ ...item, index }"
              >
                <div
                  class="icon"
                  :style="{
                    background: `url(${require(`@/assets/centerControl/${item.icon}.png`)}) no-repeat`,
                    backgroundSize: 'auto 100%',
                    backgroundPosition: 'center center',
                  }"
                ></div>
                <div class="name">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div class="layout-right" ref="layout">
      <Designer :config="layoutConfig"></Designer>
    </div>
  </div>
</template>
<script>
import Designer from "./components/Designer.vue";
export default {
  components: {
    Designer,
  },
  data() {
    return {
      designer: [
        {
          id: 1,
          type: 5,
          name: "电冰箱",
          icon: "device_01",
        },
        {
          id: 2,
          type: 5,
          name: "桌子",
          icon: "device_02",
        },
      ],
      that: this,
      layoutConfig: {},
      dragNode: {},
    };
  },
  directives: {
    drag: function (el, binding, vnode) {
      let dragBox = el;
      let _ = vnode.context;
      dragBox.onmousedown = (e) => {
        let { index } = binding.value;
        _.dragNode = {
          ...binding.value,
        };
        _.$nextTick(() => {
          let dragNode = _.$refs.dragNode;
          dragNode.style.width = dragBox.clientWidth + "px";
          dragNode.style.left = dragBox.offsetLeft + 10 + "px";
          _.$refs.dragNodeIcon.style.backgroundSize = "auto 100%";
          _.$refs.dragNodeIcon.style.backgroundPosition = "center center";
          dragNode.style.top =
            dragBox.offsetTop + (dragBox.clientHeight + 20) * index + 65 + "px";
          dragNode.onmousedown = (ed) => {
            let disx = ed.clientX - dragNode.offsetLeft;
            let disy = ed.clientY - dragNode.offsetTop;
            document.onmousemove = (e) => {
              let left = e.clientX - disx;
              let top = e.clientY - disy;
              dragNode.style.left = left + "px";
              dragNode.style.top = top + "px";
            };
            document.onmouseup = (e) => {
              document.onmousemove = null;
              document.onmouseup = null;
            };
          };
        });
      };
    },
  },
  mounted() {
    const _ = this;
    _.handleResize();
    window.onresize = () => {
      return (() => {
        _.handleResize();
      })();
    };
    // let stage = new Konva.Stage({
    //   container: this.$refs.layout,
    //   width: this.$refs.layout.offsetWidth,
    //   height: this.$refs.layout.offsetHeight,
    // });
    // let bgLayer = new Konva.Layer(); //背景图层
    // let goodsLayer = new Konva.Layer(); // 物品图层，不构成数据的装饰物品图层,暂时先不考虑，可放在右侧展示
    // let deviceLayer = new Konva.Layer(); //设备图层
    // Konva.Image.fromURL(
    //   `${require("../../assets/centerControl/device_01.png")}`,
    //   function (image) {
    //     console.log(image);
    //     image.setAttrs({
    //       x: Math.random() * stage.width(),
    //       y: Math.random() * stage.height(),
    //     });
    //     deviceLayer.add(image);
    //     // deviceLayer.batchDraw();
    //   }
    // );
    //   const svgInitialRect = {
    //     x: 1640,
    //     y: 1020,
    //   };
    //   let ratio =
    //     (stage.width() - 20) / svgInitialRect.x >
    //     (stage.height() - 20) / svgInitialRect.y
    //       ? (stage.height() - 20) / svgInitialRect.y
    //       : (stage.width() - 20) / svgInitialRect.x;
    //   for (let i = 0; i < this.designer.length; i++) {
    //     Konva.Image.fromURL(
    //       `${require(`../../assets/centerControl/${this.designer[i].icon}.png`)} `,
    //       function (node) {
    //         node.setAttrs({
    //           x: Math.random() * svgInitialRect.x * ratio,
    //           y: Math.random() * svgInitialRect.y * ratio,
    //           draggable: true,
    //           scaleX: 0.5,
    //           scaleY: 0.5,
    //           name: "img",
    //         });
    //         deviceLayer.add(node);
    //         // deviceLayer.draw();
    //       }
    //     );
    //   }
    //   // loadImage(deviceLayer, stage, this.designer);
    //   let path = new Konva.Path({
    //     x: 20,
    //     y: 20,
    //     strokeWidth: 20,
    //     data: "M 11 0 L 1588.5 0 C 1594.6 0 1599.5 4.9 1599.5 11 L 1599.5 969 C 1599.5 975.1 1594.6 980 1588.5 980 L 11 980 C 4.9 980 0 975.1 0 969 L 0 11 C 0 4.9 4.9 0 11 0 Z",
    //     stroke: "rgb(160, 145, 102)",
    //     "stroke-opacity": 0.93,
    //     fill: "rgb(240, 240, 240)",
    //     "fill-rule": "nonzero",
    //     scale: { x: ratio, y: ratio },
    //   });
    //   bgLayer.add(path);
    //   stage.add(bgLayer);
    //   bgLayer.draw();
    //   stage.add(deviceLayer);
    //   deviceLayer.draw();
    //   deviceLayer.on("mousedown", function (evt) {
    //     // var shape = evt.target;
    //     // shape.moveTo(bgLayer);
    //     // deviceLayer.draw();
    //     // shape.startDrag();
    //   });
    //   deviceLayer.on("click tab", function (e) {
    //     let tr = new Konva.Transformer();
    //     deviceLayer.add(tr);
    //     tr.nodes([]);
    //     if (e.target === stage) {
    //       return;
    //     }
    //     if (!e.target.hasName("img")) {
    //       tr.nodes([]);
    //       return;
    //     }
    //     tr.nodes([e.target]);
    //     console.log(tr);
    //     // deviceLayer.draw();
    //   });
    //   deviceLayer.on("mouseup", function (evt) {
    //     // var shape = evt.target;
    //     // deviceLayer.moveTo(Layer);
    //     // stage.draw();
    //   });
  },
  methods: {
    handleResize() {
      let width = this.$refs.layout.offsetWidth;
      let height = this.$refs.layout.offsetHeight;
      this.layoutConfig = {
        width,
        height,
      };
    },
  },
};
</script>

<style lang="less" scoped>
.layout {
  position: fixed;
  padding-left: 200px;
  border: 1px solid;
  top: 80px;
  left: 20px;
  right: 20px;
  height: calc(100% - 80px);
  .dragVirtualdom {
    height: 115px;
    position: absolute;
    user-select: none;
    position: absolute;
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
      height: calc(100% - 45px);
      padding-right: 8px;
      /deep/.el-scrollbar__wrap {
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
          z-index: 9999;
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
  }
}
</style>
