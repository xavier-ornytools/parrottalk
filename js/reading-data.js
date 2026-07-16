// js/reading-data.js
// Donnees des tests Reading, modele data-driven (LOT 2). Genere par extraction
// fidele du DOM d'origine (tests/reading-build-data.js), prose des passages
// conservee a l'identique. Convention data.js : globals classiques, pas d'export.
// Le champ `ref` (renvoi au paragraphe) et `explanation` (vide) alimentent le
// feedback minimal sur erreurs, enrichissable plus tard.

const READING_TEST01 = {
  "id": "rdtest01",
  "title": "Reading Test 01",
  "passages": [
    {
      "number": 1,
      "tabLabel": "Passage 1",
      "resultLabel": "Passage 1 (Sleep)",
      "label": "Passage 1, Questions 1-13",
      "heading": "The Psychology of Sleep",
      "bodyHTML": "\n        <div class=\"passage-label\">Passage 1, Questions 1-13</div>\n        <h3>The Psychology of Sleep</h3>\n        <p>Sleep is one of the most fundamental biological processes, yet it remains poorly understood by the general public. Researchers now know that sleep is far from a passive state, it is a period of intense neurological activity during which the brain consolidates memories, processes emotions, and clears metabolic waste products.</p>\n        <p>Adults typically require between seven and nine hours of sleep per night, though this varies with age, lifestyle, and individual biology. Chronic sleep deprivation, consistently getting less than the recommended amount, has been linked to a range of serious health consequences, including weakened immune function, increased risk of cardiovascular disease, impaired glucose metabolism, and greater susceptibility to mental health disorders such as depression and anxiety.</p>\n        <p>Sleep is divided into distinct stages, including light sleep, deep sleep, and Rapid Eye Movement (REM) sleep. Each stage plays a specific role: deep sleep is critical for physical restoration, cell repair, and the strengthening of the immune system, while REM sleep, which occurs multiple times during the night, is associated with dreaming and emotional regulation. Interrupting these cycles, as often occurs with shift work or travel across time zones, can have profound effects on both physical and psychological wellbeing.</p>\n        <p>One increasingly recognised factor affecting sleep quality is the exposure to blue light emitted by smartphones, tablets, and computer screens. Blue light suppresses the production of melatonin, the hormone responsible for signalling to the body that it is time to sleep. Many sleep scientists recommend avoiding screens for at least one hour before bedtime as a simple but effective strategy to improve sleep onset.</p>\n        <p>Research also suggests that brief daytime naps, typically between 10 and 20 minutes, can restore alertness and improve performance without significantly affecting nighttime sleep in most adults. Longer naps, however, can lead to sleep inertia, a temporary feeling of grogginess that may actually reduce performance in the short term.</p>\n        <p>The concept of 'sleep debt' describes the cumulative deficit that builds when a person consistently sleeps less than their body requires. While many people believe they can 'catch up' on missed sleep during weekends, research indicates that this strategy only partially restores cognitive function and does not reverse all the physiological effects of sleep loss.</p>\n        <p>Regular physical activity has consistently been shown to improve sleep quality, reducing the time it takes to fall asleep and increasing the proportion of deep sleep experienced. However, vigorous exercise performed too close to bedtime may have the opposite effect in some individuals, as it temporarily elevates heart rate and core body temperature.</p>\n      ",
      "groups": [
        {
          "type": "tfng",
          "title": "Questions 1-7, True / False / Not Given",
          "instructions": "Do the following statements agree with the information given in the passage? Write TRUE, FALSE or NOT GIVEN.",
          "questions": [
            {
              "n": 1,
              "text": "Sleep is now understood to involve significant brain activity.",
              "answer": "TRUE",
              "ref": "Paragraph 1: 'a period of intense neurological activity during which the brain'",
              "explanation": ""
            },
            {
              "n": 2,
              "text": "Adults require exactly eight hours of sleep per night.",
              "answer": "FALSE",
              "ref": "Paragraph 2: 'between seven and nine hours of sleep per night'",
              "explanation": ""
            },
            {
              "n": 3,
              "text": "REM sleep occurs only once during a typical night's sleep.",
              "answer": "FALSE",
              "ref": "Paragraph 3: 'REM sleep, which occurs multiple times during the night'",
              "explanation": ""
            },
            {
              "n": 4,
              "text": "Sleep deprivation has been linked to increased risk of cardiovascular disease.",
              "answer": "TRUE",
              "ref": "Paragraph 2: 'increased risk of cardiovascular disease'",
              "explanation": ""
            },
            {
              "n": 5,
              "text": "Scientists have reached agreement on the exact biological purpose of dreaming.",
              "answer": "NOT GIVEN",
              "ref": "Not stated in the passage",
              "explanation": ""
            },
            {
              "n": 6,
              "text": "Exposure to screen light before bedtime can delay the body's production of melatonin.",
              "answer": "TRUE",
              "ref": "Paragraph 4: 'Blue light suppresses the production of melatonin'",
              "explanation": ""
            },
            {
              "n": 7,
              "text": "All individuals who take long naps will experience reduced performance afterwards.",
              "answer": "NOT GIVEN",
              "ref": "Not stated in the passage",
              "explanation": ""
            }
          ]
        },
        {
          "type": "mc",
          "title": "Questions 8-13, Multiple Choice",
          "instructions": "Choose the correct letter, A, B, C or D.",
          "questions": [
            {
              "n": 8,
              "text": "According to the passage, what is the primary function of deep sleep?",
              "options": [
                "Processing emotional experiences",
                "Physical restoration and immune strengthening",
                "Consolidating short-term memories",
                "Generating vivid dreams"
              ],
              "answer": "B",
              "ref": "Paragraph 3: 'deep sleep is critical for physical restoration, cell repair'",
              "explanation": ""
            },
            {
              "n": 9,
              "text": "The term 'sleep debt' is used to describe:",
              "options": [
                "The extra sleep needed after illness",
                "The cumulative effect of regularly sleeping too little",
                "The difference between weekday and weekend sleep patterns",
                "A clinically recognised sleep disorder"
              ],
              "answer": "B",
              "ref": "Paragraph 6: 'the cumulative deficit that builds when a person consistently sleeps'",
              "explanation": ""
            },
            {
              "n": 10,
              "text": "What does the passage say about catching up on sleep at weekends?",
              "options": [
                "It fully restores all lost sleep",
                "It has no benefit whatsoever",
                "It can only partially restore cognitive function",
                "It is the most effective way to manage sleep loss"
              ],
              "answer": "C",
              "ref": "Paragraph 6: 'this strategy only partially restores cognitive function'",
              "explanation": ""
            },
            {
              "n": 11,
              "text": "Which of the following is described as a simple strategy to improve sleep onset?",
              "options": [
                "Taking longer naps during the day",
                "Avoiding screens before bedtime",
                "Avoiding all forms of exercise",
                "Sleeping at irregular hours"
              ],
              "answer": "B",
              "ref": "Paragraph 4: 'avoiding screens for at least one hour before bedtime'",
              "explanation": ""
            },
            {
              "n": 12,
              "text": "What is 'sleep inertia', as described in the passage?",
              "options": [
                "The inability to fall asleep",
                "A chronic condition caused by shift work",
                "A temporary feeling of grogginess after a long nap",
                "Resistance to changes in the sleep schedule"
              ],
              "answer": "C",
              "ref": "Paragraph 5: 'sleep inertia, a temporary feeling of grogginess'",
              "explanation": ""
            },
            {
              "n": 13,
              "text": "What does the passage suggest about exercise and sleep quality?",
              "options": [
                "All exercise improves sleep equally",
                "Regular activity generally improves sleep, but timing matters",
                "Exercise should be avoided by people with sleep problems",
                "Vigorous exercise always reduces sleep quality"
              ],
              "answer": "B",
              "ref": "Paragraph 7: 'vigorous exercise performed too close to bedtime may have the opposite effect'",
              "explanation": ""
            }
          ]
        }
      ]
    },
    {
      "number": 2,
      "tabLabel": "Passage 2",
      "resultLabel": "Passage 2 (Urban Farming)",
      "label": "Passage 2, Questions 14-26",
      "heading": "The Rise of Urban Farming",
      "bodyHTML": "\n        <div class=\"passage-label\">Passage 2, Questions 14-26</div>\n        <h3>The Rise of Urban Farming</h3>\n        <p><strong>A.</strong> Urban farming, the practice of cultivating food within or around cities, is experiencing a remarkable renaissance worldwide. Once dismissed as a fringe pursuit, it is now recognised as a viable strategy for addressing food security, reducing carbon footprints, and strengthening community bonds in increasingly dense metropolitan areas.</p>\n        <p><strong>B.</strong> The concept is not new. Wartime 'victory gardens' encouraged urban residents in Britain and the United States to grow their own vegetables during the 1940s, dramatically increasing domestic food production at a time when supply chains were disrupted. However, the modern urban farming movement differs in both scale and sophistication, encompassing everything from small rooftop gardens to large commercial vertical farms occupying multiple floors of repurposed industrial buildings.</p>\n        <p><strong>C.</strong> Vertical farming, one of the most technologically advanced forms of urban agriculture, involves growing crops in stacked layers under carefully controlled conditions. LED lighting systems are calibrated to provide plants with the precise spectrum of light they require, while nutrient solutions replace soil entirely. These controlled environments eliminate the need for pesticides, significantly reduce water consumption, sometimes by up to 95% compared to conventional farming, and allow year-round production regardless of weather conditions.</p>\n        <p><strong>D.</strong> Critics, however, raise valid concerns. The energy demands of vertical farms are substantial, particularly for lighting, and unless powered by renewable sources, the carbon footprint of such operations may exceed that of conventional agriculture. The high cost of establishing vertical farms also means that the produce they generate often commands premium prices, limiting accessibility for lower-income communities, the very populations that urban food initiatives are frequently intended to help.</p>\n        <p><strong>E.</strong> Community gardens represent a contrasting approach. Located in parks, school grounds, and vacant lots, they prioritise social inclusion and collective participation over commercial efficiency. Research has documented numerous psychological benefits associated with community gardening, including reduced stress, improved mood, and a greater sense of social connection among participants.</p>\n        <p><strong>F.</strong> The integration of urban farming into city planning is gaining momentum. Singapore, often cited as a model for urban agricultural policy, has mandated that new residential and commercial developments include green spaces dedicated to food production. Several European cities are following suit, with Amsterdam and Copenhagen incorporating urban farms into their sustainability strategies.</p>\n      ",
      "groups": [
        {
          "type": "matching",
          "title": "Questions 14-19, Matching Headings",
          "instructions": "Match each paragraph (A-F) with the correct heading from the list below. Choose from: A. A solution with limitations &nbsp;·&nbsp; B. Historical context and modern differences &nbsp;·&nbsp; C. Psychological and social advantages &nbsp;·&nbsp; D. Learning from international examples &nbsp;·&nbsp; E. The technological approach &nbsp;·&nbsp; F. A growing global trend &nbsp;·&nbsp; G. The environmental cost &nbsp;·&nbsp; H. Community-based alternatives",
          "options": [
            "A solution with limitations",
            "Historical context and modern differences",
            "Psychological and social advantages",
            "Learning from international examples",
            "The technological approach",
            "A growing global trend",
            "The environmental cost",
            "Community-based alternatives"
          ],
          "questions": [
            {
              "n": 14,
              "text": "Paragraph A",
              "answer": "F",
              "ref": "Paragraph A: 'experiencing a remarkable renaissance worldwide'",
              "explanation": ""
            },
            {
              "n": 15,
              "text": "Paragraph B",
              "answer": "B",
              "ref": "Paragraph B: 'the modern urban farming movement differs in both scale and'",
              "explanation": ""
            },
            {
              "n": 16,
              "text": "Paragraph C",
              "answer": "E",
              "ref": "Paragraph C: 'one of the most technologically advanced forms of urban agriculture'",
              "explanation": ""
            },
            {
              "n": 17,
              "text": "Paragraph D",
              "answer": "A",
              "ref": "Paragraph D: 'limiting accessibility for lower-income communities'",
              "explanation": ""
            },
            {
              "n": 18,
              "text": "Paragraph E",
              "answer": "C",
              "ref": "Paragraph E: 'numerous psychological benefits associated with community gardening'",
              "explanation": ""
            },
            {
              "n": 19,
              "text": "Paragraph F",
              "answer": "D",
              "ref": "Paragraph F: 'Singapore, often cited as a model for urban agricultural policy'",
              "explanation": ""
            }
          ]
        },
        {
          "type": "mc",
          "title": "Questions 20-26, Multiple Choice",
          "instructions": "Choose the correct letter, A, B, C or D.",
          "questions": [
            {
              "n": 20,
              "text": "What is described as a key difference between wartime urban gardening and modern urban farming?",
              "options": [
                "Modern farms are located exclusively on rooftops",
                "The scale and level of technological sophistication",
                "Modern farms are all operated by communities",
                "Wartime gardens were larger in scale"
              ],
              "answer": "B",
              "ref": "Paragraph B: 'differs in both scale and sophistication'",
              "explanation": ""
            },
            {
              "n": 21,
              "text": "According to the passage, vertical farms can reduce water usage by:",
              "options": [
                "Up to 50% compared to conventional farming",
                "Up to 75% compared to conventional farming",
                "Up to 95% compared to conventional farming",
                "100% compared to conventional farming"
              ],
              "answer": "C",
              "ref": "Paragraph C: 'reduce water consumption, sometimes by up to 95%'",
              "explanation": ""
            },
            {
              "n": 22,
              "text": "What concern do critics raise about vertical farms?",
              "options": [
                "They cannot produce enough food to be viable",
                "Their high energy demands may generate significant carbon emissions",
                "They require too much space in urban areas",
                "Their produce is unsafe for consumption"
              ],
              "answer": "B",
              "ref": "Paragraph D: 'the carbon footprint of such operations may exceed that'",
              "explanation": ""
            },
            {
              "n": 23,
              "text": "What distinguishes community gardens from vertical farms, according to the passage?",
              "options": [
                "Community gardens use more advanced technology",
                "Community gardens generate higher revenues",
                "Community gardens prioritise inclusion over commercial efficiency",
                "Community gardens are more common in Asian cities"
              ],
              "answer": "C",
              "ref": "Paragraph E: 'they prioritise social inclusion and collective participation over commercial efficiency'",
              "explanation": ""
            },
            {
              "n": 24,
              "text": "Which of the following is mentioned as a psychological benefit of community gardening?",
              "options": [
                "Improved physical fitness",
                "Reduced stress",
                "Better financial outcomes",
                "Stronger political participation"
              ],
              "answer": "B",
              "ref": "Paragraph E: 'including reduced stress, improved mood'",
              "explanation": ""
            },
            {
              "n": 25,
              "text": "What has Singapore done regarding urban farming?",
              "options": [
                "Banned vertical farming within city limits",
                "Required new buildings to include food-growing spaces",
                "Subsidised community gardens in all districts",
                "Established the world's largest vertical farm"
              ],
              "answer": "B",
              "ref": "Paragraph F: 'new residential and commercial developments include green spaces dedicated to'",
              "explanation": ""
            },
            {
              "n": 26,
              "text": "What does the passage suggest about the future of urban farming in cities?",
              "options": [
                "It will remain a niche activity",
                "It is being integrated into mainstream city planning",
                "It will replace conventional agriculture entirely",
                "Its growth is limited to Asian cities"
              ],
              "answer": "B",
              "ref": "Paragraph F: 'The integration of urban farming into city planning is gaining'",
              "explanation": ""
            }
          ]
        }
      ]
    },
    {
      "number": 3,
      "tabLabel": "Passage 3",
      "resultLabel": "Passage 3 (Printing Press)",
      "label": "Passage 3, Questions 27-40",
      "heading": "The History of the Printing Press",
      "bodyHTML": "\n        <div class=\"passage-label\">Passage 3, Questions 27-40</div>\n        <h3>The History of the Printing Press</h3>\n        <p>The development of the printing press is widely regarded as one of the most transformative inventions in human history. Before its emergence in Europe in the mid-fifteenth century, the production of books was an extraordinarily labour-intensive process. Manuscripts were copied by hand, primarily by monks in monastic scriptoria, and a single volume could take months or even years to complete. As a result, books were rare, expensive, and accessible only to the wealthy and the clergy.</p>\n        <p>Johannes Gutenberg, a goldsmith from Mainz in present-day Germany, is credited with developing the first movable-type printing press in Europe around 1440. His system used individual metal letters, known as type, which could be arranged to form words, inked, and pressed against paper or vellum to create printed pages. Crucially, these letters could be rearranged and reused, making the mass production of identical texts possible for the first time.</p>\n        <p>The impact of Gutenberg's invention was immediate and far-reaching. Within decades, printing presses had spread across Europe, and by 1500, it is estimated that more than twenty million books had been produced, a number that would have been inconceivable in the era of manuscript reproduction. The cost of books fell dramatically, making them accessible to a growing literate population.</p>\n        <p>The printing press played a central role in the Protestant Reformation, which began in 1517 when Martin Luther published his Ninety-Five Theses challenging the authority of the Catholic Church. Luther's ideas spread rapidly because they could be printed and distributed in large quantities, reaching audiences far beyond what manuscript circulation could have achieved. Some historians argue that without the printing press, the Reformation might never have gained the momentum it did.</p>\n        <p>The influence of print extended to science as well. Nicolaus Copernicus published his revolutionary theory that the Earth revolves around the Sun in 1543, and the printed book allowed this idea to circulate among scholars across Europe within a relatively short time. Similarly, the publication of Isaac Newton's Principia Mathematica in 1687 established the laws of classical mechanics in a form accessible to educated readers throughout the Western world.</p>\n        <p>Despite its revolutionary impact, the printing press also enabled the spread of misinformation. Pamphlets containing fabricated stories, sensational claims, and political propaganda could be produced cheaply and distributed widely, long before any mechanism existed for verifying their content. This tension between the democratisation of information and the proliferation of false ideas is one that societies continue to navigate in the digital age.</p>\n        <div class=\"passage-glossary\">\n          <div class=\"glossary-title\">Glossary</div>\n          <p><strong>vellum</strong>: a fine writing material made from prepared animal skin</p>\n        </div>\n      ",
      "groups": [
        {
          "type": "summary",
          "title": "Questions 27-33, Complete the Summary",
          "instructions": "Complete the summary using words from the passage. Write ONE WORD ONLY for each answer.",
          "pStyle": "font-size:.9375rem;line-height:1.9;margin-bottom:16px",
          "template": "Before Gutenberg's invention, books were produced by {{27}} in monastic environments, a process so slow that a single volume might take {{28}} or even years to complete. Gutenberg's press used individual metal {{29}} that could be rearranged and reused. By the year {{30}}, over twenty million books had been printed. The press helped spread Martin Luther's {{31}} rapidly across Europe. The astronomer {{32}} used the printed medium to share his revolutionary theory. However, print also enabled the spread of {{33}}, a problem that continues in the digital age.",
          "widths": {
            "27": "120px",
            "28": "120px",
            "29": "120px",
            "30": "100px",
            "31": "100px",
            "32": "140px",
            "33": "160px"
          },
          "questions": [
            {
              "n": 27,
              "answer": "MONKS",
              "ref": "Paragraph 1: 'copied by hand, primarily by monks in monastic scriptoria'",
              "explanation": ""
            },
            {
              "n": 28,
              "answer": "MONTHS",
              "ref": "Paragraph 1: 'a single volume could take months or even years'",
              "explanation": ""
            },
            {
              "n": 29,
              "answer": "LETTERS",
              "ref": "Paragraph 2: 'His system used individual metal letters, known as type'",
              "explanation": ""
            },
            {
              "n": 30,
              "answer": "1500",
              "ref": "Paragraph 3: 'by 1500, it is estimated that more than twenty million'",
              "explanation": ""
            },
            {
              "n": 31,
              "answer": "IDEAS",
              "ref": "Paragraph 4: 'Luther's ideas spread rapidly because they could be printed'",
              "explanation": ""
            },
            {
              "n": 32,
              "answer": "COPERNICUS",
              "ref": "Paragraph 5: 'Nicolaus Copernicus published his revolutionary theory'",
              "explanation": ""
            },
            {
              "n": 33,
              "answer": "MISINFORMATION",
              "ref": "Paragraph 6: 'the printing press also enabled the spread of misinformation'",
              "explanation": ""
            }
          ]
        },
        {
          "type": "mc",
          "title": "Questions 34-40, Multiple Choice",
          "instructions": "Choose the correct letter, A, B, C or D.",
          "questions": [
            {
              "n": 34,
              "text": "Where was Johannes Gutenberg originally from?",
              "options": [
                "Amsterdam",
                "Frankfurt",
                "Mainz",
                "Berlin"
              ],
              "answer": "C",
              "ref": "Paragraph 2: 'a goldsmith from Mainz in present-day Germany'",
              "explanation": ""
            },
            {
              "n": 35,
              "text": "What was significant about Gutenberg's movable type?",
              "options": [
                "It could print in multiple colours simultaneously",
                "Individual pieces could be rearranged and reused for different texts",
                "It could reproduce images as well as text",
                "It required no ink to function"
              ],
              "answer": "B",
              "ref": "Paragraph 2: 'these letters could be rearranged and reused'",
              "explanation": ""
            },
            {
              "n": 36,
              "text": "Approximately how many books had been produced in Europe by 1500?",
              "options": [
                "Two million",
                "Ten million",
                "Twenty million",
                "Fifty million"
              ],
              "answer": "C",
              "ref": "Paragraph 3: 'more than twenty million books had been produced'",
              "explanation": ""
            },
            {
              "n": 37,
              "text": "How did the printing press assist Martin Luther's Reformation?",
              "options": [
                "It allowed him to communicate directly with the Pope",
                "It enabled his ideas to reach large audiences quickly",
                "It allowed him to write more books personally",
                "It helped him establish a new church"
              ],
              "answer": "B",
              "ref": "Paragraph 4: 'distributed in large quantities, reaching audiences far beyond'",
              "explanation": ""
            },
            {
              "n": 38,
              "text": "Which of the following is described as a negative consequence of the printing press?",
              "options": [
                "Books became too expensive for ordinary people",
                "Scientific progress was slowed",
                "False information could spread widely and cheaply",
                "Religious diversity was suppressed"
              ],
              "answer": "C",
              "ref": "Paragraph 6: 'produced cheaply and distributed widely'",
              "explanation": ""
            },
            {
              "n": 39,
              "text": "What does the passage suggest the modern digital age has in common with the early printing era?",
              "options": [
                "Both periods saw rapid improvements in literacy",
                "Both involved the same types of published content",
                "Both periods faced challenges with the spread of false information",
                "Both were dominated by religious publishing"
              ],
              "answer": "C",
              "ref": "Paragraph 6: 'the proliferation of false ideas is one that societies continue'",
              "explanation": ""
            },
            {
              "n": 40,
              "text": "The passage's main purpose is to:",
              "options": [
                "Argue that the printing press was harmful to society",
                "Compare European and Asian printing traditions",
                "Describe the historical development and impact of the printing press",
                "Promote investment in historical printing technology"
              ],
              "answer": "C",
              "ref": "Paragraph 1: 'one of the most transformative inventions in human history'",
              "explanation": ""
            }
          ]
        }
      ]
    }
  ]
};

