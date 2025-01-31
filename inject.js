const maskedNumbersInAffixes = JSON.parse(decodeURIComponent(`{{maskedNumbersInAffixes}}`));
console.log(maskedNumbersInAffixes);

const elements = document.querySelectorAll('.background-image.item-popup--poe2');
for (let i = 0; i < elements.length; i++) {
    if (window.getComputedStyle(elements[i]).backgroundImage !== 'none') {
        elements[i].style.backgroundImage = 'none';
        break; // Exit loop after first match
    }
}

// function extractModData() {
//     const modData = {};

//     document.querySelectorAll('.col-lg-6').forEach(section => {
//         const category = section.querySelector('.identify-title')?.textContent.trim();
//         if (!category) return;

//         modData[category] = [];

//         section.querySelectorAll('.mod-title').forEach(mod => {
//             const dataTarget = mod.getAttribute('data-bs-target');

//             let textContent = [...mod.childNodes]
//                 .filter(node => !node.classList || !node.classList.contains('float-end'))
//                 .map(node => node.textContent.trim())
//                 .join(' ');

//             textContent = textContent.replace(/\s+/g, '').trim().toLowerCase();

//             if (dataTarget && textContent) {
//                 modData[category].push({ dataTarget, text: textContent });
//             }
//         });
//     });

//     return modData;
// }

