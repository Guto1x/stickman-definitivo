# ROTEIRO-MODELO (BLUEPRINT): episódios "E Se" (8–12 min, 2ª pessoa)

Este é o manual de escrita para todo episódio. Siga de cima a baixo: premissa → outline → ficha de plantios → rascunho → checklist → pontuação. Não comece a escrever a narração antes do outline passar pela §9.

**De onde isso vem**
- **Dados:** uma desmontagem batida por batida dos três melhores vídeos da IFOLOGY FILMS: *10x Faster* (813K views), *Stop Time* (592K) e *Shapeshift* (340K, 22 min).
  - Transcrições: `data/story/transcripts/`
  - Batidas anotadas e estatísticas medidas: `data/story/beats/`
  - Biblioteca de padrões com IDs de padrão (H1, L3, …): `data/story/patterns.json`
- **Ofício:** princípios clássicos de história (§2) aplicados concretamente a este formato.
- **Contexto mais amplo:** `docs/research/script_analysis.md` cobre 12 vídeos entre canais e empacotamento. Este documento vai mais a fundo nos três.
- **Reconstruindo os dados:** todos os scripts estão em `tools/ideas/story_build/`. Execute cada um com `python -I`.
  1. `dedupe.py` transforma legendas em segmentos.
  2. `build_transcript.py` usa as sobrescritas de locutor em `data/story/beats/src/speakers_*.json` para gerar as transcrições.
  3. `beat_stats.py` combina as anotações manuais em `data/story/beats/src/beats_*.json` com os cortes de plano para gerar `data/story/beats/*.json`.

> **Regra de originalidade.** Nunca reuse uma fala, piada, personagem, organização ou bordão dos vídeos de referência. Isso inclui a organização de recrutamento deles, o estranho recorrente de casaco deles, o slogan de canal deles, a frase de encerramento deles e o título do clipe viral deles. Copiamos *estruturas*, nunca *conteúdo*. Todo exemplo neste documento é escrito do zero — e, agora que o conteúdo é em português, cada exemplo é uma fala original em português, não uma tradução literal de inglês.

---

## 0. As 12 leis, medidas a partir dos três hits

| # | Lei | Evidência medida |
|---|---|---|
| 1 | **Abra com um problema minúsculo do dia a dia que o poder resolve em um plano.** Sem introdução e sem card de título antes disso. | Aberturas frias de 11, 35 e 35 s: atrasado para a escola, uma bebida derramada, uma confusão de identidade na cozinha (H1) |
| 2 | **Diga a pergunta do título palavra por palavra até 0:40**, depois vire direto para o mecanismo. | Dita em 0:11, 0:35 e 0:36 (T1) |
| 3 | **Diga o que muda, depois o que continua igual.** A parte que continua igual é o limite plantado, e ela se torna o problema real. | O limite é sinalizado em 0:22 e resgatado em 4:24 em *10x Faster* (M1, L1) |
| 4 | **Explique com 1–3 fatos reais, cada um introduzido por um teaser.** | 3 âncoras científicas nos primeiros 100 s de todo episódio (M2, M3) |
| 5 | **Regras e custos vêm como listas numeradas.** Cada item recebe um número, uma piada e uma solução barata. | 3–4 regras ou problemas por episódio (L2, L3) |
| 6 | **Vire dentro da virada.** Depois dos custos: "nenhum desses é o problema real." | Cai em 43–50% da duração (L4) |
| 7 | **O clímax é resolvido por conhecimento, não por poder bruto.** Pelo menos 3 plantios pagam. | 6, 6 e 8 pares plantio→payoff (L5) |
| 8 | **O risco fica plano, depois despenca de um penhasco.** O risco fica em 1–2/5 nos primeiros ~25–45%, depois salta para 5/5 na crise. | 5/5 alcançado em 63% e 75% nos episódios de 10 min, 33% no de 22 min. As curvas de risco estão em `beats/*.json` (E2) |
| 9 | **Informação nova a cada ~25–40 s. Uma virada forte a cada ~80–120 s.** | Medianas: informação nova 25 / 31 / 40 s; viradas 79 / 120 / 225 s (R1, R2) |
| 10 | **Narração rápida e densa com piadinhas curtas de testemunha.** | 181–193 wpm. Frases com média de 8–9 palavras. 8–12% das palavras são diálogo, com uma fala de personagem a cada 19–25 s (V1, K2) |
| 11 | **Números vendem a fantasia.** | O vídeo top tem 3,8 números/min; os outros 1,3 e 0,6. Sempre emparelhe "normal vs você" (N1, N2) |
| 12 | **Termine grande.** Um artefato público, depois o mundo maior chega, depois um gancho final que quebra uma regra, depois um CTA de 2 perguntas. | O mundo maior chega em 76–88%. O CTA são os últimos 16–22 s (X1–X4, A1) |

> **Nota sobre português:** os wpm e contagens de palavra acima foram medidos em roteiros de inglês. Use-os como referência de RITMO (quantas batidas por minuto de duração), não como meta literal de contagem de palavras — veja a nota na §4.1 sobre como calibrar isso com a voz real do `tools/episode.mjs`.

---

## 1. Pipeline (o que o Claude faz em todo episódio)

1. **Premissa.** Escolha uma ideia já aprovada em `data/story/ideas_backlog.json` (ou execute `docs/story/IDEA_ENGINE.md`), depois preencha a fórmula de premissa (§3).
2. **Outline.** Use o roteiro de batidas para a duração alvo (§4). Preencha o "deve conter" de cada linha.
3. **Ficha de plantios.** Liste todo setup, seu payoff e os tempos de ambos. O clímax precisa resgatar pelo menos 3 plantios.
4. **Ficha de fatos.** Escreva todo número usado, com o tipo de fonte, e confira a aritmética duas vezes. Se um número não puder ser verificado, corte-o.
5. **Conferências.** Execute o checklist (§9). Corrija, depois pontue com a rubrica (§10). **Só escreva se o outline pontuar ≥ 80.**
6. **Rascunho.** Escreva a narração batida por batida com orçamentos de palavras. Depois de cada batida, confira as regras de voz (§6).
7. **Plano visual.** Atribua sets, cards e overlays por batida (§7). Toda frase precisa ser visualizável com nosso engine.
8. **Repontue o rascunho.** Corrija qualquer coisa abaixo da linha da rubrica, depois passe para o JSON do episódio (`public/episodes/<slug>/episode.json`).

---

## 2. Princípios de narrativa, aplicados a este formato

Cada princípio tem uma regra curta "no nosso formato". O roteiro de batidas na §4 já codifica todos eles.

### 2.1 Círculo de história (Harmon): a espinha dorsal de todo episódio
| Passo | Significado | Onde vive em um E-Se |
|---|---|---|
| 1. **Você** (conforto) | Vida adolescente comum | Abertura fria: uma manhã normal, já com o poder |
| 2. **Necessidade/Desejo** | Algo que você quer | Desejo implícito: uma vida mais fácil, nunca se atrasar, vencer. Declare uma vez numa única frase na montagem de vantagens |
| 3. **Vai** (situação desconhecida) | Cruzando para regras novas | Mecanismo, depois as regras que você descobre (o poder como um mundo novo) |
| 4. **Busca** (adapta, tenta e falha) | Aprendendo o custo | Problemas 1–3 mais a queda da tentativa-e-falha |
| 5. **Encontra** (consegue o que queria) | Maestria | A montagem de treino e a regra tema: você "resolveu" o poder |
| 6. **Toma** (paga o preço) | A crise exige isso | Dilema e clímax: o poder em força total machucaria alguém, então você paga um custo |
| 7. **Retorna** | De volta à vida normal | Consequência em casa com a família; o artefato público |
| 8. **Muda** | Você é diferente | Uma frase mostrando que você age diferente agora (olha para frente, desacelera, conta a verdade). Depois o mundo maior abre o próximo círculo (gancho de sequência) |

### 2.2 "Mas / portanto", nunca "e então"
Cada batida precisa se conectar à próxima com **MAS** (uma complicação) ou **PORTANTO** (uma consequência). Leia o outline em voz alta com essas palavras entre as linhas. Se "e então" é a única palavra que cabe, a batida é um item de lista: corte, ou dê a ela uma causa. A montagem de vantagens é o único lugar onde "e" é permitido, e mesmo lá deveria terminar num **MAS**.
- Ruim: "Você corre para a escola. E então você corre para a loja. E então você entra no time de futebol."
- Bom: "Você corre para a escola, **então** você nunca se atrasa. **Mas** no futebol você deixa a bola atrás, **então** você aprende que velocidade não é controle."

### 2.3 Desejo vs necessidade, e a mudança de personagem
- **Desejo** (externo): uma vida mais fácil e impressionante usando o poder.
- **Necessidade** (interna): a regra tema. Exemplos: contenção ("desacelere antes de precisar"), honestidade, continuar sendo você mesmo, olhar para frente em vez de para trás.
- **A mudança** aparece no clímax: você *escolhe* a necessidade em vez do desejo. Isso significa desacelerar em vez de se exibir, contar a verdade em vez de esconder, ou desistir do prêmio. Na variante de corrupção (E5), você escolhe o desejo e paga por isso, e o gancho final te pune.
- Em 2ª pessoa a mudança precisa ser mostrada por meio de ações. Uma frase reflexiva na consequência já basta.

### 2.4 Ciclos de tentativa-e-falha
O poder precisa falhar com você pelo menos **três vezes** antes do clímax, com custo crescente a cada vez:
1. Uma falha cômica (montagem de vantagens: a bola fica atrás, o sofá quebra).
2. Uma falha custosa (problemas: tênis, calorias, uma curva perdida para uma piscina).
3. Um quase-desastre assustador (problema real: o cachorro que você só desviou por sorte).

O clímax tem sucesso *por causa* do que essas falhas te ensinaram.

### 2.5 Setup → payoff (Tchekhov) e a ficha de plantios
Toda regra, detalhe estranho, objeto de piada e número no Ato 1 é uma arma carregada. Mantenha uma ficha:

| Plantio (o quê, quando) | Como é sinalizado | Payoff (o quê, quando) | Tipo |
|---|---|---|---|
| Limite declarado em 0:30 | Linha de sinalização curta ("guarda isso no bolso de trás") | Se torna o problema real em 4:40, e o obstáculo do clímax em 6:50 | Loop principal |
| Objeto de piada na abertura fria | Nenhum (escondido) | Retorna como a coisa perdida no clímax | Piada recorrente |
| Bondade na montagem de vantagens | O narrador chama de o melhor uso do poder | Espelha a escolha do clímax | Referência moral |

Mínimos: **5 plantios, ≥ 3 resgatados no clímax, 1 piada recorrente pagada na consequência, 1 loop aberto deixado para a sequência.**

