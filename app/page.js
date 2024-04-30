'use client'
import React from 'react';
import { Card, Link, Row, Input, Radio, Col} from 'antd';
import menu from './menu'
class Home extends React.Component {
    form = null
    constructor(props) {
        super(props); // 用于父子组件传值
        this.state = {
          
        }
    }


    render() {
        return (
            <Row gutter={10}>
                {menu.map(item => {
                    return <Col span={6} style={{marginBottom:'10px'}}>
                        <Card key={item.page}>
                            <a href={item.page}>{item.title}</a>
                        </Card>
                    </Col>
                })}
            </Row>
        )
    }
}

export default Home;
