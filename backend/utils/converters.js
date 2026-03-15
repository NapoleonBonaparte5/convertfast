const path = require('path');
const fs = require('fs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const XLSX = require('xlsx');
const mammoth = require('mammoth');
const logger = require('./logger');

// Sharp es opcional - si no está instalado se usa ffmpeg como fallback
let sharp;
try { sharp = require('sharp'); } catch(e) { sharp = null; logger.warn('sharp no disponible, usando fallback'); }

// ============================
// PDF CONVERSIONES
// ============================

async function pdfToTxt(inputPath, outputPath) {
  const PDFParser = require('pdf2json');
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on('pdfParser_dataReady', () => {
      try {
        const text = pdfParser.getRawTextContent();
        fs.writeFileSync(outputPath, text, 'utf8');
        resolve();
      } catch(e) { reject(e); }
    });
    pdfParser.on('pdfParser_dataError', reject);
    pdfParser.loadPDF(inputPath);
  });
}

async function pdfToJpg(inputPath, outputPath, options = {}) {
  const { execSync } = require('child_process');
  const tempDir = path.dirname(outputPath);
  const baseName = path.basename(outputPath, '.jpg');
  try {
    execSync(`pdftoppm -jpeg -r 150 -f 1 -l 1 "${inputPath}" "${path.join(tempDir, baseName)}"`);
    const generatedFile = `${path.join(tempDir, baseName)}-1.jpg`;
    if (fs.existsSync(generatedFile)) fs.renameSync(generatedFile, outputPath);
  } catch(e) {
    logger.warn('pdftoppm no disponible');
    if (sharp) {
      await sharp({ create: { width: 595, height: 842, channels: 3, background: { r: 255, g: 255, b: 255 } } }).jpeg().toFile(outputPath);
    } else {
      fs.writeFileSync(outputPath, Buffer.alloc(0));
    }
  }
}

async function pdfToPng(inputPath, outputPath, options = {}) {
  const { execSync } = require('child_process');
  const tempDir = path.dirname(outputPath);
  const baseName = path.basename(outputPath, '.png');
  try {
    execSync(`pdftoppm -png -r 150 -f 1 -l 1 "${inputPath}" "${path.join(tempDir, baseName)}"`);
    const generatedFile = `${path.join(tempDir, baseName)}-1.png`;
    if (fs.existsSync(generatedFile)) fs.renameSync(generatedFile, outputPath);
  } catch(e) {
    logger.warn('pdftoppm no disponible');
    if (sharp) {
      await sharp({ create: { width: 595, height: 842, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } }).png().toFile(outputPath);
    } else {
      fs.writeFileSync(outputPath, Buffer.alloc(0));
    }
  }
}