### 2.6 Riscos crescentes e a regra do três
- **Escada de escala:** casa → escola → cidade → público/região → organização/mundo. Cada passo usa um set do engine maior.
- **Escada de risco:** cômico (1) → inconveniente (2) → perigoso (3) → vida ou identidade (5).
- **Regra do três:** três vantagens de escala crescente, três problemas de custo crescente, três repetições no pico do clímax ("uma fileira, duas fileiras, três"). Em toda lista de três, o **terceiro** item é o mais longo ou o mais estranho.

### 2.7 Lacunas de curiosidade, loops abertos e reganchos (retenção no YouTube)
- **Micro lacuna (todo fato):** um teaser de 3–6 palavras antes do fato ("Agora, a parte estranha.").
- **Lacuna de batida (a cada 60–90 s):** cada batida termina com um botão que puxa para a próxima (uma piadinha, uma reviravolta, uma meia-frase ameaçadora).
- **Loops macro (o vídeo inteiro):** pelo menos uma pergunta não resolvida precisa estar aberta a todo segundo. Abra o próximo loop *antes* de fechar o atual.
- **Mapa de regancho para 10 minutos:**
  - 0:25 o limite sinalizado
  - 1:25 o teste de prova
  - 2:30 uma falha cômica
  - 3:10 a virada de "mas"
  - 4:40 o problema real
  - 5:25 a regra tema
  - 6:05 a crise
  - 6:50 o clímax
  - 8:00 a batida na porta / o mundo maior
  - 9:10 o gancho final

  As lacunas nunca passam de 90 s.

### 2.8 Relógio correndo
Todo clímax precisa de uma contagem regressiva visível. Nosso engine mostra isso como um overlay `Stopwatch` ou um card `clock`. Exemplos: segundos até o caminhão chegar; um eco desaparecendo às 10:00; um temporizador de recarga; o ar acabando.
- Declare o número duas vezes: quando começa, e quando está quase no fim.
- Faça o relógio vir de uma regra (o limite do poder), não de coincidência.

### 2.9 Reviravolta e virada
- **Reviravolta do meio (≈45%):** o problema real transforma vantagens em perigo.
- **Reviravolta do clímax:** o próprio poder é o perigo, então você vence usando *menos* dele.
- **Virada final:** a última batida quebra uma regra em que o público confiava (alguém se move no tempo congelado; um eco olha para você). Teste de jogo justo: a virada precisa ser explicável por algo já mostrado.

### 2.10 Tema declarado por meio de um dilema
Não dê sermão. Coloque o tema numa **escolha binária com um preço nos dois lados**, frased em 2–6 palavras ("A trilha... ou a verdade."). A regra tema (§3) dá a resposta certa, mas ela ainda custa algo.

### 2.11 Custo satisfatório no clímax
A vitória precisa custar algo visível e proporcional:
- **Corpo:** tênis derretidos, sangramento de nariz, dor de cabeça, exaustão.
- **Objeto:** algo perdido ou quebrado, idealmente o objeto de piada da abertura fria.
- **Status:** exposição, uma partida perdida, um prêmio perdido.

Nunca deixe ninguém pagar, e nunca mate um inocente. Conteúdo infantojuvenil tolera perigo, não violência gráfica.

### 2.12 Gancho de sequência
Os últimos 90 s transformam a história resolvida numa pergunta maior:
1. Um artefato público é divulgado.
2. Alguém está observando.
3. Eles chegam com uma oferta ou uma ameaça.
4. Algo mais forte aparece que quebra uma regra.

Desenhe o gancho final do episódio N para que ele possa se tornar o herói N+1 (X5).

---

## 3. A fórmula de premissa

Preencha todo campo antes de fazer o outline. Se um campo está vazio, a ideia não está pronta.

```
TÍTULO       E Se Você [Pudesse VERBO | Fosse N× ADJETIVO | Tivesse N SUBSTANTIVO]?   (3–7 palavras, um número se possível)
MECANISMO    Seu [parte/sistema do corpo específico] [muda por N].                    (2–4 frases, palavras simples)
CONTINUA     Tudo o resto é normal, especialmente [LIMITE].                           (o limite plantado, sinalizado)
ÂNCORA       [Animal/órgão/máquina] já faz uma versão minúscula disso: [fato + número].
ESCADA       Normal [número de base] → você [N×] → [3 comparações visualizáveis].
VANTAGENS    Casa: __ / Escola: __ / Trabalho ou dinheiro: __ / Esporte ou jogo: __ / Bondade: __ / Grande exibição: __
REGRAS       1 __ (cena de teste)  2 __ (cena de teste)  3 __ (cena de teste)
CUSTOS       1 [irritante] __ nº__  2 [caro] __ nº__  3 [perigoso] __ nº__   (cada um: número, piada, solução barata)
REAL         [LIMITE] transforma [vantagem] em perigo para [outra pessoa / sua identidade].
REGRA TEMA   "[Instrução prática que um adolescente colaria num post-it]."
CRISE        [Inocente da categoria plantada] em perigo em [lugar], [relógio correndo a partir de uma regra].
DILEMA       "[A]… ou [B]." Força total [machucaria eles / te exporia / custaria X].
CLÍMAX       Resolvido por [regra + plantio + plantio]. Custo pago: [corpo/objeto/status].
ARTEFATO     [Clipe/manchete] intitulado "[oposto irônico do poder]".
MUNDO MAIOR  [Quem observou] chega com [oferta/ameaça]; [contra-poder] quebra [regra].
CTA          P1 O que você faria primeiro com __?   P2 [pergunta de debate de história que só espectadores podem responder]
```

**Testes de premissa.** Todos precisam ser sim:
- Um adolescente de 13 anos consegue dizer a premissa em uma respirada.
- A abertura fria consegue mostrá-la em um único plano de 3 segundos.
- O limite, não a sorte, cria o clímax.
- Existe pelo menos um número que um espectador repetiria a um amigo.
- O dilema poderia começar uma discussão nos comentários.
- Nosso engine consegue montar toda batida com sets, cards e FX já existentes, ou com uma pequena adição.

---

## 4. Roteiros de batidas

**Velocidade de narração.** A IFOLOGY mediu 181–193 palavras por minuto ao longo da duração inteira, com quase nenhum silêncio.

- **Meta da casa:** 175 wpm sobre a duração. Isso deixa cerca de 5% para 3–6 batidas silenciosas deliberadas (dilema, pico do clímax, gancho final) de 1,5–4 s cada.
- **Depois de escolher uma voz,** cronometre uma amostra de 200 palavras. Ajuste o orçamento para minutos × wpm medido × 0,95.
- As contagens de palavras abaixo são a 175 wpm e já incluem espaço para os silêncios.

> **Nota sobre português:** 175 wpm foi medido em inglês. Em português, a mesma ideia costuma precisar de mais sílabas (e às vezes mais palavras), então trate as contagens de palavras abaixo como um **ponto de partida**, não uma meta rígida. O que não muda são os **tempos em segundos** de cada seção — eles vêm da duração real do episódio. Depois de gravar a voz real com `tools/episode.mjs`, use o wpm medido daquela voz (`node tools/episode.mjs pace`) para recalibrar o orçamento de palavras de cada seção, mantendo os tempos em segundos como estão.

Legenda:
- **N** = precisa entregar informação nova.
- **↻** = regancho (uma virada ou um loop aberto) que precisa cair naquela janela.
- **Cortes/min** são metas para o plano visual (§7).

### 4.1 Roteiro de batidas master: 10:00 (≈ 1.710 palavras em inglês; calibre pelo wpm real da voz em português)

| # | Tempo | % | Batida | Palavras | Deve conter | ↻/N | Cortes/min |
|---|---|---|---|---|---|---|---|
| 1 | 0:00–0:20 | 0–3 | **Abertura fria** | 55 | Close de objeto de um problema do dia a dia → o poder resolve em um movimento visível → linha de confusão de testemunha (≤8 palavras) + resposta impassível. 1–2 estranhezas não explicadas (H3) | N | 30–40 |
| 2 | 0:20–0:25 | 3–4 | **Pergunta do título** | 15 | "E se você...?" literalmente + pivô de mecanismo (varie o fraseado) | ↻ | — |
| 3 | 0:25–0:50 | 4–8 | **Mecanismo + limite plantado** | 75 | O que muda (com o número); o que continua normal; **linha de sinalização do limite** | N ↻ | 15–20 |
| 4 | 0:50–1:25 | 8–14 | **Escada de números + âncora científica** | 100 | Teaser → precedente real → base vs você → 3 comparações crescentes → linha de bater recorde | N | 15–20 |
| 5 | 1:25–1:50 | 14–18 | **Teste de prova** | 70 | Uma autoridade cética com um instrumento (cronômetro, balança, teste); olhar triplo; 1–2 piadinhas | ↻ | 20–30 |
| 6 | 1:50–2:30 | 18–25 | **Regras descobertas** | 115 | 2–3 regras numeradas, cada uma com declaração → cena de teste → consequência cômica. *Poderes simples: substitua por piadas de descoberta de "primeiro dia"* | N | 18–25 |
| 7 | 2:30–3:10 | 25–32 | **Montagem de vantagens** | 115 | 4 vantagens de escala crescente (casa → escola → trabalho/esporte → grande); 1 referência de bondade; 1 falha cômica; 2 piadinhas | ↻ | 25–40 |
| 8 | 3:10–4:40 | 32–47 | **Virada de "mas" + Problemas 1–3** | 265 | Linha de pivô de "mas"; cada problema: nome → número real → 2–4 consequências vívidas → solução barata → reação da família. Ordem: irritante → caro → meio perigoso | N ↻ | 15–25 |
| 9 | 4:40–5:25 | 47–54 | **O problema real** | 130 | "Nenhum desses é o problema real" (reformulado) → **callback ao limite plantado usando sua palavra-chave** → quase-desastre sobrevivido por sorte | N ↻ | 10–18 |
| 10 | 5:25–6:05 | 54–61 | **Maestria + regra tema** | 115 | Teaser → analogia animal ou científica → treino de tentativa-e-falha (amigos ajudam) → **regra tema declarada como instrução** | N ↻ | 12–20 |
| 11 | 6:05–6:30 | 61–65 | **Por um tempo... depois um dia: crise** | 70 | Uma linha de compressão → dia e lugar específicos → inocente em perigo → **relógio começa a correr** (número) | ↻ | 18–25 |
| 12 | 6:30–6:50 | 65–68 | **Dilema** | 55 + 2 s de silêncio | Aritmética trabalhada do problema; por que força total machucaria; linha binária "A... ou B." | N | 10–15 |
| 13 | 6:50–7:35 | 68–76 | **Clímax** | 120 + 3 s de silêncio | Executa a regra tema; resgata ≥3 plantios; sequência de repetição ×3; custo pago; objeto perdido; botão de subestimação | ↻ | 10–15 |
| 14 | 7:35–8:00 | 76–80 | **Consequência + reenquadramento público** | 70 | Close do custo físico; reação da família ou inocente; payoff da piada recorrente; clipe viral ou manchete com título irônico; uma frase de "mudança" | — | 15–25 |
| 15 | 8:00–9:10 | 80–92 | **O mundo maior** | 205 | Observador → batida na porta, chegada ou envelope; oferta ou ameaça; participações de série (≤5 falas) ou nosso estranho recorrente; linha de ancoragem familiar | N ↻ | 15–22 |
| 16 | 9:10–9:40 | 92–97 | **Gancho final** | 85 | Uma regra em que o público confiava se quebra; medo em alguém forte; termina em tensão, depois 1 s de preto | ↻ | 10–15 |
| 17 | 9:40–10:00 | 97–100 | **CTA** | 50 | P1 fantasia pessoal + P2 debate de história → pedido de comentário → nossa assinatura | — | 3–6 |
| | | | **Total** | **≈1.710** | | | |

