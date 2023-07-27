// NEW deprecated
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
        // tab.addClass('d-none'); //TODO debug

        $('#page-area').append(page);
        $('.tab').append(tab);

        tab_page_map[tabID] = pageID;

        const pairPage = $(pairTemplate({
            idx: idx
        }));

        pairPage.find('#pair_edge_' + idx).find('#stream-name').text('EDGE GPU ' + idx);
        $.get('/dashboard', function (data) {

            let info_template = _.template($(data).find('#info_template').html());
            const info = info_template({
                idx: idx
            });
            let hw = $(info).find('#hardware_' + idx);
            pairPage.find("#hardware").append(hw);
            let net = $(info).find('#net_' + idx);
            pairPage.find("#net").append(net);
            pairPage.find("#script").append($(info).find("#src_" + idx).html());
            pairPage.append($(info).find("#src_" + idx))
            // $(info).find("#src_" + idx).data("idx",idx); //TODO fix here
        }).catch(function (error) {
            showErrorMessage(error);
        });


        // page.append(pairPage);
        page.find("#pair-area").append(pairPage);
    }

}

// NEW
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

// NEW
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