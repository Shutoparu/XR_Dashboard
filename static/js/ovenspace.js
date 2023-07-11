let tab_page_map = {};

let device_pair = {};
let connectionStatus = {}

let currentStreams = [];
let localStreams = [];
let selectedInputStreamName = null;
let shareMode = null;
let liveKitInputMap = {};
let tryToStreaming = false;

const tabTemplate = _.template($('#tab-template').html());
const pageTemplate = _.template($('#page-template').html());
const seatTemplate = _.template($('#seat-template').html());
const pairTemplate = _.template($('#pair-template').html());

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

function renderPairMonitorPages() {
    for (let i = 0; i < MAX_STREAM_PER_PAGE; i++) {

        const idx = i + 1;

        const pageID = 'pair_page_' + idx;
        const page = $(pageTemplate({
            pageID: pageID,
            pageType: 'pair-area'
        }));

        const tabID = 'pair_tab_' + idx;
        const tab = $(tabTemplate({
            tabID: tabID
        }));
        tab.text('Pair ' + idx);
        tab.addClass('d-none');

        $('#page-area').append(page);
        $('.tab').append(tab);

        tab_page_map[tabID] = pageID;

        const pairPage = $(pairTemplate({
            idx: idx
        }));

        pairPage.find('#pair_edge_' + idx).find('#stream-name').text('EDGE GPU ' + idx);
        pairPage.find('#pair_terminal_' + idx).find('#stream-name').text('TERMINAL ' + idx);

        page.append(pairPage);
    }

}

function renderMonitorPages() {

    const idx = 0;

    const pageID = "page_" + idx;
    const page = $(pageTemplate({
        pageID: pageID,
        pageType: 'dashboard-area'
    }));

    const tabID = "tab_" + idx;
    const tabButton = $(tabTemplate({
        tabID: tabID
    }));
    tabButton.text("Overview");

    $('#page-area').append(page);
    $('.tab').append(tabButton);

    tab_page_map[tabID] = pageID;

    let element = null;
    $.get('/dashboard', function (data) {
        let dummyNode = document.createElement('div');
        $.each($(data), function (key, val) {
            dummyNode.append(val);
        });

        $('#dashboard-area').append($(dummyNode).find('#dashboard'));

    }).catch(function (error) {
        showErrorMessage(error);
    });

}

function renderSeatPages() {

    for (let i = 0; i < SEAT_PAGES; i++) {

        const idx = i + 1;

        const pageID = "page_" + idx;
        const page = $(pageTemplate({
            pageID: pageID,
            pageType: 'seat-area'
        }));

        const tabID = "tab_" + idx;
        const tabButton = $(tabTemplate({
            tabID: tabID
        }));
        tabButton.text((i == 0) ? ("EDGE GPU") : ("TERMINAL"));

        $('#page-area').append(page);
        $('.tab').append(tabButton);

        tab_page_map[tabID] = pageID;
    }
}

function renderSeats() {

    let seatArea = $('[id=seat-area]');

    for (let j = 0; j < SEAT_PAGES; j++) {

        let name_header = (j == 0) ? ("EDGE_GPU") : ("TERMINAL");
        let reverse_header = (j == 0) ? ("TERMINAL") : ("EDGE_GPU");

        for (let i = 0; i < MAX_STREAM_PER_PAGE; i++) {

            const idx = i + 1;
            const streamName = name_header + "_" + idx;

            const seat = $(seatTemplate({
                streamName: streamName
            }));

            let proper_name = streamName.replace(/_/g, ' ');
            seat.find('#stream-name').text(proper_name);

            if (REGISTER_MODE == 'False') {

                seat.find('.join-button ').addClass('d-none');

            } else {

                seat.find('.join-button ').data('stream-name', streamName);

                seat.find('.join-button ').on('click', function (e) {

                    selectedInputStreamName = $(this).data('stream-name');

                    inputDeviceModal.modal('show');
                });

                seat.on('mouseenter', function () {
                    seat.find('.leave-button').stop().fadeIn();
                });

                seat.on('mouseleave', function () {
                    seat.find('.leave-button').stop().fadeOut();
                });

                seat.find('.leave-button ').data('stream-name', streamName);

                seat.find('.leave-button').on('click', function () {
                    destroyPlayer($(this).data('stream-name'))
                });
            }

            seatArea.eq(j).append(seat);
            device_pair[streamName] = reverse_header + "_" + idx;
            connectionStatus[streamName] = false;
        }
    }

}

