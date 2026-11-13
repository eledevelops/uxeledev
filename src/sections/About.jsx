import FlowText from "../components/FlowText";

export default function About() {
  return (
    <section id="about" className="mx-auto flex max-w-case-study flex-col gap-10 px-6 py-16 lg:px-24 lg:py-32">
      <FlowText className="text-heading lg:text-heading-xl">
        <p>
          For over a decade, I've worked at the intersection of brand, design, and code — building visual identities,
          marketing systems, and the websites that <span className="">bring them to life</span>. Along the way, I've
          collaborated with global teams across multiple countries and cultures, helping companies establish and grow
          their presence in new markets.
        </p>
      </FlowText>
      <hr className="border-border" />
      <p className="text-body text-muted-foreground">
        Earlier in my career, as Multimedia Manager at <strong>MotionPoint</strong>, I worked directly with clients to
        globalize their websites — <strong>helping increase conversion rates by 20-40%</strong> on average while driving
        traffic growth in both existing and new markets. It's an experience that still shapes how I think about building
        for global audiences today.
      </p>
    </section>
  );
}
