var pageSpeedInsightApi = {

    index: function(inputVal) {
        $.ajax({
            url: `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${inputVal}`,
            type: 'GET',
            dataType: 'json',
            error: function(xhr) {
                console.log(xhr);
                console.log('error');
            },
            beforeSend: function(data) {
                $('.loading-spinner').show();
            },
            complete: function() {

            },
            success: function(res) {
                console.log('success');
                console.log(res);
                $('.content.main').hide();
                $('.device-tab').show();
                if (typeof(res.loadingExperience) != "undefined") {
                    loadingExperienceData(res.loadingExperience);
                }
                if (typeof(res.lighthouseResult) != "undefined" && typeof(res.lighthouseResult.audits) != "undefined") {
                    labData(res.lighthouseResult.audits);
                    screenShotData(res.lighthouseResult.audits);
                    // DiagnoticsQualifyingPassedData(res.lighthouseResult.audits);

                }
                if (typeof(res.lighthouseResult) != "undefined" && typeof(res.lighthouseResult.categories) != "undefined") {
                    performanceData(res.lighthouseResult.categories);
                }
                if (typeof(res.lighthouseResult) != "undefined") {
                    $('.audited-url__link').text(res.lighthouseResult.requestedUrl);
                    $('.audited-url__link').attr("href", res.lighthouseResult.requestedUrl);
                }
                $('.loading-spinner').hide();

            },
            xhr: function(e) {
                var xhr = new window.XMLHttpRequest();
                //Download progress
                xhr.addEventListener("progress", function(evt) {
                    console.log('Download progress');
                    console.log(evt);
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        console.log(Math.round(percentComplete * 100) + "%");
                    }
                }, true);
                return xhr;
            }
        });
    }
}

$(document).ready(function() {
    $(".main-submit").click(function() {
        let inputVal = $("#url").val();
        pageSpeedInsightApi.index(inputVal);
        // run();
    });
});

function DiagnoticsQualifyingPassedData(data) {
    let txt = "";
    let parameters = data;
    let opportunityTxt = `<div class="lh-audit-group__header"><span class="lh-audit-group__title">Opportunities</span><span class="lh-audit-group__description">These suggestions can help your page load faster. They don't <a rel="noopener" target="_blank" href="https://web.dev/performance-scoring/?utm_source=lighthouse&amp;utm_medium=unknown">directly affect</a> the Performance score.</span></div>
                <div class="lh-load-opportunity__header lh-load-opportunity__cols">
                    <div class="lh-load-opportunity__col lh-load-opportunity__col--one">Opportunity</div>
                    <div class="lh-load-opportunity__col lh-load-opportunity__col--two">Estimated Savings</div>
                </div>`;
    let diagnosticTxt = `<div class="lh-audit-group__header">
                            <span class="lh-audit-group__title">Diagnostics</span>
                            <span class="lh-audit-group__description">More information about the performance of your application. These numbers don't <a rel="noopener" target="_blank" href="https://web.dev/performance-scoring/?utm_source=lighthouse&amp;utm_medium=unknown">directly affect</a> the Performance score.</span>
                        </div>`;
    let passedTxt = `<details class="lh-clump lh-audit-group lh-clump--passed">
                        <summary>
                            <div class="lh-audit-group__summary">
                                <div class="lh-audit-group__header">
                                    <span class="lh-audit-group__title">Passed audits</span>
                                    <span class="lh-audit-group__itemcount">(20)</span>
                                </div>
                                <div class=""></div>
                                <svg class="lh-chevron" title="See audits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                <g class="lh-chevron__lines">
                                    <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
                                    <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
                                </g>
                                </svg></div>
                        </summary>`;
    for (key in parameters) {
        let obj = data[key];
        let opptunityCls = '';
        if (typedef(obj.details) != 'undefined' && obj.details.type == "opportunity") {
            opptunityCls = 'lh-audit--load-opportunity';
        }

        let oppCls = iconDisplay('lh-audit', obj.score);
        let intVal = parseInt(obj.displayValue.match(/\d+/)[0]);
        opportunityTxt += `<div class="lh-audit ${opptunityCls} lh-audit--${obj.scoreDisplayMode} ${oppCls}" id="${obj.title}">
                                    <details class="lh-expandable-details">
                                    <summary>
                                    <div class="lh-audit__header lh-expandable-details__summary">
                                        <div class="lh-load-opportunity__cols">
                                            <div class="lh-load-opportunity__col lh-load-opportunity__col--one">
                                                <span class="lh-audit__score-icon"></span>
                                                <div class="lh-audit__title"><span>${obj.title}</span></div>
                                            </div>
                                            <div class="lh-load-opportunity__col lh-load-opportunity__col--two">
                                                <div class="lh-load-opportunity__sparkline" title="${obj.displayValue}">
                                                    <div class="lh-sparkline">
                                                        <div class="lh-sparkline__bar" style="width: ${intValue/obj.numericValue}%;"></div>
                                                    </div>
                                                </div>
                                                <div class="lh-audit__display-text" title="${obj.displayValue}">${intValue}&nbsp;s</div>
                                                <div class="lh-chevron-container" title="See resources"><svg class="lh-chevron" title="See audits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                                                <g class="lh-chevron__lines">
                                                <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
                                                <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
                                                </g>
                                                </svg></div>
                                            </div>
                                        </div>
                                    </div>
                                </summary>`;
        if (typedef(obj.details) != 'undefined' && obj.details.type == "opportunity") {

            opportunityTxt += `    <div class="lh-audit__description"><span>Resources are blocking the first paint of your page. Consider delivering critical JS/CSS inline and deferring all non-critical JS/styles. <a rel="noopener" target="_blank" href="https://web.dev/render-blocking-resources/?utm_source=lighthouse&amp;utm_medium=unknown">Learn more</a>.</span></div>
                                        <div class="lh-audit__stackpacks"></div>
                                        <table class="lh-table lh-details">
                                            <thead>
                                                <tr>`;
            for (let hea = 0; hea < obj.details.headings.length; hea++) {
                opportunityTxt += `                    <th class="lh-table-column--url">
                                                            <div class="lh-text">${obj.details.headings[hea]}</div>
                                                        </th>`;
            }

            opportunityTxt += `             </tr>
                                            </thead>
                                            <tbody>`;
            for (let t = 0; t < obj.details.items.length; t++) {
                let tx = ''
                if ((t + 1) % 2 == 0) {
                    tx = 'even';
                } else {
                    tx = 'odd';
                }
                opportunityTxt += `             <tr class="lh-row--${tx}">
                                                    <td class="lh-table-column--url">
                                                            <div class="lh-text__url" title="${obj.details.items[t].url}"
                                                                    class="lh-link">/css?family=…</a>
                                                                <div class="lh-text lh-text__url-host">(fonts.googleapis.com)</div>
                                                            </div>
                                                        </td>
                                                        <td class="lh-table-column--bytes">
                                                            <div class="lh-text" title="2,544&nbsp;bytes">2.5&nbsp;KiB</div>
                                                        </td>
                                                        <td class="lh-table-column--timespanMs">
                                                            <div class="lh-text">780&nbsp;ms</div>
                                                        </td>
                                                    </tr>`;
            }
            opportunityTxt += `                        </tbody>
                                        </table>`;
        }

        opportunityTxt += `    </details>
                                </div>`;
    }
    opportunityTxt = `</div>`;
    diagnosticTxt = `</div>`;
    passedTxt = `</details>`;


}

