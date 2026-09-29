<template>
  <div>
    <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :show-close="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
      <div v-loading="fullscreenLoading">
        <el-form :model="form" size="small" label-position="left" label-width="auto">
          <el-form-item :label="$t('hardware.acousticOptic')">
            <el-switch v-model="form.closeSoundLightAlarm"/>
          </el-form-item>
        </el-form>
        <span slot="footer" class="updateAcoustic-footer">
          <el-button :disabled="disabled" @click="handleClose">{{ this.$t("common.cancel") }}</el-button>
          <el-button :loading="disabled" :disabled="disabled" type="primary" @click="handleSubmit()">{{ this.$t("common.confirm") }}</el-button>
        </span>
      </div>
    </el-dialog>

    <el-dialog
      title="提示"
      :visible.sync="updateVisible"
      :show-close="false"
      width="720px">
      <el-table border :data="gridData" :row-class-name="tableRowClassName">
        <el-table-column type="index" width="40"></el-table-column>
        <el-table-column property="name" :label="$t('hardware.devciceName')" width="130"></el-table-column>
        <el-table-column property="no" :label="$t('hardware.devciceNo')"></el-table-column>
        <el-table-column property="closeAlarmStatus" :label="$t('hardware.devciceStatus')" width="150"></el-table-column>
        <el-table-column property="result" :label="$t('hardware.issueResult')" width="220"></el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleOff">{{ $t("common.close") }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {updateAlarmLight, updateAlarmLightsThread, updateAlarmResult} from "@/api/device";
import {ERROR} from "@/utils/constant";

export default {
  name: "UpdateAcousticOptic",
  data() {
      const _this = this;
    return {
      fullscreenLoading: false,
      dialogVisible: false,
      title: _this.$t('hardware.updateAcousticOptic1'),
      form: {
        closeSoundLightAlarm: false
      },
      items: null,
      type: 0,
      disabled: false,
      updateVisible: false,
      gridData: []
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.type = 0;
      this.items = null;
    },
    /**
     *
     * @param type 1:批量；0:单个操作
     * @param items
     */
    open(type, items) {
      if (type !== this.type) {
        this.items = items;
        this.type = type;
      } else {
        this.items = items.id;
        this.type = type;
        this.form["closeSoundLightAlarm"] = !items.closeSoundLightAlarm;
      }
      this.dialogVisible = !this.dialogVisible;
    },
    async handleSubmit() {
      try {
        let res;
        if (this.type) {
          this.fullscreenLoading = true;
          res = await updateAlarmLightsThread({
            id: 0,
            ids: this.items,
            closeSoundLightAlarm: this.form.closeSoundLightAlarm ? 0 : 1,
          })
          this.handleUpdateAlarmResult(res)
        } else {
          this.disabled = true;
          res = await updateAlarmLight({
            id: this.items,
            closeSoundLightAlarm: this.form.closeSoundLightAlarm ? 0 : 1
          })
          this.handleMessageHint(res);
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(ERROR);
      }
    },
    handleUpdateAlarmResult(data){
      updateAlarmResult(data).then(res => {
        this.fullscreenLoading = false;
        if(res.code === 1){
          this.updateVisible = true;
          this.gridData = res.items;
        }
      }).catch(err => {
        this.fullscreenLoading = false;
      })
    },
    //标红table指定行
    tableRowClassName({row, rowIndex}) {
      if(row.status === 1 || row.status === 2 || row.status === 3){
        return 'warning-row';
      }
    },
    // 关闭提示
    handleOff() {
      this.updateVisible = false;
      this.$emit("handle");
      this.handleClose()
    },
    handleMessageHint(res) {
      this.disabled = false;
      if (res.code) {
        this.$emit("handle");
        this.form.closeSoundLightAlarm ? this.$message.success(this.$t('hardware.openedAlertor')) : this.$message.success(this.$t('hardware.closeAlertor'));
        this.handleClose();
      } else {
        this.$message.error(this.$t('hardware.openedAlertorError'));
      }
    },
  }
}
</script>

<style scoped lang="less">
  @import '../../../style/variable.less';
  .updateAcoustic-footer{
    text-align: right;
    width: 100%;
    display: block;
    padding-top: 20px;
    position: relative;
    margin-top: 40px;
    &::before{
      content: "";
      width: calc(100% + 40px);
      height: 1px;
      background-color: #eee;
      position: absolute;
      top: 0;
      left: -20px;
    }
  }

  /deep/ .el-table .warning-row {
    color: @abnormal;
  }
</style>
