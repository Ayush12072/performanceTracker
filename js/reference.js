
	// Pagination Starts
initPagination = {
    pageNo: 0,
    pageLimit: 10,

    // Initialize Asset Pagination
    index: function() {
        let self = this;
        let pageLimit = this.pageLimit;
        let progCount = $('#progCount').val();
        let noOfPage = Math.ceil(parseFloat(progCount / pageLimit));

        // Initialize pagination
        if($('#pagination').data("twbs-pagination")){
            $('#pagination').twbsPagination('destroy');
        }
        $('#pagination').twbsPagination({
            totalPages: noOfPage,
            visiblePages: 6,
            next: 'Next',
            prev: 'Prev',
            onPageClick: function (event, page) {
                initPagination.pageNo = page-1;
                paginate();
                var urlParam = {};
                urlParam.key = 'pg';
                urlParam.value = initPagination.pageNo;
                updateUrl(urlParam);
                //fetch content and render here
                // $('#page-content').text('Page ' + page) + ' content here';
            }
        });
    },

    // Initialize Search Pagination
    initSearchPagination(){
        
        // Initialize pagination
        this.pageNo = 0;
        let pageLimit = this.pageLimit;
        let progCount = $('#progCount').val();
        let noOfPage = Math.ceil(parseFloat(progCount / pageLimit));
        
        if($('#pagination').data("twbs-pagination")){
            $('#pagination').twbsPagination('destroy');
        }
        $('#pagination').twbsPagination({
            totalPages: noOfPage,
            visiblePages: 6,
            next: 'Next',
            prev: 'Prev',
            onPageClick: function (event, page) {
                initPagination.pageNo = page-1;
                setSearchParams();
            }
        });
    }
}

// $('.pr-button').on('click', function(){
//     if(pageNo>0){
//         pageNo--;
//     }
//     paginate();
//     });
// $('.nx-button').on('click', function(){
//     var noOfPage = Math.ceil(parseFloat(progCount/pageLimit));
//     console.log(noOfPage);
//     if(pageNo < (noOfPage-1)){
//         pageNo++;
//     }
//     paginate();
//     });


// Date sorting assending and decseending 


