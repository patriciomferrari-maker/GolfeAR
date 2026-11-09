// Global Application State
let courses = [];
let rounds = [];
let currentChartInstance = null;
let currentChartType = 'hcp'; // 'hcp' or 'strokes'
let currentHistoryTab = 'partial'; // 'complete' or 'partial'
let activeRoundMode = 'front'; // 'front', 'back', or 'full'
let showAdvancedStats = false;
let activeRegisterPutts = Array(18).fill(2);
let activeRegisterPenalties = Array(18).fill(0); // null, 'hit', 'miss'
let calcHolesMode = '9';
let editingRoundId = null;
let supabaseClient = null;
let supabaseConnected = false;
let isSignUpMode = false;
let userSession = null;
let liveRoundActive = false;
let liveCourse = null;
let liveMode = 'front'; // 'front', 'back', or 'full'
let liveHolesList = [];
let liveCurrentIndex = 0;
let liveStrokes = Array(18).fill(0);
let livePutts = Array(18).fill(2);
let livePenalties = Array(18).fill(0);

// Default courses data to seed on first run with official tees and stroke index
const DEFAULT_COURSES = [
  {
    id: "c-san-patricio",
    name: "San Patricio Golf",
    par: 72,
    courseRating: 69.3,
    slopeRating: 119,
    holesPar: [4, 4, 3, 5, 4, 5, 4, 3, 4, 5, 3, 5, 4, 4, 3, 4, 4, 4],
    strokeIndex: [7, 5, 17, 11, 9, 1, 3, 15, 13, 6, 14, 2, 12, 8, 18, 16, 10, 4],
    tees: {
      white: { name: "Blancas", rating: 69.3, slope: 119, distances: [309, 356, 129, 439, 324, 480, 312, 150, 349, 461, 170, 449, 329, 352, 138, 286, 363, 361] },
      blue: { name: "Azules", rating: 70.2, slope: 127, distances: [320, 366, 138, 448, 333, 489, 327, 163, 363, 474, 180, 459, 338, 367, 138, 321, 373, 371] },
      red: { name: "Rojas", rating: 71.8, slope: 120, distances: [267, 320, 117, 402, 316, 410, 277, 128, 306, 416, 160, 423, 296, 308, 124, 246, 316, 323] }
    },
    isCustom: false
  },
  {
    id: "c-silabrador",
    name: "San Isidro Labrador (CASI)",
    par: 71,
    courseRating: 71.0,
    slopeRating: 124,
    holesPar: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 4, 4],
    strokeIndex: [9, 5, 17, 3, 7, 11, 15, 1, 13, 8, 16, 2, 10, 6, 18, 12, 4, 14],
    tees: {
      white: { name: "Blancas", rating: 71.0, slope: 124, distances: [330, 350, 145, 475, 340, 335, 150, 490, 360, 345, 155, 485, 360, 340, 140, 355, 375, 365] },
      blue: { name: "Azules", rating: 72.2, slope: 128, distances: [345, 365, 160, 495, 355, 350, 165, 510, 375, 360, 170, 505, 375, 355, 155, 370, 390, 380] },
      red: { name: "Rojas", rating: 72.0, slope: 121, distances: [290, 305, 125, 420, 300, 295, 130, 430, 315, 300, 135, 425, 315, 295, 120, 310, 325, 320] }
    },
    isCustom: false
  },
  {
    id: "c-costa-9",
    name: "Costa Esmeralda (9 Hoyos)",
    par: 36,
    courseRating: 70.0,
    slopeRating: 120,
    holesPar: [5, 4, 4, 3, 4, 5, 3, 4, 4, 5, 4, 4, 3, 4, 5, 3, 4, 4],
    strokeIndex: [5, 13, 1, 15, 11, 7, 17, 3, 9, 5, 13, 1, 15, 11, 7, 17, 3, 9],
    tees: {
      blue: { name: "Azules", rating: 71.0, slope: 122, distances: [541, 351, 449, 180, 403, 483, 177, 429, 406, 541, 351, 449, 180, 403, 483, 177, 429, 406] },
      white: { name: "Blancas", rating: 70.0, slope: 120, distances: [472, 314, 413, 160, 361, 460, 164, 402, 375, 472, 314, 413, 160, 361, 460, 164, 402, 375] },
      red: { name: "Rojas", rating: 69.0, slope: 118, distances: [445, 271, 383, 140, 342, 374, 126, 320, 361, 445, 271, 383, 140, 342, 374, 126, 320, 361] }
    },
    isCustom: false
  },
  {
    id: "c-costa-18",
    name: "Costa Esmeralda (18 Hoyos)",
    par: 72,
    courseRating: 71.8,
    slopeRating: 125,
    holesPar: [5, 4, 4, 4, 3, 4, 3, 5, 3, 3, 4, 4, 4, 5, 4, 5, 3, 5],
    strokeIndex: [5, 9, 7, 3, 17, 13, 11, 1, 15, 18, 12, 4, 14, 2, 10, 6, 16, 8],
    tees: {
      blue: { name: "Azules", rating: 73.2, slope: 128, distances: [520, 406, 415, 432, 163, 334, 217, 508, 193, 195, 402, 441, 397, 602, 432, 544, 206, 553] },
      white: { name: "Blancas", rating: 71.8, slope: 125, distances: [487, 364, 376, 407, 153, 316, 193, 492, 146, 176, 377, 392, 382, 569, 392, 457, 173, 515] },
      yellow: { name: "Amarillas", rating: 70.4, slope: 121, distances: [471, 354, 344, 371, 146, 286, 166, 428, 130, 149, 333, 370, 347, 522, 364, 432, 160, 468] },
      red: { name: "Rojas", rating: 69.8, slope: 119, distances: [438, 345, 335, 361, 133, 279, 159, 418, 119, 142, 325, 318, 340, 515, 350, 433, 147, 458] }
    },
    isCustom: false
  },
  {
    id: "c-boulogne",
    name: "Boulogne Golf Club",
    par: 70,
    courseRating: 67.5,
    slopeRating: 118,
    holesPar: [4, 3, 4, 4, 4, 4, 4, 3, 5, 4, 3, 4, 4, 4, 4, 4, 3, 5],
    strokeIndex: [5, 17, 7, 3, 9, 11, 13, 15, 1, 6, 18, 8, 4, 10, 12, 14, 16, 2],
    tees: {
      white: { name: "Blancas", rating: 67.5, slope: 118, distances: [310, 140, 325, 320, 315, 305, 320, 135, 460, 310, 130, 325, 315, 320, 310, 315, 135, 470] },
      blue: { name: "Azules", rating: 68.8, slope: 122, distances: [325, 155, 340, 335, 330, 320, 335, 150, 480, 325, 145, 340, 330, 335, 325, 330, 150, 490] },
      red: { name: "Rojas", rating: 69.5, slope: 116, distances: [275, 120, 290, 285, 280, 270, 285, 115, 410, 275, 110, 290, 280, 285, 275, 280, 115, 420] }
    },
    isCustom: false
  },
  {
    id: "c-medal",
    name: "Medal Country Club (Pilar)",
    par: 72,
    courseRating: 70.5,
    slopeRating: 123,
    holesPar: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4],
    strokeIndex: [9, 3, 17, 1, 7, 11, 15, 5, 13, 10, 4, 18, 2, 8, 12, 16, 6, 14],
    tees: {
      white: { name: "Blancas", rating: 70.5, slope: 123, distances: [330, 355, 140, 480, 340, 335, 150, 495, 360, 340, 350, 135, 485, 345, 355, 145, 490, 360] },
      blue: { name: "Azules", rating: 71.8, slope: 127, distances: [345, 370, 155, 495, 355, 350, 165, 510, 375, 355, 365, 150, 500, 360, 370, 160, 505, 375] },
      red: { name: "Rojas", rating: 71.0, slope: 120, distances: [290, 310, 120, 425, 300, 295, 130, 440, 315, 300, 310, 115, 430, 305, 315, 125, 435, 315] }
    },
    isCustom: false
  }
];

// Scorecard inputs state during round entry
let activeRegisterStrokes = Array(18).fill(0);
let liveSelectedTee = "white";
let regSelectedTee = "white";
// Custom course creation holesPar state
let activeCustomCoursePars = Array(18).fill(4);

// Global live timer state variables
let liveRoundStartTime = null;
let liveTimerInterval = null;
let liveHoleStartTime = null;
let liveHolesDuration = Array(18).fill(0);
let liveFir = Array(18).fill('-');
let activeRegisterFir = Array(18).fill('-');
let activeViewedRound = null;
let chartFirInstance = null;
let chartHoleAveragesInstance = null;
let chartMiniInstances = {};

// Multiplayer Live Lobby variables
let activeLobbyId = null;
let lobbyState = null;
let lobbyPollInterval = null;
let lobbyActivePlayerIndex = 0;

// Initialize App on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  updateDashboard();
  renderHistoryTable();
  renderCharts();
  checkActiveLiveRound();

  // Bind sub-tabs in Dashboard & Historial
  document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = btn.parentElement;
      const subtab = btn.getAttribute('data-subtab');
      
      parent.querySelectorAll('.sub-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.style.color = 'var(--text-muted)';
        b.style.backgroundColor = 'transparent';
      });
      
      btn.classList.add('active');
      btn.style.color = '#fff';
      btn.style.backgroundColor = 'var(--border-color)';
      
      const container = parent.parentElement;
      container.querySelectorAll('.subtab-pane').forEach(pane => {
        pane.style.display = 'none';
        pane.classList.remove('active');
      });
      
      const targetPane = document.getElementById('subtab-pane-' + subtab);
      if (targetPane) {
        targetPane.style.display = subtab === 'analysis' ? 'flex' : 'block';
        targetPane.classList.add('active');
      }
      
      if (subtab === 'analysis') {
        renderHoleAnalysisCharts();
    renderTimeEvolutionChart();
        renderTimeEvolutionChart();
      } else if (subtab === 'achievements') {
        renderAchievements();
      } else if (subtab === 'duelos') {
        populateDuelosCompanions();
      }
    });
  });

  // Bind live FIR option buttons
  const btnFirL = document.getElementById('btn-live-fir-l');
  const btnFirC = document.getElementById('btn-live-fir-c');
  const btnFirR = document.getElementById('btn-live-fir-r');
  if (btnFirL && btnFirC && btnFirR) {
    btnFirL.addEventListener('click', () => setLiveFir('L'));
    btnFirC.addEventListener('click', () => setLiveFir('C'));
    btnFirR.addEventListener('click', () => setLiveFir('R'));
  }

  // Bind Duelo companion change listener
  const selectDuelo = document.getElementById('select-duelo-friend');
  if (selectDuelo) {
    selectDuelo.addEventListener('change', (e) => {
      const friend = e.target.value;
      if (!friend) {
        document.getElementById('duelo-dashboard').style.display = 'none';
        document.getElementById('duelo-empty-state').style.display = 'block';
        return;
      }
      renderDueloComparison(friend);
    });
  }

  // Bind Share Social Card buttons
  const btnShareSocial = document.getElementById('btn-share-social-card');
  if (btnShareSocial) {
    btnShareSocial.addEventListener('click', () => {
      if (!activeViewedRound) return;
      generateSocialCard(activeViewedRound);
      openModal('modal-social-card');
    });
  }

  const btnDownloadSocial = document.getElementById('btn-download-social-card');
  if (btnDownloadSocial) {
    btnDownloadSocial.addEventListener('click', () => {
      const canvas = document.getElementById('canvas-social-card');
      if (!canvas) return;
      
      const link = document.createElement('a');
      link.download = 'tarjeta_golf_' + (activeViewedRound ? activeViewedRound.date : 'salida') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  
  // Detect multiplayer lobby invitation in URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlLobbyId = urlParams.get('lobby');
  if (urlLobbyId) {
    window.history.replaceState({}, document.title, window.location.pathname);
    joinMultiplayerLobby(urlLobbyId);
  }
});

// Load data from LocalStorage or seed defaults

async function reconcileFinishedLobbiesWithRounds() {
  if (!supabaseConnected || !supabaseClient || !userSession || !userSession.user) return;
  try {
    const { data: finishedLobbies, error } = await supabaseClient
      .from('golf_live_lobbies')
      .select('*')
      .eq('status', 'finished')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !finishedLobbies) return;

    let updatedAny = false;

    finishedLobbies.forEach(lobby => {
      if (!lobby.players || lobby.players.length < 2) return;
      const myPlayer = lobby.players.find(p => p.user_id === userSession.user.id);
      if (!myPlayer) return;

      const lobbyDateUTC = lobby.created_at ? lobby.created_at.split('T')[0] : null;
      const lobbyDateLocal = lobby.created_at ? new Date(lobby.created_at).toLocaleDateString('en-CA') : null;
      if (!lobbyDateUTC) return;

      const lobbyCourse = courses.find(c => c.id === lobby.course_id) || DEFAULT_COURSES.find(c => c.id === lobby.course_id);
      const holesList = (myPlayer.holes_list && myPlayer.holes_list.length > 0) ? myPlayer.holes_list : Array.from({length: 18}, (_, i) => i);

      // Calculate my total played strokes from lobby
      const myPens = myPlayer.penalties || Array(18).fill(0);
      const myStrokes = myPlayer.strokes || Array(18).fill(0);
      let myTotalStrokes = 0;
      let myPlayedPar = 0;
      let playedHolesCount = 0;
      holesList.forEach(hIdx => {
        if (myStrokes[hIdx] > 0) {
          playedHolesCount++;
          myTotalStrokes += myStrokes[hIdx] + (myPens[hIdx] || 0);
          myPlayedPar += (lobbyCourse && lobbyCourse.holesPar) ? lobbyCourse.holesPar[hIdx] : 4;
        }
      });

      if (playedHolesCount === 0) return;

      // Generate companion scores with hole breakdown including penalties
      const companionScores = lobby.players
        .filter(p => p.user_id !== userSession.user.id)
        .map(p => {
          const pPens = p.penalties || Array(18).fill(0);
          const pStrokesArr = p.strokes || Array(18).fill(0);
          const pStrokes = pStrokesArr.reduce((sum, s, idx) => sum + s + (pPens[idx] || 0), 0);
          const pPar = holesList.reduce((sum, hIdx) => sum + (pStrokesArr[hIdx] > 0 && lobbyCourse ? lobbyCourse.holesPar[hIdx] : 0), 0);
          const pDiff = pStrokes - pPar;
          const pDiffText = pDiff === 0 ? 'E' : (pDiff > 0 ? ('+' + pDiff) : pDiff);
          const hScores = holesList.map(hIdx => (pStrokesArr[hIdx] > 0) ? (pStrokesArr[hIdx] + (pPens[hIdx] || 0)) : 0).join(',');
          const displayName = normalizeFriendName(p.name);
          return displayName + ' (' + pStrokes + ' golpes, ' + pDiffText + ') [H:' + hScores + ']';
        });

      if (companionScores.length === 0) return;

      const newCompanionNotePart = 'Compañeros: ' + companionScores.join(', ');

      // Find matching round in user's rounds
      let matchingRound = rounds.find(r => 
        r.courseId === lobby.course_id && 
        (r.date === lobbyDateUTC || r.date === lobbyDateLocal || Math.abs(new Date(r.date) - new Date(lobbyDateUTC)) <= 86400000)
      );

      if (!matchingRound) {
        // Synthesize restored round from finished multiplayer lobby
        const cRating = lobbyCourse ? lobbyCourse.courseRating : 71;
        const sRating = lobbyCourse ? lobbyCourse.slopeRating : 124;
        let scoreDiff = 0;
        if (playedHolesCount === 18) {
          scoreDiff = (myTotalStrokes - cRating) * (113 / sRating);
        } else {
          scoreDiff = ((myTotalStrokes - (cRating / 2)) * (113 / sRating)) * 2;
        }
        scoreDiff = Math.round(scoreDiff * 10) / 10;

        matchingRound = {
          id: 'round_lobby_' + lobby.id,
          courseId: lobby.course_id,
          date: lobbyDateLocal || lobbyDateUTC,
          strokes: [...myStrokes],
          putts: myPlayer.putts ? [...myPlayer.putts] : Array(18).fill(0),
          penalties: [...myPens],
          totalStrokes: myTotalStrokes,
          playedPar: myPlayedPar,
          scoreDifferential: scoreDiff,
          notes: 'Ronda en tiempo real | ' + newCompanionNotePart,
          course: lobbyCourse
        };
        rounds.unshift(matchingRound);
        updatedAny = true;

        if (supabaseConnected && supabaseClient && userSession && userSession.user) {
          supabaseClient.from('golf_rounds').upsert({
            id: matchingRound.id,
            user_id: userSession.user.id,
            course_id: matchingRound.courseId,
            date: matchingRound.date,
            strokes: matchingRound.strokes,
            putts: matchingRound.putts,
            penalties: matchingRound.penalties,
            total_strokes: matchingRound.totalStrokes,
            played_par: matchingRound.playedPar,
            score_differential: matchingRound.scoreDifferential,
            notes: matchingRound.notes
          }).then(() => {
            console.log('Restored missing multiplayer round in cloud:', matchingRound.id);
          });
        }
      } else {
        let needSave = false;

        // If matching round had fewer holes recorded or missing strokes
        const roundPlayedCount = matchingRound.strokes ? matchingRound.strokes.filter(s => s > 0).length : 0;
        if (roundPlayedCount < playedHolesCount || matchingRound.totalStrokes !== myTotalStrokes) {
          matchingRound.strokes = [...myStrokes];
          if (myPlayer.putts && myPlayer.putts.some(p => p > 0)) {
            matchingRound.putts = [...myPlayer.putts];
          }
          matchingRound.penalties = [...myPens];
          matchingRound.totalStrokes = myTotalStrokes;
          matchingRound.playedPar = myPlayedPar;
          const cRating = lobbyCourse ? lobbyCourse.courseRating : 71;
          const sRating = lobbyCourse ? lobbyCourse.slopeRating : 124;
          let scoreDiff = (playedHolesCount === 18) ? (myTotalStrokes - cRating) * (113 / sRating) : ((myTotalStrokes - (cRating / 2)) * (113 / sRating)) * 2;
          matchingRound.scoreDifferential = Math.round(scoreDiff * 10) / 10;
          needSave = true;
        }

        let currentNotes = matchingRound.notes || '';
        if (!currentNotes.includes(companionScores[0])) {
          if (/Compa(?:ñ|\uFFFD|n)?eros:\s*[^|]+/i.test(currentNotes)) {
            currentNotes = currentNotes.replace(/Compa(?:ñ|\uFFFD|n)?eros:\s*[^|]+/, newCompanionNotePart);
          } else {
            currentNotes = currentNotes ? (currentNotes + ' | ' + newCompanionNotePart) : ('Ronda multijugador | ' + newCompanionNotePart);
          }
          matchingRound.notes = currentNotes;
          needSave = true;
        }

        if (needSave) {
          updatedAny = true;
          if (matchingRound.id && supabaseConnected && supabaseClient && userSession && userSession.user) {
            supabaseClient
              .from('golf_rounds')
              .update({
                strokes: matchingRound.strokes,
                putts: matchingRound.putts,
                penalties: matchingRound.penalties,
                total_strokes: matchingRound.totalStrokes,
                played_par: matchingRound.playedPar,
                score_differential: matchingRound.scoreDifferential,
                notes: matchingRound.notes
              })
              .eq('id', matchingRound.id)
              .then(() => {
                console.log('Successfully updated golf_rounds in cloud for round:', matchingRound.id);
              });
          }
        }
      }
    });

    if (updatedAny) {
      console.log('Reconciled multiplayer companions with final cloud lobby scores!');
      renderHistoryTable();
      updateDashboard();
      if (document.getElementById('select-duelo-friend')) {
        populateDuelosCompanions();
      }
    }
  } catch (err) {
    console.error('Error reconciling finished lobbies:', err);
  }
}

// Ensure Costa Esmeralda rounds and 08/11/2026 CASI rounds are injected for both Pato and Ignacio Gelosi
function ensureCostaRoundsInjected() {
  const course9 = DEFAULT_COURSES.find(c => c.id === 'c-costa-9') || courses.find(c => c.id === 'c-costa-9');
  const casiCourse = DEFAULT_COURSES.find(c => c.id === 'c-silabrador') || courses.find(c => c.id === 'c-silabrador');
  const isIgnacio = userSession && userSession.user && (
    userSession.user.id === '82dfdba3-daed-49fd-8740-279b3740498b' || 
    (userSession.user.email && (userSession.user.email.toLowerCase().includes('ignacio') || userSession.user.email.toLowerCase().includes('gelosi')))
  );

  if (isIgnacio) {
    // ----------------------------------------------------
    // INJECTION FOR IGNACIO GELOSI'S ACCOUNT
    // ----------------------------------------------------
    // 1. Round 13/09/2026 (Ignacio 72 golpes)
    let existing13 = rounds.find(r => r.date === '2026-09-13' && r.courseId === 'c-costa-9');
    if (!existing13) {
      const boyaRound13 = {
        id: 'round_boya_1789344000000',
        courseId: 'c-costa-9',
        date: '2026-09-13',
        strokes: [9, 7, 8, 8, 8, 5, 8, 8, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        putts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        penalties: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalStrokes: 72,
        playedPar: 36,
        scoreDifferential: 69.7,
        notes: 'Ronda de 9 Hoyos | Compañeros: Patricio Ferrari (57 golpes, +21) [H:6,6,12,7,4,7,4,6,5], Juan Castro (68 golpes, +32) [H:8,8,9,7,5,9,5,9,8]',
        course: course9
      };
      rounds.unshift(boyaRound13);
      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        supabaseClient.from('golf_rounds').upsert({
          id: boyaRound13.id,
          user_id: userSession.user.id,
          course_id: boyaRound13.courseId,
          date: boyaRound13.date,
          strokes: boyaRound13.strokes,
          putts: boyaRound13.putts,
          penalties: boyaRound13.penalties,
          total_strokes: boyaRound13.totalStrokes,
          played_par: boyaRound13.playedPar,
          score_differential: boyaRound13.scoreDifferential,
          notes: boyaRound13.notes
        }).then(() => console.log('Saved 13/09 Costa round for Ignacio!'));
      }
    }

    // 2. Round 12/09/2026 (Ignacio 70 golpes con 1 multa H1 y 7 H7)
    let existing12 = rounds.find(r => r.date === '2026-09-12' && r.courseId === 'c-costa-9');
    if (!existing12) {
      const boyaRound12 = {
        id: 'round_boya_1789257600000',
        courseId: 'c-costa-9',
        date: '2026-09-12',
        strokes: [8, 6, 8, 7, 7, 12, 7, 8, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        putts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        penalties: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalStrokes: 70,
        playedPar: 36,
        scoreDifferential: 65.9,
        notes: 'Ronda de 9 Hoyos | Compañeros: Juan Castro (64 golpes, +28) [H:7,6,7,8,7,6,6,10,7], Patricio Ferrari (70 golpes, +34) [H:8,8,7,7,10,10,7,6,7]',
        course: course9
      };
      rounds.unshift(boyaRound12);
      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        supabaseClient.from('golf_rounds').upsert({
          id: boyaRound12.id,
          user_id: userSession.user.id,
          course_id: boyaRound12.courseId,
          date: boyaRound12.date,
          strokes: boyaRound12.strokes,
          putts: boyaRound12.putts,
          penalties: boyaRound12.penalties,
          total_strokes: boyaRound12.totalStrokes,
          played_par: boyaRound12.playedPar,
          score_differential: boyaRound12.scoreDifferential,
          notes: boyaRound12.notes
        }).then(() => console.log('Saved 12/09 Costa round for Ignacio!'));
      }
    }

    // 3. Round 08/11/2026 (San Isidro Labrador CASI 18 Hoyos - Ignacio 123 golpes)
    let existing08Boya = rounds.find(r => r.date === '2026-11-08' && r.courseId === 'c-silabrador');
    if (!existing08Boya) {
      const boyaRound08 = {
        id: 'round_silabrador_boya_20261108',
        courseId: 'c-silabrador',
        date: '2026-11-08',
        strokes: [6, 9, 6, 6, 8, 5, 7, 7, 8, 4, 5, 7, 5, 8, 5, 6, 7, 6],
        putts: [2, 3, 4, 1, 3, 2, 4, 0, 2, 1, 2, 1, 1, 2, 1, 2, 3, 2],
        penalties: [2, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
        totalStrokes: 123,
        playedPar: 71,
        scoreDifferential: 47.4,
        notes: 'Ronda en tiempo real | Duración: 4h 15m | Compañeros: Patricio Ferrari (116 golpes, +45) [H:4,8,8,8,6,7,6,9,4,5,6,6,5,9,6,6,4,9]',
        course: casiCourse
      };
      rounds.unshift(boyaRound08);
      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        supabaseClient.from('golf_rounds').upsert({
          id: boyaRound08.id,
          user_id: userSession.user.id,
          course_id: boyaRound08.courseId,
          date: boyaRound08.date,
          strokes: boyaRound08.strokes,
          putts: boyaRound08.putts,
          penalties: boyaRound08.penalties,
          total_strokes: boyaRound08.totalStrokes,
          played_par: boyaRound08.playedPar,
          score_differential: boyaRound08.scoreDifferential,
          notes: boyaRound08.notes
        }).then(() => console.log('Saved 08/11 CASI round for Ignacio!'));
      }
    } else {
      existing08Boya.notes = 'Ronda en tiempo real | Duración: 4h 15m | Compañeros: Patricio Ferrari (116 golpes, +45) [H:4,8,8,8,6,7,6,9,4,5,6,6,5,9,6,6,4,9]';
      existing08Boya.strokes = [6, 9, 6, 6, 8, 5, 7, 7, 8, 4, 5, 7, 5, 8, 5, 6, 7, 6];
      existing08Boya.putts = [2, 3, 4, 1, 3, 2, 4, 0, 2, 1, 2, 1, 1, 2, 1, 2, 3, 2];
      existing08Boya.penalties = [2, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0];
      existing08Boya.totalStrokes = 123;
      existing08Boya.playedPar = 71;
      existing08Boya.scoreDifferential = 47.4;
      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        supabaseClient.from('golf_rounds').update({
          strokes: existing08Boya.strokes,
          putts: existing08Boya.putts,
          penalties: existing08Boya.penalties,
          total_strokes: 123,
          played_par: 71,
          score_differential: 47.4,
          notes: existing08Boya.notes
        }).eq('id', existing08Boya.id).then(() => {
          console.log('Synchronized 08/11 CASI round for Boya in cloud!');
        });
      }
    }
  } else {
    // ----------------------------------------------------
    // INJECTION FOR PATRICIO'S ACCOUNT
    // ----------------------------------------------------
    // 1. Round 13/09/2026 (Pato 57 golpes)
    let existing13 = rounds.find(r => r.date === '2026-09-13' && r.courseId === 'c-costa-9');
    if (!existing13) {
      const newRound13 = {
        id: 'round_1789344000000',
        courseId: 'c-costa-9',
        date: '2026-09-13',
        strokes: [6, 6, 11, 7, 4, 7, 4, 6, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        putts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        penalties: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalStrokes: 57,
        playedPar: 36,
        scoreDifferential: 41.4,
        notes: 'Ronda de 9 Hoyos | Compañeros: Juan Castro (68 golpes, +32) [H:8,8,9,7,5,9,5,9,8], Boya (Ignacio Gelosi) (72 golpes, +36) [H:9,7,8,8,8,5,8,8,11]',
        course: course9
      };
      rounds.unshift(newRound13);

      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        supabaseClient.from('golf_rounds').upsert({
          id: newRound13.id,
          user_id: userSession.user.id,
          course_id: newRound13.courseId,
          date: newRound13.date,
          strokes: newRound13.strokes,
          putts: newRound13.putts,
          penalties: newRound13.penalties,
          total_strokes: newRound13.totalStrokes,
          played_par: newRound13.playedPar,
          score_differential: newRound13.scoreDifferential,
          notes: newRound13.notes
        }).then(() => console.log('Saved 13/09 Costa round for Patricio!'));
      }
    } else {
      existing13.notes = 'Ronda de 9 Hoyos | Compañeros: Juan Castro (68 golpes, +32) [H:8,8,9,7,5,9,5,9,8], Boya (Ignacio Gelosi) (72 golpes, +36) [H:9,7,8,8,8,5,8,8,11]';
    }

    // 2. Round 12/09/2026 (Pato 70 golpes, Boya 70 golpes [63 + 7 en H7])
    let existing12 = rounds.find(r => r.date === '2026-09-12' && r.courseId === 'c-costa-9');
    if (!existing12) {
      const newRound12 = {
        id: 'round_1789257600000',
        courseId: 'c-costa-9',
        date: '2026-09-12',
        strokes: [8, 8, 7, 7, 10, 10, 7, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        putts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        penalties: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalStrokes: 70,
        playedPar: 36,
        scoreDifferential: 65.9,
        notes: 'Ronda de 9 Hoyos | Compañeros: Juan Castro (64 golpes, +28) [H:7,6,7,8,7,6,6,10,7], Boya (Ignacio Gelosi) (70 golpes, +34) [H:9,6,8,7,7,12,7,8,6]',
        course: course9
      };
      rounds.unshift(newRound12);

      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        supabaseClient.from('golf_rounds').upsert({
          id: newRound12.id,
          user_id: userSession.user.id,
          course_id: newRound12.courseId,
          date: newRound12.date,
          strokes: newRound12.strokes,
          putts: newRound12.putts,
          penalties: newRound12.penalties,
          total_strokes: newRound12.totalStrokes,
          played_par: newRound12.playedPar,
          score_differential: newRound12.scoreDifferential,
          notes: newRound12.notes
        }).then(() => console.log('Saved 12/09 Costa round for Patricio!'));
      }
    } else {
      existing12.notes = 'Ronda de 9 Hoyos | Compañeros: Juan Castro (64 golpes, +28) [H:7,6,7,8,7,6,6,10,7], Boya (Ignacio Gelosi) (70 golpes, +34) [H:9,6,8,7,7,12,7,8,6]';
      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        supabaseClient.from('golf_rounds').update({ notes: existing12.notes }).eq('id', existing12.id).then(() => {});
      }
    }

    // 3. Round 08/11/2026 (San Isidro Labrador CASI 18 Hoyos - Patricio 116 golpes)
    // Remove any incomplete/partial duplicates for 08/11/2026 if present
    rounds = rounds.filter(r => !(r.date === '2026-11-08' && r.courseId === 'c-silabrador' && r.totalStrokes !== 116 && r.id !== 'round_silabrador_20261108' && r.id !== 'round_lobby_G-VACU'));

    let existing08Pato = rounds.find(r => r.date === '2026-11-08' && r.courseId === 'c-silabrador');
    if (!existing08Pato) {
      const patoRound08 = {
        id: 'round_silabrador_20261108',
        courseId: 'c-silabrador',
        date: '2026-11-08',
        strokes: [4, 6, 6, 8, 6, 7, 6, 9, 4, 5, 6, 6, 4, 8, 5, 6, 4, 9],
        putts: [2, 0, 0, 0, 2, 0, 2, 0, 1, 1, 2, 3, 0, 3, 0, 3, 2, 2],
        penalties: [0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
        totalStrokes: 116,
        playedPar: 71,
        scoreDifferential: 41.0,
        notes: 'Ronda en tiempo real | Duración: 4h 15m | Compañeros: Boya (Ignacio Gelosi) (123 golpes, +52) [H:8,10,6,7,8,6,7,8,8,4,5,8,5,9,5,6,7,6]',
        course: casiCourse
      };
      rounds.unshift(patoRound08);

      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        supabaseClient.from('golf_rounds').upsert({
          id: patoRound08.id,
          user_id: userSession.user.id,
          course_id: patoRound08.courseId,
          date: patoRound08.date,
          strokes: patoRound08.strokes,
          putts: patoRound08.putts,
          penalties: patoRound08.penalties,
          total_strokes: patoRound08.totalStrokes,
          played_par: patoRound08.playedPar,
          score_differential: patoRound08.scoreDifferential,
          notes: patoRound08.notes
        }).then(() => console.log('Saved 08/11 CASI round for Patricio!'));
      }
    } else {
      existing08Pato.notes = 'Ronda en tiempo real | Duración: 4h 15m | Compañeros: Boya (Ignacio Gelosi) (123 golpes, +52) [H:8,10,6,7,8,6,7,8,8,4,5,8,5,9,5,6,7,6]';
      existing08Pato.strokes = [4, 6, 6, 8, 6, 7, 6, 9, 4, 5, 6, 6, 4, 8, 5, 6, 4, 9];
      existing08Pato.putts = [2, 0, 0, 0, 2, 0, 2, 0, 1, 1, 2, 3, 0, 3, 0, 3, 2, 2];
      existing08Pato.penalties = [0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0];
      existing08Pato.totalStrokes = 116;
      existing08Pato.playedPar = 71;
      existing08Pato.scoreDifferential = 41.0;
      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        supabaseClient.from('golf_rounds').update({
          strokes: existing08Pato.strokes,
          putts: existing08Pato.putts,
          penalties: existing08Pato.penalties,
          total_strokes: 116,
          played_par: 71,
          score_differential: 41.0,
          notes: existing08Pato.notes
        }).eq('id', existing08Pato.id).then(() => {
          console.log('Synchronized 08/11 CASI round for Patricio in cloud!');
        });
      }
    }
  }
}

