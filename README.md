# Briefly — Document Summary Assistant

Briefly is a responsive web application that turns PDFs and scanned images into focused summaries and key points. Uploaded documents are processed in the browser.

## Features

- Upload PDFs and images using drag-and-drop or file picker
- PDF text extraction using PDF.js
- OCR for scanned images and scanned PDF pages using Tesseract.js
- Short, medium, and long summary options
- Key points, keywords, reading time, page count, and copy-summary option
- Loading states and error handling
- Mobile-responsive interface

## Run the Project

No installation is needed.

Open `index.html` in a modern browser, or deploy the folder to Netlify, Vercel, or GitHub Pages.

An internet connection is required because PDF.js and Tesseract.js are loaded from CDNs.

## Approach

The application uses a client-side approach to keep setup simple and avoid sending uploaded documents to a server. PDF.js extracts selectable text from PDFs. For scanned PDFs or images where selectable text is unavailable, Tesseract.js performs OCR. The app then scores meaningful sentences by keyword frequency and relevance, removes duplicate ideas, and returns the highest-ranking sentences in their original order. Users can choose short, medium, or long summaries. The app includes validation, loading feedback, OCR status, page count, reading time, key points, and extracted-text viewing.

## Deployment

Live application: https://marvelous-crisp-33271e.netlify.app

GitHub repository: https://github.com/Jaswitha-danda/document-summary-assistant
