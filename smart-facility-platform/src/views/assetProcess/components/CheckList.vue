<!-- 入库导入确认 -->
<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="title"
        :visible.sync="dialogVisible"
        width="40%"
        append-to-body>
        <el-table
            ref="table"
            :data="list"
            stripe
            height="300">
            <el-table-column fixed label="序号" type="index" width="70px"/>
            <el-table-column fixed label="设备名称" prop="instrumentName"/>
            <el-table-column fixed label="设备编号" prop="instrumentNo"/>
            <el-table-column fixed label="创建时间" prop="createDate"/>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button :disabled="disabled" @click="handleClose">取消入库</el-button>
          <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {postActivitiBatchStorage, postActivitiCancelStorage} from "@/api/activiti";
import Pagination from "@c/Pagination";

export default {
    name: "CheckList",
    components: {
        Pagination,
    },
    data() {
        return {
            dialogVisible: false,
            title: "",
            list: [],
            loading: false,
            instrumentIds: [],
            disabled: false,
        }
    },
    methods: {
        handleClose() {
            this.disabled = true;
            const arr = Array.from(this.list, ({instrumentId}) => instrumentId);
            postActivitiCancelStorage(arr).then(res => {
                this.disabled = false;
                if (res.code) {
                    this.list = [];
                    this.dialogVisible = false;
                    this.$message.success("已取消入库");
                    this.$emit("handle");
                } else {
                  this.$message.error(res.message)
                }
            }).catch(e => {
              this.disabled = false;
              console.log(e)
            })
        },
        open(arr) {
            this.list = arr;
            this.title = "导入成功" + this.list.length + "台设备"
            this.dialogVisible = true;
        },
        handleSubmit() {
            this.disabled = true;
            const arr = Array.from(this.list, ({instrumentId}) => instrumentId);
            postActivitiBatchStorage(arr).then(res => {
                this.disabled = false
                if (res.code) {
                    this.list = [];
                    this.dialogVisible = false;
                    this.$message.success("已成功入库");
                    this.$emit("handle");
                }
            }).catch(e => {
                console.log(e);
                this.disabled = false;
            })
        }
    }
}
</script>

<style scoped>

</style>