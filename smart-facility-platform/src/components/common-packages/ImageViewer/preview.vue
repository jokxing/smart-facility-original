<template>
  <transition name="viewer-fade">
    <div
      tabindex="-1"
      ref="qb-image-viewer_wrapper"
      class="el-image-viewer__wrapper"
      :style="{ 'z-index': zIndex }"
    >
      <div class="el-image-viewer__mask"></div>
      <!-- CLOSE -->
      <span class="el-image-viewer__btn el-image-viewer__close" @click="hide">
        <i class="el-icon-circle-close"></i>
      </span>
      <!-- ARROW -->
      <template v-if="!isSingle">
        <span
          class="el-image-viewer__btn qb-image-viewer__prev"
          :class="{ 'is-disabled': !infinite && isFirst }"
          @click="prev"
        >
          <i class="el-icon-arrow-left" />
        </span>
        <span
          class="el-image-viewer__btn qb-image-viewer__next"
          :class="{ 'is-disabled': !infinite && isLast }"
          @click="next"
        >
          <i class="el-icon-arrow-right" />
        </span>
      </template>
      <!-- ACTIONS -->
      <div class="el-image-viewer__btn el-image-viewer__actions" v-if="downloadable || isImgType(currentImg)">
        <div class="el-image-viewer__actions__inner">
          <el-tooltip :content="$t('common.minify')" :open-delay="600" v-if="isImgType(currentImg)">
            <i
              class="qb-image-viewer_icon el-icon-zoom-out"
              @click="handleActions('zoomOut')"
            ></i>
          </el-tooltip>
          <el-tooltip :content="$t('common.enlarge')" :open-delay="600" v-if="isImgType(currentImg)">
            <i
              class="qb-image-viewer_icon el-icon-zoom-in"
              @click="handleActions('zoomIn')"
            ></i>
          </el-tooltip>
          <slot name="action-prepend"></slot>

          <i class="el-image-viewer__actions__divider"></i>
          <!-- <el-tooltip :content="$t('common.fullScreenOrOriginal')" :open-delay="600">
            <i
              :class="['qb-image-viewer_icon ', mode.icon]"
              @click="toggleMode"
            ></i>
          </el-tooltip> -->
          <!-- <slot name="action"></slot> -->
          <el-tooltip
            :disabled="!downloadable"
            :content="$t('common.download')"
            :open-delay="600"
          >
            <i
              v-if="downloadable"
              class="qb-image-viewer_icon el-icon-download"
              @click="toggleDownload"
            ></i>
          </el-tooltip>
          <i class="el-image-viewer__actions__divider"></i>

          <slot name="action-append"></slot>

          <el-tooltip :content="$t('common.turnLeft')" :open-delay="600" v-if="isImgType(currentImg)">
            <i
              class="qb-image-viewer_icon el-icon-refresh-left"
              @click="handleActions('anticlocelise')"
            ></i>
          </el-tooltip>
          <el-tooltip :content="$t('common.turnRight')" :open-delay="600" v-if="isImgType(currentImg)">
            <i
              class="qb-image-viewer_icon el-icon-refresh-right"
              @click="handleActions('clocelise')"
            ></i>
          </el-tooltip>
        </div>
      </div>
      <!-- CANVAS -->
      <div class="el-image-viewer__canvas">
        <slot name="title"></slot>
        <template v-for="(url, i) in urlList">
          <div
            class="el-image-viewer__canvas-container"
            v-if="i === index"
            :key="i"
            :style="imgStyle"
          >
            <slot :index="index" :row="url">
              <img
                v-if="isImgType(url)"
                ref="img"
                class="el-image-viewer__img"
                :key="i"
                :src="currentImg"
                @load="handleImgLoad"
                @error="handleImgError"
                @mousedown="handleMouseDown"
              />
              <div class="video-wrapper" v-if="isVideo(url)">
                <video class="video"
                  controls
                  preload="auto" 
                  webkit-playsinline="true"
                  playsinline="true"
                  x-webkit-airplay="allow" 
                  x5-video-player-type="h5"
                  x5-video-player-fullscreen="true"
                  x5-video-orientation="portraint"
                  height="100%"
                  width="100%"
                  autoplay
                >
                  <source :src="currentImg">
                  您的浏览器不支持 video 标签。
                </video>
              </div>
            </slot>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import { on, off } from 'element-ui/lib/utils/dom'
