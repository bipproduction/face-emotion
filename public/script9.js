const video = document.getElementById('video');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models') // Menambahkan model untuk deteksi umur dan jenis kelamin
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia(
        { video: true }
    ).then(stream => {
        video.srcObject = stream;
    }).catch(error => {
        console.error('Error accessing the camera:', error);
    });
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors().withFaceExpressions().withAgeAndGender(); // Menambahkan deteksi umur dan jenis kelamin
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        resizedDetections.forEach(async detection => {
            const landmarks = detection.landmarks;
            const jawOutline = landmarks.getJawOutline();

            canvas.getContext('2d').beginPath();
            canvas.getContext('2d').moveTo(jawOutline[0].x, jawOutline[0].y);
            for (let i = 1; i < jawOutline.length; i++) {
                canvas.getContext('2d').lineTo(jawOutline[i].x, jawOutline[i].y);
            }
            canvas.getContext('2d').closePath();

            canvas.getContext('2d').fillStyle = 'blue';
            canvas.getContext('2d').fill();

            const expressions = detection.expressions;
            const sortedExpressions = Object.keys(expressions).sort((a, b) => expressions[b] - expressions[a]);

            const textPosX = detection.detection.box.x;
            const textPosY = detection.detection.box.y + detection.detection.box.height + 20;

            canvas.getContext('2d').font = '18px Arial';
            canvas.getContext('2d').fillStyle = 'white';

            canvas.getContext('2d').fillText(sortedExpressions[0], textPosX, textPosY);

            // Menambahkan teks jenis kelamin
            const gender = detection.gender;
            canvas.getContext('2d').fillText(`Gender: ${gender}`, textPosX, textPosY + 30);

            // Menambahkan teks umur
            const age = Math.round(detection.age);
            canvas.getContext('2d').fillText(`Age: ${age}`, textPosX, textPosY + 60);
        });

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }, 100);
});