Posições de virada comparadas com os dados:

| Virada | Nossa | Dados |
|---|---|---|
| Custos começam | 32% | 26%, 50%, 23% |
| Problema real | 47% | 43–50% |
| Crise | 61% | 56–63% |
| Início do clímax | 68% | 69–77% |
| Mundo maior | 80% | 76–88% |
| CTA | 97% | 97–98% |

### 4.2 Compacto: 8:00 (≈ 1.360 palavras)
Combine as regras com o teste de prova e as vantagens. Use 2 problemas mais o problema real. Encurte o mundo maior.

| # | Tempo | Batida | Palavras | Notas |
|---|---|---|---|---|
| 1 | 0:00–0:18 | Abertura fria | 50 | |
| 2 | 0:18–0:22 | Pergunta do título | 12 | |
| 3 | 0:22–0:42 | Mecanismo + limite sinalizado | 60 | |
| 4 | 0:42–1:10 | Escada de números + 1 âncora | 80 | |
| 5 | 1:10–1:30 | Teste de prova | 55 | |
| 6 | 1:30–2:15 | Montagem regras-como-vantagens | 130 | Cada vantagem revela uma regra; 1 falha cômica |
| 7 | 2:15–3:30 | "Mas" + Problemas 1–2 (3 se curto) | 215 | |
| 8 | 3:30–4:05 | Problema real (callback do limite) | 100 | 44% |
| 9 | 4:05–4:35 | Maestria + regra tema | 85 | |
| 10 | 4:35–4:55 | Crise + relógio | 60 | 57% |
| 11 | 4:55–5:10 | Dilema | 40 + 2 s | |
| 12 | 5:10–5:50 | Clímax | 110 + 3 s | 65–73% |
| 13 | 5:50–6:10 | Consequência + artefato | 55 | |
| 14 | 6:10–7:05 | Mundo maior | 160 | 77% |
| 15 | 7:05–7:40 | Gancho final | 95 | |
| 16 | 7:40–8:00 | CTA | 50 | |

### 4.3 Estendido: 12:00 (≈ 2.070 palavras)
Adicione uma **história B** e uma **primeira tentativa fracassada** na crise. *Shapeshift* mostra que o formato mais longo é "o andaime de 10 min, comprimido, mais uma segunda metade maior".

| # | Tempo | Batida | Palavras | Notas |
|---|---|---|---|---|
| 1 | 0:00–0:25 | Abertura fria | 70 | |
| 2 | 0:25–0:30 | Pergunta do título | 15 | |
| 3 | 0:30–0:55 | Mecanismo + limite sinalizado | 75 | |
| 4 | 0:55–1:35 | Escada + 2 âncoras | 115 | |
| 5 | 1:35–2:00 | Teste de prova | 70 | |
| 6 | 2:00–2:50 | Regras 1–3 | 145 | |
| 7 | 2:50–3:35 | Montagem de vantagens | 130 | |
| 8 | 3:35–4:05 | **História B:** o segredo ou desejo do amigo | 85 | Torna-se o risco da crise (C1) |
| 9 | 4:05–5:30 | "Mas" + Problemas 1–3 | 250 | 34% |
| 10 | 5:30–6:15 | Problema real | 130 | 46% |
| 11 | 6:15–6:45 | **Batida quieta:** o custo é sentido; a mãe percebe | 85 | Uma virada de tom que deixa o público respirar |
| 12 | 6:45–7:25 | Maestria + regra tema | 115 | |
| 13 | 7:25–7:50 | Crise + relógio | 70 | 62% |
| 14 | 7:50–8:30 | **Primeira tentativa falha** (força total → sai pela culatra) | 115 | Risco sobe; o relógio salta |
| 15 | 8:30–8:50 | Dilema | 55 + 2 s | |
| 16 | 8:50–9:40 | Clímax (regra tema + plantios) | 140 + 3 s | 74–81% |
| 17 | 9:40–10:05 | Consequência + artefato | 70 | |
| 18 | 10:05–11:15 | Mundo maior | 205 | 84% |
| 19 | 11:15–11:40 | Gancho final | 75 | |
| 20 | 11:40–12:00 | CTA | 50 | |

**Arco alternativo (qualquer duração): a variante de corrupção (E5).** Substitua as batidas 9–14 (10 min) por:
- virada de tom (maravilhamento e solidão)
- gatilho (humilhação ou tentação)
- escada de uso indevido em 3 degraus, cada um justificado pela mesma lógica
- um amigo agindo como consciência que se distancia
- um assalto, interrompido por um inocente em perigo
- a **escolha sombria** (espelhando a referência de bondade)
- uma consequência vazia

O mundo maior então chega para *confrontar*, não recrutar. Use isso para poderes indetectáveis (tempo, invisibilidade, mentes). Use no máximo uma vez a cada 4 episódios.

---

## 5. Regras por batida, com exemplos originais

Os exemplos usam uma premissa de demonstração, **"E Se Você Fosse Magnético?"**, para manter a voz consistente. Nenhuma dessas falas existe nos vídeos de referência. Use-as como modelos, não como texto para copiar e colar.

### B1 Abertura fria (0:00–0:20)
- **Faça:**
  - Comece dentro da ação com "Você…".
  - Faça o plano 1 ser um close de objeto.
  - Use um problema do dia a dia e uma solução em um movimento.
  - Termine numa linha de testemunha mais uma resposta impassível.
  - Deixe uma estranheza não explicada.
- **Não faça:**
  - Use uma introdução, "Imagine…", um nome de canal ou um card de título.
  - Use heroísmo, perigo ou mais de um lugar.
- **Exemplo:**
  > Você está atrasado, e as chaves estão em algum lugar desta casa. Você estende uma mão. Na cozinha, algo chacoalha, desliza do balcão, quica no gato, e bate na sua palma. As chaves. Também quatro colheres. Também todos os imãs da geladeira.
  > **Irmão caçula:** Por que a geladeira está pelada?
  > **Você:** Agora não.

### B2 Pergunta do título
- **Faça:**
  - Diga o título exato, depois um pivô que promete o mecanismo.
  - Sobreponha o card de título num plano aberto do set principal.
- **Não faça:**
  - Parafraseie o título.
  - Faça uma segunda pergunta, a menos que ela amplie o escopo (T2).
- **Exemplo:**
  > E se você fosse magnético? Não magnético de imã de geladeira. Vamos ver o que isso realmente significa.

### B3 Mecanismo + limite plantado
- **Faça:**
  - Nomeie o sistema que muda, com um número.
  - Nomeie o que continua normal.
  - Sinalize o limite com uma linha de sinalização nova (banco na §6.6).
- **Não faça:**
  - Explique mais de 3 coisas.
  - Use jargão sem uma imagem.
- **Exemplo:**
  > Seu corpo emite um campo magnético tão forte quanto um aparelho de ressonância de hospital. Você liga isso como quem flexiona um músculo. Só que você não consegue direcionar. Ele atrai cada pedaço de aço ao redor ao mesmo tempo, e quanto mais perto, mais forte puxa. Metade da distância, oito vezes a força. Guarda isso no bolso de trás.

### B4 Escada de números + âncora científica
- **Faça:**
  - Teaser, depois um precedente real, depois uma comparação base vs você.
  - Use 3 comparações em ordem crescente.
  - Termine com uma linha de bater recorde ou desmentir mito.
  - Dê a todo número um card ou overlay.
- **Não faça:**
  - Declare um número solto.
  - Empilhe mais de 2 números numa frase.
- **Exemplo:**
  > Aqui vem a parte bizarra: alguns animais já sentem magnetismo. Tartarugas marinhas usam o campo da Terra como um mapa. O campo da Terra é fraco, cerca de cinquenta milionésimos de tesla. Um imã de geladeira: cerca de cinco milésimos. Uma ressonância de hospital: três tesla, forte o suficiente para arrancar um cilindro de oxigênio do outro lado da sala. Você: três tesla. Andando por aí. De tênis.
- **Desmentir mito para responder a pergunta óbvia do espectador:**
  > E não, isso não arranca o ferro do seu sangue. Esse ferro está trancado dentro de moléculas, e praticamente não é magnético.

### B5 Teste de prova (autoridade cética)
- **Faça:**
  - Use um teste medível (instrumento) e um olhar triplo (instrumento → você → instrumento).
  - Faça a autoridade exigir uma repetição ou ficar desconfiada.
- **Não faça:**
  - Deixe a autoridade acreditar em você imediatamente.
- **Exemplo:**
  > A enfermeira da escola quer medir seus batimentos. Ela encaixa o monitor. O monitor voa, cola no arquivo de metal, e apita para a parede.
  > **Enfermeira:** …Setenta e dois. Aparentemente.

### B6 Regras descobertas
- **Faça:**
  - Numere-as ("Regra um…").
  - Descubra cada uma testando, não por um mentor te contando.
  - Cada regra ganha uma cena de teste e uma piada.
  - Pelo menos 2 regras precisam retornar no clímax.
- **Exemplo:**
  > Regra um: só aço e ferro se importam. Latas de refrigerante de alumínio te ignoram. Ouro te ignora. O aparelho dental do seu irmão caçula não te ignora. Você descobre isso no jantar.

### B7 Montagem de vantagens
- **Faça:**
  - Ordene as vantagens por escala crescente.
  - Cada vantagem tem 20–35 palavras e termina num botão.
  - Inclua uma bondade (a referência moral) e uma falha cômica.
- **Não faça:**
  - Deixe passar de 45 s.
  - Deixe qualquer vantagem ser perigosa ainda.
- **Exemplo de vantagem:**
  > Você consegue um trabalho de férias no ferro-velho. Nove horas separando metal. Você faz isso em nove minutos, parado no meio, braços abertos, como um espantalho bem estranho.
- **Exemplo de bondade:**
  > Uma criança deixa a chave de casa cair num bueiro. Você se deita na guia, estende a mão sobre a grade, e puxa a chave sem tocar em nada. Ele acha que é um truque de mágica. Sinceramente, meio que é.

### B8 Virada de "mas" + Problemas 1–3
- **Faça:**
  - Use um pivô de uma linha (banco §6.6).
  - Cada problema: nome → número → 2–4 consequências vívidas (regra do três, mais longa por último) → solução barata (duplo tempo impassível) → reação da família.
