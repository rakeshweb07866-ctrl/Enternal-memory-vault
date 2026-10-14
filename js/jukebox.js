// ==========================================
// ROMANTIC LOVE JUKEBOX & SHARED PLAYLIST ENGINE
// (With Instagram Note-Style Featured Song Persistence)
// ==========================================

const DEFAULT_PRESET_SONGS = [
  {
    id: 'preset_kesariya',
    title: 'Kesariya • Brahmāstra',
    artist: 'Arijit Singh • Romantic Hit',
    type: 'audio_url',
    url: 'music/keshariyaa.mp3',
    fallbackUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3',
    addedBy: 'Vault Classic ✨',
    isPreset: true
  },
  {
    id: 'preset_tumjoaaye',
    title: 'Tum Jo Aaye • Once Upon A Time',
    artist: 'Rahat Fateh Ali Khan & Tulsi Kumar',
    type: 'audio_url',
    url: 'music/tum-jo-aaye.mp3',
    addedBy: 'Vault Classic ✨',
    isPreset: true
  },
  {
    id: 'preset_sochnasake',
    title: 'Soch Na Sake • Airlift',
    artist: 'Arijit Singh & Tulsi Kumar',
    type: 'audio_url',
    url: 'music/soch-naa-sake.mp3',
    addedBy: 'Vault Classic ✨',
    isPreset: true
  },
  {
    id: 'preset_maula',
    title: 'Maula Mere Maula • Anwar',
    artist: 'Roop Kumar Rathod • Soulful Love',
    type: 'audio_url',
    url: 'music/maula-maula.mp3',
    addedBy: 'Vault Classic ✨',
    isPreset: true
  },
  {
    id: 'preset_sacred_piano',
    title: 'Sacred Love Melody',
    artist: 'Piano & Romantic Strings',
    type: 'audio_url',
    url: 'music/love-song.mp3',
    fallbackUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3',
    addedBy: 'Vault Classic ✨',
    isPreset: true
  },
  {
    id: 'preset_midnight_whispers',
    title: 'Midnight Whispers',
    artist: 'Acoustic Guitar Romance',
    type: 'audio_url',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-memories-romantic-emotional-acoustic-guitar-10825.mp3',
    addedBy: 'Vault Classic ✨',
    isPreset: true
  },
  {
    id: 'preset_moonlight',
    title: 'Moonlight Serenade',
    artist: 'Soft Piano & Cello',
    type: 'audio_url',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7956a.mp3?filename=romantic-love-123472.mp3',
    addedBy: 'Vault Classic ✨',
    isPreset: true
  }
];

let customLoveSongs = [];
let currentSongIndex = 0;
let currentPlayingSong = null;
let isYtDockVisible = false;
let ytPlayer = null;
let isYtReady = false;

// 1. Initial Load of Custom Playlist from LocalStorage
try {
  const savedCustom = localStorage.getItem(PLAYLIST_STORAGE_KEY);
  if (savedCustom) {
    const parsed = JSON.parse(savedCustom);
    if (Array.isArray(parsed)) customLoveSongs = parsed;
  }
} catch (e) {
  customLoveSongs = [];
}

