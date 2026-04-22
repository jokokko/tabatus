'use strict';

const browser = globalThis.browser ?? globalThis.chrome;

const contracts = {
    Port: 'PortTabatus',
    CollectTabs: 'CollectTabs',
    CollectTabsCompleted: 'CollectTabsCompleted',
    ActivateTab: 'ActivateTab',
    ActivateTabCompleted: 'ActivateTabCompleted',
    ActivateTabFailed: 'ActivateTabFailed',
    NavigateTab: 'NavigateTab',
    NavigateTabCompleted: 'NavigateTabCompleted',
    OptionDisableFuzzyMatching: 'optionDisableFuzzyMatching',
};

const pseudoTabs = [{
    id: '[Open empty tab]',
    title: '[Open empty tab]',
    url: 'about:blank',
    pseudoTab: true,
}];

const pseudoTabActions = {
    '[Open empty tab]': async () => { browser.tabs.create({ url: 'about:blank' }); },
};

async function collectTabs() {
    const items = await browser.tabs.query({});
    return items.map(item => ({ id: item.id, title: item.title, url: item.url })).concat(pseudoTabs);
}

async function activateTab(tabToActivate) {
    const pseudoAction = pseudoTabActions[tabToActivate.id];
    if (pseudoAction) {
        await pseudoAction();
        return true;
    }
    try {
        await browser.tabs.update(tabToActivate.id, { active: true });
        return true;
    } catch {
        return false;
    }
}

browser.runtime.onConnect.addListener((port) => {
    if (port.name !== contracts.Port) return;

    port.onMessage.addListener(async (m) => {
        if (m.command === contracts.CollectTabs) {
            const tabs = await collectTabs();
            port.postMessage({ event: contracts.CollectTabsCompleted, payload: tabs });
        } else if (m.command === contracts.ActivateTab) {
            const success = await activateTab(m.payload);
            port.postMessage({ event: success ? contracts.ActivateTabCompleted : contracts.ActivateTabFailed });
        } else if (m.command === contracts.NavigateTab) {
            const { tabId, url, newTab } = m.payload;
            try {
                if (newTab) {
                    await browser.tabs.create({ active: true, url });
                } else {
                    await browser.tabs.update(tabId, { active: true, url });
                }
            } catch { /* tab may have been closed */ }
            port.postMessage({ event: contracts.NavigateTabCompleted });
        }
    });
});
