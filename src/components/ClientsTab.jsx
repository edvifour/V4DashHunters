import { useState } from 'react'
import { Users, Search, Filter, Eye, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ClientsTab = ({ data }) => {
  const [selectedClient, setSelectedClient] = useState(null)
  const [sortBy, setSortBy] = useState('name')
  const [searchTerm, setSearchTerm] = useState('')

  if (!data || !data.rawData || data.rawData.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 v4-text-gray mx-auto mb-4" />
        <h2 className="text-xl font-semibold v4-text-white mb-2">
          Nenhum dado carregado
        </h2>
        <p className="v4-text-gray">
          Faça o upload de uma planilha para visualizar os clientes
        </p>
      </div>
    )
  }

  // Processar dados reais dos clientes
  const clientsMap = {}
  data.rawData.forEach(row => {
    const clientName = row.titulo
    if (!clientsMap[clientName]) {
      clientsMap[clientName] = {
        name: clientName,
        value: 0,
        cases: 0,
        unit: row.unidade,
        lastContact: row.competencia || '2024-09-01',
        status: row.status || 'Em cobrança',
        category: row.categoria || 'OUTROS',
        cases_details: []
      }
    }
    clientsMap[clientName].value += row.valor || 0
    clientsMap[clientName].cases += 1
    clientsMap[clientName].cases_details.push({
      competencia: row.competencia || 'N/A',
      value: row.valor || 0,
      status: row.status || 'Em cobrança',
      category: row.categoria || 'OUTROS',
      observation: row.observacaoUnidade || '',
      history: row.historico || '',
      motivoAtraso: row.motivoAtraso || ''
    })
  })

  const allClients = Object.values(clientsMap)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const sortedClients = [...allClients]
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'value-desc':
          return b.value - a.value
        case 'value-asc':
          return a.value - b.value
        case 'cases-desc':
          return b.cases - a.cases
        case 'cases-asc':
          return a.cases - b.cases
        default:
          return 0
      }
    })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pago':
        return 'bg-green-900 text-green-400'
      case 'Em cobrança':
        return 'bg-red-900 text-red-400'
      case 'Em alinhamento':
        return 'bg-yellow-900 text-yellow-400'
      default:
        return 'bg-gray-900 text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold v4-text-white mb-2">
          Análise por Clientes
        </h1>
        <p className="v4-text-gray">
          Visualize o histórico e status de cada cliente
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 v4-text-gray" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 v4-bg-darker border v4-border rounded-lg v4-text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 v4-text-gray" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 v4-bg-darker border v4-border rounded-lg v4-text-white focus:outline-none focus:border-red-500"
          >
            <option value="name">Ordem Alfabética</option>
            <option value="value-desc">Maior Valor em Aberto</option>
            <option value="value-asc">Menor Valor em Aberto</option>
            <option value="cases-desc">Mais Casos</option>
            <option value="cases-asc">Menos Casos</option>
          </select>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold v4-text-white">
            Clientes ({sortedClients.length})
          </h3>
          
          {sortedClients.map((client, index) => (
            <div 
              key={index} 
              className="v4-card rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 v4-text-red" />
                    <div>
                      <h4 className="font-semibold v4-text-white">
                        {client.name}
                      </h4>
                      <p className="text-sm v4-text-gray">
                        {client.unit} • {client.cases} casos
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                        <span className="text-xs v4-text-gray">
                          Último contato: {formatDate(client.lastContact)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg v4-text-red">
                    {formatCurrency(client.value)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs v4-text-gray hover:v4-text-red"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Ver detalhes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detalhes do Cliente Selecionado */}
        <div className="v4-card rounded-lg p-6">
          {selectedClient ? (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 v4-text-red" />
                <div>
                  <h3 className="text-xl font-semibold v4-text-white">
                    {selectedClient.name}
                  </h3>
                  <p className="v4-text-gray">
                    {selectedClient.unit}
                  </p>
                </div>
              </div>

              {/* Resumo do Cliente */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="v4-bg-darker rounded-lg p-4">
                  <div className="text-xl font-bold v4-text-red">
                    {selectedClient.cases}
                  </div>
                  <div className="text-sm v4-text-gray">
                    Casos
                  </div>
                </div>
                <div className="v4-bg-darker rounded-lg p-4">
                  <div className="text-xl font-bold v4-text-red">
                    {formatCurrency(selectedClient.value)}
                  </div>
                  <div className="text-sm v4-text-gray">
                    Total
                  </div>
                </div>
                <div className="v4-bg-darker rounded-lg p-4">
                  <div className={`text-xl font-bold ${
                    selectedClient.status === 'Pago' ? 'text-green-400' :
                    selectedClient.status === 'Em cobrança' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {selectedClient.status}
                  </div>
                  <div className="text-sm v4-text-gray">
                    Status
                  </div>
                </div>
              </div>

              {/* Histórico de Casos */}
              <div>
                <h4 className="font-semibold v4-text-white mb-4">
                  Histórico de Casos
                </h4>
                <div className="space-y-4">
                  {selectedClient.cases_details.map((case_, index) => (
                    <div key={index} className="v4-bg-darker rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 v4-text-red" />
                          <span className="font-medium v4-text-white">
                            Competência: {case_.competencia}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 v4-text-red" />
                          <span className="font-semibold v4-text-white">
                            {formatCurrency(case_.value)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(case_.status)}`}>
                            {case_.status}
                          </span>
                          <span className="text-xs bg-blue-900 text-blue-400 px-2 py-1 rounded">
                            {case_.category}
                          </span>
                        </div>
                        
                        {case_.observation && (
                          <div className="text-sm v4-text-gray">
                            <strong>Observação:</strong> {case_.observation}
                          </div>
                        )}
                        
                        {case_.history && (
                          <div className="text-sm v4-text-gray">
                            <strong>Histórico:</strong> {case_.history}
                          </div>
                        )}
                        
                        {case_.motivoAtraso && (
                          <div className="text-sm v4-text-gray">
                            <strong>Motivo do Atraso:</strong> {case_.motivoAtraso}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 v4-text-gray mx-auto mb-4" />
              <h4 className="font-semibold v4-text-white mb-2">
                Selecione um cliente
              </h4>
              <p className="v4-text-gray text-sm">
                Clique em um cliente da lista para ver os detalhes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientsTab

