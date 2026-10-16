# Shark Tube

Calculadora de tubulação para tubulistas e caldeireiros. Funciona no navegador do celular, instala como app (PWA) e roda sem internet.

## Cálculos

- **Ângulo / desvio** e **45 graus**: triângulo de offset (ângulo, desvio, diagonal e avanço)
- **Desvio X Y**: desvio em dois planos, com o desvio verdadeiro
- **Desvio 3D**: diagonal no espaço, ângulos α e µ e tubo reto descontando os cotovelos
- **Curva segmentada**: de 2 a 8 gomos, com desenho técnico e todas as cotas de corte
- **TEE / boca de lobo**: gabarito de corte do ramal, ponto a ponto
- **Dimensões de tubo**: NPS, DN, diâmetro externo e raio de cotovelo (ASME B36.10 / B16.9)
- **Frações**: decimal para fração de polegada, até 1/64"

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:5173.

## Gerar a versão de produção

```bash
npm run build
```

Os arquivos ficam em `dist/`, prontos para publicar em qualquer hospedagem estática.

## Site de vendas

A landing page fica em `site/` (HTML estático com as telas do app em `site/screens/`). Basta publicar essa pasta.
