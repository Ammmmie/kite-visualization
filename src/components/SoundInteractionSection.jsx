export default function SoundInteractionSection() {
  return (
    <section className="sound-interaction-section" aria-label="风筝声音交互">
      <div className="sound-interaction-section__frame">
        <iframe
          className="sound-interaction-section__iframe"
          src="/sound-interaction/index.html"
          title="风筝声音交互"
          loading="lazy"
          allow="camera; microphone; autoplay"
        />
      </div>
    </section>
  );
}
