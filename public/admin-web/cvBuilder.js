/**
 * Trikonet Professional CV Builder Engine & Library
 * Complete ditto replica of the Medbiomate CV Builder Feature
 */

const CV_STATE_KEY = 'cvBuilderPluginState';
const CV_LIBRARY_KEY = 'trikonet_cv_library_v1';
const CV_ACTIVE_KEY = 'trikonet_cv_active_id_v1';
const CV_DEFAULT_JOB_KEY = 'trikonet_cv_default_job_id_v1';
const CV_PENDING_SAVE_KEY = 'trikonet_cv_pending_cloud_save_v1';
const CV_STYLE_KEY = `${CV_STATE_KEY}-template-styles-v1`;
const MAX_CV_LIBRARY = 3;

const FORMAT_LABELS = { pdf: 'PDF', word: 'Word', png: 'PNG', jpeg: 'JPEG' };
const TEMPLATE_PREVIEWS = {
  classic: 'classic-template-preview-hq.png',
  modern: 'modern-preview.jpg',
  bold: 'newmorn-preview.jpg',
  simple: 'simple-preview.jpg',
  minimal: 'minimal-preview.jpg',
  chromatic: 'chromatic-preview.jpg',
  visual: 'visual-preview.jpg',
  sleek: 'sleek-preview.jpg',
  flare: 'flare-preview.png',
  professional: 'visual-professional-thumb.png',
  clear: 'professional-preview.jpg',
  polished: 'professional-preview.jpg',
  freeform: 'flare-preview.png'
};

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_WIDTH_PX = 800;
const A4_HEIGHT_PX = 1131.4;
const INTER_FONTS = {
  normal: '/cv-builder-plugin/assets/fonts/inter-regular.ttf',
  bold: '/cv-builder-plugin/assets/fonts/inter-bold.ttf',
  italic: '/cv-builder-plugin/assets/fonts/inter-italic.ttf',
  bolditalic: '/cv-builder-plugin/assets/fonts/inter-bolditalic.ttf'
};

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

let interFontsRegistered = false;
async function registerInter(pdf) {
  if (interFontsRegistered) return;
  try {
    await Promise.all(Object.entries(INTER_FONTS).map(async ([style, url]) => {
      const response = await fetch(url);
      if (!response.ok) return;
      const fileName = `Inter-${style}.ttf`;
      pdf.addFileToVFS(fileName, arrayBufferToBase64(await response.arrayBuffer()));
      pdf.addFont(fileName, 'inter', style);
    }));
    interFontsRegistered = true;
  } catch (err) {
    console.warn('Inter font registration warning, using standard font fallback:', err);
  }
}

function parseColor(value) {
  const rgb = String(value || '').match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  const hex = String(value || '').match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) {
    const raw = hex[1].length === 3 ? hex[1].split('').map(p => p + p).join('') : hex[1];
    return [parseInt(raw.slice(0, 2), 16), parseInt(raw.slice(2, 4), 16), parseInt(raw.slice(4, 6), 16)];
  }
  return [31, 41, 55];
}

function waitForStyles(doc) {
  return Promise.all(Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(link => {
    if (link.sheet) return Promise.resolve();
    return new Promise(resolve => {
      link.addEventListener('load', () => resolve(), { once: true });
      link.addEventListener('error', () => resolve(), { once: true });
      window.setTimeout(resolve, 2500);
    });
  }));
}

function waitForImages(root) {
  return Promise.all(Array.from(root.querySelectorAll('img')).map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  })));
}

function previewHtmlWithEmbeddedImages(sourcePreview) {
  const clone = sourcePreview.cloneNode(true);
  const originals = [sourcePreview, ...Array.from(sourcePreview.querySelectorAll('*'))];
  const copies = [clone, ...Array.from(clone.querySelectorAll('*'))];
  originals.forEach((element, index) => {
    const computed = sourcePreview.ownerDocument.defaultView.getComputedStyle(element);
    for (const property of Array.from(computed)) {
      copies[index].style.setProperty(property, computed.getPropertyValue(property), 'important');
    }
  });
  ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'transform', 'transform-origin', 'position', 'top', 'left'].forEach(prop => clone.style.removeProperty(prop));
  const sourceImages = Array.from(sourcePreview.querySelectorAll('img'));
  const clonedImages = Array.from(clone.querySelectorAll('img'));
  sourceImages.forEach((image, index) => {
    const clonedImage = clonedImages[index];
    if (!clonedImage || !image.complete || !image.naturalWidth || !image.naturalHeight) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(image, 0, 0);
      clonedImage.src = canvas.toDataURL('image/png');
    } catch {}
  });
  return clone.outerHTML;
}

function collectTextRuns(root, target) {
  const rootRect = root.getBoundingClientRect();
  const runs = [];
  const nodes = [];
  const walker = target.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) { nodes.push(node); node = walker.nextNode(); }

  nodes.forEach(textNode => {
    const parent = textNode.parentElement;
    if (!parent || parent.closest('svg,script,style')) return;
    const style = target.defaultView?.getComputedStyle(parent);
    if (!style || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return;
    const value = textNode.nodeValue || '';
    for (const match of value.matchAll(/\S+/g)) {
      if (match.index === undefined) continue;
      const range = target.createRange();
      range.setStart(textNode, match.index);
      range.setEnd(textNode, match.index + match[0].length);
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const fontSize = parseFloat(style.fontSize) || 12;
      const weight = Number(style.fontWeight) >= 600 || /bold/i.test(style.fontWeight);
      const italic = /italic|oblique/i.test(style.fontStyle);
      const baseline = (rect.top - rootRect.top) + (rect.height - fontSize) / 2 + fontSize * 0.8;
      runs.push({ text: match[0], x: rect.left - rootRect.left, y: baseline, fontSize, bold: weight, italic, color: parseColor(style.color) });
    }
  });

  return runs;
}

