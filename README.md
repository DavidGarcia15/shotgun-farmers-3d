# Farmers Field — 3D Prototype

Um jogo de exploração agrícola em primeira pessoa inspirado no loop de "armas vegetais" de *Shotgun Farmers*, mas com uma abordagem não-violenta: em vez de eliminar NPCs, você os transforma em animais aliados com pólen.

## Mecânicas Principais

- **Armas Vegetais Detalhadas:** Escolha entre **Espingarda de Milho** (cano duplo com grãos e coronha de madeira), **Sniper de Girassol** (cano longo com luneta de pétalas) ou **Lançador de Abóbora** (tubo largo com gomos e vinhas) usando **1**, **2** ou **3**.
- **Munição e Plantio:** Cada arma tem um pente (clipe). Atire com o botão esquerdo. Se errar, a semente planta uma arma no chão.
- **Recarga por Colheita:** Aproxime-se da planta crescida e pressione **E** para colher. Quanto mais tempo ela cresceu, mais munição você recebe. Uma animação de recarga é executada na arma em mãos.
- **Muzzle Flash:** Cada tiro gera uma pequena luz colorida no cano (amarela para milho, branca para girassol, laranja para abóbora).
- **Aliados:** Acertos em NPCs acumulam pólen. Ao encher a barra, o fazendeiro se transforma em um animal ajudante (capivara, coelho ou galinha) que planta sementes decorativas.
- **Sem Violência:** Não há morte; o objetivo é converter os NPCs com pólen.

## Controles

| Tecla | Ação |
| --- | --- |
| W A S D | Mover |
| Mouse | Olhar |
| Shift | Correr |
| Space | Pular |
| 1 / 2 / 3 | Trocar arma |
| Clique Esquerdo | Atirar (gasta munição) |
| E | Colher planta (recarrega) |
| Esc | Pausar |

## Executar Localmente

```bash
python -m http.server 8000
