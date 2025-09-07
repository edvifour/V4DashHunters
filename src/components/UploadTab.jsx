import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const UploadTab = ({ onDataUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileUpload = async (file) => {
    // Validar tipo de arquivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setUploadStatus({
        type: 'error',
        message: 'Formato de arquivo não suportado. Use apenas .xlsx ou .csv'
      })
      return
    }

    setIsUploading(true)
    setUploadStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar arquivo')
      }

      setUploadStatus({
        type: 'success',
        message: `Arquivo "${file.name}" processado com sucesso! ${result.rowCount} linhas processadas.`
      })

      onDataUpload(result.data)
    } catch (error) {
      console.error('Erro no upload:', error)
      setUploadStatus({
        type: 'error',
        message: error.message || 'Erro ao processar o arquivo. Tente novamente.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold v4-text-white mb-4">
          Dashboard V4 Company
        </h1>
        <p className="text-lg v4-text-gray">
          Faça o upload da sua planilha de inadimplência para começar a análise
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`v4-upload-area rounded-lg p-12 text-center transition-all duration-300 ${
          isDragOver ? 'dragover' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 v4-bg-darker rounded-full flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8 v4-text-red" />
          </div>

          <div>
            <h3 className="text-xl font-semibold v4-text-white mb-2">
              Arraste e solte sua planilha aqui
            </h3>
            <p className="v4-text-gray mb-4">
              ou clique para selecionar um arquivo
            </p>
            <p className="text-sm v4-text-gray">
              Formatos suportados: .xlsx, .csv (máx. 10MB)
            </p>
          </div>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          
          <Button
            asChild
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
            disabled={isUploading}
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Processando...' : 'Selecionar Arquivo'}
            </label>
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus && (
        <div className={`mt-6 p-4 rounded-lg flex items-center space-x-3 ${
          uploadStatus.type === 'success' 
            ? 'bg-green-900/20 border border-green-700' 
            : 'bg-red-900/20 border border-red-700'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span className={uploadStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {uploadStatus.message}
          </span>
        </div>
      )}

      {/* Loading State */}
      {isUploading && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            <span className="v4-text-gray">Processando planilha...</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-12 v4-card rounded-lg p-6">
        <h3 className="text-lg font-semibold v4-text-white mb-4">
          Estrutura esperada da planilha:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="v4-text-gray mb-2"><strong>Colunas obrigatórias:</strong></p>
            <ul className="space-y-1 v4-text-gray">
              <li>• Titulo (Nome do cliente)</li>
              <li>• Unidade</li>
              <li>• Competência</li>
              <li>• Valor</li>
              <li>• Categoria</li>
            </ul>
          </div>
          <div>
            <p className="v4-text-gray mb-2"><strong>Colunas opcionais:</strong></p>
            <ul className="space-y-1 v4-text-gray">
              <li>• Cobrar?</li>
              <li>• Observação da Unidade</li>
              <li>• Motivo do Atraso</li>
              <li>• Status</li>
              <li>• Histórico</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadTab

