import i18n from "@/i18n";
export default {
  data () {
    return {
      STATUSSET: [
        {
          label: i18n.t("common.all"),
          value: null
        },
        {
          label: i18n.t("common.normal"),
          value: 1,
        },
        {
          label: i18n.t("common.abnormal"),
          value: 2,
        },
        {
          label: i18n.t("labDevice.otherStatus"),
          value: 3,
        },

      ],
      
      /*-------------运行状态-------------*/
      INTELLEGENTSOKETSTATUS: [
        {
          label: i18n.t("common.all"),
          value: 10,
        },
        {
          label: i18n.t("labDevice.runing"),
          value: 1,
        },

        {
          label: i18n.t("labDevice.standbyPowerOff"),
          value: 0,
        },
        {
          label: i18n.t("labDevice.standbyPowerOff"),
          value: 2,
        },

      ],
      
      TABLECOLUMN: [
        //主页与实验室设备
        {
          title: i18n.t("labDevice.labDeviceName"),
          dataIndex: "name",
          slot: "name",
          width: "150",
        },
        {
          title: i18n.t("labDevice.labDeviceNo"),
          dataIndex: "no",
          width: "130",
          sortable: true
        },
        {
          title:i18n.t("common.owningDepartment"),
          width: "110",
          dataIndex: "departmentName",
        },
        {
          title: i18n.t("common.owningRoom"),
          dataIndex: "roomName",
          width: "120"
        },
        {
          title: i18n.t("labDevice.labDeviceClass"),
          dataIndex: "typeName",
          width: "120"
        },
        {
          title: i18n.t("labDevice.runStatus"),
          dataIndex: "status",
          slot: "status",
        },
        {
          title: i18n.t("labDevice.paramStatus"),
          dataIndex: "bingStatus",
          slot: "bingStatus",
        },
        {
          title: i18n.t("common.creatDate"),
          dataIndex: "createDate",
          sortable: true,
          slot: "createDate",
          width: "180"
        },
        {
          title: i18n.t("common.handle"),
          dataIndex: "operate",
          slot: "operate",
        },

      ],
      statusArray: [
        {
          value: null,
          label: i18n.t('common.all'),
        },
        {
          value: 1,
          label: i18n.t('labDevice.runing'),
        },
        {
          value: 0,
          label: i18n.t('labDevice.unruning'),
        },
        {
          value: 4,
          label: i18n.t('system.unBind'),
        }

      ],
      statusArray1: [
        {
          value: null,
          label: i18n.t('common.all'),
        },
        {
          value: 1,
          label: i18n.t('labDevice.runing'),
        },
        {
          value: 0,
          label: i18n.t('labDevice.unruning'),
        },
        {
          value: -1,
          label: i18n.t('labDevice.unruning'),
        },
        {
          value: 2,
          label: i18n.t('labDevice.unruning'),
        },
        {
          value: 4,
          label: i18n.t('system.unBind'),
        },
        {
          value: 3,
          label: i18n.t('system.unBind'),
        }

      ],
      sensorsStatus: [
        {
          value: null,
          label: i18n.t('common.all'),
        },
        {
          value: 1,
          label: i18n.t('common.normal'),
        },
        {
          value: 2,
          label: i18n.t('common.abnormal'),
        },
        {
          value: -100,
          label: i18n.t('common.offLine'),
        },
        {
          value: 11,
          label: i18n.t('system.unBind'),
        },
        {
          value: 4,
          label: i18n.t('system.unBind'),
        }

      ],
      monitorStatus: [
        {
          value: null,
          label: i18n.t('common.all'),
        },
        {
          value: 1,
          label: i18n.t('common.monitored'),
        },
        {
          value: 3,
          label: i18n.t('common.unmonitor'),
        },
        {
          value: 2,
          label: i18n.t('system.unBind'),
        },

      ]
    }
  }
}