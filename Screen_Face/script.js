var socket = io();
const audioList = [];
const SAMPLE_RATE = 44100;
const micButton = document.getElementById('micButton')
const playButton = document.getElementById('play-button');
let audio = new Audio();
let isRecording = false
let bufferSize = 2048,
    AudioContext,
    context,
    processor,
    input,
    globalStream;


playButton.addEventListener('click', () => {
    playAudio(audioUrl);
});

async function playAudio(audioUrl) {
    clearAudio();
    if (audio.src === audioUrl) {
        if (audio.paused) {
            audio.play().catch((error) => {
                console.error('Failed to play audio:', error);
            });
        } else {
            audio.pause();
        }
    } else {
        audio.src = audioUrl;
        audio.play().catch((error) => {
            console.error('Failed to play audio:', error);
        });
    }
}

function clearAudio() {
    if (audio.src) {
        URL.revokeObjectURL(audio.src);
        audio.src = '';
    }
}

socket.on('wavBlob', (wavBlob) => {
    console.log('Received audio URL:', wavBlob);
    const audioUrl = URL.createObjectURL(wavBlob);
    playAudio(audioUrl);
});

//audioStream constraints
const constraints = {
    audio: true,
    video: false,
};
var pcmRecord = {
    clearData: _ => pcmRecord.buffer = new Float32Array(),
    clearTimer: timerName => {
        if (pcmRecord[timerName]) {
            clearTimeout(pcmRecord[timerName]);
            pcmRecord[timerName] = null;
        }
    },
    clearTimers: _ => {
        pcmRecord.clearTimer('readyTimeoutID');
        pcmRecord.clearTimer('speakingTimeoutId');
        pcmRecord.clearTimer('idleTimeout');
        pcmRecord.clearTimer('updateMicColorID');
    },
    init: _ => {
        pcmRecord.clearTimers();
        pcmRecord.clearData();
        pcmRecord.sum = 0.0;
        pcmRecord.count = 0;
        pcmRecord.avg = 0.0;
        pcmRecord.max = 0.0;
        pcmRecord.isReady = false;
        pcmRecord.isSpeaking = false;
        pcmRecord.clearTimers();
        pcmRecord.timeStampStartRecord = 0;
        pcmRecord.micAlpha = 1.0;
        pcmRecord.micAlphaStep = -0.02;
    },
    updateMicColor: _ => {
        if (pcmRecord.micAlpha < 0.15) {
            pcmRecord.micAlphaStep = 0.02;
        } else if (pcmRecord.micAlpha > 1.0) {
            pcmRecord.micAlphaStep = -0.02;
        }
        pcmRecord.micAlpha += pcmRecord.micAlphaStep;
        micButton.style.setProperty("background-color", `rgba(255, 0, 0, ${pcmRecord.micAlpha})`, "important");
    },
    startUpdateMicColor: _ => {
        pcmRecord.micAlpha = 1.0;
        pcmRecord.micAlphaStep = -0.01;
        pcmRecord.updateMicColorID = setInterval(pcmRecord.updateMicColor, 10);
    },
    stopUpdateMicColor: _ => {
        pcmRecord.clearTimer('updateMicColorID');
        micButton.style.setProperty("background-color", "red", "important");
    },
    start: _ => {
        pcmRecord.clearTimers();
        pcmRecord.clearData();

        return new Promise((resolve, reject) => {
            if (pcmRecord.isReady) {
                resolve(true);
            } else {
                pcmRecord.readyTimeoutID = setTimeout(_ => { // waiting for process function to get enough average volume of noise.
                    pcmRecord.isReady = true;
                    resolve(true);
                    pcmRecord.readyTimeoutID = null;
                }, 1);
            }
        }).then(ok => {
            console.log(`recording is ${ok ? '' : 'not'} ready`);
        });
    },
    stop: _ => {
        pcmRecord.clearTimers();
        pcmRecord.isSpeaking = false;
        if (pcmRecord.buffer && pcmRecord.buffer.length > 0) {
            pcmRecord.saveWav();
        }
        pcmRecord.sum = 0.0;
        pcmRecord.count = 0;
    },
    process: e => {
        var left = e.inputBuffer.getChannelData(0);

        pcmRecord.max = Math.max(...left);
        // pcmRecord.sum += pcmRecord.max;
        // pcmRecord.count++;
        // pcmRecord.avg = pcmRecord.sum / pcmRecord.count;

        if (pcmRecord.isReady) {
            pcmRecord.vad(left);
        }

        // console.log(`is speaking: ${pcmRecord.isSpeaking}, max: ${pcmRecord.max}, ratio: ${(pcmRecord.max / pcmRecord.avg)}, sum: ${pcmRecord.sum}, count: ${pcmRecord.count}`);
    },
    vad: left => {
        if (!isRecording) {
            return;
        }
        // consider wheather user is speaking or not. can speak only when there is no audio playing.
        //
        // var soundRatio = (pcmRecord.max / pcmRecord.avg);
        // var isSpeaking = (pcmRecord.avg > 0) ? (soundRatio > 5.0) : false;
        let isSpeaking = pcmRecord.max > 0.08 && audioList.length === 0;

        if (isSpeaking) {
            pcmRecord.isSpeaking = true;
            pcmRecord.clearTimer('speakingTimeoutId');
        } else if (pcmRecord.isSpeaking && !pcmRecord.speakingTimeoutId) { // no current speaking then listen for a second before stop listening. 
            pcmRecord.speakingTimeoutId = setTimeout(_ => {
                pcmRecord.isSpeaking = false;
                pcmRecord.speakingTimeoutId = null;
            }, 700);
        }
        // if user is speaking.
        if (pcmRecord.isSpeaking) {
            pcmRecord.saveData(left);
            if (!!!pcmRecord.timeStampStartRecord) {
                pcmRecord.timeStampStartRecord = new Date();
                console.log('start speaking...');
                pcmRecord.startUpdateMicColor();
            }
            if (pcmRecord.idleTimeout) {
                pcmRecord.clearTimer('idleTimeout');
            }
        } else if (pcmRecord.buffer && pcmRecord.buffer.length > 0) {
            pcmRecord.saveWav();
        } else if (!!!pcmRecord.idleTimeout) {
            pcmRecord.idleTimeout = setTimeout(_ => {
                console.log('speaking idle timeout.');
                stopRecording();
            }, 60000);
        }
        //
    },
    saveData: data => {
        pcmRecord.buffer = new Float32Array([...pcmRecord.buffer, ...data]);
    },
    getData: _ => pcmRecord.buffer,
    downsampleBuffer: (buffer, sampleRate, outSampleRate) => {
        if (outSampleRate == sampleRate) {
            return buffer;
        }
        if (outSampleRate > sampleRate) {
            throw 'downsampling rate show be smaller than original sample rate';
        }
        var sampleRateRatio = sampleRate / outSampleRate;
        var newLength = Math.round(buffer.length / sampleRateRatio);
        var result = new Int16Array(newLength);
        var offsetResult = 0;
        var offsetBuffer = 0;

        while (offsetResult < result.length) {
            var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
            var accum = 0,
                count = 0;
            for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
                accum += buffer[i];
                count++;
            }

            result[offsetResult] = Math.min(1, accum / count) * 0x7fff;
            offsetResult++;
            offsetBuffer = nextOffsetBuffer;
        }

        return result.buffer;
    },
    saveWav: _ => {
        if (!!pcmRecord.timeStampStartRecord) {
            let timeStampStopRecord = new Date();
            let recordTime = (timeStampStopRecord - pcmRecord.timeStampStartRecord) / 1000;

            if (recordTime > 1) {
                let left16 = pcmRecord.downsampleBuffer(pcmRecord.getData(), SAMPLE_RATE, 8000);
                console.log(left16);
                // sendAudio(left16);
                console.log('sent audio.');
                socket.emit('audioData', left16);
            }
            console.log('record time, ', recordTime);
            pcmRecord.timeStampStartRecord = 0;
            pcmRecord.clearData();
            pcmRecord.stopUpdateMicColor();
        }
    }
}
pcmRecord.init();

