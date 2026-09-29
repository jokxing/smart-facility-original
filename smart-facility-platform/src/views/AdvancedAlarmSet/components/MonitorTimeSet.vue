<template>
  <el-dialog
    :title="$t('other.monitorTimeSet')"
    :visible.sync="dialogVisible"
    width="32%"
    :before-close="handleClose"
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    custom-class="monitor-time-set"
    @close="handleClose">
    <el-dialog
      :title="$t('other.changeSensor')"
      :visible.sync="sensorDialogVisible"
      width="40%"
      :before-close="handleSensorDialogClose"
      destroy-on-close
      append-to-body
      @close="handleSensorDialogClose">
      <div class="index">
        <!--        <p>指标</p>-->
        <!--    tmpRules[checkedRule].objSensorIds = sensorDialogModeSensorIds    -->
        <el-checkbox-group v-if="checkedRule !== -1 &&tmpRules.length>0" v-model="sensorDialogModeSensorIds"
                           @change="handleCheck">
          <el-checkbox
            v-for="(sensor,index) in sensors"
            :key="index"
            :label="sensor.id">
            <!--    :disabled="sensorIsSelect(sensor.id)"      -->
            {{ sensor.sensorAlias }}
          </el-checkbox>
        </el-checkbox-group>
        <el-checkbox-group v-else>
          <el-checkbox v-for="(sensor,index) in sensors" :key="index" :label="sensor.sensorAlias" :disabled="true"/>
        </el-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handelSensorDialogSubmit" type="primary">{{ $t('common.confirm') }}</el-button>
      </span>
    </el-dialog>
    <el-tag v-for="(rule,index) in tmpRules" style="background: rgba(0,0,0,0);height: auto;border: 0;"
            :key="rule.index">
      <div
        class="time-set"
        :key="index"
        :class="{ active: checkedRule === index }"
        @click.capture="handleTimeSet(index)">

        <el-descriptions :title="$t('other.timeHeader') + (index+1)">
          <template slot="extra">
            <i class="el-icon-delete abnormal" @click="handleDelAlarmSet(index)"></i>
          </template>
        </el-descriptions>
        <el-form label-width="70px">
          <el-form-item :label="$t('other.target')">
            <!--            sensorDialogVisible=true-->
            <div class="set-index" @click="handleShowSensorDialog">
              <template v-for="(sensor,index) in sensors">
                <el-tag
                  :key="index"
                  type="info"
                  closable
                  v-if="rule.objSensorIds.indexOf(sensor.id) !== -1"

                  @close="handleTagClose(rule,sensor.id)">
                  {{ sensor.sensorAlias }}
                </el-tag>
              </template>
              <i class="el-icon-arrow-right"></i>
            </div>
          </el-form-item>
          <el-form-item :label="$t('other.period')">
            <template>
              <div class="cycle">
                <el-checkbox-group v-model="rule.weekCycle" size="medium" @change="selectedCyc">
                  <el-checkbox-button
                    v-for="(text,index) in weekCycleText"
                    :key="index"
                    :label="parseInt((index+1)%7)"
                  >
                    {{ text }}
                  </el-checkbox-button>
                </el-checkbox-group>
              </div>
            </template>
          </el-form-item>
          <el-form-item :label="$t('common.timeFrame')">

            <el-time-picker
              @change="selectedTime(rule)"
              is-range
              v-model="rule.time"
              :end-placeholder="$t('common.endDate')"
              :range-separator="$t('common.most')"
              :start-placeholder="$t('common.startDate')"
              value-format="HH:mm:ss"
              format="HH:mm:ss"
              :placeholder="$t('common.selectDateScope')">
            </el-time-picker>

          </el-form-item>
          <div
            v-if="rule['haveSameTime']!==undefined"
            style="color: orangered;text-align: center;">
              {{ $t('other.isHasPeriod') }}
          </div>
        </el-form>
      </div>

    </el-tag>


    <div class="add-alarm-set">
      <el-button icon="el-icon-plus" @click="handleAddAlarmSet">{{ $t('system.addAlarmSystem') }}</el-button>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="loading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>

