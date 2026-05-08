/* ============================================================================
  MESIN TABEL TULISAN TANGAN — NulisOnline
  File ini berisi 4 engine inti untuk fitur rendering tabel Markdown:
    Engine 1: Parser Sintaks Markdown
    Engine 2: Algoritma Pra-Pengukuran (Pre-Measurement)
    Engine 3: Cell-Bound Word Wrap
    Engine 4: Pelukis Grid Bergetar (Jittery Grid Drawer)
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

  const kataKata = teks.split(' ');
  const hasil = [];
  let barisSaatIni = '';

  for (let i = 0; i < kataKata.length; i++) {
    const kata = kataKata[i];
    const tesString = barisSaatIni.length > 0 ? barisSaatIni + ' ' + kata : kata;
    const lebarTes = ctx.measureText(tesString).width;

    if (lebarTes > lebarMaksimal && barisSaatIni.length > 0) {
      // Baris saat ini sudah penuh, simpan dan mulai baru
      hasil.push(barisSaatIni);
      barisSaatIni = '';

      // Cek apakah kata tunggal melebihi lebar
      const lebarKataSendiri = ctx.measureText(kata).width;
      if (lebarKataSendiri > lebarMaksimal) {
        // Pecah per karakter
        let stringSementara = '';
        for (let j = 0; j < kata.length; j++) {
          const charTes = stringSementara + kata[j];
          if (ctx.measureText(charTes).width > lebarMaksimal && stringSementara.length > 0) {
            hasil.push(stringSementara);
            stringSementara = kata[j];
          } else {
            stringSementara = charTes;
          }
        }
        barisSaatIni = stringSementara;
      } else {
        barisSaatIni = kata;
      }
    } else if (barisSaatIni.length === 0 && ctx.measureText(kata).width > lebarMaksimal) {
      // Kata pertama di baris sudah melebihi lebar → pecah per karakter
      let stringSementara = '';
      for (let j = 0; j < kata.length; j++) {
        const charTes = stringSementara + kata[j];
        if (ctx.measureText(charTes).width > lebarMaksimal && stringSementara.length > 0) {
          hasil.push(stringSementara);
          stringSementara = kata[j];
        } else {
          stringSementara = charTes;
        }
      }
      barisSaatIni = stringSementara;
    } else {
      barisSaatIni = tesString;
    }
  }

  // Push sisa baris terakhir
  if (barisSaatIni.length > 0) {
    hasil.push(barisSaatIni);
  }

  return hasil.length > 0 ? hasil : [''];
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

  // ── LANGKAH 1: Hitung lebar "ideal" tiap kolom ──
  const lebarIdeal = new Array(jumlahKolom).fill(0);

  for (let c = 0; c < jumlahKolom; c++) {
    for (let r = 0; r < jumlahBaris; r++) {
      const lebarTeks = ctx.measureText(data[r][c]).width;
      if (lebarTeks > lebarIdeal[c]) {
        lebarIdeal[c] = lebarTeks;
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

  let lebarKolom;
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

  // ── LANGKAH 3: Hitung tinggi per baris setelah word-wrap ──
  const barisPerSel = [];
  const tinggiPerBaris = new Array(jumlahBaris).fill(0);

  for (let r = 0; r < jumlahBaris; r++) {
    barisPerSel[r] = [];
    let maxWrappedLines = 1;

    for (let c = 0; c < jumlahKolom; c++) {
      const lebarIsiSel = lebarKolom[c] - (PADDING_X * 2);
      const wrappedLines = wrapTeksDalamSel(data[r][c], lebarIsiSel, ctx);
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
  ENGINE 4: PELUKIS GRID BERGETAR (JITTERY GRID DRAWER)
  Menggambar garis tabel dengan efek tangan manusia.
============================================================================ */

/**
 * Menggambar satu garis lurus dengan efek jitter tangan manusia.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1 - Koordinat X awal
 * @param {number} y1 - Koordinat Y awal
 * @param {number} x2 - Koordinat X akhir
 * @param {number} y2 - Koordinat Y akhir
 * @param {number} Skala
 * @param {string} warnaGaris
 */
function gambarGarisJitter(ctx, x1, y1, x2, y2, Skala, warnaGaris) {
  ctx.save();
  ctx.strokeStyle = warnaGaris;

  // Variasi ketebalan garis (seperti penggaris yang sedikit bergerak)
  const tebalDasar = 0.8 * Skala;
  const acakTebal = (Math.random() - 0.5) * (Skala * 0.4);
  ctx.lineWidth = Math.max(0.3, tebalDasar + acakTebal);

  // Amplitudo jitter (lebih kecil dari coretan ~~, lebih presisi seperti penggaris)
  const amplitudo = 1.5 * Skala;

  // Jitter independen di titik awal dan akhir
  const jStartX = (Math.random() - 0.5) * amplitudo;
  const jStartY = (Math.random() - 0.5) * amplitudo;
  const jEndX = (Math.random() - 0.5) * amplitudo;
  const jEndY = (Math.random() - 0.5) * amplitudo;

  ctx.beginPath();
  ctx.moveTo(x1 + jStartX, y1 + jStartY);

  // Tambahkan 1-2 titik kontrol untuk efek garis sedikit melengkung (seperti digaris tangan)
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const jMidX = (Math.random() - 0.5) * amplitudo * 0.7;
  const jMidY = (Math.random() - 0.5) * amplitudo * 0.7;

  ctx.quadraticCurveTo(midX + jMidX, midY + jMidY, x2 + jEndX, y2 + jEndY);
  ctx.stroke();
  ctx.restore();
}

