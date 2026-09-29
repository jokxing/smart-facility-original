<template>
  <transition appear name="overturn">
    <div class="message-notification" ref="message">
      <div class="trigon"></div>
      <div class="tags">
        <div
          v-for="(item,index) in tab"
          :key="item.label"
          :class="{ 'is-active': items.types === item.label }"
          @click="handleTab(item.label)">
          {{ item.text + "(" + statisticalVO[item.prop] + ")" }}
        </div>
      </div>
      <div class="clearfix" v-if="items.types === 3">
        <div class="flex">
          <el-select class="w200" @change="handleQuery" v-model="status">
            <el-option :value="3" :label="$t('hardware.allType')"></el-option>
            <el-option :value="1" :label="$t('hardware.checked')"></el-option>
            <el-option :value="0" :label="$t('hardware.notVerified')"></el-option>
          </el-select>
          <el-input
            class="w250"
            v-model.trim="keyword"
            @change="handleQuery"
            @input="handleQuery"
            suffix-icon="icon-search1"
            :placeholder="$t('room.inputNameOrNo')"></el-input>
        </div>
        <el-button type="text" @click="$refs.ProcessingRecord.open()">{{ $t('labDevice.disposeLog') }} ></el-button>
      </div>
      <ul class="content-asset" :class="items.types === 3 ? 'h350': ''" v-if="list.length" v-loading="loading">
        <li class="list cursor" v-for="(item,index) in list" :key="index"
            @click="handleShowInstallConfirm(item)">
          <div class="clearfix">
            <div>
              {{ item.title }}
              <span :class="item.read ? '' : 'abnormal'">（{{ item.read ? $t('hardware.read') : $t('hardware.notRead') }}）</span>
            </div>
            <span v-if="items.types === 3" :class="item.checkType ? '' : 'abnormal'">（{{ item.checkType ? $t('hardware.checked') : $t('hardware.notVerified') }}）</span>
          </div>
          <div class="list-massage">
            <div>{{ item.content }}</div>
            <div class="list-message" v-if="items.types === 3">{{ item.createDate }}</div>
            <div class="list-message" v-else>{{ dateFormat(item.sendDate) }}</div>
          </div>
        </li>
      </ul>
      <el-empty v-else :description="$t('common.notMessage')" v-loading="loading"></el-empty>
      <div class="paging">
        <pagination
          v-show="total"
          :limit.sync="items.pageSize"
          :page.sync="items.currentPage"
          :total="total"
          :layout="'prev, pager, next'"
          :pageCount="5"
          :is-but="false"
          @pagination="handleGetList"/>
      </div>
      <install-confirm ref="installConfirm"/>
      <processing-record @close="$emit('close', 1, true)" ref="ProcessingRecord"/>
      <position-adjustment @close="$emit('close', 1,true)" ref="PositionAdjustment"/>
    </div>
  </transition>
</template>

<script>
import {
  getNotifyMessageQuery,
  getNotifyMessageRead,
  getPropertyNoReadCount,
  getPropertyUnusualMsg, getPropertyUnusualMsgRead
} from "@/api/activiti";
import moment from "moment";
import {TIME_FORMAT} from "@/utils/constant";
import InstallConfirm from "@/views/assetProcess/components/InstallConfirm";
import Pagination from "@c/Pagination";
import ProcessingRecord from "@/components/MessageNotification/ProcessingRecord";
import PositionAdjustment from "@c/MessageNotification/PositionAdjustment";

