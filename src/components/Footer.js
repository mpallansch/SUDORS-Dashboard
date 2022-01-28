import { useState } from 'react';

function Footer() {
  
  const [ footnotesShow, setFootnotesShow ] = useState(false);

  return (
    <div id="footer">
      <button className="header margin" onClick={() => setFootnotesShow(!footnotesShow)}>
        <span className="preheader-label">Footnotes</span><span className="toggle-indicator">{footnotesShow ? '-' : '+'}</span>
      </button>

      {footnotesShow && (
        <p>Footnotes</p>
      )}
    </div>
  );
}

export default Footer;