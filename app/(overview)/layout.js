import "@/app/globals.css";
import { inter } from "../ui/fonts";

export const metadata = {
  title: "Advanced-Todo-App",
  description: "Build a functional ToDo app with minimal features",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
