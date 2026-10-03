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
            label-width="150px">
          <div class="flexBox margin-center">
            <el-form-item :label="$t('dataV.floorName')" required>
              <el-input v-model.trim="form.name" maxlength="16" :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('dataV.buildingName')" required>
              <el-input v-model.trim="form.buildingName" disabled :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('route.floorConfiguar')" required>
              <chuxou-upload
                  :accept="isDemo ? 'image/png,image/jpeg,.png,.jpg,.jpeg' : 'jpg,.png,.svg'"
                  :dir="'svg'"
                  :limit="1"
                  :max="isDemo ? 5 : 15"
                  :demo-local="isDemo"
                  :value="fileList"
                  @handleUploadSuccess="handleUploadSuccess"
              />
              <div v-if="isDemo" class="demo-map-hint">仅 PNG/JPEG，≤5MB；替换底图不会自动迁移或清除已有布局。</div>
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
import {isDemoMediaKey, peekDemoMediaUrl} from "@/utils/demoMediaStore";
import {resolveFloorMapUrl} from "@/utils/demoFloorMapUrl";

const isDemo = process.env.VUE_APP_DEMO === 'true';

export default {
  name: "CreateFloor",
  components: {ChuxouUpload},
  data() {
      const _this = this;
    return {
      isDemo,
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
      disabled: true,
      originalMapUrl: ""
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.fileList = [];
      this.originalMapUrl = "";
      this.form = {
        name: "",
        media: {
          url: "",
          uid: ""
        }
      }
      this.disabled = true;
    },
    open(type, object, parentObject) {
      this.dialogVisible = true;
      this.type = type;
      this.fileList = [];
      this.originalMapUrl = "";
      if (type) {
        // 编辑
        this.title = this.$t('dataV.editFloor');
        const {buildingName, buildingId} = parentObject;
        const {id, name, mapUrl, uid} = object;
        this.originalMapUrl = mapUrl || "";
        const preview = resolveFloorMapUrl(mapUrl) || (isDemoMediaKey(mapUrl) ? peekDemoMediaUrl(mapUrl) : (BASE_URL + mapUrl));
        this.fileList.push({name: mapUrl, uid: uid || String(id), url: preview});
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
        this.disabled = true;
      }
    },
    handleSubmit() {
      if (!this.form.name) {
        return this.$message.error(this.$t('dataV.inputFloor'));
      }
      delete this.form.buildingName;
      const file = this.fileList && this.fileList[0];
      if (!file || !file.name) {
        return this.$message.error('请上传楼层底图。');
      }
      if (this.type && this.originalMapUrl && file.name !== this.originalMapUrl) {
        this.$message.info('替换底图不会自动迁移或清除已有布局。');
      }
      this.form.media = {
        url: file.name,
        uid: file.uid != null ? String(file.uid) : ''
      };
      if (this.type) {
        return putMapFloor(this.form).then(res => {
          this.handleMessage(res);
          return res;
        }).catch(() => this.$message.error('保存失败，请重试。'));
      }
      return postMapFloor(this.form).then(res => {
        this.handleMessage(res);
        return res;
      }).catch(() => this.$message.error('保存失败，请重试。'));
    },
    handleMessage(res) {
      if (res.code === 1) {
        this.$message.success(res.message);
        this.handleClose();
        this.$emit("handle");
      } else {
        this.$message.error(res.message);
      }
    },
    handleUploadSuccess(e) {
      this.fileList = e;
      this.disabled = !(e && e[0] && e[0].name);
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../style/default";
</style>
