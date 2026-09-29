<template>
  <div class="surveillance-video">
    <div class="search-form">
      <el-date-picker
        v-model="formData.createDate"
        type="date"
        value-format="yyyy-MM-dd HH:mm:ss"
        :placeholder="$t('labDevice.selectDate')"
        @change="handleDateRangeChange"
      >
      </el-date-picker>
      <!-- <span class="batch-select-btn" v-if="$store.state.level && videoList.length">
        <el-button class="icon-setup" @click="toggleSelectable">
          {{
            canSelect
              ? $t('common.cancelMultiSelect')
              : $t('common.multiSelect')
          }}
        </el-button>
        <el-button
          class="icon-download1"
          @click="handleDownload"
          v-if="selectionList.length"
        >
          {{ $t('common.download') }}
        </el-button>
      </span> -->
    </div>
    <div class="video-wrapper">
      <div v-if="videoList.length">
        <div class="select-all" v-if="canSelect">
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange"
            >{{ $t('system.changeAll') }}</el-checkbox
          >
        </div>
        <div class="video-list">
          <!-- TODO：记得修改报警状态的值 -->
          <div
            class="video-item"
            :class="{'warning-bg': [2].includes(item.contactRunStatus)}"
            v-for="item in videoList"
            :key="item.id"
            @click="handleClickVideo($event, item)"
          >
            <div class="create-time">
              {{ item.uploadTime }}
            </div>
            <img
              src="@/assets/doorMagneticCamera/play-icon.png"
              class="play-icon"
              alt=""
            />
            <img
              src="@/assets/doorMagneticCamera/video-icon.png"
              class="video-icon"
              alt=""
            />
            <el-checkbox
              v-model="item.isChecked"
              :true-label="1"
              :false-label="0"
              @change="handleSelectChange(arguments, item)"
              class="select-checkbox"
              v-if="canSelect"
            >
            </el-checkbox>
          </div>
        </div>
      </div>
      <div class="empty-content" v-else>{{ $t('common.notMessage1') }}</div>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import { BASE_URL } from "@/utils/constant";
import { queryDoorVideoMonitor } from '@/api/doorMagneticCamera';
export default {
  data() {
    return {
      canSelect: false,
      selectionList: [], // 批量下载视频
      formData: {
        createDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      },
      ossInfo: {},
      // 视频列表
      videoList: [],
      isIndeterminate: false,
      checkAll: false
    }
  },
  props: {
    detailInfo: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    handleDateRangeChange () {
      this.getList()
    },
    handleQueryParams () {
      let dateRange = this.formData.createDate ? this.formData.createDate.split(' ') : []
      let params = {
        uploadStartTime: dateRange[0] ? dateRange[0] + ' 00:00:00' : '',
        uploadEndTime: dateRange[0] ? dateRange[0] + ' 23:59:59' : '',
        contactNo: this.detailInfo.contactNo
      }
      return params
    },
    // 获取视频列表
    async getList(contactNo) {
      try {
        let formatParams = this.handleQueryParams()
        if (contactNo) {
          formatParams.contactNo = contactNo
        }
        await queryDoorVideoMonitor({ ...formatParams }).then(res => {
          if (res.items.length) {
            res.items.forEach((item, index) => {
              item.isChecked = 0
              item.filename = item.videoOssUrl ? item.videoOssUrl.substr(item.videoOssUrl.lastIndexOf('/') + 1) : ''
              if (!item.id) {
                item.id = item.filename + index
              }
            })
          }
          this.videoList = res.items || []
        })
      } catch (e) {
        console.log(e)
      }
    },
    // 批量下载
    async handleDownload () {
      if (this.selectionList.length > 10) {
        return this.$message.warning(this.$t('common.maxSelectionWarningText'))
      }
      let ids = this.selectionList.map(v => v.id)
      console.log('ids', ids)
      // TODO：把ids传给后端，后端打包下载
    },
    // 切换批量操作和取消批量操作
    toggleSelectable() {
      this.canSelect = !this.canSelect
      if (!this.canSelect) {
        this.selectionList = []
        this.isIndeterminate = false
        this.checkAll = false
        this.changeVideoChecked(0)
      }
    },
    // 视频checkbox点击事件
    handleSelectChange(val, item) {
      if (val[0] === 1 && !this.selectionList.find((v) => v.id === item.id)) {
        this.selectionList.push(item)
      } else if (val[0] === 0) {
        this.selectionList = this.selectionList.filter(
          (v) => v.id !== item.id && v
        )
      }
      let checkedCount = this.selectionList.length
      this.checkAll = checkedCount === this.videoList.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.videoList.length
    },
    // 全选
    handleCheckAllChange(val) {
      this.selectionList = val ? this.videoList : []
      this.isIndeterminate = false
      this.changeVideoChecked(val ? 1 : 0)
    },
    changeVideoChecked(checked) {
      this.videoList.forEach((item) => {
        item.isChecked = checked
      })
    },
    async handleClickVideo(event, item) {
      // console.log('点击了', event.target.className, item)
      // 在批量操作状态下，点击checkbox以外的地方，要自动变更checked状态
      if (
        this.canSelect &&
        event.target.className.indexOf('el-checkbox') === -1
      ) {
        item.isChecked = item.isChecked === 0 ? 1 : 0
        this.handleSelectChange([item.isChecked], item)
      } else if (!this.canSelect) {
        // 非批量操作状态，点击即预览
        this.$emit('viewVideo', { urlList: [BASE_URL + encodeURIComponent(item.videoOssUrl)], filename: item.filename })
      }
    }
  },
  mounted() {}
}
</script>
<style lang="less" scoped>
@import "../../../style/variable.less";
.surveillance-video {
  .batch-select-btn {
    float: right;
    clear: both;
  }
  .video-wrapper {
    margin-top: 20px;
    min-height: 100px;
    .video-list {
      margin-top: 20px;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      max-height: 200px;
      overflow-y: auto;
      .video-item {
        flex: 1; // flex是flex-shrink、flex-grow、flex-basis的简写
        margin: 0 10px 10px 0;
        width: calc((100% - 70px) / 7);
        max-width: calc((100% - 70px) / 7);
        min-width: calc((100% - 70px) / 7);
        height: 90px;
        background: #f1f6ff;
        border-radius: 8px;
        padding: 16px 16px 0;
        box-sizing: border-box;
        position: relative;
        cursor: pointer;
        .create-time {
          font-size: 14px;
          font-weight: 400;
          color: #555555;
        }
        .play-icon {
          display: block;
          width: 40px;
          height: 40px;
          margin-top: 10px;
          // font-size: 40px;
        }
        .video-icon {
          display: block;
          width: 47px;
          height: 51px;
          position: absolute;
          right: 16px;
          bottom: 0;
        }
        .select-checkbox {
          position: absolute;
          right: 6px;
          bottom: 4px;
        }
      }
      .warning-bg {
        .create-time {
          color: @abnormal;
        }
      }
      .flex-item:nth-child(7n + 7) {
        margin-right: 0;
      }
    }
  }
}
</style>
