<template>
    <el-dialog
        :title="title"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        custom-class="pipetteGun-dialog"
        @close="handleCancel">
        <el-form :model="ruleForm"  label-width="auto" label-position="left" ref="ruleForm" v-if="dialogVisible">
            <el-form-item required :label="$t('common.name')">
                <el-input class="select-change-p" maxlength="26" v-model="ruleForm.name" :placeholder="$t('common.pleaseInput')" autocomplete="off"/>
            </el-form-item>
            <el-form-item required :label="$t('common.no')">
                <el-input class="select-change-p" v-model="ruleForm.no" :disabled="type === 2" :placeholder="$t('common.inputNo')" autocomplete="off" />
            </el-form-item>
            <el-form-item required :label="$t('common.owningRoom')">
                <el-select v-model="ruleForm.roomId" class="select-change-p" :placeholder="$t('common.selectRoom')">
                    <el-option
                        v-for="item in roomList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <!-- <el-form-item label="负责人">
                <UserCompanySelect :userId="ruleForm.userId" :type="type" @getVal="handleUserId" />
            </el-form-item> -->
            <el-form-item :label="$t('common.owningDepartment')">
                <SelectTree
                    class="select-change-p"
                    :model.sync="ruleForm.departmentId"
                    :prop="props"
                    :options="departmentData"
                    :value="ruleForm.departmentId"
                    :clearable="true"
                    :accordion="false"
                    @getValue="getValue($event)"
                    :placeholder="$t('common.selectDepartemnt')"
                />
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleCancel">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import SelectTree from "@/components/SelectTree";
    import UserCompanySelect from "@/components/UserCompanySelect";
    import { getDepartment } from "@/api/department";
    import { updateDepartment, addDevice } from "@/api/device";
    import {getRoomList} from "@/api/room"; 
    import {ERROR} from "@/utils/constant";
    export default {
        data() {
            const _this = this;
            return {
                loading: false,
                dialogVisible: false,
                // 房间列表
                roomList: [],
                // 新增
                ruleForm: {
                    name: '',
                    no: "",
                    departmentId: null,
                    userId: null,
                    roomId: null,
                },
                departmentList: [],
                props: {
                    // 配置项（必选）
                    value: "id",
                    label: "name",
                    children: "subDivisions",
                },
                id: "",
                type: 1,
                title: _this.$t('common.add1')
            }
        },
        methods: {
            // type 新增1，编辑2
            open(type,item) {
                this.type = type;
                if(this.type == 1){
                    this.title = this.$t('common.add1')
                }
                if(this.type == 2){
                    this.title = this.$t('common.edit');
                }
                if(item){
                    this.id = item.id;
                    this.ruleForm.name = item.name;
                    this.ruleForm.no = item.no;
                    this.ruleForm.departmentId = item.departmentId;
                    this.ruleForm.userId = item.userId;
                    this.ruleForm.roomId = item.roomId;
                    this.ruleForm.name = item.name;
                }
                this.dialogVisible = true;
                this.getDepartmentData();
                this.getRoomData()
            },
            // 选择部门
            getValue(value) {
                this.ruleForm.departmentId = value;
                this.$emit('setDepartmentId', value)
            },
            // 部门初始化
            async getDepartmentData() {
                const _ = this;
                try {
                    let temp = [];
                    let result = await getDepartment();
                    if (result.code === 1) {
                        temp = result.items.list;
                    } else {
                        temp = [];
                    }
                    _.departmentList = temp;
                } catch (err) {
                    _.departmentList = [];
                    this.$message.error(ERROR);
                    throw err;
                }
            },
            // 请求房间列表
            getRoomData() {
                getRoomList({pageSize: 10000, pageNum: 1}).then(res => {
                    if (res.code) {
                        this.roomList = res.items.list
                    }
                }).catch(err => {

                })
            },
            handleUserId(id) {
                this.ruleForm.userId = id
            },
            handleSubmit() {
                if(!this.ruleForm.name){
                    this.$message.error(this.$t('coomon.isNotName'))
                }else if(!this.ruleForm.no){
                    this.$message.error(this.$t('coomon.isNotNo'))
                }else if(!this.ruleForm.roomId){
                    this.$message.error(this.$t('coomon.notOwningRoom'))
                }else{
                    this.loading = true;
                    if(this.type == 1){
                        addDevice({
                            ...this.ruleForm,
                            equipmentType: 13
                        }).then(res => {
                            this.loading = false;
                            if (res.code) {
                                this.handleCancel();
                                this.$message.success(res.message || this.title + this.$t('common.success'));
                                this.$emit("handleInit");
                            } else {
                                this.$message.error(res.message || this.title +  this.$t('common.error'));
                            }
                        })
                    }
                    if(this.type == 2){
                        updateDepartment({
                            id: this.id,
                            ...this.ruleForm
                        }).then(res => {
                            this.loading = false;
                            if (res.code){
                                this.$emit("handleInit");
                                this.$message.success(this.$t('coomon.editSuccess'));
                                this.handleCancel();
                            } else {
                                this.$message.error(res.message);
                            }
                        })
                    }
                }
            },
            handleCancel() {
                this.dialogVisible = false;
                this.ruleForm.name = '';
                this.ruleForm.no = '';
                this.ruleForm.departmentId = null;
                this.ruleForm.userId = null;
                this.ruleForm.roomId = null
            }
        },
        components: {
            SelectTree,
            UserCompanySelect
        },
        computed: {
            departmentData() {
                const traverse = (array, _proto) => {
                    let am = array.map((arr) => {
                    if (arr[_proto].length && arr[_proto].length > 0) {
                        traverse(arr[_proto], _proto);
                    }
                    arr.id = arr["id"].toString();
                    });
                    return array;
                };
                return traverse(this.departmentList, "subDivisions");
            }
        },
    }
</script>
