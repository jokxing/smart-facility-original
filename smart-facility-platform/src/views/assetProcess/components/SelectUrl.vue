<template>
    <el-dialog
        :title="$t('labDevice.changeImg')"
        :close-on-click-modal="false"
        :before-close="handleClose"
        append-to-body
        width="45%"
        :visible.sync="dialogFormVisible">
        <el-form v-model="form" label-position="left" label-width="auto">
<!--            <el-form-item label="搜索图片">-->

<!--            </el-form-item>-->
            <el-form-item :label="$t('labDevice.sysImg')">
                <div class="upload-box flexBox">
                    <img :src="BASE_URL + iconActive" alt="" class="picBox">
                </div>
                <div class="upload-box flexBox">
                    <span class="input-row-label"></span>
                    <div class="systemIcon-group">
                        <div
                            v-for="(item, index) in pictureList"
                            :key="index"
                            :class="iconActive === item ? 'active' : ''"
                            :style="{
                            background: `url(${BASE_URL + item.url}) no-repeat`,
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center center',
                        }"
                            class="systemIcon-list"
                            @click="iconActive = item.url">
                            <span :title="item.title">{{ item.title }}</span>
                        </div>
                    </div>
                </div>
            </el-form-item>
        </el-form>
        <el-row justify="center" type="flex">
            <pagination
                v-show="items.total > 10"
                :layout="'total, pager, jumper'"
                :limit.sync="items.pageSize"
                :page-count="5"
                :page.sync="items.pageNum"
                :total="items.total"
                @pagination="handleQuery"/>
        </el-row>
        <span slot="footer" class="dialog-footer">
          <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
          <el-button
              type="primary"
              @click="onsubmit()">
            {{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {BASE_URL} from "@/utils/constant"
import {getFileInstrumentPic, getFileUrlByTitle} from "../../../api/upload";
import Pagination from "@c/Pagination/index";

export default {
    name: "SelectUrl",
    components: {
        Pagination,
    },
    data() {
      return {
          dialogFormVisible: false,
          form: {},
          BASE_URL,
          iconActive: "",
          pictureList: [],
          items: {
              total: 0,
              pageSize: 25,
              pageNum: 1
          }
      }
    },
    methods: {
        handleClose() {
            this.dialogFormVisible = false;
        },
        open() {
            this.dialogFormVisible = true;
            this.getPictureData();
        },
        onsubmit() {
            this.dialogFormVisible = false;
            this.$emit("handle", this.iconActive);
        },
        handleQuery() {
            this.getPictureData()
        },
        getPictureData() {
            const data = {
                type: 0,
                pageNum: this.items.pageNum,
                pageSize: this.items.pageSize
            };
            getFileUrlByTitle(data).then(res => {
                if (res.code) {
                    this.iconActive = res.items.list[0].url;
                    this.pictureList = res.items.list;
                    this.items.total = res.items.total;
                }
            }).catch(err => {

            })
        },
    }
}
</script>

<style lang="less" scoped>
.upload-box {
    margin-bottom: 10px;
    margin-left: 15px;

    .picBox {
        width: 100px;
        height: 100px;
        border: 1px solid #e5e5e5;
        border-radius: 3px;
    }
}
.input-row-label {
    width: 70px;
}

.systemIcon-group {
    margin-top: 20px;
}
.systemIcon-group {
    flex: 1;
    display: flex;
    flex-wrap: wrap;

    .systemIcon-list {
        width: 60px;
        height: 60px;
        line-height: 60px;
        text-align: center;
        border: 1px solid #e5e5e5;
        margin: 0 30px 30px 0;
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        background-size: 100% 100% !important;
        background-position: center center !important;

        span {
            width: 100%;
            display: block;
            text-align: center;
            position: absolute;
            bottom: -40px;
            font-size: 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        &:hover {
            border-color: #409eff;
        }

        &.active {
            border-color: #409eff;

            &::before {
                content: "";
                position: absolute;
                right: 0;
                bottom: 0;
                border: 12px solid #409eff;
                border-top-color: transparent;
                border-left-color: transparent;
            }

            &::after {
                content: "";
                width: 3px;
                height: 8px;
                position: absolute;
                right: 4px;
                bottom: 4px;
                border: 2px solid #fff;
                border-top-color: transparent;
                border-left-color: transparent;
                transform: rotate(45deg);
            }
        }

        .iconfont {
            font-size: 32px;
        }
    }
}
</style>