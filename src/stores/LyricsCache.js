import { defineStore } from 'pinia'
import { useNotification } from "naive-ui"
import _ from "lodash"

const notification = useNotification();

export const useLyricsCache = defineStore('lyrics', {
    state: () => ({
        lyricsMap: {},
        pendingLyrics: {}
    }),
    actions: {
        async _getLyrics(songId) {
            if (!songId) {
                return {};
            }
            if (this.lyricsMap[songId]) {
                return Promise.resolve(this.lyricsMap[songId]);
            }

            return fetch(
                `https://163.gudev.online/lyric?${new URLSearchParams({
                    id: songId,
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
                    this.lyricsMap = {
                        ...this.lyricsMap,
                        [songId]: json,
                    };
                    return json;
                })
                .catch((error) => {
                    notification.warning({
                        title: "歌曲获取失败！",
                        description: error,
                    });
                    return {};
                });
        },

        async getLyrics(songId) {
            if (!songId) return {};

            if (this.lyricsMap[songId]) {
                return this.lyricsMap[songId]
            }
            if (this.pendingLyrics[songId]) return this.pendingLyrics[songId];

            this.pendingLyrics[songId] = _.once(async () => await this._getLyrics(songId))();
            const result = await this.pendingLyrics[songId];
            delete this.pendingLyrics[songId];
            return result;
        },
    }
})