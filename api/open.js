import { get, post, getWithH, postWithH, put, del } from './base'

const windowHost = function() {
    return window.location.host
}

export default {
    deleteStrategy: (mainKey, key) => {
        return post('/admin/delete/strategy', {
            name: mainKey,
            key: key
        })
    },
    updateStrategyValue: (mainKey, key, value) => {
        return post('/admin/update/strategy', {
            name: mainKey,
            key: key,
            value: value
        })
    }
}
