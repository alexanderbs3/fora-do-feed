export type WeeklyNewsletterIssue = {
  week: number;
  subject: string;
  preview: string;
  title: string;
  intro: string;
  problem: string;
  explanation: string;
  exampleTitle: string;
  example: string;
  checklist: string[];
  closing: string;
};

export type AiNewsBrief = {
  week: number;
  title: string;
  items: string[];
};

export const weeklyNewsletterIssues: WeeklyNewsletterIssue[] = [
  {
    week: 1,
    subject: "Seu código precisa ser lido por outra pessoa",
    preview: "Código bom não é só código que funciona. Ele também precisa ser fácil de entender.",
    title: "Código Fácil De Entender",
    intro:
      "Quando estamos começando, é comum pensar que código bom é código que funciona. No trabalho real, isso é só o começo.",
    problem:
      "O problema aparece quando alguém precisa corrigir um bug, adicionar uma regra ou entender por que aquela função existe.",
    explanation:
      "Código fácil de entender usa nomes claros, funções com objetivos pequenos e uma organização que ajuda a leitura. A meta é reduzir o tempo que outra pessoa leva para entender sua intenção.",
    exampleTitle: "Exemplo prático",
    example:
      "Em vez de chamar uma função de processData, prefira algo como calculateMonthlyRevenue. O segundo nome conta uma história antes mesmo de alguém abrir a função.",
    checklist: [
      "O nome da variável explica o que ela guarda?",
      "O nome da função explica o que ela faz?",
      "A função faz uma coisa principal?",
      "Alguém entenderia esse trecho sem você explicar?",
    ],
    closing: "Nesta semana, escolha uma função antiga do seu projeto e melhore apenas os nomes. Esse pequeno ajuste já muda a manutenção.",
  },
  {
    week: 2,
    subject: "Código limpo não é código bonito",
    preview: "Código limpo é código que comunica intenção e facilita manutenção.",
    title: "O Que É Código Limpo",
    intro: "Código limpo não é sobre deixar tudo elegante. É sobre deixar o código menos confuso para quem vai manter depois.",
    problem:
      "Muitos devs tentam escrever código sofisticado cedo demais. O resultado costuma ser um código bonito por fora e difícil de mudar por dentro.",
    explanation:
      "Um código limpo deixa clara a intenção, evita duplicação desnecessária e não exige que você guarde muitos detalhes na cabeça ao mesmo tempo.",
    exampleTitle: "Uma regra simples",
    example:
      "Se você precisa explicar verbalmente o que um trecho faz, talvez o próprio código ainda não esteja comunicando bem.",
    checklist: [
      "Removi duplicações óbvias?",
      "Evitei nomes genéricos como data, item e temp?",
      "Separei regras diferentes em blocos claros?",
      "O código está simples ou apenas esperto?",
    ],
    closing: "Na próxima vez que refatorar, busque clareza antes de buscar elegância.",
  },
  {
    week: 3,
    subject: "Uma função não deveria fazer tudo",
    preview: "Separar responsabilidades deixa seu código mais fácil de testar, corrigir e evoluir.",
    title: "Separação De Responsabilidades",
    intro: "Uma função que faz tudo parece prática no começo, mas vira um ponto de confusão quando o projeto cresce.",
    problem:
      "Quando validação, cálculo, acesso a dados e formatação ficam misturados, qualquer mudança pequena pode quebrar algo inesperado.",
    explanation:
      "Separar responsabilidades significa dar a cada parte do código um motivo claro para existir. Isso facilita testes, revisão e manutenção.",
    exampleTitle: "Pense assim",
    example:
      "Uma função pode validar os dados. Outra pode salvar. Outra pode montar a resposta. Cada uma fica mais fácil de entender e substituir.",
    checklist: [
      "Essa função mistura regras diferentes?",
      "Ela acessa dados e também formata resposta?",
      "Eu consigo testar essa função isoladamente?",
      "O nome dela ainda combina com tudo que ela faz?",
    ],
    closing: "Se uma função está difícil de nomear, talvez ela esteja fazendo coisas demais.",
  },
  {
    week: 4,
    subject: "Nunca confie nos dados que chegam",
    preview: "Validação é uma das primeiras defesas de qualquer aplicação séria.",
    title: "Validação De Dados",
    intro: "Todo sistema recebe dados de algum lugar: formulário, API, banco, webhook ou usuário. Esses dados podem vir errados.",
    problem:
      "Quando o sistema confia em qualquer entrada, bugs simples viram falhas de segurança, erros difíceis de rastrear ou dados sujos no banco.",
    explanation:
      "Validação serve para garantir formato, obrigatoriedade, tamanho e regras básicas antes de processar qualquer informação.",
    exampleTitle: "No seu projeto atual",
    example:
      "O formulário da newsletter valida e-mail e nome antes de chamar o Resend. Isso evita envio com dados inválidos e melhora a mensagem para o usuário.",
    checklist: [
      "Campos obrigatórios são realmente validados?",
      "E-mails, números e datas têm formato conferido?",
      "O backend valida mesmo se o frontend já validou?",
      "A mensagem de erro ajuda a pessoa a corrigir?",
    ],
    closing: "Regra prática: frontend ajuda o usuário; backend protege o sistema.",
  },
  {
    week: 5,
    subject: "Erro bom é erro que ajuda",
    preview: "Mensagens de erro devem ajudar usuários e devs a entender o próximo passo.",
    title: "Tratamento De Erros",
    intro: "Erro não é exceção em software. Erro faz parte do caminho normal de qualquer aplicação usada por pessoas reais.",
    problem:
      "Mensagens como Algo deu errado frustram o usuário e também atrapalham o dev que precisa descobrir a causa depois.",
    explanation:
      "Um bom tratamento separa erros esperados de falhas inesperadas. Para usuários, mostre uma ação clara. Para devs, registre detalhes no log.",
    exampleTitle: "Exemplo simples",
    example:
      "Para usuário: E-mail inválido. Para o log: payload recebido, rota, status da API externa e mensagem técnica.",
    checklist: [
      "A mensagem diz o que a pessoa pode fazer agora?",
      "O log tem detalhes suficientes para investigar?",
      "Erros esperados são tratados sem quebrar a página?",
      "Dados sensíveis ficam fora da mensagem pública?",
    ],
    closing: "Um erro bem tratado reduz suporte, retrabalho e tempo perdido em debug.",
  },
  {
    week: 6,
    subject: "Uma API boa é fácil de usar e difícil de quebrar",
    preview: "APIs precisam de contratos claros, validação e respostas previsíveis.",
    title: "APIs Na Prática",
    intro: "Uma API é uma conversa entre sistemas. Como toda conversa, ela precisa de regras claras.",
    problem:
      "Quando rotas, respostas e erros são inconsistentes, o frontend precisa adivinhar o que aconteceu.",
    explanation:
      "Uma API boa define entradas, saídas, status HTTP e erros de forma previsível. Isso cria confiança entre quem consome e quem mantém.",
    exampleTitle: "Contrato básico",
    example:
      "Se um cadastro falha por validação, retornar 400 com mensagem clara é melhor do que retornar 200 com erro escondido no texto.",
    checklist: [
      "A rota tem um objetivo claro?",
      "O status HTTP combina com o resultado?",
      "O payload de resposta é previsível?",
      "Os erros seguem um formato consistente?",
    ],
    closing: "APIs boas reduzem dúvidas. APIs confusas espalham complexidade pelo sistema inteiro.",
  },
  {
    week: 7,
    subject: "Antes de otimizar, entenda seus dados",
    preview: "Banco de dados fica mais simples quando você entende entidades, relações e consultas.",
    title: "Banco De Dados Sem Mistério",
    intro: "Banco de dados não é só um lugar para guardar informações. Ele representa como seu sistema entende o mundo.",
    problem:
      "Modelagens apressadas criam duplicidade, consultas difíceis e regras espalhadas em lugares errados.",
    explanation:
      "Comece identificando entidades, relacionamentos e regras principais. Depois pense em performance, índices e otimizações.",
    exampleTitle: "Exemplo mental",
    example:
      "Antes de criar uma tabela subscriptions, pergunte: o que é uma inscrição? Ela pertence a um usuário? Tem status? Tem data de cancelamento?",
    checklist: [
      "Cada tabela representa uma ideia clara?",
      "Evitei duplicar dados sem necessidade?",
      "Relacionamentos importantes estão explícitos?",
      "As consultas mais comuns são simples de escrever?",
    ],
    closing: "Dados bem modelados deixam o código mais simples. Dados confusos empurram complexidade para todo lado.",
  },
  {
    week: 8,
    subject: "Login é só o começo da segurança",
    preview: "Segurança básica começa com cuidado em dados, permissões e configuração.",
    title: "Autenticação E Segurança Básica",
    intro: "Muita gente pensa em segurança apenas quando implementa login. Mas segurança aparece em várias partes do projeto.",
    problem:
      "Chaves expostas, permissões soltas e validação fraca são problemas comuns mesmo em projetos pequenos.",
    explanation:
      "Segurança básica envolve proteger segredos, validar entradas, limitar acesso e evitar expor dados sensíveis por acidente.",
    exampleTitle: "Exemplo direto",
    example:
      "Sua RESEND_API_KEY deve ficar no .env.local e nunca aparecer no frontend, em prints ou em repositórios públicos.",
    checklist: [
      "Segredos estão fora do código?",
      "Rotas protegidas verificam permissão?",
      "Dados sensíveis não aparecem no navegador?",
      "Entradas são validadas no backend?",
    ],
    closing: "Segurança não é um recurso final. É um hábito durante o desenvolvimento.",
  },
  {
    week: 9,
    subject: "Performance não começa com cache",
    preview: "Antes de otimizar, descubra onde realmente está o gargalo.",
    title: "Performance Para Iniciantes",
    intro: "Cache pode ajudar, mas não deve ser a primeira resposta para todo problema de performance.",
    problem:
      "Otimizar sem medir costuma gerar trabalho extra e pouca melhoria real.",
    explanation:
      "Performance começa com observação: tempo de resposta, tamanho do payload, queries lentas, imagens pesadas e renderizações desnecessárias.",
    exampleTitle: "Perguntas úteis",
    example:
      "A página demora por causa do servidor, da rede, do banco, do JavaScript ou das imagens? Cada causa pede uma solução diferente.",
    checklist: [
      "Medi antes de otimizar?",
      "O payload está maior do que precisa?",
      "As queries são simples e objetivas?",
      "Imagens e scripts estão pesando a página?",
    ],
    closing: "Performance boa vem de diagnóstico, não de tentativa aleatória.",
  },
  {
    week: 10,
    subject: "Arquitetura é organização, não decoração",
    preview: "Arquitetura ajuda quando reduz confusão. Ela atrapalha quando vira ritual.",
    title: "Arquitetura Sem Complicar",
    intro: "Arquitetura não precisa começar com nomes difíceis. Ela começa quando você organiza responsabilidades.",
    problem:
      "Projetos pequenos podem ficar complexos demais quando copiamos estruturas grandes sem entender o motivo.",
    explanation:
      "Boa arquitetura deixa claro onde ficam regras, componentes, acesso a dados e integrações externas. O objetivo é facilitar mudanças.",
    exampleTitle: "Regra prática",
    example:
      "Se uma pasta existe, ela deve ajudar alguém a encontrar ou alterar código com menos esforço.",
    checklist: [
      "A estrutura atual ajuda ou confunde?",
      "Regras de negócio estão espalhadas?",
      "Componentes sabem coisas demais?",
      "Consigo explicar a organização em poucos minutos?",
    ],
    closing: "Arquitetura boa desaparece no uso: você encontra o que precisa sem lutar contra o projeto.",
  },
  {
    week: 11,
    subject: "Rodar na sua máquina não é produção",
    preview: "Produção exige configuração, logs, ambiente e atenção aos erros reais.",
    title: "Deploy E Produção",
    intro: "Quando o projeto roda localmente, você controla quase tudo. Em produção, o ambiente cobra mais disciplina.",
    problem:
      "Variáveis ausentes, build quebrado, domínio mal configurado e logs ruins são problemas comuns no primeiro deploy.",
    explanation:
      "Preparar produção significa garantir build reproduzível, variáveis corretas, logs úteis e uma forma clara de investigar falhas.",
    exampleTitle: "Antes de publicar",
    example:
      "Rode npm run build, confira .env, teste fluxos principais e veja se mensagens de erro ajudam em vez de esconder tudo.",
    checklist: [
      "O build passa sem erros?",
      "As variáveis de ambiente estão configuradas?",
      "Existe log para falhas importantes?",
      "O domínio e serviços externos foram testados?",
    ],
    closing: "Produção não perdoa suposição. Quanto mais você verifica antes, menos apaga incêndio depois.",
  },
  {
    week: 12,
    subject: "Antes de entregar, revise isso",
    preview: "Um checklist simples para entregar projetos com mais confiança.",
    title: "Checklist Do Dev Mais Profissional",
    intro: "Profissionalismo em software aparece nos detalhes que reduzem risco para quem usa e para quem mantém.",
    problem:
      "Muitos projetos funcionam no caminho feliz, mas quebram quando usuário erra, serviço externo falha ou configuração muda.",
    explanation:
      "Um checklist antes da entrega ajuda você a revisar qualidade, segurança, usabilidade e manutenção sem depender só da memória.",
    exampleTitle: "Checklist final",
    example:
      "Antes de considerar pronto, teste fluxo feliz, erro de validação, falha externa, responsividade e build de produção.",
    checklist: [
      "Fluxos principais foram testados?",
      "Erros comuns têm mensagens úteis?",
      "Build e TypeScript passam?",
      "Segredos estão protegidos?",
      "A interface funciona no celular?",
    ],
    closing: "A diferença entre apenas funcionar e estar pronto costuma estar nessa revisão final.",
  },
];

