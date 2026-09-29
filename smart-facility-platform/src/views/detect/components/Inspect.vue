<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="title"
        :visible.sync="dialogVisible"
        append-to-body>
        <el-form label-position="left" label-width="auto">
            <el-form-item :label="$t('hardware.hardware')" required>
                <el-input
                    v-model.trim="form.keyword"
                    class="input-with-select"
                    clearable
                    :placeholder="$t('common.inputKeyword')"
                    @keyup.enter.native="handleRemoteMethod">
                    <el-button slot="append" class="el-button-host" icon="icon-search1" @click="handleRemoteMethod"/>
                </el-input>
            </el-form-item>
        </el-form>
        <el-table
            v-loading="loading"
            :data="devices"
            border
            size="medium">
            <el-table-column label="#" type="index" width="70px"/>
            <el-table-column :label="$t('common.name')" prop="name"/>
            <el-table-column :label="$t('common.no')" prop="no"/>
            <el-table-column :label="$t('common.handle')" type="index" width="100px">
                <template v-slot="scope">
                    <el-button type="text" @click="handleInspect(scope.row)">{{ $t("hardware.add") }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="paging">
            <pagination
                v-show="total > 10"
                :layout="'total, prev, pager, jumper'"
                :limit.sync="form.pageSize"
                :page-count="5"
                :page.sync="form.pageNum"
                :total="total"
                @pagination="handleQuery"/>
        </div>
    </el-dialog>
</template>

<script>
import {getDetectAdd, getDetectDown} from "@/api/detect";
import Pagination from "@c/Pagination/index";
import {items} from "@/utils/constant";

let time;
export default {
    name: "Inspect",
    components: {
        Pagination
    },
    data() {
        const _this = this;
        return {
            title: _this.$t('hardware.addDetect'),
            dialogVisible: false,
            devices: [],
            loading: false,
            form: {
                keyword: "",
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM
            },
            total: 0
        }
    },
    methods: {
        handleClose() {
            this.dialogVisible = false;
            this.devices = [];
            this.form = {
                keyword: "",
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM
            };
        },
        open() {
            this.dialogVisible = true;
            this.handleGetDetectList();
        },
        handleQuery() {
            this.handleGetDetectList();
        },
        handleGetDetectList() {
            this.loading = true;
            this.devices = [];
            getDetectDown(this.form).then(res => {
                if (res.code) {
                    this.devices = res?.items?.list || [];
                    this.total = res?.items?.total || 0;
                } else {
                    this.$message.error(res.message);
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        handleRemoteMethod() {
            this.handleGetDetectList();
        },
        handleInspect(row) {
            getDetectAdd({equipmentId: row.id}).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('hardware.addSuccess'));
                    this.handleGetDetectList();
                    this.$emit("handle");
                } else {
                    this.$message.error(res.message);
                }
            })
        }
    }
}
</script>
<style lang="less" scoped>
/deep/ .el-dialog__body {
    overflow-x: hidden;
    max-height: 560px;
}
</style>
