# Análise de Roteiro, Narrativa e Empacotamento: Referências Longform de Stickman 3D

Escopo: 12 vídeos de 5 canais stickman sem rosto. Isto cobre apenas roteiro, narração, estrutura e empacotamento (a análise visual é separada).
Data da análise: 2026-10-26. Todas as contagens de views vêm de metadados do yt-dlp, ou das listagens de canal em `research/meta`.

Nota: os títulos, falas e trechos de transcrição citados abaixo são dados reais de vídeos de canais concorrentes em inglês — foram mantidos no idioma original porque são evidência verbatim, não conteúdo nosso. Só o texto analítico (comentários, recomendações, metodologia) foi traduzido. As duas listas de "10 ideias originais" no final (nossas próprias propostas) foram traduzidas para português.

## Método e ressalvas

- **Legendas.** A Ifverse sobe legendas manuais limpas (`en.vtt`/`en.srt`), e eu usei essas para texto e tempo. Seus arquivos `en-orig` são ASR (reconhecimento de fala), que usei só para tags `[music]` e como conferência cruzada. Para a IFOLOGY e todo o cluster B, `en` e `en-orig` são a mesma faixa ASR em formato corrido, então eu deduplicei para a linha recém-adicionada de cada cue. spITWqYE53Y não tem faixa de legenda.
- **% sem narração.** É a soma de todas as lacunas maiores que 2 s entre intervalos de fala, incluindo qualquer entrada e cauda. Para ASR sem tempo por palavra, limitei o fim de fala de cada linha a uma estimativa de palavras × 0,28–0,42 s. O resultado é robusto: a IFOLOGY sai em 0–1% em todas as configurações. Na Ifverse, o ASR dá 15–23% e as legendas manuais dão 18–30%.
- **O Cluster B é efetivamente sem palavras.** Seu "roteiro" é texto na tela: legendas, texto de voz interior, balões de fala e contadores de HUD. Para esses filmes eu reconstruí o roteiro a partir dos capítulos da descrição, que são escritos como linhas de história, e das folhas de contato de visão geral de 24 quadros e gancho de 48 s em `research/sheets`. Não consegui contar as palavras na tela com exatidão, então as contagens são estimativas.
- **Nenhum dado de heatmap ou retenção** estava presente em nenhum info.json.
- **Todos os canais são muito jovens.** As datas de upload caem entre 2026-09-27 e 2026-10-26. O estouro de cada canal ficou entre seus primeiros 1–8 uploads, o que sugere um nicho que o algoritmo está empurrando ativamente agora, com imitadores chegando rápido (ver §6).
- **Ferramentas.** Os scripts estão em `scratchpad/tools`: `extract_meta.py`, `captions.py`, `compact.py`, `ngrams.py`, `turns.py`, `packaging.py`, `perminute.py`, `gap_sensitivity.py` e `shots.py`. Estatísticas derivadas (`stats.json`, `meta.json`, e as linhas do tempo de lacuna e música por vídeo `*.tags.txt`) estão em `research/derived`. Transcrições completas deduplicadas não são mantidas; executar `captions.py` contra `dl` as regenera.

## Resumo

- **Os dois clusters são produtos diferentes.**
  - **A ("E Se")** é uma história narrada em 2ª pessoa, tempo presente. A IFOLOGY corre do início ao fim a cerca de 185 wpm (palavras por minuto). A Ifverse é cortada e cinematográfica, a cerca de 100–115 wpm com 18–30% de trechos de ação silenciosos.
  - **B (motivacional)** é um filme silencioso: música mais texto na tela. Tem só 0–29 palavras faladas por filme, majoritariamente linhas de "voz interior" sussurradas, e 89–100% do tempo não tem narração.
- **Fórmula vencedora de A.** O vídeo abre com uma demonstração fria do poder de 5–15 s em um momento banal. Depois faz a pergunta do título literalmente entre 0:11 e 0:37, e entra em "veja como funciona" com números reais e ciência. Em seguida vem uma montagem de vantagens, depois uma virada de "mas" para regras e custos, com uma limitação plantada no início que paga depois. Um set piece de alto risco força uma escolha moral, muitas vezes "salvar a criança" contra o prêmio. O vídeo termina num gancho de recrutamento ou vilão e um CTA de comentário com duas perguntas.
- **Fórmula vencedora de B.** O filme abre com um card de título de uma linha que declara o defeito. Mostra um ritual de falha em loop com um HUD DIA-N ou de pontuação e uma "voz interior" sombra que sussurra tentações de 2–5 palavras. Depois vem o fundo do poço, uma minúscula ação de "Dia 1" e uma montagem de treino com uma recaída. O final é um bookend que reverte a linha de abertura, seguido de um aforismo de antítese e um card de título com um slogan de escolha binária.
- **Vencedores de empacotamento.**
  - A: "E Se Você [Fosse N× ___ / Pudesse ___ / Tivesse N ___]?" com um multiplicador concreto. Principais exemplos: Ifverse "Reaction Time Was 10x Faster" (4.5M, 15× a mediana do canal) e "500 IQ" (1.4M); IFOLOGY "10x Faster" (813K, 4.8× mediana).
  - B: uma palavra única EM CAIXA ALTA mais "| An Animated Short Film" (DISCIPLINE 5.1M, 55× mediana), ou "X Is Killing You." (1.0M). Luxúria/pornografia, disciplina e dopamina dominam.
- **Recomendação.** Faça do formato primário **A, de 8–10 min, no estilo Ifverse**: cerca de 1.250 palavras, esparso e contundente, com o andaime explícito de regras e problemas da IFOLOGY. Tem a mediana mais alta (171K–301K contra 34K–108K de B), um piso mais consistente, elegibilidade para mid-roll, uma matriz de temas ilimitada e mecânicas de série ou universo. **B** é uma pista secundária barata e de alta variância: ganha mais views por minuto produzido, mas é dependente de hits, curto (sem mid-rolls), seus temas são sensíveis a anúncios e os imitadores estão saturando.

---

## 0. Conjunto de dados

| Vídeo | Canal | Dur | Views | Idade (d) | Views/dia | Like % | Comentários/1k |
|---|---|---|---|---|---|---|---|
| MroF1XmHOZw "Reaction Time 10x Faster" | Ifverse | 7:13 | 4.58M | 19 | 241K | 1.18 | 0.70 |
| 4kHPfx6Gy00 "500 IQ" | Ifverse | 8:56 | 1.40M | 12 | 117K | 1.44 | 1.21 |
| B2kgO-UOs8w "5x Weaker Gravity (FULL MOVIE)" | Ifverse | 24:21 | 18.9K | <1 | n/a | 2.60 | 6.51 |
| y300HjYnHPw "10x Faster" | IFOLOGY | 10:19 | 813K | 11 | 74K | 0.91 | 0.60 |
| YznR5NmI3bc "Stop Time" | IFOLOGY | 10:10 | 592K | 10 | 59K | 1.36 | 1.31 |
| RxAhxw6Emec "Shapeshift" | IFOLOGY | 22:06 | 340K | 5 | 68K | 1.18 | 1.32 |
| 8atK0pF4oJY "DISCIPLINE" | Day One | 2:38 | 5.18M | 29 | 179K | 1.83 | 0.35 |
| WVBLVdNaJvo "Lust Is Killing You." | Day One | 3:20 | 1.02M | 8 | 127K | 1.47 | 0.95 |
| ZBOrlg7_YV0 "LUST VS LOVE" | Monk Mode | 2:51 | 2.15M | 8 | 269K | 1.79 | 1.02 |
| spITWqYE53Y "LUST PART 2" | Monk Mode | 3:31 | 552K | 9 | 61K | 1.17 | 0.97 |
| NeWlC4bJTMs "1 MINUTE" | Last Soul | 4:59 | 747K | 15 | 50K | 1.42 | 0.57 |
| C4D0wtHzLJM "He Was Always Connected…" | Last Soul | 5:33 | 19K | 12 | 1.6K | 1.98 | 3.83 |

