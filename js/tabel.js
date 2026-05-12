/* ============================================================================
  MESIN TABEL TULISAN TANGAN — NulisOnline
  File ini berisi 5 engine inti untuk fitur rendering tabel Markdown:
    Engine 1  : Parser Sintaks Markdown
    Engine 1.5: Pemecah String Sel (Cell String Splitter) — sintaks ;;
    Engine 2  : Algoritma Pra-Pengukuran (Pre-Measurement)
    Engine 3  : Cell-Bound Word Wrap
    Engine 4  : Pelukis Grid Bergetar (Jittery Grid Drawer)
============================================================================ */

/* ============================================================================
  KONSTANTA TABEL
============================================================================ */
const TABEL_PADDING_X_FAKTOR = 8;  // Akan dikalikan Skala
const TABEL_PADDING_Y_FAKTOR = 4;  // Akan dikalikan Skala
const TABEL_MIN_LEBAR_KOLOM_FAKTOR = 40; // Akan dikalikan Skala

/* ============================================================================
  ENGINE 1: PARSER SINTAKS MARKDOWN
  Mengubah baris-baris teks berpola | ... | menjadi Array 2D.
============================================================================ */

/**
 * Mendeteksi apakah sebuah baris teks adalah baris tabel.
 * Syarat: setelah di-trim, dimulai dengan '|'.
 * @param {string} baris
 * @returns {boolean}
 */
function adalahBarisTabel(baris) {
  const trimmed = baris.trim();
  return trimmed.length > 0 && trimmed.charAt(0) === '|';
}

/**
 * Mendeteksi apakah baris adalah separator markdown (|---|---|)
 * @param {string} baris
 * @returns {boolean}
 */
function adalahSeparatorTabel(baris) {
  const trimmed = baris.trim();
  // Hapus semua |, spasi, -, :, = → jika kosong berarti separator
  const sisa = trimmed.replace(/[\|\s\-\:\=]/g, '');
  return sisa.length === 0 && trimmed.includes('-');
}

/**
 * Mengekstrak blok baris tabel, lalu parse menjadi DataTabel.
 * @param {string[]} kumpulanBaris - Baris-baris tabel mentah
 * @returns {{data: string[][], jumlahKolom: number, jumlahBaris: number}}
 */
function parseTabelMarkdown(kumpulanBaris) {
  const data = [];
  let jumlahKolomMaks = 0;

  for (let i = 0; i < kumpulanBaris.length; i++) {
    const baris = kumpulanBaris[i].trim();

    // Skip baris separator (|---|---|)
    if (adalahSeparatorTabel(baris)) continue;

    // Buang '|' di awal dan akhir
    let isi = baris;
    if (isi.startsWith('|')) isi = isi.substring(1);
    if (isi.endsWith('|')) isi = isi.slice(0, -1);

    // Split berdasarkan '|' dan trim setiap sel
    const selArray = isi.split('|').map(s => s.trim());
    data.push(selArray);

    if (selArray.length > jumlahKolomMaks) {
      jumlahKolomMaks = selArray.length;
    }
  }

  // Normalisasi: pad baris yang kolomnya kurang
  for (let i = 0; i < data.length; i++) {
    while (data[i].length < jumlahKolomMaks) {
      data[i].push('');
    }
  }

  return {
    data: data,
    jumlahKolom: jumlahKolomMaks,
    jumlahBaris: data.length
  };
}

/* ============================================================================
  ENGINE 3: CELL-BOUND WORD WRAP
  Memecah teks per sel berdasarkan lebar kolom, bukan margin kertas.
  (Ditempatkan sebelum Engine 2 karena Engine 2 membutuhkannya)
============================================================================ */

/**
 * Memecah teks menjadi baris-baris yang muat dalam lebar tertentu.
 * Versi ringan dari word-wrap existing, tanpa strikethrough/indentasi.
 * @param {string} teks - Isi sel mentah
 * @param {number} lebarMaksimal - Lebar area teks dalam sel (piksel)
 * @param {CanvasRenderingContext2D} ctx - Untuk measureText
 * @returns {string[]}
 */
