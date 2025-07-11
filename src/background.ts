import { GoogleGenerativeAI } from "@google/generative-ai";

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "ASK_GEMINI") {
    handleAskGemini(request)
      .then((response) => sendResponse(response))
      .catch((error) => {
        sendResponse({ error: error.message });
      });
    return true; // Indicates that the response is sent asynchronously
  }
});

async function handleAskGemini(request: { apiKey: string, model: string, question: string, includeAll: boolean }) {
  const { apiKey, model, question, includeAll } = request;

  try {
    const ai = new GoogleGenerativeAI(apiKey);

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.id) {
      throw new Error("Could not find active tab.");
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getPageContent,
      args: [includeAll],
    });

    const pageContent = result || "No content found.";

    const fullPrompt = `Based on the following content from the webpage, please answer the user's question.\n\nPage Content:\n${pageContent}\n\nUser's Question:\n${question}`;
    
    const genAI = ai.getGenerativeModel({ model });
    const response = await genAI.generateContent(fullPrompt);
    const text = response.response.text();

    return { text };
  } catch (error: any) {
    const errorMessage =
      error.message || "An unknown error occurred during the API call.";
    return { error: errorMessage };
  }
}

function getPageContent(includeAll: boolean) {
  if (includeAll) {
    return document.documentElement.outerHTML;
  } else {
    return document.body.outerHTML;
  }
}
