jQuery(async function ($) {
  'use strict';
  var supportsAudio = !!document.createElement('audio').canPlayType;
  if (supportsAudio) {
    // initialize plyr
    var player = new Plyr('#audio1', {
      controls: [
        'restart',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'download']
    });

    var url = 'http://localhost:5000/tracks';
    var response = await fetch(url);

    var json = await response.json();
    var tracks = json.tracks;

    console.log(tracks);

    var index = 0,
        playing = false,
        mediaPath = 'https://archive.org/download/mythium/',
        path = 'http://localhost:5000/static/tracks/',
        extension = '',

        buildPlaylist = $.each(tracks, function (key, value) {
          var trackNumber = value.id,
              trackName = value.name,
              trackDuration = value.time;
          if (trackNumber.toString().length === 1) {
            trackNumber = '0' + trackNumber;
          }

          $('#plList').append('<li> \
                    <div class="plItem"> \
                        <span class="plNum">' + trackNumber + '.</span> \
                        <span class="plTitle">' + trackName + '</span> \
                        <span class="plLength">' + trackDuration + '</span> \
                    </div> \
                </li>');
        }),

        trackCount = tracks.length,
        npAction = $('#npAction'),
        npTitle = $('#npTitle'),
        audio = $('#audio1').on('play', function () {
          playing = true;
          npAction.text('Now Playing...');

        }).on('pause', function () {
          playing = false;
          npAction.text('Paused...');
        }).on('ended', function () {
          npAction.text('Paused...');
          if (index + 1 < trackCount) {
            index++;
            loadTrack(index);
            audio.play();
          } else {
            audio.pause();
            index = 0;
            loadTrack(index);
          }

        }).get(0),

        btnPrev = $('#btnPrev').on('click', function () {
          if (index - 1 > -1) {
            index--;
            loadTrack(index);
            if (playing) {
              audio.play();
            }
          } else {
            audio.pause();
            index = trackCount;
            loadTrack(index);
          }

        }),
        btnNext = $('#btnNext').on('click', function () {
          if (index + 1 < trackCount) {
            index++;
            loadTrack(index);
            if (playing) {
              audio.play();
            }

          } else {
            audio.pause();
            index = 0;
            loadTrack(index);
          }

        }),
        li = $('#plList li').on('click', function () {
          var id = parseInt($(this).index());

          if (id !== index) {
            playTrack(id);
          }
        }),

        loadTrack = function (id) {
          $('.plSel').removeClass('plSel');
          $('#plList li:eq(' + id + ')').addClass('plSel');
          npTitle.text(tracks[id].name);
          index = id;
          audio.src = path + tracks[id].filename + extension;
          updateDownload(id, audio.src);
        },

        updateDownload = function (id, source) {
          player.on('loadedmetadata', function () {
            $('a[data-plyr="download"]').attr('href', source);
          });
        },

        playTrack = function (id) {
          loadTrack(id);
          audio.play();
        };

    extension = audio.canPlayType('audio/mpeg') ? '.mp3' : audio.canPlayType('audio/ogg') ? '.ogg' : '';
    loadTrack(index);

  } else {
    // no audio support
    $('.column').addClass('hidden');
    var noSupport = $('#audio1').text();
    $('.container').append('<p class="no-support">' + noSupport + '</p>');
  }


});

