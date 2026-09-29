<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="title"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="600px">
        <el-form label-width="85px">
            <el-form-item label="预约人">
                <el-input
                    v-model="userName"
                    disabled>
                </el-input>
            </el-form-item>
            <el-form-item label="预约时间">
                <DateTimeSelect
                    v-if="dialogVisible"
                    :dateTime="dateTime"
                    :startDisabled="startDisabled"
                    @getDateTime="getDateTime" />
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="btnLoading" @click="handleClose">取 消</el-button>
            <el-button type="primary" :loading="btnLoading" @click="handleSubmit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import DateTimeSelect from "@/components/DateTimeSelect";
    import { getInstrumentReservationUpdate, getInstrumentReservationAdd } from "@/api/labDevice";
    import moment from "moment";
    export default {
        components: {
            DateTimeSelect
        },
        props: {
            detail: {
                type: Object,
                default: {}
            }
        },
        data() {
            return {
                title: "",
                btnLoading: false,
                dialogVisible: false,
                type: 0,
                form: {},
                userName: localStorage.getItem('username'),
                dateBetween: [],
                // 禁止更改开始时间
                startDisabled: false,
                // 开始时间与结束时间的对象
                dateTime: {}
            }
        },
        methods: {
            open(index, item){
                this.dialogVisible = true;
                this.type = index;
                // index 1新增 2编辑
                if(index === 1){
                    this.title = "预约申请";
                    if(item && item != ""){
                        this.dateTime = item;
                        // 选择月模式
                        if(item.allDay){
                            var myGetTime = new Date().getTime();
                            var start = item.start + " " + moment(myGetTime + 60 * 1000).format('HH:mm');
                            var end = item.end + " 23:59"
                            this.dateBetween = [start,end]
                        }else{ //选择周模式或日模式
                            this.dateBetween = [item.start, item.end]
                        }
                    }
                }else{
                    this.title = "更改预约";
                    this.form = item;
                    this.dateTime = {
                        start: moment(item.timeFrom).format("YYYY-MM-DD HH:mm"),
                        end: moment(item.timeTo).format("YYYY-MM-DD HH:mm")
                    };
                    this.dateBetween = [this.dateTime.start, this.dateTime.end];
                    if(item.status == 1){
                        this.startDisabled = true;
                    }
                }
            },
            getDateTime(e){
                this.dateBetween = e;
            },
            handleSubmit() {
                if(this.type === 1){
                    if(new Date(this.dateBetween[0]).getTime() > new Date(this.dateBetween[1]).getTime()){
                        this.$message.error("预约开始时间不能大于结束时间")
                    }else{
                        // 请求
                        let data = {
                            userName: localStorage.getItem('username'),
                            companyId: this.detail.companyId,
                            departmentId: this.detail.departmentId,
                            instrumentId: this.detail.id,
                            instrumentName: this.detail.name,
                            instrumentNo: this.detail.no,
                            userId: this.detail.createUserId,
                            timeFrom: this.dateBetween[0],
                            timeTo: this.dateBetween[1]
                        };
                        getInstrumentReservationAdd(data).then(res => {
                            this.handleMessage(res)
                        })
                    }
                }else{
                    if(new Date().getTime() > new Date(this.dateBetween[1]).getTime()){
                        this.$message.error("预约结束时间不能小于当前时间")
                    }else{
                        let data = {
                            id: this.form.id,
                            instrumentId: this.form.instrumentId,
                            timeFrom: this.dateBetween[0],
                            timeTo: this.dateBetween[1]
                        }
                        getInstrumentReservationUpdate(data).then(res => {
                            this.handleMessage(res)
                        })
                    }
                }
            },
            handleMessage(res) {
                if(res.code){
                    if(res.code === 1){
                        this.$message.success(this.type === 1 ? '新增成功' : '更改成功');
                        this.$emit('handle');
                        this.dialogVisible = false;
                    }else{
                        this.$message.error(res.message)
                    }
                }else{
                    this.$message.error(res.message)
                }
            },
            handleClose() {
                this.dialogVisible = false
            }
        },
    }
</script>