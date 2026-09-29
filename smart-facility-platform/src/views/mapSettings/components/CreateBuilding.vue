<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body
      custom-class="modal-default modal-labDevice"
      destroy-on-close
      width="634px"
  >
    <div class="modal-default-body">
      <el-scrollbar style="height: 100%">
        <el-form
            :model="form"
            label-width="230px">
          <div class="flexBox margin-center">
            <el-form-item :label="$t('dataV.buildingName1')" required>
              <el-input v-model.trim="form.name" maxlength="16" :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('dataV.gardenName')" required>
              <el-input v-model.trim="form.gardenName" disabled/>
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
import {postMapBuilding, putMapBuilding} from "@/api/mapSet";

export default {
  name: "CreateBuilding",
  data() {
      const _this = this;
    return {
      form: {
        name: ""
      },
      dialogVisible: false,
      title: _this.$t('dataV.addBuilding'),
      type: "",
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.form = {
        name: ""
      }
    },
    open(type, object, parentObject) {
      this.type = type;
      this.dialogVisible = true;
      if (type) {
        this.title = this.$t('dataV.editBuilding');
        const {gardenName, gardenId} = parentObject;
        const {id, name} = object;
        this.form.name = name;
        this.form.gardenName = gardenName;
        this.form.id = id;
        this.form.gardenId = gardenId;
      } else {
        this.title = this.$t('dataV.addBuilding');
        const {gardenId, gardenName} = object;
        this.form.gardenName = gardenName;
        this.form.gardenId = gardenId;
      }
    },
    handleSubmit() {
      if (!this.form.name) {
        return this.$message.error(this.$t('dataV.inputBuilding'));
      }
      delete this.form.gardenName;
      if (this.type) {
        // 编辑
        putMapBuilding(this.form).then(res => {
          this.handleMessage(res);
        })
      } else {
        // 新增
        postMapBuilding(this.form).then(res =>{
          this.handleMessage(res);
        })
      }
    },
    handleMessage(res) {
      if (res.code) {
        this.$message.success(res.message);
        this.handleClose();
        this.$emit("handle");
      } else {
        this.$message.error(res.message);
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import "../../../style/default.less";
</style>
