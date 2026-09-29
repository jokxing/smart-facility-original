<template>
  <div class="scm-img-preview" v-bind="$attrs" v-on="$listeners">
    <span @click="clickHandler">
      <slot></slot>
    </span>
    <template v-if="preview">
      <preview
        :z-index="zIndex"
        :initial-index="imageIndex"
        v-if="showViewer"
        :on-close="closeViewer"
        :url-list="previewSrcList"
        :downloadable="downloadable"
        :filename="filename"
      />
    </template>
  </div>
</template>

<script>
import preview from './preview'

let prevOverflow = ''

export default {
  name: 'ImageViewer',

  components: {
    preview
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    previewSrcList: {
      type: Array,
      default: () => []
    },
    zIndex: {
      type: Number,
      default: 2000
    },
    initImageIndex: {
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
      showViewer: false
    }
  },

  computed: {
    preview() {
      const { previewSrcList } = this
      return Array.isArray(previewSrcList) && previewSrcList.length > 0
    },
    imageIndex() {
      let previewIndex = this.initImageIndex || 0
      const srcIndex = this.previewSrcList.indexOf(this.src)
      if (srcIndex >= 0) {
        previewIndex = srcIndex
      }
      return previewIndex
    }
  },

  watch: {
    visible: {
      handler(visible) {
        if (visible) {
          this.clickHandler()
        }
      },
      immediate: true
    }
  },

  methods: {
    clickHandler() {
      // don't show viewer when preview is false
      if (!this.preview) {
        return
      }
      // prevent body scroll
      prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      this.showViewer = true
    },

    closeViewer() {
      document.body.style.overflow = prevOverflow
      this.showViewer = false
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="less" scoped>
.scm-img-preview {
  display: inline-block;
  vertical-align: middle;
}
</style>
