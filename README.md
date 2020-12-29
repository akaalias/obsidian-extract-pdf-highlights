## Extract your PDF text-highlights into Obsidian

This plugin allows you to **extract highlighted and underlined text from your PDFs** into a markdown file in your Obsidian vault.

### How it works

After you've installed and activated the plugin:

1. Drop your highlighted PDF into your Obsidian vault
2. Open the PDF in Obsidian
3. Click the "PDF" icon in the left sidebar

### Demo with default settings
![Simple](https://github.com/akaalias/obsidian-extract-pdf-highlights/blob/main/simple.gif?raw=true)

### Demo with all optional settings turned on
![Settings](https://github.com/akaalias/obsidian-extract-pdf-highlights/blob/main/settings.gif?raw=true)

### Optional settings

- Include page number (Default: off)
- Include highlight color (Default: off)
- Create links (Default: off)

## Backlog

The list of features and improvements for this plugin.

### ICEBOX
- [ ] Group highlights by highlight color (Optional)

### TODO
- [ ] Refactor pdfjs import to not overload Obsidian worker
- [ ] Fix missing space after newline (Very complex)

### DOING

### DONE
- [x] Show highlight color (Optional)
- [x] Auto-link list items (Optional)
- [x] Refactor/extract PDF from main.ts 
- [x] Add Page-number to each highlight (Optional)
- [x] Sort highlights by position in document and page (Mandatory)
- [x] Extract unsorted list of HIGHLIGHT annotations
- [x] Extract unsorted list of TEXT annotations
- [x] Extract unsorted list of UNDERLINE annotations
- [x] Decide if to integrate with existing Highlights Plugin

