# Design do Checklist Operacional D&D

Referência de composição: [Shopify Polaris](https://designmd.app.br/library/polaris), adaptada ao produto e à identidade D&D. A aplicação continua usando seus componentes React e Tailwind existentes.

## Alterar cores e fontes

Edite **`src/app/theme.css`**. É a fonte única dos tokens da interface Next.js publicada na Vercel.

| Variável | Uso |
| --- | --- |
| `--color-brand` | Botões principais e item selecionado no menu |
| `--color-accent` | Destaques turquesa |
| `--color-background` | Fundo das telas |
| `--color-surface` | Cards, campos e navegação |
| `--color-text` | Textos e ícones |
| `--font-body` | Fonte dos textos, campos e botões |
| `--font-heading` | Fonte dos títulos |
| `--radius-control` / `--radius-card` | Arredondamento |

As cores usam três números RGB separados por espaços. Exemplo: `--color-brand: 137 23 69;` equivale a `#891745`. O Tailwind usa esses valores com transparências, sem duplicar a paleta.

Para trocar a fonte por uma já instalada: `--font-body: "Arial", sans-serif;`. Para uma fonte própria, inclua o arquivo em `public/fonts/`, declare `@font-face` no tema e use o nome da família nessas variáveis. Títulos herdam a fonte do corpo até que `--font-heading` seja alterada.

Depois de editar, execute `npm run typecheck` e `npm run build`; publique o commit pelo fluxo já existente do projeto. Não é necessário editar cada tela. As logos SVG são ativos de marca independentes e não mudam com a paleta.

## Padrões

- Fundo neutro, superfícies brancas, bordas leves e sombras discretas.
- Tipografia neutra, títulos semibold e informação organizada por hierarquia.
- Marca reservada a ações principais e seleção; texto em tom neutro.
- Status com texto e ícone: verde concluída, âmbar pendente/correção, azul em andamento e vermelho reprovada. Os tokens de status são independentes da marca.
- Foco visível, navegação por teclado, link para pular ao conteúdo e redução de movimento conforme a preferência do dispositivo.
- Menu lateral no desktop, menu móvel e tabelas com rolagem dentro de seu contêiner.

`docs/index.html` é o protótipo estático anterior e tem implementação separada. O snapshot `CODIGO_FONTE_CONSOLIDADO.md` é uma referência histórica, não a fonte do tema atual.
