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
        <el-form v-model="sensors" label-position="left" label-width="auto">
          <div v-for="(item, index) in sensors" :key="index">
            <el-form-item v-if="!disabled(item.type)" :label="item.name + (item.unit ? '(' + item.unit + ')' : '')">
              <el-switch
                  v-model="item.switchOff"
                  :disabled="disabled(item.type)"
                  :inactive-text="$t('hardware.waringSwitch')">
              </el-switch>
            </el-form-item>
            <div v-if="!disabled(item.type)">
              <el-form-item v-if="item.switchOff" :label="$t('hardware.waringScope')" label-width="130px">
                <el-col :span="8">
                  <el-form-item>
                    <el-input
                        v-model.trim="item.warningMin"
                        :disabled="disabled(item.type)"
                        oninput="if (value) {value=value.replace(/[^(\-)?\d.]/g, '')} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+4)}"
                        :placeholder="$t('hardware.inputMinNum')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4" class="line">~</el-col>
                <el-col :span="8">
                  <el-form-item>
                    <el-input
                        v-model.trim="item.warningMax"
                        :disabled="disabled(item.type)"
                        oninput="if (value) {value=value.replace(/[^(\-)?\d.]/g, '')} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+4)}"
                        :placeholder="$t('hardware.inputMaxNum')"></el-input>
                  </el-form-item>
                </el-col>
              </el-form-item>
              <el-form-item :label="$t('hardware.alarmScoped')" label-width="130px" required>
                <el-col :span="8">
                  <el-form-item>
                    <el-input
                        v-model.trim="item.min"
                        :disabled="disabled(item.type)"
                        oninput="if (value) {value=value.replace(/[^(\-)?\d.]/g, '')} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+4)}"
                        :placeholder="$t('hardware.inputMinNum')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="4" class="line">~</el-col>
                <el-col :span="8">
                  <el-form-item>
                    <el-input
                        v-model.trim="item.max"
                        :disabled="disabled(item.type)"
                        oninput="if (value) {value=value.replace(/[^(\-)?\d\.]/g, '')} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+4)}"
                        :placeholder="$t('hardware.inputMaxNum')"></el-input>
                  </el-form-item>
                </el-col>
              </el-form-item>
            </div>
            <div v-if="index === 0 && isChen" class="modification">
              <a @click="handleDetection">{{ detection.name }}</a>
            </div>
          </div>
          <el-alert
              :closable="false"
              center
              show-icon
              :title="$t('hardware.sysAlarmScopePs')"
              type="warning">
          </el-alert>
        </el-form>
        <span slot="footer" class="alarmRules-footer">
          <el-button :disabled="btnDisabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
          <el-button :disabled="btnDisabled" :loading="btnDisabled" type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
      </div>
    </el-dialog>

    <el-dialog
      :title="$t('common.hint')"
      :visible.sync="updateVisible"
      :show-close="false"
      width="950px">
      <el-table border :data="gridData" :row-class-name="tableRowClassName">
        <el-table-column type="index" width="20"></el-table-column>
        <el-table-column property="name" :label="$t('hardware.devciceName')" width="120"></el-table-column>
        <el-table-column property="no" :label="$t('hardware.devciceNo')" width="160"></el-table-column>
        <el-table-column :label="$t('hardware.devciceStatus')">
          <template v-slot="scope">
            <div v-for="(item,index) in scope.row.data" :key="index">
              <p v-if="item.type != 0 && item.type != 17">
                {{ item.sensorType.sensorAlias }}
                <span v-if="item.switchOff">{{ $t('hardware.waringSwitch') }}：{{ item.sensorType.warningMin + " ~ " + item.sensorType.warningMax + " " + item.sensorType.unit }}&nbsp; </span>
                  {{ $t('hardware.alarmScoped') }}: {{ item.sensorType.min + " ~ " + item.sensorType.max + " " + item.sensorType.unit }}
              </p>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="result" :label="$t('hardware.issueResult')" width="220"></el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleOff">{{ $t("common.close") }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {getSensorTypeList, updateSensor, postDeviceUpdateBatchSensorsThread, postDeviceUpdateBatchSensorsResult} from "@/api/device";
import {DEVICE_ID, ERROR} from "@/utils/constant";

const searchingUnit = {
  111100800: true,
  111102100: true,
  111102102: true
}

let humiditySensor;

