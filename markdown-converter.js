function markdownToHTML(markdown) {
  // Error processing and input validation...
  if (typeof markdown !== "string") {
    throw new TypeError("Input must be a string");
  }

  // Make ready the input for parsing;
  const lines = markdown.split(/\r?\n/);

  // Make ready the output that will be getting the parsed blocks
  const output = []; // array push over string concatenation. O(n) over O(n^2)

  // State machine variables
  let paragraphBuffer = [];
  let currentListType = null;
  let inCodeBlock = false;

  // Now, taking each line iteratively, let's parse each one accordingly; code blocks have the most priority.
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Blank lines that seperate blocks...
    if (trimmedLine === "") {
      flushParagraph();
      flushList();
      continue;
    }

    // Code blocks
    if (trimmedLine.startsWith("```")) {
      if (!inCodeBlock) {
        flushParagraph();
        inCodeBlock = true;
        output.push("<pre><code>\n");
      } else {
        inCodeBlock = false;
        output.push("</code><pre>\n");
      }
      continue;
    }
    if (inCodeBlock) {
      output.push(escapeHTML(line) + "\n");
      continue;
    }

    // Headings (/^(#{1,6})\s+(.*)$/)
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const headingLevel = headingMatch[1].length;
      const headingContent = parseInLine(headingMatch[2]);
      output.push(`<h${headingLevel}>${headingContent}</h${headingLevel}>\n`);
      continue;
    }

    // Lists (/^([-*+])\s+(.*)$/)  (/^(\d+)\.\s+(.*)$/)
    const unorderedMatch = trimmedLine.match(/^([-*+])\s+(.*)$/);
    const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
    if (unorderedMatch || orderedMatch) {
      if (!currentListType) {
        flushParagraph();
        currentListType = unorderedMatch ? "ul" : "ol";
        output.push(`<${currentListType}>\n`);
      }

      const listContent = unorderedMatch ? unorderedMatch[2] : orderedMatch[2];
      output.push(`<li>${parseInLine(listContent)}</li>\n`);
      continue;
    }

    // Horizontal rule /^[-*_]{3,}$/
    if (trimmedLine.match(/^[-*_]{3,}$/)) {
      output.push(`<hr>\n`);
      continue;
    }

    paragraphBuffer.push(parseInLine(line));
  }
  flushList();
  flushParagraph();

  function flushList() {
    if (currentListType) {
      output.push(`</${currentListType}>\n`);
      currentListType = null;
    }
  }

  function flushParagraph() {
    if (paragraphBuffer === 0) return;
    const aParagraph = paragraphBuffer.join(" ").trim();
    if (aParagraph.length > 0) {
      output.push(`<p>${aParagraph}</p>\n`);
    }
    paragraphBuffer.length = 0;
  }

  //   return output.join("").replace(/\n{3,}/g, "\n\n");
  return output.join("").replace(/\n{3,}/g, "\n\n");
}

// These are functions for parsing in line elements and entities.
function parseInLine(text) {
  let result = escapeHTML(text);

  // Images are of the highest priority ![link](url)
  result = result.replace(/!\[(.*?)\]\((.*?)\)/g, `<img src="$2" alt="$1">\n`);
  // Then links [link](url) or [link](url "title")  /\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g,
  result = result.replace(
    /\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g,
    function (match, link, url, title) {
      let titleContent = "";
      if (title) {
        titleContent = `title="${title}"`;
      }
      return `<a href="${url}"${titleContent}>${link}</a>`;
    },
  );
  // Then strong, italic text...
  result = result.replace(/\*\*(.*?)(?<!\w)\*\*/g, `<strong>$1</strong>`);
  result = result.replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`);
  result = result.replace(/\*(.*?)\*/g, `<em>$1</em>`);
  result = result.replace(/\_\_(.*?)\_\_/g, `<strong>$1</strong>`);
  result = result.replace(/\_(.*?)\_/g, `<em>$1</em>`);

  // Then inline code blocks
  result = result.replace(/\`(.*?)\`/g, `<code>$1</code>`);

  return result;
}

function escapeHTML(text) {
  const htmlEscapes = {
    "&": "&mp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  };
  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
}

export { markdownToHTML };
