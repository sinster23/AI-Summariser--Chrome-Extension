document.getElementById("summarize").addEventListener("click", () => {
  const summaryType = document.getElementById("summary-type").value;
  const result = document.getElementById("result");
  result.innerHTML = '<div class="loader"></div>';

  chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
    if (!geminiApiKey) {
      result.textContent =
        "No API key set. Please set your Gemini API key in the options.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["content.js"],
        },
        () => {
          chrome.tabs.sendMessage(
            tab.id,
            { type: "GET_ARTICLE_TEXT" },
            async(response) => {
              if (chrome.runtime.lastError) {
                result.textContent =
                  "Error: " + chrome.runtime.lastError.message;
                console.error(
                  "SendMessage error:",
                  chrome.runtime.lastError.message
                );
              } else {
                if(!response.text){
                    result.textContent = "No article text found.";
                    return;
                }
                try{
                    const summary= await getGeminiSummary(
                        response.text,
                        summaryType,
                        geminiApiKey
                    );
                    result.textContent= summary;
                }catch(error){
                    result.textContent = "Error: " + error.message;
                    console.error("Error getting summary:", error);
                }
              }
            }
          );
        }
      );
    });
  });
});

async function getGeminiSummary(rawText, type, apiKey){
    const max= 20000;
    const text= rawText.length>max?rawText.slice(0,max)+ "..." : rawText;

    const promptMap={
        brief: `Summarize the following text in a concise manner:\n\n${text}`,
        detailed: `Provide a detailed summary of the following text:\n\n${text}`,
        bullets: `Generate  5-7 bullet points from the following text:\n\n${text}`
    }

    const prompt= promptMap[type] || promptMap.brief;
    const res= await fetch
    (`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2 }, 
            })
        } 
    );

    if(!res.ok){
        const {error} = await res.json();
        throw new Error(error.message);
    }

    const data= await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No summary available.";
}

document.getElementById("copy-btn").addEventListener("click", () => {
    const txt= document.getElementById("result").innerText;
    if(!txt) return;
    navigator.clipboard.writeText(txt).then(() => {
        const copyBtn = document.getElementById("copy-btn");
        const old= copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
            copyBtn.textContent = old;
        }, 2000);
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
});