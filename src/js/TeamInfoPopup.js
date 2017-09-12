function TeamInfoPopup(options, remotePontoon) {
    this._options = options;
    this._remotePontoon = remotePontoon;

    this._init();
}

TeamInfoPopup.prototype = {
    _init: function() {
        this._watchStorageChanges();
        this._loadTeamDataFromStorage();
    },

    _watchStorageChanges: function() {
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (changes['teamData'] !== undefined) {
                this._loadTeamDataFromStorage(changes['teamData'].newValue);
            }
        }.bind(this));
    },

    _displayTeamInfo: function(teamData) {
        var optionKey = 'options.hide_team_info_in_popup';
        this._options.get([optionKey], function(item) {
            if(!item[optionKey] && teamData) {
                document.querySelector('#team-info h1 .name').textContent = teamData.teamName;
                document.querySelector('#team-info h1 .code').textContent = this._remotePontoon.getTeamCode();
                var infoList = document.querySelector('#team-info ul');
                while (infoList.lastChild) {
                    infoList.removeChild(infoList.lastChild);
                }
                for (const iKey of Object.keys(teamData.strings)) {
                    var dataItem = teamData.strings[iKey];
                    var listItem = document.createElement('li');
                    listItem.classList.add(dataItem.status);
                    var title = document.createElement('span');
                    title.classList.add('title');
                    title.textContent = dataItem.title;
                    listItem.appendChild(title);
                    var count = document.createElement('span');
                    count.classList.add('count');
                    count.textContent = dataItem.count;
                    listItem.appendChild(count);
                    infoList.appendChild(listItem);
                }
            } else {
            }
        }.bind(this));
    },

    _loadTeamDataFromStorage: function() {
        var dataKey = 'teamData';
        chrome.storage.local.get(dataKey, function(item) {
            this._displayTeamInfo(item[dataKey]);
        }.bind(this));
    },
}