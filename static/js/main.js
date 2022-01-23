jQuery(async function ($) {
  'use strict';

  //sprawdzamy, czy format muzyki jest obslugiwany
  var supportsAudio = !!document.createElement('audio').canPlayType;
  if (supportsAudio) {

    // inicjalizujemy player za pomoca biblioteki Plyr
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

    //pobieramy json z informacjami o utworach z api aplikacji
    var response = await fetch(url);
    var json = await response.json();
    var tracks = json.tracks;

    var index = 0,
        playing = false,
        path = 'http://localhost:5000/static/tracks/',
        extension = '',

        //tworzymy playliste
        buildPlaylist = $.each(tracks, function (key, value) {
          var trackNumber = value.id,
              trackName = value.name,
              trackTime = value.time;

          $('#plList').append('<li> \
                    <div class="plItem"> \
                        <span class="plNum">' + trackNumber + '.</span> \
                        <span class="plTitle">' + trackName + '</span> \
                        <span class="plLength">' + trackTime + '</span> \
                    </div> \
                </li>');
        }),


        trackCount = tracks.length,
        npAction = $('#npAction'),
        npTitle = $('#npTitle'),
        //kiedy utwor sie skonczyl, wlacz nastepny
        audio = $('#audio1').on('ended', function () {
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

        //uruchom poprzedni utwor po nacisnieciu na przycisk <-
        btnPrev = $('#btnPrev').on('click', function () {
          if (index - 1 > -1) {
            index--;
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

        //uruchom nastepny utwor po nacisnieciu na przycisk ->
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

        //po nacisnieciu na jakis objekt w liscie, uruchom odpowieni utwor
        li = $('#plList li').on('click', function () {
          var id = parseInt($(this).index());

          if (id !== index) {
            playTrack(id);
          }
        }),

        //funkcja uruchomienia utwora
        loadTrack = function (id) {
          $('.plSel').removeClass('plSel');
          $('#plList li:eq(' + id + ')').addClass('plSel');
          npTitle.text(tracks[id].name);
          index = id;
          audio.src = path + tracks[id].filename + extension;
          updateDownload(id, audio.src);
        },

        //kiedy utwor jest uruchomiony, utworz link do jego pobrania
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

    //jesli typ pliku nie jest obslugiwany
    $('.column').addClass('hidden');
    var noSupport = $('#audio1').text();
    $('.container').append('<p class="no-support">' + noSupport + '</p>');
  }


});