- **Não faça:**
  - Resolva um problema com um poder novo.
  - Torne algum problema letal ainda.
- **Exemplo de problema:**
  > Problema dois: tudo que tem tarja magnética. Cartão do banco, cartão de hotel, o cartão de estacionamento da sua mãe. Um abraço e eles ficam em branco. Então você evita abraçar nos eventos de família. Parece falta de educação. Economiza dinheiro.
  > **Mãe:** Por que meu cartão foi recusado… de novo?

### B9 O problema real
- **Faça:**
  - Reformule a virada "nenhum desses é o problema real".
  - **Repita a palavra-chave do limite plantado.**
  - Escale o tipo de perigo (para outros, ou para a identidade).
  - Inclua um quase-desastre que você sobrevive por sorte.
- **Exemplo:**
  > Mas aqui está o que realmente te assusta: você não consegue direcionar. Lembra, mais perto significa mais forte, oito vezes mais forte na metade da distância. Na faixa de pedestre, um carro para um pouco perto demais. A porta dele se amassa na sua direção com um som de lata. O motorista encara. Você se afasta bem, bem rápido.

### B10 Maestria + regra tema
- **Faça:**
  - Teaser, depois uma analogia de natureza ou engenharia (card), depois uma montagem de treino com 1 falha e amigos ajudando.
  - Declare a **regra tema como uma instrução**.
- **Exemplo:**
  > Então você estuda a única máquina que controla exatamente esse problema: o imã de guindaste do ferro-velho. Ele não pega tudo. Ele desce na pilha, liga por um segundo, levanta, e desliga. Pulsos curtos. Curto alcance. Depois nada. Sua regra: pulsa, não puxa.

### B11 Crise
- **Faça:**
  - Use uma linha de compressão, depois nomeie um dia e lugar específicos.
  - Coloque um inocente da categoria plantada em perigo.
  - Comece o relógio com um número vindo de uma regra.
- **Exemplo:**
  > Por dois meses, você pulsa. Nada se amassa. Até que, num domingo na feira de rua, uma van de entrega sem motorista começa a descer a ladeira de ré, direto para a multidão. Onze segundos até ela alcançar as barracas.

### B12 Dilema
- **Faça:**
  - Trabalhe a aritmética de por que força total falha ou machuca.
  - Frase o binário em 2–6 palavras.
  - Siga com 1,5–2 s de silêncio.
- **Exemplo:**
  > Força máxima pararia a van. Também poderia desregular o marca-passo no peito do Seu Okafor. Ele está parado a quatro metros de você. A van… ou o homem.

### B13 Clímax
- **Faça:**
  - Execute a regra tema.
  - Resgate ≥ 3 plantios.
  - Inclua uma sequência de repetição 3× com SFX em cada golpe.
  - Mostre o custo na tela.
  - Perca o objeto de piada.
  - Dê o botão com uma subestimação sobre um objeto, nunca sobre uma pessoa.
- **Exemplo:**
  > Você não puxa. Você corre, mais perto da van e mais longe dele. Oito vezes mais forte na metade da distância. Você pulsa. Uma vez. A van balança. Duas vezes. Ela desacelera. Três vezes. Ela para a um palmo da barraca de frutas. Cada chave, colher e moeda da feira agora está colada no seu moletom. Incluindo o aparelho dental do seu irmão. Ele não foi convidado.

### B14 Consequência + reenquadramento público
- **Faça:**
  - Close do custo físico.
  - Payoff da piada recorrente.
  - Um artefato público cujo título é o **oposto irônico** do poder.
  - Uma frase de "mudança".
- **Exemplo:**
  > Até o jantar, o clipe está em todo lugar: "Criança Fica Coberta de Talheres e Para Van." Ninguém menciona o imã. Aparentemente, a coisa mais forte que você fez no dia inteiro foi desligar.

### B15 O mundo maior
- **Faça:**
  - Mostre quem observou o artefato.
  - Faça eles chegarem fisicamente (campainha, van, envelope, estranho).
  - Faça uma oferta ou uma ameaça.
  - Participações ≤ 5 falas (série). Ancoragem familiar: uma linha.
- **Não faça:**
  - Use a organização do canal de referência, o estranho de casaco ou o discurso de recrutamento.
  - Nossa bíblia de série está na §8.

### B16 Gancho final
- **Faça:**
  - Quebre uma regra confiável.
  - Introduza um contra-poder ou mostre medo em alguém forte.
  - Termine em tensão com 1 s de preto antes do CTA.
- **Exemplo:**
  > Então todo imã da geladeira cai no chão ao mesmo tempo. Não puxado. Empurrado. Alguém lá fora não atrai metal. Repele.

### B17 CTA
- **Faça:**
  - P1 é a fantasia pessoal.
  - P2 é um debate de história que só espectadores deste episódio podem responder.
  - Depois o pedido de comentário, depois nossa assinatura. Mantenha em 15–20 s.
  - O pedido de curtida pode estar ligado à escolha moral ("se você também teria salvado o homem, …").
- **Exemplo:**
  > Então, qual seria a primeira coisa que você puxaria se fosse magnético? E quem empurra: está vindo te ajudar, ou te impedir? Conta pra gente nos comentários. [ASSINATURA]

---

## 6. Regras de voz e escrita

### 6.1 Ponto de vista, tempo verbal, registro
- **2ª pessoa, tempo presente,** sempre. O espectador é "você".
- Outros personagens são "sua mãe", "seu melhor amigo Theo", "uma criança de capa de chuva amarela". Dê nome só aos 1–2 que importam.
- **Registro do universo adolescente.** Cenários: escola, casa, tarefas, esporte, trabalho de meio período, celulares, jogos. Gíria leve só aparece em diálogo.
- **Nível de leitura:** 2º–4º ano. Evite palavras polissilábicas a menos que sejam o termo científico, e explique essas imediatamente.

### 6.2 Ritmo de frase
- Busque uma média de **8–9 palavras por frase**.
- Cerca de 40% das frases devem ter **≤ 6 palavras**, e menos de 5% **≥ 20 palavras**. Frases longas são só para listas de montagem.
- **Picos de ação:** sequências de frases de 2–4 palavras. Depois uma frase mais longa que libera a tensão.
- **Sequência de repetição** no clímax: 3 golpes, cada um com SFX.
- Comece a maioria das frases com um sujeito concreto ("Você…", "A bola…", "Sua mãe…"). Evite começar com "É", "Há" ou "Isso é" a menos que seja uma piada.

> **Nota sobre português:** português tende a ter palavras mais longas que inglês, então "8–9 palavras por frase" pode render frases um pouco mais longas em duração de fala. Priorize o **tempo de fala** sobre a contagem exata de palavras — meça com o wpm real da voz escolhida.

### 6.3 Proporção de comédia
- **Falas de personagem:** 25–32 por 10 min, quase todas **≤ 8 palavras**. Isso é 8–12% das palavras, uma fala a cada 19–25 s.
- **Batidas cômicas:** pelo menos uma a cada 45–60 s nos Atos 1–2 e uma a cada 90 s depois da crise. Nunca dentro do dilema.
- **Ferramentas (K1–K9):**
  - duplo tempo impassível
  - piadinha de testemunha
  - aparte do narrador (1–3 por episódio, < 10 palavras)
  - lista de três com uma virada na terceira
  - piada física literal
  - uma referência de cultura pop de amigo (registro gamer ou anime; genérica ou inventada se um nome puder datar o episódio)
  - uma piada recorrente com 2–3 aparições
  - risada seguida de silêncio antes de uma virada séria
  - uma subestimação no clímax

### 6.4 Números
- **Densidade:** 2–4 números por minuto na primeira metade, cerca de 1 por minuto depois.
- **Sempre emparelhe:** normal vs você, ou o recorde vs você.
- **Unidades familiares para qualquer coisa ≥ 3 dígitos:** campos de futebol, ônibus escolares, celulares, pizzas, uma semana de comida.
- **2–3 contas trabalhadas por episódio,** feitas em uma respirada (taxa × quantidade = resultado → unidade familiar). Confira a aritmética duas vezes.
- **Arredonde para a fala** ("cerca de catorze mil"), mas mantenha a ficha de fatos exata.
- Diga um número como dígitos na tela e como palavras na narração. Isso vale pra qualquer coisa que o ElevenLabs possa ler errado: datas, dinheiro, porcentagem, hora, telefone e sigla — escreva por extenso em `vo` ("dois mil e vinte e quatro", "trinta por cento", "duas da tarde"), nunca "2024", "30%" ou "14h". Abreviação também: escreva "doutor", "avenida", não "Dr.", "Av.".

### 6.5 Diálogo
- Diálogo é **reação, não exposição**. O narrador explica; os personagens reagem.
- A **mãe** recebe 2–4 falas e precisa notar o custo escondido primeiro.
- O **melhor amigo** recebe 3–5 falas (testemunha, tradutor, consciência ou ajudante).
- A **autoridade cética** recebe 1–2 falas.
- O **estranho ou vilão** fala em frases curtas e calmas. Nunca um monólogo de mais de 3 frases.

### 6.6 Banco de transições (fraseados originais; alterne e nunca repita dentro de um episódio)
- **Pivô do título:**
  - "Vamos ver o que isso realmente significa."
  - "Veja o que realmente muda."
  - "Eis o acordo."
  - "Vamos destrinchar isso."
  - "Veja como isso realmente aconteceria."
- **Sinalização de limite:**
  - "Guarda isso no bolso de trás."
  - "Guarda isso."
  - "Anota isso. Você vai precisar."
  - "Essa parte vai importar."
  - "Não esquece dessa."
- **Callback:**
  - "Lembra daquele bolso de trás?"
  - "Aquilo que você anotou?"
  - "Aqui é onde isso importa."
- **Teaser de fato:**
  - "Agora, a parte estranha."
  - "A próxima parte é real."
  - "Cientistas realmente testaram isso."
  - "E fica mais estranho."
  - "Aqui vai um fato que parece invenção."
- **Virada de "mas":**
  - "Essa é a versão divertida. Aqui vem a conta."
  - "Depois os problemas aparecem, um de cada vez."
  - "Tem uma pegadinha. Na verdade, três."
- **Problema real:**
  - "Esses são irritantes. Esse é perigoso."
  - "Nada disso é o que te mantém acordado de noite."
  - "E então você encontra o problema real."
- **Compressão:**
  - "Por algumas semanas, essa é a sua vida."
  - "Funciona. Mais ou menos."
  - "Por dois meses, nada dá errado."
- **Para o mundo maior:**
  - "Naquela noite, …"
  - "No outro lado da cidade, alguém está vendo o mesmo clipe."
  - "Na manhã seguinte, tem um envelope."

