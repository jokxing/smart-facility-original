<template>
  <div v-loading="loading" :element-loading-text="loadingText">
    <div class="session">
      <device-total
        :object="totalObject"
        @handle="handleQuery"
        @handleAll="handleQuery"
        :is-not-camera="true"
        :showUnit="false"
      />
    </div>

    <MainTable
      ref="multipleTable"
      :api="getDoorCameraList"
      :tableColumns="tableColumns"
      :tableParams="formData"
      :cellClassNameFunction="cellClassNameFunction"
      :clearSelectionWhenRefreshData="false"
      :requiredParam="requiredParam"
      @textLinkClick="textLinkClick"
      @selectionChange="handleSelectionChange"
      @handleBarClick="handleBarClick"
      @sortChange="handleSortChange"
    >
      <template slot="searchForm">
        <!-- 筛选表单 -->
        <div>
          <SearchForm
            :formData="formData"
            @change="handleSearchFormChange"
            @buttonClick="handleSearchFormButtonClick"
          />
        </div>
        <div class="mb10">
          <el-button
            v-if="$store.state.level"
            class="icon-addto"
            type="primary"
            @click="handleAdd"
          >
            {{ $t('hardware.addDoorCamera') }}
          </el-button>
          <el-button
            v-if="$store.state.level"
            class="icon-setup"
            @click="multiSelect = !multiSelect"
          >
            {{
              multiSelect
                ? $t('common.cancelMultiSelect')
                : $t('common.multiSelect')
            }}
          </el-button>
          <el-button
            v-if="$store.state.level"
            class="icon-upload"
            @click="importFileVisible = !importFileVisible"
          >
            {{ $t('common.importHandle') }}
          </el-button>
          <el-button
            v-if="$store.state.level"
            class="icon-download1"
            @click="handleExport"
          >
            {{ $t('common.export') }}</el-button
          >
        </div>
        <div v-if="multipleSelection.length || multiSelect" class="choose-bar">
          <div class="checked">
            {{ $t('common.multipleSelection')
            }}<span>{{ multipleSelection.length }}</span
            >{{ $t('common.item') }}
          </div>
          <el-button @click="handleBatchDeleteCamera">{{
            $t('common.batchDelete')
          }}</el-button>
        </div>
      </template>
      <template slot-scope="data">
        <!-- 信号强度 -->
        <div v-if="data.prop === 'contactSignal'">
          <div v-if="!['', undefined, null].includes(data.data.contactSignal)" class="signal-content">
            <!-- 信号强度 -->
            {{ $t('hardware.signalStrength') + '：' }}
            {{ data.data.contactSignal ? data.data.contactSignal + 'dBm' : '' }}
            <!-- contactSignalType信号强度类型：0-强，1-中，2-弱 -->
            <span
              :class="`signal-strength-${data.data.contactSignalType} signal-strength-text`"
              v-if="!['', undefined, null].includes(data.data.contactSignalType)">
              （{{ contactSignalTypeKeyValue[data.data.contactSignalType] }}）
            </span>
          </div>
          <!-- 剩余电量 -->
          <div v-if="!['', undefined, null].includes(data.data.contactBatteryPower)">
            {{ $t('doorMagneticCamera.remainingPower') + '：' }}{{ data.data.contactBatteryPower + '%' }}
          </div>
        </div>
      </template>
    </MainTable>
    <DetailDrawer
      :id="currentCameraId"
      :strId="cameraInfo.strId"
      :is-drawer.sync="isShowDetailDrawer"
      :isSuperAdministrator="isSuperAdministrator"
      :detailMainInfo="cameraInfo"
      @handle="handleClose"
      @eidtSuccess="getPageData"
    />

    <!-- 新增、编辑弹窗 -->
    <AddEditDialog
      :cameraId="currentCameraId"
      :dialogVisible="dialogVisible"
      :dialogTitle="dialogTitle"
      :dialogType="dialogType"
      :cameraInfo="cameraInfo"
      @close="dialogVisible = false"
      @refresh="getPageData"
    />
    <!-- 导入弹窗 -->
    <ImportFile
      v-if="importFileVisible"
      :title="importTitle"
      @handleUpdateInit="handleUpdateInit"
      @hiddenModalVisible="hiddenModalVisible"
    ></ImportFile>

    <!-- 今日异常次数 -->
    <ExceptionsNumsDialog
      ref="ExceptionsNumsDialog"
      :showClearMessageBtn="isSuperAdministrator"
      :dialogVisible="showExceptionsNumsDialog"
      :cameraInfo="cameraInfo"
      @close="showExceptionsNumsDialog = false"
    />
  </div>
