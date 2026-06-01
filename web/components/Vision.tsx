export default function Vision() {
  return (
    <section className="relative z-10 py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p
          className="text-[10px] uppercase tracking-[0.5em] mb-6"
          style={{ color: "var(--gold-accent)" }}
        >
          The Vision
        </p>
        <h2
          className="font-serif font-medium leading-[1.1] tracking-tight"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
            color: "var(--text-primary)",
          }}
        >
          That the Word of God would actually be understood — in its{" "}
          <em style={{ color: "var(--accent-primary)" }}>true context</em>.
        </h2>
        <p
          className="mt-8 text-lg leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Most Bible apps give you the text and stop there. Bible in Context gives
          you the tools the early church, the reformers, and every serious student
          of Scripture has used for centuries — cross-references, the original
          Greek and Hebrew, lexicons, and verse-type awareness — in your pocket,
          for free.
        </p>
      </div>
    </section>
  );
}
