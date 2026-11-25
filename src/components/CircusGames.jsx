'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Crown,
  Flag,
  Gift,
  Heart,
  LockKeyhole,
  Map,
  Music2,
  RotateCcw,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  Volume2,
  VolumeX,
  WandSparkles,
} from 'lucide-react';

const STAGES = [
  { id: 0, name: 'Gerbang Keajaiban', short: 'START', emoji: '🎪', sub: 'Pintu masuk cerita' },
  { id: 1, name: 'Jejak Tiket Emas', short: 'LEVEL 1', emoji: '🎟️', sub: 'Berburu tiga tiket' },
  { id: 2, name: 'Tenda Seribu Warna', short: 'LEVEL 2', emoji: '🎨', sub: 'Tebak rahasia mahakarya' },
  { id: 3, name: 'Labirin Kanvas', short: 'LEVEL 3', emoji: '🧩', sub: 'Susun lukisan misterius' },
  { id: 4, name: 'Brankas Sang Maestro', short: 'LEVEL 4', emoji: '🔐', sub: 'Pecahkan sandi rahasia' },
  { id: 5, name: 'Mahkota Aurora', short: 'FINISH', emoji: '🏆', sub: 'Klaim gelar Art Adventurer' },
];

const TICKETS = [
  {
    key: 'velvet-stage',
    name: 'Panggung Velvet',
    clue: 'Periksa dekat panggung utama.',
    icon: '🎭',
    fact: 'Tiket pertama berhasil ditemukan. Panggung utama kini menjadi pintu masuk menuju galeri.',
  },
  {
    key: 'wandering-star',
    name: 'Bintang Kelana',
    clue: 'Cari kilau bintang di atas tenda.',
    icon: '🌟',
    fact: 'Tiket kedua berhasil ditemukan. Bintang ini mengingatkan kita pada karya-karya seni yang melintasi zaman.',
  },
  {
    key: 'music-parade',
    name: 'Komidi Musik',
    clue: 'Ikuti jejak nada di dekat panggung musik.',
    icon: '🎵',
    fact: 'Tiket ketiga berhasil ditemukan. Musik juga merupakan karya seni yang dapat dipamerkan dan diapresiasi.',
  },
  { name: 'Awan Kapas', clue: 'Awan ini hanya dekorasi.', icon: '☁️', decoy: true },
  { name: 'Balon Pelangi', clue: 'Balon ini hanya hiasan taman.', icon: '🎈', decoy: true },
];

const LOCK_CHOICES = [
  { id: 'star', icon: '⭐', label: 'Bintang' },
  { id: 'brush', icon: '🖌️', label: 'Kuas' },
  { id: 'key', icon: '🗝️', label: 'Kunci' },
  { id: 'moon', icon: '🌙', label: 'Bulan' },
];

const CORRECT_CODE = ['star', 'brush', 'key'];
const INITIAL_TILES = [0, 1, 2, 4, 5, 7, null, 3, 6];
// DATA GAME: enam checkpoint, tiga tiket unik, puzzle, sandi, dan hadiah akhir.
const DEFAULT_PROGRESS = {
  found_tickets: [],
  completed_levels: [],
  unlocked_level: 0,
  gold_tickets: 0,
  golden_gallery_pass: false,
  aurora_badge_earned: false,
};

function normalizeProgress(progress = {}) {
  return {
    ...DEFAULT_PROGRESS,
    ...progress,
    found_tickets: Array.isArray(progress.found_tickets) ? progress.found_tickets : [],
    completed_levels: Array.isArray(progress.completed_levels) ? progress.completed_levels : [],
    unlocked_level: Math.max(0, Math.min(Number(progress.unlocked_level) || 0, 5)),
    gold_tickets: Math.max(0, Math.min(Number(progress.gold_tickets) || 0, 3)),
    golden_gallery_pass: Boolean(progress.golden_gallery_pass),
    aurora_badge_earned: Boolean(progress.aurora_badge_earned),
  };
}

function addUnique(items, value) {
  return items.includes(value) ? items : [...items, value];
}

