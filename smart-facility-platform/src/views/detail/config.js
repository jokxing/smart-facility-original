import i18n from "@/i18n";
export const orderStatusSet = [
  {
    label: i18n.t('labDevice.inUse'),
    value: 1
  },
  {
    label: i18n.t('labDevice.notStarted'),
    value: 0
  },
  {
    label: i18n.t('labDevice.finished'),
    value: 2
  },
  {
    label: i18n.t('labDevice.isCancel'),
    value: 3
  }
];
export const maintenanceStatusSet = [
  {
    label: i18n.t('labDevice.maintained'),
    value: 0
  },
  {
    label: i18n.t('labDevice.maintainedFin'),
    value: 1
  }
];

export const bindedStatusSet = [
    {
        label: "未激活",
        value: 0,
        code: 0
    },
    {
        label: "正常",
        value: 1,
        code: 1
    },
    {
        label: "报警",
        value: 2,
        code: 2
    },
    {
    label: "离线",
    value: -100,
    code:-100
  }
];
