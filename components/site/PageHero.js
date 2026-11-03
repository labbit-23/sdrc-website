import { TwContainer } from "@/components/site/tw-layout";

export default function PageHero({ title, subtitle }) {
  return (
    <section className="page-hero py-12 md:py-16">
      <TwContainer>
        <h1 className="mb-3 text-4xl font-extrabold leading-tight text-[#0a544f]">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-3xl text-base leading-relaxed text-slate-700 md:text-lg">
            {subtitle}
          </p>
        ) : null}
      </TwContainer>
    </section>
  );
}
