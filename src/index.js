import './style.css';
const API_URL = "http://localhost:7070";

const ticketList = document.getElementById("ticketList");
const addTicketBtn = document.getElementById("addTicketBtn");
const ticketModal = document.getElementById("ticketModal");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");
const ticketDetailsModal = document.getElementById("ticketDetailsModal");
const closeDetails = document.getElementById("closeDetails");
const shortDesc = document.getElementById("shortDesc");
const longDesc = document.getElementById("longDesc");
const detailsTitle = document.getElementById("detailsTitle");
const detailsDesc = document.getElementById("detailsDesc");
const loading = document.getElementById("loading");

let currentTicketId = null;

async function loadTickets() {
    loading.style.display = "block"; 
    console.log("Попытка загрузки тикетов с", `${API_URL}/tickets`);
    try {
        const res = await fetch(`${API_URL}/tickets`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        console.log("Статус ответа:", res.status, "OK:", res.ok);
        if (!res.ok) throw new Error(`Ошибка HTTP: ${res.status} - ${res.statusText}`);
        const tickets = await res.json();
        console.log("Полученные тикеты:", tickets);
        if (!Array.isArray(tickets)) throw new Error("Неверный формат ответа API: ожидается массив");
        renderTickets(tickets);
    } catch (err) {
        console.error("Ошибка загрузки тикетов:", err.message);
        ticketList.innerHTML = `<p>Не удалось загрузить тикеты. Ошибка: ${err.message}. Проверьте сервер на ${API_URL}.</p>`;
    } finally {
        loading.style.display = "none"; 
    }
}

function renderTickets(tickets) {
    console.log("Рендеринг тикетов:", tickets);
    ticketList.innerHTML = "";
    if (!tickets.length) {
        ticketList.innerHTML = "<p>Нет тикетов.</p>";
        return;
    }
    tickets.forEach(ticket => {
        const item = document.createElement("div");
        item.className = "ticket";
        item.dataset.id = ticket.id || "";
        item.innerHTML = `
            <div class="left">
                <input type="checkbox" ${ticket.status ? "checked" : ""}>
                <span onclick="showDetails('${ticket.id}')">${ticket.name || "Без названия"}</span>
                <button onclick="editTicket('${ticket.id}')">✎</button>
                <button onclick="showConfirm('${ticket.id}')">×</button>
            </div>
            <span>${new Date(ticket.created || Date.now()).toLocaleString("ru-RU")}</span>
        `;
        ticketList.appendChild(item);
    });
}

addTicketBtn.addEventListener("click", () => {
    console.log("Открытие модалки добавления");
    shortDesc.value = "";
    longDesc.value = "";
    currentTicketId = null;
    ticketModal.style.display = "flex";
});

// Редактирование тикета
window.editTicket = async (id) => {
    console.log("Редактирование тикета, ID:", id);
    loading.style.display = "block"; 
    try {
        const res = await fetch(`${API_URL}/tickets/${id}`);
        if (!res.ok) throw new Error(`Ошибка HTTP: ${res.status} - ${res.statusText}`);
        const ticket = await res.json();
        console.log("Данные тикета для редактирования:", ticket);
        if (!ticket || !ticket.name) throw new Error("Неверные данные тикета");
        currentTicketId = id;
        shortDesc.value = ticket.name;
        longDesc.value = ticket.description || "";
        ticketModal.style.display = "flex";
    } catch (err) {
        console.error("Ошибка загрузки тикета для редактирования:", err.message);
        alert("Не удалось загрузить тикет для редактирования.");
    } finally {
        loading.style.display = "none"; 
    }
};

saveBtn.addEventListener("click", async () => {
    console.log("Сохранение тикета, currentTicketId:", currentTicketId);
    const name = shortDesc.value.trim();
    const description = longDesc.value.trim();
    if (!name) return alert("Введите краткое описание!");
    loading.style.display = "block"; 
    try {
        let response;
        if (currentTicketId) {
            response = await fetch(`${API_URL}/tickets/${currentTicketId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description })
            });
        } else {
            response = await fetch(`${API_URL}/tickets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description })
            });
            const newTicket = await response.json();
            currentTicketId = newTicket.id;
        }
        if (!response.ok) throw new Error(`Ошибка: ${response.status} - ${response.statusText}`);
        ticketModal.style.display = "none";
        loadTickets();
    } catch (err) {
        console.error("Ошибка сохранения тикета:", err.message);
        alert("Не удалось сохранить тикет. Проверьте консоль.");
    } finally {
        loading.style.display = "none"; 
    }
});

cancelBtn.addEventListener("click", () => {
    ticketModal.style.display = "none";
});

// Подтверждение удаления
window.showConfirm = (id) => {
    console.log("Подтверждение удаления, ID:", id);
    currentTicketId = id;
    if (!currentTicketId) {
        console.error("ID тикета не определён");
        return;
    }
    confirmModal.style.display = "flex";
};

confirmDelete.addEventListener("click", async () => {
    console.log("Удаление тикета, ID:", currentTicketId);
    if (currentTicketId) {
        loading.style.display = "block"; 
        try {
            const response = await fetch(`${API_URL}/tickets/${currentTicketId}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error(`Ошибка: ${response.status} - ${response.statusText}`);
            confirmModal.style.display = "none";
            loadTickets();
        } catch (err) {
            console.error("Ошибка удаления тикета:", err.message);
            alert("Не удалось удалить тикет.");
        } finally {
            loading.style.display = "none"; 
        }
    }
});

cancelDelete.addEventListener("click", () => {
    confirmModal.style.display = "none";
});

// Просмотр деталей
window.showDetails = async (id) => {
    console.log("Просмотр деталей, ID:", id);
    loading.style.display = "block"; 
    try {
        if (!id) throw new Error("ID тикета не указан");
        const res = await fetch(`${API_URL}/tickets/${id}`);
        console.log("Статус ответа для деталей:", res.status, "OK:", res.ok);
        if (!res.ok) throw new Error(`Ошибка HTTP: ${res.status} - ${res.statusText}`);
        const ticket = await res.json();
        console.log("Данные тикета:", ticket);
        if (!ticket || !ticket.name) throw new Error("Неверные данные тикета");
        detailsTitle.textContent = ticket.name;
        detailsDesc.textContent = ticket.description || "Нет подробного описания";
        ticketDetailsModal.style.display = "flex";
    } catch (err) {
        console.error("Ошибка загрузки деталей:", err.message);
        alert("Не удалось загрузить детали тикета.");
    } finally {
        loading.style.display = "none"; 
    }
};

closeDetails.addEventListener("click", () => {
    ticketDetailsModal.style.display = "none";
});

// Закрытие модалок при клике вне
[ticketModal, confirmModal, ticketDetailsModal].forEach(modal => {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });
});

loadTickets();