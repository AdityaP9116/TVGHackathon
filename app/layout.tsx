import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Grid-Guard POC',
    description: 'Automated Compute-Throttling System',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
