<template>
    <div class="table-default" :class="{'sticky-head': fixedTable}">
        <el-table
            ref="table"
            :row-key="isKey ? getRowKey: ''"
            :data="tabledata"
            v-loading="loading"
            :max-height="height"
            stripe
            border
            show-overflo-tooltips
            :default-sort="defaultSort"
            width="99%"
            @selection-change="handleRowSelected"
        >
            <el-table-column
                type="selection"
                reserve-selection
                width="50px"
                v-if="isSelected"
            >
            </el-table-column>
            <el-table-column label="#" type="index" width="70px">
                <template v-slot="scope">
                    <!-- 有分页时，序号显示 -->
                    <span v-if="`${total != 0}`">{{
                            (pageNum - 1) * pageSize + scope.$index + 1
                        }}</span>
                    <!-- 无分页时，序号显示 -->
                    <span v-else>{{ scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <template v-for="(col, index) in columns">
                <!-- 操作列/自定义列 -->
                <slot v-if="col.slot" :name="col.slot"></slot>
                <!-- 普通列 -->
                <el-table-column
                    v-else
                    :key="index"
                    :prop="col.dataIndex"
                    :label="col.title"
                    :min-width="col.width"
                    :formatter="col.formatter"
                    :sortable="col.sortable"
                >
                </el-table-column>
            </template>
        </el-table>
        <!-- 是否调用分页 -->
        <slot name="total"></slot>
        <div class="paging">
            <el-pagination
                v-if="total > 10"
                background
                :layout="paginationLayout"
                :page-size="pageSize"
                :current-page="pageNum"
                :page-sizes="pageSizes"
                :total="total"
                @size-change="handlePageSizeChange"
                @current-change="handlePageNumChange"
            >
            </el-pagination>
            <el-button v-if="total > 10" size="mini" style="margin-left: 8px" type="primary"
                       @click="handlePageNumChange(pageNum)">{{ $t('system.skip') }}
            </el-button>
        </div>
    </div>
</template>

<script>
import {items} from "@/utils/constant.js";
import mixin from "@/utils/mixin";

export default {
    name: "dataTable",
    props: {
        tabledata: {
            type: Array,
            default: () => [],
        },
        defaultSort: {
            type: Object,
            default: () => {
            }
        },
        columns: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        pageSize: {
            type: Number,
            default: items.PAGE_SIZE,
        },
        pageNum: {
            type: Number,
            default: items.PAGE_NUM,
        },
        total: {
            type: Number,
            default: 0,
        },
        pageSizes: {
            type: Array,
            default: () => items.PAGE_SIZES,
        },
        isSelected: {
            type: Boolean,
            default: false,
        },
        paginationLayout: {
            type: String,
            default: "total,sizes,prev, pager, next, jumper",
        },
        tableRefresh: {
            type: Boolean,
            default: false,
        },
        height: false,
        isKey: {
            type: Boolean,
            default: true
        },
        fixedTable: {type: Boolean, default: false}
    },

    data() {
        return {};
    },
    watch: {
        tableRefresh: {
            handler(newVal) {
                this.$refs.table.clearSelection();
            },
        },
        $route(to, from) {
            this.$refs.table.clearSelection();
            this.$refs.table.clearSort();
        },
        tabledata() {
            if (this.fixedTable) {

            }
        }
    },
    methods: {
        getRowKey(row) {
            return row.id;
        },
        handlePageSizeChange(pageSize) {
            if (pageSize >= 10) {
                localStorage.setItem("pageSize", pageSize + "");
            }
            this.$emit("pageSizeChange", pageSize);
        },
        handlePageNumChange(pageNum) {
            this.$emit("pageNumChange", pageNum);
        },
        handleRowSelected(selection) {
            this.$emit("handleRowsSelect", selection);
        },

        toggleSelected(selection) {
            this.$refs.table.toggleRowSelection(selection);
        },
    },
};
</script>
<style lang="less" src="../../style/table_sticky.less" scoped></style>
<style lang="less" scoped>
.pagination {
    margin-top: 20px;
    height: 40px;
    float: right;

    &::after {
        display: block;
        content: "";
        height: 0;
        clear: both;
        overflow: hidden;
    }
}

/deep/ .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #3F51B5;
    color: #FFFFFF !important;

}

/deep/ .el-pagination__total {
    color: #888888 !important;
}

/deep/ .el-pager li {
    color: #666666 !important;
    font-weight: 400;
    border-radius: 6px !important;
}

/deep/ .el-input__inner {
    border: 1px solid #A6B0E9 !important;
}

.paging {
    .el-button {
        height: 30px;
    }
}
</style>
