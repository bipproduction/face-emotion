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
        
        // Draw 3D grid over detected faces
        resizedDetections.forEach(detection => {
            const landmarks = detection.landmarks;
            const jawOutline = landmarks.getJawOutline();
            const nose = landmarks.getNose();
            
            // Draw grid lines
            canvas.getContext('2d').lineWidth = 2;
            canvas.getContext('2d').strokeStyle = 'green';
            
            // Draw horizontal lines
            for (let i = 0; i < jawOutline.length; i++) {
                canvas.getContext('2d').beginPath();
                canvas.getContext('2d').moveTo(jawOutline[i].x, jawOutline[i].y);
                canvas.getContext('2d').lineTo(nose[3].x, nose[3].y);
                canvas.getContext('2d').stroke();
            }
            
            // Draw vertical lines
            for (let i = 0; i < nose.length; i++) {
                canvas.getContext('2d').beginPath();
                canvas.getContext('2d').moveTo(nose[i].x, nose[i].y);
                canvas.getContext('2d').lineTo(nose[3].x, nose[3].y);
                canvas.getContext('2d').stroke();
            }
        });

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }, 100);
});