### 6.7 Clichês banidos e assinaturas de referência
- **Clichês de narração a evitar:**
  - "você não vai imaginar o que aconteceu depois"
  - "em um mundo onde"
  - "se prepara"
  - "mas espera, tem mais"
  - "pulando para"
  - "resumindo a história"
  - "nem precisa dizer"
  - "no final das contas"
  - "o resto é história"
  - "tudo mudou"
  - "você não vai acreditar"
  - "de cair o queixo"
  - "um divisor de águas"
  - "deixa isso te marcar"
  - "virada de roteiro"
  - "com grandes poderes vêm grandes responsabilidades"
  - "jornada"
  - "desperta" / "libera" (unleash)
  - "embarca"
  - "mergulha de cabeça" (delve)
  - "um testemunho de"
  - "de repente" (nomeie o evento em vez disso)
  - "literalmente" (fora de diálogo)
  - "insano" / "épico" (mais de uma vez)
- **Assinaturas do canal de referência (nunca use):**
  - o nome da organização de recrutamento deles
  - um mentor ou estranho de casaco cinza
  - o slogan deles sobre histórias começando com "IF"
  - a assinatura "só o começo" deles
  - o pivô de mecanismo deles fraseado palavra por palavra
  - o fraseado exato de sinalização de plantio deles
  - o título do clipe viral deles
  - as tags de personagem deles (telecinético de moletom azul, voador de óculos laranja, leitor de mentes de fone de ouvido, cara de armadura de besouro, forte de boné vermelho)
- **Marcas e pessoas reais:** nenhuma marca de produto e nenhuma celebridade real em roteiros ou thumbnails. Use nomes inventados ("o corredor mais rápido do mundo" está ok; um atleta nomeado é só uma âncora de fato, no máximo uma vez, e nunca numa thumbnail).

### 6.8 Assinatura (nossa)
Escolha uma e mantenha para sempre:
- "Até o próximo e-se."
- "Fique curioso. Fique estranho."
- "Todo poder tem um preço. Até a próxima."

O nome do canal e o slogan são decisão do usuário. Deixe `[ASSINATURA]` no roteiro até eles decidirem.

### 6.9 Tags de áudio ElevenLabs (praxe, não opcional)
Use tags de áudio **dentro** do texto de `vo`, exatamente onde a reação acontece — não só como prefixo de direção no começo da fala. Elas não são faladas: o modelo as interpreta como instrução de entrega ou efeito vocal, e o pipeline já ignora o texto dentro de `[colchetes]` ao casar palavras com o tempo de voz, então cues (`"@palavra"`) continuam funcionando normalmente ao redor delas. Sempre em inglês, entre colchetes — é o vocabulário com que o modelo foi treinado, mesmo com o resto da fala em português. (Fonte: elevenlabs.io/docs — "Text to speech prompting", seção eleven v4.)

Catálogo (da própria biblioteca do ElevenLabs; não invente tags fora daqui sem testar antes):
- **Entrega:** `[whispering]` `[singing]` `[slowly]` `[softly]` `[pause]` `[voice breaking]`
- **Personagem:** `[sleepy drowsy voice]` `[witch voice]` `[drunken voice]`
- **Emoção:** `[weak]` `[angry]` `[bored]` `[menacing]` `[playful]` `[tired]` `[excited]`
- **Vocalização:** `[clears throat]` `[coughing]` `[chuckling]` `[sighing]` `[sniffling]` `[yawning]` `[laughing]` `[sharp exhale]` `[scoffing]` `[humming]` `[panting]` `[gasping]`

Regras (direto da documentação oficial, não só convenção nossa):
- Uma tag por reação real, não por frase. A mesma lógica de 6.5 (diálogo é reação, não enfeite) vale aqui: a tag marca o momento em que o personagem *reage*, não decora toda fala.
- **Posição muda o efeito:** uma tag *antes* do trecho define o tom da fala inteira; uma tag *depois* soa como reação a ela. `[sighs] Não dava mais certo` ≠ `Não dava mais certo. [sighs]` — escolha de propósito, não por hábito.
- **Seja descritivo, não vago.** Uma tag ambígua pode ser lida como efeito sonoro em vez de instrução de entrega — prefira `[low, gravelly voice]` a algo solto demais. Isso também vale pra combinar tags: `[sighs, tired]` é válido e geralmente mais previsível que escolher só uma.
- Combine a tag com a voz. O narrador é calmo na base, mas tem maldade e sarcasmo (§6.10): `[sarcastic]`, `[mischievously]`, `[deadpan]`, `[darkly amused]` e um `[menacing]` raro são dele. `[excited]` continua sendo de personagem (`who: "male" | "female"` ou vozes extras em `episode.voices`). Teste no preview de voz antes de confiar numa combinação nova; nem toda voz tem aquela entrega nos dados de treino, então o resultado é menos confiável quanto mais incomum for a combinação.
- Pontuação ainda manda no ritmo. `[pause]` existe, mas reticências (`…`), vírgula e o corte de frase já controlam a maior parte do respiro — reserve `[pause]` para um silêncio que precise ser mais longo que o natural. Travessão (`—`) marca interrupção ou fala sobreposta em diálogo.
- **Nunca use `<break time="Xs" />`** (SSML). Isso é só pra `eleven_flash_v2`/`v2`; no `eleven_v4` (o nosso modelo) não tem efeito — use pontuação ou `[pause]`.
- Nunca ponha uma tag que contradiga a emoção da cena (um `[playful]` num beat de crise quebra o tom).
- **Checagem no review de áudio (CLAUDE.md, passo 7):** ao ouvir o `showwavespic`/áudio final, confira que nenhuma tag "vazou" — o modelo às vezes fala o texto de uma tag em voz alta em vez de executá-la (mais comum com tag mal-formada, sem colchete fechando, ou combinação rara demais para a voz). Se acontecer, reescreva a tag (mais descritiva, ou troque por outra do catálogo) e gere de novo essa seção.
- **Se uma palavra sair com pronúncia errada** (comum em nome próprio ou estrangeirismo), o `eleven_v4` aceita IPA entre barras: `/pɾɔˈnuns.ja/`. Use só na palavra problemática, entre aspas duplas ao passar a transcrição, e teste de novo — a mesma transcrição pode soar diferente em vozes diferentes.

### 6.10 Tom: ácido, ousado, nada fofo (decisão do usuário, 2026-11-08)
O canal **não** tem o tom fofo/família da IFOLOGY. O narrador é um observador que se diverte com a sua desgraça: calmo na base, mas com **maldade e sarcasmo** nos momentos certos. A estrutura de 17 batidas e as premissas continuam valendo; o que muda é a atitude.

- **Narrador sádico-simpático.** Ele narra o desastre com prazer contido e zomba de "você" de leve. Exemplos de registro (não copie, é só a temperatura):
  > Parabéns. Você arruinou a vida de três pessoas. [deadpan] E ainda nem é meio-dia.
  > [mischievously] Claro que você não contou pra ninguém. Ia dar tão certo.
  > Sua mãe chorou. [pause] De rir, mas chorou.
- **Dose:** a base continua `[calm]`/seca, porque o sarcasmo só funciona por contraste. Uma estocada de maldade ou sarcasmo a cada **30–60 s** (≈ 10–20 por 10 min), mais densa nos Problemas e na Consequência, **zero no dilema** (lá o peso é sério e a voz cai).
- **Ninguém é fofo.** A família reage com interesse próprio: a mãe quer lucrar com o poder, o irmão chantageia, o melhor amigo vende o vídeo. Ainda pode haver afeto, mas nunca o "abraço da família resolve tudo". Sem lição de moral dita em voz alta.
- **Stakes ousados.** Valem morte possível (implícita, nunca mostrada), prisão, governo/laboratório atrás de você, humilhação pública em escala nacional, segredo proibido, o fim de algo grande. Escale mais cedo e mais alto que o padrão.
- **Ganchos e títulos apelativos**, desde que **o episódio entregue o que o título promete** (promessa falsa derruba retenção e o YouTube pune). Ex. de temperatura: "E Se Seu Coração Parasse Por 10 Segundos Todo Dia?", "E Se Todo Mundo Ouvisse Seus Pensamentos?".
- **Comédia ácida:** ironia dramática (o público sabe o desastre antes de você), schadenfreude, narrador debochando, a terceira da lista de três sendo cruel. A subestimação no clímax vira deboche ("Foi só um prédio.").
- **Limite monetizável (inegociável):** sem sangue/gore, sem ferimento visível, sem conteúdo sexual, sem palavrão, sem drogas, sem autolesão/suicídio, sem humilhar grupo real (etnia, religião, deficiência). Violência só cartunesca (voa, cai, explode em poeira, levanta). Morte só fora de cena ou como risco.
- **Tags do narrador para isso** (validadas na voz do Yuri em 2026-11-08: o usuário aprovou as 5): `[sarcastic]` `[mischievously]` `[deadpan]` `[darkly amused]` `[chuckling]` `[menacing]` (este, 1–3 vezes por episódio, no narrador). Personagens podem usar as mesmas.

---

## 7. Regras visuais por batida

**Vocabulário do engine** (nomes de código — mantidos em inglês, como no código-fonte):
- **Sets:** `suburb`, `home`, `bedroom`, `classroom`, `cafeteria`, `void`, `city`, `park`, `stadium`, `rooftop`.
- **Cards** (explicadores azul-marinho, `src/cards`): `stat`, `compare`, `distance`, `speed`, `clock`, `chain`, `rules`, `icon`, `title`.
- **Overlays:** `Stat` callout, `Stopwatch`, `Label`, `Bubble`, `Energy`, `TitleOverlay`.
- **FX:** fantasmas, `Shockwave`, `SpeedLines`, `Sparks`, `DustBurst`, `Trail`, `Glow`.

**Taxas de corte medidas:**
- Episódios de 10 min: 19–21 cortes/min no geral (planos de ≈3 s, 9–10 palavras por plano).
- Montagens de comédia: 27–44 cortes/min.
- Batidas de explicação e card: 8–15 cortes/min.
- Set pieces do episódio de 22 min: 2,5–12 cortes/min, usando planos abertos sustentados e movimentos de câmera lentos.

**Regra geral:** um visual novo por 1–2 frases. Nunca sustente um card por mais de 6 s ou um plano 3D por mais de 8 s, exceto tableaux congelados e planos abertos de set piece.

