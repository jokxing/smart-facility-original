<template>
  <el-dialog
      :before-close="handleModalClose"
      :close-on-click-modal="false"
      :title="importType[title].title + $t('common.importHandle')"
      :visible="true"
      append-to-body
      class="import-dialog"
      custom-class="modal-default modal-labDevice"
      destroy-on-close
      width="400px">
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
            :limit="3"
            :on-change="handleFileList"
            :on-error="handleError"
            :on-exceed="handleExceedFile"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            accept=".xlsx,.xls,.csv">
          <div class="el-upload__tip">{{ $t('hardware.importTemplate3') }}</div>
          <div class="footer">
            <el-button slot="trigger">{{ $t('hardware.importTemplate4') }}</el-button>
            <el-button type="primary" @click.stop="handleSubmitUpload">{{ $t('hardware.importTemplate5') }}</el-button>
          </div>
        </el-upload>
      </el-row>
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
  methods: {
    handleModalClose() {
      this.$emit('hiddenModalVisible')
    },
    handleDownImport() {
      if (process.env.VUE_APP_DEMO === 'true' && this.title === 'instrument') {
        // UTF-8 CSV (not binary xls). Excel「另存为 xlsx/xls」后演示无法解析。
        const content = '\uFEFF名称,部门ID,分类types,房间ID\n演示导入设备,900101,1,950002\n';
        const blob = new Blob([content], {type: 'text/csv;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = localStorage.getItem('lang') === 'en' ? 'instrument.csv' : '设备导入.csv';
        link.click();
        URL.revokeObjectURL(url);
        return true;
      }
      this.$message.warning(localStorage.getItem('lang') === 'en'
        ? 'Import templates are not available in this demo.'
        : '本演示未接入导入模板，暂不可下载。');
      return false;
    },
    handleExceedFile(files, fileList) {
      this.$message.warning(this.$t('hardware.importTemplate6') +` ${files.length + fileList.length} ` + this.$t('common.individual'));
    },
    // 文件状态改变时的钩子
    handleFileList(file, fileList) {
      this.fileList.push(file);
    },
    // 文件列表移除文件时的钩子
    handleRemove(file, fileList) {
      this.fileList.splice(this.fileList.findIndex(item => item.uid === file.uid), 1)
    },
    // 文件上传成功时的钩子
    handleSuccess(res, file, fileList) {
      this.$message.success(this.$t('hardware.importSuccess'));
    },
    // 文件上传失败时的钩子
    handleError(err, file, fileList) {
      this.$message.error(this.$t('hardware.importError'));
    },
    // 上传文件之前的钩子
    handleBeforeUpload(file) {
      let extension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
      let size = file.size / 1024 / 1024;
      const allowed = process.env.VUE_APP_DEMO === 'true'
        ? ['xlsx', 'xls', 'csv']
        : ['xlsx', 'xls'];
      if (!allowed.includes(extension)) {
        this.$message.warning(this.$t('hardware.importTemplate3'));
      }
      if (size > 10) {
        this.$message.warning(this.$t('hardware.importTemplate7'));
      }
    },
    uploadFile(file) {
      this.fileData.append('files', file.file);
    },
    handleSubmitUpload() {
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