function loadingExperienceData(data) {
    let txt = "";
    let parameters = data.metrics;
    for (key in parameters) {
        txt += `<div class="metric-wrapper">
                    <div class="field-metric average lh-metric__innerwrap"><span class="metric-description">${key}</span>
                        <div class="metric-value lh-metric__value">1.7 s</div>
                    </div>
                    <div class="metric-chart">
                        <div class="bar fast" style="flex-grow: 49;">49%</div>
                        <div class="bar average" style="flex-grow: 41;">41%</div>
                        <div class="bar slow" style="flex-grow: 10;">10%</div>
                    </div>
                </div>`;
    }
}


function screenShotData(data) {
    let txt = `<div class="lh-filmstrip">`;
    let parameters = data["screenshot-thumbnails"].details.items;
    for (let i = 0; i < parameters.length; i++) {
        txt += `<div class="lh-filmstrip__frame"><img class="lh-filmstrip__thumbnail" src="${parameters[i].data}"
                alt="Screenshot"></div>`;
    }
    txt += `</div>`;
    $('#screenshot-thumbnails').html(txt);
}

function performanceData(data) {
    $('.lh-gauge__percentage').text(Math.round(data.performance.score * 100));
    let performanceDataCls = iconDisplay('lh-gauge__wrapper', data.performance.score * 100);
    let svgPercentage = data.performance.score * 351.858;
    let txt = '';
    txt += `<svg viewBox="0 0 120 120" class="lh-gauge">
        <circle class="lh-gauge-base" r="56" cx="60" cy="60" stroke-width="8"></circle>
        <circle class="lh-gauge-arc" r="56" cx="60" cy="60" stroke-width="8" style="transform: rotate(-87.9537deg); stroke-dasharray: ${svgPercentage}, 351.858;"></circle>
    </svg>`
    $('.lh-gauge__wrapper .lh-gauge__svg-wrapper').html(txt);
    if (!$('.lh-gauge__wrapper').hasClass(performanceDataCls)) {
        $('.lh-gauge__wrapper').removeClass('lh-gauge__wrapper--fail lh-gauge__wrapper--average lh-gauge__wrapper--pass');
        $('.lh-gauge__wrapper').addClass(performanceDataCls);
    };

}

