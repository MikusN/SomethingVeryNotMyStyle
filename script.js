let users = JSON.parse(localStorage.getItem('users')) || [];
let userIdCounter = JSON.parse(localStorage.getItem('userIdCounter')) || 1;

let editingUserId = null;

// Select the button and body element
const barrelRollBtn = document.getElementById('barrelRollBtn');
const body = document.body;
const celebrateDiv = document.getElementById('celebrateDiv');
var spintotheleft = 1
// Function to trigger the barrel roll animation
barrelRollBtn.addEventListener('click', function() {
    if (spintotheleft == 1){
      spintotheleft = 3
      // Add the class to trigger the animation
      body.classList.add('barrel-rolling');
    }else{
      spintotheleft = 1
      body.classList.add('barrel-rolling2');
    }
    

    // Remove the class after the animation ends to allow re-triggering
    body.addEventListener('animationend', function() {
        body.classList.remove('barrel-rolling');
        body.classList.remove('barrel-rolling2');
    });

});

// Function to trigger confetti inside celebrateDiv
function triggerConfetti() {
    const confettiCount = 50; // Reduced the number of confetti pieces
    const colors = ['#ff0', '#f00', '#00f', '#0f0', '#ff69b4']; // Confetti colors

    // Generate confetti particles
    for (let i = 0; i < confettiCount; i++) {
        // Create a div for each confetti piece
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Randomize size, position, and animation duration
        confetti.style.width = `${Math.random() * 15 + 10}px`; // Random size between 10px and 25px
        confetti.style.height = confetti.style.width; // Make the confetti square
        confetti.style.left = `${Math.random() * 100}%`; // Random horizontal start position
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`; // Random animation duration between 2s and 5s
        confetti.style.animationDelay = `${Math.random() * 2}s`; // Random delay for staggered effect

        // Append the confetti element to the celebrateDiv
        celebrateDiv.appendChild(confetti);
    }
}

// Coordinates for Cēsis, Latvia
const latitude = 57.3145;
const longitude = 25.4333;

const weatherDiv = document.getElementById('weatherDiv');

// Function to fetch weather data from Open-Meteo API
function getWeather() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Europe/Riga`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const temperature = data.current_weather.temperature;  // Current temperature in Celsius
            const weatherCondition = data.current_weather.weathercode;  // Weather condition code
            const weatherDescriptions = {
                0: "Clear sky",
                1: "Mainly clear",
                2: "Partly cloudy",
                3: "Overcast",
                45: "Fog",
                48: "Depositing rime fog",
                51: "Light drizzle",
                53: "Moderate drizzle",
                55: "Heavy drizzle",
                56: "Light freezing drizzle",
                57: "Heavy freezing drizzle",
                61: "Light rain",
                63: "Moderate rain",
                65: "Heavy rain",
                66: "Light freezing rain",
                67: "Heavy freezing rain",
                71: "Light snow",
                73: "Moderate snow",
                75: "Heavy snow",
                77: "Snow grains",
                80: "Light rain showers",
                81: "Moderate rain showers",
                82: "Heavy rain showers",
                85: "Light snow showers",
                86: "Heavy snow showers",
                95: "Thunderstorm",
                96: "Thunderstorm with light hail",
                99: "Thunderstorm with heavy hail"
            };

            // Get the weather description from the code
            const weatherDescription = weatherDescriptions[weatherCondition] || "Unknown";

            // Update the weatherDiv with the current weather info
            const weatherInfo = `Weather in Cēsis: ${weatherDescription}, ${temperature}°C`;
            weatherDiv.textContent = weatherInfo;
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            weatherDiv.textContent = "Failed to load weather data.";
        });
}

// Call the function to get weather data
getWeather();

// Trigger confetti in celebrateDiv
triggerConfetti();


// Get elements
const inputForm = document.getElementById('inputForm');
const editForm = document.getElementById('editForm');
const deleteForm = document.getElementById('deleteForm');
const userList = document.getElementById('userList');
const editUserSelect = document.getElementById('editUser');
const deleteUserSelect = document.getElementById('deleteUser');

