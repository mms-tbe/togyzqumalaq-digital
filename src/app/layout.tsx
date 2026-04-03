import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "./globals.css";

const theme = createTheme({
  primaryColor: "indigo",
  fontFamily: "system-ui, -apple-system, sans-serif",
});

export const metadata: Metadata = {
  title: "Togyzqumalaq Digital",
  description: "Оцифровка турнирных бланков тогызкумалак с помощью AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
