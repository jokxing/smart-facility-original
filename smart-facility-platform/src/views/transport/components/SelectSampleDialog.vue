<template>
    <el-dialog
        :close-on-click-modal="false"
        :title="dialogTitle"
        :visible.sync="visible"
        :before-close="handleClose"
        width="60%"
        append-to-body>
        <div class="search-bar-container">
            <el-input
                v-model="query.key"
                class="input-with-select"
                :placeholder="$t('transport.noCommodity')"
                @keyup.enter.native="handleFilter">
                <el-button
                    icon="icon-search1"
                    slot="append"
                    class="el-button-host"
                    @click="handleFilter"/>
            </el-input>
        </div>

        <el-table
            stripe
            ref="table"
            v-loading="tableLoading"
            :data="list"
            border
            @selection-change="handleSelectionChange"
            class="margin-center">

            <el-table-column fixed="left" type="selection" width="40px" align="center"/>

            <el-table-column
                fixed="left"
                label="#"
                width="50px"
                align="center">
                <template v-slot="scope">
                    {{ (query.pageNum - 1) * query.pageSize + scope.$index + 1 }}
                </template>
            </el-table-column>

            <el-table-column prop="sampleNo" :label="$t('common.no')"/>
            <el-table-column prop="sampleName" :label="$t('transport.commodity')"/>
            <el-table-column prop="productionCompany" :label="$t('transport.yieldCompany')"/>
            <el-table-column prop="productionBatch" :label="$t('transport.productionBatch')"/>
            <el-table-column prop="specification" :label="$t('labDevice.specification')"/>
            <el-table-column prop="unitName" :label="$t('transport.unit')"/>
            <el-table-column :label="$t('transport.isChange')">
                <template v-slot="{row}">
                    <span v-if="isSelected(row)" style="color: red">{{ $t('common.selected') }}</span>
                </template>
            </el-table-column>

        </el-table>

        <div class="paging">
            <Pagination
                v-show="total>0"
                :total="total"
                :limit.sync="query.pageSize"
                :page.sync="query.pageNum"
                @pagination="getList"/>
        </div>

        <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" @click="handleConfirm">{{ $t('common.confirm') }}</el-button>
        </span>

    </el-dialog>
</template>

<script>
import {querySampleInfo} from "@/api/transport";
import Pagination from "@c/Pagination"
import i18n from "@/i18n";

export default {
    name: "SelectSampleDialog",
    components: {
        Pagination
    },
    props: {
        dialogTitle: {
            type: String,
            default: i18n.t('transport.changeBrand1'),
        }
    },
    data() {
        return {
            selectedCallback: null,
            visible: false,

            selectedIds:[],
            selection: [],
            // 表格数据
            list: [],
            total: 0,
            tableLoading: false,
            // 分页查询信息
            query: {
                pageNum: 1,
                pageSize: 10,
                key: ""
            },

        }
    },
    methods: {
        openSelect(selectedIds, selectedCallback) {
            this.selectedIds = selectedIds;
            this.selectedCallback = selectedCallback;
            this.visible = true;
            this.getList();
        },
        getList() {
            this.tableLoading = true;
            querySampleInfo(this.query).then(res => {
                if (res.code) {
                    let {list, total} = res.items
                    this.list = list
                    this.total = total
                } else {
                    this.$message.error(res.message)
                }
            }).catch(res => {
                this.$message.error(res.message)
            }).finally(() => {
                this.tableLoading = false;
            })
        },
        handleFilter() {
            this.query.pageNum = 1;
            this.getList();
        },
        isSelected(row){
            for(let id of this.selectedIds){
                if(row.id===id){
                    return true;
                }
            }
            return false;
        },
        handleClose() {
            this.visible = false;
            this.selectedCallback = null;
        },
        handleSelectionChange(rows) {
            this.selection = rows;
        },

        handleConfirm() {
            if (this.selectedCallback) {
                this.selectedCallback(this.selection);
            }
            this.handleClose();
        }
    },
}
</script>

<style scoped>

</style>