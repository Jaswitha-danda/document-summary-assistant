# Briefly — Document Summary Assistant

Briefly is a responsive, privacy-conscious web application that turns PDFs and scanned images into focused summaries and key points. Processing happens in the browser: uploaded files are never sent to an application server.

## Run it

No package installation is needed. Open `index.html` in a modern browser, or serve this folder with any static web host. An internet connection is required the first time because PDF.js and Tesseract.js load from trusted CDNs.

## Features

- Drag-and-drop and file-picker upload for PDFs, PNG, JPG, and WEBP files
- PDF text extraction via PDF.js, with OCR fallback for scanned PDF pages
- OCR for scanned image documents via Tesseract.js
- Extractive smart summaries in short, medium, and long formats, with duplicate-point filtering
- Key-point extraction, copy-to-clipboard, readable source text, loading states, and error handling
- Responsive layout for mobile and desktop

## Approach (under 200 words)

I chose a static, client-side architecture to keep setup small and protect document privacy. PDF.js reads selectable text from PDFs, while Tesseract.js performs OCR for scanned image files. Both are loaded from CDNs at runtime, so the repository contains no dependency or build folders. After extraction, the app normalizes text, removes common stop words, scores sentences using the frequency of meaningful terms, and gives extra weight to sentences that signal a central requirement or conclusion. The highest-scoring sentences are returned in their original order, producing a compact and readable extractive summary. The requested length controls how many sentences are included. Clear loading messages, upload validation, a 20 MB file limit, and actionable error messages make the flow predictable.

## Deployment

Deploy the folder to Netlify, Vercel, or GitHub Pages as a static site. No build command is required. Before submission, verify that the deployed site can access the CDN scripts and test with both a text-based PDF and a scanned image.

## Submission checklist

- Use branch `E9AF` (per the supplied guidelines)
- Keep the repository public and downloadable
- Do not commit `node_modules`, environment files, or build artifacts
- Provide the GitHub repository link and deployed application URL
