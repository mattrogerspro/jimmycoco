# Screenshot reconstruction benchmark

Source screenshot: `screencapture-klaviyo-campaign-01KVZJR77KP6Y091Q0QTFBFE5Q-web-view-2026-07-22-14_38_12.png`

The original 3600 × 9370px screenshot contains a 1200 × 9078px email canvas at crop coordinates `+1200+126`. The canvas is divided into eight contiguous modules whose heights sum exactly to 9078px.

| Order | Module | Crop |
|---:|---|---|
| 1 | Brand hero and primary CTA | `1200x1736+0+0` |
| 2 | Product story, benefits and CTA | `1200x1440+0+1736` |
| 3 | Five-step heat guide | `1200x1656+0+3176` |
| 4 | Bundle editorial bridge | `1200x664+0+4832` |
| 5 | Bundle copy and product pair | `1200x1056+0+5496` |
| 6 | Closing summer hero | `1200x816+0+6552` |
| 7 | Product value icon grid | `1200x1412+0+7368` |
| 8 | Social and legal footer | `1200x298+0+8780` |

The files in this folder are lossless benchmark slices. Email-optimised copies live under `public/email-assets/test/screenshot-reconstruction/`.

## Fidelity results

- Reassembled lossless slices versus the cropped reference: `0` differing pixels.
- Email-optimised WebP reconstruction versus the reference: `39.31 dB` PSNR.
- `comparison-reference-left-reconstruction-right.webp` shows the reference on the left and the email-optimised reconstruction on the right.
- `compression-difference-map.webp` isolates the remaining WebP compression differences.
