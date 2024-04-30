'use client'
import React, { Component } from 'react';

import 'jsoneditor/dist/jsoneditor.css';
//import dynamic from 'next/dynamic'
//const JSONEditor = dynamic(import('jsoneditor'))
export default class JSONEditorX extends Component {
    jsoneditor = null;
    container = null;

    constructor(props) {
        super(props); // 用于父子组件传值
    }
    async componentDidMount() {
        const options = {
            mode: 'code',
            indentation : 4,
            onValidate: this.props.onValidate,
            templates: this.props.templates,
            schema: this.props.schema,
            onValidationError: this.props.onValidationError,
        };
        const JSONEditor = await require('jsoneditor')
       
        if(this.jsoneditor == null) {
            this.jsoneditor = new JSONEditor(this.container, options);
            this.jsoneditor.set(this.props.json);
        }
    }
    componentWillUnmount() {
        if (this.jsoneditor) {
            this.jsoneditor.destroy();
        }
    }
    set = (json) => {
        if (this.jsoneditor) {
            this.jsoneditor.update(json);
        }
    }
    get = () => {
        return this.jsoneditor.get();
    }
    render() {
        return (
            <div style={{ height: this.props.height }} ref={elem => this.container = elem} />
        );
    }
}
