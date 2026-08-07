function CveTable({ filtrelenmisCveListesi, setSeciliCve }) {
  if (filtrelenmisCveListesi.length === 0) {
    return (
      <div className="empty-table-box">
        <h3>Aradığınız kriterde zafiyet bulunamadı.</h3>
        <p>Lütfen CVE ID, paket adı veya arama teriminizi kontrol edip tekrar deneyin.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>CVE ID</th>
            <th>ETKİLENEN PAKET</th>
            <th>CVSS / SEVİYE</th>
            <th>TARİH</th>
            <th>AI ÖZETİ</th>
          </tr>
        </thead>
        <tbody>
          {filtrelenmisCveListesi.map((cve) => (
            <tr key={cve.id} onClick={() => setSeciliCve(cve)}>
              <td><strong>{cve.id}</strong></td>
              <td>{cve.paket}</td>
              <td>
                <strong>{cve.skor}</strong> — 
                <span className={`badge ${cve.seviye.toLowerCase()}`}>
                  {cve.seviye}
                </span>
              </td>
              <td>{cve.tarih}</td>
              <td>{cve.aiOzetKisa || cve.ozet}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CveTable;

