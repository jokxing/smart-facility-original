<template>
  <el-dialog
      :before-close="handleModalClose"
      :close-on-click-modal="false"
      :title="importType[title].title + $t('common.importHandle')"
      :visible="true"
      append-to-body
      class="import-dialog"
      :custom-class="'modal-default modal-labDevice' + (isDemoInstrument ? ' import-dialog-wide' : '')"
      destroy-on-close
      :width="isDemoInstrument ? '760px' : '400px'">
    <div class="modal-default-body">
      <el-row>
          {{ $t('hardware.importTemplate') }}
        <el-tooltip
            class="item"
            :content="$t('hardware.importTemplate1')"
            effect="dark"
            placement="top-start">
          <i class="el-icon-question"></i>
        </el-tooltip>
      </el-row>
      <el-link type="primary" @click="handleDownImport">
        <i class="el-icon-download"></i>
          {{ $t('common.download') }} {{ importType[title].title }}{{ $t('hardware.importTemplate2') }}
      </el-link>

      <el-row class="margin-center">
        <el-upload
            ref="upload"
            :action="UploadUrl()"
            :auto-upload="false"
            :before-upload="handleBeforeUpload"
            :file-list="fileList"
            :http-request="uploadFile"
            :limit="isDemoInstrument ? 1 : 3"
            :disabled="submitLoading || previewLoading"
            :on-change="handleFileList"
            :on-error="handleError"
            :on-exceed="handleExceedFile"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :accept="isDemoInstrument ? '.xlsx' : '.xlsx,.xls'">
          <div class="el-upload__tip">{{ isDemoInstrument ? '仅支持一个 .xlsx 文件，最多 50 行、10MB；选择后先校验预览，确认后才写入。' : $t('hardware.importTemplate3') }}</div>
          <div class="footer">
            <el-button slot="trigger">{{ $t('hardware.importTemplate4') }}</el-button>
            <el-button
                v-if="isDemoInstrument"
                type="primary"
                :loading="submitLoading || previewLoading"
                :disabled="!canConfirmImport"
                @click.stop="handleSubmitUpload"
            >确认导入</el-button>
            <el-button v-else type="primary" :loading="submitLoading" @click.stop="handleSubmitUpload">{{ $t('hardware.importTemplate5') }}</el-button>
          </div>
        </el-upload>
      </el-row>

      <div v-if="isDemoInstrument && previewRows.length" class="import-preview">
        <div class="import-preview-summary">
          <span v-if="previewOk">预览通过 {{ previewRows.length }} 行，确认后写入。</span>
          <span v-else>预览未通过，请修正后重新选择文件。</span>
        </div>
        <el-table :data="previewRows" size="mini" border max-height="280">
          <el-table-column prop="rowNumber" label="行号" width="60" />
          <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="department" label="部门" min-width="100" show-overflow-tooltip />
          <el-table-column prop="type" label="分类" min-width="100" show-overflow-tooltip />
          <el-table-column prop="room" label="房间" min-width="100" show-overflow-tooltip />
          <el-table-column prop="error" label="错误" min-width="160" show-overflow-tooltip>
            <template slot-scope="scope">
              <span :class="scope.row.error ? 'import-preview-error' : 'import-preview-ok'">{{ scope.row.error || '通过' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-alert v-if="importError" :title="importError" type="error" :closable="false" show-icon />
    </div>
  </el-dialog>
</template>

<script>

import request from "@/utils/request";

export default {
  props: {
    title: {
      type: String,
      default: ""
    }
  },
  data() {
      const _this = this;
    return {
      submitLoading: false,
      previewLoading: false,
      importError: '',
      previewRows: [],
      previewOk: false,
      fileData: "",
      fileList: [],
      importType: {
        instrument: {
          title: _this.$t('common.equipment'),
          url: "/instrument/import",
          fileName: "设备导入.xls",
          enFileName: "instrument.xls"
        },
        user: {
          title: _this.$t('hardware.users1'),
          url: "/user/import/add/batch",
          fileName: "成员导入.xls",
            enFileName: "user.xls"
        },
        device: {
          title: _this.$t('hardware.device1'),
          url: "/device/import/batch/equipment",
          fileName: "记录仪导入.xls",
            enFileName: "device.xls"
        },
        room: {
          title: _this.$t('common.room'),
          url: "/room/import/batch/room",
          fileName: "房间导入.xls",
            enFileName: "room.xls"
        },
        smartSocket: {
          title: _this.$t('route.smartSocket'),
          url: "/device/import/batch/device",
          fileName: "设备管理器导入.xls",
            enFileName: "smartSocket.xls"
        },
        powerAlarm: {
          title: _this.$t('route.powerOutageAlarm'),
          url: "/device/import/batch/powerAlarm",
          fileName: "断电报警器导入.xls",
            enFileName: "powerAlarm.xls"
        },
        alerter: {
          title: _this.$t('route.alarmAcousto'),
          url: "/alertor/import/soundLightAlarm",
          fileName: "声光报警器导入.xls",
            enFileName: "alerter.xls"
        },
        gunRack: {
          title: _this.$t('hardware.gunRack'),
          url: "/device/import/batch/gunRack",
          fileName: "移液枪架导入.xls",
            enFileName: "gunRack.xls"
        },
        signal: {
          title: _this.$t('route.signalSource'),
          url: "/device/import/receiver",
          fileName: "信号接收器导入.xls",
            enFileName: "signal.xls"
        },
        assetsLabel: {
          title: _this.$t('hardware.gateway'),
          url: "/device/import/batch/gateway",
          fileName: "网关导入.xls",
            enFileName: "assetsLabel.xls"
        },
        label: {
          title: _this.$t('hardware.label'),
          url: "/label/import",
          fileName: "标签导入.xls",
            enFileName: "label.xls"
        },
          importInstrument: {
          title: _this.$t('hardware.importInstrument'),
          url: "/instrumentNewInfoExpand/importInstrument",
          fileName: "入库导入.xls",
              enFileName: "importInstrument.xls"
        },
          classifySystem: {
              title: _this.$t('hardware.classifySystem'),
              url: "/instrumentCategoryInfo/import",
              fileName: "资产分类导入模板.xls",
              enFileName: "classifySystem.xls"
        },
        doorMagneticCamera: {
          title: _this.$t('route.doorMagneticCamera'),
          url: "/door/import/batch/equipment",
          fileName: "门磁摄像头导入.xls",
          enFileName: "doorMagneticCamera.xls"
        }
      }
    }
  },
  computed: {
    isDemoInstrument() { return process.env.VUE_APP_DEMO === 'true' && this.title === 'instrument'; },
    canConfirmImport() {
      return this.isDemoInstrument && this.previewOk && this.fileList.length === 1 && !this.previewLoading && !this.submitLoading;
    }
  },
  methods: {
    clearPreview() {
      this.previewRows = [];
      this.previewOk = false;
      this.importError = '';
    },
    handleModalClose() {
      if (!this.submitLoading && !this.previewLoading) this.$emit('hiddenModalVisible')
    },
    handleDownImport() {
      if (process.env.VUE_APP_DEMO === 'true' && this.title === 'instrument') {
        return this.downloadInstrumentTemplate();
      }
      this.$message.warning(localStorage.getItem('lang') === 'en'
        ? 'Import templates are not available in this demo.'
        : '本演示未接入导入模板，暂不可下载。');
      return false;
    },
    async downloadInstrumentTemplate() {
      try {
        const res = await request({url: '/__demo/instrument/import-options', method: 'get'});
        if (res.code !== 1) throw new Error(res.message || '模板加载失败');
        const {createInstrumentWorkbook} = await import('@/mock/instrumentWorkbook');
        const buffer = await createInstrumentWorkbook(res.items);
        const url = URL.createObjectURL(new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
        const link = document.createElement('a');
        link.href = url;
        link.download = '设备导入.xlsx';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return true;
      } catch (error) {
        this.$message.error(error.message || '模板下载失败，请重试。');
        return false;
      }
    },
    handleExceedFile(files, fileList) {
      if (this.isDemoInstrument) { this.$message.warning('每次只能选择一个文件，请先移除当前文件。'); return; }
      this.$message.warning(this.$t('hardware.importTemplate6') +` ${files.length + fileList.length} ` + this.$t('common.individual'));
    },
    async handleFileList(file, fileList) {
      this.fileList = fileList;
      this.clearPreview();
      if (this.isDemoInstrument && fileList.length === 1) await this.previewSelectedFile();
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
      this.clearPreview();
    },
    handleSuccess(res, file, fileList) {
      this.$message.success(this.$t('hardware.importSuccess'));
    },
    handleError(err, file, fileList) {
      this.$message.error(this.$t('hardware.importError'));
    },
    handleBeforeUpload(file) {
      let extension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
      let size = file.size / 1024 / 1024;
      const allowed = process.env.VUE_APP_DEMO === 'true'
        ? ['xlsx']
        : ['xlsx', 'xls'];
      if (!allowed.includes(extension)) {
        this.$message.warning(this.$t('hardware.importTemplate3'));
        return false;
      }
      if (size > 10) {
        this.$message.warning(this.$t('hardware.importTemplate7'));
        return false;
      }
    },
    uploadFile(file) {
      this.fileData.append('files', file.file);
    },
    async previewSelectedFile() {
      if (!this.isDemoInstrument || this.previewLoading || this.submitLoading) return;
      if (this.fileList.length !== 1) {
        this.clearPreview();
        return;
      }
      this.previewLoading = true;
      this.importError = '';
      this.previewRows = [];
      this.previewOk = false;
      try {
        const file = this.fileList[0].raw;
        const {validateImportFile} = await import('@/mock/instrumentWorkbook');
        const message = validateImportFile(file);
        if (message) throw new Error(message);
        const data = new FormData();
        data.append('files', file);
        const res = await request({url: '/instrument/import/preview', method: 'post', data});
        if (res.code !== 1) throw new Error(res.message || '预览失败');
        this.previewRows = Array.isArray(res.items.rows) ? res.items.rows : [];
        this.previewOk = !!res.items.ok;
        this.importError = this.previewOk ? '' : (res.items.message || '预览未通过');
      } catch (error) {
        this.clearPreview();
        this.importError = error.message || '预览失败，请重试。';
      } finally {
        this.previewLoading = false;
      }
    },
    async submitInstrumentImport() {
      if (this.submitLoading) return;
      if (!this.previewOk || this.fileList.length !== 1) {
        this.importError = '请先选择通过校验的文件再确认导入。';
        return;
      }
      this.submitLoading = true;
      this.importError = '';
      try {
        const file = this.fileList[0].raw;
        const {validateImportFile} = await import('@/mock/instrumentWorkbook');
        const message = validateImportFile(file);
        if (message) throw new Error(message);
        const data = new FormData();
        data.append('files', file);
        const res = await request({url: '/instrument/import', method: 'post', data});
        if (res.code !== 1) throw new Error(res.message || '导入失败');
        this.$message.success('已导入 ' + res.items.count + ' 台设备（已登记，未布置）。');
        this.$emit('handleUpdateInit', res.items);
      } catch (error) {
        this.importError = error.message || '导入失败，请重试。';
        this.submitLoading = false;
        // Re-preview against current catalog/capacity after a failed confirm.
        await this.previewSelectedFile();
      } finally {
        this.submitLoading = false;
      }
    },
    handleSubmitUpload() {
      if (this.isDemoInstrument) return this.submitInstrumentImport();
      if (this.fileList.length === 0) {
        this.$message.warning(this.$t('hardware.importTemplate8'));
      } else {
        var url = this.importType[this.title].url;
        this.fileData = new FormData();
        this.$refs.upload.submit();  // 提交调用uploadFile函数
        request({
          url: url,
          data: this.fileData,
          method: "post",
          headers: {
            'Content-type': 'multipart/form-data'
          },
        }).then(res => {
          if (res.code) {
            if(this.title === 'label'){
              this.$message.success(this.$t('hardware.importTemplate9') +"：" + res.items.successNum + "，"+this.$t('hardware.importTemplate10')+"：" + res.items.failNum);
            }else{
              this.$message.success(this.$t('hardware.importSuccess'));
            }
            // 关闭弹窗并更新数据
            this.$emit('handleUpdateInit', res.items)
          } else {
            this.$message.error(res.message);
          }
        }, error => {
          this.$message.error(error);
        })
      }
    },
    UploadUrl: function () {
      // 因为action参数是必填项，我们使用二次确认进行文件上传时，直接填上传文件的url会因为没有参数导致api报404，所以这里将action设置为一个返回为空的方法就行，避免抛错
      return ""
    },
  },
}
</script>

<style lang="less" scoped>
.import-dialog {
  .modal-default-body {
    padding: 30px 20px;

    .el-link {
      margin-top: 10px;
    }

    .el-upload__tip {
      margin-top: 100px;
      margin-bottom: 6px;
      text-align: left;
    }

    .footer {
      display: flex;
      justify-content: center;

      .el-button {
        width: 48%;
      }
    }

    .import-preview {
      margin-top: 16px;

      .import-preview-summary {
        margin-bottom: 8px;
        color: #606266;
        font-size: 13px;
      }

      .import-preview-error {
        color: #f56c6c;
      }

      .import-preview-ok {
        color: #67c23a;
      }
    }
  }

  /deep/ .el-upload{
    width: 100%;
  }
  /deep/ .el-upload-list {
    position: absolute;
    top: -10px;
  }

  /deep/ .el-upload-list__item-status-label {
    bottom: 0;
    top: initial;
  }

  /deep/ .el-upload-list__item {
    margin-top: 0;
    max-width: 360px;
  }
}

/deep/ .modal-labDevice {
  .el-dialog__body {
    padding: 0;
  }
}
</style>
