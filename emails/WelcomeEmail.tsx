import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name?: string;
  unsubscribeUrl?: string;
}

export const WelcomeEmail = ({ name = "Dev", unsubscribeUrl = "#" }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Você está na lista: desenvolvimento prático e inteligência artificial sem enrolação.</Preview>
      <Tailwind>
        <Body className="bg-[#080b12] font-sans m-0 p-0">
          <Container className="bg-[#10141d] my-8 mx-auto p-0 max-w-xl border border-[#2d3327]">
            <div className="bg-[#d8ff3e] px-8 py-5">
              <Text className="m-0 text-xs font-bold uppercase tracking-[4px] text-[#14110f]">Newsletter Técnica</Text>
            </div>

            <div className="px-8 py-8">
              <Heading className="text-3xl font-black text-[#f8f0dc] mb-4 tracking-tight leading-tight">
                Olá, {name}. Você está na lista.
              </Heading>

              <Text className="text-[#f1e7d0] text-base leading-7 mb-4">
                Obrigado por se inscrever. Você vai receber uma curadoria semanal para evoluir como dev iniciante ou
                intermediário, com explicações práticas sobre código, arquitetura, produção e inteligência artificial.
              </Text>

              <Text className="text-[#f1e7d0] text-base leading-7 mb-6">
                A ideia é simples: menos hype, mais entendimento. Cada edição traz um tema técnico, um checklist para
                praticar e uma seção de IA no radar.
              </Text>

              <div className="border border-[#2d3327] bg-[#0b0f17] px-5 py-4 mb-6">
                <Text className="m-0 mb-2 text-xs font-bold uppercase tracking-[3px] text-[#d8ff3e]">O que vem agora</Text>
                <Text className="m-0 text-[#f1e7d0] text-base leading-7">
                  Amanhã você recebe a primeira edição. Depois disso, os próximos conteúdos chegam uma vez por semana.
                </Text>
              </div>

              <Text className="text-[#f1e7d0] text-base leading-7 mb-0">
                Se quiser aproveitar melhor, responda mentalmente a cada edição: onde eu aplicaria isso em um projeto
                real?
              </Text>
            </div>

            <div className="border-t border-[#2d3327] px-8 py-5">
              <Text className="text-xs text-[#f1e7d0]/60 leading-5 m-0">
                Você recebeu este e-mail porque se cadastrou em nossa landing page. Se deseja parar de receber estas
                atualizações, basta{" "}
                <Link href={unsubscribeUrl} className="text-[#d8ff3e] underline font-medium">
                  cancelar a inscrição aqui
                </Link>
                .
              </Text>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