---

## 1. Densidade de narração e silêncio

| Vídeo | Fonte do texto | Palavras faladas | WPM sobre a duração | Taxa de fala | Sem narração (lacunas > 2 s) | Primeira voz | Onde estão os silêncios |
|---|---|---|---|---|---|---|---|
| IFOLOGY y300 (10x Faster) | ASR | 1.917 | **186** | ~189 | **~0%** | 0:00 | nenhum; VO do início ao fim |
| IFOLOGY Yzn (Stop Time) | ASR | 1.833 | **180** | ~185 | **~1%** | 0:00 | uma lacuna de 6 s antes do CTA |
| IFOLOGY Rx (Shapeshift) | ASR | 4.262 | **193** | ~196 | **<1%** | 0:00 | nenhum |
| Ifverse MroF (Reaction 10x) | manual | 704 | **98** | ~165–200 | **30%** (ASR: 23%) | 0:01 | 10 lacunas ≥ 5 s, todas trechos de ação: pegadas, tênis de mesa, baseball, boxe (9 s), e o mergulho em 5:31 (10,6 s, a mais longa, na escolha moral) |
| Ifverse 4kHP (500 IQ) | manual | 1.021 | **114** | ~166 | **18%** (ASR: 15%) | 0:01 | muitas respiras de 2–5 s, mais 10,4 s (7:18, prisão/porta) e 13,8 s (8:20, revelação de digitação de hacker antes do gancho final) |
| Ifverse B2kgO (Full Movie) | manual | 1.529 | **63** | ~162 | **56%** | 0:06 | só diálogo, sem narrador; sequências silenciosas de 15–50 s (maravilhamento da chegada em 2:33–3:24, perseguição em 17:00–17:37, clímax em 18:33–19:21) |
| Day One 8atK (DISCIPLINE) | ASR | ~29* | 11 | n/a | **90%** | 0:16 | música o tempo todo; voz só em sussurros curtos ou fragmentos cantados |
| Day One WVBL (Lust Is Killing You) | ASR | 18 | 5 | n/a | **95%** | 0:47 | só os sussurros da "voz interior" (linhas de 2–3 palavras) |
| Monk Mode ZBO (LUST VS LOVE) | ASR | 1 | 0.4 | n/a | **99.6%** | 2:10 | um único "Oh." Todo o resto é música mais texto na tela |
| Monk Mode spIT (LUST PART 2) | nenhuma | n/a | n/a | n/a | (sem faixa de legenda; consistente com ausência de palavras) | n/a | n/a |
| Last Soul NeWl (1 MINUTE) | ASR | 5 | 1 | n/a | **99%** | ~2:00 | suspiros e respiração como SFX; diálogo aparece como texto de fala na tela |
| Last Soul C4D0 | ASR | 4 | 0.7 | n/a | **99%** | n/a | "Shh" duas vezes |

\*Parte do ASR de DISCIPLINE é provavelmente música vocal ou linhas de afirmação, não VO de história.

**Música.** No cluster A, o ASR insere uma tag `[music]` a cada 10–20 s durante todo o vídeo (32–58 tags por vídeo), o que significa uma trilha musical contínua sob a narração. Não há trechos só de música, exceto os trechos de ação da Ifverse listados acima. O cluster B é 100% guiado por música: cues `[music]` cobrem o filme inteiro, pontuadas por SFX diegético (`[bell]`, `[sighs and gasps]`, `[panting]`).

**Participação de diálogo em A.**
- IFOLOGY: cerca de 8–11% das palavras estão em falas curtas de personagem. São 23–65 falas por vídeo, ou uma piadinha a cada ~25 s, cada linha com 8 palavras ou menos.
- Ifverse: cerca de 20–25% das palavras são diálogo de personagem, estimado por leitura. Isso inclui falas de "ele" no universo de comentaristas e apresentadores de notícia que mostram a percepção pública.
- Ifverse full movie: 100% diálogo de personagem sem narrador, contado em 3ª pessoa.

**Palavras por plano** (dados de corte de `report.json`): IFOLOGY 9–17 palavras/plano a 11–21 cortes/min, Ifverse 8–10 palavras/plano a 11–12 cortes/min. Planeje aproximadamente um visual novo por frase ou duas.

---

## 2. Voz, ponto de vista, tempo verbal, tamanho de frase e tom

### Cluster A

| Métrica | IFOLOGY (3 vídeos) | Ifverse curto (2 vídeos) | Ifverse full movie |
|---|---|---|---|
| Ponto de vista / tempo verbal | 2ª pessoa, presente (~90% formas de "be" no presente) | 2ª pessoa, presente | 3ª pessoa, diálogo |
| Tamanho médio de frase (palavras) | 8,2–9,0 (mediana 7–8) | 4,6–5,1 (mediana 4) | 4,4 (mediana 4) |
| Frases ≤ 6 palavras | 40–46% | 70–80% | 79% |
| Frases ≥ 20 palavras | 3–7% (listas de montagem corridas) | 0% | <1% |
| Nível Flesch-Kincaid (aprox.) | 2,1–2,4 | 1,6–1,7 | 0,5 |
| Palavras polissilábicas | 3–5% | 5–6% | 3% |
| "you/your" por 100 palavras | 7,2–9,2 | 7,8 | 5,0 |
| Perguntas por minuto | 0,9–1,6 | 1,8–1,9 | 1,3 |
| "but" por minuto | 0,5–1,1 | 0,4–0,7 | 0,2 |

**A voz da IFOLOGY** é de um explicador tagarela, impassível, do universo adolescente.
- **Cenário.** As histórias acontecem na escola, em casa com a mãe e o melhor amigo, no futebol e na entrega de pizza, com referências de gamer e anime.
- **Fatos.** Toda vantagem ou problema está ancorado a um número ou estudo real: a velocidade máxima de um corredor famoso, a pegada de uma chita, o desvio de tempo do GPS, a lula-bode, os receptores do nariz de cachorro, contas de calorias.
- **Comédia.** As piadas funcionam como preparação, um duplo tempo impassível (uma afirmação curta, depois uma contradição curta), depois uma piadinha curta de personagem.
- **Virada de tom.** Por volta de 60% da duração o tom vira sério ou sombrio: um resgate, um arco de vilão, um amigo desaparecido.
- **Andaime explícito.** Estas são suas transições recorrentes, como padrões (só quatro são citadas literalmente):
  - "So, what if you…? Here's how it works." Esse é o pivô da abertura fria, usado nos 3 vídeos.
  - Um teaser para a parte estranha antes do fato científico.
  - Listas enumeradas de "Rule N" e "Problem N", com até 4 de cada por vídeo.
  - "Remember that. It matters later." Isso planta um callback; "remember" aparece 7× nos 3 vídeos.
  - "But here's the thing…", que prepara uma revelação de que os custos até então não são o problema real.
  - Uma ponte "for a while it works → and then one day…" para o set piece.
  - Uma ponte "that night, a knock at the door" para o gancho de universo.
  - Todo episódio fecha com "…because this is only the beginning", mais um slogan do canal.