function wrapTeksDalamSel(teks, lebarMaksimal, ctx) {
  if (!teks || teks.trim().length === 0) return [''];
  if (lebarMaksimal <= 0) return [teks];

  // Dual arrays: kataAsli preserves ~~ markers, kataBersih for measurement
  const kataAsli = teks.trim().split(/\s+/);
  const kataBersih = kataAsli.map(k => k.replace(/~~/g, ''));
  const hasil = [];
  let barisSaatIni = '';      // Output line (preserves ~~)
  let barisBersih = '';       // Shadow line for measurement (no ~~)

  for (let i = 0; i < kataAsli.length; i++) {
    const asli = kataAsli[i];
    const bersih = kataBersih[i];

    const tesBersih = barisBersih.length > 0 ? barisBersih + ' ' + bersih : bersih;
    const tesAsli = barisSaatIni.length > 0 ? barisSaatIni + ' ' + asli : asli;
    const lebarTes = ctx.measureText(tesBersih).width;

    if (lebarTes > lebarMaksimal && barisSaatIni.length > 0) {
      // Baris saat ini sudah penuh, simpan dan mulai baru
      hasil.push(barisSaatIni);
      barisSaatIni = '';
      barisBersih = '';

      // Cek apakah kata tunggal melebihi lebar
      const lebarKataSendiri = ctx.measureText(bersih).width;
      if (lebarKataSendiri > lebarMaksimal) {
        // Pecah per karakter (gunakan versi asli agar ~~ di tengah tetap utuh)
        let stringSementara = '';
        for (let j = 0; j < asli.length; j++) {
          const charTes = stringSementara + asli[j];
          // Ukur tanpa ~~ untuk keputusan wrap
          const charTesBersih = charTes.replace(/~~/g, '');
          if (ctx.measureText(charTesBersih).width > lebarMaksimal && stringSementara.length > 0) {
            hasil.push(stringSementara);
            stringSementara = asli[j];
          } else {
            stringSementara = charTes;
          }
        }
        barisSaatIni = stringSementara;
        barisBersih = stringSementara.replace(/~~/g, '');
      } else {
        barisSaatIni = asli;
        barisBersih = bersih;
      }
    } else if (barisSaatIni.length === 0 && ctx.measureText(bersih).width > lebarMaksimal) {
      // Kata pertama di baris sudah melebihi lebar → pecah per karakter
      let stringSementara = '';
      for (let j = 0; j < asli.length; j++) {
        const charTes = stringSementara + asli[j];
        const charTesBersih = charTes.replace(/~~/g, '');
        if (ctx.measureText(charTesBersih).width > lebarMaksimal && stringSementara.length > 0) {
          hasil.push(stringSementara);
          stringSementara = asli[j];
        } else {
          stringSementara = charTes;
        }
      }
      barisSaatIni = stringSementara;
      barisBersih = stringSementara.replace(/~~/g, '');
    } else {
      barisSaatIni = tesAsli;
      barisBersih = tesBersih;
    }
  }

  // Push sisa baris terakhir
  if (barisSaatIni.length > 0) {
    hasil.push(barisSaatIni);
  }

  return hasil.length > 0 ? hasil : [''];
}

/* ============================================================================
  ENGINE 1.5: PEMECAH STRING SEL (CELL STRING SPLITTER)
  Memecah isi sel berdasarkan sintaks ;; terlebih dahulu, lalu menerapkan
  word-wrap pada setiap segmen secara independen.

  HIERARKI PEMROSESAN:
    1. Pecah string berdasarkan ';;'  → Array segmen
    2. Untuk setiap segmen, lakukan word-wrap → Array baris
    3. Gabungkan (flatten) semua baris menjadi satu Array datar

  CONTOH:
    Input:  "Fitur A;;Ini kalimat panjang yang harus di-wrap"
    Split:  ["Fitur A", "Ini kalimat panjang yang harus di-wrap"]
    Wrap:   [["Fitur A"], ["Ini kalimat panjang", "yang harus di-wrap"]]
    Output: ["Fitur A", "Ini kalimat panjang", "yang harus di-wrap"]
============================================================================ */

/**
 * Memecah teks sel berdasarkan ';;' lalu word-wrap setiap segmen.
 * Menghasilkan array datar (flat) dari semua baris yang siap dicetak.
 *
 * @param {string} teks - Isi sel mentah (mungkin mengandung ';;')
 * @param {number} lebarMaksimal - Lebar area teks dalam sel (piksel)
 * @param {CanvasRenderingContext2D} ctx - Untuk measureText
 * @returns {string[]} Array datar berisi baris-baris teks siap cetak
 */
