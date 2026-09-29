<template>
  <div
      class="ScreenAdapter"
      :style="style"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: "index",
  props: {
    width: {
      type: Number,
      default: 1920,
    },
    height: {
      type: Number,
      default: 1080
    }
  },
  data() {
    return {
      style: {
        width: '0px',
        height: '0px',
        transform: 'scale(1) translate(-50%, -50%)'
      }
    }
  },
  mounted() {
    this.style.width = this.width + "px";
    this.style.height = this.height + "px";
    this.setScale();
    window.addEventListener('resize', this.debounce(this.setScale, 200), false)
  },
  methods: {
    getScale() {
      const w = window.innerWidth / this.width;
      const h = window.innerHeight / this.height;
      return [w,h]
    },
    setScale() {
      this.$nextTick(() => {
        this.style.transform = 'scale(' + this.getScale()[0]+ "," + this.getScale()[1] + ') translate(-50%, -50%)';
      })
    },
    debounce(fn, delay) {
      let delays = delay || 200;
      let timer;
      return function () {
        let th = this;
        let args = arguments;
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(function () {
          timer = null;
          fn.apply(th, args);
        }, delays);
      };
    }
  }
}
</script>

<style lang="less" scoped>

.ScreenAdapter {
  transform-origin: 0 0;
  position: absolute;
  left: 50%;
  top: 50%;
  transition: 0.3s;
  background: radial-gradient(#12447f, #000000);
  padding: 25px;
  color: white;
  font-size: 20px;
  overflow: hidden;
}
</style>
