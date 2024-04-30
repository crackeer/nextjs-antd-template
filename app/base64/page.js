'use client'
import React, { useState } from 'react';
import { Button, Input, Row, Col, Radio, message } from 'antd';
import { Base64 } from 'js-base64';
import CopyToClipboard from '@/component/CopyToClipboard';
const App = (props) => {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [action, setAction] = useState('decode')

    const handleInputChange = (e) => {
        setInput(e.target.value)
        handle(e.target.value, action)
    }
    const handleActionChange = (e) => {
        setAction(e.target.value)
        handle(input, e.target.value)
    }
    const handle = (inputValue, actionValue) => {
        if (actionValue == "decode") {
            setOutput(Base64.decode(inputValue))
        }
        if (actionValue == "encode") {
            setOutput(Base64.encode(inputValue))
        }
    }
    return (
        <div>
            <Input.TextArea rows={5} onChange={handleInputChange} value={input}></Input.TextArea>
            <Radio.Group onChange={handleActionChange} value={action} style={{ margin: '10px 0' }}>
                <Radio value={'decode'}>解密</Radio>
                <Radio value={'encode'}>加密</Radio>
            </Radio.Group>
            <Input.TextArea rows={5} value={output} style={{ marginBottom: '5px' }}></Input.TextArea>
            <CopyToClipboard text={output} />
        </div>

    );
}

export default App;