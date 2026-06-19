(function () {
    function initStaticPlayer(source) {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-player-cover]");
        var toggle = document.querySelector("[data-player-toggle]");
        var status = document.querySelector("[data-player-status]");
        var hls = null;
        var readyPromise = null;

        if (!video || !source) {
            return;
        }

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function setup() {
            if (readyPromise) {
                return readyPromise;
            }

            readyPromise = new Promise(function (resolve) {
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("播放加载中");
                        }
                    });
                    window.setTimeout(resolve, 2600);
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    resolve();
                    return;
                }

                video.src = source;
                resolve();
            });

            return readyPromise;
        }

        function updateToggle() {
            if (toggle) {
                toggle.textContent = video.paused ? "▶" : "Ⅱ";
            }

            setStatus(video.paused ? "点击播放" : "正在播放");
        }

        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }

            video.setAttribute("controls", "controls");
        }

        function playVideo() {
            hideCover();
            setStatus("加载中");

            setup().then(function () {
                var playRequest = video.play();

                if (playRequest && typeof playRequest.then === "function") {
                    playRequest.then(updateToggle).catch(function () {
                        setStatus("点击播放");
                    });
                } else {
                    updateToggle();
                }
            });
        }

        function togglePlayback() {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }

        if (toggle) {
            toggle.addEventListener("click", togglePlayback);
        }

        video.addEventListener("click", togglePlayback);
        video.addEventListener("play", updateToggle);
        video.addEventListener("pause", updateToggle);
        video.addEventListener("ended", updateToggle);
        updateToggle();

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initStaticPlayer = initStaticPlayer;
}());
