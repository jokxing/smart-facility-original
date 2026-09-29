<template>
  <v-image :config="config"></v-image>
</template>

<script>
import "@/plugins/konva";
export default {
  props: ["y", "image", "id"],
  data() {
    return {
      config: {},
    };
  },
  computed: {
    proto() {
      let { image, y, id } = this;
      return {
        image,
        y,
        id,
      };
    },
  },
  watch: {
    proto: {
      handler(newVal) {
        let { y, image, id } = newVal;
        this.$nextTick(() => {
          const wImage = new Image();
          wImage.src = String(image || '').trim();
          wImage.onload = () => {
            this.config = {
              image: wImage,
              x: 0,
              y: 0,
              width: process.env.VUE_APP_DEMO === "true" ? 128 : 100,
              height: process.env.VUE_APP_DEMO === "true" ? 144 : 100,
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
