<template>
  <div class="user">
    <div class="system-edit">
      <el-button v-if="!isEdit" type="primary" class="el-icon-edit" @click="handleEdit">&nbsp;{{ $t('common.edit') }}</el-button>
    </div>
    <el-tabs v-model="activeName" class="form-default session" @tab-click="handleClick">
      <el-tab-pane :label="$t('system.updateMessage')" name="first">
        <div v-loading="infoLoading">
          <el-form
              ref="form"
              :model="form"
              label-position="left" label-width="auto"
              class="form-default">
            <el-form-item :label="$t('common.owningDepartment')">
              <el-input
                  v-model="form.departmentName"
                  disabled
                  class="input-with-select"
                  v-if="(roleId >= 4 || !isEdit)"
              ></el-input>
              <select-department v-else :select-tree-value="form.departmentId" :department-id.sync="form.departmentId"/>
            </el-form-item>
            <el-form-item :label="$t('system.loginName')">
              <el-input
                  v-model="form.loginId"
                  disabled
                  class="input-with-select"
                  :placeholder="$t('common.pleaseInput')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('system.loginPwd')">
              <el-input
                  v-model.trim="form.pwd"
                  :disabled="!isEdit"
                  maxlength="20"
                  class="input-with-select"
                  oninput="value=value.replace(/[^A-Za-z0-9]/g,'')"
                  :placeholder="!isEdit && !form.pwd ? '' : $t('system.twoAnd20')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('system.password')">
              <el-input
                  v-model.trim="form.pwd1"
                  :disabled="!isEdit"
                  maxlength="20"
                  class="input-with-select"
                  oninput="value=value.replace(/[^A-Za-z0-9]/g,'')"
                  :placeholder="!isEdit && !form.pwd1 ? '' : $t('system.inputPassword')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('labDevice.member')">
              <el-input
                  v-model.trim="form.name"
                  :disabled="!isEdit"
                  maxlength="6"
                  class="input-with-select"
                  :placeholder="$t('system.inputName')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('system.role')">
              <el-input
                  v-model="form.roleName"
                  disabled
                  class="input-with-select"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('labDevice.telNo')">
              <el-input
                  v-model.trim="form.tel"
                  :disabled="!isEdit"
                  maxlength="11"
                  class="input-with-select"
                  oninput="value=value.replace(/[^10-9]/g, '')"
                  :placeholder="$t('system.telNo')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('system.email')">
              <el-input
                  v-model.trim="form.email"
                  :disabled="!isEdit"
                  class="input-with-select"
                  :placeholder="!isEdit && !form.email ? '' : $t('system.inputEmail')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.remark')" prop="remark">
              <el-input
                  v-model.trim="form.remark"
                  maxlength="50"
                  :placeholder="!isEdit && !form.remark ? '' : $t('common.inputRemark')"
                  :disabled="!isEdit"
                  show-word-limit
                  class="system-input"
                  type="textarea"
              ></el-input>
            </el-form-item>
            <el-form-item v-if="isEdit">
              <el-button
                  :loading="loading"
                  type="primary"
                  @click="handleSubmit('form')"
              >{{ $t('system.save') }}
              </el-button>
              <el-button @click="handleCancle">{{ $t('common.cancel') }}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('system.bindWechat')" name="second">
        <!--    微信报警设置    -->
        <!-- <div>
          <div class="title">设置</div>
          <div class="margin-small">采用的通知方式 <span></span></div>
          <el-radio-group class="margin-small" @change="handleChangeWeixin" v-model="radio">
            <el-radio :label="0">个人微信</el-radio>
            <el-radio :label="1">企业微信</el-radio>
          </el-radio-group>
          <el-alert
              title="温馨提示：选择企业微信通知后，将不再发送个人微信报警通知,登录功能不受影响"
              type="warning"
              show-icon
              :closable="false">
          </el-alert>
        </div> -->
        <div class="title margin-center">{{ $t('system.bindUserWechat') }}</div>
        <el-form label-width="0px">
          <el-form-item>
            <div class="margin-small">{{ title }}</div>
            <p>
              <img :src="weixinUrl" alt="">
            </p>
            <p v-if="weixinName">{{ weixinName }}</p>
            <p>{{ $t('system.bindWechat1') }}</p>
            <p>{{ $t('system.bindWechat2') }}</p>
            <p>{{ $t('system.bindWechat3') }}</p>
            <p class="row">{{ $t('system.bindWechat4') }}</p>
            <el-button :type="bandingType ? 'danger' : 'success'" @click="handleBindingWeixin"><i
                class="icon-weixin"></i> {{ bandingName }}
            </el-button>
          </el-form-item>
        </el-form>
        <!-- <div class="title">绑定企业微信</div>
        <div class="margin-small">{{ qyWechat ? "您当前绑定的企业微信账号为：" : "您还没有绑定企业微信" }}</div>
        <div class="qy-wechat" v-show="qyWechat">企业微信账号：<span class="normal">{{ qyWechat }}</span></div>
        <el-button :type="qyWechat ? 'danger' : 'success'" @click="handleBindQyWechat">{{ qyWechat ? "解绑企业微信账号" : "立即绑定企业微信账号" }}</el-button> -->
      </el-tab-pane>
    </el-tabs>
    <div class="wx-binding-steps session" v-if="activeName === 'second'">
      <div class="head">
        <div class="title">{{ $t('system.bindStep') }}</div>
      </div>
      <div class="box">
        <div class="steps">
          <div class="steps-num">
            <img src="../../assets/systemImages/steps-01.png">
          </div>
          <p>{{ $t('system.bindWechat5') }}</p>
          <img class="img-01" src="../../assets/systemImages/qrcode.png">
        </div>
        <div class="right">
          <img src="../../assets/systemImages/right.png">
        </div>
        <div class="steps">
          <div class="steps-num">
            <img src="../../assets/systemImages/steps-02.png">
          </div>
          <p >{{ $t('system.bindWechat6') }}</p>
          <img class="img-02" src="../../assets/systemImages/official-account.png">
        </div>
        <div class="right">
          <img src="../../assets/systemImages/right.png">
        </div>
        <div class="steps">
          <div class="steps-num">
            <img src="../../assets/systemImages/steps-03.png">
          </div>
          <p>{{ $t('system.bindWechat7') }}</p>
          <img class="img-03" src="../../assets/systemImages/official-account-msg.png">
        </div>
      </div>
    </div>
    <el-dialog :title="$t('system.bindWechat8')" :visible.sync="isImage">
      <h3>{{ $t('system.bindWechat9') }}</h3>
      <div class="wexin-image">
        <img :src="dialogImageUrl" alt="" width="100%"/>
      </div>
    </el-dialog>
    <el-dialog :title="$t('system.bindQyWechat')" :visible.sync="isBindQyWechat">
      <el-form label-position="left" label-width="auto">
        <el-form-item :label="$t('system.tel')" >
          <el-input class="select-change-p" v-model="qyTel" :placeholder="$t('system.inputTel')"/>
        </el-form-item>
      </el-form>
      <el-alert
          :title="$t('system.bindQyWechatPs')"
          type="warning"
          center
          show-icon
          :closable="false">
      </el-alert>
      <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :loading="disabled" type="primary" @click="handleQyWechat()">{{ $t('common.confirm') }}</el-button>
    </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  getBdWeiXinOpenId,
  getUserInfo, getWechatAlarmType,
  getWeixinQrCodeUrl,
  getWxUnbundle, postBindQyWechat,
  postUnBindQyWechat,
  updateUserBasic
} from "@/api/user";
import SelectDepartment from "@c/SelectdePartment";
import {ERROR} from "@/utils/constant";