async function loadData() {
  // If supabaseClient is configured and logged in, load from cloud
  if (supabaseConnected && supabaseClient && userSession && userSession.user) {
    try {
      // Fetch courses (user custom courses + public defaults)
      const { data: cloudCourses, error: courseErr } = await supabaseClient
        .from('golf_courses')
        .select('*');
        
      if (courseErr) throw courseErr;
      
      // Exclude preloaded courses that were removed from defaults
      const excludedIds = ['c-costa', 'c-jockey', 'c-olivos', 'c-bagolf', 'c-pilar', 'c-sanandres', 'c-palermo', 'c-nautico'];
      // Map PostgreSQL snake_case columns to our JS camelCase object format
      const mappedCloudCourses = cloudCourses
        .filter(c => !excludedIds.includes(c.id))
        .map(c => ({
        id: c.id,
        name: c.name,
        par: c.par,
        courseRating: parseFloat(c.course_rating),
        slopeRating: parseInt(c.slope_rating),
        holesPar: c.holes_par,
        isCustom: c.user_id !== null
      }));

      let mergedCourses = mappedCloudCourses.map(c => {
        const def = DEFAULT_COURSES.find(dc => dc.id === c.id || dc.name.toLowerCase().includes(c.name.split(' (')[0].toLowerCase()));
        if (def) {
          return {
            ...c,
            strokeIndex: def.strokeIndex || c.strokeIndex,
            tees: def.tees || c.tees
          };
        }
        return c;
      });
      // Inject hardcoded defaults if missing in database
      DEFAULT_COURSES.forEach(dc => {
        if (!mergedCourses.some(mc => mc.id === dc.id)) {
          mergedCourses.push(dc);
        }
      });
      courses = mergedCourses;

      // Fetch rounds
      const { data: cloudRounds, error: roundErr } = await supabaseClient
        .from('golf_rounds')
        .select('*')
        .order('date', { ascending: false });
        
      if (roundErr) throw roundErr;
      
      // Map PostgreSQL snake_case columns back to our JS camelCase object format
      rounds = cloudRounds.map(r => ({
        id: r.id,
        courseId: r.course_id,
        date: r.date,
        strokes: r.strokes,
        putts: r.putts,
        penalties: r.penalties,
        totalStrokes: r.total_strokes,
        playedPar: r.played_par,
        scoreDifferential: parseFloat(r.score_differential),
        notes: r.notes,
        course: courses.find(c => c.id === r.course_id) || { name: 'Cancha Desconocida', par: 72, holesPar: Array(18).fill(4) }
      }));
      
    } catch (err) {
      console.error('Error al cargar desde la base de datos:', err);
      loadLocalDataFallback();
    }
  } else {
    loadLocalDataFallback();
  }

  updateDashboard();
  renderHistoryTable();
  renderCharts();
  populateCourseDropdown();
  populateLiveCourseDropdown();
  
  // Populate analysis course selection & refresh analysis charts
  populateAnalysisCourseDropdown();
  renderHoleAnalysisCharts();

  // Populate Duelos companions
  populateDuelosCompanions();

  // Check for active cloud lobbies to recover if logged in
  checkActiveCloudLobby();

  // Ensure Costa Esmeralda 13/09 round is injected
  ensureCostaRoundsInjected();

  // Reconcile with finished cloud lobbies
  reconcileFinishedLobbiesWithRounds();
}

// Save data helper
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Set up UI Event Listeners

// Toggle full-screen live game mode (hides header & bottom tabs, shows live fixed bar)
function updateLiveTrackerVisibility(isActive) {
  document.body.classList.toggle('live-round-active', !!isActive);
  const liveBar = document.getElementById('live-bottom-bar');
  if (liveBar) liveBar.style.display = isActive ? 'flex' : 'none';
  const dropdown = document.getElementById('live-more-dropdown');
  if (dropdown && !isActive) dropdown.style.display = 'none';
}

function setupEventListeners() {
  // Modal toggle listeners
  document.getElementById('btn-open-register').addEventListener('click', () => openModal('modal-register'));
  const btnEmpty = document.getElementById('btn-open-register-empty');
  if (btnEmpty) {
    btnEmpty.addEventListener('click', () => openModal('modal-register'));
  }

  document.getElementById('btn-open-add-course').addEventListener('click', () => {
    closeModal('modal-register');
    openModal('modal-course');
  });

  // Modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.getAttribute('data-close');
      closeModal(modalId);
    });
  });

  // Close modals when clicking overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

    // Change selected course in registration modal
  document.getElementById('reg-course-select').addEventListener('change', (e) => {
    const course = courses.find(c => c.id === e.target.value);
    if (course) {
      activeRegisterStrokes = Array(18).fill(0); // Reset strokes to empty when course changes
      renderScorecardInputs(course);
      updateRegistrationTotals(course);
    }
  });

  // Auto fill pars button
  document.getElementById('btn-autofill-pars').addEventListener('click', () => {
    const courseId = document.getElementById('reg-course-select').value;
    const course = courses.find(c => c.id === courseId);
    if (course) {
      activeRegisterStrokes = [...course.holesPar];
      renderScorecardInputs(course);
      updateRegistrationTotals(course);
    }
  });

  // Chart toggles
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentChartType = e.currentTarget.getAttribute('data-chart');
      renderCharts();
    });
  });

    // History toggles
  document.querySelectorAll('.history-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.history-tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentHistoryTab = e.currentTarget.getAttribute('data-history');
      renderHistoryTable();
    });
  });

  // Main Navigation Toggles
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.getAttribute('data-tab');
      
      // Synchronize active class across both top and bottom nav tabs
      document.querySelectorAll('.nav-tab').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
      });
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      const targetPane = document.getElementById('tab-pane-' + tabId);
      if (targetPane) targetPane.classList.add('active');

      if (tabId === 'dashboard') {
        renderCharts(); // Force chart re-rendering/resizing when container becomes visible
      }
    });
  });

  // Bottom 'Registrar' button opens registration modal
  const btnBottomReg = document.getElementById('btn-bottom-register');
  if (btnBottomReg) {
    btnBottomReg.addEventListener('click', () => openModal('modal-register'));
  }

  // Bottom 'Cuenta' button triggers login / account actions
  const btnBottomAuth = document.getElementById('btn-bottom-auth');
  if (btnBottomAuth) {
    btnBottomAuth.addEventListener('click', () => {
      const authBtn = document.getElementById('btn-auth-action');
      if (authBtn) authBtn.click();
    });
  }

  // Live round options menu (⋯)
  const btnMoreOptions = document.getElementById('btn-live-more-options');
  const liveDropdown = document.getElementById('live-more-dropdown');
  if (btnMoreOptions && liveDropdown) {
    btnMoreOptions.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = liveDropdown.style.display === 'flex' || liveDropdown.style.display === 'block';
      liveDropdown.style.display = isVisible ? 'none' : 'flex';
    });

    document.addEventListener('click', (e) => {
      if (!btnMoreOptions.contains(e.target) && !liveDropdown.contains(e.target)) {
        liveDropdown.style.display = 'none';
      }
    });

    const btnMenuFinish = document.getElementById('btn-menu-finish-round');
    if (btnMenuFinish) {
      btnMenuFinish.addEventListener('click', () => {
        liveDropdown.style.display = 'none';
        finishLiveRound();
      });
    }

    const btnMenuCancel = document.getElementById('btn-menu-cancel-round');
    if (btnMenuCancel) {
      btnMenuCancel.addEventListener('click', () => {
        liveDropdown.style.display = 'none';
        cancelLiveRound();
      });
    }
  }

  // Form submits
  document.getElementById('form-register-round').addEventListener('submit', handleRegisterRoundSubmit);
  document.getElementById('form-add-course').addEventListener('submit', handleAddCourseSubmit);

  // Toggle Advanced Stats
  document.getElementById('btn-toggle-advanced-stats').addEventListener('click', (e) => {
    showAdvancedStats = !showAdvancedStats;
    e.currentTarget.classList.toggle('active', showAdvancedStats);
    const select = document.getElementById('reg-course-select');
    const course = courses.find(c => c.id === select.value);
    if (course) renderScorecardInputs(course);
  });

  // Open Playing Handicap Calculator
  

  // Calculator Modal logic
  

  
  

  

  // Backup Export
  

  // Backup Import
  

  // Live Round Mode Selector Toggles
  document.querySelectorAll('.btn-live-mode').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-live-mode').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      liveMode = e.currentTarget.getAttribute('data-mode');
    });
  });

  // Bind segment toggles for setup view
  const tabCreate = document.getElementById('tab-btn-create-game');
  const tabJoin = document.getElementById('tab-btn-join-game');
  const panelCreate = document.getElementById('panel-create-game');
  const panelJoin = document.getElementById('panel-join-game');

  if (tabCreate && tabJoin && panelCreate && panelJoin) {
    tabCreate.addEventListener('click', () => {
      tabCreate.classList.add('active');
      tabCreate.style.color = '#fff';
      tabCreate.style.backgroundColor = 'var(--border-color)';
      
      tabJoin.classList.remove('active');
      tabJoin.style.color = 'var(--text-muted)';
      tabJoin.style.backgroundColor = 'transparent';
      
      panelCreate.style.display = 'flex';
      panelJoin.style.display = 'none';
    });

    tabJoin.addEventListener('click', () => {
      tabJoin.classList.add('active');
      tabJoin.style.color = '#fff';
      tabJoin.style.backgroundColor = 'var(--border-color)';
      
      tabCreate.classList.remove('active');
      tabCreate.style.color = 'var(--text-muted)';
      tabCreate.style.backgroundColor = 'transparent';
      
      panelCreate.style.display = 'none';
      panelJoin.style.display = 'flex';
    });
  }

  // Start Live Round
  document.getElementById('btn-start-live-round').addEventListener('click', startLiveRound);
  document.getElementById('btn-start-multiplayer-round').addEventListener('click', startMultiplayerRoundSetup);
  document.getElementById('btn-live-share-lobby').addEventListener('click', shareLobbyInvite);

  // Detailed Course & Hole Analysis Event Listeners
  const analysisCourseSelect = document.getElementById('analysis-course-select');
  const analysisNineSelect = document.getElementById('analysis-nine-select');
  
  if (analysisCourseSelect) {
    analysisCourseSelect.addEventListener('change', () => {
      const courseId = analysisCourseSelect.value;
      if (courseId) {
        renderHoleAnalysisCharts();
      } else {
        document.getElementById('course-analysis-content').style.display = 'none';
        document.getElementById('course-analysis-empty').style.display = 'block';
        document.getElementById('course-analysis-empty').querySelector('p').textContent = 'Seleccioná una cancha para analizar tu rendimiento por hoyo.';
      }
    });
  }

  if (analysisNineSelect) {
    analysisNineSelect.addEventListener('change', () => {
      renderHoleAnalysisCharts();
    });
  }

  // Connect to lobby by ID code
  const btnJoinLobbyById = document.getElementById('btn-join-lobby-by-id');
  if (btnJoinLobbyById) {
    btnJoinLobbyById.addEventListener('click', () => {
      if (!supabaseConnected || !supabaseClient) {
        alert('Iniciá sesión en la nube para poder unirte a la ronda de un amigo.');
        return;
      }
      const inputEl = document.getElementById('join-lobby-input-id');
      let code = inputEl ? inputEl.value.trim().toUpperCase() : '';
      if (!code) {
        alert('Ingresá el código de la partida.');
        return;
      }
      if (code.length === 4 && !code.startsWith('G-')) {
        code = 'G-' + code;
      }
      joinMultiplayerLobby(code);
    });
  }

  // Live Navigation & Adjustments
  document.getElementById('btn-live-prev-hole').addEventListener('click', () => {
    if (liveCurrentIndex > 0) {
      const prevIdx = liveHolesList[liveCurrentIndex];
      if (liveHoleStartTime) {
        liveHolesDuration[prevIdx] += (Date.now() - liveHoleStartTime);
      }
      liveHoleStartTime = Date.now();

      liveCurrentIndex--;
      renderLiveHole();
      saveLiveRoundState();
    }
  });

  document.getElementById('btn-live-next-hole').addEventListener('click', () => {
    if (liveCurrentIndex < liveHolesList.length - 1) {
      const prevIdx = liveHolesList[liveCurrentIndex];
      if (liveHoleStartTime) {
        liveHolesDuration[prevIdx] += (Date.now() - liveHoleStartTime);
      }
      liveHoleStartTime = Date.now();

      liveCurrentIndex++;
      renderLiveHole();
      saveLiveRoundState();
    } else if (liveCurrentIndex === liveHolesList.length - 1) {
      // In last hole, button is "Terminar ✓" -> finish round
      finishLiveRound();
    }
  });

  // Adjust Live Stroke
  document.getElementById('btn-live-stroke-dec').addEventListener('click', () => {
    if (!isMyLiveScorecardActive()) return;
    const idx = liveHolesList[liveCurrentIndex];
    if (liveStrokes[idx] > 0) {
      liveStrokes[idx]--;
      updateCurrentHoleDisplay();
      saveLiveRoundState();
      scheduleLobbyDatabaseUpdate();
    }
  });

  document.getElementById('btn-live-stroke-inc').addEventListener('click', () => {
    if (!isMyLiveScorecardActive()) return;
    const idx = liveHolesList[liveCurrentIndex];
    liveStrokes[idx]++;
    updateCurrentHoleDisplay();
    saveLiveRoundState();
    scheduleLobbyDatabaseUpdate();
  });

  // Adjust Live Putt
  document.getElementById('btn-live-putt-dec').addEventListener('click', () => {
    if (!isMyLiveScorecardActive()) return;
    const idx = liveHolesList[liveCurrentIndex];
    if (livePutts[idx] > 0) {
      livePutts[idx]--;
      updateCurrentHoleDisplay();
      saveLiveRoundState();
      scheduleLobbyDatabaseUpdate();
    }
  });

  document.getElementById('btn-live-putt-inc').addEventListener('click', () => {
    if (!isMyLiveScorecardActive()) return;
    const idx = liveHolesList[liveCurrentIndex];
    livePutts[idx]++;
    updateCurrentHoleDisplay();
    saveLiveRoundState();
    scheduleLobbyDatabaseUpdate();
  });

  // Adjust Live Penalty
  document.getElementById('btn-live-penalty-dec').addEventListener('click', () => {
    if (!isMyLiveScorecardActive()) return;
    const idx = liveHolesList[liveCurrentIndex];
    if (livePenalties[idx] > 0) {
      livePenalties[idx]--;
      updateCurrentHoleDisplay();
      saveLiveRoundState();
      scheduleLobbyDatabaseUpdate();
    }
  });

  document.getElementById('btn-live-penalty-inc').addEventListener('click', () => {
    if (!isMyLiveScorecardActive()) return;
    const idx = liveHolesList[liveCurrentIndex];
    livePenalties[idx]++;
    updateCurrentHoleDisplay();
    saveLiveRoundState();
    scheduleLobbyDatabaseUpdate();
  });

  // End / Cancel Live Round
  document.getElementById('btn-cancel-live-round').addEventListener('click', cancelLiveRound);
  document.getElementById('btn-finish-live-round').addEventListener('click', finishLiveRound);

  

  // Modalidad Selector Toggles
  document.querySelectorAll('.btn-modalidad').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-modalidad').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeRoundMode = e.currentTarget.getAttribute('data-mode');
      
      const select = document.getElementById('reg-course-select');
      const course = courses.find(c => c.id === select.value);
      if (course) {
        // Clear strokes for unselected nine holes
        if (activeRoundMode === 'front') {
          for (let i = 9; i < 18; i++) {
            activeRegisterStrokes[i] = 0;
            activeRegisterPenalties[i] = 0;
          }
        } else if (activeRoundMode === 'back') {
          for (let i = 0; i < 9; i++) {
            activeRegisterStrokes[i] = 0;
            activeRegisterPenalties[i] = 0;
          }
        }
        renderScorecardInputs(course);
        updateRegistrationTotals(course);
      }
    });
  });

  // Custom pars grid quick template buttons
  document.querySelectorAll('[data-template]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const template = e.currentTarget.getAttribute('data-template');
      let pars = Array(18).fill(4);
      if (template === '72') {
        pars = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4];
      } else if (template === '71') {
        pars = [4, 4, 3, 5, 4, 4, 3, 4, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4];
      } else if (template === '70') {
        pars = [4, 3, 4, 4, 5, 3, 4, 4, 4, 4, 3, 4, 4, 5, 3, 4, 4, 3];
      }
      activeCustomCoursePars = pars;
      renderCustomParsGrid();
      updateCustomCourseParDisplay();
    });
  });



  // Trigger Auth Actions Button (Login/Logout)
  document.getElementById('btn-auth-action').addEventListener('click', async () => {
    if (userSession) {
      if (confirm('¿Deseas cerrar la sesión? Volverás a ver tus datos locales.')) {
        await supabaseClient.auth.signOut();
        alert('Sesión cerrada.');
      }
    } else {
      const errMsgEl = document.getElementById('auth-error-msg');
      if (errMsgEl) errMsgEl.style.display = 'none';
      openModal('modal-auth');
    }
  });

  // Toggle Login/Register Mode
  const linkToggleAuth = document.getElementById('link-toggle-auth');
  const authTitle = document.getElementById('auth-modal-title');
  const authSubtitle = document.getElementById('auth-modal-subtitle');
  const authSubmitBtn = document.getElementById('btn-auth-submit');

  linkToggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    const errMsgEl = document.getElementById('auth-error-msg');
    if (errMsgEl) errMsgEl.style.display = 'none';
    isSignUpMode = !isSignUpMode;
    if (isSignUpMode) {
      authTitle.textContent = '🔐 Registrarse';
      authSubtitle.textContent = 'Creá una cuenta para empezar a sincronizar tus scorecards.';
      authSubmitBtn.textContent = 'Crear Cuenta';
      linkToggleAuth.textContent = '¿Ya tenés cuenta? Iniciá sesión';
    } else {
      authTitle.textContent = '🔐 Iniciar Sesión';
      authSubtitle.textContent = 'Iniciá sesión para sincronizar tus scorecards en la nube.';
      authSubmitBtn.textContent = 'Iniciar Sesión';
      linkToggleAuth.textContent = '¿No tenés cuenta? Registrate gratis';
    }
  });

  // Handle Authentication Submit Form
  document.getElementById('form-auth').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errMsgEl = document.getElementById('auth-error-msg');
    if (errMsgEl) errMsgEl.style.display = 'none';

    if (!supabaseConnected || !supabaseClient) {
      alert('Primero debés configurar la conexión a Supabase.');
      return;
    }

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = isSignUpMode ? 'Registrando...' : 'Ingresando...';

    try {
      if (isSignUpMode) {
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;
        alert('¡Registro exitoso! Ya podés iniciar sesión con tus credenciales.');
        isSignUpMode = false;
        authTitle.textContent = '🔐 Iniciar Sesión';
        authSubtitle.textContent = 'Iniciá sesión para sincronizar tus scorecards en la nube.';
        authSubmitBtn.textContent = 'Iniciar Sesión';
        linkToggleAuth.textContent = '¿No tenés cuenta? Registrate gratis';
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        closeModal('modal-auth');
      }
    } catch (err) {
      console.error('Error de autenticación Supabase:', err);
      if (errMsgEl) {
        errMsgEl.textContent = err.message || JSON.stringify(err);
        errMsgEl.style.display = 'block';
      } else {
        alert('Error de Autenticación: ' + err.message);
      }
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = isSignUpMode ? 'Crear Cuenta' : 'Iniciar Sesión';
    }
  });


}

// Modal open/close helpers
function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add('active');

  if (id === 'modal-register') {
    // Populate course dropdown
    populateCourseDropdown();
    // Default date to today
    document.getElementById('reg-date').value = new Date().toISOString().split('T')[0];
    
    // Auto-select first course in list
        if (courses.length > 0) {
      const firstCourseId = courses[0].id;
      document.getElementById('reg-course-select').value = firstCourseId;
      const course = courses.find(c => c.id === firstCourseId);
      activeRegisterStrokes = Array(18).fill(0); // Start with 0 (unplayed / '-')
      activeRegisterFir = Array(18).fill('-');
      renderScorecardInputs(course);
      updateRegistrationTotals(course);
    }
  } else if (id === 'modal-course') {
    activeCustomCoursePars = Array(18).fill(4);
    renderCustomParsGrid();
    updateCustomCourseParDisplay();
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  if (id === 'modal-register') {
    editingRoundId = null;
    const titleEl = document.getElementById('modal-register').querySelector('.modal-title');
    if (titleEl) titleEl.textContent = 'Registrar Salida';
    const submitBtn = document.getElementById('modal-register').querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Registrar Salida';
  }
}

// Populate course selector in registration modal
function populateCourseDropdown() {
  const select = document.getElementById('reg-course-select');
  select.innerHTML = '';
  courses.forEach(course => {
    const opt = document.createElement('option');
    opt.value = course.id;
    opt.textContent = course.name;
    select.appendChild(opt);
  });
}

