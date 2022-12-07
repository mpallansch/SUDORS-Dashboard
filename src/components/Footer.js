import { useState } from 'react';

function Footer(params) {

  const { accessible } = params;
  
  const [ footnotesShow, setFootnotesShow ] = useState(false);
  const [ technotesShow, setTechnotesShow ] = useState(false);

  return (
    <div id="footer">
      <button className="header margin" onClick={() => setFootnotesShow(!footnotesShow)}>
        <span className="preheader-label">Footnotes</span><span className="toggle-indicator">{footnotesShow ? '-' : '+'}</span>
      </button>

      {footnotesShow && (
        <>
          <p id="footnote-a"><sup>a</sup>Potential opportunities for intervention included documented evidence of at least one of the following: potential bystander presence, a mental health diagnosis, prior overdose, fatal drug use witnessed, recent release from institutional setting (&lt; 1 month), or current treatment for substance use disorder(s). Percentages are only calculated among decedents with an available medical examiner or coroner report. Information represents evidence available in source documents; these are likely underestimated as death investigators might have limited information.</p>
          <p id="footnote-b"><sup>b</sup>"Any Opioids" includes deaths that had at least one opioid listed as a cause of death. The "Any Opioids" category includes illicitly manufactured fentanyls, heroin, prescription opioids, and any other opioids involved in overdose deaths.</p>
          <p id="footnote-c"><sup>c</sup>Fentanyl was classified as likely illicitly manufactured using toxicology, scene, and witness evidence. In the absence of sufficient evidence to classify fentanyl as illicit or prescription, fentanyl was classified as illicit because the vast majority of fentanyl overdose deaths involve illicit fentanyl. All fentanyl analogs except alfentanil, remifentanil, and sufentanil (which have legitimate human medical use) were included as illicitly manufactured fentanyls. IMFs: illicitly manufactured fentanyls.</p>
          <p id="footnote-d"><sup>d</sup>Drugs coded as heroin were heroin and 6-acetylmorphine. In addition, morphine was coded as heroin if detected along with 6-acetylmorphine or if scene, toxicology, or witness evidence indicated presence of heroin impurities or other illicit drugs, injection, illicit drug use, or a history of heroin use.</p>
          <p id="footnote-e"><sup>e</sup>"Any Stimulants" includes deaths that had at least one stimulant listed as a cause of death. The "Any Stimulants" category includes cocaine, methamphetamine, and any other stimulants involved in overdose deaths.</p>
          <p id="footnote-f"><sup>f</sup>Percentages are not mutually exclusive. Deaths involving multiple drugs were included in the percentages for each drug (i.e., heroin, cocaine, methamphetamine) or drug class (i.e., any opioids, illicitly manufactured fentanyls, prescription opioids, any stimulants). For example, a death involving both heroin and cocaine would be included in both the heroin and cocaine percentages.</p>
          <p id="footnote-g"><sup>g</sup>Opioid and stimulant drugs or drug combinations include illicitly manufactured fentanyls, heroin, prescription opioids, other opioids (including non-specific opioids or other synthetic opioids such as U-4770, isotonitazene), cocaine, methamphetamine, and other stimulants (including amphetamines, cathinones, and central nervous system stimulants). If a category does not specify whether other opioids or other stimulants are or are not involved, then the category includes deaths involving the specified drugs (e.g., heroin, methamphetamine) with and without other opioids or other stimulants. If there are ties in the top combinations, they will be presented alphabetically. If there is a tie for the 5th combination, the combination that comes first alphabetically will be presented. The sum of the top 5 combination percentages may not add to the total in the text due to rounding.</p>
          <p id="footnote-h"><sup>h</sup>Demographic data are restricted to decedents with known information. Thus, the sum of the counts of each category may not add to the total due to missing data.</p>
          <p id="footnote-i"><sup>i</sup>Circumstances represent evidence available in source documents; these are likely underestimated as death investigators might have limited information. Circumstance percentages are only among decedents with an available medical examiner or coroner report and with known information on the specified circumstance.</p>
          <p id="footnote-j"><sup>j</sup>Current treatment for substance use disorders (SUD) included medications for opioid use disorder (MOUD), living in an inpatient rehabilitation facility, or participation in mental health or SUD outpatient treatment.</p>
          <p id="footnote-k"><sup>k</sup>A potential bystander is defined as a person aged ≥11 years who was physically nearby either during or shortly preceding a drug overdose and potentially had an opportunity to intervene or respond to the overdose. This includes any persons in the same structure (e.g., same room or same building, but different room) as the decedent during that time. For example, the family member of an opioid overdose decedent who was in another room during the fatal incident would be considered a potential bystander if that person might have had an opportunity to provide life-saving measures such as naloxone administration, if adequate resources were available and the family member was aware that an overdose event could occur. This does not include, however, persons in different self-contained parts of larger buildings (e.g., a person in a different apartment in the same apartment building would not be considered a potential bystander).</p>
          <p id="footnote-l"><sup>l</sup>Released within a month before death from institutional settings such as prisons/jails, residential treatment facilities, and psychiatric hospitals.</p>
          <p id="footnote-m"><sup>m</sup>Persons experiencing homelessness were those who resided in either places not designed for or ordinarily used as regular sleeping accommodations or in a supervised shelter or drop-in center designated to provide temporary living arrangements, congregate shelters, or temporary accommodations provided by a homeless shelter. Persons experiencing housing instability are those who are not experiencing homelessness, but lack the resources or support networks to obtain or retain permanent housing and includes interrelated challenges, such as trouble paying rent, overcrowding, moving frequently, or staying with relatives.</p>
          <p id="footnote-n"><sup>n</sup>Naloxone is a life-saving medication that can reverse an overdose from opioids, including heroin, fentanyl, and prescription opioid medications.</p>
          <p id="footnote-o"><sup>o</sup>Recent period of opioid use abstinence followed by return to use.</p>
        </>
      )}

      <button className="header margin" onClick={() => setTechnotesShow(!technotesShow)}>
        <span id="important-data-considerations" className="preheader-label">Important Data Considerations</span><span className="toggle-indicator">{technotesShow ? '-' : '+'}</span>
      </button>
      
      {technotesShow && (
        <>
          <p>Data come from death certificate information, medical examiner or coroner reports, and forensic toxicology results entered into the State Unintentional Drug Overdose Reporting System (SUDORS). Jurisdictions report occurrent drug overdose deaths (i.e., all overdose deaths that occurred within the jurisdiction regardless of decedent residence). Percentages are among decedents with known information (e.g., counts for demographic data and month of death may not add to the total due to missing information). Drug-, sex-, and race/ethnicity-specific rates are age-standardized to the 2010 Census population. The number of deaths, and corresponding rates, in SUDORS might not match the number and rate in CDC WONDER.</p> 
          <p>The <a target="_blank" href="https://cdn.ymaws.com/www.safestates.org/resource/resmgr/imported/ISW7%20Full%20Report_3.pdf">Injury Surveillance Workgroup 7 consensus definition of a drug<span className="fi cdc-icon-external icon icon-fw x16" aria-hidden="true"></span></a> is used to determine SUDORS case. A drug is any chemical compound that is chiefly used by or administered to humans or animals as an aid in the diagnosis, treatment, or prevention of disease or injury, for the relief of pain or suffering, to control or improve any physiologic or pathologic condition, or for the feeling it causes. This definition specifically includes: street drugs such as heroin, cocaine, and hallucinogens; prescription drugs; over-the-counter drugs; biological substances such as vaccinations; veterinary drugs; dietary supplements; and non-medicinal substances used primarily for the feeling they cause. This definition specifically excludes: alcohol; tobacco; and chemicals that are deliberately inhaled for the feeling they cause but are chiefly used for other purposes (i.e., organic solvents and halogen derivatives of aliphatic and aromatic hydrocarbons).</p> 
          <p>Jurisdictions that reported all overdose deaths in their jurisdiction for the selected year, and had medical examiner/coroner reports for at least 75% of deaths in that year, are included in this dashboard. The Overall category may not be comparable across years because different jurisdictions may be included in different years based on data availability and completeness. The Overall category includes the jurisdictions listed in the jurisdiction selection dropdown box for the selected year. Yearly data are based on information entered into the SUDORS web-based system by the dates below. Information entered into the web-based system after the below date for a given year will not be included and therefore may not match more recent jurisdiction data.</p>
          <ul>
            <li>2020 data: March 1, 2022</li>
            <li>2021 data: October 19, 2022</li>
          </ul>
          <p>Drugs were classified as involved in overdose deaths if the medical examiner/coroner listed them as causing death on the death certificate, or in the medical examiner/coroner report, or postmortem toxicology report.</p>
          <p>Rates are calculated using population estimates from the U.S. Census Bureau. Beginning with the release of the 2021 data, the U.S. Census Bureau instituted new methodology to calculate population estimates. The new methodology, referred to as <a href="https://www.ncsl.org/research/redistricting/differential-privacy-for-census-data-explained.aspx" target="_blank">differential privacy</a>, ensures that data from individuals and individual households remain confidential. Therefore, rates for 2021 and forward may not be directly comparable to 2020 rates.</p>
          <p>Deaths involving multiple drugs were included in the rates for each drug class. When the cause of death indicated multiple drugs were involved but did not indicate specific drugs, all drugs detected by postmortem toxicology testing were classified as involved in the drug overdose death. For example, if the cause of death was “multidrug overdose” and toxicology results were positive for five drugs, all five were classified as involved.</p>
          <p>Race/ethnicity categories were changed from prior versions of the dashboard to remove non-Hispanic Native Hawaiian and Other Pacific Islander from the non-Hispanic Asian or Pacific Islander category into their own category.</p>
          <p>Rates based on &lt;20 drug overdose deaths are suppressed to avoid presentation of unstable rates{accessible ? '' : ' and denoted by an *'}.</p>
        </>
      )}
    </div>
  );
}

export default Footer;