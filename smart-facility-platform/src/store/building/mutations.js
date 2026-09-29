/** 楼宇3D **/
const GARDENID = "GARDENID";
const GARDENLISTDATA = "GARDENLISTDATA";
const BUILDINGID = "BUILDINGID"

export default {
    GARDENID(state, id) {
        state.gardenId = id
    },
    GARDENLISTDATA(state, data){
        state.gardenListData = data
    },
    BUILDINGID(state, id) {
        state.buildingId = id
    }
}