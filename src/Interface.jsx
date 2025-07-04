import { useState } from "react";
import config from "../ipe-plugin.json";
import Lrc2WikiTemplate from "@/wiki";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { createPortal } from "react-dom";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

function LyricsPreview({ lyrics }) {
  if (!lyrics) {
    return (
      <Alert variant="destructive">
        <i class="fa fa-exclamation"></i>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>歌词呢？</AlertDescription>
      </Alert>
    );
  }
  if (lyrics.tlyric?.lyric) {
    return (
      <div className="flex h-5 items-center space-x-4 text-sm">
        <h4 className="text-sm font-medium leading-none">原文歌词</h4>
        <p className="text-sm text-muted-foreground">
          {lyrics.lrc?.lyric}
        </p>
        <Separator orientation="vertical" />
        <h4 className="text-sm font-medium leading-none">译文歌词</h4>
        <p className="text-sm text-muted-foreground">
          {lyrics.tlyric?.lyric}
        </p>
      </div>
    );
  } else {
    return (
      <div className="flex h-5 items-center space-x-4 text-sm">
        <h4 className="text-sm font-medium leading-none">原文歌词</h4>
        <p className="text-sm text-muted-foreground">
          {lyrics.lrc?.lyric}
        </p>
      </div>
    );
  }
}

