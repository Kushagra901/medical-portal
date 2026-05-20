import React from 'react';
import './Pagination.css';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, page + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container">
      <button 
        className="pagination-btn nav-btn" 
        onClick={() => onPageChange(page - 1)} 
        disabled={page === 1}
      >
        <i className="fas fa-chevron-left"></i> Previous
      </button>

      {startPage > 1 && (
        <>
          <button className={`pagination-btn ${page === 1 ? 'active' : ''}`} onClick={() => onPageChange(1)}>
            1
          </button>
          {startPage > 2 && <span className="pagination-ellipsis">...</span>}
        </>
      )}

      {pages.map(pageNum => (
        <button 
          key={pageNum} 
          className={`pagination-btn ${page === pageNum ? 'active' : ''}`} 
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
          <button className={`pagination-btn ${page === totalPages ? 'active' : ''}`} onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button 
        className="pagination-btn nav-btn" 
        onClick={() => onPageChange(page + 1)} 
        disabled={page === totalPages}
      >
        Next <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;
