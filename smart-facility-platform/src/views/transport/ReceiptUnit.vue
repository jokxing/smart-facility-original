<template>
    <list-deliver-or-receipt :type="1"/>
</template>

<script>
import ListDeliverOrReceipt from "@/views/transport/components/ListDeliverOrReceipt";

export default {
    name: "ReceiptUnit",
    components:{
        ListDeliverOrReceipt
    }
}
</script>

<style scoped>
</style>