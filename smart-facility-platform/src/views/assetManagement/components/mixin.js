import i18n from "@/i18n";
export const picker = {
    shortcuts: [{
        text: i18n.t('common.recentlyWeek'),
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
        }
    }, {
        text: i18n.t('common.recentlyMonth'),
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
        }
    }, {
        text: i18n.t('common.recentlyThreeMonth'),
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
        }
    }]
}

export const picker1 = {
    shortcuts: [{
        text: i18n.t('common.recentlyWeek'),
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
        }
    }, {
        text: i18n.t('common.recentlyMonth'),
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
        }
    }, {
        text: i18n.t('common.recentlyThreeMonth'),
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
        }
    }, {
        text: i18n.t('common.recentlyYear'),
        onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
            picker.$emit('pick', [start, end]);
        }
    }]
}

export function uploadFunction(array, str) {
    const base64 = s => window.btoa(unescape(encodeURIComponent(s)));
    // 循环遍历，每行加入tr标签，每个单元格加td标签
    for (let i = 0; i < array.length; i++) {
        str += '<tr>';
        for (const key in array[i]) {
            // 增加\t为了不让表格显示科学计数法或者其他格式
            str += `<td>${array[i][key] + '\t'}</td>`;
        }
        str += '</tr>';
    }
    // Worksheet名
    const worksheet = 'Sheet1'
    const uri = 'data:application/vnd.ms-excel;base64,';

    // 下载的表格模板数据
    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns="http://www.w3.org/TR/REC-html40">
        <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>${worksheet}</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
        </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        </head><body><table>${str}</table></body></html>`;
    // 下载模板
    window.location.href = uri + base64(template);
}

export function compareDate(dateArr, checked) {
    let curDate = new Date(checked),
        beginDate = new Date(dateArr[0]),
        endDate = new Date(dateArr[1]);
    return curDate >= beginDate && curDate <= endDate;
}
