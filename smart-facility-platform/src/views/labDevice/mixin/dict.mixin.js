import i18n from "@/i18n";

export default {
    data() {
        return {
            tableColumns: [
                {
                    title: i18n.t('system.logDate'),
                    dataIndex: "createDate",
                    width: 130,
                },
                {
                    title: i18n.t('labDevice.labDeviceName'),
                    dataIndex: "instrumentName",
                    width: 160,
                },
                {
                    title: i18n.t('labDevice.labDeviceNo'),
                    dataIndex: "instrumentNo",
                    width: 160,
                },
                {
                    title: i18n.t('labDevice.useTime'),
                    dataIndex: "useTime",
                    width: 180,
                },
                {
                    title: i18n.t('labDevice.useCount'),
                    dataIndex: "useCount",
                    width: 150,
                },
                {
                    title: i18n.t('labDevice.labDeviceRatedWorkingTime'),
                    dataIndex: "workingHours",
                    width: 150,
                },
                {
                    title: i18n.t('statistics.labDeviceUserRate'),
                    dataIndex: "useRate",
                    width: 150,
                },
                {
                    title: i18n.t('labDevice.reservationTime'),
                    dataIndex: "reservationTime",
                    width: 180,
                },
                {
                    title: i18n.t('labDevice.reservationCount'),
                    dataIndex: "reservationCount",
                    width: 180,
                },
                {
                    title: i18n.t('labDevice.alarmCount'),
                    dataIndex: "alarmCount",
                    width: 150,
                },

                {
                    title: i18n.t('labDevice.labDeviceType'),
                    dataIndex: "typeNames",
                    width: 180,
                    slot: "labDeviceType"
                },
                {
                    title: i18n.t('common.owningDepartment'),
                    dataIndex: "deptNames",
                    width: 180,
                    slot: "deptNames"
                },
                {
                    title: i18n.t('labDevice.labDeviceBrand'),
                    dataIndex: "brandName",
                    width: 130,
                },
                {
                    title: i18n.t('labDevice.labDeviceModel'),
                    dataIndex: "instrumentModel",
                    width: 150,
                },
                {
                    title: i18n.t('labDevice.addressScreen'),
                    dataIndex: "localName",
                    width: 150,
                    slot: "localName"
                },
                {
                    title: i18n.t('common.owningRoom'),
                    dataIndex: "roomName",
                    width: 150,
                },
                {
                    title: i18n.t('common.principal'),
                    dataIndex: "adminName",
                    width: 150,
                }
            ]
        }
    }
}