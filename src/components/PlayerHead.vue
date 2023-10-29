<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(defineProps<{ uuid: string; size?: number }>(), {
    size: 128,
});

const url = computed(
    () => "https://crafatar.com/avatars/" + props.uuid + "?size=" + props.size
);
</script>

<template>
    <img :src="url" alt="Minecraft Head" />
</template>
