export default function WelcomeScreen() {
  return (
    <div className="welcome-screen">
      <div className="welcome-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L1 9L12 15L23 9L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M5 11.5V17.5C5 17.5 7.5 20 12 20C16.5 20 19 17.5 19 17.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2>Selamat Datang, Guru!</h2>
      <p>Pilih siswa dari daftar di sebelah kiri untuk mulai menginput nilai, atau tambahkan siswa baru terlebih dahulu.</p>
      <div className="welcome-tips">
        <div className="tip-card"><span>📝</span><span>Input nilai <strong>Latihan</strong></span></div>
        <div className="tip-card"><span>📊</span><span>Input nilai <strong>Quiz</strong></span></div>
        <div className="tip-card"><span>⭐</span><span>Tambah <strong>Bonus Point</strong></span></div>
        <div className="tip-card"><span>📋</span><span>Catat <strong>Kehadiran</strong></span></div>
      </div>
    </div>
  )
}
