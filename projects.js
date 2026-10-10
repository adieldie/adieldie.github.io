export const projects = [
  {
    "id": "comparador-custos",
    "title": "Comparador de custos de compra",
    "category": "Dados",
    "tags": [
      "Python",
      "Tkinter",
      "CustomTkinter"
    ],
    "summary": "Comparação de propostas com embalagem, condições comerciais e histórico local.",
    "narrative": "O preço informado conta só uma parte da compra. Quantidade por embalagem e condições comerciais precisam entrar na mesma comparação.",
    "implementation": "A interface organiza produtos e cotações, calcula alternativas e salva o histórico. A evolução inclui memória de cálculo e cuidado com informações ausentes.",
    "outcome": "Interface e cálculos implementados em protótipo. Integração completa e avaliação prática ainda pendentes.",
    "status": "Protótipo",
    "techStack": [
      "Python",
      "Tkinter",
      "CustomTkinter",
      "JSON"
    ],
    "domain": "Dados e relatórios",
    "featured": false
  },
  {
    "id": "entrada-mercadorias",
    "title": "Entrada de mercadorias e lotes",
    "category": "Automação",
    "tags": [
      "Python",
      "SQL",
      "Selenium"
    ],
    "summary": "Conferência de itens e conversão de quantidades antes do lançamento.",
    "narrative": "Uma nota pode reunir embalagens e lotes diferentes. Automatizar a entrada exige preservar a identidade de cada item e permitir revisão.",
    "implementation": "O fluxo consulta notas, associa produtos, aplica fatores por nota e pede confirmação. As revisões tratam dupla conversão, reconferência de lotes e retomada após falhas.",
    "outcome": "Implementação e testes específicos presentes no código. O fluxo completo segue sujeito à validação no ambiente de uso.",
    "status": "Em validação",
    "techStack": [
      "Python",
      "SQL",
      "Selenium",
      "WebView"
    ],
    "domain": "Automação",
    "featured": true
  },
  {
    "id": "operacao-entregas",
    "title": "Operação e acompanhamento de entregas",
    "category": "Sistemas",
    "tags": [
      "Python",
      "APIs HTTP",
      "Interfaces web"
    ],
    "summary": "Família de painéis para pedidos, turnos, fechamentos e estado das automações.",
    "narrative": "Acompanhar uma operação exige que pedidos, relatórios e fechamento usem a mesma referência de turno, inclusive quando ele atravessa a madrugada.",
    "implementation": "As variantes reúnem consultas, relatórios, impressão e acompanhamento das rotinas. A evolução aborda atualização da interface, identificação dos registros e recuperação após interrupções.",
    "outcome": "Implementações e variantes documentadas, com revisão pendente em partes do conjunto. Operação integral não verificada.",
    "status": "Em evolução",
    "techStack": [
      "Python",
      "APIs HTTP",
      "Interfaces web"
    ],
    "domain": "Integrações",
    "featured": false
  },
  {
    "id": "relatorios-entregas",
    "title": "Relatórios semanais de entregas",
    "category": "Dados",
    "tags": [
      "Python",
      "Flask",
      "HTTP"
    ],
    "summary": "Consulta por semana operacional, exportação de planilhas e impressão.",
    "narrative": "Um fechamento precisa permitir a revisão dos registros que compõem cada período, sem mudar o recorte entre a tela e o relatório.",
    "implementation": "A aplicação oferece navegação entre semanas, consulta por integração, cache de leitura e controle de geração de arquivos.",
    "outcome": "Rotinas de consulta e relatório implementadas. A geração e a impressão ainda precisam de validação no ambiente de uso.",
    "status": "Em validação",
    "techStack": [
      "Python",
      "Flask",
      "HTTP",
      "Planilhas"
    ],
    "domain": "Dados e relatórios",
    "featured": false
  },
  {
    "id": "apoio-entregadores",
    "title": "Apoio móvel a entregadores",
    "category": "Sistemas",
    "tags": [
      "JavaScript",
      "Node.js",
      "Express"
    ],
    "summary": "Interface web para consultar pedidos e acompanhar as etapas de uma entrega.",
    "narrative": "No celular, a identificação do pedido e a mudança de etapa precisam ser claras. Uma ação solicitada também precisa ser distinguida da confirmação do sistema.",
    "implementation": "A interface inclui câmera para leitura de códigos, pedidos ativos, retirada, devolução, finalização e consulta de comprovantes. Uma camada de integração processa as ações.",
    "outcome": "Rotas e ações implementadas. Compatibilidade entre aparelhos e fluxo completo seguem em validação.",
    "status": "Em validação",
    "techStack": [
      "JavaScript",
      "Node.js",
      "Express",
      "HTTP",
      "HTML"
    ],
    "domain": "Integrações",
    "featured": false
  },
  {
    "id": "conferencia-estoque",
    "title": "Conferência de estoque por câmera",
    "category": "Dados",
    "tags": [
      "Python",
      "Flask",
      "JavaScript"
    ],
    "summary": "Leitura de códigos, contagem e ajuste de quantidades em celular e tablet.",
    "narrative": "A conferência precisa identificar produto e quantidade corretamente, mesmo em uma tela pequena e com condições de leitura diferentes.",
    "implementation": "O painel combina câmera, busca de produtos, vínculo de fardos, histórico e retorno visual e sonoro. As revisões exploram foco, ângulo de leitura e organização da tela.",
    "outcome": "Painel implementado e em evolução. Sensibilidade do scanner e estabilidade móvel ainda precisam de confirmação em uso.",
    "status": "Em evolução",
    "techStack": [
      "Python",
      "Flask",
      "JavaScript",
      "Planilhas",
      "SSE"
    ],
    "domain": "Dados e relatórios",
    "featured": false
  },
  {
    "id": "diagnostico-impressao",
    "title": "Diagnóstico de impressão em rede",
    "category": "Sistemas",
    "tags": [
      "Python",
      "Windows",
      "Diagnóstico de rede"
    ],
    "summary": "Verificações de serviços, conectividade e filas com registro das ações de manutenção.",
    "narrative": "Uma falha de impressão pode ter origem na fila, no serviço, na rede ou na configuração. Investigar cada camada evita acumular tentativas sem contexto.",
    "implementation": "O aplicativo organiza diagnóstico por ambiente, ações de apoio à correção, backup e restauração de configurações, além de relatórios.",
    "outcome": "Implementação e testes de modelos presentes. As rotinas de reparo dependem das características e da revisão de cada ambiente.",
    "status": "Implementado",
    "techStack": [
      "Python",
      "Windows",
      "Diagnóstico de rede"
    ],
    "repositoryUrl": "https://github.com/adieldie/printrescue-windows",
    "domain": "Suporte técnico",
    "featured": true
  },
  {
    "id": "sincronizacao-estoque",
    "title": "Sincronização de estoque e disponibilidade",
    "category": "Sistemas",
    "tags": [
      "Python",
      "APIs HTTP",
      "JSON"
    ],
    "summary": "Regras por produto e categoria para coordenar disponibilidade entre sistemas.",
    "narrative": "O mesmo produto pode seguir limites diferentes em cada canal. Uma integração precisa respeitar essas regras e reconhecer quando nada mudou.",
    "implementation": "As rotinas consultam estados, aplicam políticas de quantidade e evitam atualizações repetidas. Logs e controle de concorrência apoiam o acompanhamento das operações.",
    "outcome": "Políticas e ciclos de sincronização implementados. Efeitos e regras precisam ser validados em cada configuração.",
    "status": "Em validação",
    "techStack": [
      "Python",
      "APIs HTTP",
      "JSON",
      "Logs"
    ],
    "domain": "Integrações",
    "featured": false
  },
  {
    "id": "campanhas-confirmacao",
    "title": "Campanhas com revisão e confirmação",
    "category": "Dados",
    "tags": [
      "Python",
      "APIs",
      "JSON"
    ],
    "summary": "Preparação e simulação de campanhas com aprovação ligada ao plano revisado.",
    "narrative": "Automatizar campanhas exige manter a revisão sobre o conteúdo e as alterações que serão enviadas. O plano aprovado precisa continuar sendo o plano executado.",
    "implementation": "O código valida dados, permissões e orçamento, simula alterações e vincula a confirmação à versão do plano. Há proteção contra reutilização e registro das operações.",
    "outcome": "Implementação e testes de restrição presentes. Integrações e execução completa ainda estão sujeitas à validação.",
    "status": "Em validação",
    "techStack": [
      "Python",
      "APIs",
      "JSON",
      "SQLite",
      "Hashes"
    ],
    "domain": "Marketing e tecnologia",
    "featured": true
  },
  {
    "id": "consulta-caixa",
    "title": "Consulta e conferência de caixa",
    "category": "Dados",
    "tags": [
      "Go",
      "HTTP",
      "JSON"
    ],
    "summary": "Protótipo desktop para reunir caixas, pedidos, pagamentos e ocorrências.",
    "narrative": "Consultar dados em telas separadas dificulta a conferência. Reuni-los exige preservar a diferença entre um registro encontrado e uma conclusão validada.",
    "implementation": "O aplicativo incorpora uma interface web e rotas locais de leitura. A evolução depende de estabelecer correspondências confiáveis entre registros de sistemas diferentes.",
    "outcome": "Consultas implementadas em protótipo. Motor de conciliação e classificação de divergências ainda pendentes.",
    "status": "Protótipo",
    "techStack": [
      "Go",
      "HTTP",
      "JSON",
      "Interfaces web"
    ],
    "domain": "Dados e relatórios",
    "featured": false
  },
  {
    "id": "simulador-operacoes",
    "title": "Simulador de operações bancárias",
    "category": "Estudos",
    "tags": [
      "Python",
      "Orientação a objetos",
      "JSON"
    ],
    "summary": "Orientação a objetos, regras de domínio e persistência em uma simulação didática.",
    "narrative": "Contas e movimentações simuladas oferecem um domínio claro para praticar como cada operação altera o estado e respeita suas regras.",
    "implementation": "Classes organizam usuários e contas. A interface inclui cadastro, autenticação, depósitos, saques, transferências e extrato, com persistência local.",
    "outcome": "Implementação didática para estudo de classes e regras de negócio. Não representa um serviço financeiro real.",
    "status": "Estudo",
    "techStack": [
      "Python",
      "Orientação a objetos",
      "JSON",
      "Interface gráfica"
    ],
    "repositoryUrl": "https://github.com/adieldie/Desafio-em-python-banco-POO",
    "domain": "Estudos",
    "featured": false
  },
  {
    "id": "api-assincrona",
    "title": "API assíncrona de operações simuladas",
    "category": "Estudos",
    "tags": [
      "Python",
      "FastAPI",
      "SQLAlchemy"
    ],
    "summary": "Estudo de autenticação, rotas e persistência assíncrona no back-end.",
    "narrative": "Uma API precisa manter coerência entre identidade, acesso aos dados e atualização de estado. Operações simuladas permitem exercitar essas relações.",
    "implementation": "Rotas e esquemas organizam login, contas, depósitos, saques e extratos. As validações tratam valores e saldo antes de registrar a movimentação.",
    "outcome": "Base didática implementada, com espaço para aprofundar testes, erros e consistência das operações.",
    "status": "Estudo",
    "techStack": [
      "Python",
      "FastAPI",
      "SQLAlchemy",
      "API REST",
      "Autenticação por tokens"
    ],
    "repositoryUrl": "https://github.com/adieldie/desafio-APIs-Ass-ncronas-com-FastAPI",
    "domain": "Estudos",
    "featured": false
  },
  {
    "id": "atendimento-experimental",
    "title": "Experimentos de atendimento automatizado",
    "category": "Estudos",
    "tags": [
      "JavaScript",
      "TypeScript",
      "Node.js"
    ],
    "summary": "Exploração de integrações de mensagens e organização de fluxos de atendimento.",
    "narrative": "Tarefas repetitivas de atendimento motivaram a exploração de regras programadas e componentes de comunicação.",
    "implementation": "O material reúne dependências, scripts de adaptação e estudos de separação entre núcleo, processos e recursos opcionais. A aplicação principal ainda precisa ser consolidada.",
    "outcome": "Experimento incompleto no material auditado. Atendimento de ponta a ponta e integração completa não comprovados.",
    "status": "Experimento",
    "techStack": [
      "JavaScript",
      "TypeScript",
      "Node.js",
      "Express",
      "Eventos"
    ],
    "domain": "Estudos",
    "featured": false
  },
  {
    "id": "ciclo-pedidos",
    "title": "Ciclo de pedidos no navegador",
    "category": "Automação",
    "tags": [
      "JavaScript"
    ],
    "summary": "Ações sequenciais, impressão e verificações do estado de pedidos.",
    "narrative": "Um pedido aceito pode continuar visível na tela. A automação precisa reconhecer o estado real antes de repetir uma ação.",
    "implementation": "Os scripts tratam um pedido por vez, registram o que já foi processado e controlam a atualização da página. Edições, cancelamentos e finalizações seguem verificações próprias.",
    "outcome": "Scripts e testes parciais registrados. A última sequência completa ainda precisa de validação operacional.",
    "status": "Validação parcial",
    "techStack": [
      "JavaScript"
    ],
    "domain": "Automação",
    "featured": false
  },
  {
    "id": "retornaveis-entrega",
    "title": "Controle de retornáveis por entrega",
    "category": "Automação",
    "tags": [
      "JavaScript"
    ],
    "summary": "Relação entre embalagens, pedidos, responsáveis e confirmação de retorno.",
    "narrative": "A entrega pode terminar enquanto uma embalagem ainda precisa retornar. A pendência deve continuar ligada ao pedido e ao responsável.",
    "implementation": "As revisões passaram da leitura da tela aos dados do pedido, filtram casos sem responsável e procuram evitar registros repetidos após a confirmação.",
    "outcome": "Versões e ajustes documentados. A revisão mais recente ainda precisa ser validada em uso contínuo.",
    "status": "Validação parcial",
    "techStack": [
      "JavaScript"
    ],
    "domain": "Automação",
    "featured": false
  },
  {
    "id": "historico-catalogos",
    "title": "Histórico e auditoria de catálogos",
    "category": "Dados",
    "tags": [
      "JavaScript"
    ],
    "summary": "Comparação de leituras de preço, estoque e disponibilidade.",
    "narrative": "Um item ausente pode ter sido removido ou estar em uma página que não carregou. Comparar catálogos exige primeiro verificar a cobertura da leitura.",
    "implementation": "As rotinas evoluíram com paginação persistente, armazenamento e filtros. Histórico de consultas e histórico de mudanças são tratados separadamente.",
    "outcome": "Implementações com verificações parciais. Variação de estoque não é interpretada automaticamente como venda.",
    "status": "Validação parcial",
    "techStack": [
      "JavaScript"
    ],
    "domain": "Dados e relatórios",
    "featured": false
  },
  {
    "id": "manutencao-cadastros",
    "title": "Manutenção controlada de cadastros",
    "category": "Automação",
    "tags": [
      "JavaScript"
    ],
    "summary": "Alterações em catálogo com filtros, exceções e acompanhamento de progresso.",
    "narrative": "Ao alterar vários produtos, uma exceção ignorada pode propagar uma regra incorreta. O conjunto elegível precisa estar bem delimitado.",
    "implementation": "Os scripts consideram categoria, unidade e embalagem, percorrem páginas e evitam gravações idênticas. Desativação e envio à lixeira são etapas distintas.",
    "outcome": "Código entregue e sintaxe parcialmente verificada. As últimas gravações ainda precisam de homologação.",
    "status": "Validação parcial",
    "techStack": [
      "JavaScript"
    ],
    "domain": "Automação",
    "featured": false
  },
  {
    "id": "vinculos-catalogos",
    "title": "Conferência de vínculos entre catálogos",
    "category": "Dados",
    "tags": [
      "JavaScript"
    ],
    "summary": "Consulta em leitura para identificar associações corretas, ausentes ou divergentes.",
    "narrative": "Nomes parecidos não garantem um vínculo correto. A comparação precisa usar o item efetivamente associado e a referência esperada.",
    "implementation": "A lógica localiza o produto, lê o vínculo e compara os campos correspondentes, sinalizando também associações múltiplas para revisão.",
    "outcome": "Comparação documentada. A execução completa da versão final ainda não foi confirmada.",
    "status": "Validação parcial",
    "techStack": [
      "JavaScript"
    ],
    "domain": "Dados e relatórios",
    "featured": false
  },
  {
    "id": "pagamento-compartilhado",
    "title": "Apoio ao registro e pagamento compartilhado",
    "category": "Automação",
    "tags": [
      "JavaScript"
    ],
    "summary": "Recálculo de saldo por participantes restantes e respeito às escolhas do operador.",
    "narrative": "Depois que uma pessoa paga sua parte, a divisão precisa considerar quem ainda falta pagar. Mudanças na tela não devem sobrescrever uma escolha recente.",
    "implementation": "Os ajustes acompanham participantes e registros concluídos. Também distinguem tipos de lançamento para manter o contexto do formulário.",
    "outcome": "Código e testes parciais. Homologação completa pendente; o escopo é apoio ao registro operacional.",
    "status": "Validação parcial",
    "techStack": [
      "JavaScript"
    ],
    "domain": "Automação",
    "featured": false
  },
  {
    "id": "formularios-etapas",
    "title": "Assistente para formulários em etapas",
    "category": "Automação",
    "tags": [
      "JavaScript"
    ],
    "summary": "Fila de itens e preenchimento acompanhado conforme o caminho do formulário.",
    "narrative": "Cadastros semelhantes podem exigir campos diferentes. Repetir uma sequência fixa de cliques deixa de funcionar quando o formulário muda.",
    "implementation": "A lógica mantém os dados e o estágio de cada item, reconhece os campos no contexto atual e distingue avançar de concluir o envio.",
    "outcome": "Script entregue com revisões de fluxo. A cobertura de todos os caminhos ainda precisa ser validada.",
    "status": "Validação parcial",
    "techStack": [
      "JavaScript"
    ],
    "domain": "Automação",
    "featured": false
  },
  {
    "id": "movimentacoes-estoque",
    "title": "Auditoria de movimentações de estoque",
    "category": "Dados",
    "tags": [
      "JavaScript"
    ],
    "summary": "Protótipo para relacionar itens vendidos, cadastros e movimentos por período.",
    "narrative": "Uma diferença de estoque precisa vir acompanhada da forma como foi calculada. O item comercial nem sempre corresponde diretamente ao cadastro que movimenta o saldo.",
    "implementation": "A análise procura resolver vínculos antes de comparar quantidades, separando consulta e exportação. A reconstrução de saldo depende da qualidade do histórico.",
    "outcome": "Leituras e vínculos parcialmente implementados. Reconstrução completa pendente, sem atribuir automaticamente causas às diferenças.",
    "status": "Protótipo",
    "techStack": [
      "JavaScript"
    ],
    "domain": "Dados e relatórios",
    "featured": false
  },
  {
    "id": "documentacao-tecnica",
    "title": "Organização de documentação técnica",
    "category": "Sistemas",
    "tags": [
      "JavaScript"
    ],
    "summary": "Índice e exportação estruturada de referências públicas para consulta.",
    "narrative": "A documentação pode estar distribuída entre páginas e recursos, em vez de uma única especificação. Encontrar a estrutura real é parte da integração.",
    "implementation": "O trabalho identifica o índice, relaciona páginas e prepara a coleta para consulta offline, preservando a origem das referências.",
    "outcome": "Script de coleta entregue. A cobertura completa da exportação ainda precisa ser conferida.",
    "status": "Validação parcial",
    "techStack": [
      "JavaScript"
    ],
    "domain": "Suporte técnico",
    "featured": false
  },
  {
    "id": "relatorios-marketing",
    "title": "Relatórios de marketing por unidade",
    "category": "Dados",
    "tags": [
      "CSV"
    ],
    "summary": "Organização de arquivos e registros por unidade e período para apoiar comparações.",
    "narrative": "Antes de comparar resultados, é preciso saber de onde veio cada informação e a qual período ela pertence.",
    "implementation": "O desenvolvimento reúne importação de CSV com prévia, registros manuais e preparação de relatórios. A coleta automática é uma integração separada, dependente de acesso e validação.",
    "outcome": "Projeto em desenvolvimento. Integração e uso prático ainda precisam de validação, sem resultados de desempenho atribuídos.",
    "status": "Em desenvolvimento",
    "techStack": [
      "CSV"
    ],
    "domain": "Marketing e tecnologia",
    "featured": false
  },
  {
    "id": "agente-tecnico-local",
    "title": "Experimentos com agente técnico local",
    "category": "Estudos",
    "tags": [
      "Inferência local",
      "Integração",
      "Permissões"
    ],
    "summary": "Estudo de mensagens, inferência local e ferramentas de apoio a tarefas técnicas.",
    "narrative": "Ambientes diferentes precisam ser verificados separadamente. Modelos, processos e permissões não podem ser presumidos a partir de outra instalação.",
    "implementation": "A proposta separa o serviço de inferência da camada de ferramentas e explora sua integração com mensagens, diagnóstico e scripts.",
    "outcome": "Frente de estudo e experimentação. Integração completa e operação autônoma não confirmadas.",
    "status": "Experimento",
    "techStack": [],
    "domain": "Estudos",
    "featured": false
  },
  {
    "id": "fundamentos-web",
    "title": "Interfaces com HTML, CSS e JavaScript",
    "category": "Estudos",
    "tags": [
      "HTML",
      "CSS",
      "JavaScript"
    ],
    "summary": "Prática de estrutura, apresentação e interação em uma página web.",
    "narrative": "Uma interface nasce da relação entre conteúdo, apresentação e comportamento. O estudo explora como essas camadas trabalham juntas.",
    "implementation": "HTML organiza os elementos, CSS define a apresentação e JavaScript permite trabalhar interações.",
    "outcome": "Exercício de aprendizado dos fundamentos web. Não é apresentado como sistema pronto para produção.",
    "status": "Estudo",
    "techStack": [
      "HTML",
      "CSS",
      "JavaScript"
    ],
    "domain": "Estudos",
    "featured": false
  }
];
