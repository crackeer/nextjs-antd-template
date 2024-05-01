'use client'
import React from 'react';
import { Button, Input, Row, Col, Space, Modal } from 'antd';
import JSONEditor from '@/component/JSONEditor';
import CopyToClipboard from '@/component/CopyToClipboard';
import jsonToGo from "@/util/json-to-go";
import * as XLSX from 'xlsx';
class Convert extends React.Component {
    jsonObject = null
    constructor(props) {
        super(props); // 用于父子组件传值
        this.state = {
            json: {},
            convertTitle: '',
            visible: false,
            convert: '',
        }
    }
    componentDidMount = async () => {
        await this.setState({
            json: this.getLocalJSONValue()
        })
        setTimeout(() => {
            this.jsonObject.set(this.state.json)
        }, 800)
    }
    getLocalJSONValue = () => {
        try {
            let value = localStorage.getItem('json-local-value') || ''
            return JSON.parse(value)
        } catch (e) {
            return {}
        }
    }
    setLocalJSONValue = (value) => {
        let raws = JSON.stringify(value)
        localStorage.setItem('json-local-value', raws)
    }
    toGoStruct = () => {
        let result = jsonToGo(JSON.stringify(this.jsonObject.get()), null, null, false);
        this.setState({
            convert: result.go,
            convertTitle: "Go结构体",
            visible: true,
        });
    };
    toString = () => {
        this.setState({
            convert: JSON.stringify(JSON.stringify(this.jsonObject.get())),
            convertTitle: "序列化结果",
            visible: true,
        });
    };
    clearJSON = () => {
        this.jsonObject.set({});
    };
    importFromExcel = async () => {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [
                {
                    description: "文件类型",
                    accept: { "text/*": ['.xlsx', '.xls'] }
                }
            ]
        });
        if (!fileHandle) {
            return
        }
        const file = await fileHandle.getFile();
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellHTML: false });
                let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
                this.jsonObject.set(this.intoObjectList(jsonData))
            };
            reader.readAsArrayBuffer(file);
        }
    }
    importFromFile = async () => {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [
                {
                    description: "文件类型",
                    accept: { "text/*": ['.json'] }
                }
            ]
        });
        if (!fileHandle) {
            return
        }
        const file = await fileHandle.getFile();
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                var str = new TextDecoder('utf-8').decode(data);
                
                try {
                    let jsonData = JSON.parse(str)
                    this.jsonObject.set(jsonData)
                } catch (e) {

                }
            };
            reader.readAsArrayBuffer(file);
        }
    }
    intoObjectList = (list) => {
        let retData = []
        for (var i in list) {
            if (i > 0) {
                let tmp = {}
                for (var j in list[0]) {
                    tmp[list[0][j]] = list[i][j]
                }
                retData.push(tmp)
            }
        }
        return retData
    }
    render() {
        return <div>
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <Space>
                    <Button onClick={this.clearJSON} type="primary"> 清空输入</Button>
                    <Button onClick={this.importFromExcel} type="primary">Excel导入</Button>
                    <Button onClick={this.importFromFile} type="primary">文件导入</Button>
                </Space>
            </div>
            <JSONEditor height={'calc(100vh - 150px)'} ref={(e) => {
                this.jsonObject = e
            }} onValidate={(val) => this.setLocalJSONValue(val)} />
            <div style={{ textAlign: "center", marginTop: "15px" }}>
                <Space>
                    <Button
                        onClick={this.toGoStruct}
                        type="primary"
                    >
                        转Go结构体
                    </Button>
                    <Button
                        onClick={this.toGoStruct}
                        type="primary"
                    >
                        转Insret SQL
                    </Button>
                    <Button
                        onClick={this.toGoStruct}
                        type="primary"
                    >
                        转CURL请求
                    </Button>
                    <Button
                        onClick={this.toGoStruct}
                        type="primary"
                    >
                        转CSV
                    </Button>
                    <Button
                        onClick={this.toString}
                        type="primary"
                    >
                        序列化
                    </Button>
                </Space>
            </div>
            <Modal
                title={this.state.convertTitle}
                alignCenter={false}
                open={this.state.visible}
                footer={null}
                width={'60%'}
                autoFocus={false}
                focusLock={true}
                onCancel={() => {
                    this.setState({ visible: false });
                }}
            >
                <CopyToClipboard text={this.state.convert}>复制</CopyToClipboard>
                <pre>{this.state.convert}</pre>
            </Modal>
        </div>
    }
}

export default Convert;