**A voz da Ifverse** é uma voz de "trailer" cortada e cinematográfica que usa fragmentos, reticências e silêncio como tempo.
- **Dupletos de contraste numérico.** Um número de pessoa normal, depois um "You?" de uma palavra, depois um payoff de uma palavra ou um número.
- **Payoffs de uma palavra.** Um único verbo ou substantivo é repetido como ritmo ao longo de 3–4 eventos rápidos.
- **Enquadramento de listicle.** Um vídeo estrutura suas vantagens e custos como itens Mais/Menos. Sua tese tem duas palavras: "Amazing. And awful."
- **Batidas de custo.** Viradas de uma linha: uma pergunta ou afirmação de 2–3 palavras introduzindo o custo ou a pegadinha.
- **Cards de salto no tempo** ("N years/days later").
- **Núcleo emocional.** Família (uma mãe enganada e perde o fundo da faculdade) ou uma criança estranha, que leva a uma escolha moral enquadrada como um binário curto: "The ball… or the boy."
- **Callbacks.** Planta tiques de personagem no início (a animação nunca "faísca"; ri um tempo atrasado) e paga os dois no último minuto.

**O Ifverse full movie** é um gênero diferente: um drama de personagem (um jovem de 18 anos puxado para outro planeta, o segredo de uma mãe, uma lei e um vilão que vira aliado) carregado inteiramente por diálogo e sequências silenciosas. Usa uma saudação em língua inventada como refrão emocional, cerca de 10 vezes.

### Cluster B: gramática do texto e da voz interior

- **Cards do narrador.** Texto branco, 3ª pessoa no passado, 4–9 palavras por card, muitas vezes uma antítese de duas linhas com a segunda linha em negrito. A forma é "He had done X a thousand times. / He had never done Y once."
- **Voz interior.** Uma figura sombra ou demônio, vermelha no Day One e rosa/magenta no Monk Mode, aparece como texto escrito à mão e ocasionalmente como sussurro. Sempre fala linhas de 2–5 palavras, 2ª pessoa, tempo presente. Quatro táticas se alternam:
  1. adiamento ("tomorrow")
  2. ataque de identidade ("you're lazy")
  3. permissão ("you earned it")
  4. minimização (é só uma vez, já está perdido mesmo)

  Em LUST PART 2 a voz aprende a imitar a própria voz do herói, o que escala suas táticas.
- **Contadores de HUD** são um recurso de história: DAY 1 → DAY 412 → DAY 0, SEEN 1.512 / KNOWN 0 → KNOWN 1, alarme 5:00, 3:17 AM, bateria 1%, um calendário 10K-TODO-DIA riscado. O contador fornece progresso, compressão de tempo e a virada.
- **Texto diegético** carrega muita história e não precisa de VO: chats de celular, post-its, balões de fala.
- **Vocabulário** é de nível 1–2, com substantivos concretos (alarme, espelho, escada, guarda-chuva, sapatos).

**Diferenças por canal em B:**
- **Day One** tem um mundo minimalista preto puro, um demônio vermelho e um tema de substantivo abstrato.
- **Monk Mode** usa a mesma gramática com cor e demônios de "luxúria" rosa, e adiciona uma contraparte romântica. Seu estouro, LUST VS LOVE, é o único construído em torno de uma pessoa real para "admirar".
- **Last Soul** usa silhuetas e sets naturalistas. Depende mais de diálogo de personagem mostrado como fala na tela, temas de relacionamento e família, e um card de citação de filósofo. Dura mais (5–5,5 min).

---

## 3. Ganchos: primeiros 15, 30 e 60 segundos, e o payoff do título

### Cluster A (todos começam a falar no primeiro segundo)

| Vídeo | 0–15 s | 15–30 s | 30–60 s | Pergunta do título falada |
|---|---|---|---|---|
| Ifverse Reaction 10x (4.5M) | Duas demonstrações instantâneas: pega uma mosca, depois pega um copo caindo antes dele começar a cair (29 palavras) | A fala maravilhada de um amigo, depois o contraste estatístico: normal 0,25 s vs você 0,025 s (53 palavras até 0:30) | "Here's how it works" (cérebro rápido, músculos não), depois o teste de régua com contraste de 30 cm vs 3 mm | 0:34 |
| Ifverse 500 IQ (1.4M) | Demo de gadget: celular remontado no café da manhã, sinal no subsolo, chá ainda quente (38 palavras) | Fatos sobre a escala de QI (100 / 140 / 160), depois o "You?" + revelação de 500 (63 palavras) | Piada de diálogo com a mãe, depois a tese incrível/horrível em 0:48 | ~0:48 (paráfrase) |
| IFOLOGY 10x Faster (813K) | Atrasado para a escola, chega à carteira antes do sinal, depois uma piadinha de 2 linhas (50 palavras) | Mecanismo, mais o limite plantado: olhos e cérebro continuam normais, e isso importa depois (97 palavras) | Números de velocidade contra um carro e o corredor mais rápido do mundo, depois começa a cena do teste na pista | 0:11 |
| IFOLOGY Stop Time (592K) | Suco derramado congela no meio do ar e todo o refeitório congela (40 palavras) | Resolve o suco, o tempo volta, amigo confuso (84 palavras) | Ciência: ilusão de relógio parado, desvio do relógio do GPS, percepção animal (a virada dos "três problemas" vem depois, por volta de 1:30) | ~0:33 |
| IFOLOGY Shapeshift (340K) | Duas mães na cozinha; o pai faz um teste de identidade (54 palavras) | A voz de uma criança sai da "mãe"; o cachorro só late para você (100 palavras) | Ciência da lula-bode, depois a ideia de que o mundo todo se torna uma loja de fantasias | ~0:37 |
| Ifverse Full Movie (18.9K, <1 dia) | Acorda e insiste que é um sonho, depois 15 s de silêncio | Card de flashback para a Terra, mais cedo naquela noite | Diálogo de jantar de aniversário | nunca; sem declaração de premissa |

**Padrões:**
- **Mostre antes de contar.** Os primeiros 10–15 s são o poder do título resolvendo um problema trivial do dia a dia. É a promessa do título paga em miniatura, mais uma linha de reação de um espectador.
- **A pergunta do título é dita literalmente** entre 0:11 e 0:37, geralmente aberta com "So…" e seguida de "Here's how it works."
- **Até 0:30–0:60 há um número forte**, normal vs você, e muitas vezes um open loop antecipado: uma limitação plantada ou "Amazing. And awful."
- **Ritmo.** A IFOLOGY chega a ~180–200 palavras aos 60 s; a Ifverse a ~115–125 palavras mais 2–3 trechos visuais silenciosos.
- **O full movie pula tudo isso**, junto com uma linha de premissa e contraste numérico. Sua compilação predecessora (g61MZDcopSM) fez 24K contra 4.5M do original. Trate isso como aviso.

**Como a promessa do título é pagada:**
- Os primeiros 25% entregam um tour do poder (vantagens, números, comédia).
- O meio entrega os custos: a pergunta "isso é bom mesmo?".
- O set piece mostra o poder na escala máxima.
- A Ifverse vai além e paga a promessa escondida, "o que isso significaria?", por meio de uma escolha moral. Exemplos: perder a Copa do Mundo para salvar uma criança, ou um gênio que escolheu a invisibilidade usando-a uma vez, para a mãe dele.

