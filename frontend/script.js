// common utilities
async function request(url, options = {}) {
  const resp = await fetch(url, { ...options, credentials: 'include' });
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}));
    throw new Error(error.error || resp.statusText);
  }
  return resp.json().catch(() => ({}));
}
// API base URL (set to your backend IP/port)
const API_URL = 'http://100.30.206.208:5000';

// login page logic
if (document.getElementById('loginForm')) {
  const form = document.getElementById('loginForm');
  const messageDiv = document.getElementById('message');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    messageDiv.textContent = '';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
      await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      window.location.href = 'dashboard.html';
    } catch (err) {
      messageDiv.textContent = err.message;
      messageDiv.style.color = 'red';
    }
  });
}

// dashboard logic
if (document.getElementById('logoutBtn')) {
  const logoutBtn = document.getElementById('logoutBtn');
  const filesList = document.getElementById('filesList');
  const uploadForm = document.getElementById('uploadForm');
  const uploadMessage = document.getElementById('uploadMessage');
  const versionModal = document.getElementById('versionModal');
  const versionsList = document.getElementById('versionsList');
  const closeModal = document.getElementById('closeModal');

  logoutBtn.addEventListener('click', async () => {
    await request('/api/auth/logout');
    window.location.href = 'index.html';
  });

  async function loadFiles() {
    filesList.innerHTML = 'Loading...';
    try {
      const files = await request('/api/files');
      filesList.innerHTML = '';
      files.forEach(f => {
        const card = document.createElement('div');
        card.className = 'card file-card';
        card.innerHTML = `
          <div><strong>${f.key}</strong></div>
          <div class="file-info">Size: ${f.size} bytes</div>
          <div class="file-info">Modified: ${new Date(f.lastModified).toLocaleString()}</div>
          <div class="actions">
            <button data-action="download" data-key="${f.key}" class="btn">Download</button>
            <button data-action="versions" data-key="${f.key}" class="btn">Versions</button>
            <button data-action="delete" data-key="${f.key}" class="btn" style="background:#c0392b;">Delete</button>
          </div>
        `;
        filesList.appendChild(card);
      });
    } catch (err) {
      filesList.innerHTML = 'Failed to load files';
    }
  }

  filesList.addEventListener('click', async e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const key = btn.dataset.key;
    if (action === 'download') {
      try {
        const resp = await fetch(`/api/files/download/${encodeURIComponent(key)}`, {
          credentials: 'include'
        });
        if (!resp.ok) throw new Error('Download failed');
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = key;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (err) {
        alert(err.message);
      }
    } else if (action === 'delete') {
      if (!confirm('Are you sure you want to delete this file?')) return;
      try {
        const resp = await fetch(`${API_URL}/files/${encodeURIComponent(key)}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!resp.ok) {
          let errBody = {};
          try { errBody = await resp.json(); } catch (e) {}
          throw new Error(errBody.error || resp.statusText || 'Delete failed');
        }
        // show success and refresh
        alert('Delete successful');
        loadFiles();
      } catch (err) {
        alert(err.message);
      }
    } else if (action === 'versions') {
      // fetch versions
      try {
        const versions = await request(`/api/files/versions/${encodeURIComponent(key)}`);
        versionsList.innerHTML = '';
        versions.forEach(v => {
          const li = document.createElement('li');
          const date = new Date(v.lastModified).toLocaleString();
          li.innerHTML = `
            ${date} (${v.size} bytes) ${v.isLatest ? '(latest)' : ''}
            <button class="btn" data-version="${v.versionId}" data-key="${key}">Download</button>
          `;
          versionsList.appendChild(li);
        });
        versionModal.style.display = 'block';
      } catch (err) {
        alert('Could not load versions');
      }
    }
  });

  versionsList.addEventListener('click', async e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const versionId = btn.dataset.version;
    const key = btn.dataset.key;
    try {
      const resp = await fetch(
        `/api/files/download/${encodeURIComponent(key)}?versionId=${encodeURIComponent(versionId)}`,
        { credentials: 'include' }
      );
      if (!resp.ok) throw new Error('Download failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = key;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message);
    }
  });

  closeModal.addEventListener('click', () => {
    versionModal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === versionModal) {
      versionModal.style.display = 'none';
    }
  });

  uploadForm.addEventListener('submit', async e => {
    e.preventDefault();
    uploadMessage.textContent = '';
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) return;
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    try {
      await fetch('/api/files/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      uploadMessage.textContent = 'Upload successful';
      uploadMessage.style.color = 'green';
      fileInput.value = '';
      loadFiles();
    } catch (err) {
      uploadMessage.textContent = 'Upload failed';
      uploadMessage.style.color = 'red';
    }
  });

  // initial load
  loadFiles();
}