</template>

<script>
import { getDoorCameraList, deletebatchcontact, getDoorCameraDashboard, postExportDoorCameraList } from '@/api/doorMagneticCamera'
import mixin from '@/utils/mixin'
import ImportFile from '@/components/ImportFile'
import DeviceTotal from '@c/DeviceTotal/index'
import moment from 'moment'

import SearchForm from './components/SearchForm.vue'
import Table from '@c/Tables'

import AddEditDialog from './components/AddEditDialog.vue'
import DetailDrawer from './components/DetailDrawer.vue'
import ExceptionsNumsDialog from './components/ExceptionsNumsDialog.vue'
import { statusText } from '@/utils/methods'
import { doorCameraRunningState, cameraStatus } from './dict'

export default {
  name: 'DoorMagneticCamera',
  inject: ['reload'],
  components: {
    DeviceTotal,
    DetailDrawer,
    ImportFile,
    SearchForm,
    Table,
    AddEditDialog,
    ExceptionsNumsDialog
  },
  data() {
    const _this = this
    return {
      getDoorCameraList,
      loadingText: _this.$t('common.hintDefault'),
      classificationTypeItem: null, // 顶部分类统计当前选中项
      totalObject: {
        overview: [
          {
            num: 0,
            title: _this.$t('hardware.doorCameraRunningStateNormal'),
            status: 1,
            contactRunStatus: 1,
            prop: 'normal'
          },
          // {
          //   num: 0,
          //   title: _this.$t('hardware.doorCameraRunningStateWaring'),
          //   status: -1
          // },
          {
            num: 0,
            title: _this.$t('hardware.doorCameraRunningStateOffline'),
            status: -100,
            contactRunStatus: 0,
            prop: ' offline'
          },
          {
            num: 0,
            title: _this.$t('common.unAssociatedDeviceNum'),
            status: -99,
            className: 'goden-bg',
            icon: 'icon-weibangding',
            contactRunStatus: -1,
            prop: 'noRelate'
          }
        ],
        total: { title: _this.$t('hardware.doorCamera'), num: 0 }
      },
      formData: {},
      loading: false,
      isShowDetailDrawer: false, // 控制详情弹窗是否展示
      multipleSelection: [], // 表格多选
      // 导入弹窗
      importFileVisible: false,
      importTitle: 'doorMagneticCamera',
      multiSelect: false,
      // 表格列配置
      tableColumns: [
        {
          type: 'selection',
          align: 'center'
          // attrs: {
          //   selectable: (row, index) => {
          //     console.log(205, row, index)
          //     return false
          //   }
          // }
        },
        {
          label: _this.$t('common.tableIndex'),
          type: 'index',
          width: '62',
          align: 'center'
        },
        {
          label: _this.$t('doorMagneticCamera.doorCameraName'),
          prop: 'contactName',
          isButton: true
        },
        {
          label: _this.$t('doorMagneticCamera.doorCameraNo'),
          prop: 'contactNo'
        },
        // 关联设备
        {
          label: _this.$t('doorMagneticCamera.relationDevice'),
          prop: 'contactRelevanceName'
        },
        // 门磁状态
        {
          label: _this.$t('doorMagneticCamera.doorCameraStatus'),
          prop: 'contactMagnetStatus',
          minWidth: '120',
          formatter: (row /*, column*/) => {
            let statusName = statusText(row.contactMagnetStatus, cameraStatus)
            let checkTimeStr = row.contactCheckTime ? `\r\n${this.$t('hardware.detectionDate')}：${row.contactCheckTime}` : ''
            return statusName ? `${statusName}${checkTimeStr}` : ''
          },
          className: 'white-space-pre-line'
        },
        // 运行状态
        {
          label: _this.$t('doorMagneticCamera.doorCameraRunningStatus'),
          prop: 'contactRunStatus',
          minWidth: '90',
          formatter: (row /*, column*/) => {
            return statusText(row.contactRunStatus, doorCameraRunningState)
          }
        },
        //今日异常次数
        {
          label: _this.$t('doorMagneticCamera.todayExceptionsNums'),
          prop: 'numExceptionToday',
          isButton: true
        },

        // 状态
        {
          isSlot: true,
          label: _this.$t('hardware.status'),
          width: '180',
          prop: 'contactSignal'
        },
        // 创建时间
        {
          label: _this.$t('common.creatDate'),
          prop: 'createTime',
          width: '120',
          formatter: (row /*, column*/) => {
            let [date, time] = row.createTime?.split(' ') || []
            return date ? date + '\r\n' + time : ''
          },
          className: 'white-space-pre-line',
          attrs: {
            sortable: 'custom'
          }
        },
        {
          label: _this.$t('common.handle'),
          isButton: true,
          width: '100',
          align: 'center',
          clickList: [
            {
              text: _this.$t('common.edit'),
              key: 'edit'
            },
            {
              text: _this.$t('common.delete'),
              key: 'delete',
              class: 'abnormal'
            }
          ]
        }
      ],
      currentCameraId: '', // 当前编辑/查看的摄像头id
      cameraInfo: {}, // 当前编辑/查看的摄像头信息
      dialogVisible: false, // 新增、编辑弹窗
      dialogTitle: '', // 新增、编辑弹窗标题
      dialogType: '', // 新增、编辑弹窗类型：add-新增，edit-点击列表里的编辑按钮，detailEdit-详情弹窗点击编辑
      showExceptionsNumsDialog: false, // 异常次数弹窗
      // 排序传参和表格排序的传参对照
      sortKeyVal: {
        ascending: 'asc',
        descending: 'desc'
      },
      // 信号强度
      contactSignalTypeKeyValue: {
        0: '强',
        1: '中',
        2: '弱'
      }
    }
  },
  created() {
    this.initQueryForm()
  },
  async mounted() {
    this.getPageData()
  },
  watch: {
    multipleSelection: function (value) {
      this.multiSelect = Boolean(value.length)
    },
    multiSelect: function (value) {
      if (!value) {
        this.multipleSelection = []
        this.$refs.multipleTable.clearSelection()
      }
    }
  },
  computed: {
    // 判断是否是超管
    isSuperAdministrator() {
      // 1-楚秀管理员，2-系统管理员，3-超级管理员，4-部门管理员，5-普通成员
      let roleId =
        JSON.parse(localStorage.getItem('USERINFO')) &&
        JSON.parse(localStorage.getItem('USERINFO')).roleId
      return roleId == 3
    }
  },
  methods: {
    // 运行状态列类名
    cellClassNameFunction({ row, column /*, rowIndex, columnIndex*/ }) {
      let className = ''
      if (column.property === 'contactRunStatus') {
        switch (row.contactRunStatus) {
          // 离线
          case 0:
            className = 'font-color-grey'
            break
          // 正常
          case 1:
            className = 'font-color-green'
            break
          // 报警
          // case 2:
          //   className = 'font-color-red'
          //   break
          default:
            break
        }
      }
      return className
    },
    handleEdit(row) {
      // TODO：id字段未定
      this.currentCameraId = row.id
      this.cameraInfo = row
      this.dialogTitle = this.$t('common.edit')
      this.dialogType = 'edit'
      this.dialogVisible = true
    },
    // 操作栏点击事件
    handleBarClick(type, scope) {
      if (type === 'edit') {
        this.handleEdit(scope.row)
      } else if (type === 'delete') {
        this.handleDelete(scope.row)
      }
    },
    // 排序
    handleSortChange (e) {
      if (e.prop === 'createTime') {
        // 默认倒序
        this.formData.sortStr = this.sortKeyVal[e.order || 'descending']
        this.formData.orderByColumn = 'create_time'
      }
      this.$refs.multipleTable && this.$refs.multipleTable.getTableData()
    },
    // 展示今日异常次数弹窗
    handleShowExceptionsDialog (row) {
      this.cameraInfo = JSON.parse(JSON.stringify(row))
      delete this.cameraInfo.createTime
      delete this.cameraInfo.updateTime
      delete this.cameraInfo.deleteFlag
      this.showExceptionsNumsDialog = true
    },
    // 表格点击事件
    textLinkClick(prop, row) {
      if (prop === 'contactName') {
        this.handleShowDrawer(row)
      } else if (prop === 'numExceptionToday') {
        this.handleShowExceptionsDialog(row)
      }
    },

    // 表格勾选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 筛选表单输入变化
    handleSearchFormChange() {
      // this.getPageData()
    },
    // 筛选表单按钮点击
    async handleSearchFormButtonClick(type) {
      if (type === 'refresh') {
        await this.initQueryForm()
      }
      this.getPageData()
    },
    // 筛选表单初始化
    initQueryForm() {
      this.formData = {
        checkWords: '', // 关键字
        contactMagnetStatus: '', // 门磁状态
        contactRunStatus: '', // 运行状态
        orderByColumn: 'create_time', // 排序字段
        sortStr: 'desc', // desc降序，asc升序
        noRelate: undefined
      }
    },
    // 获取顶部分类统计数据
    handleGetEquipmentDashboard() {
      getDoorCameraDashboard().then((res) => {
        const {
          normal,
          offline,
          noRelate,
          total
        } = res.items
        this.totalObject.total.num = total
        this.totalObject.overview[0].num = normal
        this.totalObject.overview[1].num = offline
        this.totalObject.overview[2].num = noRelate
      })
    },
    handleUpdateInit() {
      this.importFileVisible = false
      this.reload()
    },
    // 隐藏弹窗
    hiddenModalVisible() {
      this.updateModalVisible = false
      this.importFileVisible = false
    },
    // 顶部分类统计卡片点击事件
    handleQuery (index, item) {
      this.classificationTypeItem = item
      this.$refs.multipleTable && this.$refs.multipleTable.getTableData()
    },
    // 格式化table组件接口传参
    requiredParam (params) {
      let newParams = JSON.parse(JSON.stringify(params))
      if (this.classificationTypeItem?.prop === 'noRelate') {
        newParams.noRelate = this.classificationTypeItem.contactRunStatus
      } else {
        newParams.noRelate = undefined
      }
      // 如果筛选表单中的contactRunStatus有值，以该值为准，否则以顶部分类统计的contactRunStatus为准
      if (['', undefined, null].includes(this.formData.contactRunStatus) && this.classificationTypeItem?.prop !== 'noRelate') {
        newParams.contactRunStatus = this.classificationTypeItem?.contactRunStatus
      }
      return newParams
    },
    // 新增
    handleAdd () {
      this.cameraInfo = {}
      this.currentCameraId = ''
      this.dialogTitle = this.$t('hardware.addDoorCamera')
      this.dialogType = 'add'
      this.dialogVisible = true
    },
    // 获取页面数据
    getPageData() {
      this.handleGetEquipmentDashboard()
      this.$refs.multipleTable && this.$refs.multipleTable.getTableData()
    },
    // 显示详情弹窗
    handleShowDrawer(row) {
      this.currentCameraId = row.id
      this.cameraInfo = row
      this.isShowDetailDrawer = true
    },
    // 关闭详情弹窗
    handleClose(val) {
      this.isShowDetailDrawer = val
    },
    // 批量删除
    handleBatchDeleteCamera() {
      if (!this.multipleSelection.length) {
        return this.$message.error(this.$t('hardware.selectDeleteDoorCamera'))
      }
      this.$confirm(
        this.$t('hardware.deleteBatchDoorCameraMessage'),
        this.$t('hardware.deleteDoorCamera'),
        {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(() => {
          let ids = this.multipleSelection.map((v) => v.id)
          this.loading = true
          this.loadingText = this.$t('common.hintDelete')
          deletebatchcontact(ids).then((res) => {
            this.loading = false
            this.loadingText = this.$t('common.hintDefault')
            if (res.code) {
              this.multipleSelection = []
              this.$refs.multipleTable.clearSelection()
              this.$message.success(this.$t('common.deleteBatchSuccess'))
              this.getPageData()
            } else {
              this.$message.error(this.$t('common.deleteError') + res.message)
            }
          })
        })
        .catch(() => {
          this.$message.info(this.$t('common.deleteCanceled'))
        })
    },
    // 删除门磁摄像头
    handleDelete(row) {
      this.$confirm(
        this.$t('hardware.selectDoorCameraMessage') +
          row.contactName +
          this.$t('hardware.selectDoorCameraMessage2'),
        this.$t('hardware.deleteDoorCamera'),
        {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(() => {
          deletebatchcontact([row.id]).then((res) => {
            if (res.code) {
              this.multipleSelection = []
              this.$message.success(this.$t('common.deleteSuccess'))
              this.getPageData()
            } else {
              this.$message.error(this.$t('common.deleteError') + res.message)
            }
          })
        })
        .catch(() => {
          this.$message.info(this.$t('common.deleteCanceled'))
        })
    },
    // 导出
    async handleExport() {
      this.$message.warning(this.$t('common.exportMessage'))
      try {
        postExportDoorCameraList(this.formData).then((res) => {
          const data = moment(new Date()).format('YYYYMMDDHHmmss')
          mixin.methods.download(
            res,
            decodeURIComponent(
              this.$t('route.doorMagneticCamera') + data,
              'UTF-8'
            )
          )
        })
      } catch (e) {
        console.log(e)
        this.$message.warning(this.$t('common.networkError'))
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../../src/style/device';
@import '../../style/variable.less';
.signal-strength-0 {
  color: @normal;
}
.signal-strength-1 {
  color: @blueColor;
}
.signal-strength-2 {
  color: @oringeColor;
}
.signal-content {
  position: relative;
}
.signal-strength-text {
  font-size: 12px;
  position: absolute;
  transform: scale(0.9);
}
</style>
