import React, { useState, useRef, useEffect } from 'react';
  import Webcam from 'react-webcam';
  import Tesseract from 'tesseract.js';
  import ReactBlur from 'react-blur'; // Import react-blur
  import PerspectiveTransform from 'perspective-transform';
  import { useRouter } from 'next/router'; // Import the useRouter hook
 
  const OCR3 = () => {
    const [image, setImage] = useState('');
    const router = useRouter(); // Initialize the useRouter hook
    const [isLoaded, setIsLoaded] = useState(false); // Track image loading
    const [croppedImage, setCroppedImage] = useState('')
    const [openWebcamDelay, setOpenWebcamDelay] = useState(true);
    const [capturedText, setCapturedText] = useState('');
    const [boundingBox, setBoundingBox] = useState(null);
    const [isZoomed, setZoomed] = useState(false);
    const [selectedTest, setSelectedTest] = useState('');
    const webcamRef = useRef(null);
    const [isWebcamEnabled, setWebcamEnabled] = useState(false);
    const [isWebcamReady, setWebcamReady] = useState(false)
    const [isBackgroundBlurred, setBackgroundBlurred] = useState(false);
    const blurredCanvasRef = useRef(null);
    const [isGrayscale, setGrayscale] = useState(false);
    const [isBinarized, setBinarized] = useState(false);
    const toggleBackgroundBlur = () => {
      setBackgroundBlurred(!isBackgroundBlurred);
    };
    const [isDeskewed, setDeskewed] = useState(false);

    const handleToggleZoom = () => {

      
    // Disable deskewing when zooming is enabled
    if (isZoomed && isDeskewed) {
      setDeskewed(false);
    }
    setZoomed(!isZoomed);
  };

  useEffect(() => {
    if (image && isLoaded) {
      // Load and process the image here
      processImage();
    }
  }, [image, isLoaded]);

  const processImage = async () => {
    // Capture the image
    captureImage();
    const img = new Image();
    img.onload = async () => {
      console.log('Image loaded:', img); // Add this line for debugging
      await applyDeskewing(img); // Pass the img object to applyDeskewing
      // ...
    };
    img.src = image;
  
  

    // Wait for a moment before starting the processing sequence
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 1 second delay

    // Continue with processing steps
    await applyDeskewing();
    await applyBlur();
    await applyGrayscale();
    await applyBinarization();
    await applyZoom();
    await applyCropImage();
    await extractTextFromImage();

    handleToggleZoom();

      await applyZoom();
      await applyCropImage();
      await extractTextFromImage();
    
  };


  const applyBlurEffect = (canvas, blurRadius) => {
    const ctx = canvas.getContext('2d');
    ctx.filter = `blur(${blurRadius}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none'; // Reset filter
  };


  

    const [isNoiseRemoved, setNoiseRemoved] = useState(false);

    const handleToggleNoiseRemoval = () => {
        setNoiseRemoved(!isNoiseRemoved);
      };

      const handleToggleDeskewing = async () => {
        setDeskewed(!isDeskewed);
      };
    

      const applyBinarizationEffect = (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
      
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const value = avg < 128 ? 0 : 255;
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }
      
        ctx.putImageData(imageData, 0, 0);
      };

      
      const applyBinarization = async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = image;
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              applyBinarizationEffect(canvas); // Apply binarization effect
              setImage(canvas.toDataURL());
              resolve();
            };
          }, 3000); // Introduce a 3-second delay
        });
      };

      
      
      const applyDeskewing = async (img) => {
        console.log('Applying deskewing:', img);

        return new Promise((resolve) => {
          img.onload = () => {
            setTimeout(() => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
        
            const perspectiveTransform = new PerspectiveTransform(
              0, 0,
              0, img.height,
              img.width, 0,
              img.width, img.height
            );
        
            const transformedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const imgData = transformedImageData.data;
        
            for (let y = 0; y < img.height; y++) {
              for (let x = 0; x < img.width; x++) {
                const { x: newX, y: newY } = perspectiveTransform.transform(x, y);
                if (newX >= 0 && newX < img.width && newY >= 0 && newY < img.height) {
                  const newIndex = (newY * img.width + newX) * 4;
                  const oldIndex = (y * img.width + x) * 4;
                  imgData[newIndex] = imgData[oldIndex];
                  imgData[newIndex + 1] = imgData[oldIndex + 1];
                  imgData[newIndex + 2] = imgData[oldIndex + 2];
                  imgData[newIndex + 3] = imgData[oldIndex + 3];
                }
              }
            }
        
            ctx.putImageData(transformedImageData, 0, 0);
            setImage(canvas.toDataURL());
        
            resolve(); // Resolve the promise to indicate completion
          }, 3000); // Introduce a 3-second delay
  
        };
          img.src = image;
        });
        
      };
  
    
      
    
    
    
      useEffect(() => {
        if (selectedTest) {
          handleToggleWebcam(); // Automatically enable webcam when a test type is selected
        }
      }, [selectedTest]);
    
    
      
      useEffect(() => {
        // Automatically enable the webcam when the component mounts
       
        const updateCanvas = () => {
          if (isWebcamEnabled && isBackgroundBlurred) {
            const webcamVideo = webcamRef.current.video;
            const blurredCanvas = blurredCanvasRef.current;
      
            if (!blurredCanvas) return;
      
            const ctx = blurredCanvas.getContext('2d');
            blurredCanvas.width = webcamVideo.videoWidth;
            blurredCanvas.height = webcamVideo.videoHeight;
            ctx.drawImage(webcamVideo, 0, 0, blurredCanvas.width, blurredCanvas.height);
      
            // Apply blur effect
            applyBlurEffect(blurredCanvas, 5);
          }
        };
      
        if (isWebcamEnabled && isBackgroundBlurred) {
          const animationFrameId = requestAnimationFrame(updateCanvas);
      
          return () => {
            cancelAnimationFrame(animationFrameId);
          };
        }
      }, [isWebcamEnabled, isBackgroundBlurred]);
      
    
    


      const applyBlur = async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = image;
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              applyBlurEffect(canvas, 5); // Apply blur effect
              setImage(canvas.toDataURL());
              resolve();
            };
          }, 3000); // Introduce a 3-second delay
        });
      };

      const handleTestTypeChange = (e) => {
        const selectedType = e.target.value;
        setSelectedTest(selectedType);
        handleToggleWebcam(); // Enable webcam when test type is selected
      };
      
      
  const handleToggleWebcam = async () => {
      if (!isWebcamEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          setWebcamReady(true);
        }
      } else {
        if (webcamRef.current && webcamRef.current.srcObject) {
          webcamRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setWebcamReady(false);
      }
      setWebcamEnabled(!isWebcamEnabled);
    };

    

    const applyGrayscaleEffect = (canvas) => {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
    
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
    
      ctx.putImageData(imageData, 0, 0);
    };

    
    const applyGrayscale = async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.src = image;
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            applyGrayscaleEffect(canvas); // Apply grayscale effect
            setImage(canvas.toDataURL());
            resolve();
          };
        }, 3000); // Introduce a 3-second delay
      });
    };
    
    
    

    const handleImage = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result);
          setIsLoaded(true); // Set the image loaded flag
        };
        reader.readAsDataURL(file);
      }
    };

    

    // Calculate the angle of rotation needed for deskewing
    const getBoundingBox = async () => {
      if (image) {
        const img = new Image();
        img.src = image;
    
        const { data: { words } } = await Tesseract.recognize(img, 'eng');
    
        let minX = img.width;
        let minY = img.height;
        let maxX = 0;
        let maxY = 0;
    
        words.forEach(word => {
          minX = Math.min(minX, word.bbox.x0);
          minY = Math.min(minY, word.bbox.y0);
          maxX = Math.max(maxX, word.bbox.x1);
          maxY = Math.max(maxY, word.bbox.y1);
        });
    
        const width = maxX - minX;
        const height = maxY - minY;
    
        // Calculate the shadow offset caused by the webcam frame
        const shadowOffset = 10;
    
        // Apply cropping and deskewing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width + shadowOffset * 2;
        canvas.height = height + shadowOffset * 2;
        ctx.drawImage(img, minX - shadowOffset, minY - shadowOffset, canvas.width, canvas.height);
    
        // Apply deskewing here if needed
        // ...

        // Return the bounding box parameters and cropped image
        return { x: minX, y: minY, width, height, croppedImage };
      }
    };
    

    


    const captureImage = () => {
      if (webcamRef.current) {
        const screenshot = webcamRef.current.getScreenshot();
        setImage(screenshot);
      }
    };

    const extractTextFromImage = async () => {
      if (croppedImage && selectedTest === 'multipleChoice') {
        const result = await Tesseract.recognize(croppedImage);
        const { data: { words } } = result;
    
        const alphanumericWords = words
          .map(word => word.text)
          .filter(word => /^[A-Za-z0-9]+$/.test(word));
    
        if (alphanumericWords.length > 0) {
          setCapturedText(`Selected: ${alphanumericWords.join(', ')}`);
        } else {
          setCapturedText('No alphanumeric words found');
        }
      } else if (selectedTest === 'identification') {
        // You'll need to implement identification logic based on the answer key
        // and the OCR results.
        // For example:
        // const identificationResult = identifyBasedOnAnswerKey(ocrResult);
        // setCapturedText(`Identified: ${identificationResult}`);
      } else if (selectedTest === 'True or False') {
        const result = await Tesseract.recognize(croppedImage);
        const { data: { words } } = result;
    
        const trueFalseWords = words
          .map(word => word.text.toLowerCase())
          .filter(word => word === 'true' || word === 'false');
    
        if (trueFalseWords.length > 0) {
          setCapturedText(`Selected: ${trueFalseWords.join(', ')}`);
        } else {
          setCapturedText('No "True" or "False" words found');
        }
      }
    };
    

    return (
      <div>
        <input type="file" id="imageInput" onChange={handleImage} disabled={!selectedTest} />
       
      


        

        {/* Get Bounding Box */}
        {selectedTest && (
          <div>
            <button onClick={getBoundingBox} disabled={!selectedTest}>
              Get Bounding Box
            </button>
            {boundingBox && (
    <div
      style={{
        position: 'absolute',
        left: boundingBox.x,
        top: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
        pointerEvents: 'none', // This prevents the bounding box from interfering with user interactions
      }}
    />
  )}

          </div>
        )}




        
  <div>
    {/* Button to toggle noise removal */}
    <button onClick={handleToggleNoiseRemoval} disabled={!selectedTest}> 
      {isNoiseRemoved ? 'Disable Noise Removal' : 'Enable Noise Removal'}
    </button>

    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          {selectedTest && isWebcamEnabled && (
          <Webcam audio={false} ref={webcamRef} width="50%" height="150%" />
           )}
         </div>

    {isWebcamEnabled && isBackgroundBlurred && (
      <ReactBlur img={image} blurRadius={5} enableStyles={false}>
        <img
          src={image}
          alt="Captured"
          style={{
            filter: isGrayscale ? 'grayscale(100%)' : 'none',
            ...(isBinarized ? { filter: 'grayscale(100%) contrast(300%)' } : {}),
            ...(isNoiseRemoved ? { filter: 'blur(3px)' } : {}), // Apply noise removal if enabled
            ...(isDeskewed ? { transform: 'skewX(-10deg)' } : {}), // Apply deskewing if enabled
          }}
        />
      </ReactBlur>
    )}
  </div>

    
        

        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <label htmlFor="testType">Select Test Type: </label>
          <select
            id="testType"
            value={selectedTest}
            onChange={handleTestTypeChange}

          >
            <option value="">Select</option>
            <option value="multipleChoice">Multiple Choice</option>
            <option value="identification">Identification</option>
            <option value="True or False">True or False</option>
          </select>
          

    
        </div>
        

        <button onClick={processImage} disabled={!selectedTest}>
          Process
        </button>
        
        

        

      </div>
    );

          }; 


        
    
          
      
  export default OCR3;