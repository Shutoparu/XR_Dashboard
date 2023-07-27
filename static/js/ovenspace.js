
let currentStreams = [];
let localStreams = [];
let selectedInputStreamName = null;
let shareMode = null;
let liveKitInputMap = {};
let tryToStreaming = false;

const seatTemplate = _.template($('#seat-template').html());

const inputVideo = document.getElementById('input-video');

const beforeStreamingTitle = $('#before-streaming-title');

const deviceInputPreviewArea = $('#device-input-preview-area');
const rtmpInputPreviewArea = $('#rtmp-input-preview-area');
const captureSelectArea = $('#capture-select-area');

const sourceSelectArea = $('#source-select-area');
const videoSourceSelect = $('#video-source-select');
const audioSourceSelect = $('#audio-source-select');
const constraintsSelect = $('.constraints-select');

const rtmpInputUrlInput = $('#rtmp-input-url-input');
const rtmpInputStreamkeyInput = $('#rtmp-input-streamkey-input');
const srtInputUrlInput = $('#srt-input-url-input');
const waitingRtmpInputText = $('#waiting-rtmp-input-text');
const connectedRtmpInputText = $('#connected-rtmp-input-text');

const shareDeviceButton = $('#share-device-button');
const shareDisplayButton = $('#share-display-button');
const shareRtmpButton = $('#share-rtmp-button');

const backToCaptureSelectButton = $('.back-to-capture-select-button');
const startShareButton = $('#start-share-button');

const inputErrorMessage = $('#input-error-message');

const inputDeviceModal = $('#input-device-modal');
const inputStatModal = $('#show-stat-modal');

const totalUserCountSpan = $('#total-user-count-span');
const videoUserCountSpan = $('#video-user-count-span');


if (!navigator.mediaDevices.getDisplayMedia) {
    shareDisplayButton.addClass('d-none');
}

shareDeviceButton.on('click', function () {

    shareMode = 'device';

    OvenLiveKit.getDevices()
        .then(function (devices) {

            if (devices) {
                renderDevice('video', videoSourceSelect, devices.videoinput,);
                renderDevice('audio', audioSourceSelect, devices.audioinput);
            }

            createWebRTCInput();
        })
        .catch(function (error) {

            showErrorMessage(error);
        });
});

constraintsSelect.on('change', function () {

    removeInputStream(selectedInputStreamName);
    createWebRTCInput();
});

shareRtmpButton.on('click', function () {
    shareMode = 'rtmp';
    readyStreaming();
});

shareDisplayButton.on('click', function () {

    shareMode = 'display';

    createWebRTCInput();
});

backToCaptureSelectButton.on('click', function () {

    cancelReadyStreaming();
});

startShareButton.on('click', function () {

    startStreaming();
});

function renderDevice(type, select, devices) {

    select.empty();

    if (devices.length === 0) {

        select.append('<option value="">No Source Available</option>')
    } else {

        _.each(devices, function (device) {

            let option = $('<option></option>');

            option.text(device.label);
            option.val(device.deviceId);
            select.append(option);
        });
    }

    select.find('option').eq(0).prop('selected', true);
}

function arrayRemove(arr, value) {

    return arr.filter(function (ele) {
        return ele != value;
    });
}

function createWebRTCInput() {

    const input = OvenLiveKit.create({
        callbacks: {
            connected: function () {

                console.log('App Connected');

                if (tryToStreaming) {

                    createLocalPlayer(selectedInputStreamName);
                    inputDeviceModal.modal('hide');

                    tryToStreaming = false;
                }
            },
            connectionClosed: function (type, event) {

                console.log('App Connection Closed');

                if (type === 'websocket') {
                    console.log('app websocket closed');
                }
                if (type === 'ice') {
                    console.log('app ice closed');
                }
            },
            iceStateChange: function (state) {

                console.log('App ICE State', state);
            },
            error: function (error) {

                console.log('App Error On OvenLiveKit', error);

                if (tryToStreaming) {

                    currentStreams = arrayRemove(currentStreams, selectedInputStreamName);
                    localStreams = arrayRemove(localStreams, selectedInputStreamName);
                    tryToStreaming = false;
                }

                showErrorMessage(error);
            }
        }
    });

    input.attachMedia(inputVideo);

    let errorMsg = null;

    if (shareMode === 'device') {

        input.getUserMedia(getDeviceConstraints()).then(function (stream) {

        }).catch(function (error) {
            cancelReadyStreaming(); // change
            errorMsg = error;
        }).finally(function () {
            readyStreaming();
            deviceInputPreviewArea.removeClass('d-none');
            sourceSelectArea.removeClass('d-none');
            if (errorMsg) {
                showErrorMessage(errorMsg);
            }
        });
    }

    if (shareMode === 'display') {

        input.getDisplayMedia(getDisplayConstraints()).then(function (stream) {

        }).catch(function (error) {
            cancelReadyStreaming(); // change
            errorMsg = error;

        }).finally(function () {
            readyStreaming();
            deviceInputPreviewArea.removeClass('d-none');
            sourceSelectArea.addClass('d-none');
            if (errorMsg) {
                showErrorMessage(errorMsg);
            }
        });
    }

    liveKitInputMap[selectedInputStreamName] = input;
}

