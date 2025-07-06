<template>
  <div>
    <n-button
      @click="showModal = true"
      size="tiny"
      strong
      secondary
      type="primary">
      163LRC工具辅助编辑
    </n-button>
    <n-modal
      v-model:show="showModal"
      :style="{ width: '90vw !important' }"
      preset="dialog"
      :icon="() => h(Translate24Filled)"
      positive-text="确认"
      negative-text="取消"
      @positive-click="
        () => {
          showModal = false;
          showLangSelect = true;
        }
      "
      @negative-click="
        () => {
          showModal = false;
        }
      ">
      <template #header>
        <div
          class="flex items-center gap-3 text-xl font-bold text-gray-900">
          <n-text>163LRC工具执行（1 / 3）</n-text>
          <img
            src="https://img.shields.io/badge/THBwiki-InPageEdit_plugin_163lrc-ffa500"
            className="h-7 align-middle rounded"
            alt="badge" />
        </div>
      </template>
      <template #default>
        <n-space vertical>
          <n-text>
            请于下方搜索框中调整自动获取的歌曲名称，单选符合条件的歌曲，经过确认后选择语言，再跳转到IPE的编辑页面，符合条件后完成自动编辑。
          </n-text>
          <n-divider></n-divider>
          <n-space
            :wrap="false"
            align="center"
            class="w-full flex">
            <n-input
              :value="searchKeyword"
              :placeholder="props.songName"
              passively-activated
              @keyup.enter.native="searchSongs(searchKeyword)"
              class="flex-auto flex-grow">
              <template #prefix>
                <n-icon :component="Search28Filled" />
              </template>
            </n-input>
            <n-button
              type="primary"
              :disabled="loading || !searchKeyword.trim()"
              @click="searchSongs(searchKeyword)"
              class="w-[80px] flex-shrink-0">
              <SpinnerIos20Filled
                v-if="loading"
                class="animate-spin" />
              <Search28Filled v-else />
              {{ loading ? "搜索中" : "搜索" }}
            </n-button>
          </n-space>
          <div class="overflow-y-auto max-h-40vh space-y-3 w-full">
            <!-- 搜索结果列表 -->
            <template v-if="loading">
              <div
                class="flex flex-col items-center justify-center py-16">
                <SpinnerIos20Filled
                  class="w-8 h-8 animate-spin text-blue-500"></SpinnerIos20Filled>
                <span class="text-lg">搜索中...</span>
              </div>
            </template>
            <template v-else-if="searchResults.length > 0">
              <n-radio-group
                v-model:value="selectedSong"
                name="radioSongs"
                size="large">
                <n-space vertical>
                  <n-radio-button
                    v-for="song in searchResults"
                    :key="song.id"
                    :value="song"
                    class="w-screen">
                    <n-popover
                      trigger="hover"
                      class="max-h-40 max-w-xl"
                      scrollable>
                      <template #trigger>
                        <n-card
                          class="transition-all duration-200 hover:shadow-md w-70vw"
                          @click="selectedSong = song"
                          :bordered="false">
                          <div
                            class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                              <img
                                :src="
                                  song?.al?.picUrl.replace(
                                    'http://',
                                    'https://'
                                  )
                                "
                                :alt="song?.name"
                                class="w-12 h-12 rounded shadow object-cover"
                                style="
                                  min-width: 50px;
                                  min-height: 50px;
                                " />
                              <n-space vertical>
                                <n-text
                                  class="text-base font-medium"
                                  >{{ song.name }}</n-text
                                >
                                <n-text
                                  type="secondary"
                                  class="text-sm">
                                  {{
                                    song?.ar
                                      ?.map((item) => item.name)
                                      .join("&")
                                  }}
                                  • {{ song?.al?.name }}
                                </n-text>
                              </n-space>
                            </div>
                            <div class="flex items-center gap-4">
                              <a
                                :href="`https://music.163.com/#/song?id=${song?.id}`"
                                target="_blank">
                                <n-tag
                                  type="error"
                                  class="text-xs"
                                  round
                                  :bordered="true">
                                  <template #avatar>
                                    <MusicNote2Play20Regular
                                      class="w-4 h-4 mr-1"></MusicNote2Play20Regular>
                                  </template>
                                  到网易云音乐
                                </n-tag>
                              </a>
                            </div>
                          </div>
                        </n-card>
                      </template>
                      <LyricPreview :id="song?.id"></LyricPreview>
                    </n-popover>
                  </n-radio-button>
                </n-space>
              </n-radio-group>
            </template>
            <template v-else-if="searchResults">
              <div
                class="flex flex-col items-center justify-center py-16 text-gray-400">
                <p class="text-lg">未找到相关歌曲</p>
              </div>
            </template>
            <template v-else>
              <div
                class="flex flex-col items-center justify-center py-16 text-gray-400">
                <MusicNote2Play20Regular
                  class="w-4 h-4"></MusicNote2Play20Regular>
                <p class="text-lg">请输入关键词搜索歌曲</p>
              </div>
            </template>
          </div>
        </n-space>
      </template>
    </n-modal>
    <n-modal
      v-model:show="showLangSelect"
      :style="{ width: '50vw !important' }"
      preset="dialog"
      title="请选择语言（2 / 3）"
      :icon="() => h(Translate24Filled)"
      positive-text="确认"
      negative-text="取消"
      @positive-click="
        () => {
          showLangSelect = false;
          triggerIPE();
        }
      "
      @negative-click="
        () => {
          showLangSelect = false;
        }
      ">
      <n-radio-group
        v-model:value="selectedLang"
        name="radiogroup">
        <n-space vertical>
          <n-radio
            v-for="lang in langs"
            :key="lang"
            :value="lang">
            {{ lang }}
          </n-radio>
        </n-space>
      </n-radio-group>
    </n-modal>
  </div>
