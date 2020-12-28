import { Plugin } from 'obsidian';

import pdfjsCustom from 'node_modules/pdfjs-dist/build/pdf';
import worker from 'node_modules/pdfjs-dist/build/pdf.worker.entry';

export default class MyPlugin extends Plugin {

	async onload() {
		console.log('loading plugin');

		this.addRibbonIcon('dice', 'Sample Plugin', () => {
			this.fetchAllTheThings();
		});
	}

	onunload() {
		console.log('unloading plugin');
	}

	fetchAllTheThings() {
		var SUPPORTED_ANNOTS = ['Text','Highlight','Underline'];

		let activeLeaf: any = this.app.workspace.activeLeaf ?? null
		if (typeof activeLeaf?.view.file == 'undefined') return;
		let pdfPath = activeLeaf?.view.file.path;
		if(!pdfPath.endsWith(".pdf")) return;
		const vaultPath = activeLeaf?.view.file.vault.adapter.basePath;
		const onlyPath = vaultPath + "/" + pdfPath;
		const theFullPath = "file://" + onlyPath;

		pdfjsCustom.GlobalWorkerOptions.workerSrc = worker;

		var loadingTask = pdfjsCustom.getDocument(theFullPath);
		loadingTask.promise
			.then(function (doc) {
				var numPages = doc.numPages;

				var lastPromise; // will be used to chain promises
				lastPromise = doc.getMetadata().then(function (data) {});

				var loadPage = function (pageNum) {
					return doc.getPage(pageNum).then(async function (page) {

						var scale = 1;
						var viewport = page.getViewport(scale);
						// Prepare canvas using PDF page dimensions
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

						console.log(annotations);

						var SUPPORTED_ANNOTS = ['Text','Highlight','Underline'];

						annotations = annotations
							.map(function(anno) {
								if (anno.subtype===undefined) anno.subtype=anno.type;
								return anno;
							})
							.filter(function(anno) {
								return SUPPORTED_ANNOTS.indexOf(anno.subtype) >= 0;
							});

						var render = page.render(renderContext, annotations);

						render.then(function() {
							annotations = annotations.map(function(anno) {
							});
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
					console.log("# End of Document");
				},
				function (err) {
					console.error("Error: " + err);
				}
			);
	}
}
