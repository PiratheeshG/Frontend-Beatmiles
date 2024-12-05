// frontend/script.js

const BACKEND_URL = 'https://beatmiles-backend.azurewebsites.net/api';

// User Authentication Logic

async function register() {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    if (!email || !password) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert("Registration successful! Redirecting to login...");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registration failed.");
        }
    } catch (error) {
        alert("An error occurred. Please try again.");
    }
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            alert(data.message || "Login failed.");
        }
    } catch (error) {
        alert("An error occurred. Please try again.");
    }
}

function logout() {
    localStorage.removeItem("token");
    alert("You have been logged out.");
    window.location.href = "index.html";
}

// Workout Management Logic

async function addWorkout() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to add a workout.");
        window.location.href = "login.html";
        return;
    }

    const workout = {
        date: document.getElementById("date").value,
        type: document.getElementById("type").value,
        duration: parseInt(document.getElementById("duration").value),
        distance: parseFloat(document.getElementById("distance").value) || null,
        avgSpeed: parseFloat(document.getElementById("avg-speed").value) || null,
        avgHeartRate: parseInt(document.getElementById("avg-heart-rate").value) || null,
        calories: parseInt(document.getElementById("calories").value) || null
    };

    if (!workout.date || !workout.type || !workout.duration) {
        alert("Please fill out the required fields (date, type, duration).");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/workouts`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(workout)
        });
        const data = await response.json();
        if (response.ok) {
            alert("Workout logged successfully!");
            displayWorkouts();
            document.getElementById("cardio-log-form").reset();
        } else {
            alert(data.message || "Failed to log workout.");
        }
    } catch (error) {
        alert("An error occurred. Please try again.");
    }
}

async function displayWorkouts() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`${BACKEND_URL}/workouts`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });
        const workouts = await response.json();
        if (response.ok) {
            const workoutTable = document.getElementById("workout-table").getElementsByTagName("tbody")[0];
            workoutTable.innerHTML = "";

            workouts.forEach((workout, index) => {
                const row = workoutTable.insertRow();
                row.innerHTML = `
                    <td>${new Date(workout.date).toLocaleDateString()}</td>
                    <td>${workout.type}</td>
                    <td>${workout.duration}</td>
                    <td>${workout.distance || "-"}</td>
                    <td>${workout.avgSpeed || "-"}</td>
                    <td>${workout.avgHeartRate || "-"}</td>
                    <td>${workout.calories || "-"}</td>
                    <td>
                        <button onclick="editWorkout('${workout._id}')">Edit</button>
                        <button onclick="deleteWorkout('${workout._id}')">Delete</button>
                    </td>
                `;
            });
        } else {
            alert("Failed to fetch workouts.");
        }
    } catch (error) {
        alert("An error occurred. Please try again.");
    }
}

async function deleteWorkout(id) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to delete a workout.");
        window.location.href = "login.html";
        return;
    }

    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
        const response = await fetch(`${BACKEND_URL}/workouts/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            displayWorkouts();
        } else {
            alert(data.message || "Failed to delete workout.");
        }
    } catch (error) {
        alert("An error occurred. Please try again.");
    }
}

let editWorkoutId = null;

async function editWorkout(id) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to edit a workout.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/workouts`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });
        const workouts = await response.json();
        if (response.ok) {
            const workout = workouts.find(w => w._id === id);
            if (workout) {
                document.getElementById("date").value = new Date(workout.date).toISOString().split('T')[0];
                document.getElementById("type").value = workout.type;
                document.getElementById("duration").value = workout.duration;
                document.getElementById("distance").value = workout.distance || '';
                document.getElementById("avg-speed").value = workout.avgSpeed || '';
                document.getElementById("avg-heart-rate").value = workout.avgHeartRate || '';
                document.getElementById("calories").value = workout.calories || '';

                editWorkoutId = id;
                document.getElementById("add-button").textContent = "Save Changes";
            }
        } else {
            alert("Failed to fetch workouts.");
        }
    } catch (error) {
        alert("An error occurred. Please try again.");
    }
}

async function saveChanges() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to edit a workout.");
        window.location.href = "login.html";
        return;
    }

    const workout = {
        date: document.getElementById("date").value,
        type: document.getElementById("type").value,
        duration: parseInt(document.getElementById("duration").value),
        distance: parseFloat(document.getElementById("distance").value) || null,
        avgSpeed: parseFloat(document.getElementById("avg-speed").value) || null,
        avgHeartRate: parseInt(document.getElementById("avg-heart-rate").value) || null,
        calories: parseInt(document.getElementById("calories").value) || null
    };

    try {
        const response = await fetch(`${BACKEND_URL}/workouts/${editWorkoutId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(workout)
        });
        const data = await response.json();
        if (response.ok) {
            alert("Workout updated successfully!");
            displayWorkouts();
            document.getElementById("cardio-log-form").reset();
            document.getElementById("add-button").textContent = "Log Workout";
            editWorkoutId = null;
        } else {
            alert(data.message || "Failed to update workout.");
        }
    } catch (error) {
        alert("An error occurred. Please try again.");
    }
}

// Override addWorkout function to handle edit
document.addEventListener("DOMContentLoaded", () => {
    const addButton = document.getElementById("add-button");
    if (addButton) {
        addButton.addEventListener("click", () => {
            if (editWorkoutId) {
                saveChanges();
            } else {
                addWorkout();
            }
        });
    }
});
