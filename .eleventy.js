const episodeLanes = require("./src/_data/episodeLanes.js");

module.exports = function(eleventyConfig) {
  eleventyConfig.addWatchTarget("./src/fang/episodes/");
  eleventyConfig.addWatchTarget("./src/fang/episodes/index.njk");
  eleventyConfig.addWatchTarget("./src/archive/scenarios/");
  eleventyConfig.addWatchTarget("./src/_includes/");

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addPassthroughCopy("src/fang/photos/**/*.webp");
  eleventyConfig.addPassthroughCopy("src/fang/episodes/**/*.webp");
  eleventyConfig.addPassthroughCopy("src/records/**/*.webp");
  eleventyConfig.addPassthroughCopy("src/archives/**/*.webp");

  eleventyConfig.addFilter("readableDate", function(dateObj) {
    var y = dateObj.getFullYear();
    var m = dateObj.getMonth()+1;
    var d = dateObj.getDate();
    return `${y}年${m}月${d}日`;
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

  eleventyConfig.addFilter("findEpisodeLane", function(viewpoint) {
    return episodeLanes.find((lane) => lane.name === viewpoint) || {
      name: viewpoint || "その他",
      key: "other",
      color: "#666666",
      label: viewpoint || "その他"
    };
  });

  eleventyConfig.addFilter("hasEpisodeLane", function(viewpoint) {
    return episodeLanes.some((lane) => lane.name === viewpoint);
  });

  eleventyConfig.addCollection("episodes", function(collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/fang/episodes/*/index.njk")
      .filter((item) => item.data.listed !== false)
      .sort((a, b) => {
        const aKey = a.data.timeline?.sort_key || 9999999999;
        const bKey = b.data.timeline?.sort_key || 9999999999;
        return Number(aKey) - Number(bKey);
      });
  });

  eleventyConfig.addFilter("pageNumbers", function(count) {
    const pageCount = Number(count || 0);

    return Array.from({ length: pageCount }, (_, index) => {
      return String(index + 1).padStart(3, "0");
    });
  });

  eleventyConfig.addCollection("persons", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/archive/persons/**/index.njk");
  });

  eleventyConfig.addCollection("publicPersons", function(collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/persons/**/index.njk")
      .filter((item) => item.data.listed !== false);
  });
  
  eleventyConfig.addCollection("scenarios", function(collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/archive/scenario/*/index.njk")
      .filter((item) => item.data.listed !== false)
      .sort((a, b) => {
        const aKey = a.data.timeline?.sort_key || 9999999999;
        const bKey = b.data.timeline?.sort_key || 9999999999;
        return Number(aKey) - Number(bKey);
      });
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

  eleventyConfig.addCollection("photos", function(collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/fang/photos/*/index.njk")
      .filter((item) => item.data.listed !== false)
      .sort((a, b) => {
        const aDate = a.data.production_date || new Date(0);
        const bDate = b.data.production_date || new Date(0);
        return bDate - aDate;
      });
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

  eleventyConfig.addFilter("groupBy", function(items, key) {
    if (!Array.isArray(items)) return [];

    const groups = new Map();

    items.forEach((item) => {
      const groupName = item[key] || "未分類";

      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }

      groups.get(groupName).push(item);
    });

    return Array.from(groups, ([name, items]) => {
      return { name, items };
    });
  });

  eleventyConfig.addFilter("referenceStatusLabel", function(status) {
    const labels = {
      read: "読了",
      referenced: "部分参照",
      skimmed: "流し読み",
      reading: "読書中",
      "to-read": "参照予定"
    };

    return labels[status] || status || "未設定";
  });

  eleventyConfig.addFilter("referenceTypeLabel", function(type) {
    const labels = {
      book: "書籍",
      whitepaper: "白書・公的資料",
      paper: "論文",
      article: "記事",
      website: "Webページ"
    };

    return labels[type] || type || "資料";
  });

  const referenceCategories = require("./src/_data/referenceCategories.js");

  eleventyConfig.addFilter("groupReferencesByCategory", function(items) {
    if (!Array.isArray(items)) return [];

    const groups = new Map();

    items.forEach((item) => {
      const groupName = item.category || "未分類";

      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }

      groups.get(groupName).push(item);
    });

    const orderedGroups = referenceCategories
      .filter((category) => groups.has(category))
      .map((category) => ({
        name: category,
        items: groups.get(category)
      }));

    const remainingGroups = Array.from(groups, ([name, items]) => ({
      name,
      items
    })).filter((group) => !referenceCategories.includes(group.name));

    return [...orderedGroups, ...remainingGroups];
  });

  eleventyConfig.addFilter("commentReferences", function(references) {
    if (!Array.isArray(references)) return [];

    return references.filter((reference) => {
      return reference.visibility === "comment";
    });
  });

  eleventyConfig.addFilter("publicReferences", function(references) {
    if (!Array.isArray(references)) return [];

    return references.filter((reference) => {
      return reference.visibility !== "comment" && reference.visibility !== "hidden";
    });
  });
  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    }
  };
};