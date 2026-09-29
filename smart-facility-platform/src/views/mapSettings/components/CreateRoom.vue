<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body
      custom-class="modal-default modal-labDevice"
      destroy-on-close
      width="634px">
    <div class="modal-default-body">
      <el-scrollbar style="height: 100%">
        <el-form
            :model="form"
            label-width="230px">
          <div class="flexBox margin-center">
            <el-form-item :label="$t('common.room')" required>
              <el-select
                  v-if="!type"
                  v-model="form.labId"
                  filterable
                  :placeholder="$t('dataV.inputRoom')">
                <el-option
                    v-for="item in rooms"
                    :key="item.labId"
                    :label="item.labName"
                    :value="item.labId">
                </el-option>
              </el-select>
              <el-input v-else v-model="form.labName" disabled/>
            </el-form-item>
            <el-form-item :label="$t('room.owningFloor')" required>
              <el-input v-model="form.floorName" disabled :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
          </div>
        </el-form>
      </el-scrollbar>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {getMapLabList, postMapBoundLab} from "@/api/mapSet";

let time = "";
export default {
  name: "CreateRoom",
  data() {
      const _this = this;
    return {
      form: {
        labName: "",
      },
      title: _this.$t('dataV.bindRoom'),
      dialogVisible: false,
      type: "",
      fileList: [],
      loading: false,
      rooms: [],
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.form = {
        labName: "",
      }
    },
    open(type, object, parentObject) {
      this.dialogVisible = true;
      this.type = type;
      this.fileList = []
      getMapLabList({floorId: 0}).then(res => {
        if (res.code) {
          this.rooms = res.items;
          this.loading = false;
        } else {
          this.$message.error(res.message);
        }
      })
      if (type) {
        // 编辑
        this.title = this.$t('dataV.updateBindRoom');
        const {floorName, floorId} = parentObject;
        const {labId, labName} = object;
        this.form.labName = labName;
        this.form.labId = labId;
        this.form.floorId = floorId;
        this.form.floorName = floorName;
      } else {
        // 新增
        this.title = this.$t('dataV.bindRoom');
        const {floorName, floorId} = object;
        this.form.floorName = floorName;
        this.form.floorId = floorId;
      }
    },
    handleSubmit() {
      delete this.form.labName;
      if (this.type) {
        // 编辑
        postMapBoundLab(this.form).then(res => {
          this.handleMessage(res);
        })
      } else {
        // 新增
        if (!this.form.labId) {
          return this.$message.error(this.$t('dataV.changeBindRoom'));
        }
        postMapBoundLab(this.form).then(res => {
          this.handleMessage(res);
        })
      }
    },
    handleMessage(res) {
      if (res.code) {
        this.$message.success(this.$t('hardware.bindSuccess'));
        this.handleClose();
        this.$emit("handle");
      } else {
        this.$message.error(res.message);
      }
    },
    handleUploadSuccess(e) {
      this.fileList = e;
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../style/default";

/deep/ .el-select > .el-input {
  width: 200px;
}
</style>