### Cluster B

| Vídeo | 0–15 s | 15–30 s | 30–60 s | Payoff do título |
|---|---|---|---|---|
| DISCIPLINE (5.1M) | Card preto declarando a mesmice diária, depois cama, alarme e soneca, com um sussurro vermelho "5 more minutes" | Contador DAY 1 → DAY 27; demônio no sofá diz "tomorrow"; estudando, depois um sussurro de fadiga | Time-lapse de falha DAY 47 → 340, depois o espelho e um insulto de identidade | Day 1 em 1:00 (38%); card final "Day one, or one day." |
| LUST VS LOVE (2.1M) | Card de duas linhas: viu mil, nunca pegou numa mão; HUD SEEN 1.001 / KNOWN 0 | Rolando o feed às 3:17 AM, depois uma garota no ponto de ônibus enquanto o demônio a menospreza | SEEN continua subindo; um card contrasta rostos intermináveis no celular com o rosto único dela | KNOWN 0 → 1 no final, depois o card de aforismo |
| 1 MINUTE (747K) | Card de tema (planos grandes parecem melhores que passos pequenos), depois a loja de tênis e um plano diário exagerado de 10K | Compra os tênis; o plano 10K-TODO-DIA vai para a geladeira | Alarme 5:30, depois soneca mais texto de desculpa laranja e caixas riscadas | O vendedor pede só um minuto de corrida em 2:10 (44%) |

**Padrões:**
- O primeiro quadro é um card de título preto com uma linha de tema ou defeito.
- O contador de HUD está na tela em até 20 s.
- A voz antagonista aparece entre 15–30 s.
- A palavra do título é guardada até o card final, exceto em 1 MINUTE, onde o título é a linha do ponto de virada.

---

## 4. Estrutura de batidas

### A. Vídeo representativo: IFOLOGY "What IF You Were 10x Faster?" (10:19, 1.917 palavras)

| Tempo | % | Batida | Função |
|---|---|---|---|
| 0:00–0:10 | 0–2 | Abertura fria: na escola antes do sinal, mais uma piadinha de 2 linhas | Prova do poder, comédia |
| 0:11–0:28 | 2–5 | Pergunta do título, depois "Here's how it works"; pernas 10× mas **olhos, cérebro e reflexos normais: lembre-se disso** | Premissa + **limite plantado (open loop)** |
| 0:29–0:58 | 5–9 | Escada de números: 25 → 250 km/h, mais rápido que um carro na rodovia, passa o corredor mais rápido do mundo, 100 m em <1,5 s | Fatos de impacto |
| 0:58–1:18 | 9–13 | Teste na pista: piada de treinador e cronômetro | Primeira cena + reação de autoridade |
| 1:18–1:50 | 13–18 | Ciência real: estudo de esteira, tempo de contato do pé | Credibilidade |
| 1:50–2:43 | 18–26 | Montagem de vantagens: tarefas de casa, entrega de pizza (piada), piada do futebol onde a **bola fica atrás** (primeiro limite cômico), almoço em outra cidade | Diversão, escala crescente |
| 2:43–3:33 | 26–34 | "But then… the problems." **Problema 1: ar** (vento de força de furacão, arrasto ×100), solução = óculos de proteção; aparte da barreira do som | Virada de "mas", custo + solução |
| 3:33–3:49 | 34–37 | **Problema 2: tênis** se desgastam em uma semana | Custo |
| 3:49–4:24 | 37–43 | **Problema 3: comida** (~14.000 kcal/dia); mãe compra cereal gigante | Custo + piada |
| 4:24–5:41 | 43–55 | "Here's the thing… none of that is **the real problem**: stopping." **Callback ao limite plantado**: visão em tunel, 14 m de distância de reação, 300 m de frenagem, raios de curva; bate na piscina do vizinho | Riscos reais, open loop se aprofunda |
| 5:41–6:31 | 55–63 | Pesquisa e treino: pegada e cauda de chita, cravos, inclinação, mapa de cantos de perigo; regra central "desacelere antes de precisar" | Maestria / linha de tema |
| 6:31–6:49 | 63–66 | "For a while, it works. And then, one Saturday…": criança correndo atrás de uma bola, caminhão, motorista distraído | **Crise desencadeante** |
| 6:49–7:35 | 66–74 | A conta: freia 300 m antes, chega em velocidade de caminhada, criança salva, bola esmagada | **Clímax**: o limite é resolvido pela regra aprendida |
| 7:35–7:52 | 74–76 | Consequência: clipe viral com o título "Slowest Rescue Ever Recorded" | Reenquadramento irônico / prova social |
| 7:52–9:31 | 76–92 | Batida na porta: a mulher de casaco cinza e uma van de adolescentes com poderes, que são os poderes de episódios anteriores; "Project IF"; recrutado ("be home for dinner") | **Gancho de crossover de universo** |
| 9:31–10:05 | 92–97 | Alerta: o leitor de mentes não consegue ler a nova ameaça; uma rodovia de carros flutuando parados e uma figura olhando para a câmera | **Gancho final**, que prepara o próximo episódio (Stop Time) |
| 10:05–10:19 | 97–100 | Duas perguntas: o que você faria / quem é o vilão; inscreva-se; slogan | CTA |

**Ritmo:**
- Cerca de 22 batidas distintas em 10 min, uma a cada ~28 s.
- Uma regra, problema ou limite novo a cada ~50–75 s nos primeiros 60% da duração: limite plantado, piada da bola, ar, tênis, comida, problema real, curva, regra de frenagem.
- O tom vira por volta de 63%. Tudo depois disso é um set piece contínuo mais o gancho.
- A escalada corre em dois eixos:
  - Escala: casa → escola → cidade → público → mundo/organização.
  - Risco: cômico → inconveniente → perigoso → moral/vida.

**Como os outros vídeos de A diferem:**
- **Ifverse Reaction 10x (7:13).**
  - O tour de poder corre de 0:00–4:45 (66%): pegadas do dia a dia (0:00–1:56), jogos, esportes em três degraus crescentes (2:14–3:27), o esporte que muda a vida (goleiro → seleção nacional → teste de trapaça → um fato real sobre regra de início falso), depois "And there's a cost" (4:30, curto: dores de cabeça, fome, tédio).
  - Salto de tempo em 4:46 para o maior palco possível. Dilema em 5:09–5:31 (71–76%): **só você tem tempo para escolher**, seguido de 11 s de silêncio.
  - Reenquadramento: perda, depois ovação, depois uma tese moral (5:42–6:28).
  - Recrutador em um carro preto (6:30–6:58), depois o CTA.
  - Tem cerca de 29 microbatidas, uma a cada ~15 s, e constrói tensão pelo ritmo em vez de explicação.
- **Ifverse 500 IQ (8:56).**
  - O tour Mais/Menos corre de 0:00–4:00 (45%) e inclui trechos de filosofia e ética (metáfora do asilo, recusar roubar).
  - A **âncora emocional** (as economias da mãe) é introduzida em 4:01 (45%), e o incidente desencadeante (ligação de golpe) chega em 4:49 (54%).
  - Ponto baixo em 5:23–5:45, depois a linha de virada em 5:56. Investigação e desmantelamento correm de 6:02–7:17, seguidos do payoff.
  - Callbacks a dois tiques plantados no Ato 1 chegam em 8:00–8:09, depois o gancho final: alguém está um passo adiante de você (8:15–8:43). Essa foi a preparação do "Part 1 of 3".
