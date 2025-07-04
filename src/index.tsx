import config from "../ipe-plugin.json";
import "@/style.css";
import "virtual:uno.css";
// import { render } from "react";
import ReactDOM from "react-dom/client";
import IPEPluginInterface from "@/Interface.jsx";
// import { createPortal } from "react-dom";

mw.hook("InPageEdit.toolbox").add(({ $toolbox }) => {
  $toolbox
    .find(".btn-group.group1")
    .append(
      $("<li>", { class: "btn-tip-group" }).append(
        $("<div>", { class: "btn-tip", text: config.description }),
        $("<div>", { id: "btn-ipe-plugin-163lrc-anchor" })
      )
    );
  $('<div id="ipe-plugin-163lrc"></div>').prependTo("#content");


  const mountNode = document.getElementById("ipe-plugin-163lrc");
  if (mountNode) {
    const root = ReactDOM.createRoot(mountNode);
    root.render(<IPEPluginInterface />);
  }


  console.log("[InPageEdit] 插件 thbwiki-163lrc 加载成功");
});
