<template>
  <el-dialog
    :title="type === 1 ? $t('system.addDepartment') : type === 2 ? $t('system.updateDepartment') :  $t('system.addSunDepartment')"
    width="634px"
    :visible="true"
    :before-close="handleModalClose"
    destroy-on-close
    :closeOnClickModal="false"
    custom-class="modal-default modal-labDevice"
  >
    <div class="modal-default-body">
      <el-scrollbar style="height: 100%">
        <div class="modal-default-content">
          <!-- 新建部门 -->
          <el-form :model="form" ref="form" :rules="rules" label-position="left" label-width="auto">
            <el-form-item
              :label="$t('system.departmentName')"
              prop="departmentName"
              class="input-row-block"
            >
              <el-input
                v-model="form.departmentName"
                maxlength="26"
                :placeholder="$t('common.inputName')"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-scrollbar>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{ $t('common.cancel') }}</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="handleFormSubmit('form')"
      >
        {{ $t('common.confirm') }}</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import {departmentUpDate, addDepartment, getDepartment} from "@/api/department";
import {ERROR} from "@/utils/constant";
export default {
  data() {
      const _this = this;
    return {
      rules: {
        departmentName: [
          {
            required: true,
            message: _this.$t('common.isNotName'),
            trigger: "blur",
          },
        ],
      },
      form: {
        departmentName: "",
      },
      submitLoading: false,
    };
  },
  computed: {
    ...mapState("sys", {
      type: "modalDeptType",
      editData: "modalDeptEditData",
    }),
  },
  // watch: {
  //   type: {
  //     handler(newVal) {
  //       if (newVal !== 1) {
  //         let { name } = this.editData;
  //         this.form = { departmentName: name };
  //       }
  //     },
  //     immediate: true,
  //   },
  // },
  mounted() {
    if (this.type == 2) {
      let { name } = this.editData;
      this.form = { departmentName: name };
    }
  },
  methods: {
    ...mapMutations("sys", {
      handleHideModalMu: "HIDEDEPTMODAL",
      handleRefresh:'DEPTREFLESH'
    }),
    handleCancel() {
      //取消按钮
      this.handleHideModalMu();
    },
    async addDepartmentAsync() {
      try {
        this.submitLoading = true;
        let { departmentName } = this.form;
        let { name, id } = this.editData;
        let result = await addDepartment({
          name: departmentName,
          parentDepartmentId: id,
        });
        if (result.code == 1) {
          this.submitLoading = false;
          this.$message.success(this.$t('common.addSuccess'));
          this.handleHideModalMu();
          this.handleRefresh();
          getDepartment().then(res => {
            if (res.code) {
              this.$store.commit("SETDEPARTMENT", res.items.list);
              localStorage.setItem("departments", JSON.stringify(res.items.list));
            }
          })
        } else {
          this.submitLoading = false;
          this.$message.error(result.message);
        }
      } catch (err) {
        this.submitLoading = false;
        this.$message.error(ERROR);
        throw err;
      }
    },

    async updateDepartmentAsync() {
      try {
        this.submitLoading = true;
        let { departmentName } = this.form;
        let { id } = this.editData;
        let result = await departmentUpDate({
          name: departmentName,
          id: id,
        });
        if (result.code == 1) {
          this.submitLoading = false;
          this.$message.success(this.$t('common.editSuccess'));
          this.handleHideModalMu();
          this.handleRefresh();
          getDepartment().then(res => {
            if (res.code) {
              localStorage.setItem("departments", JSON.stringify(res.items.list));
            }
          })
        } else {
          this.submitLoading = false;
          this.$message.error(result.message);
        }
      } catch (err) {
        this.submitLoading = false;
        this.$message.error(ERROR);
        throw err;
      }
    },

    handleFormSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.type !== 2) {
            this.addDepartmentAsync();
          } else {
            this.updateDepartmentAsync();
          }
        } else {
        }
      });
    },
    handleModalClose() {
      //关闭按钮
      this.handleHideModalMu();
    },
  },
};
</script>
<style lang="less" >
@import "../../style/default.less";
</style>
