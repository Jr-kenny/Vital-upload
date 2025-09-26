document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const statusDiv = document.getElementById('status');
    const submitButton = document.getElementById('submit-button');
    const fileInput = document.getElementById('fileToUpload');
    const creatorNameInput = document.getElementById('creatorName');
    const resultArea = document.getElementById('result-area');
    const resultUrlDiv = document.getElementById('result-url');
    const copyButton = document.getElementById('copy-button');
    const viewButton = document.getElementById('view-button');
    const historyList = document.getElementById('history-list');
    const renderHistory = () => {
        const history = JSON.parse(localStorage.getItem('permaCertHistory')) || [];
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<li>No past uploads found.</li>';
            return;
        }
        history.reverse().forEach(item => {
            const li = document.createElement('li');
            const date = new Date(item.timestamp).toLocaleString();
            li.innerHTML = `<div><div class="file-name">${item.fileName}</div><div class="timestamp">by ${item.creatorName} on ${date}</div></div><a href="${item.url}" target="_blank">View</a>`;
            historyList.appendChild(li);
        });
    };
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        resultArea.style.display = 'none';
        statusDiv.style.display = 'block';
        statusDiv.innerText = 'Uploading, please wait...';
        submitButton.disabled = true;
        const formData = new FormData(form);
        const creatorName = creatorNameInput.value;
        const fileName = fileInput.files[0] ? fileInput.files[0].name : 'unknown_file';
        try {
            const response = await fetch('/upload', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success) {
                statusDiv.style.display = 'none';
                resultUrlDiv.innerText = result.url;
                viewButton.href = result.url;
                resultArea.style.display = 'block';
                const history = JSON.parse(localStorage.getItem('permaCertHistory')) || [];
                history.push({ url: result.url, creatorName: creatorName, fileName: fileName, timestamp: new Date().toISOString() });
                localStorage.setItem('permaCertHistory', JSON.stringify(history));
                renderHistory();
                copyButton.onclick = () => {
                    navigator.clipboard.writeText(result.url);
                    copyButton.innerText = 'Copied!';
                    setTimeout(() => { copyButton.innerText = 'Copy Link'; }, 2000);
                };
            } else {
                statusDiv.innerText = `❌ Error: ${result.error}. Details: ${result.details || 'N/A'}`;
            }
        } catch (e) {
            statusDiv.innerText = `❌ A critical error occurred: ${e.message}`;
        } finally {
            submitButton.disabled = false;
        }
    });
    renderHistory();
});