export default function IPEPluginInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(
    mw.config.get("wgTitle")
  );
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSong, setselectedSong] = useState({});
  const [lyricsCache, setLyricsCache] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLangSelect, setShowLangSelect] = useState(false);
  const [selectedLang, setSelectedLang] = useState("ja");
  const { toast } = useToast();
  const targetElement = document.getElementById("content");

  const searchSongs = (keyword) => {
    setLoading(true);
    fetch(
      `https://163.gudev.online/cloudsearch?${new URLSearchParams({
        keywords: keyword,
      })}`
    )
      .then((resp) => {
        if (!resp.ok) {
          toast({
            title: "网络错误！",
            description: resp.status,
          });
        }
        return resp.json();
      })
      .then((json) => {
        if (json.code !== 200) {
          setSearchResults([]);
        } else {
          setSearchResults(json.result.songs);
        }
      })
      .catch((error) => {
        setSearchResults([]);
        toast({
          title: "搜索失败！",
          description: error,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchSongs(searchKeyword);
    }
  };
  const handleSearchClick = () => {
    searchSongs(searchKeyword);
  };
  const getLyrics = (songId) => {
    if (!songId) {
      return {};
    }
    if (lyricsCache[songId]) {
      return Promise.resolve(lyricsCache[songId]);
    }

    return fetch(
      `https://163.gudev.online/lyric?${new URLSearchParams({
        id: songId,
      })}`
    )
      .then((resp) => {
        if (!resp.ok) {
          toast({
            title: "网络错误！",
            description: resp.status,
          });
        }
        return resp.json();
      })
      .then((json) => {
        setLyricsCache((prev) => ({
          ...prev,
          [songId]: json,
        }));
        return json;
      })
      .catch((error) => {
        toast({
          title: "歌曲获取失败！",
          description: error,
        });
        return {};
      });
  };
  const handleSongSelect = (song) => {
    setselectedSong(song);
    setShowConfirm(true);
  };
  const handleConfirm = () => {
    setIsOpen(false);
    setShowLangSelect(true);
  };

  const triggerIPE = async () => {
    const title = mw.config.get("wgPageName");
    const lrcs = await getLyrics(selectedSong?.id);
    const text = Lrc2WikiTemplate(selectedLang, lrcs);
    await Promise.resolve(
      InPageEdit.quickEdit({
        page: title,
        editText: text, 
        editSummary:
          "//Powered by InPageEdit and [[用户:咕咕mur/ipe-plugin-thwiki-163lrc|163LRC Plugin]]",
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
        $("textarea.editArea").val(text);
        $("#editSummary").val(
          "//Powered by InPageEdit and [[用户:咕咕mur/ipe-plugin-thwiki-163lrc|163LRC Plugin]]"
        );
      })
      .catch((err) => {
        toast({
          title: "自动编辑失败",
          description: err?.message || err,
          variant: "destructive",
        });
      });
  };
  return (
    <div>
      <Toaster />
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        className="z-[10000]">
        {createPortal(
          <DialogTrigger asChild>
            <button
              id={config.name}
              className={`ipe-toolbox-btn fa ${config.icon}`}></button>
          </DialogTrigger>,
          document.getElementById("btn-ipe-plugin-163lrc-anchor")
        )}
        <DialogPortal container={targetElement}>
          <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[520px] w-full rounded-2xl shadow-2xl border border-gray-200 bg-white/95 p-8 flex flex-col gap-6 z-[30000]">
            <DialogHeader className="items-center">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                163LRC工具执行（1 / 3）
                <img
                  src="https://img.shields.io/badge/THBwiki-InPageEdit_plugin_163lrc-ffa500"
                  className="h-6 align-middle rounded"
                  alt="badge"
                />
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1 text-base">
                请于下方搜索框中调整自动获取的歌曲名称，单选符合条件的歌曲，经过确认后选择语言，再跳转到IPE的编辑页面，符合条件后完成自动编辑。
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="搜索歌曲"
                  className="pl-10 h-12 rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-base shadow-sm transition-all w-60vh
                "
                />
              </div>
              <Button
                onClick={handleSearchClick}
                disabled={loading || !searchKeyword.trim()}
                className="flex items-center gap-2  h-12 rounded-lg text-base font-semibold bg-red-500 hover:bg-red-600 text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all w-20vh">
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    搜索中
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i>
                    搜索
                  </>
                )}
              </Button>
            </div>
            <div className="overflow-y-auto max-h-96 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <i className="fas fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
                  <span className="text-lg">搜索中...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((song) => (
                    <HoverCard
                      key={song?.id}
                      onOpenChange={async (open) => {
                        if (open && !lyricsCache[song?.id]) {
                          await getLyrics(song?.id);
                        }
                      }}>
                      <HoverCardTrigger asChild>
                        <Card
                          className={` transition-all duration-200 hover:shadow-md ${
                            selectedSong?.id === song?.id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:border-gray-300"
                          }`}
                          onClick={() => handleSongSelect(song)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img
                                  src={song?.al?.picUrl}
                                  alt={song?.name}
                                  className="w-12 h-12 rounded shadow object-cover"
                                  style={{
                                    minWidth: 50,
                                    minHeight: 50,
                                  }}
                                />
                                <div>
                                  <CardTitle className="text-base">
                                    {song.name}
                                  </CardTitle>
                                  <CardDescription className="text-sm">
                                    {(song?.ar
                                      ?.map((item) => item?.name)
                                      .join("&") || "") +
                                      (song?.al?.name
                                        ? ` • ${song?.al?.name}`
                                        : "")}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <a
                                  href={`https://music.163.com/#/song?id=${song?.id}`}
                                  target="_blank">
                                  <Badge
                                    variant="destructive"
                                    className="text-xs">
                                    <i className="fas fa-clock mr-1"></i>
                                    到网易云音乐
                                  </Badge>
                                </a>
                                {selectedSong?.id === song?.id && (
                                  <i className="fas fa-check-circle text-blue-600"></i>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-file-text text-blue-600"></i>
                            <h4 className="text-sm font-semibold">
                              歌词预览
                            </h4>
                          </div>
                          <div className="text-xs text-gray-600 whitespace-pre-line max-h-40 overflow-y-auto px-2 py-1 rounded bg-gray-50 border border-gray-200">
                            <LyricsPreview
                              lyrics={getLyrics(selectedSong?.id)}
                            />
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              ) : searchResults ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <i className="fas fa-search text-5xl mb-4"></i>
                  <p className="text-lg">未找到相关歌曲</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <i className="fas fa-music text-5xl mb-4"></i>
                  <p className="text-lg">请输入关键词搜索歌曲</p>
                </div>
              )}
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      <AlertDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        className="z-20000">
        <AlertDialogPortal container={targetElement}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认选择</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要选择这首歌曲吗？
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md "border-blue-500 bg-blue-50"`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedSong?.al?.picUrl}
                          alt={selectedSong?.name}
                          className="w-12 h-12 rounded shadow object-cover"
                          style={{ minWidth: 50, minHeight: 50 }}
                        />
                        <div>
                          <CardTitle className="text-base">
                            {selectedSong?.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {selectedSong?.ar
                              ?.map((item) => item.name)
                              .join("&")}{" "}
                            • {selectedSong?.al?.name}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <a
                          href={`https://music.163.com/#/song?id=${selectedSong?.id}`}
                          target="_blank">
                          <Badge
                            variant="destructive"
                            className="text-xs">
                            <i className="fas fa-clock mr-1"></i>
                            到网易云音乐
                          </Badge>
                        </a>
                        <i className="fas fa-check-circle text-blue-600"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setselectedSong({});
                  setShowConfirm(false);
                }}>
                <i className="fa fa-times mr-2"></i>
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                <i className="fa fa-check mr-2"></i>
                确认
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>

      <AlertDialog
        open={showLangSelect}
        onOpenChange={setShowLangSelect}
        className="z-30000">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>请选择语言（2 / 3）</AlertDialogTitle>
            <AlertDialogDescription>
              <RadioGroup
                value={selectedLang}
                onValueChange={setSelectedLang}
                className="flex flex-col gap-2 mt-2">
                {["zh", "en", "ja", "自己文字替换啊啊啊"].map(
                  (lang) => (
                    <div
                      key={lang}
                      className="flex items-center gap-2">
                      <RadioGroupItem
                        value={lang}
                        id={`lang-${lang}`}
                      />
                      <label htmlFor={`lang-${lang}`}>{lang}</label>
                    </div>
                  )
                )}
              </RadioGroup>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowLangSelect(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowLangSelect(false);
                triggerIPE();
              }}>
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
