<template>
    <div :class="{'hidden':hidden}" class="pagination-container">
        <el-pagination
            :background="background"
            :current-page.sync="currentPage"
            :page-size.sync="pageSize"
            :layout="layout"
            :page-sizes="pageSizes"
            :total="total"
            :pager-count="pageCount"
            v-bind="$attrs"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
        <el-button size="mini" v-if="isBut" class="pagination-but" type="primary" @click="handleCurrentChange">
            {{ $t('system.skip') }}
        </el-button>
    </div>
</template>

<script>
import {scrollTo} from '@/utils/scroll-to'

export default {
    name: 'Pagination',
    props: {
        total: {
            required: true,
            type: Number
        },
        page: {
            type: Number,
            default: 1
        },
        limit: {
            type: Number,
            default: 20
        },
        pageSizes: {
            type: Array,
            default() {
                return [10, 20, 30, 50]
            }
        },
        layout: {
            type: String,
            default: 'total, sizes, prev, pager, next, jumper'
        },
        background: {
            type: Boolean,
            default: true
        },
        autoScroll: {
            type: Boolean,
            default: true
        },
        hidden: {
            type: Boolean,
            default: false
        },
        pageCount: {
            type: Number,
            default: 5
        },
        isHandle: {
            type: Boolean,
            default: true
        },
        isBut: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        currentPage: {
            get() {
                return this.page
            },
            set(val) {
                this.$emit('update:page', val)
            }
        },
        pageSize: {
            get() {
                return this.limit
            },
            set(val) {
                if (val >= 10) {
                    localStorage.setItem("pageSize", val + "");
                }
                this.$emit('update:limit', val)
            }
        }
    },
    methods: {
        handleSizeChange(val) {
            this.$emit('update:page', 1);
            this.$emit('pagination', {page: 1, limit: val});
            if (this.autoScroll) {
                scrollTo(0, 800)
            }
        },
        handleCurrentChange(val) {
            this.$emit('pagination', {page: val, limit: this.pageSize})
            if (this.autoScroll) {
                scrollTo(0, 800)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.pagination-container {
    display: flex;
    background: #fff;

    .pagination-but {
        margin-left: 8px;
    }
    .el-button--mini {
        height: 30px !important;
    }
}


.pagination-container.hidden {
    display: none;
}

.pagination-container {
    margin-top: 0;
}

/deep/ .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #3F51B5 !important;
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
</style>