function populateLiveCourseDropdown() {
  const select = document.getElementById('live-course-select');
  if (!select) return;
  select.innerHTML = '';
  courses.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

// Render dynamic inputs in Registration scorecard
function renderScorecardInputs(course) {
  const frontGrid = document.getElementById('front-holes-grid');
  const backGrid = document.getElementById('back-holes-grid');
  
  frontGrid.innerHTML = '';
  backGrid.innerHTML = '';

    for (let i = 0; i < 18; i++) {
    const holeNum = i + 1;
    const par = course.holesPar[i] || 4;
    const strokes = activeRegisterStrokes[i] || 0; // Default to 0 (unplayed)
    activeRegisterStrokes[i] = strokes;

    const holeBox = document.createElement('div');
    holeBox.className = 'hole-box';
    updateHoleBoxColor(holeBox, strokes, par);

    let extraStatsHtml = '';
    if (showAdvancedStats && strokes > 0) {
      extraStatsHtml = '<div class="hole-extra-stats">' +
        '  <div class="putts-control">' +
        '    <button type="button" class="putts-btn" onclick="adjustHolePutts(' + i + ', -1)">&minus;</button>' +
        '    <input type="text" class="putts-input" id="reg-putts-h' + i + '" value="' + activeRegisterPutts[i] + '">' +
        '    <button type="button" class="putts-btn" onclick="adjustHolePutts(' + i + ', 1)">&plus;</button>' +
        '    <span style="font-size: 0.55rem; color: var(--text-muted); font-weight: bold; margin-left: 0.1rem;">P</span>' +
        '  </div>' +
        '  <div class="putts-control">' +
        '    <button type="button" class="putts-btn" onclick="adjustHolePenalty(' + i + ', -1)">&minus;</button>' +
        '    <input type="text" class="putts-input" id="reg-penalties-h' + i + '" value="' + (activeRegisterPenalties[i] || 0) + '">' +
        '    <button type="button" class="putts-btn" onclick="adjustHolePenalty(' + i + ', 1)">&plus;</button>' +
        '    <span style="font-size: 0.55rem; color: var(--text-muted); font-weight: bold; margin-left: 0.1rem;">M</span>' +
        '  </div>' +
        '</div>';
    }

    let relClass = '';
    let relText = '';
    if (strokes > 0) {
      const diff = strokes - par;
      if (diff === 0) {
        relText = '(E)';
        relClass = 'rel-even';
      } else if (diff > 0) {
        relText = '(+' + diff + ')';
        relClass = 'rel-over';
      } else {
        relText = '(' + diff + ')';
        relClass = 'rel-under';
      }
    }

    holeBox.innerHTML = '<span class="hole-name">Hoyo ' + holeNum + '</span>' +
      '<span class="hole-par">Par ' + par + ' <span class="hole-rel ' + relClass + '" id="reg-rel-h' + i + '">' + relText + '</span></span>' +
      '<div class="hole-controls">' +
      '  <button type="button" class="hole-btn" onclick="adjustHoleStroke(' + i + ', -1)">&minus;</button>' +
      '  <input type="text" class="hole-input" id="reg-strokes-h' + i + '" value="' + (strokes === 0 ? '-' : strokes) + '">' +
      '  <button type="button" class="hole-btn" onclick="adjustHoleStroke(' + i + ', 1)">&plus;</button>' +
      '</div>' + extraStatsHtml;

    if (i < 9) {
      frontGrid.appendChild(holeBox);
    } else {
      backGrid.appendChild(holeBox);
    }
  }

  // Toggle visibility of front/back scorecard containers based on mode
  document.getElementById('front-nine-container').style.display = (activeRoundMode === 'front' || activeRoundMode === 'full') ? 'block' : 'none';
  document.getElementById('back-nine-container').style.display = (activeRoundMode === 'back' || activeRoundMode === 'full') ? 'block' : 'none';
}

// Adjust single hole putts
window.adjustHolePutts = function(index, amount) {
  const select = document.getElementById('reg-course-select');
  const course = courses.find(c => c.id === select.value);
  if (!course) return;

  const currentPutts = activeRegisterPutts[index] || 2;
  const newPutts = Math.max(0, currentPutts + amount);
  activeRegisterPutts[index] = newPutts;

  const input = document.getElementById('reg-putts-h' + index);
  if (input) input.value = newPutts;
};

// Adjust single hole penalty
window.adjustHolePenalty = function(index, amount) {
  const select = document.getElementById('reg-course-select');
  const course = courses.find(c => c.id === select.value);
  if (!course) return;

  const currentPenalties = activeRegisterPenalties[index] || 0;
  const newPenalties = Math.max(0, currentPenalties + amount);
  activeRegisterPenalties[index] = newPenalties;

  const input = document.getElementById('reg-penalties-h' + index);
  if (input) input.value = newPenalties;
};

// Adjust single hole score
window.adjustHoleStroke = function(index, amount) {
  const select = document.getElementById('reg-course-select');
  const course = courses.find(c => c.id === select.value);
  if (!course) return;

  const currentScore = activeRegisterStrokes[index];
  
  // If starting from 0 (empty) and clicking plus, set it to the hole's par first
  let newScore = currentScore;
  if (currentScore === 0 && amount > 0) {
    newScore = course.holesPar[index];
  } else {
    newScore = Math.max(0, currentScore + amount);
  }
  
  activeRegisterStrokes[index] = newScore;

  // Update input value
  const input = document.getElementById('reg-strokes-h' + index);
  if (input) input.value = newScore === 0 ? '-' : newScore;

  // Update background box color
  const holeBox = input.closest('.hole-box');
  if (holeBox) updateHoleBoxColor(holeBox, newScore, course.holesPar[index]);

  // Update relative score span
  const relSpan = document.getElementById('reg-rel-h' + index);
  if (relSpan) {
    relSpan.className = 'hole-rel';
    if (newScore === 0) {
      relSpan.textContent = '';
    } else {
      const diff = newScore - course.holesPar[index];
      if (diff === 0) {
        relSpan.textContent = '(E)';
        relSpan.classList.add('rel-even');
      } else if (diff > 0) {
        relSpan.textContent = '(+' + diff + ')';
        relSpan.classList.add('rel-over');
      } else {
        relSpan.textContent = '(' + diff + ')';
        relSpan.classList.add('rel-under');
      }
    }
  }

  // Recalculate totals
  updateRegistrationTotals(course);
};

// Help style hole background color relative to par
function updateHoleBoxColor(element, strokes, par) {
  element.classList.remove('hole-birdie', 'hole-eagle', 'hole-bogey', 'hole-double');
  if (strokes === 0) return; // Neutral background for unplayed holes
  const diff = strokes - par;
  if (diff === -1) {
    element.classList.add('hole-birdie');
  } else if (diff <= -2) {
    element.classList.add('hole-eagle');
  } else if (diff === 1) {
    element.classList.add('hole-bogey');
  } else if (diff >= 2) {
    element.classList.add('hole-double');
  }
}

// Update scorecard totals in registration modal
function updateRegistrationTotals(course) {
  const frontStrokesList = activeRegisterStrokes.slice(0, 9);
  const backStrokesList = activeRegisterStrokes.slice(9, 18);

  const frontPenaltiesList = activeRegisterPenalties.slice(0, 9);
  const backPenaltiesList = activeRegisterPenalties.slice(9, 18);

  const frontStrokes = frontStrokesList.filter(s => s > 0).reduce((sum, v, idx) => sum + v + (frontPenaltiesList[idx] || 0), 0);
  const backStrokes = backStrokesList.filter(s => s > 0).reduce((sum, v, idx) => sum + v + (backPenaltiesList[idx] || 0), 0);
  const totalStrokes = frontStrokes + backStrokes;

  // Only sum the par of holes that were actually played
  const frontPar = course.holesPar.slice(0, 9).reduce((sum, p, idx) => sum + (frontStrokesList[idx] > 0 ? p : 0), 0);
  const backPar = course.holesPar.slice(9, 18).reduce((sum, p, idx) => sum + (backStrokesList[idx] > 0 ? p : 0), 0);
  const totalPar = frontPar + backPar;

  document.getElementById('front-summary-label').textContent = 'Par: ' + frontPar + ' | Golpes: ' + frontStrokes;
  document.getElementById('back-summary-label').textContent = 'Par: ' + backPar + ' | Golpes: ' + backStrokes;
  
  document.getElementById('summary-total-par').textContent = totalPar;
  document.getElementById('summary-total-strokes').textContent = totalStrokes;

  const scoreLabel = document.getElementById('summary-relative-score');
  scoreLabel.className = 'stat-val';

  if (totalPar === 0) {
    scoreLabel.textContent = '-';
  } else {
    const diff = totalStrokes - totalPar;
    if (diff === 0) {
      scoreLabel.textContent = 'E';
      scoreLabel.classList.add('text-amber');
    } else if (diff > 0) {
      scoreLabel.textContent = '+' + diff;
      scoreLabel.classList.add('text-red');
    } else {
      scoreLabel.textContent = diff;
      scoreLabel.classList.add('text-emerald');
    }
  }
}

// Render configuration pars grid for custom courses
function renderCustomParsGrid() {
  const grid = document.getElementById('course-pars-grid');
  grid.innerHTML = '';

  for (let i = 0; i < 18; i++) {
    const holeNum = i + 1;
    const currentPar = activeCustomCoursePars[i] || 4;

    const selectBox = document.createElement('div');
    selectBox.className = 'par-select-box';
    selectBox.innerHTML = '<span class="par-select-label">Hoyo ' + holeNum + '</span>' +
      '<div class="par-select-options">' +
      '  <button type="button" class="par-option-btn' + (currentPar === 3 ? ' active' : '') + '" onclick="setCustomHolePar(' + i + ', 3)">3</button>' +
      '  <button type="button" class="par-option-btn' + (currentPar === 4 ? ' active' : '') + '" onclick="setCustomHolePar(' + i + ', 4)">4</button>' +
      '  <button type="button" class="par-option-btn' + (currentPar === 5 ? ' active' : '') + '" onclick="setCustomHolePar(' + i + ', 5)">5</button>' +
      '</div>';
    grid.appendChild(selectBox);
  }
}

window.setCustomHolePar = function(index, parValue) {
  activeCustomCoursePars[index] = parValue;
  renderCustomParsGrid();
  updateCustomCourseParDisplay();
};

function updateCustomCourseParDisplay() {
  const total = activeCustomCoursePars.reduce((sum, v) => sum + v, 0);
  document.getElementById('course-par-display').textContent = total;
}

// Calculate handicap metrics and WHS
function updateDashboard() {
  // Sort rounds chronologically descending (newest first) for accurate calculations
  rounds.sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalRounds = rounds.length;
  document.getElementById('val-rounds').textContent = totalRounds;
  document.getElementById('footer-rounds').textContent = totalRounds > 0 ? ('Desde el ' + formatDate(rounds[totalRounds - 1].date)) : 'No hay registros';

  if (totalRounds === 0) {
    document.getElementById('val-hcp').textContent = 'N/A';
    document.getElementById('footer-hcp').textContent = 'Ingresá salidas para calcular';
    document.getElementById('val-best').textContent = 'N/A';
    document.getElementById('footer-best').textContent = '-';
    document.getElementById('val-avg').textContent = 'N/A';
    return;
  }

    // 1. Promedio golpes (calculated strictly on a 9-Hole basis for intuitive reference)
  let nineHoleSegments = [];
  rounds.forEach(r => {
    const front = r.strokes.slice(0, 9);
    const back = r.strokes.slice(9, 18);
    const frontPlayed = front.filter(s => s > 0).length === 9;
    const backPlayed = back.filter(s => s > 0).length === 9;
    
    if (frontPlayed) nineHoleSegments.push(front.reduce((a, b) => a + b, 0));
    if (backPlayed) nineHoleSegments.push(back.reduce((a, b) => a + b, 0));
  });

  const avg9 = nineHoleSegments.length > 0
    ? (nineHoleSegments.reduce((a, b) => a + b, 0) / nineHoleSegments.length).toFixed(1)
    : 'N/A';
  document.getElementById('val-avg').textContent = avg9;

  // 2. Mejor ronda (lowest completed 9-hole segment across all rounds)
  let best9 = Infinity;
  let best9Course = '-';
  let best9Diff = 0;
  
  rounds.forEach(r => {
    const front = r.strokes.slice(0, 9);
    const back = r.strokes.slice(9, 18);
    const frontPlayed = front.filter(s => s > 0).length === 9;
    const backPlayed = back.filter(s => s > 0).length === 9;
    
    const courseNameShort = r.course.name.split(' - ')[0];

    if (frontPlayed) {
      const sum = front.reduce((a, b) => a + b, 0);
      const par = r.course.holesPar.slice(0, 9).reduce((a, b) => a + b, 0);
      if (sum < best9) {
        best9 = sum;
        best9Course = courseNameShort + ' (Ida)';
        best9Diff = sum - par;
      }
    }
    if (backPlayed) {
      const sum = back.reduce((a, b) => a + b, 0);
      const par = r.course.holesPar.slice(9, 18).reduce((a, b) => a + b, 0);
      if (sum < best9) {
        best9 = sum;
        best9Course = courseNameShort + ' (Vta)';
        best9Diff = sum - par;
      }
    }
  });

  if (best9 !== Infinity) {
    const relativeScoreText = best9Diff === 0 ? 'E' : (best9Diff > 0 ? '+' + best9Diff : best9Diff);
    document.getElementById('val-best').textContent = best9;
    document.getElementById('footer-best').textContent = best9Course + ' (' + relativeScoreText + ')';
  } else {
    document.getElementById('val-best').textContent = 'N/A';
    document.getElementById('footer-best').textContent = 'Mín. 1 salida de 9H';
  }

  // 3. Handicap Index (WHS) - Only use rounds with at least 9 holes completed
  const validHcpRounds = rounds.filter(r => r.strokes.filter(s => s > 0).length >= 9);
  const recent20 = validHcpRounds.slice(0, 20);
  const n = recent20.length;
  const sortedDiffs = recent20.map(r => r.scoreDifferential).sort((a, b) => a - b);

  let numToUse = 1;
  let adjustment = 0;

  if (n >= 20) { numToUse = 8; }
  else if (n === 19) { numToUse = 7; }
  else if (n >= 17) { numToUse = 6; }
  else if (n >= 15) { numToUse = 5; }
  else if (n >= 12) { numToUse = 4; }
  else if (n >= 9) { numToUse = 3; }
  else if (n >= 7) { numToUse = 2; }
  else if (n === 6) { numToUse = 2; adjustment = -1.0; }
  else if (n === 5) { numToUse = 1; }
  else if (n === 4) { numToUse = 1; adjustment = -1.0; }
  else if (n === 3) { numToUse = 1; adjustment = -2.0; }
  else {
    numToUse = n;
  }

  if (n === 0) {
    document.getElementById('val-hcp').textContent = 'N/A';
    document.getElementById('footer-hcp').textContent = 'Mín. 3 rondas >= 9 hoyos (actual: 0)';
  } else {
    const bestDiffs = sortedDiffs.slice(0, numToUse);
    const sum = bestDiffs.reduce((a, b) => a + b, 0);
    let indexVal = (sum / numToUse) + adjustment;

    if (indexVal > 54.0) indexVal = 54.0;
    if (indexVal < -10.0) indexVal = -10.0;

    const finalHcp = Math.round(indexVal * 10) / 10;
    document.getElementById('val-hcp').textContent = finalHcp.toFixed(1);
    
    if (n < 3) {
      document.getElementById('footer-hcp').textContent = 'Mín. 3 rondas >= 9 hoyos (actual: ' + n + ')';
    } else {
      document.getElementById('footer-hcp').textContent = 'Calculado con las mejores ' + numToUse + ' de ' + n + ' rondas';
    }
  }
}

// Render Rounds History Cards
function renderHistoryTable() {
  const listContainer = document.getElementById('history-list');
  const emptyMsg = document.getElementById('empty-table-msg');
  if (!listContainer) return;
  
  listContainer.innerHTML = '';

  // Sort rounds chronologically descending (newest first) before rendering
  rounds.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter rounds by selected tab (complete = 18 holes, partial < 18 holes)
  const filteredRounds = rounds.filter(r => {
    const playedHoles = r.strokes.filter(s => s > 0).length;
    return currentHistoryTab === 'complete' ? (playedHoles === 18) : (playedHoles < 18);
  });

  if (filteredRounds.length === 0) {
    emptyMsg.style.display = 'flex';
    listContainer.style.display = 'none';
    emptyMsg.querySelector('p').textContent = currentHistoryTab === 'complete'
      ? 'No tenés salidas de 18 hoyos registradas.'
      : 'No tenés salidas parciales registradas.';
    return;
  }

  emptyMsg.style.display = 'none';
  listContainer.style.display = 'flex';

  filteredRounds.forEach((round) => {
    const playedHolesCount = round.strokes.filter(s => s > 0).length;
    
    // Count scores breakdown
    let birdies = 0;
    let pars = 0;
    let bogeys = 0;
    let doubles = 0;

    round.strokes.forEach((stroke, idx) => {
      if (stroke > 0) {
        const parVal = round.course.holesPar[idx];
        const diff = stroke - parVal;
        if (diff <= -1) birdies++;
        else if (diff === 0) pars++;
        else if (diff === 1) bogeys++;
        else if (diff >= 2) doubles++;
      }
    });

    let pillsHtml = '<div class="row-scores-breakdown" style="justify-content: flex-start;">';
    if (birdies > 0) pillsHtml += '<span class="score-pill pill-birdie" title="' + birdies + ' Birdies / Eagles">' + birdies + '</span>';
    if (pars > 0) pillsHtml += '<span class="score-pill pill-par" title="' + pars + ' Pars">' + pars + '</span>';
    if (bogeys > 0) pillsHtml += '<span class="score-pill pill-bogey" title="' + bogeys + ' Bogeys">' + bogeys + '</span>';
    if (doubles > 0) pillsHtml += '<span class="score-pill pill-double" title="' + doubles + ' Dobles o peor">' + doubles + '</span>';
    pillsHtml += '</div>';

    const playedPar = round.playedPar || round.course.par;
    const diff = round.totalStrokes - playedPar;
    let relativeScore = diff === 0 ? 'E' : (diff > 0 ? ('+' + diff) : diff);
    let relativeColor = 'text-amber';
    if (diff > 0) relativeColor = 'text-red';
    if (diff < 0) relativeColor = 'text-emerald';

    const card = document.createElement('div');
    card.className = 'history-card';
    
    card.innerHTML = `
      <div class="hc-header">
        <div class="hc-course-info">
          <span class="hc-course-name">${round.course.name.split(' - ')[0]}</span>
          <span class="hc-date">${formatDate(round.date)}</span>
        </div>
        <div class="hc-score-badge ${relativeColor}">${relativeScore}</div>
      </div>
      
      <div class="hc-stats-grid">
        <div class="hc-stat">
          <span class="hc-stat-label">Golpes</span>
          <span class="hc-stat-val text-white">${round.totalStrokes}</span>
        </div>
        <div class="hc-stat">
          <span class="hc-stat-label">Hoyos</span>
          <span class="hc-stat-val text-white">${playedHolesCount}</span>
        </div>
        <div class="hc-stat">
          <span class="hc-stat-label">Par</span>
          <span class="hc-stat-val">${playedPar}</span>
        </div>
        <div class="hc-stat">
          <span class="hc-stat-label">Diff. HCP</span>
          <span class="hc-stat-val text-blue">${round.scoreDifferential.toFixed(1)}</span>
        </div>
      </div>
      
      <div class="hc-pills">
        <span class="hc-stat-label" style="display:none;">Rendimiento</span>
        ${pillsHtml}
      </div>
      
      <div class="hc-actions">
        <button class="btn btn-outline" onclick="viewScorecard('${round.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          Ver Detalle
        </button>
        <div class="hc-actions-group">
          <button class="btn btn-ghost" onclick="editRound('${round.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn btn-ghost text-red" onclick="promptDeleteRound('${round.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </div>
    `;
    
    listContainer.appendChild(card);
  });
}

// Render dynamic charts using Chart.js
const chartDatalabelsPlugin = {
  id: 'chartDatalabels',
  afterDatasetsDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    ctx.save();
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    chart.data.datasets.forEach((dataset, datasetIdx) => {
      // Exclude helper/reference lines from getting labels
      const lbl = (dataset.label || '').toLowerCase();
      if (lbl.includes('par')) return;
      
      const meta = chart.getDatasetMeta(datasetIdx);
      if (!meta || meta.hidden) return;
      
      meta.data.forEach((element, index) => {
        const val = dataset.data[index];
        if (val === null || val === undefined) return;
        
        const x = element.x;
        const y = element.y;
        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) return;
        
        const text = String(val);
        const textWidth = ctx.measureText(text).width;
        const pillW = textWidth + 8;
        const pillH = 14;
        const pillX = x - pillW / 2;
        
        // If pill would go above chart area, draw BELOW the point instead
        let pillY = y - pillH - 4;
        let textY;
        if (pillY < chartArea.top) {
          pillY = y + 4;
          textY = pillY + pillH - 2;
        } else {
          textY = pillY + pillH - 2;
        }
        
        // Draw rounded pill background
        const r = 3;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.beginPath();
        ctx.moveTo(pillX + r, pillY);
        ctx.lineTo(pillX + pillW - r, pillY);
        ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
        ctx.lineTo(pillX + pillW, pillY + pillH - r);
        ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
        ctx.lineTo(pillX + r, pillY + pillH);
        ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
        ctx.lineTo(pillX, pillY + r);
        ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
        ctx.closePath();
        ctx.fill();
        
        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, x, textY);
      });
    });
    ctx.restore();
  }
};

function renderCharts() {
  const canvas = document.getElementById('evolutionChart');
  const emptyMsg = document.getElementById('empty-chart-msg');

  if (rounds.length === 0) {
    emptyMsg.style.display = 'flex';
    canvas.style.display = 'none';
    return;
  }

  emptyMsg.style.display = 'none';
  canvas.style.display = 'block';

  // Sort chronological (oldest first)
  const chronologicalRounds = [...rounds].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = chronologicalRounds.map(r => {
    const d = new Date(r.date);
    return d.getUTCDate() + '/' + (d.getUTCMonth() + 1);
  });

  // Calculate chronological running handicap index
  const runningHcps = chronologicalRounds.map((round, index) => {
    const roundsUpToNow = chronologicalRounds.slice(0, index + 1);
    const recentRounds = roundsUpToNow.slice(-20);
    const n = recentRounds.length;
    const sortedDiffs = recentRounds.map(r => r.scoreDifferential).sort((a, b) => a - b);
    
    let numToUse = 1;
    let adjustment = 0;

    if (n >= 20) { numToUse = 8; }
    else if (n === 19) { numToUse = 7; }
    else if (n >= 17) { numToUse = 6; }
    else if (n >= 15) { numToUse = 5; }
    else if (n >= 12) { numToUse = 4; }
    else if (n >= 9) { numToUse = 3; }
    else if (n >= 7) { numToUse = 2; }
    else if (n === 6) { numToUse = 2; adjustment = -1.0; }
    else if (n === 5) { numToUse = 1; }
    else if (n === 4) { numToUse = 1; adjustment = -1.0; }
    else if (n === 3) { numToUse = 1; adjustment = -2.0; }
    else {
      numToUse = n;
    }

    const bestDiffs = sortedDiffs.slice(0, numToUse);
    const sum = bestDiffs.reduce((a, b) => a + b, 0);
    let calculatedIndex = (sum / numToUse) + adjustment;

    if (calculatedIndex > 54.0) calculatedIndex = 54.0;
    if (calculatedIndex < -10.0) calculatedIndex = -10.0;

    return Math.round(calculatedIndex * 10) / 10;
  });

    const differentials = chronologicalRounds.map(r => Math.round(r.scoreDifferential * 10) / 10);
  
  // Plot strokes on a 9-hole equivalent baseline (standard Par 36)
  const strokes = chronologicalRounds.map(r => {
    const playedPar = r.playedPar || r.course.par;
    const playedHolesCount = r.strokes.filter(s => s > 0).length;
    if (playedHolesCount === 9) return r.totalStrokes;
    return Math.round(r.totalStrokes * (36 / playedPar));
  });

  const pars = chronologicalRounds.map(r => {
    const playedHolesCount = r.strokes.filter(s => s > 0).length;
    if (playedHolesCount === 9) return r.playedPar;
    return 36; // Baseline Par 36 for 18-hole rounds
  });

  if (currentChartInstance) {
    currentChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  
  if (currentChartType === 'hcp') {
    currentChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Handicap Index',
            data: runningHcps,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.25,
            pointRadius: 4,
            pointBackgroundColor: '#10b981'
          },
          {
            label: 'Diferencial de Salida',
            data: differentials,
            borderColor: 'rgba(59, 130, 246, 0.4)',
            borderWidth: 1.5,
            borderDash: [5, 5],
            fill: false,
            tension: 0.1,
            pointRadius: 2,
            pointBackgroundColor: '#3b82f6'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#9ca3af', font: { family: 'Inter' } }
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const idx = context[0].dataIndex;
                return 'Ronda ' + (idx + 1) + ': ' + chronologicalRounds[idx].course.name.split(' - ')[0] + ' (' + formatDate(chronologicalRounds[idx].date) + ')';
              }
            }
          }
        },
        scales: {
          x: { grid: { color: '#1f2d47' }, ticks: { color: '#9ca3af' } },
          y: { grid: { color: '#1f2d47' }, ticks: { color: '#9ca3af' } }
        }
      },
      plugins: [chartDatalabelsPlugin]
    });
  } else {
    currentChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Golpes Reales',
            data: strokes,
            borderColor: '#ef4444',
            borderWidth: 3,
            fill: false,
            tension: 0.15,
            pointRadius: 4,
            pointBackgroundColor: '#ef4444'
          },
          {
            label: 'Par de la Cancha',
            data: pars,
            borderColor: 'rgba(16, 185, 129, 0.5)',
            borderWidth: 2,
            borderDash: [4, 4],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#9ca3af', font: { family: 'Inter' } }
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const idx = context[0].dataIndex;
                return 'Ronda ' + (idx + 1) + ': ' + chronologicalRounds[idx].course.name.split(' - ')[0] + ' (' + formatDate(chronologicalRounds[idx].date) + ')';
              }
            }
          }
        },
        scales: {
          x: { grid: { color: '#1f2d47' }, ticks: { color: '#9ca3af' } },
          y: { grid: { color: '#1f2d47' }, ticks: { color: '#9ca3af' } }
        }
      },
      plugins: [chartDatalabelsPlugin]
    });
  }
}

// Handle Register Round Form Submit
async function handleRegisterRoundSubmit(e) {
  e.preventDefault();

  const courseId = document.getElementById('reg-course-select').value;
  const dateVal = document.getElementById('reg-date').value;
  const notesVal = document.getElementById('reg-notes').value;

  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  const playedHolesCount = activeRegisterStrokes.filter(s => s > 0).length;
  if (playedHolesCount === 0) {
    alert('Por favor ingresá golpes en al menos un hoyo jugado.');
    return;
  }

  const firTextList = Array(18).fill('-');
  for (let i = 0; i < 18; i++) {
    if (activeRegisterStrokes[i] > 0) {
      firTextList[i] = activeRegisterFir[i] || '-';
    }
  }
  const firStr = firTextList.join(',');
  const cleanNotes = notesVal.trim() || 'Ronda cargada manualmente';
  
  let durationNote = '';
  const durH = parseInt(document.getElementById('reg-duration-hours')?.value, 10) || 0;
  const durM = parseInt(document.getElementById('reg-duration-mins')?.value, 10) || 0;
  if (durH > 0 || durM > 0) {
    durationNote = ' | Duración: ' + (durH > 0 ? (durH + 'h ' + durM + 'm') : (durM + 'm'));
  }
  
  const fullNotes = cleanNotes + durationNote + ' | FIR: ' + firStr;

  const totalStrokes = activeRegisterStrokes.reduce((sum, v, idx) => sum + v + (activeRegisterPenalties[idx] || 0), 0);
  const playedPar = course.holesPar.reduce((sum, p, idx) => sum + (activeRegisterStrokes[idx] > 0 ? p : 0), 0);

  // WHS scaling for partial rounds
  const scaledStrokes = totalStrokes * (course.par / playedPar);
  const scoreDiff = (scaledStrokes - course.courseRating) * 113 / course.slopeRating;

  try {
    if (supabaseConnected && supabaseClient && userSession && userSession.user) {
      const dbPayload = {
        id: editingRoundId || 'round_' + Date.now(),
        user_id: userSession.user.id,
        course_id: course.id,
        date: dateVal,
        strokes: activeRegisterStrokes,
        putts: activeRegisterPutts,
        penalties: activeRegisterPenalties,
        total_strokes: totalStrokes,
        played_par: playedPar,
        score_differential: scoreDiff,
        notes: fullNotes
      };

      if (editingRoundId) {
        const { error } = await supabaseClient
          .from('golf_rounds')
          .update(dbPayload)
          .eq('id', editingRoundId);
        if (error) throw error;
        alert('¡Cambios guardados con éxito!');
      } else {
        const { error } = await supabaseClient
          .from('golf_rounds')
          .insert(dbPayload);
        if (error) throw error;
        alert('¡Salida registrada con éxito!');
      }
      editingRoundId = null;
    } else {
      // Local Fallback
      if (editingRoundId) {
        const roundIdx = rounds.findIndex(r => r.id === editingRoundId);
        if (roundIdx !== -1) {
          rounds[roundIdx] = {
            ...rounds[roundIdx],
            courseId: course.id,
            date: dateVal,
            strokes: [...activeRegisterStrokes],
            putts: [...activeRegisterPutts],
            penalties: [...activeRegisterPenalties],
            totalStrokes: totalStrokes,
            playedPar: playedPar,
            scoreDifferential: scoreDiff,
            notes: notesVal.trim() || null,
            course: course
          };
          saveData('golf_tracker_rounds', rounds);
        }
        editingRoundId = null;
        alert('¡Cambios guardados localmente!');
      } else {
        const newRound = {
          id: 'round_' + Date.now(),
          courseId: course.id,
          date: dateVal,
          strokes: [...activeRegisterStrokes],
          putts: [...activeRegisterPutts],
          penalties: [...activeRegisterPenalties],
          totalStrokes: totalStrokes,
          playedPar: playedPar,
          scoreDifferential: scoreDiff,
          notes: notesVal.trim() || null,
          course: course
        };
        rounds.unshift(newRound);
        saveData('golf_tracker_rounds', rounds);
        alert('¡Salida registrada localmente!');
      }
    }
    
    // Reset and close
    document.getElementById('reg-notes').value = '';
    closeModal('modal-register');
    await loadData();
    
  } catch (err) {
    alert('Error al guardar datos: ' + err.message);
  }
}

