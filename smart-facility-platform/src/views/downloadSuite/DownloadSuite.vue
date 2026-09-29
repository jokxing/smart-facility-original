<template>
  <div class="session">
    <p>{{ $t("hardware.downloadP") }}</p>
    <p class="margin-center">{{ $t("hardware.downloadIn") }}</p>
    <ol>
      <li>{{ $t("hardware.downloadLi1") }}</li>
      <li>{{ $t("hardware.downloadLi2") }}</li>
      <li>{{ $t("hardware.downloadLi3") }}<br/>{{ $t("hardware.downloadLi4") }}
      </li>
      <li>{{ $t("hardware.downloadLi5") }}</li>
    </ol>
    <p>{{ $t("hardware.downloadAdress") }}
      <a class="download" @click="handleBackup">
        <i class="icon-download" style="color: #1890ff"></i>{{ $t("hardware.downloadType1") }}
      </a>
      <a @click="handleDownloadReport">
        <i class="icon-download" style="color: #1890ff"></i>{{ $t("hardware.downloadType2") }}
      </a>
    </p>
  </div>
</template>

<script>
import {downloadFile} from "@/utils/methods";

export default {
  name: "DownloadSuite",
  methods: {
    handleBackup() {
      this.$message.success(this.$t("hardware.downloadHandle"));
      const url = "/backupSuite/AutoBackupTool.zip";
      const fileName = "AutoBackupTool.zip";
      downloadFile(url, fileName);
    },
    handleDownloadReport() {
      this.$message.success(this.$t("hardware.downloadHandle"));
      const url = "/backupSuite/DataExportTool.zip";
      const fileName = "DataExportTool.zip";
      downloadFile(url, fileName);
    },
  }
}
</script>

<style lang="less" scoped>
.download {
  margin-right: 24px;
}

ol {
  line-height: 1.5;
  margin: 20px;
}
</style>
