# Plano de ação: otimizar tokens e velocidade

Escrito em 2026-11-08, depois do episódio `quem-tem-crush` (10:13, 162 planos). **Para começar numa sessão nova:** leia este arquivo inteiro e execute as fases na ordem, marcando `[x]` em cada tarefa concluída e anotando o resultado medido. Pergunte ao usuário antes de qualquer coisa que mude o PATH do Windows ou gaste créditos.

Máquina: 12 núcleos de CPU, NVIDIA RTX 3060. Ferramentas fora do PATH do terminal do Claude: `node` em `C:\Program Files\nodejs`, `ffmpeg`/`ffprobe` em `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin`. Até a Fase 0 resolver, prefixe os comandos com:
`export PATH="/c/Program Files/nodejs:/c/Users/G/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin:$PATH"`

> ## ★ Prioridades destacadas pelo usuário
>
> 1. **Cola de roteiro (tarefa 2.1).** Criar uma versão resumida de 1–2 páginas do manual de roteiro (`docs/story/STORY_BLUEPRINT.md`, 928 linhas), que hoje é lido inteiro a cada episódio. É a economia de tokens mais simples e se repete em todo episódio.
> 2. **Modelos mais fracos para ações que não precisam do mais forte (tarefa 2.4).** Rodadas de verificação, buscas e edições mecânicas não precisam do modelo principal.
> 3. **Lembrete: ensinar o usuário a escolher o modelo por ação.** O usuário pediu explicitamente para aprender a fazer isso sozinho. Ver a seção "Lembrete: ensinar a escolher modelo por ação", no fim deste documento. A sessão que executar a tarefa 2.4 **deve ensinar, não só configurar**.

**Atenção:** outra sessão do Claude pode estar produzindo outro episódio (`invasao-zumbi`) e mexendo nos mesmos arquivos do motor. Antes de editar `src/` ou `tools/`, confirme com o usuário que ela não está ativa.

## Linha de base medida (para comparar depois)

| Etapa | Custo medido |
|---|---|
| `review.mjs` (quadros de revisão, 162 planos × 4 + eventos ≈ 700 stills em série) | 10+ min por rodada; foram 3 rodadas |
| Revisor independente | rodada 1 ≈ 330 mil tokens, rodada 2 ≈ 300 mil, rodada 3 (focada) ≈ 150 mil |
| Render final (`--concurrency=4 --crf=14`) | ~25 min; arquivo de 1,17 GB |
| Voz (`episode.mjs voice`, 47 chamadas em série) | ~3 min, ~3.700 créditos |
| Cada `stills.cjs` | ~30 s só de empacotar o projeto antes do 1º quadro |
| Retrabalho | 3 rodadas de revisão; a maioria por erros de encenação evitáveis (Fase 3) |

---

## Fase 0 — Preparação (≈15 min)

- [ ] **0.1 Git.** O projeto não é repositório. `git init`, criar `.gitignore` com `node_modules/`, `.venv/`, `out/`, `final/`, `.env`, `public/episodes/*/vo/`, `public/episodes/*/mix.wav`, `__pycache__/`; commit inicial "baseline". *Por quê:* desfazer com segurança e ver o que outra sessão mudou. *Verificar:* `git status` limpo.
- [ ] **0.2 PATH.** Perguntar ao usuário se pode adicionar as duas pastas acima ao PATH do usuário (`setx` ou Configurações do Windows). *Ganho:* acaba com chamadas perdidas procurando `node`/`ffmpeg` em toda sessão. *Verificar:* num terminal novo, `node --version` e `ffmpeg -version`.

## Fase 1 — Velocidade (código pequeno, ganho grande)

- [ ] **1.1 Stills em paralelo.** `tools/stills.cjs` renderiza um quadro por vez no laço `for (const j of jobs)`. Trocar por um pool de N páginas (padrão 4, opção `--parallel N`) usando o mesmo `browser`. *Ganho esperado:* `review.mjs` de ~12 min para ~3–4 min. *Verificar:* cronometrar `node tools/review.mjs quem-tem-crush` antes e depois; os arquivos em `out/quem-tem-crush/review/` saem iguais.
- [ ] **1.2 Revisão incremental.** `tools/review.mjs` aceita só `<slug>` e refaz tudo. Adicionar `--only c8,r6,...` (ids de plano): renderiza e lista no `manifest.json` só esses planos (mais os eventos que os envolvem); o resto do manifest fica como estava. *Ganho:* rodadas 2+ em ~1 min. *Verificar:* `--only c8` gera só `shot_007*.jpg`.
- [ ] **1.3 Render final mais rápido e leve.** `tools/build-episode.mjs` linha 45 fixa `--concurrency=4 --crf=14`. Trocar para concorrência padrão `Math.max(2, os.cpus().length - 4)` (8 nesta máquina) e CRF 18, com `--crf N` e `--concurrency N` para sobrescrever. *Ganho:* render ~40% mais rápido, arquivo ~metade (≈600 MB). *Verificar:* renderizar `quem-tem-crush --from 0 --to 60` com o antigo e o novo; comparar tempo, tamanho e um quadro lado a lado.
  - Opcional: testar se o Remotion 4 instalado aceita aceleração de hardware no Windows/NVIDIA. Se não aceitar, não forçar.
