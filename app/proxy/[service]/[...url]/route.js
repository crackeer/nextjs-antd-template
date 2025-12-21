
import axios from 'axios'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function handleRequest(request, params) {
    let slug = await params.params;
    let envKey = 'service_' + slug.service.toUpperCase();
    if (!process.env[envKey]) {
        return Response.json({
            code: -90,
            message: 'service not found'
        });
    }
    let fullUrl = process.env[envKey] + '/' + slug.url.join('/');
    let header = {}
    header['Content-Type'] = request.headers.get('Content-Type')
    request.headers.forEach((value, key) => {
        if (key.indexOf("X-Proxy-") == 0) {
            header[key.trim().replace("X-Proxy-", "")] = value
        }
    })
    let config = {
        url: fullUrl,
        method: request.method,
        params: null,
        data: null,
        withCredentials: false,
        headers: header,
    }

    if (request.method.toLocaleUpperCase() == "GET") {
        config.params = request.nextUrl.searchParams
    }

    if (request.method.toLocaleUpperCase() == "POST") {
        if (request.headers.get('Content-Type') == 'application/x-www-form-urlencoded') {
            config.data = await request.formData()
        } else if (request.headers.get('Content-Type') == 'application/json') {
            config.data = await request.json()
        }
    }

    let result = await axios(config)
    if (result.data.code == -100) {
        redirect(result.data.data.login_url)
    }

    return Response.json(result.data)
}

export async function GET(request, params) {
    return handleRequest(request, params);
}

export async function POST(request, params) {
    return handleRequest(request, params);
}
