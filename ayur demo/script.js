function fetchData() {
    return new Promise((resolve, reject) => {
        fetch('data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => resolve(data))
            .catch(error => reject(error));
    });
}

function showAutocompleteDropdown(suggestions) {
    const autocompleteDropdown = document.getElementById('autocompleteDropdown');
    autocompleteDropdown.innerHTML = ""; 

    suggestions.forEach(suggestion => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.textContent = suggestion;
        suggestionDiv.classList.add('autocomplete-item');
        autocompleteDropdown.appendChild(suggestionDiv);
    });

    autocompleteDropdown.addEventListener('click', function(event) {
        if (event.target.classList.contains('autocomplete-item')) {
            const inputField = document.getElementById('medicineInput');
            const currentValue = inputField.value;
            const lastCommaIndex = currentValue.lastIndexOf(',');
            const newValue = currentValue.substring(0, lastCommaIndex + 1) + event.target.textContent;
            inputField.value = newValue;
            autocompleteDropdown.innerHTML = ""; 
        }
    });

    autocompleteDropdown.style.display = 'block';
}

function positionAutocompleteDropdown() {
    const inputField = document.getElementById('medicineInput');
    const autocompleteDropdown = document.getElementById('autocompleteDropdown');
    const rect = inputField.getBoundingClientRect();

    autocompleteDropdown.style.top = rect.bottom + 'px';
    autocompleteDropdown.style.left = rect.left + 'px';
}

function searchMedicine(indications, data) {
    return data.filter(medicine => {
        const medicineIndications = medicine.indications.map(indication => indication.toLowerCase());
        return indications.every(indication => medicineIndications.includes(indication.trim().toLowerCase()));
    });
}

document.getElementById('medicineInput').addEventListener('input', function(event) {
    const userInput = document.getElementById('medicineInput').value;
    const lastCommaIndex = userInput.lastIndexOf(',');
    const currentIndication = userInput.substring(lastCommaIndex + 1).trim();

    fetchData()
        .then(data => {
            const indications = currentIndication.split(',');
            const lastIndication = indications[indications.length - 1].trim().toLowerCase();
            const autocompleteSuggestions = data.reduce((suggestions, medicine) => {
                const medicineIndications = medicine.indications.map(indication => indication.toLowerCase());
                medicineIndications.forEach(indication => {
                    if (indication.startsWith(lastIndication) && !suggestions.includes(indication)) {
                        suggestions.push(indication);
                    }
                });
                return suggestions;
            }, []);

            showAutocompleteDropdown(autocompleteSuggestions);
            positionAutocompleteDropdown();
        })
        .catch(error => {
            console.error('Error fetching or processing data:', error);
        });
});

document.getElementById('medicineInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const userInput = document.getElementById('medicineInput').value;
        const indications = userInput.split(',').map(indication => indication.trim().toLowerCase());

        fetchData()
            .then(data => {
                const searchResults = searchMedicine(indications, data);
                const resultsTableBody = document.getElementById('searchResults').getElementsByTagName('tbody')[0];
                resultsTableBody.innerHTML = ""; 

                searchResults.forEach(medicine => {
                    const row = resultsTableBody.insertRow();
                    const cells = [medicine.medicine, medicine.indications.join(", "), medicine.dosage, medicine.precaution, medicine.category];
                    cells.forEach(cellText => {
                        const cell = row.insertCell();
                        cell.textContent = cellText;
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching or processing data:', error);
            });
    }
});



document.addEventListener('click', function(event) {
    const autocompleteDropdown = document.getElementById('autocompleteDropdown');
    if (event.target !== document.getElementById('medicineInput') && event.target !== autocompleteDropdown) {
        autocompleteDropdown.style.display = 'none';
    }
});
