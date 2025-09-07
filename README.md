# Dashboard V4 Company - Carteira de Inadimplência

## 📋 Descrição

Dashboard analítica completa para gestão da carteira de inadimplência da V4 Company. O sistema permite upload de planilhas (CSV ou XLSX), processa os dados e apresenta análises detalhadas com visualizações interativas e insights de IA.

## 🎨 Design

- **Cores V4 Company**: Vermelho (#e50914), Preto (#000000), Branco (#ffffff)
- **Faustão**: Presente no header como "Amuleto da Conversão"
- **Tipografia**: Montserrat (Google Fonts)
- **Interface**: Dark theme com elementos em vermelho

## 🚀 Funcionalidades

### 📤 Upload de Planilhas
- Suporte para arquivos .xlsx e .csv (máx. 10MB)
- Validação automática de formato
- Processamento em tempo real
- Feedback visual de progresso

### 📊 Visão Geral
- Métricas principais (total de casos, valor em aberto, status mais comum)
- Gráficos interativos (pizza e barras)
- Rankings de melhores e piores unidades
- Valores formatados em Real (R$)

### 🏢 Análise por Unidades
- Lista completa de unidades com filtros
- Detalhamento de casos por unidade
- Busca e ordenação personalizável
- Visualização de clientes por unidade

### 👥 Análise por Clientes
- Lista de clientes com histórico completo
- Detalhes de casos individuais
- Informações de competência, status e observações
- Filtros avançados

### 🤖 Análise com IA
- Chatbot interativo para consultas
- Análises automáticas dos dados
- Insights baseados em padrões
- Respostas contextualizadas

## 🛠️ Tecnologias

### Frontend
- **React 19** com Vite
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Recharts** para gráficos
- **Lucide Icons** para ícones
- **Framer Motion** para animações

### Backend
- **Node.js** com Vercel Functions
- **Formidable** para upload de arquivos
- **XLSX** para processamento de Excel
- **Papa Parse** para processamento de CSV

## 📁 Estrutura do Projeto

```
dashboard-v4-company/
├── api/
│   └── upload.js              # API de upload e processamento
├── src/
│   ├── assets/
│   │   └── faustao.jpg        # Imagem do Faustão
│   ├── components/
│   │   ├── UploadTab.jsx      # Componente de upload
│   │   ├── OverviewTab.jsx    # Visão geral
│   │   ├── UnitsTab.jsx       # Análise por unidades
│   │   ├── ClientsTab.jsx     # Análise por clientes
│   │   └── AIAnalysisTab.jsx  # Chat com IA
│   ├── App.jsx                # Componente principal
│   └── App.css                # Estilos V4 Company
├── vercel.json                # Configuração do Vercel
├── package.json               # Dependências
└── README.md                  # Este arquivo
```

## 🔧 Instalação Local

1. **Clone ou extraia o projeto**
```bash
cd dashboard-v4-company
```

2. **Instale as dependências**
```bash
pnpm install
# ou
npm install
```

3. **Execute o servidor de desenvolvimento**
```bash
pnpm run dev
# ou
npm run dev
```

4. **Acesse no navegador**
```
http://localhost:5173
```

## 🌐 Deploy no Vercel

### Método 1: Via CLI (Recomendado)

1. **Instale a CLI do Vercel**
```bash
npm i -g vercel
```

2. **Faça login no Vercel**
```bash
vercel login
```

3. **Deploy do projeto**
```bash
cd dashboard-v4-company
vercel
```

4. **Siga as instruções**
- Project name: `dashboard-v4-company`
- Framework: `Vite`
- Build command: `pnpm run build`
- Output directory: `dist`

### Método 2: Via Interface Web

1. **Acesse** [vercel.com](https://vercel.com)
2. **Conecte** sua conta GitHub/GitLab
3. **Importe** o projeto
4. **Configure**:
   - Framework Preset: `Vite`
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
5. **Deploy**

### Método 3: Upload Direto

1. **Build do projeto**
```bash
pnpm run build
```

2. **Acesse** [vercel.com/new](https://vercel.com/new)
3. **Arraste** a pasta `dashboard-v4-company` completa
4. **Configure** as opções se necessário
5. **Deploy**

## 📋 Estrutura da Planilha

### Colunas Obrigatórias
- **Titulo**: Nome do cliente/empresa
- **Unidade**: Nome da unidade responsável
- **Competencia**: Data de vencimento/competência
- **Valor**: Valor monetário da inadimplência
- **Categoria**: Tipo do valor (ROYALTIES, SERVIÇOS, OUTROS)

### Colunas Opcionais
- **Cobrar**: Indicador se deve ser cobrado (Sim/Não)
- **Observacao da Unidade**: Observações da unidade
- **Motivo do Atraso**: Motivo declarado para o atraso
- **Status**: Status atual (Em cobrança, Pago, Em alinhamento)
- **Historico**: Histórico de interações
- **Observacao Account**: Observações da equipe de contas

## 🔍 Exemplo de Uso

1. **Acesse** o dashboard
2. **Faça upload** de uma planilha .xlsx ou .csv
3. **Aguarde** o processamento
4. **Navegue** pelas abas para ver as análises
5. **Use a IA** para fazer perguntas sobre os dados

## 🎯 Perguntas para a IA

- "Qual unidade tem mais casos em aberto?"
- "Quais os principais insights da carteira?"
- "Qual o valor total em aberto?"
- "Quais clientes têm maior inadimplência?"
- "Quais as observações mais comuns?"

## 🐛 Solução de Problemas

### Erro de Upload
- Verifique se o arquivo é .xlsx ou .csv
- Confirme se o arquivo tem menos de 10MB
- Verifique se as colunas obrigatórias estão presentes

### Erro de Build
```bash
# Limpe o cache e reinstale
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

### Erro no Vercel
- Verifique se o `vercel.json` está presente
- Confirme se as variáveis de ambiente estão configuradas
- Verifique os logs no dashboard do Vercel

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este README
2. Consulte a documentação do Vercel
3. Entre em contato com a equipe de desenvolvimento

## 📄 Licença

Projeto desenvolvido para V4 Company - Todos os direitos reservados.

---

**Desenvolvido com ❤️ para V4 Company**  
**Versão**: 1.0.0  
**Data**: Setembro 2025

