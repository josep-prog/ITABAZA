import { baseURL, apiRequest, getAuthHeaders } from "./baseURL.js";

let docsCont = document.getElementById("doctors-cont");
let isLoading = false;
let doctorsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

let depObj = {
    1: "Neurology",
    2: "Dermatology", 
    3: "Dental",
    4: "Ayurveda",
    5: "Gastroenterology",
    6: "Gynaecology",
    7: "ENT",
    8: "General Physician",
    9: "Orthopedic",
    10: "Cardiology",
    // String versions
    "1": "Neurology",
    "2": "Dermatology", 
    "3": "Dental",
    "4": "Ayurveda",
    "5": "Gastroenterology",
    "6": "Gynaecology",
    "7": "ENT",
    "8": "General Physician",
    "9": "Orthopedic",
    "10": "Cardiology"
}

// Function to get department name with fallback
function getDepartmentName(departmentId) {
    if (!departmentId) return 'Unknown Department';
    
    // Handle the specific UUID department ID found in the database
    if (departmentId === 'dfae69ef-60b3-49eb-8d9c-76e682e1ebd3') {
        return 'Cardiology'; // Based on the qualifications showing "cardilogy"
    }
    
    // Try exact match first
    if (depObj[departmentId]) {
        return depObj[departmentId];
    }
    
    // Try converting to string if it's a number
    if (typeof departmentId === 'number') {
        const stringId = departmentId.toString();
        if (depObj[stringId]) {
            return depObj[stringId];
        }
    }
    
    // Try converting to number if it's a string
    if (typeof departmentId === 'string') {
        const numId = parseInt(departmentId);
        if (depObj[numId]) {
            return depObj[numId];
        }
    }
    
    return `Unknown Department (ID: ${departmentId})`;
}

// Function to validate and get safe image URL
function getSafeImageUrl(imageUrl) {
    const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RG9jdG9yPC90ZXh0Pgo8L3N2Zz4K';
    
    // If no image URL provided, return default
    if (!imageUrl || imageUrl.trim() === '') {
        return defaultImage;
    }
    
    // If it's already a data URL, return as is
    if (imageUrl.startsWith('data:')) {
        return imageUrl;
    }
    
    // Check for problematic URLs
    const problematicDomains = ['example.com', 'via.placeholder.com', 'pin.it'];
    const isProblematic = problematicDomains.some(domain => imageUrl.includes(domain));
    
    if (isProblematic) {
        return defaultImage;
    }
    
    // Return the original URL if it seems valid
    return imageUrl;
}

// Loading state management
function showLoading() {
    isLoading = true;
    docsCont.innerHTML = `
        <div class="loading-container" style="text-align: center; padding: 50px;">
            <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #0077c0; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="color: #666; font-size: 16px;">Loading doctors...</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
}

function hideLoading() {
    isLoading = false;
}

function showError(message) {
    docsCont.innerHTML = `
        <div class="error-container" style="text-align: center; padding: 50px;">
            <div style="color: #dc3545; font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h3 style="color: #dc3545; margin-bottom: 10px;">Oops! Something went wrong</h3>
            <p style="color: #666; margin-bottom: 20px;">${message}</p>
            <button onclick="location.reload()" style="background: #0077c0; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                Try Again
            </button>
        </div>
    `;
}

function showNoDoctors(message = "No doctors available at the moment.") {
    docsCont.innerHTML = `
        <div class="no-doctors-container" style="text-align: center; padding: 50px;">
            <div style="color: #6c757d; font-size: 48px; margin-bottom: 20px;">👨‍⚕️</div>
            <h3 style="color: #6c757d; margin-bottom: 10px;">No Doctors Found</h3>
            <p style="color: #666; margin-bottom: 20px;">${message}</p>
            <button onclick="getdata()" style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                Refresh
            </button>
        </div>
    `;
}

// Enhanced data fetching with caching and retry logic
async function getdata(retryCount = 0) {
    if (isLoading) return;
    
    const now = Date.now();
    
    // Use cached data if available and not expired
    if (doctorsCache && (now - lastFetchTime) < CACHE_DURATION) {
        renderdata(doctorsCache);
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${baseURL}/doctor/availableDoctors`, {
            method: 'GET',
            headers: getAuthHeaders(),
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.doctor || data.doctor.length === 0) {
            hideLoading();
            showNoDoctors("No available doctors found. Please check back later.");
            return;
        }
        
        // Cache the successful response
        doctorsCache = data.doctor;
        lastFetchTime = now;
        
        hideLoading();
        renderdata(data.doctor);
        
    } catch (error) {
        console.error('Error fetching doctors:', error);
        hideLoading();
        
        // Retry logic for network errors
        if (retryCount < 3 && (error.name === 'TypeError' || error.name === 'AbortError')) {
            console.log(`Retrying... Attempt ${retryCount + 1}`);
            setTimeout(() => getdata(retryCount + 1), 2000 * (retryCount + 1));
            return;
        }
        
        showError(`Failed to load doctors: ${error.message}. Please check your internet connection and try again.`);
    }
}