// Handle Add Custom Course Form Submit
async function handleAddCourseSubmit(e) {
  e.preventDefault();

  const nameVal = document.getElementById('course-name').value;
  const ratingVal = parseFloat(document.getElementById('course-rating').value);
  const slopeVal = parseInt(document.getElementById('course-slope').value);
  const parVal = parseInt(document.getElementById('course-par').value);

  // Pars grid collect
  const holesPar = [];
  let parSum = 0;
  for (let i = 0; i < 18; i++) {
    const val = parseInt(document.getElementById('course-par-h' + i).value) || 4;
    holesPar.push(val);
    parSum += val;
  }

  const newCourse = {
    id: 'course_' + Date.now(),
    name: nameVal.trim() + ' (Par ' + parSum + ' | Rating: ' + ratingVal + ' / Slope: ' + slopeVal + ')',
    par: parSum,
    courseRating: ratingVal,
    slopeRating: slopeVal,
    holesPar: holesPar
  };

  try {
    if (supabaseConnected && supabaseClient && userSession && userSession.user) {
      const { error } = await supabaseClient.from('golf_courses').insert({
        id: newCourse.id,
        user_id: userSession.user.id,
        name: newCourse.name,
        par: newCourse.par,
        course_rating: newCourse.courseRating,
        slope_rating: newCourse.slopeRating,
        holes_par: newCourse.holesPar
      });
      if (error) throw error;
      alert('¡Nueva cancha guardada en la nube!');
    } else {
      courses.push(newCourse);
      saveData('golf_tracker_courses', courses);
      alert('¡Nueva cancha guardada localmente!');
    }

    closeModal('modal-add-course');
    // Reset form
    document.getElementById('form-add-course').reset();
    for (let i = 0; i < 18; i++) {
      document.getElementById('course-par-h' + i).value = 4;
    }

    await loadData();
  } catch (err) {
    alert('Error al crear la cancha: ' + err.message);
  }
}

// View Scorecard Detail Dialog
window.viewScorecard = function(roundId) {
  const round = rounds.find(r => r.id === roundId);
  if (!round) return;

  activeViewedRound = round;
  setSelectedRoundForCard(round);
  openModal('modal-view-card');
};

function setSelectedRoundForCard(round) {
  const playedHolesCount = round.strokes.filter(s => s > 0).length;
  const playedPar = round.playedPar || round.course.par;

  document.getElementById('view-card-title').textContent = '📊 Tarjeta: ' + round.course.name.split(' - ')[0] + (playedHolesCount < 18 ? ' (' + playedHolesCount + ' Hoyos)' : '');

  
  const diff = round.totalStrokes - playedPar;
  const diffText = diff === 0 ? 'E' : (diff > 0 ? ('+' + diff) : diff);
  document.getElementById('view-card-score').textContent = round.totalStrokes + ' golpes (' + diffText + ')';
  document.getElementById('view-card-diff').textContent = round.scoreDifferential.toFixed(1);
  
  // Parse duration if saved in notes
  let durationStr = '';
  if (round.notes && round.notes.includes('Duración: ')) {
    durationStr = round.notes.split('Duración: ')[1];
  }
  document.getElementById('view-card-date').textContent = formatDate(round.date) + (durationStr ? (' (⏱️ ' + durationStr + ')') : '');

    // Hide front or back nine tables if no holes were played in that section
  const hasFront = round.strokes.slice(0, 9).some(s => s > 0);
  const hasBack = round.strokes.slice(9, 18).some(s => s > 0);
  
  const frontWrapper = document.getElementById('view-card-front-wrapper');
  const backWrapper = document.getElementById('view-card-back-wrapper');
  if (frontWrapper && backWrapper) {
    if (!hasFront && !hasBack) {
      frontWrapper.style.display = 'block';
      backWrapper.style.display = 'block';
    } else {
      frontWrapper.style.display = hasFront ? 'block' : 'none';
      backWrapper.style.display = hasBack ? 'block' : 'none';
    }
  }

  // Parse FIR values
  let roundFir = null;
  if (round.notes && round.notes.includes(' | FIR: ')) {
    const parts = round.notes.split(' | FIR: ');
    const firPart = parts[1].split(' | ')[0];
    roundFir = firPart.split(',');
  }

  // Parse hole times
  let holeTimes = null;
  if (round.notes && round.notes.includes(' | Hoyos: ')) {
    const parts = round.notes.split(' | Hoyos: ');
    const timesPart = parts[1].split(' | ')[0];
    holeTimes = timesPart.split(',');
  }

  // Render Front pars & strokes
  const parFrontTr = document.getElementById('view-card-par-front');
  const strokesFrontTr = document.getElementById('view-card-strokes-front');
  const diffFrontTr = document.getElementById('view-card-diff-front');
  const puttsFrontTr = document.getElementById('view-card-putts-front');
  const girFrontTr = document.getElementById('view-card-gir-front');
  
  // Clear old cells
  while (parFrontTr.children.length > 1) parFrontTr.removeChild(parFrontTr.lastChild);
  while (strokesFrontTr.children.length > 1) strokesFrontTr.removeChild(strokesFrontTr.lastChild);
  if (diffFrontTr) while (diffFrontTr.children.length > 1) diffFrontTr.removeChild(diffFrontTr.lastChild);
  while (puttsFrontTr.children.length > 1) puttsFrontTr.removeChild(puttsFrontTr.lastChild);
  while (girFrontTr.children.length > 1) girFrontTr.removeChild(girFrontTr.lastChild);

  const frontParsSum = round.course.holesPar.slice(0, 9).reduce((sum, p, idx) => sum + (round.strokes[idx] > 0 ? p : 0), 0);
  // Include penalties in strokes sum
  const frontStrokesSum = round.strokes.slice(0, 9).reduce((sum, v, idx) => sum + v + (round.penalties ? (round.penalties[idx] || 0) : 0), 0);
  const frontPuttsSum = round.putts ? round.putts.slice(0, 9).reduce((sum, v, idx) => sum + (round.strokes[idx] > 0 ? v : 0), 0) : 0;
  const frontPenaltiesSum = round.penalties ? round.penalties.slice(0, 9).reduce((sum, v, idx) => sum + (round.strokes[idx] > 0 ? v : 0), 0) : 0;

  const firFrontTr = document.getElementById('view-card-fir-front');
  const realgirFrontTr = document.getElementById('view-card-realgir-front');
  if (firFrontTr && realgirFrontTr) {
    if (roundFir || round.putts) {
      firFrontTr.style.display = '';
      realgirFrontTr.style.display = '';
      while (firFrontTr.children.length > 1) firFrontTr.removeChild(firFrontTr.lastChild);
      while (realgirFrontTr.children.length > 1) realgirFrontTr.removeChild(realgirFrontTr.lastChild);
    } else {
      firFrontTr.style.display = 'none';
      realgirFrontTr.style.display = 'none';
    }
  }

  let firHitSumFront = 0;
  let firTotalSumFront = 0;
  let girSumFront = 0;

  for (let i = 0; i < 9; i++) {
    const par = round.course.holesPar[i];
    const score = round.strokes[i];
    const diff = score - par;
    const putt = round.putts ? round.putts[i] : 0;
    const pen = round.penalties ? round.penalties[i] : 0;

    if (firFrontTr && (roundFir || round.putts)) {
      const tdFir = document.createElement('td');
      const fVal = (roundFir && roundFir[i]) ? roundFir[i] : '-';
      if (par > 3 && score > 0 && fVal !== '-') {
        if (fVal === 'C') {
          tdFir.textContent = '🎯';
          firHitSumFront++;
        } else if (fVal === 'L') {
          tdFir.textContent = '⬅️';
        } else if (fVal === 'R') {
          tdFir.textContent = '➡️';
        }
        firTotalSumFront++;
      } else {
        tdFir.textContent = '-';
      }
      firFrontTr.appendChild(tdFir);

      const tdRealGir = document.createElement('td');
      if (score > 0 && round.putts) {
        const girSuccess = (score - putt) <= (par - 2);
        if (girSuccess) {
          tdRealGir.textContent = '✓';
          tdRealGir.className = 'text-emerald font-bold';
          girSumFront++;
        } else {
          tdRealGir.textContent = '-';
        }
      } else {
        tdRealGir.textContent = '-';
      }
      realgirFrontTr.appendChild(tdRealGir);
    }


    const tdPar = document.createElement('td');
    tdPar.textContent = par;
    parFrontTr.appendChild(tdPar);

    const tdStroke = document.createElement('td');
    if (score > 0) {
      tdStroke.textContent = score + (pen || 0); // Include penalties!
      applyScoreCellClass(tdStroke, diff + (pen || 0));
    } else {
      tdStroke.textContent = '-';
    }
    strokesFrontTr.appendChild(tdStroke);

    // Render diff cell
    if (diffFrontTr) {
      const tdDiff = document.createElement('td');
      if (score > 0) {
        const netDiff = diff + (pen || 0);
        const diffText = netDiff === 0 ? 'E' : (netDiff > 0 ? '+' + netDiff : netDiff);
        tdDiff.textContent = diffText;
        if (netDiff > 0) tdDiff.className = 'text-red font-bold';
        else if (netDiff < 0) tdDiff.className = 'text-emerald font-bold';
        else tdDiff.className = 'text-amber font-bold';
      } else {
        tdDiff.textContent = '-';
      }
      diffFrontTr.appendChild(tdDiff);
    }

    const tdPutt = document.createElement('td');
    tdPutt.textContent = (score > 0 && round.putts) ? putt : '-';
    puttsFrontTr.appendChild(tdPutt);

    const tdPen = document.createElement('td');
    tdPen.textContent = (score > 0 && round.penalties) ? pen : '-';
    girFrontTr.appendChild(tdPen);
  }

  // Add Front Nine Sum columns
  const tdParSumFront = document.createElement('td');
  tdParSumFront.className = 'bg-gray font-bold';
  tdParSumFront.textContent = frontParsSum;
  parFrontTr.appendChild(tdParSumFront);

  const frontDiff = frontStrokesSum - frontParsSum;
  const frontDiffText = frontDiff === 0 ? 'E' : (frontDiff > 0 ? ('+' + frontDiff) : frontDiff);
  const frontStrokesText = frontStrokesSum > 0 ? (frontStrokesSum + ' (' + frontDiffText + ')') : '0';

  const tdStrokeSumFront = document.createElement('td');
  tdStrokeSumFront.className = 'bg-gray font-bold';
  tdStrokeSumFront.textContent = frontStrokesText;
  strokesFrontTr.appendChild(tdStrokeSumFront);

  if (diffFrontTr) {
    const frontDiff = frontStrokesSum - frontParsSum;
    const frontDiffText = frontDiff === 0 ? 'E' : (frontDiff > 0 ? ('+' + frontDiff) : frontDiff);
    const tdDiffSumFront = document.createElement('td');
    tdDiffSumFront.className = 'bg-gray font-bold';
    tdDiffSumFront.textContent = frontStrokesSum > 0 ? frontDiffText : '-';
    diffFrontTr.appendChild(tdDiffSumFront);
  }

  const tdPuttsSumFront = document.createElement('td');
  tdPuttsSumFront.className = 'bg-gray font-bold';
  tdPuttsSumFront.textContent = '-';
  puttsFrontTr.appendChild(tdPuttsSumFront);

  const tdPenSumFront = document.createElement('td');
  tdPenSumFront.className = 'bg-gray font-bold';
  tdPenSumFront.textContent = round.penalties ? frontPenaltiesSum : '-';
  girFrontTr.appendChild(tdPenSumFront);

  if (firFrontTr && (roundFir || round.putts)) {
    const tdFirSumFront = document.createElement('td');
    tdFirSumFront.className = 'bg-gray font-bold';
    tdFirSumFront.textContent = firTotalSumFront > 0 ? `${firHitSumFront}/${firTotalSumFront}` : '-';
    firFrontTr.appendChild(tdFirSumFront);

    const tdRealGirSumFront = document.createElement('td');
    tdRealGirSumFront.className = 'bg-gray font-bold';
    tdRealGirSumFront.textContent = round.putts ? `${girSumFront}/9` : '-';
    realgirFrontTr.appendChild(tdRealGirSumFront);
  }


  const timeFrontTr = document.getElementById('view-card-time-front');
  if (timeFrontTr) {
    if (holeTimes) {
      timeFrontTr.style.display = '';
      while (timeFrontTr.children.length > 1) timeFrontTr.removeChild(timeFrontTr.lastChild);
      
      let frontTimeSum = 0;
      for (let i = 0; i < 9; i++) {
        const timeVal = holeTimes[i] || '-';
        const tdTime = document.createElement('td');
        tdTime.textContent = timeVal;
        timeFrontTr.appendChild(tdTime);

        if (timeVal !== '-') frontTimeSum += parseInt(timeVal) || 0;
      }
      
      const tdTimeSumFront = document.createElement('td');
      tdTimeSumFront.className = 'bg-gray font-bold';
      tdTimeSumFront.textContent = frontTimeSum > 0 ? (frontTimeSum + 'm') : '-';
      timeFrontTr.appendChild(tdTimeSumFront);
    } else {
      timeFrontTr.style.display = 'none';
    }
  }


  // Render Back pars & strokes
  const parBackTr = document.getElementById('view-card-par-back');
  const strokesBackTr = document.getElementById('view-card-strokes-back');
  const diffBackTr = document.getElementById('view-card-diff-back');
  const puttsBackTr = document.getElementById('view-card-putts-back');
  const girBackTr = document.getElementById('view-card-gir-back');

  while (parBackTr.children.length > 1) parBackTr.removeChild(parBackTr.lastChild);
  while (strokesBackTr.children.length > 1) strokesBackTr.removeChild(strokesBackTr.lastChild);
  if (diffBackTr) while (diffBackTr.children.length > 1) diffBackTr.removeChild(diffBackTr.lastChild);
  while (puttsBackTr.children.length > 1) puttsBackTr.removeChild(puttsBackTr.lastChild);
  while (girBackTr.children.length > 1) girBackTr.removeChild(girBackTr.lastChild);

  const backParsSum = round.course.holesPar.slice(9, 18).reduce((sum, p, idx) => sum + (round.strokes[idx + 9] > 0 ? p : 0), 0);
  // Include penalties in strokes sum
  const backStrokesSum = round.strokes.slice(9, 18).reduce((sum, v, idx) => sum + v + (round.penalties ? (round.penalties[idx + 9] || 0) : 0), 0);
  const backPuttsSum = round.putts ? round.putts.slice(9, 18).reduce((sum, v, idx) => sum + (round.strokes[idx + 9] > 0 ? v : 0), 0) : 0;
  const backPenaltiesSum = round.penalties ? round.penalties.slice(9, 18).reduce((sum, v, idx) => sum + (round.strokes[idx + 9] > 0 ? v : 0), 0) : 0;

  const firBackTr = document.getElementById('view-card-fir-back');
  const realgirBackTr = document.getElementById('view-card-realgir-back');
  if (firBackTr && realgirBackTr) {
    if (roundFir || round.putts) {
      firBackTr.style.display = '';
      realgirBackTr.style.display = '';
      while (firBackTr.children.length > 1) firBackTr.removeChild(firBackTr.lastChild);
      while (realgirBackTr.children.length > 1) realgirBackTr.removeChild(realgirBackTr.lastChild);
    } else {
      firBackTr.style.display = 'none';
      realgirBackTr.style.display = 'none';
    }
  }

  let firHitSumBack = 0;
  let firTotalSumBack = 0;
  let girSumBack = 0;

  for (let i = 9; i < 18; i++) {
    const par = round.course.holesPar[i];
    const score = round.strokes[i];
    const diff = score - par;
    const putt = round.putts ? round.putts[i] : 0;
    const pen = round.penalties ? round.penalties[i] : 0;

    if (firBackTr && (roundFir || round.putts)) {
      const tdFir = document.createElement('td');
      const fVal = (roundFir && roundFir[i]) ? roundFir[i] : '-';
      if (par > 3 && score > 0 && fVal !== '-') {
        if (fVal === 'C') {
          tdFir.textContent = '🎯';
          firHitSumBack++;
        } else if (fVal === 'L') {
          tdFir.textContent = '⬅️';
        } else if (fVal === 'R') {
          tdFir.textContent = '➡️';
        }
        firTotalSumBack++;
      } else {
        tdFir.textContent = '-';
      }
      firBackTr.appendChild(tdFir);

      const tdRealGir = document.createElement('td');
      if (score > 0 && round.putts) {
        const girSuccess = (score - putt) <= (par - 2);
        if (girSuccess) {
          tdRealGir.textContent = '✓';
          tdRealGir.className = 'text-emerald font-bold';
          girSumBack++;
        } else {
          tdRealGir.textContent = '-';
        }
      } else {
        tdRealGir.textContent = '-';
      }
      realgirBackTr.appendChild(tdRealGir);
    }


    const tdPar = document.createElement('td');
    tdPar.textContent = par;
    parBackTr.appendChild(tdPar);

    const tdStroke = document.createElement('td');
    if (score > 0) {
      tdStroke.textContent = score + (pen || 0); // Include penalties!
      applyScoreCellClass(tdStroke, diff + (pen || 0));
    } else {
      tdStroke.textContent = '-';
    }
    strokesBackTr.appendChild(tdStroke);

    // Render diff cell
    if (diffBackTr) {
      const tdDiff = document.createElement('td');
      if (score > 0) {
        const netDiff = diff + (pen || 0);
        const diffText = netDiff === 0 ? 'E' : (netDiff > 0 ? '+' + netDiff : netDiff);
        tdDiff.textContent = diffText;
        if (netDiff > 0) tdDiff.className = 'text-red font-bold';
        else if (netDiff < 0) tdDiff.className = 'text-emerald font-bold';
        else tdDiff.className = 'text-amber font-bold';
      } else {
        tdDiff.textContent = '-';
      }
      diffBackTr.appendChild(tdDiff);
    }

    const tdPutt = document.createElement('td');
    tdPutt.textContent = (score > 0 && round.putts) ? putt : '-';
    puttsBackTr.appendChild(tdPutt);

    const tdPen = document.createElement('td');
    tdPen.textContent = (score > 0 && round.penalties) ? pen : '-';
    girBackTr.appendChild(tdPen);
  }

  // Add Back Nine Sum
  const tdParSumBack = document.createElement('td');
  const totalPar = round.course.par;
  tdParSumBack.className = 'bg-gray font-bold';
  tdParSumBack.textContent = backParsSum;
  parBackTr.appendChild(tdParSumBack);

  const backDiff = backStrokesSum - backParsSum;
  const backDiffText = backDiff === 0 ? 'E' : (backDiff > 0 ? ('+' + backDiff) : backDiff);
  const backStrokesText = backStrokesSum > 0 ? (backStrokesSum + ' (' + backDiffText + ')') : '0';

  const tdStrokeSumBack = document.createElement('td');
  tdStrokeSumBack.className = 'bg-gray font-bold';
  tdStrokeSumBack.textContent = backStrokesText;
  strokesBackTr.appendChild(tdStrokeSumBack);

  if (diffBackTr) {
    const backDiff = backStrokesSum - backParsSum;
    const backDiffText = backDiff === 0 ? 'E' : (backDiff > 0 ? ('+' + backDiff) : backDiff);
    const tdDiffSumBack = document.createElement('td');
    tdDiffSumBack.className = 'bg-gray font-bold';
    tdDiffSumBack.textContent = backStrokesSum > 0 ? backDiffText : '-';
    diffBackTr.appendChild(tdDiffSumBack);
  }

  const tdPuttsSumBack = document.createElement('td');
  tdPuttsSumBack.className = 'bg-gray font-bold';
  tdPuttsSumBack.textContent = '-';
  puttsBackTr.appendChild(tdPuttsSumBack);

  const tdPenSumBack = document.createElement('td');
  tdPenSumBack.className = 'bg-gray font-bold';
  tdPenSumBack.textContent = round.penalties ? backPenaltiesSum : '-';
  girBackTr.appendChild(tdPenSumBack);

  if (firBackTr && (roundFir || round.putts)) {
    const tdFirSumBack = document.createElement('td');
    tdFirSumBack.className = 'bg-gray font-bold';
    tdFirSumBack.textContent = firTotalSumBack > 0 ? `${firHitSumBack}/${firTotalSumBack}` : '-';
    firBackTr.appendChild(tdFirSumBack);

    const tdRealGirSumBack = document.createElement('td');
    tdRealGirSumBack.className = 'bg-gray font-bold';
    tdRealGirSumBack.textContent = round.putts ? `${girSumBack}/9` : '-';
    realgirBackTr.appendChild(tdRealGirSumBack);

    // Set totals column overall values
    const tdTotalFir = document.getElementById('view-card-total-fir');
    if (tdTotalFir) {
      let totalHit = 0;
      let totalCount = 0;
      round.strokes.forEach((s, idx) => {
        const par = round.course.holesPar[idx];
        const fVal = (roundFir && roundFir[idx]) ? roundFir[idx] : '-';
        if (par > 3 && s > 0 && fVal !== '-') {
          totalCount++;
          if (fVal === 'C') totalHit++;
        }
      });
      tdTotalFir.textContent = totalCount > 0 ? `${totalHit}/${totalCount}` : '-';
    }

    const tdTotalRealGir = document.getElementById('view-card-total-realgir');
    if (tdTotalRealGir) {
      let totalGir = 0;
      let totalPlayed = 0;
      round.strokes.forEach((s, idx) => {
        if (s > 0 && round.putts) {
          totalPlayed++;
          const par = round.course.holesPar[idx];
          const putts = round.putts[idx];
          if ((s - putts) <= (par - 2)) totalGir++;
        }
      });
      tdTotalRealGir.textContent = round.putts ? `${totalGir}/${totalPlayed}` : '-';
    }
  }


  const timeBackTr = document.getElementById('view-card-time-back');
  if (timeBackTr) {
    if (holeTimes) {
      timeBackTr.style.display = '';
      while (timeBackTr.children.length > 1) timeBackTr.removeChild(timeBackTr.lastChild);
      
      let backTimeSum = 0;
      for (let i = 9; i < 18; i++) {
        const timeVal = holeTimes[i] || '-';
        const tdTime = document.createElement('td');
        tdTime.textContent = timeVal;
        timeBackTr.appendChild(tdTime);

        if (timeVal !== '-') backTimeSum += parseInt(timeVal) || 0;
      }
      
      const tdTimeSumBack = document.createElement('td');
      tdTimeSumBack.className = 'bg-gray font-bold';
      tdTimeSumBack.textContent = backTimeSum > 0 ? (backTimeSum + 'm') : '-';
      timeBackTr.appendChild(tdTimeSumBack);

      // Render total overall duration
      const tdTotalTime = document.getElementById('view-card-total-time');
      if (tdTotalTime) {
        let totalTimeSum = 0;
        holeTimes.forEach(t => {
          if (t !== '-') totalTimeSum += parseInt(t) || 0;
        });
        
        let formattedTotal = '-';
        if (totalTimeSum > 0) {
          const h = Math.floor(totalTimeSum / 60);
          const m = totalTimeSum % 60;
          formattedTotal = h > 0 ? (h + 'h ' + m + 'm') : (m + 'm');
        }
        tdTotalTime.textContent = formattedTotal;
      }
    } else {
      timeBackTr.style.display = 'none';
    }
  }





  // Render Notes
  const notesBox = document.getElementById('view-card-notes-box');
  if (round.notes) {
    notesBox.style.display = 'block';
    document.getElementById('view-card-notes').textContent = '"' + round.notes + '"';
  } else {
    notesBox.style.display = 'none';
  }
}

function applyScoreCellClass(element, diff) {
  if (diff === -1) element.className = 'score-cell-birdie';
  else if (diff <= -2) element.className = 'score-cell-eagle';
  else if (diff === 1) element.className = 'score-cell-bogey';
  else if (diff >= 2) element.className = 'score-cell-double';
}

// Delete Confirmation
window.promptDeleteRound = async function(roundId) {
  if (confirm('¿Estás seguro de que deseas eliminar esta ronda? Esta acción es irreversible.')) {
    try {
      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        const { error } = await supabaseClient
          .from('golf_rounds')
          .delete()
          .eq('id', roundId);
        if (error) throw error;
      } else {
        rounds = rounds.filter(r => r.id !== roundId);
        saveData('golf_tracker_rounds', rounds);
      }
      await loadData();
    } catch (err) {
      alert('Error al eliminar ronda: ' + err.message);
    }
  }
};

// Date Formatter helper
function formatDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  return dateStr;
}





