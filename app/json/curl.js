'use client'
import React, { useEffect, useState, useCallback } from "react";
import { Button, Form, Input, Radio } from 'antd';
import CopyToClipboard from '@/component/CopyToClipboard';

const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 14 } }
const buttonItemLayout = { wrapperCol: { span: 14, offset: 4 } }

const toQuery = (object) => {
    let urlParams = new URLSearchParams()
    for (var i in object) {
        urlParams.set(i, object[i])
    }
    return urlParams.toString()
}

const simpleCurl = (url, method, headers, object) => {
    if (method == 'GET') {
        url = url + '?' + toQuery(object)
        delete headers['Content-Type']
    }
    let curlShell = `curl --location --request ${method} ${url}`
    for (var i in headers) {
        curlShell += ` --header '${i}: ${headers[i]}'`
    }
    
    if (method == 'GET') {
        return curlShell
    }
   
    if (object != null) {
        let contentType = headers['Content-Type'] || ''
        if (contentType == 'application/x-www-form-urlencoded') {
            let queryString =  toQuery(object)
            let parts = queryString.split('&')
            for(var i in parts) {
                curlShell += ` --data-urlencode '${parts[i]}'`
            }
        } else {
            curlShell += ` --data '${JSON.stringify(object)}'`
        }
    }
    return curlShell
}

const App = (props) => {
    const [curlShell, setCulShell] = useState('')
    const [form] = Form.useForm();
    useEffect(() => {
        if (props.data != undefined && props.data != null) {
            onFormChange()
        }
    }, [])
    const onFormChange = () => {
        let url = form.getFieldValue('url') || 'http://test.com'
        if(props.data.length != undefined) {
            let list = []
            for(var i in props.data) {
                list.push(simpleCurl(url, form.getFieldValue('method'), {
                    'Content-Type': form.getFieldValue('content-type')
                }, props.data[i]))
            }
            setCulShell(list.join('\r\n'))
        } else {
            setCulShell(simpleCurl(url, form.getFieldValue('method'), {
                'Content-Type': form.getFieldValue('content-type')
            }, props.data))
        }
      
    };

    return <>
        <Form
            {...formItemLayout}
            layout={'horizontal'}
            form={form}
            initialValues={{ url: '', method: 'GET', 'content-type':'application/json'}}
            onValuesChange={onFormChange}
        >
            <Form.Item label={<strong>URL</strong>} name="url">
                <Input placeholder="input url" />
            </Form.Item>
            <Form.Item label={<strong>Method</strong>} name="method">
                <Radio.Group >
                    <Radio.Button value="GET">GET</Radio.Button>
                    <Radio.Button value="POST">POST</Radio.Button>
                    <Radio.Button value="PUT">PUT</Radio.Button>
                    <Radio.Button value="DELETE">DELETE</Radio.Button>
                </Radio.Group>
            </Form.Item>
            <Form.Item label={<strong>Content-Type</strong>} name="content-type">
                <Radio.Group >
                    <Radio.Button value="application/json">application/json</Radio.Button>
                    <Radio.Button value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</Radio.Button>
                </Radio.Group>
            </Form.Item>
        </Form>
        <CopyToClipboard text={curlShell}>复制</CopyToClipboard>
        <Input.TextArea value={curlShell} style={{marginTop:'5px'}} rows={12}></Input.TextArea>
    </>
}

export default App