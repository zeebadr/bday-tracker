// Supabase Configuration
const supabaseUrl = "https://tgpliyjqqndrrtsyhkno.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRncGxpeWpxcW5kcnJ0c3loa25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NzEzMjAsImV4cCI6MjA2OTQ0NzMyMH0.jvUqfCVbz8tH53VOahkrBMPjvzmv0ygSWxGiWpw4S2Q";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ==================== THEME MANAGEMENT ====================
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
}

// ==================== STARS BACKGROUND ====================
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

// ==================== HOROSCOPE LOGIC ====================
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

// ==================== BIRTHDAY OPERATIONS ====================
async function addBirthday(name, birthdate) {
    const { error } = await supabase
        .from('birthdays')
        .insert([{ name, birthdate }]);
    
    if (error) {
        console.error("Error saving birthday:", error);
        alert("Failed to save birthday. Please try again.");
        return false;
    }
    return true;
}

async function getBirthdays() {
    const { data, error } = await supabase
        .from('birthdays')
        .select('*')
        .order('birthdate', { ascending: true });
    
    if (error) {
        console.error("Error loading birthdays:", error);
        return [];
    }
    
    // Adjust for upcoming birthdays
    const now = new Date();
    return data.map(bday => {
        const date = new Date(bday.birthdate);
        date.setFullYear(now.getFullYear());
        if (date < now) date.setFullYear(now.getFullYear() + 1);
        return { ...bday, sortDate: date };
    }).sort((a, b) => a.sortDate - b.sortDate);
}

// ==================== UI FUNCTIONS ====================
async function displayBirthdays() {
    const birthdays = await getBirthdays();
    const listElement = document.getElementById('birthdays-ul');
    
    listElement.innerHTML = birthdays.length > 0 
        ? birthdays.map(bday => `
            <li>
                <span class="name">${bday.name}</span>
                <span class="date">${formatDate(bday.birthdate)}</span>
            </li>
          `).join('')
        : '<li class="empty">No birthdays saved yet</li>';
    
    document.getElementById('birthdays-list').style.display = 'block';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
    });
}

function showHoroscope(birthdate) {
    const { sign, emoji } = getHoroscope(birthdate);
    document.getElementById('horoscope-text').textContent = 
        `${emoji} You're a ${sign}! ${emoji}`;
    document.getElementById('horoscope-result').style.display = 'block';
}

// ==================== REALTIME UPDATES ====================
function setupRealtime() {
    supabase
        .channel('birthday-changes')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'birthdays'
        }, (payload) => {
            const list = document.getElementById('birthdays-ul');
            const newItem = document.createElement('li');
            newItem.innerHTML = `
                <span class="name">${payload.new.name}</span>
                <span class="date">${formatDate(payload.new.birthdate)}</span>
            `;
            list.appendChild(newItem);
        })
        .subscribe();
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    createStars();
    window.addEventListener('resize', createStars);
    setupRealtime();
    
    // Form submission
    document.getElementById('birthday-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const birthdate = document.getElementById('birthdate').value;
        
        if (name && birthdate) {
            const success = await addBirthday(name, birthdate);
            if (success) {
                showHoroscope(birthdate);
                e.target.reset();
            }
        }
    });
    
    // View birthdays button
    document.getElementById('show-birthdays').addEventListener('click', displayBirthdays);
    
    // Floating labels
    document.querySelectorAll('.form-group input').forEach(input => {
        input.addEventListener('focus', () => 
            input.parentElement.classList.add('focused'));
        input.addEventListener('blur', () => 
            !input.value && input.parentElement.classList.remove('focused'));
    });
});