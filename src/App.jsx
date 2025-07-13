import React, { useState, useRef, useEffect } from 'react';

// Ícones SVG simples para evitar problemas de importação
const Icons = {
  Camera: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Trash2: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Database: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="m3 5 0 14c0 1.6 4 3 9 3s9-1.4 9-3V5"></path>
      <path d="m3 12c0 1.6 4 3 9 3s9-1.4 9-3"></path>
    </svg>
  ),
  Home: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  BarChart3: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  DollarSign: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12,6 12,12 16,14"></polyline>
    </svg>
  ),
  XCircle: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Image: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21,15 16,10 5,21"></polyline>
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  ),
  RotateCcw: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="1,4 1,10 7,10"></polyline>
      <path d="M3.51,15a9,9,0,0,0,13.48,2.55"></path>
      <path d="M20.49,9A9,9,0,0,0,7,6.54L1,10"></path>
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  )
};

const AssetControlSystem = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [floors, setFloors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssetDetail, setShowAssetDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState([]);
  
  // Estados específicos para foto - SIMPLIFICADO
  const [photoState, setPhotoState] = useState({
    showOptions: false,
    showPreview: false,
    capturedPhoto: null,
    isProcessing: false,
    error: ''
  });
  
  // Refs
  const fileInputRef = useRef(null);

  // Configurações
  const STORAGE_KEYS = {
    FLOORS: 'asset_system_floors',
    ASSETS: 'asset_system_assets'
  };

  const categories = [
    'Informática', 'Móveis', 'Equipamentos', 'Veículos', 
    'Eletroeletrônicos', 'Ferramentas', 'Segurança', 'Outros'
  ];

  const statuses = ['Ativo', 'Inativo', 'Manutenção', 'Descartado'];

  // Estados dos formulários
  const [assetForm, setAssetForm] = useState({
    name: '',
    code: '',
    category: '',
    description: '',
    value: '',
    status: 'Ativo',
    floorId: '',
    roomId: '',
    photo: null,
    supplier: '',
    serialNumber: ''
  });

  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    floorId: ''
  });

  // =================== FUNÇÕES DE FOTO SIMPLIFICADAS ===================
  
  // Abrir opções de foto
  const openPhotoOptions = () => {
    setPhotoState(prev => ({
      ...prev,
      showOptions: true,
      error: ''
    }));
  };

  // Fechar todos os modais de foto
  const closeAllPhotoModals = () => {
    setPhotoState({
      showOptions: false,
      showPreview: false,
      capturedPhoto: null,
      isProcessing: false,
      error: ''
    });
  };

  // Processar arquivo de imagem
  const processImageFile = async (file) => {
    if (!file) return;

    console.log('📸 Processando arquivo:', file.name, file.type, file.size);

    setPhotoState(prev => ({ ...prev, isProcessing: true, error: '' }));

    try {
      // Validações
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione apenas arquivos de imagem.');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('A imagem deve ter no máximo 10MB.');
      }

      // Ler arquivo usando Promise para melhor controle
      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem.'));
        reader.readAsDataURL(file);
      });

      console.log('✅ Arquivo lido com sucesso');
      
      // Redimensionar imagem
      const resizedImage = await resizeImage(imageDataUrl, 1024, 768);
      
      console.log('✅ Imagem redimensionada');

      setPhotoState(prev => ({
        ...prev,
        capturedPhoto: resizedImage,
        showPreview: true,
        showOptions: false,
        isProcessing: false
      }));
      
    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
      setPhotoState(prev => ({
        ...prev,
        error: error.message || 'Erro ao processar imagem.',
        isProcessing: false
      }));
    }
  };

  // Redimensionar imagem
  const resizeImage = (dataUrl, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // Calcular novas dimensões mantendo proporção
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(resizedDataUrl);
      };
      
      img.src = dataUrl;
    });
  };

  // Tirar foto usando câmera - VERSÃO SIMPLIFICADA E ROBUSTA
  const handleTakePhoto = () => {
    console.log('📷 Iniciando captura de foto...');
    
    setPhotoState(prev => ({ ...prev, showOptions: false, error: '' }));

    try {
      // Criar input file com atributos para câmera
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Câmera traseira
      
      // Event listener para quando arquivo for selecionado
      input.addEventListener('change', (event) => {
        console.log('📸 Arquivo selecionado da câmera');
        const file = event.target.files[0];
        if (file) {
          processImageFile(file);
        }
      });
      
      // Disparar o input
      input.click();
      
    } catch (error) {
      console.error('❌ Erro ao abrir câmera:', error);
      setPhotoState(prev => ({
        ...prev,
        error: 'Erro ao acessar a câmera. Verifique as permissões.'
      }));
    }
  };

  // Selecionar da galeria
  const handleSelectFromGallery = () => {
    console.log('🖼️ Abrindo galeria...');
    
    setPhotoState(prev => ({ ...prev, showOptions: false, error: '' }));
    
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.addEventListener('change', (event) => {
        console.log('🖼️ Arquivo selecionado da galeria');
        const file = event.target.files[0];
        if (file) {
          processImageFile(file);
        }
      });
      
      input.click();
      
    } catch (error) {
      console.error('❌ Erro ao abrir galeria:', error);
      setPhotoState(prev => ({
        ...prev,
        error: 'Erro ao acessar galeria.'
      }));
    }
  };

  // Confirmar foto
  const confirmPhoto = () => {
    if (photoState.capturedPhoto) {
      console.log('✅ Foto confirmada e adicionada ao formulário');
      setAssetForm(prev => ({ ...prev, photo: photoState.capturedPhoto }));
      closeAllPhotoModals();
    }
  };

  // Descartar foto e tirar nova
  const retakePhoto = () => {
    setPhotoState(prev => ({
      ...prev,
      showPreview: false,
      showOptions: true,
      capturedPhoto: null
    }));
  };

  // Remover foto do formulário
  const removePhotoFromForm = () => {
    setAssetForm(prev => ({ ...prev, photo: null }));
  };

  // =================== OUTRAS FUNÇÕES ===================

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
            name: '5º Andar - Administrativo', 
            rooms: [
              { id: 1, name: 'Sala 501', description: 'Recepção', floorId: 1 },
              { id: 2, name: 'Sala 502', description: 'Financeiro', floorId: 1 }
            ]
          },
          { 
            id: 2, 
            name: '11º Andar - Tecnologia', 
            rooms: [
              { id: 3, name: 'Sala 1101', description: 'Desenvolvimento', floorId: 2 },
              { id: 4, name: 'Sala 1102', description: 'TI', floorId: 2 }
            ]
          }
        ];
        setFloors(initialFloors);
        saveToDatabase(STORAGE_KEYS.FLOORS, initialFloors);
      }

      const savedAssets = localStorage.getItem(STORAGE_KEYS.ASSETS);
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      }

      setTimeout(() => setIsLoading(false), 500);
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

  const handleSaveRoom = () => {
    if (!roomForm.name?.trim() || !roomForm.floorId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newRoom = {
      id: editingRoom?.id || Date.now(),
      name: roomForm.name.trim(),
      description: roomForm.description.trim(),
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
    setRoomForm({ name: '', description: '', floorId: '' });
    setShowRoomForm(false);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      description: room.description || '',
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
      value: assetForm.value || '',
      status: assetForm.status || 'Ativo',
      floorId: parseInt(assetForm.floorId),
      roomId: parseInt(assetForm.roomId),
      photo: assetForm.photo || null,
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
      value: asset.value || '',
      status: asset.status || 'Ativo',
      floorId: asset.floorId.toString(),
      roomId: asset.roomId.toString(),
      photo: asset.photo || null,
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
      value: '',
      status: 'Ativo',
      floorId: '',
      roomId: '',
      photo: null,
      supplier: '',
      serialNumber: ''
    });
  };

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

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getDashboardStats = () => {
    const total = assets.length;
    const active = assets.filter(a => a.status === 'Ativo').length;
    const maintenance = assets.filter(a => a.status === 'Manutenção').length;
    const inactive = assets.filter(a => a.status === 'Inativo').length;
    const totalValue = assets.reduce((sum, asset) => sum + (parseFloat(asset.value) || 0), 0);

    return {
      total,
      active,
      maintenance,
      inactive,
      totalValue,
      totalRooms: floors.reduce((sum, floor) => sum + floor.rooms.length, 0)
    };
  };

  const stats = getDashboardStats();

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Ativo': { color: 'bg-green-100 text-green-800', icon: Icons.CheckCircle },
      'Manutenção': { color: 'bg-red-100 text-red-800', icon: Icons.Clock },
      'Inativo': { color: 'bg-gray-100 text-gray-800', icon: Icons.XCircle },
      'Descartado': { color: 'bg-gray-100 text-gray-800', icon: Icons.X }
    };
    
    const config = statusConfig[status] || statusConfig['Ativo'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent />
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Icons.Database />
          </div>
          <p className="text-gray-600 text-lg">Carregando sistema...</p>
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
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <Icons.Package />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-xl font-bold text-gray-900">AssetManager Pro</h1>
                  <p className="text-xs md:text-sm text-gray-500">Sistema de Controle de Ativos</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold text-gray-900">AssetManager</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Icons.Package />
                  <span>{stats.total} ativos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icons.Building />
                  <span>{stats.totalRooms} salas</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icons.DollarSign />
                  <span>R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={exportDatabase}
                  className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Icons.Download />
                  <span className="hidden md:inline">Backup</span>
                </button>
                
                <label className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors">
                  <Icons.Upload />
                  <span className="hidden md:inline">Importar</span>
                  <input type="file" accept=".json" onChange={importDatabase} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1 mt-4 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Icons.Home, shortLabel: 'Home' },
              { id: 'assets', label: 'Ativos', icon: Icons.Package, shortLabel: 'Ativos' },
              { id: 'locations', label: 'Localizações', icon: Icons.Building, shortLabel: 'Local' },
              { id: 'reports', label: 'Relatórios', icon: Icons.BarChart3, shortLabel: 'Report' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 px-2">Dashboard</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Total de Ativos</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icons.Package />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Ativos Ativos</p>
                    <p className="text-xl md:text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icons.CheckCircle />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Em Manutenção</p>
                    <p className="text-xl md:text-3xl font-bold text-red-600">{stats.maintenance}</p>
                  </div>
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icons.Clock />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Valor Total</p>
                    <p className="text-lg md:text-3xl font-bold text-red-600">
                      R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icons.DollarSign />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-semibold mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setActiveTab('assets');
                    setShowAssetForm(true);
                  }}
                  className="flex items-center space-x-3 p-3 md:p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Icons.Plus />
                  <span className="text-red-600 font-medium">Adicionar Ativo</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('locations');
                    setShowRoomForm(true);
                  }}
                  className="flex items-center space-x-3 p-3 md:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Icons.Building />
                  <span className="text-blue-600 font-medium">Adicionar Sala</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ativos */}
        {activeTab === 'assets' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Ativos</h2>
                
                <button
                  onClick={() => setShowAssetForm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-sm"
                >
                  <Icons.Plus />
                  <span>Novo Ativo</span>
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                  <Icons.Search />
                  <input
                    type="text"
                    placeholder="Buscar por nome, código ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map(asset => (
                  <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {asset.photo ? (
                          <img src={asset.photo} alt={asset.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icons.Package />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{asset.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{asset.code}</p>
                        {asset.category && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                            {asset.category}
                          </span>
                        )}
                        
                        <div className="mt-2 flex items-center justify-between">
                          <StatusBadge status={asset.status} />
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setShowAssetDetail(asset)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Icons.Eye />
                            </button>
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                              <Icons.Edit />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredAssets.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-xl">
                    <Icons.Package />
                    <p className="mt-4 text-gray-500">Nenhum ativo encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Localizações */}
        {activeTab === 'locations' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Localizações</h2>
              <button
                onClick={() => setShowRoomForm(true)}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2"
              >
                <Icons.Plus />
                <span>Nova Sala</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {floors.map(floor => (
                <div key={floor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 md:px-6 py-4">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <Icons.Building />
                      <span className="text-sm md:text-base">{floor.name}</span>
                    </h3>
                  </div>
                  
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs md:text-sm text-gray-500">
                        {floor.rooms.length} sala(s)
                      </span>
                      <span className="text-xs md:text-sm text-gray-500">
                        {assets.filter(a => a.floorId === floor.id).length} ativo(s)
                      </span>
                    </div>
                    
                    {floor.rooms.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-8">Nenhuma sala cadastrada</p>
                    ) : (
                      <div className="space-y-3">
                        {floor.rooms.map(room => (
                          <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{room.name}</div>
                              {room.description && (
                                <div className="text-xs text-gray-500 mt-1 truncate">{room.description}</div>
                              )}
                            </div>
                            <div className="flex space-x-1 ml-2 flex-shrink-0">
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              >
                                <Icons.Edit />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Icons.Trash2 />
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
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 px-2">Relatórios</h2>
            
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-semibold mb-4">Resumo por Status</h3>
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
                        <div className="w-20 md:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 md:w-12 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================== MODAIS DE FOTO CORRIGIDOS =================== */}
      
      {/* Modal de Opções de Foto */}
      {photoState.showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Camera />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Adicionar Foto</h3>
              <p className="text-sm text-gray-600">Como você gostaria de adicionar a foto do ativo?</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleTakePhoto}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-4 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
              >
                <Icons.Camera />
                <div className="text-left">
                  <div className="font-semibold">📷 Tirar Foto</div>
                  <div className="text-sm opacity-90">Usar câmera do celular</div>
                </div>
              </button>
              
              <button
                onClick={handleSelectFromGallery}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
              >
                <Icons.Image />
                <div className="text-left">
                  <div className="font-semibold">🖼️ Galeria</div>
                  <div className="text-sm opacity-90">Escolher foto existente</div>
                </div>
              </button>
              
              <button
                onClick={closeAllPhotoModals}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-xl transition-all"
              >
                ❌ Cancelar
              </button>
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-2">
                <Icons.AlertCircle />
                <div className="text-xs text-blue-800">
                  <p className="font-medium">💡 Dica:</p>
                  <p>Permita o acesso à câmera quando solicitado. Use boa iluminação para melhor qualidade.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview da Foto */}
      {photoState.showPreview && photoState.capturedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Preview da Foto</h3>
                <button
                  onClick={closeAllPhotoModals}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icons.X />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="w-full bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                  <img 
                    src={photoState.capturedPhoto} 
                    alt="Foto capturada" 
                    className="w-full h-auto max-h-80 object-contain"
                  />
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={confirmPhoto}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Icons.Check />
                    <span className="font-semibold">✅ Usar Esta Foto</span>
                  </button>
                  
                  <button
                    onClick={retakePhoto}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
                  >
                    <Icons.RotateCcw />
                    <span>🔄 Tirar Outra Foto</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading de Processamento */}
      {photoState.isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processando Foto</h3>
            <p className="text-gray-600">Aguarde um momento...</p>
          </div>
        </div>
      )}

      {/* Erro de Foto */}
      {photoState.error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-2xl z-[9999] max-w-sm animate-pulse">
          <div className="flex items-start space-x-2">
            <Icons.AlertCircle />
            <div>
              <p className="font-semibold">❌ Erro na Foto</p>
              <p className="text-sm">{photoState.error}</p>
            </div>
            <button
              onClick={() => setPhotoState(prev => ({ ...prev, error: '' }))}
              className="ml-auto hover:bg-red-600 rounded p-1"
            >
              <Icons.X />
            </button>
          </div>
        </div>
      )}

      {/* Modal de cadastro de ativo - COM FOTO FUNCIONAL */}
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
                    closeAllPhotoModals();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Icons.X />
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
                </div>
                
                <div className="space-y-4">
                  {/* SEÇÃO DE FOTO - FUNCIONAL E CORRIGIDA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">📷 Foto do Ativo</label>
                    <div className="space-y-3">
                      {assetForm.photo ? (
                        <div className="relative">
                          <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                            <img 
                              src={assetForm.photo} 
                              alt="Foto do ativo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <button
                              type="button"
                              onClick={openPhotoOptions}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium transition-colors"
                            >
                              <Icons.Camera />
                              <span>📷 Alterar Foto</span>
                            </button>
                            <button
                              type="button"
                              onClick={removePhotoFromForm}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Icons.Trash2 />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={openPhotoOptions}
                          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all duration-200 bg-gray-50"
                        >
                          <div className="text-center p-6">
                            <Icons.Camera />
                            <p className="text-gray-600 font-medium mt-3">📷 Clique para adicionar foto</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Tire uma foto ou escolha da galeria
                            </p>
                            <div className="mt-3 inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <Icons.Camera />
                              <span className="ml-1">Recomendado</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
                      onChange={(e) => setAssetForm({...assetForm, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: Dell Brasil"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Série</label>
                    <input
                      type="text"
                      value={assetForm.serialNumber}
                      onChange={(e) => setAssetForm({...assetForm, serialNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: DL24001"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Descrição detalhada do ativo..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                    resetAssetForm();
                    closeAllPhotoModals();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAsset}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {editingAsset ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cadastro de sala */}
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
                    setRoomForm({ name: '', description: '', floorId: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Icons.X />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Sala *</label>
                  <input
                    type="text"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: Sala de Reuniões A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Andar *</label>
                  <select
                    value={roomForm.floorId}
                    onChange={(e) => setRoomForm({...roomForm, floorId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Selecione um andar</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Descrição da sala..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setEditingRoom(null);
                    setRoomForm({ name: '', description: '', floorId: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRoom}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  {editingRoom ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
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
                  <Icons.X />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <p className="text-base text-gray-900 font-semibold">
                      {showAssetDetail.value ? 
                        `R$ ${parseFloat(showAssetDetail.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                        'Não informado'
                      }
                    </p>
                  </div>
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
                            <Icons.Camera />
                            <span className="text-gray-500 mt-2 block">Nenhuma foto disponível</span>
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
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowAssetDetail(null);
                    handleEditAsset(showAssetDetail);
                  }}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Editar
                </button>
                <button
                  onClick={() => setShowAssetDetail(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS adicional para scroll suave */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AssetControlSystem;