// Timer update function for Live Rounds
function updateLiveTimer() {
  const timerEl = document.getElementById('live-track-timer');
  if (!timerEl || !liveRoundStartTime) return;
  
  const elapsedMs = Date.now() - liveRoundStartTime;
  const hours = Math.floor(elapsedMs / 3600000);
  const minutes = Math.floor((elapsedMs % 3600000) / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  
  let formatted = '';
  if (hours > 0) {
    formatted = String(hours).padStart(2, '0') + ':' + 
                String(minutes).padStart(2, '0') + ':' + 
                String(seconds).padStart(2, '0');
  } else {
    formatted = String(minutes).padStart(2, '0') + ':' + 
                String(seconds).padStart(2, '0');
  }
  timerEl.textContent = '⏱️ ' + formatted;
}

// ---- Live Round Tracker Functions ----
function startLiveRound() {
  const courseId = document.getElementById('live-course-select').value;
  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  if (supabaseConnected && supabaseClient && userSession && userSession.user) {
    createMultiplayerLobby(courseId);
    return;
  }

  // Read current active modality button from the UI
  const activeBtn = document.querySelector('.btn-live-mode.active');
  liveMode = activeBtn ? activeBtn.getAttribute('data-mode') : 'front';

  liveCourse = course;
  liveRoundActive = true;
  liveCurrentIndex = 0;
  liveHoleStartTime = Date.now();
  liveHolesDuration = Array(18).fill(0);
  liveFir = Array(18).fill('-');
  liveFir = Array(18).fill('-');

  // Configure holes list based on modality
  if (liveMode === 'front') {
    liveHolesList = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  } else if (liveMode === 'back') {
    liveHolesList = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  } else {
    liveHolesList = Array.from({length: 18}, (_, i) => i);
  }

  // Reset arrays
  liveStrokes = Array(18).fill(0);
  livePutts = Array(18).fill(0);
  livePenalties = Array(18).fill(0);

  // Initialize timer
  liveRoundStartTime = Date.now();
  if (liveTimerInterval) clearInterval(liveTimerInterval);
  liveTimerInterval = setInterval(updateLiveTimer, 1000);
  updateLiveTimer();

  // UI transition
  document.getElementById('live-setup-view').style.display = 'none';
  document.getElementById('live-tracker-view').style.display = 'block';
  updateLiveTrackerVisibility(true);

  renderLiveHole();
  saveLiveRoundState();
}

function renderLiveHole() {
  if (!liveCourse || !liveRoundActive) return;

  const defCourse = DEFAULT_COURSES.find(dc => dc.id === liveCourse.id || (dc.name && liveCourse.name && dc.name.toLowerCase().includes(liveCourse.name.split(' (')[0].toLowerCase())));
  const currentCourse = (liveCourse.tees) ? liveCourse : (defCourse || liveCourse);

  const idx = liveHolesList[liveCurrentIndex];
  const par = (currentCourse.holesPar && currentCourse.holesPar[idx]) || 4;
  const holeNum = idx + 1;
  const strokeIndex = (currentCourse.strokeIndex && currentCourse.strokeIndex[idx]) || (idx + 1);

  const teeKey = liveSelectedTee || 'white';
  const teeObj = (currentCourse.tees && currentCourse.tees[teeKey]) || (currentCourse.tees && currentCourse.tees.white) || null;
  const distM = teeObj && teeObj.distances ? teeObj.distances[idx] : null;
  const distYd = distM ? Math.round(distM * 1.09361) : null;

  // Show or hide multiplayer player toggle tabs
  const tabsContainer = document.getElementById('live-multiplayer-tabs');
  const shareBtn = document.getElementById('btn-live-share-lobby');
  const codeBadge = document.getElementById('live-lobby-code-badge');
  if (activeLobbyId && lobbyState && lobbyState.players) {
    if (tabsContainer) tabsContainer.style.display = 'flex';
    if (shareBtn) shareBtn.style.display = 'inline-block';
    if (codeBadge) {
      codeBadge.style.display = 'inline-block';
      codeBadge.textContent = 'CÓDIGO: ' + activeLobbyId;
      codeBadge.onclick = () => {
        shareLobbyInvite();
      };
    }
    
    // Sync current selection
    const player = lobbyState.players[lobbyActivePlayerIndex];
    if (player) {
      liveStrokes = player.strokes;
      livePutts = player.putts;
      livePenalties = player.penalties || Array(18).fill(0);
    }
    renderLiveMultiplayerTabs();
    
    // Toggle active scorecard inputs
    const isEditable = isMyLiveScorecardActive();
    const editBtns = [
      document.getElementById('btn-live-stroke-dec'),
      document.getElementById('btn-live-stroke-inc'),
      document.getElementById('btn-live-putt-dec'),
      document.getElementById('btn-live-putt-inc'),
      document.getElementById('btn-live-penalty-dec'),
      document.getElementById('btn-live-penalty-inc'),
      document.getElementById('btn-live-fir-l'),
      document.getElementById('btn-live-fir-c'),
      document.getElementById('btn-live-fir-r')
    ];
    editBtns.forEach(btn => {
      if (btn) {
        btn.disabled = !isEditable;
        btn.style.opacity = isEditable ? '1' : '0.4';
        btn.style.cursor = isEditable ? 'pointer' : 'not-allowed';
      }
    });
  } else {
    if (tabsContainer) tabsContainer.style.display = 'none';
    if (shareBtn) shareBtn.style.display = 'none';
    if (codeBadge) codeBadge.style.display = 'none';
    
    // Ensure all inputs are enabled in single player mode
    const editBtns = [
      document.getElementById('btn-live-stroke-dec'),
      document.getElementById('btn-live-stroke-inc'),
      document.getElementById('btn-live-putt-dec'),
      document.getElementById('btn-live-putt-inc'),
      document.getElementById('btn-live-penalty-dec'),
      document.getElementById('btn-live-penalty-inc'),
      document.getElementById('btn-live-fir-l'),
      document.getElementById('btn-live-fir-c'),
      document.getElementById('btn-live-fir-r')
    ];
    editBtns.forEach(btn => {
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    });
  }

  // Update DOM labels
  document.getElementById('live-track-course-name').textContent = liveCourse.name.split(' - ')[0];
  
  document.getElementById('live-current-hole-num').textContent = holeNum;
  
  // Set Par and Strokes circle values
  const parCircleVal = document.getElementById('live-current-hole-par-val');
  if (parCircleVal) parCircleVal.textContent = par;
  
  const strokesCircleVal = document.getElementById('live-current-hole-strokes-val');
  if (strokesCircleVal) {
    strokesCircleVal.textContent = liveStrokes[idx] > 0 ? (liveStrokes[idx] + (livePenalties[idx] || 0)) : '0';
  }
  const oldParEl = document.getElementById('live-current-hole-par');
  if (oldParEl) oldParEl.textContent = 'Par ' + par;
  document.getElementById('live-stroke-val').textContent = liveStrokes[idx];
  document.getElementById('live-putt-val').textContent = livePutts[idx];

  // Update Live Penalty display
  document.getElementById('live-penalty-val').textContent = livePenalties[idx] || 0;

  // 1. Hole Meta Strip (Tee, Prominent Yards & Meters)
  const metaStrip = document.getElementById('live-hole-meta-strip');
  if (metaStrip) {
    const teeName = teeKey === 'blue' ? 'Azules' : (teeKey === 'red' ? 'Rojas' : 'Blancas');
    const teeColorDot = teeKey === 'blue' ? '#38bdf8' : (teeKey === 'red' ? '#f43f5e' : '#ffffff');

    let distBadgeHTML = '';
    if (distYd) {
      distBadgeHTML = '<span class="live-meta-badge live-dist-badge" onclick="cycleLiveTee()" title="Tocar para alternar Blancas / Azules / Rojas">' +
        '<span class="tee-dot-inline" style="background-color: ' + teeColorDot + ';"></span>' +
        '<strong>' + distYd + ' YARDAS</strong> (' + distM + 'm • ' + teeName + ')' +
      '</span>';
    } else {
      distBadgeHTML = '<span class="live-meta-badge live-tee-badge" onclick="cycleLiveTee()">' +
        '<span class="tee-dot-inline" style="background-color: ' + teeColorDot + ';"></span>' +
        teeName +
      '</span>';
    }

    metaStrip.innerHTML = distBadgeHTML;
  }

  // Subtitle update removed for clean UI



  // Navigation button states
  const prevHoleBtn = document.getElementById('btn-live-prev-hole');
  const nextHoleBtn = document.getElementById('btn-live-next-hole');
  if (prevHoleBtn) {
    prevHoleBtn.disabled = liveCurrentIndex === 0;
  }
  if (nextHoleBtn) {
    const isLastHole = liveCurrentIndex === liveHolesList.length - 1;
    if (isLastHole) {
      nextHoleBtn.innerHTML = '<span>Terminar ✓</span>';
      nextHoleBtn.classList.add('btn-finish-mode');
      nextHoleBtn.disabled = false;
    } else {
      nextHoleBtn.innerHTML = '<span>Siguiente</span> <span class="nav-arrow">▶</span>';
      nextHoleBtn.classList.remove('btn-finish-mode');
      nextHoleBtn.disabled = false;
    }
  }

  updateLiveScoreSummary();
  renderLiveJumperGrid();
}

function updateLiveScoreSummary() {
  let totalStrokes = 0;
  let totalPar = 0;

  liveHolesList.forEach(idx => {
    if (liveStrokes[idx] > 0) {
      totalStrokes += liveStrokes[idx] + (livePenalties[idx] || 0);
      totalPar += liveCourse.holesPar[idx];
    }
  });

  const diff = totalStrokes - totalPar;
  const badge = document.getElementById('live-score-relative-badge');
  
  const formattedDiff = totalStrokes === 0 ? 'E' : (diff === 0 ? 'E' : (diff > 0 ? '+' + diff : diff));
  
  if (badge) {
    badge.textContent = formattedDiff;
    badge.className = 'live-score-badge';
    if (totalStrokes > 0) {
      if (diff > 0) badge.classList.add('bg-red');
      else if (diff < 0) badge.classList.add('bg-green');
    }
  }

  // Update live tracker summary grid
  const txtTotalStrokes = document.getElementById('live-summary-total-strokes');
  const txtTotalPar = document.getElementById('live-summary-total-par');
  const txtDiff = document.getElementById('live-summary-diff');

  if (txtTotalStrokes) txtTotalStrokes.textContent = totalStrokes;
  if (txtTotalPar) txtTotalPar.textContent = totalPar;
  if (txtDiff) {
    txtDiff.textContent = formattedDiff;
    if (totalStrokes > 0) {
      if (diff > 0) txtDiff.style.color = '#f87171'; // Red
      else if (diff < 0) txtDiff.style.color = '#34d399'; // Emerald
      else txtDiff.style.color = '#fff';
    } else {
      txtDiff.style.color = '#fff';
    }
  }
}

function renderLiveJumperGrid() {
  const container = document.getElementById('live-holes-grid-jumper');
  container.innerHTML = '';

  liveHolesList.forEach((idx, listIdx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-live-jumper';
    // Display relative score in parentheses if hole has been played
    if (liveStrokes[idx] > 0) {
      const diff = (liveStrokes[idx] + (livePenalties[idx] || 0)) - liveCourse.holesPar[idx];
      const diffText = diff === 0 ? 'E' : (diff > 0 ? '+' + diff : diff);
      btn.textContent = (idx + 1) + ' (' + diffText + ')';
    } else {
      btn.textContent = idx + 1;
    }

    if (listIdx === liveCurrentIndex) {
      btn.classList.add('current');
    } else if (liveStrokes[idx] > 0) {
      btn.classList.add('played');
    } else if (listIdx < liveCurrentIndex) {
      // Prior holes with 0 strokes are marked missing (le falta)
      btn.classList.add('missing');
    }

    btn.addEventListener('click', () => {
      const prevIdx = liveHolesList[liveCurrentIndex];
      if (liveHoleStartTime) {
        liveHolesDuration[prevIdx] += (Date.now() - liveHoleStartTime);
      }
      liveHoleStartTime = Date.now();

      liveCurrentIndex = listIdx;
      renderLiveHole();
      saveLiveRoundState();
    });
    container.appendChild(btn);
  });
}

function saveLiveRoundState() {
  const state = {
    active: liveRoundActive,
    courseId: liveCourse ? liveCourse.id : null,
    mode: liveMode,
    holesList: liveHolesList,
    currentIndex: liveCurrentIndex,
    strokes: liveStrokes,
    putts: livePutts,
    penalties: livePenalties,
    startTime: liveRoundStartTime,
    activeLobbyId: activeLobbyId,
    lobbyActivePlayerIndex: lobbyActivePlayerIndex,
    holeStartTime: liveHoleStartTime,
    holesDuration: liveHolesDuration,
    fir: liveFir
  };
  localStorage.setItem('golf_tracker_live_round', JSON.stringify(state));
}

function checkActiveLiveRound() {
  const saved = localStorage.getItem('golf_tracker_live_round');
  if (saved) {
    try {
      const state = JSON.parse(saved);
      if (state.activeLobbyId && ['G-VACU', 'G-VJ3P', 'G-445P'].includes(state.activeLobbyId)) {
        localStorage.removeItem('golf_tracker_live_round');
        document.getElementById('live-setup-view').style.display = 'block';
        document.getElementById('live-tracker-view').style.display = 'none';
        updateLiveTrackerVisibility(false);
        return;
      }
      if (state.active) {
        liveRoundActive = true;
        liveCourse = courses.find(c => c.id === state.courseId);
        liveMode = state.mode;
        liveHolesList = state.holesList;
        liveCurrentIndex = state.currentIndex;
        liveStrokes = state.strokes;
        livePutts = state.putts;
        livePenalties = state.penalties || Array(18).fill(0);
        
        // Restore start time and restart timer interval
        liveRoundStartTime = state.startTime || Date.now();
        if (liveTimerInterval) clearInterval(liveTimerInterval);
        liveTimerInterval = setInterval(updateLiveTimer, 1000);
        updateLiveTimer();
        
        // Restore multiplayer state and resume polling
        activeLobbyId = state.activeLobbyId || null;
        lobbyActivePlayerIndex = state.lobbyActivePlayerIndex || 0;
        if (activeLobbyId) {
          startLobbyPolling(activeLobbyId);
        }

        // Select active mode button in setup panel
        document.querySelectorAll('.btn-live-mode').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-mode') === liveMode);
        });

        // Show live pane
        document.getElementById('live-setup-view').style.display = 'none';
        document.getElementById('live-tracker-view').style.display = 'block';
        updateLiveTrackerVisibility(true);
        
        // Select the "Empezar Salida" nav tab
        document.querySelectorAll('.nav-tab').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-tab') === 'live');
        });
        document.querySelectorAll('.tab-pane').forEach(p => {
          p.classList.toggle('active', p.id === 'tab-pane-live');
        });

        renderLiveHole();
        return;
      }
    } catch (err) {
      console.error('Error parsing live round state:', err);
      localStorage.removeItem('golf_tracker_live_round');
    }
  }
  document.getElementById('live-setup-view').style.display = 'block';
  document.getElementById('live-tracker-view').style.display = 'none';
  updateLiveTrackerVisibility(false);
}

function cancelLiveRound() {
  if (confirm('¿Estás seguro de cancelar la ronda actual? Se perderán todos los golpes registrados en esta partida.')) {
    if (liveTimerInterval) {
      clearInterval(liveTimerInterval);
      liveTimerInterval = null;
    }
    if (lobbyPollInterval) {
      clearInterval(lobbyPollInterval);
      lobbyPollInterval = null;
    }
    liveRoundStartTime = null;
    activeLobbyId = null;
    lobbyState = null;
    
    liveRoundActive = false;
    liveCourse = null;
    localStorage.removeItem('golf_tracker_live_round');
    
    document.getElementById('live-setup-view').style.display = 'block';
    document.getElementById('live-tracker-view').style.display = 'none';
    updateLiveTrackerVisibility(false);
  }
}

async function finishLiveRound() {
  let playedHolesCount = 0;
  let totalStrokes = 0;
  let playedPar = 0;

  liveHolesList.forEach(idx => {
    if (liveStrokes[idx] > 0) {
      playedHolesCount++;
      totalStrokes += liveStrokes[idx] + (livePenalties[idx] || 0);
      playedPar += liveCourse.holesPar[idx];
    }
  });

  if (playedHolesCount === 0) {
    alert('Registrá al menos un golpe antes de terminar la salida.');
    return;
  }

  if (confirm('¿Deseas terminar y registrar esta salida?')) {
    // Clear timer interval and get final duration
    if (liveTimerInterval) {
      clearInterval(liveTimerInterval);
      liveTimerInterval = null;
    }
    
    let durationText = '';
    if (liveRoundStartTime) {
      const elapsedMs = Date.now() - liveRoundStartTime;
      const hours = Math.floor(elapsedMs / 3600000);
      const minutes = Math.floor((elapsedMs % 3600000) / 60000);
      if (hours > 0) {
        durationText = hours + 'h ' + minutes + 'm';
      } else {
        durationText = minutes + 'm';
      }
    }
    // Accumulate final hole duration
    const finalIdx = liveHolesList[liveCurrentIndex];
    if (liveHoleStartTime) {
      liveHolesDuration[finalIdx] += (Date.now() - liveHoleStartTime);
    }
    liveHoleStartTime = null;
    liveRoundStartTime = null;

    // Format hole durations
    const holeDurationsTextList = Array(18).fill('-');
    liveHolesList.forEach(idx => {
      if (liveStrokes[idx] > 0) {
        const elapsedMs = liveHolesDuration[idx] || 0;
        const mins = Math.max(1, Math.round(elapsedMs / 60000));
        holeDurationsTextList[idx] = mins + 'm';
      }
    });
    const holeDurationsStr = holeDurationsTextList.join(',');

    // Format FIR text list
    const firTextList = Array(18).fill('-');
    liveHolesList.forEach(idx => {
      if (liveStrokes[idx] > 0) {
        firTextList[idx] = liveFir[idx] || '-';
      }
    });
    const firStr = firTextList.join(',');

    // Lobby completion steps
    let companionNotes = '';
    if (activeLobbyId && lobbyState && lobbyState.players) {
      let myPlayer = lobbyState.players[lobbyActivePlayerIndex];
      if (myPlayer) {
        myPlayer.finished = true;
        myPlayer.strokes = [...liveStrokes];
        myPlayer.putts = [...livePutts];
        myPlayer.penalties = [...livePenalties];
      }
      
      const allFinished = lobbyState.players.every(p => p.finished);
      try {
        await supabaseClient.from('golf_live_lobbies').update({
          players: lobbyState.players,
          status: allFinished ? 'finished' : 'active',
          updated_at: new Date().toISOString()
        }).eq('id', activeLobbyId);
      } catch (err) {
        console.error('Error marking player finished in lobby:', err);
      }
      
      const companionScores = lobbyState.players
        .filter((_, idx) => idx !== lobbyActivePlayerIndex)
        .map(p => {
          const pStrokes = p.strokes.reduce((sum, s) => sum + s, 0);
          const pPar = liveHolesList.reduce((sum, hIdx) => sum + (p.strokes[hIdx] > 0 ? liveCourse.holesPar[hIdx] : 0), 0);
          const pDiff = pStrokes - pPar;
          const pDiffText = pDiff === 0 ? 'E' : (pDiff > 0 ? ('+' + pDiff) : pDiff);
          const hStr = p.strokes ? p.strokes.join(',') : '';
          return p.name + ' (' + pStrokes + ' golpes, ' + pDiffText + ')' + (hStr ? ' [H:' + hStr + ']' : '');
        });
      
      if (companionScores.length > 0) {
        companionNotes = ' | Compañeros: ' + companionScores.join(', ');
      }
      
      if (lobbyPollInterval) clearInterval(lobbyPollInterval);
      activeLobbyId = null;
      lobbyState = null;
    }

    const courseRating = liveCourse.courseRating;
    const slopeRating = liveCourse.slopeRating;

    let scoreDiff = 0;
    if (playedHolesCount === 18) {
      scoreDiff = (totalStrokes - courseRating) * (113 / slopeRating);
    } else {
      const rating9 = courseRating / 2;
      const slope9 = slopeRating;
      const diff9 = (totalStrokes - rating9) * (113 / slope9);
      scoreDiff = diff9 * 2.0;
    }

    const newRound = {
      id: 'round_' + Date.now(),
      courseId: liveCourse.id,
      date: new Date().toISOString().split('T')[0],
      strokes: [...liveStrokes],
      putts: [...livePutts],
      penalties: [...livePenalties],
      totalStrokes: totalStrokes,
      playedPar: playedPar,
      scoreDifferential: scoreDiff,
      notes: 'Ronda en tiempo real' + (durationText ? ' | Duración: ' + durationText : '') + companionNotes + (durationText ? ' | Duración: ' + durationText : ''),
      course: liveCourse
    };

    try {
      if (supabaseConnected && supabaseClient && userSession && userSession.user) {
        const { error } = await supabaseClient.from('golf_rounds').insert({
          id: newRound.id,
          user_id: userSession.user.id,
          course_id: liveCourse.id,
          date: newRound.date,
          strokes: liveStrokes,
          putts: livePutts,
          penalties: livePenalties,
          total_strokes: totalStrokes,
          played_par: playedPar,
          score_differential: scoreDiff,
          notes: newRound.notes
        });
        if (error) throw error;
        alert('¡Ronda registrada en la nube con éxito!');
      } else {
        rounds.unshift(newRound);
        saveData('golf_tracker_rounds', rounds);
        alert('¡Ronda registrada localmente!');
      }
      
      localStorage.removeItem('golf_tracker_live_round');
      liveRoundActive = false;
      liveCourse = null;

      // Reset UI to setup view
      document.getElementById('live-setup-view').style.display = 'block';
      document.getElementById('live-tracker-view').style.display = 'none';
      updateLiveTrackerVisibility(false);

      // Reload dashboards & switch to History tab
      await loadData();

      // Trigger tab active UI switch
      document.querySelectorAll('.nav-tab').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === 'history');
      });
      document.querySelectorAll('.tab-pane').forEach(p => {
        p.classList.toggle('active', p.id === 'tab-pane-history');
      });

    } catch (err) {
      alert('Error al finalizar ronda: ' + err.message);
    }
  }
}