function ajaxDateSortCall(sort) {
    console.log(sort);
    changeviews_paginate = ``;
    var channel_val = $('#channelSelect').val();
    if(channel_val == 0){ // to get data from all channels
        channel_val = '';
    }
    var pageNo = initPagination.pageNo;
    var pageLimit = initPagination.pageLimit;

    $.ajax({
        //headers: { 'X-CSRF-Token': csrfToken },
        type: 'GET',
        url: BASEURL + 'programs/index?page=' + pageNo + '&limit=' + pageLimit +'&sort_descending='+sort,
        dataType: 'json',
        beforeSend: function () {
        },
        success: function (res) {


            var program_services = res.program_services;
            console.log(program_services);
            var data = res.data.list;
            //console.log(data);
            $('.program-list').html("");

            for (i = 0; i < data.length; i++) {

                var program_name = '';
                if (data[i].name.length > 25) {
                    program_name = data[i].name.substring(0, 25) + '...';
                }
                else {
                    program_name = data[i].name;
                }
                var ext = data[i].input_video_path?splitByLastDot(data[i].input_video_path):"";
                var audio_thumb = "https://otttranscodeddata.blob.core.windows.net/ott-transcoded-data/audio.png";

                /*-------------Cricket Live Transcoding ----------------------*/
                var transcodingStatus;
                if(data[i].program_type == "cricket_live"){
                    transcodingStatus = "Transcoded";
                }else{
                    transcodingStatus = data[i].transcoding_status;
                }
                 /*-------------Cricket Live Transcoding Ends----------------------*/
                //  console.log(data[i]);
                
                // console.log(data[i].program_type);
                if(data[i].program_type == "football"){
                    changeviews_paginate = "sportsview";
                }else{
                    changeviews_paginate = "view";
                }

                // console.log(data[i].subJobTypes);

               // *********    JOB STATUS CODE BY SABBUL ***********

                if(data[i].jobStatus == "COMPLETED"){
                        status = "<i class='completed fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "PENDING"){
                       status = "<i class='pending fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "IN_PROGRESS"){
                        status = "<i class='inProgress fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "SUCCESS"){
                      status = "<i class='success fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "FAILED"){
                         status = "<i class='failed fa fa-circle'></i>";
                    }
                    else{ 
                        status = data[i].jobStatus;
                }


               if (data[i].qcStatus == "PENDING") {
                    qcStatus = "<i class='pending fa fa-check-circle'></i>";
                }else if (data[i].qcStatus == "IN_PROGRESS") {
                    qcStatus = "<i class='inProgress fa fa-check-circle'></i>";
                } else if (data[i].qcStatus == "COMPLETED") {
                    qcStatus = "<i class='success fa fa-check-circle'></i>";
                }else if (data[i].qcStatus == "FAILED") {
                    qcStatus = "<i class='failed fa fa-check-circle'></i>";
                } else {
                    qcStatus = data[i].qcStatus;
                }

                // SHOE DATE CODE BY SABBUL
                let startUTC =data[i].created;
                let onlyDate = moment(startUTC).format('DD');
                let month = moment(startUTC).format('MMM');
                let year = moment(startUTC).format('YYYY');
                let monthYears =month +" " +year;
                let timeMinu = moment(startUTC).format('kk:mm');
                var discoveryType = '';
                if (data[i].subJobTypes!= null){
                    discoveryType = data[i].subJobTypes.length > 0 ? checkSubJobType(data[i].subJobTypes, program_services) : '';
                }
                
                if (discoveryType == 'Blizzard-Overwatch' || discoveryType == 'Blizzard Overwatch') {
                	discoveryType = 'Blizzard';
                }
                
                if (data[i].userName === null) {
                	data[i].userName = MAIN_TENANT_NAME;
                }

                let  finalQCStatus= ' ';
                let toolTipShow;
                let  discoveryServiceTypes = data[i].subJobTypes; 
                let  isForSegmentQC=false;
                if(discoveryServiceTypes 
                    && (discoveryServiceTypes.includes('SEGMENTS_DISCOVERY') || discoveryServiceTypes.includes('PHYSICAL_CLIPS_DISCOVERY'))){
                   isForSegmentQC=true;
                }
                 if(isForSegmentQC &&  data[i].qcStatus == "COMPLETED" && data[i].jobStatus == 'COMPLETED'){
                    status = qcStatus;
                    toolTipShow="Finalized";
                   
                }else{
                    toolTipShow=data[i].jobStatus;
                }
                   

                var rowHtml = `<tr>
                <td>
                    <div class="dateSetBox">
                        <p class="timeMinu">${timeMinu}</p>
                        <p class="onlyDate">${onlyDate}</p>
                        <p class="monthYears">${monthYears}</p>
                    </div>
                </td>
                <td>
                  <div data-programs-id="${data[i].program_id}" data-vid-url="${data[i].recorded_video}" data-fps="${data[i].fps}" data-df="${data[i].droppedFrame}" data-playbackSecurity="${data[i].playbackSecurity}">
                    <img src="${(ext == 'mp3') || (ext == 'wav')?BASEURL + 'img/audio.svg':BASEURL + 'img/play.png'}" alt="no img" class="play-imglistpage${(ext == 'mp3') || (ext == 'wav')?' play-audio':''}">
                    <img src="${(ext == 'mp3') || (ext == 'wav')?audio_thumb:(data[i].thumbnail ? data[i].thumbnail : BASEURL + 'img/no-thumbnail.png')}" alt="no img" class="thumbnail-img">
                  </div>
                </td>
                <td class='asset-title' scope="row"><a data-toggle="tooltip" data-placement="bottom" data-html="true" title="${data[i].name}" href="${BASEURL + 'programs/'+changeviews_paginate+'/'+ data[i].program_id + '/' + data[i].job_id}">${removeUnderscores(program_name)}</a><br><span  class="uploaded-name">Uploaded by : ${data[i].userName}</span></td>
               <td class="discoveryListAsset">
                    ${discoveryType}
                </td>
               <td class="jobStatusColor">
                   <a data-toggle="tooltip" data-placement="bottom" data-html="true" title="${toolTipShow}"><div class="status">${status}</div></a>
               </td>
                <td scope="row">
                <div class="ellipsisButton dropdown dropleft" id="ellipsisButtonlist">
                    <div class="ellipsisBTN dropdown-toggle" data-toggle="dropdown">
                         <img src="${BASEURL}/img/svg_icons/three-v.svg" class="compliancethreedot" alt="three dot">
                    </div>
                    <div class="dropdown-menu">
                        
                        <a class="dropdown-item" href="${BASEURL + 'jobs/index?_d=' + data[i].job_id}"><svg version="1.1" class="asseticon asseticonadjust" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M302.045,0.142c-72.125,0-135.864,36.573-173.66,92.143L27.311,0L0.355,29.523l108.32,98.901 c-10.631,25.097-16.513,52.676-16.513,81.602c0,50.682,18.059,97.226,48.078,133.536L0.071,483.731L28.34,512l140.17-140.17 c36.311,30.019,82.854,48.078,133.536,48.078c115.73,0,209.883-94.154,209.883-209.883S417.776,0.142,302.045,0.142z M302.045,379.931c-93.686,0-169.905-76.22-169.905-169.905c0-18.342,2.933-36.009,8.335-52.571  c2.188-6.708,4.783-13.235,7.755-19.55c0.006-0.013,0.012-0.026,0.018-0.04c2.218-4.709,4.647-9.301,7.274-13.763 c0.034-0.057,0.068-0.115,0.102-0.172c0.864-1.463,1.747-2.913,2.653-4.349c30.118-47.705,83.301-79.462,143.768-79.462 c93.686,0,169.905,76.22,169.905,169.905S395.732,379.931,302.045,379.931z M423.878,164.874l-50.827-53.868l-70.037,70.036 c-10.022-7.528-22.468-11.994-35.94-11.994c-14.826,0-28.401,5.42-38.879,14.367l-39.783-36.323 c-6.97,12.535-11.924,26.334-14.427,40.962l33.963,31.01c-0.544,3.239-0.841,6.56-0.841,9.95c0,33.066,26.902,59.967,59.967,59.967 c16.018,0,31.077-6.238,42.402-17.563c11.327-11.327,17.564-26.385,17.563-42.403c0-4.761-0.575-9.389-1.628-13.832l46.805-46.805 l58.21,61.692c1.016-6.534,1.547-13.229,1.547-20.044C431.973,194.156,429.109,178.944,423.878,164.874z M281.209,243.15 c-3.775,3.775-8.795,5.854-14.134,5.854c-11.022,0-19.989-8.968-19.989-19.989c0-11.022,8.967-19.989,19.989-19.989 s19.989,8.967,19.989,19.989C287.063,234.355,284.984,239.374,281.209,243.15z"/></svg>&nbsp;&nbsp;  Job Status </a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="${BASEURL + 'programs/resubmitjob/' + data[i].program_id + '/' + data[i].job_id}"><svg class="asseticon asseticonadjust" height="512pt" viewBox="0 -10 512 511" width="512pt" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m512 264.5c0 55.285156-42.148438 100.914062-96 106.4375v-40.355469c31.726562-5.265625 56-32.886719 56-66.082031 0-36.945312-30.054688-67-67-67h-28v-35c0-67.269531-54.730469-122-122-122-62.785156 0-114.957031 47.019531-121.355469 109.375l-1.699219 16.566406-16.597656 1.328125c-42.25 3.382813-75.347656 39.28125-75.347656 81.730469 0 36.125 23.496094 66.835938 56 77.730469v41.464843c-54.820312-11.945312-96-60.84375-96-119.195312 0-30.867188 11.554688-60.324219 32.53125-82.941406 17.171875-18.515625 39.371094-31.09375 63.6875-36.320313 6.808594-33.640625 24.1875-64.347656 49.914062-87.703125 29.851563-27.105468 68.515626-42.035156 108.867188-42.035156 87.878906 0 159.636719 70.332031 161.941406 157.660156 53.402344 5.960938 95.058594 51.375 95.058594 106.339844zm-138 108c0-66.167969-53.832031-120-120-120s-120 53.832031-120 120c0 59.703125 43.828125 109.355469 101 118.488281v-40.789062c-34.96875-8.550781-61-40.132813-61-77.699219 0-44.113281 35.886719-80 80-80s80 35.886719 80 80c0 19.6875-7.160156 37.71875-19 51.660156v-36.660156h-40v104h104v-40h-34.773438c18.519532-21.121094 29.773438-48.765625 29.773438-79zm0 0"/></svg>&nbsp;   Resubmit</a>
                        
                        <a class="dropdown-item transcode-asset"  data-name="${data[i].name}" data-job-id="${data[i].job_id}" href="#" data-program-id="${data[i].program_id}"><svg class="asseticon asseticonadjust" height="512pt" viewBox="0 -10 512 511" width="512pt" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m512 264.5c0 55.285156-42.148438 100.914062-96 106.4375v-40.355469c31.726562-5.265625 56-32.886719 56-66.082031 0-36.945312-30.054688-67-67-67h-28v-35c0-67.269531-54.730469-122-122-122-62.785156 0-114.957031 47.019531-121.355469 109.375l-1.699219 16.566406-16.597656 1.328125c-42.25 3.382813-75.347656 39.28125-75.347656 81.730469 0 36.125 23.496094 66.835938 56 77.730469v41.464843c-54.820312-11.945312-96-60.84375-96-119.195312 0-30.867188 11.554688-60.324219 32.53125-82.941406 17.171875-18.515625 39.371094-31.09375 63.6875-36.320313 6.808594-33.640625 24.1875-64.347656 49.914062-87.703125 29.851563-27.105468 68.515626-42.035156 108.867188-42.035156 87.878906 0 159.636719 70.332031 161.941406 157.660156 53.402344 5.960938 95.058594 51.375 95.058594 106.339844zm-138 108c0-66.167969-53.832031-120-120-120s-120 53.832031-120 120c0 59.703125 43.828125 109.355469 101 118.488281v-40.789062c-34.96875-8.550781-61-40.132813-61-77.699219 0-44.113281 35.886719-80 80-80s80 35.886719 80 80c0 19.6875-7.160156 37.71875-19 51.660156v-36.660156h-40v104h104v-40h-34.773438c18.519532-21.121094 29.773438-48.765625 29.773438-79zm0 0"/></svg>&nbsp;   Retranscode</a>
                        
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="${BASEURL + 'programs/editasset/' + data[i].program_id + '/' + data[i].channel_id + '?vidUrl=' + data[i].recorded_video}"> <svg class="asseticon asseticonadjust" height="512pt" viewBox="0 0 512 512.00004" width="512pt" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m511.132812 79.929688c-.019531-21.390626-8.367187-41.488282-23.507812-56.59375-31.226562-31.15625-81.992188-31.113282-113.183594.117187l-322.207031 323.503906c-10.480469 10.472657-18.480469 23.4375-23.136719 37.496094l-.300781.914063-28.796875 126.632812 126.984375-28.429688.945313-.3125c14.0625-4.65625 27.035156-12.648437 37.542968-23.152343l322.25-323.542969c15.113282-15.132812 23.429688-35.246094 23.410156-56.632812zm-440.714843 375.34375-13.464844-13.472657 9.722656-42.765625 46.613281 46.640625zm389.003906-346.9375-312.847656 314.105468-56.652344-56.6875 214.300781-215.160156 32.632813 32.632812 28.261719-28.261718-32.691407-32.691406 30.402344-30.519532 32.75 32.75 28.261719-28.261718-32.808594-32.808594 11.707031-11.753906c15.605469-15.625 41.023438-15.648438 56.65625-.050782 7.578125 7.5625 11.757813 17.625 11.769531 28.332032.007813 10.710937-4.152343 20.777343-11.742187 28.375zm-249.164063 363.261718h300.875v39.96875h-340.707031zm0 0"/></svg>&nbsp;   Edit</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item del-asset" href="#" data-program-id="${data[i].program_id}"><svg class="asseticon asseticonadjust" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M276,431.933h-40v-209h40V431.933z M356,222.933h-40v209h40V222.933z M196,222.933h-40v209h40  V222.933z M472,183h-40v269c0,33.084-26.916,60-60,60H140c-33.084,0-60-26.916-60-60V183H40v-50.067c0-33.084,26.916-60,60-60h61V60 c0-33.084,26.916-60,60-60h70c33.084,0,60,26.916,60,60v12.933h61c33.084,0,60,26.916,60,60V183z M201,72.933h110V60 c0-11.028-8.972-20-20-20h-70c-11.028,0-20,8.972-20,20V72.933z M392,183H120v269c0,11.028,8.972,20,20,20h232 c11.028,0,20-8.972,20-20V183z M432,132.933c0-11.028-8.972-20-20-20H100c-11.028,0-20,8.972-20,20V143h352V132.933z"/></svg>&nbsp;   Delete</a>
                    </div>
                </div>
            </td>
        </tr>`;
                $('.program-list').append(rowHtml);

                //block link for only transcode service
                if(data[i].subJobTypes != null && data[i].subJobTypes.includes("TRANSCODE_DISCOVERY") && data[i].subJobTypes.length == 1){
                    console.log(data[i].subJobTypes+" block this link for transcode");
                    $(".asset-title").eq(i).find("a").attr("href", "#");
                }

            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
// Date sorting assending and decseending  Ends



function paginate() {
    console.log("paginate");
    changeviews_paginate = ``;
    var channel_val = $('#channelSelect').val();
    if(channel_val == 0){ // to get data from all channels
        channel_val = '';
    }
    var pageNo = initPagination.pageNo;
    var pageLimit = initPagination.pageLimit;

    $.ajax({
        //headers: { 'X-CSRF-Token': csrfToken },
        type: 'GET',
        url: BASEURL + 'programs/index?page=' + pageNo + '&limit=' + pageLimit + '&folder_ids=' + channel_val,
        dataType: 'json',
        beforeSend: function () {
        },
        success: function (res) {
            // console.log(res);
            var program_services = res.program_services;
            var data = res.data.list;
            $('.program-list').html("");

            if(data.length == 0 && data.length == null){
                    $('.pagination').hide();
                    $('.asset-list-table').hide();
                    $('.no-asset-div').html("<img src='./img/no-asset/no_asset.png' style='width:50%'><h5 class='no-asset'>Asset not found</h5>");
                    return;
                }else{
                    $('.no-asset-div').html('');
                    $('.asset-list-table').show();
                    $('.pagination').show();
                }


            for (i = 0; i < data.length; i++) {

                var program_name = '';
                if (data[i].name.length > 25) {
                    program_name = data[i].name.substring(0, 25) + '...';
                }
                else {
                    program_name = data[i].name;
                }
                var ext = data[i].input_video_path?splitByLastDot(data[i].input_video_path):"";
                var audio_thumb = "https://otttranscodeddata.blob.core.windows.net/ott-transcoded-data/audio.png";

                /*-------------Cricket Live Transcoding ----------------------*/
                var transcodingStatus;
                if(data[i].program_type == "cricket_live"){
                    transcodingStatus = "Transcoded";
                }else{
                    transcodingStatus = data[i].transcoding_status;
                }
                 /*-------------Cricket Live Transcoding Ends----------------------*/
                //  console.log(data[i]);
                // console.log(data[i].program_type);
                
                if(data[i].program_type == "football"){
                    changeviews_paginate = "sportsview";
                }else{
                    changeviews_paginate = "view";
                }

                // console.log(data[i].subJobTypes);

        // *********    JOB STATUS CODE BY SABBUL ***********

                if(data[i].jobStatus == "COMPLETED"){
                        status = "<i class='completed fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "PENDING"){
                       status = "<i class='pending fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "IN_PROGRESS"){
                        status = "<i class='inProgress fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "SUCCESS"){
                      status = "<i class='success fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "FAILED"){
                         status = "<i class='failed fa fa-circle'></i>";
                    }
                    else{ 
                        status = data[i].jobStatus;
                }

                  // QC STATUS
             
               if (data[i].qcStatus == "PENDING") {
                    qcStatus = "<i class='pending fa fa-check-circle'></i>";
                }else if (data[i].qcStatus == "IN_PROGRESS") {
                    qcStatus = "<i class='inProgress fa fa-check-circle'></i>";
                } else if (data[i].qcStatus == "COMPLETED") {
                    qcStatus = "<i class='success fa fa-check-circle'></i>";
                }else if (data[i].qcStatus == "FAILED") {
                    qcStatus = "<i class='failed fa fa-check-circle'></i>";
                } else {
                    qcStatus = data[i].qcStatus;
                }

                // SHOE DATE CODE BY SABBUL
                let startUTC =data[i].created;
                let onlyDate = moment(startUTC).format('DD');
                let month = moment(startUTC).format('MMM');
                let year = moment(startUTC).format('YYYY');
                let monthYears =month +" " +year;
                let timeMinu = moment(startUTC).format('kk:mm');
    
                var discoveryType = '';
                if (data[i].subJobTypes!= null){
                    discoveryType = data[i].subJobTypes.length > 0 ? checkSubJobType(data[i].subJobTypes, program_services) : '';
                }
                
                if (discoveryType == 'Blizzard-Overwatch' || discoveryType == 'Blizzard Overwatch') {
                	discoveryType = 'Blizzard';
                }

                
                if (data[i].userName === null) {
                	data[i].userName = MAIN_TENANT_NAME;
                }
               
                let  finalQCStatus= ' ';
                let toolTipShow;
                let  discoveryServiceTypes = data[i].subJobTypes; 
                let  isForSegmentQC=false;
                if(discoveryServiceTypes 
                    && (discoveryServiceTypes.includes('SEGMENTS_DISCOVERY') || discoveryServiceTypes.includes('PHYSICAL_CLIPS_DISCOVERY'))){
                   isForSegmentQC=true;
                }

                if(isForSegmentQC &&  data[i].qcStatus == "COMPLETED" && data[i].jobStatus == 'COMPLETED'){
                    status = qcStatus;
                    toolTipShow="Finalized";
                }else{
                    toolTipShow=data[i].jobStatus;
                }


                var rowHtml = `<tr>
                <td>
                    <div class="dateSetBox">
                        <p class="timeMinu">${timeMinu}</p>
                        <p class="onlyDate">${onlyDate}</p>
                        <p class="monthYears">${monthYears}</p>
                    </div>
                </td>
                <td>
                  <div data-programs-id="${data[i].program_id}" data-vid-url="${data[i].recorded_video}" data-fps="${data[i].fps}" data-df="${data[i].droppedFrame}" data-playbackSecurity="${data[i].playbackSecurity}">
                    <img src="${(ext == 'mp3') || (ext == 'wav')?BASEURL + 'img/audio.svg':BASEURL + 'img/play.png'}" alt="no img" class="play-imglistpage${(ext == 'mp3') || (ext == 'wav')?' play-audio':''}">
                    <img src="${(ext == 'mp3') || (ext == 'wav')?audio_thumb:(data[i].thumbnail ? data[i].thumbnail : BASEURL + 'img/no-thumbnail.png')}" alt="no img" class="thumbnail-img">
                  </div>
                </td>
                <td class='asset-title' scope="row"><a data-toggle="tooltip" data-placement="bottom" data-html="true" title="${data[i].name}" href="${BASEURL + 'programs/'+changeviews_paginate+'/'+ data[i].program_id + '/' + data[i].job_id}">${removeUnderscores(program_name)}</a><br><span  class="uploaded-name">Uploaded by : ${data[i].userName}</span</td>
                <td class="discoveryListAsset">
                    ${discoveryType}
                </td>

       
            
               <td class="jobStatusColor">
                   <a data-toggle="tooltip" data-placement="bottom" data-html="true" title="${toolTipShow}"><div class="status">${status}</div></a>
               </td>

                <td scope="row">
                <div class="ellipsisButton dropdown dropleft" id="ellipsisButtonlist">
                    <div class="ellipsisBTN dropdown-toggle" data-toggle="dropdown">
                         <img src="${BASEURL}/img/svg_icons/three-v.svg" class="compliancethreedot" alt="three dot">
                    </div>
                    <div class="dropdown-menu"> 
                        <a class="dropdown-item" href="${BASEURL + 'jobs/index?_d=' + data[i].job_id}"><svg version="1.1" class="asseticon asseticonadjust" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M302.045,0.142c-72.125,0-135.864,36.573-173.66,92.143L27.311,0L0.355,29.523l108.32,98.901 c-10.631,25.097-16.513,52.676-16.513,81.602c0,50.682,18.059,97.226,48.078,133.536L0.071,483.731L28.34,512l140.17-140.17 c36.311,30.019,82.854,48.078,133.536,48.078c115.73,0,209.883-94.154,209.883-209.883S417.776,0.142,302.045,0.142z M302.045,379.931c-93.686,0-169.905-76.22-169.905-169.905c0-18.342,2.933-36.009,8.335-52.571  c2.188-6.708,4.783-13.235,7.755-19.55c0.006-0.013,0.012-0.026,0.018-0.04c2.218-4.709,4.647-9.301,7.274-13.763 c0.034-0.057,0.068-0.115,0.102-0.172c0.864-1.463,1.747-2.913,2.653-4.349c30.118-47.705,83.301-79.462,143.768-79.462 c93.686,0,169.905,76.22,169.905,169.905S395.732,379.931,302.045,379.931z M423.878,164.874l-50.827-53.868l-70.037,70.036 c-10.022-7.528-22.468-11.994-35.94-11.994c-14.826,0-28.401,5.42-38.879,14.367l-39.783-36.323 c-6.97,12.535-11.924,26.334-14.427,40.962l33.963,31.01c-0.544,3.239-0.841,6.56-0.841,9.95c0,33.066,26.902,59.967,59.967,59.967 c16.018,0,31.077-6.238,42.402-17.563c11.327-11.327,17.564-26.385,17.563-42.403c0-4.761-0.575-9.389-1.628-13.832l46.805-46.805 l58.21,61.692c1.016-6.534,1.547-13.229,1.547-20.044C431.973,194.156,429.109,178.944,423.878,164.874z M281.209,243.15 c-3.775,3.775-8.795,5.854-14.134,5.854c-11.022,0-19.989-8.968-19.989-19.989c0-11.022,8.967-19.989,19.989-19.989 s19.989,8.967,19.989,19.989C287.063,234.355,284.984,239.374,281.209,243.15z"/></svg>&nbsp;&nbsp;  Job Status </a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="${BASEURL + 'programs/resubmitjob/' + data[i].program_id + '/' + data[i].job_id}"><svg class="asseticon asseticonadjust" height="512pt" viewBox="0 -10 512 511" width="512pt" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m512 264.5c0 55.285156-42.148438 100.914062-96 106.4375v-40.355469c31.726562-5.265625 56-32.886719 56-66.082031 0-36.945312-30.054688-67-67-67h-28v-35c0-67.269531-54.730469-122-122-122-62.785156 0-114.957031 47.019531-121.355469 109.375l-1.699219 16.566406-16.597656 1.328125c-42.25 3.382813-75.347656 39.28125-75.347656 81.730469 0 36.125 23.496094 66.835938 56 77.730469v41.464843c-54.820312-11.945312-96-60.84375-96-119.195312 0-30.867188 11.554688-60.324219 32.53125-82.941406 17.171875-18.515625 39.371094-31.09375 63.6875-36.320313 6.808594-33.640625 24.1875-64.347656 49.914062-87.703125 29.851563-27.105468 68.515626-42.035156 108.867188-42.035156 87.878906 0 159.636719 70.332031 161.941406 157.660156 53.402344 5.960938 95.058594 51.375 95.058594 106.339844zm-138 108c0-66.167969-53.832031-120-120-120s-120 53.832031-120 120c0 59.703125 43.828125 109.355469 101 118.488281v-40.789062c-34.96875-8.550781-61-40.132813-61-77.699219 0-44.113281 35.886719-80 80-80s80 35.886719 80 80c0 19.6875-7.160156 37.71875-19 51.660156v-36.660156h-40v104h104v-40h-34.773438c18.519532-21.121094 29.773438-48.765625 29.773438-79zm0 0"/></svg>&nbsp;   Resubmit</a>
                        
                        <a class="dropdown-item transcode-asset"  data-name="${data[i].name}" data-job-id="${data[i].job_id}" href="#" data-program-id="${data[i].program_id}"><svg class="asseticon asseticonadjust" height="512pt" viewBox="0 -10 512 511" width="512pt" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m512 264.5c0 55.285156-42.148438 100.914062-96 106.4375v-40.355469c31.726562-5.265625 56-32.886719 56-66.082031 0-36.945312-30.054688-67-67-67h-28v-35c0-67.269531-54.730469-122-122-122-62.785156 0-114.957031 47.019531-121.355469 109.375l-1.699219 16.566406-16.597656 1.328125c-42.25 3.382813-75.347656 39.28125-75.347656 81.730469 0 36.125 23.496094 66.835938 56 77.730469v41.464843c-54.820312-11.945312-96-60.84375-96-119.195312 0-30.867188 11.554688-60.324219 32.53125-82.941406 17.171875-18.515625 39.371094-31.09375 63.6875-36.320313 6.808594-33.640625 24.1875-64.347656 49.914062-87.703125 29.851563-27.105468 68.515626-42.035156 108.867188-42.035156 87.878906 0 159.636719 70.332031 161.941406 157.660156 53.402344 5.960938 95.058594 51.375 95.058594 106.339844zm-138 108c0-66.167969-53.832031-120-120-120s-120 53.832031-120 120c0 59.703125 43.828125 109.355469 101 118.488281v-40.789062c-34.96875-8.550781-61-40.132813-61-77.699219 0-44.113281 35.886719-80 80-80s80 35.886719 80 80c0 19.6875-7.160156 37.71875-19 51.660156v-36.660156h-40v104h104v-40h-34.773438c18.519532-21.121094 29.773438-48.765625 29.773438-79zm0 0"/></svg>&nbsp;   Retranscode</a>
                        
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="${BASEURL + 'programs/editasset/' + data[i].program_id + '/' + data[i].channel_id + '?vidUrl=' + data[i].recorded_video}"> <svg class="asseticon asseticonadjust" height="512pt" viewBox="0 0 512 512.00004" width="512pt" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m511.132812 79.929688c-.019531-21.390626-8.367187-41.488282-23.507812-56.59375-31.226562-31.15625-81.992188-31.113282-113.183594.117187l-322.207031 323.503906c-10.480469 10.472657-18.480469 23.4375-23.136719 37.496094l-.300781.914063-28.796875 126.632812 126.984375-28.429688.945313-.3125c14.0625-4.65625 27.035156-12.648437 37.542968-23.152343l322.25-323.542969c15.113282-15.132812 23.429688-35.246094 23.410156-56.632812zm-440.714843 375.34375-13.464844-13.472657 9.722656-42.765625 46.613281 46.640625zm389.003906-346.9375-312.847656 314.105468-56.652344-56.6875 214.300781-215.160156 32.632813 32.632812 28.261719-28.261718-32.691407-32.691406 30.402344-30.519532 32.75 32.75 28.261719-28.261718-32.808594-32.808594 11.707031-11.753906c15.605469-15.625 41.023438-15.648438 56.65625-.050782 7.578125 7.5625 11.757813 17.625 11.769531 28.332032.007813 10.710937-4.152343 20.777343-11.742187 28.375zm-249.164063 363.261718h300.875v39.96875h-340.707031zm0 0"/></svg>&nbsp;   Edit</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item del-asset" data-name="${data[i].name}" href="#" data-program-id="${data[i].program_id}"><svg class="asseticon asseticonadjust" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M276,431.933h-40v-209h40V431.933z M356,222.933h-40v209h40V222.933z M196,222.933h-40v209h40  V222.933z M472,183h-40v269c0,33.084-26.916,60-60,60H140c-33.084,0-60-26.916-60-60V183H40v-50.067c0-33.084,26.916-60,60-60h61V60 c0-33.084,26.916-60,60-60h70c33.084,0,60,26.916,60,60v12.933h61c33.084,0,60,26.916,60,60V183z M201,72.933h110V60 c0-11.028-8.972-20-20-20h-70c-11.028,0-20,8.972-20,20V72.933z M392,183H120v269c0,11.028,8.972,20,20,20h232 c11.028,0,20-8.972,20-20V183z M432,132.933c0-11.028-8.972-20-20-20H100c-11.028,0-20,8.972-20,20V143h352V132.933z"/></svg>&nbsp;   Delete</a>
                    </div>
                </div>
            </td>
        </tr>`;
                $('.program-list').append(rowHtml);

                //block link for only transcode service

                if(data[i].subJobTypes != null && data[i].subJobTypes.includes("TRANSCODE_DISCOVERY") && data[i].subJobTypes.length == 1){
                    console.log(data[i].subJobTypes+" block this link for transcode");
                    $(".asset-title").eq(i).find("a").attr("href", "#");
                }
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
// Pagintation Ends







$(document).on('click', '.transcode-asset', function(){
    $("#jobTranscodeModal").modal('show');
    var program_salt = $(this).attr('data-program-id');
    var jobid = $(this).attr('data-job-id');
    var assetName = $(this).attr('data-name');
    var $_self = this;
    $('#modalTranscodeAsset').off('click').on('click',{salt: program_salt, jobid: jobid, param2: $_self}, ajaxtranscodeassetFn);
});




function ajaxtranscodeassetFn(e){
	
	$.ajax({
        //headers: { 'X-CSRF-Token': csrfToken },
        url: BASEURL + 'programs/retranscode',
        data: {jobid:e.data.jobid, program_salt: e.data.param1, services:[{'SERVICE':'TRANSCODE_DISCOVERY', 'TASKS': ['TRANSCODE']}] },
        type: 'GET',
        dataType: 'json',
        error: function (xhr) {
            console.log(xhr);
        }
    }).done(function(res){
        //$(e.data.param2).parents('tr').remove();
        $("#jobTranscodeModal").modal('hide');
        $("#jobTranscodedModal").modal('show');
        setInterval(function(){ $("#jobTranscodedModal").modal('hide'); }, 1000);
        //console.log(res);
    });
    
}



// Delete Asset
$(document).on('click', '.del-asset', function(){
    $("#jobDeleteModal").modal('show');
    var program_salt = $(this).attr('data-program-id');
    var assetName = $(this).attr('data-name');
    $(".assetsName").text(assetName);

    var $_self = this;
    // console.log($(this).parents('tr').find('.asset-title').text());
    // var findText = $(this).parents('tr').find('.asset-title').text();
    // $('#jobDeleteModal').find('.modal-title').html("Asset: "+findText);
    $('#modalDeleteAsset').off('click').on('click',{param1: program_salt, param2: $_self}, ajaxdeleteassetFn);
});
function ajaxdeleteassetFn(e){
        $.ajax({
            //headers: { 'X-CSRF-Token': csrfToken },
            url: BASEURL + 'programs/deleteasset',
            data: {program_salt: e.data.param1},
            type: 'GET',
            dataType: 'json',
            error: function (xhr) {
                console.log(xhr);
            }
        }).done(function(res){
            $(e.data.param2).parents('tr').remove();
            $("#jobDeleteModal").modal('hide');
            $("#jobDeletedModal").modal('show');
            setInterval(function(){ $("#jobDeletedModal").modal('hide'); }, 1000);
            console.log(res);
        });
}
// Channel Filter Starts
$('#channelSelect').on('change', function () {
    var channel_id = this.value;
    programContext.callAjax(channel_id);
    var urlParam = {};
    urlParam.key = 'chId';
    urlParam.value = channel_id;
    updateUrl(urlParam);
});

var programContext = {
    
    callAjax(channel_id) {
        changeviews_change = ``;
        if(channel_id == 0){ // to get data from all channels
            channel_id = '';
        }
        let pageLimit = initPagination.pageLimit;
        $.ajax({
            //headers: { 'X-CSRF-Token': csrfToken },
            url: BASEURL + 'rest/index',
            data: { 'action': 'getProgramList', 'limit': pageLimit , 'folder_ids': channel_id },
            type: 'GET',
            dataType: 'json',
            error: function (xhr) {
                console.log(xhr);
            }
        }).done(function (res) {
            // console.log(res);
            var program_services = res.data.program_services;
            console.log(program_services);
            var count = res.data.data.count;
            var data = res.data.data.list;
            // console.log(data);

            $('.program-list').html("");
            if(data.length == 0){
                $('.pagination').hide();
                $('.asset-list-table').hide();
                $('.no-asset-div').html("<img src='https://ovptranscodeddata.azureedge.net/images/n1a4vkASCRr6-1554272758324-8ROqvDXxdvqC.png' height='auto' width='100%'><h5 class='no-asset'>No Asset found</h5>");
                return;
            }else{
                $('.no-asset-div').html('');
                $('.asset-list-table').show();
                $('.pagination').show();
            }

            for (i = 0; i < data.length; i++) {

                var program_name = '';
                if (data[i].name.length > 25) {
                    program_name = data[i].name.substring(0, 25) + '...';
                }
                else {
                    program_name = data[i].name;
                }

                var ext = data[i].input_video_path?splitByLastDot(data[i].input_video_path):"";
                var audio_thumb = "https://otttranscodeddata.blob.core.windows.net/ott-transcoded-data/audio.png";
                /*-------------Cricket Live Transcoding ----------------------*/
                var transcodingStatus;
                if(data[i].program_type == "cricket_live"){
                    transcodingStatus = "Transcoded";
                }else{
                    transcodingStatus = data[i].transcoding_status;
                }
                /*-------------Cricket Live Transcoding Ends----------------------*/
                

                if(data[i].program_type == "football"){
                    changeviews_change = "sportsview";
                }else{
                    changeviews_change = "view";
                }


                // *********    JOB STATUS CODE BY SABBUL ***********

                if(data[i].jobStatus == "COMPLETED"){
                        status = "<i class='completed fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "PENDING"){
                       status = "<i class='pending fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "IN_PROGRESS"){
                        status = "<i class='inProgress fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "SUCCESS"){
                      status = "<i class='success fa fa-circle'></i>";
                    }
                    else if(data[i].jobStatus == "FAILED"){
                         status = "<i class='failed fa fa-circle'></i>";
                    }
                    else{ 
                        status = data[i].jobStatus;
                }

             // QC STATUS
             
               if (data[i].qcStatus == "PENDING") {
                    qcStatus = "<i class='pending fa fa-check-circle'></i>";
                }else if (data[i].qcStatus == "IN_PROGRESS") {
                    qcStatus = "<i class='inProgress fa fa-check-circle'></i>";
                } else if (data[i].qcStatus == "COMPLETED") {
                    qcStatus = "<i class='success fa fa-check-circle'></i>";
                }else if (data[i].qcStatus == "FAILED") {
                    qcStatus = "<i class='failed fa fa-check-circle'></i>";
                } else {
                    qcStatus = data[i].qcStatus;
                }


                // SHOE DATE CODE BY SABBUL
                let startUTC =data[i].created;
                let onlyDate = moment(startUTC).format('DD');
                let month = moment(startUTC).format('MMM');
                let year = moment(startUTC).format('YYYY');
                let monthYears =month +" " +year;
                let timeMinu = moment(startUTC).format('kk:mm');



                 var discoveryType = '';
                if (data[i].subJobTypes!= null){
                    discoveryType = data[i].subJobTypes.length > 0 ? checkSubJobType(data[i].subJobTypes, program_services) : '';
                }
                
                if (discoveryType == 'Blizzard-Overwatch' || discoveryType == 'Blizzard Overwatch') {
                	discoveryType = 'Blizzard';
                }
                
                if (data[i].userName === null) {
                	data[i].userName = MAIN_TENANT_NAME;
                }

                let  finalQCStatus= ' ';
                let toolTipShow;
                let  discoveryServiceTypes = data[i].subJobTypes; 
                let  isForSegmentQC=false;
                if(discoveryServiceTypes 
                    && (discoveryServiceTypes.includes('SEGMENTS_DISCOVERY') || discoveryServiceTypes.includes('PHYSICAL_CLIPS_DISCOVERY'))){
                   isForSegmentQC=true;
                }
                if(isForSegmentQC &&  data[i].qcStatus == "COMPLETED" && data[i].jobStatus == 'COMPLETED'){
                    status = qcStatus;
                    toolTipShow="Finalized";
                   
                }else{
                    toolTipShow=data[i].jobStatus;
                }
                   
                var rowHtml = `<tr>
                <td>
                    <div class="dateSetBox">
                    <p class="timeMinu">${timeMinu}</p>
                    <p class="onlyDate">${onlyDate}</p>
                    <p class="monthYears">${monthYears}</p>
                    </div>
                </td>
                <td>
                  <div data-programs-id="${data[i].program_id}" data-vid-url="${data[i].recorded_video} data-fps="${data[i].fps}" data-df="${data[i].droppedFrame}" data-playbackSecurity="${data[i].playbackSecurity}">
                    <img src="${(ext == 'mp3') || (ext == 'wav')?BASEURL + 'img/audio.svg':BASEURL + 'img/play.png'}" alt="no img" class="play-imglistpage${(ext == 'mp3') || (ext == 'wav')?' play-audio':''}">
                    <img src="${(ext == 'mp3') || (ext == 'wav')?audio_thumb:(data[i].thumbnail ? data[i].thumbnail : BASEURL + 'img/no-thumbnail.png')}" alt="no img" class="thumbnail-img">
                  </div>
                </td>
                <td class='asset-title' scope="row"><a data-toggle="tooltip" data-placement="bottom" data-html="true" title="${data[i].name}" href="${BASEURL + 'programs/'+changeviews_paginate+'/'+ data[i].program_id + '/' + data[i].job_id}">${removeUnderscores(program_name)}</a><br><span  class="uploaded-name">Uploaded by : ${data[i].userName}</span></td>
                <td class="discoveryListAsset">${discoveryType}</td>
    

               <td class="jobStatusColor">
                   <a data-toggle="tooltip" data-placement="bottom" data-html="true" title="${toolTipShow}"><div class="status">${status}</div></a>
               </td>
                    <td scope="row">
                        <div class="ellipsisButton dropdown dropleft" id="ellipsisButtonlist">
                            <div class="ellipsisBTN dropdown-toggle" data-toggle="dropdown">
                                 <img src="${BASEURL}/img/svg_icons/three-v.svg" class="compliancethreedot" alt="three dot">
                            </div>
                            <div class="dropdown-menu">
                                <a class="dropdown-item" href="${BASEURL + 'jobs/index?_d=' + data[i].job_id}"><img src="${BASEURL + 'img/view.png'}" alt="view img" class="thumbnail_view-img">&nbsp;&nbsp;  Job Status </a>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="${BASEURL + 'programs/resubmitjob/' + data[i].program_id + '/' + data[i].job_id}"> <img src="${BASEURL + 'img/refresh.svg'}" alt="refresh img" class="thumbnail_view-img">&nbsp;   Resubmit</a>
                                
                                <a class="dropdown-item transcode-asset"  data-name="${data[i].name}" data-job-id="${data[i].job_id}" href="#" data-program-id="${data[i].program_id}"><svg class="asseticon asseticonadjust" height="512pt" viewBox="0 -10 512 511" width="512pt" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m512 264.5c0 55.285156-42.148438 100.914062-96 106.4375v-40.355469c31.726562-5.265625 56-32.886719 56-66.082031 0-36.945312-30.054688-67-67-67h-28v-35c0-67.269531-54.730469-122-122-122-62.785156 0-114.957031 47.019531-121.355469 109.375l-1.699219 16.566406-16.597656 1.328125c-42.25 3.382813-75.347656 39.28125-75.347656 81.730469 0 36.125 23.496094 66.835938 56 77.730469v41.464843c-54.820312-11.945312-96-60.84375-96-119.195312 0-30.867188 11.554688-60.324219 32.53125-82.941406 17.171875-18.515625 39.371094-31.09375 63.6875-36.320313 6.808594-33.640625 24.1875-64.347656 49.914062-87.703125 29.851563-27.105468 68.515626-42.035156 108.867188-42.035156 87.878906 0 159.636719 70.332031 161.941406 157.660156 53.402344 5.960938 95.058594 51.375 95.058594 106.339844zm-138 108c0-66.167969-53.832031-120-120-120s-120 53.832031-120 120c0 59.703125 43.828125 109.355469 101 118.488281v-40.789062c-34.96875-8.550781-61-40.132813-61-77.699219 0-44.113281 35.886719-80 80-80s80 35.886719 80 80c0 19.6875-7.160156 37.71875-19 51.660156v-36.660156h-40v104h104v-40h-34.773438c18.519532-21.121094 29.773438-48.765625 29.773438-79zm0 0"/></svg>&nbsp;   Retranscode</a>
                        
                        		<div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="${BASEURL + 'programs/editasset/' + data[i].program_id + '/' + data[i].channel_id + '?vidUrl=' + data[i].recorded_video}"> <img src="${BASEURL + 'img/editicon.svg'}" alt="refresh img" class="thumbnail_view-img">&nbsp;   Edit</a>
                                <div class="dropdown-divider"></div>
                        <a class="dropdown-item del-asset" href="#" data-program-id="${data[i].program_id}"> <img src="${BASEURL + 'img/delete.svg'}" alt="refresh img" class="thumbnail_view-img">&nbsp;   Delete</a>
                            </div>
                        </div>
                    </td>
                </tr>`;
                $('.program-list').append(rowHtml);
                //block link for only transcode service
                if(data[i].subJobTypes != null && data[i].subJobTypes.includes("TRANSCODE_DISCOVERY") && data[i].subJobTypes.length == 1){
                    console.log(data[i].subJobTypes+" block this link for transcode");
                    $(".asset-title").eq(i).find("a").attr("href", "#");
                }
            }
            console.log(count);
            $('#progCount').val(count);
            initPagination.index();
            //$('.pag-btn:first').parent().addClass('active');
        });

    }
};
// Channel Filter Ends

$(document).ready(function () {
    initPagination.index();

    // $(document).on('click', '.pag-btn', function () {
    //     $(this).parent().siblings().removeClass('active');
    //     $(this).parent().addClass('active');
    //     pageNo = $(this).attr('data-pageno');
    //     initPagination.pageNo = pageNo;
    //     paginate();
    //     var urlParam = {};
    //         urlParam.key = 'pg';
    //         urlParam.value = pageNo;
    //         updateUrl(urlParam);
    // });

    $(document).on('click', '.search-pag-btn', function () {
        $(this).parent().siblings().removeClass('active');
        $(this).parent().addClass('active');
        pageNo = $(this).attr('data-pageno');
        initPagination.pageNo = pageNo;
        setSearchParams();
    });

    $('#noOfProgSelect').on('change', function(){
        var noOfProgPerPage = this.value;
        initPagination.pageLimit = noOfProgPerPage;
        initPagination.index();
        paginate();

        console.log(noOfProgPerPage);
    });

    // Ajax Loader start
    $(document).ajaxStart(function () {
        $("#wait").css("display", "block");
    });
    $(document).ajaxComplete(function () {
        $("#wait").css("display", "none");
    });
    // Ajax Loader end

    // FILTER THE ASSET LIST ACCORDING TO URL PARAMETERS
    
    function filterAsset(){
        var c = window.location.href.indexOf('chId');
        var s = window.location.href.indexOf('srch');
        var p = window.location.href.indexOf('pg');

        // if page number and channel id both are present
        if(p>0 && c>0){
            
            var pageNo = $.urlParam('pg');
            var channel_id = $.urlParam('chId');
            $('#channelSelect').val(channel_id);
            
            initPagination.pageNo = pageNo;
            let dfd = $.Deferred();
            let promiseObj = dfd.promise();
            promiseObj.then(programContext.callAjax(channel_id)).then(setTimeout(function(){
                //paginate();
                $('.pag-btn[data-pageno="'+pageNo+'"]').click();
            },700));
            dfd.resolve();
            
        }

        // if only page no is present 
        if(p>0){
            var pageNo = $.urlParam('pg');
            initPagination.pageNo = pageNo;
            $('.pag-btn[data-pageno="'+pageNo+'"]').click();
        }

        // if only channel id is present 
        if(c>0 && p<0){
            var channel_id = $.urlParam('chId');
            $('#channelSelect').val(channel_id);
            programContext.callAjax(channel_id);
        }
    }

    filterAsset();

    GlobalSearchObj.init_events();
    getProjectList();

});

function setSearchParams(initializePagination = false){
    
    let searchText = $('#assetSearchBox').val();
    var urlParam = {};
        urlParam.key = 'srch';
        urlParam.value = searchText;
        //updateUrl(urlParam);
    searchText = encodeURIComponent(searchText);
    let requestData = {};
    requestData.query = searchText;
    requestData.limit = initPagination.pageLimit;
    requestData.page = initPagination.pageNo;
    requestData.initializePagination = initializePagination;
    callSearchApi(requestData);
}

function callSearchApi(requestData){
    console.log('enter pressed');
    $.ajax({
        //headers: { 'X-CSRF-Token': csrfToken },
        url: BASEURL + 'programs/getSearchResult',
        data: requestData,
        type: 'GET',
        dataType: 'json',
        error: function (xhr) {
            console.log(xhr);
        }
    }).done(function (res) {
        console.log(res);
        setSearch(res,requestData);  
    });
}

function setSearch(res,requestData){
    changeviews_search = ``;
    var searchRes  = res.list;
    $('.program-list').html("");
    if(res.list.length == 0){
        $('.pagination').hide();
        $('.asset-list-table').hide();
        $('.no-asset-div').html("<img src='./img/no-asset/no_asset.png' style='width:50%'><h5 class='no-asset'>Asset not found</h5>");
        return;
    }else{
        $('.no-asset-div').html('');
        $('.asset-list-table').show();
        $('.pagination').show();
    }
    
    for(let i in searchRes){
        
        data = searchRes[i];
        var program_name = '';
        if (data.name.length > 25) {
            program_name = data.name.substring(0, 25) + '...';
        }
        else {
            program_name = data.name;
        }
        var ext = data.input_video_path?splitByLastDot(data.input_video_path):"";
        var audio_thumb = "https://otttranscodeddata.blob.core.windows.net/ott-transcoded-data/audio.png";

        /*-------------Cricket Live Transcoding ----------------------*/
        var transcodingStatus;

                // if(data[i].program_type == "cricket_live"){
                //     transcodingStatus = "Transcoded";
                // }else{
                // transcodingStatus = data[i].transcoding_status;
                // }

        
        /*-------------Cricket Live Transcoding Ends----------------------*/
        if(data.program_type == "football"){
            changeviews_search = "sportsview";
        }else{
            changeviews_search = "view";
        }
        
        // *********    JOB STATUS CODE BY SABBUL ***********

                if(data.jobStatus == "COMPLETED"){
                        status = "<i class='completed fa fa-circle'></i>";
                    }
                    else if(data.jobStatus == "PENDING"){
                       status = "<i class='pending fa fa-circle'></i>";
                    }
                    else if(data.jobStatus == "IN_PROGRESS"){
                        status = "<i class='inProgress fa fa-circle'></i>";
                    }
                    else if(data.jobStatus == "SUCCESS"){
                      status = "<i class='success fa fa-circle'></i>";
                    }
                    else if(data.jobStatus == "FAILED"){
                         status = "<i class='failed fa fa-circle'></i>";
                    }
                    else{ 
                        status = data.jobStatus;
                }

                 // QC STATUS
             
               if (data.qcStatus == "PENDING") {
                    qcStatus = "<i class='pending fa fa-check-circle'></i>";
                }else if (data.qcStatus == "IN_PROGRESS") {
                    qcStatus = "<i class='inProgress fa fa-check-circle'></i>";
                } else if (data.qcStatus == "COMPLETED") {
                    qcStatus = "<i class='success fa fa-check-circle'></i>";
                }else if (data.qcStatus == "FAILED") {
                    qcStatus = "<i class='failed fa fa-check-circle'></i>";
                } else {
                    qcStatus = data.qcStatus;
                }

                // SHOE DATE CODE BY SABBUL
                let startUTC =data.created;
                let onlyDate = moment(startUTC).format('DD');
                let month = moment(startUTC).format('MMM');
                let year = moment(startUTC).format('YYYY');
                let monthYears =month +" " +year;
                let timeMinu = moment(startUTC).format('kk:mm');

                var discoveryType = '';
                if (data.subJobTypes!= null){
                    discoveryType = data.subJobTypes.length > 0 ? checkSubJobType(data.subJobTypes, res.program_services) : '';
                }
                
                if (discoveryType == 'Blizzard-Overwatch' || discoveryType == 'Blizzard Overwatch') {
                	discoveryType = 'Blizzard';
                }
                
                if (data.userName === null) {
                	data.userName = MAIN_TENANT_NAME;
                }
              
                let  finalQCStatus= ' ';
                let toolTipShow;
                let  discoveryServiceTypes = data.subJobTypes; 
                let  isForSegmentQC=false;
                if(discoveryServiceTypes 
                    && (discoveryServiceTypes.includes('SEGMENTS_DISCOVERY') || discoveryServiceTypes.includes('PHYSICAL_CLIPS_DISCOVERY'))){
                   isForSegmentQC=true;
                }
                 if(isForSegmentQC &&  data.qcStatus == "COMPLETED" && data.jobStatus == 'COMPLETED'){
                    status = qcStatus;
                    toolTipShow="Finalized";
                   
                }else{
                    toolTipShow=data.jobStatus;
                }



                var rowHtml = `<tr>
                <td>
                    <div class="dateSetBox">
                        <p class="timeMinu">${timeMinu}</p>
                        <p class="onlyDate">${onlyDate}</p>
                        <p class="monthYears">${monthYears}</p>
                    </div>
                </td>
                <td>
                <div data-programs-id="${data.program_id}" data-vid-url="${data.recorded_video}"  data-fps="${data.fps}" data-df="${data.droppedFrame}" data-playbackSecurity="${data.playbackSecurity}">
                    <img src="${(ext == 'mp3') || (ext == 'wav')?BASEURL + 'img/audio.svg':BASEURL + 'img/play.png'}" alt="no img" class="play-imglistpage${(ext == 'mp3') || (ext == 'wav')?' play-audio':''}">
                    <img src="${(ext == 'mp3') || (ext == 'wav')?audio_thumb:(data.thumbnail ? data.thumbnail : BASEURL + 'img/no-thumbnail.png')}" alt="no img" class="thumbnail-img">
                </div>
               </td>
               <td class='asset-title' scope="row"><a data-toggle="tooltip" data-placement="bottom" data-html="true" title="${data.name}" href="${BASEURL + 'programs/'+changeviews_search+'/' + data.program_id + '/' + data.job_id}">${removeUnderscores(program_name)}</a><br><span class="uploaded-name">Uploaded by:${data.userName}</span></td>
                <td class="discoveryListAsset">${discoveryType}</td>
            
             
      

               <td class="jobStatusColor">
                   <a data-toggle="tooltip" data-placement="bottom" data-html="true" title="${toolTipShow}"><div class="status">${status}</div></a>
               </td>

            <td scope="row">
                <div class="ellipsisButton dropdown dropleft" id="ellipsisButtonlist">
                    <div class="ellipsisBTN dropdown-toggle" data-toggle="dropdown">
                         <img src="${BASEURL}/img/svg_icons/three-v.svg" class="compliancethreedot" alt="three dot">
                    </div>
                    <div class="dropdown-menu">
                        <a class="dropdown-item" href="${BASEURL + 'jobs/index?_d=' + data.job_id}"><img src="${BASEURL + 'img/view.png'}" alt="view img" class="thumbnail_view-img">&nbsp;&nbsp;  Job Status </a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="${BASEURL + 'programs/resubmitjob/' + data.program_id + '/' + data.job_id}"> <img src="${BASEURL + 'img/refresh.svg'}" alt="refresh img" class="thumbnail_view-img">&nbsp;   Resubmit</a>
                        <a class="dropdown-item transcode-asset"  data-name="${data.name}" data-job-id="${data.job_id}" href="#" data-program-id="${data.program_id}"><svg class="asseticon asseticonadjust" height="512pt" viewBox="0 -10 512 511" width="512pt" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="m512 264.5c0 55.285156-42.148438 100.914062-96 106.4375v-40.355469c31.726562-5.265625 56-32.886719 56-66.082031 0-36.945312-30.054688-67-67-67h-28v-35c0-67.269531-54.730469-122-122-122-62.785156 0-114.957031 47.019531-121.355469 109.375l-1.699219 16.566406-16.597656 1.328125c-42.25 3.382813-75.347656 39.28125-75.347656 81.730469 0 36.125 23.496094 66.835938 56 77.730469v41.464843c-54.820312-11.945312-96-60.84375-96-119.195312 0-30.867188 11.554688-60.324219 32.53125-82.941406 17.171875-18.515625 39.371094-31.09375 63.6875-36.320313 6.808594-33.640625 24.1875-64.347656 49.914062-87.703125 29.851563-27.105468 68.515626-42.035156 108.867188-42.035156 87.878906 0 159.636719 70.332031 161.941406 157.660156 53.402344 5.960938 95.058594 51.375 95.058594 106.339844zm-138 108c0-66.167969-53.832031-120-120-120s-120 53.832031-120 120c0 59.703125 43.828125 109.355469 101 118.488281v-40.789062c-34.96875-8.550781-61-40.132813-61-77.699219 0-44.113281 35.886719-80 80-80s80 35.886719 80 80c0 19.6875-7.160156 37.71875-19 51.660156v-36.660156h-40v104h104v-40h-34.773438c18.519532-21.121094 29.773438-48.765625 29.773438-79zm0 0"/></svg>&nbsp;   Retranscode</a>
                        
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="${BASEURL + 'programs/editasset/' + data.program_id + '/' + data.channel_id + '?vidUrl=' + data.recorded_video}"> <img src="${BASEURL + 'img/editicon.svg'}" alt="refresh img" class="thumbnail_view-img">&nbsp;   Edit</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item del-asset" href="#" data-program-id="${data.program_id}"> <img src="${BASEURL + 'img/delete.svg'}" alt="refresh img" class="thumbnail_view-img">&nbsp;   Delete</a>
                    </div>
                </div>
            </td>
        </tr>`;
        $('.program-list').append(rowHtml);
        //block link for only transcode service
        if(data.subJobTypes && data.subJobTypes.includes("TRANSCODE_DISCOVERY") && data.subJobTypes.length == 1){
            console.log(data.subJobTypes+" block this link for transcode");
            $(".asset-title").eq(i).find("a").attr("href", "#");
        }
    }
    console.log(res.count);
    $('#progCount').val(res.count);
    if(requestData.initializePagination){
        initPagination.initSearchPagination();
        // initPagination.initSearchPagination();
        //$('.search-pag-btn:first').parent().addClass('active');
    }
    //initPagination.initSearchPagination();
    //$('.search-pag-btn:first').parent().addClass('active');
    //console.log(data.created);
}
    //console.log(data);
// Asset Search Ends


//SHOW PLAYER IN POP UP
$(document).on('click', '.play-imglistpage', function(){
    $('#indexPlayerPopup .modal-body').html('');
    let params = {};
    // params.start = $(this).parent().attr("data-start");
    // params.end = $(this).parent().attr("data-end");
    params.program_id = $(this).parent().attr("data-programs-id");
    params.poster = $(this).next("img").attr("src");
    params.video_url = $(this).parent().attr("data-vid-url");
    params.fps = $(this).parent().attr("data-fps");
    params.df = $(this).parent().attr("data-df");
    params.playbackSecurity = $(this).parent().attr("data-playbackSecurity");
    loadVideoPopup(params);
});

function loadVideoPopup(params) {
        if(params.hasSegments){
            var src = `${PLAYERURL}?id=${params.program_id}&tl_s=${params.start}&tl_e=${params.end}&poster=${params.poster}&video_url=${params.video_url}&has_segment=${params.hasSegments}&fps=${params.fps}&df=${params.df}&playbackSecurity=${params.playbackSecurity}`;
        }else{
            var src = `${PLAYERURL}?id=${params.program_id}&tl_s=${params.start}&tl_e=${params.end}&poster=${params.poster}&video_url=${params.video_url}&program_type=general_entertainment&fps=${params.fps}&df=${params.df}&playbackSecurity=${params.playbackSecurity}`;
        }
        let domFrame = document.createElement('iframe');
        domFrame.setAttribute('src', src);
        domFrame.setAttribute('scrolling', 'no');

        let width = 100;
        let height = 520;

        $(domFrame).css({ "height": height + "px",  "width": width + "%" , "border": "none"});
        $('#indexPlayerPopup .modal-body').html(domFrame);
        $('#indexPlayerPopup').modal('show');
    }

    // Stop video on modal close event
    $('#indexPlayerPopup').on('hidden.bs.modal', function () {
        $('#indexPlayerPopup .modal-body').html('');
    })

// UPDATE URL PARAMETERS

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null) {
       return null;
    }
    return decodeURI(results[1]) || 0;
}

function updateUrl(param){
    // var currentUrl = window.location.href;
    // var parsedUrl = $.url(currentUrl);
    
    var q = window.location.href.indexOf(param.key);
    if(q<0){ //if parameter is NOT presenet in url
        if(window.location.href.includes('?')) {
            var url = window.location.href+"&"+param.key+'='+param.value;
        }else{
            var url = window.location.href+"?"+param.key+'='+param.value;
        }
          
    } else{ //if parameter is ALREADY exist in the url
        var oldValue = $.urlParam(param.key);
        var url = location.href.replace(param.key+'='+oldValue, param.key+'='+param.value);
    }
    history.replaceState(null, null, url);
    // window.history.pushState({}, document.title, "/" + url);
    //  window.location.href = url;
}

// To get the extension of file
function splitByLastDot(text) {
    var index = text.lastIndexOf('.');
    return text.slice(index + 1);
}




// CLEAR INPUT TEXT FRON ASSETS PAGE

$('.has-clear input[type="text"]').on('input propertychange', function() {
  var $this = $(this);
  var visible = Boolean($this.val());
  $this.siblings('.form-control-clear').toggleClass('hidden', !visible);
}).trigger('propertychange');

$('.form-control-clear').click(function() {
    $('.searchbtn').attr('disabled',true);
  $(this).siblings('input[type="text"]').val('')
    .trigger('propertychange').focus();
     setSearchParams(initializePagination);
     
});

// RESET SELECTD CHENNAL VALUES

$(document).ready(function(){
  $('.form-control-clear').click(function() {
        $('#channelSelect').prop('selectedIndex',0);
    })
});

$(document).ready(function(){
    $('.searchbtn').attr('disabled',true);
    $('#assetSearchBox').keyup(function(){
        if($(this).val().length !=0){
            $('.searchbtn').attr('disabled', false);  
        }
        else{
            $('.searchbtn').attr('disabled',true);
             setSearchParams(initializePagination);
        }
    });
});


// Enable global search page in UI

// $(document).ready(function(e){
//   "use strict";
//   $('.search-panel').each( function() {
//     var to = $(this).data('search').toString();
//     var text = $(this).find('[data-search="' + to + '"]').html();
//     $(this).find('button span.search_by').html(text);
//   });
  
//   $('.search-panel li a').on('click', function(e){
//     var sp = $(this).closest('.search-panel');
//     var to = $(this).html();
//     var text = $(this).html();
//     sp.data('search', to);
//     console.log(sp.find('.search_by'));
//     sp.find('button span.search_by').html(text);
//   });
// });

/**
 * Global Search
 */
var GlobalSearchObj = {
    searchRequestCount: 0,
    searchRequestTime: 0,
    search_all_asset: false,
    searchFrom: 0,
    
    init_events: function(){
        var self = this;

        $('.selectpicker').on('change', function(){
            var searchType = $('.selectpicker').val();
            if(searchType == 'asset-name-search'){
                $('.global-search-div').hide();
                $('#assetSearchBox').val('');
                setSearchParams(true);
                $('.asset-search-div').show();
            }
            if(searchType == 'global-catalogue-search'){
                $('.asset-search-div').hide();
                $('#assetSearchBox').val('');
            }
        });
        $('#assetSearchBox').on('keypress', function (e) {
            var code = e.keyCode || e.which;
            if (code == 13) { //Enter keycode
                var searchType = $('.selectpicker').val();
                
                if(searchType == 'asset-name-search'){
                    initializePagination = true;
                    setSearchParams(initializePagination);
                    $('.global-search-div').hide();
                    $('.asset-search-div').show();
                }
                if(searchType == 'global-catalogue-search'){
                    self.searchRequestCount = 0;
                    self.searchRequestTime = 0;
                    self.search_all_asset = true;
                    self.searchEventTask();
                    $('.asset-search-div').hide();
                    $('.global-search-div').show();
                }
                
            }
        });

        $('.searchbtn').on('click', function (e) {
            var searchType = $('.selectpicker').val();
            if(searchType == 'asset-name-search'){
                initializePagination = true;
                setSearchParams(initializePagination);
                $('.global-search-div').hide();
                $('.asset-search-div').show();
            }
            if(searchType == 'global-catalogue-search'){
                self.searchRequestCount = 0;
                self.searchRequestTime = 0;
                self.search_all_asset = true;
                self.searchEventTask();
                $('.asset-search-div').hide();
                $('.global-search-div').show();
            }
        });

        $(document).on("click",".go-to-asset", function(){
            var self = $(this);
            if(self.parent().attr("data-scene-id")){
                clip_id = self.parent().attr("data-scene-id");
                parent_scene_id = self.parent().attr("data-parent-id");
            } 
            let asset_salt = $(this).parent().attr("data-asset-salt");
            let job_id = $(this).parent().attr("data-job-id");
            goto_url = BASEURL + 'programs/view/' + asset_salt + '/' + job_id +'?ps_id=' + parent_scene_id + '&c_id=' + clip_id;
            window.open(goto_url, '_blank');
        });
        
        // On play for search page
        $(document).on('click', '.search-play-icon', function(){
            $('#playerPopup .modal-body').html('');
            let params = {};
            var asset_name = '';
            params.start = $(this).parent().attr("data-start");
            params.end = $(this).parent().attr("data-end");
            params.video_url = $(this).parent().attr("data-vidurl");
            asset_name = $(this).parent().attr("data-program-name");
            loadVideoPopup(params);
            $('#playerPopup .modal-title').html(asset_name);
        });

        $('#loadMoreBtn').on('click', function (e) {
            self.searchFrom += 10;
            self.searchEventTask(true);
        });

        $(document).on("click", ".add-to-cart.playlist-cart", function (e) {
            
                var data = {};
                
                data.video_url = $(this).parent().parent().attr('data-vidurl');
                data.end = $(this).parent().parent().attr('data-end');
                data.end_timecode = $(this).parent().parent().attr('data-end-timecode');
                data.file_path = $(this).parent().parent().attr('data-file-path');
                data.matchingTags = $(this).parent().parent().attr('data-vidurl');
                data.program_id = $(this).parent().parent().attr('data-programs-id');
                data.scene_id = $(this).parent().parent().attr('data-scene-id');
                data.segment_name = $(this).parent().parent().attr('data-vidurl');
                data.start = $(this).parent().parent().attr('data-start');
                data.start_timecode = $(this).parent().parent().attr('data-start-timecode');
                
                $('.projectData').attr('data-video_url',data.video_url);
                $('.projectData').attr('data-end',data.end);
                $('.projectData').attr('data-end_timecode',data.end_timecode);
                $('.projectData').attr('data-file_path',data.file_path);
                $('.projectData').attr('data-matchingTags',data.matchingTags);
                $('.projectData').attr('data-program_id',data.program_id);
                $('.projectData').attr('data-scene_id',data.scene_id);
                $('.projectData').attr('data-segment_name',data.segment_name);
                $('.projectData').attr('data-start',data.start);
                $('.projectData').attr('data-start_timecode',data.start_timecode);
        });
        
   //      $("#assetSearchBox").autocomplete({
            // source: function (request, response) {
            //  let params = {};
            //  params.prefix = $("#assetSearchBox").val();
            //  params.size = 12;
            //  params.action = "getAutoComplete";
            //  params.frontAction = "updateAutoComplete";
            //  params.program_id = programView.program_id;
            //  self.autocompleteResponse = response;
            //  self.ajaxCall(params);
            // },
            // minLength: 3,
            // select: function (event, ui) {
            //  self.searchEventTask();
            // }
   //      });
        
    },

    searchEventTask(loadmore = false) {
        let self = this;
        if(!loadmore){
            self.searchFrom = 0;
        }
        let searchText = $('#assetSearchBox').val();
        let program_id ='';
        let searchFrom = self.searchFrom;
        searchText = encodeURIComponent(searchText);

        let requestData = {};
        requestData.loadmore = loadmore;
        requestData.query = searchText;
        requestData.size = 10;
        requestData.program_id = program_id;
        requestData.from = searchFrom;
        requestData.action = "searchScenes";
        requestData.frontAction = "populateSearchResult";
        self.ajaxCall(requestData);
    },
    
    ajaxCall(requestData) {
        var self = this;
        let async = true;
        if (typeof requestData.async !== "undefined") {
            async = false;
        }
        $.ajax({
            type: 'GET',
            url: BASEURL + 'rest/index',
            dataType: "json",
            data: requestData,
            async: async,
            error: function () {
            },
            success: function (response) {
                // console.log('Search Response.......');
                // console.log(response);
                if (requestData.frontAction == "updateAutoComplete") {
                    self.autocompleteResponse(response.data.data.list);
                }
                if (requestData.frontAction == "populateSearchResult") {
                    if (response.data.data.responseCode !== 200 && response.data.data.responseMessage != "Success") {
                        $(".search-result-brief").html("<h4>Enter the search keyword..</h4>");
                        return;
                    }
                    requestData.response = response.data.data;
                    self.populateSearchResult(requestData);
                }
            }
        });
    },
    
    populateSearchResult(requestData) {
        // var self = this;
        // let dummyDiv = $("#searchItemDummy");
        // let response = requestData.response;
        // let loadmore = requestData.loadmore;
        // let numberOfresults = response.list?response.list.length:0;
    
         var self = this;
        let dummyDiv = $("#searchItemDummy");
        let response = requestData.response;
        let loadmore = requestData.loadmore;
        let numberOfresults = response.elasticSearchCount;
        let listSize;
        if(response != null && response.list !=null){
            listSize = response.list.length;
        }else{
            //listSize = response.list.length;
        }
        

        if(numberOfresults >= 10){
            $("#load-more-wrapper").show();
        } else {
            $("#load-more-wrapper").hide();
        }

        if ((response.list == null || response.list.length == 0) && (self.searchRequestCount==0)) {
            $("#searchResultWrapper").html("");
            $(".search-result-brief").html("<h5 class='search_no_found'><img src='https://ovptranscodeddata.azureedge.net/images/n1a4vkASCRr6-1554272758324-8ROqvDXxdvqC.png' height='auto' width='100%'><h5 class='no-asset'>Keyword is not found</h5>");
        } else {
            
            self.searchRequestCount = (self.searchRequestCount)+numberOfresults;
            self.searchRequestTime = (self.searchRequestTime)+(response.responseTimeInMS);
            let message = `Found <span class="count">${self.searchRequestCount}</span> results for <span class="searchedfor">${decodeURI(requestData.query)}</span>  in <span class="intime">${self.searchRequestTime} milliseconds.</span>`;
            $(".search-result-brief").html("<h5 class='search_results'>Search Results</h5><h5>" + message + "</h5>");
            if(!loadmore){
                $("#searchResultWrapper").html("");
            }
            let breakCount = 0;
            for (let listIndex in response.list) {
                let list = response.list[listIndex];

                let listDiv = $(dummyDiv).clone();
                $(listDiv).removeAttr("id").removeAttr("style");
                $(listDiv).find(".item-image").attr("src", list.file_path);
                $(listDiv).find(".search-item-img-Top").attr("data-start", list.startSeconds);
                $(listDiv).find(".search-item-img-Top").attr("data-file-path", list.file_path);
                $(listDiv).find(".search-item-img-Top").attr("data-end", list.endSeconds);
                $(listDiv).find(".search-item-img-Top").attr("data-start-timecode", list.start);
                $(listDiv).find(".search-item-img-Top").attr("data-end-timecode", list.end);
                $(listDiv).find(".search-item-img-Top").attr("data-programs-id", list.program_id);
                $(listDiv).find(".search-item-img-Top").attr("data-program-name", list.program_name);
                $(listDiv).find(".search-item-img-Top").attr("data-scene-id", list.scene_id);
                $(listDiv).find(".search-item-img-Top").attr("data-parent-id", list.parentId);
                $(listDiv).find(".search-item-img-Top").attr("data-vidUrl", list.recorded_video);
                $(listDiv).find(".search-item-img-Top").attr("data-asset-salt", list.programSalt);
                $(listDiv).find(".search-item-img-Top").attr("data-job-id", list.jobId);
                $(listDiv).find(".show-catalog-link").removeClass("show-catalog-link").addClass("go-to-asset");
                $(listDiv).find(".search-description").html(list.program_name);
                $(listDiv).find(".keyword-container h6").html('');
                $(listDiv).find(".search-item-img-Top .cart .add-to-cart").addClass("s"+list.scene_id);

                let tags = [];
                for (let tagIndex in list.matchingTags) {
                    let tag = list.matchingTags[tagIndex]; tags.push(tag);
                }
                let missingtags = [];
                if(list.missingTags){
                    for (let missingTagIndex in list.missingTags) {
                        let missingtag = list.missingTags[missingTagIndex]; 
                        missingtags.push(missingtag);
                    }
                }
                
                $(listDiv).find(".search-item-img-Top .tags").append('<span class="ends float-right"><a class="tag-popover" data-toggle="popover" data-placement="left" data-content="' + tags + '"><i class="taglist fa fa-info-circle"></i></a></span>');
                $('[data-toggle=popover]').popover({
                    trigger: "click"
                });

                $('[data-toggle=popover]').on('click', function (e) {
                    $('[data-toggle=popover]').not(this).popover('hide');
                });
                let txt = '';
                for(let tagIndex in tags){
                    txt += '<span>'+tags[tagIndex]+'</span>';
                }
                if(missingtags){
                    txt += '<div>';
                    for(let missingTagIndex in missingtags){
                        txt += '<span class="missingtags"><del>'+missingtags[missingTagIndex]+'</del></span>';
                    }
                    txt += '</div>';
                }
            
                $(listDiv).find(".search-item-img-Top").attr("data-matching-tags", tags.join(","));
                $(listDiv).find(".keyword-container .search-keywords").html(txt);
                $(listDiv).find(".search-item-time .starts").html(list.start);
                $(listDiv).find(".search-item-time .ends").html(list.end);

                $("#searchResultWrapper").append(listDiv);

            }
            $('[data-toggle=popover]').popover({
                trigger: "click"
            });

            $('[data-toggle=popover]').on('click', function (e) {
                $('[data-toggle=popover]').not(this).popover('hide');
            });

            $(".load-more-wrapper").show();
        }
    },

};


// Add to project

//Get Project List starts
function getProjectList(){
    let reqdata = {};
        reqdata.action = "getProjectList";
        
        $.ajax({
            headers: { 'X-CSRF-Token': csrfToken },
            url: BASEURL + 'rest/index',
            data: reqdata,
            type: 'GET',
            dataType: 'json',
            error: function (xhr) {
                //console.log(xhr);
            },
            onSuccess: function (res) {
            }
        }).done(function(res){
            data = res.data.data;
            console.log('Get Project List');
            console.log(data);
            var txt='';
            for(var i =0;i<data.list.length;i++){
                txt+='<button type="button" class="btn btn-dark" onclick="addToProject('+data.list[i].id+');" data-project-id="'+data.list[i].id+'">'+data.list[i].project_name.replace(/_/g, " ")+'</button>';
            }
            $(".projectListMenu").html(txt);
        });
}
//Get Project list Ends

function removeUnderscores(text){
    var formattedTxt = text.replace(/_/g, ' ');
    return formattedTxt;
}

function capitalFirstLetter(text){
    return text && text[0].toUpperCase() + text.slice(1).toLowerCase();
}

function checkSubJobType(arr, program_services){
    // console.log(program_services);
    // console.log(arr);
    if(arr.length > 0 ){
        if(arr.length == 1){
            var newarray = arr.map(myFunction)
            if(arr == "cricket_live"){
                return "Cricket-Live-Stream";
            }else{
                return newarray;
            }
            
        }else{
            var newarray = arr.map(myFunction);
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }
            
            var unique = newarray.filter(onlyUnique);
            var uniquelen = unique.length - 1;
        if(unique.length == 1){
            return unique;
        }else if(unique.length > 1){
            return unique.join(', ');
            //return "<div class='row multipleDiscoveryRow'><div>"+newarray[0]+"</div><div class='ellipsisButton dropdown dropleft' id='ellipsisButtonlist'><div class='ellipsisBTN dropdown-toggle' data-toggle='dropdown'>+"+uniquelen+"</div><div class='dropdown-menu'>"+unique.map(putbr).join('')+"</div></div></div>";
        }
            
        }
    }else{
        // console.log("no discovery type found");
    }

    function putbr(unique, i){
        // console.log(unique.toString().split(",").join("<br>"));
        console.log(unique);
        if(i>0){
            return "<a class='dropdown-item' href='#'>"+unique+"</a><div class='dropdown-divider'></div>";
        }
         
    }

    function myFunction(num) {
        //console.log(program_services[num])
        if(num!=undefined){
            return program_services[num] ;
        }
    }
    

}



// NEW CODE BY SABBUL FOR DATE FORMAT
 // console.log("GetA===" +data[i].jobStatus);
                // setJobStatus(data[i].jobStatus);
// var getTime = new Date("2019-10-18T11:43:51.000+0000");
// function formatAMPM() {
//   var date=getTime;
//   var hours = date.getHours();
//   var minutes = date.getMinutes();
//   var ampm = hours >= 12 ? 'pm' : 'am';
//   hours = hours % 12;
//   hours = hours ? hours : 12; // the hour '0' should be '12'
//   minutes = minutes < 10 ? '0'+minutes : minutes;
//   var strTime = hours + ':' + minutes + ' ' + ampm;
//   return strTime;
// }
// var output=formatAMPM(new Date);
// alert(output);

// function setFormattedDate(mDate) {
//     var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     var dd = mDate.getDate();
//     var mm = months[mDate.getMonth()];
//     var yyyy = mDate.getFullYear();
//     var hours = mDate.getHours();
//     var minu = mDate.getMinutes();
//     $(".timeMinu").html(hours + ':' + minu);
//     $(".onlyDate").html(dd);
//     $(".monthYears").html(mm + " " + yyyy);
// }

// function setJobStatus(jobStatus) {
//     console.log("jobStatus ====" + jobStatus);
//     if (jobStatus == "COMPLETED") {
//         $(".status").html("<i class='completed fa fa-circle'></i>");
//     } else if (jobStatus == "PENDING") {
//         $(".status").html("<i class='pending fa fa-circle'></i>");
//     } else if (jobStatus == "IN_PROGRESS") {
//         $(".status").html("<i class='inProgress fa fa-circle'></i>");
//     } else if (jobStatus == "SUCCESS") {
//         $(".status").html("<i class='success fa fa-circle'></i>");
//     } else if (status == "FAILED") {
//         $(".JobStatus").html("<i class='failed fa fa-circle'></i>");
//     } else {
//         status = jobStatus;
//     }
// }



  document.querySelector('.dateSort').addEventListener('click', function() {
  const icon = this.querySelector('i');
  if (icon.classList.contains('fa-chevron-down')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
        sort='false';
        ajaxDateSortCall(sort);

  
  } else {
        icon.classList.remove('fa-chevron-uph');
        icon.classList.add('fa-chevron-down');
         sort='true';
         ajaxDateSortCall(sort);
  
  }
});

// Filter selection  chennal

var searchedLoginClaims = sessionStorage.getItem("product");
if(searchedLoginClaims != undefined || searchedLoginClaims != null){
    $("#channelDetails select").first().find(":selected").removeAttr("selected");
  $("#channelDetails select").find("option").each(function () {
            if ($(this).val() == searchedLoginClaims) {
                $(this).attr("selected", true);
            }
        });
}





 var hostname=window.location.host;
if(hostname== 'clearvisioncloud.com' || hostname== 'www.clearvisioncloud.com'){
   $(".trainingLabel").hide();
}else{
   $(".trainingLabel").show();
}
