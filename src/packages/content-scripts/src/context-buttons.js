if (!browser) { // eslint-disable-line no-use-before-define
    var browser = require('webextension-polyfill'); // eslint-disable-line no-var, no-inner-declarations
}

const contextButtonWidth = 24;

/**
 * This is the main script to display context icons when a user highlights text on any supported Mozilla website.
 */

function getSelectedText() {
    if (window.getSelection) {
        return window.getSelection().toString();
    } else if (document.selection && document.selection.type != 'Control') {
        return document.selection.createRange().text;
    } else {
        return '';
    }
}

function createButton(imageSrc) {
    const button = document.createElement('img');
    button.src = browser.runtime.getURL(imageSrc);
    button.style.all = 'unset';
    button.style.width = `${contextButtonWidth}px`;
    button.style.position = 'absolute';
    button.style.zIndex = 9999;
    button.style.backgroundColor = 'white';
    return button;
}

function clickListener(messageType, buttonsToRemove) {
    return (e) => {
        e.stopPropagation();
        const selectedText = getSelectedText();
        browser.runtime.sendMessage({
            type: messageType,
            text: selectedText,
        });
        buttonsToRemove.forEach((button) => document.body.removeChild(button));
    };
}

const pontoonSearchButton = createButton('packages/commons/static/img/pontoon-logo.svg');
const bugzillaReportButton = createButton('packages/commons/static/img/bug.svg');
const allContextButtons = [pontoonSearchButton, bugzillaReportButton];

pontoonSearchButton.addEventListener('click', clickListener('pontoon-search-context-button-clicked', allContextButtons));
bugzillaReportButton.addEventListener('click', clickListener('bugzilla-report-context-button-clicked', allContextButtons));

document.addEventListener('mouseup', (e) => {
    const selectedText = getSelectedText();
    if (selectedText.length > 0) {
        pontoonSearchButton.title = `Search for "${selectedText.trim()}" in Pontoon (all projects)`;
        bugzillaReportButton.title = `Report l10n bug for "${selectedText.trim()}"`;

        const yCoord = window.scrollY + e.screenY - 120;
        let xCoord = e.screenX + 6;
        allContextButtons.forEach((button) => {
            button.style.top = yCoord + 'px';
            button.style.left = xCoord + 'px';
            xCoord += (contextButtonWidth + 6);
        });
        allContextButtons.forEach((button) => document.body.appendChild(button));
    } else {
        allContextButtons.forEach((button) => document.body.removeChild(button));
    }
});
