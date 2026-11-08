# MOTOR DE IDEIAS: gerando premissas "E Se" que vencem

Este é o componente de geração de ideias. Ele transforma o que fez os vídeos de referência funcionarem em um gerador repetível, uma rubrica de pontuação e um formato de pitch. O Claude o executa sempre que o backlog tiver menos de 5 ideias não produzidas com pontuação ≥ 80, ou quando o usuário pedir ideias novas.

**Arquivos**
| Arquivo | Conteúdo |
|---|---|
| `data/story/idea_matrix.json` | A matriz de premissas (eixos, valores, sinais comprovados, flags de saturação), templates de título e thumbnail, pesos da rubrica |
| `data/story/ideas_backlog.json` | Ideias pontuadas. 25 foram semeadas em 2026-10-26 |
| `tools/ideas/novelty.py` | Checagem de novidade lexical contra títulos de concorrentes. Executar com `python -I` |
| `data/story/competitors/*.txt` | Listas de títulos de concorrentes (`id\|duration_s\|views\|title`): 31 canais, 1.237 títulos em 2026-10-26 |
| `data/story/patterns.json` | Padrões de história. Os critérios da rubrica "profundidade de custo", "dilema" e "sequência" vêm daqui |
| `docs/story/STORY_BLUEPRINT.md` | O que acontece com uma ideia escolhida a partir daí |

---

## 1. O que vence: evidências das listas de títulos

As contagens de views vêm de `novelty.py stats`. O múltiplo é relativo à mediana de cada canal, o que corrige pelo tamanho do canal.

| Cluster | Vencedores (views, × mediana do canal) | Leitura |
|---|---|---|
| **Tempo / percepção** | Reaction Time 10x 4.5M (14.9×) · Reflexes 100x 351K (21.9×) · One Second Felt Like Ten 665K (2.2×) · Stop Time 593K (3.5×) · See 10 Seconds Into the Future 297K (10.2×) | O veio mais rico: 5 dos ~15 maiores outliers. Todo mundo já sentiu o tempo desacelerar |
| **Parte do corpo × número** | 10x Faster 813K (4.8×) · Heart Beat 10x Faster 564K (19.4×) · 100x Stronger 240K | "Seu [órgão/traço] × N" é a forma de título mais limpa. Uma parte do corpo nova gera um estouro até em canais pequenos |
| **Inteligência** | 500 IQ 1.4M (4.6×) · IQ 10x Higher 865K (51×) · Knew Everything 82K (5.1×) | Uma fantasia universal. Cópias tardias esmorecem (1000 IQ: 16K, 1.0×) |
| **Poderes clássicos icônicos** | Turn Invisible at Will 454K (28×) · Shapeshift 342K · Teleport 309K · Fly 202K | Funcionam em canais já estabelecidos. Saturado agora |
| **Sem dor / invulnerável** | Stopped Feeling Pain 361K (12×) · Nobody Could Feel Pain 240K · Indestructible 234K | **Saturado:** 7+ canais já têm um vídeo de "sem dor", e a maioria das cópias recentes fica abaixo de 2K |
| **Mecânica de dinheiro** | Money Grew 10x Every Day 893K (5.6×) · $1 Every Time You Blinked 33K (52×) | Um cluster emergente. O número é o gancho |
| **Reset de vida** | Kindergarten With All Your Memories 388K · Time Loop 156K | Um ângulo de nostalgia. "Restart Your Life… Forever?" fez 47K |
| **Fracos** | Zombie Apocalypse 68K → 35K → 25K · Read Minds 75K · Walk Through Walls 70K · LeBron 5K · "(FULL MOVIE)" 24K / 19K · Hear 10x Better 4.6K | Cenários, celebridades, compilações e poderes só-de-sentido não viajam bem |

