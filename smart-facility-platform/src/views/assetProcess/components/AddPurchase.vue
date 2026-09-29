<template>
    <el-dialog
        title="新增采购"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        width="30%">
        <SubmitForm :formData="formData" :data="data" :labelWidth="'100px'" />
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="disabled" @click="handleClose">取 消</el-button>
            <el-button :disabled="disabled" type="primary" :loading="disabled" @click="handleSubmit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import SubmitForm from "@c/SubmitForm";
    import moment from "moment";
    export default {
        components: {
            SubmitForm
        },
        data() {
            return {
                dialogVisible: false,
                disabled: false,
                formData: [
                    {
                        label: "申请人",
                        prop: "name",
                        type: "text",
                        isRequired: true,
                        disabled: true,
                    },
                    {
                        label: "申请日期",
                        prop: "date",
                        type: "date",
                        isRequired: true,
                        disabled: true,
                    },
                    {
                        label: "申请部门",
                        prop: "departmentId",
                        type: "selectDepartment",
                        isRequired: true,
                        disabled: true,
                    },
                    {
                        label: "申请采购资产",
                        prop: "purchaseAsset",
                        type: "text",
                        placeholder: "请输入申请采购资产",
                    },
                    {
                        label: "件数",
                        prop: "num",
                        type: "number",
                    },
                    {
                        label: "品牌",
                        prop: "",
                        type: "text",
                        placeholder: "请输入品牌",
                    },
                    {
                        label: "型号",
                        prop: "",
                        type: "text",
                        placeholder: "请输入型号",
                    },
                    {
                        label: "备注",
                        prop: "",
                        type: "textarea",
                    },
                ],
                items: {

                },
                data: {
                    name: JSON.parse(localStorage.getItem('USERINFO')).name,
                    departmentId: JSON.parse(localStorage.getItem('USERINFO')).departmentId.toString(),
                    date: moment(new Date()).format("YYYY-MM-DD")
                }
            }
        },
        mounted() {
        },
        methods: {
            open(){
                this.dialogVisible = true
            },
            handleSubmit() {

            },
            handleClose() {
                this.dialogVisible = false
            }
        },
    }
</script>