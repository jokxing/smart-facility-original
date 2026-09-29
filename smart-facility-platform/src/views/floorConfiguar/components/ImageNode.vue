<template>
  <v-image :config="config" ></v-image>
</template>
<script>
import "@/plugins/konva";
export default {
  props: ["y", "image","id"],
  data() {
    return {
      config: {},
    };
  },
  computed: {
    proto() {
      let { image, y,id } = this;
      return {
        image,
        y,
        id
      };
    },
  },
  watch: {
    proto: {
      handler(newVal) {
        let { y, image,id } = newVal;
        this.$nextTick(() => {
          const wImage = new Image();
          wImage.src = `${require(`../../../assets/centerControl/${image}.png`)} `;
          wImage.onload = () => {
            this.config = {
              image: wImage,
              x: 0,
              y:0,
              width: 100,
              height: 100,
              name: `image${id}`,
            };
          };
        });
      },
      immediate: true,
    },
  },
};
</script>
