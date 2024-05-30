# Quasar App (pf)

A Quasar Project

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Build the app for production
```bash
quasar build
```

O Programa conta com um layout igual ao do twiter, o mesmo conta com duas sidbar reativas consuante o tamanho do ecra, na sidebar do lado esquerdo estao disponiveis 3 rotas home que aparece os tweets do user e da para escrever um novo tweet, about que tem uma breve descricao do twiter e o Acount que inclui o Login e o Register.
O primeiro passo apos a intalacao do projeto e ir a pagina acount e criar um user clicando no butao registar o formolario ira mudar para a pagina de registar, se clicar no mesmo butao ira mudar para o login temos dois tipos de user tipo 0 user normal e tipo 1 que e admin.
Na pagina home os user tipo  0 podem cirar tweets, dar like, seguir outros users e se quiser apagar o seu proprio tweet pode. os user tipo 1 admin pode fazer todas as fucnionlidades do user 0 e podem deletar todos os tweets e user..
