// src/components/MissingFieldsModal.jsx
import React, { useState } from 'react';
import { Modal, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setCandidateField, setMissingFields } from '../store/candidateSlice';

// ✅ FIX: Change prop from 'visible' to 'open'
export default function MissingFieldsModal({ open, onClose }) {
  const dispatch = useDispatch();
  const missing = useSelector(s => s.candidate.missingFields);
  const [values, setValues] = useState({});

  React.useEffect(() => {
    const initial = {};
    missing.forEach(k => (initial[k] = ''));
    setValues(initial);
  }, [open, missing]); // ✅ FIX: Update dependency array

  function handleChange(key, value) {
    setValues(v => ({ ...v, [key]: value }));
  }

  function handleConfirm() {
    // write into redux
    missing.forEach(k => {
      dispatch(setCandidateField({ key: k, value: values[k] || '' }));
    });
    dispatch(setMissingFields([]));
    onClose();
  }

  return (
    <Modal open={open} onCancel={onClose} onOk={handleConfirm} title="We need a few details">
      {missing.map(k => (
        <div key={k} style={{ marginBottom: 10 }}>
          <label style={{ textTransform: 'capitalize' }}>{k}</label>
          <Input value={values[k]} onChange={e => handleChange(k, e.target.value)} />
        </div>
      ))}
      <div>
        <Button type="primary" onClick={handleConfirm}>Continue</Button>
      </div>
    </Modal>
  );
}
