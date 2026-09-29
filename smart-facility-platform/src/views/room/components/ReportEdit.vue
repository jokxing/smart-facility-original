<template>
  <el-drawer
      :before-close="handleClose"
      :modal="false"
      :visible.sync="isDrawer"
      :with-header="false"
      size="50%"
  >
    <div class="detail-padding-nocolor">
      <div class="sever-title">
        <DrawerNav :name="preview? $t('room.lookReport') : $t('room.editReport')" @handle="handleClose">
          <template v-slot:status>
            <el-button v-if="preview" class="margin-small-right" type="primary" @click="handleReportPdf">{{ $t('room.exportReport') }}
            </el-button>
          </template>
        </DrawerNav>
      </div>
      <div ref="report" class="report-edit">
        <div>
          <!--           1.选择报告等级    -->
          <el-descriptions :title="$t('room.normalReport')"/>
          <el-form v-model="form">
            <el-form-item :label-width="width" :label="$t('room.reportClass')">
              <span v-if="preview">{{ levelName }}</span>
              <el-select
                  v-else
                  v-model="form.level"
                  :disabled="preview"
                  class="input-with-select"
                  :placeholder="$t('common.placeholder')">
                <el-option
                    v-for="item in gradeTypes"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <!--          2.基本信息     -->
            <p>{{ $t('common.basicInformation') }}</p>
            <el-row>
              <el-col :sm="12">
                <el-form-item :label-width="width" :label="$t('room.reportName')">
                  <span v-if="preview">{{ form.name }}</span>
                  <el-input
                      v-else
                      v-model.trim="form.name"
                      class="input-with-select"
                      disabled/>
                </el-form-item>
              </el-col>
              <el-col :sm="12">
                <el-form-item :label-width="width" :label="$t('room.roomName')">
                  <span v-if="preview">{{ form.roomName }}</span>
                  <el-input
                      v-else
                      v-model.trim="form.roomName"
                      class="input-with-select"
                      disabled/>
                </el-form-item>
              </el-col>
              <el-col :sm="12">
                <el-form-item :label-width="width" :label="$t('room.checkUserName')">
                  <span v-if="preview">{{ form.checkUserName }}</span>
                  <el-input
                      v-else
                      v-model.trim="form.checkUserName"
                      class="input-with-select"
                      disabled/>
                </el-form-item>
              </el-col>
              <el-col :sm="12">
                <el-form-item :label-width="width" :label="$t('room.checkDate')">
                  <span v-if="preview">{{ form.checkDate }}</span>
                  <el-date-picker
                      v-else
                      v-model="form.checkDate"
                      :picker-options="pickerOptions"
                      class="input-with-select"
                      type="date"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <!--   3.检查项         -->
          <p>{{ $t('room.checkItem') }}</p>
          <div class="amount">
            <span>{{ $t('room.sum') }} {{ sum }} {{ $t('common.item') }}</span>
            <span>{{ $t('room.noViolationLevelNum') }} {{ noViolationLevelNum }} {{ $t('common.item') }}</span>
            <span>{{ $t('room.commonViolationLevelNum') }} {{ commonViolationLevelNum }} {{ $t('common.item') }}</span>
            <span>{{ $t('room.mediumViolationLevelNum') }} {{ mediumViolationLevelNum }} {{ $t('common.item') }}</span>
            <span>{{ $t('room.seriousnessViolationLevelNum') }} {{ seriousnessViolationLevelNum }} {{ $t('common.item') }}</span>
          </div>
          <el-table
              :data="form.reportItems"
              border
              size="medium">
            <el-table-column label="#" type="index" width="70px"/>
            <el-table-column :label="$t('room.checkItem1')" width="200">
              <template v-slot="scope">
                {{ scope.row.name }}
              </template>
            </el-table-column>
            <el-table-column v-if="preview" :formatter="handleViolationLevel" :label="$t('room.violationLevel')" prop="violationLevel"/>
            <el-table-column v-else :label="$t('room.violationLevel')">
              <template v-slot="scope">
                <el-select
                    v-model.trim="scope.row.violationLevel"
                    :disabled="preview">
                  <el-option
                      v-for="item in violationTypes"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id">
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.remark')">
              <template v-slot="scope">
                <span v-if="preview">{{ scope.row.violationRemark }}</span>
                <el-input v-else v-model.trim="scope.row.violationRemark" type="text"/>
              </template>
            </el-table-column>
          </el-table>
          <!--        4.检查报告图片     -->
          <p class="margin-center">{{ $t('room.checkImg') }}</p>
          <div v-if="preview" class="flexBox">
            <div v-if="!fileList.length" class="empty">{{ $t('labDevice.notImg') }}</div>
            <img v-for="item in fileList" :key="item.name" :src="item.url" alt="" class="preview-img"
                 crossorigin="Anonymous">
          </div>
          <cx-upload
              v-else
              :accept="'.png,.jpg,.jpeg'"
              :dir="'img'"
              :limit="5"
              :preview="preview"
              :value="fileList"
              @handleUploadSuccess="handleUploadSuccess"
          />
          <el-row v-if="!preview" class="margin-center" justify="end" type="flex">
            <el-button type="primary" @click="handleSubmitReport">{{ $t('room.saveUpdate') }}</el-button>
          </el-row>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import DrawerNav from "@/components/DrawerNav"
