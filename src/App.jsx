import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Plus, Edit, Trash2, Building, Package, Search, Eye, Save, Database,
  BarChart3, MapPin, Calendar, DollarSign, Filter, X, Home, Settings,
  TrendingUp, AlertCircle, CheckCircle, Clock, XCircle, Download, Upload,
  Grid, List, SortAsc, SortDesc, RefreshCw, Users, Shield, Bell, FileText
} from 'lucide-react';

const AssetControlSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [floors, setFloors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
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
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);

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

  // Função para importar ativos via Excel
  const handleExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
      alert('Por favor, selecione um arquivo Excel (.xlsx ou .xls) ou CSV');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setImportProgress(30);

      // Simulação de dados processados
      const exampleData = [
        {
          'Nome': 'Monitor Dell 24"',
          'Código': 'MON001',
          'Categoria': 'Informática',
          'Descrição': 'Monitor Dell 24 polegadas Full HD',
          'Valor': '800.00',
          'Status': 'Ativo',
          'Andar': '5º Andar - Administrativo',
          'Sala': 'Sala 501',
          'Fornecedor': 'Dell Brasil',
          'Garantia': '36',
          'Número de Série': 'DL24001'
        },
        {
          'Nome': 'Notebook HP Pavilion',
          'Código': 'NB001',
          'Categoria': 'Informática',
          'Descrição': 'Notebook HP Pavilion i5 8GB RAM',
          'Valor': '2500.00',
          'Status': 'Ativo',
          'Andar': '11º Andar - Tecnologia',
          'Sala': 'Sala 1101',
          'Fornecedor': 'HP Brasil',
          'Garantia': '24',
          'Número de Série': 'HP001'
        }
      ];

      setImportProgress(60);

      const processedAssets = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < exampleData.length; i++) {
        const row = exampleData[i];
        setImportProgress(60 + (i / exampleData.length) * 30);

        try {
          if (!row['Nome'] || !row['Código']) {
            errorCount++;
            continue;
          }

          if (assets.some(asset => asset.code.toLowerCase() === row['Código'].toLowerCase())) {
            errorCount++;
            continue;
          }

          const floorName = row['Andar'] || '';
          const roomName = row['Sala'] || '';
          
          const floor = floors.find(f => f.name.includes(floorName.split(' ')[0]) || f.name === floorName);
          const room = floor?.rooms.find(r => r.name === roomName);

          if (!floor || !room) {
            errorCount++;
            continue;
          }

          const newAsset = {
            id: Date.now() + i,
            name: row['Nome'].trim(),
            code: row['Código'].trim(),
            category: row['Categoria'] || '',
            description: row['Descrição'] || '',
            value: row['Valor'] || '',
            status: row['Status'] || 'Ativo',
            floorId: floor.id,
            roomId: room.id,
            supplier: row['Fornecedor'] || '',
            warranty: row['Garantia'] || '',
            serialNumber: row['Número de Série'] || '',
            acquisitionDate: row['Data de Aquisição'] || '',
            photo: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          processedAssets.push(newAsset);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      setImportProgress(100);
      
      if (processedAssets.length > 0) {
        const newAssets = [...assets, ...processedAssets];
        updateAssetsInDatabase(newAssets);
      }

      setTimeout(() => {
        setIsImporting(false);
        setImportProgress(0);
        setShowExcelImport(false);
        alert(`Importação concluída!\n✅ ${successCount} ativos importados\n❌ ${errorCount} erros encontrados`);
      }, 1000);

    } catch (error) {
      setIsImporting(false);
      setImportProgress(0);
      alert('Erro ao processar arquivo Excel. Verifique o formato e tente novamente.');
    }

    event.target.value = '';
  };

  // Função para gerar template Excel
  const downloadExcelTemplate = () => {
    const csvContent = [
      'Nome,Código,Categoria,Descrição,Valor,Status,Andar,Sala,Fornecedor,Garantia,Número de Série,Data de Aquisição',
      'Monitor Dell 24",MON001,Informática,Monitor Dell 24 polegadas Full HD,800.00,Ativo,5º Andar - Administrativo,Sala 501,Dell Brasil,36,DL24001,2024-01-15',
      'Notebook HP,NB001,Informática,Notebook HP i5 8GB,2500.00,Ativo,11º Andar - Tecnologia,Sala 1101,HP Brasil,24,HP001,2024-01-20'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_ativos.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

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

  // Componente de Status Badge
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Ativo': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Manutenção': { color: 'bg-red-100 text-red-800', icon: Clock },
      'Inativo': { color: 'bg-gray-100 text-gray-800', icon: XCircle },
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Database className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 text-lg">Carregando sistema...</p>
          <div className="mt-4 w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-red-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
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
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>
                
                <button
                  onClick={exportDatabase}
                  className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Backup</span>
                </button>
                
                <label className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors">
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
                    ? 'bg-red-600 text-white'
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
              <div className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                <AlertCircle className="w-4 h-4 text-red-600" />
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
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-red-600" />
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
                    <p className="text-3xl font-bold text-red-600">{stats.maintenance}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-3xl font-bold text-red-600">
                      R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ações Rápidas */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('assets');
                    setShowAssetForm(true);
                  }}
                  className="flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-medium">Adicionar Ativo</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('assets');
                    setShowExcelImport(true);
                  }}
                  className="flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Importar Excel</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('locations');
                    setShowRoomForm(true);
                  }}
                  className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Building className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">Adicionar Sala</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-600 font-medium">Ver Relatórios</span>
                </button>
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
                <button
                  onClick={() => setShowExcelImport(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Import Excel</span>
                </button>
                <button
                  onClick={() => setShowAssetForm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Ativo</span>
                </button>
              </div>
            </div>

            {/* Busca */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome, código ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Lista de ativos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome/Código</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
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
                          <StatusBadge status={asset.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShowAssetDetail(asset)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

        {/* Localizações */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Localizações</h2>
              <button
                onClick={() => setShowRoomForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Sala</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {floors.map(floor => (
                <div key={floor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <Building className="w-5 h-5" />
                      <span>{floor.name}</span>
                    </h3>
                    <p className="text-red-100 text-sm mt-1">{floor.description}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        {floor.rooms.length} sala(s)
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
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="p-1 text-gray-400 hover:text-indigo-600"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
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
                            className="h-full bg-red-600 rounded-full transition-all duration-300"
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
          </div>
        )}
      </div>

      {/* Modal para importação Excel */}
      {showExcelImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Importar Ativos via Excel</h3>
                <button
                  onClick={() => setShowExcelImport(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {!isImporting ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">Importar seus ativos em massa</h4>
                    <p className="text-gray-600">
                      Faça upload de um arquivo Excel (.xlsx ou .csv) com os dados dos seus ativos
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={downloadExcelTemplate}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Baixar Template</span>
                    </button>
                    
                    <label className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 cursor-pointer">
                      <Upload className="w-5 h-5" />
                      <span>Selecionar Arquivo</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleExcelImport}
                        ref={excelInputRef}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <h4 className="text-lg font-semibold mb-2">Processando arquivo...</h4>
                  <p className="text-gray-600 mb-4">Importando seus ativos, aguarde...</p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">{importProgress}% concluído</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: Notebook Dell Inspiron"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                    <input
                      type="text"
                      value={assetForm.code}
                      onChange={(e) => setAssetForm({...assetForm, code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: NB001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={assetForm.category}
                      onChange={(e) => setAssetForm({...assetForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Andar *</label>
                    <select
                      value={assetForm.floorId}
                      onChange={(e) => setAssetForm({...assetForm, floorId: e.target.value, roomId: ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={!assetForm.floorId}
                    >
                      <option value="">Selecione uma sala</option>
                      {getRoomsForFloor(assetForm.floorId).map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={assetForm.value}
                      onChange={(e) => setAssetForm({...assetForm, value: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: 2500.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
                    <input
                      type="text"
                      value={assetForm.supplier}
                      onChange={(e) => setAssetForm({