// 2. Resolve Active / Featured Song (Instagram Note Style)
function getFeaturedLoveSong() {
  try {
    const saved = localStorage.getItem(FEATURED_SONG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {}

  // If user has custom added songs, default to their latest added song!
  if (customLoveSongs.length > 0) {
    return customLoveSongs[0];
  }
  return DEFAULT_PRESET_SONGS[0];
}

currentPlayingSong = getFeaturedLoveSong();

// Set Active Featured Song & Persist Across Hard Refreshes & Firebase
function setActiveLoveSong(songObj, broadcastToCloud = true) {
  if (!songObj || !songObj.id) return;
  currentPlayingSong = songObj;

  try {
    localStorage.setItem(FEATURED_SONG_KEY, JSON.stringify(songObj));
  } catch (e) {}

  if (broadcastToCloud && isFirebaseActive && fbDb) {
    try {
      fbDb.ref('vault_featured_song').set(songObj);
    } catch (e) {
      console.warn('Firebase featured song push error:', e);
    }
  }

  // Pre-set audio element source if native audio
  const audio = document.getElementById('bg-music-player');
  if (audio && songObj.type !== 'youtube' && songObj.url) {
    audio.src = songObj.url;
  }

  updateMusicUI(isPlayingMusic);
  updateNowPlayingCard();
  renderLoveJukeboxPlaylist();
}

function getAllLoveSongs() {
  // Custom user songs ALWAYS appear first!
  return [...customLoveSongs, ...DEFAULT_PRESET_SONGS];
}

// Firebase Synchronization
function syncRemoteLovePlaylist(remoteSongs) {
  if (!Array.isArray(remoteSongs)) return;
  const map = new Map();
  remoteSongs.forEach(s => {
    if (s && s.id) map.set(s.id, s);
  });
  customLoveSongs = Array.from(map.values());
  try {
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(customLoveSongs));
  } catch (e) {}
  renderLoveJukeboxPlaylist();
}

function initJukeboxFirebaseSync() {
  if (!isFirebaseActive || !fbDb) return;

  // Listen to remote playlist updates
  fbDb.ref('vault_playlist').on('value', snapshot => {
    const val = snapshot.val();
    const remoteSongs = [];
    if (val) {
      Object.keys(val).forEach(k => {
        if (val[k]) remoteSongs.push(val[k]);
      });
    }
    syncRemoteLovePlaylist(remoteSongs);
  });

  // Listen to shared featured song (Instagram Note sync)
  fbDb.ref('vault_featured_song').on('value', snapshot => {
    const remoteFeatured = snapshot.val();
    if (remoteFeatured && remoteFeatured.id) {
      const isDifferent = !currentPlayingSong || currentPlayingSong.id !== remoteFeatured.id;
      // Apply featured song without re-broadcasting
      setActiveLoveSong(remoteFeatured, false);
      if (isDifferent && isPlayingMusic) {
        playLoveSong(remoteFeatured);
      }
    }
  });
}

// YouTube Iframe API Initialization
function initYouTubePlayer() {
  if (ytPlayer || !window.YT || !window.YT.Player) return;
  const mountEl = document.getElementById('youtube-player-mount');
  if (!mountEl) return;

  const featured = currentPlayingSong || getFeaturedLoveSong();
  const initialVideoId = (featured && featured.type === 'youtube' && featured.videoId) ? featured.videoId : '';

  try {
    ytPlayer = new YT.Player('youtube-player-mount', {
      height: '100%',
      width: '100%',
      videoId: initialVideoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          isYtReady = true;
          const savedVol = Number(localStorage.getItem(VOLUME_KEY) || 0.8);
          try { ytPlayer.setVolume(savedVol * 100); } catch (e) {}

          const current = currentPlayingSong || getFeaturedLoveSong();
          if (current && current.type === 'youtube' && current.videoId) {
            try {
              ytPlayer.cueVideoById(current.videoId);
            } catch (e) {}
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            isPlayingMusic = true;
            updateMusicUI(true);
          } else if (event.data === YT.PlayerState.PAUSED) {
            isPlayingMusic = false;
            updateMusicUI(false);
          } else if (event.data === YT.PlayerState.ENDED) {
            isPlayingMusic = false;
            updateMusicUI(false);
            playNextLoveSong();
          }
        },
        onError: (err) => {
          console.warn('YouTube player warning:', err);
        }
      }
    });
  } catch (err) {
    console.warn('Error mounting YouTube player:', err);
  }
}

window.onYouTubeIframeAPIReady = initYouTubePlayer;
if (window.YT && window.YT.Player) {
  initYouTubePlayer();
}

// UI Modal Controls
function openLoveJukeboxModal() {
  const modal = document.getElementById('love-jukebox-modal');
  if (modal) {
    renderLoveJukeboxPlaylist();
    updateNowPlayingCard();
    modal.classList.remove('hidden');
  }
}

function closeLoveJukeboxModal() {
  const modal = document.getElementById('love-jukebox-modal');
  if (modal) modal.classList.add('hidden');
}

