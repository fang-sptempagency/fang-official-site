module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addPassthroughCopy("src/photos/**/*.webp");
  eleventyConfig.addPassthroughCopy("src/records/**/*.webp");
  eleventyConfig.addPassthroughCopy("src/archives/**/*.webp");

  eleventyConfig.addPassthroughCopy("src/js");
  
  eleventyConfig.addFilter("readableDate", function(dateObj) {
    var y = dateObj.getFullYear();
    var m = ('00' + (dateObj.getMonth()+1)).slice(-2);
    var d = ('00' + dateObj.getDate()).slice(-2);
    return (y + '/' + m + '/' + d);
  });

  eleventyConfig.addCollection("timelineWorks", function(collectionApi) {
    return collectionApi.getAll()
      .filter((item) => item.data.timeline)
      .sort((a, b) => {
        const aKey = a.data.timeline.sort_key || 9999999999;
        const bKey = b.data.timeline.sort_key || 9999999999;
        return Number(aKey) - Number(bKey);
      });
  });

  eleventyConfig.addFilter("fictionalDateLabel", function(timeline) {
    if (!timeline) return "";

    const year = timeline.fictional_year;
    const month = timeline.fictional_month;
    const day = timeline.fictional_day;

    if (!year) return "";

    if (month && day) {
      return `${year}年${month}月${day}日`;
    }

    if (month) {
      return `${year}年${month}月`;
    }

    return `${year}年`;
  });

  eleventyConfig.addCollection("persons", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/archive/persons/**/index.njk");
  });

  eleventyConfig.addCollection("publicPersons", function(collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/persons/**/index.njk")
      .filter((item) => item.data.listed !== false);
  });
  
  eleventyConfig.addFilter("scenarioText", function(content) {
  if (!content) return content;

  return content
    // ルビ：｜葛城正親《かつらぎ まさちか》
    .replace(/｜([^《]+)《([^》]+)》/g, "<ruby>$1<rt>$2</rt></ruby>")

    // 傍点：《《強調したい語》》
    .replace(/《《([^》]+)》》/g, '<em class="bouten">$1</em>')

    // 太字：**強調**
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

    // 斜体：*斜体*
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")

    // インデント：＞、＞＞、＞＞＞
    .split("\n")
    .map((line) => {
      if (line.startsWith("＞＞＞")) {
        return `<span class="scenario-indent scenario-indent--3">${line.slice(3)}</span>`;
      }
      if (line.startsWith("＞＞")) {
        return `<span class="scenario-indent scenario-indent--2">${line.slice(2)}</span>`;
      }
      if (line.startsWith("＞")) {
        return `<span class="scenario-indent scenario-indent--1">${line.slice(1)}</span>`;
      }
      return line;
    })
    .join("\n");
});

  eleventyConfig.addCollection("historyTimelineEvents", function() {
    const timeline = require("./src/_data/historyTimeline.js");

    const sortKey = (event) => {
      if (event.date) {
        return Number(event.date.replaceAll("-", ""));
      }

      const year = Number(event.year || 0);
      const month = Number(event.month || 1);
      const day = Number(event.day || 1);

      return year * 10000 + month * 100 + day;
    };

    return timeline.events.slice().sort((a, b) => {
      return sortKey(a) - sortKey(b);
    });
  });

  function toDateValue(input) {
    if (!input) return null;

    if (typeof input === "number") {
      return Date.UTC(input, 0, 1);
    }

    if (typeof input === "string") {
      // "1989" だけなら 1989-01-01 扱い
      if (/^\d{4}$/.test(input)) {
        return Date.UTC(Number(input), 0, 1);
      }

      const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        return Date.UTC(year, month - 1, day);
      }
    }

    return null;
  }

  eleventyConfig.addFilter("timelineDatePosition", function(date, startDate, endDate) {
    const start = toDateValue(startDate);
    const end = toDateValue(endDate);
    const current = toDateValue(date);

    if (start === null || end === null || current === null || end <= start) {
      return 0;
    }

    return ((current - start) / (end - start)) * 100;
  });
  
  eleventyConfig.addFilter("timelineDatePosition", function(date, startDate, endDate) {
    const start = toDateValue(startDate);
    const end = toDateValue(endDate);
    const current = toDateValue(date);

    if (start === null || end === null || current === null || end <= start) {
      return 0;
    }

    return ((current - start) / (end - start)) * 100;
  });

  eleventyConfig.addFilter("eventDateLabel", function(event) {
    if (!event) return "";

    if (event.date) {
      const match = event.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`;
      }
    }

    if (event.year && event.month && event.day) {
      return `${event.year}年${event.month}月${event.day}日`;
    }

    if (event.year && event.month) {
      return `${event.year}年${event.month}月`;
    }

    if (event.year) {
      return `${event.year}年`;
    }

    return "";
  });

  eleventyConfig.addFilter("eventDateValue", function(event) {
    if (!event) return "";

    if (event.date) {
      return event.date;
    }

    if (event.year && event.month && event.day) {
      return `${event.year}-${String(event.month).padStart(2, "0")}-${String(event.day).padStart(2, "0")}`;
    }

    if (event.year && event.month) {
      return `${event.year}-${String(event.month).padStart(2, "0")}-01`;
    }

    if (event.year) {
      return `${event.year}-01-01`;
    }

    return "";
  });

  eleventyConfig.addFilter("eventDateLabel", function(event) {
    if (!event) return "";

    if (event.date) {
      const match = event.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        return `${Number(match[1])}年${Number(match[2])}月${Number(match[3])}日`;
      }
    }

    if (event.year && event.month && event.day) {
      return `${event.year}年${event.month}月${event.day}日`;
    }

    if (event.year && event.month) {
      return `${event.year}年${event.month}月`;
    }

    if (event.year) {
      return `${event.year}年`;
    }

    return "";
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    }
  };
};