function neighbors(blank) {
  const row = Math.floor(blank / 3);
  const col = blank % 3;
  return [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
    .filter(([r, c]) => r >= 0 && r < 3 && c >= 0 && c < 3)
    .map(([r, c]) => r * 3 + c);
}

function shuffledPuzzle() {
  const tiles = [0, 1, 2, 3, 4, 5, 6, 7, null];
  let empty = 8;
  let previous = -1;

  // Pengacakan dilakukan melalui gerakan sah agar puzzle selalu dapat diselesaikan.
  for (let step = 0; step < 72; step += 1) {
    const options = neighbors(empty).filter((index) => index !== previous);
    const chosen = options[Math.floor(Math.random() * options.length)];
    [tiles[empty], tiles[chosen]] = [tiles[chosen], tiles[empty]];
    previous = empty;
    empty = chosen;
  }

  return tiles.every((value, index) => value === (index === 8 ? null : index))
    ? INITIAL_TILES.slice()
    : tiles;
}

function isSolved(tiles) {
  return tiles.every((value, index) => (index === 8 ? value === null : value === index));
}

function buildQuiz(artworks) {
  const monaLisa = artworks?.monaLisa;
  const greatWave = artworks?.greatWave;
  const pearlEarring = artworks?.pearlEarring;
  const bach = artworks?.bach;

  return [
    {
      question: `Siapa seniman di balik karya “${monaLisa?.title || 'Mona Lisa'}”?`,
      options: ['Claude Monet', 'Leonardo da Vinci', 'Vincent van Gogh'],
      answer: 1,
      fact: monaLisa?.description || 'Mona Lisa merupakan lukisan terkenal karya Leonardo da Vinci dari masa Renaissance.',
      artwork: monaLisa,
    },
    {
      question: `Siapa seniman yang membuat “${greatWave?.title || 'The Great Wave off Kanagawa'}”?`,
      options: ['Katsushika Hokusai', 'Johannes Vermeer', 'Michelangelo'],
      answer: 0,
      fact: greatWave?.description || 'The Great Wave off Kanagawa adalah cetakan ukiyo-e karya seniman Jepang, Katsushika Hokusai.',
      artwork: greatWave,
    },
    {
      question: `Siapa pelukis “${pearlEarring?.title || 'Girl with a Pearl Earring'}”?`,
      options: ['Johannes Vermeer', 'Leonardo da Vinci', 'Katsushika Hokusai'],
      answer: 0,
      fact: pearlEarring?.description || 'Girl with a Pearl Earring merupakan karya Johannes Vermeer yang menjadi bagian koleksi Mauritshuis.',
      artwork: pearlEarring,
    },
    {
      question: `Karya “${bach?.title || 'Bach — Cello Suite No. 1'}” dipamerkan sebagai karya jenis apa?`,
      options: ['Fotografi', 'Patung', 'Musik dan audio'],
      answer: 2,
      fact: bach?.description || 'Komposisi musik juga dapat menjadi karya yang dipamerkan dan diputar langsung di SPEKTRA.',
      artwork: bach,
    },
  ];
}

export default function CircusGames({ user, initialProgress, gameArtworks }) {
  const [progress, setProgress] = useState(() => normalizeProgress(initialProgress));
  const [stage, setStage] = useState(() => {
    const first = normalizeProgress(initialProgress).unlocked_level;
    return first === 5 ? 5 : first;
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [guestNotice, setGuestNotice] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ticketMessage, setTicketMessage] = useState('Klik benda di taman sirkus. Ada tiga tiket asli dan dua benda pengecoh!');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [tiles, setTiles] = useState(INITIAL_TILES);
  const [moves, setMoves] = useState(0);
  const [code, setCode] = useState([]);
  const [codeMessage, setCodeMessage] = useState('Baca teka-teki untuk menemukan urutan tiga simbol.');

  const quizQuestions = useMemo(() => buildQuiz(gameArtworks), [gameArtworks]);
  const current = STAGES[stage];
  const unlocked = progress.unlocked_level;
  const foundTickets = progress.found_tickets;
  const puzzleArtwork = gameArtworks?.greatWave;
  const puzzleImage = puzzleArtwork?.media_url || '/images/artworks/archive/painting/great-wave-off-kanagawa.webp';
  const bonusArtworks = [gameArtworks?.monaLisa, gameArtworks?.greatWave, gameArtworks?.pearlEarring].filter(Boolean);

  // EFEK SUARA: bunyi diputar setelah aksi pengguna dan dapat dimatikan melalui kontrol suara.
  function playSfx(file) {
    if (!soundEnabled) return;
    try {
      const sound = new window.Audio(`/audio/sfx/${file}.wav`);
      sound.volume = 0.34;
      sound.play().catch(() => {});
    } catch {
      // Browser tanpa audio tetap dapat memainkan seluruh level.
    }
  }

  // INTEGRASI DATABASE: Member menyimpan progres ke API; Guest hanya menyimpan state sementara.
  async function performAction(payload, localUpdate) {
    if (saving) return null;
    setSaveError('');

    if (!user) {
      const next = normalizeProgress(localUpdate(progress));
      setProgress(next);
      setGuestNotice('Mode tamu: progres hanya tersimpan selama halaman ini terbuka. Masuk sebagai Member agar Tiket Emas dan lencana tersimpan di database.');
      return next;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/game-progress', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Progres petualangan gagal disimpan.');
      const next = normalizeProgress(result.progress);
      setProgress(next);
      setGuestNotice('');
      return next;
    } catch (error) {
      setSaveError(error?.message || 'Tidak dapat menyimpan progres ke database.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  // START: buka level pertama dan putar efek pembuka.
  async function startAdventure() {
    const next = await performAction(
      { op: 'start' },
      (value) => ({
        ...value,
        completed_levels: addUnique(value.completed_levels, 0),
        unlocked_level: Math.max(value.unlocked_level, 1),
      }),
    );
    if (next) {
      setStage(1);
      playSfx('magic-sparkle-whoosh');
    }
  }

  // VALIDASI LEVEL: level berikutnya hanya terbuka setelah misi sebelumnya selesai.
  async function completeLevel(level) {
    return performAction(
      { op: 'complete-level', level },
      (value) => ({
        ...value,
        completed_levels: addUnique(value.completed_levels, level),
        unlocked_level: Math.max(value.unlocked_level, level + 1),
        aurora_badge_earned: level === 4 || value.aurora_badge_earned,
      }),
    );
  }

  function goTo(target) {
    if (target <= unlocked) {
      setStage(target);
      setQuizFeedback(null);
    }
  }

  function nextLevel() {
    if (stage < unlocked) {
      playSfx(stage === 4 && unlocked >= 5 ? 'end-of-show-applause' : 'magic-sparkle-whoosh');
      setStage(stage + 1);
      setQuizFeedback(null);
    }
  }

  // RESET: Member menghapus progres tersimpan; Guest mengulang sesi lokal.
  async function resetAdventure() {
    const next = await performAction(
      { op: 'reset' },
      () => DEFAULT_PROGRESS,
    );
    if (!next) return;
    setStage(0);
    setTicketMessage('Klik benda di taman sirkus. Ada tiga tiket asli dan dua benda pengecoh!');
    setQuizIndex(0);
    setQuizFeedback(null);
    setTiles(INITIAL_TILES);
    setMoves(0);
    setCode([]);
    setCodeMessage('Baca teka-teki untuk menemukan urutan tiga simbol.');
  }

  // LEVEL 1: tiga tiket unik membuka Golden Gallery Pass; benda pengecoh tidak menambah progres.
  async function findTicket(index) {
    const ticket = TICKETS[index];
    if (ticket.decoy) {
      setTicketMessage(`${ticket.icon} ${ticket.name}: belum ada tiket di sini. Coba cari di tempat lain!`);
      return;
    }
    if (foundTickets.includes(ticket.key)) {
      setTicketMessage(`Tiket di ${ticket.name} sudah kamu ambil. Cari dua tiket lainnya!`);
      return;
    }

    const next = await performAction(
      { op: 'collect-ticket', ticket_key: ticket.key },
      (value) => {
        const found = addUnique(value.found_tickets, ticket.key);
        const count = Math.min(found.length, 3);
        const passUnlocked = count >= 3;
        return {
          ...value,
          found_tickets: found,
          gold_tickets: count,
          golden_gallery_pass: passUnlocked,
          completed_levels: passUnlocked ? addUnique(value.completed_levels, 1) : value.completed_levels,
          unlocked_level: passUnlocked ? Math.max(value.unlocked_level, 2) : value.unlocked_level,
        };
      },
    );

    if (!next) return;
    setTicketMessage(`${ticket.icon} ${ticket.fact}`);
    if (next.gold_tickets >= 3) {
      playSfx('level-complete');
      setTicketMessage('Tiga Tiket Emas terkumpul! Golden Gallery Pass terbuka. Gerbang menuju kuis mahakarya kini dapat dimasuki.');
    } else {
      playSfx('magic-sparkle-whoosh');
    }
  }

  async function answerQuiz(optionIndex) {
    if (quizFeedback !== null) return;
    const question = quizQuestions[quizIndex];
    if (optionIndex === question.answer) {
      setQuizFeedback({ good: true, message: question.fact });
      if (quizIndex === quizQuestions.length - 1) {
        const next = await completeLevel(2);
        if (next) playSfx('level-complete');
      } else {
        playSfx('magic-sparkle-whoosh');
      }
    } else {
      setQuizFeedback({
        good: false,
        message: 'Belum tepat. Perhatikan nama seniman dan jenis karya, lalu coba lagi.',
      });
    }
  }

  function continueQuiz() {
    if (!quizFeedback?.good) {
      setQuizFeedback(null);
      return;
    }
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((value) => value + 1);
      setQuizFeedback(null);
    }
  }

  async function moveTile(index) {
    if (isSolved(tiles)) return;
    const empty = tiles.indexOf(null);
    if (!neighbors(empty).includes(index)) return;

    const nextTiles = tiles.slice();
    [nextTiles[empty], nextTiles[index]] = [nextTiles[index], nextTiles[empty]];
    setTiles(nextTiles);
    setMoves((value) => value + 1);

    if (isSolved(nextTiles)) {
      const next = await completeLevel(3);
      if (next) playSfx('level-complete');
    }
  }

  async function chooseSymbol(id) {
    if (progress.aurora_badge_earned) return;
    const attempt = [...code, id];
    if (attempt.length < 3) {
      setCode(attempt);
      setCodeMessage(`${attempt.length}/3 simbol dipilih. Lanjutkan!`);
      return;
    }

    if (CORRECT_CODE.every((value, index) => value === attempt[index])) {
      setCode(attempt);
      setCodeMessage('Klik! Kunci terbuka. Kamu menemukan harta karun Aurora!');
      const next = await completeLevel(4);
      if (next) playSfx('level-complete');
    } else {
      setCode([]);
      setCodeMessage('Urutan belum benar. Petunjuk: langit → alat melukis → pembuka pintu. Coba lagi!');
    }
  }

  return (
    <main className="adventure-page">
      <section className="adventure-banner container-page">
        <div className="adventure-banner-text">
          <span className="adventure-kicker"><Sparkles size={15} /> SPEKTRA / THE GRAND ART CIRCUS</span>
          <h1>Petualangan <em>Harta Karun Seni.</em></h1>
          <p>
            Jelajahi karya seni yang benar-benar tersimpan di database SPEKTRA.
            Selesaikan empat misi, kumpulkan Tiket Emas, dan buka ruang koleksi rahasia.
          </p>
          <div className="adventure-banner-links">
            <Link href="/explore"><BookOpen size={15} /> Jelajahi galeri karya</Link>
            <Link href="/challenges"><Trophy size={15} /> Lihat challenges</Link>
          </div>
        </div>
        <img className="adventure-banner-mascot" src="/images/mascot/spektra-mascot.png" alt="Maskot SPEKTRA mengajak menjelajahi dunia sirkus" />
        <span className="adventure-deco deco-one" aria-hidden="true">✦</span>
        <span className="adventure-deco deco-two" aria-hidden="true">✳</span>
      </section>

      <section className="container-page adventure-progress" aria-label="Peta level petualangan">
        <div className="adventure-progress-heading">
          <div>
            <span className="adventure-small-caps">YOUR ADVENTURE MAP</span>
            <h2>Dari gerbang hingga harta karun</h2>
          </div>
          <span className="adventure-count"><Star size={15} fill="currentColor" /> {Math.max(0, Math.min(unlocked, 5))}/5 checkpoint</span>
        </div>
        <div className="adventure-path" role="group" aria-label="Pilih level yang sudah terbuka">
          {STAGES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              disabled={index > unlocked || saving}
              onClick={() => goTo(index)}
              aria-current={stage === index ? 'step' : undefined}
              className={`adventure-stage ${stage === index ? 'current ' : ''}${unlocked > index ? 'cleared ' : ''}${unlocked < index ? 'locked' : ''}`}
            >
              <span className="adventure-stage-icon">
                {index > unlocked ? <LockKeyhole size={21} /> : index < unlocked ? <CheckCircle2 size={21} /> : <span aria-hidden="true">{item.emoji}</span>}
              </span>
              <span className="adventure-stage-label">{item.short}</span>
              <strong>{item.name}</strong>
            </button>
          ))}
        </div>
        <div className="adventure-progress-bar"><span style={{ width: `${unlocked * 20}%` }} /></div>
        <div className="adventure-progress-caption">
          <span><Map size={14} /> Selesaikan satu level untuk membuka gerbang berikutnya</span>
          <button type="button" onClick={resetAdventure} disabled={saving}><RotateCcw size={13} /> Reset petualangan</button>
        </div>
        <div className="adventure-reward-strip">
          <span><Ticket size={16} /> Tiket Emas: <strong>{progress.gold_tickets}/3</strong></span>
          <span>{progress.golden_gallery_pass ? '✦ Golden Gallery Pass terbuka' : 'Kumpulkan 3 tiket untuk membuka Galeri Emas'}</span>
          <span>{progress.aurora_badge_earned ? '🏆 Lencana Mahkota Aurora didapat' : 'Lencana menunggu di garis FINISH'}</span>
        </div>
        {user ? (
          <p className="adventure-save-note"><CheckCircle2 size={14} /> Progres, tiket, dan lencana tersimpan ke PostgreSQL untuk akun {user.name}.</p>
        ) : (
          <p className="adventure-login-note">Mode tamu aktif. <Link href="/login?next=%2Fart-games">Masuk sebagai Member</Link> agar progres dan Tiket Emas tersimpan di database.</p>
        )}
        {guestNotice && <p className="adventure-login-note" role="status">{guestNotice}</p>}
        {saveError && <p className="adventure-error-note" role="alert">{saveError}</p>}
      </section>

      <section className="container-page adventure-world" aria-label={`Level aktif: ${current.name}`}>
        <div className="adventure-scene">
          <div className="adventure-scene-sky" aria-hidden="true">
            <span className="adventure-cloud cloud-a">☁</span>
            <span className="adventure-cloud cloud-b">☁</span>
            <span className="adventure-scene-sun">☀</span>
            <span className="adventure-balloon">🎈</span>
          </div>
          <div className="adventure-scene-heading">
            <span className="adventure-small-caps">{current.short} • {current.sub}</span>
            <h2>{current.name}</h2>
          </div>
          <div className="adventure-play-zone">
            {stage === 0 && (
              <div className="adventure-start-panel">
                <img src="/images/circus/tent.svg" alt="Tenda sirkus penuh warna" />
                <h3>Petualangan akan segera dimulai!</h3>
                <p>Berburu tiket, mengenali karya seni dari database, menyusun puzzle, lalu membuka peti emas.</p>
                <button className="adventure-primary" type="button" onClick={startAdventure} disabled={saving}>
                  <Flag size={17} /> MULAI PETUALANGAN <ArrowRight size={17} />
                </button>
              </div>
            )}

            {/* LEVEL 1: berburu Tiket Emas di peta sirkus. */}
            {stage === 1 && (
              <div className="adventure-level">
                <p className="adventure-instruction">Temukan <strong>tiga Tiket Emas</strong>. Klik benda di taman sirkus; beberapa hanyalah pengecoh.</p>
                <div className="adventure-hunt-map" role="group" aria-label="Peta lokasi tiket">
                  <span className="adventure-hunt-path" aria-hidden="true" />
                  <img src="/images/circus/tent.svg" alt="Tenda di tengah taman" className="adventure-hunt-tent" />
                  {TICKETS.map((ticket, index) => (
                    <button
                      key={ticket.name}
                      className={`adventure-hunt-spot hunt-${index}${foundTickets.includes(ticket.key) ? ' spotted' : ''}`}
                      type="button"
                      onClick={() => findTicket(index)}
                      title={ticket.clue}
                      aria-label={`${ticket.name} — ${ticket.clue}`}
                      disabled={saving || (ticket.key && foundTickets.includes(ticket.key))}
                    >
                      <span>{ticket.key && foundTickets.includes(ticket.key) ? '🎟️' : ticket.icon}</span>
                      <strong>{ticket.name}</strong>
                    </button>
                  ))}
                </div>
                <div className="adventure-feedback" role="status">
                  <Ticket size={18} />
                  <span>{ticketMessage}</span>
                  <strong>{progress.gold_tickets}/3 tiket</strong>
                </div>
              </div>
            )}

            {/* LEVEL 2: kuis mengambil referensi gambar, audio, dan video dari database. */}
            {stage === 2 && (
              <div className="adventure-level adventure-quiz">
                <div className="adventure-quiz-header">
                  {quizQuestions[quizIndex].artwork?.media_type === 'audio' ? (
                    <div className="adventure-art-reference adventure-audio-reference">
                      <Music2 size={34} />
                      <strong>{quizQuestions[quizIndex].artwork.title}</strong>
                      <span>REKAMAN MUSIK DARI DATABASE</span>
                      <audio controls preload="metadata" src={quizQuestions[quizIndex].artwork.media_url} aria-label={`Putar ${quizQuestions[quizIndex].artwork.title}`} />
                      <Link href={`/artwork/${quizQuestions[quizIndex].artwork.id}`}>Lihat detail karya ↗</Link>
                    </div>
                  ) : quizQuestions[quizIndex].artwork?.media_type === 'video' ? (
                    <div className="adventure-art-reference adventure-audio-reference">
                      <span>VIDEO DARI DATABASE</span>
                      <video controls playsInline preload="metadata" src={quizQuestions[quizIndex].artwork.media_url} aria-label={quizQuestions[quizIndex].artwork.title} />
                      <Link href={`/artwork/${quizQuestions[quizIndex].artwork.id}`}>Lihat detail karya ↗</Link>
                    </div>
                  ) : quizQuestions[quizIndex].artwork?.media_url ? (
                    <Link href={`/artwork/${quizQuestions[quizIndex].artwork.id}`} className="adventure-art-reference">
                      <img src={quizQuestions[quizIndex].artwork.media_url} alt={quizQuestions[quizIndex].artwork.title} />
                      <span>Lihat karya di galeri ↗</span>
                    </Link>
                  ) : (
                    <img src="/images/references/starry-night-reference.svg" alt="Kartu referensi karya seni" />
                  )}
                  <div>
                    <span className="adventure-small-caps">MYSTERY QUESTION {quizIndex + 1} / {quizQuestions.length}</span>
                    <h3>{quizQuestions[quizIndex].question}</h3>
                    <p>Pilih satu jawaban. Setiap pertanyaan mengajakmu mengenal karya yang tersedia di galeri SPEKTRA.</p>
                  </div>
                </div>
                <div className="adventure-options">
                  {quizQuestions[quizIndex].options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answerQuiz(index)}
                      disabled={Boolean(quizFeedback?.good) || saving}
                      className={quizFeedback?.good && index === quizQuestions[quizIndex].answer ? 'correct' : ''}
                    >
                      <span>{String.fromCharCode(65 + index)}</span>{option}<ArrowRight size={15} />
                    </button>
                  ))}
                </div>
                {quizFeedback && (
                  <div className={`adventure-feedback ${quizFeedback.good ? 'adventure-correct' : 'adventure-wrong'}`} role="status">
                    {quizFeedback.good ? <CheckCircle2 size={18} /> : <Heart size={18} />}
                    {quizFeedback.message}
                  </div>
                )}
                {quizFeedback && quizIndex < quizQuestions.length - 1 && (
                  <button className="adventure-subtle" onClick={continueQuiz} type="button">
                    {quizFeedback.good ? 'Lanjut ke pertanyaan berikutnya' : 'Coba lagi'} <ArrowRight size={15} />
                  </button>
                )}
                {quizFeedback?.good && quizIndex === quizQuestions.length - 1 && (
                  <p className="adventure-complete-hint">Kuis selesai! Gerbang Labirin Kanvas sudah terbuka.</p>
                )}
              </div>
            )}

            {/* LEVEL 3: puzzle gambar karya yang sama dengan halaman detail galeri. */}
            {stage === 3 && (
              <div className="adventure-level">
                <p className="adventure-instruction">
                  Susun potongan gambar <strong>{puzzleArtwork?.title || 'The Great Wave off Kanagawa'}</strong> hingga kembali utuh.
                  Klik ubin yang bersebelahan dengan ruang kosong.
                </p>
                <div className="adventure-puzzle-grid">
                  <div className="adventure-puzzle-board" role="group" aria-label="Puzzle geser 3 kali 3">
                    {tiles.map((tile, index) => tile === null ? (
                      <span key="empty" className="adventure-puzzle-empty" aria-label="Ruang kosong" />
                    ) : (
                      <button
                        key={tile}
                        type="button"
                        disabled={!neighbors(tiles.indexOf(null)).includes(index) || isSolved(tiles) || saving}
                        aria-label={`Geser potongan ${tile + 1}`}
                        onClick={() => moveTile(index)}
                        style={{ backgroundImage: `url('${puzzleImage}')`, backgroundPosition: `${(tile % 3) * 50}% ${Math.floor(tile / 3) * 50}%` }}
                      />
                    ))}
                  </div>
                  <aside className="adventure-puzzle-aside">
                    {puzzleArtwork?.id ? (
                      <Link href={`/artwork/${puzzleArtwork.id}`}>
                        <img src={puzzleImage} alt={`Karya ${puzzleArtwork.title} sebagai panduan puzzle`} />
                      </Link>
                    ) : (
                      <img src={puzzleImage} alt="Gambar utuh sebagai panduan puzzle" />
                    )}
                    <span>GAMBAR ASLI DARI DATABASE</span>
                    <p>{moves} gerakan digunakan</p>
                    <button type="button" className="adventure-subtle" onClick={() => { setTiles(shuffledPuzzle()); setMoves(0); }}>
                      <RotateCcw size={16} /> Acak ulang
                    </button>
                  </aside>
                </div>
                {isSolved(tiles) && <div className="adventure-feedback adventure-correct"><CheckCircle2 size={18} /> Luar biasa! Karya kembali utuh dalam {moves} gerakan.</div>}
              </div>
            )}

            {/* LEVEL 4: brankas simbol sebagai kunci menuju garis FINISH. */}
            {stage === 4 && (
              <div className="adventure-level adventure-vault">
                <div className="adventure-vault-lock">
                  <img src={progress.aurora_badge_earned ? '/images/circus/treasure-open.svg' : '/images/circus/treasure-closed.svg'} alt={progress.aurora_badge_earned ? 'Peti harta karun telah terbuka' : 'Peti harta karun yang masih terkunci'} />
                </div>
                <h3>Peti Emas Sang Maestro</h3>
                <p>“Aku bermula dari sesuatu yang berkilau di langit, dilanjutkan oleh alat untuk melukis, dan diakhiri benda pembuka pintu.”</p>
                <div className="adventure-code-slots" aria-label={`Kode: ${code.length} dari 3 simbol terisi`}>
                  {[0, 1, 2].map((index) => <span key={index}>{code[index] ? LOCK_CHOICES.find((choice) => choice.id === code[index])?.icon : '?'}</span>)}
                </div>
                <div className="adventure-lock-options">
                  {LOCK_CHOICES.map((choice) => (
                    <button type="button" key={choice.id} disabled={progress.aurora_badge_earned || saving} onClick={() => chooseSymbol(choice.id)}>
                      <span>{choice.icon}</span>{choice.label}
                    </button>
                  ))}
                </div>
                <div className={`adventure-feedback ${progress.aurora_badge_earned ? 'adventure-correct' : ''}`} role="status">
                  <LockKeyhole size={17} />{progress.aurora_badge_earned ? 'Peti terbuka! Mahkota Aurora menjadi milikmu.' : codeMessage}
                </div>
                <button className="adventure-subtle" type="button" onClick={() => { setCode([]); setCodeMessage('Urutan dikosongkan. Pilih simbol pertama lagi.'); }}>
                  <RotateCcw size={15} /> Kosongkan kode
                </button>
              </div>
            )}

            {/* FINISH: tampilkan hadiah, lencana, dan Golden Gallery dari database. */}
            {stage === 5 && (
              <div className="adventure-finish">
                <div className="adventure-confetti" aria-hidden="true">✦ ✶ ✧ ✦ ✶ ✧</div>
                <div className="adventure-trophy"><Crown size={78} strokeWidth={1.6} /></div>
                <span className="adventure-small-caps">QUEST COMPLETED / THE GRAND ART CIRCUS</span>
                <h3>Selamat, Art Adventurer!</h3>
                <p>Kamu berhasil menuntaskan empat misi, mengumpulkan tiga Tiket Emas, mengenali karya dari database, menyelesaikan puzzle, dan membuka peti Aurora.</p>
                <div className="adventure-reward">
                  <Gift size={23} />
                  <strong>Lencana Mahkota Aurora</strong>
                  <span>{progress.aurora_badge_earned ? 'Tersimpan di akunmu!' : 'Misi selesai!'}</span>
                </div>
                {progress.golden_gallery_pass && (
                  <section className="adventure-golden-gallery">
                    <div className="adventure-small-caps">GOLDEN GALLERY / UNLOCKED BY 3 GOLD TICKETS</div>
                    <h4>Ruang Koleksi Rahasia</h4>
                    <p>Tiket Emasmu menjadi akses untuk membuka tiga karya pilihan dari koleksi database SPEKTRA. Pilih karya untuk membaca cerita dan detail aslinya.</p>
                    <div className="adventure-golden-grid">
                      {bonusArtworks.map((artwork) => (
                        <Link key={artwork.id} href={`/artwork/${artwork.id}`} className="adventure-golden-card">
                          <img src={artwork.media_url} alt={artwork.title} />
                          <strong>{artwork.title}</strong>
                          <span>{artwork.original_artist || artwork.creator_name}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
                <div className="adventure-finish-buttons">
                  <button type="button" className="adventure-primary" onClick={resetAdventure} disabled={saving}><RotateCcw size={16} /> Main dari awal</button>
                  <Link href="/explore" className="adventure-subtle"><BookOpen size={16} /> Kunjungi galeri seni</Link>
                </div>
              </div>
            )}
          </div>

          {stage > 0 && stage < 5 && (
            <div className="adventure-level-bottom">
              <span><WandSparkles size={15} /> {unlocked > stage ? 'Level selesai! Pintu berikutnya telah terbuka.' : 'Selesaikan tantangan untuk membuka gerbang berikutnya.'}</span>
              <button className="adventure-primary" disabled={unlocked <= stage || saving} onClick={nextLevel} type="button">
                LANJUT KE LEVEL {stage + 1} <ArrowRight size={16} />
              </button>
            </div>
          )}
          <div className="adventure-scene-footer" aria-hidden="true"><span>✺ ✦ ✺</span><span>✧ ✦ ✧</span></div>
        </div>
      </section>

      <section className="container-page adventure-outro">
        <p>
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          Efek suara membantu menandai tiket ditemukan dan level selesai. Progres Member, Tiket Emas, dan lencana disimpan di PostgreSQL.
          <button type="button" className="adventure-sound-toggle" onClick={() => setSoundEnabled((value) => !value)}>
            {soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
          </button>
        </p>
        <Link href="/"><ArrowLeft size={15} /> Kembali ke SPEKTRA</Link>
      </section>
    </main>
  );
}
