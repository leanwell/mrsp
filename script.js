document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const uploadInput = document.getElementById('upload');
    const zoomInput = document.getElementById('zoom');
    const downloadBtn = document.getElementById('download');
    const generateBtn = document.getElementById('generate');
    const copyBtn = document.getElementById('copy');
    const frameSelect = document.getElementById('frame');
    const nameInput = document.getElementById('name');
    const yearInput = document.getElementById('year');
    const courseInput = document.getElementById('course');
    const sectionInput = document.getElementById('section');
    const outputParagraph = document.getElementById('output-paragraph');

    // State variables
    const state = {
        img: new Image(),
        frame: new Image(),
        currentFrame: '1styear.png',
        zoomLevel: 1,
        isImageLoaded: false,
        isFrameLoaded: false
    };

    // Initialize the application
    function init() {
        setupEventListeners();
        loadFrame(state.currentFrame);
    }

    // Set up all event listeners
    function setupEventListeners() {
        uploadInput.addEventListener('change', handleImageUpload);
        zoomInput.addEventListener('input', handleZoom);
        downloadBtn.addEventListener('click', handleDownload);
        generateBtn.addEventListener('click', generateParagraph);
        copyBtn.addEventListener('click', copyToClipboard);
        frameSelect.addEventListener('change', handleFrameChange);
    }

    // Load the selected frame
    function loadFrame(frameSrc) {
        state.frame.crossOrigin = 'Anonymous';
        state.frame.src = frameSrc;
        state.frame.onload = () => {
            state.isFrameLoaded = true;
            if (state.isImageLoaded) drawImage();
        };
        state.frame.onerror = () => {
            console.error('Error loading frame:', frameSrc);
            alert('Error loading frame. Trying fallback...');
            // Fallback to local path
            state.frame.src = `./${frameSrc}`;
        };
    }

    // Handle image upload
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, etc.)');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            state.img.crossOrigin = 'Anonymous';
            state.img.src = e.target.result;
            state.img.onload = () => {
                state.isImageLoaded = true;
                drawImage();
            };
            state.img.onerror = () => {
                alert('Error loading image. Please try another file.');
            };
        };
        reader.onerror = () => {
            alert('Error reading file. Please try again.');
        };
        reader.readAsDataURL(file);
    }

    // Handle zoom changes
    function handleZoom(event) {
        state.zoomLevel = parseFloat(event.target.value);
        if (state.isImageLoaded) drawImage();
    }

    // Handle frame selection changes
    function handleFrameChange(event) {
        state.currentFrame = event.target.value;
        loadFrame(state.currentFrame);
    }

    // Draw the image with frame
    function drawImage() {
        if (!state.isImageLoaded || !state.isFrameLoaded) return;

        // Set canvas dimensions to match frame
        canvas.width = state.frame.width;
        canvas.height = state.frame.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate image dimensions based on zoom
        const userImageWidth = state.frame.width * state.zoomLevel;
        const userImageHeight = (state.img.height / state.img.width) * userImageWidth;
        const xPos = (canvas.width - userImageWidth) / 2;
        const yPos = (canvas.height - userImageHeight) / 2;

        // Draw the uploaded image
        ctx.drawImage(state.img, xPos, yPos, userImageWidth, userImageHeight);
        
        // Draw the frame on top
        ctx.drawImage(state.frame, 0, 0);
    }

    // Handle download with security checks
    function handleDownload() {
        if (!state.isImageLoaded) {
            alert('Please upload an image first');
            return;
        }

        try {
            // Create a new canvas to ensure it's clean
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            
            // Draw the current canvas to the temporary one
            tempCtx.drawImage(canvas, 0, 0);
            
            // Try to export
            const dataURL = tempCanvas.toDataURL('image/png');
            
            // Create download link
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            link.download = `mrsp-dpblast-${timestamp}.png`;
            link.href = dataURL;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                tempCanvas.width = 0;
                tempCanvas.height = 0;
            }, 100);
        } catch (error) {
            console.error('Download error:', error);
            
            if (error.name === 'SecurityError') {
                alert('For best results, please use images from your computer. Some web images may cause download restrictions.');
            } else {
                alert('Error generating download. Please try again.');
            }
        }
    }

    // Generate the announcement paragraph
    function generateParagraph() {
        const name = nameInput.value.trim();
        const year = yearInput.value.trim();
        const course = courseInput.value.trim();
        const section = sectionInput.value.trim();

        if (!name || !year || !course || !section) {
            alert('Please fill in all fields');
            return;
        }

        const paragraph = 'Not yet implemented';//`Excited to announce that I've officially joined the YES-O Club for 2024! My name is ${name}, currently a ${year} year student in the ${course} program, Section ${section}, at the Technological University of the Philippines - Taguig. Looking forward to an incredible year of learning, growth, and making a positive impact on our environment with this amazing community. Let's make 2024 a year to remember!`;

        outputParagraph.value = paragraph;
    }

    // Copy paragraph to clipboard with modern API
    function copyToClipboard() {
        if (!outputParagraph.value) {
            alert('Nothing to copy. Generate a paragraph first.');
            return;
        }

        // Modern clipboard API
        navigator.clipboard.writeText(outputParagraph.value)
            .then(() => {
                // Visual feedback
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy to Clipboard';
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text:', err);
                // Fallback for older browsers
                outputParagraph.select();
                document.execCommand('copy');
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy to Clipboard';
                }, 2000);
            });
    }

    // Initialize the application
    init();
});