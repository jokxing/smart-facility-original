<template>
  <el-dialog
    :title="$t('other.batchSetGroup')"
    :visible.sync="dialogVisible"
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    :before-close="handleClose"
    width="55%"
    class="BatchNoticeGroup-modal"
    @opened="opened"
    @close="handleClose">
    <div class="select-probe-index">
      <div class="head">{{ $t('other.changeSensor') }}</div>
      <el-checkbox :indeterminate="isCheckSome" v-model="isCheckAll" @change="handleCheckAll" :label="$t('system.changeAll')"/>
      <div style="margin-top:10px"></div>
      <el-checkbox-group v-model="checkSensorList" @change="handelCheck">
        <el-checkbox v-for="sensor in sensors" :label="sensor.id">
          {{ sensor.sensorAlias }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="right">
      <div class="head">{{ $t('system.changeGroup') }}</div>
      <SelectNotificationGroup ref="selectNotificationGroup" v-model="checkGroupList"/>
    </div>
    <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
  </el-dialog>
</template>

<script>
import SelectNotificationGroup from "./SelectNotificationGroup";
import {deepCopyObject} from "@/utils/QuickUtils";

export default {
  components: {
    SelectNotificationGroup
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,

      sensorMap: {},
      sensors: [],
      checkSensorList: [
        // id,...
      ],
      isCheckSome: false,
      isCheckAll: false,

      ruleLimits: {},
      checkGroupList: [
        // {
        //   "companyId": 0,
        //   "groupMsg": "",
        //   "groupName": "",
        //   "id": 0
        // },...
      ],
    }
  },
    watch: {
        checkGroupList: {
            handler(newArr,oldArr) {
                if (newArr.length > 0 && oldArr.length > 0) {
                    const newObj = newArr[0];
                    const oldObj = oldArr[0];
                    if (newObj.id == oldObj.id && newObj.groupName == oldObj.groupName) {
                        this.checkGroupList = [];
                    }
                }
            }
        }
    },
  methods: {
    open(sensors, ruleLimits) {
      this.sensorMap = {};
      this.checkSensorList = [];
      this.sensors = sensors;
      this.checkGroupList = [];
      this.ruleLimits = ruleLimits;

      this.dialogVisible = true;

      this.sensors.forEach(sensor => {
        this.sensorMap[sensor.id] = sensor;
      })

    },
    opened() {
      this.$refs.selectNotificationGroup.onShowMethod();
    },
    handleSubmit() {
      this.checkSensorList.forEach(sensorId => {
        this.sensorMap[sensorId].rules.forEach(rule => {
          this.ruleLimits[rule.id].forEach(limit => {
            //报警范围的通知组：
            limit.noticeGroups = deepCopyObject(this.checkGroupList);
          })
        })
      })
      this.dialogVisible = false;
    },
    handleClose() {
        this.isCheckAll = false;
      this.dialogVisible = false;
    },
    handleCheckAll(isCheckAll) {
      this.checkSensorList = [];
      this.isCheckSome = false;
      if (isCheckAll) {
        this.sensors.forEach(sensor => {
          this.checkSensorList.push(sensor.id);
        })
      }
    },
    handelCheck(theChenked) {
      let l=0;
      let r = this.sensors.length;
      let len = this.checkSensorList.length;

      this.isCheckSome = len > l && len < r;
      this.isCheckAll = len === r;
    }
  },
}
</script>

<style lang="less" scoped>
.BatchNoticeGroup-modal {
  /deep/ .el-dialog__body {
    padding-top: 10px;
    display: flex;
    justify-content: space-between;
  }

  .head {
    color: #aaa;
    margin-bottom: 10px;
    margin-top: 0;
  }

  .select-probe-index {
    width: 15%;
    border-right: 1px solid #F0F2FC;

    .el-checkbox-group {
      display: flex;
      flex-direction: column;

      .el-checkbox {
        margin-bottom: 10px;
      }
    }
  }

  .right {
    width: 80%;
  }
}
</style>