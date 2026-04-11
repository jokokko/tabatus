'use strict';

(async () => {
    const settings = await browser.storage.sync.get(contracts.OptionDisableFuzzyMatching);

    const checkbox = document.getElementById(contracts.OptionDisableFuzzyMatching);
    if (checkbox) {
        checkbox.checked = !!(settings && settings[contracts.OptionDisableFuzzyMatching]);
        checkbox.addEventListener('change', () => {
            browser.storage.sync.set({ [contracts.OptionDisableFuzzyMatching]: checkbox.checked });
        });
    }

    const label = document.querySelector(`label[for="${contracts.OptionDisableFuzzyMatching}"]`);
    if (label) {
        label.textContent = browser.i18n.getMessage('option_disable_fuzzy_matching');
    }

    const heading = document.getElementById('category-general');
    if (heading) {
        heading.textContent = browser.i18n.getMessage('general');
    }
})();
