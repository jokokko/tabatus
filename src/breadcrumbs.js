'use strict';

const breadcrumbs = (() => {
    const TYPE_SUBDOMAIN = 'sub';
    const TYPE_HOST      = 'host';
    const TYPE_PATH      = 'path';
    const TYPE_SEARCH    = 'search';
    const TYPE_HASH      = 'hash';

    function parseUri(url) {
        const uri = new URL(url);
        const protocol = `${uri.protocol}//`;
        let host = { type: TYPE_HOST, part: uri.origin, display: uri.hostname };

        const parsedHost = tldts.parse(uri.hostname, { extractHostname: false });
        let subdomains = [];
        if (parsedHost.subdomain && !parsedHost.isIp) {
            const parts = parsedHost.subdomain.split('.');
            subdomains = parts.map((t, i, a) => ({
                type: TYPE_SUBDOMAIN,
                part: `${protocol}${[t, ...a.slice(i + 1)].join('.')}.${parsedHost.domain}`,
                display: `${t}.`,
            }));
            host = { type: TYPE_HOST, part: `${protocol}${parsedHost.domain}`, display: parsedHost.domain };
        }

        const rawPath = uri.pathname.match(/(.+?\/|.+)/g)?.filter(x => x.length > 1) ?? [];
        const pathParts = rawPath.reduce((acc, item) => {
            acc.items.push({ type: TYPE_PATH, part: acc.uri += item, display: item });
            return acc;
        }, { items: [], uri: uri.origin }).items;

        const rawSearch = uri.search.split(/(?=&)/g).filter(t => t.length > 1);
        const searchParts = rawSearch.reduce((acc, item) => {
            acc.items.push({ type: TYPE_SEARCH, part: acc.uri += item, display: item });
            return acc;
        }, { items: [], uri: `${uri.origin}${uri.pathname}` }).items;

        const hash = uri.hash
            ? [{ type: TYPE_HASH, part: `${uri.origin}${uri.pathname}${uri.search}${uri.hash}`, display: uri.hash }]
            : [];

        return [...subdomains, host, ...pathParts, ...searchParts, ...hash];
    }

    const SKIP = new Set(['/', '#', '&']);

    function crumbClass(type) {
        switch (type) {
            case TYPE_SUBDOMAIN: return 'crumb crumb-sub';
            case TYPE_HOST:      return 'crumb crumb-host';
            case TYPE_PATH:      return 'crumb crumb-path';
            case TYPE_SEARCH:    return 'crumb crumb-search';
            default:             return 'crumb crumb-hash';
        }
    }

    function render(container, tab, onNavigate) {
        container.innerHTML = '';
        let parts;
        try {
            parts = parseUri(tab.url);
        } catch {
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'crumbs';

        for (const p of parts) {
            if (!p.display || SKIP.has(p.display)) continue;
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.className = crumbClass(p.type);
            span.textContent = p.display;
            span.title = p.part;
            span.addEventListener('click', () => onNavigate(tab, p.part, false));
            span.addEventListener('mousedown', (e) => {
                if (e.button === 1) { e.preventDefault(); onNavigate(tab, p.part, true); }
            });
            li.appendChild(span);
            ul.appendChild(li);
        }

        if (ul.children.length > 0) container.appendChild(ul);
    }

    return { render };
})();
