const ipDisplay = document.getElementById('ip-display');
const ipDisplay2 = document.getElementById('ip-display-2');
const latDisplay = document.getElementById('lat');
const lonDisplay = document.getElementById('lon');
const cityDisplay = document.getElementById('city');
const regionDisplay = document.getElementById('region');
const orgDisplay = document.getElementById('org');
const hostnameDisplay = document.getElementById('hostname');
const timezoneDisplay = document.getElementById('timezone');
const timeDisplay = document.getElementById('time');
const pincodeDisplay = document.getElementById('pincode');
const messageDisplay = document.getElementById('message');
const mapFrame = document.getElementById('map');
const postOfficesContainer = document.getElementById('post-offices');
const searchInput = document.getElementById('search');
const infoPanel = document.getElementById('info-panel');
let allPostOffices = [];

window.addEventListener("load", async () => {
  const ip = await getIPAddress();
  ipDisplay.textContent = ip;
});

async function getIPAddress() {
  const res = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();
  return data.ip;
}

async function getUserDetails(ip) {
  const res = await fetch(`https://ipapi.co/${ip}/json/`);
  const data = await res.json();
  return data;
}

async function fetchPostOffices(pincode) {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
  const data = await res.json();
  return data[0];
}

function updateMap(lat, lon) {
  mapFrame.src = `https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
}

function showTimeInTimezone(timezone) {
  const now = new Date().toLocaleString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  timeDisplay.textContent = now;
}

function displayPostOffices(postOffices) {
  postOfficesContainer.innerHTML = '';
  postOffices.forEach((office) => {
    const card = document.createElement('div');
    card.className = 'post-office-card';
    card.innerHTML = `
      <strong>${office.Name}</strong>
      Branch Type: ${office.BranchType}<br>
      Delivery Status: ${office.DeliveryStatus}<br>
      District: ${office.District}<br>
      Division: ${office.Division}
    `;
    postOfficesContainer.appendChild(card);
  });
}

function filterPostOffices(query) {
  const filtered = allPostOffices.filter(po =>
    po.Name.toLowerCase().includes(query) ||
    po.BranchType.toLowerCase().includes(query)
  );
  displayPostOffices(filtered);
}

document.getElementById('get-started').addEventListener('click', async () => {
  try {
    const ip = await getIPAddress();
    ipDisplay.textContent = ip;
    ipDisplay2.textContent = ip;

    const user = await getUserDetails(ip);
    const { latitude, longitude, city, region, org, postal, timezone } = user;

    latDisplay.textContent = latitude;
    lonDisplay.textContent = longitude;
    cityDisplay.textContent = city;
    regionDisplay.textContent = region;
    orgDisplay.textContent = org;
    hostnameDisplay.textContent = user.hostname || 'N/A';
    timezoneDisplay.textContent = timezone;
    pincodeDisplay.textContent = postal;

    updateMap(latitude, longitude);
    showTimeInTimezone(timezone);

    const postalData = await fetchPostOffices(postal);
    messageDisplay.textContent = postalData.Message;
    allPostOffices = postalData.PostOffice || [];
    displayPostOffices(allPostOffices);

    infoPanel.classList.remove('hidden');
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong while fetching data.');
  }
});

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  filterPostOffices(query);
});
