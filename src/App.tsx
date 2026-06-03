import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { io } from "socket.io-client";
import { QrCode, Wifi, WifiOff, MessageSquare, ShieldCheck, Zap, Server, Briefcase, Mail, Download, User, Sliders, Terminal, Trophy, Search, Check, Settings, Copy, HelpCircle, RefreshCw, Star } from "lucide-react";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";

const socket = io();

function CVPage() {
  const { id } = useParams();
  const [cv, setCv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cv/${id}`)
      .then(res => res.json())
      .then(data => {
        setCv(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!cv) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500">
      CV tidak ditemukan.
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans p-6 md:p-12 selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="bg-emerald-500/10 p-8 md:p-12 border-b border-zinc-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2">{cv.nama}</h1>
              <p className="text-emerald-400 font-medium text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {cv.posisi}
              </p>
            </div>
            <div className="flex gap-4">
               <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-medium text-sm">
                 <Download className="w-4 h-4" /> Download PDF
               </button>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-12">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" /> Profil Profesional
              </h2>
              <p className="text-zinc-400 leading-relaxed text-lg">
                {cv.summary}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" /> Pengalaman Kerja
              </h2>
              <ul className="space-y-4">
                {cv.experience?.map((exp: string, i: number) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full mt-2.5 shrink-0" />
                    <span className="text-zinc-400">{exp}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-400" /> Surat Lamaran
              </h2>
              <div className="text-zinc-400 leading-relaxed whitespace-pre-wrap font-serif text-lg italic">
                {cv.letter}
              </div>
            </section>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Skill Utama</h2>
              <div className="flex flex-wrap gap-2">
                {cv.skills?.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm border border-zinc-700">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section className="pt-8 border-t border-zinc-800">
               <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Dibuat pada</p>
               <p className="text-sm font-medium text-emerald-400">{cv.date}</p>
            </section>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto mt-8 flex justify-center">
         <p className="text-zinc-600 text-sm">Powered by WhatsApp AI Pro Generator</p>
      </div>
    </div>
  );
}

const mockLeaderboard = [
  { jid: "6281234567890@s.whatsapp.net", xp: 12450, level: 12, messages: 843 },
  { jid: "6289876543210@s.whatsapp.net", xp: 8900, level: 9, messages: 512 },
  { jid: "6285551234567@s.whatsapp.net", xp: 5200, level: 5, messages: 350 },
  { jid: "6281112223334@s.whatsapp.net", xp: 3100, level: 3, messages: 180 },
];

const commandCategories = [
  {
    name: "AI & Search",
    color: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    list: [
      { cmd: "ai", desc: "Tanya apa saja ke Gemini AI yang cerdas", usage: "!ai apa ibukota Indonesia?" },
      { cmd: "aiimg", desc: "Generate gambar artistik dari deskripsi teks", usage: "!aiimg pemandangan gunung futuristik, cyberpunk" },
      { cmd: "google", desc: "Melakukan pencarian di Google secara langsung", usage: "!google berita teknologi terbaru" },
      { cmd: "wiki", desc: "Mencari ensiklopedia terpercaya di Wikipedia", usage: "!wiki rotasi bumi" },
      { cmd: "pinterest", desc: "Cari ide & inspirasi gambar di Pinterest", usage: "!pinterest typography design" }
    ]
  },
  {
    name: "Downloader",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    list: [
      { cmd: "play", desc: "Cari & putar musik berkualitas tinggi dari YouTube", usage: "!play more than words" },
      { cmd: "ytmp3", desc: "Konversi video YouTube menjadi file audio MP3", usage: "!ytmp3 https://youtube.com/watch?v=..." },
      { cmd: "ytmp4", desc: "Unduh video YouTube High Definition", usage: "!ytmp4 https://youtube.com/watch?v=..." },
      { cmd: "tiktok", desc: "Download video murni TikTok tanpa watermark", usage: "!tiktok https://vt.tiktok.com/..." },
      { cmd: "ig", desc: "Unduh video reels atau foto Instagram", usage: "!ig https://www.instagram.com/p/..." },
      { cmd: "fb", desc: "Download media & video beresolusi penuh Facebook", usage: "!fb https://facebook.com/watch/..." }
    ]
  },
  {
    name: "Converter",
    color: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
    list: [
      { cmd: "sticker", desc: "Ubah foto/video menjadi stiker WhatsApp (balas media)", usage: "!sticker" },
      { cmd: "ttp", desc: "Membuat stiker tulisan bergerak berwarna pelangi", usage: "!ttp ellBot Keren" },
      { cmd: "toimg", desc: "Ubah kembali stiker menjadi file gambar biasa (balas stiker)", usage: "!toimg" },
      { cmd: "toqr", desc: "Ubah tulisan atau tautan menjadi kode QR instan", usage: "!toqr https://google.com" },
      { cmd: "tourl", desc: "Unggah gambar ke awan & dapatkan tautannya (balas foto)", usage: "!tourl" }
    ]
  },
  {
    name: "Group Menu",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    list: [
      { cmd: "hidetag", desc: "Kirim tag massal tersembunyi ke seluruh anggota grup", usage: "!hidetag Pengumuman penting!" },
      { cmd: "kick", desc: "Keluarkan anggota bermasalah dari grup (Khusus Admin)", usage: "!kick @user" },
      { cmd: "add", desc: "Tambahkan anggota baru ke grup secara langsung", usage: "!add 62812345678" },
      { cmd: "group", desc: "Membuka atau menutup percakapan grup", usage: "!group close" },
      { cmd: "promote", desc: "Mempromosikan anggota biasa menjadi Pengurus/Admin", usage: "!promote @user" },
      { cmd: "demote", desc: "Menurunkan jabatan Admin menjadi anggota biasa kembali", usage: "!demote @user" }
    ]
  },
  {
    name: "System Settings",
    color: "from-rose-500/20 to-red-500/20",
    border: "border-rose-500/30",
    iconColor: "text-rose-400",
    list: [
      { cmd: "setai", desc: "Aktifkan/nonaktifkan chatbot otomatis Gemini AI", usage: "!setai on" },
      { cmd: "setsticker", desc: "Mengaktifkan/mematikan menu converter stiker otomatis", usage: "!setsticker off" },
      { cmd: "setautoread", desc: "Membaca pesan secara otomatis saat status online", usage: "!setautoread on" },
      { cmd: "setautoreact", desc: "Berikan emoticon otomatis pada percakapan masuk", usage: "!setautoreact off" },
      { cmd: "setemoji", desc: "Kustomisasi emoji default untuk reaction otomatis", usage: "!setemoji 🔥" }
    ]
  },
  {
    name: "Leveling & Games",
    color: "from-yellow-400/20 to-amber-500/20",
    border: "border-yellow-500/20",
    iconColor: "text-yellow-400",
    list: [
      { cmd: "profile", desc: "Melihat profil, detail level, XP, & statistik Anda", usage: "!profile" },
      { cmd: "leaderboard", desc: "Melihat daftar 10 peringkat XP tertinggi", usage: "!leaderboard" },
      { cmd: "tebakgambar", desc: "Gim kuis interaktif tebak gambar dengan hadiah XP", usage: "!tebakgambar" }
    ]
  },
  {
    name: "Creative & Tools",
    color: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
    iconColor: "text-cyan-400",
    list: [
      { cmd: "nulis", desc: "Mengubah teks ketikan menjadi tulisan tangan estetik di buku", usage: "!nulis Pelajaran Geografi hari ini..." },
      { cmd: "tr", desc: "Menerjemahkan teks ke berbagai kode bahasa asing", usage: "!tr ja Selamat pagi" },
      { cmd: "buatcv", desc: "Generate CV PDF profesional otomatis langsung lewat chat WhatsApp", usage: "!buatcv Nama: Michael | Posisi: Developer" }
    ]
  }
];

function Dashboard() {
  const [status, setStatus] = useState<string>("Initializing...");
  const [qr, setQr] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ id: number; text: string; time: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string>("koneksi");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Bot Settings State
  const [settings, setSettings] = useState<any>({
    aiEnabled: true,
    stickerEnabled: true,
    autoSticker: false,
    nulisEnabled: true,
    downloaderEnabled: true,
    autoRead: false,
    autoReaction: false,
    reactionEmoji: 'random'
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    socket.on("status", (s: string) => setStatus(s));
    socket.on("qr", (q: string | null) => setQr(q));

    // Fetch original settings
    fetch("/api/settings")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Gagal");
      })
      .then((data) => {
        setSettings(data);
        setLoadingSettings(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoadingSettings(false);
      });

    // Fetch leaderboard
    fetch("/api/leaderboard")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Gagal");
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLeaderboard(data);
        } else {
          setLeaderboard(mockLeaderboard);
        }
      })
      .catch((err) => {
        console.error("Failed load leaderboard:", err);
        setLeaderboard(mockLeaderboard);
      });

    return () => {
      socket.off("status");
      socket.off("qr");
    };
  }, []);

  const addLog = (text: string) => {
    setLogs((prev) => [{ id: Date.now(), text, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    if (status === "Connected") addLog("Bot terhubung ke WhatsApp!");
    if (status === "Waiting for Scan") addLog("Menunggu scan QR code...");
  }, [status]);

  const handleCopyCmd = (usage: string) => {
    navigator.clipboard.writeText(usage);
    setCopiedCmd(usage);
    setTimeout(() => {
      setCopiedCmd(null);
    }, 1500);
  };

  const handleUpdateSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleSetting = (key: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTextSettingChange = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  // Filter commands based on search
  const filteredCategories = commandCategories.map(cat => {
    const list = cat.list.filter(item => 
      item.cmd.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, list };
  }).filter(cat => cat.list.length > 0);

  const formatJid = (jid: string) => {
    const num = jid.split("@")[0];
    if (num.length > 8) {
      return `+${num.substring(0, 4)}****${num.substring(num.length - 4)}`;
    }
    return `+${num}`;
  };

  const tabs = [
    { id: "koneksi", name: "Status & Koneksi", icon: Server },
    { id: "menu", name: "Menu & Fitur Bot", icon: Terminal },
    { id: "settings", name: "Konfigurasi Web", icon: Sliders },
    { id: "leaderboard", name: "Papan Klasemen", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative max-w-5xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                ellbot_MK PRO
              </h1>
            </div>
            {/* Elegant Glass Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl backdrop-blur-md">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-zinc-400 max-w-xl text-md leading-relaxed">
            Bot WhatsApp pintar bertenaga Gemini AI. Kelola koneksi, pantau status, kelola pengaturan, dan deploy dengan mudah.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {/* TAP 1: KONEKSI */}
          {activeTab === "koneksi" && (
            <motion.div
              key="koneksi"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Status and QR Card */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                      <h2 className="text-xl font-medium text-white">Status Koneksi</h2>
                      <div className="flex items-center gap-2">
                        {status === "Connected" ? (
                          <Wifi className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-zinc-500" />
                        )}
                        <span className={`text-sm font-semibold tracking-wide uppercase ${
                          status === "Connected" ? "text-emerald-400" : 
                          status === "Waiting for Scan" ? "text-amber-400" : "text-zinc-500"
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
                      <Server className="w-5 h-5 text-zinc-400" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-8">
                    <AnimatePresence mode="wait">
                      {status === "Connected" ? (
                        <motion.div
                          key="connected"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="text-center space-y-4"
                        >
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                            <ShieldCheck className="w-32 h-32 text-emerald-400 relative z-10 mx-auto" />
                          </div>
                          <p className="text-zinc-400 max-w-xs mx-auto text-sm leading-relaxed">
                            Bot Anda aktif dan siap menerima perintah. Gunakan prefix <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 font-mono">!</code> untuk berinteraksi di WhatsApp.
                          </p>
                        </motion.div>
                      ) : qr ? (
                        <motion.div
                          key="qr"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="text-center space-y-8"
                        >
                          <div className="relative p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] inline-block">
                            <img src={qr} alt="WhatsApp QR" className="w-64 h-64 select-none" />
                          </div>
                          <div className="space-y-2">
                            <p className="font-medium text-white">Scan QR Code</p>
                            <p className="text-sm text-zinc-400">Buka WhatsApp &gt; Perangkat Tertaut &gt; Tautkan Perangkat</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="loading"
                          className="flex flex-col items-center gap-4 text-zinc-500"
                        >
                          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                          <p className="text-sm">Menyiapkan sesi WhatsApp...</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
                    <MessageSquare className="w-5 h-5 text-blue-400 mb-3" />
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Prefix Utama</p>
                    <p className="text-lg font-medium font-mono">!</p>
                  </div>
                  <div className="p-6 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
                    <QrCode className="w-5 h-5 text-purple-400 mb-3" />
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Sesi Bot</p>
                    <p className="text-lg font-medium whitespace-nowrap overflow-hidden text-ellipsis">Multi-Device</p>
                  </div>
                </div>
              </div>

              {/* Logs Panel */}
              <div className="lg:col-span-5">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl h-full flex flex-col backdrop-blur-xl">
                  <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Aktivitas Bot (Live)
                    </h3>
                    <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">{logs.length} Baris</span>
                  </div>
                  <div className="flex-1 p-6 font-mono text-[13px] overflow-y-auto space-y-3 custom-scrollbar h-[380px]">
                    {logs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-zinc-600 italic">
                        Belum ada aktivitas dalam sesi ini...
                      </div>
                    ) : (
                      logs.map((log) => (
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          key={log.id}
                          className="group flex gap-3"
                        >
                          <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                          <span className="text-zinc-300 break-all">{log.text}</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: MENU PERINTAH */}
          {activeTab === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/30 p-6 border border-zinc-800 rounded-3xl backdrop-blur-xl">
                <div>
                  <h2 className="text-xl font-medium text-white mb-1">Daftar Fitur & Menu Perintah</h2>
                  <p className="text-sm text-zinc-400">Jelajahi dan pelajari perintah-perintah yang ada lewat petunjuk di bawah ini.</p>
                </div>
                {/* Search Perintah */}
                <div className="relative max-w-sm w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari perintah... (contoh: ai, play)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {filteredCategories.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/25 border border-zinc-800 rounded-3xl text-zinc-500 font-sans">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                  <p className="text-zinc-400">Tidak ada perintah yang cocok dengan "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {filteredCategories.map((category) => (
                    <div key={category.name} className="space-y-4">
                      <h3 className="text-md font-semibold text-zinc-300 tracking-wider uppercase flex items-center gap-2 px-1">
                        <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                        {category.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.list.map((item) => {
                          const isCopied = copiedCmd === item.usage;
                          return (
                            <div 
                              key={item.cmd}
                              className="group p-5 bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl transition-all duration-300 flex justify-between gap-4"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-mono font-medium text-emerald-400">
                                    !{item.cmd}
                                  </span>
                                </div>
                                <h4 className="text-sm font-medium text-zinc-200">{item.desc}</h4>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                  <span className="font-mono">Contoh:</span>
                                  <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-zinc-400 font-mono break-all">{item.usage}</code>
                                </div>
                              </div>
                              <button
                                onClick={() => handleCopyCmd(item.usage)}
                                title="Salin Contoh Perintah"
                                className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-200 ${
                                  isCopied 
                                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" 
                                    : "bg-zinc-800/40 border-zinc-700/40 text-zinc-400 hover:text-white hover:bg-zinc-700/60"
                                }`}
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAP 3: CONFIGURASI WEB */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                  <div>
                    <h2 className="text-xl font-medium text-white mb-1 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-emerald-400" />
                      Konfigurasi Fitur & Sistem Bot
                    </h2>
                    <p className="text-sm text-zinc-400">Sesuaikan mode pengoperasian bot WhatsApp Anda secara real-time.</p>
                  </div>
                  <button
                    onClick={handleUpdateSettings}
                    disabled={savingSettings || loadingSettings}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-emerald-500/10 flex items-center gap-2 justify-center"
                  >
                    {savingSettings ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>

                {saveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-emerald-400 text-sm font-medium"
                  >
                    <Check className="w-4 h-4 shrink-0" />
                    Konfigurasi berhasil disimpan dan diterapkan pada sistem bot!
                  </motion.div>
                )}

                {loadingSettings ? (
                  <div className="text-center py-12 text-zinc-500 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p>Memuat konfigurasi...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Grid of Switch settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* AI chat mode */}
                      <div className="p-5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4 leading-relaxed">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-sm font-semibold text-zinc-200">Chatbot AI (Gemini)</label>
                          <p className="text-xs text-zinc-500">Merespon chat personal otomatis dengan kecerdasan buatan.</p>
                        </div>
                        <button
                          onClick={() => handleToggleSetting("aiEnabled")}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                            settings.aiEnabled ? "bg-emerald-500 justify-end" : "bg-zinc-800 justify-start"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                        </button>
                      </div>

                      {/* Sticker conversion mode */}
                      <div className="p-5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4 leading-relaxed">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-sm font-semibold text-zinc-200">Fitur Pembuat Stiker</label>
                          <p className="text-xs text-zinc-500">Mengizinkan pengguna membuat stiker dengan menu !sticker.</p>
                        </div>
                        <button
                          onClick={() => handleToggleSetting("stickerEnabled")}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                            settings.stickerEnabled ? "bg-emerald-500 justify-end" : "bg-zinc-800 justify-start"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                        </button>
                      </div>

                      {/* Auto Sticker conversion */}
                      <div className="p-5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4 leading-relaxed">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-sm font-semibold text-zinc-200">Stiker Otomatis</label>
                          <p className="text-xs text-zinc-500">Langsung jadikan stiker seketika jika user mengirim foto.</p>
                        </div>
                        <button
                          onClick={() => handleToggleSetting("autoSticker")}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                            settings.autoSticker ? "bg-emerald-500 justify-end" : "bg-zinc-800 justify-start"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                        </button>
                      </div>

                      {/* Nulis Buku */}
                      <div className="p-5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4 leading-relaxed">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-sm font-semibold text-zinc-200">Fitur Nulis Tangan</label>
                          <p className="text-xs text-zinc-500">Mengizinkan konversi teks ke gambar tulisan buku lepas.</p>
                        </div>
                        <button
                          onClick={() => handleToggleSetting("nulisEnabled")}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                            settings.nulisEnabled ? "bg-emerald-500 justify-end" : "bg-zinc-800 justify-start"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                        </button>
                      </div>

                      {/* Media Downloader */}
                      <div className="p-5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4 leading-relaxed">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-sm font-semibold text-zinc-200">Media Downloader</label>
                          <p className="text-xs text-zinc-500">Aktifkan pengunduhan media dari TikTok, YouTube, & IG.</p>
                        </div>
                        <button
                          onClick={() => handleToggleSetting("downloaderEnabled")}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                            settings.downloaderEnabled ? "bg-emerald-500 justify-end" : "bg-zinc-800 justify-start"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                        </button>
                      </div>

                      {/* Auto Read */}
                      <div className="p-5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4 leading-relaxed">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-sm font-semibold text-zinc-200">Auto Read Chat</label>
                          <p className="text-xs text-zinc-500">Tandai centang biru secara instan saat pesan masuk.</p>
                        </div>
                        <button
                          onClick={() => handleToggleSetting("autoRead")}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                            settings.autoRead ? "bg-emerald-500 justify-end" : "bg-zinc-800 justify-start"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                        </button>
                      </div>

                      {/* Auto Reaction */}
                      <div className="p-5 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4 leading-relaxed">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-sm font-semibold text-zinc-200">Auto Emoji Reaction</label>
                          <p className="text-xs text-zinc-500">Berikan emotikon reaksi otomatis di setiap chat masuk.</p>
                        </div>
                        <button
                          onClick={() => handleToggleSetting("autoReaction")}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                            settings.autoReaction ? "bg-emerald-500 justify-end" : "bg-zinc-800 justify-start"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                        </button>
                      </div>
                    </div>

                    {/* Emoji reaction text input */}
                    <div className="p-6 bg-zinc-950/20 border border-zinc-850 rounded-2xl space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-zinc-200">Emoji Emoji Reaction Default</label>
                        <span className="text-xs text-zinc-500">Masukkan satu emoji utama atau tulis <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300 font-mono text-[10px]">random</code> untuk emoji bervariasi.</span>
                      </div>
                      <input
                        type="text"
                        value={settings.reactionEmoji || "random"}
                        onChange={(e) => handleTextSettingChange("reactionEmoji", e.target.value)}
                        placeholder="Contoh: 🔥"
                        className="w-full max-w-sm px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-sans text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAP 4: leaderboard */}
          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <div>
                  <h2 className="text-xl font-medium text-white mb-1 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Papan Klasemen Pengguna Terbanyak
                  </h2>
                  <p className="text-sm text-zinc-400">10 pengguna dengan akumulasi poin XP dan interaksi perintah terbanyak dalam bot WhatsApp.</p>
                </div>

                <div className="space-y-3.5 pt-4">
                  {leaderboard.map((user, idx) => {
                    const isTop3 = idx < 3;
                    return (
                      <div 
                        key={user.jid || idx}
                        className={`flex items-center justify-between p-4.5 bg-zinc-950/40 hover:bg-zinc-950/60 border rounded-2xl transition-all duration-300 ${
                          idx === 0 ? "border-yellow-500/20 bg-yellow-500/5" :
                          idx === 1 ? "border-zinc-400/20 bg-zinc-400/5" :
                          idx === 2 ? "border-amber-700/20 bg-amber-700/5" : "border-zinc-800/80"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank number or Gold logo */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            idx === 0 ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/10" :
                            idx === 1 ? "bg-zinc-400 text-black" :
                            idx === 2 ? "bg-amber-700 text-neutral-100" : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {idx + 1}
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                              {formatJid(user.jid)}
                              {idx === 0 && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                            </p>
                            <p className="text-xs text-zinc-500">
                              Level {user.level || 1} &bull; {user.messages || user.xp / 10 || 0} Perintah dicatat
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">{(user.xp || 0).toLocaleString()} XP</p>
                          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold font-mono">Poin Akumulasi</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-20 pt-10 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-500 text-sm">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Gemini 1.5 Flash
            </span>
            <span>Baileys Socket 7.0</span>
          </div>
          <p>© 2024 WhatsApp AI Pro Manager</p>
        </footer>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cv/:id" element={<CVPage />} />
      </Routes>
    </BrowserRouter>
  );
}


