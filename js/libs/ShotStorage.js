"use strict";

/**
 * @constructor
 */
function ShotStorage() {
  var _shots = [];
  var _maxLength = 30;

  //load data immediately
  chrome.storage.local.get('shots', data => {
    _shots = (data && data.shots) ? data.shots : [];
  });

  var save = _.throttle(() => {
    //chrome.storage.local.set({shots: _shots});
  }, 500);

  var generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

  this.add = (obj) => {
    obj.id = generateId();
    obj.date = Date.now();

    _shots.unshift(obj);
    _shots.length = _maxLength;

    save();
  };

  this.getAll = () => {
    return _shots
      .filter(shot => shot !== null)
      .map(shot => {
        //do not expose full image
        return {
          id: shot.id,
          url: shot.url,
          thumbnail: shot.thumbnail,
          date: shot.date
        };
      });
  };

  this.getById = (id) => {
    return _shots.find(shot => shot.id === id);
  };
}