function pecahDanWrapSel(teks, lebarMaksimal, ctx) {
  if (!teks || teks.trim().length === 0) return [''];

  // ── LANGKAH 1: Pecah berdasarkan ';;' ──
  const segmenMentah = teks.split(';;');

  // ── LANGKAH 2 & 3: Wrap setiap segmen, lalu flatten ──
  const hasilAkhir = [];

  for (let i = 0; i < segmenMentah.length; i++) {
    const segmen = segmenMentah[i].trim();

    // Wrap segmen ini secara independen
    const barisWrapped = wrapTeksDalamSel(segmen, lebarMaksimal, ctx);

    // Gabungkan ke array utama (flatten)
    for (let j = 0; j < barisWrapped.length; j++) {
      hasilAkhir.push(barisWrapped[j]);
    }
  }

  return hasilAkhir.length > 0 ? hasilAkhir : [''];
}

/* ============================================================================
  ENGINE 2: ALGORITMA PRA-PENGUKURAN (PRE-MEASUREMENT)
  Menghitung lebar kolom dan tinggi baris sebelum menggambar apapun.
============================================================================ */

/**
 * Menghitung dimensi lengkap tabel sebelum rendering.
 * @param {{data: string[][], jumlahKolom: number, jumlahBaris: number}} dataTabel
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} batasLebarTabel - Lebar maksimal tabel (batasKanan - marginKiri)
 * @param {number} jarakBaris - Tinggi satu baris teks
 * @param {number} Skala - Faktor skala kanvas
 * @param {number} ekstraPadding - Padding vertikal tambahan dari slider (sudah dikali Skala)
 * @returns {{lebarKolom: number[], tinggiPerBaris: number[], barisPerSel: string[][][], totalLebar: number, totalTinggi: number}}
 */