function switchJukeboxTab(tab) {
  const plView = document.getElementById('jukebox-tab-playlist');
  const addView = document.getElementById('jukebox-tab-add');
  const plBtn = document.getElementById('jukebox-tab-btn-playlist');
  const addBtn = document.getElementById('jukebox-tab-btn-add');

  if (tab === 'playlist') {
    if (plView) plView.classList.remove('hidden');
    if (addView) addView.classList.add('hidden');
    if (plBtn) {
      plBtn.className = 'px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-rose-500 text-white shadow-md cursor-pointer';
    }
    if (addBtn) {
      addBtn.className = 'px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 transition-all border border-rose-500/30 cursor-pointer';
    }
  } else {
    if (plView) plView.classList.add('hidden');
    if (addView) addView.classList.remove('hidden');
    if (plBtn) {
      plBtn.className = 'px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 transition-all border border-rose-500/30 cursor-pointer';
    }
    if (addBtn) {
      addBtn.className = 'px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-rose-500 text-white shadow-md cursor-pointer';
    }
  }
}

function renderLoveJukeboxPlaylist() {
  const container = document.getElementById('jukebox-playlist-items');
  const countEl = document.getElementById('jukebox-song-count');
  const songs = getAllLoveSongs();

  if (countEl) countEl.innerText = songs.length;
  if (!container) return;

  container.innerHTML = songs.map((s, idx) => {
    const isCurrent = currentPlayingSong && currentPlayingSong.id === s.id;
    const isYt = s.type === 'youtube';
    const typeBadge = isYt 
      ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-600/30 text-red-300 border border-red-500/30">🔴 YouTube</span>'
      : '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/30">🎵 Audio</span>';
    
    const deleteBtn = !s.isPreset ? `
      <button onclick="deleteCustomLoveSong('${s.id}', event)" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 text-xs transition-all cursor-pointer" title="Remove song">
        🗑️
      </button>
    ` : '';

    return `
      <div onclick="playSongByIndex(${idx})" class="p-3 rounded-xl ${isCurrent ? 'bg-gradient-to-r from-rose-950/80 to-slate-900 border-2 border-rose-400/70 shadow-lg' : 'bg-slate-900/80 hover:bg-slate-850 border border-rose-500/20'} flex items-center justify-between gap-3 cursor-pointer transition-all select-none group">
        <div class="flex items-center gap-3 min-w-0">
          <button class="w-8 h-8 rounded-full ${isCurrent && isPlayingMusic ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-800 group-hover:bg-rose-600 text-slate-300 group-hover:text-white'} flex items-center justify-center text-xs shrink-0 transition-all cursor-pointer">
            ${isCurrent && isPlayingMusic ? '⏸️' : '▶️'}
          </button>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h5 class="text-xs font-bold ${isCurrent ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'} truncate">${escapeChatHtml(s.title)}</h5>
              ${typeBadge}
            </div>
            <div class="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 truncate">
              <span>${escapeChatHtml(s.artist || s.addedBy || 'Romantic Love')}</span>
              <span>•</span>
              <span class="text-rose-300/80">${escapeChatHtml(s.addedBy || 'Added to Vault')}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          ${deleteBtn}
        </div>
      </div>
    `;
  }).join('');
}

function playSongByIndex(idx) {
  const songs = getAllLoveSongs();
  if (idx < 0 || idx >= songs.length) return;
  currentSongIndex = idx;
  playLoveSong(songs[idx]);
}

function playLoveSong(song) {
  if (!song) return;
  setActiveLoveSong(song, true);

  const audio = document.getElementById('bg-music-player');
  const dock = document.getElementById('floating-music-dock');
  const ytToggleBtn = document.getElementById('dock-video-toggle-btn');

  if (dock) dock.classList.remove('hidden');

  if (song.type === 'youtube') {
    if (audio) {
      try { audio.pause(); } catch (e) {}
    }
    if (ytToggleBtn) ytToggleBtn.classList.remove('hidden');

    if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
      try {
        ytPlayer.loadVideoById(song.videoId);
        ytPlayer.playVideo();
        isPlayingMusic = true;
        updateMusicUI(true);
      } catch (e) {
        console.warn('YT load failed:', e);
      }
    } else {
      let attempts = 0;
      const retryInterval = setInterval(() => {
        attempts++;
        if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
          clearInterval(retryInterval);
          try {
            ytPlayer.loadVideoById(song.videoId);
            ytPlayer.playVideo();
            isPlayingMusic = true;
            updateMusicUI(true);
          } catch (e) {}
        } else if (attempts > 20) {
          clearInterval(retryInterval);
        }
      }, 300);
    }
  } else {
    // Native Audio (MP3 / URL / Local Blob)
    if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      try { ytPlayer.pauseVideo(); } catch (e) {}
    }
    if (ytToggleBtn) ytToggleBtn.classList.add('hidden');

    if (audio) {
      if (!audio.src || !audio.src.includes(encodeURI(song.url))) {
        audio.src = song.url;
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isPlayingMusic = true;
          updateMusicUI(true);
        }).catch(err => {
          console.log('Audio playback prevented or error:', err);
          if (song.fallbackUrl) {
            audio.src = song.fallbackUrl;
            audio.play().catch(e => {});
          }
        });
      }
    }
  }

  updateNowPlayingCard();
  renderLoveJukeboxPlaylist();
}