function readyStreaming() {

    captureSelectArea.addClass('d-none');
    inputErrorMessage.addClass('d-none').text('');

    if (shareMode === 'device' || shareMode === 'display') {
        deviceInputPreviewArea.find('button').prop('disabled', false);

        if (shareMode === 'device') {
            beforeStreamingTitle.text('Click start button to share your WebCam / Mic');
        } else if (shareMode === 'display') {
            beforeStreamingTitle.text('Click start button to share screen');
        }

    }

    if (shareMode === 'rtmp') {
        rtmpInputPreviewArea.find('button').prop('disabled', false);
        rtmpInputPreviewArea.removeClass('d-none');
        beforeStreamingTitle.text('Send the input stream using a live encoder.');

        rtmpInputUrlInput.val(OME_RTMP_INPUT_URL);
        rtmpInputStreamkeyInput.val(selectedInputStreamName);

        srtInputUrlInput.val(OME_SRT_INPUT_URL + encodeURIComponent(selectedInputStreamName));
    }

}

function resetInputUI() {

    inputVideo.srcObject = null;
    shareMode = null;

    deviceInputPreviewArea.addClass('d-none');
    deviceInputPreviewArea.find('button').prop('disabled', true);

    rtmpInputPreviewArea.addClass('d-none');
    rtmpInputPreviewArea.find('button').prop('disabled', true);

    waitingRtmpInputText.removeClass('d-none');
    connectedRtmpInputText.addClass('d-none');


    beforeStreamingTitle.text('Please choose sharing mode');
    captureSelectArea.removeClass('d-none');

    inputErrorMessage.addClass('d-none').text('');
}

function cancelReadyStreaming() {
    removeInputStream(selectedInputStreamName);
    resetInputUI();
}

function showErrorMessage(error) {

    let errorMessage = '';

    if (error.message) {

        errorMessage = error.message;
    } else if (error.name) {

        errorMessage = error.name;
    } else {

        errorMessage = error.toString();
    }

    if (errorMessage === 'OverconstrainedError') {

        errorMessage = 'The input device does not support the specified resolution or frame rate.';
    }

    if (errorMessage === 'Cannot create offer') {

        errorMessage = 'Cannot create stream.';
    }

    inputErrorMessage.removeClass('d-none').text(errorMessage);
}

function startStreaming() {

    if (selectedInputStreamName && liveKitInputMap[selectedInputStreamName]) {

        tryToStreaming = true;
        localStreams.push(selectedInputStreamName);
        currentStreams.push(selectedInputStreamName);

        liveKitInputMap[selectedInputStreamName].startStreaming(OME_WEBRTC_INPUT_HOST + '/' + APP_NAME + '/' + selectedInputStreamName + '?direction=send&transport=tcp');
    }
}

inputDeviceModal.on('hidden.bs.modal', function () {
    resetInputUI();
});

inputStatModal.on('hidden.bs.modal', function () {
    inputStatModal.find('#src-ip-modal').text('');
    inputStatModal.find('#src-res-modal').text('');
});

function getDeviceConstraints() {

    let videoDeviceId = videoSourceSelect.val();
    let audioDeviceId = audioSourceSelect.val();

    let newConstraints = {};

    if (videoDeviceId) {
        newConstraints.video = {
            deviceId: {
                exact: videoDeviceId
            }
        };
    }

    if (audioDeviceId) {
        newConstraints.audio = {
            deviceId: {
                exact: audioDeviceId
            }
        };
    }

    return newConstraints;
}

function getDisplayConstraints() {

    let newConstraint = {};

    newConstraint.video = true;
    newConstraint.audio = true;

    return newConstraint;
}


