import { countCutoff, rateCutoff } from '../constants.json';

import '../css/DataTable.css';

function DataTable(params) {

  const { data, rates, cutoffData, cutoffKey, orderedKeys, highlight, xAxisKey, suffixes, caption, customBackground } = params;

  const labelOverrides = params.labelOverrides || {};

  const isArray = Array.isArray(data);

  const keys = orderedKeys || (isArray ? Object.keys(data[0]) : Object.keys(data).sort((a,b) => {
    if(a === 'Overall') return -1;
    if(b === 'Overall') return 1;
    return a < b ? -1 : 1;
  }));

  const capitalize = (key) => {
    return key.charAt(0).toUpperCase() + key.substring(1);
  };

  const formatLabel = (key) => {
    if(!key) return 'State';

    let words = [];

    let start = 0;
    for(let i = 1; i < key.length; i++){
      if(key[i] === key[i].toUpperCase()){
        words.push(key.substring(start, i));
        start = i;
      }
    }

    words.push(key.substring(start));
    words = words.map(word => capitalize(word));

    return words.join(' ');
  };

  return (
    <>
      <div className={`table-container${customBackground ? ' custom-background' : ' non-custom-background'}`} tabIndex="0">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{labelOverrides[xAxisKey] || formatLabel(xAxisKey)}</th>
              {isArray && keys.map(key => key !== xAxisKey && (
                <th key={`th-${key}`} scope="col">{labelOverrides[key] || formatLabel(key)}</th>
              ))}

              {!isArray && [data, rates].map(d => 
                Object.keys(d[keys[0]]).map(rowKey => (
                  <th key={`th-${rowKey}`} scope="col">{labelOverrides[rowKey] || formatLabel(rowKey)}</th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            {isArray && data.map((d, i) => (
              <tr key={`tr-${d[xAxisKey]}-${i}`} className={d.background === true ? 'background' : ''}>
                <th key={`th-${d[xAxisKey]}-${i}`} scope="row">{labelOverrides[d[xAxisKey]] || d[xAxisKey]}</th>
                {d.spacer === true && <td colSpan={d.colSpan}></td>}
                {d.spacer !== true && keys.map((key, j) => key !== xAxisKey && (
                  <td key={`td-${xAxisKey}-${i}-${j}`}>
                    {key.toLowerCase().indexOf('percent') === -1 && (cutoffData ? 
                        cutoffData[i][cutoffKey] : 
                        d[keys[j - 2]]) < rateCutoff ? 
                          'Data suppressed' : 
                          Number(d[key]).toLocaleString()}{suffixes && suffixes[key]}
                  </td>
                ))}
              </tr>
            ))}

            {!isArray && keys.map((rowKey, rowIndex) => (
                <tr key={`tr-${rowKey}-${rowIndex}`} className={rowKey === highlight ? 'highlight' : ''}>
                  <th key={`th-${rowKey}-${rowIndex}`} scope="row">{labelOverrides[rowKey] || rowKey}</th>
                  {[data, rates].map((d, i) => 
                    Object.keys(d[keys[0]]).map((colKey, colIndex) => (
                      <td key={`td-${d[rowKey][colKey]}-${rowIndex}-${colIndex}`}>{data[rowKey][Object.keys(data[keys[0]])[0]] < [countCutoff, rateCutoff][i] ? 'Data suppressed' : Number(d[rowKey][colKey]).toLocaleString()}</td>
                    ))
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default DataTable;