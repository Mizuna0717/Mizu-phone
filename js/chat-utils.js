// ========== chat-utils.js ==========
// Time formatting & avatar helpers

function fmtChatTime(ts) {
  var d = new Date(ts);
  var months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];
  var h = d.getHours();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  var min = d.getMinutes().toString().padStart(2, '0');
  return months[d.getMonth()] + ' ' + d.getDate() + ' ' + h + ':' + min + ' ' + ampm;
}

function _defaultHeaderAvatar() {
  return '<svg viewBox="0 0 28 28" style="width:100%;height:100%;display:block">' +
    '<circle cx="14" cy="11" r="4.5" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<path d="M5 25c0-5 4-9 9-9s9 4 9 9" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '</svg>';
}

function _defaultGroupHeaderAvatar() {
  return '<svg viewBox="0 0 28 28" style="width:100%;height:100%;display:block">' +
    '<circle cx="10" cy="10" r="3.5" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<circle cx="18" cy="10" r="3.5" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<path d="M3 22c0-4 3-7 7-7s7 3 7 7" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '<path d="M14 22c0-4 2-7 5-7s5 3 5 7" stroke="#b0b0b0" stroke-width="1.5" fill="none"/>' +
    '</svg>';
}

function _defaultMsgAvatar() {
  return '<svg viewBox="0 0 32 32" style="width:100%;height:100%;display:block">' +
    '<circle cx="16" cy="12" r="5" stroke="#aaa" stroke-width="1.5" fill="none"/>' +
    '<path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#aaa" stroke-width="1.5" fill="none"/>' +
    '</svg>';
}

function _chatMsgAvatarHtml(src) {
  if (src) return '<img src="' + src + '">';
  return _defaultMsgAvatar();
}

function getUserAv(cid) {
  var m = getMaskForChar(cid);
  return m?.avatar || state.userProfile.avatar || null;
}