function createLocalPlayer(streamName) {

    const seat = $('#seat-' + streamName);

    seat.addClass('seat-on');

    seat.find('.local-player-area').removeClass('d-none');

    document.getElementById('local-player-' + streamName).srcObject = liveKitInputMap[streamName].inputStream;
}

function createPlayer(streamName) {

    const seat = $('#seat-' + streamName);
    seat.addClass('seat-on');
    seat.find('.player-area').removeClass('d-none');

    let player_name = null;
    if (streamName.substring(0, 1) == "E") {
        player_name = 'player_edge_' + streamName.substring(streamName.length - 1);
    } else {
        player_name = 'player_terminal_' + streamName.substring(streamName.length - 1);
    }

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

    const player2 = OvenPlayer.create(document.getElementById(player_name), playerOption); // Create player

    player2.on('error', function (error) {

        console.log('App Error On Player2', error);

        destroyPlayer(streamName);
    });

    connectionStatus[streamName] = true;
    checkPairStreaming(streamName);
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
    connectionStatus[streamName] = false;
    checkPairStreaming(streamName);
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

// add
function choosetab(tab_id) {
    let page_id = tab_page_map[tab_id];
    let tabs = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.add('d-none');
    }
    let buttons = document.getElementsByClassName("tablinks");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('curtab');
    }
    document.getElementById(page_id).classList.remove('d-none');
    document.getElementById(tab_id).classList.add('curtab');
}


function checkPairStreaming(streamName) {

    if (REGISTER_MODE == "False") {

        let pairStreamName = device_pair[streamName];
        let tab_name = "pair_tab_" + streamName.substring(streamName.length - 1);

        if (connectionStatus[streamName]) {

            const handler = _inputHandler(streamName);
            handler.next();
            getInputInfo(streamName, handler);
            if (connectionStatus[pairStreamName]) {
                $('#' + tab_name).removeClass('d-none');
            }
        } else {
            $('#' + tab_name).addClass('d-none');
            if ($('#' + tab_name).hasClass('curtab')) { // might need to stay on page
                choosetab('tab_1');
            }
        }
    }
}

function* _inputHandler(streamName) {

    let tab_name = "pair_tab_" + streamName.substring(streamName.length - 1);
    let page_name = tab_page_map[tab_name];

    let source_info = yield;

    let sourceUrl;
    let input_height;
    let input_width;

    sourceUrl = source_info.input.sourceUrl;
    source_info.input.tracks.forEach(function (track) {
        if (track.type == 'Video') {
            input_height = track.video.height;
            input_width = track.video.width;
        }
    });

    const page = $('#' + page_name);
    if (streamName.substring(0, 1) == 'E') {
        page.find('#edge_resolution').text(input_width + ' x ' + input_height);
        page.find('#edge_ip').text(sourceUrl);
    } else {
        page.find('#terminal_resolution').text(input_width + ' x ' + input_height);
        page.find('#terminal_ip').text(sourceUrl);
    }
}


function getInputInfo(streamName, handler) {
    requestInfo(streamName).then(function (resp) {
        if (resp.statusCode === 200) {
            // source_info = resp.response; //DEBUG
            handler.next(resp.response);
        }
    }).catch(function (e) {
        console.error(e);
    });
}

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

if (REGISTER_MODE == "True") {
    $('#title').removeClass('d-none');
} else {
    renderMonitorPages();
}

renderSeatPages();

renderSeats();

renderPairMonitorPages();

if (REGISTER_MODE == "True") {
    choosetab('tab_1');
} else {
    choosetab('tab_0');
}

startStreamCheckTimer();