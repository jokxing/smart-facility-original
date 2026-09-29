<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form v-model="form" label-width="auto" label-position="left">
      <el-form-item :rules="[{required: true}]" :label="$t('common.name')">
        <el-input v-model.trim="form.name" autocomplete="off" class="select-change-p" maxlength="50" :placeholder="$t('common.pleaseInput')"/>
      </el-form-item>
      <el-form-item :rules="[{required: true}]" :label="$t('common.no')">
        <el-input v-model.trim="form.no" autocomplete="off" class="select-change-p" maxlength="16"
                  oninput="value=value.replace(/[^\w]/g)"
                  :placeholder="$t('hardware.noRule')"/>
      </el-form-item>
      <el-form-item :label="$t('common.owningDepartment')">
        <select-department :department-id.sync="form.departmentId" :departments="departments" :select-tree-value.sync="form.departmentId"
                           class="select-change-p"/>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {addAlertor, getAlarmAlarmorMonitorInfoSaveEdit, updateAlertor} from "@/api/alertor";
import SelectDepartment from "@c/SelectdePartment";
import {ERROR} from "@/utils/constant";

export default {
  name: "Create",
  components: {SelectDepartment},
  data() {
      const _this = this;
    return {
      title: _this.$t('hardware.addSiren'),
      dialogVisible: false,
      form: {
        name: "",
        no: "",
        departmentId: localStorage.getItem("departmentId"),
        remark: ""
      },
      departments: [],
      type: 0,
      disabled: false
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.form = {
        name: "",
        no: "",
        departmentId: localStorage.getItem("departmentId"),
        remark: ""
      }
    },
    open(type, departments, row) {
      if (!type) {
        this.title = this.$t('hardware.addSiren');
      } else {
        this.title = this.$t('hardware.editSiren');
        const {id, name, no, departmentId, remark} = row;
        this.form = {id, name, no, departmentId, remark};
      }
      this.type = type;
      this.dialogVisible = !this.dialogVisible;
      this.departments = departments;
    },
    async handleSubmit() {
      if (!this.form.name) {
        return this.$message.error(this.$t('common.isNotName'));
      }
      if (!this.form.no) {
        return this.$message.error(this.$t('common.isNotNo'));
      }
      this.disabled = true;
      try {
        let res;
        if (!this.type) {
          res = await addAlertor(this.form);
          this.handleMessage(res);
        } else {
          res = await updateAlertor(this.form);
          this.handleMessage(res);
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(ERROR);
      }
    },
    handleMessage(res) {
      this.disabled = false;
      if (res.code) {
        this.$message.success(this.title + this.$t('common.success'));
        this.$emit("handle");
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    }
  }
}
</script>
