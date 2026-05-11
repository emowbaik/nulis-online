const faqContent = `
  <!-- ═══════ SECTION: FITUR BARU ═══════ -->
  <div style="background: linear-gradient(135deg, rgba(255,140,0,0.12), rgba(224,102,255,0.12)); border: 1px solid rgba(255,140,0,0.3); border-radius: 10px; padding: 18px 16px; margin-bottom: 20px;">
    <h3 style="border-bottom: none; margin: 0 0 12px 0; padding: 0; color: #ff8c00; font-size: 16px;">✨ Fitur Baru!</h3>

    <div style="display: flex; flex-direction: column; gap: 12px;">
      <!-- Fitur 1: Kalibrasi Tabel -->
      <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; border-left: 3px solid #ff8c00;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #ff8c00; margin-bottom: 4px; font-weight: bold;">📊 Kalibrasi Tabel</div>
        <div style="font-size: 13px; color: #ccc;">Atur lebar kolom tabel secara presisi! Geser garis pembatas langsung di kanvas agar kolom "No" kecil, kolom "Nama" lebar, dsb. <strong style="color: #ff8c00;">Posisi garis tersimpan permanen</strong>, tidak akan ter-reset meskipun Anda keluar-masuk mode kalibrasi.</div>
      </div>

      <!-- Fitur 2: Multi-Baris Sel -->
      <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; border-left: 3px solid #e066ff;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #e066ff; margin-bottom: 4px; font-weight: bold;">📝 Multi-Baris dalam Sel Tabel</div>
        <div style="font-size: 13px; color: #ccc;">Gunakan sintaks <code>;;</code> untuk membuat baris baru di dalam satu sel tabel. Contoh: <code>Poin A;;Poin B;;Poin C</code> akan tercetak sebagai 3 baris terpisah di dalam sel yang sama.</div>
      </div>

      <!-- Fitur 3: Reconciliation -->
      <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; border-left: 3px solid #2ecc71;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #2ecc71; margin-bottom: 4px; font-weight: bold;">🧠 Penyesuaian Kolom Cerdas</div>
        <div style="font-size: 13px; color: #ccc;">Menambah kolom? Garis lama <strong style="color: #2ecc71;">tidak akan ter-reset!</strong> Sistem hanya menambahkan garis baru di sisi kanan. Mengurangi? Garis paling kanan dihapus. Kalibrasi lama Anda aman.</div>
      </div>
    </div>
  </div>

  <!-- ═══════ SECTION: TUTORIAL ═══════ -->
  <h3>🚀 Cara Menggunakan (Tutorial Langkah Demi Langkah)</h3>
  <ol>
    <li><strong>Pilih Kertas Anda:</strong> Tentukan ukuran kertas lewat Preset (misal: Folio/A4) di menu kiri, atau klik <em>"Unggah Kertas Custom"</em> jika Anda ingin menggunakan foto kertas sendiri (sangat disarankan foto tegak lurus dan terang).</li>
    <li><strong>Kalibrasi Garis Kertas (Langkah Paling Penting!):</strong> Klik tombol hijau <em>Mulai Kalibrasi Area</em>. Anda akan melihat garis-garis pembatas virtual. <strong>Klik dan geser (drag) kapsul pada garis tersebut</strong> agar sejajar dengan garis asli di kertas Anda.<br>
      <span style="font-size: 13px; color: var(--muted);"><em>*Garis Merah = Header Kiri, Garis Hijau = Header Kanan, Garis Biru = Konten Utama.</em></span>
    </li>
    <li><strong>Mulai Menulis:</strong> Ketik tugas Anda di panel teks sebelah kiri. Teks akan secara cerdas merespon dan menyelaraskan diri dengan garis kertas hasil kalibrasi Anda.</li>
    <li><strong>Simpan Hasil Tulis:</strong> Jika tata letak sudah rapi dan sempurna, klik tombol "Simpan Hasil (.png)" di sudut bawah kiri untuk mendownload hasilnya!</li>
  </ol>

  <hr style="border: none; border-top: 1px solid var(--border); margin: 20px 0;">

  <!-- ═══════ SECTION: TABEL ═══════ -->
  <h3>📊 Cara Membuat Tabel</h3>
  <p>Anda bisa membuat tabel langsung di kolom <strong>Isi Tulisan</strong> menggunakan format Markdown. Tabel akan otomatis dirender dengan gaya tulisan tangan, lengkap dengan garis grid yang sedikit bergetar (realistis!).</p>

  <h4 style="margin-top: 15px; color: var(--accent2);">✍ Format Penulisan:</h4>
  <p>Gunakan karakter pipa <code>|</code> sebagai pemisah kolom. Setiap baris tabel harus diawali dan diakhiri dengan <code>|</code>.</p>

  <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin: 10px 0; font-family: monospace; font-size: 13px; line-height: 1.6;">
    <span style="color: var(--muted);">// Contoh input di textarea:</span><br>
    | No | Nama Barang | Jumlah |<br>
    |---|---|---|<br>
    | 1 &nbsp;| Penggaris &nbsp;&nbsp;| 2 buah |<br>
    | 2 &nbsp;| Penghapus &nbsp;&nbsp;| 1 buah |<br>
    | 3 &nbsp;| Buku tulis &nbsp;| 5 buah |
  </div>

  <h4 style="margin-top: 15px; color: var(--accent2);">📐 Aturan Penting:</h4>
  <ul style="margin-top: 5px;">
    <li>Setiap baris tabel <strong>harus diawali</strong> dengan karakter <code>|</code>.</li>
    <li>Baris pemisah header <code>|---|---|---|</code> bersifat opsional dan akan otomatis di-skip (tidak muncul sebagai baris data).</li>
    <li>Jumlah kolom boleh tidak konsisten, sistem akan otomatis menyamakan dengan kolom terbanyak.</li>
    <li>Tabel bisa ditulis <strong>di antara teks biasa</strong>. Teks sebelum dan sesudah tabel tetap dirender normal.</li>
    <li>Lebar kolom dihitung otomatis berdasarkan isi teks terpanjang di setiap kolom. Jika total lebar melebihi area tulis, kolom akan dikompresi secara proporsional.</li>
  </ul>

  <h4 style="margin-top: 15px; color: #ff8c00;">📊 Kalibrasi Lebar Kolom (Baru!):</h4>
  <p>Fitur ini memungkinkan Anda mengatur lebar setiap kolom secara presisi. Langkah-langkahnya:</p>
  <ol style="margin-top: 5px;">
    <li>Buka bagian <strong>📊 Pengaturan Tabel</strong> di sidebar kiri.</li>
    <li>Atur <strong>Jumlah Kolom</strong> sesuai tabel Anda (misal: 3 untuk tabel 3 kolom).</li>
    <li>Klik tombol <strong>✏️ Atur Garis Tabel</strong>. Garis-garis vertikal berwarna Jingga/Ungu akan muncul di kanvas.</li>
    <li><strong>Geser garis-garis tersebut</strong> ke posisi yang Anda inginkan. Kolom "No" bisa dibuat sempit, kolom "Nama" dibuat lebar, dst.</li>
    <li>Klik tombol <strong>✅ Selesai Kalibrasi Tabel</strong> untuk kembali ke mode menulis.</li>
    <li>Ketik tabel Anda, lebar kolom akan mengikuti posisi garis yang sudah Anda atur!</li>
  </ol>
  <div style="background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.3); border-radius: 6px; padding: 10px 12px; margin: 10px 0; font-size: 12px; color: #2ecc71;">
    💡 <strong>Tips:</strong> Posisi garis tersimpan permanen! Anda bisa keluar dan masuk kembali ke mode kalibrasi kapan saja tanpa kehilangan pengaturan sebelumnya.
  </div>

  <h4 style="margin-top: 15px; color: #e066ff;">📝 Multi-Baris dalam Sel (Baru!):</h4>
  <p>Ingin menulis beberapa poin terpisah di dalam satu sel? Gunakan sintaks <code>;;</code> (titik koma ganda) sebagai pemisah baris.</p>

  <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin: 10px 0; font-family: monospace; font-size: 13px; line-height: 1.6;">
    <span style="color: var(--muted);">// Contoh multi-baris dalam sel:</span><br>
    | No | Fitur | Status |<br>
    |---|---|---|<br>
    | 1 &nbsp;| Login;;Register;;Logout | Selesai |<br>
    | 2 &nbsp;| Dashboard;;Laporan | Proses |
  </div>
  <p>Sel <code>Login;;Register;;Logout</code> akan tercetak sebagai 3 baris terpisah di dalam satu kotak sel, sementara sel "No" dan "Status" tetap normal. Tinggi baris otomatis menyesuaikan.</p>

  <h4 style="margin-top: 15px; color: var(--accent2);">🎚 Mengatur Ketinggian Baris Tabel:</h4>
  <p>Gunakan slider <strong>Ketinggian Baris Tabel (Padding)</strong> di menu <em>Presisi Manual</em> untuk memperbesar atau memperkecil ruang kosong di atas dan bawah teks dalam sel. Cocok untuk menyesuaikan baris tabel agar sejajar dengan garis kertas Anda.</p>

  <hr style="border: none; border-top: 1px solid var(--border); margin: 20px 0;">

  <!-- ═══════ SECTION: FAQ ═══════ -->
  <h3>💡 FAQ & Tips Rahasia</h3>
  <ul>
    <li>
      <strong>📝 Bagaimana cara membuat coretan tipe-x / salah tulis (typo)?</strong><br>
      Apit kata atau kalimat yang salah dengan tanda tilde ganda (<code>~~</code>), contoh: <code>~~saya salah ketik~~</code>. Garis coretan yang super realistis akan otomatis dibuat. Tingkat "kebrutalan" coretan bisa diatur melalui slider <strong>Jumlah Coretan Typo</strong>.
    </li>
    <li>
      <strong>📊 Tabel saya terlihat berantakan / garis tidak sejajar dengan kertas?</strong><br>
      Pastikan Anda sudah melakukan <strong>Kalibrasi Area</strong> terlebih dahulu. Lalu gunakan slider <strong>Ketinggian Baris Tabel (Padding)</strong> untuk menyesuaikan tinggi baris agar pas dengan garis kertas. Coba geser sedikit demi sedikit (0.5 - 1.0) sambil melihat preview secara real-time.
    </li>
    <li>
      <strong>📊 Kolom tabel saya terlalu kecil / teks terpotong?</strong><br>
      Gunakan fitur <strong>📊 Kalibrasi Tabel</strong> di sidebar! Atur jumlah kolom, lalu geser garis pembatas di kanvas untuk memperlebar kolom yang terlalu sempit. Jika tidak menggunakan kalibrasi, sistem akan otomatis mendistribusikan lebar secara proporsional.
    </li>
    <li>
      <strong>📊 Saya menambah kolom tapi posisi garis lama hilang / ter-reset?</strong><br>
      Tidak akan! Sistem menggunakan <strong>Algoritma Penyesuaian Cerdas (Reconciliation)</strong>. Saat menambah kolom, hanya garis baru yang ditambahkan di sisi kanan. Garis lama tetap di posisi semula. Saat mengurangi kolom, hanya garis paling kanan yang dihapus.
    </li>
    <li>
      <strong>📝 Apa fungsi sintaks <code>;;</code> di dalam tabel?</strong><br>
      Tanda <code>;;</code> (titik koma ganda) berfungsi sebagai pemisah baris di dalam satu sel tabel. Contoh: <code>Poin A;;Poin B</code> akan menjadi 2 baris terpisah di dalam kotak sel yang sama. Ini sangat berguna untuk menulis daftar atau poin-poin di dalam kolom tabel.
    </li>
    <li>
      <strong>📉 Kenapa baris atas sudah pas, tapi makin ke bawah makin meleset/menabrak garis?</strong><br>
      Ini disebut efek <em>Accumulating Error</em> akibat lensa kamera hp atau lipatan kertas yang tidak rata. Jangan panik! Gunakan slider <strong>Koreksi Jarak Baris (Spasi)</strong> untuk memelarkan atau merapatkan spasi baris Anda (gunakan nilai desimal seperti 0.1 atau -0.1).
    </li>
    <li>
      <strong>⬆️ Saya hanya ingin menaik-turunkan teks sedikit saja?</strong><br>
      Gunakan slider <strong>Geser Y (Header/Konten)</strong> di menu <em>Presisi Manual</em>. Fitur ajaib ini memungkinkan Anda memposisikan ulang seluruh blok teks secara presisi.
    </li>
    <li>
      <strong>➡️ Bagaimana cara bikin alinea/paragraf menjorok ke dalam?</strong><br>
      Taruh kursor di awal kalimat, lalu tekan tombol <code>Tab</code> di keyboard Anda. Sistem otomatis memberikan spasi kosong yang proporsional layaknya awal paragraf.
    </li>
    <li>
      <strong>🎨 Tulisan saya terlihat terlalu gelap atau kurang menyatu dengan kertas?</strong><br>
      Atur ketebalan bolpoin lewat slider <strong>Ketebalan Tinta (Opacity)</strong> di bagian Font & Tinta. Menurunkan opacity sedikit (misal ke 0.8) seringkali memberikan efek tinta yang meresap sempurna ke dalam serat kertas.
    </li>
    <li>
      <strong>🔄 Bagaimana cara me-reset pengaturan tabel?</strong><br>
      Cukup ubah <strong>Jumlah Kolom</strong> di sidebar menjadi <strong>0</strong>. Semua memori garis tabel akan dihapus total dan fitur kalibrasi dinonaktifkan.
    </li>
  </ul>
`;

function renderFAQ() {
  const modalBody = document.querySelector('#modalBantuan .modal-body');
  if (modalBody) {
    modalBody.innerHTML = faqContent;
  }
}

// Render ketika DOM sudah siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderFAQ);
} else {
  renderFAQ();
}
