<script lang="ts" setup>
import Overlay from "./Overlay.vue";

const props = defineProps<{ loading: boolean }>();
</script>

<template>
    <overlay class="loading-overlay" :model-value="loading"
        ><mdicon name="loading" spin class="loading-icon" size="48"
    /></overlay>
</template>

<style lang="scss" scoped>
.loading-icon {
    color: white;
}
</style>
