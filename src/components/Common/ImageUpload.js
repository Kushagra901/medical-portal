import React, { useState, useRef, useEffect } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ currentImage, onImageChange, userType = 'doctor' }) => {
  const [image, setImage] = useState(currentImage || null);
  const [preview, setPreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Use refs for drag functionality
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    offsetX: 0,
    offsetY: 0
  });
  
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Force update function
  const [, forceUpdate] = useState({});

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setFileName(file.name);
      setFileSize(formatFileSize(file.size));
      setIsUploading(true);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result);
            setShowCropModal(true);
            setZoom(1);
            setRotation(0);
            dragRef.current = {
              ...dragRef.current,
              currentX: 0,
              currentY: 0,
              offsetX: 0,
              offsetY: 0,
              isDragging: false
            };
            forceUpdate({});
          };
          reader.readAsDataURL(file);
        }
      }, 50);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
    dragRef.current.currentX = 0;
    dragRef.current.currentY = 0;
    forceUpdate({});
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
    dragRef.current.currentX = 0;
    dragRef.current.currentY = 0;
    forceUpdate({});
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
    dragRef.current.currentX = 0;
    dragRef.current.currentY = 0;
    forceUpdate({});
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
    dragRef.current.currentX = 0;
    dragRef.current.currentY = 0;
    forceUpdate({});
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    dragRef.current.currentX = 0;
    dragRef.current.currentY = 0;
    forceUpdate({});
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.offsetX = dragRef.current.currentX;
    dragRef.current.offsetY = dragRef.current.currentY;
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const maxDragX = (containerRect.width * (zoom - 0.5)) / 2;
    const maxDragY = (containerRect.height * (zoom - 0.5)) / 2;
    
    let newX = dragRef.current.offsetX + deltaX;
    let newY = dragRef.current.offsetY + deltaY;
    
    newX = Math.max(-maxDragX, Math.min(maxDragX, newX));
    newY = Math.max(-maxDragY, Math.min(maxDragY, newY));
    
    dragRef.current.currentX = newX;
    dragRef.current.currentY = newY;
    
    forceUpdate({});
  };

  const handleMouseUp = (e) => {
    if (!dragRef.current.isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current.isDragging = false;
  };

  const handleMouseLeave = () => {
    dragRef.current.isDragging = false;
  };

  const handleSaveImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = preview;

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      
      const scaledWidth = img.width * zoom;
      const scaledHeight = img.height * zoom;
      
      const drawX = -scaledWidth / 2 + dragRef.current.currentX;
      const drawY = -scaledHeight / 2 + dragRef.current.currentY;

      ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
      ctx.restore();

      const finalImage = canvas.toDataURL('image/jpeg', 0.9);
      setImage(finalImage);
      onImageChange(finalImage);
      setShowCropModal(false);
      setUploadProgress(0);
    };
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    onImageChange(null);
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getImageStyle = () => {
    return {
      transform: `translate(-50%, -50%) scale(${zoom}) rotate(${rotation}deg) translate(${dragRef.current.currentX}px, ${dragRef.current.currentY}px)`,
      cursor: dragRef.current.isDragging ? 'grabbing' : 'grab',
      transition: dragRef.current.isDragging ? 'none' : 'transform 0.1s ease'
    };
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
            <div className="upload-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <p>Click to upload profile photo</p>
            <span className="upload-hint">JPG, PNG or GIF (Max 5MB)</span>
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

      {/* Upload Progress Modal */}
      {isUploading && (
        <div className="upload-progress-modal">
          <div className="upload-progress-content">
            <i className="fas fa-spinner fa-spin"></i>
            <h4>Uploading {fileName}</h4>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p>{uploadProgress}% - {fileSize}</p>
          </div>
        </div>
      )}

      {showCropModal && (
        <div className="crop-modal-overlay" onMouseLeave={handleMouseLeave}>
          <div className="crop-modal">
            <div className="crop-modal-header">
              <h3><i className="fas fa-crop-alt"></i> Adjust Image</h3>
              <button className="close-btn" onClick={() => setShowCropModal(false)}>×</button>
            </div>

            <div className="crop-modal-body">
              <div className="file-info">
                <i className="fas fa-image"></i>
                <span className="file-name">{fileName}</span>
                <span className="file-size">{fileSize}</span>
              </div>

              <div 
                className="image-editor-container"
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                <div 
                  className="image-editor"
                  style={getImageStyle()}
                  onMouseDown={handleMouseDown}
                >
                  <img 
                    src={preview} 
                    alt="Preview" 
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
                <span>Click and drag image to reposition</span>
              </div>
            </div>

            <div className="crop-modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowCropModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveImage}>
                <i className="fas fa-check"></i> Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;