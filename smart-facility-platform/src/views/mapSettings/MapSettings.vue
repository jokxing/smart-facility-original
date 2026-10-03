<template>
  <div class="map-set">
    <div class="map-set-left">
      <div class="left-top">
        <p :title="companyName" class="icon-building1">
          {{ companyName ? companyName : "智慧设施" }}
        </p>
      </div>
      <div class="scrollbar">
        <Tree
            ref="Tree"
            v-loading="treeLoading"
            :default-array="defaultOpenArray"
            :selected-tree-node-key.sync="selectedKey"
            :treeData="companyNames"
            @getId="handleCutItem"
            @handleDelete="handleDeleteGarden"
            @handleEdit="handleEditGarden"
        />
      </div>
      <div class="left-bottom">
        <el-button v-if="!isDemo" icon="el-icon-plus" type="primary" @click="handleAddGarden">
          {{ $t('dataV.addGarden') }}
        </el-button>
      </div>
    </div>
    <div class="map-set-right">
      <div class="breadcrumb">
        <h3
            v-for="item in breadcrumb"
            :key="item.key"
            class="cursor"
            @click="handleCutItem(item)">
          {{ item.label }}
          <span v-show="item.level !== breadcrumb.length"> > </span>
        </h3>
        <el-button class="return-room-button" icon="el-icon-back" @click="$router.push('/rm/room')">
          返回房间管理
        </el-button>
      </div>
      <div class="session">
        <div class="clearfix">
          <div class="table-title">{{ tableTitle }}</div>
          <div>
            <el-button
                v-if="addTitle && !(isDemo && level !== 2)"
                type="primary"
                @click="handleAdd">
              <i class="icon-addto"></i>
              {{ addTitle }}
            </el-button>
          </div>
        </div>
        <el-table
            v-loading="loading"
            :data="building"
            border
            class="margin-center"
            size="medium"
            stripe>
          <el-table-column label="#" type="index" width="70px"/>
          <el-table-column
              v-for="item in tableType"
              :key="item.prop"
              :label="item.label"
              :prop="item.prop"/>
          <el-table-column v-if="urlPropLabel" :label="urlPropLabel">
            <template v-slot="scope">
              <a :title="$t('dataV.previewImg')"
                 @click="handlePreviewImg(scope.row[urlPropStr])">
                {{ scope.row[urlPropStr] }}
              </a>
            </template>
          </el-table-column>
          <el-table-column fixed="right" :label="$t('common.handle')" min-width="150">
            <template v-slot="scope">
              <el-button v-if="level !== 3 && !(isDemo && level === 1)" type="text" @click="handleEditMap(scope.row)">
                  {{ $t('common.edit') }}
              </el-button>
              <el-button
                  v-if="level !== 1 && !isDemo"
                  type="text"
                  @click="handleConfiguration(scope.row, level)">
                  {{ $t('dataV.deploy') }}
              </el-button>
              <el-button
                  v-if="!isDemo"
                  class="abnormal"
                  type="text"
                  @click="handleDeleteMap(scope.$index, scope.row)">
                {{ level === 3 ? $t('common.unBind') : $t('common.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="paging"></div>
      </div>
    </div>
    <CreateGarden ref="CreateGarden"/>
    <CreateBuilding ref="CreateBuilding" @handle="handleFlush"/>
    <create-floor ref="CreateFloor" @handle="handleFlush"/>
    <create-room ref="CreateRoom" @handle="handleRoomList(floorId)"/>
    <el-dialog :visible.sync="isImage" title="底图预览" width="85%" top="5vh">
      <img v-if="isImage && dialogImageUrl" :src="dialogImageUrl" alt="底图预览" width="100%" style="display: block; max-height: 75vh; object-fit: contain;" @error="handlePreviewError"/>
    </el-dialog>
  </div>
</template>

<script>
import Tree from "@/views/mapSettings/components/MapSetTree";
import CreateGarden from "@/views/mapSettings/components/CreateGarden";
import {
  deleteMapBuilding,
  deleteMapFloor,
  getMapBuildingList,
  getMapFloorList,
  getMapGardenList,
  getMapLabList, unboundMapLab,
} from "@/api/mapSet";
import CreateBuilding from "@/views/mapSettings/components/CreateBuilding";
import CreateFloor from "@/views/mapSettings/components/CreateFloor";
import CreateRoom from "@/views/mapSettings/components/CreateRoom";
import {BASE_URL} from "@/utils/constant";
import {resolveFloorMapUrl} from '@/utils/demoFloorMapUrl';
import {resolveRoomMapUrl} from '@/utils/demoRoomMapUrl';
import {hydrateDemoMediaCache} from '@/utils/demoMediaStore';
import i18n from "@/i18n";
let nodeDefault;
const TABLE_ARRAY = {
  1: [
    {label: i18n.t('dataV.buildingName1'), prop: "name"},
    {label: i18n.t('dataV.gardenName'), prop: "gardenName"},
  ],
  2: [
    {label: i18n.t('dataV.floorName'), prop: "name"},
    {label: i18n.t('dataV.buildingName'), prop: "buildingName"},
    {label: i18n.t('dataV.gardenName'), prop: "gardenName"},
  ],
  3: [
    {label: i18n.t('room.roomName'), prop: "labName"},
    {label: i18n.t('common.owningDepartment'), prop: "departmentName"},
    {label: i18n.t('dataV.floorName'), prop: "floorName"},
    {label: i18n.t('dataV.buildingName'), prop: "buildingName"},
    {label: i18n.t('dataV.gardenName'), prop: "gardenName"},
  ],
};

const ADD_TEXT = {
  1: i18n.t('dataV.addBuilding'),
  2: i18n.t('dataV.addFloor'),
  3: i18n.t('dataV.bindRoom'),
};

const CREATE = {
  1: "CreateBuilding",
  2: "CreateFloor",
  3: "CreateRoom",
};

export default {
  name: "MapSettings",
  components: {
    CreateRoom,
    CreateFloor,
    CreateBuilding,
    CreateGarden,
    Tree,
  },
  inject: ["reload"],
  data() {
    return {
      isDemo: process.env.VUE_APP_DEMO === 'true',
      tableTitle: i18n.t('dataV.bingList'),
      isImage: false,
      dialogImageUrl: "",
      companyNames: [],
      companyName: "智慧设施",
      building: [],
      breadcrumb: [],
      tableType: TABLE_ARRAY[1],
      addTitle: ADD_TEXT["1"],
      level: 1,
      loading: false,
      keys: [],
      treeLoading: false,
      urlPropLabel: "",
      urlPropStr: "",
      url: "",
      element: [],
      companyObject: {
        gardenName: "",
        gardenId: "",
        buildingName: "",
        buildingId: "",
        floorName: "",
        floorId: "",
      },
      hasChild: null,
      isHasChild: 0,
      floorId: null,
      defaultOpenArray: [],
      selectedKey: null
    };
  },
  created() {
    this.handleReadTreeId();
    this.handleGetMapGardenList();
    this.companyName = JSON.parse(localStorage.getItem("USERINFO")).companyName;
  },
  methods: {
    handleReadTreeId() {
      if (localStorage.getItem("garden")) {
        let garden = localStorage.getItem("garden");
        this.defaultOpenArray = garden.length ? (garden.split(",")) : [];
        this.selectedKey = this.defaultOpenArray.slice(-1)[0];
      }
    },
    handleDeleteGarden(code) {
      if (code) {
        this.handleGetMapGardenList();
      }
    },
    handleGetMapGardenList(preserve) {
      this.treeLoading = true;
      this.loading = true;
      this.companyNames = [];
      getMapGardenList().then((res) => {
        if (res.code && res.items.length) {
          for (const item of res.items) {
            let grandpaKey = "a";
            let grandpa = {
              key: grandpaKey + item.gardenId,
              id: item.gardenId,
              name: item.gardenName,
              subDivisions: [],
            };
            if (grandpaKey + item.gardenId === this.defaultOpenArray[0]) {
              this.$set(this.breadcrumb, 0, {
                key: grandpaKey + item.gardenId,
                label: item.gardenName,
                level: 1,
                data: {id: item.gardenId}
              })
            }
            for (const element of item.subDivisions) {
              let fatherKey = "b";
              let father = {
                key: fatherKey + element.id,
                id: element.id,
                name: element.name,
                subDivisions: [],
              };
              grandpa.subDivisions.push(father);
              if (fatherKey + element.id === this.defaultOpenArray[1]) {
                this.$set(this.breadcrumb, 1, {
                  key: fatherKey + element.id,
                  label: element.name,
                  level: 2,
                  data: {id: element.id}
                })
              }
              for (const sun of element.subDivisions) {
                let sunKey = "c";
                let grandson = {
                  key: sunKey + sun.id,
                  id: sun.id,
                  name: sun.name,
                };
                father.subDivisions.push(grandson);
                if (sunKey + sun.id === this.defaultOpenArray[2]) {
                  this.$set(this.breadcrumb, 2, {
                    key: sunKey + sun.id,
                    label: sun.name,
                    level: 3,
                    data: {id: sun.id}
                  })
                }
              }
            }
            this.companyNames.push(grandpa);
          }
          // After create/edit, keep the current table level (floor/room list) instead of jumping to garden.
          if (preserve && preserve.level === 2 && preserve.buildingId) {
            this.handleTableData(2, preserve.buildingId, preserve.buildingName);
          } else if (preserve && preserve.level === 3 && preserve.floorId) {
            this.handleTableData(3, preserve.floorId, preserve.floorName);
          } else if (preserve && preserve.level === 1 && preserve.gardenId) {
            this.handleTableData(1, preserve.gardenId, preserve.gardenName);
          } else if (!this.defaultOpenArray.length) {
            this.companyObject.gardenId = res.items[0].gardenId;
            this.companyObject.gardenName = res.items[0].gardenName;
            this.$set(this.breadcrumb, 0, {
              key: this.companyNames[0].key,
              label: this.companyNames[0].name,
              level: 1,
              data: {id: this.companyNames[0].id}
            });
            const obj = this.breadcrumb.slice(-1)[0];
            this.handleTableData(obj.level, obj.data.id, obj.name)
          } else {
            const obj = this.breadcrumb.slice(-1)[0];
            this.handleTableData(obj.level, obj.data.id, obj.label)
          }
        }
        this.treeLoading = false;
        this.loading = false;
      });
    },
    handleAdd() {
      if (this.isDemo && this.level !== 2) {
        return this.$message.info('演示仅开放楼层新增/编辑。');
      }
      const ref = CREATE[this.level];
      this.$refs[ref].open(0, this.companyObject);
    },
    handleCutItem(object) {
      this.handleSaveTreeId(object);
      nodeDefault = object.id;
      this.hasChild = object.childNodes; // 用于删除时判断是否含有子项
      if (object.level === 3) {
        if (this.breadcrumb.length === 1) {
          this.$set(this.breadcrumb, 1, object.parent);
          this.$set(this.breadcrumb, 2, object);
        }
      }
      this.keys.push(nodeDefault);
      this.level = object.level;
      this.$set(this.breadcrumb, object.level - 1, object);
      this.breadcrumb.splice(object.level);
      this.tableType = TABLE_ARRAY[object.level];
      this.handleTableData(object.level, object.data.id, object.label);
    },
    // 刷新存储tree展开节点id
    handleSaveTreeId(object) {
      this.$set(this.defaultOpenArray, object.level - 1, object.key);
      if (object.level === 1) {
        this.defaultOpenArray = this.defaultOpenArray.slice(0, 1);
      }
      if (object.level === 2) {
        this.defaultOpenArray = this.defaultOpenArray.slice(0, 2);
      }
      localStorage.setItem("garden", this.defaultOpenArray);
    },
    handleEditGarden(data) {
      if (this.isDemo) {
        return this.$message.info('演示未开放园区编辑。');
      }
      this.$refs.CreateGarden.open(0, data);
    },
    handleAddGarden() {
      if (this.isDemo) {
        return this.$message.info('演示未开放园区新增。');
      }
      this.$refs.CreateGarden.open(1);
    },
    handleTableData(level, id, label) {
      this.level = level;
      this.building = [];
      this.addTitle = ADD_TEXT[level];
      if (level === 1 && id) {
        this.tableTitle = i18n.t('dataV.bingList');
        this.companyObject.gardenName = label;
        this.companyObject.gardenId = id;
        this.urlPropLabel = "";
        this.urlPropStr = "";
        this.handleGetGardenList(id);
      }
      if (level === 2 && id) {
        this.tableTitle = i18n.t('dataV.floorList');
        this.companyObject.buildingName = label;
        this.companyObject.buildingId = id;
        this.urlPropLabel = i18n.t('dataV.floorUrl');
        this.urlPropStr = "mapUrl";
        this.handleGetFloorList(id);
      }
      if (level === 3 && id) {
        this.tableTitle = i18n.t('dataV.roomList');
        this.companyObject.floorName = label;
        this.companyObject.floorId = id;
        this.urlPropLabel = i18n.t('dataV.roomUrl');
        this.urlPropStr = "labMapUrl";
        this.floorId = id;
        this.handleRoomList(id);
      }
    },
    handleGetGardenList(gardenId) {
      this.loading = true;
      getMapBuildingList({gardenId}).then((res) => {
        this.building = res.items;
        this.loading = false;
      });
    },
    handleRoomList(floorId) {
      this.loading = true;
      getMapLabList({floorId}).then((res) => {
        this.building = res.items;
        this.loading = false;
      });
    },
    handleGetFloorList(buildingId) {
      this.loading = true;
      getMapFloorList({buildingId}).then((res) => {
        this.building = res.items;
        this.loading = false;
      });
    },
    handleConfiguration(row, level) {
      if (level === 2) {
        this.$router.push({
          path: "/floor/designer",
          query: {
            floorId: row.id,
            mapUrl: row.mapUrl,
            mapId: row.mapId,
            floorName: row.name
          },
        });
      } else if (level === 3) {
        this.$router.push({
          path: "/room/designer",
          query: {
            roomId: row.labId,
            roomName: row.labName
          },
        });
      }
    },
    async handlePreviewImg(fileName) {
      let url;
      if (this.isDemo) {
        const resolve = this.level === 3 ? resolveRoomMapUrl : resolveFloorMapUrl;
        url = resolve(fileName, BASE_URL);
        if (!url) {
          await hydrateDemoMediaCache();
          url = resolve(fileName, BASE_URL);
        }
      } else {
        url = fileName ? BASE_URL + fileName : null;
      }
      if (!url) {
        this.isImage = false;
        this.dialogImageUrl = '';
        this.$message.warning('底图不可用，请重新上传。');
        return;
      }
      this.dialogImageUrl = url;
      this.isImage = true;
    },
    handlePreviewError() {
      this.isImage = false;
      this.dialogImageUrl = '';
      this.$message.error('底图加载失败，请重新上传。');
    },
    handleEditMap(row) {
      const ref = CREATE[this.level];
      this.$refs[ref].open(1, row, this.companyObject);
    },
    handleDeleteMap(index, row) {
      const idStr = this.urlPropStr !== "labMapUrl" ? "id" : "labId";

      try {
        if (this.hasChild && this.level !== 3) {
          this.isHasChild = this.hasChild[index].childNodes.length;
        }
      } catch (e) {
        if (this.level === 1) {
          this.companyNames.map(item => {
            if (item.id === row.id) {
              this.hasChild = item.subDivisions.length;
            }
          })
        }
        if (this.level === 2) {
          this.companyNames.map(item => {
            item.subDivisions.map(sub => {
              if (item.id === row.id) {
                this.hasChild = sub.subDivisions.length;
              }
            })
          })
        }
      }
      if (this.isHasChild) {
        return alert(i18n.t('dataV.deleteSub'));
      } else {
        this.$confirm(i18n.t('dataV.deleteSubMessage'), i18n.t('common.delete'), {
          type: "warning",
          cancelButtonText: i18n.t('common.cancel'),
          confirmButtonText: i18n.t('common.confirm'),
        }).then(() => {
          if (this.level === 1) {
            deleteMapBuilding({buildingId: row[idStr]}).then((res) => {
              this.handleMessage(res);
            });
          }
          if (this.level === 2) {
            deleteMapFloor({floorId: row[idStr]}).then((res) => {
              this.handleMessage(res);
            });
          }
          if (this.level === 3) {
            unboundMapLab({labId: row[idStr]}).then((res) => {
              if (res.code) {
                this.$message.success(i18n.t('common.unBindSuccess'));
                this.handleRoomList(this.floorId);
              } else {
                this.$message.error(res.message);
              }
            });
          }
        }).catch(() => {
          this.$message.info(i18n.t('common.cancelHandle'));
        });
      }
    },
    handleMessage(res) {
      if (res.code) {
        this.$message.success(res.message);
        this.handleGetMapGardenList();
      } else {
        this.$message.error(res.message);
      }
    },
    handleFlush() {
      this.handleGetMapGardenList({
        level: this.level,
        gardenId: this.companyObject.gardenId,
        gardenName: this.companyObject.gardenName,
        buildingId: this.companyObject.buildingId,
        buildingName: this.companyObject.buildingName,
        floorId: this.floorId || this.companyObject.floorId,
        floorName: this.companyObject.floorName
      });
    },
  },
  beforeDestroy() {
    localStorage.removeItem("garden")
  }
};
</script>

<style lang="less" scoped>
@import "../../../src/style/variable";

/deep/.main-container-is-menu {
    padding: 0 !important;
}
/deep/ .el-dialog__header {
  height: 50px !important;
}

.map-set {
  height: calc(100vh - 60px);
  overflow: hidden;
  display: flex;

  .map-set-left {
    width: 300px;
    height: 100%;
    padding-top: 20px;
    padding-left: 30px;
    padding-right: 20px;
    border-right: 1px solid #e5e5e5;
    position: relative;
    background-color: @white;

    .left-top {
      p {
        width: 100%;
        font-weight: bold;
        color: #303F9F;
        line-height: 30px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .scrollbar {
      height: calc(100% - 140px);
      overflow: hidden;
      overflow-y: auto;
    }

    .left-bottom {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .map-set-right {
    width: calc(100vw - 300px);
    height: 100%;
    padding: 20px 30px;
    overflow-y: auto;

    .breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      color: #303F9F;

      .return-room-button {
        margin-left: auto;
      }

      h3 {
        line-height: 1.5;

        span {
          color: #999999;
          margin: 0 8px;
          font-weight: 400;
        }
      }
    }
  }
}

.table-title {
  font-size: 16px;
  font-weight: 600;
}

.icon-building1 {
  font-size: 18px;
}
</style>
