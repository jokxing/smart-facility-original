<template>
	<tki-tree ref="tkitree" :multiple="type !== 'garden' ? true : false" :range="listData" :idKey="'id'" :rangeKey="'name'" :selectParent="type !== 'room' ? true : false" :foldAll="true"
		:title="title" confirmColor="#C39C7C" @confirm="selectChange" />
</template>

<script>
	import tkiTree from "@/components/tki-tree/tki-tree.vue"
	import {
		getMapGarden,
		getDepartment,
		getInstrumentType,
		getEquipmentBindEquipmentType,
		getRoomTree
	} from "@/utils/api.js";
	export default {
		components: {
			tkiTree
		},
		data() {
			const _this = this;
			return {
				listData: [],
				ids: [{
					level: 0,
					id: null
				}],
				type: "garden",
				title: _this.$t('other.addressScreen')
			}
		},
		methods: {
			open(type, arr) {
				if (Object.prototype.toString.call(arr) == '[object Array]') {
					this.ids = arr;
				}
				this.$refs.tkitree._show();
				this.type = type || "garden"
				this.listData = [];
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				if (this.type === "garden") {
					this.title = this.$t('other.addressScreen');
					this.handleGetGarden();
				} else if (this.type === "deparment") {
					this.title = this.$t('common.owningDepartment');
					this.handleDeparmentList();
				} else if (this.type === "device") {
					this.title = this.$t('common.bindDevice');
					this.handleDeviceBind();
				} else if (this.type === 'room') {
					this.title = this.$t('labDevice.owningRoom');
					this.handleGetRoomTree();
				} else if (this.type === 'equipment') {
					this.title = this.$t('common.equipmentType');
					this.handleEquipmentTypeList();
				}
			},
			selectChange(ids) {
				this.$emit('handle', ids);
				this.ids = ids;
			},
			// 获取地理位置
			handleGetGarden() {
				getMapGarden().then(res => {
					console.log(this.ids)
					uni.hideLoading();
					if (res.code === 1) {
						for (const item of res.items) {
							let grandpa = {
								id: item.gardenId,
								name: item.gardenName,
								level: 1,
								checked: this.ids[0].level === 1 && this.ids[0].id === item.gardenId ? true :false,
								children: [],
							};
							for (const element of item.subDivisions) {
								let father = {
									id: element.id,
									name: element.name,
									level: 2,
									checked: this.ids[0].level === 2 && this.ids[0].id === element.id ? true :
										false,
									children: [],
								};
								grandpa.children.push(father);
								for (const sun of element.subDivisions) {
									let grandson = {
										id: sun.id,
										name: sun.name,
										level: 3,
										checked: this.ids[0].level === 3 && this.ids[0].id === sun.id ? true :
											false,
									};
									father.children.push(grandson);
								}
							}
							this.listData.push(grandpa);
						}
					}
				})
			},
			// 获取部门列表
			handleDeparmentList() {
				getDepartment().then(res => {
					uni.hideLoading();
					this.listData = this.getTreeData(res.items.list, 1)
				})
			},
			// 关联的智能硬件
			handleDeviceBind() {
				getEquipmentBindEquipmentType({
					objType: 2
				}).then(res => {
					uni.hideLoading()
					this.listData = this.getTreeData(res.items, 1, '', 'code')
				})
			},
			getTreeData(data, level, key = 'subDivisions', idKey = 'id') {
				let arr = [];
				data.forEach(item => {
					let obj = {
						id: item[idKey],
						name: item.name,
						level: level,
						checked: this.handleChecked(item[idKey]),
						children: []
					}
					if (item[key] && item[key].length > 0) {
						obj.children = this.getTreeData(item[key], level + 1, key);
					}
					arr.push(obj);
				})
				return arr;
			},
			handleGetRoomTree() {
				getRoomTree({keyword: ""}).then(res => {
					uni.hideLoading()
					this.listData = this.getTreeData(res.items, 1, "children")
				})
			},
			handleChecked(val) {
				let isChecked = false;
				this.ids.map(item => {
					if (item.id == val) {
						isChecked = true;
					}
				})
				return isChecked;
			},
			handleEquipmentTypeList() {
				getInstrumentType().then(res => {
					uni.hideLoading();
					this.listData = this.getTreeData(res.items, 1 , 'childrenList', 'types')
				})
			}
		}
	}
</script>

<style>
</style>
