import React from "react";

interface SettingsProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  model: string;
  onModelChange: (model: string) => void;
  includeAll: boolean;
  onIncludeAllChange: (includeAll: boolean) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  apiKey,
  onApiKeyChange,
  model,
  onModelChange,
  includeAll,
  onIncludeAllChange,
  onClose,
}) => {
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiKeyChange(e.target.value);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value);
  };

  const handleIncludeAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onIncludeAllChange(e.target.checked);
  };

  const handleSave = () => {
    chrome.storage.local.set(
      {
        apiKey,
        model,
        includeAll,
      },
      onClose,
    );
  };

  return (
    <div className="p-4 bg-gray-800 text-white">
      <h2 className="text-lg font-bold mb-4">Settings</h2>

      <div className="mb-4">
        <label htmlFor="apiKey" className="block mb-2 text-sm font-medium">
          Gemini API Key
        </label>
        <input
          type="password"
          id="apiKey"
          value={apiKey}
          onChange={handleApiKeyChange}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Enter your API key"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="model" className="block mb-2 text-sm font-medium">
          Model
        </label>
        <select
          id="model"
          value={model}
          onChange={handleModelChange}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option value="gemini-2.5-flash">gemini-2.5-flash</option>
          <option value="gemini-2.5-pro">gemini-2.5-pro</option>
        </select>
      </div>

      <div className="flex items-center mb-4">
        <input
          id="includeAll"
          type="checkbox"
          checked={includeAll}
          onChange={handleIncludeAllChange}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
        />
        <label htmlFor="includeAll" className="ml-2 text-sm font-medium">
          Include all page content (not just body)
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Settings;