if (micButton) {
    micButton.onclick = event => {
        try {
            checkRecording();
        } catch (e) {
            log('using microphone has failure.', e);
        }
    };
}

function initRecording() {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext({ sampleRate: SAMPLE_RATE });
    processor = context.createScriptProcessor(bufferSize, 1, 1);
    processor.connect(context.destination);
    context.resume();

    var handleSuccess = function (stream) {
        globalStream = stream;
        input = context.createMediaStreamSource(stream);
        input.connect(processor);

        processor.onaudioprocess = pcmRecord.process;

        console.log('int recording & assign pcm process');
    };

    return navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess);
}

function checkRecording() {
    try {
        if (micButton) {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        }
    } catch (e) {
        console.error('Error when trying to start/stop recording:', e);
    }
}

function showWaiting(show = true) {
    var micLoader = document.querySelector('.mic-loader');

    if (micButton) {
        if (show) {
            micButton.style.visibility = 'hidden';
            //micLoader.classList.add('loader');
        } else {
            micButton.style.visibility = 'visible';
            //micLoader.classList.remove('loader');
        }
    }
}

function messageLoading() {
    var loader = document.getElementById('messageLoading');

    if (loader) {
        loader.classList.toggle('loader');
    }
}

async function startRecording() {
    console.log('start recording');

    try {
        isRecording = true;
        showWaiting();
        await initRecording();
        await pcmRecord.start();
        showWaiting(false);
        micButton.style.setProperty("background-color", "red", "important");
    } catch (e) {
        showWaiting(false);
    }
}

function stopRecording() {
    console.log('stop recording');

    try {
        let clearVars = () => {
            input = null;
            processor = null;
            context = null;
            AudioContext = null;
            micButton.style.setProperty("background-color", "");
            isRecording = false;
        };
        pcmRecord.stop();

        let track = globalStream.getTracks()[0];
        track.stop();

        if (input) {
            input.disconnect(processor);
        }
        if (processor) {
            processor.disconnect(context.destination);
        }

        return context.close().then(clearVars);
    } catch (e) {
        return Promise.resolve().then(clearVars);
    }
}