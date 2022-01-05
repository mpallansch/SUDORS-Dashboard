import { countCutoff, rateCutoff } from '../constants.json';

import '../css/DataTable.css';

function DataTable(params) {

  const { data, rates, highlight, xAxisKey } = params;

  const isArray = Array.isArray(data);

  const keys = isArray ? Object.keys(data[0]) : Object.keys(data).sort((a,b) => {
    if(a === 'Overall') return -1;
    if(b === 'Overall') return 1;
    return a < b ? -1 : 1;
  });

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
              {isArray && data.map(d => (
                <th>{d[xAxisKey]}</th>
              ))}
              {!isArray && keys.map(key => (
                <th className={key === highlight ? 'highlight' : ''}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isArray && keys.map(key => key !== xAxisKey && (
              <>
                <tr>
                  <th>{formatLabel(key)}</th>
                  {data.map(d => (
                    <td>{d[key]}</td>
                  ))}
                </tr>
              </>
            ))}

            {!isArray && Object.keys(data[keys[0]]).map(rowKey => (
              <tr>
                <th>{formatLabel(rowKey)}</th>
                {keys.map(colKey => (
                  <td>{data[colKey][rowKey] <= countCutoff ? 'Data suppressed' : data[colKey][rowKey]}</td>
                ))}
              </tr>
            ))}
            {!isArray && Object.keys(rates[keys[0]]).map(rowKey => (
              <tr>
                <th>{formatLabel(rowKey)}</th>
                {keys.map(colKey => (
                  <td>{rates[colKey][rowKey] <= rateCutoff ? 'Data suppressed' : rates[colKey][rowKey]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default DataTable;