<template>
  <div class="page systemPage">
    <div class="page-header"></div>
    <div class="page-content page-content-left">
      <div class="systemPage_left">
        <div class="affix bottom btn-group">
          <el-button
            type="primary"
            icon="el-icon-plus"
            class="btn-default btn-default-block"
            @click="handleShowModal('新增角色', 'ROLE')"
            >新建角色</el-button
          >
        </div>
        <el-scrollbar style="height: 100%">
          <div class="roleList">
            <template v-if="roleList.length && roleList.length > 0">
              <div
                class="roleList-item"
                v-for="item in roleList"
                :class="item.id === roleActive ? 'active' : ''"
                :key="item.id"
                @click="handleRoleItemClick(item)"
              >
                <div class="content">
                  <i class="icon el-icon-user"></i>
                  <span class="">{{ item.name }}</span>
                </div>

                <div class="handleIcon"></div>
              </div>
            </template>
            <div v-else class="roleList_empty">暂无数据</div>
          </div>
        </el-scrollbar>
      </div>
      <div class="systemPage_right">
        <div class="systemPage_right_header">
          <span class="title">{{ currentRole.name || "角色名称" }}</span>
        </div>
        <div class="systemPage_right_content">
          <el-scrollbar style="height: 100%">
            <el-form :model="form" class="form-default">
              <div class="permission permission-data">
                <div class="title">数据权限范围</div>

                <div
                  class="flexBox permissionItem"
                  v-for="(domain, index) in form.formList"
                  :key="domain.key"
                >
                  <el-form-item
                    label=""
                    :prop="'formList.' + index + '.value'"
                    :key="domain.key"
                    label-width="0px"
                    :rules="{
                      required: true,
                      message: '部门不能为空',
                      trigger: 'blur',
                    }"
                  >
                    <!-- <el-select v-model="domain.value" placeholder="请选择部门">
                      <el-option v-for="" :key=""></el-option>
                    </el-select> -->

                    <el-input v-model="domain.value"></el-input>
                  </el-form-item>
                  <el-form-item
                    label=""
                    prop="permission"
                    label-width="0px"
                    class="gap-default-left"
                  >
                    <el-radio-group v-model="domain.permission">
                      <el-radio
                        v-for="item in permissionList"
                        :key="item.value"
                        :label="item.value"
                        >{{ item.label }}</el-radio
                      >
                    </el-radio-group>
                  </el-form-item>
                  <div class="icon-group">
                    <i
                      @click.prevent="addDomain(domain)"
                      class="addIcon el-icon-circle-plus-outline"
                    ></i>
                    <i
                      @click.prevent="removeDomain(domain)"
                      class="deleteIcon el-icon-delete"
                      v-if="index >= 1"
                    ></i>
                  </div>
                </div>
              </div>
              <div class="permission permission-other">
                <div class="title">其他权限设置</div>
                <div class="content">
                  <el-form-item label="中控地图" prop="cmap">
                    <el-radio-group v-model="form.cmap">
                      <el-radio
                        v-for="item in permissionList"
                        :key="item.value"
                        :label="item.value"
                        >{{ item.label }}</el-radio
                      >
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="数据统计" prop="statistics">
                    <el-radio-group v-model="form.statistics">
                      <el-radio
                        v-for="item in permissionList"
                        :key="item.value"
                        :label="item.value"
                        >{{ item.label }}</el-radio
                      >
                    </el-radio-group>
                  </el-form-item>
                </div>
              </div>
            </el-form>
          </el-scrollbar>
        </div>
        <div class="systemPage_right_footer">
          <div class="btn-group">
            <el-button type="primary" class="btn-default btn-default-block"
              >保存设置</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getRoleList } from "@/api/system";
