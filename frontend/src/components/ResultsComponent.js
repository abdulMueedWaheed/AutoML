import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';

const ResultsComponent = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [datasetId]);

  const fetchResults = async (version = null) => {
    try {
      const res = await apiClient.getResults(datasetId, version);
      // Support both shapes: { error, data } and raw data
      const data = res && res.error === true ? null : (res && res.data ? res.data : res);
      if (!data) {
        setError('No results available');
        return;
      }
      setResults(data);
      setSelectedVersion(version);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChange = (version) => {
    fetchResults(version);
  };

  const handleDownloadReport = async (format) => {
    try {
      const res = await apiClient.downloadReport(datasetId, format);
      const blob = res && res.data ? res.data : res;
      const url = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `automl_report_${datasetId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(`Failed to download report: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading results...</div>;
  if (error) return <div className="error">{error}</div>;

  if (results.status !== 'done') {
    return (
      <div className="card">
        <h2>Training Results</h2>
        <div className="loading">
          <p>Training is still in progress. Status: {results.status}</p>
          <p>Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Model Training Results</h2>

      {results.versions && results.versions.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <label className="label">Select Training Version:</label>
          <select
            value={selectedVersion || results.versions[0]}
            onChange={(e) => handleVersionChange(e.target.value)}
            className="select"
          >
            {results.versions.map(version => (
              <option key={version} value={version}>
                Version {version} ({new Date(parseInt(version) * 1000).toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3>Model Comparison</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Model</th>
                {results.comparison && results.comparison.length > 0 &&
                  Object.keys(results.comparison[0]).filter(key => key !== 'Model').map(metric => (
                    <th key={metric}>{metric}</th>
                  ))
                }
              </tr>
            </thead>
            <tbody>
              {results.comparison && results.comparison.map((row, index) => (
                <tr key={index}>
                  <td><strong>{row.Model || row.model}</strong></td>
                  {Object.keys(row).filter(key => key !== 'Model' && key !== 'model').map(metric => (
                    <td key={metric}>
                          {typeof row[metric] === 'number' && Number.isFinite(row[metric]) ? row[metric].toFixed(4) : (row[metric] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Model Ranking</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Model</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {results.ranked && results.ranked.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td><strong>{row.Model || row.model}</strong></td>
                <td>{typeof row.Score === 'number' && Number.isFinite(row.Score) ? row.Score.toFixed(4) : (row.Score ?? '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <h3>Download Report</h3>
        <button
          className="button"
          onClick={() => handleDownloadReport('markdown')}
          style={{ marginRight: '10px' }}
        >
          Download Markdown Report
        </button>
        <button
          className="button"
          onClick={() => navigate(`/report/${datasetId}`)}
        >
          View Full Report
        </button>
      </div>
    </div>
  );
};

export default ResultsComponent;