// ---- Achievements & Personal Records Logic ----
function updateAchievements() {
  const container = document.getElementById('achievements-container');
  if (!container) return;
  container.innerHTML = '';

  const totalRounds = rounds.length;

  // 1. Salida Histórica
  let achFirst = { unlocked: false, val: '', desc: 'Completá tu primera salida de golf', title: 'Salida Histórica', icon: '🚀' };
  if (totalRounds > 0) {
    const oldestRound = rounds[totalRounds - 1];
    achFirst.unlocked = true;
    achFirst.val = 'Registrada el ' + formatDate(oldestRound.date);
  }

  // 2. Mejor Ronda 9H (Ida)
  let achIda = { unlocked: false, val: '', desc: 'Hacé tu mejor score en el hoyo 1 al 9', title: 'Récord de Ida (9H)', icon: '⛳' };
  let bestIdaStrokes = Infinity;
  let bestIdaCourse = '';
  let bestIdaDate = '';
  
  // 3. Mejor Ronda 9H (Vuelta)
  let achVuelta = { unlocked: false, val: '', desc: 'Hacé tu mejor score en el hoyo 10 al 18', title: 'Récord de Vuelta (9H)', icon: '🏹' };
  let bestVueltaStrokes = Infinity;
  let bestVueltaCourse = '';
  let bestVueltaDate = '';

  // 4. Ronda Limpia
  let achClean = { unlocked: false, val: '', desc: 'Jugá al menos 9 hoyos con 0 tiros de multa', title: 'Ronda Limpia', icon: '🛡️' };
  let cleanRoundCourse = '';
  let cleanRoundDate = '';

  // 5. Putting Master
  let achPutt = { unlocked: false, val: '', desc: 'Hacé menos de 1.8 putts promedio (máx 16 en 9H)', title: 'Putting Master', icon: '🎯' };
  let bestPuttSum = Infinity;
  let bestPuttCourse = '';
  let bestPuttDate = '';

  // 6. Gran Par
  let achPars = { unlocked: false, val: '', desc: 'Hacé al menos 3 pars o mejores en una ronda', title: 'Gran Par', icon: '👑' };
  let bestParsCount = 0;
  let bestParsCourse = '';
  let bestParsDate = '';

  rounds.forEach(r => {
    const frontStrokes = r.strokes.slice(0, 9);
    const backStrokes = r.strokes.slice(9, 18);
    const frontPlayed = frontStrokes.filter(s => s > 0).length === 9;
    const backPlayed = backStrokes.filter(s => s > 0).length === 9;
    const playedHoles = r.strokes.filter(s => s > 0).length;

    const courseNameShort = r.course.name.split(' - ')[0];

    // Ida
    if (frontPlayed) {
      const sum = frontStrokes.reduce((a, b) => a + b, 0);
      if (sum < bestIdaStrokes) {
        bestIdaStrokes = sum;
        bestIdaCourse = courseNameShort;
        bestIdaDate = formatDate(r.date);
      }
    }
    // Vuelta
    if (backPlayed) {
      const sum = backStrokes.reduce((a, b) => a + b, 0);
      if (sum < bestVueltaStrokes) {
        bestVueltaStrokes = sum;
        bestVueltaCourse = courseNameShort;
        bestVueltaDate = formatDate(r.date);
      }
    }

    // Clean Round (0 penalties on >= 9 holes)
    if (playedHoles >= 9 && r.penalties) {
      const totalPens = r.penalties.reduce((a, b) => a + b, 0);
      if (totalPens === 0) {
        achClean.unlocked = true;
        cleanRoundCourse = courseNameShort;
        cleanRoundDate = formatDate(r.date);
      }
    }

    // Putting Master (max 16 putts in 9 holes)
    if (r.putts) {
      if (frontPlayed) {
        const sum = r.putts.slice(0, 9).reduce((a, b) => a + b, 0);
        if (sum <= 16 && sum < bestPuttSum) {
          bestPuttSum = sum;
          bestPuttCourse = courseNameShort + ' (Ida)';
          bestPuttDate = formatDate(r.date);
        }
      }
      if (backPlayed) {
        const sum = r.putts.slice(9, 18).reduce((a, b) => a + b, 0);
        if (sum <= 16 && sum < bestPuttSum) {
          bestPuttSum = sum;
          bestPuttCourse = courseNameShort + ' (Vta)';
          bestPuttDate = formatDate(r.date);
        }
      }
    }

    // Gran Par (count pars or birdies)
    let parsCount = 0;
    r.strokes.forEach((stroke, idx) => {
      if (stroke > 0) {
        const diff = stroke - r.course.holesPar[idx];
        if (diff <= 0) parsCount++;
      }
    });
    if (parsCount >= 3) {
      achPars.unlocked = true;
      if (parsCount > bestParsCount) {
        bestParsCount = parsCount;
        bestParsCourse = courseNameShort;
        bestParsDate = formatDate(r.date);
      }
    }
  });

  // Assign Unlocked data
  if (bestIdaStrokes !== Infinity) {
    achIda.unlocked = true;
    achIda.val = bestIdaStrokes + ' golpes en ' + bestIdaCourse + ' (' + bestIdaDate + ')';
  }
  if (bestVueltaStrokes !== Infinity) {
    achVuelta.unlocked = true;
    achVuelta.val = bestVueltaStrokes + ' golpes en ' + bestVueltaCourse + ' (' + bestVueltaDate + ')';
  }
  if (achClean.unlocked) {
    achClean.val = cleanRoundCourse + ' (' + cleanRoundDate + ')';
  }
  if (bestPuttSum !== Infinity) {
    achPutt.unlocked = true;
    const avg = (bestPuttSum / 9).toFixed(1);
    achPutt.val = bestPuttSum + ' putts (' + avg + '/H) en ' + bestPuttCourse + ' (' + bestPuttDate + ')';
  }
  if (achPars.unlocked) {
    achPars.val = bestParsCount + ' Pars o + en ' + bestParsCourse + ' (' + bestParsDate + ')';
  }

  const list = [achFirst, achIda, achVuelta, achClean, achPutt, achPars];

  list.forEach(ach => {
    const card = document.createElement('div');
    card.className = 'achievement-card ' + (ach.unlocked ? 'unlocked' : 'locked');
    
    card.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-info">
        <span class="achievement-title">${ach.title}</span>
        <span class="achievement-desc">${ach.unlocked ? ach.val : ach.desc}</span>
      </div>
    `;
    container.appendChild(card);
  });
}


// ---- Edit Round Form Populate Logic ----
window.editRound = function(roundId) {
  const round = rounds.find(r => r.id === roundId);
  if (!round) return;

  editingRoundId = roundId;

  // Open the register modal
  openModal('modal-register');

  // Change title and button text for edit mode
  const titleEl = document.getElementById('modal-register').querySelector('.modal-title');
  if (titleEl) titleEl.textContent = 'Editar Salida';
  const submitBtn = document.getElementById('modal-register').querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Guardar Cambios';

  // Pre-fill fields
  document.getElementById('reg-date').value = round.date;
  document.getElementById('reg-course-select').value = round.courseId;
  // Parse FIR values from notes
  let manualFir = Array(18).fill('-');
  if (round.notes && round.notes.includes(' | FIR: ')) {
    const parts = round.notes.split(' | FIR: ');
    const firPart = parts[1].split(' | ')[0];
    manualFir = firPart.split(',');
  }
  activeRegisterFir = manualFir;

  let cleanNotes = round.notes || '';
  if (cleanNotes.includes(' | FIR: ')) {
    cleanNotes = cleanNotes.split(' | FIR: ')[0];
  }
  if (cleanNotes.includes(' | Hoyos: ')) {
    cleanNotes = cleanNotes.split(' | Hoyos: ')[0];
  }
  document.getElementById('reg-notes').value = cleanNotes;

  // Determine modality (front, back, full)
  const frontStrokes = round.strokes.slice(0, 9);
  const backStrokes = round.strokes.slice(9, 18);
  const frontPlayed = frontStrokes.filter(s => s > 0).length > 0;
  const backPlayed = backStrokes.filter(s => s > 0).length > 0;

  if (frontPlayed && !backPlayed) {
    activeRoundMode = 'front';
  } else if (!frontPlayed && backPlayed) {
    activeRoundMode = 'back';
  } else {
    activeRoundMode = 'full';
  }

  // Update modality selector buttons active state
  document.querySelectorAll('.btn-modalidad').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-mode') === activeRoundMode);
  });

  // Pre-fill score grids arrays
  activeRegisterStrokes = [...round.strokes];
  activeRegisterPutts = round.putts ? [...round.putts] : Array(18).fill(2);
  activeRegisterPenalties = round.penalties ? [...round.penalties] : Array(18).fill(0);

  // Auto toggle advanced stats ON if they had putts/penalties logged
  const hasPutts = round.putts && round.putts.some(p => p !== 2 && p > 0);
  const hasPens = round.penalties && round.penalties.some(p => p > 0);
  showAdvancedStats = hasPutts || hasPens;
  const advBtn = document.getElementById('btn-toggle-advanced-stats');
  if (advBtn) advBtn.classList.toggle('active', showAdvancedStats);

  // Render inputs and update sums
  renderScorecardInputs(round.course);
  updateRegistrationTotals(round.course);
};


// ---- Supabase Cloud Database integration Helpers ----
function loadLocalDataFallback() {
  const savedCourses = localStorage.getItem('golf_tracker_courses');
  const savedRounds = localStorage.getItem('golf_tracker_rounds');

  if (savedCourses) {
    const parsed = JSON.parse(savedCourses);
    courses = parsed.map(c => {
      const def = DEFAULT_COURSES.find(dc => dc.id === c.id || dc.name.toLowerCase().includes(c.name.split(' (')[0].toLowerCase()));
      if (def) {
        return {
          ...c,
          strokeIndex: def.strokeIndex || c.strokeIndex,
          tees: def.tees || c.tees
        };
      }
      return c;
    });
    DEFAULT_COURSES.forEach(dc => {
      if (!courses.some(mc => mc.id === dc.id)) {
        courses.push(dc);
      }
    });
  } else {
    courses = [...DEFAULT_COURSES];
  }

  if (savedRounds) rounds = JSON.parse(savedRounds);
  else rounds = [];

  rounds.forEach(r => {
    r.course = courses.find(c => c.id === r.courseId) || DEFAULT_COURSES[0];
  });
}

function initSupabase() {
  const url = "https://vqwyrzydgcjndopcdfga.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxd3lyenlkZ2NqbmRvcGNkZmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzY5NjMsImV4cCI6MjA5MjQxMjk2M30.D71zmKDrVhSN9HjwOhBiBqyryqe_EV6Rtsk7uCdVSWc";
  
  try {
    supabaseClient = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    supabaseConnected = true;
    checkUserSession();
  } catch (err) {
    console.error('Error al inicializar Supabase:', err);
    supabaseConnected = false;
  }
}



async function checkUserSession() {
  if (!supabaseClient) return;
  
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error('Error al obtener sesión:', error);
    return;
  }
  
  handleAuthStateChange(session);
  
  // Listen to auth changes
  supabaseClient.auth.onAuthStateChange((event, session) => {
    handleAuthStateChange(session);
  });
}

function handleAuthStateChange(session) {
  userSession = session;
  const authBtn = document.getElementById('btn-auth-action');
  const emailDisplay = document.getElementById('user-email-display');
  
  if (!authBtn || !emailDisplay) return;

  if (session && session.user) {
    authBtn.textContent = 'Cerrar Sesión';
    authBtn.classList.remove('btn-outline');
    authBtn.classList.add('hover-red');
    
    emailDisplay.textContent = session.user.email;
    emailDisplay.style.display = 'inline-block';

    const bottomAuthLabel = document.getElementById('bottom-auth-label');
    if (bottomAuthLabel) bottomAuthLabel.textContent = 'Perfil';
    
    syncLocalDataToCloud();
  } else {
    authBtn.textContent = 'Iniciar Sesión';
    authBtn.classList.add('btn-outline');
    authBtn.classList.remove('hover-red');
    
    emailDisplay.style.display = 'none';

    const bottomAuthLabel = document.getElementById('bottom-auth-label');
    if (bottomAuthLabel) bottomAuthLabel.textContent = 'Cuenta';
  }
  
  loadData();
}

async function syncLocalDataToCloud() {
  if (!supabaseConnected || !supabaseClient || !userSession || !userSession.user) return;
  
  const savedCourses = localStorage.getItem('golf_tracker_courses');
  const savedRounds = localStorage.getItem('golf_tracker_rounds');
  
  let localCourses = [];
  let localRounds = [];
  
  if (savedCourses) localCourses = JSON.parse(savedCourses);
  if (savedRounds) localRounds = JSON.parse(savedRounds);
  
  // 1. Sync all possible courses (both default and custom) using bulk upsert to prevent race conditions
  const allCoursesToSync = [...DEFAULT_COURSES, ...localCourses];
  
  // Deduplicate courses by id to prevent PostgreSQL Cardinality Violation (21000)
  const uniqueCoursesMap = new Map();
  allCoursesToSync.forEach(c => {
    uniqueCoursesMap.set(c.id, c);
  });
  const uniqueCourses = Array.from(uniqueCoursesMap.values());

  const coursesData = uniqueCourses.map(c => ({
    id: c.id,
    user_id: userSession.user.id,
    name: c.name,
    par: c.par,
    course_rating: c.courseRating,
    slope_rating: c.slopeRating,
    holes_par: c.holesPar
  }));
  
  try {
    const { error } = await supabaseClient.from('golf_courses').upsert(coursesData);
    if (error) throw error;
  } catch (err) {
    console.error('Error al sincronizar canchas:', err);
  }

  // 2. Sync local rounds
  if (localRounds.length > 0) {
    let syncedCount = 0;
    for (const r of localRounds) {
      try {
        const { data } = await supabaseClient.from('golf_rounds').select('id').eq('id', r.id).maybeSingle();
        if (!data) {
          const { error } = await supabaseClient.from('golf_rounds').insert({
            id: r.id,
            user_id: userSession.user.id,
            course_id: r.courseId,
            date: r.date,
            strokes: r.strokes,
            putts: r.putts,
            penalties: r.penalties,
            total_strokes: r.totalStrokes,
            played_par: r.playedPar,
            score_differential: r.scoreDifferential,
            notes: r.notes || null
          });
          if (!error) syncedCount++;
        }
      } catch (err) {
        console.error('Error al sincronizar ronda:', err);
      }
    }
    
    if (syncedCount > 0) {
      alert('¡Sincronización completa! Se subieron ' + syncedCount + ' rondas locales a tu cuenta en la nube.');
      localStorage.removeItem('golf_tracker_rounds');
    }
  }
}

// Automatically trigger Supabase Client setup on page load
initSupabase();


// ====================================================================
// MULTIPLAYER LIVE LOBBY FUNCTIONS (👥 Jugar con Amigos)
// ====================================================================

function startMultiplayerRoundSetup() {
  if (!supabaseConnected || !supabaseClient || !userSession || !userSession.user) {
    alert('¡Iniciá sesión en la nube para poder jugar con amigos!');
    return;
  }
  const courseId = document.getElementById('live-course-select').value;
  createMultiplayerLobby(courseId);
}

async function createMultiplayerLobby(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  // Read current active modality button from the UI
  const activeBtn = document.querySelector('.btn-live-mode.active');
  liveMode = activeBtn ? activeBtn.getAttribute('data-mode') : 'front';

  liveHoleStartTime = Date.now();
  liveHolesDuration = Array(18).fill(0);
  const lobbyId = generateShortLobbyId();
  const myName = userSession.user.email.split('@')[0];

  let holesForLobby = Array.from({length: 18}, (_, i) => i);
  if (liveMode === 'front') {
    holesForLobby = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  } else if (liveMode === 'back') {
    holesForLobby = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  }

  const lobbyObj = {
    id: lobbyId,
    course_id: courseId,
    creator_id: userSession.user.id,
    creator_name: myName,
    status: 'active',
    players: [
      {
        name: myName,
        user_id: userSession.user.id,
        strokes: Array(18).fill(0),
        putts: Array(18).fill(0),
        penalties: Array(18).fill(0),
        live_mode: liveMode,
        holes_list: holesForLobby
      }
    ]
  };

  try {
    const { error } = await supabaseClient.from('golf_live_lobbies').insert(lobbyObj);
    if (error) throw error;

    liveCourse = course;
    liveRoundActive = true;
    liveCurrentIndex = 0;
    activeLobbyId = lobbyId;
    lobbyState = lobbyObj;
    lobbyActivePlayerIndex = 0;

    // Configure holes list based on modality
    if (liveMode === 'front') {
      liveHolesList = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    } else if (liveMode === 'back') {
      liveHolesList = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    } else {
      liveHolesList = Array.from({length: 18}, (_, i) => i);
    }

    // Reset arrays locally
    liveStrokes = Array(18).fill(0);
    livePutts = Array(18).fill(0);
    livePenalties = Array(18).fill(0);

    liveRoundStartTime = Date.now();
    if (liveTimerInterval) clearInterval(liveTimerInterval);
    liveTimerInterval = setInterval(updateLiveTimer, 1000);
    updateLiveTimer();

    // UI transition
    document.getElementById('live-setup-view').style.display = 'none';
    document.getElementById('live-tracker-view').style.display = 'block';

    startLobbyPolling(lobbyId);
    renderLiveHole();
    saveLiveRoundState();
  } catch (err) {
    alert('Error al crear partida multijugador: ' + err.message);
  }
}

function startLobbyPolling(lobbyId) {
  if (lobbyPollInterval) clearInterval(lobbyPollInterval);
  lobbyPollInterval = setInterval(async () => {
    await syncLobby(lobbyId);
  }, 4000);
  syncLobby(lobbyId);
}

async function syncLobby(lobbyId) {
  if (!supabaseClient || !liveRoundActive) return;

  try {
    const { data, error } = await supabaseClient
      .from('golf_live_lobbies')
      .select('*')
      .eq('id', lobbyId)
      .single();

    if (error || !data || !data.players) return;

    const myIdx = getMyPlayerIndexInLobby();

    // Notify if creator finished and we haven't been notified
    const creatorFinished = data.players[0] && data.players[0].finished;
    if (creatorFinished && myIdx !== 0 && !window._creatorFinishedToastShown) {
      window._creatorFinishedToastShown = true;
      showPremiumToast('⛳ El creador finalizó su tarjeta. Podés seguir jugando y terminar a tu ritmo.');
    }

    if (data.status === 'finished' && data.players[myIdx] && data.players[myIdx].finished) {
      if (lobbyPollInterval) clearInterval(lobbyPollInterval);
      return;
    }

    // Merge remote peer player data while preserving our own local active state!
    if (!lobbyState) lobbyState = data;
    data.players.forEach((remotePlayer, pIdx) => {
      if (pIdx !== myIdx) {
        if (!lobbyState.players[pIdx]) {
          lobbyState.players[pIdx] = remotePlayer;
        } else {
          lobbyState.players[pIdx].strokes = remotePlayer.strokes;
          lobbyState.players[pIdx].putts = remotePlayer.putts;
          lobbyState.players[pIdx].penalties = remotePlayer.penalties;
          lobbyState.players[pIdx].finished = remotePlayer.finished;
        }
      }
    });

    // If currently viewing another player's scorecard, update view from their remote scores
    if (lobbyActivePlayerIndex !== myIdx) {
      const peer = lobbyState.players[lobbyActivePlayerIndex];
      if (peer) {
        liveStrokes = [...peer.strokes];
        livePutts = [...peer.putts];
        livePenalties = [...(peer.penalties || Array(18).fill(0))];
        updateCurrentHoleDisplay();
      }
    } else {
      // We are viewing our own card: ensure local arrays match our player entry
      if (lobbyState.players[myIdx]) {
        lobbyState.players[myIdx].strokes = [...liveStrokes];
        lobbyState.players[myIdx].putts = [...livePutts];
        lobbyState.players[myIdx].penalties = [...livePenalties];
      }
      renderLiveMultiplayerTabs();
    }
  } catch (err) {
    console.error('Error in lobby sync:', err);
  }
}

async function joinMultiplayerLobby(lobbyId) {
  if (!supabaseClient) {
    alert('Iniciá sesión en la nube antes de poder unirte a un juego.');
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('golf_live_lobbies')
      .select('*')
      .eq('id', lobbyId)
      .single();

    if (error || !data) {
      alert('No se pudo encontrar la partida multijugador.');
      return;
    }

    if (data.status === 'finished') {
      alert('Esta ronda multijugador ya ha finalizado.');
      return;
    }

    // Retrieve course
    // If courses aren't loaded yet, wait 1.5 seconds and retry
    if (courses.length === 0) {
      setTimeout(() => joinMultiplayerLobby(lobbyId), 1500);
      return;
    }

    const lobbyCourse = courses.find(c => c.id === data.course_id);
    if (!lobbyCourse) {
      alert('No tenés agregada la cancha en la que se juega la partida.');
      return;
    }

    // Check if player is already in lobby
    let myIndex = -1;
    const localName = localStorage.getItem('golf_tracker_lobby_player_name');
    if (userSession && userSession.user) {
      myIndex = data.players.findIndex(p => p.user_id === userSession.user.id);
    } else if (localName) {
      myIndex = data.players.findIndex(p => p.name === localName);
    }

    // Determine creator's selected modality & holes
    const creatorPlayer = data.players && data.players[0] ? data.players[0] : null;
    const creatorMode = (creatorPlayer && creatorPlayer.live_mode) ? creatorPlayer.live_mode : (data.live_mode || 'front');
    const creatorHoles = (creatorPlayer && creatorPlayer.holes_list) ? creatorPlayer.holes_list : (data.holes_list || null);

    let assignedHolesList = Array.from({length: 18}, (_, i) => i);
    let assignedMode = 'full';
    if (creatorHoles && Array.isArray(creatorHoles) && creatorHoles.length > 0) {
      assignedHolesList = [...creatorHoles];
      assignedMode = creatorMode || (assignedHolesList.length === 18 ? 'full' : (assignedHolesList[0] === 0 ? 'front' : 'back'));
    } else if (creatorMode === 'front') {
      assignedHolesList = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      assignedMode = 'front';
    } else if (creatorMode === 'back') {
      assignedHolesList = [9, 10, 11, 12, 13, 14, 15, 16, 17];
      assignedMode = 'back';
    }

    if (myIndex !== -1) {
      // Resume round
      liveCourse = lobbyCourse;
      liveRoundActive = true;
      liveCurrentIndex = 0;
      activeLobbyId = lobbyId;
      lobbyState = data;
      lobbyActivePlayerIndex = myIndex;
      
      liveHolesList = assignedHolesList;
      liveMode = assignedMode;
      liveRoundStartTime = new Date(data.created_at).getTime();

      // UI Transitions
      document.getElementById('live-setup-view').style.display = 'none';
      document.getElementById('live-tracker-view').style.display = 'block';

      // Sync active mode buttons in UI
      document.querySelectorAll('.btn-live-mode').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-mode') === liveMode);
      });

      // Switch active tab view
      document.querySelectorAll('.nav-tab').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === 'live');
      });
      document.querySelectorAll('.tab-pane').forEach(p => {
        p.classList.toggle('active', p.id === 'tab-pane-live');
      });

      startLobbyPolling(lobbyId);
      renderLiveHole();
      saveLiveRoundState();
      return;
    }

    // Ask to Join Modal
    document.getElementById('modal-join-lobby').style.display = 'flex';
    
    let modeText = '18 Hoyos';
    if (assignedMode === 'front') modeText = 'Ida (H1-9)';
    else if (assignedMode === 'back') modeText = 'Vuelta (H10-18)';
    
    document.getElementById('join-lobby-message').innerHTML = 'Te invitaron a jugar una ronda de golf con <strong>"' + data.creator_name + '"</strong> en la cancha <strong>' + lobbyCourse.name.split(' - ')[0] + '</strong> (' + modeText + ').';
    
    const loggedInBox = document.getElementById('join-logged-in-box');
    const loggedInEmail = document.getElementById('join-logged-in-email');
    const choiceBox = document.getElementById('join-auth-choice-box');
    const nameGroup = document.getElementById('join-player-name-group');
    const nameInput = document.getElementById('join-player-name');
    const btnChoiceLogin = document.getElementById('btn-choice-login');
    const btnChoiceGuest = document.getElementById('btn-choice-guest');

    if (userSession && userSession.user) {
      if (loggedInBox) loggedInBox.style.display = 'block';
      if (loggedInEmail) loggedInEmail.textContent = userSession.user.email;
      if (choiceBox) choiceBox.style.display = 'none';
      if (nameGroup) nameGroup.style.display = 'none';
      if (nameInput) nameInput.value = userSession.user.email.split('@')[0];
    } else {
      if (loggedInBox) loggedInBox.style.display = 'none';
      if (choiceBox) choiceBox.style.display = 'flex';
      if (nameGroup) nameGroup.style.display = 'none';
      if (nameInput) nameInput.value = '';

      if (btnChoiceGuest) {
        btnChoiceGuest.onclick = () => {
          choiceBox.style.display = 'none';
          nameGroup.style.display = 'flex';
          nameInput.focus();
        };
      }

      if (btnChoiceLogin) {
        btnChoiceLogin.onclick = () => {
          localStorage.setItem('golf_tracker_pending_join_lobby', lobbyId);
          document.getElementById('modal-join-lobby').style.display = 'none';
          openModal('modal-auth');
        };
      }
    }

    // Set confirm join listener
    const confirmBtn = document.getElementById('btn-confirm-join-lobby');
    confirmBtn.onclick = async () => {
      let enteredName = '';
      if (userSession && userSession.user) {
        enteredName = userSession.user.email.split('@')[0];
      } else {
        enteredName = nameInput.value.trim();
        if (!enteredName) {
          choiceBox.style.display = 'none';
          nameGroup.style.display = 'flex';
          nameInput.focus();
          alert('Por favor ingresá tu nombre antes de entrar.');
          return;
        }
      }

      const newPlayer = {
        name: enteredName,
        user_id: (userSession && userSession.user) ? userSession.user.id : null,
        strokes: Array(18).fill(0),
        putts: Array(18).fill(0),
        penalties: Array(18).fill(0),
        live_mode: assignedMode,
        holes_list: assignedHolesList
      };

      const updatedPlayers = [...data.players, newPlayer];

      try {
        const { error: updErr } = await supabaseClient
          .from('golf_live_lobbies')
          .update({ players: updatedPlayers, updated_at: new Date().toISOString() })
          .eq('id', lobbyId);

        if (updErr) throw updErr;

        localStorage.setItem('golf_tracker_lobby_player_name', enteredName);
        document.getElementById('modal-join-lobby').style.display = 'none';

        // Load into state
        liveCourse = lobbyCourse;
        liveRoundActive = true;
        liveCurrentIndex = 0;
        activeLobbyId = lobbyId;
        lobbyActivePlayerIndex = updatedPlayers.length - 1; // Focus on ourselves
        lobbyState = { ...data, players: updatedPlayers };

        liveHolesList = assignedHolesList;
        liveMode = assignedMode;
        liveRoundStartTime = Date.now();

        // UI transitions
        document.getElementById('live-setup-view').style.display = 'none';
        document.getElementById('live-tracker-view').style.display = 'block';

        document.querySelectorAll('.btn-live-mode').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-mode') === liveMode);
        });

        document.querySelectorAll('.nav-tab').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-tab') === 'live');
        });
        document.querySelectorAll('.tab-pane').forEach(p => {
          p.classList.toggle('active', p.id === 'tab-pane-live');
        });

        startLobbyPolling(lobbyId);
        renderLiveHole();
        saveLiveRoundState();
      } catch (err) {
        alert('Error al unirse a la partida: ' + err.message);
      }
    };
  } catch (err) {
    alert('Error al conectar con la invitación: ' + err.message);
  }
}


// ==========================================
// ROBUST LOCAL-FIRST MULTIPLAYER SYNC & UI
// ==========================================

let lobbyDbUpdateTimeout = null;
let isDbUpdateInProgress = false;
let hasPendingDbUpdate = false;

function getMyPlayerIndexInLobby() {
  if (!lobbyState || !lobbyState.players) return 0;
  if (userSession && userSession.user) {
    const idx = lobbyState.players.findIndex(p => p.user_id === userSession.user.id);
    if (idx !== -1) return idx;
  }
  const localName = localStorage.getItem('golf_tracker_lobby_player_name');
  if (localName) {
    const idx = lobbyState.players.findIndex(p => p.name && p.name.toLowerCase() === localName.toLowerCase());
    if (idx !== -1) return idx;
  }
  return 0;
}

function updateCurrentHoleDisplay() {
  if (!liveRoundActive || !liveCourse) return;
  const idx = liveHolesList[liveCurrentIndex];
  const strokeVal = liveStrokes[idx] || 0;
  const puttVal = livePutts[idx] || 0;
  const penVal = livePenalties[idx] || 0;
  const totalHoleStrokes = strokeVal > 0 ? (strokeVal + penVal) : 0;

  // 1. Hole controls
  const elStroke = document.getElementById('live-stroke-val');
  if (elStroke) elStroke.textContent = strokeVal;

  const elPutt = document.getElementById('live-putt-val');
  if (elPutt) elPutt.textContent = puttVal;

  const elPen = document.getElementById('live-penalty-val');
  if (elPen) elPen.textContent = penVal;

  // 2. Big circle value
  const elCircle = document.getElementById('live-current-hole-strokes-val');
  if (elCircle) elCircle.textContent = totalHoleStrokes;

  // 3. Totals summary
  updateLiveScoreSummary();

  // 4. Hole jumper map
  renderLiveJumperGrid();

  // 5. Multiplayer tabs
  renderLiveMultiplayerTabs();
}

function scheduleLobbyDatabaseUpdate() {
  if (!activeLobbyId || !lobbyState || !supabaseClient) return;

  // Immediately mirror our local changes into local lobbyState
  const myIdx = getMyPlayerIndexInLobby();
  if (lobbyState.players && lobbyState.players[myIdx]) {
    lobbyState.players[myIdx].strokes = [...liveStrokes];
    lobbyState.players[myIdx].putts = [...livePutts];
    lobbyState.players[myIdx].penalties = [...livePenalties];
  }

  if (lobbyDbUpdateTimeout) clearTimeout(lobbyDbUpdateTimeout);
  lobbyDbUpdateTimeout = setTimeout(() => {
    executeLobbyDatabaseUpdate();
  }, 250);
}

async function executeLobbyDatabaseUpdate() {
  if (!activeLobbyId || !lobbyState || !supabaseClient) return;
  if (isDbUpdateInProgress) {
    hasPendingDbUpdate = true;
    return;
  }

  isDbUpdateInProgress = true;
  try {
    const myIdx = getMyPlayerIndexInLobby();
    if (lobbyState.players && lobbyState.players[myIdx]) {
      lobbyState.players[myIdx].strokes = [...liveStrokes];
      lobbyState.players[myIdx].putts = [...livePutts];
      lobbyState.players[myIdx].penalties = [...livePenalties];
    }

    await supabaseClient
      .from('golf_live_lobbies')
      .update({
        players: lobbyState.players,
        updated_at: new Date().toISOString()
      })
      .eq('id', activeLobbyId);
  } catch (err) {
    console.error('Error updating lobby in DB:', err);
  } finally {
    isDbUpdateInProgress = false;
    if (hasPendingDbUpdate) {
      hasPendingDbUpdate = false;
      executeLobbyDatabaseUpdate();
    }
  }
}

async function updateLobbyDatabase() {
  if (!activeLobbyId || !lobbyState || !supabaseClient) return;

  // Find our player index
  let myIdx = lobbyActivePlayerIndex;
  const localName = localStorage.getItem('golf_tracker_lobby_player_name');
  if (userSession && userSession.user) {
    const idx = lobbyState.players.findIndex(p => p.user_id === userSession.user.id);
    if (idx !== -1) myIdx = idx;
  } else if (localName) {
    const idx = lobbyState.players.findIndex(p => p.name === localName);
    if (idx !== -1) myIdx = idx;
  }

  // Update current active player score in lobby State
  const player = lobbyState.players[lobbyActivePlayerIndex];
  if (player) {
    player.strokes = liveStrokes;
    player.putts = livePutts;
    player.penalties = livePenalties;
  }

  try {
    await supabaseClient
      .from('golf_live_lobbies')
      .update({
        players: lobbyState.players,
        updated_at: new Date().toISOString()
      })
      .eq('id', activeLobbyId);
  } catch (err) {
    console.error('Error updating lobby score:', err);
  }
}

function renderLiveMultiplayerTabs() {
  const container = document.getElementById('live-multiplayer-tabs');
  if (!container || !lobbyState || !lobbyState.players) return;

  container.innerHTML = '';

  lobbyState.players.forEach((player, idx) => {
    let totalStrokes = 0;
    let totalPar = 0;

    const pPens = player.penalties || Array(18).fill(0);
    liveHolesList.forEach(hIdx => {
      const hTotal = (player.strokes[hIdx] || 0) + (pPens[hIdx] || 0);
      if (hTotal > 0) {
        totalStrokes += hTotal;
        totalPar += liveCourse.holesPar[hIdx];
      }
    });

    const diff = totalStrokes - totalPar;
    const diffText = totalStrokes === 0 ? 'E' : (diff === 0 ? 'E' : (diff > 0 ? '+' + diff : diff));
    const statusSuffix = player.finished ? ' 🏁' : '';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-xs-template' + (idx === lobbyActivePlayerIndex ? ' active' : '');
    btn.textContent = player.name + ' (' + diffText + ')' + statusSuffix;
    btn.addEventListener('click', () => {
      lobbyActivePlayerIndex = idx;
      
      // Load selected player scorecards into local active arrays
      liveStrokes = player.strokes;
      livePutts = player.putts;
      livePenalties = player.penalties || Array(18).fill(0);
      
      // Render
      renderLiveHole();
      saveLiveRoundState();
    });

    container.appendChild(btn);
  });
}

function shareLobbyInvite() {
  if (!activeLobbyId) return;
  const inviteUrl = window.location.origin + window.location.pathname + '?lobby=' + activeLobbyId;
  navigator.clipboard.writeText(inviteUrl).then(() => {
    alert('¡Link de invitación copiado al portapapeles! Envíaselo a tu amigo para que juegue con vos.');
  }).catch(() => {
    prompt('Copiá este link y envíaselo a tu amigo para jugar:', inviteUrl);
  });
}

async function saveLobbyRoundLocally() {
  if (!lobbyState || !liveCourse) return;

  let myIdx = lobbyActivePlayerIndex;
  const localName = localStorage.getItem('golf_tracker_lobby_player_name');
  if (userSession && userSession.user) {
    const idx = lobbyState.players.findIndex(p => p.user_id === userSession.user.id);
    if (idx !== -1) myIdx = idx;
  } else if (localName) {
    const idx = lobbyState.players.findIndex(p => p.name === localName);
    if (idx !== -1) myIdx = idx;
  }

  const myPlayer = lobbyState.players[myIdx];
  if (!myPlayer) return;

  const myStrokes = myPlayer.strokes;
  const myPutts = myPlayer.putts;
  const myPenalties = myPlayer.penalties || Array(18).fill(0);

  let playedHoles = 0;
  let totalStrokes = 0;
  let playedPar = 0;

  liveHolesList.forEach(idx => {
    if (myStrokes[idx] > 0) {
      playedHoles++;
      totalStrokes += myStrokes[idx] + (myPenalties[idx] || 0);
      playedPar += liveCourse.holesPar[idx];
    }
  });

  if (playedHoles === 0) {
    cancelLiveRoundSilent();
    return;
  }

  // Calculate Differential
  const courseRating = liveCourse.courseRating;
  const slopeRating = liveCourse.slopeRating;
  let scoreDiff = 0;
  if (playedHoles === 18) {
    scoreDiff = (totalStrokes - courseRating) * (113 / slopeRating);
  } else {
    const rating9 = courseRating / 2;
    const slope9 = slopeRating;
    const diff9 = (totalStrokes - rating9) * (113 / slope9);
    scoreDiff = diff9 * 2.0;
  }

  // Duration
  let durationText = '';
  if (liveRoundStartTime) {
    const elapsedMs = Date.now() - liveRoundStartTime;
    const hours = Math.floor(elapsedMs / 3600000);
    const minutes = Math.floor((elapsedMs % 3600000) / 60000);
    durationText = hours > 0 ? (hours + 'h ' + minutes + 'm') : (minutes + 'm');
  }

  // Companions
  const companionScores = lobbyState.players
    .filter((_, idx) => idx !== myIdx)
    .map(p => {
      const pPenalties = p.penalties || Array(18).fill(0);
      const pStrokes = p.strokes.reduce((sum, s, hIdx) => sum + s + (pPenalties[hIdx] || 0), 0);
      const pPar = liveHolesList.reduce((sum, hIdx) => sum + (p.strokes[hIdx] > 0 ? liveCourse.holesPar[hIdx] : 0), 0);
      const pDiff = pStrokes - pPar;
      const pDiffText = pDiff === 0 ? 'E' : (pDiff > 0 ? ('+' + pDiff) : pDiff);
      const hScores = liveHolesList.map(hIdx => p.strokes[hIdx] > 0 ? (p.strokes[hIdx] + (pPenalties[hIdx] || 0)) : 0).join(',');
      return p.name + ' (' + pStrokes + ' golpes, ' + pDiffText + ') [H:' + hScores + ']';
    });

  const notesVal = 'Ronda multijugador' +
                   (durationText ? ' | Duración: ' + durationText : '') +
                   (companionScores.length > 0 ? ' | Compañeros: ' + companionScores.join(', ') : '');

  const newRound = {
    id: 'round_' + Date.now(),
    courseId: liveCourse.id,
    date: new Date().toISOString().split('T')[0],
    strokes: [...myStrokes],
    putts: [...myPutts],
    penalties: [...myPenalties],
    totalStrokes: totalStrokes,
    playedPar: playedPar,
    scoreDifferential: scoreDiff,
    notes: notesVal,
    course: liveCourse
  };

  try {
    if (supabaseConnected && supabaseClient && userSession && userSession.user) {
      const { error } = await supabaseClient.from('golf_rounds').insert({
        id: newRound.id,
        user_id: userSession.user.id,
        course_id: liveCourse.id,
        date: newRound.date,
        strokes: myStrokes,
        putts: myPutts,
        penalties: myPenalties,
        total_strokes: totalStrokes,
        played_par: playedPar,
        score_differential: scoreDiff,
        notes: notesVal
      });
      if (error) throw error;
    } else {
      rounds.unshift(newRound);
      saveData('golf_tracker_rounds', rounds);
    }
  } catch (err) {
    console.error('Error saving round locally for peer:', err);
  }

  cancelLiveRoundSilent();
  await loadData();
}

function cancelLiveRoundSilent() {
  if (liveTimerInterval) {
    clearInterval(liveTimerInterval);
    liveTimerInterval = null;
  }
  if (lobbyPollInterval) {
    clearInterval(lobbyPollInterval);
    lobbyPollInterval = null;
  }
  liveRoundStartTime = null;
  activeLobbyId = null;
  lobbyState = null;
  liveRoundActive = false;
  liveCourse = null;

  localStorage.removeItem('golf_tracker_live_round');
  document.getElementById('live-setup-view').style.display = 'block';
  document.getElementById('live-tracker-view').style.display = 'none';
  updateLiveTrackerVisibility(false);
}


// ---- Advanced Stats & Gamification Helpers ----

function setLiveFir(val) {
  if (!isMyLiveScorecardActive()) return;
  const idx = liveHolesList[liveCurrentIndex];
  if (liveFir[idx] === val) {
    liveFir[idx] = '-';
  } else {
    liveFir[idx] = val;
  }
  updateLiveFirButtons();
  saveLiveRoundState();
}

function updateLiveFirButtons() {
  const idx = liveHolesList[liveCurrentIndex];
  const val = liveFir[idx] || '-';
  
  const btnL = document.getElementById('btn-live-fir-l');
  const btnC = document.getElementById('btn-live-fir-c');
  const btnR = document.getElementById('btn-live-fir-r');
  
  if (!btnL || !btnC || !btnR) return;
  
  btnL.classList.remove('active');
  btnC.classList.remove('active');
  btnR.classList.remove('active');
  
  if (val === 'L') btnL.classList.add('active');
  else if (val === 'C') btnC.classList.add('active');
  else if (val === 'R') btnR.classList.add('active');
}

window.cycleHoleFir = function(i) {
  const current = activeRegisterFir[i] || '-';
  let next = '-';
  if (current === '-') next = 'C';
  else if (current === 'C') next = 'L';
  else if (current === 'L') next = 'R';
  else if (current === 'R') next = '-';
  
  activeRegisterFir[i] = next;
  
  const btn = document.getElementById('reg-fir-h' + i);
  if (btn) {
    btn.className = 'fir-cycle-btn';
    if (next === 'C') {
      btn.textContent = '🎯';
      btn.classList.add('fir-c');
    } else if (next === 'L') {
      btn.textContent = '⬅️';
      btn.classList.add('fir-l');
    } else if (next === 'R') {
      btn.textContent = '➡️';
      btn.classList.add('fir-r');
    } else {
      btn.textContent = '-';
    }
  }
};

const ALL_ACHIEVEMENTS = [
  {
    id: "birdie",
    title: "Bajo Par",
    desc: "Hacer un hoyo en menos del Par (Birdie o mejor)",
    icon: "🦅",
    check: (roundsList) => {
      return roundsList.some(r => r.strokes.some((stroke, i) => stroke > 0 && (stroke - r.course.holesPar[i]) <= -1));
    }
  },
  {
    id: "putt-master",
    title: "Putt Maestro",
    desc: "Completar 9 hoyos con 15 putts o menos",
    icon: "🎯",
    check: (roundsList) => {
      return roundsList.some(r => {
        if (!r.putts) return false;
        const frontPutts = r.putts.slice(0, 9);
        const backPutts = r.putts.slice(9, 18);
        const frontPlayed = r.strokes.slice(0, 9).filter(s => s > 0).length === 9;
        const backPlayed = r.strokes.slice(9, 18).filter(s => s > 0).length === 9;
        if (frontPlayed && frontPutts.reduce((sum, p) => sum + p, 0) <= 15) return true;
        if (backPlayed && backPutts.reduce((sum, p) => sum + p, 0) <= 15) return true;
        return false;
      });
    }
  },
  {
    id: "break-90",
    title: "Rompe Barreras",
    desc: "Hacer menos de 45 golpes en 9 hoyos o menos de 90 en 18 hoyos",
    icon: "⚡",
    check: (roundsList) => {
      return roundsList.some(r => {
        const playedCount = r.strokes.filter(s => s > 0).length;
        if (playedCount === 9 && r.totalStrokes < 45) return true;
        if (playedCount === 18 && r.totalStrokes < 90) return true;
        return false;
      });
    }
  },
  {
    id: "birdie-train",
    title: "Birdie Train",
    desc: "Lograr dos birdies consecutivos en una misma ronda",
    icon: "🔥",
    check: (roundsList) => {
      return roundsList.some(r => {
        let birdiesConsec = 0;
        for (let i = 0; i < 18; i++) {
          if (r.strokes[i] > 0) {
            const diff = r.strokes[i] - r.course.holesPar[i];
            if (diff <= -1) {
              birdiesConsec++;
              if (birdiesConsec >= 2) return true;
            } else {
              birdiesConsec = 0;
            }
          }
        }
        return false;
      });
    }
  },
  {
    id: "clean-card",
    title: "Ronda Limpia",
    desc: "Completar al menos 9 hoyos sin registrar triples bogeys o peor",
    icon: "🛡️",
    check: (roundsList) => {
      return roundsList.some(r => {
        const playedCount = r.strokes.filter(s => s > 0).length;
        if (playedCount < 9) return false;
        
        let clean = true;
        r.strokes.forEach((stroke, i) => {
          if (stroke > 0) {
            const par = r.course.holesPar[i];
            const pen = r.penalties ? r.penalties[i] : 0;
            if ((stroke + pen - par) >= 3) clean = false;
          }
        });
        return clean;
      });
    }
  },
  {
    id: "streak-pars",
    title: "Racha de Pares",
    desc: "Lograr hacer 3 pares o birdies seguidos en una ronda",
    icon: "💎",
    check: (roundsList) => {
      return roundsList.some(r => {
        let parsConsec = 0;
        for (let i = 0; i < 18; i++) {
          if (r.strokes[i] > 0) {
            const diff = r.strokes[i] - r.course.holesPar[i];
            if (diff <= 0) {
              parsConsec++;
              if (parsConsec >= 3) return true;
            } else {
              parsConsec = 0;
            }
          }
        }
        return false;
      });
    }
  },
  // ====== LOGROS PARA PRINCIPIANTES ======
  {
    id: "first-round",
    title: "Primera Vuelta",
    desc: "Completar tu primera salida de golf registrada",
    icon: "🏌️",
    check: (roundsList) => {
      return roundsList.length >= 1;
    }
  },
  {
    id: "five-rounds",
    title: "Jugador Habitual",
    desc: "Completar 5 salidas registradas",
    icon: "💪",
    check: (roundsList) => {
      return roundsList.length >= 5;
    }
  },
  {
    id: "ten-rounds",
    title: "Veterano del Campo",
    desc: "Completar 10 salidas registradas",
    icon: "🏆",
    check: (roundsList) => {
      return roundsList.length >= 10;
    }
  },
  {
    id: "first-par",
    title: "Primer Par",
    desc: "Hacer un hoyo exactamente en Par por primera vez",
    icon: "✅",
    check: (roundsList) => {
      return roundsList.some(r => r.strokes.some((stroke, i) => stroke > 0 && stroke === r.course.holesPar[i]));
    }
  },
  {
    id: "no-penalties",
    title: "Sin Multas",
    desc: "Completar al menos 9 hoyos sin registrar ningún tiro de multa",
    icon: "😎",
    check: (roundsList) => {
      return roundsList.some(r => {
        const playedCount = r.strokes.filter(s => s > 0).length;
        if (playedCount < 9) return false;
        if (!r.penalties) return true;
        const totalPenalties = r.penalties.reduce((sum, p) => sum + (p || 0), 0);
        return totalPenalties === 0;
      });
    }
  },
  {
    id: "bogey-or-better",
    title: "Bogey o Mejor",
    desc: "Hacer al menos un hoyo en Bogey o mejor en cada ronda",
    icon: "👍",
    check: (roundsList) => {
      return roundsList.some(r => {
        const played = r.strokes.filter((s, i) => s > 0);
        if (played.length < 1) return false;
        return r.strokes.some((stroke, i) => stroke > 0 && (stroke - r.course.holesPar[i]) <= 1);
      });
    }
  },
  {
    id: "break-60-nine",
    title: "Sub-60 en 9 Hoyos",
    desc: "Completar 9 hoyos con menos de 60 golpes",
    icon: "🔥",
    check: (roundsList) => {
      return roundsList.some(r => {
        const front = r.strokes.slice(0, 9);
        const back = r.strokes.slice(9, 18);
        const frontPlayed = front.filter(s => s > 0).length === 9;
        const backPlayed = back.filter(s => s > 0).length === 9;
        if (frontPlayed && front.reduce((a, b) => a + b, 0) < 60) return true;
        if (backPlayed && back.reduce((a, b) => a + b, 0) < 60) return true;
        return false;
      });
    }
  },
  {
    id: "improving",
    title: "En Mejora",
    desc: "Lograr un score total menor que tu primera ronda registrada",
    icon: "📈",
    check: (roundsList) => {
      if (roundsList.length < 2) return false;
      const sorted = [...roundsList].sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstScore = sorted[0].totalStrokes;
      return sorted.some((r, idx) => idx > 0 && r.totalStrokes < firstScore);
    }
  },
  {
    id: "double-digit-pars",
    title: "Doble Dígito de Pares",
    desc: "Acumular 10 o más pares en total a lo largo de todas tus rondas",
    icon: "🌟",
    check: (roundsList) => {
      let totalPars = 0;
      roundsList.forEach(r => {
        r.strokes.forEach((stroke, i) => {
          if (stroke > 0 && stroke === r.course.holesPar[i]) totalPars++;
        });
      });
      return totalPars >= 10;
    }
  },
  {
    id: "social-golfer",
    title: "Golfista Social",
    desc: "Jugar una ronda en modo multijugador con al menos un amigo",
    icon: "🤝",
    check: (roundsList) => {
      return roundsList.some(r => r.lobbyId || r.lobbyCode);
    }
  },
  {
    id: "multi-course",
    title: "Explorador de Canchas",
    desc: "Jugar en al menos 2 canchas diferentes",
    icon: "🗺️",
    check: (roundsList) => {
      const uniqueCourses = new Set(roundsList.map(r => r.courseId));
      return uniqueCourses.size >= 2;
    }
  }
];

function renderAchievements() {
  const grid = document.getElementById('achievements-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  ALL_ACHIEVEMENTS.forEach(ach => {
    const isUnlocked = ach.check(rounds);
    
    const card = document.createElement('div');
    card.className = 'achievement-card ' + (isUnlocked ? 'unlocked' : 'locked');
    
    card.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-title">${ach.title}</div>
      <div class="achievement-desc">${ach.desc}</div>
    `;
    grid.appendChild(card);
  });
}


