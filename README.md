# Bolos e Delícias Mangueira — site

Site estático (HTML + CSS + JS, sem build). Abra com um servidor local:

```bash
python -m http.server 5173
```

## Estrutura

```
index.html                 página (seções: header, hero, destaques, depoimentos, vitrine, rodapé)
css/styles.css             tokens de cor/tema + componentes (mobile-first)
js/main.js                 tema claro/escuro, menu, WhatsApp, carrossel, animações
assets/img/placeholders/   imagens provisórias (substituir)
```

## Cores e temas

- Paleta oficial em `:root` (`--brand-*`) no topo de `css/styles.css`.
- Tema claro e escuro em `[data-theme="light"]` / `[data-theme="dark"]` (tokens `--color-*`, `--btn-*`, `--wa-*`).
- Tema inicial segue o sistema do visitante; a escolha manual fica salva no navegador.

## WhatsApp

Número central em `js/main.js` → `CONFIG.whatsapp`. Cada link com `data-wa="mensagem"` abre o WhatsApp com a mensagem já preenchida.

## Logo

- `assets/img/logo.webp`: logo oficial recortado em círculo, fundo transparente (usado no banner do hero).
- `favicon.ico`, `assets/img/favicon-32.png`, `assets/img/apple-touch-icon.png`: ícones da aba e do atalho no celular.

## Árvore de fundo

- `assets/img/arvore-clara.webp` / `arvore-escura.webp`: silhueta da árvore pintada na parede da loja (fundo transparente), já colorida para cada tema.
- Aplicada como fundo fixo em `body::before` no CSS; imagem e intensidade vêm dos tokens `--tree-image` e `--tree-opacity` de cada tema.
- Não usa `mask-image` de propósito: o Chrome bloqueia máscaras ao abrir o site direto do arquivo (`file://`).

## Produtos

- Fotos em `assets/img/produtos/` (WebP 800×800, recortadas em 1:1).
- Mais de uma foto por produto: dentro do card, use `class="...__media gallery" data-gallery` com um `.gallery__track` contendo as `<img>` (padrão `nome.webp`, `nome-2.webp`…). Bolinhas e setas são criadas pelo `js/main.js`.
- Preços ficam no próprio card (`<data value="2.50">R$ 2,50</data>`) na seção `#vitrine` do `index.html`.
- Ao alterar CSS/JS, aumente o `?v=` nos links do `index.html` para evitar cache antigo.

## Avaliações (carrossel)

A seção `#depoimentos` é um carrossel: o 1º slide mostra a nota do Google (4,9, "mais de 260 avaliações" e temas mais citados); os seguintes são avaliações de clientes.
Para adicionar uma avaliação, copie um bloco `<figure class="testimonials__slide testimonial">` dentro de `.testimonials__track` — as bolinhas são geradas automaticamente.
Atualize a nota/total no `index.html` quando mudarem.

As imagens usam `object-fit: cover` e `aspect-ratio` fixo: basta trocar o `src` (e o `alt`) que o layout não quebra.
