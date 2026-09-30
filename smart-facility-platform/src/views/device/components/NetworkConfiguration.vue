<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      destroy-on-close
      v-if="dialogVisible"
      append-to-body>
    <el-form v-model="form" label-position="left" label-width="auto">
      <el-form-item :label="$t('hardware.networkMode')">
        <el-select v-model="form.networkMode" :disabled="isDemo" :placeholder="$t('hardware.networkOption')">
          <el-option
              v-for="item in networkOption"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-tabs v-model="networkType">
      <el-tab-pane :label="$t('hardware.wifi')" name="0"></el-tab-pane>
      <el-tab-pane :label="$t('hardware.lan')" name="1"></el-tab-pane>
    </el-tabs>
    <div v-if="networkType == 0">
      <el-form  label-position="left" label-width="auto">
        <el-form-item :label="$t('hardware.wifiName')">
          <el-input class="select-change-p" v-model="form.wifiConfig.ssid" :disabled="isDemo"></el-input>
        </el-form-item>
        <el-form-item :label="$t('hardware.wifipwd')">
          <el-input class="select-change-p" v-model="form.wifiConfig.password" :disabled="isDemo" :show-password="!isDemo"></el-input>
        </el-form-item>
      </el-form>
      <div class="down" @click="down = !down">{{ $t('hardware.highSys') }}<i :class="down ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
      </div>
      <network-advanced-setup
          v-if="down"
          :disabled="isDemo"
          :object="form.wifiConfig"/>
    </div>
    <network-advanced-setup
        v-if="networkType == 1"
        :disabled="isDemo"
        :network-type="networkType"
        :object="form.lanConfig"/>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ isDemo ? $t('common.close') : $t('common.cancel') }}</el-button>
      <el-button v-if="!isDemo" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import NetworkAdvancedSetup from "@/views/device/components/NetworkAdvancedSetup";
import {getDeviceWifiEcho, postDeviceWifiInput} from "@/api/device";
import {postWifiInputBatch} from "@/api/assetTag";

const isDemo = process.env.VUE_APP_DEMO === "true";

export default {
  name: "NetworkConfiguration",
  components: {NetworkAdvancedSetup},
  data() {
      const _this = this;
    return {
      isDemo,
      down: false,
      title: _this.$t('hardware.networkConfiguration'),
      dialogVisible: false,
      form: {
        networkMode: 0,
        wifiConfig: {
          dhcp: 1,
          "dns": "",
          "encryptionType": 0,
          "gateway": "",
          "ip": "",
          "password": "",
          "securityMode": 0,
          "ssid": "",
          "submask": ""
        },
        lanConfig: {
          dhcp: 1,
          "dns": "",
          "gateway": "",
          "ip": "",
          "submask": ""
        },
        equipmentNo: ""
      },
        equipmentIdList: [],
      networkType: "0",
      disabled: false,
      networkOption: [
        {label: _this.$t('hardware.automaticSwitchover'), value: 0},
        {label: "LTE", value: 1},
        {label: "WIFI", value: 2},
        {label: "LAN", value: 3},
      ],
        type: 0
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.networkType = "0";
      this.down = false;
    },
      /**
       *
       * @param type 0:单个设置网络，1：批量设置
       * @param item
       */
    open(type, item) {
        this.type = type;
      this.dialogVisible = true;
      this.down = !!isDemo;
      this.form = {
        networkMode: 0,
        wifiConfig: {
          dhcp: 1,
          "dns": "",
          "encryptionType": 0,
          "gateway": "",
          "ip": "",
          "password": "",
          "securityMode": 0,
          "ssid": "",
          "submask": ""
        },
        lanConfig: {
          dhcp: 1,
          "dns": "",
          "gateway": "",
          "ip": "",
          "submask": ""
        },
        equipmentNo: ""
      }

        if (type === 1) {
            this.equipmentIdList = Array.from(item, ({no}) => no);
            return
        }

      this.form.equipmentNo = item.no;
      getDeviceWifiEcho({
        deviceId: item.id
      }).then(res => {
        if (res.code) {
          if(JSON.stringify(res.items) != "{}"){
            this.form = res.items;
          }
          this.form["equipmentNo"] = item.no;
        }
      })
    },
    handleSubmit() {
      if (isDemo) {
        this.$message.info('本阶段演示未开放联网配置下发。');
        return;
      }
      this.disabled = true;
      if (this.type === 1) {
          postWifiInputBatch({equipmentIdList: this.equipmentIdList,wifiParam: this.form}).then(res => {
              this.disabled = false;
              res.code && this.handleClose();
              this.$message({
                  type: res.code ? "success" : "error",
                  message: res.message,
                  duration: 2000
              })
              this.$emit('handle')
          })
          return
      }
      postDeviceWifiInput(this.form).then(res => {
        this.disabled = false;
        res.code && this.handleClose();
        this.$message({
          type: res.code ? "success" : "error",
          message: res.message,
          duration: 2000
        })
        this.$emit('handle')
      })
    },
    ipVerify(item) {
      const reg = /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/i
      if (reg.test(item)) {
      }
    }
  }
}
</script>

<style lang="less" scoped>
.down {
  height: 40px;
  cursor: pointer;
  line-height: 40px;
  position: relative;
  i{
    position: absolute;
    top: 50%;
    //left: 56px;
    transform: translateY(-50%);
  }
}
</style>
