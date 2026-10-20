# Integração SENTRY

O domínio `testedomvpciber-one.vercel.app` já está cadastrado no portal. O arquivo `middleware.ts` integra este projeto Next.js ao serviço.

## Configuração

No projeto da aplicação na Vercel, adicione em **Settings → Environment Variables**, no ambiente **Production**:

| Variável | Valor |
| --- | --- |
| `SENTRY_SITE_KEY` | Chave deste site, copiada do painel SENTRY |
| `SENTRY_ENGINE_URL` | `https://sentry-proxy.onrender.com` |
| `SENTRY_MODE` | `shadow` |

Depois de salvar as variáveis, faça um novo deploy. Variáveis adicionadas depois de um deploy só serão usadas no próximo.

Para desenvolvimento local, copie `.env.example` para `.env.local` e preencha `SENTRY_SITE_KEY`. O arquivo `.env.local` está ignorado pelo Git; a chave não deve ser colocada no código, em commits ou em variáveis `NEXT_PUBLIC_*`.

No modo `shadow`, as rotas normais continuam disponíveis; as rotas de armadilha são encaminhadas ao serviço SENTRY. Se a chave estiver ausente, o middleware permite que a aplicação continue funcionando, sem ativar a integração.

## Git e Vercel

Os arquivos que precisam chegar ao repositório são `middleware.ts`, `.env.example` e este documento. O push para a branch de produção pode disparar o deploy automático, conforme a configuração do projeto na Vercel.

O cadastro do domínio no painel e a instalação do middleware são etapas distintas. Quando o CLI responde que o domínio já existe, ele encerra antes de criar os arquivos locais. Para um site existente, o comando de instalação usa a chave do site:

```sh
npx @sentry-cyber/init@0.1.1 --key=SUA_CHAVE_DO_SITE
```

Este projeto já recebeu o middleware. A configuração do ambiente da Vercel continua necessária.