**Sete leis de uma premissa vencedora.** Todo critério da rubrica remete a uma destas.
1. **Capacidade pessoal, não um cenário.** "Você *é/pode/tem* X" vence "você está no lugar Y".
2. **Um número concreto** (10x, 100x, 500, 10 segundos) no título. Isso é 8 dos 10 maiores outliers.
3. **Instantaneamente visualizável em um plano só.** A thumbnail e a abertura fria são a mesma imagem.
4. **Payoff cotidiano relacionável** para alguém de 13 a 25 anos: escola, tarefas de casa, esporte, jogos, dinheiro.
5. **Novidade adjacente vence novidade pura.** Os maiores estouros em canais pequenos trocaram *um* elemento de uma família já comprovada: coração em vez de tempo de reação, reflexos ×100, QI ×10. Um poder totalmente novo não tem demanda comprovada. Um poder clonado não tem novidade.
6. **Custo e dilema embutidos.** O episódio só funciona se o próprio poder causar o problema do clímax (ver o blueprint, L4 e S1).
7. **A primeira versão clara vence; sequências decaem.** A Parte 2 ainda fica acima da mediana; a Parte 3 cai pela metade de novo, mais ou menos. Clones de um título já feito acima de 100K por um canal grande performam abaixo.

---

## 2. A matriz de premissas (gerador)

Uma ideia é um valor de cada eixo. As listas completas, com exemplos e sinais comprovados, estão em `idea_matrix.json`.

| Eixo | O que é | Exemplos |
|---|---|---|
| **A. Família de poder** | O que muda | tempo/percepção · multiplicador corporal · mente/habilidade · matéria e energia · espaço/posição · HUD de informação · biologia · som/sentidos · regras de objeto · mecânica de vida |
| **B. Número / multiplicador** | O gancho do título | 10x · 100x · 1.000x · "10 segundos/minutos" · "N%" · "todo dia em dobro" · contagens (3 vagas, 10 cópias) |
| **C. Domínio cotidiano** | Onde as vantagens vivem | escola · casa/tarefas · esporte · trabalho de meio período · celular/games · família · amigos/redes sociais · transporte |
| **D. Custo embutido** | A conta física ou biológica | energia/calorias · escala (quadrado-cubo) · limites de percepção · momento/inércia · dívida de tempo · sobrecarga sensorial · efeitos colaterais em outros · não dá pra desligar · conservação (vem de algum lugar) |
| **E. Limite plantado** | O que continua normal | corpo continua normal · sentidos continuam normais · alcance · duração/recarga · linha de visão · precisa tocar · silencioso · um por vez |
| **F. Arquétipo de dilema** | A escolha do clímax | poder-como-perigo em resgate de precisão · salvar o estranho vs guardar o segredo · o prêmio vs a pessoa · mover o dano para outro lugar · verdade vs bondade · sacrificar o poder · tentação da corrupção |
| **G. Potencial de série** | O que vem a seguir | escalada de número na Parte 2 · papel de equipe (batedor, médico, tanque, transporte, inteligência, controle) · vilão com contra-poder |

**Regras de combinação**
- A + B precisam formar um título de 3 a 7 palavras. Se o número parecer forçado, ele pertence ao selo da thumbnail em vez do título (e a pontuação de gancho numérico cai).
- D precisa conter pelo menos um *número real e checável*. E precisa ser capaz de causar F; confira se F deixaria de existir sem E.
- Prefira um **movimento de novidade adjacente**: comece de uma família comprovada (Lei 5) e mude exatamente uma coisa:
  - a **parte do corpo** (reação → coração → olhos)
  - a **direção** (parar o tempo → desacelerar só o que você olha)
  - o **alvo** (encolher você mesmo → aumentar objetos)
  - o **sentido do tempo** (futuro → passado)
  - o **dono** (curar você mesmo → curar os outros mas levar o machucado deles)
- Evite qualquer combinação marcada como `saturated` em `idea_matrix.json`, a menos que a virada mude completamente o dilema.

---

## 3. Regras de eliminação (qualquer uma rejeita a ideia)

