import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import * as deeplab from '@tensorflow-models/deeplab';
//import * as tfconv from '@tensorflow/tfjs-converter';
//import * as bodyPix from '@tensorflow-models/body-pix';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  selectedImage: any
  title = 'removebg';

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = async () => {
      const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
      const segmenterConfig: any = {
        runtime: 'mediapipe', // or 'tfjs'
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
        modelType: 'general',
      }
      
      const segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
      // Predecir la máscara de segmentación
      const segmentation = await segmenter.segmentPeople(image);
      
      const foregroundColor = {r: 255, g: 255, b: 255, a: 15};
      const backgroundColor = {r: 255, g: 255, b: 255, a: 250};
      const foregroundThreshold = 0.8;
      const back = await bodySegmentation.toBinaryMask(segmentation, foregroundColor, backgroundColor, false, foregroundThreshold);
      const opacity = 1;
      const maskBlurAmount = 3;
      const edgeBlurAmount = 100;
      const flipHorizontal = false;

      // Crear una imagen en blanco para el fondo
      const canvas = document.createElement('canvas');
      await bodySegmentation.drawBokehEffect(
        canvas, image, segmentation, 1, 100,
        edgeBlurAmount, flipHorizontal);

      await bodySegmentation.drawMask(
        canvas, image, back, opacity, maskBlurAmount, flipHorizontal);

      const ctx: any = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);

      // Actualizar la imagen seleccionada
      this.selectedImage = canvas.toDataURL();

    }
  };

}
