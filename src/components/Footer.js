import { useState } from 'react';

function Footer() {
  
  const [ footnotesShow, setFootnotesShow ] = useState(false);
  const [ technotesShow, setTechnotesShow ] = useState(false);

  return (
    <div id="footer">
      <button className="header margin" onClick={() => setFootnotesShow(!footnotesShow)}>
        <span className="preheader-label">Footnotes</span><span className="toggle-indicator">{footnotesShow ? '-' : '+'}</span>
      </button>

      {footnotesShow && (
        <>
          <p><sup>a</sup>Potential opportunity for intervention includes linkage to care or life-saving actions (i.e., recent institutional release, previous nonfatal overdose, mental health diagnosis, current treatment for substance use disorder, potential bystander present when fatal overdose occurred, and fatal drug use witnessed).</p>
          <p><sup>b</sup>Any opioid includes deaths that had at least one opioid listed as a cause of death.</p>
          <p><sup>c</sup>Any stimulant includes deaths that had at least one stimulant listed as a cause of death.</p>
          <p><sup>d</sup>Deaths involving multiple drugs were included in the percentages for each drug (i.e., heroin, cocaine, methamphetamine) or drug class (i.e., any opioids, illicitly manufactured fentanyls, prescription opioids, any stimulant). For example, a death involving both heroin and cocaine would be included in both the heroin and cocaine percentages.</p>
          <p><sup>e</sup>Columns represent the most common opioids and stimulants, alone or in combination, by descending percentage. Rows represent the involvement of specific common opioids and stimulants within the most common combinations. The specific drugs within a given combination are denoted by the presence of a dot in the column.</p>
          <p><sup>f</sup>Demographic data are restricted to decedents with known information.</p>
          <p><sup>g</sup>Characteristics and circumstances represent evidence available in source documents; these are likely underestimated as death investigators might have limited information.</p>
          <p><sup>h</sup>A potential bystander is defined as a person aged ≥11 years who was physically nearby either during or shortly preceding a drug overdose and potentially had an opportunity to intervene or respond to the overdose. This includes any persons in the same structure (e.g., same room or same building, but different room) as the decedent during that time. For example, the family member of an opioid overdose decedent who was in another room during the fatal incident would be considered a potential bystander if that person might have had an opportunity to provide life-saving measures such as naloxone administration, if adequate resources were available and the family member was aware that an overdose event could occur. This does not include, however, persons in different self-contained parts of larger buildings (e.g., a person in a different apartment in the same apartment building would not be considered a potential bystander).</p>
          <p><sup>i</sup>Substance use disorder (SUD) treatment included medications for opioid use disorder (MOUD), living in an inpatient rehabilitation facility, or participation in mental health or SUD outpatient treatment.</p>
          <p><sup>j</sup>Release within a month before death from institutional settings such as prisons/jails, residential treatment facilities, and psychiatric hospitals.</p>
          <p><sup>k</sup>History of substance use/misuse specifically captures past illicit drug use or prescription drug misuse among decedents.</p>
          <p><sup>l</sup>Naloxone is a life-saving medication that can reverse an overdose from opioids, including heroin, fentanyl, and prescription opioid medications.</p>
          <p><sup>m</sup>Recent period of opioid use abstinence followed by return to use.</p>
          <p><sup>n</sup>Persons experiencing homelessness were those who resided in either places not designed for or ordinarily used as regular sleeping accommodations or in a supervised shelter or drop-in center designated to provide temporary living arrangements, congregate shelters, or temporary accommodations provided by a homeless shelter.</p>
        </>
      )}

      <button className="header margin" onClick={() => setTechnotesShow(!technotesShow)}>
        <span className="preheader-label">Technical Notes</span><span className="toggle-indicator">{technotesShow ? '-' : '+'}</span>
      </button>
      
      {technotesShow && (
        <>
          <p>Data come from death certificate information, medical examiner or coroner reports, and forensic toxicology results entered into the State Unintentional Drug Overdose Reporting System (SUDORS); the number of deaths in SUDORS might not match the number in CDC WONDER. Percentages are among decedents with known information. Rates are calculated from 2020 Census population denominators.</p>
          <p>The Overall category includes data from AK, AZ, CT, DC, DE, GA, ME, MA, MN, MS, NV, NJ, NM, OK, OR, SD, UT, and VT.</p>
          <p>Drugs were classified as involved in (i.e., contributing to) overdose deaths if the medical examiner/coroner listed them as causing death on the death certificate or in the medical examiner/coroner report.</p>
          <p>Deaths involving multiple drugs were included in the rates for each drug class. When the cause of death indicated multiple drugs were involved but did not indicate specific drugs, all drugs detected by postmortem toxicology testing were classified as involved in the drug overdose death. For example, if the cause of death was “multidrug overdose” and toxicology results were positive for five drugs, all five were classified as involved.</p>
          <p>Rates based on &lt;20 drug overdose deaths are suppressed to avoid presentation of unstable rates.</p>
        </>
      )}
    </div>
  );
}

export default Footer;