- **IFOLOGY Stop Time (10:10).**
  - Mesmo andaime: ciência → "três problemas" (cego, surdo, presa no ar congelado) → Regras 1–3 → diversão → custo de solidão e envelhecimento.
  - Em 5:38 (55%) vira para um **arco de vilão**: vingança, roubo mesquinho, depois um assalto onde você escolhe não salvar um carro caindo. O narrador insinua que você nunca foi prometido como herói.
  - O confronto com a equipe termina com a mulher de casaco cinza, que não está congelada. O episódio 2 do universo reapresenta o vilão do episódio anterior como "você".
- **IFOLOGY Shapeshift (22:06).**
  - O andaime de 10 min (origem, Regras 1–4, Problemas 1–4) é comprimido em 0:00–7:00 (31%).
  - Depois o amigo é sequestrado (desencadeante, 33%), um ato de infiltração e espionagem corre de 8:23–11:23 (você se esconde como um caso dentro da base da equipe), e segue uma batalha de estádio de 9 min com todo o elenco.
  - Termina numa virada de revelação (o vilão diz que o mentor sabe a verdade) e uma pergunta sobre a honestidade do mentor.
  - Os vídeos mais longos da IFOLOGY são o mesmo template mais um ato de ação de elenco estendido.

**Open loops e viradas de "mas" usados em A:**
1. Uma limitação plantada, pagada entre 45–75%.
2. Uma tensão de tese: incrível *e* horrível, ou você honestamente usaria isso para o bem?
3. Uma organização misteriosa ou estranho recorrente (casaco cinza, van ou carro preto).
4. Um risco emocional nomeado estabelecido antes da crise (as economias da mãe, o melhor amigo Milo).
5. O gancho final nos últimos 60–90 s, sempre um desconhecido novo e mais poderoso.

A frequência de "but" é de 0,4–1,1 por minuto, cerca de uma a cada 60–150 s. Cada uma vira vantagem em custo, ou segurança em crise.

### B. Vídeo representativo: Day One "DISCIPLINE" (2:38, 5.1M), usando as marcas de capítulo do criador mais os quadros

| Tempo | % | Batida | Texto / voz |
|---|---|---|---|
| 0:00–0:40 | 0–25 | **O loop**: alarme, soneca, sofá, falha ao estudar; contador DAY salta 1 → 27 → 47 → 88 → 150 → 203 → 301 → 340 | Card de abertura; sussurros vermelhos alternando adiamento, fadiga e "por que tentar" |
| 0:40–0:50 | 25–32 | **O espelho**: o demônio é o próprio reflexo dele e o vidro trinca | Ataque de identidade (preguiça) |
| 0:50–1:00 | 32–38 | **Fundo do poço**: encolhido num holofote | Card do narrador que rejeita o rótulo (reenquadramento de identidade) |
| 1:00–1:12 | 38–45 | **Dia 1**: o alarme das 5:00 e ele se levanta; contador reseta para DAY 1/3 | (silêncio) |
| 1:12–1:49 | 45–69 | **Treino**: DAY 12 (cai; o demônio provoca), DAY 64 (saco de pancada enquanto a voz diz que não está funcionando), DAY 121 estudando, DAY 190 o espelho agora mostra um eu forte | A voz continua atacando, ele continua se movendo |
| 1:49–2:04 | 69–78 | **Luta final**: DAY 270, escadas; o demônio tenta empurrá-lo para baixo | Card de tema (motivação começa / disciplina mantém); um último sussurro "você não consegue" |
| 2:04–2:25 | 78–92 | **Cume** ao nascer do sol | Dois cards: ninguém vai te resgatar, então resgate você mesmo |
| 2:25–2:38 | 92–100 | **Bookend**: mesma cama e alarme, agora ele se levanta; card de título | Slogan "Day one, or one day." mais uma linha "you decide" |

**LUST VS LOVE (2:51)** corre: card de defeito (0:00) → ela aparece (0:21) → um convite para um encontro (0:48) → ele está no celular durante o encontro enquanto o demônio sussurra que ele está perdendo coisas (0:58–1:28) → fundo do poço com 3:17 AM, bateria 1% e um bilhete escrito à mão para admirar (1:28) → **Dia 1 em 1:42 (60%)** → onda de desejo e calendário DAY 4/11/29 → **tentação final em 2:06**: uma porta rosa de um lado, a garota do guarda-chuva do outro → ela o saúda, KNOWN 0 → 1 (2:16) → card bookend → aforismo → título mais um slogan binário.

**LUST PART 2 (3:31)** corre: sequência de DAY 300–412 → a voz começa a imitar a própria voz dele (0:25) → dia ruim mais sussurros de permissão → recaída em 1:23 (39%) → contador mostra **DAY 0** → espiral de vergonha, mensagens de amigos ignoradas → a memória muscular da sequência o traz de volta (2:22) → reinício (2:51, 81%) → card de título com um slogan estilo "tomorrow is day one, or lose twice".

**Estrutura de B:**
- Loop/defeito (25–30%) → espelho/fundo do poço (10–15%) → pequena decisão "Dia 1" em 38–60% → treino com pelo menos uma recaída (20–25%) → tentação final/luta (8–10%) → cume/bookend (10–15%) → card de título mais slogan binário (5–8%).
- Uma nova batida visual ou salto de contador vem a cada 5–10 s, e um novo card de texto a cada ~7–10 s. São cerca de 50–100 palavras na tela por filme, ou ~20–35 palavras por minuto de texto.

---

## 5. Finais

| Canal | Final da história | Virada / gancho | CTA |
|---|---|---|---|
| IFOLOGY | Um momento de resgate ou vilão com um reenquadramento público irônico (clipe viral, notícia) | **Universo compartilhado "Project IF."** O "você" de cada episódio se torna um membro da equipe em episódios posteriores (velocidade, telecinese, voo, leitura de mentes, força, indestrutibilidade, teleporte, gravidade, teias). Stop Time reapresenta o vilão do episódio anterior como "você". Termina num poder/vilão que a equipe não consegue enfrentar, ou uma dica de traição | Falado: o que você faria + uma pergunta de debate de história (quem é o vilão? juntar-se ou lutar? ela está mentindo?), depois um prompt de comentário e a assinatura "only the beginning". A descrição repete a pergunta de debate e linka um episódio relacionado |
| Ifverse | Vitória moral com um custo pessoal: perdeu a final, salvou uma criança; manteve escondido, expôs os golpistas | Recrutador misterioso que estava observando você, ou alguém um passo adiante → **arcos de 3 partes**. Títulos de Parte 2/3 escalam a mesma premissa em vez de dizer "Part 2" ("One Second Felt Like Ten" → "…Like Forever") | Falado: [o que você faria com X?] → [prompt de comentário] → [se você também teria feito a escolha moral, curta] → [inscreva-se para a Parte 2]. **O pedido de curtida está ligado à escolha emocional** |
| Ifverse full movie | Trágico e agridoce (mãe se sacrifica, funeral no céu), depois casa | História fechada | Só pergunta de comentário na descrição |
| Day One | Bookend: mesma situação de abertura, agora superada; ou um imperativo de 2 palavras para escolher a vida real | nenhum | Sem CTA falado. Card de título com slogan binário. Descrição: linha de história, logline, aforismo, capítulos, afirmação "feito do zero", linha de inscrição, **CTA de curso no Skool** (aprenda a fazer esses vídeos; também como end card) |
| Monk Mode | Bookend que transforma a linha de abertura, depois um aforismo de antítese | **Sequências de franquia** (LUST → PART 2 → PART 3; LUST VS LOVE → PART 2–6) | Card de título com uma escolha "X, ou Y". Descrição: links para as outras partes, linha de ajuda, inscrição |
| Last Soul | Bookend (de volta à loja; uma virada de post-it na frase de abertura) mais um card de citação de filósofo | nenhum | Pergunta de comentário na descrição prefixada com um emoji, perguntando sobre o próprio hábito do espectador |

