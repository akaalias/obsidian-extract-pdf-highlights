import { Plugin } from 'obsidian';

import ExtractPDFHighlightsPluginSettings from "./ExtractPDFHighlightsPluginSettings";
import ExtractPDFHighlightsPluginSettingsTab from "./ExtractPDFHighlightsPluginSettingsTab";
import PDFAnnotationsManager from "./PDFAnnotationsManager";

export default class ExtractPDFHighlightsPlugin extends Plugin {

	public settings: ExtractPDFHighlightsPluginSettings;

	async onload() {
		this.loadSettings();
		this.addSettingTab(new ExtractPDFHighlightsPluginSettingsTab(this.app, this));
        this.addRibbonIcon('pdf-file', 'PDF Highlights', () => {
			this.processPDFHighlights();
		});
	}

	onunload() {}

	async processPDFHighlights() {
		let file = this.app.workspace.getActiveFile();

		if (file === null) return;
		if (file.extension !== 'pdf') return;

		let arrayBuffer = await this.app.vault.readBinary(file);
		let pdfAnnotationsManager = new PDFAnnotationsManager();

		let rawAnnotationsFromPDF = await pdfAnnotationsManager.fetchRawAnnotationsFromPDF(arrayBuffer);
		let filteredAnnotations = pdfAnnotationsManager.filterRawAnnotations(rawAnnotationsFromPDF);
		let groupedAnnotationsByPageMap = pdfAnnotationsManager.groupAnnotationsByPage(filteredAnnotations);
		let sortedAnnotationsByPositionGroupedByPage = pdfAnnotationsManager.sortAnnotationsByPosition(groupedAnnotationsByPageMap);
		let flattenedAnnotationsByPosition = pdfAnnotationsManager.flattenAnnotationsByPosition(sortedAnnotationsByPositionGroupedByPage);

		const finalMarkdown = this.generateFinalMarkdown(flattenedAnnotationsByPosition, file.name);

		let filePath = file.name.replace(".pdf", ".md");
		filePath = "Highlights for " + filePath;

		await this.saveHighlightsToFile(filePath, finalMarkdown);
		await this.app.workspace.openLinkText(filePath, '', true);
	}

	private generateFinalMarkdown(annotations, fileName) {

		let mdString = "";
		for(let anno of annotations) {
			let str = "- " + anno.highlightedText;

			if(this.settings.includePageNumber) {
				str = str + " (Page " + anno.pageNumber + ")";
			}

			str += "\n";

			mdString += str;
		}

		mdString += `\n## Source\n[[${fileName}]]`;

		return mdString;
	}


	async saveHighlightsToFile(filePath: string, mdString: string) {
		const fileExists = await this.app.vault.adapter.exists(filePath);
		if (fileExists) {
			await this.appendHighlightsToFile(filePath, mdString);
		} else {
			await this.app.vault.create(filePath, mdString);
		}
	}

	async appendHighlightsToFile(filePath: string, note: string) {
		let existingContent = await this.app.vault.adapter.read(filePath);
		if(existingContent.length > 0) {
			existingContent = existingContent + '\r\r';
		}
		await this.app.vault.adapter.write(filePath, existingContent + note);
	}


	loadSettings() {
		this.settings = new ExtractPDFHighlightsPluginSettings();
		(async () => {
			const loadedSettings = await this.loadData();
			if (loadedSettings) {
				this.settings.includePageNumber = loadedSettings.includePageNumber;
			} else {
				this.saveData(this.settings);
			}
		})();
	}
}
