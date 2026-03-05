import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.jpg"
          alt="Bistrupgårdsvej 1"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top spacer */}
        <div className="flex-1" />

        {/* Text block */}
        <div className="px-6 sm:px-10 pb-16 sm:pb-20 max-w-2xl">
          <h1 className="heading text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
            Bistrup Byggeprojekt
          </h1>
          <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-2 drop-shadow-md">
            Foråret og sommeren 2026 forvandler vi Bistrupgårdsvej 1. To nye
            badeværelser, en kælder der bliver til et sted man faktisk har lyst
            til at være — og en masse beslutninger undervejs. Her kan du følge
            med i hvad der er besluttet, hvad der mangler, og hvor langt vi er.
          </p>
          <p className="text-sm text-white/60 mb-8 drop-shadow-md">
            Bistrupgårdsvej 1 — Forår/Sommer 2026
          </p>

          <Link
            href="/oversigt"
            className="inline-flex items-center gap-2 bg-white text-text-primary font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl hover:bg-cream transition-all duration-200"
          >
            Se Detaljerne
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="mt-0.5"
            >
              <path
                d="M7 4l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