function normalizeFriendName(name) {
  if (!name) return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'boya' || lower === 'ignaciogelosi' || lower === 'ignacio gelosi' || lower.includes('boya') || lower.includes('gelosi')) {
    return 'Boya (Ignacio Gelosi)';
  }
  if (lower === 'patriciomferrari' || lower.includes('patricio') || lower.includes('ferrari')) {
    return 'Patricio Ferrari';
  }
  if (lower.includes('castro') || lower.includes('juan')) {
    return 'Juan Castro';
  }
  return trimmed;
}

function isSameFriend(nameA, nameB) {
  return normalizeFriendName(nameA).toLowerCase() === normalizeFriendName(nameB).toLowerCase();
}

function extractCompanionsFromNotes(notes) {
  if (!notes) return [];
  const compaMatch = notes.match(/Compa(?:ñ|\uFFFD|n)?eros:\s*([^|]+)/i);
  if (!compaMatch) return [];
  const parts = compaMatch[1].trim();
  
  const companions = [];
  const regex = /([^\n\r,]+?)\s*\(\s*(\d+)\s*golpes(?:,\s*([+-]?\d+|E))?\s*\)(?:\s*\[H:([0-9,]+)\])?/gi;
  let match;
  while ((match = regex.exec(parts)) !== null) {
    const rawName = match[1].trim();
    const strokes = parseInt(match[2], 10);
    const diffText = match[3] || 'E';
    const holeStrokesStr = match[4];
    const holeStrokes = holeStrokesStr ? holeStrokesStr.split(',').map(s => parseInt(s, 10) || 0) : null;
    
    // Ignore invalid names like standalone numbers or brackets
    if (rawName && !/^[+-\d\s)]+$/.test(rawName) && rawName.length > 1) {
      companions.push({
        name: rawName,
        totalStrokes: strokes,
        diffText: diffText,
        holeStrokes: holeStrokes
      });
    }
  }
  return companions;
}

function parseCompanionFromRound(round, friendName) {
  const companions = extractCompanionsFromNotes(round.notes);
  return companions.find(c => isSameFriend(c.name, friendName)) || null;
}

function populateDuelosCompanions() {
  const select = document.getElementById('select-duelo-friend');
  if (!select) return;
  
  const currentVal = select.value;
  const namesSet = new Set();
  
  rounds.forEach(round => {
    const companions = extractCompanionsFromNotes(round.notes);
    companions.forEach(c => {
      namesSet.add(normalizeFriendName(c.name));
    });
  });
  
  select.innerHTML = '<option value="">-- Seleccionar Amigo --</option>';
  Array.from(namesSet).sort().forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
  
  if (namesSet.has(currentVal)) {
    select.value = currentVal;
  } else if (namesSet.size > 0 && !currentVal) {
    // If only one friend or first load, keep prompt or select first
  } else {
    document.getElementById('duelo-dashboard').style.display = 'none';
    document.getElementById('duelo-empty-state').style.display = 'block';
  }
}


// ==========================================
// DUELOS VS AMIGOS CHARTS & ANALYSIS ENGINE
// ==========================================

let chartDueloTotalsInstance = null;
let chartDueloCumulativeInstance = null;
let chartDueloHoleByHoleInstance = null;
let chartDueloTrendInstance = null;
let currentDueloFriend = '';
let currentDueloMatches = [];

// parseCompanionFromRound is defined above

function renderDueloComparison(friend) {
  currentDueloFriend = friend;
  let wins = 0;
  let losses = 0;
  let ties = 0;
  let totalDiff = 0;
  let countDiff = 0;
  currentDueloMatches = [];
  
  const matchesList = document.getElementById('duelo-matches-list');
  const selectRound = document.getElementById('select-duelo-round');
  if (!matchesList) return;
  
  matchesList.innerHTML = '';
  
  // Sort rounds chronologically descending
  const sortedRounds = [...rounds].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sortedRounds.forEach(round => {
    const compData = parseCompanionFromRound(round, friend);
    if (compData && compData.totalStrokes !== null) {
      const myScore = round.totalStrokes;
      const friendScore = compData.totalStrokes;
      
      let resultText = '';
      let resultClass = '';
      
      if (myScore < friendScore) {
        wins++;
        resultText = 'Victoria';
        resultClass = 'text-emerald font-bold';
      } else if (myScore > friendScore) {
        losses++;
        resultText = 'Derrota';
        resultClass = 'text-red font-bold';
      } else {
        ties++;
        resultText = 'Empate';
        resultClass = 'text-amber font-bold';
      }
      
      totalDiff += (myScore - friendScore);
      countDiff++;
      
      currentDueloMatches.push({
        round: round,
        myScore: myScore,
        friendScore: friendScore,
        compData: compData,
        resultText: resultText,
        resultClass: resultClass
      });
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDate(round.date)}</td>
        <td>${round.course.name.split(' - ')[0]}</td>
        <td class="text-center font-bold">${myScore}</td>
        <td class="text-center font-bold">${friendScore}</td>
        <td class="text-center ${resultClass}">${resultText}</td>
      `;
      matchesList.appendChild(tr);
    }
  });
  
  if (countDiff > 0) {
    document.getElementById('duelo-dashboard').style.display = 'flex';
    document.getElementById('duelo-empty-state').style.display = 'none';
    
    document.getElementById('duelo-kpi-record').textContent = `${wins} - ${losses} - ${ties}`;
    document.getElementById('duelo-kpi-record-desc').textContent = `${wins} victorias, ${losses} derrotas, ${ties} empates`;
    
    const avgDiff = totalDiff / countDiff;
    const formattedDiff = avgDiff === 0 ? 'E' : (avgDiff > 0 ? ('+' + avgDiff.toFixed(1)) : avgDiff.toFixed(1));
    
    const kpiDiff = document.getElementById('duelo-kpi-diff');
    kpiDiff.textContent = formattedDiff;
    kpiDiff.className = 'kpi-value ' + (avgDiff < 0 ? 'text-emerald' : (avgDiff > 0 ? 'text-red' : 'text-amber'));
    document.getElementById('duelo-kpi-diff-desc').textContent = avgDiff < 0 
      ? 'golpes menos por ronda en promedio' 
      : (avgDiff > 0 ? 'golpes más por ronda en promedio' : 'mismo promedio de golpes');

    // Populate Match Selector
    if (selectRound) {
      selectRound.innerHTML = '';
      currentDueloMatches.forEach((m, idx) => {
        const opt = document.createElement('option');
        opt.value = m.round.id;
        const myDiff = m.myScore - (m.round.playedPar || m.round.course.par);
        const frDiff = m.friendScore - (m.round.playedPar || m.round.course.par);
        const myDiffTxt = myDiff === 0 ? 'E' : (myDiff > 0 ? '+' + myDiff : myDiff);
        const frDiffTxt = frDiff === 0 ? 'E' : (frDiff > 0 ? '+' + frDiff : frDiff);
        opt.textContent = `${formatDate(m.round.date)} - ${m.round.course.name.split(' - ')[0]} (${myDiffTxt} vs ${frDiffTxt})`;
        selectRound.appendChild(opt);
      });
      
      selectRound.onchange = () => {
        const selectedMatch = currentDueloMatches.find(m => m.round.id === selectRound.value) || currentDueloMatches[0];
        renderDueloChartsForMatch(selectedMatch, friend);
      };
    }

    // Render charts for the most recent match
    renderDueloChartsForMatch(currentDueloMatches[0], friend);
    
    // Render historical trend chart if there are 2 or more matches
    renderDueloHistoricalTrend(currentDueloMatches, friend);
  } else {
    document.getElementById('duelo-dashboard').style.display = 'none';
    document.getElementById('duelo-empty-state').style.display = 'block';
  }
}

function renderDueloChartsForMatch(matchData, friendName) {
  if (!matchData) return;
  const round = matchData.round;
  const course = round.course;
  const myStrokes = round.strokes;
  const myPenalties = round.penalties || Array(18).fill(0);
  
  // Determine active played holes range
  const playedHolesIndices = [];
  round.strokes.forEach((s, idx) => {
    if (s > 0) playedHolesIndices.push(idx);
  });
  if (playedHolesIndices.length === 0) return;

  const totalPlayedPar = playedHolesIndices.reduce((sum, idx) => sum + course.holesPar[idx], 0);
  const myTotal = matchData.myScore;
  const friendTotal = matchData.friendScore;

  // Synthesize or use friend's hole-by-hole array
  let friendHoles = matchData.compData.holeStrokes;
  if (!friendHoles || friendHoles.filter(s => s > 0).length === 0) {
    const diff = friendTotal - myTotal;
    const extraPerHole = diff / playedHolesIndices.length;
    friendHoles = Array(18).fill(0);
    let distributed = 0;
    playedHolesIndices.forEach((hIdx, i) => {
      let add = Math.round(extraPerHole);
      if (i === playedHolesIndices.length - 1) {
        add = diff - distributed;
      } else {
        distributed += add;
      }
      friendHoles[hIdx] = Math.max(1, (myStrokes[hIdx] + myPenalties[hIdx]) + add);
    });
  }

  // Helper to draw clean rounded pill badges
  function drawBadge(ctx, text, x, y, textColor, bgColor, borderColor) {
    ctx.save();
    ctx.font = 'bold 8.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textWidth = ctx.measureText(text).width;
    const pillW = textWidth + 8;
    const pillH = 14;
    const pillX = x - pillW / 2;
    const pillY = y - pillH / 2;
    const r = 3;

    ctx.fillStyle = bgColor || 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.moveTo(pillX + r, pillY);
    ctx.lineTo(pillX + pillW - r, pillY);
    ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
    ctx.lineTo(pillX + pillW, pillY + pillH - r);
    ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
    ctx.lineTo(pillX + r, pillY + pillH);
    ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
    ctx.lineTo(pillX, pillY + r);
    ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
    ctx.closePath();
    ctx.fill();

    if (borderColor) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = textColor || '#ffffff';
    ctx.fillText(text, x, y + 0.5);
    ctx.restore();
  }

  // -------------------------------------------------------------
  // 1. Chart Totals vs Par (Bar Chart)
  // -------------------------------------------------------------
  const ctxTotals = document.getElementById('chart-duelo-totals-bar');
  if (ctxTotals) {
    if (chartDueloTotalsInstance) chartDueloTotalsInstance.destroy();
    
    const myDiff = myTotal - totalPlayedPar;
    const frDiff = friendTotal - totalPlayedPar;
    const myDiffTxt = myDiff === 0 ? 'E' : (myDiff > 0 ? '+' + myDiff : myDiff);
    const frDiffTxt = frDiff === 0 ? 'E' : (frDiff > 0 ? '+' + frDiff : frDiff);

    const labels = [`Yo (${myDiffTxt})`, 'Par Cancha', `${friendName} (${frDiffTxt})`];
    const data = [myTotal, totalPlayedPar, friendTotal];
    const bgColors = ['#10b981', '#64748b', '#38bdf8'];

    chartDueloTotalsInstance = new Chart(ctxTotals, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: bgColors,
          borderRadius: 6,
          maxBarThickness: 45
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 22, bottom: 5, left: 5, right: 5 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.formattedValue} golpes`
            }
          }
        },
        scales: {
          y: {
            grace: '18%',
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8', font: { size: 9 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#ffffff', font: { weight: 'bold', size: 9.5 } }
          }
        }
      },
      plugins: [{
        id: 'dueloTotalsDatalabels',
        afterDatasetsDraw(chart) {
          const { ctx } = chart;
          const meta = chart.getDatasetMeta(0);
          meta.data.forEach((bar, index) => {
            const val = String(data[index]);
            drawBadge(ctx, val, bar.x, bar.y - 10, '#ffffff', 'rgba(15, 23, 42, 0.85)', bgColors[index]);
          });
        }
      }]
    });
  }

  // -------------------------------------------------------------
  // 2. Chart Cumulative Score vs Par (Line Chart)
  // -------------------------------------------------------------
  const ctxCum = document.getElementById('chart-duelo-cumulative-line');
  if (ctxCum) {
    if (chartDueloCumulativeInstance) chartDueloCumulativeInstance.destroy();

    const holeLabels = playedHolesIndices.map(hIdx => 'H' + (hIdx + 1));
    const cumParData = [];
    const cumMyData = [];
    const cumFriendData = [];

    let runPar = 0;
    let runMy = 0;
    let runFr = 0;

    playedHolesIndices.forEach(hIdx => {
      runPar += course.holesPar[hIdx];
      runMy += (myStrokes[hIdx] + myPenalties[hIdx]);
      runFr += (friendHoles[hIdx] || course.holesPar[hIdx]);

      cumParData.push(runPar);
      cumMyData.push(runMy);
      cumFriendData.push(runFr);
    });

    chartDueloCumulativeInstance = new Chart(ctxCum, {
      type: 'line',
      data: {
        labels: holeLabels,
        datasets: [
          {
            label: 'Mis Tiros',
            data: cumMyData,
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            borderWidth: 2.5,
            pointRadius: 4.5,
            pointHoverRadius: 6,
            tension: 0.15
          },
          {
            label: 'Par Acumulado',
            data: cumParData,
            borderColor: 'rgba(148, 163, 184, 0.6)',
            borderDash: [4, 4],
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            fill: true,
            borderWidth: 1.5,
            pointRadius: 3.5,
            pointHoverRadius: 5
          },
          {
            label: friendName,
            data: cumFriendData,
            borderColor: '#38bdf8',
            backgroundColor: '#38bdf8',
            borderWidth: 2.5,
            pointRadius: 4.5,
            pointHoverRadius: 6,
            tension: 0.15
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 22, bottom: 8, left: 6, right: 6 }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { boxWidth: 10, color: '#94a3b8', font: { size: 9 } }
          },
          tooltip: {
            callbacks: {
              title: (ctx) => 'Hoyo ' + (playedHolesIndices[ctx[0].dataIndex] + 1),
              label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} golpes acumulados`
            }
          }
        },
        scales: {
          y: {
            grace: '18%',
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8', font: { size: 9 } }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#ffffff',
              font: { weight: 'bold', size: 10 },
              autoSkip: false,
              maxRotation: 0
            }
          }
        }
      },
      plugins: [{
        id: 'dueloCumDatalabels',
        afterDatasetsDraw(chart) {
          const { ctx, chartArea } = chart;
          if (!chartArea) return;

          const metaMy = chart.getDatasetMeta(0);
          const metaPar = chart.getDatasetMeta(1);
          const metaFr = chart.getDatasetMeta(2);
          if (!metaMy || !metaPar || !metaFr) return;

          playedHolesIndices.forEach((_, idx) => {
            const elMy = metaMy.data[idx];
            const elPar = metaPar.data[idx];
            const elFr = metaFr.data[idx];
            if (!elMy || !elPar || !elFr) return;

            const myVal = String(cumMyData[idx]);
            const parVal = String(cumParData[idx]);
            const frVal = String(cumFriendData[idx]);
            const x = elMy.x;

            // 1. Par is always placed cleanly below the Par line
            let parX = x;
            let parY = elPar.y + 13;
            if (parY > chartArea.bottom - 6) parY = elPar.y - 13;

            // 2. Anti-collision between My and Friend labels
            let myX = x;
            let myY = elMy.y - 13;
            let frX = x;
            let frY = elFr.y - 13;

            const yDist = Math.abs(elMy.y - elFr.y);

            if (yDist < 20) {
              // Scores are tied or within 1 stroke of each other -> Stagger horizontally!
              // Yo to the left, Friend to the right
              const commonY = Math.min(elMy.y, elFr.y) - 13;
              
              if (idx === 0) {
                // First hole: shift slightly inward
                myX = x - 5;
                frX = x + 16;
              } else if (idx === playedHolesIndices.length - 1) {
                // Last hole: shift slightly leftward
                myX = x - 16;
                frX = x + 5;
              } else {
                myX = x - 13;
                frX = x + 13;
              }

              myY = commonY;
              frY = commonY;
            } else {
              // Well separated vertically
              myX = x;
              frX = x;
              myY = elMy.y - 13;
              frY = elFr.y - 13;
            }

            // Top boundary check
            if (myY < chartArea.top + 8) myY = chartArea.top + 8;
            if (frY < chartArea.top + 8) frY = chartArea.top + 8;

            // Draw all 3 labels with crisp background pills
            drawBadge(ctx, parVal, parX, parY, '#cbd5e1', 'rgba(15, 23, 42, 0.94)', 'rgba(148, 163, 184, 0.45)');
            drawBadge(ctx, myVal, myX, myY, '#10b981', 'rgba(15, 23, 42, 0.94)', 'rgba(16, 185, 129, 0.6)');
            drawBadge(ctx, frVal, frX, frY, '#38bdf8', 'rgba(15, 23, 42, 0.94)', 'rgba(56, 189, 248, 0.6)');
          });
        }
      }]
    });
  }

  // -------------------------------------------------------------
  // 3. Chart Hole by Hole Comparison (Grouped Bar Chart)
  // -------------------------------------------------------------
  const ctxHoles = document.getElementById('chart-duelo-hole-by-hole');
  if (ctxHoles) {
    if (chartDueloHoleByHoleInstance) chartDueloHoleByHoleInstance.destroy();

    const holeLabels = playedHolesIndices.map(hIdx => 'H' + (hIdx + 1));
    const parHolesData = playedHolesIndices.map(hIdx => course.holesPar[hIdx]);
    const myHolesData = playedHolesIndices.map(hIdx => myStrokes[hIdx] + myPenalties[hIdx]);
    const friendHolesData = playedHolesIndices.map(hIdx => friendHoles[hIdx] || course.holesPar[hIdx]);

    chartDueloHoleByHoleInstance = new Chart(ctxHoles, {
      type: 'bar',
      data: {
        labels: holeLabels,
        datasets: [
          {
            label: 'Mis Golpes',
            data: myHolesData,
            backgroundColor: '#10b981',
            borderRadius: 4,
            categoryPercentage: 0.85,
            barPercentage: 0.9
          },
          {
            label: 'Par',
            data: parHolesData,
            backgroundColor: '#475569',
            borderRadius: 4,
            categoryPercentage: 0.85,
            barPercentage: 0.9
          },
          {
            label: friendName,
            data: friendHolesData,
            backgroundColor: '#38bdf8',
            borderRadius: 4,
            categoryPercentage: 0.85,
            barPercentage: 0.9
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 20, bottom: 5, left: 5, right: 5 }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { boxWidth: 10, color: '#94a3b8', font: { size: 9 } }
          },
          tooltip: {
            callbacks: {
              title: (ctx) => 'Hoyo ' + (playedHolesIndices[ctx[0].dataIndex] + 1) + ' (Par ' + parHolesData[ctx[0].dataIndex] + ')',
              label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} golpes`
            }
          }
        },
        scales: {
          y: {
            grace: '18%',
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { stepSize: 1, color: '#94a3b8', font: { size: 9 } }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#ffffff',
              font: { weight: 'bold', size: 10 },
              autoSkip: false,
              maxRotation: 0
            }
          }
        }
      },
      plugins: [{
        id: 'dueloHolesDatalabels',
        afterDatasetsDraw(chart) {
          const { ctx } = chart;
          ctx.save();
          ctx.font = 'bold 8px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = '#ffffff';

          [0, 1, 2].forEach(dIdx => {
            const meta = chart.getDatasetMeta(dIdx);
            if (!meta || meta.hidden) return;
            const ds = chart.data.datasets[dIdx];
            meta.data.forEach((bar, index) => {
              const val = ds.data[index];
              ctx.fillText(val, bar.x, bar.y - 2);
            });
          });
          ctx.restore();
        }
      }]
    });
  }
}

