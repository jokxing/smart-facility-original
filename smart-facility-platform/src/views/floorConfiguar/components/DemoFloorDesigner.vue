<template>
  <div class="demo-floor-editor" v-loading="loading">
    <aside>
      <h3>待放置房间</h3>
      <p>拖入底图，或点击放置</p>
      <el-button v-for="room in candidates" :key="room.id" draggable="true"
        @dragstart.native="startDrag(room, $event)" @click="place(room)">{{ room.name }}</el-button>
      <p v-if="!candidates.length">暂无待放置房间</p>
      <div v-if="selected" class="selection">
        <strong>{{ selected.name }}</strong>
        <el-button @click="removeSelected">移除布局</el-button>
      </div>
      <div class="actions">
        <el-button :disabled="saving" @click="exit">取消并退出</el-button>
        <el-button :disabled="saving || !dirty" @click="restore">撤销修改</el-button>
        <el-button type="primary" :loading="saving" :disabled="loading || !bg.image" @click="save">保存配置</el-button>
      </div>
    </aside>
    <main ref="canvasHost" @dragover.prevent @drop.prevent="drop">
      <v-stage ref="stage" :config="stageConfig">
        <v-layer><v-image :config="bg" /></v-layer>
        <v-layer>
          <v-group v-for="room in placed" :key="room.id"
            :config="{x: room.x * ratio, y: room.y * ratio, draggable: !saving}"
            @click="selectedId = room.id" @tap="selectedId = room.id" @dragend="move(room, $event)">
            <v-rect :config="{width: 180 * ratio, height: 40 * ratio, fill: selectedId === room.id ? '#315b76' : '#183e55', cornerRadius: 5, stroke: '#8ed2e5'}" />
            <v-text :config="{text: room.name, width: 180 * ratio, height: 40 * ratio, fontSize: 18 * ratio, fill: '#e4f5fb', align: 'center', verticalAlign: 'middle'}" />
            <v-group v-if="selectedId === room.id" :config="{x: 180 * ratio, y: 0}" @mousedown="stopRemoveDrag" @touchstart="stopRemoveDrag" @click="removeFromIcon(room, $event)" @tap="removeFromIcon(room, $event)">
              <v-circle :config="{radius: 12, fill: '#e66060', stroke: '#fff', strokeWidth: 1}" />
              <v-line :config="{points: [-4, -4, 4, 4], stroke: '#fff', strokeWidth: 2, lineCap: 'round'}" />
              <v-line :config="{points: [-4, 4, 4, -4], stroke: '#fff', strokeWidth: 2, lineCap: 'round'}" />
            </v-group>
          </v-group>
        </v-layer>
      </v-stage>
    </main>
  </div>
</template>

<script>
import {mapFloorOverview, mapElementConfig} from '@/api/centerController';
import {getRoomList} from '@/api/room';
import {resolveFloorMapUrl} from '@/utils/demoFloorMapUrl';
import '@/plugins/konva';

export default {
  data: () => ({loading: true, saving: false, dirty: false, placed: [], rooms: [], original: [], selectedId: null,
    ratio: 1, bg: {}, floor: {}, dragId: null}),
  computed: {
    stageConfig() {return {width: 1678 * this.ratio, height: 795 * this.ratio};},
    candidates() {return this.rooms.filter(room => !this.placed.some(item => item.id === room.id));},
    selected() {return this.placed.find(room => room.id === this.selectedId);}
  },
  async mounted() {
    window.addEventListener('resize', this.resize);
    try {
      const floorId = Number(this.$route.query.floorId);
      const [overview, rooms] = await Promise.all([mapFloorOverview({floorId}), getRoomList({floorId, gardenId: '', pageNum: 1, pageSize: 10000})]);
      if (overview.code !== 1 || rooms.code !== 1 || !overview.items.floorId) throw new Error('无法读取楼层配置');
      this.floor = overview.items;
      this.rooms = rooms.items.list;
      this.placed = overview.items.labList.map(room => ({...room}));
      this.original = this.placed.map(room => ({...room}));
      const url = resolveFloorMapUrl(this.floor.mapUrl);
      if (!url) throw new Error('当前楼层暂无底图，请在地图设置上传。');
      const image = new Image();
      image.src = url;
      await image.decode();
      this.bg = {image};
      await this.$nextTick();
      this.resize();
    } catch (error) {this.$message.error(error.message || '配置加载失败');}
    finally {this.loading = false;}
  },
  beforeDestroy() {window.removeEventListener('resize', this.resize);},
  methods: {
    resize() {
      if (!this.$refs.canvasHost) return;
      this.ratio = Math.max(0.1, Math.min(this.$refs.canvasHost.clientWidth / 1678, this.$refs.canvasHost.clientHeight / 795));
      this.bg = {...this.bg, width: 1678 * this.ratio, height: 795 * this.ratio};
    },
    startDrag(room, event) {this.dragId = room.id; event.dataTransfer.setData('text/plain', String(room.id));},
    drop(event) {
      const id = Number(event.dataTransfer.getData('text/plain'));
      const room = this.candidates.find(item => item.id === id);
      if (!room || this.saving) return;
      const rect = this.$refs.canvasHost.getBoundingClientRect();
      this.place(room, (event.clientX - rect.left) / this.ratio, (event.clientY - rect.top) / this.ratio);
    },
    place(room, x = 700, y = 350) {
      if (this.saving || !this.bg.image || !this.candidates.some(item => item.id === room.id)) return;
      this.placed.push({...room, x: Math.max(0, Math.min(x, 1498)), y: Math.max(0, Math.min(y, 755))});
      this.selectedId = room.id; this.dirty = true;
    },
    move(room, event) {
      const node = event.target;
      room.x = Math.max(0, Math.min(node.x() / this.ratio, 1498));
      room.y = Math.max(0, Math.min(node.y() / this.ratio, 755));
      node.position({x: room.x * this.ratio, y: room.y * this.ratio});
      this.selectedId = room.id; this.dirty = true;
    },
    stopRemoveDrag(event) {event.cancelBubble = true;},
    removeFromIcon(room, event) {event.cancelBubble = true; this.selectedId = room.id; this.removeSelected();},
    removeSelected() {if (this.saving) return; this.placed = this.placed.filter(room => room.id !== this.selectedId); this.selectedId = null; this.dirty = true;},
    restore() {this.placed = this.original.map(room => ({...room})); this.selectedId = null; this.dirty = false;},
    exit() {this.$router.push({path: '/floor/view', query: {...this.$route.query}});},
    async save() {
      if (this.saving) return;
      this.saving = true;
      try {
        const result = await mapElementConfig({type: 11, floorId: this.floor.floorId, mediaId: this.floor.mapId,
          list: this.placed.map(room => ({type: 11, elementId: room.id, mediaId: this.floor.mapId, x: room.x, y: room.y}))});
        if (result.code !== 1) {this.$message.error(result.message || '保存失败'); return;}
        this.original = this.placed.map(room => ({...room})); this.dirty = false;
        this.$message.success('配置已保存'); this.exit();
      } catch (_) {this.$message.error('保存失败，请重试');}
      finally {this.saving = false;}
    }
  }
};
</script>

<style scoped>
.demo-floor-editor {position: fixed; inset: 60px 0 0; display: flex; background: #f5f7fb; z-index: 10;}
aside {width: 230px; flex-shrink: 0; padding: 20px; box-sizing: border-box; overflow: auto;}
aside > .el-button {display: block; width: 100%; margin: 8px 0;}
aside p {color: #6c7989; font-size: 13px;}
.selection {margin-top: 24px; display: grid; gap: 12px;}
.actions {display: grid; gap: 10px; margin-top: 24px;}
.actions .el-button {margin: 0;}
main {flex: 1; min-width: 0; margin: 20px; overflow: hidden; background: #173047;}
</style>
