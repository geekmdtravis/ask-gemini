import { useState, useEffect } from "react";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [question, setQuestion] = useState("");
  const [includeAll, setIncludeAll] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(
      ["apiKey", "lastQuestion", "lastResponse"],
      (data) => {
        if (data.apiKey) setApiKey(data.apiKey);
        if (data.lastQuestion) setQuestion(data.lastQuestion);
        if (data.lastResponse) setResponse(data.lastResponse);
      },
    );
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    chrome.storage.local.set({ apiKey: newApiKey });
  };

  const handleAsk = async () => {
    if (!apiKey) {
      setResponse("Please enter your Gemini API key.");
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

  return (
    <div className="p-4 w-96 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold mb-4">Gemini Web Assistant</h1>

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
          onChange={(e) => setModel(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option value="gemini-2.5-flash">gemini-2.5-flash</option>
          <option value="gemini-2.5-pro">gemini-2.5-pro</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="question" className="block mb-2 text-sm font-medium">
          Question
        </label>
        <textarea
          id="question"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="block p-2.5 w-full text-sm text-white bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ask a question about the page..."
        ></textarea>
      </div>

      <div className="flex items-center mb-4">
        <input
          id="includeAll"
          type="checkbox"
          checked={includeAll}
          onChange={(e) => setIncludeAll(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
        />
        <label htmlFor="includeAll" className="ml-2 text-sm font-medium">
          Include all page content (not just body)
        </label>
      </div>

      <div className="flex justify-between">
        <button
          id="askButton"
          onClick={handleAsk}
          disabled={loading}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-500"
        >
          {loading ? "Asking..." : "Ask"}
        </button>
        <button
          id="clearButton"
          onClick={handleClear}
          className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Clear
        </button>
      </div>

      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      <div
        id="response"
        className="mt-4 p-2.5 w-full text-sm text-white bg-gray-700 rounded-lg border border-gray-600 min-h-[50px]"
      >
        {response}
      </div>
    </div>
  );
}

export default App;

