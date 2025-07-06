function langcode2lang(langcode) {
    switch (langcode) {
        case "zh":
            return "中文";
        case "en":
            return "英文";
        case "ja":
            return "日文";
        default:
            return langcode;
    }
}

function parseSingleLrc(lrcStr) {
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
    const result = [];

    if (!lrcStr || typeof lrcStr !== 'string') {
        return result;
    }

    const lines = lrcStr.split('\n');

    for (const line of lines) {
        if (!line.trim()) continue;

        const times = [];
        let lastIndex = 0;
        let match;

        while ((match = timeReg.exec(line)) !== null) {
            const [fullMatch, minutes, seconds, milliseconds] = match;
            const timeInSec = parseFloat(minutes) * 60 +
                parseFloat(seconds) +
                parseFloat(milliseconds.padEnd(3, '0')) / 1000;

            times.push({
                raw: `${minutes}:${seconds}.${milliseconds.padEnd(3, '0')}`,
                seconds: timeInSec
            });
            lastIndex = match.index + fullMatch.length;
        }

        // 提取歌词文本
        const text = line.slice(lastIndex).trim();
        if (!text && times.length === 0) continue;

        // 为每个时间标签创建条目
        for (const timeObj of times) {
            result.push({
                time: timeObj.raw,
                timeInSec: timeObj.seconds,
                lrc: text || '',
                rawLine: line
            });
        }
    }

    // 按时间排序
    result.sort((a, b) => a.timeInSec - b.timeInSec);

    return result;
}

function parseLrc(raw, translation) {
    const rawArr = parseSingleLrc(raw);
    const transArr = translation ? parseSingleLrc(translation) : [];

    let j = 0;
    for (let i = 0; i < rawArr.length; i++) {
        let t = rawArr[i].time;
        while (
            j < transArr.length &&
            transArr[j].time < t
        ) j++;
        if (j < transArr.length && transArr[j].time === t) {
            rawArr[i].translation = transArr[j].lrc;
        }
    }

    return rawArr.map(item => ({
        time: item.time,
        raw: item.lrc,
        translation: item.translation || ''
    }));
}

function lrc2TemplateParams(lang, raw, translation) {
    const parsedLrc = parseLrc(raw, translation);
    return (
        parsedLrc.map(item => {
            if (!item.raw && !item.translation) {
                return "sep=";
            } else {
                return `
time=${item?.time}
${lang}=${item?.raw}
zh=${item?.translation}
`.trim()
            }
        }).join("\n\n")
    ).trim()
}

export default function Lrc2WikiTemplate(lang, lrcs) {
    if (!lrcs?.lrc?.lyric) {
        return `自己关了 要不自己写`
    }
    else if (lrcs?.lrc?.lyric && lrcs?.tlyric?.lyric) {
        return (
            `
__LYRICS__

{{歌词信息|
| 语言 = ${langcode2lang(lang)}
| 翻译 = 中文
| 译者 = [https://music.163.com/#/user/home?id=${lrcs?.transUser?.userid} ${lrcs?.transUser?.nickname}]@网易云音乐
}}

lyrics=

${lrc2TemplateParams(lang, lrcs?.lrc?.lyric, lrcs?.tlyric?.lyric)}
        
`
        ).trim()
    }
    else {
        return (
            `
__LYRICS__

{{歌词信息|
| 语言 = ${langcode2lang(lang)}
| 翻译 = 中文
| 译者 = 
}}

lyrics=

${lrc2TemplateParams(lang, lrcs?.lrc?.lyric, lrcs?.tlyric?.lyric)}
        
`
        ).trim()
    }
}