// Input form submit handler
inputForm.addEventListener('submit', function(e){
    e.preventDefault();

    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const phone = phoneInput.value;
    const personalCode = personalCodeInput.value;

    if(editingUserId === null){
        users.push({
            id: userIdCounter++,
            firstName,
            lastName,
            phone,
            personalCode
        });
    } else {
        const user = users.find(u => u.id === editingUserId);
        if(!user){
            alert("Rediģējamais lietotājs vairs neeksistē!");
            editingUserId = null;
            inputForm.reset();
            return;
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;
        user.personalCode = personalCode;

        editingUserId = null;
    }

    saveToDatabase();
    updateUserList();
    inputForm.reset();
});



// Edit form submit handler
editForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const userId = Number(editUserSelect.value); // 🔑 Number() vietā parseInt
    if (isNaN(userId)) {
        alert("Izvēlies lietotāju!");
        return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
        alert("Lietotājs nav atrasts!");
        return;
    }

    // Ielādē input laukos
    firstNameInput.value = user.firstName;
    lastNameInput.value = user.lastName;
    phoneInput.value = user.phone;
    personalCodeInput.value = user.personalCode;

    editingUserId = user.id; // 🔑 šis ir svarīgi
});



// Delete form submit handler
deleteForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const userId = Number(deleteUserSelect.value); // 🔑 Number() vietā parseInt
    if (isNaN(userId)) {
        alert("Izvēlies lietotāju dzēšanai!");
        return;
    }

    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
        alert("Lietotājs nav atrasts!");
        return;
    }

    // Ja dzēšam lietotāju, ko šobrīd rediģējam
    if (editingUserId === userId) {
        editingUserId = null;
        inputForm.reset();
    }

    users.splice(index, 1);      // 🔑 dzēšana masīvā
    saveToDatabase();            // 🔑 saglabā izmaiņas localStorage
    updateUserList();            // 🔑 atjauno select izvēlnes
    deleteForm.reset();

    alert("Lietotājs dzēsts!");
});


// Function to update the user list and dropdowns (for both edit and delete)

function updateUserList() {
  editUserSelect.innerHTML = '<option value="">Izvēlieties lietotāju</option>';
deleteUserSelect.innerHTML = '<option value="">Izvēlieties lietotāju</option>';

users.forEach(user => {
    const editOption = document.createElement('option');
    editOption.value = user.id; // 🔑 number, ne string
    editOption.textContent = `${user.firstName} ${user.lastName}`;
    editUserSelect.appendChild(editOption);

    const deleteOption = document.createElement('option');
    deleteOption.value = user.id;
    deleteOption.textContent = `${user.firstName} ${user.lastName}`;
    deleteUserSelect.appendChild(deleteOption);
});


}

const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const phoneInput = document.getElementById('phone');

function onlyLetters(input) {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^A-Za-zĀ-ž\s]/g, '');
    });
}

onlyLetters(firstNameInput);
onlyLetters(lastNameInput);

const personalCodeInput = document.getElementById('personalCode');

personalCodeInput.addEventListener('input', () => {
    let value = personalCodeInput.value.replace(/\D/g, ''); // tikai cipari
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 6) value = value.slice(0, 6) + '-' + value.slice(6);
    personalCodeInput.value = value;
});

phoneInput.addEventListener('input', () => {
    let value = phoneInput.value.replace(/\D/g, ''); // tikai cipari
    if (value.length == 10) {
        value = value.slice(0, 10);
        phoneInput.value = '+' + value;
    }
});


function saveToDatabase() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('userIdCounter', JSON.stringify(userIdCounter));
}

// Funkcija, kas aizliedz rakstīt atstarpes
function noSpaces(input) {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/\s/g, '');
    });
}

// Pievieno visiem nepieciešamajiem input laukiem
noSpaces(firstNameInput);
noSpaces(lastNameInput);
noSpaces(phoneInput);
noSpaces(personalCodeInput);


    updateUserList();
    saveToDatabase();
    
    console.log(editingUserId, users);