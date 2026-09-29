import i18n from "@/i18n";
// 门磁状态：0-关闭，1-打开
export const cameraStatus = [
  {
    label: i18n.t('hardware.doorCameraStatusOpen'),
    code: 1,
  },
  {
    label: i18n.t('hardware.doorCameraStatusClosed'),
    code: 0
  }
]

export const doorCameraRunningState = [
  {
    label: i18n.t('hardware.doorCameraRunningStateNormal'),
    code: 1,
  },
  // {
  //   label: i18n.t('hardware.doorCameraRunningStateWaring'),
  //   code: 2
  // },
  {
    label: i18n.t('hardware.doorCameraRunningStateOffline'),
    code: 0
  }
]