function toggleRomanticMusic() {
  const audio = document.getElementById('bg-music-player');

  if (!currentPlayingSong) {
    currentPlayingSong = getFeaturedLoveSong();
  }

  if (currentPlayingSong.type === 'youtube') {
    if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') {
      playLoveSong(currentPlayingSong);
      return;
    }

    let loadedVideoId = '';
    try {
      const videoData = ytPlayer.getVideoData();
      if (videoData && videoData.video_id) loadedVideoId = videoData.video_id;
    } catch (e) {}

    // If the video currently loaded in the player does not match the active featured song, load and play it!
    if (!loadedVideoId || loadedVideoId !== currentPlayingSong.videoId) {
      playLoveSong(currentPlayingSong);
      return;
    }

    const state = ytPlayer.getPlayerState();
    if (state === 1) { // PLAYING -> Pause
      ytPlayer.pauseVideo();
      isPlayingMusic = false;
      updateMusicUI(false);
    } else { // PAUSED / CUED / UNSTARTED -> Play
      ytPlayer.playVideo();
      isPlayingMusic = true;
      updateMusicUI(true);
    }
  } else {
    if (!audio) return;
    if (!isPlayingMusic) {
      if (!audio.src || audio.src === window.location.href || !audio.src.includes(encodeURI(currentPlayingSong.url))) {
        audio.src = currentPlayingSong.url || 'music/love-song.mp3';
      }
      audio.play().then(() => {
        isPlayingMusic = true;
        updateMusicUI(true);
      }).catch(err => {
        console.log('Audio play error:', err);
      });
    } else {
      audio.pause();
      isPlayingMusic = false;
      updateMusicUI(false);
    }
  }
  updateNowPlayingCard();
  renderLoveJukeboxPlaylist();
}

function playNextLoveSong() {
  const songs = getAllLoveSongs();
  if (!songs.length) return;
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  playLoveSong(songs[currentSongIndex]);
}

function playPrevLoveSong() {
  const songs = getAllLoveSongs();
  if (!songs.length) return;
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playLoveSong(songs[currentSongIndex]);
}

function setLoveMusicVolume(val) {
  const vol = Math.max(0, Math.min(1, Number(val)));
  const audio = document.getElementById('bg-music-player');
  if (audio) audio.volume = vol;
  if (ytPlayer && ytPlayer.setVolume) {
    try { ytPlayer.setVolume(vol * 100); } catch (e) {}
  }
  try {
    localStorage.setItem(VOLUME_KEY, vol);
  } catch (e) {}
}

function toggleYtDockPlayer(forceState) {
  const wrap = document.getElementById('yt-dock-player-wrap');
  if (!wrap) return;
  if (typeof forceState === 'boolean') {
    isYtDockVisible = forceState;
  } else {
    isYtDockVisible = !isYtDockVisible;
  }
  if (isYtDockVisible) {
    wrap.classList.remove('yt-player-dock-hidden');
    wrap.classList.add('yt-player-dock-visible');
  } else {
    wrap.classList.remove('yt-player-dock-visible');
    wrap.classList.add('yt-player-dock-hidden');
  }
}

