const maskedNumbersInAffixes = JSON.parse(decodeURIComponent(`{{maskedNumbersInAffixes}}`));
console.log(maskedNumbersInAffixes);

const elements = document.querySelectorAll('.background-image.item-popup--poe2');
for (let i = 0; i < elements.length; i++) {
    if (window.getComputedStyle(elements[i]).backgroundImage !== 'none') {
        elements[i].style.backgroundImage = 'none';
        break; // Exit loop after first match
    }
}


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
