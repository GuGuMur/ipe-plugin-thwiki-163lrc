import { createApp } from "vue";
import Modal from "@/components/Modal.vue";
import { createPinia } from 'pinia'
// import config from "../ipe-plugin.json";
import "@/style.module.css";
import "virtual:uno.css";

mw.hook("InPageEdit").add(() => {
  // CD页面 给每个红链加，同时调span的样式，防止断行
  $('span.new[title="（歌词页面不存在）"]').each(function () {
    this.style.setProperty("display", "inline-flex", "important");
    const $firstA = $(this).find("a:first");
    const url = new URL($firstA.attr("href"), window.location.origin);
    const pageTitle = url.searchParams.get("title").replace("_", " ");
    const songName = pageTitle.replace("歌词:", "");
    const mountNode = document.createElement("div");
    $firstA.after(mountNode);
    createApp(Modal, { songName, pageTitle }).use(createPinia()).mount(mountNode);
    console.log(`[163LRC]: 为 ${songName} 创建编辑入口成功！`);
  });

  // 歌词页面：在标题里加，保证h1里面的线不被截断
  const pageTitle = mw.config.get('wgPageName')
  if (pageTitle.startsWith("歌词")) {
    const songName = mw.config.get("wgTitle")
    $('#firstHeading > span.mw-page-title-main').each(function () {
      this.style.setProperty("display", "inline-flex", "important")
      const mountNode = document.createElement("div")
      this.append(mountNode)
      createApp(Modal, { songName, pageTitle }).use(createPinia()).mount(mountNode);
      console.log(`[163LRC]: 为主页面 ${pageTitle} 创建编辑入口成功！`);

    })
  }
  console.log("[InPageEdit] 插件 thbwiki-163lrc 加载成功");
})