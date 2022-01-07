import { useState } from 'react';

function Footer() {
  
  const [ footnotesShow, setFootnotesShow ] = useState(false);

  return (
    <>
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