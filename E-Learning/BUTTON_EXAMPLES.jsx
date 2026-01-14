// ============================================
// BUTTON DESIGN SYSTEM - IMPLEMENTATION EXAMPLES
// ============================================

import React, { useState } from 'react';
import Button from './components/common/Button';

// ============================================
// BASIC EXAMPLES
// ============================================

// 1. Simple Action Button
export const SimpleButton = () => {
  return (
    <Button variant="primary" onClick={() => alert('Clicked!')}>
      Click Me
    </Button>
  );
};

// 2. All Variants Showcase
export const AllVariants = () => {
  return (
    <div className="btn-group">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="success">Success</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
};

// 3. All Sizes
export const AllSizes = () => {
  return (
    <div className="btn-group">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  );
};

// ============================================
// FORM EXAMPLES
// ============================================

// 1. Form with Submit/Reset
export const FormExample = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Name</label>
        <input type="text" placeholder="Enter your name" />
      </div>
      
      <div className="btn-group">
        <Button type="reset" variant="secondary">
          Clear
        </Button>
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </div>
    </form>
  );
};

// 2. Form with Loading State
export const FormWithLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Success!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button 
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Submit Form'}
      </Button>
    </form>
  );
};

// ============================================
// DIALOG/MODAL EXAMPLES
// ============================================

// 1. Confirmation Dialog
export const ConfirmationDialog = ({ onConfirm, onCancel }) => {
  return (
    <div className="dialog">
      <h2>Are you sure?</h2>
      <p>This action cannot be undone.</p>
      
      <div className="btn-group">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete Permanently
        </Button>
      </div>
    </div>
  );
};

// 2. Action Dialog
export const ActionDialog = ({ onClose, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dialog">
      <h2>Confirm Action</h2>
      
      <div className="btn-group">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="primary"
          isLoading={isSaving}
          onClick={handleSave}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

// ============================================
// HERO/CTA SECTION EXAMPLES
// ============================================

// 1. Hero CTA Section
export const HeroCTA = () => {
  return (
    <section className="hero-section">
      <h1>Welcome to Our Platform</h1>
      <p>Start learning amazing courses today</p>
      
      <div className="btn-group">
        <Button variant="outline" size="lg">
          Learn More
        </Button>
        <Button variant="primary" size="lg">
          Get Started Free
        </Button>
      </div>
    </section>
  );
};

// 2. Course Enroll Section
export const CourseEnroll = () => {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      // Simulate enrollment
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsEnrolled(true);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="course-card">
      <h3>Learn React Basics</h3>
      <p>Master React fundamentals in 4 weeks</p>
      
      {isEnrolled ? (
        <Button variant="success" disabled>
          ✓ You're Enrolled!
        </Button>
      ) : (
        <Button 
          variant="primary"
          fullWidth
          isLoading={isEnrolling}
          onClick={handleEnroll}
        >
          {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
        </Button>
      )}
    </div>
  );
};

// ============================================
// NAVIGATION EXAMPLES
// ============================================

// 1. Step Navigation
export const StepNavigation = ({ currentStep, onNext, onPrev }) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 5;

  return (
    <div className="btn-group">
      <Button 
        variant="outline"
        disabled={isFirstStep}
        onClick={onPrev}
      >
        ← Previous
      </Button>
      
      <Button 
        variant="primary"
        disabled={isLastStep}
        onClick={onNext}
      >
        Next →
      </Button>
    </div>
  );
};

// 2. Pagination Controls
export const PaginationControls = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="btn-group">
      <Button 
        variant="outline"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </Button>
      
      <span className="page-info">
        Page {page} of {totalPages}
      </span>
      
      <Button 
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

// ============================================
// LIST/TABLE ACTION EXAMPLES
// ============================================

// 1. Row Actions
export const TableRowActions = ({ onEdit, onDelete }) => {
  return (
    <div className="btn-group">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onEdit}
      >
        Edit
      </Button>
      <Button 
        variant="danger" 
        size="sm"
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  );
};

// 2. List Header Actions
export const ListHeaderActions = ({ onAdd, onRefresh, onFilter }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="list-header">
      <div className="btn-group">
        <Button 
          variant="outline"
          isLoading={isRefreshing}
          onClick={handleRefresh}
        >
          🔄 Refresh
        </Button>
        <Button 
          variant="outline"
          onClick={onFilter}
        >
          ⚙️ Filter
        </Button>
        <Button 
          variant="primary"
          onClick={onAdd}
        >
          + Add New
        </Button>
      </div>
    </div>
  );
};

