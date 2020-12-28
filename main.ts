import { Plugin } from 'obsidian';

import pdfjsCustom from 'node_modules/pdfjs-dist/build/pdf';
import worker from 'node_modules/pdfjs-dist/build/pdf.worker.entry';

var finalHighlightsAnnotations = new Array();

export default class ExtractPDFHighlightsPlugin extends Plugin {

	async onload() {
		console.log('loading plugin');

		this.addRibbonIcon('pdf-file', 'PDF Highlights', () => {
			this.fetchAllTheThings();
		});
	}

	onunload() {
		console.log('unloading plugin');
	}

	async fetchAllTheThings() {
		let file = this.app.workspace.getActiveFile();

		if (file === null) return;
		if (file.extension !== 'pdf') return;

		let arrayBuffer = await this.app.vault.readBinary(file);

		pdfjsCustom.GlobalWorkerOptions.workerSrc = worker;

		var SUPPORTED_ANNOTS = ['Text', 'Highlight', 'Underline'];

		var loadingTask = pdfjsCustom.getDocument(arrayBuffer);

		var finalAnnotations = await loadingTask.promise
			.then(function (doc) {
				var numPages = doc.numPages;

				var lastPromise; // will be used to chain promises
				lastPromise = doc.getMetadata().then(function (data) {
				});

				var loadPage = function (pageNum) {
					return doc.getPage(pageNum).then(async function (page) {

						var scale = 1;
						var viewport = page.getViewport(scale);
						// Prepare canvas using PDF page dimensions
						// @ts-ignore
						var canvas = document.createElement('canvas');
						var context = canvas.getContext('2d');
						canvas.height = viewport.height;
						canvas.width = viewport.width;
						// Render PDF page into canvas context
						var renderContext = {
							canvasContext: context,
							viewport: viewport
						};

						var annotations = await page.getAnnotations();

						annotations = annotations
							.map(function (anno) {
								if (anno.subtype === undefined) anno.subtype = anno.type;
								return anno;
							})
							.filter(function (anno) {
								return SUPPORTED_ANNOTS.indexOf(anno.subtype) >= 0;
							});

						await page.render(renderContext, annotations);

						annotations.map(function (anno) {
							finalHighlightsAnnotations.push(anno);
						});

						return page
					});
				};

				// Loading of the first page will wait on metadata and subsequent loadings
				// will wait on the previous pages.
				for (var i = 1; i <= numPages; i++) {
					lastPromise = lastPromise.then(loadPage.bind(null, i));
				}
				return lastPromise;
			})
			.then(
				function () {
					return finalHighlightsAnnotations;
				},
				function (err) {
					console.error("Error: " + err);
				}
			);

		var resultMD = finalAnnotations.filter(function (anno) {
			if(typeof anno.highlightedText == 'undefined' || anno.highlightedText == "") {
				return false;
			} else {
				return true;
			}})
			.map(function(anno) { return "- " + anno.highlightedText; })
			.join("\n");

		var filePath = file.name.replace(".pdf", ".md");
		filePath = "Highlights for " + filePath;

		await this.saveHighlightsToFile(filePath, resultMD);
		await this.app.workspace.openLinkText(filePath, '', true);
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
}
