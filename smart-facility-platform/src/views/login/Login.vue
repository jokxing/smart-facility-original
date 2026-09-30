<template>
  <div class="login-container">
    <div class="border-box">
      <div class="title-container">
        <img
            alt=""
            class="logo"
            src="../../../src/assets/systemImages/logo-gold.png"/>
        <h3 class="title">{{ $t("login.companyName") }}</h3>
          <div class="language">
              <el-dropdown trigger="click" @command="handleCutLang">
                  <span class="el-dropdown-link ft24">
                    {{ languageName }}<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="zh">中文</el-dropdown-item>
                      <el-dropdown-item command="en">English</el-dropdown-item>
                  </el-dropdown-menu>
              </el-dropdown>
          </div>
      </div>
      <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          autocomplete="on"
          class="login-form"
          label-position="left">
        <p v-if="isDemo" class="demo-login-hint">
          本地演示：账号 {{ demoCredentials.username }} / 密码 {{ demoCredentials.password }}
          / 验证码 {{ demoCredentials.captchaCode }}
        </p>
        <div v-if="!isDemo" class="login-type-change">
          <div class="login-type-change-title">
            <div class="loginTypeChange-title-rectangle">
              {{ loginType }}
            </div>
            <div class="triangle"/>
          </div>
            <div class="login-type-change-img" @click="handleLoginTypeChange">
            <div class="img-triangle"/>
            <img
                v-if="isLoginType"
                alt=""
                src="../../../src/assets/loginImages/weixin.jpg"/>
            <img
                v-else
                alt=""
                src="../../../src/assets/loginImages/windows.jpg"/>
          </div>
        </div>
        <div v-if="isLoginType" class="pc-login">
          <div class="login_type">
            {{ loginTypeTitle }}
          </div>
          <el-form-item prop="username">
            <span class="svg-container">
              <el-icon class="el-icon-s-custom"/>
            </span>
            <el-input
                ref="username"
                v-model.trim="loginForm.username"
                autocomplete="on"
                name="username"
                :placeholder="$t('login.inputUsername')"
                tabindex="1"
                type="text"/>
          </el-form-item>
          <el-tooltip
              v-model="capsTooltip"
              manual
              placement="right">
            <el-form-item prop="password">
              <span class="svg-container">
                <el-icon class="el-icon-lock"/>
              </span>
              <el-input
                  :key="passwordType"
                  ref="password"
                  v-model.trim="loginForm.password"
                  :type="passwordType"
                  autocomplete="on"
                  name="password"
                  :placeholder="$t('login.inputPassword')"
                  tabindex="2"
                  @blur="capsTooltip = false"
                  @keyup.native="checkCapslock"
                  @keyup.enter.native="handleLogin"/>
              <span class="show-pwd" @click="handleShowPwd">
                <i :class="passwordType === 'password'? 'icon-invisible': 'icon-visible'"/>
              </span>
            </el-form-item>
          </el-tooltip>
          <el-form-item prop="captchaCode">
            <el-input
                v-model.trim="loginForm.captchaCode"
                :placeholder="$t('login.captchaCode')"
                style="width: 60%"
                tabindex="3"
                @keyup.enter.native="handleLogin"/>
            <div class="captcha-code-class pointer" @click="handleCaptchaCodeImg">
              <img
                  :src="$BASE64 + imgCode"
                  alt=""
                  style="width: 100%; height: 100%"/>
            </div>
          </el-form-item>
          <el-button
              :disabled="disabled"
              class="login-button"
              size="medium"
              type="primary"
              @click.native.prevent="handleLogin">
              {{ $t("login.login") }}
          </el-button>
        </div>
        <div v-else class="wx-login">
          <div class="login_type">
            {{ loginTypeTitle }}
          </div>
          <div id="weixin" ref="weixin" class="ewm-img-area">
            <img ref="img" alt="" src="">
          </div>
          <div class="weixin-code">
              {{ $t("login.openWeixin") }}<i class="icon-weixin normal"></i>，{{ $t("login.RichScan") }}
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import {getCaptchaCode, getLang, getUserInfo, getWeixin, login} from "@/api/login";
import { postDataAuthDistribute } from "@/api/dataAuth";
import store from "@/store"
import {DEMO_CREDENTIALS} from "@/mock/fixtures/auth";

