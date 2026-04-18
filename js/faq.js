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

  <h3>💡 FAQ & Tips Rahasia</h3>
  <ul>
    <li>
      <strong>📝 Bagaimana cara membuat coretan tipe-x / salah tulis (typo)?</strong><br>
      Apit kata atau kalimat yang salah dengan tanda tilde ganda (<code>~~</code>), contoh: <code>~~saya salah ketik~~</code>. Garis coretan yang super realistis akan otomatis dibuat. Tingkat "kebrutalan" coretan bisa diatur melalui slider <strong>Jumlah Coretan Typo</strong>.
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
