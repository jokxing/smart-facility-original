<template>
    <el-dialog
        :width="width"
        :visible="true"
        :before-close="goIsFullcalendar"
        destroy-on-close
        append-to-body
        top="6vh"
        :close-on-click-modal="false">
            <div class='demo-app' v-loading="loading">
                <div class='demo-app-main' :class="{ 'ban-pastTime': isBanPastTime }">
                    <FullCalendar
                        ref="fullCalendar"
                        class='demo-app-calendar'
                        :options='calendarOptions'>
                            <template v-slot:eventContent='arg'>
                                <b>{{ arg.timeText }}</b>
                                <i>{{ arg.event.title }}</i>
                            </template>
                    </FullCalendar>
                </div>
            </div>
    </el-dialog>
</template>

<script>
    import FullCalendar from '@fullcalendar/vue'
    import dayGridPlugin from '@fullcalendar/daygrid'
    import timeGridPlugin from '@fullcalendar/timegrid'
    import interactionPlugin from '@fullcalendar/interaction'
    import { getInstrumentReservationSchedulerListV1 } from "@/api/labDevice";
    import { minutesExactly } from './config.js'
    import moment from "moment";
    export default {
        props: {
            // 禁止过去时间
            isBanPastTime: {
                type: Boolean,
                default: null
            },
            width: {
                type: String,
                default: "50%"
            },
            id: {
                type: Number,
                default: null
            }
        },
        components: {
            FullCalendar
        },
        data() {
            const _this = this;
            return {
                loading: false,
                calendarOptions: {
                    height: '100%',
                    plugins: [
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin
                    ],
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'timeGridWeek,timeGridDay'
                    },
                    buttonText: {
                        today: _this.$t('common.day'),
                        week: _this.$t('common.week1'),
                        day: _this.$t('common.day3')
                    },
                    events: [
                        {
                            groupId: 'testGroupId',
                            start: moment(minutesExactly()).format(),
                            end: '2100-01-01T00:00:00',
                            display: 'inverse-background'
                        },
                    ],
                    slotLabelFormat: {
                        hour: 'numeric',
                        minute: "numeric"
                    },
                    initialView: 'timeGridWeek',
                    slotDuration: '00:15:00',
                    slotLabelInterval: 15,
                    locale: 'zh-cn', // 切换语言，当前为中文
                    editable: false,
                    selectable: true,
                    selectMirror: true,
                    dayMaxEvents: true,
                    weekends: true,
                    select: this.handleDateSelect,
                    datesSet: this.datesSet,
                    // eventClick: this.handleEventClick,
                    // eventsSet: this.handleEvents,
                },
                currentEvents: [],
                startDate: "",
                endDate: ""
            }
        },
        mounted() {
            let lang = localStorage.getItem('lang') || 'zh-cn';
            if (lang !== 'en') {
                lang = 'zh-cn';
            }
            this.calendarOptions.locale = lang;
            this.$nextTick(() => {
                this.handleDatesRender()

                const prevBtn = document.querySelector('.fc-prev-button')
                prevBtn.addEventListener('click', () => {
                    this.handleDatesRender()
                })

                const nextBtn = document.querySelector('.fc-next-button')
                nextBtn.addEventListener('click', () => {
                    this.handleDatesRender()
                })

                const todayBtn = document.querySelector('.fc-today-button')
                todayBtn.addEventListener('click', () => {
                    this.handleDatesRender()
                })

                const timeGridWeek = document.querySelector('.fc-timeGridWeek-button')
                timeGridWeek.addEventListener('click', () => {
                    this.handleDatesRender()
                })

                const timeGridDay = document.querySelector('.fc-timeGridDay-button')
                timeGridDay.addEventListener('click', () => {
                    this.handleDatesRender()
                })
            })
        },
        methods: {
            handleDatesRender() {
                const time = this.$refs.fullCalendar.getApi().currentDataManager.state.dateProfile.renderRange;
                this.startDate = moment(time.start).format("YYYY-MM-DD") + " 00:00:00";
                this.endDate = moment(time.end).format("YYYY-MM-DD") + " 00:00:00";
                var data = {
                    instrumentId: this.id,
                    startDate: this.startDate,
                    endDate: this.endDate
                }
                this.loading = true;
                getInstrumentReservationSchedulerListV1(data).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.calendarOptions.events = [
                            {
                                groupId: 'testGroupId',
                                start: moment(minutesExactly()).format(),
                                end: '2100-01-01T00:00:00',
                                display: 'inverse-background'
                            },
                        ];
                        const items = res.items
                        for(var i = 0;   i < items.length; i++){
                            this.calendarOptions.events.push({
                                title: items[i].userName,
                                start: items[i].timeFrom,
                                end: items[i].timeTo,
                            })
                        }
                    }
                })
            },
            handleWeekendsToggle() {
                this.calendarOptions.weekends = !this.calendarOptions.weekends
            },
            handleDateSelect(selectInfo) {
                // console.log(selectInfo)
                let calendarApi = selectInfo.view.calendar

                var data = {
                    start: selectInfo.startStr,
                    allDay: selectInfo.allDay
                }

                //月模式判断年月日 不能少于今天
                if(selectInfo.allDay){
                    var myDate = moment(new Date()).format('YYYY-MM-DD');
                    var myGetTime = new Date(myDate).getTime();
                    var selectInfoStart = new Date(selectInfo.startStr).getTime();
                    var endStr = moment(new Date(selectInfo.endStr).getTime() - 24*60*60*1000).format('YYYY-MM-DD'); //插件BUG，多一天，所以手动减少一天
                    var selectInfoEnd = new Date(endStr).getTime()

                    data["end"] = endStr

                    if(selectInfoStart < myGetTime || selectInfoEnd < myGetTime){
                        this.$message.error(this.$t('labDevice.orderTime2'));
                        calendarApi.unselect()
                    }else{
                        this.$emit('handleSetDate', data)
                    }
                }else{ //周或日模式判断时分秒 不能少于实时
                    var myGetTime = new Date().getTime();
                    var selectInfoStart = new Date(selectInfo.startStr).getTime();
                    var selectInfoEnd = new Date(selectInfo.endStr).getTime()
                    data["end"] = selectInfo.endStr

                    if(selectInfoStart < myGetTime || selectInfoEnd < myGetTime){
                        this.$message.error(this.$t('labDevice.orderTime1'));
                        calendarApi.unselect()
                    }else{
                        this.$emit('handleSetDate', data)
                    }
                }
            },
            // handleEventClick(clickInfo) {
            //     console.log("111")
            //     // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
            //     //     clickInfo.event.remove()
            //     // }
            // },
            // handleEvents(events) {
            //     console.log("111")
            //     // this.currentEvents = events
            // },
            goIsFullcalendar () {
                this.$emit("goIsFullcalendar")
            }
        }
    }
