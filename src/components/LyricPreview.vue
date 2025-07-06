<template>
  <n-space class="flex">
    <n-alert
      v-if="!lyrics"
      type="error"
      title="错误"
      class="mb-4">
      {{ lyrics || "要不要检查一下网络日志？" }}
    </n-alert>

    <n-alert
      v-else-if="!lyrics.lrc?.lyric && !isLoading"
      type="warning"
      title="提示"
      class="mb-4">
      暂无歌词
    </n-alert>

    <template v-if="lyrics.tlyric?.lyric">
      <n-space v-if="lyrics.lrc?.lyric" vertical="false">
        <!-- 有翻译歌词的情况 -->
        <n-space vertical>
          <n-text strong>原文歌词</n-text>
          <n-text
            depth="3"
            class="flex-1 max-w-xs">
            {{ lyrics.lrc?.lyric }}
          </n-text>
        </n-space>
        <n-divider />
        <n-space vertical>
          <n-text strong>译文歌词</n-text>
          <n-text
            depth="3"
            class="flex-1 max-w-xs">
            {{ lyrics.tlyric?.lyric }}
          </n-text>
        </n-space>
      </n-space>

      <!-- 无翻译歌词的情况 -->
      <n-space
        v-else
        vertical>
        <n-text strong>原文歌词</n-text>
        <n-text
          depth="3"
          class="flex-1 truncate max-w-xs">
          {{ lyrics.lrc?.lyric }}
        </n-text>
      </n-space>
    </template>
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
  const action = await lyricsCache.getLyrics(props.id)
  lyrics.value = lyricsCache.lyricsMap[props.id];
});
</script>
