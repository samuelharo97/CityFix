# CityFix

CityFix é um aplicativo móvel que permite aos cidadãos reportar problemas de infraestrutura urbana para as autoridades competentes.

## Funcionalidades

- Autenticação de usuários (login/registro com email ou Google)
- Tela inicial mostrando denúncias recentes ou próximas
- Formulário para criar nova denúncia com:
  - Título
  - Descrição
  - Categoria (Iluminação, Buracos, Lixo, etc.)
  - Upload de fotos/vídeos
  - Localização via GPS
- Tela de minhas denúncias para acompanhar o status das submissões

## Tecnologias Utilizadas

- React Native
- Expo
- TypeScript
- React Navigation
- React Native Paper
- Expo Location
- Expo Image Picker
- Expo Camera
- Expo Auth Session

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Expo CLI
- Expo Go app no dispositivo móvel

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/cityfix.git
cd cityfix
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Inicie o projeto:

```bash
npm start
# ou
yarn start
```

4. Use o app Expo Go para escanear o QR code e testar o aplicativo

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── navigation/     # Configuração de navegação
  ├── screens/        # Telas do aplicativo
  ├── services/       # Serviços e APIs
  ├── types/          # Definições de tipos TypeScript
  ├── utils/          # Funções utilitárias
  └── constants/      # Constantes e configurações
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