import {deepCopyObject, getTimeLimit, getTimeRangeStr} from "@/utils/QuickUtils";
import {setMonitorAlarmRules} from "@/api/room/index"
import i18n from "@/i18n";
const defaultRule = {
  objId: '',
  objType: '',
  alarmName: i18n.t('other.timeHeader'),
  endTime: "23:59:59",
  ids: [],
  // index: index,
  objSensorIds: [],
  startTime: "00:00:00",
  // time: getTimeLimit("08:00:00", "21:00:00"),
  weekCycle: [1, 2, 3, 4, 5, 6, 0],
};

export default {
  name: 'MonitorTimeSet',

  data() {
      const _this = this;
    return {
      dialogVisible: false,
      loading: false,
      sensorDialogVisible: false,
      sensorDialogModeSensorIds: [],

      obj: {id: 0, type: 0},
      sensors: [],
      tmpRules: [],
      haveSameTimes: false,
      tmpRules_deleted: [],
      checkedRule: -1,
      weekCycleText: [ _this.$t('other.monday'), _this.$t('other.tuesday'), _this.$t('other.wednesday'), _this.$t('other.thursday'), _this.$t('other.friday'), _this.$t('other.saturday'), _this.$t('other.sunday'),],
      ////
    }
  },
  methods: {
    open(obj, sensors, tmpRules) {
      this.obj = deepCopyObject(obj);
      defaultRule.objId = obj.ib;
      defaultRule.objType = obj.type;
      this.checkedRule = -1;
      this.sensors = deepCopyObject(sensors);
      this.tmpRules = deepCopyObject(tmpRules);
      this.tmpRules_deleted = [];
      this.checkedRule = 0;


      this.dialogVisible = true;

    },

    // 指标勾选
    handleCheck(val) {

    },
    sensorIsSelect(sensorId) {
      for (let i = 0; i < this.tmpRules.length; i++) {
        let objSensorIds = this.tmpRules[i].objSensorIds;
        if (objSensorIds.indexOf(sensorId) !== -1) return true;
      }
      return false;
    },
    // 选择了某时间设置
    handleTimeSet(index) {
      this.checkedRule = index
    },
    // 删除指标
    handleTagClose(rule, sensorId) {
      var sensorIds = []
      rule.objSensorIds.forEach(id => {
        sensorId !== id && sensorIds.push(id);
      })
      rule.objSensorIds = sensorIds
    },
    // 添加报警设置
    handleAddAlarmSet() {
      let tmpRule = deepCopyObject(defaultRule);
      tmpRule.index = 0;
      if (this.tmpRules.length > 0) {
        tmpRule.index = this.tmpRules[this.tmpRules.length - 1].index + 1;
      }

      tmpRule.time = getTimeLimit(tmpRule.startTime, tmpRule.endTime);
      this.tmpRules.push(tmpRule);
      this.checkedRule = (this.tmpRules.length - 1);

      this.findSameTime();
    },

    // 选择了周期
    selectedCyc() {
      // console.log(1)
      this.findSameTime();
    },
    //选择了时间段
    selectedTime(rule) {
      // console.log(2)
      if (rule.time) {
        rule.startTime = rule.time[0];
        rule.endTime = rule.time[1];
      } else {
        rule.startTime = defaultRule.startTime;
        rule.endTime = defaultRule.endTime;
      }
      this.findSameTime();
      // if (rule.time) {
      //   let rangeStr = getTimeRangeStr(rule.time[0], rule.time[1]);
      //   rule.startTime = rangeStr[0];
      //   rule.endTime = rangeStr[1];
      // } else {
      //   rule.startTime = defaultRule.startTime;
      //   rule.endTime = defaultRule.endTime;
      // }

    },
    // 删除报警设置
    handleDelAlarmSet(index) {
      if (this.checkedRule === index) {
        this.checkedRule = 0
      }
      let deletedRules = this.tmpRules.splice(index, 1);
      if (deletedRules && deletedRules.length > 0) {
        deletedRules[0].objSensorIds = [];
        this.tmpRules_deleted.push(deletedRules[0]);
      }
      this.findSameTime();
    },
    findSameTime() {
      let rules = this.tmpRules;
      for (let rule of rules) {
        delete rule.haveSameTime;
      }
      this.haveSameTimes = false;
      let rule1 = null, rule2 = null;
      for (let i1 = 0; i1 < rules.length; i1++) {
        rule1 = rules[i1];
        if (!(rule1.haveSameTime)) {
          for (let i2 = i1 + 1; i2 < rules.length; i2++) {
            rule2 = rules[i2];
            if (!(rule2.haveSameTime) && this.eqRuleTime(rule1, rule2)) {
              rule1.haveSameTime = rule2.haveSameTime = 1;
              this.haveSameTimes = true;
            }
          }
        }
      }
    },
    eqRuleTime(rule1, rule2) {
      rule1.weekCycle.sort();
      rule2.weekCycle.sort();
      return (
        rule1.weekCycle.join('') === rule2.weekCycle.join('')
        && rule1.startTime === rule2.startTime
        && rule1.endTime === rule2.endTime
      );

    },

    handleShowSensorDialog() {
      this.sensorDialogModeSensorIds = [...this.tmpRules[this.checkedRule].objSensorIds];
      this.sensorDialogVisible = true;
    },

    handleSubmit() {
      if (this.haveSameTimes) {
        this.$message.warning(this.$t('other.isHasPeriod1'))
        return;
      }
      this.loading = true;
      let data = {
        objId: this.obj.id,
        objType: this.obj.type,
        rules: deepCopyObject(this.tmpRules)
      }
      this.tmpRules_deleted.forEach(item => {
        data.rules.push(item);
      })

      //
      data.rules.forEach(item => {
        delete item.time
        if (Array.isArray(item.weekCycle)) {
          item.weekCycle.sort();
          item.weekCycle = item.weekCycle.join(',');
        } else {
          item.weekCycle = '';
        }
      })

      setMonitorAlarmRules(data).then(res => {
        if (res.code === 1) {
          this.$message.success(this.$t('hardware.systemSuccess'));
          this.$emit('comfirm');
          this.dialogVisible = false;
        }
      }).finally(e => {
        this.loading = false;
      })
    },
    handelSensorDialogSubmit() {
      this.tmpRules[this.checkedRule].objSensorIds = this.sensorDialogModeSensorIds;
      this.sensorDialogVisible = false;
    },
    handleClose() {
      this.tmpRules = [];
      this.dialogVisible = false;
    },
    handleSensorDialogClose() {
      this.sensorDialogModeSensorIds = [];
      this.sensorDialogVisible = false;
    }
  },
}
</script>

