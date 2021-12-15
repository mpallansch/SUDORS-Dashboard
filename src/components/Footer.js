import { useState } from 'react';

function Footer() {

  const [ dataTableShow, setDataTableShow ] = useState(false);
  const [ footnotesShow, setFootnotesShow ] = useState(false);

  return (
    <>
      <div className="header margin" onClick={() => setDataTableShow(!dataTableShow)}>
        <span className="preheader-label">Data Table</span><span className="toggle-indicator">{dataTableShow ? '-' : '+'}</span>
      </div>

      {dataTableShow && (
        <p>Data Table</p>
      )}

      <div className="header margin" onClick={() => setFootnotesShow(!footnotesShow)}>
        <span className="preheader-label">Footnotes</span><span className="toggle-indicator">{footnotesShow ? '-' : '+'}</span>
      </div>

      {footnotesShow && (
        <p>Footnotes</p>
      )}
    </>
  );
}

export default Footer;