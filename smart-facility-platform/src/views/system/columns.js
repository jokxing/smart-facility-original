import Vue from "vue";
import { postDataAuthDistribute, postDataAuthDistributeDevice } from "@/api/dataAuth";

let _this = null
export default {
    assign(vm) {
        _this = vm
    }
}

// 已分配的数据
Vue.prototype.handleDistribute = function(list){
    if(list.length > 0){
        list.map(item => {
            if(_this.dimension === 1){
                _this.multipleSelection.push({id: item.objId,gatewayId: item.gatewayId});
                _this.tags.push({name: item.objName,id: item.objId,gatewayId: item.gatewayId})
            }else{
                _this.multipleSelection.push(item.objId);
                _this.tags.push({name: item.objName,id: item.objId})
            }
        })
    }
}

// 表格勾选
Vue.prototype.handleSelect = function (val,row) {
    if(val.length > 0){
        val.map(item => {
            if(item.id === row.id){
                if(_this.dimension === 1){
                    _this.multipleSelection.push({id: item.id,gatewayId: item.gatewayId});
                    _this.tags.push({name: item.name,id: item.id,gatewayId: item.gatewayId})
                }else{
                    _this.multipleSelection.push(item.id);
                    _this.tags.push({name: item.name,id: item.id})
                }
            }else{
                if(_this.dimension === 1){
                    for(var i = 0; i < _this.multipleSelection.length; i++){
                        if(_this.multipleSelection[i].id === row.id){
                            _this.multipleSelection.splice(i,1)
                        }
                    }
                }else{
                    for(var i = 0; i < _this.multipleSelection.length; i++){
                        if(_this.multipleSelection[i] === row.id){
                            _this.multipleSelection.splice(i,1)
                        }
                    }
                }
                for(var i = 0; i < _this.tags.length; i++){
                    if(_this.tags[i].id === row.id){
                        _this.tags.splice(i,1)
                    }
                }
            }
        })
    }else{
        if(_this.dimension === 1){
            for(var i = 0; i < _this.multipleSelection.length; i++){
                if(_this.multipleSelection[i].id === row.id){
                    _this.multipleSelection.splice(i,1)
                }
            }
        }else{
            for(var i = 0; i < _this.multipleSelection.length; i++){
                if(_this.multipleSelection[i] === row.id){
                    _this.multipleSelection.splice(i,1)
                }
            }
        }
        for(var i = 0; i < _this.tags.length; i++){
            if(_this.tags[i].id === row.id){
                _this.tags.splice(i,1)
            }
        }
    }
}

// 表格全选勾选
Vue.prototype.handleSelectAll = function (val){
    if(_this.$refs.table.$refs.elTable.store.states.isAllSelected){
        _this.currentPageIds = [];
        if(_this.tags.length > 0){
            for(var i = 0; i < val.length; i++) {
                for(var j = 0; j < _this.tags.length; j++){
                    if(_this.tags[j].id === val[i].id){
                        _this.tags.splice(j,1);
                    }
                }
            }
            val.map(item => {
                if(_this.dimension === 1){
                    _this.tags.push({name: item.name,id: item.id,gatewayId: item.gatewayId})
                }else{
                    _this.tags.push({name: item.name,id: item.id})
                }
                _this.currentPageIds.push(item.id)
            })
        }else{
            val.map(item => {
                if(_this.dimension === 1){
                    _this.tags.push({name: item.name,id: item.id,gatewayId: item.gatewayId})
                }else{
                    _this.tags.push({name: item.name,id: item.id})
                }
                _this.currentPageIds.push(item.id)
            })
        }
    }else{
        for(var i = 0; i < _this.currentPageIds.length; i++){
            for(var j = 0; j < _this.tags.length; j++){
                if(_this.tags[j].id === _this.currentPageIds[i]){
                    _this.tags.splice(j,1)
                }
            }
        }
        _this.currentPageIds = []
    }

    _this.multipleSelection = [];
    if(_this.dimension === 1){
        for(var i = 0; i < _this.tags.length; i++){
            _this.multipleSelection.push({id:_this.tags[i].id,gatewayId:_this.tags[i].gatewayId})
        }
    }else{
        for(var i = 0; i < _this.tags.length; i++){
            _this.multipleSelection.push(_this.tags[i].id)
        }
    }
}

// 翻页保留勾选状态的id
Vue.prototype.handleListSelection = function () {
    _this.$refs.table.$refs.elTable.clearSelection();
    var num = 0;
    var currentPageIds = [];
    _this.$nextTick(() => {
        if(_this.tags.length > 0){
            for(var i = 0; i < _this.list.length; i++){
                for(var j = 0; j < _this.tags.length; j++){
                    if(_this.list[i].id === _this.tags[j].id){
                        num++
                        _this.$refs.table.$refs.elTable.toggleRowSelection(_this.list[i], true)
                        currentPageIds.push(_this.list[i].id)
                        if(num === _this.list.length){
                            _this.currentPageIds = currentPageIds
                        }
                    }
                }
            }
        }
    })
}

// 关闭标签
Vue.prototype.handleTagClose = function (tag,index) {
    _this.tags.splice(index,1);
    _this.multipleSelection = [];
    if(_this.dimension === 1){
        for(var i = 0; i < _this.tags.length; i++) {
            _this.multipleSelection.push({id:_this.tags[i].id,gatewayId:_this.tags[i].gatewayId})
        }
    }else{
        for(var i = 0; i < _this.tags.length; i++) {
            _this.multipleSelection.push(_this.tags[i].id)
        }
    }
    for(var i = 0; i < _this.list.length; i++){
        if(_this.list[i].id === tag.id){
            _this.$refs.table.$refs.elTable.toggleRowSelection(_this.list[i], false)
        }
    }
}

// 提交请求
Vue.prototype.submitForm = function () {
    _this.loading = true;
    if(_this.dimension === 1){
        var data = {
            type: _this.type,
            thingsIdList: _this.multipleSelection,
            userId: _this.userId,
        }
        postDataAuthDistributeDevice(data).then(res => {
            _this.loading = false;
            if(res.code === 1){
                _this.$message.success('分配成功');
                _this.handleModalClose();
                _this.$emit("handle")
            }else{
                _this.$message.error(res.message)
            }
        })
    }else{
        var data = {
            dimension: _this.dimension,
            type: _this.type,
            thingsIdList: _this.multipleSelection,
            userId: _this.userId,
        }
        postDataAuthDistribute(data).then(res => {
            _this.loading = false;
            if(res.code === 1){
                _this.$message.success('分配成功');
                _this.handleModalClose();
                _this.$emit("handle")
            }else{
                _this.$message.error(res.message)
            }
        })
    }
}