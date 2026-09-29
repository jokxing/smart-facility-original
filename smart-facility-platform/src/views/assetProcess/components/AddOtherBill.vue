<template>
    <el-dialog
        :title="'新增' + title"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        width="30%">
        <SubmitForm :formData="formData" :data="data" :labelWidth="'110px'" />
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
        props: {
            title: {
                type: String,
                default: ""
            }
        },
        data() {
            return {
                dialogVisible: false,
                disabled: false,
                formData: [
                    {
                        label: this.title + "日期",
                        prop: "date",
                        type: "date",
                        isRequired: true,
                        disabled: true,
                    },
                    {
                        label: this.title + "申请人",
                        prop: "name",
                        type: "text",
                        isRequired: true,
                        disabled: true,
                    },
                    {
                        label: this.title + "部门",
                        prop: "departmentId",
                        type: "selectDepartment",
                        isRequired: true,
                        disabled: true,
                    },
                    {
                        label: this.title + "后所在区域",
                        prop: "",
                        type: "text",
                        placeholder: "请输入" + this.title + "后所在区域",
                    },
                    {
                        label: this.title + "备注",
                        prop: "",
                        type: "textarea",
                    },
                    {
                        label: "图片上传",
                        prop: "fileList",
                        type: "upload",
                        acceptTips: "支持上传JPG、PNG格式图片，大小不超过2M",
                        max: "2"
                    },
                    {
                        label: "附件上传",
                        prop: "fileList",
                        type: "upload",
                        accept: "Excel、PDF",
                        acceptTips: "支持上传Excel、PDF格式附件",
                        limit: 2,
                        dir: "application"
                    },
                    {
                        label: "资产信息",
                        prop: "",
                        type: "text",
                        placeholder: "请输入资产信息",
                    },
                ],
                items: {
                    
                },
                data: {
                    name: JSON.parse(localStorage.getItem('USERINFO')).name,
                    date: moment(new Date()).format("YYYY-MM-DD"),
                    departmentId: JSON.parse(localStorage.getItem('USERINFO')).departmentId.toString(),
                    fileList: []
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