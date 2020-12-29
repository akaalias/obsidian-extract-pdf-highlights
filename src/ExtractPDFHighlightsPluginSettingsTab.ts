import {App, PluginSettingTab, Setting} from "obsidian";
import ExtractPDFHighlightsPlugin from "./main";

export default class ExtractPDFHighlightsPluginSettingsTab extends PluginSettingTab {
    plugin: ExtractPDFHighlightsPlugin;

    constructor(app: App, plugin: ExtractPDFHighlightsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let {containerEl} = this;

        containerEl.empty();

        containerEl.createEl('h2', {text: 'Extract PDF Highlights.'});

        new Setting(containerEl)
            .setName('Include page number')
            .setDesc(
                'If enabled, adds a `(Page X)` to each highlight.',
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.includePageNumber).onChange((value) => {
                    this.plugin.settings.includePageNumber = value;
                    this.plugin.saveData(this.plugin.settings);
                }),
            );

        new Setting(containerEl)
            .setName('Include highlighter color')
            .setDesc(
                'If enabled, adds a color tag to each highlight based on the highlighter color used in the PDF',
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.includeHighlightColor).onChange((value) => {
                    this.plugin.settings.includeHighlightColor = value;
                    this.plugin.saveData(this.plugin.settings);
                }),
            );

        new Setting(containerEl)
            .setName('Create links')
            .setDesc(
                'If enabled, turns each list item into a markdown link',
            )
            .addToggle((toggle) =>
                toggle.setValue(this.plugin.settings.createLinks).onChange((value) => {
                    this.plugin.settings.createLinks = value;
                    this.plugin.saveData(this.plugin.settings);
                }),
            );
    }
}
