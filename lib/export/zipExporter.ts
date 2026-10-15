import JSZip from 'jszip';
import { ProjectData } from '@/types/animation';
import { generateAnimationCSS, getAssetFilename } from './cssGenerator';

export async function createProjectZip(project: ProjectData): Promise<Blob> {
  const zip = new JSZip();

  // Generate CSS, HTML, README in 'zip' mode (references assets/)
  const { css, html, readme } = generateAnimationCSS(project, { mode: 'zip' });

  zip.file('animation.css', css);
  zip.file('index.html', html);
  zip.file('README.md', readme);

  // Add project JSON for portable backups
  zip.file('project.looply.json', JSON.stringify(project, null, 2));

  // Add assets folder
  const assetsFolder = zip.folder('assets');

  if (assetsFolder) {
    const writtenFiles = new Set<string>();
    const assetKeys = Object.keys(project.assets);

    const writeAssetFile = (assetId: string, fallbackIdx: number) => {
      const asset = project.assets[assetId];
      if (!asset || !asset.dataUrl) return;

      const assetIdx = assetKeys.indexOf(assetId);
      const safeAssetName = getAssetFilename(asset, assetIdx >= 0 ? assetIdx : fallbackIdx);
      if (writtenFiles.has(safeAssetName)) return;
      writtenFiles.add(safeAssetName);

      if (asset.dataUrl.startsWith('data:')) {
        const commaIdx = asset.dataUrl.indexOf(',');
        if (commaIdx !== -1) {
          const isBase64 = asset.dataUrl.includes(';base64');
          const payload = asset.dataUrl.substring(commaIdx + 1);

          if (isBase64) {
            assetsFolder.file(safeAssetName, payload, { base64: true });
          } else {
            // SVG or plaintext data URL: decode properly
            let decoded = payload;
            try {
              decoded = decodeURIComponent(payload);
            } catch (e) {
              decoded = payload;
            }
            assetsFolder.file(safeAssetName, decoded);
          }
        }
      }
    };

    // 1. Ensure all assets mapped to active layers in timeline are written
    project.layers.forEach((layer, idx) => {
      writeAssetFile(layer.assetId, idx);
    });

    // 2. Also include all remaining project assets
    assetKeys.forEach((assetId, idx) => {
      writeAssetFile(assetId, idx);
    });
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
