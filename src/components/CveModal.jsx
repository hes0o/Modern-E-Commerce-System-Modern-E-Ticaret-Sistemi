import { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://127.0.0.1:8000';

function CveModal({ seciliCve, setSeciliCve, onAnalyzed }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState(null);
  const [analyzeErr, setAnalyzeErr] = useState(null);
  const pollRef = useRef(null);

  // Clean up polling on unmount or modal close
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  if (!seciliCve) return null;

  const isUnprocessed = seciliCve.aiOzet?.startsWith('Bu CVE henüz analiz edilmedi');

  const handleAnalyze = () => {
    setAnalyzing(true);
    setAnalyzeMsg('AI analizi başlatılıyor…');
    setAnalyzeErr(null);

    fetch(`${API_BASE}/api/cves/${seciliCve.id}/analyze`, { method: 'POST' })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.detail || `Hata: ${res.status}`); });
        return res.json();
      })
      .then(() => {
        setAnalyzeMsg('Analiz çalışıyor, sonuç bekleniyor…');
        let pollCount = 0;
        const maxPolls = 40; // 40 * 3s = 120s (2 min) max timeout

        pollRef.current = setInterval(() => {
          pollCount++;
          fetch(`${API_BASE}/api/cves/${seciliCve.id}`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
              if (!data) return;

              if (data.ai_error) {
                // Backend reported an error during analysis
                clearInterval(pollRef.current);
                pollRef.current = null;
                setAnalyzing(false);
                setAnalyzeMsg(null);
                setAnalyzeErr(data.ai_error);
              } else if (data.ai_processed) {
                // Success
                clearInterval(pollRef.current);
                pollRef.current = null;
                setAnalyzing(false);
                setAnalyzeMsg('✅ AI analizi tamamlandı!');
                setSeciliCve((prev) => ({
                  ...prev,
                  aiOzet: data.ai_summary || prev.aiOzet,
                  gerekce: data.ai_risk_reason || prev.gerekce,
                  aksiyon: data.ai_recommended_action || prev.aksiyon,
                  seviye: data.risk_level || prev.seviye,
                }));
                if (onAnalyzed) onAnalyzed();
              } else if (pollCount >= maxPolls) {
                // Timeout
                clearInterval(pollRef.current);
                pollRef.current = null;
                setAnalyzing(false);
                setAnalyzeMsg(null);
                setAnalyzeErr('Analiz zaman aşımına uğradı (2 dakika). AI servisi meşgul olabilir veya kota dolmuş olabilir.');
              }
            })
            .catch(() => {
              if (pollCount >= maxPolls) {
                clearInterval(pollRef.current);
                pollRef.current = null;
                setAnalyzing(false);
                setAnalyzeMsg(null);
                setAnalyzeErr('Sunucu bağlantısı zaman aşımına uğradı.');
              }
            });
        }, 3000);
      })
      .catch((err) => {
        setAnalyzing(false);
        setAnalyzeMsg(null);
        setAnalyzeErr(err.message);
      });
  };

  const handleClose = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setAnalyzing(false);
    setAnalyzeMsg(null);
    setAnalyzeErr(null);
    setSeciliCve(null);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
 
        <div className="modal-header">
          <h2>{seciliCve.id} Detayı</h2>
          <button className="modal-close-icon" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-row">
            <span className="modal-label">Etkilenen Paket:</span>
            <span className="modal-value">{seciliCve.paket}</span>
          </div>

          <div className="modal-row">
            <span className="modal-label">CVSS / Seviye:</span>
            <span className="modal-value">
              <strong>{seciliCve.skor}</strong> — 
              <span className={`badge ${seciliCve.seviye.toLowerCase()}`}>
                {seciliCve.seviye}
              </span>
            </span>
          </div>

          <div className="modal-row">
            <span className="modal-label">Tarih:</span>
            <span className="modal-value">{seciliCve.tarih}</span>
          </div>

          <div className="modal-section">
            <span className="modal-label">Teknik Açıklama:</span>
            <p className="modal-text">{seciliCve.ozet}</p>
          </div>

          <div className="modal-section ai-box">
            <span className="modal-label">🤖 AI Analiz & Özeti:</span>
            <p className="modal-text">{seciliCve.aiOzet}</p>
          </div>

          <div className="modal-section">
            <span className="modal-label">Risk Gerekçesi:</span>
            <p className="modal-text">{seciliCve.gerekce}</p>
          </div>

          <div className="modal-section action-box">
            <span className="modal-label">📋 Önerilen Aksiyon:</span>
            <p className="modal-text font-semibold">{seciliCve.aksiyon}</p>
          </div>

          {/* Analyze status messages */}
          {analyzeMsg && (
            <div className="analyze-status-msg">
              {analyzing && <span className="analyze-spinner" />}
              {analyzeMsg}
            </div>
          )}
          {analyzeErr && (
            <div className="analyze-error-msg">⚠️ {analyzeErr}</div>
          )}
        </div>

        <div className="modal-footer">
          {isUnprocessed && !analyzing && !analyzeMsg?.startsWith('✅') && (
            <button
              id="analyze-cve-btn"
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              🧠 AI ile Analiz Et
            </button>
          )}
          <button className="modal-close-btn" onClick={handleClose}>Kapat</button>
        </div>

      </div>
    </div>
  );
}

export default CveModal;