- [ ] **1.4 Voz em paralelo.** `tools/episode.mjs`, laço `for (const id of ids)` (~linha 302) chama `synthesize` uma seção por vez. Trocar por um pool de 3 chamadas simultâneas (opção `voice.parallel` no `episode.json`), com nova tentativa automática em erro 429 (limite da API). Manter a ordem do `sections.json`. *Ganho:* voz em <1 min. *Verificar:* rodar num episódio de teste curto (pipetest) e conferir que `align` não acusa diferença de palavras. **Gasta créditos: pedir OK ao usuário.**
- [ ] **1.5 Reaproveitar o bundle.** `stills.cjs` chama `bundle()` a cada execução (~30 s). Guardar o bundle em `out/.bundle` e reaproveitar quando nenhum arquivo em `src/` ou `public/episodes/<slug>/` mudou (comparar a data de modificação mais recente). *Ganho:* ~30 s em cada chamada de stills/review. *Verificar:* a 2ª chamada seguida começa a renderizar sem a linha "bundled in".

## Fase 2 — Menos tokens

- [ ] **★ 2.1 Cola de roteiro (prioridade do usuário).** Criar `docs/story/COLA_ROTEIRO.md` (1–2 páginas) a partir do `STORY_BLUEPRINT.md` (928 linhas): tabela de batidas do 10:00 com tempos, fórmula de premissa, checklist §9 em forma curta, regras de tags §6.9 e números §6.4. No `CLAUDE.md` (passo 2 do episódio longo): "leia a cola; abra o blueprint completo só na seção que precisar". *Ganho:* dezenas de milhares de tokens por episódio.
- [ ] **2.2 Kit do gerador de episódio.** Os helpers estão dentro de `tools/episodes/quem_tem_crush.py` (627 linhas): `A`, `S`, `C`, `cam`, `crush`, `shot_block`, e o cálculo do cronômetro a partir de `timing.json`. Mover para `tools/episodes/kit.py`, fazer `quem_tem_crush.py` importar dele, e criar `tools/episodes/_modelo.py` (esqueleto com as 17 batidas comentadas). *Verificar:* regenerar `quem-tem-crush` e confirmar que o `episode.json` sai idêntico (`git diff` vazio).
- [ ] **2.3 Pré-checagem barata.** Criar `tools/sheet.mjs <slug> <id,id,...>`: renderiza um still por plano (em ~70% da duração) e monta um mosaico 4×N em `out/lab/<slug>_sheet.jpg`. No `CLAUDE.md`, passo 7, antes do `review.mjs`: "rode a sheet em ~16 planos-chave (abertura, cada set novo, clímax, gancho) e corrija o óbvio". *Ganho:* pega a maior parte dos erros antes da revisão de 162 planos.
- [ ] **★ 2.4 Modelo certo para cada ação (prioridade do usuário).** No `CLAUDE.md`, passo 7: rodada 1 da revisão completa com o modelo padrão; rodadas 2+ com `review.mjs --only <planos alterados>`, briefing focado nos itens abertos, e o revisor num modelo menor. Estender a mesma lógica às outras ações (tabela abaixo). O usuário pediu essa economia em 2026-11-08 **e quer aprender a fazer isso sozinho** — ver o lembrete no fim. *Ganho:* rodadas 2+ de ~300 mil para ~50–100 mil tokens, e menos custo em buscas e tarefas mecânicas.

  | Ação no pipeline | Precisa do modelo forte? | Sugestão |
  |---|---|---|
  | Escrever o roteiro, decidir encenação e clímax | Sim | modelo principal da sessão |
  | Revisão independente, rodada 1 (achar problemas) | Sim | modelo principal |
  | Rodadas 2+ da revisão (conferir se foi corrigido) | Não | modelo intermediário |
  | Buscar arquivo, procurar texto no código | Não | agente de busca rápido / modelo pequeno |
  | Tradução de docs, edições mecânicas em lote | Não | modelo intermediário |
  | Gerar quadros, rodar audit, build | Não usa modelo | só ferramentas; não delegar a agente |

## Fase 3 — Evitar retrabalho

- [ ] **3.1 Regras novas no `CLAUDE.md`** (seção "Hard-won rules"), cada uma com uma linha de causa e solução:
  - **Pose parcial volta o resto para "em pé":** passe a pose completa num personagem sentado.
  - **`sitFloor` afunda os pés ~0,4 m:** para sentar no chão ou no meio-fio, use `sit` em cima de um `crate` (h 0,45) ou `kneel`.
  - **Prop `smoke` perto da câmera parece pedra:** use puffs pequenos (`size` ~0,25, `n` 60, `wind`) e longe da linha de visão.
  - **Brilho aditivo some de dia, em qualquer cor:** use `glow` sólido ou o selo `crush`.
  - **Flow precisa dos mesmos props e atores nos dois planos;** se não, eles somem no meio do movimento.
  - **`insert` de mão dá erro no audit:** use `close` com `focus: 'handR'` e `dist` curto.
  - **Dois atores muito distantes no mesmo enquadramento automático deixam o quadro vazio:** separe os planos ou use câmera explícita.
  - **Diálogo:** confira que quem fala está de frente; `over: '<ouvinte>'` resolve a maioria.
  - **Números em cards formatam em inglês** até a tarefa 3.2.
