<script lang="ts" setup>
import { ref } from "vue";
const emit = defineEmits(["update:modelValue"]);
const props = defineProps<{ modelValue: string; placeholder?: string }>();
const input = ref<HTMLInputElement>();

function focus() {
    input.value?.focus();
}

defineExpose({ focus });
</script>

<template>
    <input
        ref="input"
        class="text-input"
        type="text"
        :placeholder="props.placeholder"
        @input="
            emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
    />
</template>

<style lang="scss" scoped>
.text-input {
    width: 100%;
    box-sizing: border-box;
    border-radius: 4px;
    border: 2px solid var(--bg);
    background-color: var(--bg-2);
    padding: 15px 13px;
    font-weight: 600;
    font-size: 16px;
    color: #fff;
    outline: none;
    transition: border 0.3s;

    &:focus {
        border-color: #383b3f;
    }
}
</style>