export function getWeeklyNewsletterIssue(week: number) {
  return weeklyNewsletterIssues.find((issue) => issue.week === week) ?? weeklyNewsletterIssues[0];
}

export const aiNewsBriefs: AiNewsBrief[] = [
  {
    week: 1,
    title: "IA no radar: não é mágica, é ferramenta",
    items: [
      "Modelos de IA ajudam a acelerar pesquisa, rascunhos e revisão de código, mas ainda precisam de validação humana.",
      "Para devs iniciantes, o melhor uso é pedir explicações passo a passo e depois testar o entendimento escrevendo código sem copiar tudo.",
    ],
  },
  {
    week: 2,
    title: "IA no radar: cuidado com código que parece certo",
    items: [
      "Assistentes de IA podem gerar soluções convincentes com bugs sutis, principalmente em autenticação, datas, permissões e integrações externas.",
      "Antes de aceitar uma sugestão, rode testes, leia a documentação e entenda a lógica principal.",
    ],
  },
  {
    week: 3,
    title: "IA no radar: prompts melhores geram respostas melhores",
    items: [
      "Um prompt bom inclui contexto, objetivo, restrições e formato esperado da resposta.",
      "Em vez de pedir 'faça uma API', peça 'crie uma rota POST para newsletter usando Zod, retornando erros claros e sem expor segredos'.",
    ],
  },
  {
    week: 4,
    title: "IA no radar: validação continua obrigatória",
    items: [
      "Mesmo quando a entrada vem de uma IA, trate o resultado como dado não confiável.",
      "Se uma IA gera JSON, SQL, HTML ou código, valide formato, permissões e impacto antes de executar.",
    ],
  },
  {
    week: 5,
    title: "IA no radar: logs ajudam a usar IA com segurança",
    items: [
      "Produtos com IA precisam registrar falhas, latência e respostas inesperadas para investigação posterior.",
      "Evite salvar dados sensíveis em prompts e logs. O básico de privacidade continua valendo.",
    ],
  },
  {
    week: 6,
    title: "IA no radar: APIs de IA também têm contrato",
    items: [
      "Ao integrar modelos de IA, defina entrada, saída esperada, timeout, fallback e tratamento para respostas incompletas.",
      "Não deixe o frontend depender de texto livre quando o backend espera estrutura previsível.",
    ],
  },
  {
    week: 7,
    title: "IA no radar: dados bons importam mais que hype",
    items: [
      "Projetos de IA falham quando os dados são confusos, duplicados ou sem contexto suficiente.",
      "Antes de pensar em modelo, pense em qualidade, origem, permissão e organização dos dados.",
    ],
  },
  {
    week: 8,
    title: "IA no radar: segredos nunca entram no prompt",
    items: [
      "Nunca cole chaves de API, tokens, senhas ou dados privados em ferramentas de IA sem política clara de segurança.",
      "Quando pedir ajuda com erro, remova credenciais e substitua por placeholders.",
    ],
  },
  {
    week: 9,
    title: "IA no radar: custo e latência fazem parte da arquitetura",
    items: [
      "Chamadas para modelos de IA podem ser lentas e custar por uso. Isso muda decisões de UX, cache e filas.",
      "Nem toda interação precisa chamar um modelo grande. Às vezes regra simples resolve melhor.",
    ],
  },
  {
    week: 10,
    title: "IA no radar: arquitetura de produto com IA",
    items: [
      "Uma funcionalidade com IA precisa de camadas claras: coleta de contexto, chamada ao modelo, validação da resposta e fallback.",
      "Trate a IA como uma dependência externa: ela pode falhar, demorar ou responder fora do formato esperado.",
    ],
  },
  {
    week: 11,
    title: "IA no radar: colocar IA em produção exige observabilidade",
    items: [
      "Em produção, acompanhe taxa de erro, tempo de resposta, custo por chamada e qualidade percebida pelo usuário.",
      "Sem métrica, fica difícil saber se a IA está ajudando ou apenas deixando o produto mais caro.",
    ],
  },
  {
    week: 12,
    title: "IA no radar: checklist antes de lançar uma feature com IA",
    items: [
      "Verifique privacidade, limites de uso, fallback, logs, custo e validação da resposta antes de publicar.",
      "A pergunta final é simples: se a IA errar, o usuário e o sistema continuam seguros?",
    ],
  },
];

export function getAiNewsBrief(week: number) {
  return aiNewsBriefs.find((brief) => brief.week === week) ?? aiNewsBriefs[0];
}
