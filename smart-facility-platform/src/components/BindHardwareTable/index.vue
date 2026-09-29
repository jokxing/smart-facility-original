<template>
    <div>
        <Table :tableData="tableData" :data="list" v-loading="loading" />
        <div class="paging">
            <pagination
                v-show="total > pageSize"
                :limit.sync="pageSize"
                :page.sync="pageNum"
                :total="total"
                @pagination="getList"/>
        </div>
    </div>
</template>

<script>
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import { getMonitorIndicatorThingsList } from "@/api/monitorIndicator";
    export default {
        components: {
            Table,
            Pagination
        },
        props: {
            // 2设备，3房间
            type: {
                type: Number,
                default: null
            },
            id: {
                type: Number,
                default: null
            },
        },
        data() {
            const _this = this;
            return {
                loading: false,
                tableData: [
                    {
                        label: "#",
                        type: "index",
                    },
                    {
                        label: _this.$t('hardware.devciceName'),
                        prop: "equipmentName",
                    },
                    {
                        label: _this.$t('hardware.devciceNo'),
                        prop: "equipmentNo",
                    }
                ],
                list: [],
                pageNum: 1,
                pageSize: 10,
                total: 0,
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            getList() {
                var data = {
                    objId: this.id,
                    objType: this.type,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize,
                };
                this.loading = true;
                getMonitorIndicatorThingsList(data).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total
                    }
                })
            }
        }
    }
</script>