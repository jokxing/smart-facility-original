<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body
      width="40%"
      custom-class="bindingDevice-modal">
    <el-form @submit.native.prevent  label-position="left" label-width="auto">
      <el-form-item :label="$t('hardware.keyword')">
        <el-input
            v-model.trim="form.keyword"
            class="select-change-p"
            clearable
            :placeholder="$t('hardware.inputNameOrNo')"
            @clear="handleClear"
            @keyup.enter.native="handleQuery">
          <el-button
              slot="append"
              class="el-button-host"
              icon="icon-search1"
              @click="handleQuery()">
          </el-button>
        </el-input>
      </el-form-item>
    </el-form>

    <el-table
        v-loading="loading"
        :data="device"
        border
        size="medium">
      <el-table-column fixed label="#" type="index" width="50px">
        <template v-slot="scope">
            <span v-if="`${form.total !== 0}`">{{
                (form.pageNum - 1) * form.pageSize + scope.$index + 1
              }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="!thingType" :label="$t('common.name')" prop="equipmentName"/>
      <el-table-column v-if="thingType" :label="$t('common.name')" prop="name"/>
      <el-table-column v-if="!thingType" :label="$t('common.no')" prop="equipmentNo"/>
      <el-table-column v-if="thingType" :label="$t('common.no')" prop="no"/>
      <el-table-column v-if="!thingType" :label="$t('hardware.association')" prop="bindList" width="200">
        <template v-slot="scope">
          <p v-for="item in scope.row.bindList" :key="item.equipmentId">
            {{ THINGTYPE[item.type] }}：{{ item.name }}
          </p>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.handle')" type="index" width="100px">
        <template v-slot="scope">
          <el-button :disabled="scope.row.isBind === 0 && !thingType" type="text" @click="handleBinding(scope.row)">{{ $t('hardware.add') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="paging">
      <pagination
          v-show="form.total > 10"
          :layout="'total, pager, jumper'"
          :limit.sync="form.pageSize"
          :page-count="5"
          :page.sync="form.pageNum"
          :total="form.total"
          @pagination="handleQuery"/>
    </div>
  </el-dialog>
</template>

<script>
import {items, THINGTYPE} from "@/utils/constant";
import Pagination from "@/components/Pagination"
import {postInstrumentThingsPreLink} from "@/api/labDevice";
import {getAlertorSearchThings} from "@/api/alertor";
import {getSignalBindDevices} from "@/api/signal";

export default {
  name: "index",
  components: {
    Pagination,
  },
  props: {
    thingType: {
      type: Boolean,
      default: false
    }
  },
  data() {
      const _this = this;
    return {
      THINGTYPE,
      title: _this.$t('common.bindDevice'),
      dialogVisible: false,
      form: {
        keyword: "",
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
        total: 0,
      },
      device: [],
      loading: false,
      type: ""
    }
  },
  methods: {
    handleQuery() {
      this.handlePreLink();
    },
    async handlePreLink() {
      this.loading = true;
      if (this.type === 3) {
        await this.handleSignalBind();
        return
      }
      if (this.thingType) {
        const res = await getAlertorSearchThings(this.form);
        this.handleResult(res);
      } else {
        const res = await postInstrumentThingsPreLink(this.form);
        this.handleResult(res);
      }
    },
    async handleSignalBind() {
      this.loading = true;
      const res = await getSignalBindDevices(this.form);
      this.handleResult(res);
    },
    handleResult(res) {
      this.loading = false;
      if (res.code) {
        this.device = res["items"] && res.items.list;
        this.form.total = (res["items"] && res.code === items.PAGE_NUM) ? res.items.total : 0;
      } else {
        this.$message.error(res.message);
      }
    },
    // 清空输入框内容时触发
    handleClear() {
      this.handlePreLink();
    },
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.form = {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
        total: 0,
        keyword: ""
      };
      this.device = [];
    },
    /**
     * @param type 1、房间；2、设备；3、信号源 ；null、单功能声光报警器
     */
    open(type) {
      if (type) {
        this.type = type;
        if (type !== 3) {
          this.handlePreLink();
        } else {
          this.handleSignalBind();
        }
      } else {
        this.handleQuery();
      }
      this.dialogVisible = !this.dialogVisible;
    },
    handleBinding(row) {
      setTimeout(() => {
        if (this.type) {
          this.handlePreLink();
        } else {
          this.handleQuery();
        }
      }, 500)
      this.$emit("handle", row);
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .bindingDevice-modal {
  .el-dialog__body {
    overflow-x: hidden;
    max-height: 560px;
  }

  .el-input {
    margin-bottom: 10px;
  }
}
</style>
