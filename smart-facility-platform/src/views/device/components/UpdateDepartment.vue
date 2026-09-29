<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form :model="form" label-position="left" label-width="auto">
      <el-form-item v-if="!this.type || this.type === 13" :label="$t('common.name')" required>
        <el-input v-model.trim="form.name" autocomplete="off" class="select-change-p" maxlength="50" :placeholder="$t('common.placeholder')"/>
      </el-form-item>
      <el-form-item :label="$t('common.owningDepartment')">
        <select-department :department-id.sync="form.departmentId" :select-tree-value.sync="selectTreeValue" class="select-change-p"/>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {mutilUpdateDepartmentsOfDevice, updateDepartment,postDeviceUpdateEquipment} from "@/api/device";
import SelectTree from "@/components/SelectTree";
import SelectDepartment from "@c/SelectdePartment";
import {ERROR} from "@/utils/constant";

export default {
  name: "UpdateDepartment",
  components: {
    SelectDepartment,
    SelectTree
  },
  data() {
      const _this = this;
    return {
      dialogVisible: false,
      title: _this.$t('other.fixNameAndDep'),
      form: {
        departmentId: null,
        name: "",
      },
      items: null,
      type: 0,
      selectTreeValue: null,
      disabled: false
    }
  },
  methods: {
    getValue(value) {
      this.form.departmentId = value;
    },
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.type = 0;
      this.items = null;
      this.form = {
        name: "",
      }
      this.selectTreeValue = "0";
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
        if(type === 13){ //枪
          this.form.name = items.name;
          this.selectTreeValue = this.form.departmentId = items.departmentId.toString() || null;
        }
      } else {
        this.items = items.id;
        this.form.name = items.name;
        this.type = type;
        this.selectTreeValue = this.form.departmentId = items.departmentId.toString() || null;
      }
      this.dialogVisible = !this.dialogVisible;
    },
    async handleSubmit() {
      this.disabled = true;
      try {
        let res;
        if (this.type) {
          if(this.type === 13){
            postDeviceUpdateEquipment({
              id: this.items.id,
              departmentId: this.form.departmentId,
              name: this.form.name
            }).then(res => {
              this.handleMessage(res);
            })
          }else{
            res = await mutilUpdateDepartmentsOfDevice({
              id: 0,
              ids: this.items,
              departmentId: this.form.departmentId,
            });
            this.handleMessage(res);
            res.code && this.$emit("getList");
          }
        } else {
          if (!this.form.name) {
            return this.$message.error(this.$t('common.isNotName'))
          }
          res = await updateDepartment({
            id: this.items,
            departmentId: this.form.departmentId,
            name: this.form.name
          });
          this.handleMessage(res);
          res.code && this.$emit("getList");
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(ERROR);
        throw e;
      }
    },
    handleMessage(res) {
      this.disabled = false;
      if (res.code) {
        this.$emit("handle");
        this.$message.success(this.$t('common.editSuccess'));
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    }
  }
}
</script>

