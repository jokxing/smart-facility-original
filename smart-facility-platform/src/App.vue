<template>
  <div id="app" ref="app">
    <transition :name="transitionName" :css="!skipRouteAnimation" :mode="skipRouteAnimation ? 'out-in' : 'in-out'">
      <router-view v-if="isRouterAlive"></router-view>
    </transition>
  </div>
</template>
<script>
export default {
  provide() {
    return {
      reload: this.reload
    }
  },
  data() {
    return {
      transitionName: "",
      skipRouteAnimation: false,
      isRouterAlive: true,
    }
  },
  created() {
    this._unhookDemoRoute = this.$router.beforeEach((to, from, next) => {
      this.applyDemoRouteTransition(to.path, from.path);
      next();
    });
  },
  beforeDestroy() {
    if (this._unhookDemoRoute) this._unhookDemoRoute();
  },
  watch: {
    '$route'(to, from) {
      this.applyDemoRouteTransition(to.path, from.path);
      if (this.skipRouteAnimation) return;
      const toIndex = to.meta.index;
      const fromIndex = from.meta.index;
      if (toIndex > 0) {
        this.transitionName = toIndex < fromIndex ? 'slide-right' : 'slide-left'
      } else {
        this.transitionName = "";
      }
    }
  },
  methods: {
    applyDemoRouteTransition(toPath, fromPath) {
      const overlay = ['/floor/designer', '/room/designer'];
      this.skipRouteAnimation = process.env.VUE_APP_DEMO === 'true' &&
        (overlay.includes(toPath) || overlay.includes(fromPath));
      if (this.skipRouteAnimation) this.transitionName = '';
    },
    reload() {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      })
    }
  },
}
</script>
<style lang="less" scoped>

#app {
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  overflow: hidden;
}


.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  will-change: transform;
  transition: all 0.5s ease;
  position: absolute;
}

.slide-right-enter {
  transform: rotateY(-90deg);
}

.slide-right-leave-active {
  transform: rotateY(0);
}

.slide-left-enter {
  transform: rotateY(90deg);
}

.slide-left-leave-active {
  transform: rotateY(0);
}

</style>
