const video = document.getElementById('video')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    navigator.mediaDevices.getUserMedia(
        { video: {} }
    ).then(stream => {
        video.srcObject = stream
    }).catch(err => console.error(err))
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        
        // Draw green grid over detected faces
        resizedDetections.forEach(detection => {
            const box = detection.detection.box
            const x = box.x
            const y = box.y
            const width = box.width
            const height = box.height
            
            const lineWidth = 2
            const gridColor = 'green'
            
            // Draw vertical lines
            for (let i = 0; i <= width; i += 10) {
                canvas.getContext('2d').strokeStyle = gridColor
                canvas.getContext('2d').beginPath()
                canvas.getContext('2d').moveTo(x + i, y)
                canvas.getContext('2d').lineTo(x + i, y + height)
                canvas.getContext('2d').lineWidth = lineWidth
                canvas.getContext('2d').stroke()
            }
            
            // Draw horizontal lines
            for (let i = 0; i <= height; i += 10) {
                canvas.getContext('2d').strokeStyle = gridColor
                canvas.getContext('2d').beginPath()
                canvas.getContext('2d').moveTo(x, y + i)
                canvas.getContext('2d').lineTo(x + width, y + i)
                canvas.getContext('2d').lineWidth = lineWidth
                canvas.getContext('2d').stroke()
            }
        })
    }, 100)
})
