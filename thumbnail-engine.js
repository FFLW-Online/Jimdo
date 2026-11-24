/**
 * Thumbnail-Engine v26
 * - Erzeugt genau einmalig beim Upload ein 300x300 Thumbnail mit weißem Innen-Padding
 * - Korrigiert EXIF-Orientierung automatisch (kein verdrehtes Bild mehr)
 * - Komprimiert das Original auf max. 1200px Breite (schont GitHub- & Google-Drive-Speicher)
 * - Verhindert Mega-Scans durch striktes thumbnail_ready-Flag & Aktions-Begrenzung
 */
const ThumbnailEngine = (() => {
    const THUMB_SIZE = 300;
    const MAX_ORIGINAL_WIDTH = 1200;

    // Liest EXIF-Orientierung aus JPEG-Header (1..8)
    function getExifOrientation(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        if (view.getUint16(0, false) !== 0xFFD8) return 1;
        const length = view.byteLength;
        let offset = 2;
        while (offset < length) {
            if (view.getUint16(offset + 2, false) <= 8) return 1;
            const marker = view.getUint16(offset, false);
            offset += 2;
            if (marker === 0xFFE1) {
                if (view.getUint32(offset += 2, false) !== 0x45786966) return 1;
                const little = view.getUint16(offset += 6, false) === 0x4949;
                offset += view.getUint32(offset + 4, little);
                const tags = view.getUint16(offset, little);
                offset += 2;
                for (let i = 0; i < tags; i++) {
                    if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                        return view.getUint16(offset + (i * 12) + 8, little);
                    }
                }
            } else if ((marker & 0xFF00) !== 0xFF00) {
                break;
            } else {
                offset += view.getUint16(offset, false);
            }
        }
        return 1;
    }

    function applyOrientationTransform(ctx, orientation, width, height) {
        switch (orientation) {
            case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
            case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
            case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
            case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
            case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
            case 7: ctx.transform(0, -1, -1, 0, height, width); break;
            case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
            default: break;
        }
    }

    async function processUpload(file) {
        const buffer = await file.arrayBuffer();
        const orientation = getExifOrientation(buffer);
        const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });

        const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = dataUrl;
        });

        const swapDimensions = orientation >= 5 && orientation <= 8;
        const rawW = swapDimensions ? img.height : img.width;
        const rawH = swapDimensions ? img.width : img.height;

        // 1. Aufgerichtetes Basis-Canvas erstellen
        const uprightCanvas = document.createElement("canvas");
        uprightCanvas.width = rawW;
        uprightCanvas.height = rawH;
        const uCtx = uprightCanvas.getContext("2d");
        applyOrientationTransform(uCtx, orientation, img.width, img.height);
        uCtx.drawImage(img, 0, 0);

        // 2. Komprimiertes Original (max 1200px) für uploads/originals/
        const origScale = Math.min(1, MAX_ORIGINAL_WIDTH / rawW);
        const origCanvas = document.createElement("canvas");
        origCanvas.width = Math.round(rawW * origScale);
        origCanvas.height = Math.round(rawH * origScale);
        origCanvas.getContext("2d").drawImage(uprightCanvas, 0, 0, origCanvas.width, origCanvas.height);
        const originalDataUrl = origCanvas.toDataURL("image/jpeg", 0.82);

        // 3. Quadratisches 300x300 Thumbnail mit weißem Innen-Padding für uploads/thumbnails/
        const thumbCanvas = document.createElement("canvas");
        thumbCanvas.width = THUMB_SIZE;
        thumbCanvas.height = THUMB_SIZE;
        const tCtx = thumbCanvas.getContext("2d");
        tCtx.fillStyle = "#ffffff";
        tCtx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE);

        const scale = Math.min(THUMB_SIZE / rawW, THUMB_SIZE / rawH);
        const drawW = Math.round(rawW * scale);
        const drawH = Math.round(rawH * scale);
        const offsetX = Math.round((THUMB_SIZE - drawW) / 2);
        const offsetY = Math.round((THUMB_SIZE - drawH) / 2);
        tCtx.drawImage(uprightCanvas, offsetX, offsetY, drawW, drawH);
        const thumbnailDataUrl = thumbCanvas.toDataURL("image/jpeg", 0.78);

        return {
            originalDataUrl,
            thumbnailDataUrl,
            thumbnail_ready: true
        };
    }

    // Erzeugt ein sauberes Platzhalter-Thumbnail (300x300) für Demo-Artikel ohne Upload
    function createPlaceholderThumb(label, bgColor = "#f8fafc") {
        const canvas = document.createElement("canvas");
        canvas.width = THUMB_SIZE;
        canvas.height = THUMB_SIZE;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, THUMB_SIZE - 20, THUMB_SIZE - 20);
        ctx.fillStyle = "#334155";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, THUMB_SIZE / 2, THUMB_SIZE / 2);
        ctx.font = "13px sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("300x300 Thumbnail", THUMB_SIZE / 2, THUMB_SIZE / 2 + 26);
        return canvas.toDataURL("image/jpeg", 0.8);
    }

    return { processUpload, createPlaceholderThumb };
})();
