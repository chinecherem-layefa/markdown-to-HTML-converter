import { markdownToHTML } from "./markdown-converter.js";

const convertBtn = document.getElementById("convert");
const input = document.getElementById("inputMarkdown");
const output = document.getElementById("showHtml");
const cancelMarkdown = document.getElementById("cancelMarkdown");

convertBtn.addEventListener("click", handleConversion);
function handleConversion() {
  if (input.value.trim() === "") {
    input.classList.add("error");

    setTimeout(() => {
      input.classList.remove("error");
    }, 1500);
  }
  output.value = markdownToHTML(input.value);
}

cancelMarkdown.addEventListener("click", function () {
  input.value = "";
  output.value = "";
  cancelMarkdown.style.display = "none";
  input.style.height = "50px";
});

input.addEventListener("input", resizeHeight);
function resizeHeight() {
  const newHeight = Math.min(250, Math.max(50, this.scrollHeight));
  this.style.height = newHeight + "px";
  if (newHeight === 250) {
    this.style.overflowY = "auto";
  }
  this.classList.remove("error");
  cancelMarkdown.style.display = "block";
}
