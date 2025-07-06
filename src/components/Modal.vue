<template>
  <n-message-provider>
    <n-dialog-provider>
      <n-modal-provider>
        <n-notification-provider>
          <Interface
          :songName="props.songName"
          :pageTitle="props.pageTitle"></Interface>
          <!-- <Interface></Interface> -->
        </n-notification-provider>
      </n-modal-provider>
    </n-dialog-provider>
  </n-message-provider>
</template>

<script setup>
import {
  NDialogProvider,
  NMessageProvider,
  NModalProvider,
  NNotificationProvider,
} from "naive-ui";
import { defineProps } from "vue";
import Interface from "./Interface.vue";

const props = defineProps(["songName", "pageTitle"]);
</script>