// ============================================
// STATE/PERMISSION EXAMPLES
// ============================================

// 1. Conditional Rendering
export const ConditionalActions = ({ isAdmin, isOwner, onEdit, onDelete }) => {
  return (
    <div className="btn-group">
      {(isAdmin || isOwner) && (
        <Button variant="outline" onClick={onEdit}>
          Edit
        </Button>
      )}
      
      {isAdmin && (
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      )}
      
      {!isAdmin && !isOwner && (
        <Button variant="ghost" disabled>
          No permissions
        </Button>
      )}
    </div>
  );
};

// 2. Multi-state Button
export const MultiStateButton = () => {
  const [state, setState] = useState('idle'); // idle | loading | success | error

  const handleClick = async () => {
    setState('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      setState('error');
    }
  };

  const buttonConfig = {
    idle: { variant: 'primary', text: 'Save' },
    loading: { variant: 'primary', text: 'Saving...', loading: true },
    success: { variant: 'success', text: '✓ Saved!' },
    error: { variant: 'danger', text: 'Error - Retry' },
  };

  const config = buttonConfig[state];

  return (
    <Button 
      variant={config.variant}
      isLoading={config.loading}
      onClick={handleClick}
      disabled={state !== 'idle' && state !== 'error'}
    >
      {config.text}
    </Button>
  );
};

// ============================================
// ICON BUTTON EXAMPLES
// ============================================

// Note: Import icons from your icon library
// Example: import { Download, Trash, Edit } from 'lucide-react';

export const IconButtons = () => {
  return (
    <div className="btn-group">
      <Button 
        variant="outline" 
        size="sm"
        leftIcon="📥"
      >
        Download
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        leftIcon="✏️"
      >
        Edit
      </Button>
      
      <Button 
        variant="danger" 
        size="sm"
        leftIcon="🗑️"
      >
        Delete
      </Button>
    </div>
  );
};

// ============================================
// RESPONSIVE EXAMPLES
// ============================================

// 1. Mobile-Friendly Full Width
export const MobileResponsive = () => {
  return (
    <div style={{ maxWidth: '100%' }}>
      <Button fullWidth variant="primary" size="lg">
        Mobile-Friendly Button
      </Button>
    </div>
  );
};

// 2. Responsive Button Group
export const ResponsiveButtonGroup = () => {
  return (
    <div className="btn-group-block">
      <Button variant="outline">Option 1</Button>
      <Button variant="outline">Option 2</Button>
      <Button variant="primary">Select</Button>
    </div>
  );
};

// ============================================
// DISABLED STATE EXAMPLES
// ============================================

export const DisabledStates = () => {
  return (
    <div className="btn-group">
      <Button variant="primary" disabled>
        Primary (Disabled)
      </Button>
      <Button variant="secondary" disabled>
        Secondary (Disabled)
      </Button>
      <Button variant="danger" disabled>
        Danger (Disabled)
      </Button>
    </div>
  );
};

// ============================================
// ACCESSIBILITY EXAMPLES
// ============================================

// 1. Icon-Only Button with Label
export const IconOnlyButton = () => {
  return (
    <Button 
      variant="outline"
      size="sm"
      ariaLabel="Close dialog"
    >
      ×
    </Button>
  );
};

// 2. Focus Visible Example
export const FocusExample = () => {
  return (
    <div>
      <p>Press Tab to navigate buttons and see focus outline</p>
      <div className="btn-group">
        <Button variant="primary">First Button</Button>
        <Button variant="secondary">Second Button</Button>
        <Button variant="outline">Third Button</Button>
      </div>
    </div>
  );
};

export default {
  SimpleButton,
  AllVariants,
  AllSizes,
  FormExample,
  FormWithLoading,
  ConfirmationDialog,
  ActionDialog,
  HeroCTA,
  CourseEnroll,
  StepNavigation,
  PaginationControls,
  TableRowActions,
  ListHeaderActions,
  ConditionalActions,
  MultiStateButton,
  IconButtons,
  MobileResponsive,
  ResponsiveButtonGroup,
  DisabledStates,
  IconOnlyButton,
  FocusExample,
};
