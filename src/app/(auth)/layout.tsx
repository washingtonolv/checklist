import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section
        className="flex items-center justify-center bg-[#07547d] px-4 py-6 sm:p-8 lg:sticky lg:top-0 lg:h-[100dvh] lg:p-6"
        aria-label="Apresentação do Checklist Operacional D&D"
      >
        <Image
          src="/brand/login-operacional.webp"
          alt="D&D Cosméticos — a rotina das lojas em um só lugar: checklists diários, evidências fotográficas, correções e indicadores de desempenho."
          width={1282}
          height={1227}
          priority
          sizes="(min-width: 1024px) 52vw, (min-width: 640px) 640px, 100vw"
          className="h-auto w-full max-w-[640px] lg:max-h-full lg:w-auto lg:max-w-full lg:object-contain"
        />
      </section>

      <section className="flex flex-col justify-center bg-surface px-5 py-10 sm:px-10 lg:min-h-[100dvh] lg:px-16">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </section>
    </div>
  );
}
