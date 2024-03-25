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
app.use(express.static('/home/sandee/jsonfile'));

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

    if (humantext.includes("hello")) {
        bottext = 'สวัสดีค่ะ';
    } else if (humantext.includes("waht's your name")) {
        bottext = 'ฉันแสนดีค่ะ';
    } else if (humantext.includes("you so cute")) {
        bottext = 'ขอบคุณค่ะ';
    } else if (humantext.includes("thank you")) {
        bottext = 'ยินดีค่ะ';
    } else if (humantext.includes("cyber room")) {
        bottext = 'ห้องแรก รับทราบค่ะ';
    } else if (humantext.includes("meeting room")) {
        bottext = 'ห้องประชุม รับทราบค่ะ';
    } else if (humantext.includes("หน้าลิฟต์")) {
        bottext = 'หน้าลิฟต์ รับทราบค่ะ';
    } else if (humantext.includes("หน้าถังดับเพลิง")) {
        bottext = 'หน้าถังดับเพลิง รับทราบค่ะ';
    }

    // Create JSON object based on conditions
    let jsonObject = {};

    if (humantext.includes("cyber room")) {
        jsonObject["room one"] = {
            //"bottext": "ห้องแรก รับทราบค่ะ",
            "goal.target_pose.pose.position.x": -0.0018177628517150879,
            "goal.target_pose.pose.position.y": -0.020768046379089355,
            "goal.target_pose.pose.position.z": 0.0,
            "goal.target_pose.pose.orientation.x": 0.0,
            "goal.target_pose.pose.orientation.y": 0.0,
            "goal.target_pose.pose.orientation.z": 0.005009247926782237,
            "goal.target_pose.pose.orientation.w": 0.9999874536388984
        };
    } else if (humantext.includes("meeting room")) {
        jsonObject["ห้องประชุม"] = {
            //"bottext": "ห้องประชุม รับทราบค่ะ",
            "goal.target_pose.pose.position.x": 8.490129470825195,
            "goal.target_pose.pose.position.y": -0.04902374744415283,
            "goal.target_pose.pose.position.z": 0.0,
            "goal.target_pose.pose.orientation.x": 0.0,
            "goal.target_pose.pose.orientation.y": 0.0,
            "goal.target_pose.pose.orientation.z": 0.03936740567745952,
            "goal.target_pose.pose.orientation.w": 0.9992248032200893
        };
    } else if (humantext.includes("ห้องครัว")) {
        jsonObject["ห้องครัว"] = {
            //"bottext": "ห้องครัว รับทราบค่ะ",
            "goal.target_pose.pose.position.x": -6.472887992858887,
            "goal.target_pose.pose.position.y": 6.826329231262207,
            "goal.target_pose.pose.position.z": 0,
            "goal.target_pose.pose.orientation.x": 0,
            "goal.target_pose.pose.orientation.y": 0,
            "goal.target_pose.pose.orientation.z": 0.9995304468053192,
            "goal.target_pose.pose.orientation.w": 0.030641245228597343
        };
    } else {
        jsonObject[humantext] = {
            //"bottext": bottext,
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
