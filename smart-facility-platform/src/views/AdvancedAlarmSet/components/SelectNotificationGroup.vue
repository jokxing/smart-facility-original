<template>
  <div class="select-notification-group">
    <div style="color: #aaaaaa">
      <div class="selected-groups" v-if="tableIsCheckbox">
        &nbsp;&nbsp;&nbsp;{{ $t('common.selected') }}：
        <template v-for="(item,index) in value">
          <el-tag
            class="selected-groups-tag"
            :key="item.id"
            closable
            @close="value.splice(index,1)">
            {{ item.groupName }}
          </el-tag>
        </template>
      </div>
    </div>
    <el-input
      v-model="items.keyword"
      class="input-with-select"
      clearable
      :placeholder="$t('system.groupInputKeyword')"
      @keyup.enter.native="handelFilter">
      <el-button
        slot="append"
        icon="icon-search1"
        class="el-button-host"
        @click="handelFilter">
      </el-button>
    </el-input>

    <Table
      ref="table"
      :tableData="tableData"
      :data="list"
      @handleRadioSelected="handleRadioSelected"
      @handleSelectionChange="handleSelectionChange"/>
    <div class="paging">
      <pagination
        v-show="total > 10"
        :limit.sync="items.pageSize"
        :page.sync="items.pageNum"
        :total="total"
        @pagination="getList"/>
    </div>
  </div>
</template>

<script>
import Table from "@c/Tables";
import Pagination from "@/components/Pagination/index";
import {getGroupList} from "@/api/system";
import {throttle} from "@/utils/methods";

////在这里确定表格是单选或多选
const isRadio = true;
const isCheckbox = !isRadio;

