import React, { useState, useRef, useEffect } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ currentImage, onImageChange, userType = 'doctor' }) => {
  const [image, setImage] = useState(currentImage || null);
  const [preview, setPreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // Use refs for drag functionality (no state updates during drag)
  const positionRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Force update function to update component when needed
  const [, forceUpdate] = useState({});

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setShowCropModal(true);
        setZoom(1);
        setRotation(0);
        positionRef.current = { x: 0, y: 0 };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
    positionRef.current = { x: 0, y: 0 }; // Reset position when zooming
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
    positionRef.current = { x: 0, y: 0 }; // Reset position when zooming
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
    positionRef.current = { x: 0, y: 0 }; // Reset position when rotating
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
    positionRef.current = { x: 0, y: 0 }; // Reset position when rotating
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    positionRef.current = { x: 0, y: 0 };
    forceUpdate({}); // Force re-render
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y
    };
    
    // Add global event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate new position
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    
    // Get container dimensions for boundaries
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate boundaries based on zoom level
    // This ensures the image doesn't go outside the crop circle
    const maxDrag = 100 * (zoom - 0.5); // Adjust this value based on your needs
    
    // Apply boundaries
    positionRef.current = {
      x: Math.max(-maxDrag, Math.min(maxDrag, newX)),
      y: Math.max(-maxDrag, Math.min(maxDrag, newY))
    };
    
    // Force re-render to update position
    forceUpdate({});
  };

  const handleGlobalMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      
      // Remove global event listeners
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleSaveImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = preview;

    img.onload = () => {
      // Set canvas size to 300x300 (square)
      canvas.width = 300;
      canvas.height = 300;

      // Clear canvas with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Move to center for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Calculate scaled dimensions
      const scaledWidth = img.width * zoom;
      const scaledHeight = img.height * zoom;
      
      // Apply position offset
      const drawX = -scaledWidth / 2 + positionRef.current.x;
      const drawY = -scaledHeight / 2 + positionRef.current.y;

      // Draw image
      ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);

      // Restore context
      ctx.restore();

      // Get final image
      const finalImage = canvas.toDataURL('image/jpeg', 0.9);
      setImage(finalImage);
      onImageChange(finalImage);
      setShowCropModal(false);
    };
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`image-upload-container ${userType}`}>
      <div className="image-preview-area">
        {image ? (
          <div className="image-wrapper">
            <img src={image} alt="Profile" className="profile-image" />
            <div className="image-overlay">
              <button type="button" className="image-action-btn" onClick={triggerFileInput}>
                <i className="fas fa-camera"></i> Change
              </button>
              <button type="button" className="image-action-btn delete" onClick={handleRemoveImage}>
                <i className="fas fa-trash"></i> Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder" onClick={triggerFileInput}>
            <i className="fas fa-camera"></i>
            <p>Upload Profile Photo</p>
            <span className="upload-hint">Click to browse (Max 5MB)</span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {showCropModal && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <div className="crop-modal-header">
              <h3><i className="fas fa-crop-alt"></i> Adjust Image</h3>
              <button className="close-btn" onClick={() => setShowCropModal(false)}>×</button>
            </div>

            <div className="crop-modal-body">
              <div 
                className="image-editor-container"
                ref={containerRef}
              >
                <div 
                  className="image-editor"
                  style={{
                    transform: `translate(-50%, -50%) scale(${zoom}) rotate(${rotation}deg) translate(${positionRef.current.x}px, ${positionRef.current.y}px)`,
                    cursor: isDraggingRef.current ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <img 
                    src={preview} 
                    alt="Preview" 
                    ref={imageRef}
                    draggable="false"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      maxWidth: 'none',
                      maxHeight: 'none',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
                <div className="crop-overlay"></div>
                <div className="crop-guide">
                  <div className="crop-circle"></div>
                </div>
              </div>

              <div className="image-controls">
                <div className="control-group">
                  <span className="control-label">ZOOM</span>
                  <div className="control-buttons">
                    <button type="button" onClick={handleZoomOut} className="control-btn">
                      <i className="fas fa-search-minus"></i>
                    </button>
                    <span className="zoom-value">{Math.round(zoom * 100)}%</span>
                    <button type="button" onClick={handleZoomIn} className="control-btn">
                      <i className="fas fa-search-plus"></i>
                    </button>
                  </div>
                </div>

                <div className="control-group">
                  <span className="control-label">ROTATE</span>
                  <div className="control-buttons">
                    <button type="button" onClick={handleRotateLeft} className="control-btn">
                      <i className="fas fa-undo-alt"></i>
                    </button>
                    <button type="button" onClick={handleRotateRight} className="control-btn">
                      <i className="fas fa-redo-alt"></i>
                    </button>
                  </div>
                </div>

                <div className="control-group">
                  <span className="control-label">POSITION</span>
                  <div className="control-buttons">
                    <button type="button" onClick={handleReset} className="control-btn reset">
                      <i className="fas fa-sync-alt"></i> Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="drag-instructions">
                <i className="fas fa-arrows-alt"></i>
                <span>Drag image to reposition</span>
              </div>
            </div>

            <div className="crop-modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowCropModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveImage}>
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;  