1. Um cenário ou lugar sem poder pessoal (zumbis, um lugar estilo backrooms, o céu, a vida de uma celebridade).
2. Pessoas reais, marcas ou franquias no título ou na thumbnail.
3. Núcleo inseguro para anúncios: drogas, conteúdo sexual, autolesão, violência gráfica, tragédias ou desastres reais, armas como vantagem principal.
4. Veredito DUPLICATE do `novelty.py` contra um título com ≥ 100K views, *e* nenhuma mudança no dilema.
5. A abertura fria não consegue mostrar o poder em um único plano de 3 segundos.
6. O clímax não precisa do limite plantado.
7. Precisa de simulação de fluido, água ou criatura complexa que o engine não consegue simular (ver viabilidade na rubrica).

---

## 4. Rubrica de pontuação de ideias (100 pontos)

Pontue com honestidade. Na dúvida, use a âncora mais baixa.

| Critério | Pts | Âncora máxima | Âncora média | Âncora baixa |
|---|---|---|---|---|
| **Gancho numérico** | 10 | Um multiplicador ou número é a premissa e está no título (10x, 100x, 10 minutos) | Um número cabe só no selo da thumbnail (5) | Nenhum número relevante (0–2) |
| **Demonstração visual instantânea** | 15 | Um plano de 3 segundos deixa inequívoco *e* já é a thumbnail | Precisa de 2–3 planos ou um card (8) | Precisa de explicação antes de ficar visível (0–4) |
| **Uso cotidiano relacionável** | 10 | ≥ 4 usos óbvios para adolescentes (escola, casa, esporte, dinheiro) | 2–3 usos (5) | Só usos exóticos (0–2) |
| **Amplitude de vantagens** | 5 | ≥ 6 vantagens distintas, de escala doméstica a mundial | 4 vantagens (3) | ≤ 2 vantagens (0–1) |
| **Profundidade de custo** | 15 | ≥ 3 custos com números reais, cada um mostrável como gag, mais um "problema real" de outro tipo (perigo para os outros ou identidade) | 2 custos, ou custos sem números (8) | Nenhuma conta real (0–4) |
| **Força do dilema** | 15 | O poder ou o próprio limite *é* o obstáculo do clímax; binário com preço nos dois lados; um relógio correndo vem de uma regra | Existe um dilema, mas é externo (8) | O herói simplesmente vence (0–4) |
| **Sequência / universo** | 10 | Um título de escalada de número para a Parte 2, um papel de equipe claro e um vilão com contra-poder já se escrevem solos | 1–2 desses (5) | História fechada (0–2) |
| **Viabilidade do engine** | 10 | Só sets, cards, FX e rig já existentes | Uma pequena adição ao engine (6) | Precisa de fluidos, criaturas ou deformação não suportados (0–3) |
| **Novidade** | 10 | Pontuação do `novelty.py`, ajustada por sobreposição semântica (ferramenta lexical; ver §5 passo 4) | | |

**Limiares**
- **≥ 85:** faça o pitch agora.
- **80–84:** faça o pitch se a grade precisar de variedade.
- **70–79:** mantenha no backlog; tente uma virada de novidade adjacente.
- **< 70:** descarte.

---

## 5. Procedimento: 30 candidatas → top 3 no pitch

1. **Atualize** as listas de concorrentes se tiverem mais de 7 dias:
   ```
   python -I tools/ideas/novelty.py refresh
   ```
   Procure canais novos cerca de uma vez por mês:
   ```
   python -I tools/ideas/novelty.py search "what if you could" --n 40
   ```
   Depois atualize com `--add <handle>` para qualquer canal NOVO relevante.
2. **Leia o sinal.** Execute `python -I tools/ideas/novelty.py stats` e anote qualquer outlier novo (≥ 5× a mediana do canal) dos últimos 30 dias. Adicione a família dele a `idea_matrix.json → proven_signals`.
3. **Gere 30 candidatas** em 3 lotes:
   - **10 movimentos de novidade adjacente:** pegue as 5 famílias mais comprovadas e aplique 2 dos 5 movimentos de troca (§2) a cada uma.
   - **10 combinações da matriz:** escolha uma combinação A × B × C × D × E × F, pelo menos 2 vindas de famílias pouco usadas (som, regras de objeto, HUD de informação, biologia).
   - **10 viradas de mecânica de vida ou número:** "todo dia em dobro", "$1 cada vez que…", "N vagas", "10 vidas".

   Escreva cada uma como um título mais uma logline de uma frase no formato *mecanismo → limite → dilema*.
