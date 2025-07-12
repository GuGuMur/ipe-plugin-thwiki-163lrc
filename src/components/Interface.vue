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
            class="w-90vh flex">
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
            <n-p> 你选中了 {{ selectedSongs.length }} 首歌曲。 </n-p>
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
              <n-data-table
                :columns="tableColumns"
                :data="searchResults"
                :pagination="{
                  pageSize: 5,
                  showSizePicker: true,
                  pageSizes: [5, 10, 20],
                  showQuickJumper: true,
                }"
                :row-key="(row) => row"
                @update:checked-row-keys="tableCheck" />
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
  useModal,
  useNotification,
  NP,
  NDataTable,
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
import { Lrc2WikiTemplate, LrcArray2WikiTemplate } from "../wiki";
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
const selectedSongs = ref([]);
const selectedLang = ref("ja");
const lyricsCache = useLyricsCache();
// const message = useMessage();
const modal = useModal();
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
  selectedSongs.value = song;
};
const handleConfirm = () => {
  showModal.value = false;
  showLangSelect.value = true;
};
const triggerIPE = async () => {
  try {
    // const lrcPromises = selectedSongs.value.map((item) =>
    //   lyricsCache.getLyrics(item?.id)
    // );
    // const lrcs = await Promise.all(lrcPromises);
    InPageEdit.progress("正在获取文本......")
    const lrcs = [];
    for (const item of selectedSongs.value) {
      const lyric = await lyricsCache.getLyrics(item?.id);
      lrcs.push(lyric);
    }
    let text = "";
    if (lrcs.length == 1) {
      text = Lrc2WikiTemplate(
        selectedLang.value,
        lrcs[0]
      );
    } else {
      text = LrcArray2WikiTemplate(selectedLang.value, selectedSongs.value, lrcs);
    }
    console.log(text);
    InPageEdit.progress(true)
    InPageEdit.progress(false)
    InPageEdit.quickEdit({
      page: props.pageTitle,
      editText: text,
      editSummary:
        "//Powered by InPageEdit and [[用户:咕咕mur/ipe-plugin-thwiki-163lrc|163LRC Plugin]]",
      // reload: false,
    });
    $("#editSummary").val(
      "//Powered by InPageEdit and [[用户:咕咕mur/ipe-plugin-thwiki-163lrc|163LRC Plugin]]"
    );
    $(".editArea").val(text);
    notification.success({
      title: "163LRC（3 / 3）完成！",
      description: "你先别急，我也很急",
      content:
        "由于IPE功能限制，编辑区域可能需要5s左右同步wikitext，若未能及时同步请在控制台中复制粘贴生成的文本或重新进行一遍插件的流程，相关提示未出现前建议不要编辑不要提交。",
    });
    // 临时操作一下

    setTimeout(() => {
      $("#editSummary").val(
        "//Powered by InPageEdit and [[用户:咕咕mur/ipe-plugin-thwiki-163lrc|163LRC Plugin]]"
      );
      $(".editArea").val(text);

      notification.success({
        title: "延时操作（3.5 / 3）完成！",
        description: () =>
          h("div", null, [
            "感谢包容，",
            h("del", null, "这IPE怎么这么坏啊"),
            "，下一个版本说不定就好了呢（）",
          ]),
      });
    }, 5000);
  } catch (err) {
    notification.warning({
      title: "自动编辑失败",
      description: err,
    });
  } finally {
    selectedSongs.value = []
  }
};

function createTableColumns() {
  return [
    {
      type: "selection",
    },
    {
      title: "封面",
      key: "al.picUrl",
      render(row) {
        const url = row.al.picUrl.replace("http://", "https://");
        return h("img", {
          src: url,
          alt: row.name,
          class: "w-12 h-12 rounded shadow object-cover",
          style: "min-width: 50px; min-height: 50px",
        });
      },
    },
    {
      title: "曲名",
      key: "name",
      render(row) {
        return h("span", row?.name);
      },
    },
    {
      title: "歌手",
      key: "ar",
      render(row) {
        return h("span", row.ar.map((a) => a.name).join("&"));
      },
    },
    {
      title: "专辑",
      key: "alname",
      render(row) {
        return h("span", row.al?.name);
      },
    },
    {
      title: "歌词",
      key: "id",
      render(row) {
        return h(
          NButton,
          {
            type: "primary",
            size: "small",
            onClick: () => {
              const m = modal.create({
                title: `歌词预览——${row.name}（${row.ar
                  .map((a) => a.name)
                  .join("&")}，${row.al?.name}）`,
                preset: "card",
                style: {
                  width: "600px",
                  height: "500px",
                  overflow: "auto",
                },
                content: h(LyricPreview, {
                  id: row.id,
                }),
                footer: () =>
                  h(
                    NButton,
                    { type: "primary", onClick: () => m.destroy() },
                    () => "关闭"
                  ),
              });
              return m;
            },
          },
          { default: () => "歌词预览" }
        );
      },
    },
  ];
}
const tableColumns = createTableColumns();
const tableCheck = (rowKeys) => {
  selectedSongs.value = rowKeys;
};
</script>
