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

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    }
  };
};