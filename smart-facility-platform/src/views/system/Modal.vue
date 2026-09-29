<template>
  <el-dialog
    :title="modalTitle"
    width="634px"
    :visible="true"
    :before-close="handleModalClose"
    destroy-on-close
    :append-to-body="isDependByBody"
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
              v-if="modalType == 'DEPT'"
            >
              <el-input
                v-model="form.departmentName"
                :placeholder="$t('system.inputDepartmentName')"
              ></el-input>
            </el-form-item>
            <!-- 变更部门 -->
            <el-form-item
                :label="$t('common.department')"
              prop="departmentId"
              class="input-row-block"
              v-else-if="modalType == 'CDEPT'"
            >
              <SelectTree
                :model="form.departmentId"
                :prop="props"
                :options="departmentData"
                :value="selectTreeValue"
                :clearable="isClearable"
                :accordion="isAccordion"
                @getValue="getValue($event)"
                :placeholder="$t('common.selectDepartemnt')"
              />
            </el-form-item>
            <!-- 变更角色 -->
            <el-form-item
                :label="$t('system.role')"
              prop="roleId"
              class="input-row-block"
              v-else-if="modalType == 'CROLE'"
            >
              <el-select
                v-model="form.roleId"
                multiple
                :placeholder="$t('system.changeRole')"
                class="select-mutiple-default"
              >
                <el-option
                  v-for="item in roleList"
                  :label="item.name"
                  :value="item.id"
                  :key="item.id"
                ></el-option>
              </el-select>
            </el-form-item>

            <!-- 添加成员 -->
            <div v-else-if="modalType == 'USER'">
              <div class="flexBox">
                <template v-if="deptId === 0 && !isEdit">
                  <el-form-item :label="$t('common.department')" prop="departmentId">
                    <SelectTree
                      :model="form.departmentId"
                      :prop="props"
                      :options="departmentData"
                      :value="selectTreeValue"
                      :clearable="isClearable"
                      :accordion="isAccordion"
                      @getValue="getValue($event)"
                      :placeholder="$t('common.selectDepartemnt')"
                    />
                  </el-form-item>
                </template>
                <el-form-item :label="$t('common.department')" prop="departmentId" v-else>
                  <SelectTree
                    :model="form.departmentId"
                    :prop="props"
                    :options="departmentData"
                    :value="selectTreeValue"
                    :clearable="isClearable"
                    :accordion="isAccordion"
                    @getValue="getValue($event)"
                    :placeholder="$t('common.selectDepartemnt')"
                  />
                </el-form-item>

                <el-form-item :label="$t('system.loginId')" prop="loginId">
                  <el-input
                    :disabled="isEdit"
                    v-model="form.loginId"
                    :placeholder="$t('system.inputLoginId')"
                    :maxlength="20"
                    autocomplete="off"
                  ></el-input>
                </el-form-item>

                <el-form-item :label="$t('login.password')" prop="pwd" show-password>
                  <el-input
                    v-model="form.pwd"
                    type="password"
                    :placeholder="$t('login.inputPassword')"
                    autocomplete="new-password"
                  ></el-input>
                </el-form-item>
                <el-form-item
                    :label="$t('system.password')"
                  prop="repwd"
                  show-password
                  v-if="!isEdit"
                >
                  <el-input
                    v-model="form.repwd"
                    type="password"
                    :placeholder="$t('login.inputPassword')"
                  ></el-input>
                </el-form-item>

                <el-form-item :label="$t('system.name')" prop="name">
                  <el-input
                    v-model="form.name"
                    :placeholder="$t('system.inputName')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('system.tel')" prop="tel">
                  <el-input
                    v-model="form.tel"
                    maxlength="11"
                    :placeholder="$t('system.inputTel')"
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('system.email')" prop="email">
                  <el-input
                    v-model="form.email"
                    :placeholder="$t('system.inputEmail')"
                  ></el-input>
                </el-form-item>
              </div>
              <el-form-item :label="$t('system.role')" prop="roleId" class="input-row-block">
                <el-select
                  v-model="form.roleId"
                  :placeholder="$t('system.changeRole')"
                  @change="handleRolesChange"
                >
                  <el-option
                    v-for="item in roleList"
                    :label="item.name"
                    :value="item.id"
                    :key="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>
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
import SelectTree from "@/components/SelectTree";
import { PHONEREGEXP, EMAILREGEXP } from "@/utils/regExp";
import { mapState, mapMutations } from "vuex";
import { getRoleList } from "@/api/system";
import { userAdd, updateUserBasic, postChangeDeptBatch } from "@/api/user";
import {ERROR} from "@/utils/constant";
export default {
  components: {
    SelectTree,
  },
  props: {
    isDependByBody: {
      type: Boolean,
      default: false,
    },
    departmentList: {
      type: Array,
      default: () => [],
    },
    departmentId: {
      type: Number,
      default: null
    }
  },

  data() {
      const _this = this;
    let validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t('login.inputPassword')));
      } else {
        if (this.form.repwd !== "") {
          this.$refs.form.validateField("repwd");
        }
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t('system.inputPassword')));
      } else if (value !== this.form.pwd) {
        callback(new Error(this.$t('system.isPassword')));
      } else {
        callback();
      }
    };
    return {
      rules: {
        departmentId: [
          {
            required: true,
            message: _this.$t('common.isNotName'),
            trigger: "blur",
          },
        ],
        loginId: [
          {
            required: true,
            message: _this.$t('system.inputLoginId'),
            trigger: "blur",
          },
          {
            pattern: /^\w{3,18}$/,
            message: _this.$t('system.telRule1'),
            trigger: "blur",
          },
        ],
        tel: [
          {
            required: true,
            message: _this.$t('system.inputTel'),
            trigger: "blur",
          },
        ],
        email: [
          {
            pattern: EMAILREGEXP,
            message: _this.$t('system.emailRule'),
            trigger: "blur",
          },
        ],
        name: [
          {
            required: true,
            message: _this.$t('system.inputName'),
            trigger: "blur",
          },
          {
            min: 2,
            max: 20,
            message: _this.$t('system.twoAnd20'),
            trigger: "blur",
          },
        ],
        pwd: [
          {
            required: true,
            validator: validatePass,
            trigger: "blur",
          },
          {
            min: 6,
            max: 18,
            message: _this.$t('system.passwordLength'),
            trigger: "blur",
          },
        ],
        repwd: [
          {
            required: true,
            validator: validatePass2,
            trigger: "blur",
          },
        ],
      },
      form: {
        name: "",
        departmentId: "",
        roleId: "",
      },
      submitLoading: false,
      isClearable: true, // 可清空（可选）
      isAccordion: false, // 可收起（可选）
      selectTreeValue: "0", // 初始ID（可选）
      props: {
        // 配置项（必选）
        value: "id",
        label: "name",
        children: "subDivisions",
      },
      selectTreeData: [
        {
          id: "1",
          name: "总经办",
        },
        {
          id: "2",
          name: "软件开发部",
          children: [
            {
              id: "3",
              name: "软件组",
            },
            {
              id: "4",
              name: "硬件组",
            },
          ],
        },
      ],
      roleList: [],
    };
  },
  created() {
    this.getRoleListAsync();
      if (this.departmentId) {
          this.form.departmentId = this.departmentId.toString();
          this.selectTreeValue = this.departmentId.toString();
      }
  },
  computed: {
    ...mapState("sys", {
      modalTitle: "modalTitle",
      modalType: "modalType",
      isEdit: "isEdit",
      currentDept: "currentDept",
      deptId: "deptId",
      editData: "editData",
      selectedRows: "selectedRows",
    }),
    changeDept() {
      let { currentDept, deptId, modalType, isEdit } = this;
      return {
        currentDept,
        deptId,
        modalType,
        isEdit,
      };
    },
    departmentData() {
      const traverse = (array, _proto) => {
        let am = array.map((arr) => {
          if (arr[_proto].length && arr[_proto].length > 0) {
            traverse(arr[_proto], _proto);
          }
          arr.id = arr["id"].toString();
        });
        return array;
      };
      return traverse(this.departmentList, "subDivisions");
    },
  },

  watch: {
    changeDept: {
      handler(newVal) {
        if (newVal.isEdit) {
          let { departmentId } = this.editData;
          this.selectTreeValue = departmentId.toString();
          this.form = {
            ...this.editData,
            departmentId: departmentId.toString(),
          };
        } else if (newVal.modalType === "CDEPT") {
          this.selectTreeValue = this.selectedRows[0].departmentId.toString();
          this.form = {
            departmentId: this.selectedRows[0].departmentId.toString(),
          };
        } else {
          if (newVal.deptId) {
            this.form.departmentName = newVal.currentDept.name;
          }
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    ...mapMutations("sys", {
      handleHideModalMu: "HIDEMODAL",
      handleRefresh: "USERREFLESH",
      handleSetSelectedRows: "SETSELETEDROWS",
    }),
    handleCancel() {
      //取消按钮
      this.handleHideModalMu();
    },

    async getRoleListAsync() {
      try {
        let temp = [];
        let result = await getRoleList();
        if (result.code == 1) {
          temp = result.items;
          if (!this.isEdit) {
            if (temp.length > 0) {
              let roleId = null;
              temp.map((t) => {
                  console.log(t)
                if (t.name === this.$t('system.normalUser')) {
                  roleId = t.id;
                }
              });
              this.form.roleId = roleId;
            }
          }
        }
        this.roleList = temp;
      } catch (err) {
        this.$message.error(ERROR);
        throw err;
      }
    },

    async changeDeptAsync(ids) {
      try {
        this.submitLoading = true;
        let { departmentId } = this.form;
        let result = await postChangeDeptBatch({
          ids,
          departmentId: +departmentId,
        });
        if (result.code == 1) {
          this.submitLoading = false;
          this.$message.success(this.$t('system.updateDepartmentSuccess'));
          this.handleRefresh();
          this.handleSetSelectedRows({ selectedRows: [] });
          this.handleHideModalMu();
          this.$emit("handle");
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
    async editUserAsync() {
      try {
        this.submitLoading = true;
        let { id } = this.editData;
        let {
          pwd,
          email,
          departmentName,
          tel,
          name,
          roleId,
          loginId,
          departmentId,
        } = this.form;

        let result = await updateUserBasic({
          pwd,
          email,
          departmentName,
          departmentId: +departmentId,
          tel,
          name,
          loginId,
          roleId,
          id,
        });
        if (result.code == 1) {
          this.$message.success(this.$t('common.editSuccess'));
          this.$emit("handle");
          this.submitLoading = false;
          this.handleRefresh();

          this.handleHideModalMu();
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

    handleRolesChange(value) {
      let roles = [];
      if (value && value.length) {
        roles = this.roleList.filter((r) => value.includes(r.id));
      }
    },

    async addUserAsync() {
      try {
        this.submitLoading = true;
        let {
          pwd,
          email,
          departmentName,
          tel,
          name,
          loginId,
          departmentId,
          roleId,
        } = this.form;
        let result = await userAdd({
          departmentId: +departmentId || this.deptId,
          pwd,
          email,
          departmentName,
          tel,
          name,
          loginId,
          roleId,
        });
        if (result.code == 1) {
          this.$message.success(this.$t('common.addSuccess'));
          this.submitLoading = false;
          this.handleRefresh();
          this.handleHideModalMu();
          this.$emit("handle");
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
          if (this.isEdit) {
            if (this.modalType === "CDEPT") {
              let { id } = this.editData;
              this.changeDeptAsync([id]);
            } else {
              this.editUserAsync();
            }
          } else if (this.modalType == "USER") {
            this.addUserAsync();
          } else if (this.modalType === "CDEPT") {
            let selectedRows = this.selectedRows;
            let ids = [];
            let sm = selectedRows.map((s) => {
              ids.push(s.id);
            });
            this.changeDeptAsync(ids);
          }
          // if (this.modalType == "USER") {
          //   if (this.isEdit) {
          //     this.editUserAsync();
          //   } else {
          //     this.addUserAsync();
          //   }
          // }
        } else {
          return false;
        }
      });
    },
    handleModalClose() {
      //关闭按钮
      this.handleHideModalMu();
    },
    getValue(value) {
      this.selectTreeValue = value;
      this.form = { ...this.form, departmentId: value };
    },
  },
};
</script>
<style lang="less" >
@import "../../style/default.less";
</style>
