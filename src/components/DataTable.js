import { countCutoff, rateCutoff } from '../constants.json';

import '../css/DataTable.css';

function DataTable(params) {

  const { data, rates, cutoffData, cutoffKey, orderedKeys, highlight, xAxisKey, caption } = params;

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
      <div className="table-container">
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
            {isArray && data.map(d => (
              <tr key={`tr-${d[xAxisKey]}`}>
                <th key={`th-${d[xAxisKey]}`} scope="row">{labelOverrides[d[xAxisKey]] || d[xAxisKey]}</th>
                {keys.map((key, i) => key !== xAxisKey && (
                  <td key={`td-${xAxisKey}-${i}`}>{key.toLowerCase().indexOf('percent') !== -1 ? (d[keys[i - 1]] < countCutoff ? 'Data suppressed' : d[key]) : ((cutoffData ? cutoffData[i][cutoffKey] : d[key]) < countCutoff ? 'Data suppressed' : d[key])}</td>
                ))}
              </tr>
            ))}

            {!isArray && keys.map(rowKey => (
                <tr key={`tr-${rowKey}`} className={rowKey === highlight ? 'highlight' : ''}>
                  <th key={`th-${rowKey}`} scope="row">{labelOverrides[rowKey] || rowKey}</th>
                  {[data, rates].map((d, i) => 
                    Object.keys(d[keys[0]]).map(colKey => (
                      <td key={`td-${d[rowKey][colKey]}`}>{d[rowKey][colKey] < [countCutoff, rateCutoff][i] ? 'Data suppressed' : d[rowKey][colKey]}</td>
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