- [ ] **3.2 Números em PT-BR.** `src/cards/kit.tsx:86` e `src/episode/overlays.tsx:16` usam `toLocaleString('en-US')`. Trocar para `'pt-BR'` (todo o conteúdo do canal é PT-BR desde 2026-11-08). *Verificar:* `npx remotion still CardLab` de um `stat` com 0,1 e de um `compare` com 5000 mostra "0,1" e "5.000". Avisar o usuário: muda também os episódios antigos se forem re-renderizados.
- [ ] **3.3 Tamanho de objeto na mão.** `HandProp` (`src/sets/props.tsx:12`, usado em `src/engine/Stickman.tsx:457`) só recebe `type`. Aceitar `hold: { R: 'flower', scaleR: 2 }` ou `holdScale`, para objetos que a narração destaca. *Verificar:* still do Caio com a flor em `scale` 2.
- [ ] **3.4 Avisos novos no audit** (opcional, `src/episode/audit.ts`):
  - **Pose parcial num ator sentado:** avisar quando ela faria o ator levantar.
  - **Props diferentes num flow:** avisar quando os props mudam entre dois planos unidos por flow.

## Fase 4 — Fechar

- [ ] **4.1 Medir de novo** no `quem-tem-crush` (sem regravar voz): tempo do `review.mjs`, do `review.mjs --only` com 5 planos, do render de 60 s. Anotar na tabela de linha de base acima ("antes → depois").
- [ ] **4.2 Testes:** `npm run typecheck`, `npm test` (21/21), `node tools/qa.cjs audit quem-tem-crush` com 0 erros.
- [ ] **4.3 Cópia portátil:** `node tools/pack/pack.mjs` (o `CLAUDE.md` pede para reempacotar depois de mudar motor, ferramentas ou docs).
- [ ] **4.4 Commit** por fase (`git commit`), mensagem curta dizendo o ganho medido.

## ★ Lembrete: ensinar a escolher modelo por ação

**Para a sessão que executar a tarefa 2.4:** o usuário pediu para *aprender* a escolher o modelo por ação, não só que fique configurado. Pare antes de configurar, explique em português simples, com exemplos deste projeto, e deixe o usuário fazer pelo menos uma das configurações. Confirme cada nome de comando e de opção na documentação do Claude Code antes de ensinar (o agente `claude-code-guide` responde isso); não ensine nada de memória.

O que ensinar, em ordem:
1. **Trocar o modelo da sessão inteira:** o comando `/model`, que o usuário já usou em 2026-11-08 (`/model opus`). Quando vale a pena: roteiro e clímax no modelo forte; sessão de ajustes mecânicos num menor.
2. **Escolher o modelo de um subagente na hora de criar:** o parâmetro de modelo da ferramenta de agentes. É o que o Claude usa ao disparar o revisor. Mostrar como pedir ("rode o revisor da rodada 2 num modelo menor").
3. **Fixar o modelo de um tipo de agente:** criar um arquivo em `.claude/agents/` (ex.: `revisor-verificacao.md`) com o modelo definido no cabeçalho. Assim, toda rodada de verificação já usa o modelo certo sem precisar lembrar. Fazer junto com o usuário.
4. **Modelo padrão dos subagentes:** a configuração que define o modelo usado por padrão quando nenhum é pedido. Confirmar o nome exato na documentação.
5. **Esforço (effort):** além do modelo, dá para pedir menos ou mais esforço de raciocínio numa tarefa; explicar quando usar cada um.
6. **Regra prática para o usuário:** criar e decidir → modelo forte; conferir, buscar e repetir → modelo menor; tarefas que só rodam ferramentas → não precisam de agente nenhum.

No fim, pedir ao usuário que diga com as próprias palavras qual modelo usaria em 2–3 ações do pipeline, para confirmar que ficou claro.

## Já resolvido nesta produção (não refazer)

- Deixas `@palavra` com acento falhavam em silêncio: corrigido em `src/episode/cue.ts`, `src/episode/audit.ts` e `tools/sfx/episode_audio.py`.
- O `cast` do episódio apagava a roupa do personagem (merge raso): corrigido em `src/episode/resolve.ts`.
- Overlay `crush` (selo rosa com %): `src/overlays/CrushMeter.tsx`, já com proteção contra sair do quadro.
- `episode.mjs check`: bloqueia a voz se houver colchete aberto, SSML ou dígito na narração.
