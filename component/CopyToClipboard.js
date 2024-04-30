'use client'
import React, { useState } from 'react';
import { Button, Input, Row, Col, Radio, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
const App = (props) => {
    return <CopyToClipboard text={props.text}
        onCopy={() => {
            message.success('复制成功')
        }}>
        <Button size="small">{props.children || '复制'}</Button>
    </CopyToClipboard>
}

export default App;