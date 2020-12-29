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
    }
}