function hitungDimensiTabel(dataTabel, ctx, batasLebarTabel, jarakBaris, Skala, ekstraPadding) {
  const PADDING_X = TABEL_PADDING_X_FAKTOR * Skala;
  const PADDING_Y = TABEL_PADDING_Y_FAKTOR * Skala;
  const MIN_LEBAR = TABEL_MIN_LEBAR_KOLOM_FAKTOR * Skala;

  const { data, jumlahKolom, jumlahBaris } = dataTabel;

  let lebarKolom;

  // ── CEK APAKAH KALIBRASI TABEL AKTIF ──
  if (typeof Status !== 'undefined' && Status.tabel && Status.tabel.aktif && Status.tabel.garisX.length > 0) {
    // Gunakan lebar kolom dari kalibrasi tabel
    const arr = Status.tabel.garisX;
    const jumlahKolomKalibrasi = arr.length - 1; // Jumlah kolom = jumlah garis - 1

    lebarKolom = [];
    for (let c = 0; c < jumlahKolom; c++) {
      if (c < jumlahKolomKalibrasi) {
        // Kolom ini memiliki pasangan garis kalibrasi
        lebarKolom.push(arr[c + 1] - arr[c]);
      } else {
        // Kolom data lebih banyak dari kolom kalibrasi, gunakan minimum
        lebarKolom.push(MIN_LEBAR);
      }
    }
  } else {
    // ── LANGKAH 1: Hitung lebar "ideal" tiap kolom (mode otomatis) ──
    const lebarIdeal = new Array(jumlahKolom).fill(0);

    for (let c = 0; c < jumlahKolom; c++) {
      for (let r = 0; r < jumlahBaris; r++) {
        // Untuk pengukuran lebar ideal, cek setiap segmen ;; secara terpisah
        const segmenSel = data[r][c].split(';;');
        for (let s = 0; s < segmenSel.length; s++) {
          const lebarTeks = ctx.measureText(segmenSel[s].trim().replace(/~~/g, '')).width;
          if (lebarTeks > lebarIdeal[c]) {
            lebarIdeal[c] = lebarTeks;
          }
        }
      }
      // Tambah padding kiri-kanan
      lebarIdeal[c] += PADDING_X * 2;
      // Pastikan minimum
      if (lebarIdeal[c] < MIN_LEBAR) lebarIdeal[c] = MIN_LEBAR;
    }

    // ── LANGKAH 2: Cek total vs batas kertas ──
    let totalIdeal = 0;
    for (let c = 0; c < jumlahKolom; c++) totalIdeal += lebarIdeal[c];

    if (totalIdeal <= batasLebarTabel) {
      lebarKolom = lebarIdeal.slice(); // Muat semua, tidak perlu kompresi
    } else {
      // Strategi kompresi proporsional
      const rasioKompresi = batasLebarTabel / totalIdeal;
      lebarKolom = new Array(jumlahKolom);
      for (let c = 0; c < jumlahKolom; c++) {
        lebarKolom[c] = Math.max(lebarIdeal[c] * rasioKompresi, MIN_LEBAR);
      }

      // Normalisasi ulang jika masih melebihi setelah floor MIN_LEBAR
      let totalSetelahKompresi = 0;
      for (let c = 0; c < jumlahKolom; c++) totalSetelahKompresi += lebarKolom[c];
      if (totalSetelahKompresi > batasLebarTabel) {
        // Potong kolom-kolom terlebar secara proporsional
        const rasioKedua = batasLebarTabel / totalSetelahKompresi;
        for (let c = 0; c < jumlahKolom; c++) {
          lebarKolom[c] = Math.max(lebarKolom[c] * rasioKedua, MIN_LEBAR * 0.5);
        }
      }
    }
  }

  // ── LANGKAH 3: Hitung tinggi per baris setelah word-wrap ──
  const barisPerSel = [];
  const tinggiPerBaris = new Array(jumlahBaris).fill(0);

  for (let r = 0; r < jumlahBaris; r++) {
    barisPerSel[r] = [];
    let maxWrappedLines = 1;

    for (let c = 0; c < jumlahKolom; c++) {
      const lebarIsiSel = lebarKolom[c] - (PADDING_X * 2);
      // Gunakan pecahDanWrapSel: pecah ;; dulu, baru word-wrap tiap segmen
      const wrappedLines = pecahDanWrapSel(data[r][c], lebarIsiSel, ctx);
      barisPerSel[r][c] = wrappedLines;

      if (wrappedLines.length > maxWrappedLines) {
        maxWrappedLines = wrappedLines.length;
      }
    }

    // Tinggi baris = kelipatan tepat dari jarakBaris + ekstra padding dari slider
    tinggiPerBaris[r] = (maxWrappedLines * jarakBaris) + ekstraPadding;
  }

  // ── Hitung total ──
  let totalLebar = 0;
  for (let c = 0; c < jumlahKolom; c++) totalLebar += lebarKolom[c];

  let totalTinggi = 0;
  for (let r = 0; r < jumlahBaris; r++) totalTinggi += tinggiPerBaris[r];

  return {
    lebarKolom: lebarKolom,
    tinggiPerBaris: tinggiPerBaris,
    barisPerSel: barisPerSel,
    totalLebar: totalLebar,
    totalTinggi: totalTinggi
  };
}

/* ============================================================================
  ENGINE 4: PELUKIS GRID TANGAN BEBAS (HAND-DRAWN GRID ENGINE)
  Menggambar garis tabel dengan efek "tanpa penggaris".
  
  Komponen:
  - gambarGarisTangan(): Segmented Line Drawing Algorithm (jantung utama)
  - gambarGridTabel():   Orkestrator yang memanggil gambarGarisTangan()
  
  3 Parameter Independen (masing-masing 0-100):
    levelDrift     = Kemiringan ujung-ke-ujung (macro tilt)
    levelOvershoot = Perpanjangan garis melewati batas kotak
    levelWobble    = Getaran mikro di tengah tarikan garis
============================================================================ */

/**
 * SEGMENTED LINE DRAWING ALGORITHM
 * Menggambar satu garis dengan efek tangan bebas.
 * 3 efek dikendalikan secara independen.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1 - Koordinat X awal (ideal)
 * @param {number} y1 - Koordinat Y awal (ideal)
 * @param {number} x2 - Koordinat X akhir (ideal)
 * @param {number} y2 - Koordinat Y akhir (ideal)
 * @param {number} Skala
 * @param {string} warnaGaris
 * @param {number} levelDrift     - 0-100: Kemiringan garis (slant)
 * @param {number} levelOvershoot - 0-100: Bablas melewati batas kotak
 * @param {number} levelWobble    - 0-100: Getaran mikro di tengah garis
 */
