<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="$t('room.batchUpdateFloor')"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form v-model="form" label-position="left" label-width="auto">
      <el-form-item :label="$t('room.owningFloor')">
        <floor-select-tree :is-class="true" :id.sync="form.floorId" :select-tree-value.sync="form.floorId" :data="floors"/>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import FloorSelectTree from "@c/FloorSelectTree";
import {updateRoomBatch} from "@/api/room";
export default {
  name: "UpdateFloor",
  components: {FloorSelectTree},
  inject: ["reload"],
  props: {
    floors: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      form: {
        ids: [],
        floorId: null
      },
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.form = {
        ids: [],
        floorId: ""
      }
    },
    open(type, array) {
      this.dialogVisible = true;
      this.form.ids = array;
    },
    handleSubmit() {
      this.form.floorId = Number(this.form.floorId);
      updateRoomBatch(this.form).then(res => {
        if (res.code) {
          this.$message.success(this.$t("common.editSuccess"));
          this.handleClose();
          this.reload();
        } else {
          this.$message.error(res.message);
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
