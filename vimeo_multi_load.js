$(function () {
    //html上にAPI読込みタグ設置
    var tag = document.createElement('script');
    tag.src = "https://player.vimeo.com/api/player.js";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    // 各プレーヤーの格納
    var vimeoPlayer = [];
    var timer = [];

    var vimeoWidth = 640;

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
            $(".vimeoPlayerReady").each(function (i, elm) {
                thisOffset[i] = [];
                thisOffset[i]["playerId"] = $(elm).attr("id");
                thisOffset[i]["videoUrl"] = $(elm).data("video");
                if ($(elm).data("width")) {
                    thisOffset[i]["vimeoWidth"] = $(elm).data("width");
                } else {
                    thisOffset[i]["vimeoWidth"] = vimeoWidth;
                }
                thisOffset[i]["top"] = $(elm).offset().top + $(elm).outerHeight();
                thisOffset[i]["lazyStatus"] = false;

                logmes("位置:" + $(elm).attr("id") + ":" + thisOffset[i]["top"]);
            });

            // console.log(thisOffset);

            //スクロール開始前にも、ファーストビュー中に動画があったらYouTube起動処理
            vimeoLazy(thisOffset);
        });

        //lazyload的YouTube起動処理
        $(window).scroll(function () {
            vimeoLazy(thisOffset);
        });
    }

    //画像クリックでの読み込み処理
    $('.vimeoPlayerReady').click(function () {
        var playerId = $(this).attr("id");
        var videoUrl = $(this).data("video");
        var vimeoWidthTemp = vimeoWidth;
        if ($(this).data("width")) {
            vimeoWidthTemp = $(this).data("width");
        }
        vimeoIframeSet(playerId, videoUrl, vimeoWidthTemp);
    });

    // コントローラー操作
    $(".v_start").click(function () {
        var playerId = $(this).parents('.controller').data("playerid");
        vimeoPlayer[playerId].play().then(function () {
            // logmes("再生ボタン:" + playerId);
        }).catch(function (error) {
            console.log(error.name);
        });
    });
    $(".v_pause").click(function () {
        var playerId = $(this).parents('.controller').data("playerid");
        vimeoPlayer[playerId].pause().then(function () {
            // logmes("一時停止" + playerId);
        }).catch(function (error) {
            console.log(error.name);
        });
    });

    function vimeoLazy(thisOffset) {
        var nowScrollTop;
        for (var i = 0; i < thisOffset.length; i++) {
            nowScrollTop = $(window).scrollTop() + $(window).height();

            if (nowScrollTop > thisOffset[i]["top"] && !thisOffset[i]["lazyStatus"]) {
                logmes("lazyload:" + thisOffset[i]["playerId"]);

                vimeoIframeSet(thisOffset[i]["playerId"], thisOffset[i]["videoUrl"], thisOffset[i]["vimeoWidth"]);

                // $("#" + thisOffset[i]["playerId"]).removeClass("vimeoPlayerReady");
                // $("#" + thisOffset[i]["playerId"]).parent().parent().find(".controller").show();

                // // vimeoAPIReady(vimeoPlayer, thisOffset[i]["playerId"], thisOffset[i]["movieId"], thisOffset[i]["vimeoWidth"], thisOffset[i]["vimeoHeight"]);
                // vimeoAPIReady(thisOffset[i]["playerId"]);

                thisOffset[i]["lazyStatus"] = true;
            }
        }
    }

    function vimeoIframeSet(playerId, videoUrl, vimeoWidth) {
        $("#" + playerId).parents(".embed-vimeo").parent().find(".controller").show();

        video = '<iframe src="' + videoUrl +
            '" id="' + playerId + '" frameborder="0" width="' + vimeoWidth + '" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        $("#" + playerId).replaceWith(video);

        vimeoAPIReady(playerId);
    }


    function vimeoAPIReady(playerId) {
        // var iframe = document.querySelector('iframe');
        var iframe = $("iframe#" + playerId);
        vimeoPlayer[playerId] = new Vimeo.Player(iframe, {
            // width: vimeoWidth,
        });

        vimeoPlayer[playerId].on('play', function () {
            logmes('played:' + playerId);
            timer[playerId] = setInterval(moviePlayTimeView, 5000, playerId); //動画の再生時間表示
        });

        vimeoPlayer[playerId].on('pause', function () {
            logmes('paused:' + playerId);
            clearInterval(timer[playerId]);
        });

    }

    function moviePlayTimeView(playerId) {

        vimeoPlayer[playerId].getCurrentTime().then(function (currentTime) {
            currentTime = Math.round(currentTime)
            logmes("再生時間:" + playerId + ":" + currentTime);

            if (currentTime > 60) {
                clearInterval(timer[playerId]);
            }
        }).catch(function (error) {
            console.log(error.name);
        });
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