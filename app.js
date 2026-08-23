/* global pdfjsLib, Tesseract */
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const els = {
  dropZone: document.querySelector('#drop-zone'), input: document.querySelector('#file-input'), browse: document.querySelector('#browse-button'),
  fileCard: document.querySelector('#file-card'), fileName: document.querySelector('#file-name'), fileMeta: document.querySelector('#file-meta'), fileType: document.querySelector('#file-type'), remove: document.querySelector('#remove-button'),
  controls: document.querySelector('#controls'), summarize: document.querySelector('#summarize-button'), status: document.querySelector('#status'), statusText: document.querySelector('#status-text'), error: document.querySelector('#error-message'),
  results: document.querySelector('#results'), summary: document.querySelector('#summary-text'), points: document.querySelector('#key-points-list'), source: document.querySelector('#source-text'), words: document.querySelector('#word-count'), copy: document.querySelector('#copy-button')
};
let selectedFile = null;

if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
els.browse.addEventListener('click', (event) => { event.stopPropagation(); els.input.click(); });
els.dropZone.addEventListener('click', (event) => { if (event.target !== els.input && event.target !== els.browse) els.input.click(); });
els.dropZone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') els.input.click(); });
els.input.addEventListener('change', () => selectFile(els.input.files[0]));
['dragenter', 'dragover'].forEach((name) => els.dropZone.addEventListener(name, (event) => { event.preventDefault(); els.dropZone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach((name) => els.dropZone.addEventListener(name, (event) => { event.preventDefault(); els.dropZone.classList.remove('dragging'); }));
els.dropZone.addEventListener('drop', (event) => selectFile(event.dataTransfer.files[0]));
els.remove.addEventListener('click', reset);
els.summarize.addEventListener('click', summarizeDocument);
els.copy.addEventListener('click', async () => { await navigator.clipboard.writeText(els.summary.textContent); els.copy.textContent = 'Copied!'; setTimeout(() => { els.copy.textContent = 'Copy summary'; }, 1600); });

function selectFile(file) {
  clearError(); els.results.classList.add('hidden');
  if (!file) return;
  if (file.size > MAX_FILE_SIZE) return showError('Please choose a document smaller than 20 MB.');
  if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) return showError('Briefly supports PDF, PNG, JPG, and WEBP files.');
  selectedFile = file;
  els.fileName.textContent = file.name;
  els.fileMeta.textContent = `${file.type === 'application/pdf' ? 'PDF document' : 'Image document'} · ${formatBytes(file.size)}`;
  els.fileType.textContent = file.type === 'application/pdf' ? 'PDF' : 'IMG';
  els.dropZone.classList.add('hidden'); els.fileCard.classList.remove('hidden'); els.controls.classList.remove('hidden');
}
function reset() { selectedFile = null; els.input.value = ''; els.dropZone.classList.remove('hidden'); els.fileCard.classList.add('hidden'); els.controls.classList.add('hidden'); els.results.classList.add('hidden'); clearError(); }
function formatBytes(bytes) { return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 1 : 2)} MB`; }
function setLoading(active, message = 'Reading your document…') { els.statusText.textContent = message; els.status.classList.toggle('hidden', !active); els.summarize.disabled = active; els.summarize.style.opacity = active ? '.65' : '1'; }
function showError(message) { els.error.textContent = message; els.error.classList.remove('hidden'); }
function clearError() { els.error.classList.add('hidden'); els.error.textContent = ''; }

async function summarizeDocument() {
  if (!selectedFile) return;
  clearError(); els.results.classList.add('hidden');
  try {
    setLoading(true, selectedFile.type === 'application/pdf' ? 'Extracting text from your PDF…' : 'Reading your scanned image with OCR…');
    const text = selectedFile.type === 'application/pdf' ? await extractPdfText(selectedFile) : await extractImageText(selectedFile);
    if (text.trim().length < 60) throw new Error('There was not enough readable text to summarize. Try a clearer scan or a text-based PDF.');
    setLoading(true, 'Finding the important ideas…');
    const length = document.querySelector('input[name="length"]:checked').value;
    const result = buildSummary(text, length);
    renderResults(text, result);
  } catch (error) { showError(error.message || 'Something went wrong while processing this document. Please try another file.'); }
  finally { setLoading(false); }
}
async function extractPdfText(file) {
  if (!window.pdfjsLib) throw new Error('The PDF reader could not load. Please check your internet connection and try again.');
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    setLoading(true, `Reading page ${pageNumber} of ${pdf.numPages}…`);
    const content = await (await pdf.getPage(pageNumber)).getTextContent();
    pages.push(content.items.map((item) => item.str).join(' '));
  }
  return pages.join('\n\n');
}
async function extractImageText(file) {
  if (!window.Tesseract) throw new Error('The OCR reader could not load. Please check your internet connection and try again.');
  const result = await Tesseract.recognize(file, 'eng', { logger: (message) => { if (message.status === 'recognizing text') setLoading(true, `Reading image… ${Math.round(message.progress * 100)}%`); } });
  return result.data.text;
}
function buildSummary(text, length) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter((sentence) => sentence.split(' ').length > 4) || [];
  const frequency = wordFrequency(cleaned);
  const scored = sentences.map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence, frequency) }));
  const count = length === 'short' ? 2 : length === 'medium' ? 4 : 6;
  const chosen = scored.sort((a, b) => b.score - a.score).slice(0, Math.min(count, scored.length)).sort((a, b) => a.index - b.index).map((item) => item.sentence);
  const points = scored.sort((a, b) => b.score - a.score).filter((item) => item.sentence.length < 260).slice(0, 5).map((item) => item.sentence);
  return { summary: chosen.join(' '), points };
}
function wordFrequency(text) {
  const stopWords = new Set('a an and are as at be by for from has have in is it its of on or that the this to was were will with you your we our they their not can may should would about into than then also such'.split(' '));
  return text.toLowerCase().match(/[a-z]{3,}/g).reduce((map, word) => { if (!stopWords.has(word)) map[word] = (map[word] || 0) + 1; return map; }, {});
}
function scoreSentence(sentence, frequency) { const words = sentence.toLowerCase().match(/[a-z]{3,}/g) || []; return words.reduce((sum, word) => sum + (frequency[word] || 0), 0) / Math.max(words.length, 1) + (/(important|key|main|must|should|goal|result|conclusion)/i.test(sentence) ? 2 : 0); }
function renderResults(text, result) { els.summary.textContent = result.summary; els.points.replaceChildren(...result.points.map((point) => { const item = document.createElement('li'); item.textContent = point; return item; })); els.source.textContent = text; els.words.textContent = `${text.trim().split(/\s+/).length.toLocaleString()} words read`; els.results.classList.remove('hidden'); els.results.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