let time = null;
let time1;
export default {
  name: "User",
  components: {SelectDepartment},
  inject: ["reload"],
  data() {
      const _this = this;
    return {
      // 用户层级
      roleId: JSON.parse(localStorage.getItem('USERINFO')).roleId,
      form: {
        name: "",
        money: 0,
        linkMan: "",
        tel: "",
        email: "",
        address: "",
        remark: "",
        pwd: "",
        departmentId: ""
      },
      isEdit: false,
      loading: false,
      infoLoading: true,
      activeName: "first",
      weixinUrl: "",
      weixinName: "",
      bandingType: 0,
      radio: 0,
      bandingName: _this.$t('system.bindWechat10'),
      title:_this.$t('system.bindWechat11'),
      roles: [],
      isImage: false,
      dialogImageUrl: "",
      qyWechat: "",
      qyTel: "",
      isBindQyWechat: false,
      disabled: false
    };
  },
  created() {
    this.getInit()
  },
  watch: {
    isImage: function (value) {
      if (!value) {
        clearInterval(time1);
      }
    }
  },
  methods: {
    handleQyWechat() {
      const patternTel = /^(13[0-9]|14[5|7]|15[0-9]|18[0-9]|17[0-9]|19[0-9])\d{8}$/g;

      if (this.qyTel && !patternTel.test(this.qyTel)) {
        return this.$message.warning(this.$t('system.telRule2'));
      }
      this.disabled = true;
      postBindQyWechat({tel: this.qyTel}).then(res => {
        this.disabled = false;
        if (res.code) {
          this.qyWechat = res.items;
          this.handleClose();
          this.$message.success(this.$t('system.bindWechat12') + res.items);
        } else {
          this.$message.error(res.message)
        }
      }).catch(e => {
        this.disabled = false;
        this.$message.error(e);
      })
    },
    handleClose() {
      this.isBindQyWechat = false;
      this.qyTel = "";
    },
    handleBindQyWechat() {
      if (!this.qyWechat) {
        this.isBindQyWechat = true;
      } else {
        this.$confirm(this.$t('system.unBindWechat'), this.$t('system.unBindWechat1'), {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
          type: "warning"
        }).then(() => {
          postUnBindQyWechat().then(res => {
            if (res.code) {
              this.qyWechat = "";
              this.$message.success(res.items);
            } else {
              this.$message.error(res.message);
            }
          })
        }).catch(() => {
          this.$message.info(this.$t('common.cancelHandle'));
        })
      }
    },
    getInit(){
      getUserInfo().then(res => {
        this.infoLoading = false;
        if (res.code) {
          const {name, tel, loginId, id, departmentId, departmentName, email, roles, weixinType,remark, qyweixinUserId} = res.items;
          this.form.name = name;
          this.form.tel = tel;
          this.form.loginId = loginId;
          this.form.id = id;
          this.form.departmentName = departmentName;
          this.form.departmentId = departmentId.toString();
          this.form.email = email;
          this.form.roleName = roles[0].name;
          this.form.remark = remark;
          this.qyWechat = qyweixinUserId;
          this.radio = weixinType ?? 0;
            if (res.items.name) {
                localStorage.setItem("username", res.items.name);
            } else {
                localStorage.setItem("username", res.items.loginId);
            }
            localStorage.setItem("USERINFO", JSON.stringify(res.items));
        } else {
          this.$message.error(ERROR)
        }
      });
    },
    handleBindingWeixin() {
      if (this.weixinUrl || this.bandingType) {
        getWxUnbundle().then(res => {
          if (res.code) {
            this.weixinUrl = "";
            this.weixinName = "";
            this.title = this.$t('system.bindWechat11');
            this.bandingType = 0;
            this.bandingName = this.$t('system.bindWechat10');
            this.$message.success(this.$t('common.unBindSuccess'))
          } else {
            this.$message.error(res.message);
          }
        })
      } else {
        getWeixinQrCodeUrl().then(res => {
          if (res.error === "0") {
            this.isImage = true;
            this.dialogImageUrl = res.qrcode;
            time1 = setInterval(() => {
              this.handleWeixin();
            }, 1000)
          } else {
            this.$message.error(res.message);
          }
        })
      }

    },
    handleWeixin() {
      getBdWeiXinOpenId().then(res => {
        if (res.code) {
          if (res.items.state) {
            clearInterval(time1);
            this.title = this.$t('system.bindWechatSuccess');
            this.bandingType = 1;
            this.bandingName = this.$t('system.unBindWechat2');
            this.isImage = false;
            this.weixinUrl = res.items.wxUserInfo.headimgurl ?? this.$t('labDevice.notImg');
            this.weixinName = res.items.wxUserInfo.nickname ?? "";
          }
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleClick(tab, event) {
      this.isEdit = true;
      if (this.activeName !== "first") {
        this.handleWeixin();
        this.isEdit = true;
      } else {
        this.isEdit = false;
      }
    },
    handleEdit() {
      this.isEdit = true;
    },
    handleCancle() {
      this.isEdit = false;
      this.getInit()
    },
    handleSubmit() {
      delete this.form.roleName;
      delete this.form.departmentName;
      if (this.form.pwd && this.form.pwd !== this.form.pwd1) {
        return this.$message.error(this.$t('system.passwordUnlike'));
      }
      const patternTel = /^(13[0-9]|14[5|7]|15[0-9]|18[0-9]|17[0-9]|19[0-9])\d{8}$/g;
      if (this.form.tel && !patternTel.test(this.form.tel)) {
        return this.$message.warning(this.$t('system.telRule2'));
      }
      const patternEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/g;
      if (this.form.email && !patternEmail.test(this.form.email)) {
        return this.$message.warning(this.$t('system.emailRule'));
      }
      this.infoLoading = true;
      updateUserBasic(this.form).then(res => {
        if (res.code) {
          if (this.form.pwd) {
            this.$message.warning(this.$t('system.resetPassword'));
            time = setTimeout(() => {
              this.$router.push("/login");
              localStorage.clear();
            }, 1500)
          } else {
            this.$message.success(this.$t('common.editSuccess'));
            this.reload();
          }
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleChangeWeixin(e) {
      getWechatAlarmType({type: e}).then(res => {
        if (res.code) {
          this.$message.success(res.items);
        } else {
          this.$message.error(res.message);
          this.radio = 0;
        }
      })
    }
  },
  beforeDestroy() {
    clearTimeout(time);
  }
};
</script>
<style lang="less" scoped>
@import "../../style/default.less";
@import './index.less';

.form-default {

  /deep/ .el-form-item__label {
    color: #555555;
    font-weight: 400;
    line-height: 40px;
  }

  /deep/ .el-form-item__content {
    line-height: 40px;
  }

  .el-select {
    width: 200px;
    height: 40px;

    .el-input__inner {
      height: 40px;
      line-height: 40px;
    }
  }

  .el-input {
    width: 200px;

    /deep/ .el-input__inner {
      height: 40px;
      line-height: 40px;
    }
  }

  .el-select {
    width: 200px;

    /deep/ .el-input__inner {
      height: 40px;
      line-height: 40px;
    }
  }

  .input-block {
    .el-input {
      width: 100%;
    }
  }

  .el-input-number {
    width: 200px;
    line-height: 40px;

    .el-input-number__decrease,
    .el-input-number__increase {
      height: 38px;
    }
  }
}
.wexin-image {
  margin: 0 auto;
  width: 300px;
  height: 300px;
}
.user {
  position: relative;
}
.title {
  font-size: 20px;
  color: #3F51B5;
  font-weight: bold;
  margin-bottom: 16px;
}
.margin-small {
  font-size: 16px;
  font-weight: 600;
}
.qy-wechat {
  margin-left: 30px;
  margin-bottom: 20px;
}

.wx-binding-steps{
  .head{
    margin-top: 0;
  }
  .box{
    margin-top: 34px;
    display: flex;
    align-items: center;
    .steps{
      width: 300px;
      height: 340px;
      background-color: #F7F8FA;
      border-radius: 8px;
      padding: 16px 20px;
      position: relative;
      text-align: center;
      .steps-num{
        position: absolute;
        top: -14px;
        left: 19px;
        img{
          width: 35px;
          margin-top: 0;
        }
      }
      p{
        width: 220px;
        height: 108px;
        float: right;
        color: #666;
        line-height: 1.5;
        text-align: initial;
      }
      img{
        margin-top: 18px;
        &.img-01{
          width: 180px;
        }
        &.img-02{
          width: 248px;
        }
        &.img-03{
          width: 200px;
        }
      }
    }
    .right{
      margin: 0 2px;
      img{
        width: 56px;
      }
    }
  }
}
</style>
