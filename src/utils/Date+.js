Date.prototype.getWeekOfMonth = function(exact) {
  var month = this.getMonth()
      , year = this.getFullYear()
      , firstWeekday = new Date(year, month, 1).getDay()
      , lastDateOfMonth = new Date(year, month + 1, 0).getDate()
      , offsetDate = this.getDate() + firstWeekday - 1
      , index = 1 // start index at 0 or 1, your choice
      , weeksInMonth = index + Math.ceil((lastDateOfMonth + firstWeekday - 7) / 7)
      , week = index + Math.floor(offsetDate / 7)
  ;
  if (exact || week < 2 + index) return week;
  return week === weeksInMonth ? index + 5 : week;
};
