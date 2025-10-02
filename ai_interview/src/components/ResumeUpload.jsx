// src/components/ResumeUpload.jsx
import React, { useState } from 'react';
import { Upload, Button, Alert, Spin, Form, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setResumeFileMeta, setCandidateField } from '../store/candidateSlice';

export default function ResumeUpload() {
  const dispatch = useDispatch();
  const candidate = useSelector(s => s.candidate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file) {
    setError('');
    setLoading(true);

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('resume', file);

     try {
      // Use the FastAPI backend URL for local development
      // For production, this will be '/api/extract-pdf'
      const apiUrl = 'https://interview-app-teal-seven.vercel.app/api/extract-pdf';
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process resume');
      }
      
       const extractedData = await response.json();

      dispatch(setResumeFileMeta({ name: file.name, size: file.size, type: file.type }));
      dispatch(setCandidateField({ key: 'name', value: extractedData.name || '' }));
      dispatch(setCandidateField({ key: 'email', value: extractedData.email || '' }));
      dispatch(setCandidateField({ key: 'phone', value: extractedData.phone || '' }));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    return false;
  }

  return (
    <div>
      <Upload beforeUpload={handleFile} showUploadList={false} accept=".pdf">
        <Button icon={<UploadOutlined />}>Upload resume (PDF)</Button>
      </Upload>

      <div style={{ marginTop: 12 }}>
        {loading && <Spin />}
        {error && <Alert type="error" message={error} />}
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>Extracted fields (editable)</h4>
        <Form layout="vertical">
          <Form.Item label="Name">
            <Input
              value={candidate.name}
              onChange={e => dispatch(setCandidateField({ key: 'name', value: e.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              value={candidate.email}
              onChange={e => dispatch(setCandidateField({ key: 'email', value: e.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Phone">
            <Input
              value={candidate.phone}
              onChange={e => dispatch(setCandidateField({ key: 'phone', value: e.target.value }))}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}