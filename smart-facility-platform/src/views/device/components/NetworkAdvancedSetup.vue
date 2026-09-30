<template>
  <el-form v-model="object" class="advance-setup-form" label-position="left" label-width="auto">
    <el-form-item  v-if="!networkType" :label="$t('hardware.networkType')">
      <el-select
          v-model="object.securityMode"
          :disabled="disabled"
          :style="styleWidth"
          :placeholder="$t('common.placeholder')">
        <el-option
            v-for="item in securityOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label-width="labelWidth" v-if="!networkType" :label="$t('hardware.networkType2')">
      <el-select
          v-model="object.encryptionType"
          :disabled="disabled"
          :style="styleWidth"
          :placeholder="$t('common.placeholder')">
        <el-option
            v-for="item in encryptOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label-width="labelWidth" :label="$t('hardware.dhcp')">
      <el-select
          v-model="object.dhcp"
          :disabled="disabled"
          :style="styleWidth"
          :placeholder="$t('common.placeholder')">
        <el-option :label="$t('hardware.dhcp1')" :value="1"></el-option>
        <el-option :label="$t('hardware.dhcp2')" :value="0"></el-option>
      </el-select>
    </el-form-item>
    <div class="advance-setup" v-if="object.dhcp == 0">
      <el-form-item :label-width="labelWidth" :label="$t('hardware.ipAdress')">
        <el-input v-if="disabled" :value="object.ip" disabled class="select-change-p"/>
        <ip-input v-else :ip="object.ip" @handle="handleIp"/>
      </el-form-item>
      <el-form-item :label-width="labelWidth" :label="$t('hardware.submask')">
        <el-input v-if="disabled" :value="object.submask" disabled class="select-change-p"/>
        <ip-input v-else :ip="object.submask" @handle="handleSubmask"/>
      </el-form-item>
      <el-form-item :label-width="labelWidth" :label="$t('hardware.gateway')">
        <el-input v-if="disabled" :value="object.gateway" disabled class="select-change-p"/>
        <ip-input v-else :ip="object.gateway" @handle="handleGateway"/>
      </el-form-item>
      <el-form-item :label-width="labelWidth" label="DNS">
        <el-input v-if="disabled" :value="object.dns" disabled class="select-change-p"/>
        <ip-input v-else :ip="object.dns" @handle="handleDns"/>
      </el-form-item>
    </div>
  </el-form>
</template>

<script>
import IpInput from "@/views/device/components/IpInput";

const ENCRYPT = [
  {label: "NONE", value: 0,},
  {label: "WEP-H", value: 1},
  {label: "WEP-A", value: 2},
  {label: "TKIP", value: 3},
  {label: "AES", value: 4},
]

const SECURITY = [
  {label: "OPEN", value: 0},
  {label: "SHARED", value: 1},
  {label: "WPAPSK", value: 2},
  {label: "WPA2PSK", value: 3},
]
export default {
  name: "NetworkAdvancedSetup",
  components: {IpInput},
  props: {
    object: {
      type: Object,
      default: () => {}
    },
    labelWidth: {
      type: String,
      default: ""
    },
    styleWidth: {
      type: String,
      default: ""
    },
    networkType: {
      type: [Number, String],
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      encryptOption: ENCRYPT,
      securityOption: SECURITY,
    }
  },
  watch: {
    object: {
      handler: function (newObject) {
        switch (newObject.securityMode) {
          case 0:
            this.encryptOption = [
              {label: "NONE", value: 0,},
              {label: "WEP-H", value: 1},
              {label: "WEP-A", value: 2},
            ];
            break
          case 1:
            this.encryptOption = [
              {label: "NONE", value: 0,},
              {label: "WEP-H", value: 1},
              {label: "WEP-A", value: 2},
            ];
            break
          case 2:
            this.encryptOption = [
              {label: "TKIP", value: 3},
              {label: "AES", value: 4},
            ];
            break
          case 3:
            this.encryptOption = [
              {label: "TKIP", value: 3},
              {label: "AES", value: 4},
            ];
            break
          default:
            this.encryptOption = ENCRYPT;
        }
      },
      deep: true
    }
  },
  methods: {
    handleIpArray() {
    },
    handleIp(item) {
      this.object.ip = this.handleIpRestore(item);
    },
    handleSubmask(item) {
      this.object.submask = this.handleIpRestore(item);
    },
    handleGateway(item) {
      this.object.gateway = this.handleIpRestore(item);
    },
    handleDns(item) {
      this.object.dns = this.handleIpRestore(item);
    },
    handleIpRestore(item) {
      let array = [];
      item.map(e => {
        array.push(e.value);
      })
      return array.join(".");
    },
  }
}
</script>
<style lang="less" scoped>
.advance-setup-form {
  margin: 0 auto;
}
</style>