export default {
  components: {
    Table,
    Pagination
  },
  props: {
    value: {type: Array, default: []},
  },

  data() {
      const _this = this;
    return {

      // 用来区分value值是否从本页面环境进行的改变
      thisTimeValueIsChengeFromInner: false,
      // 用来区分 "表格的选项变化" 是否是因 "value值生效到表格选项" 而触发的，并表示生效的行数。
      thisTimeSelectionChangeFromValueChange: 0,
      // 用来区分 "表格的选项变化" 是否是因为 "刷新表格数据" 而触发的
      thisTimeSelectionChangeFromUpdateTable: false,

      items: {
        pageSize: 10,
        pageNum: 1,
        keyword: "",
      },
      total: 0,
      tableIsCheckbox: isCheckbox,
      tableIsRadio: isRadio,
      tableData: [
        {
          isCheckbox: isCheckbox,
          isRadio: isRadio,
          width: "50"
        },
        {
          label: _this.$t('system.noticeName'),
          prop: "groupName"
        },
        {
          label: _this.$t('system.names'),
          prop: "personnel"
        },
        {
          label: _this.$t('room.groupMsg'),
          prop: "groupMsg"
        },
      ],
      list: [
        // {
        //     id: 1,
        //     groupName: "高等级报警通知组",
        //     personnel: "周其捷、林镜洪、柏凯雄、徐晓锋、邓杰...",
        //     groupMsg: "-"
        // },
      ]
    }
  },

  computed: {},
  watch: {
    value() {

      //过滤不应该触发的情况
      if (this.thisTimeValueIsChengeFromInner) {
        this.thisTimeValueIsChengeFromInner = false;
        return;
      }

      isCheckbox && this.refreshCheckbox();
      isRadio && this.refreshRadio();
    }
  },

  methods: {
    onShowMethod() {
      this.handelFilter();
    },
    handelFilter() {
      this.items.pageNum = 1;
      this.getList();
    },
    getList() {
      let that = this;
      that.getList = throttle(() => {
        that.getList_();
      }, 1000);
      that.getList();
    },
    getList_() {
      getGroupList({
        query: this.items.keyword,
        pageSize: this.items.pageSize,
        pageNum: this.items.pageNum,

      }).then(res => {
        if (res.code == 1 && res.items && res.items.list) {
          this.total = res.items.total;
          res.items.list.forEach(group => {
            group.personnel = '';
            let ended = false;
            group.noticeGroupStaffs && group.noticeGroupStaffs.forEach((staff, index) => {
              if (group.personnel.length < 13) {
                group.personnel += (index === 0 ? '' : '、') + staff.staffName;
              } else if (!ended) {
                group.personnel += '、...';
                ended = true;
              }
            })
          });

          if (isCheckbox) {
            this.thisTimeSelectionChangeFromUpdateTable = true;
          }
          this.list = res.items.list;
        }

      }).finally(() => {
        if (isCheckbox) {
          this.thisTimeSelectionChangeFromUpdateTable = false;
          this.refreshCheckbox();
        }
        if(isRadio){
          this.refreshRadio();
        }
      });
    },
    refreshCheckbox() {
      if (this.value && this.value.length > 0 && this.list && this.list.length > 0) {

        let rows = [];
        this.list.forEach(group => {
          this.value.forEach(limitGroup => {
            if (group.id && limitGroup.id && group.id === limitGroup.id) {
              rows.push(group);
            }
          })
        })

        this.thisTimeSelectionChangeFromValueChange = rows.length;
        this.$refs.table.selectCheckboxs(rows);
      } else {
        this.$refs.table.selectCheckboxs(null);
      }
    },
    refreshRadio() {
      if (this.value && this.value.length > 0 && this.list && this.list.length > 0) {
        let limitGroup = this.value[0];
        for(var i=0;i<this.list.length;i++){
          let group = this.list[i];
          if (group.id && limitGroup.id && group.id === limitGroup.id) {
            this.$refs.table.selectRadio(i);
            return;
          }
        }
        this.$refs.table.selectRadio('');

      } else {
        this.$refs.table.selectRadio('');
      }
    },

    //删除 “已选组”中，如果在“表格当页”中有的，就删掉（不改变原数组）
    deleteValueItemWithTable() {
      let newValue = [];
      this.value && this.value.forEach(limitGroup => {
        let willDeleteGroup = null;
        let i = 0;
        for (i = 0; i < this.list.length; i++) {
          willDeleteGroup = this.list[i];
          if (willDeleteGroup && willDeleteGroup.id && limitGroup.id && limitGroup.id === willDeleteGroup.id) {
            break;
          }
        }
        if (i >= this.list.length) {
          newValue.push(limitGroup);
        }
      });
      return newValue;
    },

    handleSelectionChange(rows) {
      //过滤因刷新表格而触发的选择事件
      if (this.thisTimeSelectionChangeFromUpdateTable) {
        this.thisTimeSelectionChangeFromUpdateTable = false;
        return;
      }
      //过滤因value（已选择的通知组列表）改变时同步表格选项而触发的选择事件
      if (this.thisTimeSelectionChangeFromValueChange) {
        this.thisTimeSelectionChangeFromValueChange--;
        return;
      }
      // console.log('rows',rows)

      let newValue = this.deleteValueItemWithTable();
      rows.forEach(row => {
        newValue.push({
          groupMsg: row.groupMsg,
          groupName: row.groupName,
          id: row.id
        });
      });

      //从内部向外部改变 “双向绑定的value” 时，做个标记，使这次value的改变 不会触发向内部做同步，避免循环触发改变事件
      this.thisTimeValueIsChengeFromInner = true;
      this.$emit('input', newValue);
    },

    handleRadioSelected(row) {
        console.log(row)
      // 只有点击了单选框才触发handleRadioSelected，所以这里不用过滤事件
      // ....

      let newValue = [{
        groupMsg: row.groupMsg,
        groupName: row.groupName,
        id: row.id
      }];

      //从内部向外部改变 “双向绑定的value” 时，做个标记，使这次value的改变不会触发向内部做同步，避免循环触发改变事件
      this.thisTimeValueIsChengeFromInner = true;
      this.$emit('input', newValue);
    }
  },
}
</script>

<style lang="less" scoped>
.select-notification-group {
  .input-with-select {
    margin-bottom: 10px;
  }
}

.selected-groups-tag {
  margin-left: 7px;
}

.selected-groups {
  margin-top: 10px;
  margin-bottom: 10px;
  overflow: auto;
  white-space: nowrap;
  min-height: 40px;
  line-height: 40px;
  background-color: #f4f4f9;
}
</style>