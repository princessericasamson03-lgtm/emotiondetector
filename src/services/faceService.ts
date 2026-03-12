import * as faceapi from '@vladmandic/face-api';

let isLoaded = false;

export async function loadModels() {
  if (isLoaded) return;
  
  const MODEL_URL = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/';
  
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
  ]);
  
  isLoaded = true;
}

export async function detectEmotions(input: HTMLVideoElement | HTMLImageElement) {
  if (!isLoaded) await loadModels();
  
  const detections = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions();
    
  return detections;
}
