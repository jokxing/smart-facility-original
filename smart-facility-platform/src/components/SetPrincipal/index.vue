<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body
      custom-class="principal-dialog"
      width="702px">
    <el-form :model="form" label-position="left" label-width="auto">
      <el-form-item :label="$t('common.department')">
        <SelectDepartment
            :departmentId.sync="departmentId"
            :is-company="true"
            :select-tree-value.sync="departmentId"
            class="select-change-p"
            @change="handleDepartmentChange"/>
      </el-form-item>
      <el-form-item :label="$t('system.users2')">
        <el-input
            v-model="keyword"
            class="select-change-p"
            clearable
            :placeholder="$t('common.inputKeyword')"
            @input="handleDepartmentChange">
        </el-input>
      </el-form-item>
      <el-row>
        <el-checkbox-group v-model="form.userIds">
          <el-col v-for="item in personnels" :key="item.id" :lg="8" :sm="12" :xs="12" class="margin-center">
            <el-checkbox :key="item.id" :disabled="bindingUser[item.id]" :label="item.id">
              {{ item.name }}

              <!-- 个人微信的绑定状态 -->
              <i class="icon-weixin" v-if="item.isBoundWeixin" style="margin: 5px; color: green"/>
              <i class="icon-weixin" v-else style="margin: 5px; color: lightgrey"/>

              <!-- 企业微信的绑定状态 -->
              <!-- <i class="icon-enterprise-weChat" v-if="item.isBoundQyWeixin" style="color: green"/>-->
              <!-- <i class="icon-enterprise-weChat" v-else style="color: lightgrey"/>-->

            </el-checkbox>
          </el-col>
        </el-checkbox-group>
        <div v-if="!personnels.length" class="empty">{{ $t('common.notMessage1') }}</div>
      </el-row>
      <div class="paging">
        <pagination
            :layout="'total, prev, pager, next, jumper'"
            :limit.sync="pageSize"
            :page-count="5"
            :page.sync="pageNum"
            :total="total"
            @pagination="handleGetUserList"/>
      </div>
      <el-form-item class="margin-center" :label="$t('system.alarmType')">
        <el-col :span="6">
          <el-checkbox v-model="form.weixin">{{ $t('common.weixinAlarm') }}</el-checkbox>
        </el-col>
        <el-col :span="6">
          <el-checkbox v-model="form.sms">{{ $t('common.smsAlarm') }}</el-checkbox>
        </el-col>
        <el-col :span="6">
          <el-checkbox v-model="form.phone">{{ $t('common.phoneAlarm') }}</el-checkbox>
        </el-col>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  addEquipmentUser,
  addThingsConscientious,
  getEquipmentUserList,
  getThingsUserList,
  getUserList
} from "@/api/user";
import SelectDepartment from "@c/SelectdePartment";
import {updateRoomBatch} from "@/api/room";
import {postInstrumentBatchUpdate} from "@/api/labDevice";
import Pagination from "@c/Pagination/index";
import {items} from "@/utils/constant";