function gambarGarisTangan(ctx, x1, y1, x2, y2, Skala, warnaGaris, levelDrift, levelOvershoot, levelWobble) {
  ctx.save();
  ctx.strokeStyle = warnaGaris;

  // Normalisasi faktor: karena max input sekarang 100, kita bagi dengan 10.
  // Artinya jika level=10 -> faktor=1.0. Jika level=100 -> faktor=10.0 (efek sangat ekstrem)
  // Pastikan jika <= 0 benar-benar 0 mutlak untuk hasil garis lurus sempurna.
  const fDrift = (levelDrift > 0) ? levelDrift / 10 : 0;
  const fOvershoot = (levelOvershoot > 0) ? levelOvershoot / 10 : 0;
  const fWobble = (levelWobble > 0) ? levelWobble / 10 : 0;
  const fGabungan = Math.max(fDrift, fOvershoot, fWobble);

  // ── 1. VARIASI KETEBALAN GARIS ──
  const tebalDasar = 0.8 * Skala;
  const acakTebal = (fGabungan > 0) ? (Math.random() - 0.5) * (Skala * 0.4) * fGabungan : 0;
  ctx.lineWidth = Math.max(0.3, tebalDasar + acakTebal);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Hitung properti geometri garis
  const panjangGaris = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const dx = panjangGaris > 0 ? (x2 - x1) / panjangGaris : 0;
  const dy = panjangGaris > 0 ? (y2 - y1) / panjangGaris : 0;
  const nx = -dy; // Normal vektor (tegak lurus garis)
  const ny = dx;

  // ── 2. OVERSHOOT ENGINE (Tarikan Bablas) ──
  const overshootMax = Math.min(panjangGaris * 0.03, 6 * Skala) * fOvershoot;
  const overshootAwal = (fOvershoot > 0) ? Math.random() * overshootMax : 0;
  const overshootAkhir = (fOvershoot > 0) ? Math.random() * overshootMax : 0;

  const ax1 = x1 - dx * overshootAwal;
  const ay1 = y1 - dy * overshootAwal;
  const ax2 = x2 + dx * overshootAkhir;
  const ay2 = y2 + dy * overshootAkhir;

  // ── 3. MACRO-DRIFT GENERATOR (Kemiringan) ──
  const driftMax = 3.0 * Skala * fDrift;
  const driftAwal = (fDrift > 0) ? (Math.random() - 0.5) * driftMax : 0;
  const driftAkhir = (fDrift > 0) ? (Math.random() - 0.5) * driftMax : 0;

  const startX = ax1 + nx * driftAwal;
  const startY = ay1 + ny * driftAwal;
  const endX = ax2 + nx * driftAkhir;
  const endY = ay2 + ny * driftAkhir;

  // ── 4. SEGMENTED LINE DRAWING (Wobble / Getaran Mikro) ──
  // Jika wobble = 0, cukup 1 segmen lurus. Jika > 0, pecah jadi 8-70 segmen
  const jumlahSegmen = (fWobble > 0) ? Math.max(3, Math.floor(8 + fWobble * 7)) : 1;
  const microJitterMax = 1.5 * Skala * fWobble;

  ctx.beginPath();
  ctx.moveTo(startX, startY);

  for (let s = 1; s <= jumlahSegmen; s++) {
    const t = s / jumlahSegmen;
    const baseX = startX + (endX - startX) * t;
    const baseY = startY + (endY - startY) * t;

    if (s < jumlahSegmen && fWobble > 0) {
      const microJitter = (Math.random() - 0.5) * microJitterMax * 2;
      ctx.lineTo(baseX + nx * microJitter, baseY + ny * microJitter);
    } else {
      ctx.lineTo(endX, endY);
    }
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Menggambar keseluruhan grid tabel (garis horizontal + vertikal).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{lebarKolom: number[], tinggiPerBaris: number[], totalLebar: number, totalTinggi: number}} dimensi
 * @param {number} posisiXAwal
 * @param {number} posisiYAwal
 * @param {number} Skala
 * @param {string} warnaTinta
 * @param {number} levelDrift
 * @param {number} levelOvershoot
 * @param {number} levelWobble
 */
function gambarGridTabel(ctx, dimensi, posisiXAwal, posisiYAwal, Skala, warnaTinta, levelDrift, levelOvershoot, levelWobble) {
  const { lebarKolom, tinggiPerBaris, totalLebar, totalTinggi } = dimensi;

  // ── GARIS HORIZONTAL ──
  let yAkumulasi = posisiYAwal;
  for (let r = 0; r <= tinggiPerBaris.length; r++) {
    gambarGarisTangan(
      ctx,
      posisiXAwal, yAkumulasi,
      posisiXAwal + totalLebar, yAkumulasi,
      Skala, warnaTinta, levelDrift, levelOvershoot, levelWobble
    );
    if (r < tinggiPerBaris.length) {
      yAkumulasi += tinggiPerBaris[r];
    }
  }

  // ── GARIS VERTIKAL ──
  let xAkumulasi = posisiXAwal;
  for (let c = 0; c <= lebarKolom.length; c++) {
    gambarGarisTangan(
      ctx,
      xAkumulasi, posisiYAwal,
      xAkumulasi, posisiYAwal + totalTinggi,
      Skala, warnaTinta, levelDrift, levelOvershoot, levelWobble
    );
    if (c < lebarKolom.length) {
      xAkumulasi += lebarKolom[c];
    }
  }
}

/* ============================================================================
  FUNGSI RENDERING ISI SEL
  Mengisi setiap sel tabel dengan teks (top-aligned).
  Mendukung sintaks ~~ (strikethrough) dengan mendelegasikan
  rendering ke gambarSatuBarisTeks() dari mesin teks utama.
============================================================================ */

/**
 * Mem-parse satu baris teks sel menjadi array objek kata
 * dengan flag `coret`, kompatibel dengan gambarSatuBarisTeks().
 *
 * @param {string} barisTeks - Satu baris teks dalam sel (sudah di-wrap)
 * @param {CanvasRenderingContext2D} ctx - Untuk measureText
 * @returns {{teks: string, lebar: number, coret: boolean}[]}
 */
function parseBarisSelKeObjekKata(barisTeks, ctx) {
  if (!barisTeks || barisTeks.trim().length === 0) return [];

  // Trim dan split menjadi kata-kata (token) berdasarkan spasi
  const kataArray = barisTeks.trim().split(/\s+/);
  const hasil = [];
  let modeCoretAktif = false;

  for (let i = 0; i < kataArray.length; i++) {
    let teksKata = kataArray[i];
    if (teksKata.length === 0) continue;

    // A. Jika kata berawalan ~~, nyalakan mode coret
    if (teksKata.startsWith('~~')) {
      modeCoretAktif = true;
      teksKata = teksKata.slice(2); // Buang ~~ pembuka
    }

    // B. Rekam status coret untuk kata ini SEBELUM dicek penutupnya
    let harusDicoret = modeCoretAktif;

    // C. Jika kata berakhiran ~~, buang ~~ penutup dan matikan mode
    if (teksKata.endsWith('~~')) {
      teksKata = teksKata.slice(0, -2); // Buang ~~ penutup
      modeCoretAktif = false;
    }

    // D. Jika setelah strip ~~ kata menjadi kosong, skip
    if (teksKata.length === 0) continue;

    hasil.push({
      teks: teksKata,
      lebar: ctx.measureText(' ' + teksKata).width, // Lebar termasuk spasi prefix
      coret: harusDicoret
    });
  }

  return hasil;
}

/**
 * Mengisi setiap sel tabel dengan teks.
 * Strategi Y-Axis: TOP-ANCHORED (bukan center).
 * Mendukung sintaks ~~ (strikethrough) via gambarSatuBarisTeks().
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{lebarKolom: number[], tinggiPerBaris: number[], barisPerSel: string[][][]}} dimensi
 * @param {number} posisiXAwal
 * @param {number} posisiYAwal - Y absolut baris pertama tabel
 * @param {number} jarakBaris
 * @param {number} Skala
 * @param {number} ekstraPadding - Padding vertikal tambahan dari slider
 * @param {number} fontSize - Ukuran font aktif (untuk ketebalan garis coretan)
 * @param {number} jumlahCoretan - Jumlah lapisan garis coretan typo
 */
function gambarIsiSelTabel(ctx, dimensi, posisiXAwal, posisiYAwal, jarakBaris, Skala, ekstraPadding, fontSize, jumlahCoretan) {
  const { lebarKolom, tinggiPerBaris, barisPerSel } = dimensi;
  const PADDING_X = TABEL_PADDING_X_FAKTOR * Skala;

  let yBaris = posisiYAwal;

  for (let r = 0; r < barisPerSel.length; r++) {
    let xKolom = posisiXAwal;

    for (let c = 0; c < barisPerSel[r].length; c++) {
      const barisTeksSel = barisPerSel[r][c]; // string[] (baris-baris teks dalam sel)
      const xTeks = xKolom + PADDING_X;

      // ── TOP-ANCHORED Y: Semua sel mulai dari Y yang sama ──
      for (let w = 0; w < barisTeksSel.length; w++) {
        const yTeks = yBaris + (w * jarakBaris);

        // Parse baris teks menjadi objek kata (dengan flag coret)
        const objekKata = parseBarisSelKeObjekKata(barisTeksSel[w], ctx);

        if (objekKata.length > 0) {
          // Delegasikan ke mesin teks utama (sudah punya logika ~~ lengkap)
          gambarSatuBarisTeks(ctx, objekKata, xTeks, yTeks, '', Skala, fontSize, jumlahCoretan);
        } else {
          // Baris kosong, tidak perlu digambar
        }
      }

      xKolom += lebarKolom[c];
    }

    yBaris += tinggiPerBaris[r];
  }
}

/* ============================================================================
  FUNGSI UTAMA: RENDER TABEL LENGKAP
  Memanggil semua engine secara berurutan.
============================================================================ */

/**
 * Merender tabel lengkap: parse → measure → grid → isi sel.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]} barisTabel - Baris-baris teks mentah tabel
 * @param {number} koordinatXDasar - Margin kiri zona
 * @param {number} posisiY - Posisi Y saat ini
 * @param {number} batasLebar - Lebar area tulis (batasKanan - marginKiri)
 * @param {number} jarakBaris - Tinggi satu baris teks
 * @param {number} Skala
 * @param {string} warnaTinta - fillStyle aktif
 * @param {number} [ekstraPadding=0] - Padding vertikal tambahan dari slider
 * @param {number} [fontSize=20] - Ukuran font aktif
 * @param {number} [jumlahCoretan=1] - Jumlah lapisan garis coretan typo
 * @param {number} [levelDrift=0] - Kemiringan garis tabel (0-100)
 * @param {number} [levelOvershoot=0] - Tarikan bablas garis tabel (0-100)
 * @param {number} [levelWobble=0] - Getaran mikro garis tabel (0-100)
 * @returns {number} posisiY baru (di bawah tabel)
 */
function renderTabelLengkap(ctx, barisTabel, koordinatXDasar, posisiY, batasLebar, jarakBaris, Skala, warnaTinta, ekstraPadding, fontSize, jumlahCoretan, levelDrift, levelOvershoot, levelWobble) {
  ekstraPadding = ekstraPadding || 0;
  fontSize = fontSize || 20;
  jumlahCoretan = jumlahCoretan || 1;
  levelDrift = levelDrift || 0;
  levelOvershoot = levelOvershoot || 0;
  levelWobble = levelWobble || 0;

  // 1. Parse
  const dataTabel = parseTabelMarkdown(barisTabel);
  if (!dataTabel || dataTabel.jumlahBaris === 0 || dataTabel.jumlahKolom === 0) {
    return posisiY; // Tidak ada data valid
  }

  // Tentukan posisi X awal: gunakan kalibrasi tabel jika aktif
  let posisiXAwal = koordinatXDasar;
  if (typeof Status !== 'undefined' && Status.tabel && Status.tabel.aktif && Status.tabel.garisX.length > 0) {
    posisiXAwal = Status.tabel.garisX[0];
  }

  // 2. Pre-Measurement (dengan ekstra padding dari slider)
  const dimensi = hitungDimensiTabel(dataTabel, ctx, batasLebar, jarakBaris, Skala, ekstraPadding);

  // 3. Gambar Grid (garis-garis tabel)
  // Grid digeser setengah baris ke ATAS agar garis grid mengapit teks dari atas-bawah.
  // Juga dikurangi setengah ekstraPadding agar padding merata atas-bawah.
  const gridYAwal = posisiY - (jarakBaris / 2) - (ekstraPadding / 2);
  gambarGridTabel(ctx, dimensi, posisiXAwal, gridYAwal, Skala, warnaTinta, levelDrift, levelOvershoot, levelWobble);

  // 4. Gambar Isi Sel (teks + strikethrough via gambarSatuBarisTeks)
  gambarIsiSelTabel(ctx, dimensi, posisiXAwal, posisiY, jarakBaris, Skala, ekstraPadding, fontSize, jumlahCoretan);

  // 5. Return posisi Y baru (di bawah tabel)
  return posisiY + dimensi.totalTinggi;
}
