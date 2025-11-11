import formidable from 'formidable'
import XLSX from 'xlsx'
import Papa from 'papaparse'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

// 🔹 Função para converter valores monetários no formato brasileiro
function parseMoneyBR(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v !== 'string') return 0

  let s = v.trim().replace(/^R\$\s?/i, '')

  if (/,/.test(s)) {
    // remove pontos que são apenas separadores de milhar
    s = s.replace(/\.(?=\d{3}(\D|$))/g, '')
    // troca vírgula decimal por ponto
    s = s.replace(',', '.')
  }

  const num = Number(s)
  return Number.isFinite(num) ? num : 0
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)
    const file = files.file?.[0]

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    // Verificar tipo de arquivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]

    const isValidType = validTypes.includes(file.mimetype) || 
                       file.originalFilename?.endsWith('.csv') ||
                       file.originalFilename?.endsWith('.xlsx') ||
                       file.originalFilename?.endsWith('.xls')

    if (!isValidType) {
      return res.status(400).json({ 
        error: 'Formato de arquivo não suportado. Use apenas .xlsx ou .csv' 
      })
    }

    // Ler e processar o arquivo
    let data = []
    
    if (file.mimetype === 'text/csv' || file.originalFilename?.endsWith('.csv')) {
      // Processar CSV
      const csvContent = fs.readFileSync(file.filepath, 'utf8')
      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => String(header || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
      })
      data = parsed.data
    } else {
      // Processar Excel
      const workbook = XLSX.readFile(file.filepath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      data = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
    }

    // Limpar arquivo temporário
    fs.unlinkSync(file.filepath)

    // Normalizar dados
    const normalizedData = normalizeData(data)
    
    // Processar e analisar dados
    const analysis = analyzeData(normalizedData)

    res.status(200).json({
      success: true,
      data: analysis,
      rowCount: normalizedData.length
    })

  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor ao processar o arquivo' 
    })
  }
}

function normalizeData(rawData) {
  return rawData.map(row => {
    // Normalizar nomes das colunas (case-insensitive e flexível)
    const normalizedRow = {}
    const normalizedKey = (k) => {
      if (!k && k !== 0) return ''
      // garante string
      const s = String(k)
      // NFD + remover diacríticos (acentos), depois lower + trim
      return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    }

    Object.keys(row).forEach(key => {
      const lowerKey = normalizedKey(key)

      // Priorizar observações para não confundir "Observação da Unidade" com "Unidade"
      if (lowerKey.includes('titulo') || lowerKey.includes('cliente') || lowerKey.includes('nome')) {
        normalizedRow.titulo = row[key] || ''
      } else if (lowerKey.includes('observacao') || lowerKey.includes('observação')) {
        if (lowerKey.includes('unidade')) {
          normalizedRow.observacaoUnidade = row[key] || ''
        } else if (lowerKey.includes('account')) {
          normalizedRow.observacaoAccount = row[key] || ''
        } else {
          normalizedRow.observacao = row[key] || ''
        }
      } else if (lowerKey.includes('unidade')) {
        normalizedRow.unidade = row[key] || ''
      } else if (lowerKey.includes('competencia') || lowerKey.includes('competência') || lowerKey.includes('vencimento')) {
        normalizedRow.competencia = row[key] || ''
      } else if (lowerKey.includes('valor')) {
        // Converter valor para número (tratando separador de milhar '.' e decimal ',')
        let valor = row[key] || 0
        if (typeof valor === 'string') {
          valor = valor.trim()
          // Caso pt-BR "2.000,00" -> remover pontos de milhar e trocar vírgula por ponto
          if (valor.indexOf('.') !== -1 && valor.indexOf(',') !== -1) {
            valor = valor.replace(/\./g, '').replace(',', '.')
          } else {
            // Remover caracteres indesejados e padronizar vírgula para ponto
            valor = valor.replace(/[^\d,.-]/g, '').replace(',', '.')
          }
        }
        normalizedRow.valor = parseMoneyBR(row[key]) || 0
      } else if (lowerKey.includes('categoria')) {
        normalizedRow.categoria = row[key] || 'OUTROS'
      } else if (lowerKey.includes('cobrar')) {
        normalizedRow.cobrar = row[key] || 'Sim'
      } else if (lowerKey.includes('motivo') || lowerKey.includes('atraso')) {
        normalizedRow.motivoAtraso = row[key] || ''
      } else if (lowerKey.includes('status')) {
        normalizedRow.status = row[key] || 'Em cobrança'
      } else if (lowerKey.includes('historico') || lowerKey.includes('histórico')) {
        normalizedRow.historico = row[key] || ''
      }
    })

    return normalizedRow
  }).filter(row => row.titulo && row.unidade) // Filtrar linhas com dados essenciais
}

function analyzeData(data) {
  if (!data || data.length === 0) {
    return {
      totalCases: 0,
      totalValue: 0,
      mostCommonStatus: 'N/A',
      statusDistribution: [],
      topUnits: [],
      worstUnits: [],
      categoryAnalysis: {},
      rawData: []
    }
  }

  const totalCases = data.length
  const totalValue = data.reduce((sum, row) => sum + (row.valor || 0), 0)

  // 🔹 Agrupar valores por status
  const statusCount = {}
  const statusAmount = {}

  data.forEach(row => {
    const status = row.status || 'Em cobrança'
    const valor = row.valor || 0

    statusCount[status] = (statusCount[status] || 0) + 1
    statusAmount[status] = (statusAmount[status] || 0) + valor
  })

  const mostCommonStatus = Object.keys(statusCount).reduce((a, b) =>
    statusCount[a] > statusCount[b] ? a : b
  )

  const statusDistribution = Object.keys(statusCount).map(status => {
    const amount = statusAmount[status] || 0
    const percent = totalValue > 0 ? (amount / totalValue) * 100 : 0
    return {
      name: status,
      count: statusCount[status],
      amount,
      value: Math.round(percent)
    }
  })

  // 🔹 Unidades
  const unitAnalysis = {}
  data.forEach(row => {
    const unit = row.unidade
    if (!unitAnalysis[unit]) {
      unitAnalysis[unit] = { name: unit, value: 0, cases: 0 }
    }
    unitAnalysis[unit].value += row.valor || 0
    unitAnalysis[unit].cases += 1
  })

  const units = Object.values(unitAnalysis)
  const sortedDesc = [...units].sort((a, b) => a.value - b.value)
  const sortedAsc = [...units].sort((a, b) => b.value - a.value)
  const topUnits = sortedDesc.slice(0, 10)
  const worstUnits = sortedAsc.slice(0, 10)

  // 🔹 Categorias
  const categoryAnalysis = {}
  data.forEach(row => {
    const cat = row.categoria || 'OUTROS'
    if (!categoryAnalysis[cat]) categoryAnalysis[cat] = { count: 0, value: 0 }
    categoryAnalysis[cat].count += 1
    categoryAnalysis[cat].value += row.valor || 0
  })

  // 🔹 Motivos de atraso
  const delayReasonCount = {}
  data.forEach(row => {
    let reason = (row.motivoAtraso || '').toString().trim()
    if (!reason) reason = 'Não informado'
    delayReasonCount[reason] = (delayReasonCount[reason] || 0) + 1
  })

  const delayReasonDistribution = Object.keys(delayReasonCount)
    .map(r => ({ name: r, count: delayReasonCount[r] }))
    .sort((a, b) => b.count - a.count)

  return {
    totalCases,
    totalValue,
    mostCommonStatus,
    statusDistribution,
    topUnits,
    worstUnits,
    categoryAnalysis,
    delayReasonDistribution,
    rawData: data
  }
}

