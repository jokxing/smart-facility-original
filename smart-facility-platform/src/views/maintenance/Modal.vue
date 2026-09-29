<template>
  <el-dialog
    :title="$t('labDevice.nextMaintenanceDate')"
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
              :label="$t('labDevice.nextMaintenanceDate')"
              label-width="120px"
              prop="nextMaintenanceDate"
            >
              <el-date-picker
                v-model="form.nextMaintenanceDate"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                :placeholder="$t('labDevice.changeNextMaintenanceDate')"
              >
              </el-date-picker>
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
import { mapState, mapMutations } from "vuex";
import { postMaintenanceUpdateMaintenance } from "@/api/labDevice";
import {ERROR, STATUS_VALUE} from "@/utils/constant";

export default {
  data() {
    return {
      form: {},
      rules: {},
      submitLoading: false,
    };
  },
  created() {
    if (this.isEdit) {
      this.form = { ...this.editData };
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
    handleCancel() {
      this.hideModal();
    },
    async changeAsny() {
      try {
        this.submitLoading = true;
        let { nextMaintenanceDate } = this.form;
        let { id } = this.editData;

        let result = await postMaintenanceUpdateMaintenance({
          maintenanceId: id,
          nextMaintenanceDate,
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
      if (this.submitLoading) return;
      this.$refs[name].validate((valid) => {
        if (valid) {
          if(new Date(this.form.nextMaintenanceDate).getTime() < new Date(this.editData.createDate).getTime()){
            this.$message.error(this.$t('labDevice.nextMaintenanceDateMessage'))
          }else{
            this.changeAsny();
          }
        }
      });
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
