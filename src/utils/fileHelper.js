export function readJSONFile(file, callback){
    var rawFile = new XMLHttpRequest()
    rawFile.overrideMimeType("application/json")
    rawFile.open("GET", file, true)
    rawFile.onreadystatechange = function () {
      if(rawFile.readyState === 4) {
        if(rawFile.status === 200 || rawFile.status == 0) {
          if (callback) {
            callback(JSON.parse(rawFile.responseText))
          }
        } else {
          callback({})
        }
      } else {
        callback({})
      }
    }
    rawFile.send(null)
}

export function readMarkDownFile(file, callback){
  var rawFile = new XMLHttpRequest()
  rawFile.overrideMimeType("text/markdown")
  rawFile.open("GET", file, true)
  rawFile.onreadystatechange = function () {
    if(rawFile.readyState === 4) {
      if(rawFile.status === 200 || rawFile.status == 0) {
        if (callback) {
          callback(rawFile.responseText)
        }
      } else {
        callback({})
      }
    } else {
      callback({})
    }
  }
  rawFile.send(null)
}
