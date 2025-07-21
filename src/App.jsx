// ============= APP.JSX ATUALIZADO COM IMPORTAÇÃO EXCEL =============
// Adicione estas importações no início do arquivo:

import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import AuthComponent from './components/AuthComponent';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import database from './config/database';
import * as XLSX from 'sheetjs-style'; // <- NOVA IMPORTAÇÃO

// ... (resto dos imports e configurações já existentes)

// =================== NOVOS ÍCONES ===================
// Adicione estes ícones ao objeto Icons existente:
const Icons = {
  // ... (todos os ícones existentes)
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

// =================== COMPONENTE DE IMPORTAÇÃO EXCEL ===================
const ExcelImportModal = ({ isOpen, onClose, onImport, isLoading }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'importing'
  const [importStats, setImportStats] = useState(null);

  const fileInputRef = useRef(null);

  // Template Excel para download
  const downloadTemplate = () => {
    const template = [
      {
        modelo: 'Dell Latitude 5330',
        service_tag: 'ABC123D',
        processador: 'Intel Core i7 vPro 12ª Geração',
        memoria_ram: '16GB DDR4',
        armazenamento: '256GB SSD',
        placa_video: 'Intel Iris Xe Graphics',
        tamanho_tela: '13.3"',
        cor: 'Preto',
        fim_garantia: '2025-12-31',
        condicao: 'Excelente',
        status: 'Disponível',
        data_compra: '2023-01-15',
        preco_compra: '4500.00',
        usuario_responsavel: 'João Silva',
        observacoes: 'Laptop para desenvolvimento'
      },
      {
        modelo: 'Dell Latitude 7420',
        service_tag: 'XYZ789E',
        processador: 'Intel Core i5-1145G7',
        memoria_ram: '8GB DDR4',
        armazenamento: '512GB SSD',
        placa_video: 'Intel Iris Xe Graphics',
        tamanho_tela: '14"',
        cor: 'Cinza',
        fim_garantia: '2026-06-30',
        condicao: 'Bom',
        status: 'Em Uso',
        data_compra: '2023-03-20',
        preco_compra: '3800.00',
        usuario_responsavel: 'Maria Santos',
        observacoes: 'Laptop para vendas'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Definir larguras das colunas
    const colWidths = [
      { wch: 25 }, // modelo
      { wch: 15 }, // service_tag
      { wch: 30 }, // processador
      { wch: 15 }, // memoria_ram
      { wch: 15 }, // armazenamento
      { wch: 25 }, // placa_video
      { wch: 12 }, // tamanho_tela
      { wch: 10 }, // cor
      { wch: 15 }, // fim_garantia
      { wch: 12 }, // condicao
      { wch: 12 }, // status
      { wch: 15 }, // data_compra
      { wch: 12 }, // preco_compra
      { wch: 20 }, // usuario_responsavel
      { wch: 30 }  // observacoes
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, 'template_laptops_dell.xlsx');
  };

  // Processar arquivo Excel
  const processFile = async (selectedFile) => {
    if (!selectedFile) return;

    try {
      setErrors([]);
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('📊 Dados do Excel processados:', jsonData.length, 'linhas');

      if (jsonData.length === 0) {
        setErrors(['Arquivo Excel está vazio ou não possui dados válidos']);
        return;
      }

      // Validar e normalizar dados
      const processedData = [];
      const validationErrors = [];

      jsonData.forEach((row, index) => {
        const rowNumber = index + 2; // Linha no Excel (header = 1, dados começam em 2)
        const laptop = normalizeExcelRow(row, rowNumber);
        
        const rowErrors = validateLaptopRow(laptop, rowNumber);
        if (rowErrors.length > 0) {
          validationErrors.push(...rowErrors);
        } else {
          processedData.push(laptop);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setPreview([]);
      } else {
        setPreview(processedData);
        setErrors([]);
        setStep('preview');
      }

    } catch (error) {
      console.error('❌ Erro ao processar Excel:', error);
      setErrors(['Erro ao processar arquivo Excel. Verifique se o formato está correto.']);
    }
  };

  // Normalizar dados do Excel
  const normalizeExcelRow = (row, rowNumber) => {
    // Mapear possíveis nomes de colunas
    const fieldMappings = {
      model: ['modelo', 'model', 'modelo_dell'],
      service_tag: ['service_tag', 'servicetag', 'tag', 'service tag'],
      processor: ['processador', 'processor', 'cpu'],
      ram: ['memoria_ram', 'ram', 'memoria', 'memory'],
      storage: ['armazenamento', 'storage', 'hd', 'ssd'],
      graphics: ['placa_video', 'graphics', 'gpu', 'video'],
      screen_size: ['tamanho_tela', 'screen_size', 'tela', 'display'],
      color: ['cor', 'color'],
      warranty_end: ['fim_garantia', 'warranty_end', 'garantia'],
      condition: ['condicao', 'condition', 'estado'],
      status: ['status', 'estado'],
      purchase_date: ['data_compra', 'purchase_date', 'compra'],
      purchase_price: ['preco_compra', 'purchase_price', 'preco', 'valor'],
      assigned_user: ['usuario_responsavel', 'assigned_user', 'usuario', 'responsavel'],
      notes: ['observacoes', 'notes', 'obs', 'observacao']
    };

    const normalized = { excel_row: rowNumber };

    // Normalizar chaves do Excel (remover acentos, espaços, etc.)
    const normalizeKey = (key) => {
      return key.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    };

    const rowKeys = Object.keys(row).map(k => normalizeKey(k));
    const originalKeys = Object.keys(row);

    // Mapear cada campo
    Object.entries(fieldMappings).forEach(([field, possibleNames]) => {
      for (const possibleName of possibleNames) {
        const normalizedPossible = normalizeKey(possibleName);
        const keyIndex = rowKeys.findIndex(k => k === normalizedPossible);
        
        if (keyIndex !== -1) {
          const originalKey = originalKeys[keyIndex];
          normalized[field] = row[originalKey];
          break;
        }
      }
    });

    return normalized;
  };

  // Validar linha do laptop
  const validateLaptopRow = (laptop, rowNumber) => {
    const errors = [];

    // Campos obrigatórios
    if (!laptop.model || !laptop.model.toString().trim()) {
      errors.push(`Linha ${rowNumber}: Campo 'modelo' é obrigatório`);
    }

    if (!laptop.service_tag || !laptop.service_tag.toString().trim()) {
      errors.push(`Linha ${rowNumber}: Campo 'service_tag' é obrigatório`);
    }

    // Validar condição
    const validConditions = ['Excelente', 'Bom', 'Regular', 'Ruim'];
    if (laptop.condition && !validConditions.includes(laptop.condition)) {
      errors.push(`Linha ${rowNumber}: Condição deve ser: ${validConditions.join(', ')}`);
    }

    // Validar status
    const validStatuses = ['Disponível', 'Em Uso', 'Manutenção', 'Descartado'];
    if (laptop.status && !validStatuses.includes(laptop.status)) {
      errors.push(`Linha ${rowNumber}: Status deve ser: ${validStatuses.join(', ')}`);
    }

    // Validar datas
    if (laptop.warranty_end && !isValidDate(laptop.warranty_end)) {
      errors.push(`Linha ${rowNumber}: Data de fim de garantia inválida (use formato AAAA-MM-DD)`);
    }

    if (laptop.purchase_date && !isValidDate(laptop.purchase_date)) {
      errors.push(`Linha ${rowNumber}: Data de compra inválida (use formato AAAA-MM-DD)`);
    }

    // Validar preço
    if (laptop.purchase_price && isNaN(parseFloat(laptop.purchase_price))) {
      errors.push(`Linha ${rowNumber}: Preço de compra deve ser um número válido`);
    }

    return errors;
  };

  // Validar data
  const isValidDate = (dateString) => {
    if (!dateString) return true; // Opcional
    
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.toString().length >= 10;
  };

  // Confirmar importação
  const handleImport = async () => {
    if (preview.length === 0) return;

    setStep('importing');
    
    try {
      const result = await onImport(preview);
      setImportStats(result);
      
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      console.error('❌ Erro na importação:', error);
      setErrors(['Erro durante a importação: ' + error.message]);
      setStep('preview');
    }
  };

  // Fechar modal
  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setStep('upload');
    setImportStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Icons.Upload className="mr-2 text-green-600" />
              Importar Laptops via Excel
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 'upload' && 'Selecione um arquivo Excel com os dados dos laptops'}
              {step === 'preview' && `${preview.length} laptops prontos para importação`}
              {step === 'importing' && 'Importando laptops...'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
          >
            <Icons.X />
          </button>
        </div>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-green-400 transition-all">
                <Icons.Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecione o arquivo Excel
                </h3>
                <p className="text-gray-600 mb-6">
                  Formatos aceitos: .xlsx, .xls
                </p>
                
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all cursor-pointer"
                  >
                    <Icons.Plus className="mr-2" />
                    Selecionar Arquivo
                  </label>
                  
                  <div className="text-sm text-gray-500">ou</div>
                  
                  <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
                  >
                    <Icons.Download className="mr-2" />
                    Baixar Template Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Instruções:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Baixe o template Excel e preencha com os dados dos laptops</li>
                <li>• Campos obrigatórios: modelo e service_tag</li>
                <li>• Use o formato AAAA-MM-DD para datas (ex: 2024-12-31)</li>
                <li>• Condições válidas: Excelente, Bom, Regular, Ruim</li>
                <li>• Status válidos: Disponível, Em Uso, Manutenção, Descartado</li>
              </ul>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">❌ Erros encontrados:</h4>
                <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">✅ Validação concluída!</h4>
              <p className="text-sm text-green-800">
                {preview.length} laptops serão importados. Revise os dados abaixo:
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Modelo</th>
                    <th className="text-left py-3 px-4 font-semibold">Service Tag</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Condição</th>
                    <th className="text-left py-3 px-4 font-semibold">Usuário</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((laptop, index) => (
                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{laptop.model}</td>
                      <td className="py-3 px-4">{laptop.service_tag}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {laptop.status || 'Disponível'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {laptop.condition || 'Excelente'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{laptop.assigned_user || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setStep('upload')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Importando...' : `Importar ${preview.length} Laptops`}
              </button>
            </div>
          </div>
        )}

        {/* Step: Importing */}
        {step === 'importing' && (
          <div className="space-y-6 text-center py-8">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-bold text-gray-900">Importando Laptops...</h3>
            <p className="text-gray-600">
              Por favor, aguarde enquanto os laptops são cadastrados no sistema.
            </p>
            
            {importStats && (
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200 text-left max-w-md mx-auto">
                <h4 className="font-semibold text-green-900 mb-3">📊 Resultado da Importação:</h4>
                <div className="space-y-2 text-sm text-green-800">
                  <div>✅ Importados: {importStats.success || 0}</div>
                  {importStats.errors > 0 && (
                    <div>❌ Erros: {importStats.errors}</div>
                  )}
                  <div>📋 Total processados: {importStats.total || 0}</div>
                </div>
                
                {importStats.errorDetails && importStats.errorDetails.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h5 className="font-medium text-green-900 mb-2">Detalhes dos erros:</h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {importStats.errorDetails.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-xs text-green-700">
                          Linha {error.row} ({error.service_tag}): {error.error}
                        </div>
                      ))}
                      {importStats.errorDetails.length > 5 && (
                        <div className="text-xs text-green-600">
                          ... e mais {importStats.errorDetails.length - 5} erros
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// =================== INTEGRAÇÃO NO COMPONENTE PRINCIPAL ===================
// Adicione no componente DellLaptopControlSystem:

const DellLaptopControlSystem = () => {
  const { user, logout, connectionStatus } = useAuth();
  
  // Estados existentes...
  // Adicionar este novo estado:
  const [showExcelImport, setShowExcelImport] = useState(false);

  // Função para importação em lote
  const handleExcelImport = async (laptopsData) => {
    console.log('🔄 Iniciando importação em lote de', laptopsData.length, 'laptops');
    
    const results = {
      success: 0,
      errors: 0,
      total: laptopsData.length,
      errorDetails: []
    };

    for (let i = 0; i < laptopsData.length; i++) {
      const laptop = laptopsData[i];
      
      try {
        // Preparar dados do laptop
        const laptopData = {
          model: laptop.model?.toString().trim(),
          service_tag: laptop.service_tag?.toString().trim(),
          processor: laptop.processor?.toString().trim() || null,
          ram: laptop.ram?.toString().trim() || null,
          storage: laptop.storage?.toString().trim() || null,
          graphics: laptop.graphics?.toString().trim() || null,
          screen_size: laptop.screen_size?.toString().trim() || null,
          color: laptop.color?.toString().trim() || null,
          warranty_end: laptop.warranty_end ? new Date(laptop.warranty_end).toISOString().split('T')[0] : null,
          condition: laptop.condition || 'Excelente',
          status: laptop.status || 'Disponível',
          purchase_date: laptop.purchase_date ? new Date(laptop.purchase_date).toISOString().split('T')[0] : null,
          purchase_price: laptop.purchase_price ? parseFloat(laptop.purchase_price) : null,
          assigned_user: laptop.assigned_user?.toString().trim() || null,
          notes: laptop.notes?.toString().trim() || null,
          condition_score: laptop.condition === 'Excelente' ? 100 : laptop.condition === 'Bom' ? 85 : laptop.condition === 'Regular' ? 65 : 45
        };

        // Criar laptop no banco
        const result = await dataService.laptops.create(laptopData, user.id);
        
        if (result.success) {
          results.success++;
          console.log(`✅ Laptop ${i + 1}/${laptopsData.length} importado:`, laptop.service_tag);
        } else {
          results.errors++;
          results.errorDetails.push({
            row: laptop.excel_row || i + 1,
            service_tag: laptop.service_tag,
            error: result.error
          });
          console.log(`❌ Erro no laptop ${i + 1}:`, result.error);
        }
        
      } catch (error) {
        results.errors++;
        results.errorDetails.push({
          row: laptop.excel_row || i + 1,
          service_tag: laptop.service_tag,
          error: error.message
        });
        console.error(`❌ Erro no laptop ${i + 1}:`, error);
      }
      
      // Pequena pausa para não sobrecarregar o banco
      if (i > 0 && i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('✅ Importação concluída:', results);
    await loadData(); // Recarregar dados após importação
    return results;
  };

  // No JSX da aba 'laptops', substitua o botão "Novo Laptop" por esta seção:
  /*
  SUBSTITUIR ESTA SEÇÃO:
  <button
    onClick={() => {
      resetLaptopForm();
      setShowLaptopForm(true);
    }}
    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
  >
    <Icons.Plus />
    <span>Novo Laptop</span>
  </button>

  POR ESTA NOVA SEÇÃO:
  */
  <div className="flex flex-col sm:flex-row gap-3">
    <button
      onClick={() => {
        resetLaptopForm();
        setShowLaptopForm(true);
      }}
      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      <Icons.Plus />
      <span>Novo Laptop</span>
    </button>
    <button
      onClick={() => setShowExcelImport(true)}
      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      <Icons.Upload />
      <span>Importar Excel</span>
    </button>
  </div>

  // E adicionar o modal no final do JSX, ANTES do "Loading Overlay":
  
  {/* Modal de Importação Excel */}
  <ExcelImportModal
    isOpen={showExcelImport}
    onClose={() => setShowExcelImport(false)}
    onImport={handleExcelImport}
    isLoading={isLoading}
  />

  // =================== INSTRUÇÕES DE INSTALAÇÃO ===================
  /*
  PASSO A PASSO PARA IMPLEMENTAR:

  1. Instalar dependência SheetJS:
     npm install sheetjs-style

  2. Adicionar importação no início do App.jsx:
     import * as XLSX from 'sheetjs-style';

  3. Adicionar os novos ícones Upload e Download ao objeto Icons

  4. Adicionar o componente ExcelImportModal completo

  5. Adicionar o estado showExcelImport no DellLaptopControlSystem

  6. Adicionar a função handleExcelImport

  7. Atualizar a seção de botões na aba laptops

  8. Adicionar o modal ExcelImportModal no JSX

  FUNCIONALIDADES INCLUÍDAS:
  ✅ Upload de arquivo Excel (.xlsx, .xls)
  ✅ Template Excel para download
  ✅ Validação completa dos dados
  ✅ Preview dos dados antes da importação
  ✅ Normalização de nomes de colunas (português/inglês)
  ✅ Importação em lote com controle de erros
  ✅ Feedback em tempo real do progresso
  ✅ Tratamento de erros individuais por linha
  ✅ Recarregamento automático dos dados após importação
  ✅ Interface responsiva e intuitiva

  FORMATO DO EXCEL ESPERADO:
  - modelo (obrigatório)
  - service_tag (obrigatório)  
  - processador
  - memoria_ram
  - armazenamento
  - placa_video
  - tamanho_tela
  - cor
  - fim_garantia (formato: AAAA-MM-DD)
  - condicao (Excelente|Bom|Regular|Ruim)
  - status (Disponível|Em Uso|Manutenção|Descartado)
  - data_compra (formato: AAAA-MM-DD)
  - preco_compra (número)
  - usuario_responsavel
  - observacoes
  */

  return (
    // Resto do componente permanece igual...
  );
};
