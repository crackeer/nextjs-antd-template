import Cookies from 'js-cookie'


function getQuery(key, value) {
    let url = new URLSearchParams(window.location.search)
    return url.get(key) || value
}

function batchGetQuery(object) {
    let url = new URLSearchParams(window.location.search)
    let data = {}
    Object.keys(object).forEach(tmpKey => {
        data[tmpKey] = url.get(tmpKey) || object[tmpKey]
    })
    return data
}

function buildQuery(query) {
    let params = new URLSearchParams("")
    Object.keys(query).forEach(k => {
        params.append(k, query[k])
    })
    return params.toString()
}

function addQuery(query) {
    let params = new URLSearchParams("")
    let keys = Object.keys(query)
    for (var i in keys) {
        params.append(keys[i], query[keys[i]])
    }
    let newURL = window.location.pathname + "?" + params.toString()
    window.history.replaceState(null, "", newURL)
}

function containsChinese(str) {
    // 匹配中文字符的正则表达式  
    var reg = /[\u4e00-\u9fa5]/gm;
    return reg.test(str);
}

function extractChineseFields(data, prefix) {
    let retData = {}
    if (typeof data == 'object' && data.length == undefined) {
        Object.keys(data).forEach(key => {
            let tmpKey = prefix.length > 0 ? prefix + '.' + key : key
            if (typeof data[key] == 'string' && containsChinese(data[key])) {
                retData[tmpKey] = data[key]
            } else if (typeof data[key] == 'object') {
                let tmpData = extractChineseFields(data[key], tmpKey)
                Object.keys(tmpData).forEach(kk => {
                    retData[kk] = tmpData[kk]
                })
            }
        })
    }
    if (typeof data == 'object' && data.length != undefined) {
        for (var i in data) {
            let tmpKey = prefix.length > 0 ? prefix + '.' + i : key
            if (typeof data[i] == 'string' && containsChinese(data[i])) {
                retData[tmpKey] = data[i]
            } else if (typeof data[i] == 'object') {
                let tmpData = extractChineseFields(data[i], tmpKey)
                Object.keys(tmpData).forEach(kk => {
                    retData[kk] = tmpData[kk]
                })
            }
        }
    }
    return retData
}

function saveTextToLocal(name, data) {
    var urlObject = window.URL || window.webkitURL || window;
    var export_blob = new Blob([data]);
    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    save_link.click();
}

function jumpTo(path, query) {
    if (query == null) {
        window.location.href = getRealPath(path)
        return
    }
    let params = new URLSearchParams("")
    let keys = Object.keys(query)
    for (var i in keys) {
        params.append(keys[i], query[keys[i]])
    }
    let newURL = getRealPath(path) + "?" + params.toString()
    window.location.href = newURL
}

export {
    batchGetQuery, getQuery, buildQuery, addQuery, extractChineseFields, saveTextToLocal, jumpTo
}