export async function exportCvAsVectorPdf(sourceDocument, sourcePreview, fileName) {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  Object.assign(frame.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: `${A4_WIDTH_PX}px`,
    height: `${A4_HEIGHT_PX}px`,
    border: '0',
    pointerEvents: 'none'
  });
  document.body.appendChild(frame);
  try {
    const target = frame.contentDocument;
    if (!target) throw new Error('Unable to create PDF workspace');
    const links = Array.from(sourceDocument.querySelectorAll('link[rel="stylesheet"]'))
      .map(link => `<link rel="stylesheet" href="${new URL(link.getAttribute('href') || '', sourceDocument.baseURI).href}">`)
      .join('');
    const styles = Array.from(sourceDocument.querySelectorAll('style'))
      .map(style => style.outerHTML)
      .join('');
    const previewHtml = previewHtmlWithEmbeddedImages(sourcePreview);
    target.open();
    target.write(`<!doctype html><html><head><base href="${sourceDocument.baseURI}"><meta charset="utf-8">${links}${styles}<style>html,body{width:${A4_WIDTH_PX}px!important;margin:0!important;padding:0!important;background:#fff!important;overflow:visible!important}#cv-builder-workspace{width:${A4_WIDTH_PX}px!important;margin:0!important;padding:0!important;background:#fff!important}.cv-preview{display:block!important;width:${A4_WIDTH_PX}px!important;min-width:${A4_WIDTH_PX}px!important;max-width:${A4_WIDTH_PX}px!important;margin:0!important;transform:none!important;box-shadow:none!important;border:0!important;box-sizing:border-box!important}.cv-page-divider{display:none!important}.cv-hidden{display:none!important}</style></head><body><div id="cv-builder-workspace">${previewHtml}</div></body></html>`);
    target.close();
    await waitForStyles(target);
    await target.fonts?.ready;
    const root = target.querySelector('.cv-preview');
    if (!root) throw new Error('CV preview is unavailable');
    await waitForImages(root);

    const contentHeight = Math.max(A4_HEIGHT_PX, root.scrollHeight, root.getBoundingClientRect().height);
    const pageCount = Math.max(1, Math.ceil((contentHeight - 45) / A4_HEIGHT_PX));
    root.style.height = `${pageCount * A4_HEIGHT_PX}px`;
    const textRuns = collectTextRuns(root, target);

    const h2c = window.html2canvas || (await import('/cv-builder-plugin/assets/js/html2canvas.min.js').catch(() => null));
    if (!h2c) throw new Error('html2canvas unavailable');
    const background = await (window.html2canvas || h2c)(root, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: A4_WIDTH_PX,
      height: pageCount * A4_HEIGHT_PX,
      windowWidth: A4_WIDTH_PX,
      windowHeight: pageCount * A4_HEIGHT_PX
    });

    const pageHeightPixels = Math.round(background.width * A4_HEIGHT_MM / A4_WIDTH_MM);
    if (!window.jspdf?.jsPDF) {
      await import('/cv-builder-plugin/assets/js/jspdf.umd.min.js').catch(() => null);
    }
    const jsPDFConstructor = window.jspdf?.jsPDF || (typeof jsPDF !== 'undefined' ? jsPDF : null);
    if (!jsPDFConstructor) throw new Error('jsPDF library not available');

    const pdf = new jsPDFConstructor({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true
    });
    await registerInter(pdf);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) pdf.addPage();
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = background.width;
      pageCanvas.height = pageHeightPixels;
      const context = pageCanvas.getContext('2d');
      if (!context) throw new Error('Unable to prepare PDF background');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      context.drawImage(background, 0, page * pageHeightPixels, pageCanvas.width, pageHeightPixels, 0, 0, pageCanvas.width, pageHeightPixels);
      pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
    }

    const positionScale = A4_WIDTH_MM / A4_WIDTH_PX;
    textRuns.forEach(run => {
      const page = Math.max(0, Math.min(pageCount - 1, Math.floor(run.y / A4_HEIGHT_PX)));
      pdf.setPage(page + 1);
      try {
        pdf.setFont('inter', run.bold && run.italic ? 'bolditalic' : run.bold ? 'bold' : run.italic ? 'italic' : 'normal');
      } catch {
        pdf.setFont('helvetica', run.bold && run.italic ? 'bolditalic' : run.bold ? 'bold' : run.italic ? 'italic' : 'normal');
      }
      pdf.setFontSize(Math.max(4, run.fontSize * 0.75));
      pdf.setTextColor(...run.color);
      pdf.text(run.text + ' ', run.x * positionScale, (run.y - page * A4_HEIGHT_PX) * positionScale, { baseline: 'alphabetic', renderingMode: 'invisible' });
    });
    pdf.setProperties({
      title: fileName.replace(/\.pdf$/i, ''),
      subject: 'CV created with Trikonet CV Builder',
      creator: 'Trikonet Professional CV Builder'
    });
    return pdf.output('blob');
  } finally {
    frame.remove();
  }
}

// Storage helpers
function editableResumeState(state) {
  if (!state || typeof state !== 'object') return null;
  const clean = { ...state };
  // The thumbnail belongs to the library card, not the editable CV state.
  // Keeping the same data URL in both places can exhaust localStorage and
  // prevent saved résumés from opening once the library grows.
  delete clean.libraryPreviewImage;
  return clean;
}

