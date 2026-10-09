(function (root) {
  'use strict';
  const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']);
  function isImage(file) {
    return imageTypes.has(file.type?.toLowerCase()) || (!file.type && /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name));
  }
  function createStore(urlApi) {
    const urls = new Map(), failed = new WeakSet();
    return {
      isImage,
      get(file) {
        if (!isImage(file) || failed.has(file)) return null;
        if (!urls.has(file)) {
          try { urls.set(file, urlApi.createObjectURL(file)); }
          catch { failed.add(file); return null; }
        }
        return urls.get(file);
      },
      fail(url) {
        for (const [file, value] of urls) if (value === url) { failed.add(file); return file; }
        return null;
      },
      retain(files) {
        const selected = new Set(files);
        for (const [file, url] of urls) if (!selected.has(file)) { urlApi.revokeObjectURL(url); urls.delete(file); }
      },
    };
  }
  function create({ getUploads, canOpen = () => true, document = root.document, urlApi = root.URL }) {
    const store = createStore(urlApi);
    const dialog = document.createElement('dialog');
    dialog.className = 'attachment-preview-dialog';
    dialog.setAttribute('aria-labelledby', 'attachmentPreviewTitle');
    dialog.innerHTML = '<div class="attachment-preview-head"><h2 id="attachmentPreviewTitle">写真のプレビュー</h2><button type="button" class="attachment-preview-close">閉じる</button></div><div class="attachment-preview-body"><img class="attachment-preview-full" alt=""><p class="attachment-preview-error" hidden>この端末では写真を表示できません。添付ファイルは選択されたままです。</p><p class="attachment-preview-filename"></p></div>';
    document.body.append(dialog);
    const full = dialog.querySelector('img'), name = dialog.querySelector('.attachment-preview-filename');
    const error = dialog.querySelector('.attachment-preview-error');
    let opener = null, shownFile = null;
    function close() { if (dialog.open) dialog.close(); }
    dialog.querySelector('button').addEventListener('click', close);
    dialog.addEventListener('close', () => {
      full.removeAttribute('src'); full.alt = ''; name.textContent = ''; shownFile = null;
      document.body.classList.remove('attachment-preview-open');
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      opener = null;
    });
    document.addEventListener('click', event => {
      const button = event.target.closest?.('[data-open-attachment]');
      if (!button || button.disabled || !canOpen()) return;
      const key = button.dataset.openAttachment, index = Number(button.dataset.attachmentIndex);
      if (!['photos', 'videos'].includes(key) || !Number.isSafeInteger(index) || index < 0) return;
      const file = getUploads()[key]?.[index];
      if (!file) return;
      const url = store.get(file);
      if (!url) return;
      opener = button; shownFile = file; full.hidden = false; error.hidden = true;
      name.textContent = file.name; full.alt = file.name; full.src = url;
      document.body.classList.add('attachment-preview-open');
      dialog.showModal();
    });
    document.addEventListener('error', event => {
      const image = event.target;
      if (image.tagName !== 'IMG' || (!image.hasAttribute('data-attachment-image') && image !== full)) return;
      const file = store.fail(image.src);
      if (!file) return;
      image.hidden = true;
      const button = image.closest('[data-open-attachment]');
      if (button) {
        button.disabled = true;
        button.querySelector('.attachment-placeholder').hidden = false;
        button.setAttribute('aria-label', `${file.name}：この端末ではプレビューを表示できません`);
        const caption = button.closest('li').querySelector('.attachment-caption');
        if (caption) caption.textContent = 'この端末ではプレビュー表示不可（選択は保持）';
      }
      if (image === full) error.hidden = false;
    }, true);
    return {
      sync() {
        const uploads = getUploads(), all = [...uploads.photos, ...uploads.videos];
        if (shownFile && !all.includes(shownFile)) close();
        store.retain(all);
      },
      markup(uploads, escape) {
        const entries = ['photos', 'videos'].flatMap(key => uploads[key].map((file, index) => ({ key, file, index })));
        if (!entries.length) return '';
        return `<ul class="file-list attachment-list attachment-preview-list">${entries.map(({ key, file, index }) => {
          const url = store.get(file), image = isImage(file);
          const kind = image ? '写真' : /\.pdf$/i.test(file.name) || file.type === 'application/pdf' ? 'PDF' : key === 'videos' ? '動画' : 'ファイル';
          const thumb = url
            ? `<button type="button" class="attachment-thumb" data-open-attachment="${key}" data-attachment-index="${index}" aria-label="${escape(file.name)}の写真プレビューを拡大"><img src="${escape(url)}" alt="" width="80" height="80" loading="lazy" decoding="async" data-attachment-image><span class="attachment-placeholder" hidden>表示不可</span></button>`
            : `<span class="attachment-placeholder">${image ? '表示不可' : kind}</span>`;
          return `<li>${thumb}<span class="attachment-meta"><span class="attachment-file-name">${escape(file.name)}</span><small class="attachment-caption">${url ? 'タップで拡大' : image ? 'この端末ではプレビュー表示不可（選択は保持）' : `${kind}の添付`}</small></span><button type="button" class="attachment-remove" data-remove-upload="${key}" data-upload-index="${index}" aria-label="${escape(file.name)}を添付から外す">外す</button></li>`;
        }).join('')}</ul>`;
      },
    };
  }
  root.HeiwaAttachmentPreviews = { createStore, create, isImage };
})(window);
