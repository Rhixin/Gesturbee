// This is the updated getGesturbeeCamera utility function
export function getGesturbeeCamera(title: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body {
        margin: 0; 
        background-color: white; 
        color: white; 
        font-family: sans-serif;
        display: flex; 
        flex-direction: column; 
        align-items: center;
        padding: 10px;
      }
      h1 {
        font-size: 18px;
        margin-bottom: 10px;
        color: black;
      }
      #output_canvas {
        border: 2px solid #e0a405;
        border-radius: 8px;
      }
      #loading {
        margin-top: 10px;
        font-size: 14px;
        color: #888;
      }
      #error {
        margin-top: 10px;
        color: red;
        display: none;
      }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <video id="input_video" style="display:none" playsinline></video>
    <canvas id="output_canvas" width="400" height="400"></canvas>
    <div id="loading">Loading hand tracking...</div>
    <div id="error"></div>

    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>

    <script>
      const videoElement = document.getElementById('input_video');
      const canvasElement = document.getElementById('output_canvas');
      const canvasCtx = canvasElement.getContext('2d');
      const loadingElem = document.getElementById('loading');
      const errorElem = document.getElementById('error');
      
      let camera;
      let hands;
      
      // Initialize MediaPipe Hands
      function initializeHandTracking() {
        hands = new Hands({
          locateFile: (file) => {
            return 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/' + file;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        });

        hands.onResults(onResults);
      }
      
      function onResults(results) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        if (results.image) {
          canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        }

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];

          // Draw connections
          const connections = Hands.HAND_CONNECTIONS || [
            [0,1],[1,2],[2,3],[3,4],
            [0,5],[5,6],[6,7],[7,8],
            [5,9],[9,10],[10,11],[11,12],
            [9,13],[13,14],[14,15],[15,16],
            [13,17],[17,18],[18,19],[19,20],
            [0,17]
          ];

          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = '#e0a405';

          for (const [startIdx, endIdx] of connections) {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];
            canvasCtx.beginPath();
            canvasCtx.moveTo(start.x * canvasElement.width, start.y * canvasElement.height);
            canvasCtx.lineTo(end.x * canvasElement.width, end.y * canvasElement.height);
            canvasCtx.stroke();
          }

          // Draw landmarks
          for (const point of landmarks) {
            canvasCtx.beginPath();
            canvasCtx.arc(point.x * canvasElement.width, point.y * canvasElement.height, 5, 0, 2 * Math.PI);
            canvasCtx.fillStyle = '#ffcc00';
            canvasCtx.fill();
          }
        }

        canvasCtx.restore();
        loadingElem.style.display = 'none';
      }

      // Start camera with error handling
      function startCamera() {
        loadingElem.textContent = 'Requesting camera permission...';
        loadingElem.style.display = 'block';
        
        
        // Initialize MediaPipe hands
        initializeHandTracking();
        
        // Request camera permissions with specific constraints
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 400 },
            height: { ideal: 400 }
          },
          audio: false
        })
        .then(stream => {
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            loadingElem.textContent = 'Loading hand tracking...';
            
            // Initialize Camera after permissions granted
            camera = new Camera(videoElement, {
              onFrame: async () => {
                try {
                  await hands.send({image: videoElement});
                } catch (err) {
                  console.error('Error in hand tracking:', err);
                }
              },
              width: 400,
              height: 400
            });
            
            try {
              camera.start();
            } catch (err) {
              showError('Failed to start camera: ' + err.message);
            }
          };
        })
        .catch(err => {
          showError('Camera permission denied or error: ' + err.message);
          // Try informing parent React Native app about the error
          try {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: 'Camera permission denied: ' + err.message
              }));
            }
          } catch (e) {
            console.error('Failed to send message to React Native:', e);
          }
        });
      }
      
      function showError(message) {
        loadingElem.style.display = 'none';
        errorElem.textContent = message;
        errorElem.style.display = 'block';
        console.error(message);
      }
      
      // Start camera automatically when page loads
      document.addEventListener('DOMContentLoaded', function() {
        // Try to start camera automatically
        startCamera();
        
        // Report readiness to React Native
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ready'
          }));
        }
      });
      
      // Optional: Message handling from React Native
      window.addEventListener('message', function(event) {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'startCamera') {
            startCamera();
          }
        } catch (e) {
          console.error('Invalid message from React Native:', e);
        }
      });
    </script>
  </body>
  </html>
  `;
}
