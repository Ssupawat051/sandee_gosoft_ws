const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');

const { Server } = require('socket.io');
const io = new Server(server);

const fs = require('fs')

app.use(express.static('D:/Screen_Face/bot_eyes/faceSandee'));

app.get('/', function (_req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/styles.css', function (_req, res) {
    res.type('text/css');
    res.sendFile(__dirname + '/styles.css');
});

app.get('/script.js', function (_req, res) {
    res.sendFile(__dirname + '/script.js');
});

io.on('connection', async (socket) => {
    console.log('User connected')

    socket.on('audioData', async (left16) => {

        if (left16 && left16.length > 0) {
            try {
                const filePath = await createWav(left16);
                //console.log(`ไฟล์ WAV ถูกสร้างไว้ที่: ${filePath}`);
                console.log('Conversation with SANDEE!');
                await stt(filePath);

            } catch (error) {
                console.error('เกิดข้อผิดพลาด:', error);
            }
        } else {
            console.error('left16 ไม่มีข้อมูลเสียง');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected')
    });
});


async function stt(filePath) {

    const wavData = fs.readFileSync(filePath);
    const blob = new Blob([wavData], { type: 'audio/wav' });
    const form = new FormData();
    form.append('wav', blob, 'file.wav');

    try {

        const result = await fetch('http://boonchuai-eks-ingress-799182153.ap-southeast-1.elb.amazonaws.com/api/sttinfer/th', {
            method: "POST",
            body: form,
            headers: {
                'x-access-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImNwY2FsbGNlbnRlckBraW5wby5jb20udGgiLCJleHAiOjE5MzkxMjY2NTh9.MrZLIMnoWBNYc-eXQEIVLO7YC9hPW2e0WiIB2CrdhEM' // แทน YOUR_ACCESS_TOKEN ด้วยโทเคนของคุณ
            }
        });

        const data = await result.json();
        const text = data.prediction;
        console.log('USER:', data.prediction);
        nlp(text);

        // if (text) {
        //     console.log('USER:', data.prediction);

        //     // Map the control keywords to their respective values
        //     const controlMapping = {
        //         'หยุด': '000',
        //         'เดินหน้า': '001',
        //         'หันซ้าย': '010',
        //         'หันขวา': '011',
        //         'ถอยหลัง': '100',
        //         'ห้องประชุม': '101',
        //         'ห้องครัว': '110',
        //         'ห้องผู้บริหาร': '111'
        //     };

        //     // Initialize control value to null
        //     let controlValue = null;

        //     // Check if the text corresponds to a control keyword
        //     for (const keyword in controlMapping) {
        //         if (text.includes(keyword)) {
        //             controlValue = controlMapping[keyword];
        //             break; // Stop searching if a keyword is found
        //         }
        //     }

        //     // Create a JSON object with specific user information and control value
        //     const jsonContent = {
        //         Control: controlValue,
        //     };

        //     // Convert JSON object to string
        //     const jsonString = JSON.stringify(jsonContent, null, 2); // 2-space indentation

        //     // Write to a JSON file
        //     const jsonFilePath = 'control.json'; // Replace with your desired file path
        //     fs.writeFileSync(jsonFilePath, jsonString);

        //     return {
        //         messages: [{
        //             //user: users.cropUser(user),
        //             content: {
        //                 type: 'text',
        //                 message: data.prediction,
        //                 //date: userTime
        //             }
        //         }]
        //     }
        // }

        return null;
    } catch (e) {
        return Promise.reject(e);
    }
    finally {
        fs.unlink(filePath, err => {
            if (err) {
                console.error(`cannot remove file "${filePath}".`, err);
            }
            else {
                //console.log(`remove file "${filePath}" successfully.`);
            }
        });
    }
}


async function nlp(text) {
    let humantext = text;
    let bottext = '';

    if (humantext.includes("สวัสดี")) {
        bottext = 'สวัสดีค่ะ';
    } else if (humantext.includes("ชื่ออะไร")) {
        bottext = 'ฉันแสนดีค่ะ';
    } else if (humantext.includes("น่ารัก")) {
        bottext = 'ขอบคุณค่ะ';
    } else if (humantext.includes("ขอบคุณนะ")) {
        bottext = 'ยินดีค่ะ';
    } else if (humantext.includes("ห้องแรก") || humantext.includes("ห้องประชุม") ||
               humantext.includes("หน้าลิฟต์") || humantext.includes("หน้าถังดับเพลิง") ||
               humantext.includes("ห้องคัว")) {
        bottext = 'รับทราบค่ะ';
    }

    // Create JSON object based on conditions
    let jsonObject = {};

    if (humantext.includes("หน้าลิฟต์")) {
        jsonObject["หน้าลิฟต์"] = {
            "bottext": "รับทราบค่ะ",
            "goal.target_pose.pose.position.x": 6.190118789672852,
            "goal.target_pose.pose.position.y": 3.0056586265563965,
            "goal.target_pose.pose.position.z": 0,
            "goal.target_pose.pose.orientation.y": 0,
            "goal.target_pose.pose.orientation.z": 0.003793832825443487,
            "goal.target_pose.pose.orientation.w": 0.9999928033903507
        };
    } else if (humantext.includes("หน้าถังดับเพลิง")) {
        jsonObject["หน้าถังดับเพลิง"] = {
            "bottext": "รับทราบค่ะ",
            "goal.target_pose.pose.position.x": 5.9316487312316895,
            "goal.target_pose.pose.position.y": 6.420914173126221,
            "goal.target_pose.pose.position.z": 0,
            "goal.target_pose.pose.orientation.y": 0,
            "goal.target_pose.pose.orientation.z": -0.9997608668786094,
            "goal.target_pose.pose.orientation.w": 0.021867991634609417
        };
    } else if (humantext.includes("ห้องคัว")) {
        jsonObject["ห้องคัว"] = {
            "bottext": "รับทราบค่ะ",
            "goal.target_pose.pose.position.x": -6.472887992858887,
            "goal.target_pose.pose.position.y": 6.826329231262207,
            "goal.target_pose.pose.position.z": 0,
            "goal.target_pose.pose.orientation.y": 0,
            "goal.target_pose.pose.orientation.z": 0.9995304468053192,
            "goal.target_pose.pose.orientation.w": 0.030641245228597343
        };
    } else {
        jsonObject[humantext] = {
            "bottext": bottext,
            "goal.target_pose.pose.position.x": null,
            "goal.target_pose.pose.position.y": null,
            "goal.target_pose.pose.position.z": null,
            "goal.target_pose.pose.orientation.y": null,
            "goal.target_pose.pose.orientation.z": null,
            "goal.target_pose.pose.orientation.w": null
        };
    }

    // Convert JSON object to string
    const jsonString = JSON.stringify(jsonObject, null, 2); // 2-space indentation

    // Write to a JSON file
    const jsonFilePath = 'control.json'; // Replace with your desired file path
    fs.writeFileSync(jsonFilePath, jsonString);

    // Send bottext to client via socket.io
    io.emit('botText', bottext);
    console.log('Bot Answer:', bottext);

    // Return bottext
    return bottext;
}




    // async function nlp(text) {
    //     const form = new FormData()
    //     form.append("userId", "newsandee")
    //     form.append("language", "th")
    //     form.append("device", "A02")
    //     form.append("query", text)
    //     process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

    //     const result = await fetch(`https://sandeemonitor.voice-ai-cai-cpall.link/chatbot`, {
    //         method: "POST",
    //         body: form
    //     })
    //     const data = await result.json()

    //     if (data && data.Content && data.Content.Answer) {
    //         BotAnswer = data.Content.Answer;
    //         if (BotAnswer === 'detected') {
    //             BotAnswer = data.Content.Text
    //         } else {

    //         }
    //         io.emit('botText', BotAnswer);
    //         console.log('Bot Answer :', BotAnswer);
    //     } else {
    //         console.error('Error Type');
    //     }
    // }


    async function createWav(data) {
        var audioSize = data.byteLength;
        var sampleRateInHz = 8000;
        var bitDepth = 16;
        var channels = 1;
        var byteRate = (sampleRateInHz * bitDepth * channels) / 8;
        var totalDataLen = audioSize + 36;
        var header = new Int8Array(44);
        header[0] = 'R'.charCodeAt(0);  // RIFF/WAVE header
        header[1] = 'I'.charCodeAt(0);
        header[2] = 'F'.charCodeAt(0);
        header[3] = 'F'.charCodeAt(0);
        header[4] = (totalDataLen & 0xff);
        header[5] = ((totalDataLen >> 8) & 0xff);
        header[6] = ((totalDataLen >> 16) & 0xff);
        header[7] = ((totalDataLen >> 24) & 0xff);
        header[8] = 'W'.charCodeAt(0);
        header[9] = 'A'.charCodeAt(0);
        header[10] = 'V'.charCodeAt(0);
        header[11] = 'E'.charCodeAt(0);
        header[12] = 'f'.charCodeAt(0);  // 'fmt ' chunk
        header[13] = 'm'.charCodeAt(0);
        header[14] = 't'.charCodeAt(0);
        header[15] = ' '.charCodeAt(0);
        header[16] = 16;  // 4 bytes: size of 'fmt ' chunk
        header[17] = 0;
        header[18] = 0;
        header[19] = 0;
        header[20] = 1;  // format = 1
        header[21] = 0;
        header[22] = channels;
        header[23] = 0;
        header[24] = (sampleRateInHz & 0xff);
        header[25] = ((sampleRateInHz >> 8) & 0xff);
        header[26] = ((sampleRateInHz >> 16) & 0xff);
        header[27] = ((sampleRateInHz >> 24) & 0xff);
        header[28] = (byteRate & 0xff);
        header[29] = ((byteRate >> 8) & 0xff);
        header[30] = ((byteRate >> 16) & 0xff);
        header[31] = ((byteRate >> 24) & 0xff);
        header[32] = (2 * 16 / 8);  // block align
        header[33] = 0;
        header[34] = 16;  // bits per sample
        header[35] = 0;
        header[36] = 'd'.charCodeAt(0);
        header[37] = 'a'.charCodeAt(0);
        header[38] = 't'.charCodeAt(0);
        header[39] = 'a'.charCodeAt(0);
        header[40] = (audioSize & 0xff);
        header[41] = ((audioSize >> 8) & 0xff);
        header[42] = ((audioSize >> 16) & 0xff);
        header[43] = ((audioSize >> 24) & 0xff);

        var fileName = `tts_.wav`;
        var filePath = './tts_.wav'

        await fs.promises.writeFile(filePath, header);
        await fs.promises.appendFile(filePath, data);

        return filePath;
    }

    server.listen(5050, () => {
        console.log('listening on port 5050');
    });
