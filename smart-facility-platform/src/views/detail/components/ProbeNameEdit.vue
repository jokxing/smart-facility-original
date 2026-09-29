<template>
    <el-dialog
        title="探头名称编辑"
        width="634px"
        :visible="modalVisible"
        :before-close="handleModalClose"
        destroy-on-close
        :close-on-click-modal="false"
        custom-class="modal-probeName"
        :modal-append-to-body="false">
        <el-table
            :data="probeName"
            style="width: 100%">
            <el-table-column
                type="index"
                label="序号"
                width="70px">
            </el-table-column>
            <el-table-column
                prop="name"
                label="探头原名称">
            </el-table-column>
            <el-table-column
                prop=""
                label="所属记录仪">
            </el-table-column>
            <el-table-column
                prop=""
                label="最新名称">
                <template v-slot="scope">
                    <div>
                        <el-input placeholder="断电检测" v-if="scope.row.isEdit"></el-input>
                        <el-button type="text" v-else @click="scope.row.isEdit = true">断电检测</el-button>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
                width="80">
                <template v-slot="scope">
                    <el-button type="text" @click="scope.row.isEdit = false">保存</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-dialog>
</template>

<script>
    export default {
        data() {
            return {
                modalVisible: false,
                probeName: [
                    {
                        isEdit: false
                    },
                    {
                        isEdit: false
                    },
                ]
            }
        },
        methods: {
            open() {
                this.modalVisible = true
            },
            handleModalClose() {
                this.modalVisible = false
            }
        },
    }
</script>