function renderDueloHistoricalTrend(matches, friendName) {
  const trendCard = document.getElementById('duelo-history-trend-card');
  const ctxTrend = document.getElementById('chart-duelo-history-trend');
  if (!trendCard || !ctxTrend) return;

  if (matches.length < 2) {
    trendCard.style.display = 'none';
    if (chartDueloTrendInstance) {
      chartDueloTrendInstance.destroy();
      chartDueloTrendInstance = null;
    }
    return;
  }

  trendCard.style.display = 'flex';
  if (chartDueloTrendInstance) chartDueloTrendInstance.destroy();

  const chron = [...matches].sort((a, b) => new Date(a.round.date) - new Date(b.round.date));

  const labels = chron.map(m => {
    const d = new Date(m.round.date);
    return isNaN(d.getTime()) ? m.round.date : `${d.getDate()}/${d.getMonth() + 1}`;
  });
  const myScores = chron.map(m => m.myScore);
  const friendScores = chron.map(m => m.friendScore);

  function drawBadge(ctx, text, x, y, textColor, bgColor, borderColor) {
    ctx.save();
    ctx.font = 'bold 8.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textWidth = ctx.measureText(text).width;
    const pillW = textWidth + 8;
    const pillH = 14;
    const pillX = x - pillW / 2;
    const pillY = y - pillH / 2;
    const r = 3;

    ctx.fillStyle = bgColor || 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.moveTo(pillX + r, pillY);
    ctx.lineTo(pillX + pillW - r, pillY);
    ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
    ctx.lineTo(pillX + pillW, pillY + pillH - r);
    ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
    ctx.lineTo(pillX + r, pillY + pillH);
    ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
    ctx.lineTo(pillX, pillY + r);
    ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
    ctx.closePath();
    ctx.fill();

    if (borderColor) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = textColor || '#ffffff';
    ctx.fillText(text, x, y + 0.5);
    ctx.restore();
  }

  chartDueloTrendInstance = new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Mis Golpes',
          data: myScores,
          borderColor: '#10b981',
          backgroundColor: '#10b981',
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.2
        },
        {
          label: friendName,
          data: friendScores,
          borderColor: '#38bdf8',
          backgroundColor: '#38bdf8',
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 22, bottom: 8, left: 6, right: 6 }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { boxWidth: 10, color: '#94a3b8', font: { size: 9 } }
        },
        tooltip: {
          callbacks: {
            title: (ctx) => {
              const m = chron[ctx[0].dataIndex];
              return `${m.round.course.name.split(' - ')[0]} (${formatDate(m.round.date)})`;
            },
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} golpes`
          }
        }
      },
      scales: {
        y: {
          grace: '18%',
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#94a3b8', font: { size: 9 } }
        },
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#ffffff',
            font: { weight: 'bold', size: 10 },
            autoSkip: false,
            maxRotation: 0
          }
        }
      }
    },
    plugins: [{
      id: 'dueloTrendDatalabels',
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const metaMy = chart.getDatasetMeta(0);
        const metaFr = chart.getDatasetMeta(1);
        if (!metaMy || !metaFr) return;

        chron.forEach((_, idx) => {
          const elMy = metaMy.data[idx];
          const elFr = metaFr.data[idx];
          if (!elMy || !elFr) return;

          const myVal = String(myScores[idx]);
          const frVal = String(friendScores[idx]);

          const yDist = Math.abs(elMy.y - elFr.y);
          let myBadgeY = elMy.y - 13;
          let frBadgeY = elFr.y + 13;

          if (yDist > 22) {
            myBadgeY = elMy.y - 13;
            frBadgeY = elFr.y - 13;
          }

          if (myBadgeY < chartArea.top + 8) myBadgeY = elMy.y + 13;
          if (frBadgeY < chartArea.top + 8) frBadgeY = elFr.y + 13;
          if (frBadgeY > chartArea.bottom - 8) frBadgeY = elFr.y - 13;

          drawBadge(ctx, myVal, elMy.x, myBadgeY, '#10b981', 'rgba(15, 23, 42, 0.92)', 'rgba(16, 185, 129, 0.4)');
          drawBadge(ctx, frVal, elFr.x, frBadgeY, '#38bdf8', 'rgba(15, 23, 42, 0.92)', 'rgba(56, 189, 248, 0.4)');
        });
      }
    }]
  });
}


function generateSocialCard(round) {
  const canvas = document.getElementById('canvas-social-card');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // 1. Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 600);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#1e293b');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 600);
  
  // Design elements
  ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
  ctx.beginPath();
  ctx.arc(400, 0, 220, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(59, 130, 246, 0.03)';
  ctx.beginPath();
  ctx.arc(0, 600, 280, 0, Math.PI * 2);
  ctx.fill();
  
  // 2. Header
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('GOLF TRACKER', 200, 30);
  
  // Course name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  const name = round.course.name.split(' - ')[0];
  ctx.fillText(name, 200, 48);
  
  // Date
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 10px sans-serif';
  ctx.fillText(formatDate(round.date), 200, 74);
  
  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 95);
  ctx.lineTo(340, 95);
  ctx.stroke();
  
  // 3. Central Trophy Badge
  ctx.font = '50px sans-serif';
  ctx.fillText('🏆', 200, 115);
  
  // 4. Main Score
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px sans-serif';
  ctx.fillText(round.totalStrokes, 200, 180);
  
  const scoreDiff = round.totalStrokes - round.playedPar;
  const scoreDiffText = scoreDiff === 0 ? 'E' : (scoreDiff > 0 ? ('+' + scoreDiff) : scoreDiff);
  ctx.fillStyle = scoreDiff <= 0 ? '#34d399' : '#f87171';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(scoreDiffText + ' sobre par', 200, 238);
  
  // 5. Grid Box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  roundRect(ctx, 40, 275, 320, 220, 8, true, true);
  
  // Sub-stats labels & values
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 8px sans-serif';
  
  ctx.fillText('PAR JUGADO', 60, 295);
  ctx.fillText('PUTTS TOTALES', 60, 360);
  ctx.fillText('DIFERENCIAL WHS', 60, 425);
  
  ctx.fillText('DURACIÓN DE RONDA', 210, 295);
  ctx.fillText('GOLPES TOTALES', 210, 360);
  ctx.fillText('MULTAS TOTALES', 210, 425);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  
  ctx.fillText(round.playedPar, 60, 315);
  
  const puttsCount = round.putts ? round.putts.reduce((sum, p) => sum + p, 0) : '-';
  ctx.fillText(puttsCount, 60, 380);
  
  ctx.fillText(round.scoreDifferential.toFixed(1), 60, 445);
  
  // Duration
  let durationVal = 'No registrada';
  if (round.notes && round.notes.includes('Duración: ')) {
    durationVal = round.notes.split('Duración: ')[1].split(' | ')[0];
  }
  ctx.fillText(durationVal, 210, 315);
  
  // Golpes Totales
  ctx.fillText(round.totalStrokes, 210, 380);
  
  // Multas Totales
  const penaltiesCount = round.penalties ? round.penalties.reduce((sum, p) => sum + p, 0) : 0;
  ctx.fillText(penaltiesCount, 210, 445);
  
  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.font = '500 8px sans-serif';
  ctx.fillText('Generado por Golf Tracker • golftracker-sable.vercel.app', 200, 565);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}



// ---- Multiplayer Short ID and Toast Notification Helpers ----

function generateShortLobbyId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Evitar caracteres ambiguos
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'G-' + code;
}

function showPremiumToast(message, duration = 3500) {
  const toast = document.getElementById('premium-toast');
  if (!toast) return;
  toast.innerHTML = '✨ ' + message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}



// ---- Cloud Lobby Active Session Recovery Helpers ----

async function checkActiveCloudLobby() {
  if (liveRoundActive) return; // Don't query or prompt if they already have an active local/restored round
  if (!supabaseConnected || !supabaseClient || !userSession || !userSession.user) return;

  try {
    const { data, error } = await supabaseClient
      .from('golf_live_lobbies')
      .select('*')
      .eq('status', 'active')
      .contains('players', [{ user_id: userSession.user.id }]);

    if (error) throw error;

    if (data && data.length > 0) {
      const activeLobby = data[0];
      const lobbyCourse = courses.find(c => c.id === activeLobby.course_id);
      const courseName = lobbyCourse ? lobbyCourse.name.split(' - ')[0] : 'Cancha';
      showLobbyRecoveryPrompt(activeLobby.id, courseName);
    } else {
      // Hide prompt if no active cloud lobby is found
      const card = document.getElementById('lobby-recovery-card');
      if (card) card.style.display = 'none';
    }
  } catch (err) {
    console.error('Error checking active cloud lobbies:', err);
  }
}

function showLobbyRecoveryPrompt(lobbyId, courseName) {
  const card = document.getElementById('lobby-recovery-card');
  const txtCourse = document.getElementById('recovery-course-name');
  const txtCode = document.getElementById('recovery-lobby-code');
  const btnResume = document.getElementById('btn-recovery-resume');
  const btnDismiss = document.getElementById('btn-recovery-dismiss');

  if (!card || !txtCourse || !txtCode || !btnResume || !btnDismiss) return;

  txtCourse.textContent = courseName;
  txtCode.textContent = lobbyId;
  card.style.display = 'flex';

  btnResume.onclick = () => {
    card.style.display = 'none';
    joinMultiplayerLobby(lobbyId);
  };

  btnDismiss.onclick = async () => {
    if (confirm('¿Estás seguro de que deseas descartar esta partida pendiente? No podrás recuperarla.')) {
      card.style.display = 'none';
      try {
        if (supabaseClient) {
          const { error } = await supabaseClient
            .from('golf_live_lobbies')
            .update({
              status: 'finished',
              updated_at: new Date().toISOString()
            })
            .eq('id', lobbyId);
          if (error) throw error;
          showPremiumToast('Partida pendiente descartada.');
        }
      } catch (err) {
        console.error('Error dismissing lobby:', err);
      }
    }
  };
}


function isMyLiveScorecardActive() {
  if (!activeLobbyId || !lobbyState) return true;
  const myIdx = getMyPlayerIndexInLobby();
  return lobbyActivePlayerIndex === myIdx;
}


// ---- Detailed Course & Hole Analytics Helpers ----


// ---- Time Evolution Analytics State & Helpers ----
let currentTimeHolesFilter = 9; // 9 or 18
let chartTimeEvolutionInstance = null;

function parseRoundDurationMinutes(notes) {
  if (!notes || !notes.includes('Duración: ')) return null;
  try {
    const part = notes.split('Duración: ')[1].split(' | ')[0].trim();
    let totalMins = 0;
    if (part.includes('h')) {
      const hours = parseInt(part.split('h')[0].trim(), 10) || 0;
      const rest = part.split('h')[1];
      const mins = parseInt(rest.replace('m', '').trim(), 10) || 0;
      totalMins = hours * 60 + mins;
    } else if (part.includes('m')) {
      totalMins = parseInt(part.replace('m', '').trim(), 10) || 0;
    }
    return totalMins > 0 ? totalMins : null;
  } catch(e) {
    return null;
  }
}

function formatMinutesToDuration(totalMinutes) {
  if (!totalMinutes || isNaN(totalMinutes) || totalMinutes <= 0) return '-';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

function renderTimeEvolutionChart() {
  const container = document.getElementById('time-analysis-chart-container');
  const emptyMsg = document.getElementById('time-analysis-empty');
  const kpiAvg = document.getElementById('kpi-time-avg');
  const kpiMin = document.getElementById('kpi-time-min');
  const kpiMax = document.getElementById('kpi-time-max');
  const ctx = document.getElementById('chart-time-evolution');

  if (!ctx) return;

  const targetHoles = currentTimeHolesFilter; // 9 or 18
  const validRounds = [];

  // Sort rounds chronologically ascending
  const chronological = [...rounds].sort((a, b) => new Date(a.date) - new Date(b.date));

  chronological.forEach(r => {
    const playedCount = r.strokes.filter(s => s > 0).length;
    const matchesHoles = (targetHoles === 9 && playedCount < 18) || (targetHoles === 18 && playedCount === 18);
    if (matchesHoles) {
      const durMins = parseRoundDurationMinutes(r.notes);
      if (durMins !== null) {
        validRounds.push({
          date: r.date,
          courseName: r.course ? r.course.name.split(' - ')[0] : 'Cancha',
          durationMins: durMins,
          durationFormatted: formatMinutesToDuration(durMins)
        });
      }
    }
  });

  if (validRounds.length === 0) {
    if (container) container.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (kpiAvg) kpiAvg.textContent = '-';
    if (kpiMin) kpiMin.textContent = '-';
    if (kpiMax) kpiMax.textContent = '-';
    if (chartTimeEvolutionInstance) {
      chartTimeEvolutionInstance.destroy();
      chartTimeEvolutionInstance = null;
    }
    return;
  }

  if (container) container.style.display = 'block';
  if (emptyMsg) emptyMsg.style.display = 'none';

  // Calculate KPIs
  const allMins = validRounds.map(v => v.durationMins);
  const sumMins = allMins.reduce((a, b) => a + b, 0);
  const avgMins = Math.round(sumMins / allMins.length);
  const minMins = Math.min(...allMins);
  const maxMins = Math.max(...allMins);

  if (kpiAvg) kpiAvg.textContent = formatMinutesToDuration(avgMins);
  if (kpiMin) kpiMin.textContent = formatMinutesToDuration(minMins);
  if (kpiMax) kpiMax.textContent = formatMinutesToDuration(maxMins);

  const labels = validRounds.map(v => {
    const d = new Date(v.date);
    return isNaN(d.getTime()) ? v.date : `${d.getDate()}/${d.getMonth() + 1}`;
  });
  const data = validRounds.map(v => v.durationMins);

  if (chartTimeEvolutionInstance) chartTimeEvolutionInstance.destroy();

  chartTimeEvolutionInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Duración (min)',
          data: data,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#38bdf8',
          tension: 0.2,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (context) => {
              const idx = context[0].dataIndex;
              const r = validRounds[idx];
              return `${r.courseName} (${formatDate(r.date)})`;
            },
            label: (context) => {
              const mins = context.raw;
              return `Duración: ${formatMinutesToDuration(mins)}`;
            }
          }
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 9 },
            callback: (val) => formatMinutesToDuration(val)
          }
        },
        x: {
          grid: { color: 'rgba(255,255,255,0.02)' },
          ticks: { color: '#94a3b8', font: { size: 9 } }
        }
      }
    },
    plugins: [
      {
        id: 'timeDatalabels',
        afterDatasetsDraw(chart) {
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          ctx.save();
          ctx.font = 'bold 8.5px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          const meta = chart.getDatasetMeta(0);
          if (!meta || meta.hidden) return;

          meta.data.forEach((element, index) => {
            const val = validRounds[index].durationFormatted;
            const x = element.x;
            const y = element.y;
            if (typeof x !== 'number' || typeof y !== 'number') return;

            const textWidth = ctx.measureText(val).width;
            const pillW = textWidth + 8;
            const pillH = 14;
            const pillX = x - pillW / 2;

            let pillY = y - pillH - 4;
            let textY = pillY + pillH - 2;
            if (pillY < chartArea.top) {
              pillY = y + 4;
              textY = pillY + pillH - 2;
            }

            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            const r = 3;
            ctx.moveTo(pillX + r, pillY);
            ctx.lineTo(pillX + pillW - r, pillY);
            ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
            ctx.lineTo(pillX + pillW, pillY + pillH - r);
            ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
            ctx.lineTo(pillX + r, pillY + pillH);
            ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
            ctx.lineTo(pillX, pillY + r);
            ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(val, x, textY);
          });
          ctx.restore();
        }
      }
    ]
  });
}

function findBestDefaultAnalysisFilters() {
  if (rounds.length === 0) return { courseId: '', nineType: 'both' };
  
  const counts = {};
  rounds.forEach(r => {
    const courseId = r.courseId;
    if (!counts[courseId]) {
      counts[courseId] = { both: 0, front: 0, back: 0 };
    }
    
    const frontPlayed = r.strokes.slice(0, 9).filter(s => s > 0).length === 9;
    const backPlayed = r.strokes.slice(9, 18).filter(s => s > 0).length === 9;
    
    if (frontPlayed && backPlayed) {
      counts[courseId].both++;
      counts[courseId].front++;
      counts[courseId].back++;
    } else if (frontPlayed) {
      counts[courseId].front++;
    } else if (backPlayed) {
      counts[courseId].back++;
    }
  });
  
  let bestCourseId = '';
  let bestNineType = 'both';
  let maxCount = -1;
  
  Object.keys(counts).forEach(cId => {
    const c = counts[cId];
    if (c.both > maxCount) { maxCount = c.both; bestCourseId = cId; bestNineType = 'both'; }
    if (c.back > maxCount) { maxCount = c.back; bestCourseId = cId; bestNineType = 'back'; }
    if (c.front > maxCount) { maxCount = c.front; bestCourseId = cId; bestNineType = 'front'; }
  });
  
  if (!bestCourseId && rounds.length > 0) {
    bestCourseId = rounds[0].courseId;
    bestNineType = 'both';
  }
  
  return { courseId: bestCourseId, nineType: bestNineType };
}

function populateAnalysisCourseDropdown() {
  const select = document.getElementById('analysis-course-select');
  const selectNine = document.getElementById('analysis-nine-select');
  if (!select) return;
  
  const currentSelection = select.value;
  select.innerHTML = '<option value="">-- Seleccionar Cancha --</option>';
  
  // Get all unique course IDs from registered rounds
  const uniqueCourseIds = [...new Set(rounds.map(r => r.courseId))];
  const coursesWithRounds = courses.filter(c => uniqueCourseIds.includes(c.id));
  
  coursesWithRounds.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name.split(' - ')[0];
    select.appendChild(opt);
  });
  
  if (currentSelection && uniqueCourseIds.includes(currentSelection)) {
    select.value = currentSelection;
  } else if (uniqueCourseIds.length > 0) {
    const best = findBestDefaultAnalysisFilters();
    select.value = best.courseId;
    if (selectNine) selectNine.value = best.nineType;
  }
}

function renderHoleAnalysisCharts() {
  const courseId = document.getElementById('analysis-course-select').value;
  if (!courseId) return;
  
  const course = courses.find(c => c.id === courseId);
  if (!course) return;
  
  const courseRounds = rounds
    .filter(r => r.courseId === courseId)
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Chronological order
    
  if (courseRounds.length === 0) {
    document.getElementById('course-analysis-content').style.display = 'none';
    document.getElementById('course-analysis-empty').style.display = 'block';
    document.getElementById('course-analysis-empty').querySelector('p').textContent = 'No hay salidas registradas en esta cancha.';
    return;
  }
  
  document.getElementById('course-analysis-content').style.display = 'flex';
  document.getElementById('course-analysis-empty').style.display = 'none';
  
  // Get selected Nine selection (both, front, back)
  const nineType = document.getElementById('analysis-nine-select').value || 'both';
  
  let holesRange = [];
  if (nineType === 'front') {
    for (let i = 0; i < 9; i++) holesRange.push(i);
  } else if (nineType === 'back') {
    for (let i = 9; i < 18; i++) holesRange.push(i);
  } else {
    for (let i = 0; i < 18; i++) holesRange.push(i);
  }
  
  // 1. Calculate hole averages
  const holeLabels = [];
  const holeAverages = [];
  const holePars = [];
  
  holesRange.forEach(i => {
    holeLabels.push('H' + (i + 1));
    holePars.push(course.holesPar[i]);
    
    let sum = 0;
    let count = 0;
    courseRounds.forEach(r => {
      if (r.strokes[i] > 0) {
        sum += r.strokes[i] + (r.penalties[i] || 0);
        count++;
      }
    });
    holeAverages.push(count > 0 ? parseFloat((sum / count).toFixed(1)) : null);
  });
  
  // Plot Averages
  const ctxAvg = document.getElementById('chart-hole-averages');
  if (ctxAvg) {
    if (chartHoleAveragesInstance) chartHoleAveragesInstance.destroy();
    
    chartHoleAveragesInstance = new Chart(ctxAvg, {
      type: 'bar',
      data: {
        labels: holeLabels,
        datasets: [
          {
            label: 'Promedio Golpes',
            data: holeAverages,
            backgroundColor: 'rgba(59, 130, 246, 0.75)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Par de Hoyo',
            data: holePars,
            type: 'line',
            borderColor: '#34d399',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 3,
            tension: 0.1,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#94a3b8', font: { size: 9 } }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8', font: { size: 9 } },
            min: 1
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 9 } }
          }
        }
      },
      plugins: [chartDatalabelsPlugin]
    });
  }
  
  // 2. Render Hole Evolution Grid
  renderHoleEvolutionGrid(course, courseRounds, holesRange);
}

function renderHoleEvolutionGrid(course, courseRounds, holesRange) {
  const gridContainer = document.getElementById('hole-evolution-grid');
  if (!gridContainer) return;
  
  // Destroy existing mini chart instances
  Object.keys(chartMiniInstances).forEach(key => {
    if (chartMiniInstances[key]) {
      chartMiniInstances[key].destroy();
    }
  });
  chartMiniInstances = {};
  
  // Clear container
  gridContainer.innerHTML = '';
  
  // Set custom grid layout classes/properties
  // gridTemplateColumns managed by CSS now
  
  holesRange.forEach(holeIdx => {
    const holeNum = holeIdx + 1;
    const parVal = course.holesPar[holeIdx];
    
    // Create mini card
    const card = document.createElement('div');
    card.style.background = 'rgba(15, 23, 42, 0.4)';
    card.style.border = '1px solid rgba(255,255,255,0.04)';
    card.style.borderRadius = '0.35rem';
    card.style.padding = '0.4rem';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
        <span style="font-size: 0.65rem; color: #fbbf24; font-weight: 700;">Hoyo ${holeNum}</span>
        <span style="font-size: 0.55rem; color: var(--text-muted);">Par ${parVal}</span>
      </div>
      <div style="position: relative; height: 130px; width: 100%;">
        <canvas id="chart-mini-h-${holeIdx}"></canvas>
      </div>
    `;
    
    gridContainer.appendChild(card);
    
    // Prepare data
    const xLabels = [];
    const scores = [];
    const pars = [];
    
    // Filter rounds where strokes on this hole are recorded
    courseRounds.forEach(r => {
      if (r.strokes[holeIdx] > 0) {
        const d = new Date(r.date);
        const dateStr = d.getDate() + '/' + (d.getMonth() + 1);
        xLabels.push(dateStr);
        scores.push(r.strokes[holeIdx] + (r.penalties[holeIdx] || 0));
        pars.push(parVal);
      }
    });
    
    if (scores.length === 0) {
      // Draw simple empty message inside canvas container
      const canvasEl = document.getElementById('chart-mini-h-' + holeIdx);
      if (canvasEl) {
        const ctx = canvasEl.getContext('2d');
        ctx.fillStyle = '#64748b';
        ctx.font = '8.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Sin datos', canvasEl.width / 2, canvasEl.height / 2);
      }
      return;
    }
    
    const canvasEl = document.getElementById('chart-mini-h-' + holeIdx);
    if (canvasEl) {
      const ctx = canvasEl.getContext('2d');
      const chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: xLabels,
          datasets: [
            {
              label: 'Golpes',
              data: scores,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.05)',
              borderWidth: 1.5,
              pointBackgroundColor: '#fbbf24',
              pointRadius: 2.5,
              pointHoverRadius: 4,
              fill: true,
              tension: 0.15
            },
            {
              label: 'Par',
              data: pars,
              borderColor: '#34d399',
              backgroundColor: 'rgba(16, 185, 129, 0.04)',
              borderWidth: 1,
              borderDash: [3, 3],
              pointRadius: 0,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (context) => {
                  const idx = context[0].dataIndex;
                  let matchCount = 0;
                  let originalRound = null;
                  for (let rIndex = 0; rIndex < courseRounds.length; rIndex++) {
                    if (courseRounds[rIndex].strokes[holeIdx] > 0) {
                      if (matchCount === idx) {
                        originalRound = courseRounds[rIndex];
                        break;
                      }
                      matchCount++;
                    }
                  }
                  if (originalRound) {
                    return 'Salida: ' + formatDate(originalRound.date);
                  }
                  return 'Ronda ' + (idx + 1);
                }
              }
            }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255,255,255,0.03)' },
              ticks: { color: '#64748b', font: { size: 7.5 } },
              min: 1
            },
            x: {
              grid: { display: false },
              ticks: { color: '#64748b', font: { size: 7.5 } }
            }
          }
        },
        plugins: [chartDatalabelsPlugin]
      });
      
      chartMiniInstances[holeIdx] = chartInstance;
    }
  });
}


function getHoleStrategyTip(par, distance, strokeIndex, holeNum) {
  let tip = '';
  const distYd = distance ? Math.round(distance * 1.09361) : null;
  const distText = distance ? (distance + 'm / ' + distYd + ' yd') : '';

  if (par === 3) {
    if (distance && distance < 140) {
      tip = '🎯 <strong>Oportunidad de Birdie:</strong> Par 3 corto (' + distText + '). Salida directa a la bandera con hierro corto o wedge. Jugá con confianza a dejarte un putt cuesta arriba.';
    } else if (distance && distance > 170) {
      tip = '🛡️ <strong>Defensa inteligente:</strong> Par 3 largo (' + distText + '). Apuntá al centro amplio del green sin forzar la bandera. Asegurá el green en regulación o un approach seguro.';
    } else {
      tip = '🎯 <strong>Precisión al centro:</strong> Par 3 (' + distText + '). Elegí el palo que llegue cómodo al corazón del green. Dos putts garantizan el Par.';
    }
  } else if (par === 4) {
    if (distance && distance < 325) {
      tip = '🚀 <strong>Ataque o Posición:</strong> Par 4 corto (' + distText + '). Madera 3 o Híbrido al centro te deja un tiro pleno de 80-100m. Si vas con Driver, asegurá fairway.';
    } else if ((distance && distance > 380) || strokeIndex <= 3) {
      tip = '🔥 <strong>Hoyo de máximo respeto (Dif. #' + strokeIndex + '):</strong> Par 4 largo (' + distText + '). Salida firme con Driver buscando fairway. Si el 2do tiro queda largo, jugá a la entrada para salvar el 4 o 5.';
    } else {
      tip = '⛳ <strong>Estrategia sólida:</strong> Par 4 (' + distText + '). Salida con Driver al sector amplio del fairway. Segundo tiro enfocado en el centro del green para garantizar el Par.';
    }
  } else if (par === 5) {
    if ((distance && distance < 475) && strokeIndex > 6) {
      tip = '🦅 <strong>Oportunidad de Score:</strong> Par 5 accesible (' + distText + '). Buen tiro de salida abre la opción de dejar un approach corto. Planificá tu 3er tiro con confianza para buscar el Birdie.';
    } else {
      tip = '🛡️ <strong>Estrategia en 3 tiros (Dif. #' + strokeIndex + '):</strong> Par 5 (' + distText + '). Driver al fairway, 2do tiro de colocación a tu distancia favorita (80-100m) y 3er golpe al centro del green.';
    }
  } else {
    tip = '⛳ Buscá el centro del fairway y asegurá el centro del green.';
  }

  return tip;
}

window.cycleLiveTee = function() {
  const currentCourse = (liveCourse && liveCourse.tees) ? liveCourse : null;
  const hasYellow = currentCourse && currentCourse.tees && currentCourse.tees.yellow;
  
  if (liveSelectedTee === 'white') {
    liveSelectedTee = hasYellow ? 'yellow' : 'blue';
  } else if (liveSelectedTee === 'yellow') {
    liveSelectedTee = 'blue';
  } else if (liveSelectedTee === 'blue') {
    liveSelectedTee = 'red';
  } else {
    liveSelectedTee = 'white';
  }
  renderLiveHole();
};

window.toggleCaddieBody = function() {
  const textEl = document.getElementById('live-ai-caddie-text');
  const iconEl = document.getElementById('ai-caddie-toggle-icon');
  if (!textEl) return;
  if (textEl.style.display === 'none') {
    textEl.style.display = 'block';
    if (iconEl) iconEl.textContent = '▼';
  } else {
    textEl.style.display = 'none';
    if (iconEl) iconEl.textContent = '▲';
  }
};