4. **Passagem de novidade.** Coloque as candidatas em um arquivo JSON temporário no formato `{"ideas": [{"title": …}]}` no scratchpad, depois execute:
   ```
   python -I tools/ideas/novelty.py batch <file>
   ```
   A ferramenta é **lexical**. Julgue também a sobreposição semântica à mão: "10 vidas" ≈ "Respawn", "100% de mira" ≈ "Never Miss", "curar os outros" ≈ "cura". Reduza a pontuação de novidade quando uma premissa for a mesma ideia com outras palavras, e registre o porquê em `novelty_note`.
5. **Passagem de eliminação.** Aplique a §3. Normalmente 30 → 18–22.
6. **Pontue** as sobreviventes na rubrica, preenchendo os 9 números. Escreva a lista de custos e a linha do dilema *antes* de pontuar esses critérios. Se não conseguir escrevê-los, a pontuação é baixa.
7. **Selecione as top 3 com variedade.** Pegue a maior pontuação de **famílias de poder diferentes**, e pelo menos um movimento de novidade adjacente mais uma ideia de novidade pura. Desempate pela força do dilema, depois pela demonstração visual.
8. **Faça o pitch** de cada uma das 3 no formato da §6, e acrescente todas as ideias pontuadas a `ideas_backlog.json` com `"status": "candidate"`. Mantenha o arquivo ordenado por `score.total`.
9. **Depois que o usuário escolher uma:**
   - Mude o status dela para `"chosen"`.
   - Preencha a fórmula de premissa do blueprint.
   - Depois do lançamento, registre as views em 7 e 28 dias em `results`.
   - A cada 5 lançamentos, compare as pontuações da rubrica com os resultados reais e ajuste os pesos em `idea_matrix.json → rubric`.

---

## 6. Formato de pitch (um por ideia)

```
TÍTULO        E Se Você …?                          (+ 2 alternativos)
LOGLINE       Uma frase: mecanismo → o que continua normal → o que dá errado.
ABERTURA FRIA O plano cotidiano de 3 segundos que prova isso.
NÚMEROS       3 números reais que carregam o episódio (linha de base vs você).
CUSTOS        Problema 1 / 2 / 3 → o problema REAL.
DILEMA        "A… ou B." e por que o limite causa isso. Relógio correndo.
CLÍMAX        Quais regra e plantios vencem; o que custa.
SEQUÊNCIA     Título da Parte 2 · papel de equipe · contra-poder para o gancho final.
THUMBNAIL     Personagem + expressão · visual do poder · texto 1–2 palavras EM CAIXA ALTA terminando em "." · selo de número.
SETS / CARDS  Sets e tipos de card do engine necessários; qualquer adição ao engine.
PONTUAÇÃO     Detalhamento dos 9 critérios + total; veredito de novidade + título concorrente mais próximo.
```

**Regras de título**
- Use a forma "E Se Você [Pudesse VERBO / Fosse N× ADJETIVO / Tivesse N SUBSTANTIVO]?" ou "E Se Sua [PARTE DO CORPO] Fosse N× [ADJETIVO]?".
- 3–7 palavras. Primeira Letra Maiúscula. O número como dígito, com "x" minúsculo ("10x").
- Sem "(Parte 1)" no primeiro episódio. As sequências escalam o número ("…10 Minutos…" → "…10 Anos…") em vez de dizer "Parte 2".
- Sem celebridades, marcas ou lugares.

