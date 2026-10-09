import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bimbel Grade Manager | Input Nilai Siswa',
  description: 'Aplikasi manajemen nilai siswa bimbingan belajar. Input nilai latihan, quiz, dan bonus point dengan mudah.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
