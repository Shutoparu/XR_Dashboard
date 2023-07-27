let curStream = null;
let variable;

async function requestInfo(streamName) {
    const promise = await $.ajax({
        method: 'get',
        url: '/info/' + streamName,
    });
    return promise;
}


function destroyPlayer(streamName) {
    console.log('>>> destroyPlayer', streamName);

    clearInterval(variable);

    const seat = $('#seat');
    seat.removeClass('seat-on');

    seat.find('.player-area').addClass('d-none');

    const player = OvenPlayer.getPlayerByContainerId('player_edge');

    if (player) {
        player.remove();
    }

    seat.find('#edge_resolution').text('Cannot get resolution');
}

// NEW partial
function createPlayer(streamName) {

    const seat = $('#seat');
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

    const player = OvenPlayer.create(document.getElementById('player_edge'), playerOption); // Create player

    player.on('error', function (error) {
        console.log('App Error On Player', error);
        curStream = null;
        destroyPlayer(streamName);
    });

    variable = setInterval(() => {
        requestInfo(streamName).then(function (resp) {
            if (resp.statusCode === 200) {
                resp.response.input.tracks.forEach(function (track) {
                    if (track.type == 'Video') {
                        seat.find('#edge_resolution').text(track.video.width + ' x ' + track.video.height);
                    }
                });
            }
        }).catch(function (error) {
            console.error(error);
        });
    }, 2500);
}

function gotStreams(resp) {

    if (resp.statusCode === 200) {

        const streams = resp.response;

        // console.log(streams);

        streams.forEach(streamName => {
            if (streamName.substring(streamName.length - 1) == EDGE_ID && curStream == null) {
                console.log(curStream);
                console.log('>>> createPlayer', streamName);
                createPlayer(streamName);
                curStream = streamName;
            }
        });

        if (curStream != null && !streams.includes(curStream)) {
            curStream = null;
            destroyPlayer(curStream);
        }
    }
}

async function getStreams() {

    const promise = await $.ajax({
        method: 'get',
        url: '/getStreams',
    });

    return promise;
}

function checkStream() {

    getStreams().then(gotStreams).catch(function (e) {
        console.error(e);
        console.error('Could not get streams from OME.');
    });
}

function startStreamCheckTimer() {

    checkStream();

    setInterval(() => {

        checkStream();
    }, 2500);
}

function create_dropdown() {
    for (let i = 0; i < 8; i++) {
        $("#edge_detail_redirect").append(
            '<li><a class="dropdown-item" href="/edge/' + (i + 1)
            + '">Edge ' + (i + 1) + '</a></li>')
    }
}

// main
create_dropdown();
startStreamCheckTimer();