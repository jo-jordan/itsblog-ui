export function readMarkDownFile(file, callback){
  var rawFile = new XMLHttpRequest()
  rawFile.overrideMimeType("text/markdown")
  rawFile.open("GET", file, true)
  rawFile.onreadystatechange = function () {
    // Only the DONE state carries the final result; earlier states would
    // otherwise invoke the callback before the file has finished loading.
    if (rawFile.readyState !== 4 || !callback) {
      return
    }
    if (rawFile.status === 200 || rawFile.status === 0) {
      callback(rawFile.responseText)
    } else {
      callback('')
    }
  }
  rawFile.send(null)
}
