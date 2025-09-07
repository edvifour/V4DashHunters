import { useState } from 'react'
import { Brain, Send, Bot, User, TrendingUp, AlertTriangle, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AIAnalysisTab = ({ data }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Olá! Sou a IA da V4 Company. Posso ajudá-lo a analisar os dados da carteira de inadimplência. Faça perguntas como: "Qual unidade tem mais casos?" ou "Quais os padrões de inadimplência?"',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  if (!data || !data.rawData || data.rawData.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 v4-text-gray mx-auto mb-4" />
        <h2 className="text-xl font-semibold v4-text-white mb-2">
          Nenhum dado carregado
        </h2>
        <p className="v4-text-gray">
          Faça o upload de uma planilha para usar a análise de IA
        </p>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simular resposta da IA baseada na pergunta
    setTimeout(() => {
      const botResponse = generateAIResponse(inputMessage, data)
      setMessages(prev => [...prev, {
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (question, data) => {
    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes('unidade') && (lowerQuestion.includes('mais') || lowerQuestion.includes('maior'))) {
      const worstUnit = data.worstUnits[0]
      return `A unidade com mais casos em aberto é **${worstUnit.name}** com ${worstUnit.cases} casos e um valor total de ${formatCurrency(worstUnit.value)} em aberto. Esta unidade precisa de atenção especial para melhorar os resultados de cobrança.`
    }

    if (lowerQuestion.includes('melhor') && lowerQuestion.includes('unidade')) {
      const bestUnit = data.topUnits[0]
      return `A melhor unidade em termos de menor valor em aberto é **${bestUnit.name}** com apenas ${formatCurrency(bestUnit.value)} em aberto e ${bestUnit.cases} casos. Esta unidade pode servir como modelo de boas práticas.`
    }

    if (lowerQuestion.includes('status') && lowerQuestion.includes('comum')) {
      return `O status mais comum na carteira é **"${data.mostCommonStatus}"**. Isso indica que a maioria dos casos está em processo ativo de cobrança, o que é positivo para a recuperação.`
    }

    if (lowerQuestion.includes('valor') && (lowerQuestion.includes('total') || lowerQuestion.includes('geral'))) {
      return `O valor total em aberto na carteira é de **${formatCurrency(data.totalValue)}** distribuído em ${data.totalCases} casos. O valor médio por caso é de ${formatCurrency(data.totalValue / data.totalCases)}.`
    }

    if (lowerQuestion.includes('categoria') || lowerQuestion.includes('tipo')) {
      const categories = Object.entries(data.categoryAnalysis || {})
        .sort((a, b) => b[1].value - a[1].value)
        .slice(0, 3)
      
      if (categories.length > 0) {
        return `**Análise por Categoria:**\n\n${categories.map(([cat, info]) => 
          `• **${cat}**: ${formatCurrency(info.value)} (${info.count} casos)`
        ).join('\n')}\n\nA categoria **${categories[0][0]}** representa o maior valor em aberto.`
      }
    }

    if (lowerQuestion.includes('cliente') && (lowerQuestion.includes('maior') || lowerQuestion.includes('pior'))) {
      // Analisar clientes com maior valor em aberto
      const clientsMap = {}
      data.rawData.forEach(row => {
        const client = row.titulo
        if (!clientsMap[client]) {
          clientsMap[client] = { name: client, value: 0, cases: 0 }
        }
        clientsMap[client].value += row.valor || 0
        clientsMap[client].cases += 1
      })
      
      const topClients = Object.values(clientsMap)
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
      
      return `**Clientes com maior valor em aberto:**\n\n${topClients.map((client, i) => 
        `${i + 1}. **${client.name}**: ${formatCurrency(client.value)} (${client.cases} casos)`
      ).join('\n')}`
    }

    if (lowerQuestion.includes('padrão') || lowerQuestion.includes('insight') || lowerQuestion.includes('análise')) {
      return `**Principais insights da carteira:**

📊 **Distribuição de Status:**
${data.statusDistribution.map(status => `• ${status.name}: ${status.value}% (${status.count} casos)`).join('\n')}

🏢 **Unidades que precisam de atenção:**
${data.worstUnits.slice(0, 2).map(unit => `• ${unit.name}: ${formatCurrency(unit.value)}`).join('\n')}

💡 **Recomendações:**
• Focar esforços nas unidades com maior valor em aberto
• Implementar estratégias de cobrança mais eficazes
• Analisar os motivos dos atrasos mais comuns`
    }

    if (lowerQuestion.includes('observação') || lowerQuestion.includes('motivo')) {
      // Analisar observações mais comuns
      const observations = {}
      data.rawData.forEach(row => {
        const obs = row.observacaoUnidade || row.motivoAtraso || ''
        if (obs.trim()) {
          observations[obs] = (observations[obs] || 0) + 1
        }
      })
      
      const topObservations = Object.entries(observations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
      
      if (topObservations.length > 0) {
        return `**Observações mais recorrentes:**\n\n${topObservations.map(([obs, count]) => 
          `• "${obs}" (${count} casos)`
        ).join('\n')}\n\nIsso pode indicar padrões nos motivos de inadimplência.`
      }
    }

    // Resposta padrão
    return `Entendi sua pergunta sobre "${question}". Com base nos dados carregados, posso fornecer análises sobre:

🔍 **Perguntas que posso responder:**
• Qual unidade tem mais/menos casos?
• Quais os status mais comuns?
• Análise de padrões e insights
• Distribuição de valores por categoria
• Clientes com maior inadimplência
• Observações e motivos mais comuns

Tente reformular sua pergunta ou escolha uma das opções acima!`
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const suggestedQuestions = [
    "Qual unidade tem mais casos em aberto?",
    "Quais os principais insights da carteira?",
    "Qual o valor total em aberto?",
    "Quais tipos de empresas mais deixam de pagar?",
    "Quais as observações mais comuns?"
  ]

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold v4-text-white mb-2">
          Análise com IA
        </h1>
        <p className="v4-text-gray">
          Converse com nossa IA para obter insights avançados sobre a carteira
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <div className="v4-card rounded-lg p-6 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center space-x-3 pb-4 border-b v4-border">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold v4-text-white">
                  IA V4 Company
                </h3>
                <p className="text-sm v4-text-gray">
                  Assistente de Análise de Dados
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' ? 'bg-blue-600' : 'bg-red-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-900 text-blue-100' 
                        : 'v4-bg-darker v4-text-white'
                    }`}>
                      <div className="whitespace-pre-line">
                        {message.content}
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="v4-bg-darker rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t v4-border pt-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua pergunta sobre os dados..."
                  className="flex-1 px-4 py-2 v4-bg-darker border v4-border rounded-lg v4-text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-red-600 hover:bg-red-700 text-white px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar com sugestões e insights */}
        <div className="space-y-6">
          {/* Perguntas Sugeridas */}
          <div className="v4-card rounded-lg p-4">
            <h4 className="font-semibold v4-text-white mb-4">
              Perguntas Sugeridas
            </h4>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="w-full text-left p-2 text-sm v4-text-gray hover:v4-text-white hover:bg-gray-800 rounded transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Insights Rápidos */}
          <div className="v4-card rounded-lg p-4">
            <h4 className="font-semibold v4-text-white mb-4">
              Insights Rápidos
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium v4-text-white">
                    Melhor Unidade
                  </div>
                  <div className="text-xs v4-text-gray">
                    {data.topUnits[0]?.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm font-medium v4-text-white">
                    Precisa Atenção
                  </div>
                  <div className="text-xs v4-text-gray">
                    {data.worstUnits[0]?.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-sm font-medium v4-text-white">
                    Status Comum
                  </div>
                  <div className="text-xs v4-text-gray">
                    {data.mostCommonStatus}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm font-medium v4-text-white">
                    Valor Médio
                  </div>
                  <div className="text-xs v4-text-gray">
                    {formatCurrency(data.totalValue / data.totalCases)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAnalysisTab

