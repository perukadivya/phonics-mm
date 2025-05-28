import type { Metadata } from 'next'
import { SessionProvider } from "next-auth/react"
import { Inter } from 'next/font/google' // Assuming Inter font is desired, as in sidebar component
import './globals.css'
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  // SidebarFooter // Not used in this setup for now
} from '@/components/ui/sidebar'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import { MenuIcon, Sparkles } from 'lucide-react' // Added Sparkles for title

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Phonics Fun!', // Updated title
  description: 'Learn phonics with AI-powered fun!', // Updated description
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar className="border-r lg:border-r-0 lg:shadow-lg">
                <SidebarHeader>
                  <div className="flex items-center gap-2 p-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-purple-700">Phonics Fun!</h2>
                  </div>
                </SidebarHeader>
                <SidebarContent>
                  <MainNav />
                </SidebarContent>
                {/* <SidebarFooter>Footer content if needed</SidebarFooter> */}
              </Sidebar>
              <SidebarInset className="flex-1 bg-slate-50 dark:bg-slate-900"> {/* Added bg for contrast */}
                <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
                  <div className="flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-purple-500" />
                     <span className="text-lg font-semibold text-purple-700">Phonics Fun!</span>
                  </div>
                  <SidebarTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <MenuIcon className="h-6 w-6" />
                      <span className="sr-only">Toggle Sidebar</span>
                    </Button>
                  </SidebarTrigger>
                </header>
                <main className="p-4 sm:p-6 lg:p-8"> {/* Added padding to main content area */}
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
