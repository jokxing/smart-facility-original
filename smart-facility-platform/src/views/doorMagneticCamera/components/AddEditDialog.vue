<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      append-to-body
      @opened="handleOpened">
    <el-form :model="formData" label-position="right" :rules="rules" label-width="120px" ref="addEditFormRef" class="dialog-el-form">
      <el-form-item prop="contactName" :label="$t('common.name')">
        <el-input
            v-model.trim="formData.contactName"
            autocomplete="off"
            class="select-change-p"
            maxlength="50"
            :placeholder="$t('doorMagneticCamera.nameValidMessage')"/>
      </el-form-item>
      <!-- 硬件编号：只有在新增的时候才会出现 -->
      <el-form-item prop="contactNo" :label="$t('doorMagneticCamera.doorCameraNo')" v-if="dialogType === 'add'">
        <el-input
            v-model.trim="formData.contactNo"
            autocomplete="off"
            class="select-change-p"
            maxlength="16"
            
            :placeholder="$t('doorMagneticCamera.cameraNoValidMessage')"
            >
            <!-- oninput="value=value.replace(/[^\d]/g,'')" -->
        </el-input>
      </el-form-item>
      <!-- 单次录影时长：只有在详情弹窗点击编辑的时候才会出现 -->
      <el-form-item prop="contactSingleVideoTime" :label="$t('doorMagneticCamera.singleRecordingDuration')" v-if="dialogType === 'detailEdit'">
        <el-input-number
          v-model="formData.contactSingleVideoTime" 
          :min="10" :max="30" :precision="0"
          class="select-change-p cx-el-input-number"
          :placeholder="$t('doorMagneticCamera.singleRecordingDurationPlaceholder')"
          :controls="false">
          <template slot="append">
            <span>{{$t('common.second')}}</span>
          </template>
        </el-input-number>
        <span class="input-number-append">{{$t('common.second')}}</span>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ERROR } from "@/utils/constant";
import {addDoorCamera, editDoorCamera, existcontactname, existcontactno} from "@/api/doorMagneticCamera";

export default {
  name: "AddEditDialog",
  components: {},
  props: {
    dialogVisible: {
      type: Boolean
    },
    dialogTitle: {
      type: String
    },
    cameraId: {
      type: [String, Number]
    },
    dialogType: {
      type: String,
      default: 'add'
    },
    cameraInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      formData: {},
      loading: false,
      disabled: false,
      rules: {
        contactName: [
          { required: true, message: this.$t("doorMagneticCamera.nameValidMessage"), trigger: 'blur' }
        ],
        contactNo: [
          { required: true, message: this.$t("doorMagneticCamera.cameraNoValidMessage"), trigger: 'blur' },
          { min: 14, max: 16, message: this.$t('hardware.noRule'), trigger: 'blur' }
        ],
        contactSingleVideoTime: [
          { required: true, message: this.$t("doorMagneticCamera.singleRecordingDurationValidMessage"), trigger: 'blur' },
          { type: 'number', min: 10, max: 30, message: this.$t('doorMagneticCamera.singleRecordingDurationValidMessage'), trigger: 'blur' },
        ]
      }
    }
  },
  methods: {
    handleOpened () {
      this.formData = this.initFormData(this.cameraId ? this.cameraInfo : {})
    },
    initFormData (cameraInfo) {
      return {
        contactName: cameraInfo?.contactName || undefined,
        contactNo: cameraInfo?.contactNo || undefined,
        contactSingleVideoTime: cameraInfo?.contactSingleVideoTime || undefined
      }
    },
    // 提交时检验名称和编码是否重复
    async handleCheckIsRepeat () {
      let addValidParams = { contactName: this.formData.contactName }
      // 编辑时把编号传过去，以便校验时排除它本身
      if (this.dialogType !== 'add') {
        addValidParams.contactNo = this.cameraInfo.contactNo
      }
      let res, promiseList = [await existcontactname(addValidParams)]
      if (this.dialogType === 'add') {
        promiseList.push(
          await existcontactno({ contactNo: this.formData.contactNo })
        )
      }
      try {
        res = await Promise.all(promiseList)
      } catch (e) {
        this.$message.error(e.response?.data?.message)
      }
      return res
    },
    handleClose () {
      // 重置表单
      this.formData = this.initFormData()
      this.$refs.addEditFormRef.resetFields()
      this.$emit('close')
    },
    async handleSubmit () {
      this.$refs.addEditFormRef.validate(async(valid, error) => {
        if (valid) {
          this.disabled = true;
          // 校验名称和编码是否重复
          let repeatValid = await this.handleCheckIsRepeat()
          if (!repeatValid) {
            this.disabled = false
            return
          }
          // code：0-重复，1-不重复
          let repeatItem = repeatValid.find(v => v.code == 0 && v)
          if (repeatItem) {
            this.$message.error(repeatItem.message)
            this.disabled = false
            return
          }
          let editParams = {
            ...this.cameraInfo,
            ...this.formData
          }
          delete editParams.updateTime
          try {
            let res = this.dialogType === 'add' ? await addDoorCamera(this.formData) : await editDoorCamera(editParams);
            this.disabled = false;
            if (res.code) {
              this.$message.success(res.message || this.$t("common.success"));
              this.$emit("refresh", this.formData);
              this.handleClose();
            } else {
              this.$message.error(res.message || this.$t("common.error"));
            }
          } catch (e) {
            this.disabled = false;
            this.$message.error(ERROR);
          }
        } else {
          let errorMessages = Object.values(error)
          console.log('error submit!!', error, errorMessages);
          if (errorMessages.length) {
            this.$message.error(errorMessages[0][0].message);
          }
          return false;
        }
      });
    }
  }
}
</script>

<style scoped>

</style>