// Enhanced rendering with better error handling
function renderdata(arr) {
    if (!Array.isArray(arr) || arr.length === 0) {
        showNoDoctors();
        return;
    }
    
    docsCont.innerHTML = arr.map((elem, index) => {
        if (!elem || !elem.doctor_name) {
            console.warn('Invalid doctor data:', elem);
            return '';
        }
        
        const departmentName = getDepartmentName(elem.department_id);
        const statusColor = elem.status ? "color: #28a745" : "color: #dc3545";
        const statusText = elem.status ? "Available" : "Currently Unavailable";
        const isAvailable = elem.status && elem.is_available;
        
        return `
            <div class="doc-card" style="opacity: ${isAvailable ? '1' : '0.7'}">
                <div class="top-cont">
                    <div class="doc-profile">
                        <div class="doc-img">
                            <img alt="doc-pfp" 
                                 src="${getSafeImageUrl(elem.image)}" 
                                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RG9jdG9yPC90ZXh0Pgo8L3N2Zz4K';" />
                        </div>
                        <div class="doc-desc">
                            <h2>${elem.doctor_name}</h2>
                            <h4>Department: ${departmentName}</h4>
                            <p>Experience: ${elem.experience || 'Not specified'}</p>
                            <h4>Qualification: ${elem.qualifications || 'Not specified'}</h4>
                            <p style="color:white; display: none;">${elem._id || elem.id}</p>
                            <p>Rs.1,000 Consultation Fee</p>
                            <p style="${statusColor}">${statusText}</p>
                            ${!isAvailable ? '<p style="color: #ffc107; font-size: 12px;">This doctor is not accepting appointments at the moment</p>' : ''}
                        </div>
                    </div>
                    <div class="doc-book">
                        <div class="select-app">
                            <form ${!isAvailable ? 'style="pointer-events: none; opacity: 0.5;"' : ''}>
                                <div>
                                    <label>Select Date:</label>
                                    <select required="true" name="date" ${!isAvailable ? 'disabled' : ''}>
                                        <option value="APRIL_04">11-Apr-23</option>
                                        <option value="APRIL_05">12-Apr-23</option>
                                        <option value="APRIL_06">13-Apr-23</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Select Slot:</label>
                                    <select required="true" name="slot" ${!isAvailable ? 'disabled' : ''}>
                                        <option value="2-3">2PM to 3PM</option>
                                        <option value="4-5">4PM to 5PM</option>
                                        <option value="7-8">6PM to 7PM</option>
                                    </select>
                                </div>
                                <input type="submit" value="${isAvailable ? 'Book Appointment Now' : 'Not Available'}" 
                                       ${!isAvailable ? 'disabled' : ''}/>
                                <p style="color:green; margin-top:0.3rem; text-align:center">No Booking Fee<p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Enhanced form handling with better error handling
    let forms = document.querySelectorAll(".select-app>form");
    for (let form of forms) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            if (!localStorage.getItem("token")) {
                swal("", "Please Login!", "warning").then(function() {
                    window.location.href = "./login.html";
                });
                return;
            }
            
            try {
                const formData = new FormData(form);
                const doctorCard = form.closest('.doc-card');
                const doctorInfo = {
                    img: doctorCard.querySelector('.doc-img img').src,
                    name: doctorCard.querySelector('.doc-desc h2').textContent,
                    dept: doctorCard.querySelector('.doc-desc h4').textContent,
                    exp: doctorCard.querySelector('.doc-desc p').textContent,
                    qual: doctorCard.querySelector('.doc-desc h4:nth-of-type(2)').textContent,
                    docID: doctorCard.querySelector('.doc-desc p[style*="color:white"]').textContent
                };
                
                const formObj = {
                    "date": formData.get('date'),
                    "slot": formData.get('slot')
                };
                
                console.log('Booking doctor:', doctorInfo);
                
                const result = await swal({
                    title: "Confirm Booking?",
                    text: `Book appointment with Dr. ${doctorInfo.name}?`,
                    icon: "info",
                    buttons: ["Cancel", "Confirm"],
                    dangerMode: false,
                });
                
                if (result) {
                    localStorage.setItem("formObj", JSON.stringify(formObj));
                    localStorage.setItem("docObj", JSON.stringify(doctorInfo));
                    window.location.href = "./patient_details.html";
                }
                
            } catch (error) {
                console.error('Error processing booking:', error);
                swal("Error", "Failed to process booking. Please try again.", "error");
            }
        });
    }
}

// Enhanced search with debouncing
let searchTimeout;
let docInputTag = document.querySelector("#doc-sf-left>input");
docInputTag.addEventListener("input", async (e) => {
    clearTimeout(searchTimeout);
    const searchVal = docInputTag.value.trim();
    
    if (searchVal.length === 0) {
        getdata();
        return;
    }
    
    // Debounce search requests
    searchTimeout = setTimeout(async () => {
        try {
            showLoading();
            const response = await fetch(`${baseURL}/doctor/search?q=${encodeURIComponent(searchVal)}`, {
                headers: getAuthHeaders(),
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            hideLoading();
            
            if (!data || data.length === 0) {
                showNoDoctors(`No doctors found matching "${searchVal}"`);
            } else {
                renderdata(data);
            }
            
        } catch (error) {
            console.error('Search error:', error);
            hideLoading();
            showError(`Search failed: ${error.message}`);
        }
    }, 300);
});

// Enhanced department filtering
let docFilterTag = document.querySelector("#doc-sf-right>select");
docFilterTag.addEventListener("change", async (e) => {
    const filterValue = docFilterTag.value;
    
    if (!filterValue) {
        getdata();
        return;
    }
    
    try {
        showLoading();
        const response = await fetch(`${baseURL}/doctor/availableDoctors/${filterValue}`, {
            headers: getAuthHeaders(),
            signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        hideLoading();
        
        if (data.msg) {
            swal("", `${data.msg}`, "info").then(function() {
                getdata();
            });
        } else {
            renderdata(data.doctor);
        }
        
    } catch (error) {
        console.error('Filter error:', error);
        hideLoading();
        showError(`Filter failed: ${error.message}`);
    }
});

// Reset filters
document.querySelector("#filter-approval>p").addEventListener("click", async (e) => {
    try {
        docInputTag.value = '';
        docFilterTag.value = '';
        getdata();
    } catch (err) {
        console.error('Reset error:', err);
        showError('Failed to reset filters');
    }
});

// Initialize on page load
window.addEventListener("load", async (e) => {
    let deptID = localStorage.getItem("deptID");
    if (deptID) {
        try {
            showLoading();
            const response = await fetch(`${baseURL}/doctor/availableDoctors/${deptID}`, {
                headers: getAuthHeaders(),
                signal: AbortSignal.timeout(10000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            hideLoading();
            
            if (data.msg) {
                swal("", `${data.msg}`, "info").then(function() {
                    getdata();
                });
            } else {
                renderdata(data.doctor);
            }
            
            localStorage.removeItem("deptID");
        } catch (err) {
            console.error('Department filter error:', err);
            hideLoading();
            showError(`Failed to load doctors for department: ${err.message}`);
        }
    } else {
        getdata();
    }
});

// Add refresh functionality
window.addEventListener('focus', () => {
    // Refresh data when user returns to the tab (if cache is expired)
    const now = Date.now();
    if (!doctorsCache || (now - lastFetchTime) >= CACHE_DURATION) {
        getdata();
    }
});