export default {
  name: "UpdateAlarmRules",
  data() {
      const  _this = this;
    return {
      fullscreenLoading: false,
      title: _this.$t("hardware.updateAlarmRules1"),
      dialogVisible: false,
      sensors: [],
      id: null,
      isChen: false,
      detection: {
        name: _this.$t("hardware.searchHumidity"),
        type: 1
      },
      items: null,
      isScope: false,
      humidity: 0, // 0：不检测 1 ：监测
      type: 0,
      ids: [],
      btnDisabled: false,
      updateVisible: false,
      gridData: []
    }
  },

  computed: {
    disabled() {
      return function (type) {
        return DEVICE_ID[type];
      }
    }
  },
  methods: {
    open(type, items, ids) {
      this.items = items;
      this.sensors = [];
      if (items.sensors.length > 0) {
        items.sensors.map((item) => {
          const obj = {
            switchOff: item.switchOff,
            warningMin: DEVICE_ID[item.type] ? 0 : item.warningMin,
            warningMax: DEVICE_ID[item.type] ? 1 : item.warningMax,
            min: DEVICE_ID[item.type] ? 0 : item.min,
            max: DEVICE_ID[item.type] ? 1 : item.max,
            idx: item.idx,
            type: item.type,
          }

          if (item["sensorType"]) {
            obj.name = item.sensorType.name;
            obj.unit = item.sensorType.unit;
            this.sensors.push(obj);
          }
        })
      } else {
        return this.$message.error(this.$t("hardware.isNotDeviceBind"));
      }
      this.handleDoubleSearchingUnitFiltration(this.items.no, this.sensors);
      this.dialogVisible = !this.dialogVisible;
      this.type = type;
      if (type) {
        this.ids = ids;
        this.title = this.$t("hardware.updateAlarmRules1");
      } else {
        this.id = items.id;
        this.title = this.$t("hardware.updateAlarmRules");
      }

    },
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.sensors = [];
      this.isChen = false;
      this.ids = [];
    },
    handleDoubleSearchingUnitFiltration(key, array) {
      const str = key.slice(0, 9);
      if (searchingUnit[str]) {
        for (const item of array) {
          this.isChen = true;
          if (item.type === 2) {
            this.detection = {
              name: this.$t("hardware.isNotSearchHumidity"),
              type: 0
            }
            this.humidity = 1;
            break
          } else {
            this.detection = {
              name: this.$t("hardware.searchHumidity"),
              type: 1
            }
            this.humidity = 0;
          }
        }
      }
    },
    async handleSubmit() {
      const obj = {
        id: this.id,
        ids: this.ids,
        humidity: this.humidity,
        sensors: []
      }
      for (const item of this.sensors) {
        if ((!item.min || !item.max) && (item.min !== 0 && item.max)) {
          return this.$message.error(this.$t("common.isNotInput"));
        }
        if (!item.switchOff) {
          item.warningMin = 0;
          item.warningMax = 0;

          if (Number(item.min) - Number(item.max) > 0) {
            this.isScope = true;
            return this.$message.error(this.$t("hardware.leftGreaterRight"));
          }
          if (Number(item.max) - Number(item.min) < 0) {
            this.isScope = true;
            return this.$message.error(this.$t("hardware.rightGreaterLeft"));
          }
          this.isScope = false;
        } else {
          if (Number(item.warningMin) - Number(item.warningMax) > 0) {
            this.isScope = true;
            return this.$message.error(this.$t("hardware.leftGreaterRight"));
          }
          if (Number(item.warningMax) - Number(item.warningMin) < 0) {
            this.isScope = true;
            return this.$message.error(this.$t("hardware.rightGreaterLeft"));
          }
          if (Number(item.min) - Number(item.max) > 0) {
            this.isScope = true;
            return this.$message.error(this.$t("hardware.leftGreaterRight"));
          }
          if (Number(item.max) - Number(item.min) < 0) {
            this.isScope = true;
            return this.$message.error(this.$t("hardware.rightGreaterLeft"));
          }
        }
      }
      this.isScope = false;
      if (this.isScope) {
        return false;
      }
      obj.sensors = JSON.parse(JSON.stringify(this.sensors));
      const str = this.items.no.slice(0, 9);
      if (!searchingUnit[str]) {
        delete obj.humidity;
      } else {
        if (humiditySensor && !this.humidity) {
          const last = obj.sensors.splice(1);
          obj.sensors.push(...humiditySensor);
          last && obj.sensors.push(...last);
        }
      }
      this.btnDisabled = true;

      try {
        let res;
        if (this.type) {
          obj.id = 0;
          this.fullscreenLoading = true;
          res = await postDeviceUpdateBatchSensorsThread(obj);
          this.handleUpdateBatchSensorsResult(res);
        } else {
          delete obj.ids;
          res = await updateSensor(obj);
          this.handleMessage(res);
        }
      } catch (e) {
        this.btnDisabled = false;
        this.$message.error(ERROR);
      }
    },
    handleUpdateBatchSensorsResult(data){
      this.btnDisabled = false;
      postDeviceUpdateBatchSensorsResult(data).then(res => {
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
      this.handleClose();
    },
    handleMessage(res) {
      this.btnDisabled = false;
      if (res.code) {
        this.$message.success(this.$t("common.editSuccess"));
        this.$emit("handle");
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    },
    handleDetection() {
      if (!this.detection.type) {
        this.detection.name = this.$t("hardware.searchHumidity");
        this.detection.type = 1;
        let sensorsIndex = 0;
        this.sensors.map((item, index) => {
          if (item.type === 2) {
            return sensorsIndex = index;
          }
        })
        humiditySensor = this.sensors.splice(sensorsIndex, 1);
        this.humidity = 0;
      } else {
        this.detection.name = this.$t("hardware.isNotSearchHumidity");
        this.detection.type = 0;
        this.humidity = 1;
        getSensorTypeList().then(res => {
          if (res.code) {
            for (const item of res.items.list) {
              if (item.id === 2) {
                const last = this.sensors.splice(1);
                this.sensors.push({
                  idx: 1,
                  max: item.max,
                  min: item.min,
                  type: item.id,
                  warningMin: 0,
                  warningMax: 0,
                  name: item.name,
                  unit: item.unit,
                  switchOff: false
                });
                this.sensors.push(...last);
                break
              }
            }
          }
        })
      }
    }
  }
}
</script>
<style lang="less" scoped>
  @import '../../../style/variable.less';
.line {
  text-align: center;
}

/deep/ .el-input-number--medium {
  width: 130px;
}

.alarmRules-footer{
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
