import { Inter } from "next/font/google"
import "./globals.css"
import ThemeProvider from "@/components/ThemeProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Sorta Works Studio - Interactive Simulations",
  description: "Explore Random concepts through interactive simulations",
    
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/SimL.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/SimLD.png" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={`${inter.className} min-h-screen transition-colors duration-300`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
