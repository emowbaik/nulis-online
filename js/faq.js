const faqContent = `
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
    <li>Jumlah kolom boleh tidak konsisten — sistem akan otomatis menyamakan dengan kolom terbanyak.</li>
    <li>Tabel bisa ditulis <strong>di antara teks biasa</strong>. Teks sebelum dan sesudah tabel tetap dirender normal.</li>
    <li>Lebar kolom dihitung otomatis berdasarkan isi teks terpanjang di setiap kolom. Jika total lebar melebihi area tulis, kolom akan dikompresi secara proporsional.</li>
  </ul>

  <h4 style="margin-top: 15px; color: var(--accent2);">🎚 Mengatur Ketinggian Baris Tabel:</h4>
  <p>Gunakan slider <strong>Ketinggian Baris Tabel (Padding)</strong> di menu <em>Presisi Manual</em> untuk memperbesar atau memperkecil ruang kosong di atas dan bawah teks dalam sel. Cocok untuk menyesuaikan baris tabel agar sejajar dengan garis kertas Anda.</p>

  <hr style="border: none; border-top: 1px solid var(--border); margin: 20px 0;">

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
      Jika teks di suatu sel terlalu panjang, sistem akan otomatis membungkus teks (word-wrap) di dalam sel. Jika kolom terlalu sempit, coba kurangi jumlah kolom atau perpendek isi sel. Anda juga bisa memperbesar area tulis melalui kalibrasi <strong>Batas Kanan</strong>.
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
