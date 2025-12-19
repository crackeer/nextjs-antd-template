'use client'
import React from 'react';
import { Button, Input, Row, Col, Space, Modal } from 'antd';
import JSONEditor from '@/component/JSONEditor';
import CopyToClipboard from '@/component/CopyToClipboard';
import jsonToGo from "@/util/json-to-go";
import * as XLSX from 'xlsx';
import Curl from './curl'
import dayjs from 'dayjs';
import Table from '@/component/Table';
const intoObjectList = (list) => {
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
const getLocalJSONValue = () => {
    try {
        let value = localStorage.getItem('json-local-value') || ''
        return JSON.parse(value)
    } catch (e) {
        return {}
    }
}
const setLocalJSONValue = (value) => {
    let raws = JSON.stringify(value)
    localStorage.setItem('json-local-value', raws)
}

const toSQL = (object) => {
    let keys = Object.keys(object)
    let fields = []
    let values = []
    for(var i in keys) {
        fields.push('`' + keys[i] + '`')
        if (typeof object[keys[i]] === 'number') {
            values.push(object[keys[i]])
        } else {
            values.push("'" + object[keys[i]] + "'")
        }
    }

    return 'INSERT INTO TABLE_NAME (' + fields.join(',') + ') values (' + values.join(',') + ');'
}

class App extends React.Component {
    jsonObject = null
    constructor(props) {
        super(props); // 用于父子组件传值
        this.state = {
            json: {},
            convertTitle: '',
            visible: false,
            convert: '',
            curlData : null,
            curlVisible: false,
            curlKey : '',
            csvData: [],
            csvColumns: [],
            csvVisible: false
        }
    }
    initJSONEditor = (e) => {
        this.jsonObject = e
        setTimeout(() => {
            this.jsonObject.set(getLocalJSONValue())
        }, 0)

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
                this.jsonObject.set(intoObjectList(jsonData))
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
    convertSQL = () => {
        let data = this.jsonObject.get()
        let sql = []
        if(data.length != undefined) {
            for(var i in data) {
                sql.push(toSQL(data[i]))
            }
        } else {
            sql.push(toSQL(data))
        }
        this.setState({
            convert: sql.join("\r\n"),
            convertTitle: "Insert SQL",
            visible: true,
        });
    }
    convertCurl = () => {
        this.setState({
            curlData: this.jsonObject.get(),
            curlVisible: true,
            curlKey: dayjs().unix()
        })
    }

    toCSV = () => {
        let data = this.jsonObject.get()
        let jsonData = Array.isArray(data) ? data : [data]
        
        // 提取所有可能的列名
        let allKeys = new Set()
        jsonData.forEach(item => {
            Object.keys(item).forEach(key => allKeys.add(key))
        })
        let columns = Array.from(allKeys)
        
        // 为每个数据项添加key属性
        let tableData = jsonData.map((item, index) => {
            let row = { key: index }
            columns.forEach(col => {
                row[col] = item[col] !== undefined ? item[col] : ''
            })
            return row
        })
        
        this.setState({
            csvData: tableData,
            csvColumns: columns,
            csvVisible: true
        })
    }
    
    exportCSV = () => {
        let data = this.state.csvData
        let columns = this.state.csvColumns
        
        // 创建工作簿和工作表
        let wb = XLSX.utils.book_new()
        let ws = XLSX.utils.json_to_sheet([])
        
        // 设置列名
        XLSX.utils.sheet_add_aoa(ws, [columns], { origin: 'A1' })
        
        // 添加数据行
        let rows = data.map(item => {
            return columns.map(col => item[col])
        })
        XLSX.utils.sheet_add_aoa(ws, rows, { origin: 'A2' })
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
        
        // 导出为CSV文件
        XLSX.writeFile(wb, 'data.csv', { bookType: 'csv', type: 'file' })
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
            <JSONEditor height={'calc(100vh - 150px)'} ref={this.initJSONEditor} onValidate={(val) => setLocalJSONValue(val)} />
            <div style={{ textAlign: "center", marginTop: "15px" }}>
                <Space>
                    <Button onClick={this.toGoStruct} type="primary">转Go结构体</Button>
                    <Button onClick={this.convertSQL} type="primary">转Insret SQL</Button>
                    <Button onClick={this.convertCurl} type="primary">转CURL请求</Button>
                    <Button onClick={this.toCSV} type="primary">转CSV</Button>
                    <Button onClick={this.toString} type="primary">序列化</Button>
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
                <Input.TextArea value={this.state.convert} autoSize={{ minRows: 5, maxRows: 20 }}  style={{ marginTop: '10px' }}/>
            </Modal>
            <Modal
                title="Curl请求"
                alignCenter={false}
                open={this.state.curlVisible}
                footer={null}
                width={'60%'}
                autoFocus={false}
                focusLock={true}
                onCancel={() => {
                    this.setState({ curlVisible: false });
                }}
            >
                <Curl data={this.state.curlData} key={this.state.curlKey}/>
            </Modal>
            
            <Modal
                title="CSV数据"
                alignCenter={false}
                open={this.state.csvVisible}
                footer={null}
                width={'80%'}
                autoFocus={false}
                focusLock={true}
                onCancel={() => {
                    this.setState({ csvVisible: false });
                }}
            >
                <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                    <Button type="primary" onClick={this.exportCSV}>导出CSV</Button>
                </div>
                <Table columnKeys={this.state.csvColumns} dataSource={this.state.csvData} scroll={{ x: true }} />
            </Modal>
        </div>
    }
}

export default App;