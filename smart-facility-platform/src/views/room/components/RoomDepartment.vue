<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="$t('room.batchUpdateDepartment')"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form v-model="form"  label-position="left" label-width="auto">
      <el-form-item :label="$t('common.owningDepartment')">
        <select-department class="select-change-p" :select-tree-value.sync="form.departmentId" :departments="departments" :department-id.sync="form.departmentId"/>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import SelectDepartment from "@c/SelectdePartment";
import {getDepartment} from "@/api/department";
import {updateRoomBatch} from "@/api/room";
export default {
  name: "RoomDepartment",
  components: {SelectDepartment},
  data() {
    return {
      dialogVisible: false,
      departments: [],
      form: {
        ids: [],
        departmentId: null,
      }
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.form.departmentId = null;
    },
    open(type, array) {
      this.dialogVisible = true;
      this.form.ids = array;
      getDepartment().then(res => {
        this.departments = res.items.list;
      })
    },
    handleSubmit() {
      updateRoomBatch(this.form).then(res => {
        this.handleMessage(res)
      })
    },
    handleMessage(res) {
      if (res.code) {
        this.$message.success(this.$t('common.editSuccess'));
        this.$emit("handle");
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    }
  }
}
</script>
