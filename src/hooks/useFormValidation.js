import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    let error = '';
    
    if (!value || (typeof value === 'string' && !value.trim())) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Invalid email format';
    } else if (name === 'phone' && !/^[0-9\-\+\s()]{10,}$/.test(value)) {
      error = 'Invalid phone number (min 10 digits)';
    } else if (name === 'stock' && isNaN(value)) {
      error = 'Stock must be a number';
    } else if (name === 'price' && isNaN(value)) {
      error = 'Price must be a number';
    }
    
    return error;
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(initialValues).forEach(key => {
      newErrors[key] = validateField(key, values[key]);
    });
    
    setErrors(newErrors);
    
    // Check if any errors
    if (Object.values(newErrors).some(err => err)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
  };
};