function updateMusicUI(playing) {
  const song = currentPlayingSong || getFeaturedLoveSong();

  // 1. Nav bar
  const navBtn = document.getElementById('music-toggle-btn');
  const navTitle = document.getElementById('music-title');
  const navStatus = document.getElementById('music-status');
  if (navBtn) navBtn.innerText = playing ? '⏸️' : '▶️';
  if (navTitle && song) {
    navTitle.innerText = '🎵 ' + song.title;
  }
  if (navStatus) {
    navStatus.innerText = playing ? 'Playing Romantic Melody...' : 'Click ▶ to Play Music';
  }

  // 2. Floating Dock
  const dock = document.getElementById('floating-music-dock');
  const dockBtn = document.getElementById('dock-play-btn');
  const dockTitle = document.getElementById('dock-song-title');
  const dockArtist = document.getElementById('dock-song-artist');
  const dockDisc = document.getElementById('dock-vinyl-disc');
  if (dock) dock.classList.remove('hidden');
  if (dockBtn) dockBtn.innerText = playing ? '⏸️' : '▶️';
  if (dockTitle && song) dockTitle.innerText = song.title;
  if (dockArtist && song) dockArtist.innerText = song.addedBy || 'Featured Love Song';
  if (dockDisc) {
    dockDisc.style.animation = playing ? 'spin 4s linear infinite' : 'none';
  }

  // 3. Jukebox Modal
  const jukeBtn = document.getElementById('jukebox-play-btn');
  const jukeVinyl = document.getElementById('jukebox-vinyl');
  if (jukeBtn) jukeBtn.innerText = playing ? '⏸️' : '▶️';
  if (jukeVinyl) {
    jukeVinyl.style.animation = playing ? 'spin 5s linear infinite' : 'none';
  }
}

function updateNowPlayingCard() {
  const song = currentPlayingSong || getFeaturedLoveSong();
  if (!song) return;

  const titleEl = document.getElementById('jukebox-track-title');
  const subEl = document.getElementById('jukebox-track-subtitle');
  const senderEl = document.getElementById('jukebox-sender-tag');
  const typeEl = document.getElementById('jukebox-type-pill');

  if (titleEl) titleEl.innerText = song.title;
  if (subEl) subEl.innerText = song.artist || song.url || '';
  if (senderEl) senderEl.innerText = song.addedBy || 'Featured Love Song';
  if (typeEl) {
    typeEl.innerText = song.type === 'youtube' ? '🔴 YouTube' : '🎵 Audio';
  }
}

// Add Song Handlers
function fillYtQuickSuggest(url, title) {
  const urlInput = document.getElementById('yt-add-input-url');
  const titleInput = document.getElementById('yt-add-input-title');
  if (urlInput) urlInput.value = url;
  if (titleInput) titleInput.value = title;
}

function extractYouTubeVideoId(url) {
  if (!url) return null;
  const str = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = str.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  return null;
}

function showJukeboxStatus(msg, isSuccess = true) {
  const el = document.getElementById('jukebox-add-status');
  if (!el) return;
  el.innerText = msg;
  el.className = 'text-xs font-bold text-center ' + (isSuccess ? 'text-emerald-300' : 'text-rose-400');
  el.classList.remove('hidden');
  setTimeout(() => { el.classList.add('hidden'); }, 3500);
}

function submitAddYouTubeSong() {
  const urlInput = document.getElementById('yt-add-input-url');
  const titleInput = document.getElementById('yt-add-input-title');
  if (!urlInput) return;

  const url = urlInput.value.trim();
  if (!url) {
    showJukeboxStatus('❌ Please enter a YouTube video URL', false);
    return;
  }

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    showJukeboxStatus('❌ Invalid YouTube link! Please check the URL.', false);
    return;
  }

  const myName = currentChatSender ? (currentChatSender.includes('Vanshika') ? 'Vanshika 👸' : 'Rakesh 👑') : 'Rakesh 👑';
  const title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : ('YouTube Song (' + videoId + ')');

  const newSong = {
    id: 'yt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    title: title,
    artist: 'YouTube Video',
    type: 'youtube',
    videoId: videoId,
    url: url,
    addedBy: myName,
    timestamp: new Date().toISOString()
  };

  saveAndBroadcastSong(newSong);

  urlInput.value = '';
  if (titleInput) titleInput.value = '';
  showJukeboxStatus('🎉 Song set as Our Featured Song! Playing now...', true);
  switchJukeboxTab('playlist');
  playLoveSong(newSong);
}

