{/* Modal de configuração de etiquetas */}
      {showLabelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold">Configurar Etiquetas</h3>
                <button
                  onClick={() => setShowLabelModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Ativos Selecionados ({selectedAssets.length})</h4>
                    <div className="max-h-24 md:max-h-32 overflow-y-auto border rounded-lg p-3">
                      {assets.filter(a => selectedAssets.includes(a.id)).map(asset => (
                        <div key={asset.id} className="flex items-center justify-between py-1">
                          <span className="text-sm truncate">{asset.code} - {asset.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template da Etiqueta</label>
                    <select
                      value={labelSettings.template}
                      onChange={(e) => setLabelSettings({...labelSettings, template: e.target.value})}
                      className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {Object.entries(labelTemplates).map(([key, template]) => (
                        <option key={key} value={key}>
                          {template.name} ({template.width} x {template.height})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {labelTemplates[labelSettings.template]?.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Opções</h4>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelSettings.includeQR}
                        onChange={(e) => setLabelSettings({...labelSettings, includeQR: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Incluir QR Code</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelSettings.includeLocation}
                        onChange={(e) => setLabelSettings({...labelSettings, includeLocation: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Incluir Localização</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelSettings.includeDate}
                        onChange={(e) => setLabelSettings({...labelSettings, includeDate: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Incluir Data</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Preview da Etiqueta</h4>
                  <div className="border-2 border-dashed border-gray-300 p-4 md:p-6 rounded-lg bg-gray-50 flex items-center justify-center min-h-[200px]">
                    {selectedAssets.length > 0 && (
                      <LabelComponent
                        label={{
                          code: assets.find(a => a.id === selectedAssets[0])?.code || 'SAMPLE',
                          name: assets.find(a => a.id === selectedAssets[0])?.name || 'Sample Asset',
                          location: 'Sample Location',
                          qrCode: generateQRCode('SAMPLE'),
                          date: new Date().toLocaleDateString('pt-BR')
                        }}
                        template={labelSettings.template}
                      />
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Dimensões:</strong> {labelTemplates[labelSettings.template]?.width} x {labelTemplates[labelSettings.template]?.height}</p>
                    <p><strong>Recomendação:</strong> Use papel adesivo ou etiquetas próprias para impressão</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 md:mt-8">
                <button
                  onClick={() => setShowLabelModal(false)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    generateLabels();
                    setShowLabelModal(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Gerar Etiquetas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de preview das etiquetas - Mobile optimized */}
      {showLabelPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
                <h3 className="text-lg md:text-xl font-semibold">Preview das Etiquetas ({generatedLabels.length})</h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={downloadLabelsAsPDF}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Salvar PDF</span>
                  </button>
                  <button
                    onClick={printLabels}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir</span>
                  </button>
                  <button
                    onClick={() => setShowLabelPreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg self-end sm:self-auto"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <QrCode className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">Instruções para Impressão</h4>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• Configure sua impressora para papel A4 ou papel de etiquetas</li>
                      <li>• Ajuste as margens para "Mínima" ou "Sem margem"</li>
                      <li>• Use qualidade de impressão "Alta" para melhor legibilidade do QR Code</li>
                      <li>• Teste com uma página antes de imprimir todas as etiquetas</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div 
                ref={printRef}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 p-4 bg-gray-50 rounded-lg"
              >
                {generatedLabels.map((label, index) => (
                  <div key={index} className="flex justify-center">
                    <LabelComponent label={label} template={label.template} />
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
                <div className="text-sm text-gray-600">
                  Total: {generatedLabels.length} etiqueta(s) • Template: {labelTemplates[labelSettings.template]?.name}
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setShowLabelPreview(false);
                      setShowLabelModal(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      setShowLabelPreview(false);
                      setSelectedAssets([]);
                      setGeneratedLabels([]);
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de importação Excel - Mobile optimized */}
      {showExcelImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold">Importar Ativos via Excel</h3>
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
                    <FileText className="w-12 h-12 md:w-16 md:h-16 text-red-600 mx-auto mb-4" />
                    <h4 className="text-base md:text-lg font-semibold mb-2">Importar seus ativos em massa</h4>
                    <p className="text-sm md:text-base text-gray-600">
                      Faça upload de um arquivo Excel (.xlsx ou .csv) com os dados dos seus ativos
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={downloadExcelTemplate}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Baixar Template</span>
                    </button>
                    
                    <label className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 cursor-pointer">
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
                  <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <h4 className="text-base md:text-lg font-semibold mb-2">Processando arquivo...</h4>
                  <p className="text-sm md:text-base text-gray-600 mb-4">Importando seus ativos, aguarde...</p>
                  
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

      {/* Modal de cadastro de ativo - Mobile optimized */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold">
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Ativo *</label>
                    <input
                      type="text"
                      value={assetForm.name}
                      onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="Ex: Notebook Dell Inspiron"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                    <input
                      type="text"
                      value={assetForm.code}
                      onChange={(e) => setAssetForm({...assetForm, code: e.target.value})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="Ex: NB001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={assetForm.category}
                      onChange={(e) => setAssetForm({...assetForm, category: e.target.value})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="Ex: 2500.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
                    <input
                      type="text"
                      value={assetForm.supplier}
                      onChange={(e) => setAssetForm({...assetForm, supplier: e.target.value})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="Ex: Dell Brasil"
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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  placeholder="Descrição detalhada do ativo..."
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 md:mt-8">
                <button
                  onClick={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                    resetAssetForm();
                  }}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAsset}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  {editingAsset ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cadastro de sala - Mobile optimized */}
      {showRoomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[95vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold">
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
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Ex: Sala de Reuniões A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Andar *</label>
                  <select
                    value={roomForm.floorId}
                    onChange={(e) => setRoomForm({...roomForm, floorId: e.target.value})}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Descrição da sala..."
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setEditingRoom(null);
                    setRoomForm({ name: '', description: '', floorId: '', capacity: '', area: '' });
                  }}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRoom}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  {editingRoom ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outros modais mantidos com otimizações similares... */}
      {/* Modal para opções de câmera */}
      {showCameraOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-4 md:p-6 max-w-sm w-full mx-4">
            <h4 className="text-base md:text-lg font-semibold mb-4">Como deseja adicionar a foto?</h4>
            <div className="space-y-3">
              <button
                onClick={handleCameraCapture}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Tirar Foto (Câmera)</span>
              </button>
              <button
                onClick={handleGallerySelect}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Escolher da Galeria</span>
              </button>
              <button
                onClick={() => setShowCameraOptions(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes do ativo - Mobile optimized */}
      {showAssetDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold">Detalhes do Ativo</h3>
                <button
                  onClick={() => setShowAssetDetail(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <p className="text-sm md:text-base text-gray-900">{showAssetDetail.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <p className="text-sm md:text-base text-gray-900 font-mono">{showAssetDetail.code}</p>
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
                    <p className="text-sm md:text-base text-gray-900">
                      {getFloorName(showAssetDetail.floorId)} - {getRoomName(showAssetDetail.roomId)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <p className="text-sm md:text-base text-gray-900 font-semibold">
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
                    <div className="w-full h-48 md:h-64 bg-gray-100 rounded-lg overflow-hidden border">
                      {showAssetDetail.photo ? (
                        <img 
                          src={showAssetDetail.photo} 
                          alt={showAssetDetail.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-2" />
                            <span className="text-gray-500 text-sm">Nenhuma foto disponível</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {showAssetDetail.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm md:text-base text-gray-900">{showAssetDetail.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 md:mt-8">
                <button
                  onClick={() => {
                    setSelectedAssets([showAssetDetail.id]);
                    setShowAssetDetail(null);
                    setShowLabelModal(true);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>Gerar Etiqueta</span>
                </button>
                <button
                  onClick={() => {
                    setShowAssetDetail(null);
                    handleEditAsset(showAssetDetail);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Editar
                </button>
                <button
                  onClick={() => setShowAssetDetail(null)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input hidden para arquivo */}
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoCapture}
        ref={fileInputRef}
        className="hidden"
      />

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
  );import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Plus, Edit, Trash2, Building, Package, Search, Eye, Save, Database,
  BarChart3, MapPin, Calendar, DollarSign, Filter, X, Home, Settings,
  TrendingUp, AlertCircle, CheckCircle, Clock, XCircle, Download, Upload,
  Grid, List, SortAsc, SortDesc, RefreshCw, Users, Shield, Bell, FileText,
  Printer, Tag, QrCode, Copy, Check
} from 'lucide-react';

const AssetControlSystem = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [floors, setFloors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showLabelPreview, setShowLabelPreview] = useState(false);
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
  
  // Estados para etiquetas
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [labelSettings, setLabelSettings] = useState({
    template: 'standard',
    includeQR: true,
    includeLocation: true,
    includeDate: false,
    fontSize: 'medium',
    labelSize: '50x30' // mm
  });
  const [generatedLabels, setGeneratedLabels] = useState([]);
  
  // Refs
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const printRef = useRef(null);

  // Configurações
  const STORAGE_KEYS = {
    FLOORS: 'asset_system_floors',
    ASSETS: 'asset_system_assets',
    SETTINGS: 'asset_system_settings'
  };

  const categories = [
    'Informática', 'Móveis', 'Equipamentos', 'Veículos', 
    'Eletroeletrônicos', 'Ferramentas', 'Segurança', 'Outros'
  ];

  const statuses = ['Ativo', 'Inativo', 'Manutenção', 'Descartado'];

  // Templates de etiquetas
  const labelTemplates = {
    standard: {
      name: 'Padrão',
      width: '50mm',
      height: '30mm',
      description: 'Template padrão com código e nome'
    },
    compact: {
      name: 'Compacto',
      width: '40mm',
      height: '20mm',
      description: 'Template compacto apenas com código'
    },
    detailed: {
      name: 'Detalhado',
      width: '70mm',
      height: '40mm',
      description: 'Template com todas as informações'
    },
    qrOnly: {
      name: 'Apenas QR Code',
      width: '25mm',
      height: '25mm',
      description: 'Apenas QR Code'
    }
  };

  // Estados dos formulários
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

  // Efeitos
  useEffect(() => {
    loadDataFromDatabase();
  }, []);

  // Funções do banco de dados
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

  // Funções para etiquetas
  const generateQRCode = (text) => {
    // Simulação de QR Code usando um placeholder
    const encodedText = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodedText}`;
  };

  const handleSelectAsset = (assetId, checked) => {
    if (checked) {
      setSelectedAssets([...selectedAssets, assetId]);
    } else {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    }
  };

  const handleSelectAllAssets = (checked) => {
    if (checked) {
      setSelectedAssets(filteredAssets.map(asset => asset.id));
    } else {
      setSelectedAssets([]);
    }
  };

  const generateLabels = () => {
    const assetsToLabel = assets.filter(asset => selectedAssets.includes(asset.id));
    
    const labels = assetsToLabel.map(asset => ({
      id: asset.id,
      code: asset.code,
      name: asset.name,
      category: asset.category,
      location: `${getFloorName(asset.floorId)} - ${getRoomName(asset.roomId)}`,
      qrCode: generateQRCode(`${asset.code} - ${asset.name}`),
      date: new Date().toLocaleDateString('pt-BR'),
      template: labelSettings.template
    }));

    setGeneratedLabels(labels);
    setShowLabelPreview(true);
  };

  const printLabels = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiquetas de Ativos</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif; 
                background: white;
              }
              .print-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                page-break-inside: avoid;
              }
              .label {
                border: 2px solid #000;
                padding: 8px;
                margin: 5px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                page-break-inside: avoid;
                background: white;
              }
              .label.standard { width: 50mm; height: 30mm; }
              .label.compact { width: 40mm; height: 20mm; }
              .label.detailed { width: 70mm; height: 40mm; }
              .label.qrOnly { width: 25mm; height: 25mm; }
              .label-code { 
                font-weight: bold; 
                font-size: 14px; 
                margin-bottom: 4px; 
              }
              .label-name { 
                font-size: 10px; 
                margin-bottom: 2px; 
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 100%;
              }
              .label-info { 
                font-size: 8px; 
                color: #666; 
              }
              .qr-code { 
                width: 20mm; 
                height: 20mm; 
                margin: 2px; 
              }
              @media print {
                body { margin: 0; }
                .label { 
                  border: 1px solid #000; 
                  margin: 2px;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printContent}
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const downloadLabelsAsPDF = () => {
    // Função para download como PDF (usando window.print com CSS específico)
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Etiquetas de Ativos - PDF</title>
          <style>
            @page { 
              size: A4; 
              margin: 10mm; 
            }
            body { 
              margin: 0; 
              padding: 0; 
              font-family: Arial, sans-serif; 
            }
            .print-container {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 5mm;
              page-break-inside: avoid;
            }
            .label {
              border: 1px solid #000;
              padding: 2mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              page-break-inside: avoid;
              background: white;
            }
            .label.standard { width: 50mm; height: 30mm; }
            .label.compact { width: 40mm; height: 20mm; }
            .label.detailed { width: 70mm; height: 40mm; }
            .label.qrOnly { width: 25mm; height: 25mm; }
            .label-code { 
              font-weight: bold; 
              font-size: 12pt; 
              margin-bottom: 1mm; 
            }
            .label-name { 
              font-size: 8pt; 
              margin-bottom: 1mm; 
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 100%;
            }
            .label-info { 
              font-size: 6pt; 
              color: #666; 
            }
            .qr-code { 
              width: 15mm; 
              height: 15mm; 
              margin: 1mm; 
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Funções de importação Excel
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
        }
      ];

      setImportProgress(60);
      const processedAssets = [];
      let successCount = 0;

      for (let i = 0; i < exampleData.length; i++) {
        const row = exampleData[i];
        setImportProgress(60 + (i / exampleData.length) * 30);

        if (row['Nome'] && row['Código']) {
          const floor = floors.find(f => f.name.includes('5º'));
          if (floor && floor.rooms.length > 0) {
            const newAsset = {
              id: Date.now() + i,
              name: row['Nome'].trim(),
              code: row['Código'].trim(),
              category: row['Categoria'] || '',
              description: row['Descrição'] || '',
              value: row['Valor'] || '',
              status: row['Status'] || 'Ativo',
              floorId: floor.id,
              roomId: floor.rooms[0].id,
              supplier: row['Fornecedor'] || '',
              warranty: row['Garantia'] || '',
              serialNumber: row['Número de Série'] || '',
              photo: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            processedAssets.push(newAsset);
            successCount++;
          }
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
        alert(`Importação concluída! ${successCount} ativos importados.`);
      }, 1000);

    } catch (error) {
      setIsImporting(false);
      setImportProgress(0);
      alert('Erro ao processar arquivo.');
    }

    event.target.value = '';
  };

  const downloadExcelTemplate = () => {
    const csvContent = [
      'Nome,Código,Categoria,Descrição,Valor,Status,Andar,Sala,Fornecedor,Garantia,Número de Série',
      'Monitor Dell 24",MON001,Informática,Monitor Dell 24 polegadas,800.00,Ativo,5º Andar,Sala 501,Dell Brasil,36,DL24001'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_ativos.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Funções de backup
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

  // Funções para foto
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

  // Funções para salas
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

  // Funções para ativos
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

  // Filtros
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = !filterFloor || asset.floorId === parseInt(filterFloor);
    const matchesRoom = !filterRoom || asset.roomId === parseInt(filterRoom);
    const matchesStatus = !filterStatus || asset.status === filterStatus;
    const matchesCategory = !filterCategory || asset.category === filterCategory;
    
    return matchesSearch && matchesFloor && matchesRoom && matchesStatus && matchesCategory;
  });

  // Estatísticas
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

  // Componente Status Badge
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

  // Componente Label Preview
  const LabelComponent = ({ label, template }) => {
    const templateClass = template || 'standard';
    
    return (
      <div className={`label ${templateClass} border-2 border-black p-2 bg-white flex flex-col items-center justify-center text-center`}>
        {templateClass === 'qrOnly' ? (
          <img src={label.qrCode} alt="QR Code" className="qr-code w-full h-full object-contain" />
        ) : (
          <>
            <div className="label-code font-bold text-sm mb-1">{label.code}</div>
            {templateClass !== 'compact' && (
              <div className="label-name text-xs mb-1 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {label.name}
              </div>
            )}
            {labelSettings.includeQR && templateClass !== 'compact' && (
              <img src={label.qrCode} alt="QR Code" className="qr-code w-8 h-8 mb-1" />
            )}
            {labelSettings.includeLocation && templateClass === 'detailed' && (
              <div className="label-info text-xs text-gray-600">{label.location}</div>
            )}
            {labelSettings.includeDate && templateClass === 'detailed' && (
              <div className="label-info text-xs text-gray-600">{label.date}</div>
            )}
          </>
        )}
      </div>
    );
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Database className="w-8 h-8 text-white" />
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
                  <Package className="w-4 h-4 md:w-6 md:h-6 text-white" />
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
              {/* Stats mobile - dropdown */}
              <div className="sm:hidden relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Bell className="w-4 h-4 text-gray-600" />
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border p-4 w-64 z-50">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total de Ativos</span>
                        <span className="font-semibold">{stats.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Salas</span>
                        <span className="font-semibold">{stats.totalRooms}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Valor Total</span>
                        <span className="font-semibold">R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Stats desktop */}
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
              
              {/* Action buttons */}
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={exportDatabase}
                  className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Backup</span>
                </button>
                
                <label className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="hidden md:inline">Importar</span>
                  <input type="file" accept=".json" onChange={importDatabase} className="hidden" />
                </label>
              </div>
              
              {/* Mobile menu button */}
              <div className="sm:hidden">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 rounded-lg bg-red-600 text-white"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Navigation tabs */}
          <div className="flex space-x-1 mt-4 overflow-x-auto scrollbar-hide">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home, shortLabel: 'Home' },
              { id: 'assets', label: 'Ativos', icon: Package, shortLabel: 'Ativos' },
              { id: 'locations', label: 'Localizações', icon: Building, shortLabel: 'Local' },
              { id: 'reports', label: 'Relatórios', icon: BarChart3, shortLabel: 'Report' }
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
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
          
          {/* Mobile action menu */}
          {showFilters && (
            <div className="sm:hidden mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
              <button
                onClick={() => {
                  exportDatabase();
                  setShowFilters(false);
                }}
                className="w-full flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Fazer Backup</span>
              </button>
              
              <label className="w-full flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Importar Dados</span>
                <input type="file" accept=".json" onChange={importDatabase} className="hidden" />
              </label>
            </div>
          )}
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
                    <Package className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
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
                    <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
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
                    <Clock className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
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
                    <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
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
                  <Plus className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-medium">Adicionar Ativo</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('assets');
                    setShowExcelImport(true);
                  }}
                  className="flex items-center space-x-3 p-3 md:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Importar Excel</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('locations');
                    setShowRoomForm(true);
                  }}
                  className="flex items-center space-x-3 p-3 md:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Building className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">Adicionar Sala</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center space-x-3 p-3 md:p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
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
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Ativos</h2>
                
                {/* Mobile action buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  {selectedAssets.length > 0 && (
                    <button
                      onClick={() => setShowLabelModal(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-sm"
                    >
                      <Tag className="w-4 h-4" />
                      <span>Gerar Etiquetas ({selectedAssets.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowExcelImport(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Import Excel</span>
                  </button>
                  <button
                    onClick={() => setShowAssetForm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Ativo</span>
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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

            {/* Assets Grid/List - Mobile optimized */}
            <div className="space-y-4">
              {/* Mobile card view */}
              <div className="block md:hidden space-y-3">
                {filteredAssets.map(asset => (
                  <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset.id)}
                        onChange={(e) => handleSelectAsset(asset.id, e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 mt-1"
                      />
                      
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {asset.photo ? (
                          <img src={asset.photo} alt={asset.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{asset.name}</h3>
                            <p className="text-xs text-gray-500 font-mono">{asset.code}</p>
                            {asset.category && (
                              <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                {asset.category}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() => setShowAssetDetail(asset)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAssets([asset.id]);
                                setShowLabelModal(true);
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                            >
                              <Tag className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <StatusBadge status={asset.status} />
                          <span className="text-xs text-gray-500">
                            {getFloorName(asset.floorId)} - {getRoomName(asset.roomId)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredAssets.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-500">Nenhum ativo encontrado</p>
                  </div>
                )}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          <input
                            type="checkbox"
                            checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                            onChange={(e) => handleSelectAllAssets(e.target.checked)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                        </th>
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
                            <input
                              type="checkbox"
                              checked={selectedAssets.includes(asset.id)}
                              onChange={(e) => handleSelectAsset(asset.id, e.target.checked)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                          </td>
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
                                onClick={() => {
                                  setSelectedAssets([asset.id]);
                                  setShowLabelModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                <Tag className="w-4 h-4" />
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
                <Plus className="w-4 h-4" />
                <span>Nova Sala</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {floors.map(floor => (
                <div key={floor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 md:px-6 py-4">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <Building className="w-5 h-5" />
                      <span className="text-sm md:text-base">{floor.name}</span>
                    </h3>
                    <p className="text-red-100 text-xs md:text-sm mt-1">{floor.description}</p>
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
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* Modal de configuração de etiquetas */}
      {showLabelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Configurar Etiquetas</h3>
                <button
                  onClick={() => setShowLabelModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Ativos Selecionados ({selectedAssets.length})</h4>
                    <div className="max-h-32 overflow-y-auto border rounded-lg p-3">
                      {assets.filter(a => selectedAssets.includes(a.id)).map(asset => (
                        <div key={asset.id} className="flex items-center justify-between py-1">
                          <span className="text-sm">{asset.code} - {asset.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template da Etiqueta</label>
                    <select
                      value={labelSettings.template}
                      onChange={(e) => setLabelSettings({...labelSettings, template: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(labelTemplates).map(([key, template]) => (
                        <option key={key} value={key}>
                          {template.name} ({template.width} x {template.height})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {labelTemplates[labelSettings.template]?.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Opções</h4>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelSettings.includeQR}
                        onChange={(e) => setLabelSettings({...labelSettings, includeQR: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Incluir QR Code</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelSettings.includeLocation}
                        onChange={(e) => setLabelSettings({...labelSettings, includeLocation: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Incluir Localização</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={labelSettings.includeDate}
                        onChange={(e) => setLabelSettings({...labelSettings, includeDate: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Incluir Data</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Preview da Etiqueta</h4>
                  <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg bg-gray-50 flex items-center justify-center">
                    {selectedAssets.length > 0 && (
                      <LabelComponent
                        label={{
                          code: assets.find(a => a.id === selectedAssets[0])?.code || 'SAMPLE',
                          name: assets.find(a => a.id === selectedAssets[0])?.name || 'Sample Asset',
                          location: 'Sample Location',
                          qrCode: generateQRCode('SAMPLE'),
                          date: new Date().toLocaleDateString('pt-BR')
                        }}
                        template={labelSettings.template}
                      />
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Dimensões:</strong> {labelTemplates[labelSettings.template]?.width} x {labelTemplates[labelSettings.template]?.height}</p>
                    <p><strong>Recomendação:</strong> Use papel adesivo ou etiquetas próprias para impressão</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowLabelModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    generateLabels();
                    setShowLabelModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Gerar Etiquetas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de preview das etiquetas */}
      {showLabelPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Preview das Etiquetas ({generatedLabels.length})</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={downloadLabelsAsPDF}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Salvar PDF</span>
                  </button>
                  <button
                    onClick={printLabels}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir</span>
                  </button>
                  <button
                    onClick={() => setShowLabelPreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Instruções para Impressão</h4>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• Configure sua impressora para papel A4 ou papel de etiquetas</li>
                      <li>• Ajuste as margens para "Mínima" ou "Sem margem"</li>
                      <li>• Use qualidade de impressão "Alta" para melhor legibilidade do QR Code</li>
                      <li>• Teste com uma página antes de imprimir todas as etiquetas</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div 
                ref={printRef}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg"
              >
                {generatedLabels.map((label, index) => (
                  <div key={index} className="flex justify-center">
                    <LabelComponent label={label} template={label.template} />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Total: {generatedLabels.length} etiqueta(s) • Template: {labelTemplates[labelSettings.template]?.name}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowLabelPreview(false);
                      setShowLabelModal(true);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      setShowLabelPreview(false);
                      setSelectedAssets([]);
                      setGeneratedLabels([]);
                    }}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de importação Excel */}
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

      {/* Modal de cadastro de ativo */}
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
                      onChange={(e) => setAssetForm({...assetForm, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: Dell Brasil"
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
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAsset}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
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
                    setRoomForm({ name: '', description: '', floorId: '', capacity: '', area: '' });
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

      {/* Modal para opções de câmera */}
      {showCameraOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Como deseja adicionar a foto?</h4>
            <div className="space-y-3">
              <button
                onClick={handleCameraCapture}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Tirar Foto (Câmera)</span>
              </button>
              <button
                onClick={handleGallerySelect}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Escolher da Galeria</span>
              </button>
              <button
                onClick={() => setShowCameraOptions(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg"
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
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setSelectedAssets([showAssetDetail.id]);
                    setShowAssetDetail(null);
                    setShowLabelModal(true);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>Gerar Etiqueta</span>
                </button>
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

      {/* Input hidden para arquivo */}
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoCapture}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
};

export default AssetControlSystem;
