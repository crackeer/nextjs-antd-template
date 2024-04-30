'use client'
import React from 'react';
import { Card, Button, Row, Input, Radio, Col, Modal, Form, message, Space, QRCode } from 'antd';
import Link from 'antd'

class Home extends React.Component {
    constructor(props) {
        super(props); // 用于父子组件传值
        this.state = {
            qrcode: 'http://realsee.com',
        }
    }

    render() {
        return (
            <>
                <Card style={{ marginBottom: '20px' }}>
                    <Input.TextArea
                        placeholder="-"
                        value={this.state.qrcode}
                        onChange={(e) => this.setState({ qrcode: e.target.value })}
                    ></Input.TextArea>
                    <QRCode value={this.state.qrcode || '-'} size={250} style={{margin:'10px auto'}}/>
                </Card>
            </>
        )
    }
}

export default Home;
