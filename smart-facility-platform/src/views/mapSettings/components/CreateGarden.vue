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
            ref="labDeviceForm"
            :model="form"
            label-width="230px">
          <div class="flexBox margin-center">
            <el-form-item :label="$t('dataV.gardenName1')" required>
              <el-input
                  maxlength="16"
                  v-model.trim="form.gardenName"
                  :placeholder="$t('dataV.inputGardenName1')">
              </el-input>
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
import {postMapGarden, putMapGarden} from "@/api/mapSet";

export default {
  name: "CreateGarden",
  data() {
      const _this =this;
    return {
      title: _this.$t('dataV.addGarden'),
      dialogVisible: false,
      form: {
        gardenName: "",
      },
      type: 0
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.form = {
        gardenName: "",
      }
    },
    open(type, data) {
      this.dialogVisible = true;
      this.type = type;
      this.title = type ? this.$t('dataV.addGarden') : this.$t('dataV.editGarden');
      if (!type) {
        const {id, name} = data;
        this.form.gardenName = name;
        this.form.gardenId = id;
      }
    },
    handleSubmit() {
      if (this.type) {
        // 新增
        postMapGarden(this.form).then(res => {
          this.handleMessage(res);
        })
      } else {
        // 编辑
        putMapGarden(this.form).then(res => {
          this.handleMessage(res);
        })
      }
    },
    handleMessage(res) {
      if (res.code) {
        this.$message.success(this.title + this.$t('common.success'));
        this.$parent.handleGetMapGardenList();
        this.handleClose();
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
