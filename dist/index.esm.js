/*!
 * puppeteer-extra-plugin-adblocker v2.13.6 by remusao
 * https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-adblocker
 * @license MIT
 */
import { promises } from 'fs';
import os from 'os';
import path from 'path';
import { PuppeteerBlocker } from '@ghostery/adblocker-puppeteer';
import fetch from 'cross-fetch';
import { PuppeteerExtraPlugin } from 'puppeteer-extra-plugin';

const PKG_NAME = 'puppeteer-extra-plugin-adblocker';
const PKG_VERSION = '2.13.6';
const engineCacheFilename = `${PKG_NAME}-${PKG_VERSION}-engine.bin`;
/**
 * A puppeteer-extra plugin to automatically block ads and trackers.
 */
class PuppeteerExtraPluginAdblocker extends PuppeteerExtraPlugin {
    blocker;
    constructor(opts) {
        super(opts);
        this.debug('Initialized', this.opts);
    }
    get name() {
        return 'adblocker';
    }
    get defaults() {
        return {
            blockTrackers: false,
            blockTrackersAndAnnoyances: false,
            useCache: true,
            cacheDir: undefined,
            interceptResolutionPriority: undefined
        };
    }
    get engineCacheFile() {
        const cacheDir = this.opts.cacheDir || os.tmpdir();
        return path.join(cacheDir, engineCacheFilename);
    }
    /**
     * Cache an instance of `PuppeteerBlocker` to disk if 'cacheDir' option was
     * specified for the plugin. It can then be used the next time this plugin is
     * used to load the adblocker faster.
     */
    async persistToCache(blocker) {
        if (!this.opts.useCache) {
            return;
        }
        this.debug('persist to cache', this.engineCacheFile);
        await promises.writeFile(this.engineCacheFile, blocker.serialize());
    }
    /**
     * Initialize instance of `PuppeteerBlocker` from cache if possible.
     * Otherwise, it throws and we will try to initialize it from remote instead.
     */
    async loadFromCache() {
        if (!this.opts.useCache) {
            throw new Error('caching disabled');
        }
        this.debug('load from cache', this.engineCacheFile);
        return PuppeteerBlocker.deserialize(new Uint8Array(await promises.readFile(this.engineCacheFile)));
    }
    /**
     * Initialize instance of `PuppeteerBlocker` from remote (either by fetching
     * a serialized version of the engine when available, or by downloading raw
     * lists for filters such as EasyList then parsing them to initialize
     * blocker).
     */
    async loadFromRemote() {
        this.debug('load from remote', {
            blockTrackers: this.opts.blockTrackers,
            blockTrackersAndAnnoyances: this.opts.blockTrackersAndAnnoyances
        });
        if (this.opts.blockTrackersAndAnnoyances === true) {
            return PuppeteerBlocker.fromPrebuiltFull(fetch);
        }
        else if (this.opts.blockTrackers === true) {
            return PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
        }
        else {
            return PuppeteerBlocker.fromPrebuiltAdsOnly(fetch);
        }
    }
    /**
     * Return instance of `PuppeteerBlocker`. It will take care of initializing
     * it if necessary (first time it is called), or return the existing instance
     * if it already exists.
     */
    async getBlocker() {
        this.debug('getBlocker', { hasBlocker: !!this.blocker });
        if (this.blocker === undefined) {
            try {
                this.blocker = await this.loadFromCache();
                this.setRequestInterceptionPriority();
            }
            catch (ex) {
                this.blocker = await this.loadFromRemote();
                this.setRequestInterceptionPriority();
                await this.persistToCache(this.blocker);
            }
        }
        return this.blocker;
    }
    /**
     * Sets the request interception priority on the `PuppeteerBlocker` instance.
     */
    setRequestInterceptionPriority() {
        this.blocker?.setRequestInterceptionPriority(this.opts.interceptResolutionPriority);
    }
    /**
     * Hook into this blocking event to make sure the cache is initialized before navigation.
     */
    async beforeLaunch() {
        this.debug('beforeLaunch');
        await this.getBlocker();
    }
    /**
     * Hook into this blocking event to make sure the cache is initialized before navigation.
     */
    async beforeConnect() {
        this.debug('beforeConnect');
        await this.getBlocker();
    }
    /**
     * Enable adblocking in `page`.
     */
    async onPageCreated(page) {
        this.debug('onPageCreated');
        (await this.getBlocker()).enableBlockingInPage(page);
    }
}
// Export the factory function as both default and named export
const createAdblocker = (options = {}) => {
    return new PuppeteerExtraPluginAdblocker(options);
};

export { PuppeteerExtraPluginAdblocker, createAdblocker, createAdblocker as default };
//# sourceMappingURL=index.esm.js.map