| Batida | Sets | Cards / overlays | Gramática de plano |
|---|---|---|---|
| Abertura fria | `bedroom`/`home`/`classroom`/`cafeteria` | nenhum | Plano 1: close de objeto (relógio, celular, gancho vazio). Depois um médio no herói, um insert de FX de poder, e um dois-planos de testemunha. 6–10 planos em 20 s |
| Pergunta do título | Plano aberto do set principal (`suburb` aérea, `classroom` aberta) | `title` com `bg:false` sobre 3D | Um plano aberto de 4–5 s, push-in lento |
| Mecanismo + limite | `void` ou o set principal | `icon` (a parte do corpo), `chain` (o que muda → o que não muda), `rules` para o limite se necessário | Card, depois um plano 3D de demonstração da mudança |
| Escada de números | Ação 3D mais cards | `compare` (NORMAL vs VOCÊ), `speed`/`stat`/`distance`; callout `Stat` ou medidor sobre 3D | Alterne card ↔ 3D a cada 3–5 s |
| Teste de prova | `stadium`/`park`/`classroom` | Overlay `Stopwatch`, `stat` para o resultado | Close da autoridade → insert do instrumento → herói → autoridade (olhar triplo) |
| Regras | Onde cada teste acontece | Card `rules` (regra atual destacada) antes de cada teste | Card 2–3 s → teste 3D 6–10 s → reação de piada |
| Montagem de vantagens | Escada crescente: `home` → `classroom` → `suburb`/`city` → `park`/`stadium` | `Label` ocasional | Planos de 3–5 s, corte mais rápido do episódio, SFX em cada botão |
| Problemas 1–3 | Locais de piada 3D | Um card por problema (`stat`/`compare`/`chain`) | Card → piada → solução → reação da família (um close em casa) |
| Problema real | Quase-desastre `suburb`/`city` | `distance` ou `chain` para a aritmética do limite | Desacelere: um plano POV mais longo, depois um quase-desastre afiado |
| Maestria | `park`/`rooftop`/`stadium` para treino | `icon` para a analogia (animal ou máquina), `rules` para a regra tema | Montagem de 3 tentativas (falha, quase-falha, sucesso) |
| Crise | `park`/`suburb`/`city`/`stadium` aberto → fechado | `Stopwatch` ou `clock` começa (fica na tela até o fim do clímax) | Plano de estabelecimento aberto, insert do objeto de perigo, close do inocente, reação do herói |
| Dilema | Mesmo set | Card `distance`/`clock` com a aritmética | Close do rosto do herói; sustente 1,5–2 s de silêncio |
| Clímax | Mesmo set, a maior escala do episódio | Só overlay `Stopwatch`. Sem cards completos | Movimentos longos, 10–15 cortes/min, 1 tableau congelado ou batida em câmera lenta no máximo, SFX em cada um dos 3 golpes de repetição |
| Consequência | Mesmo set → `home` | Overlay de celular/vídeo com o título viral (`Label`) | Close do custo (um objeto), reação interesseira da família (nada de abraço), insert de celular |
| Mundo maior | `suburb` noite, janela de `bedroom`, `void` para revelações | `title`-estilo caixa alta opcional para um envelope ou mensagem | Mais lento; silhuetas; um plano de revelação dramático |
| Gancho final | `void`/`city`/`rooftop`/janela | nenhum | 2–4 planos, o último um close sustentado, depois 1 s de preto |
| CTA | Alinhamento de elenco ou close do herói | Card `title` com P1/P2 em caixa alta (nosso fraseado) | Um plano estático ou push-in lento |

**Thumbnail** (das três referências): um personagem, bem grande, com uma expressão convencida ou de olhos semicerrados (`Face` com `lid` 0,4–0,5, `mouth` 0,5, `size` 1,8). Um visual do poder: um ícone de pausa, um borrão de velocidade ou um rosto dividido. 1–2 palavras EM CAIXA ALTA terminando em ponto, que **não são** o título ("LENTO DEMAIS.", "PAUSADO."). Um selo de número grande opcional ("10×"). Um fundo azul-marinho/roxo de cidade noturna com um destaque quente. Sem marcas, sem rostos reais.

---

## 8. Bíblia de série (nossa)

- **Herói:** nosso stickman de jaqueta cinza ("você"). O poder de cada episódio pertence a um "você" *diferente*. Heróis anteriores retornam como participações com uma tag visual e um tique. Mantenha a lista de elenco em `data/story/cast_bible.json` assim que o episódio 2 existir.
- **Estranho recorrente (proposta):** o homem do guarda-chuva amarelo. Ele carrega fechado, em dias de sol, e aparece em ecos, reflexos e nas bordas dos planos. Calmo, educado, ambíguo. O contra-poder dele é a previsão; ele parece saber onde você vai estar. Revele 1 fato novo por episódio e nunca o motivo completo.
- **O mundo maior (proposta):** ainda sem nome de organização. Episódios iniciais sugerem isso por meio de envelopes contendo fotos de outras crianças com poderes. Nomeie só quando o usuário aprovar.
- **Lógica de sequência:** títulos de Parte 2 escalam o número da mesma premissa ("…10 Minutos No Passado" → "…10 Anos No Passado"). Pare na Parte 3: os dados mostram que cada sequência cai pela metade de views, mais ou menos.
- **Gancho final N → herói N+1:** o contra-poder no final de um episódio deveria ser uma ideia do backlog, para que o próximo episódio responda a ele.

---

## 9. Checklist de qualidade do roteiro (tudo precisa ser sim)

**Premissa e outline**
- [ ] Fórmula de premissa totalmente preenchida; todos os 6 testes de premissa passam (§3).
- [ ] O título tem 3–7 palavras, com um número se possível.
- [ ] O limite é plantado em ≤ 0:50 com uma linha de sinalização e resgatado por palavra-chave em 45–55%.
- [ ] Ficha de plantios: ≥ 5 plantios; ≥ 3 resgatados no clímax; 1 piada recorrente; 1 loop deixado aberto.
- [ ] Leia o outline com "mas/portanto" entre as batidas. Nenhum link de "e então" fora da montagem.
- [ ] O risco fica ≤ 2 até 45%, chega a 5 em 60–65%, e fica em 5 por ≤ 25% da duração.
- [ ] Toda batida é marcada N ou ↻. Nenhuma lacuna > 40 s sem N nos primeiros 60%, e nenhuma lacuna > 90 s sem ↻.

**Gancho**
- [ ] O plano 1 é um close de objeto. O poder é visível até 0:08. Sem introdução ou nome de canal.
- [ ] Uma linha de testemunha mais uma resposta impassível fecham a abertura fria.
- [ ] A pergunta do título é dita palavra por palavra até 0:40.

**Ciência e números**
- [ ] ≥ 15 números por 10 min, cada um verificado na ficha de fatos, emparelhado (normal vs você), e com uma unidade familiar onde ≥ 3 dígitos.
- [ ] 2–3 contas trabalhadas, com a aritmética conferida duas vezes.
- [ ] Todo fato tem uma linha de teaser antes.

**Viradas e clímax**
- [ ] A virada de "mas" cai em 25–35%; o problema real em 43–50%; a crise em 56–65%; o clímax começa em 65–72%.
- [ ] A crise tem um relógio correndo que vem de uma regra.
- [ ] O dilema é um binário de 2–6 palavras com um preço nos dois lados.
- [ ] O clímax é vencido pela regra tema, não por mais poder. Um custo visível é pago. O objeto de piada é perdido.
- [ ] A frase de mudança aparece na consequência.

**Comédia e voz**
- [ ] 25–32 falas de personagem por 10 min, ≥ 90% delas ≤ 8 palavras.
- [ ] Uma batida cômica a cada ≤ 60 s antes da crise.
- [ ] 2ª pessoa presente o tempo todo; frase média de 8–9 palavras; 35–45% das frases ≤ 6 palavras.
- [ ] Sem clichês banidos ou assinaturas de referência (§6.7). Faça uma busca por cada frase.
- [ ] A contagem de palavras está dentro de ±5% do orçamento para a duração alvo (calibrado pelo wpm real da voz, ver §4.1).

**Tags de áudio e fala (antes de gastar créditos — §6.9)**
- [ ] `node tools/episode.mjs check <slug>` passa sem erro (colchete, SSML, número cru). Esse é o gate mecânico; os itens abaixo são julgamento, não checa sozinho.
- [ ] Toda tag usada é descritiva, não vaga, e está posicionada de propósito — antes da fala pra dar o tom, depois pra reagir a ela.
- [ ] Nenhuma tag contradiz o tom da cena, e nenhuma pede uma entrega que a voz escolhida provavelmente não tem nos dados de treino (narrador não leva `[excited]`; `[menacing]` no máximo 1–3 vezes).
- [ ] Tom §6.10: uma estocada de sarcasmo/maldade a cada 30–60 s, nenhuma no dilema; família com interesse próprio, sem abraço-resolve-tudo nem lição de moral; nada fora do limite monetizável.
- [ ] Número, data, dinheiro, hora e sigla em `vo` estão por extenso (§6.4), não em dígito.

**Final**
- [ ] O artefato público tem um título irônico. Um observador é mostrado. O mundo maior chega fisicamente.
- [ ] O gancho final quebra uma regra confiável e é jogo justo (explicável por algo já mostrado).
- [ ] O CTA é P1 (fantasia) + P2 (debate de história), ≤ 20 s, com nossa assinatura.

**Adequação de produção**
- [ ] Toda batida mapeia para sets, cards e FX existentes (§7), ou lista a única adição de engine que precisa.
- [ ] Pelo menos um tableau congelado ou pico em câmera lenta, um plano de elenco ou multidão, e 8–14 cards por 10 min.
- [ ] O conceito de thumbnail segue a §7 e seu texto não é o título.

---

## 10. Rubrica de pontuação (100 pontos)

Pontue o outline antes de rascunhar e o rascunho antes da produção.
- **≥ 85:** mande.
- **80–84:** mande depois de corrigir a categoria mais baixa.
- **70–79:** refaça as duas categorias mais fracas.
- **< 70:** repense a premissa.

| Categoria | Pts | Nota máxima quando… | Meia nota quando… | Zero quando… |
|---|---|---|---|---|
| Gancho | 10 | Close de objeto; poder visível ≤ 0:08; botão de testemunha; título até 0:25; uma estranheza plantada | Título em 0:25–0:40 ou um botão fraco | Introdução, um card de título antes, ou o título depois de 0:45 |
| Clareza de premissa | 8 | Mecanismo em ≤ 4 frases, limite sinalizado, escada de 3 comparações | O limite é implícito | O espectador não consegue reafirmar o poder |
| Causalidade (mas/portanto) | 10 | Toda batida ligada por consequência ou complicação | 1–2 links de "e então" | Uma lista de cenas |
| Setup/payoff | 10 | ≥ 5 plantios; o clímax resgata ≥ 3; piada recorrente; virada justa | 3–4 plantios ou o clímax resgata 2 | O clímax usa algo novo |
| Escalada | 8 | Escada de escala em ≥ 4 sets; a curva de risco bate com a §9 | O risco sobe cedo ou tarde demais | Risco plano ou aleatório |
| Cadência de retenção | 10 | Informação nova ≤ 40 s de intervalo; reganchos ≤ 90 s de intervalo; um loop aberto a todo momento | Um período seco de 60–90 s | Períodos secos acima de 90 s |
| Comédia | 8 | 25–32 piadinhas curtas; duplos tempos impassíveis; piada recorrente; um aparte | Piadinhas presentes mas longas ou raras | Sem piadas, ou piadas no dilema |
| Ciência e números | 8 | ≥ 15 números verificados e emparelhados; 2–3 contas trabalhadas; teasers | Menos de 10, ou desemparelhados | Números errados ou inventados (limita a pontuação total em 70) |
| Dilema e clímax | 12 | O poder é o perigo; linha binária; relógio correndo a partir de uma regra; a regra tema vence; custo pago | Falta um relógio ou o custo | Vencido por sorte ou poder novo |
| Personagem | 6 | Desejo vs necessidade, mudança mostrada; a mãe percebe o custo; o amigo tem uma função; um cético presente | Papéis presentes mas planos | Só "você" existe |
| Final | 5 | Artefato irônico → observador → chegada → gancho final que quebra regra → CTA de 2 perguntas | Falta um elemento | Sem gancho ou sem CTA |
| Voz e produção | 5 | 2ª pessoa presente; estatísticas de frase na meta; ±5% palavras; toda linha visualizável com o engine | Desvio menor | Infilmável ou ponto de vista errado |

