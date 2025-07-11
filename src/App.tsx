import { useState, useEffect } from "react";
import Settings from "./Settings";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [question, setQuestion] = useState("");
  const [includeAll, setIncludeAll] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(
      ["apiKey", "model", "includeAll", "lastQuestion", "lastResponse"],
      (data) => {
        if (data.apiKey) setApiKey(data.apiKey);
        if (data.model) setModel(data.model);
        if (data.includeAll) setIncludeAll(data.includeAll);
        if (data.lastQuestion) setQuestion(data.lastQuestion);
        if (data.lastResponse) setResponse(data.lastResponse);
      },
    );
  }, []);

  const handleAsk = async () => {
    if (!apiKey) {
      setResponse("Please enter your Gemini API key in settings.");
      return;
    }
    if (!question) {
      setResponse("Please enter a question.");
      return;
    }

    setLoading(true);
    setResponse("");
    chrome.storage.local.set({ lastQuestion: question });

    try {
      const res = await chrome.runtime.sendMessage({
        type: "ASK_GEMINI",
        apiKey,
        model,
        question,
        includeAll,
      });

      const responseText = res.error ? `Error: ${res.error}` : res.text;
      setResponse(responseText);
      chrome.storage.local.set({ lastResponse: responseText });
    } catch (error: any) {
      const errorMessage = `Error: ${error.message || "An unknown error occurred."}`;
      setResponse(errorMessage);
      chrome.storage.local.set({ lastResponse: errorMessage });
      console.error("Error sending message to background script:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion("");
    setResponse("");
    chrome.storage.local.remove(["lastQuestion", "lastResponse"]);
  };

  if (showSettings) {
    return (
      <Settings
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        model={model}
        onModelChange={setModel}
        includeAll={includeAll}
        onIncludeAllChange={setIncludeAll}
        onClose={() => setShowSettings(false)}
      />
    );
  }

  return (
    <div className="p-4 bg-gray-800 text-white">
      {!apiKey && (
        <div className="mb-4 p-2.5 bg-yellow-900 text-white rounded-lg text-sm">
          API key not set. Please
          <button
            onClick={() => setShowSettings(true)}
            className="underline ml-1"
          >
            go to settings
          </button>
          .
        </div>
      )}

      <div className="relative mb-4">
        <textarea
          id="question"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="block p-2.5 w-full text-sm text-white bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ask a question about the page..."
        ></textarea>
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={handleAsk}
            disabled={loading}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm p-2 text-center disabled:bg-gray-500"
          >
            Ask
          </button>
          <button
            onClick={handleClear}
            className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 font-medium rounded-lg text-sm p-2 text-center"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          id="response"
          className={`p-2.5 w-full text-sm text-white bg-gray-700 rounded-lg border border-gray-600 min-h-[100px] ${
            loading ? "blur-sm" : ""
          }`}
        >
          {response}
        </div>
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      <button
        onClick={() => setShowSettings(true)}
        className="mt-4 text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full"
      >
        Settings
      </button>
    </div>
  );
}

export default App;
