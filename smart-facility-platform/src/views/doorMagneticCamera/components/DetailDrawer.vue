<template>
  <el-drawer
    :before-close="handleClose"
    :modal="false"
    :visible.sync="isDrawer"
    :withHeader="false"
    size="70%"
    v-loading.fullscreen.lock="loading"
    @open="handlDrawereOpened"
  >
    <div v-if="isDrawer">
      <div class="detail-container">
        <div class="detail-padding">
          <DrawerNav
            :is-width="false"
            :deviceName="detailInfo.contactNo"
            :name="detailInfo.contactName"
            @handle="handleClose"
          />

          <el-descriptions :title="$t('common.basicInformation')">
            <template v-if="$store.state.level" slot="extra">
              <el-button
                class="icon-information"
                @click="handleOpenMessageDialog('ReturnCommand')"
              >
                &nbsp;{{ $t('hardware.returnCommand') }}
              </el-button>
              <el-button
                type="primary"
                class="icon-edit"
                @click="dialogVisible = true"
              >
                &nbsp;{{ $t('common.edit') }}
              </el-button>
            </template>
          </el-descriptions>
          <div class="layout-row">
            <div style="margin-right: 24px">
              <!-- 状态 -->
              <DeviceStatus :statusInfo="statusInfo"></DeviceStatus>
            </div>
            <div>
              <el-descriptions :column="3">
                <!-- 智能硬件 -->
                <el-descriptions-item :label="$t('hardware.hardware')">
                  {{ detailInfo.contactName }}
                </el-descriptions-item>
                <!-- 单次录影时长 -->
                <el-descriptions-item
                  :label="$t('doorMagneticCamera.singleRecordingDuration')"
                >
                  <span v-if="['', undefined, null].includes(detailInfo.contactSingleVideoTime)">-</span>
                  <span v-else>{{ detailInfo.contactSingleVideoTime }}{{ $t('common.second') }}</span>
                </el-descriptions-item>
                <!-- 剩余电量 -->
                <el-descriptions-item
                  :label="$t('doorMagneticCamera.remainingPower')"
                >
                {{ !['', undefined, null].includes(detailInfo.contactBatteryPower) ? (detailInfo.contactBatteryPower + '%') : '-' }}
                </el-descriptions-item>
                <!-- 硬件编号 -->
                <el-descriptions-item :label="$t('doorMagneticCamera.doorCameraNo')">
                  {{ detailInfo.contactNo }}
                </el-descriptions-item>
                <!-- 创建时间 -->
                <el-descriptions-item :label="$t('common.creatDate')">
                  {{ detailInfo.createTime | localToUtc }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>

          <DeviceBindRelationship :id="strId" :relateDeviceList="relateDeviceList" />
          <!-- 监控视频 -->
          <div class="el-descriptions">
            <div class="el-descriptions__header">
              <div class="el-descriptions__title">
                {{ $t('doorMagneticCamera.surveillanceVideo') }}
              </div>
            </div>
            <SurveillanceVideo ref="SurveillanceVideo" :detailInfo="detailInfo" @viewVideo="handleViewVideo" />
          </div>
          <!-- 开关纪录 -->
          <div class="el-descriptions mt50">
            <div class="el-descriptions__header">
              <div class="el-descriptions__title">
                {{ $t('doorMagneticCamera.openRecord') }}
              </div>
            </div>
            <SwitchRecord ref="SwitchRecord" :detailInfo="detailInfo" @viewVideo="handleViewVideo" />
          </div>
        </div>
      </div>

      <return-command
        ref="ReturnCommand"
      />
      <!-- 编辑弹窗 -->
      <AddEditDialog
        :cameraId="id"
        :dialogVisible="dialogVisible"
        :dialogTitle="$t('common.edit')"
        :dialogType="'detailEdit'"
        :cameraInfo="detailInfo"
        @close="dialogVisible = false"
        @refresh="handleRefresh"
      />
      <!-- 视频预览 -->
      <ImageViewer
        :visible.sync="viewImg"
        :previewSrcList="previewSrcList"
        :initImageIndex="initImageIndex"
        :zIndex="3000"
        :filename="filename"
      ></ImageViewer>
    </div>
  </el-drawer>
</template>

<script>
import DrawerNav from '@c/DrawerNav'
import ReturnCommand from '@/views/device/components/ReturnCommand'
import DeviceStatusGarden from '@c/DeviceStatusGarden'
import DeviceBindRelationship from '@/views/device/components/DeviceBindRelationship'

import SurveillanceVideo from './SurveillanceVideo.vue'
import SwitchRecord from './SwitchRecord.vue'
import { statusText } from '@/utils/methods'
import { doorCameraRunningState } from '../dict'
import { getDoorCameraDetail } from '@/api/doorMagneticCamera'

import AddEditDialog from './AddEditDialog.vue'
export default {
  components: {
    DrawerNav,
    ReturnCommand,
    DeviceStatusGarden,
    DeviceBindRelationship,
    AddEditDialog,
    SurveillanceVideo,
    SwitchRecord
  },
  props: {
    id: {
      type: Number | String,
      default: null
    },
    strId: {
      type: String,
      default: null
    },
    isDrawer: {
      type: Boolean,
      default: false
    },
    isSuperAdministrator: {
      type: Boolean,
      default: false
    },
    // 从列表传过来的信息
    detailMainInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      detailInfo: {},
      // 编辑弹窗
      dialogVisible: false,
      viewImg: false,
      previewSrcList: [],
      initImageIndex: 0,
      filename: '',
      relateDeviceList: [] // 关联设备
    }
  },
  watch: {},
  computed: {
    statusInfo () {
      let status = {
        type: this.detailInfo.contactRunStatus == 1 ? 'green' : '',
        name: statusText(this.detailInfo.contactRunStatus, doorCameraRunningState)
      }
      return status
    }
  },
  methods: {
    handleRefresh () {
      this.$emit('eidtSuccess')
      this.refreshData()
    },
    // 打开详情弹窗回调
    handlDrawereOpened () {
      this.refreshData()
    },
    // 视频预览
    handleViewVideo (data) {
      this.filename = data.filename
      this.previewSrcList = data.urlList
      this.viewImg = true
    },
    async getDetail() {
      this.loading = true
      this.relateDeviceList = []
      try {
        await getDoorCameraDetail({id: this.id}).then(res => {
          this.loading = false
          this.detailInfo = res.items || {}
          if (res.items?.contactRelevanceName) {
            this.relateDeviceList.push({
              name: res.items.contactRelevanceName,
              id: res.items.contactRelevanceId,
              type: 4
            })
          }
        })
      } catch (e) {
        this.loading = false
        console.log(e)
      }
    },
    // 刷新弹窗数据
    async refreshData () {
      // 编辑完硬件名称和单次录影时长之后，手动更新数据
      await this.getDetail()
      this.$refs.SurveillanceVideo && this.$refs.SurveillanceVideo.getList(this.detailInfo.contactNo)
      this.$refs.SwitchRecord && this.$refs.SwitchRecord.getList(this.detailInfo.contactNo)
    },

    // 打开设备信息弹框
    handleOpenMessageDialog (e) {
      this.detailInfo.no = this.detailInfo.contactNo
      this.$refs[e].open(0, this.detailInfo)
    },

    handleClose() {
      this.$emit('update:isDrawer', false)
      this.detailInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.button-disabled {
  cursor: no-drop;
}
.mt50 {
  margin-top: 50px;
}
</style>
