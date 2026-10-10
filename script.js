const copy = {
  'pt-BR': {
    navAbout: 'Sobre', navSkills: 'Especialidades', navProject: 'Projeto', navCta: 'Vamos conversar <span aria-hidden="true">↗</span>',
    heroEyebrow: '<span class="pulse"></span> Disponível para desafios em qualidade', heroTitle: 'Qualidade que <em>move</em> produtos.',
    heroText: 'Sou <strong>Denner Santana</strong>, Senior QA Engineer com mais de 11 anos transformando requisitos complexos em experiências confiáveis — da API ao produto final.', heroProject: 'Conheça meu projeto <span aria-hidden="true">↓</span>',
    yearsQA: 'anos em QA', industries: 'setores de atuação', languages: 'idiomas profissionais',
    profileKicker: '01 — PERFIL', profileTitle: 'Estratégia de qualidade, com profundidade técnica.',
    profileText: 'Atuo conectando pessoas, processos e tecnologia para que qualidade deixe de ser uma etapa e passe a ser parte do produto. Minha experiência inclui seguros, fintech, agtech e varejo — ambientes que pedem rigor, contexto e colaboração.', contactMe: 'Fale comigo <span aria-hidden="true">→</span>', profileCaption: 'Denner Santana · Senior QA Engineer',
    skillsKicker: '02 — ESPECIALIDADES', skillsTitle: 'Do risco ao release,<br />com visão completa.',
    automationTitle: 'Automação de testes', automationText: 'Frameworks sustentáveis para web, mobile e serviços, com foco em cobertura útil e feedback rápido.',
    apiTitle: 'APIs & integrações', apiText: 'Validação funcional, regressiva e de contratos para garantir dados consistentes em cada ponto de integração.',
    performanceTitle: 'Performance & estratégia', performanceText: 'Planos orientados a risco, testes de carga e análise de gargalos para decisões de release mais seguras.',
    journeyKicker: '03 — TRAJETÓRIA', journeyTitle: 'Experiência que<br /><em>ganhou escala.</em>', currentRange: '2025 — atual',
    cardifText: 'Estratégia E2E, automação BDD, APIs e performance para produtos de seguros e finanças.', bayerText: 'Automação Cypress e Playwright, mobile testing e integração de qualidade ao CI/CD de uma plataforma agtech global.', legacyRole: 'QA em evolução <span>· Accenture, Neoris & BRQ</span>', legacyText: 'Base sólida em qualidade funcional, mobile, dados, relatórios e sistemas corporativos de alta criticidade.',
    projectKicker: '04 — PROJETO EM DESTAQUE', projectLabel: 'CYPRESS + JAVASCRIPT · AUTOMAÇÃO DE API', projectTitle: 'Uma suíte E2E para APIs feita para validar o que importa.', projectText: 'O <strong>CypressTestingAPI</strong> automatiza a API ServeRest em três jornadas de negócio completas. O projeto demonstra uma organização direta, isolada e reprodutível — sem depender do front-end.', viewRepo: 'Ver repositório <span aria-hidden="true">↗</span>', terminalStatus: '3 fluxos de API mapeados',
    authFlowTitle: 'Usuário & autenticação', authFlowText: 'Cria um usuário dinâmico, valida o cadastro e confirma a emissão do token de acesso.', productFlowTitle: 'Produtos com contexto', productFlowText: 'Autentica como administrador, cria produto com Faker e confirma sua presença na listagem.', cartFlowTitle: 'Carrinho ponta a ponta', cartFlowText: 'Orquestra usuários, produto e carrinho até o cancelamento, validando todo o ciclo.',
    structureKicker: 'O QUE A ESTRUTURA MOSTRA', structureTitle: 'Clareza no código.<br /><em>Confiança no resultado.</em>',
    domainTitle: 'Especificações por domínio', domainText: 'Os testes vivem em <code>cypress/e2e/api</code>, separados por fluxo de negócio. Isso deixa a manutenção e a leitura da suíte mais objetivas.', dynamicTitle: 'Dados que não envelhecem', dynamicText: '<code>@faker-js/faker</code> cria usuários e produtos novos a cada execução, reduzindo colisões e fortalecendo a independência dos testes.', configTitle: 'Configuração orientada a execução', configText: 'O <code>baseUrl</code>, o padrão de specs e os scripts <code>test</code>/<code>open</code> deixam claro como rodar a suíte em modo interativo ou headless.', validationTitle: 'Validações relevantes', validationText: 'Status HTTP, mensagens, tokens e dados de resposta são verificados junto com o comportamento esperado em cada etapa do fluxo.',
    contactEyebrow: '<span class="pulse"></span> Vamos construir qualidade', contactTitle: 'Tem um produto<br />que merece <em>confiança?</em>', footerLocation: 'QA Engineer · São Paulo, Brasil'
  },
  en: {
    navAbout: 'About', navSkills: 'Expertise', navProject: 'Project', navCta: 'Let’s talk <span aria-hidden="true">↗</span>',
    heroEyebrow: '<span class="pulse"></span> Open to quality engineering challenges', heroTitle: 'Quality that <em>moves</em> products.',
    heroText: 'I’m <strong>Denner Santana</strong>, a Senior QA Engineer with 11+ years of experience turning complex requirements into reliable experiences — from API to end product.', heroProject: 'Explore my project <span aria-hidden="true">↓</span>',
    yearsQA: 'years in QA', industries: 'industries served', languages: 'professional languages',
    profileKicker: '01 — PROFILE', profileTitle: 'Quality strategy, backed by technical depth.',
    profileText: 'I connect people, processes, and technology so that quality becomes part of the product, not just a stage. My experience spans insurance, fintech, agtech, and retail — environments that demand rigor, context, and collaboration.', contactMe: 'Get in touch <span aria-hidden="true">→</span>', profileCaption: 'Denner Santana · Senior QA Engineer',
    skillsKicker: '02 — EXPERTISE', skillsTitle: 'From risk to release,<br />with end-to-end vision.',
    automationTitle: 'Test automation', automationText: 'Sustainable frameworks for web, mobile, and services, focused on meaningful coverage and fast feedback.',
    apiTitle: 'APIs & integrations', apiText: 'Functional, regression, and contract validation to ensure consistent data at every integration point.',
    performanceTitle: 'Performance & strategy', performanceText: 'Risk-driven plans, load testing, and bottleneck analysis for safer release decisions.',
    journeyKicker: '03 — EXPERIENCE', journeyTitle: 'Experience built<br /><em>to scale.</em>', currentRange: '2025 — present',
    cardifText: 'E2E strategy, BDD automation, API, and performance testing for insurance and financial products.', bayerText: 'Cypress and Playwright automation, mobile testing, and CI/CD quality integration for a global agtech platform.', legacyRole: 'Growing in QA <span>· Accenture, Neoris & BRQ</span>', legacyText: 'A solid foundation in functional quality, mobile, data, reporting, and highly critical corporate systems.',
    projectKicker: '04 — FEATURED PROJECT', projectLabel: 'CYPRESS + JAVASCRIPT · API AUTOMATION', projectTitle: 'An E2E API suite built to validate what matters.', projectText: '<strong>CypressTestingAPI</strong> automates the ServeRest API across three complete business journeys. It demonstrates a direct, isolated, and reproducible structure — with no front-end dependency.', viewRepo: 'View repository <span aria-hidden="true">↗</span>', terminalStatus: '3 mapped API flows',
    authFlowTitle: 'User & authentication', authFlowText: 'Creates a dynamic user, validates registration, and confirms access-token issuance.', productFlowTitle: 'Products with context', productFlowText: 'Authenticates as an administrator, creates a product with Faker, and confirms it appears in the listing.', cartFlowTitle: 'End-to-end cart', cartFlowText: 'Orchestrates users, product, and cart through cancellation, validating the full lifecycle.',
    structureKicker: 'WHAT THE STRUCTURE SHOWS', structureTitle: 'Clarity in code.<br /><em>Confidence in outcomes.</em>',
    domainTitle: 'Domain-based specifications', domainText: 'Tests live in <code>cypress/e2e/api</code>, organized by business flow. This makes suite maintenance and comprehension more straightforward.', dynamicTitle: 'Data that stays fresh', dynamicText: '<code>@faker-js/faker</code> creates new users and products on every run, reducing collisions and strengthening test independence.', configTitle: 'Execution-ready configuration', configText: 'The <code>baseUrl</code>, spec pattern, and <code>test</code>/<code>open</code> scripts make it clear how to run the suite interactively or headlessly.', validationTitle: 'Meaningful assertions', validationText: 'HTTP status codes, messages, tokens, and response data are verified together with the expected behavior at every flow step.',
    contactEyebrow: '<span class="pulse"></span> Let’s build quality together', contactTitle: 'Have a product<br />that deserves <em>confidence?</em>', footerLocation: 'QA Engineer · São Paulo, Brazil'
  }
};

const setLanguage = (language) => {
  const dictionary = copy[language];
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = dictionary[element.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => { element.innerHTML = dictionary[element.dataset.i18nHtml]; });
  document.querySelectorAll('.language-button').forEach((button) => {
    const active = button.dataset.language === language;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active);
  });
  localStorage.setItem('portfolio-language', language);
};

document.querySelectorAll('.language-button').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
setLanguage(localStorage.getItem('portfolio-language') || 'pt-BR');

const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.main-nav');
menuButton.addEventListener('click', () => { const isOpen = nav.classList.toggle('is-open'); menuButton.setAttribute('aria-expanded', isOpen); });
document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => { nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); }));

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