// NEW
function renderOverviewPages() {

    $.get('/dashboard', function (data) {
        // $('#overview_page_inner').append($(data).find('#must').html());
        $('#overview_page_inner').append($(data).find('#dashboard').html());
    }).catch(function (error) {
        showErrorMessage(error);
    });

}


// NEW partial
function renderSeats() {

    let seatArea = $('#edge_page_inner');

    for (let i = 0; i < MAX_STREAM_PER_PAGE; i++) {

        const idx = i + 1;
        const streamName = "EDGE_GPU_" + idx;


        const seat = $(seatTemplate({
            streamName: streamName
        }));

        let proper_name = streamName.replace(/_/g, ' ');
        if (idx != 9) {
            seat.find('#stream-name').text(proper_name);
        }

        if (REGISTER_MODE == 'False' || idx == 9) {

            seat.find('.join-button ').addClass('d-none'); // TODO fix here

        } else {

            seat.find('.join-button ').data('stream-name', streamName);

            seat.find('.join-button ').on('click', function (e) {

                selectedInputStreamName = $(this).data('stream-name');

                inputDeviceModal.modal('show');
            });

            seat.on('mouseenter', function () {
                seat.find('.leave-button').stop().fadeIn();
                seat.find('.local-player-stat').stop().fadeIn();
            });

            seat.on('mouseleave', function () {
                seat.find('.leave-button').stop().fadeOut();
                seat.find('.local-player-stat').stop().fadeOut();
            });

            seat.find('.leave-button ').data('stream-name', streamName);

            seat.find('.leave-button').on('click', function () {
                destroyPlayer($(this).data('stream-name'))
            });

            seat.find('.local-player-stat').data('stream-name', streamName);

            seat.find('.local-player-stat').on('click', function () {
                const handler = _getSrcStat(streamName);
                handler.next();
                getInputInfo(streamName, handler);
            });
        }

        seatArea.append(seat);

    }
}

// NEW
function* _getSrcStat(streamName) {
    let source_info;
    let sourceUrl;
    let input_height = 0;
    let input_width;

    while (1) {
        source_info = yield 0;
        if (source_info.outputs.length != 0) {
            break;
        }
    }

    console.log(source_info);
    sourceUrl = source_info.input.sourceUrl;
    source_info.input.tracks.forEach(function (track) {
        if (track.type == 'Video') {
            input_height = track.video.height;
            input_width = track.video.width;
        }
    });


    inputStatModal.find('#src-ip-modal').text(sourceUrl);
    inputStatModal.find('#src-res-modal').text(input_height + 'x' + input_width);
    inputStatModal.modal('show');
}

function createLocalPlayer(streamName) {

    const seat = $('#seat-' + streamName);

    seat.addClass('seat-on');

    seat.find('.local-player-area').removeClass('d-none');

    document.getElementById('local-player-' + streamName).srcObject = liveKitInputMap[streamName].inputStream;
}

// NEW partial
function createPlayer(streamName) {

    const seat = $('#seat-' + streamName);
    seat.addClass('seat-on');
    seat.find('.player-area').removeClass('d-none');



    const playerOption = {
        // image: OME_THUMBNAIL_HOST + '/' + APP_NAME + '/' + streamName + '/thumb.png',
        autoFallback: false,
        autoStart: true,
        sources: [
            {
                label: 'WebRTC',
                type: 'webrtc',
                file: OME_WEBRTC_STREAMING_HOST + '/' + APP_NAME + '/' + streamName + '?transport=tcp'
            },
            {
                label: 'LLHLS',
                type: 'llhls',
                file: OME_LLHLS_STREAMING_HOST + '/' + APP_NAME + '/' + streamName + '/llhls.m3u8'
            }
        ]
    };

    const player = OvenPlayer.create(document.getElementById('player-' + streamName), playerOption); // Create player

    player.on('error', function (error) {

        console.log('App Error On Player', error);

        destroyPlayer(streamName);
    });

    // if (streamName.substring(0, 1) == "E") {
    //     let player_name = 'player_edge_' + streamName.substring(streamName.length - 1);
    //     const player2 = OvenPlayer.create(document.getElementById(player_name), playerOption); // Create player
    //     player2.on('error', function (error) {

    //         console.log('App Error On Player2', error);

    //         destroyPlayer(streamName);
    //     });
    // }
}

function removeInputStream(streamName) {
    if (liveKitInputMap[streamName]) {

        liveKitInputMap[streamName].remove();
        liveKitInputMap[streamName] = null;
        delete liveKitInputMap[streamName];
    }
}

