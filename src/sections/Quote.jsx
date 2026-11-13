import FlowText from "../components/FlowText";

export default function Quote() {
  return (
    <section id="quote" className="mx-auto flex max-w-case-study flex-col gap-10 px-6 py-16 lg:px-24 lg:py-32">
      <FlowText className="text-heading">
        <p className="lg:text-heading-xl">
          I worked directly with clients to globalize their websites — helping increase conversion rates by 20-40% on
          average while driving traffic growth in both existing and new markets.
        </p>
      </FlowText>
      <hr className="border-border" />
      <p className="text-body text-muted-foreground">
        It's an experience that still shapes how I think about building for global audiences today.
      </p>
    </section>
  );
}
