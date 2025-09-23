// داتای نموونەیی
let cars = JSON.parse(localStorage.getItem('cars')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let balance = parseFloat(localStorage.getItem('balance')) || 0;

// داتای نموونەیی ئەگەر بەتاڵ بێت
if (cars.length === 0) {
    cars = [
        {
            id: 1,
            brand: "تۆیۆتا",
            model: "کامری",
            year: 2023,
            price: 85000,
            vin: "4T1G11AK7PU123147",
            status: "available",
            image: null
        },
        {
            id: 2,
            brand: "نیسان",
            model: "ئەلتیما",
            year: 2024,
            price: 75000,
            vin: "1N4BL4CVXRN393350",
            status: "sold",
            image: null
        }
    ];
    saveData();
}

// فەنکشنەکانی بەڕێوەبردنی داتا
function saveData() {
    localStorage.setItem('cars', JSON.stringify(cars));
    localStorage.setItem('payments', JSON.stringify(payments));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('balance', balance.toString());
}

function updateBalance() {
    document.getElementById('currentBalance').textContent = balance.toLocaleString() + ' درهم';
}

// فەنکشنی نمایشکردنی ئۆتۆمبێلەکان
function displayCars(filteredCars = cars) {
    const tbody = document.getElementById('carsTableBody');
    tbody.innerHTML = '';

    if (filteredCars.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">هیچ ئۆتۆمبێلێک نەدۆزرایەوە</td></tr>';
        return;
    }

    filteredCars.forEach(car => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${car.image ? '<img src="' + car.image + '" width="50">' : '🖼️'}</td>
            <td>${car.brand}</td>
            <td>${car.model}</td>
            <td>${car.year}</td>
            <td>${car.vin}</td>
            <td>${car.price.toLocaleString()} درهم</td>
            <td><span class="status-${car.status}">${getStatusText(car.status)}</span></td>
            <td>
                <button class="btn-small" onclick="editCar(${car.id})">دەستکاری</button>
                <button class="btn-small btn-danger" onclick="deleteCar(${car.id})">سڕینەوە</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusText(status) {
    const statusMap = {
        'available': 'بەردەست',
        'sold': 'فرۆشراو',
        'shipping': 'لە شێواندایە'
    };
    return statusMap[status] || status;
}

// فەنکشنی زیادکردنی ئۆتۆمبێل
function addCar(event) {
    event.preventDefault();
    
    const newCar = {
        id: Date.now(),
        brand: document.getElementById('carBrand').value,
        model: document.getElementById('carModel').value,
        year: parseInt(document.getElementById('carYear').value),
        price: parseFloat(document.getElementById('carPrice').value),
        vin: document.getElementById('carVIN').value,
        status: 'available',
        image: null
    };

    cars.push(newCar);
    saveData();
    displayCars();
    closeModal();
    
    // زیادکردنی چالاکی
    addActivity(`ئۆتۆمبێلی ${newCar.brand} ${newCar.model} زیادکرا`);
}

// فەنکشنی بەڕێوەبردنی پارەدانەکان
function addPayment(event) {
    event.preventDefault();
    
    const payment = {
        id: Date.now(),
        type: document.getElementById('paymentType').value,
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value,
        date: document.getElementById('paymentDate').value
    };

    payments.push(payment);
    
    // نوێکردنەوەی باڵانس
    if (payment.type === 'income') {
        balance += payment.amount;
    } else {
        balance -= payment.amount;
    }
    
    saveData();
    displayPayments();
    updateBalance();
    document.getElementById('paymentForm').reset();
    
    addActivity(`پارەدانێکی نوێ تۆمارکرا: ${payment.description}`);
}

function displayPayments() {
    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = '';

    payments.slice().reverse().forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.date}</td>
            <td>${getPaymentTypeText(payment.type)}</td>
            <td>${payment.description}</td>
            <td class="${payment.type === 'income' ? 'text-success' : 'text-danger'}">
                ${payment.type === 'income' ? '+' : '-'}${payment.amount.toLocaleString()} درهم
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getPaymentTypeText(type) {
    const typeMap = {
        'shipping': 'شێوان',
        'purchase': 'کڕین',
        'expense': 'خەرجی',
        'income': 'داهات'
    };
    return typeMap[type] || type;
}

// فەنکشنی نمایشکردنی چالاکیەکان
function displayRecentActivities() {
    const container = document.getElementById('recentActivities');
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    
    if (activities.length === 0) {
        container.innerHTML = '<p>هیچ چالاکیەک تۆمارنەکراوە</p>';
        return;
    }

    container.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <span>${activity.text}</span>
            <small>${activity.time}</small>
        </div>
    `).join('');
}

function addActivity(text) {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift({
        text: text,
        time: new Date().toLocaleString('ku')
    });
    
    // پاراستنی تەنها 50 چالاکیی دوایین
    if (activities.length > 50) {
        activities.splice(50);
    }
    
    localStorage.setItem('activities', JSON.stringify(activities));
    displayRecentActivities();
}

// فەنکشنی ئامارەکان
function updateStats() {
    const totalCars = cars.length;
    const soldCars = cars.filter(car => car.status === 'sold').length;
    const availableCars = cars.filter(car => car.status === 'available').length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

    document.getElementById('totalCars').textContent = totalCars;
    document.getElementById('soldCars').textContent = soldCars;
    document.getElementById('availableCars').textContent = availableCars;
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString() + ' درهم';
}

// فەنکشنی گەڕان و فیلتەر
function setupSearchAndFilter() {
    const searchInput = document.getElementById('carSearch');
    const statusFilter = document.getElementById('statusFilter');

    function filterCars() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        let filtered = cars.filter(car => {
            const matchesSearch = car.brand.toLowerCase().includes(searchTerm) ||
                                car.model.toLowerCase().includes(searchTerm) ||
                                car.vin.toLowerCase().includes(searchTerm);
            const matchesStatus = statusValue === 'all' || car.status === statusValue;
            
            return matchesSearch && matchesStatus;
        });

        displayCars(filtered);
    }

    searchInput.addEventListener('input', filterCars);
    statusFilter.addEventListener('change', filterCars);
}

// فەنکشنی مۆدال
function setupModal() {
    const modal = document.getElementById('carModal');
    const addBtn = document.getElementById('addCarBtn');
    const closeBtn = document.querySelector('.close');

    addBtn.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => closeModal();

    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    }
}

function closeModal() {
    document.getElementById('carModal').style.display = 'none';
    document.getElementById('carForm').reset();
}

// فەنکشنی ناوەڕۆکی ناوەکی
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // لابردنی چالاکی لە هەموو پەڕەکان
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // زیادکردنی چالاکی بۆ پەڕەی هەڵبژێردراو
            link.classList.add('active');
            document.getElementById(link.dataset.section).classList.add('active');
        });
    });
}

// دەستپێکردنی سیستەمەکە
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    setupModal();
    setupSearchAndFilter();
    
    // ڕێکخستنی فۆرمەکان
    document.getElementById('carForm').addEventListener('submit', addCar);
    document.getElementById('paymentForm').addEventListener('submit', addPayment);
    
    // دانانی بەرواری ئەمرۆ بۆ فۆرمی پارەدان
    document.getElementById('paymentDate').valueAsDate = new Date();
    
    // نمایشکردنی داتاکانی سەرەتایی
    displayCars();
    displayPayments();
    displayRecentActivities();
    updateStats();
    updateBalance();
    
    // زیادکردنی چالاکیی سەرەتایی
    addActivity('سیستەمەکە کرایەوە');
});

// فەنکشنەکانی دەستکاری و سڕینەوە
function editCar(id) {
    const car = cars.find(c => c.id === id);
    if (car) {
        document.getElementById('carBrand').value = car.brand;
        document.getElementById('carModel').value = car.model;
        document.getElementById('carYear').value = car.year;
        document.getElementById('carPrice').value = car.price;
        document.getElementById('carVIN').value = car.vin;
        
        document.getElementById('carModal').style.display = 'block';
        // لێرەدا دەتوانیت فەنکشنێکی تایبەت بۆ دەستکاری دروست بکەیت
    }
}

function deleteCar(id) {
    if (confirm('دڵنیای لە سڕینەوەی ئەم ئۆتۆمبێلە؟')) {
        cars = cars.filter(c => c.id !== id);
        saveData();
        displayCars();
        addActivity('ئۆتۆمبێلێک سڕدرایەوە');
    }
}

// فەنکشنی گرافەکان (بەکاردێت کە چارت.js زیاد بکرێت)
function initializeCharts() {
    // ئەمە شوێنێکی پلاستە بۆ گرافەکان
    console.log('گرافەکان ئامادەکران...');
}