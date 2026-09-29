<template>
  <div class="session room-report">
    <el-tabs v-model="activeName" @tab-click="handleCutReport">
      <el-tab-pane :label="$t('room.checkHistoryLog')" name="first">
        <div>
          <div class="search-bar-container">
            <div>
              <el-date-picker
                  v-model="value2"
                  :picker-options="pickerOptions"
                  align="right"
                  class="margin-small-right"
                  :end-placeholder="$t('common.endDate')"
                  :range-separator="$t('common.most')"
                  :start-placeholder="$t('common.startDate')"
                  type="daterange"
                  unlink-panels
                  @change="handleQuery">
              </el-date-picker>
              <el-input
                  v-model.trim="items.keyword"
                  class="input-with-select"
                  clearable
                  :placeholder="$t('common.inputKeyword')"
                  @keyup.enter.native="handleQuery()">
                <el-button
                    slot="append"
                    class="el-button-host"
                    icon="icon-search1"
                    @click="handleQuery()">
                </el-button>
              </el-input>
            </div>
            <div>
              <!--              <el-button>导出</el-button>-->
            </div>
          </div>
        </div>
        <el-table
            v-loading="loading"
            :data="roomReport"
            border
            size="medium">
          <el-table-column fixed label="#" width="70px" type="index">
            <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
            </template>
          </el-table-column>
          <el-table-column fixed :label="$t('room.reportName')" min-width="130">
            <template v-slot="scope">
              <a @click="handlePreviewReport(scope.row)">{{ scope.row.name }}</a>
            </template>
          </el-table-column>
          <el-table-column :label="$t('room.reportNo')" min-width="150" prop="reportNo"/>
          <el-table-column :label="$t('room.checkUserName')" min-width="110" prop="checkUserName"/>
          <el-table-column :label="$t('room.checkDate')" min-width="160" prop="checkDate"/>
          <el-table-column :label="$t('room.reportClass')" prop="level" min-width="90">
            <template v-slot="scope">
              <span>{{ scope.row.level | levelFilter }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.owningRoom')" min-width="170" prop="roomName"/>
          <el-table-column fixed="right" :label="$t('common.handle')" min-width="100">
            <template v-slot="scope">
              <el-button type="text" @click="handleEditRoomReport(scope.row)">{{ $t('common.edit') }}</el-button>
              <el-button type="text" class="abnormal" @click="handleRemoveReport(scope.row)">{{ $t('common.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="paging">
          <pagination
              v-show="total > 10"
              :limit.sync="items.pageSize"
              :page.sync="items.pageNum"
              :total="total"
              @pagination="handleQuery"/>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('room.template')" name="second">
        <transition name="slide-fade">
          <div v-if="show">
            <div class="search-bar-container">
              <div>
                <el-input
                    v-model.trim="items.keyword"
                    class="input-with-select"
                    clearable
                    :placeholder="$t('common.inputKeyword')"
                    @keyup.enter.native="handleQuery()">
                  <el-button
                      slot="append"
                      class="el-button-host"
                      icon="icon-search1"
                      @click="handleQuery()">
                  </el-button>
                </el-input>
              </div>
              <div>
                <el-button class="icon-addto" type="primary" @click="handleAddReport">
                    {{ $t('room.addTemplate1') }}
                </el-button>
              </div>
            </div>
            <el-table
                v-loading="loading"
                :data="roomReport"
                border
                size="medium">
              <el-table-column fixed label="#" width="70px" type="index">
                <template v-slot="scope">
                  <span v-if="`${total !== 0}`">{{
                      (items.pageNum - 1) * items.pageSize + scope.$index + 1
                    }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('room.templateName1')" prop="name"></el-table-column>
              <el-table-column :label="$t('common.createName')" prop="createUserName"/>
              <el-table-column :label="$t('common.creatDate')" prop="createDate">
                  <template v-slot="{row}">
                      {{ row.createDate | localToUtc }}
                  </template>
              </el-table-column>
              <el-table-column :label="$t('common.remark')" prop="remark"/>
              <el-table-column :label="$t('common.handle')" min-width="150">
                <template v-slot="scope">
                  <el-button type="text" @click="handleCallBackFunction(scope.row, 1)">{{ $t('common.edit') }}</el-button>
                  <el-button type="text" class="abnormal" @click="handleDeleteReport(scope.row.id)">{{ $t('common.delete') }}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="paging">
              <pagination
                  v-show="total > 10"
                  :limit.sync="items.pageSize"
                  :page.sync="items.pageNum"
                  :total="total"
                  @pagination="handleQuery"/>
            </div>
          </div>
          <div v-else>
            <el-row justify="end" type="flex">
              <el-button @click="show = !show">{{ $t('room.goBackEdit') }}</el-button>
              <!--              <el-button>导入报告模板</el-button>-->
            </el-row>
            <el-row justify="center" type="flex">
              <el-col :span="11.5">
                <el-form class="clearfix" label-position="left" label-width="auto">
                  <el-form-item class="margin-small-right" :label="$t('room.templateName1')">
                    <el-input v-model="checkItem.templateName"/>
                  </el-form-item>
                  <el-form-item :label="$t('common.remark')">
                    <el-input v-model="checkItem.remark"/>
                  </el-form-item>
                </el-form>
              </el-col>
            </el-row>
            <el-row justify="center" type="flex">
              <el-col :span="11.5">
                <el-table
                    :data="checkItem.itemList"
                    class="margin-center"
                    border
                    size="medium"
                >
                  <el-table-column label="#" type="index" width="150px"/>
                  <el-table-column :label="$t('room.checkItem1')" prop="index" width="500">
                    <template v-slot="scope">
                      <el-input v-model="scope.row.name"/>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('common.handle')" min-width="150">
                    <template v-slot="scope">
                      <el-button v-if="scope.$index === checkItem.itemList.length - 1" type="text" @click="handleAddReportItems">
                          {{ $t('hardware.add') }}</el-button>
                      <el-button class="abnormal" type="text" @click="handleDeleteReportItems(scope.$index)">{{ $t('common.delete') }}</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
            <el-row class="margin-center" justify="center" type="flex">
              <el-button
                  class="input-with-select"
                  type="primary"
                  @click="handleSaveReportTemplate">
                  {{ $t('room.saveTemplate') }}
              </el-button>
            </el-row>
          </div>
        </transition>
      </el-tab-pane>
    </el-tabs>
    <Create ref="Create" @handle="handleCallBackFunction"/>
    <div v-if="reportDrawer">
      <ReportEdit :is-drawer.sync="reportDrawer" :preview="isPreview" :row.sync="reportObject" @handle="handleQuery"/>
    </div>
  </div>
</template>

<script>
import {items, TIME_FORMAT} from "@/utils/constant"
import {
  addReportTemplateItem,
  deleteReportTemplate,
  getReportTemplateList,
  getReportTemplateObtainItem,
  getRoomReportList, removeReportRoomReport, updateReportTemplateEditItem
} from "@/api/room";
import ReportEdit from "@/views/room/components/ReportEdit";
import Create from "@/views/roomReport/components/Create";
import Pagination from "@/components/Pagination/index";
import moment from "moment"

export default {
  name: "RoomReport",
  components: {
    Create,
    Pagination,
    ReportEdit
  },
  data() {
      const _this = this;
    return {
      reportDrawer: false,
      reportObject: {},
      activeName: "first",
      value2: "",
      show: true,
      items: {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE,
        keyword: null,
        endDate: "",
        startDate: ""
      },
      total: 0,
      checkItem: {
        templateId: "",
        templateName: "",
        remark: "",
        itemList: [
          {name: ""},
          {name: ""}
        ]
      },
      isPreview: false,
      editTemplateName: false,
      reportIndex: null,
      loading: false,
      roomReport: [],
      pickerOptions: {
        shortcuts: [{
          text: _this.$t('common.recentlyWeek'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: _this.$t('common.recentlyMonth'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: _this.$t('common.recentlyThreeMonth'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      }
    }
  },
  created() {
    this.handleCutReport();
  },
  methods: {
    handleEditRoomReport(row) {
      this.reportDrawer = true;
      this.reportObject = row;
      this.isPreview = false;
    },
    handleRemoveReport(row) {
      this.$confirm(this.$t('room.deleteCheckMessage'), this.$t('room.deleteCheckHint'), {
        type: "warning",
        cancelButtonText: this.$t('common.cancel'),
        confirmButtonText: this.$t('common.confirm')
      }).then(() => {
        removeReportRoomReport({id: row.id}).then(res => {
          if (res.code) {
            this.$message.success(this.$t('common.deleteSuccess'));
            this.handleQuery();
          } else {
            this.$message.error(res.message);
          }
        })
      }).catch(() => {
        this.$message.info(this.$t('common.cancelHandle'))
      })
    },
    handleDeleteReport(templateId) {
      this.$confirm(this.$t('room.deleteTemplateMessage'), this.$t('room.deleteTemplate'), {
        type: "warning",
          cancelButtonText: this.$t('common.cancel'),
          confirmButtonText: this.$t('common.confirm')
      }).then(() => {
        deleteReportTemplate({templateId}).then(res => {
          if (res.code) {
            this.$message.success(this.$t('common.deleteSuccess'));
            this.handleCutReport();
          } else {
            this.$message.error(res.message);
          }
        })
      }).catch(() => {
        this.$message.info(this.$t('common.cancelHandle'));
      })
    },
    handleEditMessage(res, title) {
      if (res.code) {
        this.$message.success(title);
        this.checkItem = {
          templateId: "",
          templateName: "",
          remark: "",
          itemList: [
            {name: ""},
            {name: ""}
          ]
        }
        this.show = true;
        this.handleCutReport();
      } else {
        this.$message.error(res.message);
      }
    },
    handleSaveReportTemplate() {
      let object = {
        templateId: this.checkItem.templateId,
        templateName: this.checkItem.templateName,
        remark: this.checkItem.remark,
        itemList: []
      };
      if (this.reportIndex) {
        this.checkItem.itemList.map(item => {
          if (item.name) {
            object.itemList.push({itemId: item.itemId, itemName: item.name});
          }
        });
      } else {
        this.checkItem.itemList.map(item => {
          if (item.name) {
            object.itemList.push(item);
          }
        });
      }
      if (!object.itemList.length) {
        return this.$message.error(this.$t('room.itemList'));
      } else {
        if (this.reportIndex) {
          updateReportTemplateEditItem(object).then(res => {
            this.handleEditMessage(res, this.$t('room.editSuccess'));
          })
        } else {
          addReportTemplateItem(object).then(res => {
            this.handleEditMessage(res, this.$t('room.addSuccess'));
          })
        }
      }
    },
    handleDeleteReportItems(index) {
      if (this.checkItem.itemList.length === 1) {
        return alert(this.$t('room.notDelete'));
      }
      this.checkItem.itemList.splice(index, 1);
    },
    handleCallBackFunction(val, index) {
      this.show = false;
      this.reportIndex = index;
      this.checkItem.templateId = val.id;
      this.checkItem.templateName = val.name;
      this.checkItem.remark = val.remark;
      if (index) {
        getReportTemplateObtainItem({
          templateId: Number(val.id)
        }).then(res => {
          if (res.code) {
            this.checkItem.itemList = [];
            res.items.itemList.map(item => {
              this.checkItem.itemList.push({itemId: item.itemId, name: item.itemName})
            })
            if (!this.checkItem.itemList.length) {
              this.checkItem.itemList = [{name: ""}]
            }
          }
        })
      }
    },
    handleAddReportItems() {
      this.checkItem.itemList.push({name: ""});
    },
    handleAddReport() {
      this.$refs.Create.open();
    },
    handleQuery() {
      if (this.activeName === "first") {
        this.handleGetRoomReportList();
      } else {
        this.handleGetReportTemplateList();
      }
    },
    handleCutReport() {
      this.show = true;
      this.loading = true;
      this.roomReport = [];
      this.items = {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE,
        keyword: null,
        endDate: "",
        startDate: ""
      }
      if (this.activeName === "first") {
        this.handleGetRoomReportList();
      } else {
        this.handleGetReportTemplateList();
      }
    },
    handleGetReportTemplateList() {
      getReportTemplateList({
        keyword: this.items.keyword,
        pageSize: this.items.pageSize,
        pageNum: this.items.pageNum
      }).then(res => {
        if (res.code) {
          this.roomReport = res.items.list;
          if (res.items.pageNum === items.PAGE_NUM) {
            this.total = res.items.total
          }
        } else {
          this.$message.error(res.message);
        }
        this.loading = false;
      })
    },
    handleGetRoomReportList() {
      this.loading = true;
      this.items.startDate = this.value2 && moment(this.value2[0]).format(TIME_FORMAT);
      this.items.endDate = this.value2 && moment(this.value2[1]).format(TIME_FORMAT);
      getRoomReportList(this.items).then(res => {
        if (res.code) {
          this.roomReport = res.items.list;
          if (res.items.pageNum === items.PAGE_NUM) {
            this.total = res.items.total;
          }
        } else {
          this.$message.error(res.message);
        }
        this.loading = false;
      })
    },
    handlePreviewReport(row) {
      this.reportDrawer = true;
      this.reportObject = row;
      this.isPreview = true;
    }
  }
}
</script>

<style lang="less" scoped>
.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