function destroyPlayer(streamName) {
    console.log('>>> destroyPlayer', streamName);
    currentStreams = arrayRemove(currentStreams, streamName);
    localStreams = arrayRemove(localStreams, streamName);

    const seat = $('#seat-' + streamName);
    seat.removeClass('seat-on');

    seat.find('.player-area').addClass('d-none');

    const player = OvenPlayer.getPlayerByContainerId('player-' + streamName);

    if (player) {

        player.remove();
    }

    seat.find('.local-player-area').addClass('d-none');

    const localPlayer = document.getElementById('local-player-' + streamName);

    if (localPlayer) {

        localPlayer.srcObject = null;
    }

    removeInputStream(streamName);

}

async function getStreams() {

    const promise = await $.ajax({
        method: 'get',
        url: '/getStreams',
    });

    return promise;
}

function gotStreams(resp) {

    if (resp.statusCode === 200) {

        const streams = resp.response;

        // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

        // // handled streams in OvenSpace. Local streams + Remote streams.
        // console.log('>>> currentStreams', currentStreams);

        // // Local streams sending to OvenMediaEngine from user device.
        // console.log('>>> local  Streams', localStreams);

        // // All streams created in OvenMediaEngine.
        // console.log('>>> ome    streams', streams);


        const missingLocalStreams = [];

        // Care ome stream creating is slow
        localStreams.forEach(streamName => {

            if (!streams.includes(streamName)) {
                missingLocalStreams.push(streamName);
            }
        });

        // console.log('>>> missingStreams', missingLocalStreams);

        missingLocalStreams.forEach(streamName => {
            streams.push(streamName);
        });

        streams.forEach((streamName, index) => {

            // Create player when new stream is detected
            if (!currentStreams.includes(streamName)) {

                // rtmp input stream detected
                if (shareMode === 'rtmp'
                    && streamName === selectedInputStreamName) {

                    waitingRtmpInputText.addClass('d-none');
                    connectedRtmpInputText.removeClass('d-none');

                    setTimeout(function () {

                        inputDeviceModal.modal('hide');
                    }, 4000)
                }

                // making peer connection with zero delay don't work well...
                setTimeout(function () {
                    console.log('>>> createPlayer', streamName);
                    createPlayer(streamName);
                }, 200 * index);
            }
        });

        currentStreams.forEach(streamName => {

            // Delete player when exising stream is removed
            if (!streams.includes(streamName) && !localStreams.includes(streamName)) {

                destroyPlayer(streamName);
            }
        });

        currentStreams = streams;

        videoUserCountSpan.text(currentStreams.length);
    }
}

function checkStream() {

    getStreams().then(gotStreams).catch(function (e) {
        console.error('Could not get streams from OME.');
    });
}

function startStreamCheckTimer() {

    checkStream();

    setInterval(() => {

        checkStream();
    }, 2500);
}




// NEW
function getInputInfo(streamName, handler) {
    requestInfo(streamName).then(function (resp) {
        if (resp.statusCode === 200) {
            let ret = handler.next(resp.response);
            if (ret.value === 0) {
                getInputInfo(streamName, handler); // TODO try fix this so no recurssion is used
            }
        }
    }).catch(function (error) {
        console.error(error);
    });
}

// NEW
async function requestInfo(streamName) {
    const promise = await $.ajax({
        method: 'get',
        url: '/info/' + streamName,
    });
    return promise;
}


let socket = io({
    transports: ['websocket']
});

socket.on('user count', function (data) {
    totalUserCountSpan.text(data.user_count);
});

// NEW
function click_overview() {
    $("#overview_page").removeClass("d-none");
    $("#edge_page").addClass("d-none");
}

function click_edge() {
    $("#overview_page").addClass("d-none");
    $("#edge_page").removeClass("d-none");
}

// NEW change href
function create_dropdown() {
    for (let i = 0; i < parseInt(MAX_STREAM_PER_PAGE) - 1; i++) {
        $("#edge_detail_redirect").append(
            '<li><a class="dropdown-item" href="/edge/' + (i + 1)
            + '" target="_blank">Edge ' + (i + 1) + '</a></li>')
    }
}


// NEW
// idea = main()
renderSeats();

if (REGISTER_MODE == "True") {
    $('#title').removeClass('d-none');
    click_edge();
} else {
    create_dropdown();
    $('#navbarDropdown').removeClass('d-none');
    renderOverviewPages();
    click_overview();
}

startStreamCheckTimer();