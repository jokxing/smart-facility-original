<template>
  <div class="surveillance-video">
    <div class="search-form">
      <el-date-picker
        v-model="formData.createDate"
        type="date"
        value-format="yyyy-MM-dd HH:mm:ss"
        :placeholder="$t('labDevice.selectDate')"
        @change="handleDateRangeChange">
      </el-date-picker>
      <span class="batch-select-btn" v-if="$store.state.level">
        <el-button
            class="icon-download1"
            @click="handleExport"
            type="primary"
            :disabled="downloadBtnDisabled"
          >
            {{ $t('common.exportReportBtnText') }}</el-button
          >
      </span>
    </div>
    <div class="video-wrapper">
      <Table
        ref="recordTable"
        :tableData="tableColumns"
        :data="recordData"
        @handleViewVideo="handleViewVideo"
        v-loading="loading"
      ></Table>
      <div class="paging">
        <pagination
          
          :limit.sync="page.pageSize"
          :page.sync="page.pageNum"
          :total="total"
          :page-sizes="$store.state.pageSizes"
          @pagination="handlePaginationChange"
        />
        <!-- v-show="total > page.pageSize" -->
      </div>
    </div>
  </div> 
</template>
<script>
import moment from "moment"
import mixin from '@/utils/mixin'
import { querySwitchRecord, postExportDoorRecordSwitch } from '@/api/doorMagneticCamera'
import { items } from '@/utils/constant'
import Pagination from '@/components/Pagination/index'
import Table from '@c/Tables'
import { BASE_URL } from "@/utils/constant";
export default {
  components: { Table, Pagination },
  data () {
    return {
      formData: {
        createDate: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
      },
      tableColumns: [
        {
          label: this.$t('common.tableIndex'),
          // type: 'index',
          prop: 'index',
          width: '60',
          align: 'center'
        },
        // 关联设备
        {
          label: this.$t('doorMagneticCamera.relationDevice'),
          prop: 'switchThingName'
        },
        // 开门时间
        {
          label: this.$t('doorMagneticCamera.openTime'),
          prop: 'switchOnTime',
          formatter: (row/*, column*/) => {
            let [date, time] = row.switchOnTime?.split(' ') || []
            return row.switchOnTime ? date + '\r\n' + time : '';
          },
          className: 'white-space-pre-line'
        },
        // 关闭时间
        {
          label: this.$t('doorMagneticCamera.closeTime'),
          prop: 'switchOffTime',
          formatter: (row/*, column*/) => {
            let [date, time] = row.switchOffTime?.split(' ') || []
            return row.switchOffTime ? date + '\r\n' + time : '';
          },
          className: 'white-space-pre-line'
        },
        // 开门时长
        {
          label: this.$t('doorMagneticCamera.openingDuration'),
          prop: 'switchDuration',
          formatter: (row) => {
            return ['', undefined, null].includes(row.switchDuration) ? '' : row.switchDuration + this.$t('common.second')
          }
        },
        // 视频链接
        {
          label: this.$t('doorMagneticCamera.videoLink'),
          isButton: true,
          clickList: [
            {
              text: this.$t('doorMagneticCamera.viewVideo'),
              click: "handleViewVideo"
            }
          ]
        }
      ],
      page: {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE
      },
      total: 0,
      recordData: [],
      loading: false,
      downloadBtnDisabled: true
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
    handlePaginationChange () {
      this.getList()
    },
    async handleExport () {
      this.$message.warning(this.$t('common.exportMessage'))
      this.downloadBtnDisabled = true
      try {
        let formatParams = this.handleQueryParams()
        postExportDoorRecordSwitch(formatParams).then((res) => {
          const data = moment(new Date()).format('YYYYMMDDHHmmss')
          mixin.methods.download(
            res,
            decodeURIComponent(
              this.$t('doorMagneticCamera.exportCameraSwitchRecord') + data,
              'UTF-8'
            )
          )
          this.downloadBtnDisabled = false
        })
      } catch (e) {
        this.downloadBtnDisabled = false
        console.log(e)
        this.$message.warning(this.$t('common.networkError'))
      }
    },
    handleQueryParams () {
      let dateRange = this.formData.createDate ? this.formData.createDate.split(' ') : []
      let params = {
        switchRecordStartTime: dateRange[0] ? dateRange[0] + ' 00:00:00' : '',
        switchRecordEndTime: dateRange[0] ? dateRange[0] + ' 23:59:59' : '',
        contactNo: this.detailInfo.contactNo
      }
      return params
    },
    async getList(contactNo) {
      this.loading = true
      let formatParams = this.handleQueryParams()
      if (contactNo) {
        formatParams.contactNo = contactNo
      }
      try {
        querySwitchRecord({...formatParams, ...this.page}).then((res) => {
          this.loading = false
          if (res.code) {
            this.recordData = (res.items.list || []).map((item, index) => {
              item.index = index + 1 + (this.page.pageSize ? this.page.pageSize : 0) * (this.page.pageNum - 1) || ''
              return item
            })
            this.total = res.items.total
            this.downloadBtnDisabled = this.recordData.length <= 0
          } else {
            this.downloadBtnDisabled = this.recordData.length <= 0
            this.$message.error(res.message)
          }
        })
      } catch (e) {
        this.loading = false
        this.downloadBtnDisabled = this.recordData.length <= 0
        console.log(e)
      }
    },
    handleViewVideo (row) {
      let filename = row.videoOssUrl ? row.videoOssUrl.substr(row.videoOssUrl.lastIndexOf('/') + 1) : ''
      this.$emit('viewVideo', {urlList: [BASE_URL + encodeURIComponent(row.videoOssUrl)], filename})
    }
  },
  mounted () {}
}
</script>
<style lang="less" scoped>
.surveillance-video {
  .batch-select-btn {
    float: right;
    clear: both;
  }
  .video-wrapper {
    margin-top: 20px;
    
  }
}
</style>