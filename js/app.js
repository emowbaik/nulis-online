// ==========================================
    // LOGIKA MESIN V8 (JavaScript Engine)
    // ==========================================

    const elemenKanvas = document.getElementById('myCanvas');
    const konteks = elemenKanvas.getContext('2d');
    let animasiFrame = null;

    const DAFTAR_FONT = [
      { id: 'gloria', nama: 'Gloria', keluarga: 'Gloria Hallelujah' },
      { id: 'hwcr2', nama: 'HW CR-2', keluarga: 'HandwritingCR 2' },
      { id: 'myhand', nama: 'My Hand', keluarga: 'My Handwriting' },
      { id: 'myhands2', nama: 'Holding You', keluarga: 'My Hands' },
      { id: 'shadows', nama: 'Shadows', keluarga: 'Shadows Into Light' },
      { id: 'patrick', nama: 'Patrick Hand', keluarga: 'Patrick Hand' }
    ];

    const DAFTAR_KERTAS_LOKAL = [
      { id: 'buku1', nama: 'Buku 1', path: 'img/buku1.jpg' },
      { id: 'folio1', nama: 'Folio 1', path: 'img/folio1.jpg' },
      { id: 'folio2', nama: 'Folio 2', path: 'img/folio2.png' },
      { id: 'folio3', nama: 'Folio 3', path: 'img/folio3.png' }
    ];

    const TINTA_PRESET = [
      { id: 'hitam', hex: '#1a1209' },
      { id: 'biru', hex: '#1b3a7a' },
      { id: 'merah', hex: '#8b1a1a' }
    ];

    const Status = {
      gambarKertas: null,
      cerminKertas: false,
      modeAplikasi: 'tulis',
      hexTinta: '#1a1209',
      keluargaFont: 'Patrick Hand',
      fontKustom: null,

      kalibrasi: {
        headerKiri: { marginKiri: 44, batasKanan: 250, awalY: 60, yKedua: 92 },
        headerKanan: { marginKiri: 400, batasKanan: 550, awalY: 60, yKedua: 92 },
        konten: { marginKiri: 44, batasKanan: 550, awalY: 150, yKedua: 182 }
      }
    };

    // --- STATE INTERAKSI DRAG BARU ---
    const Interaksi = {
      lineDragging: null, // Menyimpan ID garis yang sedang di-drag
      activeHandle: null, // Menyimpan ID handle yang di-hover mouse
      hoverLine: null     // Menyimpan ID garis yang di-hover mouse
    };

    // Ukuran handle (kotak kecil) visual di layar
    const HANDLE_SIZE_SCREEN = 30;

    // --- INISIALISASI UI ---
    function inisialisasiUI() {
      // 1. Render Font Lokal
      const fontGrid = document.getElementById('fontGrid');
      DAFTAR_FONT.forEach(f => {
        const div = document.createElement('div');
        div.className = 'fc' + (f.id === 'patrick' ? ' active' : '');
        div.innerHTML = `<div class="prev" style="font-family:'${f.keluarga}',cursive">Halo</div><div class="fn">${f.nama}</div>`;
        div.onclick = () => { Status.keluargaFont = f.keluarga; Status.fontKustom = null; document.querySelectorAll('.fc').forEach(c => c.classList.remove('active')); div.classList.add('active'); jadwalkanGambarUlang(); };
        fontGrid.appendChild(div);
      });

      // 2. Render Kertas Lokal
      const wadahKertas = document.getElementById('wadahKertasLokal');
      DAFTAR_KERTAS_LOKAL.forEach(kertas => {
        const div = document.createElement('div');
        div.className = 'fc';
        div.innerHTML = `<div style="font-size:12px; font-weight:bold; padding: 5px;">${kertas.nama}</div>`;
        div.onclick = () => {
          document.querySelectorAll('#wadahKertasLokal .fc').forEach(c => c.classList.remove('active'));
          div.classList.add('active');
          const gambarBaru = new Image();
          gambarBaru.onload = function () {
            Status.gambarKertas = gambarBaru;
            document.getElementById('inputLebar').value = gambarBaru.width;
            document.getElementById('inputTinggi').value = gambarBaru.height;
            bangunUlangKanvas();
            document.getElementById('btnMulaiKalibrasi').disabled = false;
          };
          gambarBaru.src = kertas.path;
        };
        wadahKertas.appendChild(div);
      });

      // 3. Render Warna
      const colorRow = document.getElementById('colorRow');
      TINTA_PRESET.forEach((t, i) => {
        const div = document.createElement('div');
        div.className = 'cdot' + (i === 0 ? ' active' : '');
        div.style.background = t.hex;
        div.title = t.label;
        div.onclick = () => { setWarna(t.hex, div); };
        colorRow.appendChild(div);
      });

      const inputCustom = document.createElement('input');
      inputCustom.type = 'color';
      inputCustom.className = 'cdot cpicker';
      inputCustom.title = "Pilih Warna Sendiri";
      inputCustom.oninput = (e) => { setWarna(e.target.value, inputCustom); };
      colorRow.appendChild(inputCustom);
    }

    function setWarna(kodeHex, elemenTarget) {
      Status.hexTinta = kodeHex;
      document.querySelectorAll('.cdot').forEach(d => d.classList.remove('active'));
      elemenTarget.classList.add('active');
      jadwalkanGambarUlang();
    }

    function sinkronInput(idSumber, idTarget) {
      document.getElementById(idTarget).value = document.getElementById(idSumber).value;
      jadwalkanGambarUlang();
    }

    async function prosesUnggahFont(e) {
      const file = e.target.files[0]; if (!file) return;
      const bufferArray = await file.arrayBuffer();
      const namaUnik = 'FontKustom_' + Date.now();
      try {
        const fontBaru = new FontFace(namaUnik, bufferArray);
        await fontBaru.load();
        document.fonts.add(fontBaru);
        Status.fontKustom = namaUnik;
        document.querySelectorAll('.fc').forEach(c => c.classList.remove('active'));
        document.getElementById('labelFontKustom').style.display = 'block';
        document.getElementById('labelFontKustom').textContent = '✅ ' + file.name;
        jadwalkanGambarUlang();
      } catch (error) { alert('Gagal memuat font.'); }
    }

    function terapkanPreset() {
      const [l, t] = document.getElementById('pilihanPreset').value.split('x').map(Number);
      document.getElementById('inputLebar').value = l;
      document.getElementById('inputTinggi').value = t;
      bangunUlangKanvas();
    }

    // --- RENDERING KANVAS ---
    function bangunUlangKanvas() {
      const skala = parseInt(document.getElementById('angkaSkala').value) || 2;
      const lebar = parseInt(document.getElementById('inputLebar').value) || 300;
      const tinggi = parseInt(document.getElementById('inputTinggi').value) || 447;

      elemenKanvas.width = lebar * skala;
      elemenKanvas.height = tinggi * skala;

      // document.getElementById('hdrInfo').textContent = `${lebar}×${tinggi} · ${skala}×`;
      jadwalkanGambarUlang();
    }

    function jadwalkanGambarUlang() {
      if (animasiFrame) cancelAnimationFrame(animasiFrame);
      animasiFrame = requestAnimationFrame(eksekusiGambar);
    }

    function eksekusiGambar() {
      const skalaTeks = parseInt(document.getElementById('angkaSkala').value) || 2;
      konteks.clearRect(0, 0, elemenKanvas.width, elemenKanvas.height);

      if (Status.gambarKertas) {
        // --- MIRRORING KERTAS ---
        if (Status.cerminKertas) {
          konteks.save();
          konteks.scale(-1, 1);
          konteks.drawImage(Status.gambarKertas, -elemenKanvas.width, 0, elemenKanvas.width, elemenKanvas.height);
          konteks.restore();
        } else {
          konteks.drawImage(Status.gambarKertas, 0, 0, elemenKanvas.width, elemenKanvas.height);
        }
      } else {
        konteks.fillStyle = '#fdf6e3';
        konteks.fillRect(0, 0, elemenKanvas.width, elemenKanvas.height);
        konteks.strokeStyle = `rgba(170,195,230,0.55)`;
        konteks.lineWidth = skalaTeks * 0.7;
        for (let y = 58 * skalaTeks; y < elemenKanvas.height; y += 32 * skalaTeks) {
          konteks.beginPath(); konteks.moveTo(0, y); konteks.lineTo(elemenKanvas.width, y); konteks.stroke();
        }
      }

      if (Status.modeAplikasi === 'tulis') {
        renderZona('headerKiri', document.getElementById('inputHeaderKiri').value, skalaTeks);
        renderZona('headerKanan', document.getElementById('inputHeaderKanan').value, skalaTeks);
        renderZona('konten', document.getElementById('inputKonten').value, skalaTeks);
      } else if (Status.modeAplikasi === 'kalibrasi') {
        renderGarisKalibrasi();
      }
    }

    function renderZona(namaZona, teksInput, Skala) {
      if (!teksInput) return;

      const konfigurasi = Status.kalibrasi[namaZona];
      const fontAktif = Status.fontKustom || Status.keluargaFont;

      // --- LOGIKA DINAMIS: PILIH ID INPUT BERDASARKAN NAMA ZONA ---
      let idInputY = "";
      if (namaZona === 'headerKiri') {
        idInputY = 'angkaY_Kiri';
      } else if (namaZona === 'headerKanan') {
        idInputY = 'angkaY_Kanan';
      } else {
        idInputY = 'angkaY_Konten';
      }

      // Sekarang geserManualY akan membaca ID yang benar sesuai zonanya
      const geserManualY = (parseInt(document.getElementById(idInputY).value) || 0) * Skala;

      // Ukuran font dan spasi biasanya global, jadi ini tetap sama
      const ukuranFontInput = (parseInt(document.getElementById('angkaUkuranFont').value) || 20) * Skala;
      const koreksiSpasi = (parseFloat(document.getElementById('angkaSpasi').value) || 0) * Skala;
      const jumlahCoretanInput = parseInt(document.getElementById('angkaJumlahCoretan').value) || 1;
      const opasitasTinta = parseFloat(document.getElementById('angkaOpasitas').value) || 0.85;

      // Jarak baris tetap menggunakan konfigurasi zona masing-masing
      const jarakBaris = (konfigurasi.yKedua - konfigurasi.awalY) + koreksiSpasi;

      const hex = Status.hexTinta;
      const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);

      konteks.font = `${ukuranFontInput}px '${fontAktif}', cursive`;
      konteks.fillStyle = `rgba(${r}, ${g}, ${b}, ${opasitasTinta})`;

      // PENTING: Ubah Baseline ke MIDDLE agar perhitungan garis coretan lebih mudah
      konteks.textBaseline = 'middle';

      // Ambil input sumbu Y dan margin kiri dari hasil kalibrasi
      let posisiY = konfigurasi.awalY + geserManualY;
      const batasLebar = konfigurasi.batasKanan - konfigurasi.marginKiri;
      const koordinatXDasar = konfigurasi.marginKiri;

      // 1. Pecah teks input menjadi paragraf-paragraf (berdasarkan Enter)
      const daftarParagraf = teksInput.split('\n');

      daftarParagraf.forEach(paragraf => {
        if (!paragraf.trim() && paragraf.length === 0) { posisiY += jarakBaris; return; }

        // 2. Terapkan Preservasi Indentasi (Regex Spasi Awal)
        const kecocokanSpasiAwal = paragraf.match(/^\s*/);
        const spasiAwal = kecocokanSpasiAwal ? kecocokanSpasiAwal[0] : "";

        // KUNCI: Buat salinan spasi yang bisa dimanipulasi/dikosongkan
        let spasiAktif = spasiAwal;

        const kataKataRaw = paragraf.trimStart().split(' ');

        let barisSaatIni = [];
        // Hitung lebar awal menggunakan spasiAktif
        let lebarBarisSaatIni = konteks.measureText(spasiAktif).width;

        let modeCoretAktif = false;

        kataKataRaw.forEach((kataRaw, index) => {
          let teksKataMurni = kataRaw;

          // A. Jika kata berawalan ~~, nyalakan mode coret dan buang tanda ~~ nya
          if (teksKataMurni.startsWith('~~')) {
            modeCoretAktif = true;
            teksKataMurni = teksKataMurni.substring(2);
          }

          // B. Rekam status coret untuk kata ini SEBELUM dicek penutupnya
          // (Agar jika kata berakhiran ~~, kata itu sendiri tetap dicoret)
          let harusDicoretKataIni = modeCoretAktif;

          // C. Jika kata berakhiran ~~, buang tanda ~~ nya dan MATIKAN mode coret
          if (teksKataMurni.endsWith('~~')) {
            teksKataMurni = teksKataMurni.slice(0, -2);
            modeCoretAktif = false; // Kata berikutnya tidak akan dicoret
          }

          // Hitung lebar kata ini (tambah spasi jika bukan kata pertama)
          const teksDenganSpasi = (index === 0 && spasiAwal === "") ? teksKataMurni : ' ' + teksKataMurni;
          const lebarKataIni = konteks.measureText(teksDenganSpasi).width;

          // --- LOGIKA WORD-WRAP (TURUN BARIS) ---
          if (lebarBarisSaatIni + lebarKataIni > batasLebar && barisSaatIni.length > 0) {
            gambarSatuBarisTeks(konteks, barisSaatIni, koordinatXDasar, posisiY, spasiAktif, Skala, ukuranFontInput, jumlahCoretanInput);
            posisiY += jarakBaris;
            barisSaatIni = [];
            lebarBarisSaatIni = 0;
            spasiAktif = "";
          }

          // Tambahkan kata ke baris aktif dengan status coret yang baru
          barisSaatIni.push({ teks: teksKataMurni, lebar: lebarKataIni, coret: harusDicoretKataIni });
          lebarBarisSaatIni += lebarKataIni;
        });

        // 4. Gambar sisa kata di paragraf (baris terakhir paragraf)
        if (barisSaatIni.length > 0) {
          // Pastikan menggunakan spasiAktif di sini juga
          gambarSatuBarisTeks(konteks, barisSaatIni, koordinatXDasar, posisiY, spasiAktif, Skala, ukuranFontInput, jumlahCoretanInput);
          posisiY += jarakBaris;
        }
      });
    }

    // ── FUNGSI PEMBANTU BARU (UNTUK MENGGAMBAR PER BARIS) ──
    function gambarSatuBarisTeks(ctx, objekBaris, xAwal, yBase, spasiAwal, Skala, fontSize, jumlahCoretan = 1) {
      let xAktif = xAwal + ctx.measureText(spasiAwal).width;

      // Memori untuk menyimpan koordinat X awal dan akhir dari segmen coretan bersambung
      let segmenCoretan = [];
      let sedangMencoret = false;
      let startX = 0;
      let endX = 0;

      // --- LOOP 1: GAMBAR TEKS & REKAM KOORDINAT SEGMEN CORETAN ---
      objekBaris.forEach((kata, index) => {
        const teksPrefix = (index === 0 && xAwal === xAktif) ? '' : ' ';
        const teksLengkap = teksPrefix + kata.teks;
        const lebarKarakterSpasi = ctx.measureText(' ').width;

        // Gambar Jitter (Realisme Tangan Manusia) untuk teks
        const jitterY = (Math.random() - 0.5) * (3 * Skala);
        const yCetak = yBase + jitterY;

        ctx.fillText(teksLengkap, xAktif, yCetak);

        // --- PENCATATAN SEGMEN CORETAN BERSAMBUNG ---
        const xMulaiKata = xAktif + (teksPrefix === ' ' ? lebarKarakterSpasi : 0);
        const lebarKataMurni = kata.teks === "" ? 0 : ctx.measureText(kata.teks).width;

        if (kata.coret) {
          if (!sedangMencoret) {
            sedangMencoret = true;
            startX = xMulaiKata; // Buka segmen baru di awal kata ini
          }
          endX = xMulaiKata + lebarKataMurni; // Perpanjang titik akhir segmen
        } else {
          if (sedangMencoret) {
            // Jika kata ini tidak dicoret, tutup segmen sebelumnya dan simpan ke memori
            segmenCoretan.push({ startX: startX, endX: endX });
            sedangMencoret = false;
          }
        }

        // Majukan X aktif untuk kata berikutnya
        xAktif += kata.lebar;
      });

      // Jika baris habis tapi status coretan masih menyala, tutup segmennya
      if (sedangMencoret) {
        segmenCoretan.push({ startX: startX, endX: endX });
      }

      // --- LOOP 2: GAMBAR GARIS CORETAN SECARA BERSAMBUNG ---
      segmenCoretan.forEach(segmen => {
        ctx.strokeStyle = ctx.fillStyle;
        const tebalDasar = fontSize * 0.1;
        const acakTebal = (Math.random() - 0.5) * (Skala * 0.5);
        ctx.lineWidth = Math.max(0.5, tebalDasar + acakTebal);

        for (let c = 0; c < jumlahCoretan; c++) {
          ctx.beginPath();

          const offsetY = (c * Skala * 2) - ((jumlahCoretan - 1) * Skala);

          // 1. Existing Y jitter logic (Vertikal)
          const jitterStart_Y = (Math.random() - 0.5) * (4 * Skala) + offsetY;
          const jitterAkhir_Y = (Math.random() - 0.5) * (4 * Skala) + offsetY;

          // 2. LOGIKA BARU: JITTER HORIZONTAL (X-Axis Overhang)
          // Kita beri batas ketidaksempurnaan X, misal sekitar 20 piksel dikali Skala
          const batasKetidaksempurnaanX = 20 * Skala;

          // (Math.random() - 0.5) akan menghasilkan angka acak antara -0.5 sampai +0.5
          // Jika negatif, koordinat X akan berkurang (maju ke kiri). Jika positif, bertambah (mundur ke kanan).
          const jitterStart_X = (Math.random() - 0.5) * batasKetidaksempurnaanX;
          const jitterAkhir_X = (Math.random() - 0.5) * batasKetidaksempurnaanX;

          // 3. Terapkan koordinat X dan Y yang sudah di-jitter secara acak
          ctx.moveTo(segmen.startX + jitterStart_X, yBase + jitterStart_Y);
          ctx.lineTo(segmen.endX + jitterAkhir_X, yBase + jitterAkhir_Y);

          ctx.stroke();
        }
      });
    }

    // --- MESIN WIZARD KALIBRASI ---
    function prosesUnggahKertas(e) {
      const file = e.target.files[0]; if (!file) return;
      const pembaca = new FileReader();
      pembaca.onload = function (event) {
        const gambar = new Image();
        gambar.onload = function () {
          Status.gambarKertas = gambar;
          // Hapus pilihan kertas lokal jika pengguna upload custom
          document.querySelectorAll('#wadahKertasLokal .fc').forEach(c => c.classList.remove('active'));

          // --- LOGIKA BARU: AUTO DOWNSCALE (PEMBATAS RESOLUSI) ---
          const BATAS_LEBAR_MAKSIMAL = 960; // Lebar standar yang aman untuk performa dan kalibrasi
          let lebarAkhir = gambar.width;
          let tinggiAkhir = gambar.height;

          // Jika gambar terlalu raksasa, kecilkan secara proporsional
          if (gambar.width > BATAS_LEBAR_MAKSIMAL) {
            const rasio = gambar.width / gambar.height;
            lebarAkhir = BATAS_LEBAR_MAKSIMAL;
            tinggiAkhir = Math.round(BATAS_LEBAR_MAKSIMAL / rasio);
          }

          document.getElementById('inputLebar').value = lebarAkhir;
          document.getElementById('inputTinggi').value = tinggiAkhir;

          bangunUlangKanvas();
          document.getElementById('btnMulaiKalibrasi').disabled = false;
        }
        gambar.src = event.target.result;
      }
      pembaca.readAsDataURL(file);
    }

    function toggleCerminKertas(e) {
      Status.cerminKertas = e.target.checked;
      jadwalkanGambarUlang(); // Gambar ulang kanvas saat dicentang
    }

    function mulaiModeKalibrasi() {
      Status.modeAplikasi = 'kalibrasi';
      elemenKanvas.classList.add('mode-ukur');

      // Tampilkan panel selesai, sembunyikan tombol mulai
      document.getElementById('panelNavKalibrasi').style.display = 'block';
      document.getElementById('btnMulaiKalibrasi').style.display = 'none';

      jadwalkanGambarUlang();
    }

    function selesaiKalibrasi() {
      Status.modeAplikasi = 'tulis';
      elemenKanvas.classList.remove('mode-ukur');

      // Sembunyikan panel selesai, munculkan kembali tombol mulai
      document.getElementById('panelNavKalibrasi').style.display = 'none';
      document.getElementById('btnMulaiKalibrasi').style.display = 'flex';

      jadwalkanGambarUlang();
    }

    // ── MESIN INTERAKSI MOUSE (TOTAL OVERHAUL) ──

    // 1. MOUSE DOWN (Mulai Dragging)
    elemenKanvas.addEventListener('mousedown', function (kejadian) {
      if (Status.modeAplikasi !== 'kalibrasi') return;

      const pos = dapatkanPosisiCanvas(kejadian);
      const dataHit = hitTest(pos.x, pos.y);

      if (dataHit) {
        // Jika mouse menekan handle atau garis
        Interaksi.lineDragging = dataHit.propId;
        Interaksi.initialMousePos = (dataHit.tipe === 'X') ? pos.x : pos.y;
        Interaksi.initialLinePos = dapatkanNilaiKalibrasi(dataHit.propId);
      }
    });

    // 2. MOUSE MOVE (Proses Dragging & Hover Feedback)
    elemenKanvas.addEventListener('mousemove', function (kejadian) {
      if (Status.modeAplikasi !== 'kalibrasi') {
        elemenKanvas.classList.remove('can-drag', 'can-drag-v');
        Interaksi.hoverLine = null;
        Interaksi.activeHandle = null;
        return;
      }

      const pos = dapatkanPosisiCanvas(kejadian);

      if (Interaksi.lineDragging) {
        // --- LOGIKA DRAGGING AKTIF ---
        const propId = Interaksi.lineDragging;
        const tipe = Interaksi.initialLinePos.tipe;

        let nilaiBaru;
        if (tipe === 'X') {
          nilaiBaru = pos.x;
        } else {
          nilaiBaru = pos.y;
        }

        // Terapkan nilai baru ke Status.kalibrasi
        pembaruanNilaiKalibrasi(propId, nilaiBaru);
        jadwalkanGambarUlang();

      } else {
        // --- LOGIKA HOVER (UMPAN BALIK VISUAL) ---
        const dataHit = hitTest(pos.x, pos.y);
        Interaksi.hoverLine = dataHit ? dataHit.propId : null;
        Interaksi.activeHandle = (dataHit && dataHit.nearHandle) ? dataHit.propId : null;

        // Ubah cursor berdasarkan tipe garis yang di-hover
        if (dataHit) {
          if (dataHit.tipe === 'X') {
            elemenKanvas.classList.remove('can-drag');
            elemenKanvas.classList.add('can-drag-v');
          } else {
            elemenKanvas.classList.remove('can-drag-v');
            elemenKanvas.classList.add('can-drag');
          }
        } else {
          elemenKanvas.classList.remove('can-drag', 'can-drag-v');
        }

        // Kita perlu gambar ulang untuk meng-update warna highlight pada hover
        jadwalkanGambarUlang();
      }
    });

    // 3. MOUSE UP (Selesai Dragging)
    window.addEventListener('mouseup', function () {
      if (Status.modeAplikasi !== 'kalibrasi') return;
      Interaksi.lineDragging = null; // Lepas kuncian drag
    });


    // ── FUNGSI PEMBANTU INTERAKSI ──

    // Mengonversi koordinat layar mouse menjadi koordinat internal Canvas (Piksel Asli)
    function dapatkanPosisiCanvas(e) {
      const batasKanvas = elemenKanvas.getBoundingClientRect();
      const rasioX = elemenKanvas.width / batasKanvas.width;
      const rasioY = elemenKanvas.height / batasKanvas.height;
      return {
        x: (e.clientX - batasKanvas.left) * rasioX,
        y: (e.clientY - batasKanvas.top) * rasioY,
        rasioX: rasioX,
        rasioY: rasioY
      };
    }

    // Mendeteksi apakah mouse berada di atas garis atau handle (Hit-Testing)
    function hitTest(canvasX, canvasY) {
      // Ambil rasio CSS aktual untuk akurasi hit-test handle
      const batasKanvas = elemenKanvas.getBoundingClientRect();
      const rasioY = elemenKanvas.height / batasKanvas.height;

      // Batas toleransi klik garis (sekitar 15 piksel CSS)
      const toleransiScreenY = 15;
      const toleransiCanvasY = toleransiScreenY * rasioY;

      // Ukuran handle aktual dalam koordinat Canvas
      const handleSizeCanvas = HANDLE_SIZE_SCREEN * rasioY;

      // Iterasi ke-3 zona kalibrasi (headerKiri, headerKanan, konten)
      for (const zonaKey in Status.kalibrasi) {
        const zona = Status.kalibrasi[zonaKey];

        // Cek Properti Vertikal (Tipe X: marginKiri, batasKanan)
        const vProps = ['marginKiri', 'batasKanan'];
        for (const prop of vProps) {
          const xVal = zona[prop];
          const yMid = elemenKanvas.height / 2; // Handle ada di tengah tinggi kanvas

          if (canvasX > xVal - toleransiCanvasY && canvasX < xVal + toleransiCanvasY) {
            // Mouse di atas garis vertikal, cek apakah dekat handle di tengah
            const nearHandle = (canvasY > yMid - handleSizeCanvas && canvasY < yMid + handleSizeCanvas);
            return { propId: `${zonaKey}_${prop}`, tipe: 'X', nearHandle: nearHandle };
          }
        }

        // Cek Properti Horizontal (Tipe Y: awalY, yKedua)
        const hProps = ['awalY', 'yKedua'];
        for (const prop of hProps) {
          const yVal = zona[prop];
          const xMid = elemenKanvas.width / 2; // Handle ada di tengah lebar kanvas

          if (canvasY > yVal - toleransiCanvasY && canvasY < yVal + toleransiCanvasY) {
            // Mouse di atas garis horizontal, cek apakah dekat handle di tengah
            const nearHandle = (canvasX > xMid - handleSizeCanvas && canvasX < xMid + handleSizeCanvas);
            return { propId: `${zonaKey}_${prop}`, tipe: 'Y', nearHandle: nearHandle };
          }
        }
      }
      return null;
    }

    // Mengambil nilai aktual (piksel) dari Status.kalibrasi berdasarkan ID string
    function dapatkanNilaiKalibrasi(propId) {
      const [zonaKey, propKey] = propId.split('_');
      const tipe = (propKey === 'marginKiri' || propKey === 'batasKanan') ? 'X' : 'Y';
      return { nilai: Status.kalibrasi[zonaKey][propKey], tipe: tipe };
    }

    // Meng-update nilai Status.kalibrasi berdasarkan ID string
    function pembaruanNilaiKalibrasi(propId, nilaiBaru) {
      const [zonaKey, propKey] = propId.split('_');
      Status.kalibrasi[zonaKey][propKey] = nilaiBaru;
    }

    // ── FUNGSI RENDERING GARIS INTERAKTIF (MODERN UI) ──
    function renderGarisKalibrasi() {
      const batasKanvas = elemenKanvas.getBoundingClientRect();
      const rasioX = elemenKanvas.width / batasKanvas.width;
      const rasioY = elemenKanvas.height / batasKanvas.height;

      const warnaZona = {
        headerKiri: '#ff4c4c', // Merah
        headerKanan: '#4cde4c', // Hijau
        konten: '#50b4ff'      // Biru
      };

      // FUNGSI PEMBANTU: Melukis elemen UI modern di dalam Canvas
      function gambarHandleModern(x, y, tipe, label, warna, isActive) {
        konteks.save();

        // 1. Gambar Garis Transparan & Glow
        konteks.beginPath();
        konteks.strokeStyle = isActive ? '#fff' : warna;
        konteks.lineWidth = isActive ? 2 * rasioX : 1.5 * rasioX;
        konteks.globalAlpha = isActive ? 1.0 : 0.6; // Garis agak transparan jika tidak disentuh

        if (tipe === 'X') {
          konteks.moveTo(x, 0); konteks.lineTo(x, elemenKanvas.height);
        } else {
          konteks.moveTo(0, y); konteks.lineTo(elemenKanvas.width, y);
        }

        if (isActive) {
          konteks.shadowColor = warna;
          konteks.shadowBlur = 10 * rasioX;
        }
        konteks.stroke();

        // Reset Alpha & Shadow
        konteks.globalAlpha = 1.0;
        konteks.shadowBlur = 0;

        // Dimensi Kapsul (Pill)
        const w = (tipe === 'X') ? 16 * rasioX : 36 * rasioX;
        const h = (tipe === 'X') ? 36 * rasioY : 16 * rasioY;
        const radius = 8 * Math.min(rasioX, rasioY);

        // 2. Gambar Bayangan (Drop Shadow) Kapsul
        konteks.shadowColor = 'rgba(0, 0, 0, 0.4)';
        konteks.shadowBlur = 8 * Math.min(rasioX, rasioY);
        konteks.shadowOffsetY = 3 * rasioY;

        // 3. Gambar Bentuk Kapsul Utama
        konteks.fillStyle = isActive ? '#ffffff' : '#f0f4ff';
        konteks.beginPath();
        // Fallback roundRect jika browser agak lawas
        if (konteks.roundRect) {
          konteks.roundRect(x - w / 2, y - h / 2, w, h, radius);
        } else {
          konteks.rect(x - w / 2, y - h / 2, w, h); // Fallback kotak biasa
        }
        konteks.fill();

        // Matikan bayangan untuk elemen di atasnya
        konteks.shadowColor = 'transparent';

        // 4. Gambar Titik-titik Grip (Di dalam kapsul)
        konteks.fillStyle = isActive ? '#000' : warna;
        const dotR = 1.5 * Math.min(rasioX, rasioY);

        if (tipe === 'X') {
          // Grip Vertikal (2 kolom, 3 baris)
          const dx = 3 * rasioX; const dy = 6 * rasioY;
          [-1, 1].forEach(cx => {
            [-1, 0, 1].forEach(cy => {
              konteks.beginPath(); konteks.arc(x + cx * dx, y + cy * dy, dotR, 0, Math.PI * 2); konteks.fill();
            });
          });
        } else {
          // Grip Horizontal (3 kolom, 2 baris)
          const dx = 6 * rasioX; const dy = 3 * rasioY;
          [-1, 0, 1].forEach(cx => {
            [-1, 1].forEach(cy => {
              konteks.beginPath(); konteks.arc(x + cx * dx, y + cy * dy, dotR, 0, Math.PI * 2); konteks.fill();
            });
          });
        }

        // 5. Gambar Tooltip Label yang Elegan
        konteks.font = `bold ${10 * rasioY}px sans-serif`;
        const textW = konteks.measureText(label).width;
        const padX = 6 * rasioX; const padY = 4 * rasioY;

        let tagX, tagY;
        if (tipe === 'X') {
          tagX = x + w / 2 + (8 * rasioX);
          tagY = y - (8 * rasioY);
        } else {
          tagX = x + (12 * rasioX);
          tagY = y - h / 2 - (20 * rasioY);
        }

        // Background Tooltip
        konteks.fillStyle = warna;
        konteks.beginPath();
        if (konteks.roundRect) {
          konteks.roundRect(tagX, tagY, textW + (padX * 2), (10 * rasioY) + (padY * 2), 3 * rasioY);
        } else {
          konteks.fillRect(tagX, tagY, textW + (padX * 2), (10 * rasioY) + (padY * 2));
        }
        konteks.fill();

        // Teks Tooltip
        konteks.fillStyle = '#111'; // Kontras tinggi
        konteks.textAlign = 'left';
        konteks.textBaseline = 'top';
        konteks.fillText(label, tagX + padX, tagY + padY);

        konteks.restore();
      }

      // -- EKSEKUSI PEMANGGILAN UNTUK SEMUA GARIS --
      for (const zonaKey in Status.kalibrasi) {
        const zona = Status.kalibrasi[zonaKey];
        const warnaBase = warnaZona[zonaKey];

        // Garis Vertikal (Kiri/Kanan)
        ['marginKiri', 'batasKanan'].forEach(prop => {
          const xVal = zona[prop];
          if (xVal == null) return;
          const propId = `${zonaKey}_${prop}`;
          const isActive = (Interaksi.hoverLine === propId || Interaksi.lineDragging === propId);
          const label = prop === 'marginKiri' ? 'Batas Kiri' : 'Batas Kanan';

          gambarHandleModern(xVal, elemenKanvas.height / 2, 'X', label, warnaBase, isActive);
        });

        // Garis Horizontal (Atas/Bawah)
        ['awalY', 'yKedua'].forEach(prop => {
          const yVal = zona[prop];
          if (yVal == null) return;
          const propId = `${zonaKey}_${prop}`;
          const isActive = (Interaksi.hoverLine === propId || Interaksi.lineDragging === propId);
          const label = prop === 'awalY' ? 'Garis 1 (Atas)' : 'Garis 2 (Bawah)';

          // Agar handle tidak bertumpuk, geser posisi handle X sedikit berdasarkan zona
          let xOffset = elemenKanvas.width / 2;
          if (zonaKey === 'headerKiri') xOffset = elemenKanvas.width * 0.2;
          if (zonaKey === 'headerKanan') xOffset = elemenKanvas.width * 0.8;

          gambarHandleModern(xOffset, yVal, 'Y', label, warnaBase, isActive);
        });
      }
    }

    // --- BINDING EVENT INPUT & TAB ---
    ['inputHeaderKiri', 'inputHeaderKanan', 'inputKonten'].forEach(id => {
      document.getElementById(id).addEventListener('input', jadwalkanGambarUlang);
      document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          document.execCommand('insertText', false, '    ');
          jadwalkanGambarUlang();
        }
      });
    });

    let batchUnduh = 1;

    function unduhGambar() {
      if (Status.modeAplikasi !== 'tulis') {
        alert("Selesaikan kalibrasi terlebih dahulu!"); return;
      }
      if (!Status.gambarKertas) {
        alert("Pilih atau unggah kertas terlebih dahulu."); return;
      }
      const tautan = document.createElement('a');
      const now = new Date();
      const tgl = String(now.getDate()).padStart(2, '0');
      const bln = String(now.getMonth() + 1).padStart(2, '0');
      const thn = now.getFullYear();
      const numBatch = String(batchUnduh).padStart(2, '0');
      tautan.download = `NulisOnline_${tgl}${bln}${thn}_${numBatch}.png`;
      tautan.href = elemenKanvas.toDataURL('image/png');
      tautan.click();
      batchUnduh++;
    }

    function tampilkanWelcome() {
      if (!localStorage.getItem('sudahDisapa')) {
        const toast = document.getElementById('toastWelcome');

        setTimeout(() => {
          toast.classList.add('muncul');

          setTimeout(() => {
            toast.classList.remove('muncul');
          }, 4000);

        }, 1000);

        localStorage.setItem('sudahDisapa', 'ya');
      }
    }

    window.onload = () => {
      inisialisasiUI();
      document.fonts.ready.then(() => bangunUlangKanvas());
      tampilkanWelcome(); // Panggil fungsinya di sini
      bukaModal(); // Otomatis buka pop-up panduan & FAQ
    };

    // ── LOGIKA MODAL BANTUAN ──
    function bukaModal() {
      document.getElementById('modalBantuan').style.display = 'flex';
    }

    function tutupModal() {
      document.getElementById('modalBantuan').style.display = 'none';
    }

    // Menutup modal jika pengguna mengklik area gelap di luar kotak modal
    function tutupModalLuar(event) {
      const overlay = document.getElementById('modalBantuan');
      if (event.target === overlay) {
        tutupModal();
      }
    }

    // ── LOGIKA ZOOM PREVIEW ──
    let tingkatZoom = 1.0;
    let lebarVisualDasar = 0; // Variabel baru untuk merekam ukuran tampilan di layar

    function ubahZoom(delta, reset = false) {
      // 1. Tangkap ukuran visual aktual saat kanvas berada di posisi 100%
      if (tingkatZoom === 1.0 || reset) {
        // Pastikan kanvas dalam mode responsif bawaan CSS sebelum diukur
        elemenKanvas.style.maxWidth = '100%';
        elemenKanvas.style.maxHeight = '85vh';
        elemenKanvas.style.width = 'auto';
        elemenKanvas.style.height = 'auto';

        // Merekam ukuran piksel fisik yang sedang ditampilkan di monitor Anda
        lebarVisualDasar = elemenKanvas.clientWidth;
      }

      // 2. Kalkulasi multiplier zoom
      if (reset) {
        tingkatZoom = 1.0;
      } else {
        tingkatZoom += delta;
        if (tingkatZoom < 0.5) tingkatZoom = 0.5; // Batas minimal 50%
        if (tingkatZoom > 4.0) tingkatZoom = 4.0; // Batas maksimal 400%
      }

      document.getElementById('labelZoom').textContent = Math.round(tingkatZoom * 100) + '%';

      // 3. Terapkan perubahan dimensi
      if (tingkatZoom === 1.0) {
        // Kunci kembali ke batas layar (Responsif)
        elemenKanvas.style.maxWidth = '100%';
        elemenKanvas.style.maxHeight = '85vh';
        elemenKanvas.style.width = 'auto';
        elemenKanvas.style.height = 'auto';
      } else {
        // Lepaskan batas layar, biarkan meluap agar bisa di-scroll
        elemenKanvas.style.maxWidth = 'none';
        elemenKanvas.style.maxHeight = 'none';

        // Gunakan ukuran layar awal dikali rasio zoom
        elemenKanvas.style.width = (lebarVisualDasar * tingkatZoom) + 'px';
        elemenKanvas.style.height = 'auto'; // Tinggi otomatis proporsional
      }
    }