const READING_TEST02 = {
  "id": "rdtest02",
  "title": "Reading Test 02",
  "passages": [
    {
      "number": 1,
      "tabLabel": "Passage 1",
      "resultLabel": "Passage 1 (Renewable Energy)",
      "label": "Passage 1, Questions 1-13",
      "heading": "The Evolution of Renewable Energy",
      "bodyHTML": "\n        <div class=\"passage-label\">Passage 1, Questions 1-13</div>\n        <h3>The Evolution of Renewable Energy</h3>\n        <p>The transition from fossil fuels to renewable energy sources is widely regarded as one of the most significant challenges facing human civilisation in the 21st century. Wind and solar power, once considered marginal technologies confined to experimental projects, have undergone dramatic cost reductions over the past two decades. The price of solar photovoltaic panels, for example, fell by more than 89% between 2010 and 2020, making solar energy cost-competitive with coal in many regions of the world.</p>\n        <p>Wind energy has followed a similar trajectory. Offshore wind farms, which generate electricity by harnessing winds at sea where they are stronger and more consistent than on land, have become a major component of national energy strategies, particularly in northern Europe. Countries such as Denmark, which generates more than 50% of its electricity from wind, have demonstrated that high levels of renewable penetration are operationally feasible.</p>\n        <p>One of the primary challenges associated with renewable energy is its intermittency, the fact that solar panels generate no electricity at night and wind turbines produce nothing when the air is still. Energy storage, particularly in the form of large-scale battery systems, is seen as a critical solution to this problem. Lithium-ion batteries, the same technology used in electric vehicles, have emerged as the dominant form of grid-scale storage, though alternatives including pumped hydro, compressed air, and hydrogen are also under active development.</p>\n        <p>The electrification of transport represents one of the most promising opportunities for integrating renewable energy into daily life. Electric vehicles charged with renewable electricity can significantly reduce the carbon emissions associated with personal transportation. Several major economies, including the United Kingdom, France and Norway, have announced targets to phase out new petrol and diesel vehicles entirely by 2035 or sooner.</p>\n        <p>Despite these developments, critics of rapid renewable expansion point to several concerns. The manufacture of solar panels and wind turbines requires significant quantities of raw materials, including silicon, copper, lithium, cobalt and rare earth elements. Mining these materials can cause environmental damage if not carefully managed. Additionally, the decommissioning of wind turbines, particularly the fibreglass composite blades, presents a growing waste management challenge.</p>\n        <p>Nevertheless, the scientific consensus is clear that the transition to renewable energy, while imperfect, is essential for limiting global temperature rise to 1.5°C above pre-industrial levels, as outlined in the Paris Agreement. The speed and scale of this transition will determine whether humanity can avoid the most severe consequences of climate change.</p>\n        <div class=\"passage-glossary\">\n          <div class=\"glossary-title\">Glossary</div>\n          <p><strong>photovoltaic</strong>: relating to the direct conversion of light into electricity</p>\n          <p><strong>decommissioning</strong>: permanently taking a piece of equipment or infrastructure out of service</p>\n        </div>\n      ",
      "groups": [
        {
          "type": "tfng",
          "title": "Questions 1-7, True / False / Not Given",
          "instructions": "Do the following statements agree with the information given in the passage? Write TRUE, FALSE or NOT GIVEN.",
          "questions": [
            {
              "n": 1,
              "text": "Solar photovoltaic panels became more than 89% cheaper between 2010 and 2020.",
              "answer": "TRUE",
              "ref": "Paragraph 1: 'fell by more than 89% between 2010 and 2020'",
              "explanation": ""
            },
            {
              "n": 2,
              "text": "Wind energy is currently the world's fastest-growing source of electricity.",
              "answer": "NOT GIVEN",
              "ref": "Not stated in the passage",
              "explanation": ""
            },
            {
              "n": 3,
              "text": "Renewable energy sources are unable to generate electricity continuously.",
              "answer": "TRUE",
              "ref": "Paragraph 3: 'solar panels generate no electricity at night'",
              "explanation": ""
            },
            {
              "n": 4,
              "text": "Lithium-ion battery technology was developed specifically for grid-scale energy storage.",
              "answer": "FALSE",
              "ref": "Paragraph 3: 'the same technology used in electric vehicles'",
              "explanation": ""
            },
            {
              "n": 5,
              "text": "Norway has announced that it will ban new diesel vehicle sales by 2030.",
              "answer": "NOT GIVEN",
              "ref": "Not stated in the passage",
              "explanation": ""
            },
            {
              "n": 6,
              "text": "The Paris Agreement sets a target of limiting warming to 1.5°C above pre-industrial levels.",
              "answer": "TRUE",
              "ref": "Paragraph 6: 'temperature rise to 1.5°C above pre-industrial levels'",
              "explanation": ""
            },
            {
              "n": 7,
              "text": "Critics argue that the environmental costs of renewable energy manufacture outweigh its benefits.",
              "answer": "NOT GIVEN",
              "ref": "Not stated in the passage",
              "explanation": ""
            }
          ]
        },
        {
          "type": "mc",
          "title": "Questions 8-13, Multiple Choice",
          "instructions": "Choose the correct letter A, B, C or D.",
          "questions": [
            {
              "n": 8,
              "text": "According to the passage, what is described as the primary challenge of renewable energy?",
              "options": [
                "High manufacturing costs",
                "Intermittency of supply",
                "Lack of consumer demand",
                "Insufficient government support"
              ],
              "answer": "B",
              "ref": "Paragraph 3: 'primary challenges associated with renewable energy is its intermittency'",
              "explanation": ""
            },
            {
              "n": 9,
              "text": "Which country is mentioned as an example of successful large-scale wind energy integration?",
              "options": [
                "Germany",
                "France",
                "Denmark",
                "Norway"
              ],
              "answer": "C",
              "ref": "Paragraph 2: 'Countries such as Denmark, which generates more than 50%'",
              "explanation": ""
            },
            {
              "n": 10,
              "text": "What does the passage suggest about large-scale battery storage?",
              "options": [
                "It is the only viable solution to energy intermittency",
                "It has replaced pumped hydro in most countries",
                "It is dominated by lithium-ion technology",
                "It is still in the experimental phase"
              ],
              "answer": "C",
              "ref": "Paragraph 3: 'have emerged as the dominant form of grid-scale storage'",
              "explanation": ""
            },
            {
              "n": 11,
              "text": "Which of the following is a concern raised by critics of rapid renewable expansion?",
              "options": [
                "The instability of renewable energy prices",
                "The environmental impact of raw material extraction",
                "The lack of qualified engineers in the sector",
                "Excessive land use of solar farms"
              ],
              "answer": "B",
              "ref": "Paragraph 5: 'Mining these materials can cause environmental damage'",
              "explanation": ""
            },
            {
              "n": 12,
              "text": "What does the passage say about decommissioning wind turbines?",
              "options": [
                "It produces large quantities of recyclable metal",
                "It is regulated by international agreements",
                "The composite blades present a growing disposal challenge",
                "It is currently more expensive than construction"
              ],
              "answer": "C",
              "ref": "Paragraph 5: 'the fibreglass composite blades, presents a growing waste management challenge'",
              "explanation": ""
            },
            {
              "n": 13,
              "text": "What is the passage's overall position on the transition to renewable energy?",
              "options": [
                "It is scientifically unnecessary given current temperature levels",
                "It is essential despite its imperfections",
                "It should be slowed to allow further technological development",
                "It is economically unviable without government subsidies"
              ],
              "answer": "B",
              "ref": "Paragraph 6: 'while imperfect, is essential for limiting global temperature rise'",
              "explanation": ""
            }
          ]
        }
      ]
    },
    {
      "number": 2,
      "tabLabel": "Passage 2",
      "resultLabel": "Passage 2 (Water Scarcity)",
      "label": "Passage 2, Questions 14-26",
      "heading": "Urbanisation and Water Scarcity",
      "bodyHTML": "\n        <div class=\"passage-label\">Passage 2, Questions 14-26</div>\n        <h3>Urbanisation and Water Scarcity</h3>\n        <p>Urbanisation, the movement of populations from rural areas to cities, is one of the defining demographic trends of the 21st century. According to the United Nations, more than 55% of the world's population currently lives in urban areas, a figure projected to rise to 68% by 2050. As cities expand rapidly, particularly in developing nations across Sub-Saharan Africa and South and Southeast Asia, the strain on municipal water supplies has become increasingly critical.</p>\n        <p>Water scarcity, defined as an insufficient supply of clean water relative to demand, affects more than 2 billion people globally. In many rapidly growing cities, ageing infrastructure, population growth, and the effects of climate change are converging to create what experts describe as a \"perfect storm\" for water security. Cities such as Cape Town in South Africa, Chennai in India, and Lima in Peru have all experienced severe water crises in recent years, forcing emergency rationing measures and prompting long-term investments in water management.</p>\n        <p>The agricultural sector remains by far the largest consumer of freshwater globally, accounting for approximately 70% of all water withdrawals. Urban growth compounds this challenge in two ways: as cities expand onto fertile agricultural land, farmland is lost, requiring the remaining land to be irrigated more intensively. Simultaneously, rising urban populations demand greater quantities of food, increasing the agricultural water footprint.</p>\n        <p>Groundwater, water stored in underground aquifers, is an increasingly critical source of freshwater for urban populations worldwide. However, groundwater is being extracted faster than it can be replenished by rainfall in many regions, a process known as aquifer depletion. Once depleted, some aquifers may take thousands of years to recover, making groundwater loss effectively irreversible in human timescales.</p>\n        <p>Several innovative approaches are being explored to address urban water scarcity. Rainwater harvesting systems collect and store precipitation for later use in irrigation or toilet flushing, reducing demand on municipal supplies. Wastewater recycling, treating sewage and industrial effluent to a standard suitable for reuse, is gaining acceptance in water-stressed regions. Singapore, which has almost no natural freshwater sources, has developed a world-leading water recycling programme that now supplies approximately 40% of the city-state's water needs.</p>\n        <p>Desalination, the process of removing salt from seawater to produce fresh water, offers another potential solution, though it is energy-intensive and has historically been costly. Advances in membrane technology have reduced desalination costs significantly in recent years, making it more viable as a component of diversified water supply strategies.</p>\n        <div class=\"passage-glossary\">\n          <div class=\"glossary-title\">Glossary</div>\n          <p><strong>aquifer</strong>: an underground layer of rock or sediment that holds and transmits groundwater</p>\n        </div>\n      ",
      "groups": [
        {
          "type": "sentence",
          "title": "Questions 14-20, Sentence Completion",
          "instructions": "Complete the sentences below. Use NO MORE THAN TWO WORDS from the passage for each answer.",
          "questions": [
            {
              "n": 14,
              "sentence": "More than 55% of the global population currently lives in <strong>______</strong> areas.",
              "spanStyle": "font-size:.9rem",
              "answer": "URBAN",
              "ref": "Paragraph 1: 'population currently lives in urban areas'",
              "explanation": ""
            },
            {
              "n": 15,
              "sentence": "The agricultural sector accounts for approximately 70% of all freshwater <strong>______</strong>.",
              "spanStyle": "font-size:.9rem",
              "answer": "WITHDRAWALS",
              "ref": "Paragraph 3: 'approximately 70% of all water withdrawals'",
              "explanation": ""
            },
            {
              "n": 16,
              "sentence": "Urban expansion onto farmland requires the remaining agricultural land to be <strong>______</strong> more intensively.",
              "spanStyle": "font-size:.9rem",
              "answer": "IRRIGATED",
              "ref": "Paragraph 3: 'the remaining land to be irrigated more intensively'",
              "explanation": ""
            },
            {
              "n": 17,
              "sentence": "Aquifer depletion occurs when groundwater is extracted faster than it can be replenished, potentially leaving underground <strong>______</strong> permanently depleted.",
              "spanStyle": "font-size:.9rem",
              "answer": "AQUIFERS",
              "ref": "Paragraph 4: 'some aquifers may take thousands of years to recover'",
              "explanation": ""
            },
            {
              "n": 18,
              "sentence": "Rainwater <strong>______</strong> systems reduce demand on municipal water supplies by collecting precipitation for later use.",
              "spanStyle": "font-size:.9rem",
              "answer": "HARVESTING",
              "ref": "Paragraph 5: 'Rainwater harvesting systems collect and store precipitation'",
              "explanation": ""
            },
            {
              "n": 19,
              "sentence": "Singapore's water recycling programme now meets approximately 40% of the city-state's water <strong>______</strong>.",
              "spanStyle": "font-size:.9rem",
              "answer": "NEEDS",
              "ref": "Paragraph 5: 'approximately 40% of the city-state's water needs'",
              "explanation": ""
            },
            {
              "n": 20,
              "sentence": "The process of removing salt from seawater to produce fresh water is known as <strong>______</strong>.",
              "spanStyle": "font-size:.9rem",
              "answer": "DESALINATION",
              "ref": "Paragraph 6: 'Desalination, the process of removing salt from seawater'",
              "explanation": ""
            }
          ]
        },
        {
          "type": "mc",
          "title": "Questions 21-26, Multiple Choice",
          "instructions": "Choose the correct letter A, B, C or D.",
          "questions": [
            {
              "n": 21,
              "text": "What percentage of the world's population is projected to live in urban areas by 2050?",
              "options": [
                "55%",
                "60%",
                "68%",
                "75%"
              ],
              "answer": "C",
              "ref": "Paragraph 1: 'projected to rise to 68% by 2050'",
              "explanation": ""
            },
            {
              "n": 22,
              "text": "What does the passage identify as contributing to urban water crises?",
              "options": [
                "Declining investment in water infrastructure alone",
                "A convergence of ageing infrastructure, population growth and climate change",
                "Mismanagement by municipal authorities",
                "Excessive water use by industrial companies"
              ],
              "answer": "B",
              "ref": "Paragraph 2: 'ageing infrastructure, population growth, and the effects of climate change'",
              "explanation": ""
            },
            {
              "n": 23,
              "text": "According to the passage, what happens when cities expand onto agricultural land?",
              "options": [
                "Crop yields immediately decline",
                "New farmland is created elsewhere",
                "Remaining farmland requires more intensive irrigation",
                "Water demand for agriculture falls"
              ],
              "answer": "C",
              "ref": "Paragraph 3: 'requiring the remaining land to be irrigated more intensively'",
              "explanation": ""
            },
            {
              "n": 24,
              "text": "What does the passage say about aquifer depletion?",
              "options": [
                "It can be quickly reversed through conservation measures",
                "It primarily affects developing countries",
                "Some aquifers may take thousands of years to recover",
                "It is less serious than surface water depletion"
              ],
              "answer": "C",
              "ref": "Paragraph 4: 'some aquifers may take thousands of years to recover'",
              "explanation": ""
            },
            {
              "n": 25,
              "text": "What is described as one reason desalination has not been widely adopted historically?",
              "options": [
                "It produces water of insufficient quality",
                "It requires specialist technical knowledge",
                "It is harmful to marine ecosystems",
                "It is energy-intensive and costly"
              ],
              "answer": "D",
              "ref": "Paragraph 6: 'it is energy-intensive and has historically been costly'",
              "explanation": ""
            },
            {
              "n": 26,
              "text": "Singapore is presented in the passage as an example of:",
              "options": [
                "A country that relies entirely on imported water",
                "A city that has implemented successful water recycling at scale",
                "A nation that has banned the use of groundwater",
                "A pioneer in rainwater harvesting technology"
              ],
              "answer": "B",
              "ref": "Paragraph 5: 'has developed a world-leading water recycling programme'",
              "explanation": ""
            }
          ]
        }
      ]
    },
    {
      "number": 3,
      "tabLabel": "Passage 3",
      "resultLabel": "Passage 3 (Memory)",
      "label": "Passage 3, Questions 27-40",
      "heading": "The Science of Memory Consolidation",
      "bodyHTML": "\n        <div class=\"passage-label\">Passage 3, Questions 27-40</div>\n        <h3>The Science of Memory Consolidation</h3>\n        <p>Memory is one of the most fundamental cognitive capacities, enabling humans to learn from experience, plan for the future, and construct a sense of personal identity. Yet the processes by which memories are formed, stored, and retrieved remain the subject of intensive scientific investigation. The past three decades have produced remarkable insights into the neuroscience of memory, driven in large part by advances in brain imaging technologies and molecular biology.</p>\n        <p>Memory consolidation refers to the process by which newly acquired information is transformed from a fragile, temporary state into a stable, long-term memory. This process occurs in stages. During learning, electrical signals between neurons create temporary connections known as synaptic pathways. These pathways must then be stabilised through a molecular process involving the synthesis of new proteins within the neuron. Without this protein synthesis, memories remain vulnerable to disruption and are likely to be lost.</p>\n        <p>The hippocampus, a curved structure located in the medial temporal lobe of the brain, plays a central role in the initial formation of declarative memories, those involving facts and events. However, the hippocampus does not serve as the permanent storage site for long-term memories. Over time, memories are gradually transferred and distributed across the cortex through a process called systems consolidation, which is strongly facilitated by sleep.</p>\n        <p>Research has demonstrated that sleep serves a critical function in memory consolidation. During slow-wave sleep, the deepest stage of non-REM sleep, the hippocampus repeatedly reactivates recently formed memories and transfers information to the cortex for long-term storage. This reactivation process is thought to strengthen the neural connections associated with the memory and integrate new information with existing knowledge.</p>\n        <p>One well-established finding is that the interval between learning and sleep has a significant effect on memory retention. Studies have shown that learning shortly before sleeping produces markedly better long-term recall than learning followed by a waking period of equal duration. This effect, sometimes described as \"sleep-dependent memory consolidation,\" has practical implications for educational strategies.</p>\n        <p>The phenomenon of reconsolidation, the discovery that memories become temporarily fragile each time they are retrieved, has transformed understanding of memory's dynamic nature. When a stored memory is recalled, it re-enters a labile state in which it can be modified, strengthened, or even destabilised by new information or emotional experience. This finding has significant implications for the treatment of conditions such as post-traumatic stress disorder (PTSD), where traumatic memories can potentially be weakened by intervening during the reconsolidation window.</p>\n        <div class=\"passage-glossary\">\n          <div class=\"glossary-title\">Glossary</div>\n          <p><strong>hippocampus</strong>: a part of the brain involved in forming new memories</p>\n          <p><strong>labile</strong>: likely to change or be altered easily</p>\n        </div>\n      ",
      "groups": [
        {
          "type": "sentence",
          "title": "Questions 27-33, Sentence Completion",
          "instructions": "Complete the sentences below. Use NO MORE THAN TWO WORDS from the passage for each answer.",
          "questions": [
            {
              "n": 27,
              "sentence": "Memory consolidation transforms newly acquired information from a fragile state into a <strong>______</strong>, long-term memory.",
              "spanStyle": "font-size:.9rem",
              "answer": "STABLE",
              "ref": "Paragraph 2: 'temporary state into a stable, long-term memory'",
              "explanation": ""
            },
            {
              "n": 28,
              "sentence": "During learning, neurons create temporary connections known as <strong>______</strong> pathways.",
              "spanStyle": "font-size:.9rem",
              "answer": "SYNAPTIC",
              "ref": "Paragraph 2: 'temporary connections known as synaptic pathways'",
              "explanation": ""
            },
            {
              "n": 29,
              "sentence": "Stabilising synaptic pathways requires the synthesis of new <strong>______</strong> within the neuron.",
              "spanStyle": "font-size:.9rem",
              "answer": "PROTEINS",
              "ref": "Paragraph 2: 'the synthesis of new proteins within the neuron'",
              "explanation": ""
            },
            {
              "n": 30,
              "sentence": "The hippocampus plays a central role in the initial formation of <strong>______</strong> memories, which involve facts and events.",
              "spanStyle": "font-size:.9rem",
              "answer": "DECLARATIVE",
              "ref": "Paragraph 3: 'the initial formation of declarative memories'",
              "explanation": ""
            },
            {
              "n": 31,
              "sentence": "During slow-wave sleep, the hippocampus repeatedly <strong>______</strong> recently formed memories and transfers them to the cortex.",
              "spanStyle": "font-size:.9rem",
              "answer": "REACTIVATES",
              "ref": "Paragraph 4: 'the hippocampus repeatedly reactivates recently formed memories'",
              "explanation": ""
            },
            {
              "n": 32,
              "sentence": "Research shows that learning shortly before <strong>______</strong> leads to better long-term recall than learning followed by a waking period.",
              "spanStyle": "font-size:.9rem",
              "answer": "SLEEPING",
              "ref": "Paragraph 5: 'learning shortly before sleeping produces markedly better long-term recall'",
              "explanation": ""
            },
            {
              "n": 33,
              "sentence": "The discovery that memories become temporarily fragile each time they are retrieved is known as <strong>______</strong>.",
              "spanStyle": "font-size:.9rem",
              "answer": "RECONSOLIDATION",
              "ref": "Paragraph 6: 'The phenomenon of reconsolidation, the discovery that memories'",
              "explanation": ""
            }
          ]
        },
        {
          "type": "mc",
          "title": "Questions 34-40, Multiple Choice",
          "instructions": "Choose the correct letter A, B, C or D.",
          "questions": [
            {
              "n": 34,
              "text": "What is the primary purpose of protein synthesis during memory consolidation?",
              "options": [
                "To increase the speed of information retrieval",
                "To stabilise newly formed synaptic pathways",
                "To transfer memories from the cortex to the hippocampus",
                "To erase redundant memories"
              ],
              "answer": "B",
              "ref": "Paragraph 2: 'stabilised through a molecular process involving the synthesis'",
              "explanation": ""
            },
            {
              "n": 35,
              "text": "According to the passage, where are long-term memories ultimately stored?",
              "options": [
                "Exclusively in the hippocampus",
                "In the medial temporal lobe",
                "Distributed across the cortex",
                "In specific synaptic pathways"
              ],
              "answer": "C",
              "ref": "Paragraph 3: 'gradually transferred and distributed across the cortex'",
              "explanation": ""
            },
            {
              "n": 36,
              "text": "What role does slow-wave sleep play in memory consolidation?",
              "options": [
                "It prevents new learning from interfering with old memories",
                "It allows the hippocampus to transfer memories to the cortex",
                "It eliminates memories that are no longer needed",
                "It enhances the production of cortisol"
              ],
              "answer": "B",
              "ref": "Paragraph 4: 'transfers information to the cortex for long-term storage'",
              "explanation": ""
            },
            {
              "n": 37,
              "text": "What does the phrase \"sleep-dependent memory consolidation\" refer to?",
              "options": [
                "The fact that people sleep better after intensive learning",
                "The discovery that sleep is required for all types of learning",
                "The finding that sleeping after learning improves long-term retention",
                "The relationship between REM sleep and emotional memory"
              ],
              "answer": "C",
              "ref": "Paragraph 5: 'learning shortly before sleeping produces markedly better long-term recall'",
              "explanation": ""
            },
            {
              "n": 38,
              "text": "According to the passage, what happens to a memory when it is retrieved?",
              "options": [
                "It is permanently strengthened",
                "It becomes temporarily unstable",
                "It is deleted from the hippocampus",
                "It is duplicated across multiple brain regions"
              ],
              "answer": "B",
              "ref": "Paragraph 6: 'memories become temporarily fragile each time they are retrieved'",
              "explanation": ""
            },
            {
              "n": 39,
              "text": "What does reconsolidation research suggest for treating PTSD?",
              "options": [
                "Preventing patients from recalling traumatic events entirely",
                "Intervening during the reconsolidation window to weaken traumatic memories",
                "Using protein synthesis inhibitors to erase emotional memories",
                "Applying slow-wave sleep therapy to consolidate positive memories"
              ],
              "answer": "B",
              "ref": "Paragraph 6: 'weakened by intervening during the reconsolidation window'",
              "explanation": ""
            },
            {
              "n": 40,
              "text": "Which statement best describes the overall view of memory presented in the passage?",
              "options": [
                "Memory is a fixed and reliable record of past experiences",
                "Memory is a dynamic process that continues to be modified over time",
                "Memory consolidation is complete within 24 hours of learning",
                "The hippocampus alone is responsible for all memory storage"
              ],
              "answer": "B",
              "ref": "Paragraph 6: 'has transformed understanding of memory's dynamic nature'",
              "explanation": ""
            }
          ]
        }
      ]
    }
  ]
};

