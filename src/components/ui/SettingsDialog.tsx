import { X, Download, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '../../stores/settingsStore.js';
import { useAppStore } from '../../stores/appStore.js';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { apiEndpoint, theme, autoSave, updateSettings } = useSettingsStore();
  const { exportConversations, importConversations } = useAppStore();
  
  // Local state for form
  const [localApiEndpoint, setLocalApiEndpoint] = useState(apiEndpoint);
  const [localTheme, setLocalTheme] = useState(theme);
  const [localAutoSave, setLocalAutoSave] = useState(autoSave);
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when store changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setLocalApiEndpoint(apiEndpoint);
      setLocalTheme(theme);
      setLocalAutoSave(autoSave);
    }
  }, [isOpen, apiEndpoint, theme, autoSave]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Save settings to store
    updateSettings({
      apiEndpoint: localApiEndpoint,
      theme: localTheme,
      autoSave: localAutoSave,
    });
    
    console.log('Settings saved:', { 
      apiEndpoint: localApiEndpoint, 
      theme: localTheme, 
      autoSave: localAutoSave 
    });
    
    onClose();
  };

  const handleCancel = () => {
    // Reset local state to store values
    setLocalApiEndpoint(apiEndpoint);
    setLocalTheme(theme);
    setLocalAutoSave(autoSave);
    onClose();
  };

  const handleExportConversations = () => {
    try {
      const exportData = exportConversations();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opencode-conversations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setImportStatus('Export successful!');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      setImportStatus('Export failed!');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  const handleImportConversations = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await importConversations(text);
      if (success) {
        setImportStatus('Import successful!');
      } else {
        setImportStatus('Import failed!');
      }
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      setImportStatus('Import failed!');
      setTimeout(() => setImportStatus(''), 3000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Endpoint */}
          <div>
            <label htmlFor="api-endpoint" className="block text-sm font-medium text-gray-300 mb-2">
              API Endpoint
            </label>
            <input
              id="api-endpoint"
              type="text"
              value={localApiEndpoint}
              onChange={(e) => setLocalApiEndpoint(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="http://localhost:9091"
            />
          </div>

          {/* Theme */}
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <select
              id="theme"
              value={localTheme}
              onChange={(e) => setLocalTheme(e.target.value as 'dark' | 'light' | 'auto')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="auto-save" className="text-sm font-medium text-gray-300">
                Auto-save conversations
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Automatically save conversation history
              </p>
            </div>
            <button
              id="auto-save"
              type="button"
              onClick={() => setLocalAutoSave(!localAutoSave)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localAutoSave ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localAutoSave ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Import/Export */}
          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Data Management</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleExportConversations}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  Export Conversations
                </button>
                <button
                  onClick={handleImportConversations}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Upload className="h-4 w-4" />
                  Import Conversations
                </button>
              </div>
              
              {importStatus && (
                <p className={`text-xs text-center ${
                  importStatus.includes('successful') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {importStatus}
                </p>
              )}
              
              <p className="text-xs text-gray-400">
                Export your conversations to backup or share. Import to restore from a backup.
              </p>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Version Info */}
          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Version Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Frontend Version:</span>
                <span className="text-white font-mono">{__VERSION__}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Commit:</span>
                <span className="text-white font-mono">{__COMMIT_HASH__}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Build Date:</span>
                <span className="text-white font-mono">{__BUILD_DATE__}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
