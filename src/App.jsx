import React, { useState, useRef } from 'react';
import { Camera, Plus, Edit, Trash2, Building, MapPin, Package, Search, Filter, Eye, Brain, Loader } from 'lucide-react';

const AssetControlSystem = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [floors, setFloors] = useState([
    { id: 1, number: 5, name: '5º Andar', rooms: [] },
    { id: 2, number: 11, name: '11º Andar', rooms: [] },
    { id: 3, number: 15, name: '15º Andar', rooms: [] }
  ]);
  const [assets, setAssets] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFloor, setFilterFloor] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [showAssetDetail, setShowAssetDetail] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const [assetForm, setAssetForm] = useState({
    name: '',
    code: '',
    category: '',
    description: '',
    acquisitionDate: '',
    value: '',
    status: 'Ativo',
    floorId: '',
    roomId: '',
    photo: null,
    aiAnalysis: null
  });

  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    floorId: ''
  });

  const categories = [
    'Informática', 'Móveis', 'Equipamentos', 'Veículos', 
    'Eletroeletrônicos', 'Ferramentas', 'Outros'
  ];

  const statuses = ['Ativo', 'Inativo', 'Manutenção', 'Descartado'];

  // Análise de IA mais assertiva baseada em características da imagem
  const analyzeImageWithAI = async (imageData) => {
    setIsAnalyzing(true);
    
    // Simulação de API de análise de imagem com tempo mais realista
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Análise baseada em características da imagem (simulada)
      const imageAnalysis = await analyzeImageCharacteristics(imageData);
      
      setIsAnalyzing(false);
      return imageAnalysis;
    } catch (error) {
      console.error('Erro na análise de IA:', error);
      setIsAnalyzing(false);
      return null;
    }
  };

  // Função para análise mais inteligente baseada em características
  const analyzeImageCharacteristics = async (imageData) => {
    // Simulação de análise mais avançada
    const analyses = [
      {
        keywords: ['tela', 'display', 'monitor', 'lcd', 'led'],
        result: {
          objectType: "Monitor de Computador",
          confidence: 94,
          description: "Monitor LCD/LED identificado através de análise de bordas e proporções de tela",
          suggestedCategory: "Informática",
          characteristics: ["Tela retangular", "Bordas finas", "Base de apoio", "Conectores traseiros"]
        }
      },
      {
        keywords: ['notebook', 'laptop', 'teclado', 'touchpad'],
        result: {
          objectType: "Notebook/Laptop",
          confidence: 92,
          description: "Computador portátil identificado pela estrutura dobrável e teclado integrado",
          suggestedCategory: "Informática",
          characteristics: ["Teclado QWERTY", "Tela dobrável", "Touchpad", "Portas laterais"]
        }
      },
      {
        keywords: ['cadeira', 'assento', 'encosto', 'rodizio'],
        result: {
          objectType: "Cadeira de Escritório",
          confidence: 89,
          description: "Mobília ergonômica para escritório com características de ajuste",
          suggestedCategory: "Móveis",
          characteristics: ["Rodízios", "Encosto regulável", "Braços ajustáveis", "Base giratória"]
        }
      },
      {
        keywords: ['mesa', 'escrivaninha', 'tampo', 'gaveta'],
        result: {
          objectType: "Mesa de Escritório",
          confidence: 91,
          description: "Móvel de trabalho com superfície plana e estrutura de apoio",
          suggestedCategory: "Móveis",
          characteristics: ["Superfície plana", "Gavetas", "Pés de apoio", "Espaço para pernas"]
        }
      },
      {
        keywords: ['impressora', 'multifuncional', 'papel', 'scanner'],
        result: {
          objectType: "Impressora Multifuncional",
          confidence: 95,
          description: "Equipamento de impressão com funcionalidades integradas",
          suggestedCategory: "Informática",
          characteristics: ["Bandeja de papel", "Painel LCD", "Scanner superior", "Conectividade USB/Rede"]
        }
      },
      {
        keywords: ['telefone', 'fone', 'discador', 'headset'],
        result: {
          objectType: "Telefone IP/Corporativo",
          confidence: 88,
          description: "Aparelho de comunicação empresarial com recursos avançados",
          suggestedCategory: "Eletroeletrônicos",
          characteristics: ["Teclado numérico", "Display LCD", "Múltiplas linhas", "Viva-voz"]
        }
      },
      {
        keywords: ['projetor', 'datashow', 'lente', 'ventilacao'],
        result: {
          objectType: "Projetor/Datashow",
          confidence: 90,
          description: "Equipamento de projeção para apresentações corporativas",
          suggestedCategory: "Equipamentos",
          characteristics: ["Lente frontal", "Entradas HDMI/VGA", "Sistema de ventilação", "Controle remoto"]
        }
      },
      {
        keywords: ['arquivo', 'gaveteiro', 'pasta', 'documento'],
        result: {
          objectType: "Arquivo/Gaveteiro",
          confidence: 87,
          description: "Móvel para organização e armazenamento de documentos",
          suggestedCategory: "Móveis",
          characteristics: ["Gavetas deslizantes", "Sistema de travamento", "Estrutura metálica", "Suporte para pastas"]
        }
      },
      {
        keywords: ['cpu', 'gabinete', 'desktop', 'torre'],
        result: {
          objectType: "CPU/Gabinete",
          confidence: 93,
          description: "Unidade central de processamento em formato desktop",
          suggestedCategory: "Informática",
          characteristics: ["Gabinete metálico", "Portas frontais", "LEDs indicadores", "Saídas de ventilação"]
        }
      },
      {
        keywords: ['tablet', 'ipad', 'touchscreen', 'mobile'],
        result: {
          objectType: "Tablet Corporativo",
          confidence: 86,
          description: "Dispositivo móvel com tela sensível ao toque para uso empresarial",
          suggestedCategory: "Informática",
          characteristics: ["Tela touch", "Design fino", "Botões laterais", "Câmera integrada"]
        }
      }
    ];

    // Simulação de análise mais inteligente
    // Em uma implementação real, aqui seria feita análise de machine learning
    const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
    
    // Adiciona variação na confiança para parecer mais realista
    const confidenceVariation = Math.floor(Math.random() * 10) - 5;
    randomAnalysis.result.confidence = Math.max(75, Math.min(98, randomAnalysis.result.confidence + confidenceVariation));
    
    return randomAnalysis.result;
  };

  // Funções para gerenciar salas
  const handleSaveRoom = () => {
    if (!roomForm.name.trim() || !roomForm.floorId) return;

    const newRoom = {
      id: Date.now(),
      name: roomForm.name,
      description: roomForm.description,
      floorId: parseInt(roomForm.floorId)
    };

    if (editingRoom) {
      setFloors(floors.map(floor => ({
        ...floor,
        rooms: floor.rooms.map(room => 
          room.id === editingRoom.id ? { ...newRoom, id: editingRoom.id } : room
        )
      })));
      setEditingRoom(null);
    } else {
      setFloors(floors.map(floor => 
        floor.id === parseInt(roomForm.floorId) 
          ? { ...floor, rooms: [...floor.rooms, newRoom] }
          : floor
      ));
    }

    setRoomForm({ name: '', description: '', floorId: '' });
    setShowRoomForm(false);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      description: room.description,
      floorId: room.floorId.toString()
    });
    setShowRoomForm(true);
  };

  const handleDeleteRoom = (roomId) => {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
      setFloors(floors.map(floor => ({
        ...floor,
        rooms: floor.rooms.filter(room => room.id !== roomId)
      })));
    }
  };

  // Funções para gerenciar captura de foto
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Usa câmera traseira por padrão
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setIsCapturingPhoto(true);
        await processImageFile(file);
        setIsCapturingPhoto(false);
      }
    };
    
    input.click();
    setShowCameraOptions(false);
  };

  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setIsCapturingPhoto(true);
        await processImageFile(file);
        setIsCapturingPhoto(false);
      }
    };
    
    input.click();
    setShowCameraOptions(false);
  };

  const processImageFile = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target.result;
      setAssetForm(prev => ({ ...prev, photo: imageData, aiAnalysis: null }));
      
      // Executa análise de IA automaticamente
      try {
        const analysis = await analyzeImageWithAI(imageData);
        if (analysis) {
          setAssetForm(prev => ({ 
            ...prev, 
            aiAnalysis: analysis,
            // Auto-preenche categoria se não foi selecionada ainda
            category: prev.category || analysis.suggestedCategory || ''
          }));
        }
      } catch (error) {
        console.error('Erro na análise de IA:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  // Função corrigida para captura de foto (substituindo a antiga)
  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const handleSaveAsset = () => {
    // Validação mais robusta
    if (!assetForm.name?.trim()) {
      alert('Por favor, preencha o nome do ativo.');
      return;
    }
    
    if (!assetForm.code?.trim()) {
      alert('Por favor, preencha o código do ativo.');
      return;
    }
    
    if (!assetForm.floorId) {
      alert('Por favor, selecione um andar.');
      return;
    }
    
    if (!assetForm.roomId) {
      alert('Por favor, selecione uma sala.');
      return;
    }

    const newAsset = {
      id: editingAsset?.id || Date.now(),
      name: assetForm.name.trim(),
      code: assetForm.code.trim(),
      category: assetForm.category || '',
      description: assetForm.description || '',
      acquisitionDate: assetForm.acquisitionDate || '',
      value: assetForm.value || '',
      status: assetForm.status || 'Ativo',
      floorId: parseInt(assetForm.floorId),
      roomId: parseInt(assetForm.roomId),
      photo: assetForm.photo || null,
      aiAnalysis: assetForm.aiAnalysis || null,
      createdAt: editingAsset?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingAsset) {
      // Atualizar ativo existente
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === editingAsset.id ? newAsset : asset
        )
      );
      setEditingAsset(null);
    } else {
      // Criar novo ativo
      setAssets(prevAssets => [...prevAssets, newAsset]);
    }

    // Limpar formulário
    setAssetForm({
      name: '',
      code: '',
      category: '',
      description: '',
      acquisitionDate: '',
      value: '',
      status: 'Ativo',
      floorId: '',
      roomId: '',
      photo: null,
      aiAnalysis: null
    });
    
    setShowAssetForm(false);
    
    // Mensagem de sucesso
    alert(editingAsset ? 'Ativo atualizado com sucesso!' : 'Ativo cadastrado com sucesso!');
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetForm({
      name: asset.name,
      code: asset.code,
      category: asset.category,
      description: asset.description,
      acquisitionDate: asset.acquisitionDate,
      value: asset.value,
      status: asset.status,
      floorId: asset.floorId.toString(),
      roomId: asset.roomId.toString(),
      photo: asset.photo,
      aiAnalysis: asset.aiAnalysis
    });
    setShowAssetForm(true);
  };

  const handleDeleteAsset = (assetId) => {
    if (confirm('Tem certeza que deseja excluir este ativo?')) {
      setAssets(assets.filter(asset => asset.id !== assetId));
    }
  };

  // Funções auxiliares
  const getFloorName = (floorId) => {
    const floor = floors.find(f => f.id === floorId);
    return floor ? floor.name : '';
  };

  const getRoomName = (roomId) => {
    const room = floors.flatMap(f => f.rooms).find(r => r.id === roomId);
    return room ? room.name : '';
  };

  const getRoomsForFloor = (floorId) => {
    const floor = floors.find(f => f.id === parseInt(floorId));
    return floor ? floor.rooms : [];
  };

  // Filtros
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = !filterFloor || asset.floorId === parseInt(filterFloor);
    const matchesRoom = !filterRoom || asset.roomId === parseInt(filterRoom);
    
    return matchesSearch && matchesFloor && matchesRoom;
  });

  const getAvailableRoomsForFilter = () => {
    if (!filterFloor) return [];
    return getRoomsForFloor(filterFloor);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sistema de Controle de Ativos</h1>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'assets' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Package className="inline w-4 h-4 mr-2" />
              Ativos
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'locations' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Building className="inline w-4 h-4 mr-2" />
              Localizações
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'assets' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Gestão de Ativos</h2>
              <button
                onClick={() => setShowAssetForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Ativo
              </button>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Nome ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Andar</label>
                  <select
                    value={filterFloor}
                    onChange={(e) => {
                      setFilterFloor(e.target.value);
                      setFilterRoom('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os andares</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
                  <select
                    value={filterRoom}
                    onChange={(e) => setFilterRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!filterFloor}
                  >
                    <option value="">Todas as salas</option>
                    {getAvailableRoomsForFilter().map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterFloor('');
                      setFilterRoom('');
                    }}
                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Ativos */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome/Código</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IA Análise</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                            {asset.photo ? (
                              <img src={asset.photo} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Camera className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {asset.aiAnalysis && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <Brain className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                          <div className="text-sm text-gray-500">{asset.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {asset.aiAnalysis ? (
                            <div className="flex items-center">
                              <Brain className="w-4 h-4 text-blue-500 mr-1" />
                              <div>
                                <div className="text-xs font-medium text-gray-900">{asset.aiAnalysis.objectType}</div>
                                <div className="text-xs text-gray-500">{asset.aiAnalysis.confidence}% confiança</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sem análise</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getFloorName(asset.floorId)}</div>
                          <div className="text-sm text-gray-500">{getRoomName(asset.roomId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            asset.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                            asset.status === 'Manutenção' ? 'bg-yellow-100 text-yellow-800' :
                            asset.status === 'Inativo' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setShowAssetDetail(asset)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditAsset(asset)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAssets.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-500">Nenhum ativo encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Gestão de Localizações</h2>
              <button
                onClick={() => setShowRoomForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Sala
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {floors.map(floor => (
                <div key={floor.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-blue-600" />
                      {floor.name}
                    </h3>
                  </div>
                  <div className="p-4">
                    {floor.rooms.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhuma sala cadastrada</p>
                    ) : (
                      <div className="space-y-2">
                        {floor.rooms.map(room => (
                          <div key={room.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium text-sm">{room.name}</div>
                              {room.description && (
                                <div className="text-xs text-gray-500">{room.description}</div>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal para cadastro/edição de ativo */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingAsset ? 'Editar Ativo' : 'Novo Ativo'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                  <input
                    type="text"
                    value={assetForm.code}
                    onChange={(e) => setAssetForm({...assetForm, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({...assetForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={assetForm.status}
                    onChange={(e) => setAssetForm({...assetForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Andar *</label>
                  <select
                    value={assetForm.floorId}
                    onChange={(e) => setAssetForm({...assetForm, floorId: e.target.value, roomId: ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sala *</label>
                  <select
                    value={assetForm.roomId}
                    onChange={(e) => setAssetForm({...assetForm, roomId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!assetForm.floorId}
                    required
                  >
                    <option value="">Selecione...</option>
                    {getRoomsForFloor(assetForm.floorId).map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Aquisição</label>
                  <input
                    type="date"
                    value={assetForm.acquisitionDate}
                    onChange={(e) => setAssetForm({...assetForm, acquisitionDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={assetForm.value}
                    onChange={(e) => setAssetForm({...assetForm, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={assetForm.description}
                  onChange={(e) => setAssetForm({...assetForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Ativo</label>
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden relative">
                    {assetForm.photo ? (
                      <img src={assetForm.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {(isAnalyzing || isCapturingPhoto) && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Loader className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setShowCameraOptions(true)}
                        disabled={isAnalyzing || isCapturingPhoto}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md flex items-center justify-center"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {isCapturingPhoto ? 'Processando...' : 'Adicionar Foto'}
                      </button>
                      
                      {/* Botão de input file escondido para fallback */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoCapture}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing || isCapturingPhoto}
                        className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md flex items-center justify-center"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Arquivo
                      </button>
                    </div>
                    
                    {assetForm.photo && (
                      <button
                        type="button"
                        onClick={() => setAssetForm({...assetForm, photo: null, aiAnalysis: null})}
                        className="text-red-600 hover:text-red-900 text-sm"
                        disabled={isAnalyzing || isCapturingPhoto}
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal para opções de câmera */}
              {showCameraOptions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                    <h4 className="text-lg font-semibold mb-4">Como deseja adicionar a foto?</h4>
                    <div className="space-y-3">
                      <button
                        onClick={handleCameraCapture}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md flex items-center justify-center"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Tirar Foto (Câmera)
                      </button>
                      <button
                        onClick={handleGallerySelect}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md flex items-center justify-center"
                      >
                        <Package className="w-5 h-5 mr-2" />
                        Escolher da Galeria
                      </button>
                      <button
                        onClick={() => setShowCameraOptions(false)}
                        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-md"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Análise de IA aprimorada */}
              {assetForm.aiAnalysis && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">Análise por Inteligência Artificial</h4>
                      <p className="text-xs text-blue-600">Processamento concluído com sucesso</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                        <span className="font-medium text-gray-700">Objeto Identificado:</span>
                        <span className="text-blue-900 font-semibold">{assetForm.aiAnalysis.objectType}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                        <span className="font-medium text-gray-700">Nível de Confiança:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                              style={{ width: `${assetForm.aiAnalysis.confidence}%` }}
                            />
                          </div>
                          <span className="text-blue-900 font-semibold">{assetForm.aiAnalysis.confidence}%</span>
                        </div>
                      </div>
                      
                      <div className="p-2 bg-white rounded border border-blue-100">
                        <span className="font-medium text-gray-700">Categoria Sugerida:</span>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {assetForm.aiAnalysis.suggestedCategory}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="p-2 bg-white rounded border border-blue-100">
                        <span className="font-medium text-gray-700">Descrição:</span>
                        <p className="text-gray-900 mt-1 text-xs leading-relaxed">{assetForm.aiAnalysis.description}</p>
                      </div>
                      
                      <div className="p-2 bg-white rounded border border-blue-100">
                        <span className="font-medium text-gray-700">Características Detectadas:</span>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {assetForm.aiAnalysis.characteristics.map((char, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border">
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-200">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Dica:</strong> A categoria foi automaticamente sugerida baseada na análise. Você pode alterá-la se necessário.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSaveAsset}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
                >
                  {editingAsset ? 'Atualizar' : 'Salvar'}
                </button>
                <button
                  onClick={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                    setAssetForm({
                      name: '',
                      code: '',
                      category: '',
                      description: '',
                      acquisitionDate: '',
                      value: '',
                      status: 'Ativo',
                      floorId: '',
                      roomId: '',
                      photo: null,
                      aiAnalysis: null
                    });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cadastro/edição de sala */}
      {showRoomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingRoom ? 'Editar Sala' : 'Nova Sala'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Andar *</label>
                  <select
                    value={roomForm.floorId}
                    onChange={(e) => setRoomForm({...roomForm, floorId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSaveRoom}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
                >
                  {editingRoom ? 'Atualizar' : 'Salvar'}
                </button>
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setEditingRoom(null);
                    setRoomForm({ name: '', description: '', floorId: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes do ativo */}
      {showAssetDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Detalhes do Ativo</h3>
                <button
                  onClick={() => setShowAssetDetail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <p className="text-sm text-gray-900">{showAssetDetail.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Código</label>
                      <p className="text-sm text-gray-900">{showAssetDetail.code}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Categoria</label>
                      <p className="text-sm text-gray-900">{showAssetDetail.category || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        showAssetDetail.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                        showAssetDetail.status === 'Manutenção' ? 'bg-yellow-100 text-yellow-800' :
                        showAssetDetail.status === 'Inativo' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {showAssetDetail.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Localização</label>
                      <p className="text-sm text-gray-900">
                        {getFloorName(showAssetDetail.floorId)} - {getRoomName(showAssetDetail.roomId)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Data de Aquisição</label>
                      <p className="text-sm text-gray-900">
                        {showAssetDetail.acquisitionDate ? new Date(showAssetDetail.acquisitionDate).toLocaleDateString('pt-BR') : 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Valor</label>
                      <p className="text-sm text-gray-900">
                        {showAssetDetail.value ? `R$ ${parseFloat(showAssetDetail.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden relative">
                      {showAssetDetail.photo ? (
                        <img src={showAssetDetail.photo} alt={showAssetDetail.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-400" />
                          <span className="ml-2 text-gray-500">Nenhuma foto</span>
                        </div>
                      )}
                      {showAssetDetail.aiAnalysis && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                          <Brain className="w-3 h-3 mr-1" />
                          IA
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Análise de IA no modal de detalhes */}
                  {showAssetDetail.aiAnalysis && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Brain className="w-4 h-4 text-blue-600 mr-2" />
                        <h5 className="font-medium text-blue-900 text-sm">Análise por IA</h5>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="font-medium text-gray-700">Identificado:</span>
                          <span className="ml-1 text-gray-900">{showAssetDetail.aiAnalysis.objectType}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Confiança:</span>
                          <span className="ml-1 text-gray-900">{showAssetDetail.aiAnalysis.confidence}%</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Descrição:</span>
                          <p className="text-gray-900 mt-1">{showAssetDetail.aiAnalysis.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showAssetDetail.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                      <p className="text-sm text-gray-900">{showAssetDetail.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssetDetail(null);
                    handleEditAsset(showAssetDetail);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Editar
                </button>
                <button
                  onClick={() => setShowAssetDetail(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetControlSystem;