**Regras de thumbnail** (das 3 referências, traduzidas para o nosso engine)
- Um herói, enorme, com uma expressão convencida ou de olhos semicerrados. Para ideias de "tarde demais" ou "ih, deu ruim", use uma expressão de choque em vez disso.
- Um visual de poder inequívoco (um borrão de velocidade, um ícone de pausa, um eco fantasma, um rosto dividido).
- 1–2 palavras EM CAIXA ALTA terminando em ponto, em branco ou amarelo, que comentem o título em vez de repeti-lo ("LENTO DEMAIS." / "PAUSADO." / "JÁ TINHA ACONTECIDO.").
- Um selo de número opcional no canto superior ("10×", "10 MIN").
- Um fundo azul-marinho/roxo de cidade noturna com um objeto de destaque quente.
- Sem pessoas reais, marcas ou produtos.

---

## 7. Planejamento de série e universo

- Toda ideia registra um **papel de equipe** (batedor, médico, tanque, transporte, inteligência, controle, furtivo, suporte). Misture papéis: os próximos três episódios devem cobrir três papéis diferentes.
- Toda ideia registra um **contra-poder**, a coisa que o venceria. O gancho final do episódio N deve revelar um contra-poder que é a ideia do episódio N+1 (a virada de perspectiva, X5).
- **Arcos:** planeje no máximo 3 partes por premissa. Lance a Parte 2 dentro de 2–5 dias enquanto a Parte 1 ainda está sendo recomendada, e fixe-a no topo da descrição da Parte 1.
- **Guarda de variedade:** nunca dois episódios seguidos da mesma família de poder, e nunca dois episódios de variante de corrupção seguidos.

---

## 8. Retrato do backlog (top 10 de 25, 2026-10-26)

Todas as 25 são premissas originais escritas para este canal. Os detalhes completos estão em `ideas_backlog.json`.

| # | Título | Pontuação | Novidade | Família |
|---|---|---|---|---|
| 1 | E Se Você Pudesse Ver 10 Minutos No Passado? | 90 | 10 NOVEL | tempo/percepção |
| 2 | E Se Você Pudesse Trocar De Lugar Com Qualquer Pessoa? | 89 | 10 NOVEL | espaço/posição |
| 3 | E Se Você Pudesse Aprender Qualquer Habilidade em 10 Segundos? | 89 | 8 RELATED | mente/habilidade |
| 4 | E Se Sua Voz Fosse 100x Mais Alta? | 87 | 8 RELATED | som |
| 5 | E Se Você Pudesse Ver os Status de Todo Mundo? | 87 | 8 RELATED | HUD de informação |
| 6 | E Se Você Pudesse Deixar Qualquer Coisa 10x Maior? | 86 | 6 (ferramenta 4 CLOSE de um "Woke Up 10x Bigger" com 1K views) | regras de objeto |
| 7 | E Se Você Pudesse Pular 100x Mais Alto? | 86 | 4 CLOSE (só um vídeo com 886 views) | multiplicador corporal |
| 8 | E Se Você Pudesse Copiar Tudo Que Toca? | 86 | 9 NOVEL | matéria |
| 9 | E Se Seus Olhos Fossem 10x Mais Rápidos? | 86 | 5 (ferramenta 3; adjacente a Reaction Time 10x) | tempo/percepção |
| 10 | E Se Você Pudesse Se Esticar 10x Mais? | 86 | 9 NOVEL (precisa de trabalho de rig) | multiplicador corporal |

**Grade sugerida para o primeiro lote** (3 famílias e papéis diferentes):
1. *Ver 10 Minutos No Passado* (inteligência). O outline completo é o exemplo trabalhado do blueprint.
2. *Trocar De Lugar Com Qualquer Pessoa* (transporte).
3. *Aprender Qualquer Habilidade em 10 Segundos* (suporte).

O gancho final do episódio 1 já planta fotos da "parede", "janelas estilhaçadas" e crianças "no meio da troca", que correspondem às ideias do backlog *Andar Em Paredes*, *Voz 100x Mais Alta* e *Trocar De Lugar*.
