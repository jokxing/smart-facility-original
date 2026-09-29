<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form v-model="form" label-position="left" label-width="auto">
      <el-form-item
          :rules="[{ required: true }]"
          :label="$t('common.name')">
        <el-input
            v-model.trim="form.name"
            autocomplete="off"
            class="select-change-p"
            maxlength="50"
            :placeholder="$t('common.pleaseInput')"/>
      </el-form-item>
      <el-form-item
          :rules="[{ required: true }]"
          :label="$t('common.no')">
        <el-input
            v-model.trim="form.no"
            autocomplete="off"
            class="select-change-p"
            maxlength="16"
            oninput="value=value.replace(/[^\d]/g,'')"
            :placeholder="$t('hardware.noRule')"
            @input="handleSearchNo">
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('common.owningDepartment')">
        <select-department
            :department-id.sync="form.departmentId"
            :select-tree-value.sync="form.departmentId"
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
import {EQUIPMENT_TYPE, ERROR} from "@/utils/constant";
import {addDevice, checkEquipmentNo} from "@/api/device";
import SelectTree from "@c/SelectTree/index";
import SelectDepartment from "@c/SelectdePartment";

export default {
  name: "Create",
  components: {
    SelectDepartment,
    SelectTree
  },
  data() {
    return {
      title: "",
      dialogVisible: false,
      form: {
        name: "",
        no: "",
        equipmentType: EQUIPMENT_TYPE.DEVICE,
        departmentId: localStorage.getItem("departmentId")
      },
      loading: false,
      disabled: false,
    }
  },
  methods: {
    handleSearchNo(e) {
      this.$set(this.form, "no", e);
      if (e.length >= 14) {
        checkEquipmentNo({no: Number(e)}).then(res => {
          if (res.code) {
            !(res.items.code) && this.$message.error(res.items.message);
          }
        })
      }
    },
    handleClose() {
      this.form = {
        name: "",
        no: "",
        equipmentType: EQUIPMENT_TYPE.DEVICE,
        departmentId: localStorage.getItem("departmentId")
      };
      this.dialogVisible = !this.dialogVisible;
    },
    open(type) {
      this.title = this.handleTitle(type);
      this.form.equipmentType = type;
      this.dialogVisible = !this.dialogVisible;
    },
    handleTitle(value) {
      switch (value) {
        case 0:
          return this.$t("hardware.addDevice");
        case 10:
          return this.$t("hardware.addSmartSocket");
        case 7:
          return this.$t("hardware.addAlertor");
        case 8:
          return this.$t("hardware.addPowerOut");
        case 14:
          return this.$t("hardware.addSignalSource");
      }
    },
    getValue(value) {
      this.form.departmentId = value;
    },
    async handleSubmit() {
      if (!this.form.name) {
        return this.$message.error(this.$t("common.isNotName"));
      }
      if (!this.form.no) {
        return this.$message.error(this.$t("common.isNotNo"));
      }
      this.disabled = true;
      this.form.no = Number(this.form.no);
      try {
        let res = await addDevice(this.form);
        this.disabled = false;
        if (res.code) {
          this.handleClose();
          this.$message.success(res.message || this.title + this.$t("common.success"));
          this.$emit("getList");
        } else {
          this.$message.error(res.message || this.title + this.$t("common.error"));
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(ERROR);
      }
    }
  }
}
</script>

<style scoped>

</style>
