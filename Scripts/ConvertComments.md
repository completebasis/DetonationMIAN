<%*
const folder = ""; // Replace with your folder or "" for whole vault
const files = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(folder));

for (let file of files) {
  const content = await app.vault.read(file);
  const newContent = content.replace(/<!--([\s\S]*?)-->/g, '<!--$1-->');
  if (content !== newContent) {
    await app.vault.modify(file, newContent);
    console.log(`Updated: ${file.path}`);
  }
}
%>