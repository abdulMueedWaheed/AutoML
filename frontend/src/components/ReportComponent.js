import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api';

const ReportComponent = () => {
  const { datasetId } = useParams();
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const blob = await apiClient.downloadReport(datasetId, 'markdown');
        const text = await blob.text();
        setReport(text);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [datasetId]);

  if (loading) return <div className="loading">Generating report...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="card">
      <h2>AutoML Report</h2>

      <div style={{ marginBottom: '20px' }}>
        <button
          className="button"
          onClick={() => {
            const blob = new Blob([report], { type: 'text/markdown' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `automl_report_${datasetId}.md`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }}
        >
          Download Report
        </button>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        maxHeight: '600px',
        overflowY: 'auto',
        border: '1px solid var(--border-color)'
      }}>
        {report}
      </div>
    </div>
  );
};

export default ReportComponent;