---

## 11. Exemplo trabalhado: um outline original de 10 min

### "E Se Você Pudesse Ver 10 Minutos No Passado?"
*Checagem de novidade (`tools/ideas/novelty.py`, 2026-10-26): NOVEL, 10/10, nada parecido entre 1.237 títulos concorrentes.*

**Fórmula de premissa**
```
TÍTULO       E Se Você Pudesse Ver 10 Minutos No Passado?
MECANISMO    Onde quer que você olhe, "ecos" transparentes repetem tudo que aconteceu ali nos últimos
             10 minutos, sobrepostos ao presente. Ecos recentes são brilhantes; os antigos são fracos.
CONTINUA     Você vê o passado, mas não consegue ouvi-lo ou tocá-lo. Ecos são silenciosos, e exatamente
             às 10:00 eles desaparecem. (Linha de sinalização: "Guarda isso no bolso de trás.")
ÂNCORA       Você já vê o passado. Seu cérebro mostra o mundo com cerca de um décimo de segundo de
             atraso. A luz da Lua tem 1,3 segundos. A luz do Sol tem cerca de 8 minutos e 20 segundos.
ESCADA       Você normal: 0,1 s → olhando para o Sol: 8 min 20 s → você: 10 minutos, em qualquer lugar
             (600 s vs 0,1 s = 6.000x).
VANTAGENS    Casa: nunca perde nada. Família: resolve "quem comeu isso". Trabalho: campeão de achados e
             perdidos do shopping. Jogo: esconde-esconde imbatível. Bondade: um coelho de pelúcia perdido
             é devolvido. Grande exibição: o final de um filme mudo (falha cômica).
REGRAS       1 Ecos desaparecem com a idade: o mais novo = mais brilhante, se vai às 10:00.
             2 Ecos ficam onde aconteceram. 3 Você só consegue observar: sem som, sem toque.
CUSTOS       1 Multidões: 10 minutos de 300 pessoas é uma nevasca de fantasmas (solução: travar numa cor).
             2 Privacidade: você vê o que ninguém queria que você visse.
             3 Combustível: o cérebro é 2% do seu peso corporal mas queima cerca de 20% da sua energia
             (solução: passas).
REAL         O relógio e o silêncio. O passado é uma trilha que está sempre desaparecendo, e você é uma
             testemunha em quem ninguém consegue acreditar.
REGRA TEMA   "Não persiga o eco. Vá para onde ele está indo."
CRISE        Sua irmã de 6 anos desaparece na feira do condado; você percebe no minuto 4. Faltam seis
             minutos até o eco dela desaparecer.
DILEMA       Correr para contar à mãe e à segurança custa a trilha. Seguir sozinho custa a verdade.
             "A trilha… ou a verdade."
CLÍMAX       Corta na frente em vez de seguir (regra tema). O eco dela desaparece um andar antes (limite).
             O eco mais novo e brilhante do cachorrinho leva o resto do caminho (Regra 1). Custo: uma dor
             de cabeça latejante, e seu celular cai de 30 m (objeto da abertura fria).
ARTEFATO     Clipe de notícia local: "A Criança Que Nunca Olhou Para Trás." (Irônico: você só olha para
             trás.)
MUNDO MAIOR  Naquela noite, um eco de 9 minutos sob o poste de luz: um homem com um guarda-chuva amarelo
             fechado observando sua janela, depois deixa um envelope de fotos de outras crianças com
             poderes.
GANCHO       Pouco antes do eco dele desaparecer, ele se vira e olha para onde você está agora, e diz
             algo que você consegue ler nos lábios. Um eco não consegue te ver. Esse consegue.
CTA          P1 O que você procuraria primeiro com 10 minutos do passado?
             P2 O homem do guarda-chuva: te avisando, ou te caçando?
```

**Desejo / necessidade / mudança.**
- **Desejo:** nunca estar errado, nunca perder nada. Ser quem *sabe*.
- **Necessidade:** parar de viver na repetição. Agir sobre o que você sabe antes que desapareça, e confiar na família com a verdade.
- **Mudança:** no clímax você corre *na frente* da evidência. Na consequência você conta à mãe uma frase verdadeira.

**Elenco.**
- Você (jaqueta cinza).
- Mia, 6, sua irmã caçula, de capa de chuva amarela. Ela é a cor plantada e rouba suas passas.
- Theo, seu melhor amigo. Ele comanda o jogo dos copos e é o parceiro de treino.
- Mãe.
- Pai (uma piada).
- Um segurança (cético).
- O homem do guarda-chuva amarelo (novo estranho recorrente).
- Um cachorrinho chamado Biscoito.

**Ficha de plantios**

| # | Plantio (tempo) | Sinalização | Payoff (tempo) |
|---|---|---|---|
| P1 | Celular achado na geladeira (0:05) | escondido | O celular cai 30 m do andar superior no clímax (7:25) |
| P2 | Ecos são silenciosos (0:44) | sinalização "bolso de trás" | Piada do filme mudo (2:20) → "uma testemunha em quem ninguém acredita" (5:05) → treino de leitura labial (5:50) → leitura labial no gancho final (9:30) |
| P3 | Regra 1: o mais novo = o mais brilhante (1:55) | card de regras | O eco mais brilhante do cachorrinho salva o clímax (7:15) |
| P4 | Jogo dos copos 20/20, chance de 1 em 3,5 bilhões (1:35) | card de estatística | O "como você sabia?" do segurança, depois o texto do Theo "sorte de 1 em 3,5 bilhões" (7:50) |
| P5 | Solução da multidão: travar numa cor, a capa amarela da Mia (3:25) | mostrado | Encontrar o eco da Mia na multidão da feira (6:30) |
| P6 | Passas como combustível do cérebro; Mia rouba elas (4:20) | piada recorrente | Mia te entrega um punhado das suas próprias passas roubadas depois do resgate (7:40) |
| P7 | Regra tema: vá para onde está indo (6:00) | card de regras | Cortando pelas arquibancadas vazias (7:00) |
| P8 | Bondade: o coelho de pelúcia perdido devolvido a uma criança (2:55) | narrador: "a melhor coisa que você já encontrou" | Espelha encontrar a Mia (7:30). Mesma categoria: uma criança pequena |
| P9 | O homem do guarda-chuva no fundo da multidão da feira, guarda-chuva fechado, dia de sol (6:20) | nenhuma | Reconhecido no eco da noite (8:10). Loop aberto para a Parte 2 |

**Batida por batida** (palavras a 175 wpm em inglês; use como referência de ritmo, não meta literal — ≈1.715 no total)

