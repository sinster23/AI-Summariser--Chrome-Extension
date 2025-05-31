function getArticleText() {
    const article = document.querySelector("article");
    if (article) {
        return article.innerText;
    }

    const para= Array.from(document.querySelectorAll("p"));
    return para.map(p => p.innerText).join("\n");
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type==="GET_ARTICLE_TEXT") {
        const text = getArticleText();
        sendResponse({ text });
    } 
    return true;  
});