export default {
  name: "MessageNotification",
  components: {
    PositionAdjustment,
    ProcessingRecord,
    InstallConfirm,
    Pagination,

  },
  data() {
      const _this = this;
    return {
      tab: [
        {
          label: 1,
          text: _this.$t('hardware.propertyCount'),
          prop: "propertyCount"
        },
        {
          label: 3,
          text: _this.$t('hardware.propertyNoReadCount'),
          prop: "propertyNoReadCount"
        },
        {
          label: 0,
          text: _this.$t('hardware.alarmCount'),
          prop: "alarmCount"
        },
        {
          label: 2,
          text: _this.$t('hardware.sysCount'),
          prop: "sysCount"
        },
      ],
      active: 0,
      list: [],
      keyword: "",
      status: 3,
      items: {
        currentPage: 1,
        pageSize: 10,
        read: null,
        sorter: "",
        types: 1
      },
      statisticalVO: {
        alarmCount: 0,
        propertyCount: 0,
        propertyNoReadCount: 0,
        sysCount: 0
      },
      loading: false,
      total: 0
    }
  },
  mounted() {
    this.handleGetNotifyList();
    this.handleGetPropertyNoReadCount();
  },
  computed: {
    dateFormat() {
      return function (value) {
        return moment(value).format(TIME_FORMAT);
      }
    },
  },
  methods: {
    handleGetList() {
      if (this.items.types === 3) {
        this.handlePropertyUnusual();
      } else {
        this.handleGetNotifyList();
      }
    },
    handleTab(index) {
      if (this.loading) {
        return
      }
      this.items.types = index;
      this.items.currentPage = 1;
      this.total = 0;
      if (index === 3) {
        this.handlePropertyUnusual();
      } else {
        this.handleGetNotifyList();
      }
    },
    handleGetPropertyNoReadCount() {
      getPropertyNoReadCount().then(res => {
        if (res.code) {
          this.statisticalVO.propertyNoReadCount = res.items;
        }
      })
    },
    handlePropertyUnusual() {
      this.list = [];
      this.loading = true;
      getPropertyUnusualMsg({
        keyword: this.keyword,
        pageSize: this.items.pageSize,
        pageNum: this.items.currentPage,
        status: this.status === 3 ? null : this.status
      }).then(res => {
        this.loading = false;
        if (res.code) {
          this.list = res.items.list;
          this.total = res.items.total;
        }
      })
    },
    handleQuery() {
      this.items.pageSize = 10;
      this.items.currentPage = 1;
      this.handlePropertyUnusual()
    },
    handleGetNotifyList() {
      this.loading = true;
      getNotifyMessageQuery(this.items).then(res => {
        this.loading = false;
        if (res.code == 1) {
          this.isList = true;
          this.list = res.items.list;
          this.total = res.items.total;
          this.statisticalVO.alarmCount = res.items.statisticalVO.alarmCount;
          this.statisticalVO.propertyCount = res.items.statisticalVO.propertyCount;
          this.statisticalVO.sysCount = res.items.statisticalVO.sysCount;
        } else {
        }
      }).catch(e => {
        this.loading = false;
      })
    },
    handleShowInstallConfirm(item) {
      if (this.items.types === 3) {
        if (!item.read) {
          getPropertyUnusualMsgRead({
            msgIdList: [item.id],
            remark: ""
          }).then(res => {
            this.handleGetPropertyNoReadCount();
            this.handlePropertyUnusual();
          })
        }
        if (!item.checkType) {
          this.$refs.PositionAdjustment.open(item.id)
        }
        return
      }
      getNotifyMessageRead({
        id: item.id
      }).then(res => {
        if (res.code) {
          this.handleGetNotifyList();
        }
      });
      if (this.items.types == 1) {
        if (item.subType === 0) {
          this.$refs.installConfirm.open(item.sourceId);
        }
        if (item.subType === 1) {
          this.$router.push("/ld/assetCount");
        }
      }
    }
  },
}
</script>

<style lang="less" scoped>
@import "../../components/Schedule/popover";

.tags {
  height: 50px;

}

.list-message {
  width: 180px;
  margin-left: 10px;
}

.paging {
  margin-top: 10px;
}

.w250 {
  width: 200px;
}

.w200 {
  width: 150px;
  margin-right: 10px;
}

.h350 {
  height: 330px !important;
}
</style>