async function docxToPdf(inputPath, outputPath, options = {}) {
  const { execSync } = require('child_process');
  const outputDir = path.dirname(outputPath);
  try {
    execSync(`libreoffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const generatedPdf = path.join(outputDir, `${baseName}.pdf`);
    if (fs.existsSync(generatedPdf)) fs.renameSync(generatedPdf, outputPath);
  } catch(e) {
    logger.warn('LibreOffice no disponible, usando fallback');
    const result = await mammoth.extractRawText({ path: inputPath });
    const text = result.value;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const lines = text.split('\n').slice(0, 50);
    let y = 800;
    for (const line of lines) {
      if (y < 50) break;
      page.drawText((line || ' ').substring(0, 80), { x: 50, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 16;
    }
    fs.writeFileSync(outputPath, await pdfDoc.save());
  }
}

async function pdfToDocx(inputPath, outputPath, options = {}) {
  const { execSync } = require('child_process');
  try {
    execSync(`python3 -c "from pdf2docx import Converter; cv = Converter('${inputPath}'); cv.convert('${outputPath}'); cv.close()"`);
  } catch(e) {
    logger.warn('pdf2docx no disponible, usando fallback');
    const PDFParser = require('pdf2json');
    const { Document, Paragraph, TextRun, Packer } = require('docx');
    const text = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);
      pdfParser.on('pdfParser_dataReady', () => resolve(pdfParser.getRawTextContent()));
      pdfParser.on('pdfParser_dataError', reject);
      pdfParser.loadPDF(inputPath);
    });
    const paragraphs = text.split('\n').filter(l => l.trim()).map(line =>
      new Paragraph({ children: [new TextRun(line)] })
    );
    const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
    fs.writeFileSync(outputPath, await Packer.toBuffer(doc));
  }
}

async function txtToPdf(inputPath, outputPath) {
  const text = fs.readFileSync(inputPath, 'utf8');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  const lines = text.split('\n');
  let page = pdfDoc.addPage([595, 842]);
  let y = 800;
  for (const line of lines) {
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    page.drawText((line || ' ').substring(0, 85), { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
    y -= 14;
  }
  fs.writeFileSync(outputPath, await pdfDoc.save());
}

async function htmlToPdf(inputPath, outputPath) {
  const { execSync } = require('child_process');
  try {
    execSync(`chromium-browser --headless --disable-gpu --print-to-pdf="${outputPath}" "file://${inputPath}"`, { timeout: 30000 });
  } catch(e) {
    const html = fs.readFileSync(inputPath, 'utf8');
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([595, 842]);
    page.drawText(text.substring(0, 2000), { x: 50, y: 750, size: 10, font, color: rgb(0, 0, 0), maxWidth: 495, lineHeight: 14 });
    fs.writeFileSync(outputPath, await pdfDoc.save());
  }
}

// ============================
// IMAGEN CONVERSIONES
// ============================

async function imageConvert(inputPath, outputPath, options = {}) {
  if (!sharp) {
    const { execSync } = require('child_process');
    try {
      execSync(`ffmpeg -i "${inputPath}" "${outputPath}" -y`);
      return;
    } catch(e) {
      throw new Error('Conversion de imagen no disponible. Intenta con otro formato.');
    }
  }
  const { outputExt, quality = 85, compress = false } = options;
  let pipeline = sharp(inputPath, { failOnError: false });
  if (compress) pipeline = pipeline.resize({ width: 2000, withoutEnlargement: true });
  switch (outputExt) {
    case 'jpg': case 'jpeg':
      await pipeline.jpeg({ quality, mozjpeg: true }).toFile(outputPath); break;
    case 'png':
      await pipeline.png({ compressionLevel: compress ? 9 : 6 }).toFile(outputPath); break;
    case 'webp':
      await pipeline.webp({ quality, effort: 4 }).toFile(outputPath); break;
    case 'gif':
      await pipeline.gif().toFile(outputPath); break;
    case 'bmp':
      await pipeline.bmp().toFile(outputPath); break;
    case 'tiff':
      await pipeline.tiff({ compression: 'lzw' }).toFile(outputPath); break;
    default:
      await pipeline.toFile(outputPath);
  }
}

async function imageToPdf(inputPath, outputPath) {
  const pdfDoc = await PDFDocument.create();
  const ext = path.extname(inputPath).toLowerCase();
  let imgBuffer = fs.readFileSync(inputPath);
  let image;
  if (ext === '.jpg' || ext === '.jpeg') {
    image = await pdfDoc.embedJpg(imgBuffer);
  } else {
    if (sharp) {
      imgBuffer = await sharp(inputPath).png().toBuffer();
    }
    image = await pdfDoc.embedPng(imgBuffer);
  }
  const { width, height } = image.scale(1);
  const page = pdfDoc.addPage([width, height]);
  page.drawImage(image, { x: 0, y: 0, width, height });
  fs.writeFileSync(outputPath, await pdfDoc.save());
}

async function gifToMp4(inputPath, outputPath) {
  const ffmpeg = require('fluent-ffmpeg');
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-movflags faststart', '-pix_fmt yuv420p', '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2'])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

// ============================
// AUDIO/VIDEO CONVERSIONES
// ============================

async function audioConvert(inputPath, outputPath, options = {}) {
  const ffmpeg = require('fluent-ffmpeg');
  const { outputExt, quality = 'medium' } = options;
  const bitrateMap = { high: '320k', medium: '192k', low: '128k' };
  const bitrate = bitrateMap[quality] || '192k';
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath);
    if (outputExt === 'mp3') cmd = cmd.audioCodec('libmp3lame').audioBitrate(bitrate);
    else if (outputExt === 'wav') cmd = cmd.audioCodec('pcm_s16le');
    else if (outputExt === 'ogg') cmd = cmd.audioCodec('libvorbis');
    else if (outputExt === 'flac') cmd = cmd.audioCodec('flac');
    else if (outputExt === 'aac') cmd = cmd.audioCodec('aac').audioBitrate(bitrate);
    cmd.output(outputPath).on('end', resolve).on('error', reject).run();
  });
}

async function videoToAudio(inputPath, outputPath, options = {}) {
  const ffmpeg = require('fluent-ffmpeg');
  const { outputExt } = options;
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath).noVideo();
    if (outputExt === 'mp3') cmd = cmd.audioCodec('libmp3lame').audioBitrate('192k');
    else if (outputExt === 'wav') cmd = cmd.audioCodec('pcm_s16le');
    cmd.output(outputPath).on('end', resolve).on('error', reject).run();
  });
}

async function videoConvert(inputPath, outputPath, options = {}) {
  const ffmpeg = require('fluent-ffmpeg');
  const { outputExt, quality = 'medium' } = options;
  const crfMap = { high: 18, medium: 23, low: 28 };
  const crf = crfMap[quality] || 23;
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath);
    if (outputExt === 'mp4') {
      cmd = cmd.videoCodec('libx264').audioCodec('aac')
        .outputOptions([`-crf ${crf}`, '-preset fast', '-movflags faststart', '-pix_fmt yuv420p']);
    } else if (outputExt === 'webm') {
      cmd = cmd.videoCodec('libvpx-vp9').audioCodec('libopus').outputOptions([`-crf ${crf}`, '-b:v 0']);
    } else if (outputExt === 'avi') {
      cmd = cmd.videoCodec('libxvid').audioCodec('libmp3lame');
    }
    cmd.output(outputPath).on('end', resolve).on('error', (err) => { logger.error(`FFmpeg error: ${err.message}`); reject(err); }).run();
  });
}

// ============================
// DATOS/TEXTO CONVERSIONES
// ============================

async function xlsxToCsv(inputPath, outputPath) {
  const workbook = XLSX.readFile(inputPath);
  const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
  fs.writeFileSync(outputPath, csv, 'utf8');
}

async function csvToXlsx(inputPath, outputPath) {
  const csv = fs.readFileSync(inputPath, 'utf8');
  const workbook = XLSX.read(csv, { type: 'string' });
  XLSX.writeFile(workbook, outputPath);
}

async function jsonToCsv(inputPath, outputPath) {
  const json = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const data = Array.isArray(json) ? json : [json];
  if (data.length === 0) { fs.writeFileSync(outputPath, '', 'utf8'); return; }
  const headers = Object.keys(data[0]);
  const rows = [headers.join(',')];
  for (const row of data) {
    rows.push(headers.map(h => {
      const val = row[h] ?? '';
      const str = String(val);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(','));
  }
  fs.writeFileSync(outputPath, rows.join('\n'), 'utf8');
}

async function csvToJson(inputPath, outputPath) {
  const workbook = XLSX.readFile(inputPath);
  const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), 'utf8');
}

async function txtToHtml(inputPath, outputPath) {
  const text = fs.readFileSync(inputPath, 'utf8');
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const paragraphs = escaped.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n');
  fs.writeFileSync(outputPath, `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Documento</title></head><body>${paragraphs}</body></html>`, 'utf8');
}

async function htmlToTxt(inputPath, outputPath) {
  const html = fs.readFileSync(inputPath, 'utf8');
  const text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  fs.writeFileSync(outputPath, text, 'utf8');
}

async function mdToHtml(inputPath, outputPath) {
  const md = fs.readFileSync(inputPath, 'utf8');
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>');
  fs.writeFileSync(outputPath, `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Documento</title></head><body><p>${html}</p></body></html>`, 'utf8');
}

async function mdToPdf(inputPath, outputPath) {
  const tempHtml = inputPath.replace('.md', '_temp.html');
  await mdToHtml(inputPath, tempHtml);
  await htmlToPdf(tempHtml, outputPath);
  if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
}

async function extractZip(inputPath, outputPath) {
  const { decompress } = require('compressing');
  const outputDir = outputPath.replace('.files', '');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  await decompress.zip.uncompress(inputPath, outputDir);
  const files = fs.readdirSync(outputDir);
  fs.writeFileSync(outputPath + '.txt', `Archivos extraidos:\n${files.join('\n')}`, 'utf8');
}

module.exports = {
  pdfToTxt, pdfToJpg, pdfToPng, pdfToDocx,
  docxToPdf, txtToPdf, htmlToPdf,
  imageConvert, imageToPdf, gifToMp4,
  audioConvert, videoToAudio, videoConvert,
  xlsxToCsv, csvToXlsx, jsonToCsv, csvToJson,
  txtToHtml, htmlToTxt, mdToHtml, mdToPdf,
  extractZip,
};
