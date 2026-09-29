<template>
    <div>
        <div class="search-bar-container margin-center">
            <div>
                <el-select
                    v-model="items.status"
                    class="margin-small-right"
                    @change="getList">
                    <el-option :value="0" label="全部状态"></el-option>
                    <el-option 
                        v-for="item in statusArr" 
                        :key="item.code" 
                        :value="item.code" 
                        :label="item.label">
                    </el-option>
                </el-select>
                <el-date-picker
                    class="margin-small-right"
                    v-model="items.date"
                    type="date"
                    placeholder="选择日期">
                </el-date-picker>
                <InputAppend :placeholder="'请输入编号、名称...'" :keyword.sync="items.keyword" @handle="getList"/>
            </div>
            <div>
                <el-button class="icon-add-to" type="primary" @click="$refs.addPurchase.open()"> 新增采购</el-button>
                <el-button class="icon-download1" @click="upload()"> 导出</el-button>
            </div>
        </div>

        <Table :tableData="tableData" :data="list">
            <template slot-scope="data">
                <div 
                    v-if="data.prop === 'status'" 
                    class="approval-status"
                    :class="statusColor(data.data.status, statusArr)">
                    {{ statusText(data.data.status, statusArr) }}
                </div>
            </template>
        </Table>

        <div class="paging">
            <pagination
                v-show="total > 10"
                :limit.sync="items.pageSize"
                :page.sync="items.pageNum"
                :total="total"
                @pagination="getList"/>
        </div>

        <AddPurchase ref="addPurchase" />
    </div>
</template>

<script>
    import InputAppend from "@c/InputAppend/index";
    import AddPurchase from "./AddPurchase";
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import { APPROVALSTATUS } from "@/utils/constant";
    import { statusText, statusColor } from "@/utils/methods";
    export default {
        name: "PurchaseRequest",
        components: {
            InputAppend,
            AddPurchase,
            Table,
            Pagination
        },
        data() {
            return {
                statusArr: APPROVALSTATUS,
                statusText,
                statusColor,
                items: {
                    pageSize: 10,
                    pageNum: 1,
                    status: 0,
                    date: "",
                    keyword: ""
                },
                total: 0,
                tableData: [
                    {
                        label: "单据状态",
                        prop: "status",
                        isSlot: true
                    },
                    {
                        label: "申请采购资产",
                        prop: ""
                    },
                    {
                        label: "申请日期",
                        prop: ""
                    },
                    {
                        label: "申请部门",
                        prop: ""
                    },
                    {
                        label: "申请人",
                        prop: ""
                    },
                    {
                        label: "单据号",
                        prop: ""
                    },
                    {
                        label: "创建人",
                        prop: ""
                    },
                    {
                        label: "创建时间",
                        prop: ""
                    },
                ],
                list: []
            }
        },
        methods: {
            getList() {

            },
            upload() {
                
            }
        },
    }
</script>