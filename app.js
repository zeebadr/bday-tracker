// Supabase Configuration
const supabaseUrl = "https://tgpliyjqqndrrtsyhkno.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRncGxpeWpxcW5kcnJ0c3loa25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NzEzMjAsImV4cCI6MjA2OTQ0NzMyMH0.jvUqfCVbz8tH53VOahkrBMPjvzmv0ygSWxGiWpw4S2Q";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize components
    initTheme();
    createStars();
    setupRealtime();
    
    // Load existing birthdays
    await displayBirthdays();
    
    // Setup form submission
    document.getElementById('birthday-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const birthdate = document.getElementById('birthdate').value;
        
        if (!name || !birthdate) {
            alert("Please fill in all fields");
            return;
        }
        
        try {
            const { error } = await supabase
                .from('birthdays')
                .insert([{ name, birthdate }]);
            
            if (error) throw error;
            
            showHoroscope(birthdate);
            document.getElementById('birthday-form').reset();
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to save. Please try again.");
        }
    });
    
    // Setup view birthdays button
    document.getElementById('show-birthdays').addEventListener('click', () => {
        document.getElementById('birthdays-list').style.display = 'block';
    });
});

// THEME MANAGEMENT
function initTheme() {
    const savedColor = localStorage.getItem('neonColor') || 'turquoise';
    setThemeColor(savedColor);
    
    document.querySelectorAll('.theme-color').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            setThemeColor(color);
            localStorage.setItem('neonColor', color);
        });
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
    
    // Update active button style
    document.querySelectorAll('.theme-color').forEach(btn => {
        const btnColor = btn.getAttribute('data-color');
        btn.style.transform = btnColor === color ? 'scale(1.2)' : 'scale(1)';
        btn.style.boxShadow = btnColor === color ? '0 0 10px white' : 'none';
    });
}

// STARS BACKGROUND
function createStars() {
    const container = document.querySelector('.stars-container');
    container.innerHTML = '';
    
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
            width: ${Math.random() * 3}px;
            height: ${Math.random() * 3}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(star);
    }
}

// HOROSCOPE LOGIC
function getHoroscope(date) {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    
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

function showHoroscope(date) {
    const { sign, emoji } = getHoroscope(date);
    document.getElementById('horoscope-text').textContent = `${emoji} ${sign} ${emoji}`;
    document.getElementById('horoscope-result').style.display = 'block';
}

// BIRTHDAY OPERATIONS
async function displayBirthdays() {
    try {
        const { data, error } = await supabase
            .from('birthdays')
            .select('*')
            .order('birthdate', { ascending: true });
        
        if (error) throw error;
        
        const list = document.getElementById('birthdays-ul');
        list.innerHTML = data.length 
            ? data.map(b => `<li>${b.name} - ${new Date(b.birthdate).toLocaleDateString()}</li>`).join('')
            : '<li>No birthdays yet</li>';
    } catch (error) {
        console.error("Failed to load birthdays:", error);
    }
}

function setupRealtime() {
    supabase
        .channel('birthday-changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'birthdays'
        }, () => displayBirthdays())
        .subscribe();
}
