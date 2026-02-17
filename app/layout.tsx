import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Phonics Fun! — Interactive Learning for Kids",
  description:
    "A fun, interactive phonics learning app for children ages 3-7. Learn letter sounds, build words, read sentences, take quizzes, and print practice worksheets — all powered by AI!",
  keywords: ["phonics", "kids learning", "letter sounds", "reading", "worksheets", "educational app"],
  authors: [{ name: "Phonics Fun" }],
  openGraph: {
    title: "Phonics Fun! — Interactive Learning for Kids",
    description: "Learn phonics with AI-powered interactive lessons, quizzes, and printable worksheets.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
