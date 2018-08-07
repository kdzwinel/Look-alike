/* global _ */
/**
 * @constructor
 */
function ShotStorage() {// eslint-disable-line
  let _shots = [];
  const _maxLength = 10;

  // load data immediately
  chrome.storage.local.get('shots', (data) => {
    _shots = (data && data.shots) ? data.shots : [];
  });

  const save = _.throttle(() => {
    chrome.storage.local.set({ shots: _shots });
  }, 500);

  const generateId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0,// eslint-disable-line
      v = c === 'x' ? r : (r & 0x3 | 0x8);// eslint-disable-line
    return v.toString(16);
  });

  this.add = (obj) => {
    obj.id = generateId();// eslint-disable-line
    obj.date = Date.now();// eslint-disable-line

    _shots.unshift(obj);
    _shots.length = _maxLength;

    save();
  };

  this.getAll = () => _shots
    .filter(shot => shot !== null)
    .map(shot => ({
      id: shot.id,
      url: shot.url,
      thumbnail: shot.thumbnail,
      date: shot.date,
    }));

  this.getById = id => _shots.find(shot => shot.id === id);
}