export default {
  name: "index",
  components: {
    Pagination,
    SelectDepartment
  },

  data() {
      const _this = this;
    return {
      title: _this.$t('common.addPrincipal'),
      dialogVisible: false,
      departmentId: null,
      personnelId: null,
      departments: [],
      form: {
        userIds: [],
        weixin: true,
        sms: false,
        phone: false,
        equipmentIds: [],
        type: "DEVICE",
        timeFlag: 1,
        receiveResumeMessageFlag: 1,
      },
      labelWidth: "80px",
      personnels: [],
      type: 0,
      keyword: "",
      pageSize: 20,
      pageNum: 1,
      total: 0,
      bindingUser: {},
      disabled: false
    }
  },
  computed: {
    // 所用员工 map，用于反显
    allPersonnelMap() {
      let ret = {};
      this.personnels.forEach((item) => {
        ret[item.id] = item;
      });
      return ret;
    },
    // 员工备选项(不包含已选)
    personnelListOptions() {
      return this.personnels.filter(
          (item) => !this.form.userIds.includes(item.id)
      );
    },
  },
  methods: {
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.departmentId = null;
      this.keyword = null;
      this.pageSize = 20;
      this.pageNum = 1;
      this.bindingUser = {};
      this.form = {
        userIds: [],
        weixin: true,
        sms: null,
        phone: null,
        equipmentIds: [],
        type: "DEVICE",
        timeFlag: 1,
        receiveResumeMessageFlag: 1,
      }
    },
    open(type, id, equipmentType = "DEVICE") {
      this.type = type;
      if (type) {
        if (Number(equipmentType) === 11 || Number(equipmentType) === 4) {
          delete this.form.equipmentIds;
          this.form.ids = id;
        } else {
          this.form.thingsId = id;
          this.form.equipmentIds = id;
        }
      } else {
        this.bindingUser = {};
        if (Number(equipmentType) === 11 || Number(equipmentType) === 4) {
          delete this.form.equipmentIds;
          this.form.thingsId = id;
          getThingsUserList({
            pageSize: 1000,
            pageNum: 1,
            thingId: id
          }).then(res => {
            this.handleBindingUser(res);
          })
        } else {
          const index = id ? id : 0;
          this.form.equipmentIds.push(index);
          getEquipmentUserList({
            pageNum: 1,
            pageSize: 1000,
            equipmentId: id,
            equipmentType: equipmentType,
          }).then(res => {
            this.handleBindingUser(res);
          })
        }
      }
      this.form.type = equipmentType;
      this.dialogVisible = !this.dialogVisible;
      this.handleGetUserList();
    },
    handleBindingUser(res) {
      if (res.code) {
        res.items.list.map(item => {
          this.bindingUser[item.userId] = true;
          this.form.userIds.push(item.userId);
        })
      } else {
        this.$message.error(res.message);
      }
    },
    handleGetUserList() {
      this.personnels = [];
      getUserList({
        departmentId: this.departmentId,
        pageNum: this.pageNum,
        keyword: this.keyword,
        pageSize: this.pageSize
      }).then(res => {
        this.personnels = res.items.list;
        if (res.items.pageNum === items.PAGE_NUM) {
          this.total = res.items.total;
        }
      })
    },
    async handleSubmit() {
      // console.log(this.bindingUser)
      // console.log(this.form.userIds)
      if (this.form.userIds.length === 0) {
        return this.$message.error(this.$t('hardware.selectUsers'));
      }
      const itemObj = JSON.parse(JSON.stringify(this.form));
      itemObj.sms = itemObj.sms ? 0 : -1;
      itemObj.phone = itemObj.phone ? 0 : -1;
      itemObj.weixin = itemObj.weixin ? 0 : -1;
      this.disabled = true;

      var userIds = [];
      if(this.bindingUser){
        for(var i = 0; i < this.form.userIds.length; i++){
          if(!this.bindingUser[this.form.userIds[i]]){
            userIds.push(this.form.userIds[i])
          }
        }
        itemObj.userIds = userIds;
      }
      try {
        let res;
        if (itemObj.type === 11 || itemObj.type === 4) {
          if (this.type) {
            if (this.form.type === 11) {
              const obj = JSON.parse(JSON.stringify(itemObj));
              const ids = obj.ids;
              delete obj.ids;
              res = await updateRoomBatch({
                ids,
                conscientiousUser: obj
              });
              this.handleMessage(res);
            }
            if (itemObj.type === 4) {
              let ids = [];
              for (let i = 0; i < itemObj.ids.length; i++) {
                ids.push(itemObj.ids[i].id)
              }
              const obj = JSON.parse(JSON.stringify(itemObj));
              delete obj.ids;
              res = await postInstrumentBatchUpdate({
                ids,
                conscientiousUser: obj
              });
              this.handleMessage(res);
            }
          } else {
            res = await addThingsConscientious(itemObj);
            this.handleMessage(res);
          }
        } else {
          if(itemObj === 'GUN'){
              itemObj['types'] = 1
          }
          res = await addEquipmentUser(itemObj);
          this.handleMessage(res);
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(this.$t('common.networkError'));
      }
    },
    handleMessage(res) {
      this.disabled = false;
      if (res.code) {
        this.$message.success(this.$t('hardware.exportTitle'));
        this.$emit("handle");
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    },
    handleDepartmentChange() {
      this.pageSize = 20;
      this.pageNum = 1;
      this.handleGetUserList();
    },
    handlePersonnelChange(val) {
      this.form.userIds.push(val);
      this.form.userIds = [...new Set(this.form.userIds)]; // 去重
      this.personnelId = "";
    },
  }
}
</script>
<style lang="less" scoped>
.empty {
  height: 40px;
  line-height: 40px;
  text-align: center;
}
</style>
