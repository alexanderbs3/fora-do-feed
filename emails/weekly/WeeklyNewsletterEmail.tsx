import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
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
    <Html>
      <Head />
      <Preview>{issue.preview}</Preview>
      <Tailwind>
        <Body className="m-0 bg-[#080b12] p-0 font-sans text-[#f1e7d0]">
          <Container className="mx-auto my-8 max-w-2xl rounded-none border border-[#2d3327] bg-[#10141d] p-0">
            <Section className="border-b border-[#2d3327] bg-[#d8ff3e] px-8 py-5">
              <Text className="m-0 text-xs font-bold uppercase tracking-[4px] text-[#14110f]">
                Newsletter Técnica | Semana {issue.week}
              </Text>
            </Section>

            <Section className="px-8 py-8">
              <Text className="m-0 mb-4 text-sm text-[#d8ff3e]">Olá, {name}.</Text>
              <Heading className="m-0 mb-6 text-4xl font-black leading-[1.02] tracking-[-2px] text-[#f8f0dc]">
                {issue.title}
              </Heading>

              <Text className="m-0 mb-5 text-base leading-7 text-[#f1e7d0]">{issue.intro}</Text>

              <Section className="my-6 border-l-4 border-[#ff4d1d] bg-[#ff4d1d]/10 px-5 py-4">
                <Text className="m-0 mb-2 text-xs font-bold uppercase tracking-[3px] text-[#ffb29d]">O problema</Text>
                <Text className="m-0 text-base leading-7 text-[#f1e7d0]">{issue.problem}</Text>
              </Section>

              <Text className="m-0 mb-6 text-base leading-7 text-[#f1e7d0]">{issue.explanation}</Text>

              <Section className="my-6 border border-[#2d3327] bg-[#0b0f17] px-5 py-5">
                <Text className="m-0 mb-2 text-xs font-bold uppercase tracking-[3px] text-[#d8ff3e]">
                  {issue.exampleTitle}
                </Text>
                <Text className="m-0 text-base leading-7 text-[#f1e7d0]">{issue.example}</Text>
              </Section>

              <Text className="m-0 mb-3 text-xs font-bold uppercase tracking-[3px] text-[#d8ff3e]">Checklist da semana</Text>
              {issue.checklist.map((item) => (
                <Text key={item} className="m-0 mb-2 text-base leading-7 text-[#f1e7d0]">
                  - {item}
                </Text>
              ))}

              <Section className="my-8 border border-[#d8ff3e] bg-[#d8ff3e]/10 px-5 py-5">
                <Text className="m-0 mb-3 text-xs font-bold uppercase tracking-[3px] text-[#d8ff3e]">
                  Notícias de inteligência artificial
                </Text>
                <Heading className="m-0 mb-4 text-2xl font-black leading-tight text-[#f8f0dc]">{aiBrief.title}</Heading>
                {aiBrief.items.map((item) => (
                  <Text key={item} className="m-0 mb-3 text-base leading-7 text-[#f1e7d0]">
                    - {item}
                  </Text>
                ))}
              </Section>

              <Section className="mt-8 border-t border-[#2d3327] pt-6">
                <Text className="m-0 text-base leading-7 text-[#f1e7d0]">{issue.closing}</Text>
              </Section>
            </Section>

            <Section className="border-t border-[#2d3327] px-8 py-5">
              <Text className="m-0 text-xs leading-5 text-[#f1e7d0]/60">
                Você recebeu este e-mail porque se inscreveu na Newsletter Técnica. Guarde esta mensagem e revise o
                checklist quando estiver praticando. Se quiser sair da lista, acesse: {unsubscribeUrl}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default WeeklyNewsletterEmail;
