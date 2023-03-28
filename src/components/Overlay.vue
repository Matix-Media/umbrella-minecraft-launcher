<script lang="ts" setup>
import { TransitionFade } from "@morev/vue-transitions";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);

function close() {
    emit("update:modelValue", false);
}
</script>

<template>
    <transition-fade>
        <div class="overlay" @click="close" v-if="modelValue">
            <slot></slot>
        </div>
    </transition-fade>
</template>

<style lang="scss" scoped>
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(15px);
}
</style>
