// Replace Firebase with PHP fetch()
async function addBirthday(name, birthdate) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('birthdate', birthdate);

    try {
        const response = await fetch('save_birthday.php', {
            method: 'POST',
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        return { success: false };
    }
}

async function getBirthdays() {
    try {
        const response = await fetch('get_birthdays.php');
        if (!response.ok) throw new Error("Failed to fetch birthdays");
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

// Theme Management
function initTheme() {
    const savedColor = localStorage.getItem('neonColor') || 'turquoise';
    setThemeColor(savedColor);
    
    document.querySelectorAll('.theme-color').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            setThemeColor(color);
            localStorage.setItem('neonColor', color);
        });
        
        if (btn.getAttribute('data-color') === savedColor) {
            btn.style.transform = 'scale(1.2)';
            btn.style.boxShadow = '0 0 10px white';
        }
    });
}

function setThemeColor(color) {
    const colors = {
        lime: '#0fa',
        turquoise: '#0ff',
        fuchsia: '#f0f',
        yellow: '#ff0',
        silver: '#ccc'
    };
    
    document.documentElement.style.setProperty('--neon-color', colors[color]);
    
    document.querySelectorAll('.theme-color').forEach(btn => {
        const btnColor = btn.getAttribute('data-color');
        btn.style.transform = btnColor === color ? 'scale(1.2)' : 'scale(1)';
        btn.style.boxShadow = btnColor === color ? '0 0 10px white' : 'none';
    });
}

// Stars Background
function createStars() {
    const starsContainer = document.querySelector('.stars-container');
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 60 : 100;
    
    starsContainer.innerHTML = '';
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        const size = isMobile ? (Math.random() * 1.5 + 0.5) : (Math.random() * 2 + 1);
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        
        starsContainer.appendChild(star);
    }
}

// Get Horoscope
function getHoroscope(birthdate) {
    const date = new Date(birthdate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: "Aquarius", emoji: "♒" };
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { sign: "Pisces", emoji: "♓" };
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: "Aries", emoji: "♈" };
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: "Taurus", emoji: "♉" };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: "Gemini", emoji: "♊" };
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: "Cancer", emoji: "♋" };
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: "Leo", emoji: "♌" };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: "Virgo", emoji: "♍" };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: "Libra", emoji: "♎" };
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: "Scorpio", emoji: "♏" };
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: "Sagittarius", emoji: "♐" };
    return { sign: "Capricorn", emoji: "♑" };
}

// Display Birthdays
async function displayBirthdays() {
    const birthdays = await getBirthdays();
    const listElement = document.getElementById('birthdays-ul');
    
    listElement.innerHTML = birthdays.length > 0 
        ? birthdays.map(bday => `<li>${bday.name} - ${formatDate(bday.birthdate)}</li>`).join('')
        : '<li>No birthdays saved yet</li>';
    
    document.getElementById('birthdays-list').style.display = 'block';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    createStars();
    window.addEventListener('resize', createStars);
    
    // Form Submission
    const form = document.getElementById('birthday-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const birthdate = document.getElementById('birthdate').value;
        
        if (name && birthdate) {
            const result = await addBirthday(name, birthdate);
            
            if (result.success) {
                const horoscope = getHoroscope(birthdate);
                document.getElementById('horoscope-text').textContent = 
                    `${horoscope.emoji} You're a ${horoscope.sign}! ${horoscope.emoji}`;
                document.getElementById('horoscope-result').style.display = 'block';
                form.reset();
            }
        }
    });
    
    // View Birthdays Button
    document.getElementById('show-birthdays').addEventListener('click', displayBirthdays);
});