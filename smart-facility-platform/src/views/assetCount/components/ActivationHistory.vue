<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.tagCloseLog')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="40%">
        <Table :tableData="tableData" :data="list" v-loading="loading"></Table>
        <div class="paging">
            <pagination
                v-show="total > 10"
                :limit.sync="items.pageSize"
                :page.sync="items.pageNum"
                :total="total"
                @pagination="getList"/>
        </div>
    </el-dialog>
</template>

<script>
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import { postPropertyActivationHistory } from "@/api/property";
    import moment from "moment";
    export default {
        components: {
            Table,
            Pagination
        },
        data() {
            const _this = this;
            return {
                loading: false,
                dialogVisible: false,
                items: {
                    pageSize: 10,
                    pageNum: 1,
                },
                total: 0,
                tableData: [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('hardware.duration'),
                        prop: "duration",
                    },
                    {
                        label: _this.$t('labDevice.type'),
                        prop: "status",
                        field: "status",
                        class: {
                            0:{
                                text: _this.$t('common.open1')
                            },
                            1:{
                                text: _this.$t('common.close')
                            }
                        }
                    },
                    {
                        label: _this.$t('labDevice.handleUser'),
                        prop: "createUserName"
                    },
                    {
                        label: _this.$t('labDevice.handleTime'),
                        prop: "createDate",
                    },
                ],
                list: []
            }
        },
        methods: {
            open(){
                this.dialogVisible = true;
                this.getList()

            },
            getList() {
                this.loading = true;
                postPropertyActivationHistory(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total;
                        const _this = this;
                        for(var i = 0; i < this.list.length; i++){
                            if(this.list[i].endDate && this.list[i].startDate){
                                var x = (new Date(this.list[i].endDate).getTime() - new Date(this.list[i].startDate).getTime()) / 1000;
                                var d = moment.duration(x, 'seconds');
                                this.list[i]['duration'] = 
                                    Math.floor(d.asDays()) <= 0 && d.hours() <= 0 && d.minutes() <= 0 && d.seconds() <= 0 ? '' :
                                    (Math.floor(d.asDays()) > 0 ? Math.floor(d.asDays()) + _this.$t('common.day1') : '') +
                                    (d.hours() > 0 ? d.hours() + _this.$t('common.hour') : (d.minutes() > 0 && (Math.floor(d.asDays())) > 0) ? '0' + _this.$t('common.hour') : '') +
                                    (d.minutes() > 0 ? d.minutes() + _this.$t('common.minute1') : '') +
                                    (d.seconds() > 0 ? d.seconds() + _this.$t('common.second') : '')
                            }
                        }
                    }
                })
            },
            handleClose() {
                this.dialogVisible = false;
                this.items = {
                    pageSize: 10,
                    pageNum: 1,
                }
                this.list = []
            }
        },
    }
</script>