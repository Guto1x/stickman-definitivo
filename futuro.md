# Futuro: Projeto 2 — série contínua com votação do público

Ideia registrada em 2026-11-08, a pedido do usuário. **Não iniciar sem ele pedir explicitamente.** Fica aqui só pra não perder o conceito nem os requisitos levantados, e pra não misturar com o pipeline ativo do canal "E Se" (`CLAUDE.md`, `docs/story/STORY_BLUEPRINT.md`).

## Conceito

Cada vídeo é "Dia N" de uma história contínua (não um episódio fechado como o formato atual). No fim de cada vídeo, a história apresenta algumas opções pro que acontece a seguir. O público vota nos comentários do YouTube; a opção mais votada vira o canon oficial do episódio "Dia N+1".

## Por que depois, e por que este motor

O usuário já tentou esse formato com outros motores e não deu certo (motivo ainda não detalhado). A intenção é reaproveitar a **arquitetura** deste projeto — Remotion + Three.js, o rig do stickman, a avaliação determinística por tempo (`evalActor`, `camAt`, ver a conversa sobre "como o motor gera quadros consistentes") — como base técnica do Projeto 2, em vez de recomeçar do zero. Não é pra reaproveitar o *conteúdo* nem o *blueprint de roteiro* do canal atual — só o motor.

## Requisitos levantados pelo usuário, a detalhar quando o projeto for retomado

1. **Episódios contínuos.** Não é "um vídeo = uma história fechada". Cada vídeo novo parte de onde o anterior (e o voto do público) deixou. Precisa de um jeito de registrar o estado real da história — o que já aconteceu, o que foi decidido por voto, o estado de cada personagem — pra todo roteiro novo partir desse estado real, não da memória de quem escreve.

2. **Furos de roteiro.** Preocupação explícita do usuário. Numa série contínua e ramificada por voto, é fácil um episódio novo contradizer algo já estabelecido. Vai precisar de algo como uma "ficha de canon" por série — parecida com a ficha de plantios do `STORY_BLUEPRINT.md` atual (§2.5), mas **acumulada ao longo de todos os episódios já publicados**, não só dentro de um. Todo roteiro novo teria que ser conferido contra essa ficha antes de escrever.

3. **Mecânica de votação.** Cada episódio termina apresentando N opções pro "Dia N+1" (provavelmente via overlay/card — o sistema de `src/cards` já existe e pode servir de base). O público vota no comentário do YouTube. Em aberto: quem lê os votos e decide o vencedor (o usuário manualmente? Claude lendo comentários via alguma integração?), e como esse resultado vira o ponto de partida do roteiro seguinte.

4. **Detalhes de animação.** Citado pelo usuário sem detalhar — a conversar quando o projeto for retomado. Hipótese: nuances de atuação pros personagens recorrentes ao longo de uma história mais longa (reação ao resultado do voto, callbacks visuais a eventos de episódios anteriores), mas isso precisa de uma conversa específica, não deve ser assumido.

5. **Personagens com características reais, não só cor fixa.** Hoje `CastMember` (`src/types.ts`) só tem roupa, cor, acessório, altura e largura do torso — nada de personalidade ou identidade visual duradoura além da roupa. Uma série com elenco recorrente em dezenas de episódios precisa de um sistema de personagem mais rico: traços de personalidade consistentes e, se possível, algo visual fixo que não seja só "camisa azul" (cabelo, proporção de corpo, maneirismo de pose ou fala padrão), pra o público reconhecer o mesmo personagem de episódio pra episódio mesmo quando a roupa muda.

## Onde isso mora

Pasta `projeto-2/` (criada vazia por enquanto, ver `projeto-2/README.md`) — reservada pro código e docs desse segundo formato quando for retomado. Não compartilha pipeline com o canal "E Se" atual.

## Status

Engavetado. Sem início de implementação.