</template>

<script setup>
import {
  NButton,
  NModal,
  NCard,
  NText,
  NInput,
  NDivider,
  NRadioGroup,
  NRadioButton,
  NRadio,
  NTag,
  NPopover,
  NSpace,
  useMessage,
  useNotification,
} from "naive-ui";
import _ from "lodash";
import {
  Translate24Filled,
  Search28Filled,
  SpinnerIos20Filled,
  CheckmarkCircle12Filled,
  MusicNote2Play20Regular,
} from "@vicons/fluent";
import { ref, defineProps, h } from "vue";
import LyricPreview from "./LyricPreview.vue";
import Lrc2WikiTemplate from "../wiki";
import { useLyricsCache } from "@/stores/LyricsCache.js";
const props = defineProps({
  songName: {
    type: String,
    default: "",
  },
  pageTitle: {
    type: String,
    default: "",
  },
});

const showModal = ref(false);
const showLangSelect = ref(false);
const searchKeyword = ref(props.songName);
const searchResults = ref([]);
const loading = ref(false);
const selectedSong = ref({});
const selectedLang = ref("ja");
const lyricsCache = useLyricsCache();
// const message = useMessage();
const notification = useNotification();
const pendingLyrics = {};
const langs = ["zh", "en", "ja", "自己文字替换啊啊啊"];

const searchSongs = _.debounce((keyword) => {
  loading.value = true;
  fetch(
    `https://163.gudev.online/cloudsearch?${new URLSearchParams({
      keywords: keyword,
    })}`
  )
    .then((resp) => {
      if (!resp.ok) {
        notification.warning({
          title: "网络错误！",
          description: resp,
        });
      }
      return resp.json();
    })
    .then((json) => {
      if (json.code !== 200) {
        searchResults.value = [];
      } else {
        searchResults.value = json.result.songs;
      }
    })
    .catch((error) => {
      searchResults.value = [];
      notification.warning({
        title: "搜索失败！",
        description: error,
      });
    })
    .finally(() => {
      loading.value = false;
    });
}, 300);

const handleSearchClick = () => {
  searchSongs(searchKeyword.value);
};

const handleSongSelect = (song) => {
  selectedSong.value = song;
};
const handleConfirm = () => {
  showModal.value = false;
  showLangSelect.value = true;
};
const triggerIPE = async () => {
  const lrcs = await lyricsCache.getLyrics(selectedSong.value?.id);
  const text = Lrc2WikiTemplate(selectedLang.value, lrcs);
  console.log(text);
  await Promise.resolve(
    InPageEdit.quickEdit({
      page: props.pageTitle,
      editText: text,
      editSummary:
        "//Powered by InPageEdit and [[用户:咕咕mur/ipe-plugin-thwiki-163lrc|163LRC Plugin]]",
      reload: false,
    })
  )
    .then(() => {
      ssi_modal.notify("success", {
        className: "in-page-edit",
        title: "163LRC（3 / 3）完成！",
        content: "记得检查，被找麻烦不管（",
      });
    })
    .then(async () => {
      $("#editSummary").val(
        "//Powered by InPageEdit and [[用户:咕咕mur/ipe-plugin-thwiki-163lrc|163LRC Plugin]]"
      );
      InPageEdit.progress(true);
      setTimeout(() => {
        InPageEdit.progress(false);
      }, 1000);
      const observer = new MutationObserver((mutations) => {
        const textarea = document.querySelector(".editArea");
        if (textarea) {
          textarea.value = text;
          observer.disconnect();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      $(".editArea").val(text);
    })

    .catch((err) => {
      notification.warning({
        title: "自动编辑失败",
        description: err,
      });
    });
};
</script>
