'use client'

import React, { useState, useEffect } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@/styles/globals.css'
import { Layout, Menu } from 'antd';
import menu from './menu'
const { Sider } = Layout;
const { SubMenu } = Menu;

const RootLayout = ({ children }) => {
    const [selectedKeys, setSelectedKeys] = useState([])
    const [name, setName] = useState('')
    useEffect(() => {
        for (var i in menu) {
            console.log(menu[i].page, window.location.pathname)
            if (menu[i].page == window.location.pathname) {
                document.title = menu[i].title
            }
        }
        setSelectedKeys(window.location.pathname)
    }, [])
    const clickMenu = (value) => {
        window.location.href = value.key
    }

    return <html lang="en">
        <body>
            <AntdRegistry>
                <Layout >
                    <Sider
                        style={{
                            overflow: 'auto',
                            height: '100vh',
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            bottom: 0,
                        }}
                        collapsed={false}
                    >
                        <Menu selectedKeys={selectedKeys} mode="inline" theme="dark" onClick={clickMenu} items={menu}>
                        </Menu>
                    </Sider>
                    <Layout style={{ marginLeft: '200px', padding: '10px' }}>
                        {children}
                    </Layout>
                    <div id="json-id"></div>
                </Layout>
            </AntdRegistry>
        </body>
    </html>
}

export default RootLayout;
