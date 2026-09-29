<template>
  <div class="disc-container">
    <transition name="open">
      <div v-if="show" class="disc-rows">
        <div class="row-center">
          <div class="poor">
            <router-link
              :to="{ path: '/gateway/home/index' }"
              tag="a"
              target="_blank"
              >{{ data.poor }}</router-link>
          </div>
        </div>
        <div class="row-corner row-top">
          <router-link
            :to="{ path: '/gateway/home/index' }"
            tag="a"
            target="_blank"
            >分</router-link>
        </div>
        <div class="row-corner row-bot">
          <router-link
            :to="{ path: '/gateway/home/index' }"
            tag="a"
            target="_blank"
            >差</router-link>
        </div>
        <div class="row-bottom">
          <div class="disc-col">
            <div class="title">
              <span>
                <router-link
                  :to="{ path: '/gateway/home/index' }"
                  tag="a"
                  target="_blank"
                  >总设备</router-link>
              </span>
              <span>
                <router-link
                  :to="{ path: '/gateway/home/index' }"
                  tag="a"
                  target="_blank"
                  >故障数</router-link>
              </span>
            </div>
            <div class="title">
              <span id="equipmentTotalNum">
                <router-link
                  :to="{ path: '/gateway/home/index' }"
                  tag="a"
                  target="_blank"
                  >{{ data.total }}</router-link>
              </span>
              <span id="equipmentErrorNum">
                <router-link
                  :to="{ path: '/gateway/home/index' }"
                  tag="a"
                  target="_blank"
                  >{{ data.alarmCount }}</router-link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div class="toggle pointer" @click="show = !show">
      <span class="splinter large"></span>
      <span class="splinter small"></span>
    </div>
  </div>
</template>
<script>
export default {
  name: "Disc-container",
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      show: false,
    };
  },
};
</script>

<style lang="less" scoped>
@import "../../../style/variable";
.disc-container {
  top: -80px;
  left: -50px;
  display: block;
  position: absolute;
  width: 300px;
  height: 300px;
  z-index: 150;
}
.row-bottom {
  position: absolute;
  bottom: 20px;
  width: 100%;
  .title {
    font-size: 18px;
    span {
      margin: 2px 10px;
      min-width: 60px;
    }
  }
  .disc-col {
    div {
      margin: 5px 10px 5px 10px;
    }
    span {
      display: inline-block;
      a {
        color: @white;
      }
    }
  }
}
.disc-rows {
  opacity: 1;
  display: block;
  width: 300px;
  height: 300px;
  color: @white;
  background: #36457B;
  border-radius: 50%;
  text-align: center;
}
.toggle {
  top: 120px;
  left: -4px;
  -webkit-transition-delay: 0.4s;
  transition-delay: 0.4s;
  height: 80px;
  padding: 0;
  width: 80px;
  background: #36457B;
  cursor: pointer;
  opacity: 1;
  -webkit-transform: none;
  transform: none;
  pointer-events: auto;
  position: absolute;
  text-align: center;
  border-radius: 50%;
  span {
    display: inline-block;
  }
}
.toggle .splinter.small {
  top: 26px;
  left: 60px;
  height: 32px;
}
.toggle .splinter {
  width: 4px;
  position: absolute;
  background-color: #465690;
}

.toggle .large {
  top: 30px;
  left: 68px;
  height: 24px;
}
.row-corner {
  position: absolute;
  right: 30px;
  padding: 0;
  margin: 0;
  a {
    color: @white;
  }
}
.row-top {
  bottom: 148px;
}
.row-bot {
  bottom: 114px;
}
.row-center {
  position: absolute;
  text-align: center;
  margin: 115px 5px;
  width: 100%;
  .poor {
    font-size: 82px;
    font-weight: bold;
    a {
      color: @white;
    }
  }
}
.open-enter-active,
.open-leave-active {
  transition: opacity 0.5s;
}
.open-enter,
.open-leave-to {
  opacity: 0;
}
</style>
