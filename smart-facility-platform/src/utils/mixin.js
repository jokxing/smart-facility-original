const mixin = {
    mounted() {
        this.onListenerResize()
        this.$nextTick(() => this.windowSize())
    },
    methods: {
        /**
         *
         * @param that 使用组件this
         * @param ref table  ref属性值
         */
        onListenerResize() {
            window.addEventListener("resize", this.windowSize)
        },
        windowSize() {
        },
        //excel表格下载
        /**
         * @param data
         * @param name
         * @returns {Promise<void>}
         */
        async download(data, name) {
            const blob = new Blob([data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
            });
            await this.handleDownloadFiles(blob, name);
        },
        handleDownloadFiles(blob, name) {
            const fileName = name;
            if ("download" in document.createElement("a")) {
                const elink = document.createElement("a");
                if (fileName) {
                    elink.download = fileName;
                }
                elink.style.display = "none";
                elink.href = URL.createObjectURL(blob);
                document.body.appendChild(elink);
                elink.target = "_blank";
                elink.click();
                URL.revokeObjectURL(elink.href);
                document.body.removeChild(elink);
            } else {
                navigator.msSaveBlob(blob, fileName);
            }
        },
        //pdf下载
        downloadPDF(data, name) {
            const blob = new Blob([data], {
                type: "application/pdf;charset=utf-8",
            });
            this.handleDownloadFiles(blob, name);
        },
        isIE() {
            return !!window.ActiveXObject || "ActiveXObject" in window;
        },
        isIE11() {
            return (/Trident\/7\./).test(navigator.userAgent);
        }
    },
    destroyed() {
        window.removeEventListener("resize", this.windowSize);
    }
}

export default mixin
