export default class ExtractPDFHighlightsPluginSettings {
    public includePageNumber: boolean;
    public includeHighlightColor: boolean;
    public createLinks: boolean;

    constructor() {
        this.includePageNumber = false;
        this.includeHighlightColor = false;
        this.createLinks = false;
    }
}