export function loadLibrary() {
  try {
    const raw = localStorage.getItem(CV_LIBRARY_KEY);
    let entries = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(entries)) entries = [];
    if (!entries.length) {
      const state = JSON.parse(localStorage.getItem(CV_STATE_KEY) || 'null');
      if (state) {
        const fullName = String(state.fullName || 'Professional CV');
        entries = [{
          id: 'resume-existing',
          name: fullName === 'George Emmanuel' ? 'My professional résumé' : `${fullName} résumé`,
          template: String(state.template || 'classic'),
          updatedAt: Date.now(),
          state
        }];
        saveLibrary(entries);
      }
    }
    let cleaned = false;
    entries = entries.map(entry => {
      if (!entry?.state?.libraryPreviewImage) return entry;
      cleaned = true;
      return { ...entry, state: editableResumeState(entry.state) };
    });
    if (cleaned) saveLibrary(entries);
    return entries;
  } catch {
    return [];
  }
}

export function saveLibrary(entries) {
  try {
    localStorage.setItem(CV_LIBRARY_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function relativeUpdatedAt(updatedAt) {
  const minutes = Math.max(0, Math.floor((Date.now() - updatedAt) / 60000));
  if (minutes < 1) return 'Edited just now';
  if (minutes < 60) return `Edited ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Edited ${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Edited ${days} day${days === 1 ? '' : 's'} ago`;
  return `Edited ${new Date(updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

// Icons
const ICONS = {
  plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  pencil: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`,
  trash: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  clock: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  arrowLeft: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
  eye: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  rotateCcw: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`,
  alertTriangle: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  fileText: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  download: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
  spinner: `<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`
};

/**
 * CV Builder App Controller
 */
class CVBuilderApp {
  constructor(container) {
    this.container = container;
    // Allow users to start using the CV builder directly without any upfront barrier
    const hasExistingDraft = !!localStorage.getItem(CV_STATE_KEY);
    const routeParams = new URLSearchParams(location.search);
    const editorRequested = routeParams.has('editor') || routeParams.has('resume');
    this.view = editorRequested ? 'editor' : 'library'; // 'library' | 'editor'
    this.editorDestination = hasExistingDraft ? 'workspace' : 'templates'; // 'templates' | 'workspace'
    this.editorNonce = 1;
    this.library = [];
    this.accountState = 'ready';
    this.libraryStatus = 'loading';
    this.accountUser = null;
    this.activeId = routeParams.get('resume') || localStorage.getItem(CV_ACTIVE_KEY) || '';
    this.defaultId = localStorage.getItem(CV_DEFAULT_JOB_KEY) || '';
    this.searchQuery = '';
    this.pendingDelete = null;
    this.downloadState = 'idle'; // 'idle' | 'preparing' | 'done' | 'error'
    this.downloadFormat = 'pdf';
    this.visibleActionTab = 'hidden';
    this.isNew = !hasExistingDraft;
    this.userDidEdit = false;
    this.authSavePrompt = false;

    if (!editorRequested && location.pathname !== '/resume-library') {
      history.replaceState({ cvView: 'library' }, '', '/resume-library');
    }

    this.bindMessages();
    this.render();
    this.loadCloudLibrary();
  }

  setRoute(url, replace = false) {
    history[replace ? 'replaceState' : 'pushState']({ cvView: this.view }, '', url);
  }

  async loadCloudLibrary() {
    this.libraryStatus = 'loading';
    try {
      const response = await fetch('/api/resumes', { credentials: 'same-origin', signal: AbortSignal.timeout(12000) });
      if (response.status === 401) {
        this.accountState = 'signed-out';
        this.library = [];
        this.libraryStatus = 'signed-out';
      } else if (response.ok) {
        const result = await response.json();
        this.accountState = 'ready';
        this.library = Array.isArray(result.resumes) ? result.resumes : [];
        this.libraryStatus = 'ready';
        if (this.view === 'library') this.render();
        if (localStorage.getItem(CV_PENDING_SAVE_KEY) === 'true' && localStorage.getItem(CV_STATE_KEY)) {
          const draftId = localStorage.getItem(CV_ACTIVE_KEY);
          if (this.library.length >= MAX_CV_LIBRARY && !this.library.some(item => item.id === draftId)) {
            this.showReplacementPicker();
            return;
          }
          const saved = await this.saveCurrentResume(true);
          if (saved) {
            localStorage.removeItem(CV_PENDING_SAVE_KEY);
            this.isNew = false;
            this.userDidEdit = false;
          }
        }
      } else {
        this.libraryStatus = 'error';
      }
    } catch {
      this.libraryStatus = 'error';
    }
    // Only re-render if user is on the library view
    if (this.view === 'library') {
      this.render();
    }
  }

  bindMessages() {
    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(location.search);
      const editorRequested = params.has('editor') || params.has('resume');
      this.view = editorRequested ? 'editor' : 'library';
      if (params.get('resume')) this.activeId = params.get('resume');
      this.render();
    });
    window.addEventListener('message', async (event) => {
      const frame = this.container.querySelector('#cv-builder-iframe');
      if (frame && event.source === frame.contentWindow) {
        const type = event.data?.type;
        if (type === 'medbiomate-cv-download') {
          const req = event.data?.format;
          const fmt = req === 'word' || req === 'png' || req === 'jpeg' ? req : 'pdf';
          await this.downloadCV(fmt);
        } else if (type === 'medbiomate-cv-actions') {
          const tab = event.data?.tab;
          this.visibleActionTab = (tab === 'content' || tab === 'customize') ? tab : 'hidden';
          this.updateActionBar();
        } else if (type === 'medbiomate-cv-tabs-collapsed') {
          frame.closest('.cv-embed-screen')?.classList.toggle('is-tabs-collapsed', event.data.collapsed === true);
          const tabsButton = this.container.querySelector('#btnToggleTabs');
          if (tabsButton) {
            tabsButton.hidden = event.data.collapsed !== true;
            tabsButton.style.setProperty('display', event.data.collapsed === true ? 'inline-flex' : 'none', 'important');
          }
        } else if (type === 'medbiomate-cv-preview-ready') {
          if (frame.dataset.readyScheduled !== 'true') {
            frame.dataset.readyScheduled = 'true';
            const elapsed = performance.now() - (this.editorLoadStarted || 0);
            window.setTimeout(() => {
              if (!frame.isConnected) return;
              frame.classList.add('is-preview-ready');
              frame.closest('.cv-embed-screen')?.classList.add('is-builder-ready');
            }, 0);
          }
        } else if (type === 'medbiomate-cv-dirty') {
          this.userDidEdit = true;
        } else if (type === 'medbiomate-cv-preview-save') {
          await this.saveCurrentResume(true);
          this.returnToLibrary();
        }
      }
    });
    window.addEventListener('resize', () => {
      this.updateActionBar();
    });
  }

  saveUrl(url, fileName) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async captureResumePreview() {
    const frame = this.container.querySelector('#cv-builder-iframe');
    const target = frame?.contentWindow;
    if (!target) return '';
    return new Promise(resolve => {
      let settled = false;
      const finish = (img = '') => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        window.removeEventListener('message', receive);
        resolve(img);
      };
      const receive = (event) => {
        if (event.source !== target || event.data?.type !== 'medbiomate-thumbnail-result') return;
        const image = typeof event.data.image === 'string' ? event.data.image : '';
        finish(image.length > 1200 ? image : '');
      };
      const timer = window.setTimeout(() => finish(''), 5000);
      window.addEventListener('message', receive);
      target.postMessage({ type: 'medbiomate-capture-thumbnail' }, '*');
    });
  }

  async flushEditorState() {
    const frame = this.container.querySelector('#cv-builder-iframe');
    const target = frame?.contentWindow;
    if (!target) return;
    await new Promise(resolve => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        window.removeEventListener('message', receive);
        resolve();
      };
      const receive = (event) => {
        if (event.source !== target || event.data?.type !== 'medbiomate-cv-state-ready') return;
        finish();
      };
      const timer = window.setTimeout(finish, 1500);
      window.addEventListener('message', receive);
      target.postMessage({ type: 'medbiomate-cv-host-action', action: 'workspace-save' }, '*');
    });
  }

  async saveCurrentResume(captureThumbnail = false) {
    try {
      const rawState = localStorage.getItem(CV_STATE_KEY);
      if (!rawState) return false;
      const state = editableResumeState(JSON.parse(rawState));
      if (!state) return false;
      const id = localStorage.getItem(CV_ACTIVE_KEY) || `resume-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem(CV_ACTIVE_KEY, id);

      const entries = this.library;
      const existing = entries.find(r => r.id === id);
      const fullName = String(state.fullName || '').trim();
      const freshPreview = captureThumbnail ? await this.captureResumePreview() : '';
      const previewImage = freshPreview || String(existing?.previewImage || '');

      const entry = {
        id,
        name: fullName ? `${fullName} résumé` : (existing?.name || 'My professional résumé'),
        template: String(state.template || 'classic'),
        updatedAt: Date.now(),
        state,
        previewImage
      };

      const response = await fetch('/api/resumes', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          this.accountState = 'signed-out';
          this.authSavePrompt = true;
          return false;
        }
        if (response.status === 409) {
          localStorage.setItem(CV_PENDING_SAVE_KEY, 'true');
          this.showReplacementPicker();
          return false;
        }
        alert(result.error || 'Unable to save this résumé.');
        return false;
      }
      this.accountState = 'ready';
      this.authSavePrompt = false;
      localStorage.removeItem(CV_PENDING_SAVE_KEY);
      this.library = [result.resume, ...entries.filter(r => r.id !== id)];
      return true;
    } catch (error) {
      console.error('Resume save error:', error);
      this.authSavePrompt = this.accountState === 'signed-out';
      return false;
    }
  }

  openNewResume() {
    if (this.library.length >= MAX_CV_LIBRARY) {
      alert(`CV library limit reached (${MAX_CV_LIBRARY} CVs). Please delete an existing résumé to create a new one.`);
      return;
    }
    const id = `resume-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`.toLowerCase();
    localStorage.setItem(CV_ACTIVE_KEY, id);
    localStorage.removeItem(CV_STATE_KEY);
    this.activeId = id;
    this.isNew = true;
    this.userDidEdit = false;
    this.editorDestination = 'templates';
    this.editorNonce++;
    this.view = 'editor';
    this.setRoute('/services/resume-maker?editor=new');
    this.render();
  }

  editResume(resume) {
    try {
      localStorage.setItem(CV_ACTIVE_KEY, resume.id);
      const editableState = editableResumeState(resume.state);
      if (editableState) localStorage.setItem(CV_STATE_KEY, JSON.stringify(editableState));
      else localStorage.removeItem(CV_STATE_KEY);
    } catch {
      alert('Unable to open this résumé because browser storage is full. Delete an unused résumé and try again.');
      return;
    }
    this.activeId = resume.id;
    this.isNew = false;
    this.userDidEdit = false;
    this.editorDestination = resume.state ? 'workspace' : 'templates';
    this.editorNonce++;
    this.view = 'editor';
    this.setRoute(`/services/resume-maker?resume=${encodeURIComponent(resume.id)}`);
    this.render();
  }

  async returnToLibrary() {
    // A new draft must only enter the library through the explicit Save button.
    // Template initialization emits dirty events, but pressing Back is still a
    // cancellation and must not create a résumé card.
    if (this.isNew) {
      localStorage.removeItem(CV_ACTIVE_KEY);
      localStorage.removeItem(CV_STATE_KEY);
    } else if (this.userDidEdit) {
      await this.saveCurrentResume(true);
    }
    this.view = 'library';
    this.setRoute('/resume-library');
    this.render();
  }

  async saveAndReturnToLibrary(button = null) {
    if (button) {
      button.disabled = true;
      button.classList.add('is-saving');
      const label = button.querySelector('span');
      if (label) label.textContent = 'Saving…';
    }
    await this.flushEditorState();
    const saved = await this.saveCurrentResume(true);
    if (!saved) {
      if (button) {
        button.disabled = false;
        button.classList.remove('is-saving');
        const label = button.querySelector('span');
        if (label) label.textContent = 'Save résumé';
      }
      if (this.authSavePrompt) this.showSaveAccountPrompt();
      else alert('Unable to save this résumé. Please try again.');
      return;
    }
    this.userDidEdit = false;
    this.isNew = false;
    this.view = 'library';
    this.setRoute('/resume-library');
    this.render();
  }

  chooseDefaultResume(resume) {
    localStorage.setItem(CV_DEFAULT_JOB_KEY, resume.id);
    this.defaultId = resume.id;
    this.render();
  }

  confirmDelete(resume) {
    this.pendingDelete = resume;
    this.render();
  }

  showReplacementPicker() {
    this.view = 'library';
    this.setRoute('/resume-library');
    this.renderLibrary();
    const modal = document.createElement('div');
    modal.className = 'cv-modal-backdrop';
    modal.innerHTML = `<div class="cv-modal-box" role="dialog" aria-modal="true" aria-labelledby="cvFullTitle"><h2 id="cvFullTitle">Your Resume library is full</h2><p>Your new draft is safe on this device. Choose a saved Resume to delete, then we’ll save your new one.</p><div id="cvReplacementChoices"></div><button type="button" class="cv-modal-cancel" id="cvReplacementCancel">Not now</button></div>`;
    const choices = modal.querySelector('#cvReplacementChoices');
    this.library.forEach(resume => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cv-modal-cancel';
      button.style.cssText = 'display:block;width:100%;min-height:44px;margin:8px 0;text-align:left';
      button.textContent = `Delete ${resume.name}`;
      button.addEventListener('click', () => this.confirmDelete(resume));
      choices.appendChild(button);
    });
    modal.querySelector('#cvReplacementCancel').addEventListener('click', () => modal.remove());
    this.container.appendChild(modal);
  }

  async executeDelete() {
    if (!this.pendingDelete) return;
    const id = this.pendingDelete.id;
    const response = await fetch(`/api/resumes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin'
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      alert(result.error || 'Unable to delete this résumé.');
      return;
    }
    this.library = this.library.filter(r => r.id !== id);
    const pendingSave = localStorage.getItem(CV_PENDING_SAVE_KEY) === 'true';
    if (!pendingSave && localStorage.getItem(CV_ACTIVE_KEY) === id) {
      localStorage.removeItem(CV_ACTIVE_KEY);
      localStorage.removeItem(CV_STATE_KEY);
    }
    if (this.defaultId === id) {
      localStorage.removeItem(CV_DEFAULT_JOB_KEY);
      this.defaultId = '';
    }
    this.pendingDelete = null;
    if (pendingSave && localStorage.getItem(CV_STATE_KEY)) {
      const saved = await this.saveCurrentResume(false);
      if (saved) { this.isNew = false; this.userDidEdit = false; }
    }
    this.render();
  }

  runCvAction(action) {
    const frame = this.container.querySelector('#cv-builder-iframe');
    frame?.contentWindow?.postMessage({ type: 'medbiomate-cv-host-action', action }, '*');
  }

  expandEditorTabs() {
    const frame = this.container.querySelector('#cv-builder-iframe');
    frame?.contentWindow?.postMessage({ type: 'medbiomate-cv-expand-tabs' }, '*');
  }

  async downloadCV(format = 'pdf') {
    const frame = this.container.querySelector('#cv-builder-iframe');
    const docInside = frame?.contentDocument;
    const preview = docInside?.querySelector('.cv-workspace-preview-column [data-preview]');
    const previewColumn = docInside?.querySelector('.cv-workspace-preview-column');
    if (!docInside || !preview || !previewColumn) {
      this.downloadState = 'error';
      this.renderToast();
      return;
    }

    this.downloadFormat = format;
    this.downloadState = 'preparing';
    this.renderToast();

    const previousStyle = previewColumn.getAttribute('style');
    let previewStyleChanged = false;

    try {
      await docInside.fonts?.ready;
      let profileName = 'Professional CV';
      try {
        const state = JSON.parse(localStorage.getItem(CV_STATE_KEY) || '{}');
        profileName = state.fullName || profileName;
      } catch {}
      const baseName = `${profileName.replace(/[^a-z0-9]+/gi, ' ').trim() || 'Trikonet'} CV`;

      if (format === 'pdf') {
        const pdfBlob = await exportCvAsVectorPdf(docInside, preview, `${baseName}.pdf`);
        const url = URL.createObjectURL(pdfBlob);
        this.saveUrl(url, `${baseName}.pdf`);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      } else if (format === 'word') {
        const css = Array.from(docInside.styleSheets)
          .map(s => { try { return Array.from(s.cssRules).map(r => r.cssText).join('\n'); } catch { return ''; } })
          .join('\n');
        const docHtml = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${baseName}</title><style>${css}@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}.cv-preview{width:210mm!important;max-width:210mm!important;height:auto!important;transform:none!important;box-shadow:none!important}.cv-hidden{display:none!important}</style></head><body>${preview.outerHTML}</body></html>`;
        const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        this.saveUrl(url, `${baseName}.doc`);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      } else {
        previewStyleChanged = true;
        previewColumn.style.setProperty('display', 'flex', 'important');
        previewColumn.style.setProperty('position', 'fixed', 'important');
        previewColumn.style.setProperty('left', '-10000px', 'important');
        previewColumn.style.setProperty('top', '0', 'important');
        previewColumn.style.setProperty('width', '794px', 'important');
        previewColumn.style.setProperty('height', 'auto', 'important');
        previewColumn.style.setProperty('max-height', 'none', 'important');
        previewColumn.style.setProperty('overflow', 'visible', 'important');

        const h2c = window.html2canvas || (await import('/cv-builder-plugin/assets/js/html2canvas.min.js').catch(() => null));
        const canvas = await (window.html2canvas || h2c)(preview, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794
        });
        if (format === 'png') {
          this.saveUrl(canvas.toDataURL('image/png'), `${baseName}.png`);
        } else {
          this.saveUrl(canvas.toDataURL('image/jpeg', 0.98), `${baseName}.jpg`);
        }
      }

      this.downloadState = 'done';
      this.renderToast();
      setTimeout(() => {
        this.downloadState = 'idle';
        this.renderToast();
      }, 3000);
    } catch (err) {
      console.error('Download error:', err);
      this.downloadState = 'error';
      this.renderToast();
    } finally {
      if (previewStyleChanged) {
        if (previousStyle === null) previewColumn.removeAttribute('style');
        else previewColumn.setAttribute('style', previousStyle);
      }
    }
  }

  renderToast() {
    let toast = this.container.querySelector('.cv-download-status');
    if (this.downloadState === 'idle') {
      if (toast) toast.remove();
      return;
    }
    if (!toast) {
      toast = document.createElement('div');
      toast.className = `cv-download-status ${this.downloadState}`;
      this.container.appendChild(toast);
    } else {
      toast.className = `cv-download-status ${this.downloadState}`;
    }

    const fmtLabel = FORMAT_LABELS[this.downloadFormat] || 'PDF';
    toast.innerHTML = `
      ${this.downloadState === 'preparing' ? ICONS.spinner : (this.downloadState === 'done' ? ICONS.check : ICONS.alertTriangle)}
      <div>
        <strong>${this.downloadState === 'preparing' ? `Preparing your ${fmtLabel}…` : (this.downloadState === 'done' ? `${fmtLabel} saved successfully` : 'Download failed')}</strong>
        <small>${this.downloadState === 'preparing' ? 'Please keep this tab open.' : (this.downloadState === 'done' ? 'Check your Downloads folder.' : 'Please try again.')}</small>
      </div>
      ${this.downloadState === 'error' ? `<button type="button" onclick="this.parentElement.remove()" aria-label="Close">✕</button>` : ''}
    `;
  }

  updateActionBar() {
    let bar = this.container.querySelector('.cv-host-actions');
    if (this.view !== 'editor' || this.visibleActionTab === 'hidden' || window.innerWidth > 768) {
      if (bar) bar.remove();
      return;
    }
    if (!bar) {
      bar = document.createElement('nav');
      bar.className = 'cv-host-actions';
      bar.setAttribute('aria-label', 'CV actions');
      this.container.querySelector('.cv-embed-screen.is-fullscreen')?.appendChild(bar);
    }
    bar.innerHTML = `
      <button type="button" class="cv-host-preview" id="cvActionPreview">${ICONS.eye}<span>Preview</span></button>
      ${this.visibleActionTab === 'customize' ? `<button type="button" class="cv-host-reset" id="cvActionReset">${ICONS.rotateCcw}<span>Reset</span></button>` : ''}
      ${this.visibleActionTab === 'content' ? `<button type="button" class="cv-host-add" id="cvActionAdd">${ICONS.plus}<span>Add section</span></button>` : ''}
      <button type="button" class="cv-host-save" id="cvActionDone">${ICONS.check}<span>Save résumé</span></button>
    `;
    bar.querySelector('#cvActionPreview')?.addEventListener('click', () => this.runCvAction('preview'));
    bar.querySelector('#cvActionReset')?.addEventListener('click', () => this.runCvAction('reset-design'));
    bar.querySelector('#cvActionAdd')?.addEventListener('click', () => this.runCvAction('add-section'));
    bar.querySelector('#cvActionDone')?.addEventListener('click', event => this.saveAndReturnToLibrary(event.currentTarget));
  }

  render() {
    if (this.view === 'library') {
      this.renderLibrary();
    } else {
      this.renderEditor();
    }
  }

  showSaveAccountPrompt() {
    this.authSavePrompt = false;
    localStorage.setItem(CV_PENDING_SAVE_KEY, 'true');
    const redirect = encodeURIComponent('/resume-library');
    const existing = document.querySelector('.cv-save-account-modal');
    existing?.remove();
    const modal = document.createElement('div');
    modal.className = 'cv-modal-backdrop cv-save-account-modal';
    modal.innerHTML = `<div class="cv-modal-box cv-save-account-box" role="dialog" aria-modal="true" aria-labelledby="cvSaveAccountTitle" style="position:relative;">
      <button type="button" class="cv-modal-close-btn" style="position:absolute;top:16px;right:18px;background:none;border:none;font-size:22px;cursor:pointer;color:#94a3b8;line-height:1;padding:4px 8px;" aria-label="Close">✕</button>
      <div class="cv-modal-icon-badge">${ICONS.fileText}</div>
      <h2 id="cvSaveAccountTitle">Save your résumé securely</h2>
      <p>Your résumé is ready. Sign in or create a free account to save this exact résumé to your cloud library. Your work will remain on this device while you continue.</p>
      <div class="cv-save-account-actions"><a href="/login?redirect=${redirect}">Sign in and save</a><a href="/register?redirect=${redirect}">Create account</a></div>
      <button type="button" class="cv-save-account-later">Continue editing</button>
    </div>`;
    document.body.appendChild(modal);
    const closeModal = () => {
      localStorage.removeItem(CV_PENDING_SAVE_KEY);
      modal.remove();
    };
    modal.querySelector('.cv-save-account-later')?.addEventListener('click', closeModal);
    modal.querySelector('.cv-modal-close-btn')?.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
  }

  renderAccountGate(state) {
    const isLoading = state === 'loading';
    const redirect = encodeURIComponent('/resume-library');
    this.container.innerHTML = `
      <main class="cv-embed-screen cv-account-screen">
        <header class="cv-embed-header">
          <div class="cv-header-left"><a href="/"><img class="cv-header-logo" src="/assets/logo-black.png" alt="Trikonet"></a><span class="cv-header-label">CV Builder</span></div>
        </header>
        <section class="cv-account-gate" aria-live="polite">
          <div class="cv-account-card">
            <span class="cv-account-icon">${isLoading ? ICONS.spinner : ICONS.fileText}</span>
            <h1>${isLoading ? 'Loading your résumé library…' : state === 'error' ? 'We could not load your library' : 'Sign in to build your résumé'}</h1>
            <p>${isLoading ? 'Connecting securely to your account.' : state === 'error' ? 'Please retry or sign in again.' : 'Your résumés are saved securely to your account. Each account can create up to three résumés.'}</p>
            ${isLoading ? '' : `<div class="cv-account-actions"><a class="cv-account-primary" href="/login?redirect=${redirect}">Sign in</a><a class="cv-account-secondary" href="/register?redirect=${redirect}">Create account</a></div>`}
          </div>
        </section>
      </main>`;
  }

  renderLibrary() {
    const q = this.searchQuery.trim().toLowerCase();
    const matching = this.library.filter(r => r.name.toLowerCase().includes(q));

    this.container.innerHTML = `
      <main class="cv-embed-screen cv-library-screen">
        <header class="cv-embed-header">
          <div class="cv-header-left">
            <a href="/"><img class="cv-header-logo" src="/assets/logo-black.png" alt="Trikonet"></a>
            <span class="cv-header-label">CV Builder</span>
          </div>
          <div class="cv-header-right">
            <a href="/jobs" class="cv-header-return-home">Browse Jobs →</a>
          </div>
        </header>

        <section class="cv-library">
          <div class="cv-library-inner">
            <div class="cv-library-heading">
              <div>
                <small>CV BUILDER</small>
                <h1>My résumés</h1>
                <p aria-live="polite">${this.libraryStatus === 'loading' ? 'Loading your saved résumés…' : this.libraryStatus === 'error' ? 'Library could not load. Please retry.' : this.libraryStatus === 'signed-out' ? 'Sign in to see your saved résumés.' : this.library.length >= MAX_CV_LIBRARY ? 'Library full — delete one to add another.' : 'Create, edit or choose your job CV.'}</p>
                ${this.libraryStatus === 'error' ? '<button type="button" id="cvLibraryRetry">Retry loading</button>' : ''}
                ${this.libraryStatus === 'signed-out' ? '<a href="/login?redirect=/resume-library">Sign in</a>' : ''}
              </div>
              <button type="button" class="cv-create-header-btn${this.library.length >= MAX_CV_LIBRARY ? ' limit-reached' : ''}" id="btnCreateNew">
                ${ICONS.plus} ${this.library.length}/${MAX_CV_LIBRARY}
              </button>
            </div>

            ${this.library.length > 3 ? `
              <label class="cv-library-search">
                ${ICONS.search}
                <input type="text" id="cvSearchInput" value="${this.searchQuery}" placeholder="Search résumés…">
                <span>${matching.length}</span>
              </label>
            ` : ''}

            <div class="cv-library-grid">
              <button type="button" class="cv-new-resume-card${this.library.length >= MAX_CV_LIBRARY ? ' limit-reached' : ''}" id="cardNewResume">
                <span>${ICONS.plus}</span>
                <strong>${this.library.length >= MAX_CV_LIBRARY ? 'Library full' : 'New résumé'}</strong>
                <small>${this.library.length >= MAX_CV_LIBRARY ? 'Delete one CV to add another' : 'Start from a template'}</small>
              </button>

              ${matching.map(resume => {
                const previewSrc = resume.previewImage || `/cv-builder-plugin/${TEMPLATE_PREVIEWS[resume.template] || TEMPLATE_PREVIEWS.classic}`;
                const isDefault = this.defaultId === resume.id;
                return `
                  <article class="cv-saved-resume-card" data-id="${resume.id}">
                    <div class="cv-resume-open" data-edit-id="${resume.id}">
                      <span class="cv-resume-paper">
                        <img src="${previewSrc}" alt="${resume.name}">
                      </span>
                    </div>
                    <div class="cv-resume-card-info">
                      <strong>${resume.name}</strong>
                      <small>${ICONS.clock} ${relativeUpdatedAt(resume.updatedAt)}</small>
                      <div class="cv-resume-card-actions">
                        <button type="button" class="cv-resume-use${isDefault ? ' is-default' : ''}" data-default-id="${resume.id}" aria-label="${isDefault ? 'Active default CV' : 'Use for applications'}" aria-pressed="${isDefault}" title="${isDefault ? 'Active default CV' : 'Use for applications'}">
                          ${ICONS.check}<span>${isDefault ? 'Default' : 'Use for jobs'}</span>
                        </button>
                        <button type="button" class="cv-resume-edit" data-edit-id="${resume.id}" aria-label="Edit résumé" title="Edit résumé">
                          ${ICONS.pencil}
                        </button>
                        <button type="button" class="cv-resume-delete" data-delete-id="${resume.id}" aria-label="Delete résumé" title="Delete résumé">
                          ${ICONS.trash}
                        </button>
                      </div>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>

            ${this.library.length === 0 && this.libraryStatus === 'ready' ? `
              <div class="cv-library-empty">
                ${ICONS.fileText}
                <span>Your saved résumés will appear here. Click "New résumé" to get started!</span>
              </div>
            ` : ''}
          </div>
        </section>

        ${this.pendingDelete ? `
          <div class="cv-modal-backdrop" id="deleteBackdrop">
            <div class="cv-modal-box">
              <div class="cv-modal-icon-badge">${ICONS.alertTriangle}</div>
              <h2>Delete this résumé?</h2>
              <p><strong>${this.pendingDelete.name}</strong> and all of its saved content will be permanently removed.</p>
              <div class="cv-modal-actions">
                <button type="button" class="cv-modal-cancel" id="btnCancelDelete">Cancel</button>
                <button type="button" class="cv-modal-confirm-delete" id="btnConfirmDelete">Delete résumé</button>
              </div>
            </div>
          </div>
        ` : ''}
      </main>
    `;

    // Bind event handlers
    this.container.querySelectorAll('.cv-saved-resume-card').forEach(card => {
      const toolbar = card.querySelector('.cv-resume-card-actions');
      const preview = card.querySelector('.cv-resume-open');
      if (window.innerWidth <= 768 && toolbar && preview) {
        preview.appendChild(toolbar);
        toolbar.addEventListener('click', event => event.stopPropagation());
      }
    });
    this.container.querySelector('#cvLibraryRetry')?.addEventListener('click', () => { this.loadCloudLibrary(); this.renderLibrary(); });
    this.container.querySelector('#btnCreateNew')?.addEventListener('click', () => this.openNewResume());
    this.container.querySelector('#cardNewResume')?.addEventListener('click', () => this.openNewResume());

    const searchInp = this.container.querySelector('#cvSearchInput');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderLibrary();
      });
    }

    this.container.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-id');
        const resume = this.library.find(r => r.id === id);
        if (resume) this.editResume(resume);
      });
    });

    this.container.querySelectorAll('[data-default-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-default-id');
        const resume = this.library.find(r => r.id === id);
        if (resume) this.chooseDefaultResume(resume);
      });
    });

    this.container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-id');
        const resume = this.library.find(r => r.id === id);
        if (resume) this.confirmDelete(resume);
      });
    });

    this.container.querySelector('#btnCancelDelete')?.addEventListener('click', () => {
      this.pendingDelete = null;
      this.renderLibrary();
    });

    this.container.querySelector('#btnConfirmDelete')?.addEventListener('click', async () => {
      await this.executeDelete();
    });
  }

  renderEditor() {
    this.editorLoadStarted = performance.now();
    const route = this.editorDestination === 'templates' ? '#onboarding/templates' : '#cv-workspace';
    const iframeSrc = `/cv-builder-plugin/preview.html?v=20260930-footer31-${this.editorNonce}${route}`;

    this.container.innerHTML = `
      <main class="cv-embed-screen is-fullscreen">
        <header class="cv-embed-header">
          <div class="cv-header-left">
            <a href="/"><img class="cv-header-logo" src="/assets/logo-black.png" alt="Trikonet"></a>
            <button type="button" class="cv-library-return" id="btnEditorBack" title="Back to My résumés">
              ${ICONS.arrowLeft} <span class="cv-back-desktop">Back to My résumés</span><span class="cv-back-mobile">Back</span>
            </button>
          </div>
          <nav class="cv-header-workspace-nav" aria-label="Resume builder tools">
            <button type="button" data-cv-header-action="templates"><span>Templates</span></button>
            <button type="button" class="is-active" data-cv-header-action="content"><span>Content</span></button>
            <button type="button" data-cv-header-action="customize"><span>Customize</span></button>
            <button type="button" data-cv-header-action="download"><span>Download</span></button>
          </nav>
          <div class="cv-editor-header-actions">
            <button type="button" class="cv-header-more-btn" aria-label="More résumé options">&#8942;</button>
            <button type="button" class="cv-header-show-tabs" id="btnToggleTabs" hidden style="display:none!important">Tabs</button>
            <button type="button" class="cv-header-save-btn" id="btnEditorDone">
              ${ICONS.check} <span>Save résumé</span>
            </button>
          </div>
        </header>

        ${this.editorDestination === 'templates' ? '' : `<div class="cv-builder-loading" role="status" aria-live="polite"><span class="cv-builder-loading-spinner" aria-hidden="true"></span><strong>Loading your résumé</strong><small>Preparing the full-size preview…</small></div>`}
        <iframe id="cv-builder-iframe" class="cv-plugin-frame${this.editorDestination === 'templates' ? ' is-preview-ready' : ''}" src="${iframeSrc}" title="Trikonet CV Builder" allow="clipboard-read; clipboard-write"></iframe>
      </main>
    `;

    this.container.querySelector('#btnEditorBack')?.addEventListener('click', () => this.returnToLibrary());
    this.container.querySelector('#btnEditorDone')?.addEventListener('click', event => this.saveAndReturnToLibrary(event.currentTarget));
    this.container.querySelector('#btnToggleTabs')?.addEventListener('click', () => this.expandEditorTabs());
    this.container.querySelectorAll('[data-cv-header-action]').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-cv-header-action');
        this.runCvAction(`workspace-${action}`);
        this.container.querySelectorAll('[data-cv-header-action]').forEach(item => item.classList.toggle('is-active', item === button));
      });
    });

    this.updateActionBar();
  }
}

export function initCVBuilder(mountSelector = '#app') {
  const mount = typeof mountSelector === 'string' ? document.querySelector(mountSelector) : mountSelector;
  if (!mount) return;
  return new CVBuilderApp(mount);
}