</script>

<style lang='less' scope>
    .demo-app {
        display: flex;
        min-height: 100%;
        height: 780px;
        font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
        font-size: 14px;

        .demo-app-main {
            flex-grow: 1;
            padding: 2em;
        }

        .fc .fc-col-header-cell-cushion,
        .fc .fc-daygrid-day-number{
            color: #333;
        }

        .fc-direction-ltr .fc-button-group > .fc-button:not(:first-child),
        .fc .fc-button-primary{
            background-color: #409EFF;
            border-color: #409EFF;
        }
        .fc .fc-button-primary:not(:disabled):active, .fc .fc-button-primary:not(:disabled).fc-button-active{
            background-color: #1f8af9;
            border-color: #1f8af9;
        }
        .fc .fc-button-primary:disabled{
            background-color: #8ac1fc;
            border-color: #8ac1fc;
        }
        .fc .fc-button-primary:focus,
        .fc .fc-button-primary:not(:disabled):active:focus,
        .fc .fc-button-primary:not(:disabled).fc-button-active:focus{
            box-shadow: 0 0 0 0.2rem #1f8af96b;
        }
        .fc .fc-button .fc-icon{
            vertical-align: bottom;
        }

        .fc-event-main {
            span{
                display: flex;
                flex-direction: column;
                i{
                    font-style: initial;
                    font-size: 14px;
                }
            }
        }
        .fc .fc-timegrid-slot{
            height: 4em;
        }

        .ban-pastTime {
            .fc-day-past,
            .fc .fc-bg-event{
                background-color: #eee;
                cursor: no-drop;
                opacity: 1;
            }
        }
        .ban-pastTime .fc-day-past a{
            cursor: no-drop;
            opacity: 0.3;
        }
    }
</style>
