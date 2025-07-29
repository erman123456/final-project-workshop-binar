// Mengimpor modul-modul bawaan Node.js yang diperlukan
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// 1. MENGAMBIL NAMA PROYEK DARI ARGUMEN TERMINAL
// process.argv[2] adalah argumen ketiga yang kita berikan saat menjalankan skrip
// Contoh: node create-fe-project.js nama-proyek-saya
const projectName = process.argv[2];

if (!projectName) {
  console.error("❌ Error: Mohon berikan nama untuk proyek Anda.");
  console.log("Contoh: node create-fe-project.js proyek-fe-baru");
  process.exit(1); // Keluar dari skrip jika tidak ada nama proyek
}

// 2. MENDEFINISIKAN PATH (LOKASI) PROYEK
// path.join memastikan path kompatibel di berbagai sistem operasi (Windows, MacOS, Linux)
const projectPath = path.join(process.cwd(), projectName);
const srcPath = path.join(projectPath, "src");

console.log(`🚀 Memulai pembuatan proyek '${projectName}'...`);

try {
  // 3. MEMBUAT STRUKTUR FOLDER
  // { recursive: true } memastikan folder induk dibuat jika belum ada
  fs.mkdirSync(srcPath, { recursive: true });
  console.log("✅ Folder `src` berhasil dibuat.");

  // 4. MEMBUAT FILE-FILE DASAR
  // Konten untuk file index.html
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Selamat Datang di Proyek ${projectName}!</h1>
  <p>Anda bisa mulai mengedit file di dalam folder 'src'.</p>
  
  <script src="script.js" defer></script>
</body>
</html>`;

  // Konten untuk file style.css
  const cssContent = `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f2f5;
  color: #333;
}

h1 {
  color: #1a73e8;
}`;

  // Konten untuk file script.js
  const jsContent = `console.log('✨ Proyek "${projectName}" berhasil dimuat!');

// Contoh interaksi DOM sederhana
document.querySelector('h1').addEventListener('click', () => {
  alert('File JavaScript terhubung dengan baik!');
});`;

  // Menulis konten ke dalam file
  fs.writeFileSync(path.join(srcPath, "index.html"), htmlContent);
  fs.writeFileSync(path.join(srcPath, "style.css"), cssContent);
  fs.writeFileSync(path.join(srcPath, "script.js"), jsContent);
  console.log("✅ File HTML, CSS, dan JS dasar berhasil dibuat.");

  // 5. INISIASI NPM DAN INSTALASI DEPENDENSI
  console.log("⚙️  Menginisiasi npm dan membuat package.json...");
  // Menjalankan 'npm init -y' di dalam folder proyek yang baru dibuat
  execSync("npm init -y", { cwd: projectPath, stdio: "pipe" });

  console.log("📦 Menginstall live-server sebagai dev dependency...");
  // Menginstall live-server untuk development server
  execSync("npm install live-server --save-dev", {
    cwd: projectPath,
    stdio: "pipe",
  });

  // 6. MENAMBAHKAN SCRIPT "START" KE PACKAGE.JSON
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Menambahkan script 'start'
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.start = "live-server src";

  // Menulis kembali file package.json yang sudah dimodifikasi
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Script "start" berhasil ditambahkan ke package.json.');

  // 7. PESAN SUKSES DAN INSTRUKSI LANJUTAN
  console.log(`\n🎉 Proyek '${projectName}' berhasil dibuat!`);
  console.log("Untuk memulai, jalankan perintah berikut:");
  console.log(`\n  cd ${projectName}`);
  console.log("  npm start\n");
} catch (error) {
  console.error(`❌ Terjadi kesalahan: ${error.message}`);
  // Jika terjadi error, hapus folder yang mungkin sudah dibuat
  if (fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true, force: true });
    console.log(`🧹 Membersihkan folder '${projectName}' yang gagal dibuat.`);
  }
  process.exit(1);
}
