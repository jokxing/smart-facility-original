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
            <el-form-item :label="$t('labDevice.orderUsername')">
                <el-input
                    v-model="userName"
                    disabled>
                </el-input>
            </el-form-item>
            <el-form-item :label="$t('labDevice.orderTime')">
                <DateTimeSelect
                    v-if="dialogVisible"
                    :dateTime="dateTime"
                    :startDisabled="startDisabled"
                    @getDateTime="getDateTime" />
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="btnLoading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="btnLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
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
                console.log(item)
                // index 1新增 2编辑
                if(index === 1){
                    this.title = this.$t('labDevice.orderApply');
                    if(item && item != ""){
                        this.dateTime = item;
                        // 选择月模式
                        if(item.allDay){
                            var myGetTime = new Date().getTime();
                            // 获取分钟数
                            const minutes = moment(myGetTime).format('mm');
                            if (!this.isToday(item.start)) {
                                const start = item.start + " 00:00";
                                const end = item.end + " 23:59"
                                this.dateBetween = [start,end]
                                return;
                            }
                            let difference = 0;
                            if (minutes >0 && minutes <= 15) {
                                difference = 15 - minutes;
                            } else if (minutes > 15 && minutes <= 30) {
                                difference = 30 - minutes;
                            } else if (minutes > 30 && minutes <= 45) {
                                difference = 45 - minutes;
                            } else if (minutes > 45 && minutes <= 60) {
                                difference = 60 - minutes;
                            }
                            var start = item.start + " " + moment(myGetTime + difference * 60 * 1000).format('HH:mm');
                            var end = item.end + " 23:59"
                            this.dateBetween = [start,end]
                        }else{ //选择周模式或日模式
                            this.dateBetween = [item.start, item.end]
                        }
                    }
                }else{
                    this.title = this.$t('labDevice.updateOrder');
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

            // 判断选择的时间是否为今天
            isToday(date) {
                const today = new Date();
                const year = today.getFullYear().toString();
                const month = (today.getMonth() + 1).toString();
                const day = today.getDate().toString();
                const arr = date.split("-");
                return arr[0] * 1 === year * 1 && arr[1] * 1 === month * 1 && arr[2] * 1 === day * 1;
            },

            getDateTime(e){
                this.dateBetween = e;
            },
            handleSubmit() {
                if(this.type === 1){
                    if(new Date(this.dateBetween[0]).getTime() > new Date(this.dateBetween[1]).getTime()){
                        this.$message.error(this.$t('labDevice.updateMessage'))
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
                        this.$message.error(this.$t('labDevice.updateMessage2'))
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
                        this.$message.success(this.type === 1 ? this.$t('common.addSuccess') : this.$t('common.editSuccess'));
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
