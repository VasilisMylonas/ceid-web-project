// await delay(1000) for 1s delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function saveToFile(content, name, type) {
  var file = new Blob([content], { type: type });

  // Create dummy link and click immediately to trigger download
  var a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();

  // Free memory
  a.remove();
  URL.revokeObjectURL(link.href);
}
