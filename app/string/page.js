'use client'
import React, { useState } from 'react';
import { Button, Input, Row, Col, Radio, Space, useMessage } from 'antd';
import { Base64 } from 'js-base64';
import CopyToClipboard from '@/component/CopyToClipboard';
const App = (props) => {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [messageApi, contextHolder] = message.useMessage();

    const handleInputChange = (e) => {
        setInput(e.target.value)
    }

    // 纯JavaScript实现的MD5计算函数
    const calculateMD5 = (text) => {
        // 简化的MD5实现（来源：https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0）
        const md5 = (string) => {
            const rotateLeft = (lValue, iShiftBits) => (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
            const addUnsigned = (lX, lY) => {
                const lX4 = lX & 0x40000000;
                const lY4 = lY & 0x40000000;
                const lX8 = lX & 0x80000000;
                const lY8 = lY & 0x80000000;
                const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
                if (lX4 | lY4) {
                    if (lResult & 0x40000000) return lResult ^ 0xC0000000 ^ lX8 ^ lY8;
                    else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
                } else return lResult ^ lX8 ^ lY8;
            };
            const F = (x, y, z) => (x & y) | ((~x) & z);
            const G = (x, y, z) => (x & z) | (y & (~z));
            const H = (x, y, z) => x ^ y ^ z;
            const I = (x, y, z) => y ^ (x | (~z));
            const FF = (a, b, c, d, x, s, ac) => {
                a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };
            const GG = (a, b, c, d, x, s, ac) => {
                a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };
            const HH = (a, b, c, d, x, s, ac) => {
                a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };
            const II = (a, b, c, d, x, s, ac) => {
                a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
                return addUnsigned(rotateLeft(a, s), b);
            };
            const convertToWordArray = (string) => {
                const lWordCount = ((string.length + 8) >>> 6) + 1;
                const lWordArray = new Array(lWordCount << 2);
                let lBytePosition = 0;
                let lByteCount = 0;
                while (lByteCount < string.length) {
                    lWordArray[lBytePosition >>> 2] |= string.charCodeAt(lByteCount) << (24 - (lBytePosition % 4) * 8);
                    lBytePosition++;
                    lByteCount++;
                }
                lWordArray[lBytePosition >>> 2] |= 0x80 << (24 - (lBytePosition % 4) * 8);
                lWordArray[(lWordCount << 2) - 2] = string.length << 3;
                return lWordArray;
            };
            const wordToHex = (lValue) => {
                let WordToHexValue = '';
                let WordToHexValueTemp = '';
                let lByte = 0;
                let lCount = 0;
                while (lCount < 4) {
                    lByte = (lValue >>> (24 - lCount * 8)) & 255;
                    WordToHexValueTemp = '0' + lByte.toString(16);
                    WordToHexValue += WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
                    lCount++;
                }
                return WordToHexValue;
            };
            const x = convertToWordArray(string);
            let a = 0x67452301;
            let b = 0xEFCDAB89;
            let c = 0x98BADCFE;
            let d = 0x10325476;
            let olda; let oldb; let oldc; let oldd;
            for (let i = 0; i < x.length; i += 16) {
                olda = a; oldb = b; oldc = c; oldd = d;
                a = FF(a, b, c, d, x[i], 7, 0xD76AA478);
                d = FF(d, a, b, c, x[i+1], 12, 0xE8C7B756);
                c = FF(c, d, a, b, x[i+2], 17, 0x242070DB);
                b = FF(b, c, d, a, x[i+3], 22, 0xC1BDCEEE);
                a = FF(a, b, c, d, x[i+4], 7, 0xF57C0FAF);
                d = FF(d, a, b, c, x[i+5], 12, 0x4787C62A);
                c = FF(c, d, a, b, x[i+6], 17, 0xA8304613);
                b = FF(b, c, d, a, x[i+7], 22, 0xFD469501);
                a = FF(a, b, c, d, x[i+8], 7, 0x698098D8);
                d = FF(d, a, b, c, x[i+9], 12, 0x8B44F7AF);
                c = FF(c, d, a, b, x[i+10], 17, 0xFFFF5BB1);
                b = FF(b, c, d, a, x[i+11], 22, 0x895CD7BE);
                a = FF(a, b, c, d, x[i+12], 7, 0x6B901122);
                d = FF(d, a, b, c, x[i+13], 12, 0xFD987193);
                c = FF(c, d, a, b, x[i+14], 17, 0xA679438E);
                b = FF(b, c, d, a, x[i+15], 22, 0x49B40821);
                a = GG(a, b, c, d, x[i+1], 5, 0xF61E2562);
                d = GG(d, a, b, c, x[i+6], 9, 0xC040B340);
                c = GG(c, d, a, b, x[i+11], 14, 0x265E5A51);
                b = GG(b, c, d, a, x[i], 20, 0xE9B6C7AA);
                a = GG(a, b, c, d, x[i+5], 5, 0xD62F105D);
                d = GG(d, a, b, c, x[i+10], 9, 0x02441453);
                c = GG(c, d, a, b, x[i+15], 14, 0xD8A1E681);
                b = GG(b, c, d, a, x[i+4], 20, 0xE7D3FBC8);
                a = GG(a, b, c, d, x[i+9], 5, 0x21E1CDE6);
                d = GG(d, a, b, c, x[i+14], 9, 0xC33707D6);
                c = GG(c, d, a, b, x[i+3], 14, 0xF4D50D87);
                b = GG(b, c, d, a, x[i+8], 20, 0x455A14ED);
                a = GG(a, b, c, d, x[i+13], 5, 0xA9E3E905);
                d = GG(d, a, b, c, x[i+2], 9, 0xFCEFA3F8);
                c = GG(c, d, a, b, x[i+7], 14, 0x676F02D9);
                b = GG(b, c, d, a, x[i+12], 20, 0x8D2A4C8A);
                a = HH(a, b, c, d, x[i+5], 4, 0xFFFA3942);
                d = HH(d, a, b, c, x[i+8], 11, 0x8771F681);
                c = HH(c, d, a, b, x[i+11], 16, 0x6D9D6122);
                b = HH(b, c, d, a, x[i+14], 23, 0xFDE5380C);
                a = HH(a, b, c, d, x[i+1], 4, 0xA4BEEA44);
                d = HH(d, a, b, c, x[i+4], 11, 0x4BDECFA9);
                c = HH(c, d, a, b, x[i+7], 16, 0xF6BB4B60);
                b = HH(b, c, d, a, x[i+10], 23, 0xBEBFBC70);
                a = HH(a, b, c, d, x[i+13], 4, 0x289B7EC6);
                d = HH(d, a, b, c, x[i], 11, 0xEAA127FA);
                c = HH(c, d, a, b, x[i+3], 16, 0xD4EF3085);
                b = HH(b, c, d, a, x[i+6], 23, 0x04881D05);
                a = HH(a, b, c, d, x[i+9], 4, 0xD9D4D039);
                d = HH(d, a, b, c, x[i+12], 11, 0xE6DB99E5);
                c = HH(c, d, a, b, x[i+15], 16, 0x1FA27CF8);
                b = HH(b, c, d, a, x[i+2], 23, 0xC4AC5665);
                a = II(a, b, c, d, x[i], 6, 0xF4292244);
                d = II(d, a, b, c, x[i+7], 10, 0x432AFF97);
                c = II(c, d, a, b, x[i+14], 15, 0xAB9423A7);
                b = II(b, c, d, a, x[i+5], 21, 0xFC93A039);
                a = II(a, b, c, d, x[i+12], 6, 0x655B59C3);
                d = II(d, a, b, c, x[i+3], 10, 0x8F0CCC92);
                c = II(c, d, a, b, x[i+10], 15, 0xFFEFF47D);
                b = II(b, c, d, a, x[i+1], 21, 0x85845DD1);
                a = II(a, b, c, d, x[i+8], 6, 0x6FA87E4F);
                d = II(d, a, b, c, x[i+15], 10, 0xFE2CE6E0);
                c = II(c, d, a, b, x[i+6], 15, 0xA3014314);
                b = II(b, c, d, a, x[i+13], 21, 0x4E0811A1);
                a = II(a, b, c, d, x[i+4], 6, 0xF7537E82);
                d = II(d, a, b, c, x[i+11], 10, 0xBD3AF235);
                c = II(c, d, a, b, x[i+2], 15, 0x2AD7D2BB);
                b = II(b, c, d, a, x[i+9], 21, 0xEB86D391);
                a = addUnsigned(a, olda);
                b = addUnsigned(b, oldb);
                c = addUnsigned(c, oldc);
                d = addUnsigned(d, oldd);
            }
            return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
        };
        
        return md5(text);
    };

    // 时间戳格式化函数
    const formatTimestamp = (timestamp) => {
        // 转换为数字
        let ts = Number(timestamp);
        
        // 检查时间戳长度，如果是10位，则是秒级时间戳，需要转换为毫秒级
        if (timestamp.length === 10) {
            ts *= 1000;
        }
        
        const date = new Date(ts);
        
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            throw new Error('无效的时间戳');
        }
        
        // 格式化日期时间
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const handle = (actionValue) => {
        try {
            if (actionValue == "base64_decode") {
                setOutput(Base64.decode(input));
            } else if (actionValue == "base64_encode") {
                setOutput(Base64.encode(input));
            } else if (actionValue == "md5") {
                const md5Hash = calculateMD5(input);
                setOutput(md5Hash);
            } else if (actionValue == "url_encode") {
                setOutput(encodeURIComponent(input));
            } else if (actionValue == "url_decode") {
                setOutput(decodeURIComponent(input));
            } else if (actionValue == "timestamp_format") {
                const formattedDate = formatTimestamp(input);
                setOutput(formattedDate);
            }
        } catch (error) {
            console.error('处理错误:', error);
            messageApi.error('处理失败: ' + error.message);
        }
    };
    return (
        <div>
            <Input.TextArea rows={5} onChange={handleInputChange} value={input}></Input.TextArea>
            <Space style={{margin:'10px '}}>
                <Button onClick={() => handle('base64_encode')}>base64加密</Button>
                <Button onClick={() => handle('base64_decode')}>base64解密</Button>
                <Button onClick={() => handle('md5')}>MD5计算</Button>
                <Button onClick={() => handle('url_encode')}>URL编码</Button>
                <Button onClick={() => handle('url_decode')}>URL解码</Button>
                <Button onClick={() => handle('timestamp_format')}>时间戳格式化</Button>
            </Space>
            <Input.TextArea rows={5} value={output} style={{ marginBottom: '5px' }}></Input.TextArea>
            <CopyToClipboard text={output} />
            {contextHolder}
        </div>

    );
}

export default App;