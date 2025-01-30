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

    // Loop through each section and extract mod data
    document.querySelectorAll('.col-lg-6').forEach(section => {
        const category = section.querySelector('.identify-title')?.textContent.trim();
        if (!category) return;

        modData[category] = [];

        // Loop through each mod in the section
        section.querySelectorAll('.mod-title').forEach(mod => {
            const dataTarget = mod.getAttribute('data-bs-target');

            // Extract and clean up the textContent of the mod
            let textContent = [...mod.childNodes]
                .filter(node => !node.classList || !node.classList.contains('float-end'))
                .map(node => node.textContent.trim())
                .join(' ');

            textContent = textContent.replace(/\s+/g, ' ').trim().toLowerCase();

            if (dataTarget && textContent) {
                // Remove the trailing # from dataTarget if present
                const cleanDataTarget = dataTarget.replace(/^#/, '');

                // Extract tier numbers and mod values if present in the corresponding div
                const tiers = [];
                const modValues = [];

                // Select the div with id matching the cleaned data-bs-target
                const targetDiv = document.getElementById(cleanDataTarget);
                if (targetDiv) {
                    // Find the first table inside the div
                    const table = targetDiv.querySelector('table');
                    if (table) {
                        // Loop through each row and extract the tier numbers (based on row order) and mod values
                        table.querySelectorAll('tr').forEach((row, index) => {
                            const tierNumber = index + 1; // Tier number is the row index + 1
                            const modValueText = row.querySelector('.mod-value') ? row.querySelector('.mod-value').textContent.trim() : null;

                            if (modValueText) {
                                // Parse the mod value range (e.g., +(11–32) -> [11, 32])
                                const match = modValueText.match(/\((\d+)–(\d+)\)/);
                                if (match) {
                                    modValues.push([parseInt(match[1]), parseInt(match[2])]);
                                    tiers.push(tierNumber); // Add tier number for each mod value
                                }
                            }
                        });
                    }
                }

                // Add the tiers and mod values to modData under the corresponding category
                modData[category].push({ 
                    dataTarget: cleanDataTarget, 
                    text: textContent, 
                    tiers: tiers.length > 0 ? tiers : null,  // Add tiers if found, otherwise null
                    modValues: modValues.length > 0 ? modValues : null  // Add mod values if found, otherwise null
                });
            }
        });
    });

    return modData;
}




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

const modData = extractModData();
console.log(modData);

const affixData = findMatchingAffixes(maskedNumbersInAffixes, modData);
console.log(affixData);


let targetCounts = {};

// Loop through each matching affix to count and store texts
affixData.forEach(affix => {
    let target = affix.dataTarget;
    let text = affix.matchedAffix.text;  // Assuming the text to track is stored here (adjust if necessary)

    // Initialize the object if it doesn't exist for this dataTarget
    if (!targetCounts[target]) {
        targetCounts[target] = { count: 0, texts: [] };
    }

    // Increment the count and push the matched text to the array
    targetCounts[target].count += 1;
    targetCounts[target].texts.push(text);
});

console.log(targetCounts);  // Log the counts and texts for debugging

// Apply styles based on match count
affixData.forEach(affix => {
    let targetElements = document.querySelectorAll(`[data-bs-target="${affix.dataTarget}"]`);

    if (targetElements.length > 0) {
        // console.log(`Found ${targetElements.length} elements for ${affix.dataTarget}`);

        // Retrieve the count and texts for this dataTarget
        let targetData = targetCounts[affix.dataTarget];
        let isMultipleMatches = targetData && targetData.count > 1;
        let borderColor = isMultipleMatches ? 'orange' : 'green';
        let textColor = borderColor;

        targetElements.forEach(targetElement => {
            targetElement.style.setProperty('border', `2px solid ${borderColor}`, 'important');
            // console.log(`Border applied (${borderColor}):`, targetElement.style.border);

            // Find or create the value display
            let valueSpan = targetElement.querySelector('.affix-values');
            if (!valueSpan) {
                valueSpan = document.createElement('span');
                valueSpan.className = 'affix-values';
                valueSpan.style.marginLeft = '5px';
                targetElement.appendChild(valueSpan);
            }

            // Set text color and update content based on multiple matches
            valueSpan.style.color = textColor;
            // Display values for single match
            valueSpan.textContent = ` [${affix.matchedAffix.values.join(', ')}]`;
        });
    } else {
        console.log('Target element not found for data-bs-target:', affix.dataTarget);
    }
});

// After initial styling, mark elements with the same text with a yellow border
Object.keys(targetCounts).forEach(target => {
    let targetData = targetCounts[target];

    if (targetData.count > 1) {
        targetData.texts.forEach(text => {
            // Find elements that have the matching text
            let matchingElements = document.querySelectorAll(`[data-bs-target="${target}"]`);
            
            matchingElements.forEach(targetElement => {
                // Check if this element contains the matching text
                let valueSpan = targetElement.querySelector('.affix-values');
                if (valueSpan && valueSpan.textContent.includes(text)) {
                    // Mark this element with a yellow border if it has matching text
                    targetElement.style.setProperty('border', '2px solid yellow', 'important');
                    console.log(`Yellow border applied to element with matching text:`, targetElement);
                }
            });
        });
    }
});