---

## 6. Empacotamento

### Fórmulas de título e outliers (mediana = mediana de views do canal)

**IFOLOGY** (26 uploads, mediana 171K, 16/22 vídeos acima de 100K): o título é sempre "What IF You [Were N× / Could ___]?", com "IF" em caixa alta.
- Acima: **10x Faster 813K (4,8×)**, Stop Time 592K (3,5×), Shapeshift 340K em 5 dias (2,0×), Teleport 308K (1,8×).
- Abaixo: **Zombie Apocalypse** (um cenário, não um poder) 68K → Parte 2 35K → Parte 3 25K; Read Minds 75K; Walk Through Walls 70K; LeBron 5K (novo).
- Muito novo e ainda desconhecido: NPC em GTA 6, Backrooms, Céu, Inferno. O canal está indo em direção a lugares e celebridades, uma direção mais arriscada.
- Duração: 5 dos primeiros 6 uploads tinham 3,5–6,5 min (75–239K). O estouro veio a ~10 min (#7 e #8). Uploads recentes têm 15–23 min, e a velocidade por dia se mantém (Shapeshift 68K/dia vs 10x Faster 74K/dia), então mais longo não é penalizado.

**Ifverse** (12 uploads, mediana 301K): intitulado "What If You…?" com um **número concreto** sempre que possível.
- Acima: **Reaction Time 10x 4.5M (15×, seu primeiro upload)**, 500 IQ 1.4M (4,7×), One Second Felt Like Ten 664K (2,2×), 500 IQ to Disappear 511K, Kindergarten With All Your Memories 387K, One Second Felt Like Forever 372K.
- Abaixo: compilações **(FULL MOVIE)** em 24K e 18.9K (dia 1), Restart Your Life… Forever? 47K, Mentalist 79K.
- Decaimento de sequência: 4.5M → 664K → 372K e 1.4M → 511K → 230K. Isso ainda fica acima da mediana do canal para a Parte 2, então vale a pena fazer arcos, mas uma Parte 3 cai pela metade de novo.

**Day One Films** (15 uploads, mediana 93K): duas fórmulas.
1. Substantivo abstrato EM CAIXA ALTA + " | An Animated Short Film": **DISCIPLINE 5.1M (55×)**, DOPAMINE 506K (5,4×), ROOTS 129K, READY 95K, ONE LAST TIME 61K.
2. Frase declarativa em 2ª pessoa terminando em ponto: **Lust Is Killing You. 1.0M (10,8×)**, Motivation Will Fail You. 218K, Stop Overthinking 151K, You're Not Lazy. You're Too Comfortable. 93K. "Gaming Is Killing You." fez só 33K e "Lust Is Poison." 13K, o que mostra que a fórmula só funciona com o tema mais forte.

**Monk Mode** (14 uploads, mediana 108K):
- Substantivo EM CAIXA ALTA + "| An Animated Short Film". As primeiras tentativas copiaram as palavras do Day One (DISCIPLINE 35K, DOPAMINE 36K, MOTIVATION 17K, CONSISTENCY 26K): **um título clone sem ângulo novo falhou**.
- Migrar para **LUST** funcionou: 302K, depois PART 2 551K, depois **LUST VS LOVE 2.1M (19,5×)**. Adicionar uma contraparte romântica ou de "amor" foi o multiplicador.
- Sua franquia decai de forma acentuada: LvL Parte 2/3 268K → Parte 4 129K → Parte 5 86K → Parte 6 41K.

**Last Soul** (5 uploads, mediana 34K): **1 MINUTE 747K (22×)**, um título curto EM CAIXA ALTA com um número concreto, contra títulos de frase confessional longa em 7.6K–45K ("I Told Mom I Had Friends…", "He Was Always Connected…").

**Regras de título entre clusters:**
1. Use um número ou multiplicador concreto: 10x, 500 IQ, 1 MINUTE, One Second → Ten.
2. Use um único poder claro ou um único vício claro, não um cenário ou ambientação.
3. Mantenha entre 3–7 palavras.
4. A versão mais antiga e simples de uma ideia vence; derivadas decaem.
5. "(FULL MOVIE)" ou cortes recompilados não viajam.

### Descrições, tags e capítulos

- **Ifverse:**
  - Abre com a pergunta do título, depois 2–3 linhas expandindo com números ("0,025 s em vez de 0,25") e a tensão incrível/horrível.
  - Diz "This is Part 1 of 3." Uma vez que as sequências existem, links "▶ PART 2 / PART 3 is out" são adicionados **bem no topo**.
  - Prompt de comentário (qual X você faria…?), capítulos com nomes de cena evocativos (um objeto mais um momento, não um tópico), "Science notes" opcional com números referenciados, link de inscrição, 3 hashtags.
  - 15–21 tags: frase longa do título, sinônimos, palavras de ambientação ("goleiro", "final da copa do mundo"), e "poderia isso realmente acontecer".
- **IFOLOGY:**
  - Muito curta: título, uma provocação de uma linha (o poder parece ótimo até a pegadinha, ou "seja honesto, você faria?"), uma pergunta de debate de história, link 📺 para um episódio relacionado, slogan, 3 hashtags.
  - **20 tags, incluindo a marca e os títulos do concorrente** ("ifverse", "what if your reaction time was 10x faster"). É uma pegada deliberada no grafo de vídeos sugeridos do líder.
  - 6–14 capítulos com nomes descritivos de SEO ("The physics of extreme speed").
  - Vídeos são lançados como Premieres (uma faixa live_chat está presente).
- **Day One / Monk Mode:**
  - A primeira linha é a linha de abertura do filme, depois "[TÍTULO] is a short animated film about…", depois um aforismo.
  - **Capítulos são escritos como frases de história** (8–10 por filme; eles dobram como o roteiro de texto na tela).
  - Ambos usam a mesma linha de autenticidade "every frame, sound and note made from scratch", o que aponta para um template ou operador compartilhado. Depois uma linha de inscrição, uma linha findahelpline.com para temas de dependência, e 5 hashtags.
  - Day One não usa tags; Monk Mode usa 20 tags de sinônimo de tema. Day One monetiza via um curso no Skool.
- **Last Soul:** uma sinopse em prosa que para na pergunta desencadeante, uma pergunta de comentário prefixada com emoji, capítulos, e #AnimatedShortFilm #2DAnimation.

### Cadência de upload

Todos os canais são novos: os primeiros uploads caem entre o final de setembro e o início de outubro de 2026.

| Canal | Cadência |
|---|---|
| Ifverse | 12 uploads em 20 dias (7 out → 26 out), cerca de um a cada 1,7 dias; arcos de 3 partes lançados em sequência |
| IFOLOGY | 26 uploads; cerca de 19 uploads nos 11 dias depois de 15 out (~1,7/dia) enquanto alongava para 15–23 min, com premieres agendadas com antecedência |
| Day One | 15 uploads em ~30 dias, cerca de um a cada 2 dias |
| Monk Mode | 14 uploads; 6 nos 8 dias depois do hit de 18-out (ordenha de sequência) |
| Last Soul | 5 uploads em cerca de 3 semanas |

O estouro de cada canal veio no upload #1 (Ifverse, Day One), #2 (Last Soul), #7 (IFOLOGY) ou #8 (Monk Mode).

### Views por minuto produzido e taxa de acerto

| Canal | Min produzidos | Views totais | Views por min produzido | Mediana | ≥100K | ≥500K |
|---|---|---|---|---|---|---|
| Day One (B) | 49 | 7.66M | 157K | 93K | 6/15 | 3/15 |
| Monk Mode (B) | 47 | 4.18M | 89K | 108K | 7/14 | 2/14 |
| Ifverse (A) | 129 | 8.39M | 65K | **301K** | 8/12 | 4/12 |
| Last Soul (B) | 23 | 0.85M | 37K | 34K | 1/5 | 1/5 |
| IFOLOGY (A) | 293 | 4.44M | 15K | **171K** | **16/22** | 2/22 |

---

## 7. Recomendação, templates e temas

### Qual formato?

**Primário: cluster A, "E Se", 8–10 min, na voz da Ifverse sobre o andaime da IFOLOGY.**

1. **Medianas mais altas e estáveis por vídeo.** A mediana da Ifverse é 301K e a da IFOLOGY é 171K, com 73% dos vídeos da IFOLOGY acima de 100K. Os canais do cluster B têm medianas de 34–108K, com aproximadamente metade dos uploads abaixo de 100K. B é uma loteria dominada por 1–2 mega-hits por canal.
2. **Monetização por view.** A partir de 8 min você ganha anúncios mid-roll e aproximadamente 3–4× o tempo de exibição por view. Filmes de B com 2,5–5,5 min não conseguem carregar mid-rolls, e seus temas centrais (luxúria/pornografia, dependência) são sensíveis a anúncios.
3. **O roteiro carrega a compreensão.** A narração explica tudo, então os visuais só precisam ilustrar uma ideia por plano de 3–5 s. Isso serve bem a um pipeline de IA ou stickman 3D. Os filmes de B dependem de atuação sem palavras: planos longos (média de 11–26 s em Day One e Monk Mode), nuance facial e blocking, que são a coisa mais difícil de gerar.
4. **Matriz de temas ilimitada e repetível** (poder × multiplicador × limitação × dilema), mais **mecânicas de série** embutidas (arcos de 3 partes, um universo compartilhado) que mantêm o próximo upload alimentado.
5. **O formato é comprovado em escala de canal novo.** O primeiro upload da Ifverse chegou a 4,5M; a IFOLOGY copiou o template e ainda chegou a 800K no 7º upload.

**Pista secundária/de teste: B.** Ganha muito mais views por minuto produzido (89–157K) e precisa de quase nenhuma VO, então é neutro em idioma. Mas está saturando: o Monk Mode clonou os títulos do Day One, e os clones fizeram 17–36K. Só abra com um ângulo novo (um vício novo, um dispositivo contador novo, uma contraparte humana). Filmes de B podem funcionar como teasers de Shorts ou cortes.

**Evite:**
- compilações full-movie
- premissas de cenário sem um poder único (zumbis, lugares)
- premissas de celebridade
- sequências Parte 4+
- títulos confessionais longos

### Template A: roteiro de batidas de 10:00 "E Se"

**Metas:**
- Cerca de **1.250 palavras faladas** (~125 wpm sobre a duração, ~165 wpm enquanto fala), com 15–20% da duração em trechos de ação silenciosos (4–8 batidas de 4–12 s cada).
- 2ª pessoa, tempo presente, média de 5–8 palavras por frase, máximo ~15, nível ≤3.
- Cerca de 20% das palavras como piadinhas de personagem de 8 palavras ou menos, aproximadamente uma a cada 25–30 s.
- Um número ou fato real a cada 45–60 s.
- Uma virada de "mas" a cada 60–90 s.
- Uma nova microbatida a cada 15–30 s.
- Para uma leitura mais densa estilo IFOLOGY, escale cada seção ×1,5 (cerca de 1.850 palavras, do início ao fim).

> **Nota sobre português:** essas metas de contagem de palavras foram calibradas em inglês. Palavras em português tendem a ser mais longas e frases podem precisar de mais palavras para a mesma ideia — ao adaptar este template, prefira guiar-se pela duração em segundos de cada seção (que não muda) e ajuste a contagem de palavras pelo ouvido, conferindo o wpm real da voz em `tools/episode.mjs`.

| # | Seção | Tempo | Palavras | Deve conter |
|---|---|---|---|---|
| 1 | Demo de abertura fria | 0:00–0:20 | 45 | 2–3 usos instantâneos do dia a dia do poder, mais uma linha de espectador. Sem introdução, sem card de título |
| 2 | O número + pergunta do título | 0:20–0:40 | 40 | Estatística de pessoa normal vs "Você?"; a pergunta do título dita literalmente até 0:35 no máximo |
| 3 | Como funciona + limite plantado | 0:40–1:20 | 90 | Mecanismo em 3 frases curtas; um fato científico real; **uma limitação plantada com um sinal de "lembre-se disso"** |
| 4 | Teste de prova | 1:20–1:50 | 50 | Teste medido com uma autoridade cética (treinador, professor, médico); reação cômica |
| 5 | Montagem de vantagens | 1:50–3:10 | 170 | 4–5 vantagens de escala crescente (casa → escola → cidade → online/esporte), cada uma com 20–35 palavras e uma piada, 2 piadinhas; um minilimite cômico |
| 6 | Virada de "mas": regras e custos | 3:10–4:50 | 210 | "But then…": Problema 1/2/3, cada um com um número mais uma solução alternativa engraçada; depois "nenhum desses é o problema **real**" → callback ao limite plantado |
| 7 | Grande palco + suspeita | 4:50–6:00 | 150 | Regra de maestria ou treino (linha de tema); o poder usado em público no maior palco; fama, depois um teste de "você deve estar trapaceando"; um card de salto no tempo |
| 8 | Crise + dilema | 6:00–7:20 | 170 + 10–15 s de silêncio | Duas coisas com que você se importa colidem; **só você tem tempo para escolher**; um fraseado binário ("o X… ou o Y") |
| 9 | Execução do clímax | 7:20–8:10 | 110 | Resolvido pela regra aprendida ou limite plantado; um custo real pago (perde o prêmio, se machuca, se expõe) |
| 10 | Consequência + reenquadramento | 8:10–8:50 | 90 | Reação pública (replay, clipe viral, linha de notícia); paga um setup do Ato 1; a tese em uma frase |
| 11 | Gancho de sequência / universo | 8:50–9:35 | 80 | Recrutador, organização, ou "alguém um passo adiante"; um poder maior; termina em tensão |
| 12 | CTA | 9:35–10:00 | 45 | P1 "o que você faria com ___?" + P2 pergunta de debate de história; um condicional ("se você também teria…"); inscreva-se para a Parte 2 |
| | **Total** | | **1.250** | |

Proporções estruturais a manter: tour ≈ 45–60%, a crise começa em 55–65%, o clímax em 70–82%, gancho mais CTA ≤ 10%. Para uma versão de 20 min, mantenha as seções 1–7 em ≤35% e gaste o tempo extra em um ato de investigação ou infiltração e um set piece de elenco, como faz o Shapeshift da IFOLOGY.

**Checklist de empacotamento para A:**
- Título "E Se Você [Fosse N× ___ / Pudesse ___ / Tivesse N ___]?"
- Descrição: pergunta, 2 linhas com um número e a tensão incrível/horrível, "Parte 1 de 3", pergunta de comentário, capítulos evocativos, notas científicas, 3 hashtags, 15–20 tags (frase exata longa, sinônimos, palavras de ambientação).
- Lance a Parte 2 dentro de 2–5 dias e fixe o link dela no topo da Parte 1.

### Template B: curta-metragem motivacional de 3:00

**Metas:**
- 0–15 palavras faladas (só voz interior sussurrada, opcional).
- **Cerca de 100 palavras na tela ao longo de ~18–24 cards de texto.** Cards do narrador são 3ª pessoa passado, 4–9 palavras. A voz interior é 2ª pessoa presente, 2–5 palavras, em vermelho ou rosa.
- Um contador de HUD visível o tempo todo. Música 100%, com SFX diegético.
- Uma palavra de tema como título.

| # | Seção | Tempo | Palavras na tela | Deve conter |
|---|---|---|---|---|
| 1 | Card de defeito | 0:00–0:08 | 12 | Tela preta, antítese de duas linhas (estado / ferida); linha 2 em negrito |
| 2 | O loop | 0:08–0:40 | 15 | O ritual diário de falha; contador salta (DAY 1 → 27 → 90…); 3–4 sussurros alternando adiamento, permissão e táticas de identidade |
| 3 | O desejo | 0:40–1:00 | 10 | O que ele está perdendo (uma pessoa, um objetivo, o convite de um amigo); a voz sabota isso |
| 4 | Fundo do poço | 1:00–1:20 | 12 | Um símbolo concreto (3:17 AM, bateria 1%, plano riscado, espelho); uma linha de verdade do narrador |
| 5 | Dia 1 | 1:20–1:35 | 6 | Uma pequena ação física (celular de cara para baixo, alarme ajustado, um minuto); o contador reseta |
| 6 | Treino com recaída | 1:35–2:15 | 15 | Contador sobe; uma queda e a voz diz "eu disse"; ele se levanta; a voz muda de tática |
| 7 | Tentação final | 2:15–2:35 | 5 | Um quadro dividido: a oferta da voz vs a coisa real; uma escolha silenciosa |
| 8 | Payoff bookend | 2:35–2:50 | 12 | A linha de abertura retorna transformada; o contador vira (0 → 1) |
| 9 | Aforismo + card de título | 2:50–3:00 | 15 | Antítese "[Vício] faz X / [virtude] faz Y"; título EM CAIXA ALTA; slogan binário ("…ou…") |
| | **Total** | | **~100** | |

**Checklist de empacotamento para B:**
- Título de 1–2 palavras EM CAIXA ALTA + " | An Animated Short Film", ou "[Vício] Is Killing You."
- Descrição: linha de abertura, "[TÍTULO] is a short animated film about…", aforismo, capítulos escritos como linhas de história, linha de inscrição, linha de ajuda para temas de dependência, 5 hashtags.
- Não numere sequências além da Parte 3.

### 10 temas originais "E Se"

Cada um tem um gancho numérico, um limite plantado e um dilema de clímax.

1. **E Se Você Só Precisasse Dormir 1 Hora?** Limite: os sonhos cessam e a memória se desgasta. Dilema: ficar acordado para vigiar um irmão doente, ou desmaiar na prova grande.
2. **E Se Seu Corpo Curasse 100x Mais Rápido?** Limite: curar queima muitas calorias e solda os ossos tortos se não forem alinhados. Dilema: revelar isso para salvar uma vítima de acidente na TV ao vivo.
3. **E Se Você Pudesse Ouvir Toda Mentira?** Limite: mentiras gentis também doem, e você não consegue desligar isso. Dilema: a mentira amorosa de um pai vs expor um golpe.
4. **E Se Você Pudesse Se Dividir em 10 Cópias?** Limite: cada cópia tem 1/10 da sua força, e as memórias se fundem com dor. Dilema: uma cópia se recusa a se fundir de volta.
5. **E Se Você Fosse 10x Mais Leve?** Limite: sem tração, então o vento é letal. Dilema: um resgate no telhado durante uma tempestade onde só uma pessoa leve alcança a criança.
6. **E Se Você Envelhecesse 10x Mais Lento?** Limite: todo mundo que você ama envelhece além de você. Dilema: um laboratório quer seu sangue para salvar milhares.
7. **E Se Você Lembrasse Cada Segundo Da Sua Vida?** Limite: você não consegue esquecer a dor, e multidões sobrecarregam você. Dilema: a única testemunha de um crime em que ninguém acredita.
8. **E Se Sua Sorte Fosse 1.000x Melhor?** Limite: a sorte é emprestada das pessoas ao redor. Dilema: ganhar significa que seu melhor amigo perde.
9. **E Se Você Pudesse Respirar Debaixo D'Água?** Limite: você resseca em terra em 3 horas. Dilema: uma equipe de mergulho presa vs seu segredo.
10. **E Se Você Pudesse Controlar Eletricidade?** Limite: você não pode tocar seu celular ou pessoas quando está emocionado. Dilema: um blecaute na cidade no hospital vs se revelar.

Ideia de arco e série: transforme 3 dessas em uma escalada de 3 partes (ex: 1 Hora de Sono → "Nunca Mais Dormir?"), e dê a cada herói uma participação em uma equipe compartilhada, como faz a IFOLOGY.

### 10 temas originais de filme motivacional

Cada um tem um título, um dispositivo de HUD, uma tática de voz interior e uma forma de card final.

1. **DEPOIS**: HUD "DIAS RESTANTES: 30 → 0"; a voz só diz "depois". Bookend: a mesma mesa, agora uma página terminada.
2. **ROLAR**: HUD "HORAS ROLANDO / PÁGINAS ESCRITAS". O card final contrasta um polegar que rola com uma mão que cria.
3. **1%**: HUD "1,00 → 37,78" (1% de composição diária); a voz diz "é pequeno demais para importar".
4. **INVEJA**: HUD "CURTIDAS DELE / MINHAS REPETIÇÕES"; a voz compara; a virada é quando ele silencia o feed.
5. **A Nuvem Está Mentindo.**: HUD "TRAGADAS HOJE / ESCADAS SEM PARAR"; vaping; sussurros de permissão ("só uma tragada").
6. **Ele Esperou a Segunda-Feira.**: HUD "SEGUNDAS PERDIDAS: 52"; a voz diz "começo novo semana que vem"; termina numa quinta-feira comum.
7. **Ninguém Aplaude às 5 da Manhã.**: HUD "PÚBLICO: 0"; disciplina que ninguém vê. Bookend: uma pessoa, seu filho, finalmente assiste.
8. **RAIVA**: HUD "PALAVRAS DITAS / PALAVRAS QUE QUIS DIZER"; pai e filho. Tentação final: bater a porta ou se sentar.
9. **COMECEI 9. TERMINEI 0.**: uma estante de hobbies abandonados; a voz diz "você não é um finalizador"; o contador vira TERMINEI 1.
10. **SILÊNCIO**: HUD "NOTIFICAÇÕES: 999+ / CONVERSAS REAIS: 0"; solidão dentro de um grupo. Termina com uma ligação em vez de uma mensagem de texto.
