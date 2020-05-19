$(function () {
    // 各プレーヤーの格納
    var ytPlayer = [];
    // プレーヤーのサイズ
    var ytWidth = 640;
    var ytHeight = 390;

    var ua = navigator.userAgent;
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0) {
        var os = "ios";
    } else if (ua.indexOf('Android') > 0) {
        var os = "android";
    } else {
        var os = "pc";
    }
    logmes("OS:" + os);

    // iOSはlazyload的に処理
    if (os == "ios") {
        var thisOffset = [];
        $(window).on('load', function () {
            //要素の位置取得
            $(".ytPlayerReady").each(function (i, elm) {
                thisOffset[i] = [];
                thisOffset[i]["playerId"] = $(elm).attr("id");
                thisOffset[i]["movieId"] = $(elm).data("movieid");
                if ($(elm).data("width")) {
                    thisOffset[i]["ytWidth"] = $(elm).data("width");
                } else {
                    thisOffset[i]["ytWidth"] = ytWidth;
                }
                if ($(elm).data("height")) {
                    thisOffset[i]["ytHeight"] = $(elm).data("height");
                } else {
                    thisOffset[i]["ytHeight"] = ytHeight;
                }
                thisOffset[i]["top"] = $(elm).offset().top + $(elm).outerHeight();
                thisOffset[i]["lazyStatus"] = false;

                logmes("位置:" + $(elm).attr("id") + ":" + thisOffset[i]["top"]);
            });

            // console.log(thisOffset);

            //スクロール開始前にも、ファーストビュー中に動画があったらYouTube起動処理
            youtubeLazy(ytPlayer, thisOffset);
        });

        //lazyload的YouTube起動処理
        $(window).scroll(function () {
            youtubeLazy(ytPlayer, thisOffset);
        });
    }

    //画像クリックでのYouTube起動処理
    $(".ytPlayerReady").click(function () {
        var playerId = $(this).attr("id");
        var movieId = $(this).data("movieid");
        var ytWidthTemp = ytWidth;
        var ytHeightTemp = ytHeight;
        if ($(this).data("width")) {
            ytWidthTemp = $(this).data("width");
        }
        if ($(this).data("height")) {
            ytHeightTemp = $(this).data("height");
        }

        $(this).removeClass("ytPlayerReady");
        $(this).parent().parent().find(".controller").show();

        logmes("起動クリック:" + playerId + ":" + movieId);

        youTubeIframeAPIReady(ytPlayer, playerId, movieId, ytWidthTemp, ytHeightTemp);

    });

    // コントローラー操作
    $(".y_start").click(function () {
        var playerId = $(this).parents('.controller').data("playerid");
        ytPlayer[playerId].playVideo();
    });
    $(".y_pause").click(function () {
        var playerId = $(this).parents('.controller').data("playerid");
        ytPlayer[playerId].pauseVideo();
    });

    function youtubeLazy(ytPlayer, thisOffset) {
        var nowScrollTop;
        for (var i = 0; i < thisOffset.length; i++) {
            nowScrollTop = $(window).scrollTop() + $(window).height();

            if (nowScrollTop > thisOffset[i]["top"] && !thisOffset[i]["lazyStatus"]) {
                logmes("lazyload:" + thisOffset[i]["playerId"]);

                $("#" + thisOffset[i]["playerId"]).removeClass("ytPlayerReady");
                $("#" + thisOffset[i]["playerId"]).parent().parent().find(".controller").show();

                youTubeIframeAPIReady(ytPlayer, thisOffset[i]["playerId"], thisOffset[i]["movieId"], thisOffset[i]["ytWidth"],
                    thisOffset[i]["ytHeight"]);

                thisOffset[i]["lazyStatus"] = true;
            }
        }
    }

    // 各プレーヤーの埋め込み
    function youTubeIframeAPIReady(ytPlayer, playerId, movieId, ytWidth, ytHeight) {
        ytPlayer[playerId] = new YT.Player(playerId, {
            width: ytWidth,
            height: ytHeight,
            videoId: movieId,
            playerVars: {
                rel: 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });

    }

    // 各プレーヤー準備完了後の処理
    function onPlayerReady(event) {
        playerId = event.target.getIframe().id;
        logmes(playerId + ":onPlayerReady");

        if (os != "ios") {
            // ytPlayer[playerId].mute();
            ytPlayer[playerId].playVideo();
        }

    }

    function onPlayerStateChange(event) {
        playerId = event.target.getIframe().id;
        // logmes(playerId + ":onPlayerStateChange");
        playerStateView(event, playerId);
    }

    function playerStateView(event, playerId) {
        var ytStatus = ytPlayer[playerId].getPlayerState();

        if (ytStatus == 1) {
            logmes('ステータス:再生中');
            timer = setInterval(moviePlayTimeView, 5000); //動画の再生時間表示
        } else if (ytStatus == 0) {
            logmes('ステータス:終了');
            clearInterval(timer);
        } else if (ytStatus == 2) {
            logmes('ステータス:一時停止中');
            clearInterval(timer);
        } else if (ytStatus == 3) {
            logmes('ステータス:バッファリング中');
        } else if (ytStatus == 5) {
            logmes('ステータス:頭出し済み');
        } else if (ytStatus == -1) {
            logmes('ステータス:未開始');
        } else {
            logmes('ステータス:該当なし?ログ確認');
            console.log(ytStatus);
        }
    }

    function moviePlayTimeView() {
        var currentTime = ytPlayer[playerId].getCurrentTime();
        currentTime = Math.round(currentTime)
        logmes("再生時間:" + playerId + ":" + currentTime);

        if (currentTime > 60) {
            clearInterval(timer);
        }
    }

    function logmes(log) {
        if (log != "") {
            var mes = $("#mes").html();
            mes = mes + "<p>" + log + "</p>";
            $("#mes").html(mes);

            var scrollPoint = $('#mes')[0].scrollHeight;

            // $(".mesBox").scrollTop(scrollPoint);
            $('.mesBox').animate({
                scrollTop: $('#mes')[0].scrollHeight
            });
        }
    }
});