import { getDepartment } from "@/api/department";
export default {
  data() {
    return {
      permissionList: [
        {
          label: "编辑与预览",
          value: 1,
        },
        {
          label: "仅预览",
          value: 2,
        },
      ],
      roleActive: "",
      form: {
        formList: [
          {
            value: "",
            permission: 1,
          },
        ],
        cmap: 1,
        statistics: 1,
      },
      roleList: [],
      currentRole: {},
    };
  },
  created() {
    this.getRoleListAsync();
  },
  methods: {
    async getDepartmentAsync() {

    },

    async getRoleListAsync() {
      try {
        let temp = [];
        let result = await getRoleList();
        if (result.code == 1) {
          temp = result.items;
          if (temp.length && temp.length > 0) {
            this.currentRole = temp[0];
            this.roleActive = temp[0].id;
          }
        } else {
          this.$message.error(result.message);
        }
        this.roleList = temp;
      } catch (err) {
        this.roleList = [];
        this.$message.error("获取角色列表失败");
      }
    },

    handleRoleItemClick(row) {
      this.roleActive = row.id;
      this.currentRole = row;
    },
    removeDomain(item) {
      var index = this.form.formList.indexOf(item);
      if (index !== -1) {
        this.form.formList.splice(index, 1);
      }
    },
    addDomain() {
      this.form.formList.push({
        value: "",
        key: Date.now(),
        permission: 1,
      });
    },
  },
};
</script>

<style lang="less">
@import "./index.less";
</style>
<style lang="less" scoped>
@import "../../style/default.less";
.roleList {
  .roleList-item {
    height: 45px;
    line-height: 45px;
    font-size: 16px;
    padding: 0 40px 0 20px;
    margin: 5px 0;
    border-radius: 3px;
    cursor: pointer;
    position: relative;
    &:hover {
      background-color: #f5f7fa;
    }
    &.active {
      background-color: #dae0e9;
      color: #00c1de;
      &::after {
        display: block;
        content: "";
        width: 4px;
        background-color: #00c1de;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 1px;
        border-radius: 3px;
      }
      .content {
        .icon {
          color: #00c1de;
        }
      }
    }
    .content {
      .icon {
        margin-right: 5px;
      }
    }
  }
  .roleList_empty {
    height: 45px;
    line-height: 45px;
    text-align: center;
  }
}
.permission {
  .title {
    height: 40px;
    line-height: 40px;
    font-weight: 600;
  }
  &.permission-data {
    .permissionItem {
      background-color: #ecf2f1;
      border-radius: 3px;
      padding: 17px 20px 0;
      margin-bottom: 20px;
      position: relative;
      &:last-child {
        margin: 0;
      }
      .icon-group {
        width: 80px;
        height: 40px;
        position: absolute;
        top: 50%;
        margin-top: -20px;
        right: 20px;
        i {
          display: block;
          float: right;
          width: 40px;
          line-height: 40px;
          text-align: center;
          cursor: pointer;
          &.addIcon {
            color: #409eff;
          }
          &.deleteIcon {
            color: #ff4d4f;
          }
        }
      }
    }
  }
  &.permission-other {
    .content {
      padding: 0 20px;
    }
  }
}

.form-default {
  padding: 20px 20px;
  /deep/.el-form-item__label {
    color: #252629;
    font-weight: 600;
    line-height: 40px;
  }
  /deep/.el-form-item__content {
    line-height: 40px;
  }

  .el-select {
    width: 200px;
    height: 40px;
    .el-input__inner {
      height: 40px;
      line-height: 40px;
    }
  }
  .el-input {
    width: 200px;
    /deep/.el-input__inner {
      height: 40px;
      line-height: 40px;
    }
  }
  .el-radio {
    /deep/.el-radio__inner {
      width: 20px;
      height: 20px;
    }
  }
  .input-block {
    .el-input {
      width: 100%;
    }
  }
  .el-input-number {
    width: 200px;
    line-height: 40px;
    .el-input-number__decrease,
    .el-input-number__increase {
      height: 38px;
    }
  }
}
</style>
