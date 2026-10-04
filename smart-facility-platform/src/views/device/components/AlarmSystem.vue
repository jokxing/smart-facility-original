<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form v-model="form" label-position="left" label-width="auto">
      <el-form-item :label="$t('common.weixinAlarm')">
        <el-select
            v-model="form.weixin"
            allow-create
            class="select-change-p"
            default-first-option
            :label="$t('common.placeholder')">
          <el-option
              v-for="item in alarmList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.smsAlarm')">
        <el-select
            v-model="form.sms"
            allow-create
            class="select-change-p"
            default-first-option
            :label="$t('common.placeholder')">
          <el-option
              v-for="item in alarmList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.phoneAlarm')">
        <el-select
            v-model="form.phone"
            allow-create
            class="select-change-p"
            default-first-option
            :label="$t('common.placeholder')">
          <el-option
              v-for="item in alarmList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.timeFlagAlarm')">
        <el-select
            v-model="form.timeFlag"
            allow-create
            class="select-change-p"
            default-first-option
            :label="$t('common.placeholder')">
          <el-option
              v-for="item in timeList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.timeFrom')">
        <el-row class="select-change-p" justify="space-between"
                type="flex">
          <el-col :span="9.5">
            <el-time-select
                v-model="form.timeFrom"
                class="select-change-p"
                :picker-options="{
                start: '00:00',
                step: '00:15',

                end: '18:30'}"
                :placeholder="$t('labDevice.startTime')">
            </el-time-select>
          </el-col>
          <el-col :span="2" class="text-center">~</el-col>
          <el-col :span="9.5">
            <el-time-select
                v-model="form.timeTo"
                :disabled="form.timeFrom === ''"
                class="select-change-p"
                :picker-options="{
                start: '00:00',
                step: '00:15',
                end: '23:59',
                minTime: form.timeFrom}"
                :placeholder="$t('labDevice.endTime')">
            </el-time-select>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item v-if="!type" :label="$t('common.receiveResumeMessageFlag')">
        <el-select
            v-model="form.receiveResumeMessageFlag"
            allow-create
            class="select-change-p"
            default-first-option
            :label="$t('common.placeholder')">
          <el-option
              v-for="item in receiveList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{$t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import moment from "moment"
import {updateEquipmentUser, updateThingsUser} from "@/api/user";
import {ERROR} from "@/utils/constant";
import i18n from "@/i18n"
const alarmArray = [
  {name: i18n.t("hardware.alarmArray1"), id: 1},
  {name: i18n.t("hardware.alarmArray2"), id: 5},
  {name: i18n.t("hardware.alarmArray3"), id: 10},
  {name: i18n.t("hardware.alarmArray4"), id: 15},
  {name: i18n.t("hardware.alarmArray5"), id: 20},
  {name: i18n.t("hardware.alarmArray6"), id: 30},
  {name: i18n.t("hardware.alarmArray7"), id: 45},
  {name: i18n.t("hardware.alarmArray8"), id: 60},
  {name: i18n.t("hardware.alarmArray9"), id: 120},
  {name: i18n.t("hardware.alarmArray10"), id: 180},
]
export default {
  name: "AlarmSystem",
  props: {
    type: {
      type: Number,
      default: 0
    },
  },
  data() {
      const _this = this;
    return {
      title: _this.$t("hardware.alarmSystem"),
      dialogVisible: false,
      form: {
        weixin: null,
        sms: null,
        phone: null,
        timeFlag: null,
        timeFrom: null,
        timeTo: null,
        receiveResumeMessageFlag: null,
        userId: null
      },
      alarmList: [
        {name: _this.$t("hardware.alarmArray00"), id: -1},
        {name: _this.$t("hardware.alarmArray0"), id: 0},
      ],
      timeList: [
        {name:  _this.$t("hardware.alarmArray11"), id: 1},
        {name:  _this.$t("hardware.alarmArray12"), id: 0},
      ],
      receiveList: [
        {name:  _this.$t("hardware.alarmArray13"), id: 1},
        {name:  _this.$t("hardware.alarmArray14"), id: 0},
      ],
      disabled: false
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.form = {
        weixin: null,
        sms: null,
        phone: null,
        timeFlag: null,
        timeFrom: null,
        timeTo: null,
        receiveResumeMessageFlag: null,
        type: null,
        userId: null
      }
    },
    open(row) {
      if (!this.type) {
          this.alarmList = [
              {name: this.$t("hardware.alarmArray00"), id: -1},
              {name: this.$t("hardware.alarmArray0"), id: 0},
          ]
        this.alarmList = this.alarmList.concat(alarmArray)
      }
      this.dialogVisible = !this.dialogVisible;
      this.form = {
        weixin: row.weixin,
        sms: row.sms,
        phone: row.phone,
        timeFlag: row.timeFlag,
        timeFrom: row.timeFrom.length > 8 ? moment(row.timeFrom).format("HH:mm:ss") : row.timeFrom,
        timeTo: row.timeFrom.length > 8 ? moment(row.timeTo).format("HH:mm:ss") : row.timeTo,
        receiveResumeMessageFlag: row.receiveResumeMessageFlag == null ? 1 : row.receiveResumeMessageFlag,
        type: row.type,
        userId: row.userId
      }
      if (row.type == 11 || row.type == 4) {
        this.form["thingsId"] = row.instrumentId;
        this.form["thingsType"] = row.type;
      } else {
        this.form["equipmentId"] = row.equipmentId;
        this.form["type"] = row.type;
      }
    },
    async handleSubmit() {
      this.disabled = true;
      // 房间与实验室设备负责人
      try {
        let res;
        if (this.form.type == 11 || this.form.type == 4) {
          res = await updateThingsUser(this.form);
          this.handleMessage(res);
        } else {
          // 智能硬件负责人
          let res = await updateEquipmentUser(this.form);
          this.handleMessage(res);
        }
      } catch (e) {
        this.disabled = false;
        if (process.env.VUE_APP_DEMO === 'true') {
          if (!(e && e.code && String(e.code).startsWith('MOCK_'))) this.$message.error('保存失败，请重试。');
          return;
        }
        this.$message.error(ERROR);
        throw e;
      }
    },
    handleMessage(res) {
      this.disabled = false;
      if (res.code) {
        this.$message.success(this.$t("hardware.systemSuccess"));
        this.$emit("handle");
        this.handleClose();
      } else {
        this.$message.error(res.message || this.$t("hardware.systemError"));
      }
    }
  }
}
</script>

<style scoped>
.text-center {
  text-align: center;
}

/deep/ .el-date-editor.el-input, .el-date-editor.el-input__inner {
  width: 195px;
}
</style>
