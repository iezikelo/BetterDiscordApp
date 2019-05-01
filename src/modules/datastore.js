const Config = require("../data/config.json");
const fs = require("fs");
const path = require("path");
const releaseChannel = DiscordNative.globals.releaseChannel;

export default class DataStore {
    constructor() {
        this.data = {settings: {stable: {}, canary: {}, ptb: {}}};
        this.pluginData = {};
    }

    initialize() {
        if (!fs.existsSync(this.BDFile)) fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
        const data = require(this.BDFile);
        if (data.hasOwnProperty("settings")) this.data = data;
        if (!fs.existsSync(this.settingsFile)) return;
        let settings = require(this.settingsFile);
        fs.unlinkSync(this.settingsFile);
        if (settings.hasOwnProperty("settings")) settings = Object.assign({stable: {}, canary: {}, ptb: {}}, {[releaseChannel]: settings});
        else settings = Object.assign({stable: {}, canary: {}, ptb: {}}, settings);
        this.setBDData("settings", settings);
    }

    get BDFile() {return this._BDFile || (this._BDFile = path.resolve(Config.dataPath, "bdstorage.json"));}
    get settingsFile() {return this._settingsFile || (this._settingsFile = path.resolve(Config.dataPath, "bdsettings.json"));}
    getPluginFile(pluginName) {return path.resolve(Config.dataPath, "plugins", pluginName + ".config.json");}

    getSettingGroup(key) {
        return this.data.settings[releaseChannel][key] || null;
    }

    setSettingGroup(key, data) {
        this.data.settings[releaseChannel][key] = data;
        fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
    }

    getBDData(key) {
        return this.data[key] || "";
    }

    setBDData(key, value) {
        this.data[key] = value;
        fs.writeFileSync(this.BDFile, JSON.stringify(this.data, null, 4));
    }

    getPluginData(pluginName, key) {
        if (this.pluginData[pluginName] !== undefined) return this.pluginData[pluginName][key] || undefined;
        if (!fs.existsSync(this.getPluginFile(pluginName))) return undefined;
        this.pluginData[pluginName] = JSON.parse(fs.readFileSync(this.getPluginFile(pluginName)));
        return this.pluginData[pluginName][key] || undefined;
    }

    setPluginData(pluginName, key, value) {
        if (value === undefined) return;
        if (this.pluginData[pluginName] === undefined) this.pluginData[pluginName] = {};
        this.pluginData[pluginName][key] = value;
        fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4));
    }

    deletePluginData(pluginName, key) {
        if (this.pluginData[pluginName] === undefined) this.pluginData[pluginName] = {};
        delete this.pluginData[pluginName][key];
        fs.writeFileSync(this.getPluginFile(pluginName), JSON.stringify(this.pluginData[pluginName], null, 4));
    }
}