function extractModData() {
    const modData = {};

    document.querySelectorAll('.col-lg-6, .col-lg-12').forEach(section => {
        const category = section.querySelector('.identify-title')?.textContent.trim();
        if (!category) return;

        modData[category] = [];

        section.querySelectorAll('.mod-title').forEach(mod => {
            const dataTarget = mod.getAttribute('data-bs-target');
            
            // Process text content without spaces
            let textContent = [...mod.childNodes]
                .filter(node => !node.classList?.contains('float-end'))
                .map(node => {
                    // Handle mod-value placeholders
                    if (node.classList?.contains('mod-value')) {
                        return '#';
                    }
                    return node.textContent.trim();
                })
                .join('')
                .replace(/\s+/g, '')
                .toLowerCase();

            if (dataTarget && textContent) {
                const cleanDataTarget = dataTarget.replace(/^#/, '');
                const tiers = [];
                const modValues = [];

                // Extract modal table data
                const targetDiv = document.getElementById(cleanDataTarget);
                if (targetDiv) {
                    const table = targetDiv.querySelector('table');
                    if (table) {
                        table.querySelectorAll('tr').forEach((row, index) => {
                            const tierNumber = index + 1;
                            const rowValues = [];
                            
                            row.querySelectorAll('.mod-value').forEach(valueEl => {
                                const valueText = valueEl.textContent.trim();
                                const matches = [...valueText.matchAll(/(\d+)(?:–(\d+))?/g)];
                                matches.forEach(match => {
                                    if (match[2]) {
                                        rowValues.push([parseInt(match[1]), parseInt(match[2])]);
                                    } else if (match[1]) {
                                        rowValues.push(parseInt(match[1]));
                                    }
                                });
                            });

                            if (rowValues.length > 0) {
                                tiers.push(tierNumber);
                                modValues.push(rowValues);
                            }
                        });
                    }
                }

                modData[category].push({ 
                    dataTarget: cleanDataTarget,
                    text: textContent,
                    tiers: tiers,
                    modValues: modValues
                });
            }
        });
    });

    return modData;
}

const modData = extractModData();
console.log("modData:");
console.log(modData);
console.log('end modData');

const findMatchingAffixes = (affixObject, affixData) => {
    let matches = [];

    // Convert the values of the first object into an array
    const affixValues = Object.values(affixObject);

    // Loop through Prefix and Suffix arrays
    ["Prefix", "Suffix"].forEach(category => {
        affixData[category].forEach(entry => {
            // Check if the entry.text contains any affix value
            affixValues.forEach(affix => {
                if (entry.text.includes(affix.text)) {
                    matches.push({
                        dataTarget: entry.dataTarget,
                        text: entry.text,
                        matchedAffix: affix
                    });
                }
            });
        });
    });

    return matches;
};

const affixData = findMatchingAffixes(maskedNumbersInAffixes, modData);
console.log("affixData:");
console.log(affixData);
console.log('end affixData');

const findMultipleMatches = (maskedNumbersInAffixes, affixData) => {
    const result = {};

    // Iterate through maskedNumbersInAffixes
    for (const key in maskedNumbersInAffixes) {
        const textToMatch = maskedNumbersInAffixes[key].text;

        // Find all elements in affixData that contain the text as a substring
        const matches = affixData.filter(item => item.text.includes(textToMatch));

        // If the text appears in multiple elements, add their dataTargets to the result
        if (matches.length > 1) {
            result[textToMatch] = matches.map(item => item.dataTarget);
        }
    }

    return result;
};

const multipleMatches = findMultipleMatches(maskedNumbersInAffixes, affixData);
console.log("multipleMatches:");
console.log(multipleMatches);
console.log('end multipleMatches');

// // mark ambiguous members 
// const markAmbiguousMembers = (object) => {
//     // Step 1: Find all members with count > 1
//     const highCountMembers = Object.entries(object).filter(([key, value]) => value.count > 1);

//     // Step 2: Extract all unique texts from high-count members
//     const ambiguousTexts = new Set();
//     highCountMembers.forEach(([key, value]) => {
//         value.texts.forEach(text => ambiguousTexts.add(text));
//     });

//     // Step 3: Check all members for ambiguous texts
//     Object.entries(object).forEach(([key, value]) => {
//         // If any of the member's texts are in the ambiguousTexts set, mark it as ambiguous
//         if (value.texts.some(text => ambiguousTexts.has(text))) {
//             value.ambiguous = true;
//         }
//     });

//     return object;
// };

// markAmbiguousMembers(multipleMatches);
// console.log("multipleMatches after markAmbiguousMembers:");
// console.log(multipleMatches);
// console.log("end multipleMatches after markAmbiguousMembers");

/** We have object like this:
 * {
    "0": {
        "text": "#%increasedphysicaldamage",
        "values": [
            210
        ]
    },
    "1": {
        "text": "adds#to#physicaldamage",
        "values": [
            32,
            63
        ]
    },
    "2": {
        "text": "#toaccuracyrating",
        "values": [
            98
        ]
    },
    "3": {
        "text": "#todexterity",
        "values": [
            26
        ]
    },
    "4": {
        "text": "grants#lifeperenemyhit",
        "values": [
            5
        ]
    },
    "5": {
        "text": "leeches#%ofphysicaldamageasmana",
        "values": [
            6.72
        ]
    }
}
 */

/** and object like this in affixData variable
 * {
    "Prefix": [
        {
            "dataTarget": "collapseOnenormal1PhysicalDamage",
            "text": "adds#to#physicaldamage",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9
            ],
            "modValues": [
                [
                    [
                        1,
                        2
                    ],
                    [
                        4,
                        5
                    ]
                ],
                [
                    [
                        4,
                        6
                    ],
                    [
                        7,
                        11
                    ]
                ],
                [
                    [
                        6,
                        9
                    ],
                    [
                        11,
                        16
                    ]
                ],
                [
                    [
                        8,
                        12
                    ],
                    [
                        14,
                        21
                    ]
                ],
                [
                    [
                        10,
                        15
                    ],
                    [
                        18,
                        26
                    ]
                ],
                [
                    [
                        13,
                        20
                    ],
                    [
                        23,
                        35
                    ]
                ],
                [
                    [
                        16,
                        24
                    ],
                    [
                        28,
                        42
                    ]
                ],
                [
                    [
                        21,
                        31
                    ],
                    [
                        36,
                        53
                    ]
                ],
                [
                    [
                        26,
                        39
                    ],
                    [
                        44,
                        66
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal1FireDamage",
            "text": "adds#to#firedamage",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
            ],
            "modValues": [
                [
                    [
                        2,
                        3
                    ],
                    [
                        4,
                        5
                    ]
                ],
                [
                    [
                        4,
                        7
                    ],
                    [
                        8,
                        11
                    ]
                ],
                [
                    [
                        7,
                        11
                    ],
                    [
                        12,
                        18
                    ]
                ],
                [
                    [
                        11,
                        17
                    ],
                    [
                        18,
                        26
                    ]
                ],
                [
                    [
                        14,
                        21
                    ],
                    [
                        22,
                        33
                    ]
                ],
                [
                    [
                        20,
                        30
                    ],
                    [
                        31,
                        46
                    ]
                ],
                [
                    [
                        26,
                        39
                    ],
                    [
                        40,
                        59
                    ]
                ],
                [
                    [
                        35,
                        52
                    ],
                    [
                        53,
                        79
                    ]
                ],
                [
                    [
                        45,
                        67
                    ],
                    [
                        68,
                        102
                    ]
                ],
                [
                    [
                        52,
                        78
                    ],
                    [
                        79,
                        119
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal1ColdDamage",
            "text": "adds#to#colddamage",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
            ],
            "modValues": [
                [
                    [
                        1,
                        2
                    ],
                    [
                        3,
                        5
                    ]
                ],
                [
                    [
                        4,
                        6
                    ],
                    [
                        7,
                        10
                    ]
                ],
                [
                    [
                        6,
                        9
                    ],
                    [
                        10,
                        15
                    ]
                ],
                [
                    [
                        9,
                        14
                    ],
                    [
                        15,
                        22
                    ]
                ],
                [
                    [
                        12,
                        18
                    ],
                    [
                        19,
                        28
                    ]
                ],
                [
                    [
                        16,
                        25
                    ],
                    [
                        26,
                        38
                    ]
                ],
                [
                    [
                        21,
                        32
                    ],
                    [
                        33,
                        49
                    ]
                ],
                [
                    [
                        28,
                        43
                    ],
                    [
                        44,
                        65
                    ]
                ],
                [
                    [
                        37,
                        55
                    ],
                    [
                        56,
                        84
                    ]
                ],
                [
                    [
                        42,
                        63
                    ],
                    [
                        64,
                        95
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal1LightningDamage",
            "text": "adds#to#lightningdamage",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
            ],
            "modValues": [
                [
                    1,
                    [
                        7,
                        10
                    ]
                ],
                [
                    1,
                    [
                        14,
                        20
                    ]
                ],
                [
                    1,
                    [
                        19,
                        29
                    ]
                ],
                [
                    [
                        1,
                        3
                    ],
                    [
                        33,
                        49
                    ]
                ],
                [
                    [
                        1,
                        3
                    ],
                    [
                        37,
                        55
                    ]
                ],
                [
                    [
                        1,
                        4
                    ],
                    [
                        49,
                        73
                    ]
                ],
                [
                    [
                        1,
                        5
                    ],
                    [
                        62,
                        93
                    ]
                ],
                [
                    [
                        1,
                        7
                    ],
                    [
                        86,
                        128
                    ]
                ],
                [
                    [
                        1,
                        8
                    ],
                    [
                        108,
                        162
                    ]
                ],
                [
                    [
                        1,
                        10
                    ],
                    [
                        125,
                        188
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal1LocalPhysicalDamagePercent",
            "text": "#%increasedphysicaldamage",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8
            ],
            "modValues": [
                [
                    [
                        40,
                        49
                    ]
                ],
                [
                    [
                        50,
                        64
                    ]
                ],
                [
                    [
                        65,
                        84
                    ]
                ],
                [
                    [
                        85,
                        109
                    ]
                ],
                [
                    [
                        110,
                        134
                    ]
                ],
                [
                    [
                        135,
                        154
                    ]
                ],
                [
                    [
                        155,
                        169
                    ]
                ],
                [
                    [
                        170,
                        179
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal1LocalIncreasedPhysicalDamagePercentAndAccuracyRating",
            "text": "#%increasedphysicaldamage#toaccuracyrating",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8
            ],
            "modValues": [
                [
                    [
                        15,
                        19
                    ],
                    [
                        16,
                        20
                    ]
                ],
                [
                    [
                        20,
                        24
                    ],
                    [
                        21,
                        46
                    ]
                ],
                [
                    [
                        25,
                        34
                    ],
                    [
                        47,
                        72
                    ]
                ],
                [
                    [
                        35,
                        44
                    ],
                    [
                        73,
                        97
                    ]
                ],
                [
                    [
                        45,
                        54
                    ],
                    [
                        98,
                        123
                    ]
                ],
                [
                    [
                        55,
                        64
                    ],
                    [
                        124,
                        149
                    ]
                ],
                [
                    [
                        65,
                        74
                    ],
                    [
                        150,
                        174
                    ]
                ],
                [
                    [
                        75,
                        79
                    ],
                    [
                        175,
                        200
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal1IncreasedAccuracy",
            "text": "#toaccuracyrating",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
            ],
            "modValues": [
                [
                    [
                        11,
                        32
                    ]
                ],
                [
                    [
                        33,
                        60
                    ]
                ],
                [
                    [
                        61,
                        84
                    ]
                ],
                [
                    [
                        85,
                        123
                    ]
                ],
                [
                    [
                        124,
                        167
                    ]
                ],
                [
                    [
                        168,
                        236
                    ]
                ],
                [
                    [
                        237,
                        346
                    ]
                ],
                [
                    [
                        347,
                        450
                    ]
                ],
                [
                    [
                        451,
                        550
                    ]
                ],
                [
                    [
                        551,
                        650
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal1IncreasedWeaponElementalDamagePercent",
            "text": "#%increasedelementaldamagewithattacks",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6
            ],
            "modValues": [
                [
                    [
                        34,
                        47
                    ]
                ],
                [
                    [
                        48,
                        71
                    ]
                ],
                [
                    [
                        72,
                        85
                    ]
                ],
                [
                    [
                        86,
                        99
                    ]
                ],
                [
                    [
                        100,
                        119
                    ]
                ],
                [
                    [
                        120,
                        139
                    ]
                ]
            ]
        }
    ],
    "Suffix": [
        {
            "dataTarget": "collapseOnenormal2Strength",
            "text": "#tostrength",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8
            ],
            "modValues": [
                [
                    [
                        5,
                        8
                    ]
                ],
                [
                    [
                        9,
                        12
                    ]
                ],
                [
                    [
                        13,
                        16
                    ]
                ],
                [
                    [
                        17,
                        20
                    ]
                ],
                [
                    [
                        21,
                        24
                    ]
                ],
                [
                    [
                        25,
                        27
                    ]
                ],
                [
                    [
                        28,
                        30
                    ]
                ],
                [
                    [
                        31,
                        33
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2Dexterity",
            "text": "#todexterity",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8
            ],
            "modValues": [
                [
                    [
                        5,
                        8
                    ]
                ],
                [
                    [
                        9,
                        12
                    ]
                ],
                [
                    [
                        13,
                        16
                    ]
                ],
                [
                    [
                        17,
                        20
                    ]
                ],
                [
                    [
                        21,
                        24
                    ]
                ],
                [
                    [
                        25,
                        27
                    ]
                ],
                [
                    [
                        28,
                        30
                    ]
                ],
                [
                    [
                        31,
                        33
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2LocalAttributeRequirements",
            "text": "#%reducedattributerequirements",
            "tiers": [
                1,
                2,
                3,
                4,
                5
            ],
            "modValues": [
                [
                    15
                ],
                [
                    20
                ],
                [
                    25
                ],
                [
                    30
                ],
                [
                    35
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2IncreaseSocketedGemLevel",
            "text": "#tolevelofallprojectileskills",
            "tiers": [
                1,
                2,
                3,
                4,
                5
            ],
            "modValues": [
                [
                    [
                        1,
                        2
                    ]
                ],
                [
                    3
                ],
                [
                    4
                ],
                [
                    [
                        5,
                        6
                    ]
                ],
                [
                    7
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2LifeLeech",
            "text": "leeches#%ofphysicaldamageaslife",
            "tiers": [
                1,
                2,
                3,
                4
            ],
            "modValues": [
                [
                    [
                        5,
                        5
                    ],
                    9
                ],
                [
                    [
                        6,
                        6
                    ],
                    9
                ],
                [
                    [
                        7,
                        7
                    ],
                    9
                ],
                [
                    [
                        8,
                        8
                    ],
                    9
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2ManaLeech",
            "text": "leeches#%ofphysicaldamageasmana",
            "tiers": [
                1,
                2,
                3,
                4
            ],
            "modValues": [
                [
                    [
                        4,
                        4
                    ],
                    9
                ],
                [
                    [
                        5,
                        5
                    ],
                    9
                ],
                [
                    [
                        6,
                        6
                    ],
                    9
                ],
                [
                    [
                        7,
                        7
                    ],
                    9
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2LifeGainedFromEnemyDeath",
            "text": "gain#lifeperenemykilled",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8
            ],
            "modValues": [
                [
                    [
                        4,
                        6
                    ]
                ],
                [
                    [
                        7,
                        9
                    ]
                ],
                [
                    [
                        10,
                        18
                    ]
                ],
                [
                    [
                        19,
                        28
                    ]
                ],
                [
                    [
                        29,
                        40
                    ]
                ],
                [
                    [
                        41,
                        53
                    ]
                ],
                [
                    [
                        54,
                        68
                    ]
                ],
                [
                    [
                        69,
                        84
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2ManaGainedFromEnemyDeath",
            "text": "gain#manaperenemykilled",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8
            ],
            "modValues": [
                [
                    [
                        2,
                        3
                    ]
                ],
                [
                    [
                        4,
                        5
                    ]
                ],
                [
                    [
                        6,
                        9
                    ]
                ],
                [
                    [
                        10,
                        14
                    ]
                ],
                [
                    [
                        15,
                        20
                    ]
                ],
                [
                    [
                        21,
                        27
                    ]
                ],
                [
                    [
                        28,
                        35
                    ]
                ],
                [
                    [
                        36,
                        45
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2LifeGainPerTarget",
            "text": "grants#lifeperenemyhit",
            "tiers": [
                1,
                2,
                3,
                4
            ],
            "modValues": [
                [
                    2
                ],
                [
                    3
                ],
                [
                    4
                ],
                [
                    5
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2IncreasedAttackSpeed",
            "text": "#%increasedattackspeed",
            "tiers": [
                1,
                2,
                3,
                4,
                5
            ],
            "modValues": [
                [
                    [
                        5,
                        7
                    ]
                ],
                [
                    [
                        8,
                        10
                    ]
                ],
                [
                    [
                        11,
                        13
                    ]
                ],
                [
                    [
                        14,
                        16
                    ]
                ],
                [
                    [
                        17,
                        19
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2CriticalStrikeChanceIncrease",
            "text": "#%tocriticalhitchance",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6
            ],
            "modValues": [
                [
                    1,
                    [
                        1,
                        1
                    ],
                    5
                ],
                [
                    1,
                    [
                        51,
                        2
                    ],
                    1
                ],
                [
                    2,
                    [
                        11,
                        2
                    ],
                    7
                ],
                [
                    3,
                    [
                        11,
                        3
                    ],
                    8
                ],
                [
                    3,
                    [
                        81,
                        4
                    ],
                    4
                ],
                [
                    4,
                    [
                        41,
                        5
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2CriticalStrikeMultiplier",
            "text": "#%tocriticaldamagebonus",
            "tiers": [
                1,
                2,
                3,
                4,
                5,
                6
            ],
            "modValues": [
                [
                    [
                        10,
                        14
                    ]
                ],
                [
                    [
                        15,
                        19
                    ]
                ],
                [
                    [
                        20,
                        24
                    ]
                ],
                [
                    [
                        25,
                        29
                    ]
                ],
                [
                    [
                        30,
                        34
                    ]
                ],
                [
                    [
                        35,
                        39
                    ]
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2LightRadiusAndAccuracy",
            "text": "#toaccuracyrating#%increasedlightradius",
            "tiers": [
                1,
                2,
                3
            ],
            "modValues": [
                [
                    [
                        10,
                        20
                    ],
                    5
                ],
                [
                    [
                        21,
                        40
                    ],
                    10
                ],
                [
                    [
                        41,
                        60
                    ],
                    15
                ]
            ]
        },
        {
            "dataTarget": "collapseOnenormal2AdditionalAmmo",
            "text": "loadsanadditionalboltloads#additionalbolts",
            "tiers": [
                2
            ],
            "modValues": [
                [
                    2
                ]
            ]
        }
    ],
    "Socketable": [
        {
            "dataTarget": "collapseOnesocketable0DesertRune",
            "text": "adds#to#firedamage",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    7,
                    11
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0GlacialRune",
            "text": "adds#to#colddamage",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    6,
                    10
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0StormRune",
            "text": "adds#to#lightningdamage",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    1,
                    20
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0IronRune",
            "text": "#%increasedphysicaldamage",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    20
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0BodyRune",
            "text": "leeches#%ofphysicaldamageaslife",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    3
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0MindRune",
            "text": "leeches#%ofphysicaldamageasmana",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    2
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0RebirthRune",
            "text": "gain#lifeperenemykilled",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    20
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0InspirationRune",
            "text": "gain#manaperenemykilled",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    10
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0StoneRune",
            "text": "causes#%increasedstunbuildup",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    25
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0VisionRune",
            "text": "#toaccuracyrating",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    100
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofTacati",
            "text": "#%chancetopoisononhit",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    15
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofOpiloti",
            "text": "#%chancetocausebleedingonhit",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    15
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofJiquani",
            "text": "recover#%oflifeonkill",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    2
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofZalatl",
            "text": "recover#%ofmanaonkill",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    2
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofCitaqualotl",
            "text": "#%increasedelementaldamagewithattacks",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    30
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofPuhuarte",
            "text": "#%increasedchancetoignite",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    30
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofTzamoto",
            "text": "#%increasedfreezebuildup",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    20
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofXopec",
            "text": "#%increasedchancetoshock",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    30
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofAzcapa",
            "text": "#tospirit",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    15
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofTopotante",
            "text": "attackswiththisweaponpenetrate#%elementalresistances",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    15
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofQuipolatl",
            "text": "#%increasedattackspeed",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    5
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofTicaba",
            "text": "#%tocriticaldamagebonus",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    12
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofAtmohua",
            "text": "convert#%ofrequirementstostrength",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    20
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofCholotl",
            "text": "convert#%ofrequirementstodexterity",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    20
                ]
            ]
        },
        {
            "dataTarget": "collapseOnesocketable0SoulCoreofZantipi",
            "text": "convert#%ofrequirementstointelligence",
            "tiers": [
                1
            ],
            "modValues": [
                [
                    20
                ]
            ]
        }
    ]
}
 */
// apply styles based on match count:
//   - if element is being matched just once and the same element is not matched again apply: 'border', `2px solid ${borderColor}`, 'important'
//   - if element is matched multiple times apply same style only orange border
//   - add values in brackets same as example function does
//
// This is an example function that is doing that but it was setting up orange boreders incorrectly:
const applyStylesBasedOnAmbiguity = (affixData, ambiguousData) => {
    affixData.forEach(affix => {
        // Find all elements that match the current affix's dataTarget
        let targetElements = document.querySelectorAll(`[data-bs-target="#${affix.dataTarget}"]`);

        if (targetElements.length > 0) {
            // Check if this affix is ambiguous based on ambiguousData
            const isAmbiguous = Object.values(ambiguousData).some(targets =>
                targets.includes(affix.dataTarget)
            );
            const borderColor = isAmbiguous ? 'orange' : 'green';
            const textColor = borderColor;

            targetElements.forEach(targetElement => {
                // Apply the border style
                targetElement.style.setProperty('border', `2px solid ${borderColor}`, 'important');

                // Find or create a span to display the values
                let valueSpan = targetElement.querySelector('.affix-values');
                if (!valueSpan) {
                    valueSpan = document.createElement('span');
                    valueSpan.className = 'affix-values';
                    valueSpan.style.marginLeft = '5px';
                    targetElement.appendChild(valueSpan);
                }

                // Set the text color and display the values
                valueSpan.style.color = textColor;
                if (affix.matchedAffix && affix.matchedAffix.values) {
                    valueSpan.textContent = ` [${affix.matchedAffix.values.join(', ')}]`;
                } else {
                    valueSpan.textContent = '';
                }
            });
        } else {
            console.log('Target element not found for data-bs-target:', affix.dataTarget);
        }
    });
};

applyStylesBasedOnAmbiguity(affixData, multipleMatches);
