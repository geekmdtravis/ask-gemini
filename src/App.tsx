import { useState, useEffect, useRef } from "react";
import Settings from "./Settings";
import Response from "./Response";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [question, setQuestion] = useState("");
  const [includeAll, setIncludeAll] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [markdownEnabled, setMarkdownEnabled] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    chrome.storage.local.get(
      [
        "apiKey",
        "model",
        "includeAll",
        "lastQuestion",
        "lastResponse",
        "markdownEnabled",
      ],
      (data) => {
        if (data.apiKey) setApiKey(data.apiKey);
        if (data.model) setModel(data.model);
        if (data.includeAll) setIncludeAll(data.includeAll);
        if (data.lastQuestion) setQuestion(data.lastQuestion);
        if (data.lastResponse) setResponse(data.lastResponse);
        if (data.markdownEnabled !== undefined) {
          setMarkdownEnabled(data.markdownEnabled);
        }
      },
    );
  }, []);

  const handleToggleMarkdown = () => {
    const newMarkdownEnabled = !markdownEnabled;
    setMarkdownEnabled(newMarkdownEnabled);
    chrome.storage.local.set({ markdownEnabled: newMarkdownEnabled });
  };

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

  const handleSettings = () => {
    setShowSettings(true);
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
    <div style={{ minWidth: "450px" }} className="p-4 bg-gray-800 text-white">
      {!apiKey && (
        <div className="mb-4 p-2.5 bg-yellow-900 text-white rounded-lg text-sm">
          API key not set. Please
          <button onClick={handleSettings} className="underline ml-1">
            go to settings
          </button>
          .
        </div>
      )}

      <div className="relative mb-4">
        <textarea
          ref={inputRef}
          id="question"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="block p-2.5 w-full text-sm text-white bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ask a question about the page..."
        ></textarea>
      </div>
      <div className="flex space-x-2 my-2">
        <button
          onClick={handleAsk}
          disabled={loading}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-300 font-medium rounded-lg text-sm py-1 px-2 text-center disabled:bg-gray-500"
        >
          Ask
        </button>
        <button
          onClick={handleClear}
          className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 font-medium rounded-lg text-sm py-1 px-2 text-center"
        >
          Clear
        </button>
        <button
          onClick={handleSettings}
          className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 font-medium rounded-lg text-sm py-1 px-2 text-center"
        >
          Settings
        </button>
        <button
          onClick={handleToggleMarkdown}
          className={`text-white font-medium rounded-lg text-sm py-1 px-2 text-center ${
            markdownEnabled
              ? "bg-blue-700 hover:bg-blue-800"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          Markdown
        </button>
      </div>

      <Response
        response={response}
        loading={loading}
        markdownEnabled={markdownEnabled}
      />
    </div>
  );
}

export default App;