import { rafThrottle, isFirefox } from 'element-ui/lib/utils/util'
import { downloadFile } from '@/utils/methods'
const Mode = {
  CONTAIN: {
    name: 'contain',
    icon: 'el-icon-full-screen'
  },
  ORIGINAL: {
    name: 'original',
    icon: 'el-icon-c-scale-to-original'
  }
}
const mousewheelEventName = isFirefox() ? 'DOMMouseScroll' : 'mousewheel'
export default {
  name: 'elImageViewer',
  props: {
    urlList: {
      type: Array,
      default: () => []
    },
    zIndex: {
      type: Number,
      default: 2000
    },
    onSwitch: {
      type: Function,
      default: () => {}
    },
    onClose: {
      type: Function,
      default: () => {}
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    downloadable: {
      type: Boolean
    },
    filename: {
      type: String
    }
  },
  data() {
    return {
      index: this.initialIndex,
      isShow: false,
      infinite: true,
      loading: false,
      mode: Mode.CONTAIN,
      transform: {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false
      }
    }
  },
  computed: {
    isSingle() {
      return this.urlList.length <= 1
    },
    isFirst() {
      return this.index === 0
    },
    isLast() {
      return this.index === this.urlList.length - 1
    },
    currentImg() {
      return this.urlList[this.index]
    },
    imgStyle() {
      const { scale, deg, offsetX, offsetY, enableTransition } = this.transform
      const style = {
        transform: `scale(${scale}) rotate(${deg}deg)`,
        transition: enableTransition ? 'transform .3s' : '',
        'margin-left': `${offsetX}px`,
        'margin-top': `${offsetY}px`
      }
      if (this.mode === Mode.CONTAIN) {
        style.maxWidth = style.maxHeight = '100%'
      }
      return style
    }
  },
  watch: {
    initialIndex(index) {
      this.index = index
    },
    index: {
      handler: function (val) {
        this.reset()
        this.onSwitch(val)
      }
    },
    currentImg() {
      this.$nextTick(() => {
        if (!this.$refs.img) return
        const $img = this.$refs.img[0]
        if (!$img.complete) {
          this.loading = true
        }
      })
    }
  },
  methods: {
    getFileType (picUrl) {
      return picUrl.substring(picUrl.lastIndexOf(".") + 1, picUrl.length);
    },
    isImgType (picUrl) {
      let type = this.getFileType(picUrl);
      return /JPE?G|jpe?g|PNG|png|gif|GIF/i.test(type)
    },
    // 判断是否是视频
    isVideo (picUrl) {
      // 获取文件后缀名
      let type = this.getFileType(picUrl);
      return /avi|mp4|rmvb|rm|mpeg|navi|asf|mov|3gp|wmv|divx|xvid|flv|f4v/i.test(type)
    },
    hide() {
      this.deviceSupportUninstall()
      this.onClose()
    },
    deviceSupportInstall() {
      this._keyDownHandler = rafThrottle((e) => {
        const keyCode = e.keyCode
        switch (keyCode) {
        // ESC
        case 27:
          this.hide()
          break
          // SPACE
        case 32:
          this.toggleMode()
          break
          // LEFT_ARROW
        case 37:
          this.prev()
          break
          // UP_ARROW
        case 38:
          this.handleActions('zoomIn')
          break
          // RIGHT_ARROW
        case 39:
          this.next()
          break
          // DOWN_ARROW
        case 40:
          this.handleActions('zoomOut')
          break
        default:
          break
        }
      })
      this._mouseWheelHandler = rafThrottle((e) => {
        const delta = e.wheelDelta ? e.wheelDelta : -e.detail
        if (delta > 0) {
          this.handleActions('zoomIn', {
            zoomRate: 0.015,
            enableTransition: false
          })
        } else {
          this.handleActions('zoomOut', {
            zoomRate: 0.015,
            enableTransition: false
          })
        }
      })
      on(document, 'keydown', this._keyDownHandler)
      on(document, mousewheelEventName, this._mouseWheelHandler)
    },
    deviceSupportUninstall() {
      off(document, 'keydown', this._keyDownHandler)
      off(document, mousewheelEventName, this._mouseWheelHandler)
      this._keyDownHandler = null
      this._mouseWheelHandler = null
    },
    handleImgLoad() {
      this.loading = false
    },
    handleImgError(e) {
      this.loading = false
      e.target.alt = '加载失败'
    },
    handleMouseDown(e) {
      if (this.loading || e.button !== 0) return
      const { offsetX, offsetY } = this.transform
      const startX = e.pageX
      const startY = e.pageY
      this._dragHandler = rafThrottle((ev) => {
        this.transform.offsetX = offsetX + ev.pageX - startX
        this.transform.offsetY = offsetY + ev.pageY - startY
      })
      on(document, 'mousemove', this._dragHandler)
      on(document, 'mouseup', () => {
        off(document, 'mousemove', this._dragHandler)
      })
      e.preventDefault()
    },
    reset() {
      this.transform = {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false
      }
    },
    toggleMode() {
      if (this.loading) return
      const modeNames = Object.keys(Mode)
      const modeValues = Object.values(Mode)
      const index = modeValues.indexOf(this.mode)
      const nextIndex = (index + 1) % modeNames.length
      this.mode = Mode[modeNames[nextIndex]]
      this.reset()
    },
    toggleDownload () {
      downloadFile(this.urlList[this.index], this.filename)
      this.$emit('click-download', this.urlList[this.index])
    },
    prev() {
      if (this.isFirst && !this.infinite) return
      const len = this.urlList.length
      this.index = (this.index - 1 + len) % len
    },
    next() {
      if (this.isLast && !this.infinite) return
      const len = this.urlList.length
      this.index = (this.index + 1) % len
    },
    handleActions(action, options = {}) {
      if (this.loading) return
      const { zoomRate, rotateDeg, enableTransition } = {
        zoomRate: 0.2,
        rotateDeg: 90,
        enableTransition: true,
        ...options
      }
      const { transform } = this
      switch (action) {
      case 'zoomOut':
        if (transform.scale > 0.2) {
          transform.scale = parseFloat(
            (transform.scale - zoomRate).toFixed(3)
          )
        }
        break
      case 'zoomIn':
        transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3))
        break
      case 'clocelise':
        transform.deg += rotateDeg
        break
      case 'anticlocelise':
        transform.deg -= rotateDeg
        break
      default:
        break
      }
      transform.enableTransition = enableTransition
    }
  },
  mounted() {
    this.deviceSupportInstall()
    // add tabindex then wrapper can be focusable via Javascript
    // focus wrapper so arrow key can't cause inner scroll behavior underneath
    this.$refs['qb-image-viewer_wrapper'].focus()
  }
}
</script>

<style lang="less" scoped>
.el-image-viewer__close {
  i {
    transition: color 0.3s ease;
  }
  &:hover {
    i {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}
.el-image-viewer__canvas-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.qb-image-viewer_icon {
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
}

.qb-image-viewer_next,
.qb-image-viewer_prev {
  &:hover {
    background: #4d4e4e;
  }
}
.video-wrapper {
  width: 80%;
  height: 600px;
  .video {
    // object-fit:fill;
  }
}
</style>
