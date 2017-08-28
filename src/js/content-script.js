'use-strict';

chrome.runtime.sendMessage({
    type: 'pontoon-page-loaded',
    value: document.documentElement.innerHTML
});

var unreadNotificationsIcon = document.querySelectorAll('#notifications.unread .button .icon')[0];

function unreadNotificationsIconClick() {
    unreadNotificationsIcon.removeEventListener('click', unreadNotificationsIconClick);
    chrome.runtime.sendMessage({type: 'mark-all-notifications-as-read-from-page'});
}

if (unreadNotificationsIcon != undefined) {
    unreadNotificationsIcon.addEventListener('click', unreadNotificationsIconClick);

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.type == 'mark-all-notifications-as-read-from-extension') {
            unreadNotificationsIcon.style.color = '#4D5967';
        }
    });
}