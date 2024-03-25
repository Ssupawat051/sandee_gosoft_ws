// app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const fs = require('fs')

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('C:/Users/porpo/Desktop/Final_Project/faceSandee'));

app.get('/', function (_req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/styles.css', function (_req, res) {
    res.sendFile(__dirname + '/styles.css');
});

app.get('/script.js', function (_req, res) {
    res.sendFile(__dirname + '/script.js');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('speech', async (humantext) => {
        console.log('Received transcript:', humantext);
        await nlp(humantext);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

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
    } else if (humantext.includes("ห้องแรก")) {
        bottext = 'ห้องแรก รับทราบค่ะ';
    } else if (humantext.includes("ห้องประชุม")) {
        bottext = 'ห้องประชุม รับทราบค่ะ';
    } else if (humantext.includes("ห้องครัว")) {
        bottext = 'ห้องครัว รับทราบค่ะ';
    } else if (humantext.includes("หน้าลิฟต์")) {
        bottext = 'หน้าลิฟต์ รับทราบค่ะ';
    } else if (humantext.includes("หน้าถังดับเพลิง")) {
        bottext = 'หน้าถังดับเพลิง รับทราบค่ะ';
    }

    // Create JSON object based on conditions
    let jsonObject = {};

    if (humantext.includes("หน้าลิฟต์")) {
        jsonObject["หน้าลิฟต์"] = {
            "bottext": "หน้าลิฟต์",
            "goal.target_pose.pose.position.x": 6.190118789672852,
            "goal.target_pose.pose.position.y": 3.0056586265563965,
            "goal.target_pose.pose.position.z": 0,
            "goal.target_pose.pose.orientation.y": 0,
            "goal.target_pose.pose.orientation.z": 0.003793832825443487,
            "goal.target_pose.pose.orientation.w": 0.9999928033903507
        };
    } else if (humantext.includes("หน้าถังดับเพลิง")) {
        jsonObject["หน้าถังดับเพลิง"] = {
            "bottext": "หน้าถังดับเพลิง รับทราบค่ะ",
            "goal.target_pose.pose.position.x": 5.9316487312316895,
            "goal.target_pose.pose.position.y": 6.420914173126221,
            "goal.target_pose.pose.position.z": 0,
            "goal.target_pose.pose.orientation.y": 0,
            "goal.target_pose.pose.orientation.z": -0.9997608668786094,
            "goal.target_pose.pose.orientation.w": 0.021867991634609417
        };
    } else if (humantext.includes("ห้องครัว")) {
        jsonObject["ห้องครัว"] = {
            "bottext": "ห้องครัว รับทราบค่ะ",
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});