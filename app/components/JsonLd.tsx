export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Fora do Feed",
          url: "https://fora-do-feed.com",
          description: "Curadoria de tecnologia, software e IA para devs iniciantes e intermediários.",
          inLanguage: "pt-BR",
          publisher: {
            "@type": "Organization",
            name: "Fora do Feed",
          },
        }),
      }}
    />
  );
}
