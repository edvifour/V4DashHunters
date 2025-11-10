import { useState } from 'react'
import { Building2, Search, Filter, ChevronDown, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

const UnitsTab = ({ data }) => {
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [sortBy, setSortBy] = useState('name')
  const [searchTerm, setSearchTerm] = useState('')

  if (!data || !data.rawData || data.rawData.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 v4-text-gray mx-auto mb-4" />
        <h2 className="text-xl font-semibold v4-text-white mb-2">
          Nenhum dado carregado
        </h2>
        <p className="v4-text-gray">
          Faça o upload de uma planilha para visualizar as unidades
        </p>
      </div>
    )
  }

  // Usar dados reais das unidades
  const allUnits = [...data.topUnits, ...data.worstUnits]
    .filter((unit, index, self) => 
      index === self.findIndex(u => u.name === unit.name)
    ) // Remover duplicatas

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const sortedUnits = [...allUnits]
    .filter(unit => 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getUnitDetails = (unitName) => {
    if (!data.rawData) return { clients: [] }
    
    const unitClients = data.rawData
      .filter(row => row.unidade === unitName)
      .map(row => ({
        name: row.titulo,
        value: row.valor || 0,
        status: row.status || 'Em cobrança',
        competencia: row.competencia || 'N/A',
        categoria: row.categoria || 'OUTROS',
        observacao: row.observacaoUnidade || '',
        motivoAtraso: row.motivoAtraso || ''
      }))
    
    return { clients: unitClients }
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold v4-text-white mb-2">
          Análise por Unidades
        </h1>
        <p className="v4-text-gray">
          Visualize o desempenho de cada unidade da V4 Company
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 v4-text-gray" />
            <input
              type="text"
              placeholder="Buscar unidade..."
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

      {/* Lista de Unidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold v4-text-white">
            Unidades ({sortedUnits.length})
          </h3>
          
          {sortedUnits.map((unit, index) => (
            <div 
              key={index} 
              className="v4-card rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => setSelectedUnit(unit)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 v4-text-red" />
                    <div>
                      <h4 className="font-semibold v4-text-white">
                        {unit.name}
                      </h4>
                      <p className="text-sm v4-text-gray">
                        {unit.cases} casos em aberto
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold text-lg ${
                    unit.type === 'good' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(unit.value)}
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

        {/* Detalhes da Unidade Selecionada */}
        <div className="v4-card rounded-lg p-6">
          {selectedUnit ? (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Building2 className="w-6 h-6 v4-text-red" />
                <div>
                  <h3 className="text-xl font-semibold v4-text-white">
                    {selectedUnit.name}
                  </h3>
                  <p className="v4-text-gray">
                    Detalhamento dos casos
                  </p>
                </div>
              </div>

              {/* Resumo da Unidade */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="v4-bg-darker rounded-lg p-4">
                  <div className="text-2xl font-bold v4-text-red">
                    {selectedUnit.cases}
                  </div>
                  <div className="text-sm v4-text-gray">
                    Total de Casos
                  </div>
                </div>
                <div className="v4-bg-darker rounded-lg p-4">
                  <div className="text-2xl font-bold v4-text-red">
                    {formatCurrency(selectedUnit.value)}
                  </div>
                  <div className="text-sm v4-text-gray">
                    Valor em Aberto
                  </div>
                </div>
              </div>

              {/* Lista de Clientes */}
              <div>
                <h4 className="font-semibold v4-text-white mb-4">
                  Clientes da Unidade
                </h4>
                <div className="space-y-3">
                  {getUnitDetails(selectedUnit.name).clients.map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 v4-bg-darker rounded-lg">
                      <div>
                        <div className="font-medium v4-text-white">
                          {client.name}
                        </div>
                        <div className="text-sm v4-text-gray">
                          Competência: {client.competencia}
                        </div>
                        {client.categoria && (
                          <div className="text-xs bg-blue-900 text-blue-400 px-2 py-1 rounded mt-1 inline-block">
                            {client.categoria}
                          </div>
                        )}
                        {client.motivoAtraso && (
                          <span className="text-xs bg-purple-900 text-purple-400 px-2 py-1 rounded whitespace-nowrap ml-1">
                            {client.motivoAtraso}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold v4-text-white">
                          {formatCurrency(client.value)}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          client.status === 'Pago' 
                            ? 'bg-green-900 text-green-400'
                            : client.status === 'Em cobrança'
                            ? 'bg-red-900 text-red-400'
                            : 'bg-yellow-900 text-yellow-400'
                        }`}>
                          {client.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 v4-text-gray mx-auto mb-4" />
              <h4 className="font-semibold v4-text-white mb-2">
                Selecione uma unidade
              </h4>
              <p className="v4-text-gray text-sm">
                Clique em uma unidade da lista para ver os detalhes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UnitsTab

