let transcript;
let socket;
let isListening = false;
let isSandeGreetingReceived = false;
let disconnectTimeout;

function createWebSocket() {
  socket = new WebSocket('ws://localhost:9090');
  socket.addEventListener('open', () => {
    console.log('Connected to server');
    disconnectTimeout = setTimeout(() => {
      socket.close();
      console.log("พูดคำว่า'สวัสดีแสนดี'เพื่อเปิดการเชื่อมต่ออีกครั้ง");
    }, 60000); // 1 นาที เช็คว่าถ้าไม่มี event เกิดขึ้นให้หยุดการเชื่อมต่อ
    isSandeGreetingReceived = false;
  });
  socket.addEventListener('close', () => {
    console.log('WebSocket closed');
    clearTimeout(disconnectTimeout);
    startRecognition();
  });
  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });
  socket.addEventListener('message', (event) => {
    console.log('Received message from server:', event.data);
  });
}

function startRecognition() {
  if (!isListening) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'th-TH';
    recognition.addEventListener('result', (event) => {
      transcript = event.results[0][0].transcript;

      if (!isSandeGreetingReceived) {
        if (transcript === "สวัสดีแสนดี") {
          console.log('Received "สวัสดีแสนดี", เริ่มเชื่อมต่อ WebSocket');
          createWebSocket();
          isSandeGreetingReceived = true;
        }
      }

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(transcript);
      }
    });
    recognition.addEventListener('end', () => {
      isListening = false;
      startRecognition();
    });
    recognition.start();
    isListening = true;
  }
}

startRecognition();