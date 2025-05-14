document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const modeSwitch = document.getElementById('mode-switch');
    const modeLabel = document.getElementById('mode-label');
    
    // Decode Mode Elements
    const decodeInput = document.getElementById('decode-input');
    const decodeButtons = document.getElementById('decode-buttons');
    const decodeOutput = document.getElementById('decode-output');
    const base64Input = document.getElementById('base64-input');
    const decodeBtn = document.getElementById('decode-btn');
    const clearDecodeBtn = document.getElementById('clear-decode-btn');
    const imageContainer = document.getElementById('image-container');
    const outputImage = document.getElementById('output-image');
    const fileContainer = document.getElementById('file-container');
    const downloadBtn = document.getElementById('download-btn');
    const emptyDecodeOutput = document.getElementById('empty-decode-output');
    
    // Encode Mode Elements
    const encodeInput = document.getElementById('encode-input');
    const encodeButtons = document.getElementById('encode-buttons');
    const encodeOutput = document.getElementById('encode-output');
    const fileInput = document.getElementById('file-input');
    const fileSelectBtn = document.getElementById('file-select-btn');
    const changeFileBtn = document.getElementById('change-file-btn');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const base64Output = document.getElementById('base64-output');
    const copyBtn = document.getElementById('copy-btn');
    const clearEncodeBtn = document.getElementById('clear-encode-btn');
    const emptyEncodeOutput = document.getElementById('empty-encode-output');
    
    // Alert Elements
    const alert = document.getElementById('alert');
    const alertMessage = document.getElementById('alert-message');
    
    // Variables
    let currentFileName = 'download';
    let currentFileType = '';
    let isImage = true;
    
    // Toggle between encode and decode modes
    modeSwitch.addEventListener('click', function() {
        if (this.checked) {
            // Switch to Encode Mode
            modeLabel.textContent = 'Encode Mode (File to Base64)';
            decodeInput.classList.add('hidden');
            decodeButtons.classList.add('hidden');
            decodeOutput.classList.add('hidden');
            encodeInput.classList.remove('hidden');
            encodeButtons.classList.remove('hidden');
            encodeOutput.classList.remove('hidden');
        } else {
            // Switch to Decode Mode
            modeLabel.textContent = 'Decode Mode (Base64 to File)';
            encodeInput.classList.add('hidden');
            encodeButtons.classList.add('hidden');
            encodeOutput.classList.add('hidden');
            decodeInput.classList.remove('hidden');
            decodeButtons.classList.remove('hidden');
            decodeOutput.classList.remove('hidden');
        }
        clearAll();
    });
    
    // Decode Mode: Decode base64 to image/file
    decodeBtn.addEventListener('click', function() {
        decodeBase64();
    });
    
    // Clear decode input and output
    clearDecodeBtn.addEventListener('click', function() {
        clearDecodeMode();
    });
    
    // Encode Mode: Trigger file input when select button is clicked
    fileSelectBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Encode Mode: Change file button
    changeFileBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Encode Mode: Handle file selection
    fileInput.addEventListener('change', function(e) {
        handleFileUpload(e);
    });
    
    // Encode Mode: Copy base64 to clipboard
    copyBtn.addEventListener('click', function() {
        copyToClipboard();
    });
    
    // Clear encode input and output
    clearEncodeBtn.addEventListener('click', function() {
        clearEncodeMode();
    });
    
    // Download file
    downloadBtn.addEventListener('click', function() {
        downloadFile();
    });
    
    // Handle image load error
    outputImage.addEventListener('error', function() {
        handleImageError();
    });
    
    // Functions
    
    // Decode base64 to image/file
    function decodeBase64() {
        const base64String = base64Input.value.trim();
        
        if (!base64String) {
            showAlert('Please enter a base64 string', 'error');
            resetDecodeOutput();
            return;
        }
        
        try {
            // Clean the base64 string if it contains data URL prefix
            let cleanBase64 = base64String;
            let mimeType = 'application/octet-stream';
            
            if (cleanBase64.includes(',')) {
                const parts = cleanBase64.split(',');
                if (parts[0].includes('data:')) {
                    mimeType = parts[0].split(':')[1].split(';')[0];
                }
                cleanBase64 = parts[1];
            } else {
                // Try to detect mime type from the base64 content
                mimeType = detectMimeType(cleanBase64);
            }
            
            // Test if the string is valid base64
            atob(cleanBase64);
            
            const isImageType = mimeType.startsWith('image/');
            isImage = isImageType;
            
            // Set file extension based on mime type
            const extension = getFileExtension(mimeType);
            currentFileName = `download.${extension}`;
            currentFileType = mimeType;
            
            // Create a data URL
            const dataUrl = `data:${mimeType};base64,${cleanBase64}`;
            
            if (isImageType) {
                // Show image
                outputImage.src = dataUrl;
                imageContainer.classList.remove('hidden');
                fileContainer.classList.add('hidden');
                emptyDecodeOutput.classList.add('hidden');
            } else {
                // Show file download option
                imageContainer.classList.add('hidden');
                fileContainer.classList.remove('hidden');
                emptyDecodeOutput.classList.add('hidden');
                
                // Store the data URL for download
                outputImage.src = dataUrl;
            }
            
            hideAlert();
        } catch (e) {
            showAlert('Invalid base64 string', 'error');
            resetDecodeOutput();
        }
    }
    
    // Handle file upload for encoding
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        currentFileName = file.name;
        fileName.textContent = file.name;
        fileInfo.classList.remove('hidden');
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            if (event.target.result) {
                const base64String = event.target.result.toString();
                base64Output.value = base64String;
                copyBtn.classList.remove('hidden');
                emptyEncodeOutput.classList.add('hidden');
                base64Output.classList.remove('hidden');
                
                // If it's an image, also show the preview
                if (file.type.startsWith('image/')) {
                    isImage = true;
                } else {
                    isImage = false;
                }
            }
        };
        
        reader.onerror = function() {
            showAlert('Failed to read the file', 'error');
        };
        
        reader.readAsDataURL(file);
    }
    
    // Copy base64 to clipboard
    function copyToClipboard() {
        if (base64Output.value) {
            navigator.clipboard.writeText(base64Output.value)
                .then(() => {
                    showAlert('Base64 copied to clipboard!', 'success');
                })
                .catch(() => {
                    showAlert('Failed to copy to clipboard', 'error');
                });
        }
    }
    
    // Download file
    function downloadFile() {
        if (!outputImage.src) return;
        
        const link = document.createElement('a');
        link.href = outputImage.src;
        link.download = currentFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Handle image load error
    function handleImageError() {
        if (outputImage.src) {
            showAlert('Failed to load as an image. You can download the file instead.', 'success');
            isImage = false;
            imageContainer.classList.add('hidden');
            fileContainer.classList.remove('hidden');
        }
    }
    
    // Detect MIME type from base64 content
    function detectMimeType(base64String) {
        // Try to detect mime type from base64 header
        if (base64String.startsWith('/9j/')) return 'image/jpeg';
        if (base64String.startsWith('iVBORw0KGg')) return 'image/png';
        if (base64String.startsWith('R0lGOD')) return 'image/gif';
        if (base64String.startsWith('UklGR')) return 'image/webp';
        if (base64String.startsWith('AAABAA')) return 'image/x-icon';
        if (base64String.startsWith('JVBERi0')) return 'application/pdf';
        if (base64String.startsWith('UEsDB')) return 'application/zip';
        if (base64String.startsWith('H4sIA')) return 'application/gzip';
        if (base64String.startsWith('7z¼¯')) return 'application/x-7z-compressed';
        if (base64String.startsWith('Qk0=')) return 'image/bmp';
        
        // Default to octet-stream if we can't detect
        return 'application/octet-stream';
    }
    
    // Get file extension from MIME type
    function getFileExtension(mimeType) {
        const mimeToExt = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/x-icon': 'ico',
            'application/pdf': 'pdf',
            'application/zip': 'zip',
            'application/gzip': 'gz',
            'application/x-7z-compressed': '7z',
            'image/bmp': 'bmp',
            'application/octet-stream': 'bin'
        };
        
        return mimeToExt[mimeType] || 'bin';
    }
    
    // Show alert message
    function showAlert(message, type) {
        alertMessage.textContent = message;
        alert.classList.remove('hidden');
        
        if (type === 'success') {
            alert.classList.add('success');
        } else {
            alert.classList.remove('success');
        }
        
        // Auto hide success alerts after 3 seconds
        if (type === 'success') {
            setTimeout(hideAlert, 3000);
        }
    }
    
    // Hide alert message
    function hideAlert() {
        alert.classList.add('hidden');
    }
    
    // Reset decode output
    function resetDecodeOutput() {
        imageContainer.classList.add('hidden');
        fileContainer.classList.add('hidden');
        emptyDecodeOutput.classList.remove('hidden');
        outputImage.src = '';
    }
    
    // Clear decode mode
    function clearDecodeMode() {
        base64Input.value = '';
        resetDecodeOutput();
        hideAlert();
    }
    
    // Clear encode mode
    function clearEncodeMode() {
        fileInput.value = '';
        base64Output.value = '';
        fileInfo.classList.add('hidden');
        copyBtn.classList.add('hidden');
        emptyEncodeOutput.classList.remove('hidden');
        base64Output.classList.add('hidden');
        hideAlert();
    }
    
    // Clear all
    function clearAll() {
        clearDecodeMode();
        clearEncodeMode();
    }
});