<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form v-model="form" label-position="left" label-width="auto">
      <el-form-item :rules="[{ required: true }]" :label="$t('common.name')">
        <el-input v-model.trim="form.name" autocomplete="off" class="select-change-p" maxlength="16" :placeholder="$t('common.pleaseInput')"/>
      </el-form-item>
      <el-form-item
          :rules="[{ required: true }]"
          :label="$t('common.no')">
        <el-input
            v-model.trim="form.macId"
            autocomplete="off"
            class="select-change-p"
            oninput="value=value.replace(/[^A-Za-z0-9]/g,'')"
            :placeholder="$t('common.pleaseInput')"/>
      </el-form-item>
      <el-form-item :label="$t('common.owningDepartment')">
        <select-department :department-id.sync="form.departmentId"
                           :select-tree-value.sync="form.departmentId"
                           class="select-change-p"/>
      </el-form-item>
      <el-form-item :label="$t('common.remark')">
        <el-input
            v-model.trim="form.remark"
            :rows="4"
            autocomplete="off"
            class="select-change-p"
            maxlength="30"
            show-word-limit
            type="textarea"/>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {addGateway, updateGateway} from "@/api/gateway";
import {getDepartment} from "@/api/department";
import SelectTree from "@/components/SelectTree";
import SelectDepartment from "@c/SelectdePartment";
import {ERROR} from "@/utils/constant";

let type = 0;
export default {
  name: "Create",
  props: {
    proTypeOptions: {
      type: Array,
      default: () => {
      }
    },
  },
  components: {
    SelectDepartment,
    SelectTree
  },
  data() {
      const _this = this;
    return {
      dialogVisible: false,
      title: _this.$t('hardware.addGateway'),
      form: {
        name: "",
        macId: null,
        gatewayTypeId: null,
        departmentId: localStorage.getItem("departmentId"),
        thingsCardId: null,
        remark: ""
      },
      loading: false,
      disabled: false,
      selectTreeValue: "0"
    }
  },
  methods: {
    getValue(value) {
      this.selectTreeValue = value;
      this.form.departmentId = value;
    },
    /**
     * @param index 1:新增，0：编辑
     * @param row
     */
    open(index, row) {
      if (index) {
        this.title = this.$t('hardware.addGateway');
        type = index;
      } else {
        this.title = this.$t('hardware.editGateway');
        type = index;
        this.form = {
          gatewayTypeId: row.gatewayTypeId || null,
          thingsCardId: row.thingsCardId || null,
          name: row.name || null,
          macId: row.macId || null,
          remark: row.remark || null,
          departmentId: row.departmentId.toString() || null,
          id: row.id,
        };
      }
      this.dialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false;
      this.init();
    },
    handleRemoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          getDepartment({keyword: query}).then(res => {
            this.departments = res.items.list;
            this.loading = false;
          })
        }, 200);
      } else {
        this.departments = [];
      }
    },
    async handleSubmit() {
      if (!this.form.name) {
        return this.$message.error(this.$t('common.isNotName'));
      }
      if (!this.form.macId) {
        return this.$message.error(this.$t('common.isNotNo'));
      }
      this.disabled = true;
      try {
        let res;
        if (type) {
          res = await addGateway(this.form);
          this.handleMessage(res);
        } else {
          res = await updateGateway(this.form);
          this.handleMessage(res);
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(ERROR);
      }

    },
    init() {
      this.form = {
        name: "",
        macId: null,
        gatewayTypeId: null,
        departmentList: null,
        thingsCardId: null,
        remark: ""
      }
      this.selectTreeValue = "0";
    },
    handleMessage(res) {
      this.disabled = false;
      if (res.code) {
        this.$message.success(this.title + this.$t('common.success') + "！");
        this.$emit("getGatewayList");
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    }
  }
}
</script>