function submitAddDirectAudioSong() {
  const urlInput = document.getElementById('audio-add-input-url');
  const titleInput = document.getElementById('audio-add-input-title');
  if (!urlInput) return;

  const url = urlInput.value.trim();
  if (!url || !url.startsWith('http')) {
    showJukeboxStatus('❌ Please enter a valid audio URL (http/https)', false);
    return;
  }

  const myName = currentChatSender ? (currentChatSender.includes('Vanshika') ? 'Vanshika 👸' : 'Rakesh 👑') : 'Rakesh 👑';
  const title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : 'Romantic Audio Track';

  const newSong = {
    id: 'audio_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    title: title,
    artist: 'Web Audio',
    type: 'audio_url',
    url: url,
    addedBy: myName,
    timestamp: new Date().toISOString()
  };

  saveAndBroadcastSong(newSong);

  urlInput.value = '';
  if (titleInput) titleInput.value = '';
  showJukeboxStatus('🎉 Song set as Our Featured Song! Playing now...', true);
  switchJukeboxTab('playlist');
  playLoveSong(newSong);
}

function handleAudioFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const blobUrl = URL.createObjectURL(file);
  const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
  const myName = currentChatSender ? (currentChatSender.includes('Vanshika') ? 'Vanshika 👸' : 'Rakesh 👑') : 'Rakesh 👑';

  const newSong = {
    id: 'local_' + Date.now(),
    title: cleanTitle,
    artist: 'Uploaded from Device',
    type: 'audio_url',
    url: blobUrl,
    addedBy: myName,
    timestamp: new Date().toISOString()
  };

  customLoveSongs.unshift(newSong);
  renderLoveJukeboxPlaylist();
  switchJukeboxTab('playlist');
  playLoveSong(newSong);
  showJukeboxStatus('🎉 Audio uploaded and playing!', true);
}

function saveAndBroadcastSong(newSong) {
  // Add to top of list
  customLoveSongs.unshift(newSong);
  try {
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(customLoveSongs));
  } catch (e) {}

  // Set as active featured song
  setActiveLoveSong(newSong, true);

  // Broadcast to Firebase Realtime Database
  if (isFirebaseActive && fbDb) {
    try {
      fbDb.ref('vault_playlist/' + newSong.id).set(newSong);
    } catch (e) {
      console.warn('Firebase playlist push error:', e);
    }
  }

  renderLoveJukeboxPlaylist();
}

function deleteCustomLoveSong(songId, event) {
  if (event) event.stopPropagation();
  if (!confirm('Remove this song from your Love Playlist?')) return;

  customLoveSongs = customLoveSongs.filter(s => s.id !== songId);
  try {
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(customLoveSongs));
  } catch (e) {}

  if (isFirebaseActive && fbDb) {
    try {
      fbDb.ref('vault_playlist/' + songId).remove();
    } catch (e) {}
  }

  // If the deleted song was the active song, switch to another song
  if (currentPlayingSong && currentPlayingSong.id === songId) {
    try {
      localStorage.removeItem(FEATURED_SONG_KEY);
    } catch (e) {}
    const nextSong = getFeaturedLoveSong();
    setActiveLoveSong(nextSong, true);
    if (isPlayingMusic) {
      playLoveSong(nextSong);
    } else {
      updateMusicUI(false);
    }
  }

  renderLoveJukeboxPlaylist();
}

// Initial Boot: Set UI to Active / Featured Song immediately (Waits for user to click Play)
document.addEventListener('DOMContentLoaded', () => {
  const initialSong = getFeaturedLoveSong();
  setActiveLoveSong(initialSong, false);

  const bgAudioEl = document.getElementById('bg-music-player');
  if (bgAudioEl) {
    bgAudioEl.addEventListener('play', () => {
      isPlayingMusic = true;
      updateMusicUI(true);
    });
    bgAudioEl.addEventListener('pause', () => {
      if (!currentPlayingSong || currentPlayingSong.type !== 'youtube') {
        isPlayingMusic = false;
        updateMusicUI(false);
      }
    });
    bgAudioEl.addEventListener('ended', () => {
      playNextLoveSong();
    });
    const savedVol = Number(localStorage.getItem(VOLUME_KEY) || 0.8);
    bgAudioEl.volume = savedVol;
  }
});
