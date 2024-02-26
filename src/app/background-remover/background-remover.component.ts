import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

@Component({
  selector: 'app-background-remover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background-remover.component.html',
  styleUrl: './background-remover.component.scss'
})
export class BackgroundRemoverComponent {
  img_original: any[] = [];
  img_edited: string[] = [];

  showUploader = true;

  async removeBackground() {
    const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
    const segmenterConfig: any = {
      runtime: 'mediapipe', // or 'tfjs'
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
      modelType: 'general',
    };
    const foregroundColor = { r: 255, g: 255, b: 255, a: 15 };
    const backgroundColor = { r: 255, g: 255, b: 255, a: 250 };
    const foregroundThreshold = 0.8;

    const opacity = 1;
    const maskBlurAmount = 3;
    const edgeBlurAmount = 100;
    const flipHorizontal = false;

    for (let image of this.img_original) {
      const segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
      const segmentation = await segmenter.segmentPeople(image);

      const back = await bodySegmentation.toBinaryMask(segmentation, foregroundColor, backgroundColor, false, foregroundThreshold);

      const canvas = document.createElement('canvas');
      await bodySegmentation.drawBokehEffect(
        canvas, image, segmentation, 1, 100,
        edgeBlurAmount, flipHorizontal);

      await bodySegmentation.drawMask(
        canvas, image, back, opacity, maskBlurAmount, flipHorizontal);

      const ctx: any = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);

      this.img_edited.push(canvas.toDataURL());
    };
  };

  async onFileSelected(event: any) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const image = new Image();
      image.src = URL.createObjectURL(files[i]);
      image.onload = async () => {
        this.img_original.push(image);
      };
    };
    this.showUploader = false;
  };

}