import {addReportRoomReport, editReportRoomReport, getReportTemplateObtainItem} from "@/api/room";
import {BASE_URL, TIME_FORMAT} from "@/utils/constant";
import moment from "moment"
import CxUpload from "@/views/room/components/chuxouUpload";
import mixin from "@/views/room/mixin";

export default {
  name: "ReportEdit",
  components: {
    DrawerNav,
    CxUpload
  },
  props: {
    isDrawer: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      default: () => {
      }
    },
    preview: {
      type: Boolean,
      default: false
    }
  },
  data() {
      const _this = this;
    return {
      router: {
        title: _this.$t('room.editReport')
      },
      fileList: [],
      httpRequest: "",
      ossData: {
        policy: "",
        signature: "",
        accessKey: "",
        dir: "",
        host: "",
        callback: "",
      },
      form: {
        name: "",
        roomName: "",
        checkUserName: "",
        checkDate: "",
        level: 0,
        imageUrlList: "",
        reportItems: [
          {violationLevel: 0},
          {violationLevel: 0}
        ]
      },
      gradeTypes: [
        {id: -2, name: _this.$t('room.abQualified')},
        {id: 1, name: _this.$t('room.qualified')},
        {id: -1, name: _this.$t('room.rectification')},
        {id: 0, name: _this.$t('common.notActivate')},
      ],
      width: "90px",
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 8.64e6;//格林尼治时间需要减去8个时区差，如果没有后面的-8.64e6就是不可以选择今天的
        }
      },
      violationTypes: [
        {id: 0, name: _this.$t('room.noViolationLevelNum')},
        {id: 1, name: _this.$t('room.commonViolationLevelNum')},
        {id: 2, name: _this.$t('room.mediumViolationLevelNum')},
        {id: 3, name: _this.$t('room.seriousnessViolationLevelNum')},
      ],
      picList: []
    }
  },
  created() {
    if (JSON.stringify(this.row) !== "{}") {
      const {checkDate, checkUserName, id, labId, level, name, roomName, templateId, reportItems, imageUrlList} = this.row;
      this.form.name = name;
      this.form.checkDate = checkDate;
      this.form.checkUserName = checkUserName;
      this.form.id = id;
      this.form.labId = labId;
      this.form.level = level;
      this.form.roomName = roomName;
      this.form.templateId = templateId;
      this.form.reportItems = [];
      reportItems.map(item => {
        let obj = {
          id: item.id,
          name: item.name,
          violationLevel: item.violationLevel,
          violationRemark: item.violationRemark
        };
        this.form.reportItems.push(obj);
        this.level(this.form.level);
      });
      this.fileList = [];
      imageUrlList.map(item => {
        if (item.url) {
          const url = BASE_URL + item.url;
          this.fileList.push({name: item.url, uid: item.uid, url})
        }
      })
    } else {
      this.form.checkUserName = localStorage.getItem("username");
      this.form.checkDate = moment(new Date()).format(TIME_FORMAT);
      const object = JSON.parse(localStorage.getItem("form"));
      this.form.roomName = object.name;
      this.form.labId = object.id;
      this.form.name = object.reportName;
      this.form.templateId = object.templateId;
      getReportTemplateObtainItem({
        templateId: object.templateId
      }).then(res => {
        if (res.code) {
          this.form.reportItems = [];
          res.items.itemList.map(item => {
            let obj = {id: item.itemId, name: item.itemName, violationLevel: 0, violationRemark: ""};
            this.form.reportItems.push(obj);
          })
        }
      });
    }

  },
  methods: {
    handleUploadSuccess(e) {
      this.fileList = e;
    },
    handleClose() {
      this.form = {
        name: "",
        roomName: "",
        checkUserName: "",
        checkDate: "",
        level: 0,
        imageUrls: "",
        reportItems: [
          {violationLevel: 0},
          {violationLevel: 0}
        ]
      }
      this.$emit("update:isDrawer", false);
      this.$emit("update:row", {})
    },
    handleViolationLevelNum(type) {
      let num = 0;
      this.form.reportItems.map(item => {
        if (item.violationLevel === type) {
          num += 1;
        }
      });
      return num;
    },
    handleSubmitReport() {
      this.form.imageUrlList = [];
      this.fileList.map(item => {
        this.form.imageUrlList.push({url: item.name, uid: item.uid})
      });
      if (JSON.stringify(this.row) === "{}") {
        addReportRoomReport(this.form).then(res => {
          this.handleMessage(res, this.$t('room.addCheckSuccess'));
        })
      } else {
        editReportRoomReport(this.form).then(res => {
          this.handleMessage(res, this.$t('room.updateCheckSuccess'));
          localStorage.removeItem("form");
        })
      }
    },
    handleMessage(res, title) {
      if (res.code) {
        this.$message.success(title);
        this.$emit("handle");
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    },
    handleReportPdf() {
      let pdfName = this.form.name;
      this.$confirm(this.$t('room.downloadPDF'), this.$t('room.exportReport'),{
          cancelButtonText: this.$t('common.cancel'),
          confirmButtonText: this.$t('common.confirm')
      }).then(res => {
          mixin.methods.downloadPDF(pdfName, this.$refs.report);

      })
    },
    level(value) {
      this.gradeTypes.map(item => {
        if (item.id == value) {
          return this.levelName = item.name;
        }
      })
    },
    handleViolationLevel(row, value) {
      let levelName;
      this.violationTypes.map(item => {
        if (item.id == row.violationLevel) {
          levelName = item.name;
        }
      });
      return levelName;
    }
  },
  computed: {
    // 检查项总数
    sum() {
      return this.form.reportItems.length;
    },
    // 不违规总数
    noViolationLevelNum() {
      return this.handleViolationLevelNum(0);
    },
    // 普通违规总数
    commonViolationLevelNum() {
      return this.handleViolationLevelNum(1);
    },
    // 严重违规
    seriousnessViolationLevelNum() {
      return this.handleViolationLevelNum(3);
    },
    // 中等违规
    mediumViolationLevelNum() {
      return this.handleViolationLevelNum(2);
    },
  }
}
</script>

<style lang="less" scoped>
.preview-img {
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  width: 148px;
  height: 148px;
  margin: 0 8px 8px 0;
}

.empty {
  width: 100%;
  height: 148px;
  text-align: center;
  line-height: 148px;
}

.report-edit {
  padding: 16px;
}

/deep/ .el-drawer {
  min-width: 900px !important;
}

p {
  font-size: 16px;
  padding-left: 16px;
  position: relative;
  margin-bottom: 16px;

  &::before {
    display: inline-block;
    content: '';
    height: 18px;
    width: 4px;
    background-color: #303030;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
}

/deep/ .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/deep/ .avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

/deep/ .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

/deep/ .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.amount {
  margin-bottom: 16px;
  color: #7cb305;

  span {
    margin-right: 24px;
  }
}
</style>
