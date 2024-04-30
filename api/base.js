import axios from 'axios'
import Cookies from 'js-cookie'
import {getCurrentEnv, mergeObject} from '../util/common'

const apiHost = function (path) {
	if (path.indexOf('http://') === 0) {
		return path
	}
	if (path.indexOf('SHEPHERD') == 0) {
		path = path.replace('SHEPHERD', "/api_shepherd")
	} else {
		path = "/api" + path
	}
	
    if(getCurrentEnv() == 'develop') {
        return "http://localhost:9393" + path
    }
    return path
}

const mergeBaseHeader = (header) => {
    return mergeObject({
        'admin-token' :  Cookies.get('admin-token'),
        'test-admin-token' :  Cookies.get('test-admin-token')
    }, header)
}

function getAxiosConfig(method, fullUrl, data, header) {
	let allHeader = mergeBaseHeader(header)

	let config = {
		url: fullUrl,
		method: method,
		params: null,
		data: null,
		withCredentials: false,
		headers: allHeader,
	}
	if (method.toLocaleUpperCase() == "POST" ||  method.toLocaleUpperCase() == "PUT" ||  method.toLocaleUpperCase() == "DELETE") {
		config.data = data
	}
	if (method.toLocaleUpperCase() == "GET" ) {
		config.params = data
	}
	return config
}

export const req = async (method, url, params, header) => {
	try {
		if (header == null || header == undefined) {
			header = {}
		}
		url = apiHost(url)
		let axiosConfig = getAxiosConfig(method, url, params, header)
		let res = await axios(axiosConfig)
		if (res.data.code == -100 ) {
			window.location.href = res.data.data.login_url
			return null
		}
		return res.data
	} catch (e) {
		return {
			data: null
		}
	}
}

export const getWithH = async (url, params, header) => {
	return req("GET", url, params, header)
};

export const postWithH = async (url, params, header) => {
	return req("POST", url, params, header)
};

export const get = async (url, params) => {
	return req("GET", url, params)
};
export const post = async (url, params) => {
	return req("POST", url, params)
};

export const del = async (url, params) => {
	return req("DELETE", url, params)
};

export const put = async (url, params) => {
	return req("PUT", url, params)
};


export const getApiHost = () => {
	if(getCurrentEnv() == 'develop') {
		return "http://localhost:9200"
	}
	return "/api"
}
export const getAllHeader = mergeBaseHeader 