function labData(data) {

    // First Contentful paint
    let displayValue = data["first-contentful-paint"].displayValue;
    let firstContentfulPaintScore = data["first-contentful-paint"].score * 100;
    let firstContentfulPaintCls = iconDisplay('lh-metric', firstContentfulPaintScore);
    $('#first-contentful-paint .lh-metric__value').text(displayValue);
    $('#first-contentful-paint').addClass(firstContentfulPaintCls);

    // Speed Index
    let sleepIndexDisplayValue = data["speed-index"].displayValue;
    let sleepIndexScore = data["speed-index"].score * 100;
    let sleepIndexScoreCls = iconDisplay('lh-metric', sleepIndexScore);
    $('#speed-index .lh-metric__value').text(sleepIndexDisplayValue);
    $('#speed-index').addClass(sleepIndexScoreCls);

    // Largest Contentful Paint
    let largestContentfulDisplayValue = data["largest-contentful-paint"].displayValue;
    let largestContentfulScore = data["largest-contentful-paint"].score * 100;
    let largestContentfulCls = iconDisplay('lh-metric', largestContentfulScore);
    $('#largest-contentful-paint .lh-metric__value').text(largestContentfulDisplayValue);
    $('#largest-contentful-paint').addClass(largestContentfulCls);

    // Time to Interactive
    let timeToInteractiveDisplayValue = data["interactive"].displayValue;
    let timeToInteractiveScore = data["interactive"].score * 100;
    let timeToInteractiveCls = iconDisplay('lh-metric', timeToInteractiveScore);
    $('#interactive .lh-metric__value').text(timeToInteractiveDisplayValue);
    $('#interactive').addClass(timeToInteractiveCls);

    // Total Blocking Time
    let totalBlockingTimeDisplayValue = data["total-blocking-time"].displayValue;
    let totalBlockingTimeScore = data["total-blocking-time"].score * 100;
    let totalBlockingTimeCls = iconDisplay('lh-metric', totalBlockingTimeScore);
    $('#total-blocking-time .lh-metric__value').text(totalBlockingTimeDisplayValue);
    $('#total-blocking-time').addClass(totalBlockingTimeCls);

    // Cumulative Layout Shift
    let cumulativeLayoutShiftDisplayValue = data["cumulative-layout-shift"].displayValue;
    let cumulativeLayoutShiftScore = data["cumulative-layout-shift"].score * 100;
    let cumulativeLayoutShiftCls = iconDisplay('lh-metric', cumulativeLayoutShiftScore);
    $('#cumulative-layout-shift .lh-metric__value').text(cumulativeLayoutShiftDisplayValue);
    $('#cumulative-layout-shift').addClass(cumulativeLayoutShiftCls);

    $('.screenshot-container.mobile img').attr("src", data["final-screenshot"].details.data);


}

function iconDisplay(statsLevel, score) {
    if (score >= 0 && score < 50) {
        return statsLevel + '--fail';
    } else if (score >= 50 && score < 90) {
        return statsLevel + '--average';
    } else if (score >= 90 && score <= 100) {
        return statsLevel + '--pass';
    }
    return -1
}

function run() {
    const url = setUpQuery();
    fetch(url)
        .then(response => response.json())
        .then(json => {
            // See https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed#response
            // to learn more about each of the properties in the response object.
            showInitialContent(json.id);
            const cruxMetrics = {
                "First Contentful Paint": json.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.category,
                "First Input Delay": json.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category
            };
            showCruxContent(cruxMetrics);
            const lighthouse = json.lighthouseResult;
            const lighthouseMetrics = {
                'First Contentful Paint': lighthouse.audits['first-contentful-paint'].displayValue,
                'Speed Index': lighthouse.audits['speed-index'].displayValue,
                'Time To Interactive': lighthouse.audits['interactive'].displayValue,
                'First Meaningful Paint': lighthouse.audits['first-meaningful-paint'].displayValue,
                'First CPU Idle': lighthouse.audits['first-cpu-idle'].displayValue,
                'Estimated Input Latency': lighthouse.audits['estimated-input-latency'].displayValue
            };
            showLighthouseContent(lighthouseMetrics);
        });
}

function setUpQuery() {
    const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const parameters = {
        url: encodeURIComponent('https://developers.google.com')
    };
    let query = `${api}?`;
    for (key in parameters) {
        query += `${key}=${parameters[key]}`;
    }
    return query;
}

function showInitialContent(id) {
    document.body.innerHTML = '';
    const title = document.createElement('h1');
    title.textContent = 'PageSpeed Insights API Demo';
    document.body.appendChild(title);
    const page = document.createElement('p');
    page.textContent = `Page tested: ${id}`;
    document.body.appendChild(page);
}

function showCruxContent(cruxMetrics) {
    const cruxHeader = document.createElement('h2');
    cruxHeader.textContent = "Chrome User Experience Report Results";
    document.body.appendChild(cruxHeader);
    for (key in cruxMetrics) {
        const p = document.createElement('p');
        p.textContent = `${key}: ${cruxMetrics[key]}`;
        document.body.appendChild(p);
    }
}

function showLighthouseContent(lighthouseMetrics) {
    const lighthouseHeader = document.createElement('h2');
    lighthouseHeader.textContent = "Lighthouse Results";
    document.body.appendChild(lighthouseHeader);
    for (key in lighthouseMetrics) {
        const p = document.createElement('p');
        p.textContent = `${key}: ${lighthouseMetrics[key]}`;
        document.body.appendChild(p);
    }
}