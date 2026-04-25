'use strict';

(async () => {
    const fuseOptions = {
        shouldSort: true,
        tokenize: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['title', 'url'],
    };

    let port = null;
    let allTabs = [];
    let filteredTabs = [];
    let activeIndex = -1;

    const input = document.getElementById('searchinput');
    const list = document.getElementById('tablist');
    const crumbContainer = document.getElementById('crumb-container');

    try {
        port = browser.runtime.connect({ name: contracts.Port });
        port.onMessage.addListener(handleMessage);
    } catch (e) {
        console.error('Port connection failed:', e);
    }

    port.postMessage({ command: contracts.CollectTabs });
    input.focus();

    async function filterTabs(query) {
        if (!query) return allTabs;

        const settings = await browser.storage.sync.get(contracts.OptionDisableFuzzyMatching);
        if (settings && settings[contracts.OptionDisableFuzzyMatching]) {
            const q = query.toLowerCase();
            return allTabs.filter(t =>
                t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q)
            );
        }

        return new Fuse(allTabs, fuseOptions).search(query);
    }

    function updateCrumbs() {
        const tab = activeIndex >= 0 ? filteredTabs[activeIndex] : null;
        if (tab) {
            breadcrumbs.render(crumbContainer, tab, navigateViaUrl);
        } else {
            crumbContainer.innerHTML = '';
        }
    }

    function navigateViaUrl(tab, url, newTab) {
        port?.postMessage({ command: contracts.NavigateTab, payload: { tabId: tab.id, url, newTab } });
    }

    function renderList(tabs) {
        list.innerHTML = '';
        filteredTabs = tabs;
        activeIndex = tabs.length > 0 ? 0 : -1;

        tabs.forEach((tab, i) => {
            const li = document.createElement('li');
            if (i === 0) li.classList.add('active');

            if (tab.favIconUrl) {
                const favicon = document.createElement('img');
                favicon.className = 'tab-favicon';
                favicon.src = tab.favIconUrl;
                favicon.addEventListener('error', () => { favicon.style.display = 'none'; });
                li.appendChild(favicon);
            }

            const text = document.createElement('div');
            text.className = 'tab-text';

            const title = document.createElement('span');
            title.className = 'tab-title';
            title.textContent = tab.title;

            const url = document.createElement('span');
            url.className = 'tab-url';
            url.textContent = tab.url;

            text.appendChild(title);
            text.appendChild(url);
            li.appendChild(text);
            li.addEventListener('click', () => activateTab(tab));
            list.appendChild(li);
        });

        updateCrumbs();
    }

    function setActive(index) {
        const items = list.querySelectorAll('li');
        if (activeIndex >= 0 && activeIndex < items.length) {
            items[activeIndex].classList.remove('active');
        }
        activeIndex = index;
        if (activeIndex >= 0 && activeIndex < items.length) {
            items[activeIndex].classList.add('active');
            items[activeIndex].scrollIntoView({ block: 'nearest' });
        }
        updateCrumbs();
    }

    function activateTab(tab) {
        port?.postMessage({ command: contracts.ActivateTab, payload: tab });
    }

    function handleMessage(e) {
        if (e.event === contracts.CollectTabsCompleted) {
            allTabs = e.payload;
            renderList(allTabs);
        } else if (e.event === contracts.ActivateTabCompleted || e.event === contracts.NavigateTabCompleted) {
            window.close();
        }
    }

    input.addEventListener('input', async (e) => {
        renderList(await filterTabs(e.target.value));
    });

    input.addEventListener('keydown', (e) => {
        const items = list.querySelectorAll('li');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(Math.min(activeIndex + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(Math.max(activeIndex - 1, 0));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && filteredTabs[activeIndex]) {
                activateTab(filteredTabs[activeIndex]);
            }
        }
    });
})();
