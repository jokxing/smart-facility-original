<template>
  <el-dialog
    title="更改预约"
    width="634px"
    :visible="true"
    :before-close="handleModalClose"
    destroy-on-close
    custom-class="modal-default"
  >
    <div class="modal-default-body">
      <el-scrollbar style="height: 100%">
        <div class="modal-default-content">
          <el-form :model="form" ref="form" :rules="rules" label-position="left" label-width="auto">
            <el-form-item
              :label="$t('labDevice.labDeviceName')"
              prop="userName"
              class="input-row-block"
            >
              <el-input
                v-model="form.userName"
                :placeholder="$t('labDevice.inputLabDeviceName')"
                disabled
              ></el-input>
            </el-form-item>

            <el-form-item :label="$t('labDevice.orderTime')" prop="dateBetween">
              <DateTimeSelect
                :dateTime="form.dateBetween"
                :startDisabled="startDisabled"
                @getDateTime="getDateTime" />
              <!-- <el-date-picker
                v-model="form.dateBetween"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="datePickerOption"
              >
              </el-date-picker> -->
            </el-form-item>

            <el-form-item :label="$t('common.remark')" prop="remark">
              <el-input
                type="textarea"
                v-model="form.remark"
                :placeholder="$t('labDevice.inputRemark')"
                maxlength="50"
                rows="5"
                show-word-limit
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-scrollbar>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{ $t('common.cancel') }}</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="handleFormSubmit('form')"
      >
        {{ $t('common.confirm') }}</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import DateTimeSelect from "@/components/DateTimeSelect";
import { mapState, mapMutations } from "vuex";
import moment from "moment";
import { getInstrumentReservationUpdate } from "@/api/labDevice";
import {ERROR, STATUS_VALUE} from "@/utils/constant";

export default {
  data() {
    return {
      form: {
        dateBetween: {}
      },
      rules: {},
      submitLoading: false,
      datePickerOption: {
        disabledDate: (time) => {
          let nowDate = new Date();
          let oneDay = 1000 * 60 * 60 * 24;
          // let oneYearLater = new Date(nowDate.getTime() + oneDay * 365);
          let yesterday = new Date(nowDate.getTime() - oneDay);
          return time.getTime() < yesterday;
        },
      },
      startDisabled: false,
    };
  },
  components: {
    DateTimeSelect
  },
  created() {
    if (this.isEdit) {
      let { timeFrom, timeTo, status } = this.editData;
      // let dateBetween = [moment(timeFrom).format("YYYY-MM-DD HH:mm"), moment(timeTo).format("YYYY-MM-DD HH:mm")];
      let dateBetween = {
        start: moment(timeFrom).format("YYYY-MM-DD HH:mm"),
        end: moment(timeTo).format("YYYY-MM-DD HH:mm")
      };
      this.form = { ...this.editData, dateBetween };
      if(status == 1){
        this.startDisabled = true;
      }
    }
  },
  computed: {
    ...mapState("lab", {
      isEdit: "isEdit",
      editData: "editData",
    }),
  },
  methods: {
    ...mapMutations("lab", {
      hideModal: "HIDEMODAL",
      handleReflesh: "REFLESH",
    }),
    // 修改时间赋值
    getDateTime(e){
      this.form.timeFrom = e[0];
      this.form.timeTo = e[1];
    },
    handleCancel() {
      this.hideModal();
    },
    async changeAsny() {
      try {
        this.submitLoading = true;
        let formData = this.form;
        let { dateBetween } = this.form;
        if (dateBetween) {
          formData = { ...formData, dateBetween: undefined };
        }
        let result = await getInstrumentReservationUpdate({
          ...this.editData,
          ...formData,
        });
        if (result.code === STATUS_VALUE.NORMAL) {
          this.submitLoading = false;
          this.$message.success(this.$t('labDevice.updateSuccess'));
          this.hideModal();
          this.handleReflesh();
        } else {
          this.submitLoading = false;
          this.$message.error(result.message);
        }
      } catch (err) {
        this.submitLoading = false;
        this.$message.error(ERROR);
        throw err;
      }
    },
    handleFormSubmit(name) {
      if(new Date().getTime() > new Date(this.form.timeTo).getTime()){
        this.$message.error(this.$t('labDevice.updateMessage3'))
      }else{
        if (this.submitLoading) return;
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.changeAsny();
          }
        });
      }
    },
    handleModalClose() {
      this.hideModal();
    },
  },
};
</script>
<style lang="less" >
@import "../../style/default.less";
</style>
