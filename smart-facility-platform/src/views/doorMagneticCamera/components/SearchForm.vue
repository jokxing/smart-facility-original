<template>
  <div class="search-form-com">
    <el-form
      class="search-form"
      ref="elForm"
      :model="formData"
      label-width="auto"
      inline
      label-position="left"
      @submit.native.prevent
    >
      <el-form-item>
        <el-select
          class="w250 margin-small-right"
          v-model="formData.contactMagnetStatus"
          filterable
          @change="handleFormChange('contactMagnetStatus', formData.contactMagnetStatus)"
          clearable
          :placeholder="$t('doorMagneticCamera.doorCameraStatus')">
          <el-option
            v-for="item in cameraStatus"
            :key="item.code"
            :label="item.label"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          class="w250 margin-small-right"
          v-model="formData.contactRunStatus"
          filterable
          @change="handleFormChange('contactRunStatus', formData.contactRunStatus)"
          clearable
          :placeholder="$t('hardware.doorCameraRunningState')">
          <el-option
            v-for="item in doorCameraRunningState"
            :key="item.code"
            :label="item.label"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="checkWords">
        <el-input
          v-model.trim="formData.checkWords"
          class="input-with-select"
          clearable
          :placeholder="$t('common.inputKeyword')"
          @keyup.enter.native="handleButtonClick('search')">
          <el-button
              slot="append"
              icon="icon-search1"
              class="el-button-host"
              @click="handleButtonClick('search')">
          </el-button>
      </el-input>
      </el-form-item>
    
      <el-button class="icon-reset ml10" @click="handleButtonClick('refresh')"></el-button>
    </el-form>
  </div>
</template>
<script>
import { doorCameraRunningState, cameraStatus } from '../dict'
export default {
  mixins: [],
  props: {
    formData: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      doorCameraRunningState,
      cameraStatus
    }
  },
  components: {
  },
  computed: {},
  mounted () {
  },
  methods: {
    handleFormChange (prop, data) {
      this.$emit('change', {prop, data})
    },
    handleButtonClick (type) {
      this.$emit('buttonClick', type)
    }
  },
  created () {}
}
</script>
<style lang="less" scoped>
.search-form-com {
  .w160 {
    width: 160px !important;
  }
  .w215 {
    width: 215px !important;
  }
  .w250 {
    width: 250px !important;
  }
  .ml10 {
    margin-left: 10px;
  }
}
.search-form-com /deep/ .el-form-item {
    margin-bottom: 10px;
    margin-right: 0px;
}

/deep/.el-input__inner {
    height: 40px !important;
}
</style>