<style lang="less" scoped>
/deep/ .monitor-time-set {
  .el-dialog__body {
    padding-top: 0;
    max-height: 600px;
    overflow-y: auto;
  }

  .index {
    display: flex;
    margin-bottom: 20px;

    p {
      width: 50px;
    }
  }

  .time-set {
    padding: 20px 20px 16px;
    background-color: #F6F6F6;
    border-radius: 8px;
    border: 1px solid #F6F6F6;
    margin-bottom: 10px;

    &.active {
      border-color: #3078F0;
    }

    .el-descriptions__title {
      font-weight: initial !important;
      font-size: 16px !important;
    }

    .el-icon-delete {
      cursor: pointer;
    }

    .set-index {
      width: 100%;
      min-height: 40px;
      max-height: 120px;
      overflow-y: auto;
      white-space: break-spaces;
      background-color: #fff;
      border-radius: 6px;
      padding: 2px 10px;

      .el-tag {
        margin-right: 5px;
      }

      i.el-icon-arrow-right {
        color: grey;
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
      }
    }

    .cycle {
      .el-checkbox-button {
        width: 14.28%;

        .el-checkbox-button__inner {
          width: 100%;
          border: 0;
          padding: 13px 0;
          text-align: center;
        }
      }
    }

    .el-range-editor--medium {
      width: 100%;
      height: 40px;

      &.el-input__inner {
        background-color: #fff;
      }

      .el-range-input {
        background-color: #fff;
      }
    }
  }

  .add-alarm-set {
    .el-button {
      background-color: #E1ECFF;
      border: 0;
      color: #3078F0 !important;
      display: flex;
      align-items: center;
      margin: 50px auto 0;

      i {
        vertical-align: middle;
      }
    }
  }
}
</style>
