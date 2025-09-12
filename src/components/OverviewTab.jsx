import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, FileText, DollarSign } from 'lucide-react'

const OverviewTab = ({ data }) => {
  if (!data || !data.rawData || data.rawData.length === 0) {
    return(
      <div className="text-center py-12">
        <FileText className="w-16 h-16 v4-text-gray mx-auto mb-4" />
        <h2 className="text-xl font-semibold v4-text-white mb-2">
          Nenhum dado carregado
        </h2>
        <p className="v4-text-gray">
          Faça o upload de uma planilha para visualizar os dados
        </p>
      </div>
    )
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const distributionWithAmounts = data.statusDistribution.map(item => ({
    ...item,
    amount: (item.value / 100) * data.totalValue
  }))

  const COLORS = ['#e50914', '#52cc5a', '#ffc02a', '#666']

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold v4-text-white mb-2">
          Visão Geral
        </h1>
        <p className="v4-text-gray">
          Resumo das métricas principais da carteira de inadimplência
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="v4-metric-card">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 v4-text-red" />
            <TrendingUp className="w-5 h-5 v4-text-gray" />
          </div>
          <div className="v4-metric-value">
            {data.totalCases}
          </div>
          <div className="v4-metric-label">
            Total de Casos em Aberto
          </div>
        </div>

        <div className="v4-metric-card">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 v4-text-red" />
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div className="v4-metric-value">
            {formatCurrency(data.totalValue)}
          </div>
          <div className="v4-metric-label">
            Valor Total em Aberto
          </div>
        </div>

        <div className="v4-metric-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">%</span>
            </div>
          </div>
          <div className="v4-metric-value text-yellow-400">
            {data.mostCommonStatus}
          </div>
          <div className="v4-metric-label">
            Status Mais Comum
          </div>
        </div>

        <div className="v4-metric-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">R$</span>
            </div>
          </div>
          <div className="v4-metric-value text-green-400">
            {formatCurrency(data.totalValue / data.totalCases)}
          </div>
          <div className="v4-metric-label">
            Valor Médio por Caso
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Status */}
        <div className="v4-card rounded-lg p-6">
          <h3 className="text-xl font-semibold v4-text-white mb-6">
            Distribuição por Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <div className="flex justify-between items-center h-full">
              {/* Gráfico de Pizza */}
              <PieChart width={250} height={300}>
                <Pie
                  data={distributionWithAmounts}
                  cx="45%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={86}
                  fill="#333"
                  dataKey="value"
                >
                  {distributionWithAmounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                {/* Tooltip customizado */}
                <Tooltip
                  formatter={(value, name, props) => {
                    const realValue = formatCurrency(props.payload.amount)
                    return [`${realValue} (${value}%)`, name]
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>

              {/* Legenda à direita */}
              <div className="space-y-2 ml-0">
                {distributionWithAmounts.map((entry, index) => (
                  <div
                    key={`legend-${index}`}
                    className="flex items-center space-x-2 text-sm v4-text-white"
                  >
                    {/* Bolinha colorida */}
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {/* Nome + valores */}
                    <span>
                      {entry.name}: {formatCurrency(entry.amount)} ({entry.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ResponsiveContainer>


        </div>

        {/* Gráfico de Casos por Status */}
        <div className="v4-card rounded-lg p-6">
          <h3 className="text-xl font-semibold v4-text-white mb-6">
            Quantidade de Casos por Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#ccc', fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#ccc' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="#e50914" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Melhores Unidades */}
        <div className="v4-card rounded-lg p-6">
          <h3 className="text-xl font-semibold v4-text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
            Melhores Unidades
          </h3>
          <div className="space-y-4">
            {data.topUnits.map((unit, index) => (
              <div key={index} className="flex items-center justify-between p-3 v4-bg-darker rounded-lg">
                <div>
                  <div className="font-semibold v4-text-white">
                    {unit.name}
                  </div>
                  <div className="text-sm v4-text-gray">
                    {unit.cases} casos
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">
                    {formatCurrency(unit.value)}
                  </div>
                  <div className="text-xs v4-text-gray">
                    em aberto
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Piores Unidades */}
        <div className="v4-card rounded-lg p-6">
          <h3 className="text-xl font-semibold v4-text-white mb-6 flex items-center">
            <TrendingDown className="w-5 h-5 text-red-400 mr-2" />
            Piores Unidades
          </h3>
          <div className="space-y-4">
            {data.worstUnits.map((unit, index) => (
              <div key={index} className="flex items-center justify-between p-3 v4-bg-darker rounded-lg">
                <div>
                  <div className="font-semibold v4-text-white">
                    {unit.name}
                  </div>
                  <div className="text-sm v4-text-gray">
                    {unit.cases} casos
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-400">
                    {formatCurrency(unit.value)}
                  </div>
                  <div className="text-xs v4-text-gray">
                    em aberto
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewTab
