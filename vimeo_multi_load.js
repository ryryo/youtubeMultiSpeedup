$(function () {
    // 各プレーヤーの格納
    var vimeoPlayer = [];
    var timer = [];

    var vimeoWidth = 640;

    $('.vimeoPlayerReady').click(function () {
        var playerId = $(this).attr("id");
        var videoUrl = $(this).data("video");

        $(this).parents(".embed-vimeo").parent().find(".controller").show();

        video = '<iframe src="' + videoUrl +
            '" id="' + playerId + '" frameborder="0" width="640" height="360" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        $(this).replaceWith(video);

        vimeoAPIReady(playerId);
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

    function vimeoAPIReady(playerId) {
        // var iframe = document.querySelector('iframe');
        var iframe = $("iframe#" + playerId);
        vimeoPlayer[playerId] = new Vimeo.Player(iframe, {
            width: vimeoWidth,
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