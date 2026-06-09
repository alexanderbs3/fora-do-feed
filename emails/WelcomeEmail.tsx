interface WelcomeEmailProps {
  name?: string;
  unsubscribeUrl?: string;
}

const previewText = "Você está na lista: desenvolvimento prático e inteligência artificial sem enrolação.";

export const WelcomeEmail = ({ name = "Dev", unsubscribeUrl = "#" }: WelcomeEmailProps) => {
  return (
    <html>
      <head />
      <body style={{ margin: 0, padding: 0, backgroundColor: "#080b12", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden", opacity: 0 }}>{previewText}</div>
        <main
          style={{
            maxWidth: "576px",
            margin: "32px auto",
            padding: 0,
            backgroundColor: "#10141d",
            border: "1px solid #2d3327",
          }}
        >
          <div style={{ backgroundColor: "#d8ff3e", padding: "20px 32px" }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, letterSpacing: "4px", color: "#14110f", textTransform: "uppercase" }}>
              Newsletter Técnica
            </p>
          </div>

          <div style={{ padding: "32px" }}>
            <h1 style={{ margin: "0 0 16px", color: "#f8f0dc", fontSize: "30px", lineHeight: "36px", fontWeight: 900 }}>
              Olá, {name}. Você está na lista.
            </h1>

            <p style={{ margin: "0 0 16px", color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>
              Obrigado por se inscrever. Você vai receber uma curadoria semanal para evoluir como dev iniciante ou
              intermediário, com explicações práticas sobre código, arquitetura, produção e inteligência artificial.
            </p>

            <p style={{ margin: "0 0 24px", color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>
              A ideia é simples: menos hype, mais entendimento. Cada edição traz um tema técnico, um checklist para
              praticar e uma seção de IA no radar.
            </p>

            <div style={{ marginBottom: "24px", padding: "16px 20px", backgroundColor: "#0b0f17", border: "1px solid #2d3327" }}>
              <p style={{ margin: "0 0 8px", color: "#d8ff3e", fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" }}>
                O que vem agora
              </p>
              <p style={{ margin: 0, color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>
                Amanhã você recebe a primeira edição. Depois disso, os próximos conteúdos chegam uma vez por semana.
              </p>
            </div>

            <p style={{ margin: 0, color: "#f1e7d0", fontSize: "16px", lineHeight: "28px" }}>
              Se quiser aproveitar melhor, responda mentalmente a cada edição: onde eu aplicaria isso em um projeto
              real?
            </p>
          </div>

          <div style={{ padding: "20px 32px", borderTop: "1px solid #2d3327" }}>
            <p style={{ margin: 0, color: "rgba(241, 231, 208, 0.6)", fontSize: "12px", lineHeight: "20px" }}>
              Você recebeu este e-mail porque se cadastrou em nossa landing page. Se deseja parar de receber estas
              atualizações, basta{" "}
              <a href={unsubscribeUrl} style={{ color: "#d8ff3e", fontWeight: 500, textDecoration: "underline" }}>
                cancelar a inscrição aqui
              </a>
              .
            </p>
          </div>
        </main>
      </body>
    </html>
  );
};

export default WelcomeEmail;