let time;
const lang = {
    "zh": "中文",
    "en": "English",
}
export default {
  name: "Login",
  data() {
      const _this = this;
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error(_this.$i18n.t("login.inputUsername")));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 4) {
        callback(new Error(_this.$i18n.t("login.passwordRule")));
      } else {
        callback();
      }
    };
    const validateCaptchaCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error(_this.$i18n.t("login.inputCaptchCode")));
      } else {
        callback();
      }
    };
    return {
      isDemo: process.env.VUE_APP_DEMO === 'true',
      demoCredentials: DEMO_CREDENTIALS,
      loginForm: {
        username: "",
        password: "",
        captchaCode: "",
      },
      loginRules: {
        username: [
          {required: true, trigger: "blur", validator: validateUsername},
        ],
        password: [
          {required: true, trigger: "blur", validator: validatePassword},
        ],
        captchaCode: [
          {required: true, trigger: "blur", validator: validateCaptchaCode},
        ],
      },
      loginType: _this.$t("login.weixinRichScan"),
      loginTypeTitle: _this.$t("login.userNameLogin"),
      imgCode: "",
      passwordType: "password",
      capsTooltip: false, //文字状态
      isLoginType: true,
      disabled: false,
      languageName: "中文"
    };
  },
  created() {
     if (screen.width < screen.height) {
        this.$message.warning(this.$t("login.screenWidth"));
    }
    if (localStorage.getItem("lang")) {
        this.languageName = lang[localStorage.getItem("lang")]
    } else {
        this.handleCutLang('zh');
    }
    this.getCaptchaCode();
  },
  mounted() {
    if (this.loginForm.username === "") {
      this.$refs.username.focus();
    } else if (this.loginForm.password === "") {
      this.$refs.password.focus();
    }
  },
  methods: {
      handleCutLang(type) {
          localStorage.setItem('lang', type);
          window.location.reload();
      },
    checkCapslock(e) {
      const {key} = e;
      this.capsTooltip = key && key.length === 1 && key >= "A" && key <= "Z";
    },
    handleLogin() {
      this.disabled = true;
      this.$refs.loginForm.validate(async (valid) => {
        if (!valid) {
          return this.disabled = false;
        } else {
          try {
            const res = await login(this.loginForm);
            if (res.code !== 1) {
              this.$message.error(res.message);
              this.disabled = false
              await this.getCaptchaCode();
            } else {
              localStorage.setItem("token", res.items.token);
              this.$message({
                type: "success",
                message: this.$t("login.loginLoading"),
                duration: 900
              });
              await this.handleGetUserInfo();
            }
          } catch (_) {
            this.$message.error('登录未完成，请重试。');
          } finally {
            this.disabled = false;
          }
        }
      });
    },
    handleGetUserInfo() {

      return getUserInfo().then(res => {
        if (res.code !== 1 || !res.items) throw new Error('无法获取登录用户信息。');
        localStorage.setItem("departmentId", res.items.departmentId);
        if (res.items.name) {
            localStorage.setItem("username", res.items.name);
        } else {
            localStorage.setItem("username", res.items.loginId);
        }
        const level = res.items.roleId === 5 ? 0 : 1;
        store.commit("SETLEVEL", level);
        localStorage.setItem("USERINFO", JSON.stringify(res.items));

        this.disabled = false;
        if (this.isDemo) {
          return this.$router.push('/dashboard');
        }
        this.$router.push("/dashboard");

        if(res.items.roleId === 2){
          if(res.items.deviceSeeFlag === 0){
            var data = {
              dimension: 1,
              type: 1,
              userId: res.items.id
            };
            this.handleDataAuthDistribute(data)
          };
          if(res.items.instrumentSeeFlag === 0){
            var data = {
              dimension: 2,
              type: 1,
              userId: res.items.id
            };
            this.handleDataAuthDistribute(data)
          }
          if(res.items.roomSeeFlag === 0){
            var data = {
              dimension: 3,
              type: 1,
              userId: res.items.id
            };
            this.handleDataAuthDistribute(data)
          }
        }
      })
    },
    handleDataAuthDistribute(item){
      postDataAuthDistribute(item).then()
    },
    handleShowPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    //切换验证码
    handleCaptchaCodeImg() {
      this.getCaptchaCode();
    },
    //获取验证码
    getCaptchaCode() {
      this.loginForm.captchaCode = "";
      return getCaptchaCode({sessionId: this.loginForm.sessionId}).then((res) => {
        this.imgCode = res.items.captchaImageStr;
        this.loginForm.sessionId = res.items.sessionId;
        localStorage.setItem("sessionId", res.items.sessionId);
      }).catch(() => {
        this.$message.error('验证码加载失败，请点击验证码重试。');
      });
    },
    //切换登录方式
    handleLoginTypeChange() {
      this.isLoginType = !this.isLoginType;
      if (this.isLoginType) {
        this.loginType = this.$t("login.weixinRichScan");
        this.loginTypeTitle = this.$t("login.userNameLogin");
        clearInterval(time);
      } else {
        this.loginType =this.$t("login.clickUseLogin");
        this.loginTypeTitle =this.$t("login.richLogin");
        // 使用时间戳去请求二维码，获取扫码
        const token = new Date().getTime();
        getWeixin({token}).then(res => {
          this.$nextTick(() => {
            const url = window.URL || window.webkitURL;
            this.$refs.img.src = url.createObjectURL(res);
          })
        });
        time = setInterval(() => {
          login({token}).then(res => {
            if (res.code && res.items["token"]) {
              localStorage.setItem("token", res.items.token);
              this.handleGetUserInfo();
            }
          })
        }, 2000)
      }
    },
  },
  beforeDestroy() {
    clearInterval(time);
  }
};
</script>

<style lang="less">
@import "../../style/login.less";
.demo-login-hint { color: #fabc43; font-size: 14px; line-height: 1.7; margin-bottom: 12px; }
</style>
