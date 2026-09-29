<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body width="35%">
    <div class="users">
      <div class="department">
        <p :title="companyName" class="icon-building1 cursor" @click="handleWholeDept"> {{ companyName }}</p>
        <div class="scrollbar">
          <Tree :is-handle="false" :departmentId.sync="departmentId" :treeData="departmentList"/>
        </div>
      </div>
      <div class="user">
        <div class="user-text">{{ $t('common.placeholder') }}</div>
        <el-input
            class="margin-center"
            v-model="items.keyword"
            @input="handleInputGetUsers"
            :placeholder="$t('labDevice.inputMember')"></el-input>
        <el-checkbox class="margin-center" :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">
            {{ $t('system.changeAll') }}</el-checkbox>
        <div class="margin-center"></div>
        <el-checkbox-group v-loading="loading" v-model="checkedCities" @change="handleCheckedCitiesChange">
          <el-row>
            <el-col class="margin-bottom" :span="12" v-for="item in users">
              <el-checkbox :label="item.id" :key="item.id">{{ item.name }}</el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>
        <pagination
            v-show="total > 10"
            :limit.sync="items.pageSize"
            :page.sync="items.pageNum"
            :layout="'prev, pager, next'"
            :total="total"
            :is-handle="false"
            @pagination="handleGetUserList()"/>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Tree from "@/views/system/components/Tree";
import {getDepartment} from "@/api/department";
import {mapMutations} from "vuex";
import {getUserList} from "@/api/user";
import {items} from "@/utils/constant";
import Pagination from "@c/Pagination";
import {arrayToHeavy, throttle} from "@/utils/methods";

export default {
  name: "SelectUsers",
  components: {
    Pagination,
    Tree
  },
  data() {
      const _this = this;
    return {
      items: {
        keyword: "",
        pageNum: items.pageNum,
        pageSize: 12
      },
      checkAll: false,
      checkedCities: [],
      isIndeterminate: true,
      total: 0,
      disabled: false,
      dialogVisible: false,
      title: _this.$t('labDevice.selectMember'),
      companyName: "",
      departmentList: [],
      departmentId: null,
      users: [],
      loading: false,
      usersAll:[]
    }
  },
  watch: {
    departmentId: {
      handler(newValue) {
        this.handleGetUserList();
      },
      deep: true
    },
    checkedCities: {
      handler(newValue) {

      }
    }
  },
  created() {
    let useInfo = JSON.parse(localStorage.getItem("USERINFO"));
    let {companyName, id} = useInfo;
    this.companyName = companyName;
  },
  methods: {
    handleInputGetUsers() {
      this.items.pageNum = 1;
      const _this = this;
      throttle( function () {
        _this.loading = true;
        _this.handleGetUserList();
      }, 200, {loading: true})();
      this.loading = false;
    },
    handleGetUserList() {
      this.users = [];
      this.loading = true;
      getUserList({
        departmentId: this.departmentId,
        pageNum: this.items.pageNum,
        keyword: this.items.keyword,
        pageSize: this.items.pageSize
      }).then(res => {
        this.loading = false;
        if (res.code) {
          this.users = res.items.list;
          this.usersAll = arrayToHeavy(this.usersAll.concat(this.users), "id");
          this.total = res.items.total;
        }
      })
    },
    handleCheckAllChange(val) {
      this.checkedCities = val ? this.usersAll : [];
      if (!val) {
        this.checkedCities = [];
      } else {
        const arr = [];
        this.users.map(item => {
          arr.push(item.id);
        })
        this.checkedCities = [...new Set(arr)];
      }
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.usersAll.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.usersAll.length;
    },
    ...mapMutations("sys", {
      handleDeptSelect: "SETLETEDEPT",
    }),
    handleSubmit() {
      const obj = this.usersAll.reduce((prev, current) => {
        prev[current.id] = current.name;
        return prev;
      }, {})
      const submitArr = [];
      this.checkedCities.map(item => {
        if (obj[item]) {
          submitArr.push({id: item, name: obj[item]});
        }
      })
      this.$emit("handle", submitArr);
      this.dialogVisible = false;
    },
    handleClose() {
      this.dialogVisible = false;

    },
    async open(list) {
      this.dialogVisible = true;
      await this.getDepartmentData();
      await this.handleGetUserList();
      if (list.length) {
        list.map(item => {
          this.checkedCities.push(item.id);
        })
      }
    },
    async getDepartmentData() {
      try {
        let temp = [];
        let result = await getDepartment();
        if (result.code == 1) {
          let items = result.items;
          if (items.list && items.list.length > 0) {
            let lists = items.list;
            temp = lists.sort(
                (a, b) => b.defaultDepartment - a.defaultDepartment
            );
            let useInfo = JSON.parse(localStorage.getItem("USERINFO"));
            let {companyName} = useInfo;
            this.handleDeptSelect({
              deptId: 0,
              currentDept: {
                name: companyName,
              },
              pid: 0,
            });
          }
        } else {
          this.$message.error(result.message);
        }
        this.departmentList = temp;
      } catch (err) {
        this.departmentList = [];
        throw err;
      }
    },
    handleWholeDept() {
      this.departmentId = null;
    },

  }
}
</script>

<style lang="less" scoped>
.margin-bottom {
  margin-bottom: 10px;
}

/deep/ .el-dialog__body {
  height: 400px;

  .users {
    height: 100%;
    display: flex;

    .department {
      overflow-y: auto;
      height: 100%;
      width: 250px;
      margin-right: 40px;
      border-right: 1px solid #F0F2FC;
    }

    .user {
      width: calc(100% - 250px);

      .user-text {
        font-size: 14px;
        color: #999999;
        font-weight: 400;
      }
    }
  }
}
</style>