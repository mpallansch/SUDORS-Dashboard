import { countCutoff, rateCutoff } from '../constants.json';

import '../css/DataTable.css';

function DataTable(params) {

  const { data, rates, orderedKeys, highlight, xAxisKey } = params;

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
          <thead>
            <tr>
              <th></th>
              {isArray && keys.map(key => key !== xAxisKey && (
                <th>{labelOverrides[key] || formatLabel(key)}</th>
              ))}

              {!isArray && [data, rates].map(d => 
                Object.keys(d[keys[0]]).map(rowKey => (
                  <>
                    <th>{labelOverrides[rowKey] || formatLabel(rowKey)}</th>
                  </>
                )
              ))}
              {/*!isArray && keys.map(key => (
                <th className={key === highlight ? 'highlight' : ''}>{labelOverrides[key] || key}</th>
              ))*/}
            </tr>
          </thead>
          <tbody>
            {isArray && data.map(d => (
              <>
                <tr>
                  <th>{labelOverrides[d[xAxisKey]] || d[xAxisKey]}</th>
                  {keys.map(key => key !== xAxisKey && (
                    <td>{labelOverrides[d[key]] || d[key]}</td>
                  ))}
                </tr>
              </>
            ))}

            {!isArray && keys.map(rowKey => (
                <tr>
                  <th className={rowKey === highlight ? 'highlight' : ''}>{labelOverrides[rowKey] || rowKey}</th>
                  {[data, rates].map(d => 
                    Object.keys(d[keys[0]]).map(colKey => (
                      <td>{d[rowKey][colKey] <= countCutoff ? 'Data suppressed' : d[rowKey][colKey]}</td>
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