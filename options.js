document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["gemniApiKey"], ({ geminiApiKey }) => {
    if(geminiApiKey) document.getElementById("api-key").value=geminiApiKey;
  });

  document.getElementById("save-btn").addEventListener("click", () =>{
    const apiKey= document.getElementById("api-key").value.trim();
    if(!apiKey) return;
    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
      document.getElementById("success-message").style.display="block";
      setTimeout(()=> window.close(), 1000);
      
    });
  });
});
