import GlowBackground from "@/components/effects/GlowBackground";
import Image from "next/image";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-r from-slate-50 to-sky-100">
      <GlowBackground />

      {/* Header */}
      <header className="absolute top-6 left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <Image
            src="/logo.svg"
            alt="Teach Platform"
            width={36}
            height={36}
          />

          <span className="font-bold text-xl text-blue-600">
            TeachPlatform
          </span>
        </Link>
      </header>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        {children}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-5 left-0 right-0 flex flex-col md:flex-row justify-between px-8 text-xs text-gray-500 gap-4">
        <span>
          © 2026 Lumina Learning. Empowering Educators.
        </span>

        <div className="flex gap-6">
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
          <Link href="#">Help Center</Link>
        </div>
      </footer>
    </main>
  );
}