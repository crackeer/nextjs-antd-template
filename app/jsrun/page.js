'use client'
import React from "react"
import Script from 'next/script'
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { Table, Input, Button } from 'antd';
import { PlaySquareOutlined } from '@ant-design/icons';

const codeTmpl = `for(var i = 1;i< 10000;i++) {
    console.log(i)
}`
export default function () {
    const [code, setCode] = React.useState(codeTmpl)
    const [output, setOutput] = React.useState([])
    const [running, setRunning] = React.useState(false)

    const runJsCode = () => {
        setOutput([])
        setRunning(true)
        //alert(code)
        let kernal = new window.BlogCells.JavaScriptKernel();
        let runOutput = []
        kernal.run(code, (val, err) => {
            runOutput.push(val.line)
        })
        setTimeout(() => {
            setOutput(runOutput)
            setRunning(false)
        }, 3000)
    }
    const changeCode = (value) => {
        setCode(value)
    }
    return <>
        <Script src={'/blog-cells.min.js'} />
       
        <CodeMirror
            value={code} height="400px" extensions={[javascript({ jsx: true })]}
            onChange={changeCode}
            theme={dracula}
        />
        <div style={{ margin: '10px 0' }}>
            <Button onClick={runJsCode} icon={<PlaySquareOutlined />} loading={running}>run code</Button>
        </div>
        <Input.TextArea value={output.join("\r\n")} rows={8} placeholder="js output"></Input.TextArea>
    </>
}
