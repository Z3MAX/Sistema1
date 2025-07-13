import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Plus, Edit, Trash2, Building, Package, Search, Eye, Save, Database,
  BarChart3, MapPin, Calendar, DollarSign, Filter, X, Home, Settings,
  TrendingUp, AlertCircle, CheckCircle, Clock, XCircle, Download, Upload,
  Grid, List, SortAsc, SortDesc, RefreshCw, Users, Shield, Bell
} from 'lucide-react';

const AssetControlSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid'); // grid ou list
  const [floors, setFloors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFloor, setFilterFloor] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAssetDetail, setShowAssetDetail] = useState(null);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef(null);

  // Chaves para localStorage
  const STORAGE_KEYS = {
    FLOORS: 'asset_system_floors',
    ASSETS: 'asset_system_assets',
    SETTINGS: 'asset_system_settings'
  };

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
    warranty: '',
    supplier: '',
    serialNumber: ''
  });

  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    floorId: '',
    capacity: '',
    area: ''
  });

  const categories = [
    'Informática', 'Móveis', 'Equipamentos', 'Veículos', 
    'Eletroeletrônicos', 'Ferramentas', 'Segurança', 'Outros'
  ];

  const statuses = ['Ativo', 'Inativo', 'Manutenção', 'Descartado'];

  // Inicialização do sistema
  useEffect(() => {
    loadDataFromDatabase();
  }, []);

  const loadDataFromDatabase = () => {
    try {
      setIsLoading(true);
      
      const savedFloors = localStorage.getItem(STORAGE_KEYS.FLOORS);
      if (savedFloors) {
        setFloors(JSON.parse(savedFloors));
      } else {
        const initialFloors = [
          { 
            id: 1, 
            number: 5, 
            name: '5º Andar - Administrativo', 
            rooms: [],
            description: 'Setor administrativo e financeiro'
          },
          { 
            id: 2, 
            number: 11, 
            name: '11º Andar - Tecnologia', 
            rooms: [],
            description: 'Departamento de TI e desenvolvimento'
          },
          { 
            id: 3, 
            number: 15, 
            name: '15º Andar - Direção', 
            rooms: [],
            description: 'Diretoria e salas de reunião'
          }
        ];
        setFloors(initialFloors);
        saveToDatabase(STORAGE_KEYS.FLOORS, initialFloors);
      }

      const savedAssets = localStorage.getItem(STORAGE_KEYS.ASSETS);
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      }

      setTimeout(() => setIsLoading(false), 800);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setIsLoading(false);
    }
  };

  const saveToDatabase = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  };

  const updateFloorsInDatabase = (newFloors) => {
    setFloors(newFloors);
    saveToDatabase(STORAGE_KEYS.FLOORS, newFloors);
  };

  const updateAssetsInDatabase = (newAssets) => {
    setAssets(newAssets);
    saveToDatabase(STORAGE_KEYS.ASSETS, newAssets);
  };

  // Funções para gerenciar captura de foto
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
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
    reader.onload = (event) => {
      const imageData = event.target.result;
      setAssetForm(prev => ({ ...prev, photo: imageData }));
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processImageFile(file);
    }
  };

  // Funções para gerenciar salas
  const handleSaveRoom = () => {
    if (!roomForm.name?.trim() || !roomForm.floorId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newRoom = {
      id: editingRoom?.id || Date.now(),
      name: roomForm.name.trim(),
      description: roomForm.description.trim(),
      capacity: roomForm.capacity || '',
      area: roomForm.area || '',
      floorId: parseInt(roomForm.floorId),
      createdAt: editingRoom?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let newFloors;
    if (editingRoom) {
      newFloors = floors.map(floor => ({
        ...floor,
        rooms: floor.rooms.map(room => 
          room.id === editingRoom.id ? newRoom : room
        )
      }));
      setEditingRoom(null);
    } else {
      newFloors = floors.map(floor => 
        floor.id === parseInt(roomForm.floorId) 
          ? { ...floor, rooms: [...floor.rooms, newRoom] }
          : floor
      );
    }

    updateFloorsInDatabase(newFloors);
    setRoomForm({ name: '', description: '', floorId: '', capacity: '', area: '' });
    setShowRoomForm(false);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      description: room.description || '',
      capacity: room.capacity || '',
      area: room.area || '',
      floorId: room.floorId.toString()
    });
    setShowRoomForm(true);
  };

  const handleDeleteRoom = (roomId) => {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
      const assetsInRoom = assets.filter(asset => asset.roomId === roomId);
      if (assetsInRoom.length > 0) {
        alert(`Não é possível excluir esta sala pois existem ${assetsInRoom.length} ativo(s) cadastrado(s) nela.`);
        return;
      }

      const newFloors = floors.map(floor => ({
        ...floor,
        rooms: floor.rooms.filter(room => room.id !== roomId)
      }));
      updateFloorsInDatabase(newFloors);
    }
  };

  // Funções para gerenciar ativos
  const handleSaveAsset = () => {
    if (!assetForm.name?.trim()) {
      alert('Por favor, preencha o nome do ativo.');
      return;
    }
    
    if (!assetForm.code?.trim()) {
      alert('Por favor, preencha o código do ativo.');
      return;
    }

    if (!editingAsset && assets.some(asset => asset.code.toLowerCase() === assetForm.code.toLowerCase())) {
      alert('Já existe um ativo com este código.');
      return;
    }
    
    if (!assetForm.floorId || !assetForm.roomId) {
      alert('Por favor, selecione o andar e a sala.');
      return;
    }

    const newAsset = {
      id: editingAsset?.id || Date.now(),
      name: assetForm.name.trim(),
      code: assetForm.code.trim(),
      category: assetForm.category || '',
      description: assetForm.description?.trim() || '',
      acquisitionDate: assetForm.acquisitionDate || '',
      value: assetForm.value || '',
      status: assetForm.status || 'Ativo',
      floorId: parseInt(assetForm.floorId),
      roomId: parseInt(assetForm.roomId),
      photo: assetForm.photo || null,
      warranty: assetForm.warranty || '',
      supplier: assetForm.supplier || '',
      serialNumber: assetForm.serialNumber || '',
      createdAt: editingAsset?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let newAssets;
    if (editingAsset) {
      newAssets = assets.map(asset => 
        asset.id === editingAsset.id ? newAsset : asset
      );
      setEditingAsset(null);
    } else {
      newAssets = [...assets, newAsset];
    }

    updateAssetsInDatabase(newAssets);
    resetAssetForm();
    setShowAssetForm(false);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetForm({
      name: asset.name,
      code: asset.code,
      category: asset.category || '',
      description: asset.description || '',
      acquisitionDate: asset.acquisitionDate || '',
      value: asset.value || '',
      status: asset.status || 'Ativo',
      floorId: asset.floorId.toString(),
      roomId: asset.roomId.toString(),
      photo: asset.photo || null,
      warranty: asset.warranty || '',
      supplier: asset.supplier || '',
      serialNumber: asset.serialNumber || ''
    });
    setShowAssetForm(true);
  };

  const handleDeleteAsset = (assetId) => {
    if (confirm('Tem certeza que deseja excluir este ativo?')) {
      const newAssets = assets.filter(asset => asset.id !== assetId);
      updateAssetsInDatabase(newAssets);
    }
  };

  const resetAssetForm = () => {
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
      warranty: '',
      supplier: '',
      serialNumber: ''
    });
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

  // Filtros e ordenação
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = !filterFloor || asset.floorId === parseInt(filterFloor);
    const matchesRoom = !filterRoom || asset.roomId === parseInt(filterRoom);
    const matchesStatus = !filterStatus || asset.status === filterStatus;
    const matchesCategory = !filterCategory || asset.category === filterCategory;
    
    return matchesSearch && matchesFloor && matchesRoom && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';
    
    if (sortBy === 'value') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }
    
    if (sortBy === 'acquisitionDate') {
      aValue = new Date(aValue || '1970-01-01').getTime();
      bValue = new Date(bValue || '1970-01-01').getTime();
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Estatísticas para dashboard
  const getDashboardStats = () => {
    const total = assets.length;
    const active = assets.filter(a => a.status === 'Ativo').length;
    const maintenance = assets.filter(a => a.status === 'Manutenção').length;
    const inactive = assets.filter(a => a.status === 'Inativo').length;
    const totalValue = assets.reduce((sum, asset) => sum + (parseFloat(asset.value) || 0), 0);
    
    const categoryStats = categories.map(category => ({
      name: category,
      count: assets.filter(a => a.category === category).length,
      percentage: total > 0 ? ((assets.filter(a => a.category === category).length / total) * 100).toFixed(1) : 0
    })).filter(stat => stat.count > 0);

    return {
      total,
      active,
      maintenance,
      inactive,
      totalValue,
      categoryStats,
      totalRooms: floors.reduce((sum, floor) => sum + floor.rooms.length, 0)
    };
  };

  const stats = getDashboardStats();

  // Backup e importação
  const exportDatabase = () => {
    const data = {
      floors: floors,
      assets: assets,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.floors && data.assets) {
            setFloors(data.floors);
            setAssets(data.assets);
            saveToDatabase(STORAGE_KEYS.FLOORS, data.floors);
            saveToDatabase(STORAGE_KEYS.ASSETS, data.assets);
            alert('Dados importados com sucesso!');
          }
        } catch (error) {
          alert('Erro ao importar dados.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Componente de Status Badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Ativo': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Manutenção': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Inativo': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'Descartado': { color: 'bg-gray-100 text-gray-800', icon: X }
    };
    
    const config = statusConfig[status] || statusConfig['Ativo'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  // Tela de loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Database className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 text-lg">Carregando sistema...</p>
          <div className="mt-4 w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header aprimorado */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AssetManager Pro</h1>
                  <p className="text-sm text-gray-500">Sistema de Controle de Ativos</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{stats.total} ativos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="w-4 h-4" />
                  <span>{stats.totalRooms} salas</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative"
                >
                  <Bell className="w-5 h-5" />
                  {stats.maintenance > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></span>
                  )}
                </button>
                
                <button
                  onClick={exportDatabase}
                  className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Backup</span>
                </button>
                
                <label className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Importar</span>
                  <input type="file" accept=".json" onChange={importDatabase} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          
          {/* Navegação */}
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'assets', label: 'Ativos', icon: Package },
              { id: 'locations', label: 'Localizações', icon: Building },
              { id: 'reports', label: 'Relatórios', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notificações */}
      {showNotifications && (
        <div className="absolute top-16 right-4 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notificações</h3>
              <button onClick={() => setShowNotifications(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            {stats.maintenance > 0 ? (
              <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">{stats.maintenance} ativo(s) em manutenção</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma notificação</p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <button
                onClick={() => loadDataFromDatabase()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
            </div>
            
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Ativos</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ativos Ativos</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Em Manutenção</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.maintenance}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gráficos e informações */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Distribuição por Categoria</h3>
                <div className="space-y-3">
                  {stats.categoryStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                          index % 4 === 0 ? 'from-blue-400 to-blue-600' :
                          index % 4 === 1 ? 'from-green-400 to-green-600' :
                          index % 4 === 2 ? 'from-yellow-400 to-yellow-600' :
                          'from-purple-400 to-purple-600'
                        }`}></div>
                        <span className="text-sm font-medium">{stat.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{stat.count}</span>
                        <span className="text-xs text-gray-500">({stat.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setActiveTab('assets');
                      setShowAssetForm(true);
                    }}
                    className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-600 font-medium">Adicionar Novo Ativo</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab('locations');
                      setShowRoomForm(true);
                    }}
                    className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Building className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">Adicionar Nova Sala</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="text-purple-600 font-medium">Ver Relatórios</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ativos */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Ativos</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowAssetForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Ativo</span>
                </button>
              </div>
            </div>

            {/* Filtros e busca */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, código ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                  </button>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Nome</option>
                    <option value="code">Código</option>
                    <option value="category">Categoria</option>
                    <option value="acquisitionDate">Data Aquisição</option>
                    <option value="value">Valor</option>
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                  <select
                    value={filterFloor}
                    onChange={(e) => {
                      setFilterFloor(e.target.value);
                      setFilterRoom('');
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os andares</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filterRoom}
                    onChange={(e) => setFilterRoom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!filterFloor}
                  >
                    <option value="">Todas as salas</option>
                    {filterFloor && getRoomsForFloor(filterFloor).map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Lista de ativos */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAssets.map(asset => (
                  <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48 bg-gray-100">
                      {asset.photo ? (
                        <img src={asset.photo} alt={asset.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <StatusBadge status={asset.status} />
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{asset.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{asset.code}</p>
                      <p className="text-xs text-gray-400 mb-3">{getFloorName(asset.floorId)} - {getRoomName(asset.roomId)}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {asset.value ? `R$ ${parseFloat(asset.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sem valor'}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setShowAssetDetail(asset)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditAsset(asset)}
                            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome/Código</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAssets.map(asset => (
                        <tr key={asset.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                              {asset.photo ? (
                                <img src={asset.photo} alt={asset.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                            <div className="text-sm text-gray-500">{asset.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {asset.category || 'Sem categoria'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{getFloorName(asset.floorId)}</div>
                            <div className="text-sm text-gray-500">{getRoomName(asset.roomId)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={asset.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {asset.value ? `R$ ${parseFloat(asset.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setShowAssetDetail(asset)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditAsset(asset)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredAssets.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-500">Nenhum ativo encontrado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Localizações */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Localizações</h2>
              <button
                onClick={() => setShowRoomForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Sala</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {floors.map(floor => (
                <div key={floor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <Building className="w-5 h-5" />
                      <span>{floor.name}</span>
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">{floor.description}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        {floor.rooms.length} sala(s) cadastrada(s)
                      </span>
                      <span className="text-sm text-gray-500">
                        {assets.filter(a => a.floorId === floor.id).length} ativo(s)
                      </span>
                    </div>
                    
                    {floor.rooms.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-8">Nenhuma sala cadastrada</p>
                    ) : (
                      <div className="space-y-3">
                        {floor.rooms.map(room => (
                          <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{room.name}</div>
                              {room.description && (
                                <div className="text-xs text-gray-500 mt-1">{room.description}</div>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                {room.capacity && (
                                  <span className="flex items-center space-x-1">
                                    <Users className="w-3 h-3" />
                                    <span>{room.capacity} pessoas</span>
                                  </span>
                                )}
                                {room.area && (
                                  <span>{room.area} m²</span>
                                )}
                                <span>{assets.filter(a => a.roomId === room.id).length} ativo(s)</span>
                              </div>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Excluir"
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

        {/* Relatórios */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Resumo por Status</h3>
                <div className="space-y-4">
                  {statuses.map(status => {
                    const count = assets.filter(a => a.status === status).length;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusBadge status={status} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Ativos por Andar</h3>
                <div className="space-y-4">
                  {floors.map(floor => {
                    const count = assets.filter(a => a.floorId === floor.id).length;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={floor.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{floor.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Valor por Categoria</h3>
                <div className="space-y-4">
                  {categories.map(category => {
                    const categoryAssets = assets.filter(a => a.category === category);
                    const value = categoryAssets.reduce((sum, asset) => sum + (parseFloat(asset.value) || 0), 0);
                    const percentage = stats.totalValue > 0 ? (value / stats.totalValue) * 100 : 0;
                    
                    if (categoryAssets.length === 0) return null;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full" />
                          <span className="text-sm font-medium">{category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-20 text-right">
                            R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Ativos Adicionados Recentemente</h3>
                <div className="space-y-3">
                  {assets
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map(asset => (
                      <div key={asset.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden">
                            {asset.photo ? (
                              <img src={asset.photo} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{asset.name}</div>
                            <div className="text-xs text-gray-500">{asset.code}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(asset.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para cadastro/edição de ativo */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingAsset ? 'Editar Ativo' : 'Novo Ativo'}
                </h3>
                <button
                  onClick={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                    resetAssetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Ativo *</label>
                    <input
                      type="text"
                      value={assetForm.name}
                      onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Notebook Dell Inspiron"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                    <input
                      type="text"
                      value={assetForm.code}
                      onChange={(e) => setAssetForm({...assetForm, code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: NB001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={assetForm.category}
                      onChange={(e) => setAssetForm({...assetForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={assetForm.status}
                      onChange={(e) => setAssetForm({...assetForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Série</label>
                    <input
                      type="text"
                      value={assetForm.serialNumber}
                      onChange={(e) => setAssetForm({...assetForm, serialNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: SN123456789"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
                    <input
                      type="text"
                      value={assetForm.supplier}
                      onChange={(e) => setAssetForm({...assetForm, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Dell Brasil"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Andar *</label>
                    <select
                      value={assetForm.floorId}
                      onChange={(e) => setAssetForm({...assetForm, floorId: e.target.value, roomId: ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um andar</option>
                      {floors.map(floor => (
                        <option key={floor.id} value={floor.id}>{floor.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sala *</label>
                    <select
                      value={assetForm.roomId}
                      onChange={(e) => setAssetForm({...assetForm, roomId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!assetForm.floorId}
                    >
                      <option value="">Selecione uma sala</option>
                      {getRoomsForFloor(assetForm.floorId).map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Aquisição</label>
                    <input
                      type="date"
                      value={assetForm.acquisitionDate}
                      onChange={(e) => setAssetForm({...assetForm, acquisitionDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={assetForm.value}
                      onChange={(e) => setAssetForm({...assetForm, value: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 2500.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Garantia (meses)</label>
                    <input
                      type="number"
                      value={assetForm.warranty}
                      onChange={(e) => setAssetForm({...assetForm, warranty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 36"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={assetForm.description}
                  onChange={(e) => setAssetForm({...assetForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição detalhada do ativo..."
                />
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Ativo</label>
                <div className="flex items-start space-x-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden relative border-2 border-dashed border-gray-300">
                    {assetForm.photo ? (
                      <img src={assetForm.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {isCapturingPhoto && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setShowCameraOptions(true)}
                        disabled={isCapturingPhoto}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isCapturingPhoto ? 'Processando...' : 'Adicionar Foto'}</span>
                      </button>
                      
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
                        disabled={isCapturingPhoto}
                        className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Arquivo</span>
                      </button>
                    </div>
                    
                    {assetForm.photo && (
                      <button
                        type="button"
                        onClick={() => setAssetForm({...assetForm, photo: null})}
                        className="text-red-600 hover:text-red-900 text-sm transition-colors"
                        disabled={isCapturingPhoto}
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                    resetAssetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAsset}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  {editingAsset ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cadastro/edição de sala */}
      {showRoomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingRoom ? 'Editar Sala' : 'Nova Sala'}
                </h3>
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setEditingRoom(null);
                    setRoomForm({ name: '', description: '', floorId: '', capacity: '', area: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Sala *</label>
                  <input
                    type="text"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Sala de Reuniões A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Andar *</label>
                  <select
                    value={roomForm.floorId}
                    onChange={(e) => setRoomForm({...roomForm, floorId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um andar</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacidade</label>
                    <input
                      type="number"
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Área (m²)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={roomForm.area}
                      onChange={(e) => setRoomForm({...roomForm, area: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 25.5"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição da sala..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setEditingRoom(null);
                    setRoomForm({ name: '', description: '', floorId: '', capacity: '', area: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRoom}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  {editingRoom ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para opções de câmera */}
      {showCameraOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Como deseja adicionar a foto?</h4>
            <div className="space-y-3">
              <button
                onClick={handleCameraCapture}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span>Tirar Foto (Câmera)</span>
              </button>
              <button
                onClick={handleGallerySelect}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>Escolher da Galeria</span>
              </button>
              <button
                onClick={() => setShowCameraOptions(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes do ativo */}
      {showAssetDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Detalhes do Ativo</h3>
                <button
                  onClick={() => setShowAssetDetail(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <p className="text-base text-gray-900">{showAssetDetail.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <p className="text-base text-gray-900 font-mono">{showAssetDetail.code}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {showAssetDetail.category || 'Sem categoria'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <StatusBadge status={showAssetDetail.status} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                    <p className="text-base text-gray-900">
                      {getFloorName(showAssetDetail.floorId)} - {getRoomName(showAssetDetail.roomId)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Aquisição</label>
                    <p className="text-base text-gray-900">
                      {showAssetDetail.acquisitionDate ? 
                        new Date(showAssetDetail.acquisitionDate).toLocaleDateString('pt-BR') : 
                        'Não informado'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <p className="text-base text-gray-900 font-semibold">
                      {showAssetDetail.value ? 
                        `R$ ${parseFloat(showAssetDetail.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                        'Não informado'
                      }
                    </p>
                  </div>
                  
                  {showAssetDetail.serialNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Série</label>
                      <p className="text-base text-gray-900 font-mono">{showAssetDetail.serialNumber}</p>
                    </div>
                  )}
                  
                  {showAssetDetail.supplier && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                      <p className="text-base text-gray-900">{showAssetDetail.supplier}</p>
                    </div>
                  )}
                  
                  {showAssetDetail.warranty && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Garantia</label>
                      <p className="text-base text-gray-900">{showAssetDetail.warranty} meses</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
                    <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border">
                      {showAssetDetail.photo ? (
                        <img 
                          src={showAssetDetail.photo} 
                          alt={showAssetDetail.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                            <span className="text-gray-500">Nenhuma foto disponível</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {showAssetDetail.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-base text-gray-900">{showAssetDetail.description}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Informações do Sistema</label>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Criado em:</span>
                        <span className="text-gray-900">
                          {new Date(showAssetDetail.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {showAssetDetail.updatedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Última atualização:</span>
                          <span className="text-gray-900">
                            {new Date(showAssetDetail.updatedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowAssetDetail(null);
                    handleEditAsset(showAssetDetail);
                  }}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setShowAssetDetail(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
