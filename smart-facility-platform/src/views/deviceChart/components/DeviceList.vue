<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body
      width="750px"
  >
    <div class="label-modal">
      <el-input
          v-model.trim="items.keyword"
          clearable
          style="width: 400px;"
          :placeholder="$t('common.inputKeyword')"
          @keyup.enter.native="handleQuery()">
        <el-select
            style="width: 120px;"
            v-model="items.equipmentType"
            @change="handleQuery"
            slot="prepend" :placeholder="$t('common.placeholder')">
          <el-option :label="$t('hardware.device1')" :value="0"></el-option>
          <el-option :label="$t('route.smartSocket')" :value="10"></el-option>
        </el-select>
        <el-button
            slot="append"
            class="el-button-host"
            icon="icon-search1"
            @click="handleQuery()">
        </el-button>
      </el-input>
      <div class="margin-center">{{ $t('common.multipleSelection') }}
        <el-button type="text">{{ multipleSelection.length }}</el-button>
          {{ $t('statistics.deviceNum') }}
      </div>
      <el-table
          :data="list"
          v-loading="loading"
          :row-key="getRowKey"
          ref="multipleTable"
          max-height="350"
          border
          @selection-change="handleSelectionChange"
      >
        <el-table-column
            :reserve-selection="true"
            type="selection"
            width="55">
        </el-table-column>
        <el-table-column :label="$t('common.name')" min-width="130" prop="name">
        </el-table-column>
        <el-table-column :label="$t('labDevice.labDeviceNo')" min-width="120" prop="no">
        </el-table-column>
        <el-table-column :label="$t('common.owningDepartment')" min-width="120" prop="departmentName"/>
        <el-table-column :label="$t('common.creatDate')" width="170" prop="createDate"/>
      </el-table>
    </div>
    <div class="paging">
      <pagination
          v-show="total > 10"
          :layout="'total, prev,pager, next, jumper,sizes'"
          :limit.sync="items.pageSize"
          :page-count="5"
          :page.sync="items.pageNum"
          :total="total"
          @pagination="handleDeviceList"/>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('hardware.add') }}</el-button>
    </span>
    <el-dialog
        :visible.sync="isList"
        :title="$t('statistics.addTo')"
        :close-on-click-modal="false"
        append-to-body
        width="300px"
        :top="'30vh'"
    >
      <el-autocomplete
          class="inline-input"
          v-model="state"
          value-key="name"
          :fetch-suggestions="querySearch"
          :placeholder="$t('common.inputComment')"
          @select="handleSelect"
      ></el-autocomplete>
      <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleCloseRepertoire">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary"
                 @click="handleSubmitRepertoire()">{{ $t('hardware.add') }}</el-button>
    </span>
    </el-dialog>

  </el-dialog>
</template>

<script>
import {getDeviceList, getEquipmentSortList} from "@/api/device";
import Pagination from "@c/Pagination";
import {postRepertoireAdd} from "@/api/statistic";
import {arrayToHeavy} from "@/utils/methods";

export default {
  name: "DeviceList",
  components: {
    Pagination,
  },
  data() {
      const _this = this;
    return {
      isList: false,
      loading: false,
      dialogVisible: false,
      list: [],
      title: _this.$t('statistics.deviceList'),
      multipleSelection: [],
      disabled: false,
      items: {
        "departmentId": 0,
        "equipmentType": 0,
        "deviceType": 0,
        "keyword": "",
        "pageNum": 1,
        "pageSize": 10,
      },
      total: 0,
      state: "",
      restaurants: [],
      submitList: [], //提交记录仪array
      cacheList: [], // 缓存列表记录仪数据
      deviceTypeList: [],
    }
  },
  watch: {
    multipleSelection: function (value) {
      this.multiSelect = Boolean(value.length);
    },
  },
  methods: {
    handleSubmitRepertoire() {
      postRepertoireAdd({
        listName: this.state,
        deviceList: this.submitList
      }).then(res => {
        if (res.code) {
          this.$message.success(this.$t('hardware.exportTitle'));
          this.handleCloseRepertoire();
          this.handleClose();
          this.$emit("handle");
        } else {
          this.$message.error(res.message);
        }
      }).catch(e => {
        this.$message.error(e)
      })
    },
    handleCloseRepertoire() {
      this.isList = false;
      this.state = "";
      this.submitList = [];
    },
    querySearch(queryString, cb) {
      const restaurants = this.restaurants;
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.name.toLowerCase().indexOf(queryString.toLowerCase()) !== -1);
      };
    },
    handleSelect(item) {
      console.log(item)
    },
    handleSubmit() {
      if (!this.multipleSelection.length) {
        return this.$message.error(this.$t('statistics.changeDevice'));
      }
      this.isList = true;
      this.multipleSelection.map(item => {
        this.cacheList.map(device => {
          if (item == device.id) {
            return this.submitList.push({
              equipmentId: device.id,
              equipmentType: device.productId,
              equipmentNo: device.no
            })
          }
        })
      })
    },
    getRowKey(row) {
      return row.id;
    },
    handleClose() {
      this.dialogVisible = false;
      this.list = [];
      this.cacheList = [];
      this.multipleSelection = [];
      this.$refs.multipleTable.clearSelection();
      this.items = {
        "departmentId": 0,
        "equipmentType": 0,
        "keyword": "",
        "pageNum": 1,
        "pageSize": 10,
      };
      this.total = 0;
    },
    handleSelectionChange(val) {
      this.multipleSelection = [];
      val.map(item => {
        this.multipleSelection.push(item.id);
      })
    },
    handleQuery() {
      this.items.pageNum = 1;
      this.items.pageSize = 10;
      this.$refs.multipleTable.clearSelection();
      this.handleDeviceList();
    },
    handleDeviceList() {
      this.loading = true;
      getDeviceList(this.items).then(res => {
        this.loading = false;
        if (res.code) {
          this.list = res.items.list;
          if (res.items.pageNum == 1) {
            this.total = res.items.total;
          }
          this.cacheList = arrayToHeavy(this.cacheList.concat(this.list), "no");
        } else {
          this.$message.error(res.message);
        }
      }).catch(e => {
        this.loading = false;
      })
    },
    open(list) {
      this.dialogVisible = true;
      this.restaurants = list;
      this.handleDeviceList();
    }
  }
}
</script>

<style lang="less" scoped>
.paging {
  margin-top: 30px;
}
</style>