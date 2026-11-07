# Prévia de UX — 20 leis

Esta branch é exclusiva de avaliação. Não foi mesclada na main.

## Objetivo por tela
- Login: acessar a operação; ação principal Entrar.
- Painel: localizar trabalho pendente; ação principal Ver atividades.
- Listagens: encontrar registros e abrir detalhes; criação conforme permissão.
- Cadastros: preencher e salvar; confirmação no rodapé, acessível no celular.
- Atividade: executar, enviar evidência e concluir; supervisão revisa depois.
- Relatórios e histórico: consultar e exportar informação.

## Aplicação e limites
1. Hick: menu com três destinos imediatos e Mais opções; filtros do painel recolhidos.
2. Fitts: controles, botões e seleções com alvo mínimo 44px; 16px nos campos mobile.
3. Jakob: preservados logo para início, perfil no topo, navegação e formulários convencionais.
4. Proximidade: rótulos junto dos campos; ações separadas por borda e espaço.
5. Miller: formulários agrupados; progresso sem criar etapas artificiais. CPF/cartão não se aplicam.
6. Doherty: estados pendentes, skeleton e transições existentes preservados. Não foi feita medição de 400ms em todos os dispositivos/redes.
7. Von Restorff: painel com Ver atividades em destaque; filtros secundários. Conclusão muda de destaque quando confirmação abre.
8. Fitts: rodapé dos cadastros sticky no celular e confirmação flexível.
9. Posição serial: Painel e Atividades primeiro; perfil e saída separados da gestão.
10. Pico-final: confirmações existentes preservadas; atividade informa espera de revisão ou aprovação.
11. Progresso: campos obrigatórios preenchidos e três fases da atividade. Não é porcentagem de dados já salvos.
12. Tesler: cálculos e periodicidade existentes preservados. CEP/cartão não se aplicam ao produto.
13. Default: novo usuário inicia com menor privilégio (gerente); novas rotinas não selecionam toda a rede automaticamente.
14. Prevenção: validação nativa + mensagens por campo; conclusão bloqueada se falta foto; lojas inativas desabilitadas no modelo.
15. Recuperação: erros locais por campo e resumo navegável, sem apagar valores. Erros de servidor ainda usam alerta geral.
16. Similaridade: componentes e tokens compartilhados; identidade de cores preservada.
17. Região comum: cartões e áreas de progresso com bordas discretas.
18. Parkinson: sem novas etapas obrigatórias; autocomplete existente preservado e nome adicionado no cadastro de usuário.
19. Divulgação progressiva: Mais opções e filtros do painel abrem em um nível; destino ativo fica visível.
20. Zeigarnik: indica preenchimento e próximo passo. Não salva rascunhos entre visitas; evita guardar senhas/dados pessoais no navegador.

## Roteiro de avaliação
1. Entrar com um dos perfis demonstrativos oferecidos na tela de login.
2. Abrir Painel → Ver atividades; testar filtros e limpar filtros.
3. No menu Mais opções, criar/editar um modelo ou usuário com dados fictícios.
4. Deixar campo obrigatório vazio, informar e-mail inválido, corrigir e salvar.
5. Conferir progresso e mensagem final após cadastro.
6. Como gerente, abrir atividade; testar bloqueio sem foto e conclusão após evidência.
7. Como supervisor, revisar atividade concluída.
8. No celular, abrir/fechar menu, navegar e usar rodapé de salvar.
9. Com teclado, usar Tab, Shift+Tab, Escape no menu e link Pular para o conteúdo.

## Ambiente
Prévia Vercel usa backend demonstrativo, sem Supabase de produção. Dados são temporários e podem reiniciar ou variar entre instâncias; testes de persistência, permissões reais, usuário por username e administração geral dependem de homologação com banco separado. Não envie fotos reais nem cadastre senhas reais.

## Verificação
TypeScript e 33 testes existentes passaram antes da entrega. A inspeção visual e os resultados do build são registrados na mensagem de entrega. A aprovação do usuário é necessária antes de publicar em produção.
