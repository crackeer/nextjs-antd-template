'use client'
import React, { useState } from 'react';
import { Button, Input, Row, Col, Radio, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
const App = (props) => {
    const [messageApi, contextHolder] = message.useMessage();
    return (
        <div>
            {contextHolder}
            <CopyToClipboard text={props.text}
                onCopy={() => {
                    messageApi.success('复制成功')
                }}>
                <Button size="small">{props.children || '复制'}</Button>
            </CopyToClipboard>
        </div>
    )
}

export default App;