const READING_TEST03 = {
  "id": "rdtest03",
  "title": "Reading Test 03",
  "passages": [
    {
      "number": 1,
      "tabLabel": "Passage 1",
      "resultLabel": "Passage 1 (History of Glass)",
      "label": "Passage 1, Questions 1-13",
      "heading": "The History of Glass",
      "bodyHTML": "\n        <div class=\"passage-label\">Passage 1, Questions 1-13</div>\n        <h3>The History of Glass</h3>\n        <p>Glass is one of humanity's oldest manufactured materials, with evidence of production dating back to Mesopotamia around 3500 BCE. Early glass was primarily used for decorative purposes, with craftsmen producing beads, amulets, and small vessels. It was not until the first century BCE that glassblowing was discovered, most likely in the region of ancient Syria. This technique, which involves inflating molten glass through a metal tube, revolutionised the craft by making it faster and far less expensive, dramatically expanding the range of objects that could be produced.</p>\n        <p>During the medieval period, Venice became the undisputed centre of European glassmaking. Venetian glassmakers were so highly prized, and their techniques so jealously guarded, that in 1291, the Venetian Republic ordered all glassmakers to relocate to the island of Murano. This served both to reduce the fire risk to the city and to allow the government to monitor the trade more closely. Glassmakers who attempted to leave and share their techniques with other regions were threatened with severe penalties, including death.</p>\n        <p>The emergence of lead crystal glass in seventeenth-century England represented another significant development. English glassmaker George Ravenscroft discovered that adding lead oxide to the glass mixture produced a material that was softer, more brilliant, easier to cut and engrave, and highly desirable for luxury tableware. By the eighteenth century, this style had spread across Europe and established Britain as a major force in glassmaking.</p>\n        <p>The Industrial Revolution transformed the scale of glass production. Previously, glass had been produced by skilled artisans in small quantities; mechanisation allowed factories to produce standardised glass sheets in large volumes, dramatically lowering costs. Window glass, once a luxury item found only in wealthy homes and churches, became affordable to the general population.</p>\n        <p>The twentieth century saw arguably the most significant advance in flat glass production: the float glass process, developed by Sir Alastair Pilkington of the Pilkington Brothers company in 1952. In this process, molten glass is poured onto a bed of molten tin, on which it floats and spreads, creating a perfectly flat and uniform surface as it cools. This technique made it possible to produce large sheets of flawless glass economically, and it remains the dominant method of flat glass production globally.</p>\n        <p>The applications of glass have extended far beyond windows and tableware. The development of optical glass in the seventeenth century enabled the creation of accurate telescopes, microscopes, and spectacles, fundamentally transforming scientific inquiry. Today, glass fibres carry the vast majority of the world's internet data, demonstrating that a material first crafted thousands of years ago remains central to modern technological infrastructure.</p>\n        <div class=\"passage-glossary\">\n          <div class=\"glossary-title\">Glossary</div>\n          <p><strong>lead oxide</strong>: a chemical compound of lead once commonly added to glass mixtures</p>\n        </div>\n      ",
      "groups": [
        {
          "type": "tfng",
          "title": "Questions 1-7, True / False / Not Given",
          "instructions": "Do the following statements agree with the information given in the passage? Write TRUE, FALSE or NOT GIVEN.",
          "questions": [
            {
              "n": 1,
              "text": "The earliest glass objects made by humans were intended primarily for practical use.",
              "answer": "FALSE",
              "ref": "Paragraph 1: 'Early glass was primarily used for decorative purposes'",
              "explanation": ""
            },
            {
              "n": 2,
              "text": "Glassblowing was invented by craftsmen working in Venice during the medieval period.",
              "answer": "FALSE",
              "ref": "Paragraph 1: 'most likely in the region of ancient Syria'",
              "explanation": ""
            },
            {
              "n": 3,
              "text": "One reason the Venetian Republic moved glassmakers to Murano was to maintain control over their trade secrets.",
              "answer": "TRUE",
              "ref": "Paragraph 2: 'to allow the government to monitor the trade more closely'",
              "explanation": ""
            },
            {
              "n": 4,
              "text": "George Ravenscroft's lead crystal glass was harder to cut than traditional Venetian glass.",
              "answer": "FALSE",
              "ref": "Paragraph 3: 'easier to cut and engrave'",
              "explanation": ""
            },
            {
              "n": 5,
              "text": "Several glass manufacturers had unsuccessfully attempted the float glass process before Pilkington.",
              "answer": "NOT GIVEN",
              "ref": "Not stated in the passage",
              "explanation": ""
            },
            {
              "n": 6,
              "text": "The Industrial Revolution made window glass accessible to ordinary people for the first time.",
              "answer": "TRUE",
              "ref": "Paragraph 4: 'became affordable to the general population'",
              "explanation": ""
            },
            {
              "n": 7,
              "text": "According to the passage, modern glass fibres are primarily used in the manufacture of scientific instruments.",
              "answer": "FALSE",
              "ref": "Paragraph 6: 'glass fibres carry the vast majority of the world's internet'",
              "explanation": ""
            }
          ]
        },
        {
          "type": "mc",
          "title": "Questions 8-13, Multiple Choice",
          "instructions": "Choose the correct letter, A, B, C or D.",
          "questions": [
            {
              "n": 8,
              "text": "According to the passage, why did the Venetian Republic relocate glassmakers to Murano in 1291?",
              "options": [
                "To provide them with better raw materials",
                "To protect them from competition from foreign craftsmen",
                "To reduce the fire hazard to the city and enable closer supervision of the trade",
                "To allow them to work alongside other skilled artisans"
              ],
              "answer": "C",
              "ref": "Paragraph 2: 'to reduce the fire risk to the city'",
              "explanation": ""
            },
            {
              "n": 9,
              "text": "The word \"prized\" in paragraph 2 most closely means...",
              "options": [
                "Rewarded financially",
                "Highly valued",
                "Closely monitored",
                "Officially licensed"
              ],
              "answer": "B",
              "ref": "Paragraph 2: 'Venetian glassmakers were so highly prized'",
              "explanation": ""
            },
            {
              "n": 10,
              "text": "According to the passage, what was the principal advantage of the float glass process?",
              "options": [
                "It eliminated the need for skilled workers in glass production",
                "It used a new chemical process to improve the clarity of glass",
                "It enabled the economical production of large, flawless glass sheets",
                "It required significantly less energy than previous glassmaking methods"
              ],
              "answer": "C",
              "ref": "Paragraph 5: 'made it possible to produce large sheets of flawless glass'",
              "explanation": ""
            },
            {
              "n": 11,
              "text": "The passage suggests that lead crystal glass became popular largely because it was...",
              "options": [
                "Cheaper to produce than Venetian glass",
                "Stronger and more durable in everyday use",
                "Better suited to industrial applications",
                "More visually attractive and easier to work with"
              ],
              "answer": "D",
              "ref": "Paragraph 3: 'more brilliant, easier to cut and engrave, and highly desirable'",
              "explanation": ""
            },
            {
              "n": 12,
              "text": "According to the passage, which development in the seventeenth century contributed significantly to scientific progress?",
              "options": [
                "The establishment of glass factories using industrial methods",
                "The creation of lead crystal glass in England",
                "The development of optical glass enabling precision instruments",
                "The introduction of glassblowing techniques from Syria"
              ],
              "answer": "C",
              "ref": "Paragraph 6: 'development of optical glass in the seventeenth century'",
              "explanation": ""
            },
            {
              "n": 13,
              "text": "The main purpose of the final paragraph is to...",
              "options": [
                "Contrast the uses of ancient and modern glass",
                "Argue that glass has replaced metals in most technological applications",
                "Demonstrate that glass remains technologically relevant in the modern world",
                "Describe the environmental challenges associated with glass fibre production"
              ],
              "answer": "C",
              "ref": "Paragraph 6: 'remains central to modern technological infrastructure'",
              "explanation": ""
            }
          ]
        }
      ]
    },
    {
      "number": 2,
      "tabLabel": "Passage 2",
      "resultLabel": "Passage 2 (Microplastics)",
      "label": "Passage 2, Questions 14-26",
      "heading": "Microplastics in the Global Food Chain",
      "bodyHTML": "\n        <div class=\"passage-label\">Passage 2, Questions 14-26</div>\n        <h3>Microplastics in the Global Food Chain</h3>\n        <p>Microplastics are defined as plastic particles smaller than five millimetres in their longest dimension. They enter the environment through multiple pathways: the degradation of larger plastic items exposed to sunlight and mechanical stress; the release of synthetic fibres during the washing of clothes made from polyester, nylon, and acrylic; the breakdown of plastic packaging; and the direct manufacture of microbeads formerly incorporated into cosmetics. Although microbeads have been banned in several countries, remaining sources continue to release microplastics into waterways, soils, and the atmosphere at significant rates.</p>\n        <p>Once in the environment, microplastics are ingested by a wide range of organisms, from zooplankton, the microscopic animals at the base of many aquatic food chains, to fish, seabirds, and marine mammals. When zooplankton consume microplastics, they may experience satiation, a false sense of fullness, that reduces their actual food intake and impairs their reproduction and growth. This disruption at the base of the food chain can have cascading effects on species further up, including commercially important fish.</p>\n        <p>As organisms at lower trophic levels consume microplastics and are themselves consumed by larger predators, the concentration of microplastic particles can increase at each level in a process known as biomagnification. This means that top predators, including humans, may be exposed to significantly higher concentrations of microplastics than the ambient environment would suggest. However, the evidence for classical biomagnification of microplastics specifically remains disputed among scientists.</p>\n        <p>Studies have detected microplastics in bottled water, tap water, sea salt, honey, beer, and commercially sold seafood. Research conducted in 2018 estimated that the average person may ingest approximately 50,000 microplastic particles per year through food and water alone, with additional exposure occurring through inhalation. Plastic particles have also been found in human blood, lung tissue, and placental tissue, indicating that they can cross biological barriers and accumulate in the body.</p>\n        <p>The health implications of microplastic ingestion remain a subject of active research. Laboratory studies on animals have linked exposure to chemicals associated with plastics, including phthalates and bisphenol A, to hormonal disruption and cellular damage. However, establishing direct causal links between microplastic exposure and human health outcomes is complicated by difficulties in isolating plastic-related effects. The World Health Organisation concluded in 2019 that risks from microplastics in drinking water are currently low, while acknowledging significant uncertainty.</p>\n        <p>Policy responses have been varied. Some countries have implemented bans on single-use plastics, while others have set recycling targets. Critics argue that these measures are insufficient given the scale of plastic production, and that more radical systemic changes are required to meaningfully reduce microplastic contamination of the environment.</p>\n        <div class=\"passage-glossary\">\n          <div class=\"glossary-title\">Glossary</div>\n          <p><strong>trophic level</strong>: a position in a food chain, defined by what an organism eats and what eats it</p>\n          <p><strong>bisphenol A</strong>: an industrial chemical used in the manufacture of certain plastics</p>\n        </div>\n      ",
      "groups": [
        {
          "type": "sentence",
          "title": "Questions 14-20, Sentence Completion",
          "instructions": "Complete the sentences below. Use NO MORE THAN TWO WORDS from the passage for each answer.",
          "questions": [
            {
              "n": 14,
              "sentence": "The ________ of larger plastic items by sunlight and mechanical forces is one source of microplastics.",
              "spanStyle": "",
              "answer": "DEGRADATION",
              "ref": "Paragraph 1: 'the degradation of larger plastic items exposed to sunlight'",
              "explanation": ""
            },
            {
              "n": 15,
              "sentence": "When synthetic garments are washed, they release ________ into the water system.",
              "spanStyle": "",
              "answer": "FIBRES",
              "ref": "Paragraph 1: 'the release of synthetic fibres during the washing of clothes'",
              "explanation": ""
            },
            {
              "n": 16,
              "sentence": "Consuming microplastics may cause zooplankton to experience ________, making them feel full when they are not.",
              "spanStyle": "",
              "answer": "SATIATION",
              "ref": "Paragraph 2: 'they may experience satiation, a false sense of fullness'",
              "explanation": ""
            },
            {
              "n": 17,
              "sentence": "The process by which microplastic concentrations increase at higher levels of the food chain is called ________.",
              "spanStyle": "",
              "answer": "BIOMAGNIFICATION",
              "ref": "Paragraph 3: 'in a process known as biomagnification'",
              "explanation": ""
            },
            {
              "n": 18,
              "sentence": "Scientists have detected microplastic particles in human ________, lung tissue, and placental tissue.",
              "spanStyle": "",
              "answer": "BLOOD",
              "ref": "Paragraph 4: 'found in human blood, lung tissue, and placental tissue'",
              "explanation": ""
            },
            {
              "n": 19,
              "sentence": "In addition to eating and drinking, microplastics can also enter the body through ________.",
              "spanStyle": "",
              "answer": "INHALATION",
              "ref": "Paragraph 4: 'with additional exposure occurring through inhalation'",
              "explanation": ""
            },
            {
              "n": 20,
              "sentence": "The WHO's 2019 assessment concluded that risks from microplastics in drinking water are currently ________.",
              "spanStyle": "",
              "answer": "LOW",
              "ref": "Paragraph 5: 'risks from microplastics in drinking water are currently low'",
              "explanation": ""
            }
          ]
        },
        {
          "type": "mc",
          "title": "Questions 21-26, Multiple Choice",
          "instructions": "Choose the correct letter, A, B, C or D.",
          "questions": [
            {
              "n": 21,
              "text": "Which of the following is NOT mentioned in the passage as a source of microplastics?",
              "options": [
                "The breakdown of plastic packaging",
                "The washing of synthetic garments",
                "The abrasion of rubber from vehicle tyres",
                "The manufacture of microbeads in cosmetics"
              ],
              "answer": "C",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 22,
              "text": "According to the passage, why is the effect of microplastics on zooplankton significant for the wider ecosystem?",
              "options": [
                "Zooplankton are the only organisms that can break down plastic particles",
                "The loss of zooplankton directly reduces the amount of oxygen in the ocean",
                "Disruption at the base of the food chain can affect species at higher levels",
                "Zooplankton populations determine the distribution of commercial fish stocks"
              ],
              "answer": "C",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 23,
              "text": "The term \"biomagnification\" in paragraph 3 refers to...",
              "options": [
                "The process by which plastic particles break down over time into smaller fragments",
                "The tendency of microplastics to concentrate in coastal and estuarine environments",
                "The increasing concentration of microplastics as they move up the food chain",
                "The growth in the total volume of microplastics in the environment over time"
              ],
              "answer": "C",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 24,
              "text": "What does the passage indicate about the health risks of microplastic ingestion for humans?",
              "options": [
                "They have been confirmed by the WHO as a serious global health threat",
                "They are primarily associated with exposure through the skin rather than ingestion",
                "Evidence from animal studies exists, but direct causal links in humans are difficult to establish",
                "They are well understood through long-term epidemiological studies of coastal populations"
              ],
              "answer": "C",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 25,
              "text": "According to the passage, what aspect of microplastics remains contested among scientists?",
              "options": [
                "Whether microplastics have been detected in human tissue",
                "Whether the process of classical biomagnification applies to microplastics",
                "Whether governments should ban all single-use plastics",
                "Whether microplastics affect marine mammals more severely than fish"
              ],
              "answer": "B",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 26,
              "text": "The word \"ambient\" in paragraph 3 most closely means...",
              "options": [
                "Fluctuating",
                "Surrounding",
                "Measurable",
                "Elevated"
              ],
              "answer": "B",
              "ref": "",
              "explanation": ""
            }
          ]
        }
      ]
    },
    {
      "number": 3,
      "tabLabel": "Passage 3",
      "resultLabel": "Passage 3 (Consumer Psychology)",
      "label": "Passage 3, Questions 27-40",
      "heading": "The Psychology of Consumer Decision-Making",
      "bodyHTML": "\n        <div class=\"passage-label\">Passage 3, Questions 27-40</div>\n        <h3>The Psychology of Consumer Decision-Making</h3>\n        <p>For much of the twentieth century, economic theory was built on the assumption that consumers make rational decisions, carefully evaluating available information, calculating costs and benefits, and selecting the option that maximises their utility. This model, known as homo economicus, described a hypothetically perfect decision-maker operating with complete information and unwavering logic. However, research beginning in the 1950s began to challenge this assumption with substantial empirical evidence to the contrary.</p>\n        <p>Herbert Simon, an economist and cognitive scientist, was among the first to formally propose that human decision-making is subject to what he termed bounded rationality. Simon argued that while humans aim to make rational decisions, they are constrained by the limits of their cognitive capacity, the finite time available to process information, and the complexity of the environment. Rather than optimising, finding the single best solution, most people satisfice: they adopt the first option that meets a minimum acceptable standard, even if better alternatives may exist.</p>\n        <p>Daniel Kahneman and Amos Tversky extended this framework in the 1970s and 1980s with their work on cognitive heuristics and biases. They demonstrated that human judgment is not simply limited but systematically distorted by mental shortcuts that, while often useful, can produce predictable errors. One of their most influential findings concerns the anchoring effect: the tendency for an initial piece of numerical information, even one that is arbitrary or irrelevant, to exert a disproportionate influence on subsequent judgments. When buyers see an item marked down from a high original price, they are inclined to perceive it as a bargain regardless of whether the original price was genuinely meaningful.</p>\n        <p>A complementary body of research has examined priming, the process by which exposure to one stimulus unconsciously influences responses to subsequent stimuli. Experiments have shown that playing French music in a wine shop leads customers to purchase French wines at a higher rate, while German music results in greater sales of German wines, effects that often occur without the conscious awareness of the consumer. Taken together, priming and anchoring illustrate how purchasing decisions are frequently shaped by environmental cues and framing effects rather than by conscious deliberation.</p>\n        <p>Richard Thaler and Cass Sunstein built upon this research to develop what they called nudge theory, arguing that policymakers can design choice architectures, the arrangement of options in a decision-making environment, to steer individuals towards better decisions without restricting their freedom of choice. Classic examples include placing healthier food at eye level in a cafeteria, or enrolling employees in pension schemes by default while allowing them to opt out. Such nudges have been adopted by numerous governments as low-cost tools for promoting public health, increasing savings rates, and encouraging sustainable behaviours.</p>\n        <p>Critics of nudge theory question whether it is ethically appropriate for governments to manipulate citizens' choices, even in benevolent ways. Others argue that nudges are merely superficial interventions that address only the symptoms of poor decision-making, and that more fundamental reforms to institutions and markets are required. The debate continues as behavioural economics, the discipline that combines psychological research with economic theory, has become one of the fastest-growing fields in the social sciences.</p>\n        <div class=\"passage-glossary\">\n          <div class=\"glossary-title\">Glossary</div>\n          <p><strong>homo economicus</strong>: an idealised model of a purely rational, self-interested decision-maker used in classical economics</p>\n        </div>\n      ",
      "groups": [
        {
          "type": "sentence",
          "title": "Questions 27-33, Sentence Completion",
          "instructions": "Complete the sentences below. Use NO MORE THAN THREE WORDS from the passage for each answer.",
          "questions": [
            {
              "n": 27,
              "sentence": "The classical model of the rational consumer described an idealised decision-maker known as ________.",
              "spanStyle": "",
              "answer": "HOMO ECONOMICUS",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 28,
              "sentence": "Herbert Simon argued that real-world decision-making is subject to ________, due to cognitive and time constraints.",
              "spanStyle": "",
              "answer": "BOUNDED RATIONALITY",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 29,
              "sentence": "According to Simon, rather than finding the optimal solution, most people ________ by selecting the first acceptable option.",
              "spanStyle": "",
              "answer": "SATISFICE",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 30,
              "sentence": "The ________ effect describes how an initial piece of numerical information can disproportionately influence later judgments.",
              "spanStyle": "",
              "answer": "ANCHORING",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 31,
              "sentence": "Research on ________ has shown that background music in a shop can unconsciously influence what customers choose to buy.",
              "spanStyle": "",
              "answer": "PRIMING",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 32,
              "sentence": "Thaler and Sunstein developed ________ theory, which advocates for designing environments that guide people towards better choices.",
              "spanStyle": "",
              "answer": "NUDGE",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 33,
              "sentence": "Critics of nudge theory argue that it only addresses the ________ of poor decision-making rather than its structural causes.",
              "spanStyle": "",
              "answer": "SYMPTOMS",
              "ref": "",
              "explanation": ""
            }
          ]
        },
        {
          "type": "mc",
          "title": "Questions 34-40, Multiple Choice",
          "instructions": "Choose the correct letter, A, B, C or D.",
          "questions": [
            {
              "n": 34,
              "text": "According to the passage, what was the central assumption of the homo economicus model?",
              "options": [
                "Consumers make decisions based primarily on social comparison",
                "Consumers have access to limited but reliable market information",
                "Consumers act logically to maximise their personal benefit",
                "Consumers prefer familiar products to unfamiliar alternatives"
              ],
              "answer": "C",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 35,
              "text": "Herbert Simon's concept of bounded rationality suggests that...",
              "options": [
                "Humans are fundamentally incapable of rational thought",
                "Real decision-making is constrained by cognitive and environmental limitations",
                "Time pressure consistently improves the quality of decisions",
                "People become more rational with experience and practice"
              ],
              "answer": "B",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 36,
              "text": "In the passage, the anchoring effect is best illustrated by the example of...",
              "options": [
                "A consumer who buys French wine after hearing French music",
                "An employee who is automatically enrolled in a pension scheme",
                "A buyer who perceives a discounted item as a bargain based on its original price",
                "A shopper who selects the product placed at eye level in a supermarket"
              ],
              "answer": "C",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 37,
              "text": "According to the passage, how does priming differ from anchoring?",
              "options": [
                "Priming is deliberately used by retailers, whereas anchoring occurs naturally",
                "Priming works through unconscious exposure to stimuli rather than numerical data",
                "Priming affects individual shoppers, while anchoring affects entire markets",
                "Priming is effective only in physical retail environments"
              ],
              "answer": "B",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 38,
              "text": "In paragraph 5, the term \"choice architectures\" refers to...",
              "options": [
                "Physical store layouts designed to slow down customer movement",
                "Legal regulations that restrict the range of products available to consumers",
                "The way options are structured and presented in a decision-making environment",
                "Computer algorithms used to personalise online shopping recommendations"
              ],
              "answer": "C",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 39,
              "text": "Which of the following best describes the critics' view of nudge theory as presented in the passage?",
              "options": [
                "They believe it contradicts the fundamental principles of behavioural economics",
                "They argue it is ineffective because most people are unaware of being nudged",
                "They consider it ethically questionable and insufficiently radical to address structural problems",
                "They claim it applies only to health-related decisions and not to financial behaviour"
              ],
              "answer": "C",
              "ref": "",
              "explanation": ""
            },
            {
              "n": 40,
              "text": "The writer's main purpose in this passage is to...",
              "options": [
                "Argue that classical economic theory should be completely replaced by behavioural economics",
                "Demonstrate that nudge theory is the most effective tool available to policymakers",
                "Trace the development of theories that challenge the rational model of consumer behaviour",
                "Evaluate whether priming or anchoring has a greater influence on purchasing decisions"
              ],
              "answer": "C",
              "ref": "",
              "explanation": ""
            }
          ]
        }
      ]
    }
  ]
};

const READING_TESTS = { rdtest01: READING_TEST01, rdtest02: READING_TEST02, rdtest03: READING_TEST03 };
