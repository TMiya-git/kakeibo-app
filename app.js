"use strict";

const testButton = document.getElementById("test-button");
const message = document.getElementById("message");

testButton.addEventListener("click", () => {
  message.textContent = "JavaScriptは正常に動作しています。";
});