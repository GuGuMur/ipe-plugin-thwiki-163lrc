<template>
  <n-alert
    v-if="!lyrics?.lrc?.lyric"
    type="warning"
    title="提示"
    class="mb-4">
    暂无歌词
  </n-alert>
  <n-space vertical v-else>
    <n-text strong>原文歌词</n-text>
    <n-text
      depth="3"
      class="flex-1 max-w-xs whitespace-pre-line">
      {{ lyrics?.lrc?.lyric || "无" }}
    </n-text>
    <n-divider />
    <n-text strong>译文歌词</n-text>
    <n-text
      depth="3"
      class="flex-1 max-w-xs whitespace-pre-line">
      {{ lyrics?.tlyric?.lyric || "无" }}
    </n-text>
  </n-space>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { NAlert, NText, NDivider, NSpin, NSpace } from "naive-ui";
import { useLyricsCache } from "@/stores/LyricsCache.js";
const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
});

const lyricsCache = useLyricsCache();
const lyrics = ref({});

onMounted(async () => {
  await lyricsCache.getLyrics(props.id).then((lrc) => {
    lyrics.value = lrc;
  });
});
</script>