/**
 * Menggambar keseluruhan grid tabel (garis horizontal + vertikal).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{lebarKolom: number[], tinggiPerBaris: number[], totalLebar: number, totalTinggi: number}} dimensi
 * @param {number} posisiXAwal - Koordinat X kiri tabel
 * @param {number} posisiYAwal - Koordinat Y atas tabel
 * @param {number} Skala
 * @param {string} warnaTinta
 */
function gambarGridTabel(ctx, dimensi, posisiXAwal, posisiYAwal, Skala, warnaTinta) {
  const { lebarKolom, tinggiPerBaris, totalLebar, totalTinggi } = dimensi;

  // ── GARIS HORIZONTAL (batas atas setiap baris + batas bawah tabel) ──
  let yAkumulasi = posisiYAwal;
  for (let r = 0; r <= tinggiPerBaris.length; r++) {
    gambarGarisJitter(
      ctx,
      posisiXAwal, yAkumulasi,
      posisiXAwal + totalLebar, yAkumulasi,
      Skala, warnaTinta
    );
    if (r < tinggiPerBaris.length) {
      yAkumulasi += tinggiPerBaris[r];
    }
  }

  // ── GARIS VERTIKAL (batas kiri setiap kolom + batas kanan tabel) ──
  let xAkumulasi = posisiXAwal;
  for (let c = 0; c <= lebarKolom.length; c++) {
    gambarGarisJitter(
      ctx,
      xAkumulasi, posisiYAwal,
      xAkumulasi, posisiYAwal + totalTinggi,
      Skala, warnaTinta
    );
    if (c < lebarKolom.length) {
      xAkumulasi += lebarKolom[c];
    }
  }
}

/* ============================================================================
  FUNGSI RENDERING ISI SEL
  Mengisi setiap sel tabel dengan teks (multi-line jika di-wrap).
============================================================================ */

/**
 * Mengisi setiap sel tabel dengan teks.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{lebarKolom: number[], tinggiPerBaris: number[], barisPerSel: string[][][]}} dimensi
 * @param {number} posisiXAwal
 * @param {number} posisiYAwal
 * @param {number} jarakBaris
 * @param {number} Skala
 * @param {number} ekstraPadding - Padding vertikal tambahan dari slider
 */
function gambarIsiSelTabel(ctx, dimensi, posisiXAwal, posisiYAwal, jarakBaris, Skala, ekstraPadding) {
  const { lebarKolom, tinggiPerBaris, barisPerSel } = dimensi;
  const PADDING_X = TABEL_PADDING_X_FAKTOR * Skala;

  let yBaris = posisiYAwal;

  for (let r = 0; r < barisPerSel.length; r++) {
    let xKolom = posisiXAwal;

    for (let c = 0; c < barisPerSel[r].length; c++) {
      const barisTeksSel = barisPerSel[r][c]; // string[] (baris-baris teks dalam sel)
      const xTeks = xKolom + PADDING_X;

      // Posisi Y teks: teks di-center secara vertikal di dalam sel.
      // ekstraPadding/2 menggeser teks ke bawah agar tetap di tengah
      // meskipun kotak sel membesar karena slider padding.
      const tinggiIsiTeks = barisTeksSel.length * jarakBaris;
      const tinggiSel = tinggiPerBaris[r];
      const offsetSentering = (tinggiSel - tinggiIsiTeks) / 2;

      for (let w = 0; w < barisTeksSel.length; w++) {
        const yTeks = yBaris + offsetSentering + (w * jarakBaris);

        // Jitter vertikal (realisme tangan manusia)
        const jitterY = (Math.random() - 0.5) * (2 * Skala);

        ctx.fillText(barisTeksSel[w], xTeks, yTeks + jitterY);
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
 * @returns {number} posisiY baru (di bawah tabel)
 */
function renderTabelLengkap(ctx, barisTabel, koordinatXDasar, posisiY, batasLebar, jarakBaris, Skala, warnaTinta, ekstraPadding) {
  ekstraPadding = ekstraPadding || 0;

  // 1. Parse
  const dataTabel = parseTabelMarkdown(barisTabel);
  if (!dataTabel || dataTabel.jumlahBaris === 0 || dataTabel.jumlahKolom === 0) {
    return posisiY; // Tidak ada data valid
  }

  // 2. Pre-Measurement (dengan ekstra padding dari slider)
  const dimensi = hitungDimensiTabel(dataTabel, ctx, batasLebar, jarakBaris, Skala, ekstraPadding);

  // 3. Gambar Grid (garis-garis tabel)
  // Grid digeser setengah baris ke ATAS agar garis grid mengapit teks dari atas-bawah.
  // Juga dikurangi setengah ekstraPadding agar padding merata atas-bawah.
  const gridYAwal = posisiY - (jarakBaris / 2) - (ekstraPadding / 2);
  gambarGridTabel(ctx, dimensi, koordinatXDasar, gridYAwal, Skala, warnaTinta);

  // 4. Gambar Isi Sel (teks di posisiY, di-center secara vertikal di dalam sel)
  gambarIsiSelTabel(ctx, dimensi, koordinatXDasar, posisiY, jarakBaris, Skala, ekstraPadding);

  // 5. Return posisi Y baru (di bawah tabel)
  return posisiY + dimensi.totalTinggi;
}
