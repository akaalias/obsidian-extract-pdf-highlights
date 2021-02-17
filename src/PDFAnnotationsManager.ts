import * as extracthighlights from "node_modules/extracthighlights-dist/build/extracthighlights";
import * as extracthighlightsWorker from "node_modules/extracthighlights-dist/build/extracthighlights.worker.entry";

var finalHighlightsAnnotations = new Array();

export default class PDFAnnotationsManager {

    async fetchRawAnnotationsFromPDF(arrayBuffer) {

        extracthighlights.GlobalWorkerOptions.workerSrcHighlights = extracthighlightsWorker;

        finalHighlightsAnnotations = new Array();

        var SUPPORTED_ANNOTS = ['Text', 'Highlight', 'Underline'];

        var loadingTask = extracthighlights.getDocument(arrayBuffer);

        return await loadingTask.promise
            .then(function (doc) {
                var numPages = doc.numPages;

                var lastPromise; // will be used to chain promises
                lastPromise = doc.getMetadata().then(function (data) {
                });

                var loadPage = function (pageNum) {
                    return doc.getPage(pageNum).then(async function (page) {
                        var scale = 1;
                        var viewport = page.getViewport(scale);
                        // @ts-ignore
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

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
                            anno.pageNumber = pageNum;
                            finalHighlightsAnnotations.push(anno);
                        });

                        canvas = null;
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
    }

    public flattenAnnotationsByPosition(sortedAnnotationsByPositionGroupedByPage: {}) {
        let flattenedAnnotationsByPosition = new Array();

        for (let key in sortedAnnotationsByPositionGroupedByPage) {
            for(var i = 0; i < sortedAnnotationsByPositionGroupedByPage[key].length; i++) {
                flattenedAnnotationsByPosition.push(sortedAnnotationsByPositionGroupedByPage[key][i]);
            }
        }

        return flattenedAnnotationsByPosition;
    }

    public sortAnnotationsByPosition(groupedAnnotationsByPageMap) {

        var newMap = {};

        for (let key in groupedAnnotationsByPageMap) {
            newMap[key] =  groupedAnnotationsByPageMap[key].sort(function (left, right) {
                if(left.quadPoints[0].dims.minY < right.quadPoints[0].dims.minY) {
                    return -1;
                }

                if(left.quadPoints[0].dims.minY > right.quadPoints[0].dims.minY) {
                    return 1;
                }

                return 0;
            });
        }

        return newMap;
    }

    public groupAnnotationsByPage(filteredAnnotations) {

        var groupBy = function(xs, key) {
            return xs.reduce(function(rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };

        return groupBy(filteredAnnotations, 'pageNumber');
    }

    public filterRawAnnotations(rawAnnotationsFromPDF) {
        var filteredAnnotations = rawAnnotationsFromPDF.filter(function (anno) {
            if (typeof anno.highlightedText == 'undefined' || anno.highlightedText == "") {
                return false;
            } else {
                return true;
            }
        });
        return filteredAnnotations;
    }

}