import { useState } from 'react'
import { Upload, BarChart3, Building2, Users, Brain } from 'lucide-react'
import faustaoImg from './assets/faustao.jpg'
import './App.css'

// Componentes das abas
import UploadTab from './components/UploadTab'
import OverviewTab from './components/OverviewTab'
import UnitsTab from './components/UnitsTab'
import ClientsTab from './components/ClientsTab'
import AIAnalysisTab from './components/AIAnalysisTab'

function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [data, setData] = useState(null)

  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'units', label: 'Unidades', icon: Building2 },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'ai', label: 'Análise IA', icon: Brain }
  ]

  const handleDataUpload = (uploadedData) => {
    setData(uploadedData)
    setActiveTab('overview')
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadTab onDataUpload={handleDataUpload} />
      case 'overview':
        return <OverviewTab data={data} />
      case 'units':
        return <UnitsTab data={data} />
      case 'clients':
        return <ClientsTab data={data} />
      case 'ai':
        return <AIAnalysisTab data={data} />
      default:
        return <UploadTab onDataUpload={handleDataUpload} />
    }
  }

  return (
    <div className="min-h-screen bg-black v4-font-montserrat">
      {/* Header */}
      <header className="v4-header px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo V4 Company */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold v4-text-red">
              V4 COMPANY
            </div>
            <div className="text-sm v4-text-gray">
              Dashboard de Inadimplência
            </div>
          </div>

          {/* Faustão - Amuleto da Conversão */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm v4-text-white font-semibold">
                Amuleto da Conversão
              </div>
              <div className="text-xs v4-text-gray">
                Faustão
              </div>
            </div>
            <img 
              src={faustaoImg} 
              alt="Faustão - Amuleto da Conversão" 
              className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
            />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="v4-bg-darker border-b v4-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium v4-nav-tab ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                  disabled={tab.id !== 'upload' && !data}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderActiveTab()}
      </main>
    </div>
  )
}

export default App

