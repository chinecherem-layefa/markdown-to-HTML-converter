//****** STAGE 1 *****//
// The main orchestrator.
// This is the public API, the only function the outside world calls. It has a single responsibility, its only job is to coordinate the pipeline stages in correct, systematic way.

function markdownToHTML(markdown) {
  // Input validation - defensive programming.
  if (typeof markdown !== "string") {
    throw new TypeError("Input must be a string!"); // this keeps our detailed design architecture as smart, specific and clear and posssible.
  }

  //***** STAGE 2 *****// split the markdown into lines using the newlines as delimiters.
  const lines = markdown.split(/\r?\n/);

  //***** STAGE 3 *****// This will hold our HTML as we build it.
  const output = [];

  // STATE MACHINE variables;
  let inCodeBlock = false; // Are we inside ``` code fences?
  let inList = false; // Are we inside a <ul> or <ol>?
  let listStack = []; // Tracking nested lists (only needed for advanced implementation)
  let paragraphBuffer = []; // collect lines for a paragraph
  let currentListType = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      flushParagraph(paragraphBuffer);
      flushList(currentListType);
      continue;
    }

    if (trimmedLine.startsWith("```")) {
      // using trimmedLine because everything a line starts with is a string.
      if (!inCodeBlock) {
        // we are automatically in a new code block.
        flushParagraph(paragraphBuffer);
        flushList(currentListType);
        output.push("<pre><code>");
        inCodeBlock = true;
      } else {
        // we are now exiting a code block because we have been in a code block before.
        output.push("</code></pre>\n");
        inCodeBlock = false;
      }
      continue;
    }

    // if we ARE inside a code block, just sanitize the line.
    if (inCodeBlock) {
      output.push(escapeHtml(line) + "\n");
      continue;
    }

    // ----- HANDLE HEADINGS (BLOCK LEVEL)
    // Headings start with 1-6 # characters followed by a space before the content.
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/); // returns an array, headingMatch = ["# Markdown to HTML converter", "#", "Markdown to HTML converter" ]
    if (headingMatch) {
      flushParagraph(paragraphBuffer);
      flushList(currentListType);
      const level = headingMatch[1].length;
      const content = parseInLine(headingMatch[2]);
      output.push(`<h${level}>${content}</h${level}>\n`);
      continue;
    }

    // ****** HANDLE LISTS ***** //
    const unorderedMatch = trimmedLine.match(/^([-*+])\s+(.*)$/);
    const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);

    if (unorderedMatch || orderedMatch) {
      if (!inList) {
        currentListType = unorderedMatch ? "ul" : "ol";
        flushParagraph(paragraphBuffer);
        output.push(`<${currentListType}>\n`);
        inList = true;
      }

      const content = unorderedMatch
        ? parseInLine(unorderedMatch[2])
        : parseInLine(orderedMatch[2]);
      output.push(`<li>${content}</li>\n`);
      continue;
    }

    // ------ HANDLE HORIZONTAL RULES ------ //
    // three or more -, * or _ at the start of a line indicates an horizontal rule.
    if (trimmedLine.match(/^[-*_]{3,}$/)) {
      flushParagraph(paragraphBuffer);
      flushList(currentListType);
      output.push("<hr/>\n");
      continue; // move to the next iteration.
    }

    paragraphBuffer.push(line);
  }
  // Now, our lines are done and we are at the end of the file. So flush every remaining content.
  flushParagraph(paragraphBuffer);
  flushList(currentListType);

  function flushParagraph(buffer) {
    if (buffer.length === 0) return;
    const paragraphText = buffer.join(" ").trim();
    if (paragraphText.length > 0) {
      output.push(`<p>${parseInLine(paragraphText)}</p>\n`);
    }
    buffer.length = 0;
  }

  function flushList(currentListType) {
    if (currentListType) {
      output.push(`</${currentListType}>`);
      currentListType = null;
    }
  }

  return output.join("").replace(/\n{3,}/g, "\n\n");
}

function parseInLine(text) {
  let result = escapeHtml(text);
  //Pattern 1: Strong/Bold (MOST SPECIFIC FIRST);
  // **text** or __text__
  result = result.replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`);
  result = result.replace(/\__(.*?)\__/g, `<strong>$1</strong>`);
  result = result.replace(/(?<!\w)\*(.*?)\*(?!\w)/g, `<em>$1</em>`);
  result = result.replace(/(?<!\w)\_(.*?)\_(?!\w)/g, `<em>$1</em>`);
  // Pattern 3: Inline code.
  // `code`
  result = result.replace(/\`(.*?)\`/g, `<code>$1</code>`);

  // Pattern 4: Links.
  // [text](url) or [text](url "title")
  result = result.replace(
    /\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g,
    function (match, text, url, title) {
      let titleAttr = "";
      if (title) {
        titleAttr = `title="${escapeHtml(title)}"`;
      }
      return `<a href="${escapeHtml(url)}"${titleAttr}>${text}</a>`; // wow, so some anchor elements have title attached to them.
    },
  );

  // Pattern 5: Images;
  // ![alt](url)
  result = result.replace(/!\[(.*?)\]\((.*?)\)/g, `<img src="$2" alt="$1">`);
  return result;
}

function escapeHtml(text) {
  // Create a map or dictionary of all (5) dangerous characters to their safe HTML entities
  const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
}

export { markdownToHTML };

// ```js
// console.log(15);
// ```

// This is expected to wrap in a paragraph tag.

// - One item list

// - One item
// - Two items
