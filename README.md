&#xa0;

# ✒️ Tool Nulis Online (Beta Version)

Generator tulisan tangan otomatis berbasis **HTML5 Canvas** dengan arsitektur kalibrasi zona dinamis. Dibangun murni menggunakan *Vanilla JavaScript* tanpa pustaka pihak ketiga.

Proyek ini merender teks komputer menjadi format gambar tulisan tangan yang presisi di atas gambar kertas asli, lengkap dengan efek ketidaksempurnaan (*jitter*) layaknya tulisan manusia.

## 🚀 Fitur Utama (Rekayasa Teknis)

* **Sistem Tata Letak Berbasis Zona (Zone-Based Layout):** Arsitektur terpisah untuk Header Kiri (Informasi Mahasiswa/Multi-baris), Header Kanan (Tanggal), dan Konten Utama.
* **Mesin Kalibrasi Dinamis (*State Machine Wizard*):** Navigasi kalibrasi 12-tahap berbasis klik (Kiri, Kanan, Garis Atas, Garis Bawah) yang kebal terhadap perubahan resolusi layar.
* **Koreksi Presisi Desimal:** *Slider* sinkron dua arah (*Two-way data binding*) untuk menggeser sumbu-Y dan jarak spasi baris hingga ketelitian 0.1 piksel.
* **Simulasi *Jitter* Tulisan Tangan:** Injeksi nilai acak (`Math.random`) pada koordinat Y saat *rendering* Canvas untuk menciptakan efek tulisan yang naik-turun natural.
* **Preservasi Indentasi (Tab Support):** * Injeksi 4 spasi menggunakan `document.execCommand` untuk mempertahankan riwayat *Undo* (`Ctrl+Z`).
    * Ekstraksi menggunakan *Regular Expression* (`^\s*`) untuk mencegah spasi/tab awal hilang saat algoritma *word-wrap* (turun baris otomatis) dieksekusi.
* **Auto-Downscale & Responsive Zoom:** Pencegahan cacat *sub-pixel rendering* dengan membatasi lebar maksimal gambar unggahan secara proporsional, ditambah fitur *Zoom Preview* non-destruktif.

## 🛠️ Teknologi yang Digunakan

* **Frontend:** HTML5, CSS3 (Variabel CSS, Flexbox, UI/UX Kustom).
* **Logika Inti:** Vanilla JavaScript (ES6+).
* **Rendering:** HTML5 `<canvas>` API (Konteks 2D).

## 📂 Struktur Direktori

Pastikan struktur folder Anda seperti di bawah ini agar aset lokal dapat dimuat dengan benar:

```text
📁 nulis-online/
├── 📄 index.html
├── 📄 README.md
├── 📁 img/
│   ├── 🖼️ buku1.jpg
│   ├── 🖼️ folio1.jpg
│   ├── 🖼️ folio2.png
│   └── 🖼️ folio3.jpg
└── 📁 fonts/
    ├── 🔤 GloriaHallelujah-Regular.ttf
    ├── 🔤 HandwritingCR-2.ttf
    ├── 🔤 My_handwriting.ttf
    ├── 🔤 MyHandsareHoldingYou.ttf
    └── 🔤 ShadowsIntoLight-Regular.ttf
```
(Catatan: Nama file bersifat Case-Sensitive. Pastikan huruf besar/kecil sama persis saat melakukan deployment ke server berbasis Linux).

## ⚙️ Cara Menjalankan Proyek (Instalasi)
Karena aplikasi ini menarik gambar dan font dari direktori lokal ke dalam elemen HTML5 Canvas, aplikasi ini TIDAK BISA dijalankan hanya dengan mengklik ganda file index.html (protokol file:///). Hal tersebut akan memicu error keamanan CORS (Cross-Origin Resource Sharing) dan menyebabkan kanvas menjadi Tainted (tidak bisa diunduh).

Langkah-langkah:

1. Kloning repositori ini:
```bash
git clone https://github.com/emowbaik/nulis-online.git
```

2. Buka folder proyek di Code Editor (misalnya VS Code).

3. Jalankan melalui Local Web Server. Jika menggunakan VS Code, instal ekstensi Live Server, klik kanan pada index.html, lalu pilih Open with Live Server.

4. Aplikasi akan terbuka di browser (biasanya di http://127.0.0.1:5500).

## 📝 License ##

This project is under license from MIT. For more details, see the [LICENSE](LICENSE.md) file.

Made with ♥ by <a href="https://github.com/emowbaik" target="_blank">Emowmow</a>

&#xa0;