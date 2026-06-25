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

  eleventyConfig.addFilter("scenarioText", function(content) {
  if (!content) return content;

    return content
      // HTMLエスケープしたい場合は本当は先にescape処理が必要。
      // 自分だけが編集する静的サイトなら、まずは簡易版でOK。

      // ルビ：｜葛城正親《かつらぎ まさちか》
      .replace(/｜([^《]+)《([^》]+)》/g, "<ruby>$1<rt>$2</rt></ruby>")

      // 太字：**文字**
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

      // 斜体：*文字*
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")

      // インデント：行頭の ＞
      .split("\n")
      .map((line) => {
        if (line.startsWith(">>>")) {
          return `<span class="scenario-indent scenario-indent--3">${line.slice(3)}</span>`;
        }
        if (line.startsWith(">>")) {
          return `<span class="scenario-indent scenario-indent--2">${line.slice(2)}</span>`;
        }
        if (line.startsWith(">")) {
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