| # | Tempo | Batida | Palavras | Conteúdo (as falas principais são exemplos originais) | Plano visual |
|---|---|---|---|---|---|
| 1 | 0:00–0:20 | Abertura fria | 55 | Seu celular não está no carregador. Você entorta os olhos, e um você transparente de seis minutos atrás passa, celular numa mão, leite na outra, e abre a geladeira. Mia: "Por que seu celular está suando?" Você: "Teve uma manhã longa." | `home`: close do carregador → olhos entortados → ator fantasma ciano (ghostOpacity 0.35) → geladeira → dois-planos com Mia. 8 planos |
| 2 | 0:20–0:25 | Pergunta do título | 15 | "E se você pudesse ver dez minutos no passado? Veja o que realmente muda." | `title` (bg:false) sobre uma aérea matinal de `suburb` |
| 3 | 0:25–0:50 | Mecanismo + limite | 75 | Ecos se sobrepõem ao presente; brilhantes quando novos, fracos quando antigos, desaparecem exatamente aos dez minutos. "E mais uma coisa: ecos são silenciosos. Você vê tudo. Não ouve nada. Guarda isso no bolso de trás." | Card `icon` de olho → `clock` (tique, label "10:00") → plano de `home` com três fantasmas de opacidade diferente |
| 4 | 0:50–1:25 | Escada + ciência | 100 | Teaser: "Aqui está a parte estranha: você já faz isso." Atraso do cérebro ≈0,1 s; a Lua 1,3 s; o Sol 8 min 20 s. "Você normal: um décimo de segundo atrás. Olhando para o Sol: oito minutos. Você: dez minutos, em qualquer lugar que olhar. Seis mil vezes mais para trás." | Card `compare` (NORMAL 0,1 s vs VOCÊ 600 s, "×6.000 MAIS PARA TRÁS"), `stat` (8:20, label "A LUZ DO SOL TEM ESSA IDADE"), plano de `void` do sol |
| 5 | 1:25–1:50 | Teste de prova | 70 | O jogo dos três copos do Theo enquanto você espera no corredor. Vinte rodadas, vinte vitórias. "A chance disso por sorte: cerca de uma em três bilhões e meio." Theo: "Faz de olhos fechados." Você: "Isso... não é como os olhos funcionam." | `bedroom`: insert dos copos → fantasma das mãos do Theo → rosto do Theo (olhar triplo) → `stat` "1 EM 3,5 BILHÕES" |
| 6 | 1:50–2:30 | Regras | 115 | Regra 1: o eco do cachorro caminha pelo quintal, depois desaparece no meio do passo às 10:00. Regra 2: do outro lado da rua você não consegue ver a manhã da padaria; precisa estar onde aconteceu. Regra 3: você vê os últimos dez minutos do filme de família que perdeu, só rostos e sem palavras, e chuta o final errado. Pai: "Ele era o irmão?!" | Card `rules` ×3 (atual 1/2/3) → fantasma do cachorro no quintal de `suburb` → padaria em `city` → fantasmas no sofá de `home` |
| 7 | 2:30–3:10 | Vantagens | 115 | Nunca mais perde as chaves ou os fones; o controle remoto está debaixo do Pai. "Quem comeu a última fatia?" O eco diz: o Pai. Pai: "Eu estava... verificando." Um trabalho de achados e perdidos no shopping: 40 carteiras devolvidas numa semana. O coelho de pelúcia de uma criança devolvido: "A melhor coisa que você já encontrou." Esconde-esconde: você é banido. | Montagem rápida: `home` → fachada de shopping em `city` → `park`. `Label` "40 CARTEIRAS / 1 SEMANA" |
| 8 | 3:10–4:40 | "Mas" + Problemas 1–3 | 265 | "Essa é a versão divertida. Aqui vem a conta." **P1 Multidões:** o almoço é dez minutos de 300 crianças empilhadas numa nevasca de fantasmas; você bate numa mesa. Solução: trava numa cor e ignora o resto; você treina na capa amarela da Mia. **P2 Privacidade:** o Pai ensaiando um discurso para o chefe no espelho 14 vezes; sua professora dançando sozinha numa sala vazia. Você não consegue "desver" isso. Professora: "Por que você está sorrindo?" Você: "Alergia." **P3 Combustível:** "Seu cérebro é dois por cento do seu corpo, mas queima cerca de vinte por cento da sua energia. Rode duas linhas do tempo ao mesmo tempo e você está morrendo de fome às dez da manhã." Passas em todos os bolsos. Mia rouba elas. A mãe compra passas pelo balde. | `cafeteria` com nevasca de 30 fantasmas → plano de isolamento da capa amarela (resto dessaturado) → fantasma do espelho em `home` → fantasma da professora em `classroom` → `compare` (2% do peso vs 20% da energia) → insert do bolso |
| 9 | 4:40–5:25 | Problema real | 130 | "Esses são irritantes. Esse é perigoso." Callback: *dez minutos, e silencioso*. A bicicleta do Theo é roubada do bicicletário da escola. Você chega lá às 9:30, e vê trinta segundos de um capuz e uma direção. Depois desaparece. Mesmo que você tivesse visto um rosto, quem acredita em "eu vi o passado"? "Você é uma testemunha em quem ninguém acredita, segurando uma prova que se autodestrói." | `suburb` bicicletário da escola → fantasma do ladrão desaparecendo (rampa de opacidade) → card `clock` (rápido, "9:30 → 10:00") → rosto do Theo |
| 10 | 5:25–6:05 | Maestria + regra tema | 115 | Teaser: "Então você estuda os melhores rastreadores da Terra." Um cão de caça consegue seguir uma trilha de dias, e um bom rastreador não só segue; ele adivinha para onde a trilha está indo e corta o caminho. Treino: Theo caminha rotas aleatórias; você começa no minuto nove. Falha. Falha. Depois você começa a prever. Leitura labial em vídeos mudos: "só cerca de um terço da fala aparece nos lábios." Regra tema: "Não persiga o eco. Vá para onde ele está indo." | `icon` (cachorro/seta) → fantasmas de treino em `park` → plano do atalho → card `rules` mostrando a regra tema |
| 11 | 6:05–6:30 | Crise | 70 | "Por um mês, nada na sua casa se perde. Depois, a feira do condado." Você compra limonada; a Mia se foi. Você percebe no minuto quatro. "Faltam seis minutos até o eco dela desaparecer." (Fundo: um homem segurando um guarda-chuva amarelo fechado num dia de sol.) | Multidão aberta da feira em `park`/`stadium` → insert da limonada → lugar vazio → overlay `Stopwatch` "ECO 06:00" começa e fica |
| 12 | 6:30–6:50 | Dilema | 55 + 2 s | A técnica da capa amarela encontra o eco dela perseguindo um cachorrinho solto por um buraco na cerca para dentro do estádio fechado. A mãe está do outro lado da feira; são dois minutos de ida e volta, mais explicar algo em que ninguém acredita. "A trilha... ou a verdade." Você manda uma linha de texto ("Estádio. Portão C. Confia em mim.") e corre. | Nevasca de multidão → isolamento da capa amarela → buraco da cerca → close do rosto (silêncio) → insert do texto no celular |
| 13 | 6:50–7:35 | Clímax | 120 + 3 s | O eco fraco dela sobe rampa após rampa. No minuto oito você para de seguir; ela está indo *para cima*, então você corta pelas arquibancadas vazias. Fileira após fileira. Às 10:00 o eco dela desaparece um andar antes. Nada. Depois uma forma mais brilhante: o cachorrinho, de dois minutos, correndo de um lado para o outro de uma porta. O mais novo é o mais brilhante. Você o segue até o andar superior: a Mia detrás de uma grade quebrada, segurando o cachorrinho. Um passo. Dois. Três. Você a traz de volta. Seu celular escapa do bolso e cai trinta metros. Não sobrevive. | `stadium` vazio: subida aberta → fantasma da Mia desaparecendo → atalho pelas cadeiras (movimento longo) → batida de blecaute → fantasma brilhante do cachorrinho → close na grade → 3 golpes de passo com SFX → insert da queda do celular. `Stopwatch` chega a 00:00 |
| 14 | 7:35–8:00 | Consequência | 70 | Sua cabeça está latejando. A Mia te entrega um punhado das suas próprias passas roubadas. Um segurança: "Como você sabia para onde ela foi?" Você: "Chute de sorte." Texto do Theo: "Sorte de 1 em 3,5 bilhões." A notícia local passa o clipe da câmera do estádio: "A Criança Que Nunca Olhou Para Trás." Frase de mudança: você conta à mãe uma frase verdadeira sobre o que você consegue ver, e ela só segura sua mão. | Degraus do `stadium` → insert das passas → segurança → insert do celular com o título da notícia (`Label`) → `home` com a Mãe |
| 15 | 8:00–9:10 | Mundo maior | 205 | Naquela noite você olha pela sua janela: um eco de nove minutos, um homem sob o poste de luz com um guarda-chuva amarelo fechado, olhando para sua janela por oito minutos. Ele caminha até sua caixa de correio, deixa um envelope, e vai. Dentro estão três fotos de crianças que você nunca conheceu: uma em pé de lado num muro, uma na frente de janelas estilhaçadas, uma borrada no meio de uma troca entre uma sala de aula e um telhado. No verso: "Vão precisar de alguém que vê o que aconteceu." Mãe, de baixo: "Seu celular novo está na geladeira?" Você: "Eu não tenho celular." | Janela de `bedroom` → fantasma noturno sob o poste em `suburb` (ciano frio, baixa opacidade) → insert da caixa de correio → envelope → 3 inserts de foto (semente para ideias do backlog) → escadas de `home` |
| 16 | 9:10–9:40 | Gancho final | 85 | Você reproduz o eco dele mais uma vez, de perto. Aos 9:40 do eco, pouco antes de desaparecer, ele se vira e olha direto para onde você está *agora*. Um eco não consegue te ver. Esse consegue. Os lábios dele se movem. Só um terço da fala aparece nos lábios, mas você treinou. "Eu já vi como isso termina." Depois 10:00. Se foi. | Push-in no rosto fantasma → reação do herói → close dos lábios → fantasma se dissolve → 1 s de preto |
| 17 | 9:40–10:00 | CTA | 50 | "Então, o que você procuraria primeiro se pudesse ver dez minutos no passado? E o homem do guarda-chuva amarelo: ele está te avisando, ou te caçando? Conta pra gente nos comentários. [ASSINATURA]" | Card `title` com P1/P2 sobre o `suburb` noturno |

**Ficha de fatos numéricos (verificar antes de gravar a voz).**
- A percepção visual atrasa a realidade em aproximadamente 0,1 s (≈80–100 ms).
- A luz da Lua leva cerca de 1,3 s para chegar à Terra. A luz do Sol leva cerca de 8 min 20 s.
- 600 s ÷ 0,1 s = 6.000.
- (1/3)^20 = 1 em 3.486.784.401 ≈ 1 em 3,5 bilhões.
- O cérebro é cerca de 2% da massa corporal e usa cerca de 20% da energia em repouso.
- Leitura labial: só cerca de 30–40% dos sons da fala são distinguíveis nos lábios.
- Cães de caça conseguem seguir trilhas de cheiro com dias de idade.
- 300 alunos e 30 m são números de história, não fatos. Diga-os como história.

**Mapa de regancho (lacunas):**

| Tempo | Regancho | Lacuna |
|---|---|---|
| 0:44 | sinalização do limite | — |
| 1:35 | 1 em 3,5 bilhões | 51 s |
| 2:20 | final errado do filme | 45 s |
| 3:10 | a conta | 50 s |
| 4:40 | perigoso | 90 s |
| 6:00 | regra tema | 80 s |
| 6:20 | relógio de 6 minutos | 20 s |
| 6:50 | trilha ou verdade | 30 s |
| 7:15 | o eco mais brilhante do cachorrinho | 25 s |
| 8:00 | o eco do guarda-chuva | 45 s |
| 9:30 | o eco olha para você | 90 s |

Nenhuma lacuna passa de 90 s.

**Escalada.**
- **Escala:** `home` → `bedroom` → `suburb`/`city` → `cafeteria`/`classroom` → feira em `park` → `stadium` → rua noturna (o mundo maior).
- **Risco:**
  - 1 até 3:10
  - 2 durante os problemas
  - 3 no roubo da bicicleta (4:40, 47%)
  - 5 a partir do desaparecimento da Mia (6:05, 61%) até o clímax
  - 4–5 no gancho final

**Notas de produção.**
- Ecos usam atores fantasma (ciano frio, opacidade mapeada pela idade: 1 min = 0,6 → 9 min = 0,12).
- A nevasca de multidão usa 20–30 fantasmas de baixa opacidade em rotas de caminhada em loop.
- O plano de isolamento da capa amarela usa um grade de dessaturação em tudo exceto o fantasma da Mia.
- O overlay `Stopwatch` corre de 6:05 a 7:35.
- Nenhum set novo é necessário.
- Adições de engine: nenhuma necessária. Bom ter: um helper de opacidade-ao-longo-do-tempo para fantasmas.

**Thumbnail.**
- Close do herói com um sorriso de canto de olhos semicerrados, um olho brilhando ciano.
- Atrás dele, um fantasma ciano desbotado dele mesmo no meio do passo.
- Texto: "JÁ TINHA ACONTECIDO." Selo de número: "10 MIN".
- Fundo de subúrbio noturno, luz quente de varanda como destaque.

**Rascunho de descrição.**
> Ver o passado parece um superpoder. Até o passado começar a desaparecer. Quem você acha que é o homem do guarda-chuva amarelo? Conta aí embaixo. ▶ [link do episódio relacionado]

**Autopontuação (outline):**

| Categoria | Pontuação |
|---|---|
| Gancho | 9 |
| Premissa | 8 |
| Causalidade | 9 |
| Setup/payoff | 10 |
| Escalada | 7 |
| Retenção | 9 |
| Comédia | 7 |
| Números | 7 |
| Dilema/clímax | 11 |
| Personagem | 5 |
| Final | 5 |
| Voz/produção | 5 |
| **Total** | **92/100** |

- **Mais fraco:** densidade de números (≈12 números). Adicione 3 números verificados a mais nos problemas.
- **Também fraco:** escalada. A feira é um salto grande, então adicione uma vantagem de escala de cidade.
