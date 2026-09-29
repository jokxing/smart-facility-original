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
            <el-form-item :label="$t('dataV.floorName')" required>
              <el-input v-model.trim="form.name" maxlength="16" :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('dataV.buildingName')" required>
              <el-input v-model.trim="form.buildingName" disabled :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('route.floorConfiguar')" required>
              <chuxou-upload
                  :accept="'jpg,.png,.svg'"
                  :dir="'svg'"
                  :limit="1"
                  :max="15"
                  :value="fileList"
                  @handleUploadSuccess="handleUploadSuccess"
              />
            </el-form-item>
          </div>
        </el-form>
      </el-scrollbar>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import ChuxouUpload from "@/views/room/components/chuxouUpload";
import {postMapFloor, putMapFloor} from "@/api/mapSet";
import {BASE_URL} from "@/utils/constant";

export default {
  name: "CreateFloor",
  components: {ChuxouUpload},
  data() {
      const _this = this;
    return {
      form: {
        name: "",
        media: {
          url: "",
          uid: ""
        }
      },
      title: _this.$t('dataV.addFloor'),
      dialogVisible: false,
      type: "",
      fileList: [],
      disabled: true
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.fileList = [];
      this.form = {
        name: "",
        media: {
          url: "",
          uid: ""
        }
      }
    },
    open(type, object, parentObject) {
      this.dialogVisible = true;
      this.type = type;
      this.fileList = [];
      if (type) {
        // 编辑
        this.title = this.$t('dataV.editFloor');
        const {buildingName, buildingId} = parentObject;
        const {id, name, mapUrl, uid} = object;
        this.fileList.push({name: mapUrl, uid, url: BASE_URL + mapUrl});
        this.form.name = name;
        this.form.buildingName = buildingName;
        this.form.id = id;
        this.form.buildingId = buildingId;
        this.disabled = false;
      } else {
        // 新增
        this.title = this.$t('dataV.addFloor');
        const {buildingName, buildingId} = object;
        this.form.buildingName = buildingName;
        this.form.buildingId = buildingId;
      }
    },
    handleSubmit() {
      if (!this.form.name) {
        return this.$message.error(this.$t('dataV.inputFloor'));
      }
      delete this.form.buildingName;
      this.form.media["url"] = this.fileList[0].name;
      this.form.media["uid"] = this.fileList[0].uid;
      if (this.type) {
        // 编辑
        putMapFloor(this.form).then(res => {
          this.handleMessage(res);
        })
      } else {
        // 新增
        postMapFloor(this.form).then(res => {
          this.handleMessage(res);
        });
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
    },
    handleUploadSuccess(e) {
      this.fileList = e;
      this.disabled = false;
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../style/default";
</style>
