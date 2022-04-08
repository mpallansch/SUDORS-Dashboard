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
          <p><sup>b</sup>Any opioid includes deaths that had at least one opioid listed as a cause of death. The "Any Opioids" category includes Illicitly manufactured fentanyls, heroin, prescription opioids, and any other opioids involved in overdose deaths.</p>
          <p><sup>c</sup>Fentanyl was classified as likely illicitly manufactured using toxicology, scene, and witness evidence. In the absence of sufficient evidence to classify fentanyl as illicit or prescription, fentanyl was classified as illicit because the vast majority of fentanyl overdose deaths involve illicit fentanyl. All fentanyl analogs except alfentanil, remifentanil, and sufentanil (which have legitimate human medical use) were included as illicitly manufactured fentanyls. <br/>IMFs: illicitly manufactured fentanyls.</p>
          <p><sup>d</sup>Drugs coded as heroin were heroin and 6-monoacetylmorphine. In addition, morphine was coded as heroin if detected along with 6-acetylmorphine or if scene, toxicology, or witness evidence indicated presence of heroin impurities or other illicit drugs, injection, illicit drug use, or a history of heroin use. </p>
          <p><sup>c</sup>Any stimulant includes deaths that had at least one stimulant listed as a cause of death. The "Any Stimulant" category includes cocaine, methamphetamine, and any other stimulants involved in overdose deaths.</p>
          <p><sup>d</sup>Percentages are not mutually exclusive. Deaths involving multiple drugs were included in the percentages for each drug (i.e., heroin, cocaine, methamphetamine) or drug class (i.e., any opioids, illicitly manufactured fentanyls, prescription opioids, any stimulant). For example, a death involving both heroin and cocaine would be included in both the heroin and cocaine percentages.</p>
          <p><sup>e</sup>Columns represent the most common opioids and stimulants, alone or in combination, by descending percentage. Rows represent the involvement of specific common opioids and stimulants within the most common combinations. The specific drugs within a given combination are denoted by the presence of a dot in the column.</p>
          <p><sup>f</sup>Demographic data are restricted to decedents with known information.</p>
          <p><sup>g</sup>Circumstances represent evidence available in source documents; these are likely underestimated as death investigators might have limited information.</p>
          <p><sup>h</sup>A potential bystander is defined as a person aged ≥11 years who was physically nearby either during or shortly preceding a drug overdose and potentially had an opportunity to intervene or respond to the overdose. This includes any persons in the same structure (e.g., same room or same building, but different room) as the decedent during that time. For example, the family member of an opioid overdose decedent who was in another room during the fatal incident would be considered a potential bystander if that person might have had an opportunity to provide life-saving measures such as naloxone administration, if adequate resources were available and the family member was aware that an overdose event could occur. This does not include, however, persons in different self-contained parts of larger buildings (e.g., a person in a different apartment in the same apartment building would not be considered a potential bystander).</p>
          <p><sup>i</sup>Current treatment for substance use disorders (SUD) included medications for opioid use disorder (MOUD), living in an inpatient rehabilitation facility, or participation in mental health or SUD outpatient treatment.</p>
          <p><sup>j</sup>Release within a month before death from institutional settings such as prisons/jails, residential treatment facilities, and psychiatric hospitals.</p>
          <p><sup>k</sup>History of substance use/misuse specifically captures past illicit drug use or prescription drug misuse among decedents.</p>
          <p><sup>l</sup>Naloxone is a life-saving medication that can reverse an overdose from opioids, including heroin, fentanyl, and prescription opioid medications.</p>
          <p><sup>m</sup>Recent period of opioid use abstinence followed by return to use.</p>
          <p><sup>n</sup>Persons experiencing homelessness were those who resided in either places not designed for or ordinarily used as regular sleeping accommodations or in a supervised shelter or drop-in center designated to provide temporary living arrangements, congregate shelters, or temporary accommodations provided by a homeless shelter.  Persons experiencing housing instability are those who are not experiencing homelessness, but lack the resources or support networks to obtain or retain permanent housing and includes interrelated challenges, such as trouble paying rent, overcrowding, moving frequently, or staying with relatives.</p>
        </>
      )}

      <button className="header margin" onClick={() => setTechnotesShow(!technotesShow)}>
        <span className="preheader-label">Important Data Considerations</span><span className="toggle-indicator">{technotesShow ? '-' : '+'}</span>
      </button>
      
      {technotesShow && (
        <>
          <p>Data come from death certificate information, medical examiner or coroner reports, and forensic toxicology results entered into the State Unintentional Drug Overdose Reporting System (SUDORS).; Jurisdictions report occurrent drug overdose deaths (i.e., all overdose deaths that occurred within the jurisdiction regardless of decedent residence). Percentages are among decedents with known information. Rates are calculated from 2020 Census population denominators and age-standardized to the 2010 Census population. The number of deaths, and corresponding rates, in SUDORS might not match the number and rate in CDC WONDER.</p> 
          <p>The Injury Surveillance Workgroup 7 consensus definition of a drug is used to determine SUDORS case. A drug is any chemical compound that is chiefly used by or administered to humans or animals as an aid in the diagnosis, treatment, or prevention of disease or injury, for the relief of pain or suffering, to control or improve any physiologic or pathologic condition, or for the feeling it causes. This definition specifically includes: street drugs such as heroin, cocaine, and hallucinogens; prescription drugs; over-the-counter drugs; biological substances such as vaccinations; veterinary drugs; dietary supplements; and non-medicinal substances used primarily for the feeling they cause. This definition specifically excludes: alcohol; tobacco; and chemicals that are deliberately inhaled for the feeling they cause but are chiefly used for other purposes (i.e., organic solvents and halogen derivatives of aliphatic and aromatic hydrocarbons).</p> 
          <p>Jurisdictions that reported all overdose deaths in their jurisdiction during 2020 and had medical examiner/coroner reports for at least 75% of deaths are included in this dashboard. These jurisdictions include Alaska, Arizona, Connecticut, Delaware, District of Columbia, Georgia, Kansas, Kentucky, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Montana, Nevada, New Hampshire, New Jersey, New Mexico, North Carolina, Ohio, Oklahoma, Oregon, Rhode Island, South Dakota, Utah, Vermont, Virginia, and West Virginia. The Overall category includes data from these 29 jurisdictions.</p>
          <p>Drugs were classified as involved in (i.e., contributing to) overdose deaths if the medical examiner/coroner listed them as causing death on the death certificate, or in the medical examiner/coroner report, or postmortem toxicology report. </p>
          <p>Deaths involving multiple drugs were included in the rates for each drug class. When the cause of death indicated multiple drugs were involved but did not indicate specific drugs, all drugs detected by postmortem toxicology testing were classified as involved in the drug overdose death. For example, if the cause of death was “multidrug overdose” and toxicology results were positive for five drugs, all five were classified as involved.</p>
          <p>Rates based on &lt;20 drug overdose deaths are suppressed to avoid presentation of unstable rates.</p>
        </>
      )}
    </div>
  );
}

export default Footer;