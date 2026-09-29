<template>
    <el-dialog
        :title="title"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        @close="handleCancel">
        <SubmitForm
            v-if="dialogVisible"
            ref="SubmitForm"
            :formData="formData" 
            :data="form">
            <el-select 
                :class="{'select-change-p': type === 1}"
                v-model="roomId" 
                :placeholder="$t('common.placeholder')">
                <el-option
                    v-for="item in roomList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                </el-option>
            </el-select>
            <span v-if="type === 2" style="margin-left: 10px">{{ $t('common.currentRoom') }}：{{ currentRoomName }}</span>
        </SubmitForm>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleCancel">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import SubmitForm from "@c/SubmitForm/index";
    import { updateDepartment, addDevice } from "@/api/device";
    import { getRoomGatewayRoomList } from "@/api/room";
    export default {
        components: {
            SubmitForm
        },
        data() {
            const _this = this
            return {
                title: _this.$t('common.add1'),
                loading: false,
                dialogVisible: false,
                form: {
                    name: "",
                    no: "",
                    departmentId: null,
                    roomId: null,
                    remark: ""
                },
                formData: [
                    {
                        label: _this.$t('common.name'),
                        prop: "name",
                        type: "text",
                        isRequired: true,
                        placeholder: _this.$t('common.inputName'),
                    },
                    {
                        label: _this.$t('common.no'),
                        prop: "no",
                        type: "text",
                        isRequired: true,
                        disabled: false,
                        placeholder: _this.$t('common.inputNo'),
                    },
                    {
                        label: _this.$t('common.owningRoom'),
                        prop: "roomId",
                        type: "slot",
                        isRequired: true
                    },
                    // {
                    //     label: "所属房间",
                    //     prop: "roomId",
                    //     type: "select",
                    //     isRequired: true,
                    //     options:[],
                    //     optionObj: {
                    //         value: "id",
                    //         label: "name"
                    //     }
                    // },
                    {
                        label: _this.$t('common.department'),
                        prop: "departmentId",
                        type: "selectDepartment",
                    },
                    {
                        label: _this.$t('common.remark'),
                        prop: "remark",
                        type: "textarea",
                    },
                ],
                roomList: [],
                currentRoomName: "",
                roomId: null
            }
        },
        mounted() {
            this.getRoomList()
        },
        methods: {
            getRoomList() {
                getRoomGatewayRoomList().then(res => {
                    if(res.code === 1){
                        this.roomList = res.items
                    }
                })
            },
            open(index, row) {
                // 1新增，2编辑
                this.dialogVisible = true;
                this.title = index === 1 ? '新增' : '编辑';
                this.type = index;
                this.formData[1].disabled = this.type === 1 ? false : true;
                if(index === 2){
                    this.form.name = row.name;
                    this.form.no = row.no;
                    this.form.departmentId = row.departmentId === 0 ? "" : row.departmentId.toString();
                    this.form.roomId = row.roomId;
                    this.form.remark = row.remark;
                    this.form["id"] = row.id;
                    this.currentRoomName = row.roomName
                }
            },
            handleSubmit() {
                if(!this.form.name){
                    this.$message.error("名称不能为空")
                }else if(!this.form.no){
                    this.$message.error("编号不能为空")
                }else{
                    if(!this.form.remark){
                        this.form.remark = null
                    }
                    if(this.type == 1){
                        if(!this.roomId){
                            return this.$message.error("所属房间不能为空")
                        }
                        this.loading = true;
                        this.form.roomId = this.roomId;
                        addDevice({
                            ...this.form,
                            equipmentType: 16
                        }).then(res => {
                            this.loading = false;
                            if (res.code) {
                                if(res.code === 1){
                                    this.handleCancel();
                                    this.$message.success(res.message || this.title + "成功！");
                                    this.$emit("handleInit");
                                    this.getRoomList()
                                }else{
                                    this.$message.error(res.message || this.title + "失败！");
                                }
                            } else {
                                this.$message.error(res.message || this.title + "失败！");
                            }
                        })
                    }
                    if(this.type == 2){
                        this.loading = true;
                        if(this.roomId){
                            this.form.roomId = this.roomId;
                        }
                        updateDepartment({
                            ...this.form
                        }).then(res => {
                            this.loading = false;
                            if (res.code){
                                if(res.code === 1){
                                    this.$emit("handleInit");
                                    this.$message.success("修改成功");
                                    this.handleCancel();
                                    this.getRoomList()
                                }else{
                                    this.$message.error(res.message);
                                }
                            } else {
                                this.$message.error(res.message);
                            }
                        })
                    }
                }
            },
            handleCancel() {
                this.dialogVisible = false;
                this.form = {
                    id: null,
                    name: "",
                    no: "",
                    departmentId: null,
                    roomId: null,
                    remark: "",
                },
                this.roomId = null;
                this.$refs.SubmitForm.$refs.form.resetFields();
            }
        },
    }
</script>