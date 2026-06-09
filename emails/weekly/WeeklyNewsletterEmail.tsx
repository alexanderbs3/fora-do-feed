import { getAiNewsBrief, getWeeklyNewsletterIssue } from "./content";

type WeeklyNewsletterEmailProps = {
  name?: string;
  week?: number;
  unsubscribeUrl?: string;
};

export function WeeklyNewsletterEmail({ name = "Dev", week = 1, unsubscribeUrl = "#" }: WeeklyNewsletterEmailProps) {
  const issue = getWeeklyNewsletterIssue(week);
  const aiBrief = getAiNewsBrief(week);

  return (
    <html>
      <head />
      <body style={{ margin: 0, padding: 0, backgroundColor: "#080b12", color: "#f1e7d0", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden", opacity: 0 }}>{issue.preview}</div>
        <main
          style={{
            maxWidth: "672px",
            margin: "32px auto",
            padding: 0,
            backgroundColor: "#10141d",
            border: "1px solid #2d3327",
          }}
        >
          <section style={{ padding: "20px 32px", backgroundColor: "#d8ff3e", borderBottom: "1px solid #2d3327" }}>
            <p style={{ margin: 0, color: "#14110f", fontSize: "12px", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase" }}>
              Newsletter Técnica | Semana {issue.week}
            </p>
          </section>

          <section style={{ padding: "32px" }}>
            <p style={{ margin: "0 0 16px", color: "#d8ff3e", fontSize: "14px" }}>Olá, {name}.</p>
            <h1 style={{ margin: "0 0 24px", color: "#f8f0dc", fontSize: "36px", lineHeight: "38px", fontWeight: 900 }}>
              {issue.title}
            </h1>

            <p style={{ margin: "0 0 20px", color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>{issue.intro}</p>

            <section style={{ margin: "24px 0", padding: "16px 20px", backgroundColor: "rgba(255, 77, 29, 0.1)", borderLeft: "4px solid #ff4d1d" }}>
              <p style={{ margin: "0 0 8px", color: "#ffb29d", fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" }}>
                O problema
              </p>
              <p style={{ margin: 0, color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>{issue.problem}</p>
            </section>

            <p style={{ margin: "0 0 24px", color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>{issue.explanation}</p>

            <section style={{ margin: "24px 0", padding: "20px", backgroundColor: "#0b0f17", border: "1px solid #2d3327" }}>
              <p style={{ margin: "0 0 8px", color: "#d8ff3e", fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" }}>
                {issue.exampleTitle}
              </p>
              <p style={{ margin: 0, color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>{issue.example}</p>
            </section>

            <p style={{ margin: "0 0 12px", color: "#d8ff3e", fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" }}>
              Checklist da semana
            </p>
            {issue.checklist.map((item) => (
              <p key={item} style={{ margin: "0 0 8px", color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>
                - {item}
              </p>
            ))}

            <section style={{ margin: "32px 0", padding: "20px", backgroundColor: "rgba(216, 255, 62, 0.1)", border: "1px solid #d8ff3e" }}>
              <p style={{ margin: "0 0 12px", color: "#d8ff3e", fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" }}>
                Notícias de inteligência artificial
              </p>
              <h2 style={{ margin: "0 0 16px", color: "#f8f0dc", fontSize: "24px", lineHeight: "32px", fontWeight: 900 }}>{aiBrief.title}</h2>
              {aiBrief.items.map((item) => (
                <p key={item} style={{ margin: "0 0 12px", color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>
                  - {item}
                </p>
              ))}
            </section>

            <section style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #2d3327" }}>
              <p style={{ margin: 0, color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>{issue.closing}</p>
            </section>
          </section>

          <section style={{ padding: "20px 32px", borderTop: "1px solid #2d3327" }}>
            <p style={{ margin: 0, color: "rgba(241, 231, 208, 0.6)", fontSize: "12px", lineHeight: "20px" }}>
              Você recebeu este e-mail porque se inscreveu na Newsletter Técnica. Guarde esta mensagem e revise o
              checklist quando estiver praticando. Se quiser sair da lista, acesse: {unsubscribeUrl}
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}

export default WeeklyNewsletterEmail;
