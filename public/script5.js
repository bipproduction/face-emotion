const video = document.getElementById('video');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw blue solid shape over detected faces
        resizedDetections.forEach(detection => {
            const landmarks = detection.landmarks;
            const jawOutline = landmarks.getJawOutline();
            const nose = landmarks.getNose();
            
            // Create a path for the face shape
            canvas.getContext('2d').beginPath();
            canvas.getContext('2d').moveTo(jawOutline[0].x, jawOutline[0].y);
            for (let i = 1; i < jawOutline.length; i++) {
                canvas.getContext('2d').lineTo(jawOutline[i].x, jawOutline[i].y);
            }
            for (let i = nose.length - 1; i >= 0; i--) {
                canvas.getContext('2d').lineTo(nose[i].x, nose[i].y);
            }
            canvas.getContext('2d').closePath();
            
            // Fill the shape with blue color
            canvas.getContext('2d').fillStyle = 'blue';
            canvas.getContext('2d').fill();
        });

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }, 100);
});
