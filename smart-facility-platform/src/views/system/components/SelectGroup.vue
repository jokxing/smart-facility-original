<!-- 选择通知群组 -->
<template>
    <el-dialog
        :title="$t('system.changeGroup')"
        :visible.sync="dialogGroup"
        append-to-body
        width="45%">
        <div>
            <el-input
                v-model.trim="items.query"
                class="input-with-select"
                :placeholder="$t('common.inputKeyword')"
                @keyup.enter.native="handleGroup()">
                <el-button
                    slot="append"
                    class="el-button-host"
                    icon="icon-search1"
                    @click="handleGroup()">
                </el-button>
            </el-input>
        </div>
        <el-table
            class="margin-center"
            ref="multipleTable"
            v-loading="loading"
            :data="groupData"
            border
            :row-key="getRowKey"
            max-height="300px">
            <el-table-column width="50">
                <template v-slot="scope">
                    <el-radio
                        v-model="radio"
                        :label="scope.row.id"
                        @change.native="radioData(scope.row)">&nbsp;
                    </el-radio>
                </template>
            </el-table-column>
            <el-table-column :label="$t('system.group')" prop="groupName"/>
            <el-table-column :label="$t('room.groupMsg')" prop="groupMsg"/>
            <el-table-column :label="$t('system.names')" prop="UserNames"/>
        </el-table>
        <div class="paging">
            <pagination
                v-show="total > 0"
                :limit.sync="items.pageSize"
                :page.sync="items.pageNum"
                :total="total"
                @pagination="handleGroup"/>
        </div>
        <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirmGroup">{{ $t('common.confirm') }}</el-button>
    </span>
    </el-dialog>
</template>

<script>

import {queryGroup} from "@/api/system";
import {items} from "@/utils/constant";
import Pagination from "@c/Pagination";

export default {
    name: "SelectGroup",
    components: {
        Pagination,
    },
    data() {
        return {
            dialogGroup: false,
            items: {
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM,
                query: "",
            },
            loading: false,
            radio: '',
            groupData: [],
            total: 0,
            form: {}
        }
    },
    methods: {
        handleGroup() {
            this.loading = true;
            queryGroup(this.items).then(res => {
                this.loading = false;
                if (res.code == 1) {
                    this.total = res.items.total;
                    res.items.list.forEach(i => {
                        i.UserNames = [];
                        i.noticeGroupStaffs.forEach(x => {
                            i.UserNames.push(x.staffName);
                        })
                        i.UserNames = i.UserNames.slice(0,5).toString();
                    })
                    this.groupData = res.items.list;
                } else {
                    this.$message.error(res.message);
                }
            }).catch(e => {
                this.loading = false;
            })
        },
        confirmGroup() {
            this.$emit("handle", this.form);
            this.radio = "";
            this.dialogGroup = false;
        },
        getRowKey(row) {
            return row.id
        },
        open(item) {
            this.dialogGroup = true;
            this.form.groupName = item.groupName || null;
            this.radio = this.form.groupId = item.groupId || null;
            this.items = {
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM,
                query: "",
            }
            this.handleGroup();
        },
        radioData(row) {
            this.form = {groupName: row.groupName, groupId: row.id};
        },
    }
}
</script>